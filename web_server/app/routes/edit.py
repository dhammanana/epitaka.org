# app/routes/edit.py
import bisect
import sqlite3
import time

from flask import Blueprint, render_template, jsonify, request
from ..utils.db import get_db, get_translation_db
from ..services.toc import get_book_toc, get_section_sentences
from ..config import Config

bp = Blueprint('edit', __name__)


@bp.route('/<lang>/book_edit/<book_id>')
def book_edit(lang, book_id):
    book_id_clean = book_id.replace('_chunks', '')

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id_clean,))
        row = cursor.fetchone()
        book_title = row['book_name'] if row else 'Unknown Book'

        toc_raw = get_book_toc(book_id_clean, conn)

        toc = []
        if toc_raw:
            # Batch: distinct para_id per heading range in a single query.
            # GROUP BY para_id yields one row per distinct para_id; the count
            # in each heading's range is then hi - lo via bisect.
            cursor.execute('''
                SELECT para_id
                FROM sentences
                WHERE book_id = ? AND para_id >= ?
                GROUP BY para_id
                ORDER BY para_id
            ''', (book_id_clean, toc_raw[0]['para_id']))
            para_ids = [r['para_id'] for r in cursor.fetchall()]

            for i, h in enumerate(toc_raw):
                end_para = toc_raw[i + 1]['para_id'] if i + 1 < len(toc_raw) else 999999999
                lo = bisect.bisect_left(para_ids, h['para_id'])
                hi = bisect.bisect_left(para_ids, end_para)
                para_count = hi - lo
                toc.append({**h, 'para_count': para_count})

    return render_template(
        'book_edit.html',
        book_id=book_id_clean,
        book_title=book_title,
        toc=toc,
        base_url=Config.BASE_URL,
        lang=lang,
    )


@bp.route('/<lang>/book_edit/<book_id>/<int:para_id>')
def get_edit_content(lang, book_id, para_id):
    book_id_clean = book_id.replace('_chunks', '')
    with get_db() as conn:
        section_data = get_section_sentences(book_id_clean, para_id, conn, lang_code=lang)
    return jsonify(section_data['sentences'])


@bp.route('/save_translation', methods=['POST'])
def save_translation():
    data = request.get_json()
    book_id = data['book_id']
    para_id = data['para_id']
    line_id = data['line_id']
    translation = data.get('translation', '')
    lang = data.get('lang', '')

    if not lang:
        return jsonify({'status': 'error', 'message': 'Language required'}), 400

    trans_db = get_translation_db(lang)
    if not trans_db:
        return jsonify({'status': 'error', 'message': f'Translation DB for {lang} not found'}), 404

    cursor = trans_db.cursor()

    # The translation DB is shared with the translator process, which may be
    # mid-batch when a web edit arrives. WAL + busy_timeout already make the
    # connection wait (up to 10s per statement), so a short retry on top only
    # catches the rare case where the lock clears right after the timeout.
    last_exc = None
    for _attempt in range(3):
        try:
            cursor.execute('''
                UPDATE sentences
                SET translation = ?
                WHERE book_id = ? AND para_id = ? AND line_id = ?
            ''', (translation, book_id, para_id, line_id))
            trans_db.commit()
            return jsonify({'status': 'success'})
        except sqlite3.OperationalError as e:
            last_exc = e
            if 'locked' not in str(e).lower() and 'busy' not in str(e).lower():
                raise
            try:
                trans_db.rollback()  # reset transaction state before retrying
            except Exception:
                pass
            if _attempt < 2:
                time.sleep(0.2)

    return jsonify({'status': 'error', 'message': f'Database busy: {last_exc}'}), 503

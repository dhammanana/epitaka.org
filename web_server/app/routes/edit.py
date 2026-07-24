# app/routes/edit.py
from flask import Blueprint, render_template, jsonify, request
from ..utils.db import get_db, get_translation_db
from ..services.books import load_hierarchy
from ..services.toc import get_book_toc, get_section_sentences
from ..config import Config

bp = Blueprint('edit', __name__)


@bp.route('/<lang>/book_edit/<book_id>')
def book_edit(lang, book_id):
    book_id_clean = book_id.replace('_chunks', '')
    hierarchy = load_hierarchy()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id_clean,))
        row = cursor.fetchone()
        book_title = row['book_name'] if row else 'Unknown Book'

        toc_raw = get_book_toc(book_id_clean, conn)
        toc = []

        for h in toc_raw:
            cursor.execute('''
                SELECT COUNT(DISTINCT para_id) FROM sentences
                WHERE book_id = ? AND para_id >= ? AND para_id < (
                    SELECT COALESCE(
                        (SELECT MIN(para_id) FROM headings WHERE book_id = ? AND para_id > ? AND level <= 6),
                        999999
                    )
                )
            ''', (book_id_clean, h['para_id'], book_id_clean, h['para_id']))
            para_count = cursor.fetchone()[0]
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
    cursor.execute('''
        UPDATE sentences
        SET translation = ?
        WHERE book_id = ? AND para_id = ? AND line_id = ?
    ''', (translation, book_id, para_id, line_id))
    trans_db.commit()

    return jsonify({'status': 'success'})

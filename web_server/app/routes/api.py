# app/routes/api.py
"""
REST API routes for book content, cross-references, and related-paragraph lookup.
Updated for new schema: pali column, level column, separate translation DBs.
"""
from flask import Blueprint, jsonify, request

from ..utils.db   import get_db, get_translation_db
from ..utils.text import markdown_to_html
from ..services.books import load_hierarchy
from ..services.toc   import get_section_sentences
from ..services.links import load_section_book_links
from .fts_search import register_search_route

bp = Blueprint('api', __name__, url_prefix='/api')

register_search_route(bp)


# ── Section content ────────────────────────────────────────────────────────────

@bp.route('/book/<book_id>/section/<int:para_id>')
def api_book_section(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    lang = request.args.get('lang', '')
    with get_db() as conn:
        section_data = get_section_sentences(book_id, para_id, conn, lang_code=lang or None)
    return jsonify({
        'para_id': para_id,
        'sentences': section_data['sentences'],
        'heading_translation': section_data['heading_translation'],
        'has_content': section_data['has_content'],
    })


@bp.route('/book/<book_id>/sections')
def api_book_sections(book_id):
    book_id = book_id.replace('_chunks', '')
    raw = request.args.get('para_ids', '')
    lang = request.args.get('lang', '')
    try:
        para_ids = [int(x) for x in raw.split(',') if x.strip()]
    except ValueError:
        return jsonify({'error': 'Invalid para_ids'}), 400

    result = {}
    with get_db() as conn:
        for pid in para_ids:
            section_data = get_section_sentences(book_id, pid, conn, lang_code=lang or None)
            result[pid] = section_data
    return jsonify(result)


# ── Heading translations (batch) ─────────────────────────────────────────────

@bp.route('/book/<book_id>/heading_translations')
def api_heading_translations(book_id):
    """Return translations for all heading sentences in a book.

    Returns {para_id: translation_html} for every heading whose first
    sentence has a translation in the requested language.
    """
    book_id = book_id.replace('_chunks', '')
    lang = request.args.get('lang', '')
    if not lang:
        return jsonify({})

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT para_id FROM headings WHERE book_id = ? AND level <= 6 ORDER BY para_id',
            (book_id,))
        headings = [r['para_id'] for r in cursor.fetchall()]

    if not headings:
        return jsonify({})

    result = {}
    trans_db = get_translation_db(lang)
    if trans_db:
        trans_cursor = trans_db.cursor()
        for pid in headings:
            trans_cursor.execute(
                'SELECT translation FROM sentences WHERE book_id = ? AND para_id = ? AND line_id = 1',
                (book_id, pid))
            row = trans_cursor.fetchone()
            if row and row['translation']:
                result[pid] = markdown_to_html(row['translation'])

    return jsonify(result)


# ── Related-paragraph lookup ───────────────────────────────────────────────────

@bp.route('/get_related_para/<book_id>/<para_id>')
def get_related_para(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND para_id <= ? AND level = 10
            ORDER BY para_id DESC LIMIT 1
        ''', (book_id, para_id))
        result = cursor.fetchone()
        if not result:
            return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

        heading_title = result[0]
        book_type = (
            'mul' if book_id.endswith('.mul') else
            'att' if book_id.endswith('.att') else
            'tik' if book_id.endswith('.tik') else None
        )
        if not book_type:
            return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

        base_id = book_id[:-5]
        targets = {
            'mul': [(f'{base_id}a.att', 'att_para_id'), (f'{base_id}t.tik', 'tik_para_id')],
            'att': [(f'{base_id}m.mul', 'mul_para_id'), (f'{base_id}t.tik', 'tik_para_id')],
            'tik': [(f'{base_id}m.mul', 'mul_para_id'), (f'{base_id}a.att', 'att_para_id')],
        }.get(book_type, {})

        response = {'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None}
        for target_book, key in targets.items():
            cursor.execute('''
                SELECT para_id FROM headings
                WHERE book_id = ? AND title = ? AND level = 10
                ORDER BY ABS(para_id - ?) LIMIT 1
            ''', (target_book, heading_title, para_id))
            found = cursor.fetchone()
            if found:
                response[key] = found[0]

    return jsonify(response)


# ── Book links ─────────────────────────────────────────────────────────────────

@bp.route('/book/<book_id>/links')
def book_links(book_id):
    hierarchy = load_hierarchy()
    try:
        para_id = int(request.args.get('para_id', ''))
    except (ValueError, TypeError):
        return jsonify({'error': 'para_id required'}), 400

    lang = request.args.get('lang', '')

    with get_db() as conn:
        links = load_section_book_links(conn, book_id, para_id, lang_code=lang or None)

    result = []
    for lnk in links:
        preview = []
        for p in lnk['preview']:
            item = {
                'para_id':   p['para_id'],
                'line_id':   p['line_id'],
                'pali':      p['pali'],
                'is_target': p['is_target'],
            }
            if p.get('translation'):
                item['translation'] = p['translation']
            preview.append(item)
        result.append({
            'src_para':      lnk['src_para'],
            'src_line':      lnk['src_line'],
            'word':          lnk['word'],
            'dst_book':      lnk['dst_book'],
            'dst_book_name': hierarchy.get(lnk['dst_book'], {}).get('book_name', lnk['dst_book']),
            'dst_para':      lnk['dst_para'],
            'dst_line':      lnk['dst_line'],
            'preview':       preview,
        })

    return jsonify(result)


@bp.route('/book_link_section')
def book_link_section():
    dst_book = request.args.get('dst_book', '').strip()
    lang = request.args.get('lang', '')
    try:
        dst_para = int(request.args.get('dst_para', ''))
        dst_line = int(request.args.get('dst_line', ''))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid parameters'}), 400
    if not dst_book:
        return jsonify({'error': 'dst_book required'}), 400

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute('''
            SELECT para_id, title FROM headings
            WHERE book_id = ? AND level = 10 AND para_id <= ?
            ORDER BY para_id DESC LIMIT 1
        ''', (dst_book, dst_para))
        section_start = cursor.fetchone()
        if not section_start:
            return jsonify({'error': 'Section not found'}), 404

        section_para_id = section_start['para_id']
        section_title   = section_start['title']

        cursor.execute('''
            SELECT para_id FROM headings
            WHERE book_id = ? AND level = 10 AND para_id > ?
            ORDER BY para_id ASC LIMIT 1
        ''', (dst_book, section_para_id))
        next_section = cursor.fetchone()
        end_para = next_section['para_id'] if next_section else 999999999

        cursor.execute('''
            SELECT para_id, line_id, pali
            FROM sentences
            WHERE book_id = ? AND para_id >= ? AND para_id < ?
            ORDER BY para_id, line_id
        ''', (dst_book, section_para_id, end_para))
        rows = cursor.fetchall()

    sentences = [{
        'para_id': r['para_id'],
        'line_id': r['line_id'],
        'pali':    markdown_to_html(r['pali']) if r['pali'] else '',
    } for r in rows]

    # Optionally fetch translation
    if lang:
        trans_db = get_translation_db(lang)
        if trans_db:
            trans_cursor = trans_db.cursor()
            trans_cursor.execute('''
                SELECT para_id, line_id, translation
                FROM sentences
                WHERE book_id = ? AND para_id >= ? AND para_id < ?
                ORDER BY para_id, line_id
            ''', (dst_book, section_para_id, end_para))
            trans_map = {}
            for tr in trans_cursor.fetchall():
                trans_map[(tr['para_id'], tr['line_id'])] = tr['translation']
            for s in sentences:
                tr = trans_map.get((s['para_id'], s['line_id']), '')
                if tr:
                    s['translation'] = markdown_to_html(tr)

    return jsonify({
        'section_title': section_title,
        'dst_para':      dst_para,
        'dst_line':      dst_line,
        'sentences':     sentences,
    })

# app/routes/api.py
"""
REST API routes for book content, cross-references, and related-paragraph lookup.
"""
from flask import Blueprint, jsonify, request

from ..utils.db   import get_db
from ..utils.text import markdown_to_html
from ..services.books import load_hierarchy
from ..services.toc   import get_section_sentences
from .fts_search import register_search_route

bp = Blueprint('api', __name__, url_prefix='/api')

register_search_route(bp)


# ── Section content ────────────────────────────────────────────────────────────

@bp.route('/book/<book_id>/section/<int:para_id>')
def api_book_section(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    with get_db() as conn:
        sentences = get_section_sentences(book_id, para_id, conn)
    return jsonify({'para_id': para_id, 'sentences': sentences})


@bp.route('/book/<book_id>/sections')
def api_book_sections(book_id):
    book_id = book_id.replace('_chunks', '')
    raw = request.args.get('para_ids', '')
    try:
        para_ids = [int(x) for x in raw.split(',') if x.strip()]
    except ValueError:
        return jsonify({'error': 'Invalid para_ids'}), 400

    result = {}
    with get_db() as conn:
        for pid in para_ids:
            result[pid] = get_section_sentences(book_id, pid, conn)
    return jsonify(result)


# ── Related-paragraph lookup ───────────────────────────────────────────────────

@bp.route('/get_related_para/<book_id>/<para_id>')
def get_related_para(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND para_id <= ? AND heading_number = 10
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
        }[book_type]

        response = {'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None}
        for target_book, key in targets:
            cursor.execute('''
                SELECT para_id FROM headings
                WHERE book_id = ? AND title = ? AND heading_number = 10
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

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute('''
            SELECT para_id FROM headings
            WHERE book_id = ? AND para_id > ? AND heading_number < 10
            ORDER BY para_id ASC LIMIT 1
        ''', (book_id, para_id))
        next_row = cursor.fetchone()
        end_para = next_row['para_id'] if next_row else 999999999

        cursor.execute('''
            SELECT src_para, src_line, dst_book, dst_para, dst_line, word
            FROM book_links
            WHERE src_book = ? AND src_para >= ? AND src_para < ?
            ORDER BY src_para, src_line
        ''', (book_id, para_id, end_para))
        links = cursor.fetchall()

        result = []
        for lnk in links:
            dst_book = lnk['dst_book']
            dst_para = lnk['dst_para']
            dst_line = lnk['dst_line']

            cursor.execute('''
                SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
                FROM sentences
                WHERE book_id = ? AND para_id = ?
                  AND line_id BETWEEN ? AND ?
                ORDER BY line_id
            ''', (dst_book, dst_para, max(0, dst_line - 1), dst_line + 1))

            preview = [{
                'para_id':   r['para_id'],
                'line_id':   r['line_id'],
                'pali':      markdown_to_html(r['pali_sentence'])       if r['pali_sentence']       else '',
                'english':   markdown_to_html(r['english_translation']) if r['english_translation'] else '',
                'vietnamese':   markdown_to_html(r['vietnamese_translation']) if r['vietnamese_translation'] else '',
                'is_target': r['line_id'] == dst_line,
            } for r in cursor.fetchall()]

            result.append({
                'src_para':      lnk['src_para'],
                'src_line':      lnk['src_line'],
                'word':          lnk['word'],
                'dst_book':      dst_book,
                'dst_book_name': hierarchy.get(dst_book, {}).get('book_name', dst_book),
                'dst_para':      dst_para,
                'dst_line':      dst_line,
                'preview':       preview[::-1],
            })

    return jsonify(result)


@bp.route('/book_link_section')
def book_link_section():
    dst_book = request.args.get('dst_book', '').strip()
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
            WHERE book_id = ? AND heading_number = 10 AND para_id <= ?
            ORDER BY para_id DESC LIMIT 1
        ''', (dst_book, dst_para))
        section_start = cursor.fetchone()
        if not section_start:
            return jsonify({'error': 'Section not found'}), 404

        section_para_id = section_start['para_id']
        section_title   = section_start['title']

        cursor.execute('''
            SELECT para_id FROM headings
            WHERE book_id = ? AND heading_number = 10 AND para_id > ?
            ORDER BY para_id ASC LIMIT 1
        ''', (dst_book, section_para_id))
        next_section = cursor.fetchone()
        end_para = next_section['para_id'] if next_section else 999999999

        cursor.execute('''
            SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
            FROM sentences
            WHERE book_id = ? AND para_id >= ? AND para_id < ?
            ORDER BY para_id, line_id
        ''', (dst_book, section_para_id, end_para))
        rows = cursor.fetchall()

    sentences = [{
        'para_id': r['para_id'],
        'line_id': r['line_id'],
        'pali':    markdown_to_html(r['pali_sentence'])       if r['pali_sentence']       else '',
        'english': markdown_to_html(r['english_translation']) if r['english_translation'] else '',
        'vietnamese': markdown_to_html(r['vietnamese_translation']) if r['vietnamese_translation'] else '',
    } for r in rows]

    return jsonify({
        'section_title': section_title,
        'dst_para':      dst_para,
        'dst_line':      dst_line,
        'sentences':     sentences,
    })
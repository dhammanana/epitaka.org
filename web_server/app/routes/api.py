# app/routes/api.py
from flask import Blueprint, jsonify, request
from collections import defaultdict
import re

from ..utils.db import get_db
from ..utils.text import markdown_to_html, trim_text
from ..services.loadtocs import load_hierarchy, get_section_sentences
from ..config import Config
from .fts_search import register_search_route

bp = Blueprint('api', __name__, url_prefix='/api')

register_search_route(bp)

@bp.route('/book/<book_id>/section/<int:para_id>')
def api_book_section(book_id, para_id):
    book_id_clean = book_id.replace('_chunks', '')
    with get_db() as conn:
        sentences = get_section_sentences(book_id_clean, para_id, conn)
    return jsonify({'para_id': para_id, 'sentences': sentences})


@bp.route('/book/<book_id>/sections')
def api_book_sections():
    book_id = request.view_args['book_id'].replace('_chunks', '')
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


@bp.route('/get_related_para/<book_id>/<para_id>')
def get_related_para(book_id, para_id):
    book_id_clean = book_id.replace('_chunks', '')
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT title, heading_number FROM headings
            WHERE book_id = ? AND para_id <= ? AND heading_number = 10
            ORDER BY para_id DESC LIMIT 1
        ''', (book_id_clean, para_id))
        result = cursor.fetchone()
        if not result:
            return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

        heading_title = result[0]
        book_type = ('mul' if book_id_clean.endswith('.mul') else
                     'att' if book_id_clean.endswith('.att') else
                     'tik' if book_id_clean.endswith('.tik') else None)

        if not book_type:
            return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

        response = {'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None}
        base_id = book_id_clean[:-5]

        if book_type == 'mul':
            targets = [(f'{base_id}a.att', 'att_para_id'), (f'{base_id}t.tik', 'tik_para_id')]
        elif book_type == 'att':
            targets = [(f'{base_id}m.mul', 'mul_para_id'), (f'{base_id}t.tik', 'tik_para_id')]
        else:
            targets = [(f'{base_id}m.mul', 'mul_para_id'), (f'{base_id}a.att', 'att_para_id')]

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

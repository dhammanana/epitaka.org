# app/routes/main.py
from flask import Blueprint, render_template, request, redirect, jsonify
import re
from ..utils.db import get_db
from ..utils.text import markdown_to_html, trim_text, normalize_pali
from ..services.loadtocs import load_hierarchy, organize_hierarchy, get_book_toc, get_section_sentences
from ..config import Config

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    hierarchy = load_hierarchy()
    menu_data = organize_hierarchy(hierarchy)
    return render_template(
        'index.html',
        menu=menu_data,
        base_url=Config.BASE_URL
    )


@bp.route('/book/<book_id>')
def book(book_id):
    book_id_clean = book_id.replace('_chunks', '')
    hierarchy = load_hierarchy()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id_clean,))
        row = cursor.fetchone()
        book_title = row['book_name'] if row else 'Unknown Book'
        
        toc = get_book_toc(book_id_clean, conn)

    bookinfo = hierarchy.get(book_id_clean, {})
    bookref = {
        'mula_ref': bookinfo.get('mula_ref'),
        'attha_ref': bookinfo.get('attha_ref'),
        'tika_ref': bookinfo.get('tika_ref'),
    }

    canonical_url = f"{Config.BASE_URL}/book/{book_id_clean}"
    meta_description = f"Read {book_title} from the Chaṭṭha Saṅgāyana Tipiṭaka with Pali, English, and Vietnamese translations."

    return render_template(
        'book.html',
        book_id=book_id_clean,
        book_title=book_title,
        bookref=bookref,
        toc=toc,
        base_url=Config.BASE_URL,
        canonical_url=canonical_url,
        meta_description=meta_description,
        firebase_config=Config.FIREBASE_CONFIG,  # parsed json
        menu=organize_hierarchy(hierarchy), 
    )


@bp.route('/book_ref/<book_id>')
def book_ref(book_id):
    ref = request.args.get('ref', '').strip()
    para_id_str = request.args.get('para_id', '').strip().replace('para-', '')
    try:
        para_id = int(para_id_str)
    except ValueError:
        para_id = 1

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND heading_number = 10 AND para_id < ?
            ORDER BY para_id DESC LIMIT 1
        ''', (ref, para_id))
        row = cursor.fetchone()
        if not row:
            return redirect(f'{Config.BASE_URL}/book/{book_id}')

        heading = row[0]
        result_para = ''
        while result_para == '':
            cursor.execute('''
                SELECT para_id FROM headings
                WHERE book_id = ? AND title = ? AND heading_number = 10
                ORDER BY para_id DESC
            ''', (book_id, heading))
            found = cursor.fetchone()
            result_para = found[0] if found else ''
            heading = str(int(heading) - 1)

    return redirect(f'{Config.BASE_URL}/book/{book_id}?para={result_para}')


@bp.route('/api/suggest_word')
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT word FROM words
            WHERE plain LIKE ?
            ORDER BY frequency DESC LIMIT ?
        ''', (f'{normalize_pali(query)}%', Config.MAX_SUGGESTIONS))
        results = cursor.fetchall()

    return jsonify([r['word'] for r in results])


@bp.route('/api/search_headings')
def search_headings_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT book_id, para_id, title FROM headings WHERE title LIKE ? LIMIT 10
        ''', (f'%{query}%',))
        results = cursor.fetchall()

    return jsonify([{
        'book_id': r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id': r['para_id'],
        'title': r['title'],
    } for r in results])

@bp.route('/api/bold_suggest')
def bold_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', '').strip()
    if not query:
        return jsonify([])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.book_id, d.para_id, d.line_id, d.word
            FROM pali_definition d
            JOIN books b ON d.book_id = b.book_id
            WHERE d.plain LIKE ?
            ORDER BY b.id, d.para_id
            LIMIT 50
        ''', (f'{normalize_pali(query)}%',))
        results = cursor.fetchall()

    return jsonify([{
        'book_id': r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id': r['para_id'],
        'line_id': r['line_id'],
        'title': r['word'],
    } for r in results])

@bp.route('/api/bold_definition')
def bold_definition():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', '').strip()
    if not query:
        return jsonify([])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.book_id, d.para_id, d.line_id, d.word, s.pali_sentence, s.english_translation
            FROM pali_definition d
            JOIN books b ON d.book_id = b.book_id
            JOIN sentences s ON d.book_id = s.book_id AND d.para_id = s.para_id AND d.line_id = s.line_id
            WHERE d.plain LIKE ?
            ORDER BY b.id, d.para_id
        ''', (f'{normalize_pali(query)}%',))
        results = cursor.fetchall()

    return jsonify([{
        'book_id': r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id': r['para_id'],
        'line_id': r['line_id'],
        'title': r['word'],
        'definition_pali': markdown_to_html(r['pali_sentence']),
        'definition_en': markdown_to_html(r['english_translation']),
    } for r in results])


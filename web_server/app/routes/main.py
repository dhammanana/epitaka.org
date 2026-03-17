# app/routes/main.py
from flask import Blueprint, render_template, request, redirect, jsonify

from ..utils.db   import get_db
from ..utils.text import normalize_pali, markdown_to_html
from ..services.books import load_hierarchy, organize_hierarchy
from ..services.toc   import get_book_toc, resolve_split_book
from ..config import Config

bp = Blueprint('main', __name__)


# ── Page routes ────────────────────────────────────────────────────────────────

@bp.route('/')
def index():
    hierarchy = load_hierarchy()
    return render_template(
        'index.html',
        base_url=Config.BASE_URL,
        menu=organize_hierarchy(hierarchy),
    )
 


@bp.route('/book/<book_id>')
def book(book_id):
    book_id = book_id.replace('_chunks', '')
    hierarchy = load_hierarchy()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        row = cursor.fetchone()
        book_title = row['book_name'] if row else 'Unknown Book'
        toc = get_book_toc(book_id, conn)

    bookinfo = hierarchy.get(book_id, {})

    def enrich_refs(ref_ids):
        result = []
        for rid in (ref_ids or []):
            info = hierarchy.get(rid, {})
            result.append({
                'book_id':   rid,
                'book_name': info.get('book_name', rid),
            })
        return result

    bookref = {
        'mula_ref':  enrich_refs(bookinfo.get('mula_ref',  [])),
        'attha_ref': enrich_refs(bookinfo.get('attha_ref', [])),
        'tika_ref':  enrich_refs(bookinfo.get('tika_ref',  [])),
    }

    return render_template(
        'book.html',
        book_id=book_id,
        book_title=book_title,
        bookref=bookref,
        toc=toc,
        base_url=Config.BASE_URL,
        canonical_url=f"{Config.BASE_URL}/book/{book_id}",
        meta_description=f"Read {book_title} from the Chaṭṭha Saṅgāyana Tipiṭaka.",
        firebase_config=Config.FIREBASE_CONFIG,
        menu=organize_hierarchy(hierarchy),
    )


@bp.route('/book_ref/<book_id>')
def book_ref(book_id):
    """
    Navigate from the current book (ref) to a related book (book_id) at the
    paragraph matching the caller's current position.  Handles split books.
    """
    ref     = request.args.get('ref', '').strip()
    raw_pid = request.args.get('para_id', '').strip().replace('para-', '')
    try:
        para_id = int(raw_pid)
    except ValueError:
        para_id = 1

    with get_db() as conn:
        cursor = conn.cursor()

        resolved = resolve_split_book(book_id, para_id, cursor)
        if not resolved:
            return redirect(f'{Config.BASE_URL}/book/{ref}' if ref else f'{Config.BASE_URL}/')
        book_id = resolved

        # Find the heading in the source book just before para_id
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND heading_number = 10 AND para_id < ?
            ORDER BY para_id DESC LIMIT 1
        ''', (ref, para_id))
        row = cursor.fetchone()
        if not row:
            return redirect(f'{Config.BASE_URL}/book/{book_id}')

        heading     = row[0]
        result_para = ''
        while not result_para:
            cursor.execute('''
                SELECT para_id FROM headings
                WHERE book_id = ? AND title = ? AND heading_number = 10
                ORDER BY para_id DESC
            ''', (book_id, heading))
            found = cursor.fetchone()
            result_para = found[0] if found else ''
            try:
                heading = str(int(heading) - 1)
            except Exception:
                break

        if not result_para:
            return redirect(f'{Config.BASE_URL}/book/{book_id}')

    return redirect(f'{Config.BASE_URL}/book/{book_id}?para={result_para}')


# ── Suggest / search API ───────────────────────────────────────────────────────

@bp.route('/api/suggest_word')
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT word FROM words WHERE plain LIKE ? ORDER BY frequency DESC LIMIT ?',
            (f'{normalize_pali(query)}%', Config.MAX_SUGGESTIONS),
        )
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
        cursor.execute(
            'SELECT book_id, para_id, title FROM headings WHERE title LIKE ? LIMIT 10',
            (f'%{query}%',),
        )
        results = cursor.fetchall()
    return jsonify([{
        'book_id':   r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id':   r['para_id'],
        'title':     r['title'],
    } for r in results])


@bp.route('/api/bold_suggest')
def bold_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
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
        'book_id':   r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id':   r['para_id'],
        'line_id':   r['line_id'],
        'title':     r['word'],
    } for r in results])


@bp.route('/api/bold_definition')
def bold_definition():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.book_id, d.para_id, d.line_id, d.word,
                   s.pali_sentence, s.english_translation
            FROM pali_definition d
            JOIN books     b ON d.book_id = b.book_id
            JOIN sentences s ON d.book_id = s.book_id
                             AND d.para_id = s.para_id
                             AND d.line_id = s.line_id
            WHERE d.plain LIKE ?
            ORDER BY b.id, d.para_id
        ''', (f'{normalize_pali(query)}%',))
        results = cursor.fetchall()
    return jsonify([{
        'book_id':         r['book_id'],
        'book_name':       hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id':         r['para_id'],
        'line_id':         r['line_id'],
        'title':           r['word'],
        'definition_pali': markdown_to_html(r['pali_sentence']),
        'definition_en':   markdown_to_html(r['english_translation']),
    } for r in results])
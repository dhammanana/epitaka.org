import re
import os
from flask import Flask, Blueprint, jsonify, render_template, request, redirect
import sqlite3
from collections import defaultdict
import config
from convert_md2db import normalize_pali
# import sqlite_vec
from app_src.auth_comments import init_auth_db, FIREBASE_CONFIG

# model = None  # Placeholder for SentenceTransformer

def get_db_connection():
    db_path = os.path.join(current_dir, 'translations.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


app = Flask(__name__, template_folder='templates', static_folder='static', static_url_path='/tpk/static')
bp = Blueprint('tpk', __name__, url_prefix=os.environ.get('BASE_URL', '/tpk'))
current_dir = os.path.dirname(os.path.abspath(__file__))

init_auth_db()
# ─────────────────────────────────────────────
# Template Filters
# ─────────────────────────────────────────────

@bp.app_template_filter('is_numbered')
def is_numbered(text):
    return bool(re.match(r'^<code>\d+</code>\.$', str(text)))


# ─────────────────────────────────────────────
# Text Processing Helpers
# ─────────────────────────────────────────────

def remove_stars_inside_brackets(text):
    PATTERN = re.compile(r'\[(.*?)\]')
    def repl(match):
        return '[' + match.group(1).replace('*', '') + ']'
    return PATTERN.sub(repl, text)


def markdown_to_html(text):
    """Convert lightweight markdown to HTML."""
    if not text:
        return ''
    if isinstance(text, int):
        return str(text)
    text = remove_stars_inside_brackets(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = text.replace('\\ வர', '[').replace('\\ ]', ']')
    text = text.replace('<strong>', ' <strong>')
    for i in range(6, 0, -1):
        pattern = r'^' + r'\#' * i + r' (.*)$'
        repl = r'<h{0}>\1</h{0}>'.format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = re.sub(r' *\\\[(.*?)\\\]', r'<sup title="\1">*</sup>', text)
    text = re.sub(r' *\[(.*?)\]', r'<sup title="\1">*</sup>', text)
    return text


def highlight_text(text, query_words):
    pali_map = {
        'a': '[aā]', 'i': '[iī]', 'u': '[uū]',
        'n': '[nṅñṇ]', 't': '[tṭ]', 'd': '[dḍ]',
        'l': '[lḷ]', 'm': '[mṃ]'
    }
    for word in query_words:
        pattern = ''.join(pali_map.get(c, re.escape(c)) for c in word)
        text = re.sub(f'({pattern})', r'<mark>\1</mark>', text, flags=re.IGNORECASE)
    return text


def trim_text(text, query_words):
    query_pos = min(
        [text.lower().find(word.lower()) for word in query_words if text.lower().find(word.lower()) != -1] or [0]
    )
    start = max(0, query_pos - config.MAX_SEARCH_RESULTS_LENGTH // 2)
    end = min(len(text), query_pos + config.MAX_SEARCH_RESULTS_LENGTH // 2)
    temp_text = text[end - 10:end + 10]
    if re.match(r'<\w', temp_text, re.I):
        end = end - 10 + temp_text.find('<')
    ret = ('...' if start > 0 else '') + text[start:end] + ('...' if end < len(text) else '')
    pos = ret.rfind('strong>')
    if pos > 0 and ret[pos - 1] == '<':
        ret = ret + '</strong>'
    pos = ret.rfind('code>')
    if pos > 0 and ret[pos - 1] == '<':
        ret = ret + '</code>'
    return highlight_text(ret, query_words)


# ─────────────────────────────────────────────
# Database Helpers
# ─────────────────────────────────────────────

def load_hierarchy():
    """Load all book metadata from the books table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT book_id, category, nikaya, sub_nikaya, book_name, mula_ref, attha_ref, tika_ref
        FROM books
    ''')
    rows = cursor.fetchall()
    conn.close()
    return {row['book_id']: {
        'category': row['category'],
        'nikaya': row['nikaya'],
        'sub_nikaya': row['sub_nikaya'],
        'book_name': row['book_name'],
        'mula_ref': row['mula_ref'],
        'attha_ref': row['attha_ref'],
        'tika_ref': row['tika_ref'],
    } for row in rows}


def organize_hierarchy(hierarchy):
    """Organize books into a nested menu structure."""
    menu = {}
    for book_id, book_data in hierarchy.items():
        category = book_data['category']
        nikaya = book_data['nikaya']
        sub_nikaya = book_data['sub_nikaya']
        book_name = book_data['book_name']

        if category not in menu:
            menu[category] = {}
        if nikaya not in menu[category]:
            menu[category][nikaya] = {}

        if sub_nikaya:
            if sub_nikaya not in menu[category][nikaya]:
                menu[category][nikaya][sub_nikaya] = []
            menu[category][nikaya][sub_nikaya].append((book_id, book_name))
        else:
            if not isinstance(menu[category][nikaya], list):
                menu[category][nikaya] = []
            menu[category][nikaya].append((book_id, book_name))

    return menu


def get_book_toc(book_id, conn):
    """Fetch table of contents (headings) for a book."""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, heading_number, title
        FROM headings
        WHERE book_id = ? AND heading_number <= 6
        ORDER BY para_id
    ''', (book_id,))
    rows = cursor.fetchall()
    return [{'para_id': row['para_id'], 'level': row['heading_number'], 'title': row['title']} for row in rows]


def get_section_sentences(book_id, para_id, conn):
    """
    Fetch sentences for a TOC section: from para_id up to (but not including)
    the next heading's para_id.
    
    The sentences table schema:
        book_id, para_id, line_id, vripara, thaipage, vripage, ptspage, mypage,
        pali_sentence, english_translation, vietnamese_translation
    """
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
        FROM sentences
        WHERE book_id = ? AND para_id >= ? AND para_id < (
            SELECT COALESCE(
                (SELECT MIN(para_id) FROM headings WHERE book_id = ? AND para_id > ? AND heading_number <= 6),
                999999
            )
        )
        ORDER BY para_id, line_id
    ''', (book_id, para_id, book_id, para_id))
    rows = cursor.fetchall()
    return [
        {
            'para_id': r['para_id'],
            'line_id': r['line_id'],
            'pali': markdown_to_html(r['pali_sentence']),
            'english': markdown_to_html(r['english_translation']),
            'vietnamese': markdown_to_html(r['vietnamese_translation']),
        }
        for r in rows
    ]


def normalize_query(query):
    """Enhance query for typo tolerance and phrase support."""
    query = normalize_pali(query)
    words = query.split()
    variants = []
    for word in words:
        if word.startswith('"') and word.endswith('"'):
            variants.append(word.strip('"'))
        else:
            variants.append(f"{word}*")
    return ' OR '.join(variants)


# ─────────────────────────────────────────────
# Routes — Index
# ─────────────────────────────────────────────

@bp.route('/')
def index():
    hierarchy = load_hierarchy()
    menu_data = organize_hierarchy(hierarchy)
    return render_template('index.html', menu=menu_data, base_url=bp.url_prefix)


# ─────────────────────────────────────────────
# Routes — Book (main reader view)
# ─────────────────────────────────────────────

@bp.route('/book/<book_id>')
def book(book_id):
    """
    Render the book reader page.
    
    The page loads only the TOC on initial render.
    Content sections are loaded on demand via the API below.
    
    URL supports deep-linking:
        /book/<book_id>?para=<para_id>&line=<line_id>
    The JS will auto-load and scroll to the right section.
    """
    book_id = book_id.replace('_chunks', '')
    hierarchy = load_hierarchy()
    conn = get_db_connection()

    cursor = conn.cursor()
    cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
    row = cursor.fetchone()
    book_title = row['book_name'] if row else 'Unknown Book'

    toc = get_book_toc(book_id, conn)
    conn.close()

    bookinfo = hierarchy.get(book_id, {})
    bookref = {
        'mula_ref': bookinfo.get('mula_ref'),
        'attha_ref': bookinfo.get('attha_ref'),
        'tika_ref': bookinfo.get('tika_ref'),
    }

    # SEO: canonical URL and structured description
    canonical_url = f"{bp.url_prefix}/book/{book_id}"
    meta_description = f"Read {book_title} from the Chaṭṭha Saṅgāyana Tipiṭaka with Pali, English, and Vietnamese translations."

    return render_template(
        'book.html',
        book_id=book_id,
        book_title=book_title,
        bookref=bookref,
        toc=toc,
        base_url=bp.url_prefix,
        canonical_url=canonical_url,
        meta_description=meta_description,
        firebase_config=FIREBASE_CONFIG,
    )


# ─────────────────────────────────────────────
# API — Lazy-load section content
# ─────────────────────────────────────────────

@bp.route('/api/book/<book_id>/section/<int:para_id>')
def api_book_section(book_id, para_id):
    """
    Return JSON with rendered HTML sentences for a TOC section.
    Called by the frontend when a TOC entry is expanded.
    
    Response shape:
    {
        "para_id": 42,
        "sentences": [
            {
                "para_id": 42,
                "line_id": 1,
                "pali": "<html>...",
                "english": "<html>...",
                "vietnamese": "<html>..."
            },
            ...
        ]
    }
    """
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    sentences = get_section_sentences(book_id, para_id, conn)
    conn.close()
    return jsonify({'para_id': para_id, 'sentences': sentences})


# ─────────────────────────────────────────────
# API — Get multiple sections (batch)
# ─────────────────────────────────────────────

@bp.route('/api/book/<book_id>/sections')
def api_book_sections(book_id):
    """
    Batch fetch multiple sections.
    Query param: ?para_ids=1,42,100
    Used for pre-loading adjacent sections or restoring a reading position.
    """
    book_id = book_id.replace('_chunks', '')
    raw = request.args.get('para_ids', '')
    try:
        para_ids = [int(x) for x in raw.split(',') if x.strip()]
    except ValueError:
        return jsonify({'error': 'Invalid para_ids'}), 400

    conn = get_db_connection()
    result = {}
    for pid in para_ids:
        result[pid] = get_section_sentences(book_id, pid, conn)
    conn.close()
    return jsonify(result)


# ─────────────────────────────────────────────
# Routes — Book reference redirect
# ─────────────────────────────────────────────

@bp.route('/book_ref/<book_id>')
def book_ref(book_id):
    ref = request.args.get('ref', '').strip()
    para_id = request.args.get('para_id', '').strip().replace('para-', '')
    try:
        para_id = int(para_id)
    except ValueError:
        para_id = 1

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT title FROM headings
        WHERE book_id = ? AND heading_number = 10 AND para_id < ?
        ORDER BY para_id DESC LIMIT 1
    ''', (ref, para_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return redirect(f'{bp.url_prefix}/book/{book_id}')

    heading = row[0]
    result_para = ''
    while result_para == '':
        cursor.execute('''
            SELECT para_id FROM headings
            WHERE book_id = ? AND heading_number = 10 AND title = ?
            ORDER BY para_id DESC
        ''', (book_id, heading))
        found = cursor.fetchone()
        result_para = found[0] if found else ''
        heading = str(int(heading) - 1)

    conn.close()
    return redirect(f'{bp.url_prefix}/book/{book_id}?para={result_para}')


# ─────────────────────────────────────────────
# Routes — Edit
# ─────────────────────────────────────────────

@bp.route('/book_edit/<book_id>')
def book_edit(book_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
    row = cursor.fetchone()
    book_title = row['book_name'] if row else 'Unknown Book'

    toc = []
    for h in get_book_toc(book_id, conn):
        cursor.execute('''
            SELECT COUNT(DISTINCT para_id) FROM sentences
            WHERE book_id = ? AND para_id >= ? AND para_id < (
                SELECT COALESCE(
                    (SELECT MIN(para_id) FROM headings WHERE book_id = ? AND para_id > ? AND heading_number <= 6),
                    999999
                )
            )
        ''', (book_id, h['para_id'], book_id, h['para_id']))
        para_count = cursor.fetchone()[0]
        toc.append({**h, 'para_count': para_count})

    conn.close()
    return render_template('book_edit.html', book_id=book_id, book_title=book_title, toc=toc, base_url=bp.url_prefix)


@bp.route('/book_edit/<book_id>/<int:para_id>')
def get_edit_content(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    sentences = get_section_sentences(book_id, para_id, conn)
    conn.close()
    return jsonify(sentences)


@bp.route('/save_translation', methods=['POST'])
def save_translation():
    data = request.get_json()
    book_id = data['book_id']
    para_id = data['para_id']
    line_id = data['line_id']
    vietnamese_translation = data['vietnamese_translation']
    english_translation = data['english_translation']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE sentences
        SET vietnamese_translation = ?, english_translation = ?
        WHERE book_id = ? AND para_id = ? AND line_id = ?
    ''', (vietnamese_translation, english_translation, book_id, para_id, line_id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})


# ─────────────────────────────────────────────
# Routes — Search / Suggest
# ─────────────────────────────────────────────

@bp.route('/suggest_word')
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT word, plain, frequency FROM words
        WHERE plain LIKE ?
        ORDER BY frequency DESC LIMIT ?
    ''', (f'%{normalize_pali(query)}%', config.MAX_SUGGESIONS))
    results = cursor.fetchall()
    conn.close()

    return jsonify([{'word': r['word'], 'plain': r['plain'], 'frequency': r['frequency']} for r in results])

@bp.route('/api/suggest_word')
def suggest_word1():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT word FROM words
        WHERE plain LIKE ?
        ORDER BY frequency DESC LIMIT ?
    ''', (f'%{normalize_pali(query)}%', config.MAX_SUGGESIONS))
    results = cursor.fetchall()
    conn.close()

    return jsonify([r['word'] for r in results])



@bp.route('/search_headings_suggest')
def search_headings_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT book_id, para_id, title FROM headings WHERE title LIKE ? LIMIT 10
    ''', (f'%{query}%',))
    results = cursor.fetchall()
    conn.close()

    return jsonify([{
        'book_id': r['book_id'],
        'book_title': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id': r['para_id'],
        'title': r['title'],
    } for r in results])


@bp.route('/search_headings')
def search_headings():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return render_template('search.html', results=[], base_url=bp.url_prefix)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM headings WHERE title LIKE ?', (f'%{query}%',))
    total_results = cursor.fetchone()[0]

    cursor.execute('''
        SELECT book_id, para_id, heading_number, title FROM headings
        WHERE title LIKE ?
        ORDER BY book_id, para_id
        LIMIT ?
    ''', (f'%{query}%', config.MAX_SUGGESIONS))
    results = cursor.fetchall()
    conn.close()

    formatted = [{
        'book_id': r['book_id'],
        'book_title': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id': r['para_id'],
        'title': markdown_to_html(r['title']),
        'heading_number': r['heading_number'],
    } for r in results]

    return render_template('search.html',
                           results=formatted,
                           total_results=total_results,
                           total_pages=len(formatted) // 50 + (1 if len(formatted) % 50 > 0 else 0),
                           query=query,
                           base_url=bp.url_prefix)


@bp.route('/search')
def search():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    mode = request.args.get('mode', 'fts')
    query = re.sub(r'[^\w\s]', ' ', query, flags=re.UNICODE)
    query = re.sub(r'\s+', ' ', query)
    page = int(request.args.get('page', '1') or '1')
    page = max(1, page)

    if not query:
        return render_template('search.html', results=[], base_url=bp.url_prefix)

    conn = get_db_connection()
    cursor = conn.cursor()
    query_words = [w.strip() for w in query.split() if w.strip()]

    fts_query = ' AND '.join([f'{w}*' for w in query_words]) if len(query_words) > 1 else f'{query_words[0]}*'

    total_results = cursor.execute(
        'SELECT COUNT(*) FROM sentences_fts WHERE sentences_fts MATCH ?', (fts_query,)
    ).fetchone()[0]

    cursor.execute('''
        SELECT book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph, rank
        FROM sentences_fts
        WHERE sentences_fts MATCH ?
        ORDER BY
            CASE
                WHEN book_id LIKE '%.mul' THEN 1
                WHEN book_id LIKE '%.att' THEN 2
                WHEN book_id LIKE '%.tik' THEN 3
                ELSE 4
            END, book_id, rank, para_id
        LIMIT ?, ?
    ''', (fts_query, (page - 1) * config.MAX_SEARCH_RESULTS, config.MAX_SEARCH_RESULTS))
    fts_rows = cursor.fetchall()

    grouped = defaultdict(list)
    for row in fts_rows:
        grouped[row['book_id']].append({
            'book_id': row['book_id'],
            'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
            'para_id': row['para_id'],
            'pali': markdown_to_html(trim_text(row['pali_paragraph'], query_words)),
            'english': markdown_to_html(trim_text(row['english_paragraph'], query_words)),
            'vietnamese': markdown_to_html(trim_text(row['vietnamese_paragraph'], query_words)),
        })

    grouped_list = [{'book_id': bid, 'book_title': entries[0]['book_title'], 'first': entries[0], 'more': entries[1:]}
                    for bid, entries in grouped.items()]

    conn.close()
    return render_template('search.html',
                           results=grouped_list,
                           total_results=total_results,
                           total_pages=total_results // config.MAX_SEARCH_RESULTS + (1 if total_results % config.MAX_SEARCH_RESULTS > 0 else 0),
                           query=' '.join(query_words),
                           page=page,
                           base_url=bp.url_prefix)


# ─────────────────────────────────────────────
# API — Related paragraph cross-reference
# ─────────────────────────────────────────────

@bp.route('/get_related_para/<book_id>/<para_id>')
def get_related_para(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT title, heading_number FROM headings
        WHERE book_id = ? AND para_id <= ? AND heading_number = 10
        ORDER BY para_id DESC LIMIT 1
    ''', (book_id, para_id))
    result = cursor.fetchone()
    if not result:
        conn.close()
        return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

    heading_title = result[0]
    book_type = ('mul' if book_id.endswith('.mul') else
                 'att' if book_id.endswith('.att') else
                 'tik' if book_id.endswith('.tik') else None)

    if not book_type:
        conn.close()
        return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

    response = {'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None}
    base_id = book_id[:-5]

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

    conn.close()
    return jsonify(response)


# ─────────────────────────────────────────────
# API — Dictionary lookup  (mirrors DictionaryController logic)
# ─────────────────────────────────────────────

@bp.route('/api/dictionary')
def api_dictionary():
    """
    Look up a Pali word using the same Auto algorithm as the Flutter app.

    Algorithm (DictAlgorithm.Auto):
      1. TPR pass  — resolve inflection → headword via dpd_inflections_to_headwords,
                     then fetch from `dictionary` + optionally `dpd` tables.
      2. DPD-split fallback — if TPR yields nothing, try dpr_stem then dpd_word_split.

    Query param: ?word=<roman-pali-word>
    Returns JSON list of {word, definition, book_name}.
    """
    word = request.args.get('word', '').strip().lower()
    if not word:
        return jsonify([])

    conn = get_db_connection()
    try:
        results = _search_auto(conn, word)
    finally:
        conn.close()

    return jsonify(results)


# ── helpers ──────────────────────────────────────────────────────────────────

def _search_auto(conn, word: str) -> list:
    """TPR first, DPD-split fallback — mirrors searchAuto()."""
    results = _search_with_tpr(conn, word)
    if not results:
        results = _search_with_dpd_split(conn, word)
    return results


def _get_dpd_headwords(conn, word: str) -> str:
    """dpd_inflections_to_headwords lookup — mirrors getDpdHeadwords()."""
    row = conn.execute(
        'SELECT headwords FROM dpd_inflections_to_headwords WHERE inflection = ?',
        (word,)
    ).fetchone()
    return row['headwords'] if row else ''


def _resolve_tpr_word(word: str, dpd_headwords: str) -> tuple[str, bool]:
    """
    Apply the same switch/hack logic as searchWithTPR() to turn the first
    DPD headword into the stem word that should be looked up.

    Returns (resolved_word, is_already_stem).
    """
    if not dpd_headwords:
        return word, False

    parts = dpd_headwords.split(',')
    dpd_word = parts[0]
    # strip brackets, quotes, digits, whitespace — mirrors the Flutter regex
    import re
    dpd_word = re.sub(r"['\[\]\d\s]", '', dpd_word)

    # mirrors the small switch block
    if dpd_word == 'āyasmant':
        return 'āyasmantu', False
    if dpd_word == 'bhikkhave':
        return 'bhikkhu', False
    if dpd_word == 'ambho':
        return dpd_word, True          # isAlreadyStem = true

    # āyasm… override
    if 'āyasm' in word:
        dpd_word = 'āyasmantu'

    # -vant → -vantu hack
    if len(dpd_word) > 4 and dpd_word[-4:] == 'vant':
        dpd_word = dpd_word[:-4] + 'vantu'

    return dpd_word, False


def _get_dictionary_definitions(conn, word: str, is_already_stem: bool) -> list:
    """
    Fetch from the `dictionary` table — mirrors getDefinition().
    When is_already_stem is False the Flutter code still passes the resolved
    word directly (stem estimation was already done by DPD lookup).
    """
    rows = conn.execute('''
        SELECT d.word, d.definition, b.name AS book_name, b.user_order
        FROM dictionary d
        JOIN dictionary_books b ON d.book_id = b.id
        WHERE d.word = ? AND b.user_choice = 1
        ORDER BY b.user_order
    ''', (word,)).fetchall()
    return [dict(r) for r in rows]


def _get_dpd_definition(conn, headwords: str) -> dict | None:
    """
    Fetch from the `dpd` table for each headword — mirrors getDpdDefinition().
    Returns a single merged Definition dict or None.
    """
    line = headwords.replace('[', '').replace(']', '').replace("'", '')
    words = [w.strip() for w in line.split(',') if w.strip()]

    combined_def = ''
    book_name = ''
    user_order = 0

    for w in words:
        row = conn.execute('''
            SELECT d.word, d.definition, d.book_id, b.name, b.user_order
            FROM dpd d
            JOIN dictionary_books b ON d.book_id = b.id
            WHERE d.word = ? AND b.user_choice = 1
        ''', (w,)).fetchone()
        if row and row['definition']:
            combined_def += row['definition']
            book_name   = row['name']
            user_order  = row['user_order']

    if not combined_def:
        return None
    return {'word': words[0] if words else '', 'definition': combined_def,
            'book_name': book_name, 'user_order': user_order}


def _get_dpd_grammar_definition(conn, word: str) -> dict | None:
    """Mirrors getDpdGrammarDefinition()."""
    row = conn.execute(
        'SELECT word, definition FROM dpd_grammar WHERE word = ?', (word,)
    ).fetchone()
    if not row:
        return None
    grammar_html = (
        "<hr><div style='text-align:center;margin-bottom:10px'>DPD Grammar</div>"
        f"<hr><br>{row['definition']}"
    )
    return {'word': row['word'], 'definition': grammar_html,
            'book_name': 'DPD Grammar', 'user_order': 0}


def _search_with_tpr(conn, original_word: str) -> list:
    """Mirrors searchWithTPR()."""
    dpd_headwords = _get_dpd_headwords(conn, original_word)
    resolved_word, is_already_stem = _resolve_tpr_word(original_word, dpd_headwords)

    definitions = _get_dictionary_definitions(conn, resolved_word, is_already_stem)

    # DPD table (book_id 11) — always attempt if headwords found
    if dpd_headwords:
        dpd_def = _get_dpd_definition(conn, dpd_headwords)
        if dpd_def:
            grammar_def = _get_dpd_grammar_definition(conn, original_word)
            if grammar_def:
                dpd_def['definition'] += grammar_def['definition']
            definitions.insert(0, dpd_def)
            definitions.sort(key=lambda d: d.get('user_order', 0))

    return [{'word': d['word'], 'definition': d['definition'],
             'book_name': d['book_name']} for d in definitions]


def _get_dpr_stem(conn, word: str) -> str:
    """Mirrors getDprStem()."""
    row = conn.execute(
        'SELECT stem FROM dpr_stem WHERE word = ?', (word,)
    ).fetchone()
    return row['stem'] if row else ''


def _get_dpd_word_split(conn, word: str) -> str:
    """Mirrors getDpdWordSplit()."""
    row = conn.execute(
        'SELECT breakup FROM dpd_word_split WHERE word = ?', (word,)
    ).fetchone()
    return row['breakup'] if row else ''


def _search_with_dpd_split(conn, word: str) -> list:
    """Mirrors searchWithDpdSplit()."""
    definitions = []

    dpr_stem = _get_dpr_stem(conn, word)
    if dpr_stem:
        definitions = _get_dictionary_definitions(conn, dpr_stem, is_already_stem=True)

    # DPD table lookup
    dpd_headwords = _get_dpd_headwords(conn, word)
    if dpd_headwords:
        dpd_def = _get_dpd_definition(conn, dpd_headwords)
        if dpd_def:
            definitions.insert(0, dpd_def)

    if definitions:
        definitions.sort(key=lambda d: d.get('user_order', 0))
        return [{'word': d['word'], 'definition': d['definition'],
                 'book_name': d['book_name']} for d in definitions]

    # Final fallback — word split table
    breakup = _get_dpd_word_split(conn, word)
    if not breakup:
        return []

    split_words = [w.strip() for w in breakup.split(',') if w.strip()]
    split_results = []
    for sw in split_words:
        rows = _get_dictionary_definitions(conn, sw, is_already_stem=True)
        split_results.extend(rows)

    return [{'word': d['word'], 'definition': d['definition'],
             'book_name': d['book_name']} for d in split_results]

# ─────────────────────────────────────────────
# App Registration
# ─────────────────────────────────────────────

app.register_blueprint(bp)

if __name__ == '__main__':
    print('app is running at http://0.0.0.0:8080/tpk')
    app.run(host='0.0.0.0', port='8080', debug=True)

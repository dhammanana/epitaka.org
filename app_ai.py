import re
import os
from flask import Flask, Blueprint, jsonify, render_template, request, redirect
import sqlite3
from collections import defaultdict
import config
from convert_md2db import normalize_pali
import sqlite_vec


import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('intfloat/multilingual-e5-small')

def get_db_connection():
    db_path = os.path.join(current_dir, 'translations1.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)

    return conn

app = Flask(__name__, template_folder='templates', static_folder='static', static_url_path='/tpk/static')
bp = Blueprint('tpk', __name__, url_prefix=os.environ.get('BASE_URL', '/tpk'))
current_dir = os.path.dirname(os.path.abspath(__file__))

def markdown_to_html(text):
    if not text:
        return ''
    elif type(text) == int:
        print(f'error: {text}')
        return str(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = text.replace('\\[', '[').replace('\\]', ']')
    text = text.replace('<strong>', ' <strong>')
    for i in range(6, 0, -1):
        pattern = r'^' + r'\#' * i + r' (.*)$'
        repl = r'<h{0}>\1</h{0}>'.format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = re.sub(r'\\\[(.*?)\\\]', r'\[\1\]', text)
    return text


def load_hierarchy():
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
        if sub_nikaya != '':
            if sub_nikaya not in menu[category][nikaya]:
                menu[category][nikaya][sub_nikaya] = []
            menu[category][nikaya][sub_nikaya].append((book_id, book_name))
        else:
            if len(menu[category][nikaya]) < 1:
                menu[category][nikaya] = []
            menu[category][nikaya].append((book_id, book_name))

    return menu

hierarchy = load_hierarchy()
menu_data = organize_hierarchy(hierarchy)

@bp.route('/')
def index():
    return render_template('index.html', menu=menu_data, base_url=bp.url_prefix)

@bp.route('/book_ref/<book_id>')
def book_ref(book_id):
    book_ref = request.args.get('ref', '').strip()
    para_id = request.args.get('para_id', '').strip()
    para_id = para_id.replace('para-','')
    try:
        para_id = int(para_id)
    except ValueError:
        para_id = 1

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT title
        FROM headings
        WHERE book_id = ? AND heading_number = 10 AND para_id < ?
        ORDER BY para_id DESC
        LIMIT 1
    ''', (book_ref, para_id))
    heading = cursor.fetchone()[0]
    print('----',heading)

    para_id = ''
    while para_id == '':
        cursor.execute('''
            SELECT para_id
            FROM headings
            WHERE book_id = ? AND heading_number = 10 AND title = ?
            ORDER BY para_id DESC
        ''', (book_id, heading))
        para_id = cursor.fetchone()
        para_id = para_id[0] if para_id != None else ''
        heading = str(int(heading) - 1)
        print('brute ', heading)

    print('----', para_id)


    return redirect(f'{bp.url_prefix}/book/{book_id}#para-{para_id}')

@bp.route('/book/<book_id>')
def book(book_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT book_name
        FROM books
        WHERE book_id = ?
    ''', (book_id,))
    book_title = cursor.fetchone()
    book_title = book_title['book_name'] if book_title else 'Unknown Book'

    cursor.execute('''
        SELECT para_id, heading_number, title
        FROM headings
        WHERE book_id = ? AND heading_number <= 6
        ORDER BY para_id
    ''', (book_id,))
    headings = cursor.fetchall()

    cursor.execute('''
        SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
        FROM sentences
        WHERE book_id = ?
        ORDER BY para_id, line_id
    ''', (book_id,))
    sentences = cursor.fetchall()

    conn.close()

    toc = [{'para_id': row['para_id'], 'level': row['heading_number'], 'title': row['title']} for row in headings]
    sentences = [(
        s['para_id'], s['line_id'], 
        markdown_to_html(s['pali_sentence']), 
        markdown_to_html(s['english_translation']), 
        markdown_to_html(s['vietnamese_translation'])
    ) for s in sentences]

    bookinfo = hierarchy.get(book_id, {})
    bookref = {}
    bookref['mula_ref'] = bookinfo.get('mula_ref', None)
    bookref['attha_ref'] = bookinfo.get('attha_ref', None)
    bookref['tika_ref'] = bookinfo.get('tika_ref', None)
    return render_template('book.html', book_id=book_id, book_title=book_title, bookref=bookref, toc=toc, sentences=sentences, base_url=bp.url_prefix)

@bp.route('/book_edit/<book_id>')
def book_edit(book_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT book_name
        FROM books
        WHERE book_id = ?
    ''', (book_id,))
    book_title = cursor.fetchone()
    book_title = book_title['book_name'] if book_title else 'Unknown Book'

    cursor.execute('''
        SELECT para_id, heading_number, title
        FROM headings
        WHERE book_id = ? AND heading_number <= 6
        ORDER BY para_id
    ''', (book_id,))
    headings = cursor.fetchall()

    toc = []
    for row in headings:
        cursor.execute('''
            SELECT COUNT(DISTINCT para_id)
            FROM sentences
            WHERE book_id = ? AND para_id >= ? AND para_id < (
                SELECT MIN(para_id)
                FROM headings
                WHERE book_id = ? AND para_id > ? AND heading_number <= 6
                UNION SELECT 999999
                LIMIT 1
            )
        ''', (book_id, row['para_id'], book_id, row['para_id']))
        para_count = cursor.fetchone()[0]
        toc.append({'para_id': row['para_id'], 'level': row['heading_number'], 'title': row['title'], 'para_count': para_count})

    conn.close()
    return render_template('book_edit.html', book_id=book_id, book_title=book_title, toc=toc, base_url=bp.url_prefix)

@bp.route('/book_edit/<book_id>/<para_id>')
def get_edit_content(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
        FROM sentences
        WHERE book_id = ? AND para_id >= ? AND para_id < (
            SELECT MIN(para_id)
            FROM headings
            WHERE book_id = ? AND para_id > ? AND heading_number <= 6
            UNION SELECT 999999
            LIMIT 1
        )
        ORDER BY para_id, line_id
    ''', (book_id, para_id, book_id, para_id))
    sentences = cursor.fetchall()

    conn.close()
    formatted_sentences = [
        {
            'para_id': s['para_id'],
            'line_id': s['line_id'],
            'pali': markdown_to_html(s['pali_sentence']),
            'english': markdown_to_html(s['english_translation']),
            'vietnamese': markdown_to_html(s['vietnamese_translation'])
        }
        for s in sentences
    ]
    return jsonify(formatted_sentences)

@bp.route('/save_translation', methods=['POST'])
def save_translation():
    data = request.get_json()
    book_id = data['book_id']
    para_id = data['para_id']
    line_id = data['line_id']
    vietnamese_translation = data['vietnamese_translation']
    # english_translation = data['english_translation']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE sentences
        SET vietnamese_translation = ?
        WHERE book_id = ? AND para_id = ? AND line_id = ?
    ''', (vietnamese_translation, book_id, para_id, line_id))
    # cursor.execute('''
    #     UPDATE sentences
    #     SET vietnamese_translation = ?, english_translation = ?
    #     WHERE book_id = ? AND para_id = ? AND line_id = ?
    # ''', (vietnamese_translation, english_translation, book_id, para_id, line_id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

def normalize_query(query):
    """Enhance query for typo tolerance and phrase support"""
    query = normalize_pali(query)
    words = query.split()
    variants = []
    for word in words:
        if word.startswith('"') and word.endswith('"'):
            variants.append(word.strip('"'))
        else:
            variants.append(f"{word}*")
    return ' OR '.join(variants)

@bp.route('/suggest_word')
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT word, plain, frequency
        FROM words
        WHERE plain LIKE ?
        ORDER BY frequency DESC
        LIMIT ?
    ''', (f'%{normalize_pali(query)}%', config.MAX_SUGGESIONS))

    results = cursor.fetchall()

    formatted_results = [
        {
            'word': row['word'],
            'plain': row['plain'],
            'frequency': row['frequency']
        }
        for row in results
    ]

    conn.close()
    return jsonify(formatted_results)

@bp.route('/search_headings_suggest')
def search_headings_suggest():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT book_id, para_id, title
        FROM headings
        WHERE title LIKE ?
        LIMIT 10
    ''', (f'%{query}%',))
    results = cursor.fetchall()

    formatted_results = [
        {
            'book_id': row['book_id'],
            'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
            'para_id': row['para_id'],
            'title': row['title'],
        }
        for row in results
    ]

    conn.close()
    return jsonify(formatted_results)

@bp.route('/search_headings')
def search_headings():
    query = request.args.get('q', '').strip()
    if not query:
        return render_template('search.html', results=[], base_url=bp.url_prefix)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT COUNT(*)
        FROM headings
        WHERE title LIKE ?
    ''', (f'%{query}%',))
    total_results = cursor.fetchone()[0]

    cursor.execute('''
        SELECT book_id, para_id, heading_number, title
        FROM headings
        WHERE title LIKE ?
        ORDER BY book_id, para_id
        LIMIT ?
    ''', (f'%{query}%', config.MAX_SUGGESIONS))
    results = cursor.fetchall()

    formatted_results = [
        {
            'book_id': row['book_id'],
            'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
            'para_id': row['para_id'],
            'title': markdown_to_html(row['title']),
            'heading_number': row['heading_number']
        }
        for row in results
    ]

    conn.close()
    return render_template('search.html', 
                          results=formatted_results, 
                          total_results=total_results,
                          total_pages=len(formatted_results) // 50 + (1 if len(formatted_results) % 50 > 0 else 0),
                          query=query,
                          base_url=bp.url_prefix)

@bp.route('/search_old')
def search_old():
    query = request.args.get('q', '').strip()
    query = re.sub(r'[^\w\s]', ' ', query, flags=re.UNICODE)
    query = re.sub(r'\s+', ' ', query)
    page = request.args.get('page', '1').strip()
    try:
        page = int(page)
        if page < 1:
            page = 1
    except:
        page = 1

    if not query:
        return render_template('search.html', results=[], base_url=bp.url_prefix)

    conn = get_db_connection()
    cursor = conn.cursor()

    query_words = query.split(' ')
    if len(query_words) > 1:
        query = ' AND '.join([f'{word}*' for word in query_words if word])
    else:
        query = f'{query_words[0]}*'

    total_results = cursor.execute('''
        SELECT COUNT(*)
        FROM sentences_fts
        WHERE sentences_fts MATCH ?
    ''', (query,)).fetchone()[0]
    print(f'total {total_results}')

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
    ''', (query, (page-1)*config.MAX_SEARCH_RESULTS, config.MAX_SEARCH_RESULTS))

    results = cursor.fetchall()


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

    grouped_results = defaultdict(list)
    for row in results:
        grouped_results[row['book_id']].append({
            'book_id': row['book_id'],
            'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
            'para_id': row['para_id'],
            'pali': markdown_to_html(trim_text(row['pali_paragraph'], query_words)),
            'english': markdown_to_html(trim_text(row['english_paragraph'], query_words)),
            'vietnamese': markdown_to_html(trim_text(row['vietnamese_paragraph'], query_words))
        })

    grouped_list = []
    for book_id, entries in grouped_results.items():
        grouped_list.append({
            'book_id': book_id,
            'book_title': entries[0]['book_title'],
            'first': entries[0],
            'more': entries[1:]
        })

    conn.close()

    query = request.args.get('q', '').strip()
    return render_template('search.html', 
                          results=grouped_list, 
                          total_results=total_results,
                          total_pages=total_results // config.MAX_SEARCH_RESULTS + (1 if len(grouped_results) % config.MAX_SEARCH_RESULTS > 0 else 0),
                          query=query,
                          page=page,
                          base_url=bp.url_prefix)


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
    if text == None:
        return ''
    query_pos = min([text.lower().find(word.lower()) for word in query_words if text.lower().find(word.lower()) != -1] or [0])
    start = max(0, query_pos - config.MAX_SEARCH_RESULTS_LENGTH // 2)
    end = min(len(text), query_pos + config.MAX_SEARCH_RESULTS_LENGTH // 2)
    ret = ('...' if start > 0 else '') + text[start:end] + ('...' if end < len(text) else '')
    return highlight_text(ret, query_words)

@bp.route('/search')
def search():
    query = request.args.get('q', '').strip()
    mode = request.args.get('mode', 'fts')  # 'fts' or 'ai'
    query = re.sub(r'[^\w\s]', ' ', query, flags=re.UNICODE)
    query = re.sub(r'\s+', ' ', query)
    page = request.args.get('page', '1').strip()
    try:
        page = int(page)
        if page < 1:
            page = 1
    except:
        page = 1

    if not query:
        return render_template('search.html', results=[], base_url=bp.url_prefix)

    conn = get_db_connection()
    cursor = conn.cursor()
    query_words = query.split(' ')
    query_words = [word.strip() for word in query_words if word.strip()]





    results = []
    if mode == 'ai':
        # Semantic search
        query_emb = model.encode([query], normalize_embeddings=True)[0].astype(np.float32).tobytes()
        cursor.execute('''
            SELECT book_id, para_id, distance
            FROM sentences_vec
            WHERE embedding MATCH ?  -- Top 50 candidates
            ORDER BY distance
            LIMIT ?
        ''', (query_emb, config.MAX_SEARCH_RESULTS))
        vec_results = cursor.fetchall()

        # Fetch details from FTS5, filter/rank by distance
        for row in vec_results:
            cursor.execute('''
                SELECT pali_paragraph, english_paragraph, vietnamese_paragraph
                FROM sentences_fts
                WHERE book_id = ? AND para_id = ?
            ''', (row['book_id'], row['para_id']))
            para = cursor.fetchone()
            if para:
                results.append({
                    'book_id': row['book_id'],
                    'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
                    'para_id': row['para_id'],
                    'pali': markdown_to_html(trim_text(para['pali_paragraph'], query_words)),
                    'english': markdown_to_html(trim_text(para['english_paragraph'], query_words)),
                    'vietnamese': markdown_to_html(trim_text(para['vietnamese_paragraph'], query_words)),
                    'score': 1 - row['distance']  # Normalize 0-1
                })
        total_results = len(results)  # Approx; for paging, adjust
    else:
        # Original FTS5 (unchanged)
        if len(query_words) > 1:
            query = ' AND '.join([f'{word}*' for word in query_words if word])
        else:
            query = f'{query_words[0]}*'
        total_results = cursor.execute('''
            SELECT COUNT(*)
            FROM sentences_fts
            WHERE sentences_fts MATCH ?
        ''', (query,)).fetchone()[0]
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
        ''', (query, (page-1)*config.MAX_SEARCH_RESULTS, config.MAX_SEARCH_RESULTS))
        fts_rows = cursor.fetchall()
        for row in fts_rows:
            results.append({
                'book_id': row['book_id'],
                'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
                'para_id': row['para_id'],
                'pali': markdown_to_html(trim_text(row['pali_paragraph'], query_words)),
                'english': markdown_to_html(trim_text(row['english_paragraph'], query_words)),
                'vietnamese': markdown_to_html(trim_text(row['vietnamese_paragraph'], query_words))
            })


    grouped_results = defaultdict(list)
    for row in results:
        grouped_results[row['book_id']].append({
            'book_id': row['book_id'],
            'book_title': hierarchy.get(row['book_id'], {}).get('book_name', 'Unknown'),
            'para_id': row['para_id'],
            'pali': markdown_to_html(trim_text(row['pali'], query_words)),
            'english': markdown_to_html(trim_text(row['english'], query_words)),
            'vietnamese': markdown_to_html(trim_text(row['vietnamese'], query_words))
        })

    grouped_list = []
    for book_id, entries in grouped_results.items():
        grouped_list.append({
            'book_id': book_id,
            'book_title': entries[0]['book_title'],
            'first': entries[0],
            'more': entries[1:]
        })

    
    # Rest unchanged: trim_text, highlight_text, grouped_results, etc.
    # ... (keep your existing grouping and template render code)
    # For AI mode, add 'mode': mode to template if needed for UI

    conn.close()
    return render_template('search.html', 
                          results=grouped_list, 
                          total_results=total_results,
                          total_pages=total_results // config.MAX_SEARCH_RESULTS + (1 if total_results % config.MAX_SEARCH_RESULTS > 0 else 0),
                          query=query,
                          page=page,
                          base_url=bp.url_prefix)

@bp.route('/get_related_para/<book_id>/<para_id>')
def get_related_para(book_id, para_id):
    book_id = book_id.replace('_chunks', '')
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT title, heading_number
        FROM headings
        WHERE book_id = ? AND para_id <= ? AND heading_number = 10
        ORDER BY para_id DESC
        LIMIT 1
    ''', (book_id, para_id))
    result = cursor.fetchone()
    if not result:
        conn.close()
        return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

    heading_title, heading_number = result

    book_type = 'mul' if book_id.endswith('.mul') else 'att' if book_id.endswith('.att') else 'tik' if book_id.endswith('.tik') else None
    if not book_type:
        conn.close()
        return jsonify({'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None})

    response = {'att_para_id': None, 'tik_para_id': None, 'mul_para_id': None}

    base_id = book_id[:-5]
    target_books = []
    if book_type == 'mul':
        target_books = [f'{base_id}a.att', f'{base_id}t.tik']
        response_keys = ['att_para_id', 'tik_para_id']
    elif book_type == 'att':
        target_books = [f'{base_id}m.mul', f'{base_id}t.tik']
        response_keys = ['mul_para_id', 'tik_para_id']
    elif book_type == 'tik':
        target_books = [f'{base_id}m.mul', f'{base_id}a.att']
        response_keys = ['mul_para_id', 'att_para_id']

    for target_book, response_key in zip(target_books, response_keys):
        cursor.execute('''
            SELECT para_id
            FROM headings
            WHERE book_id = ? AND title = ? AND heading_number = 10
            ORDER BY ABS(para_id - ?)
            LIMIT 1
        ''', (target_book, heading_title, para_id))
        result = cursor.fetchone()
        if result:
            response[response_key] = result[0]

    conn.close()
    return jsonify(response)

app.register_blueprint(bp)

if __name__ == '__main__':
    print('app is running at http://0.0.0.0:8080/tpk')
    app.run(host='0.0.0.0', port='8080', debug=True)

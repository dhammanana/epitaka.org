import sqlite3
import os
import re
from jinja2 import Environment, FileSystemLoader
from app import is_numbered, markdown_to_html
import requests
import tarfile
import shutil
import tempfile
import gdown
DB_PATH = 'temp_minimal.db'
OUTPUT_DIR = 'dist'
TEMPLATE_DIR = 'templates'
def setup_database():
    if os.path.exists(DB_PATH):
        return
    print("Database not found. Downloading and setting up...")
    # https://drive.google.com/file/d/11lE7w1kuOD989q_Rxt7TpNhx9RP_VUBV/view?usp=drive_link
    file_id = '11lE7w1kuOD989q_Rxt7TpNhx9RP_VUBV'
    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    tar_path = 'translations.tar.gz'
    # gdown.download(url, output=tar_path, quiet=False)
       
   
    with tarfile.open(tar_path, 'r:gz') as tar:
        tar.extractall('.')
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError("temp_minimal.db not found in archive")
        
    os.unlink(tar_path)
    print("Database setup complete.")

def url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', '')
        return f'{filename}'
    return ""
# def is_numbered(text):
# return bool(re.match(r'^<code>\d+</code>\.$', str(text)))
def get_books(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT book_id, book_name, category, nikaya, sub_nikaya FROM books")
    return cursor.fetchall()
def get_headings(conn, book_id):
    cursor = conn.cursor()
    cursor.execute("SELECT para_id, heading_number, title, count_para FROM headings_with_count WHERE book_id = ? AND heading_number < 10 ORDER BY para_id", (book_id,))
    return cursor.fetchall()
def get_sentences(conn, book_id, start_para, end_para):
    cursor = conn.cursor()
    cursor.execute("SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation FROM sentences WHERE book_id = ? AND para_id >= ? AND para_id < ? ORDER BY para_id, line_id", (book_id, start_para, end_para))
    return cursor.fetchall()
def organize_hierarchy(books):
    menu = {}
    for book_id, book_name, category, nikaya, sub_nikaya in books:
        if category not in menu:
            menu[category] = {}
        if nikaya not in menu[category]:
            menu[category][nikaya] = {}
        if sub_nikaya != '':
            if sub_nikaya not in menu[category][nikaya]:
                menu[category][nikaya][sub_nikaya] = []
            menu[category][nikaya][sub_nikaya].append((book_id, book_name))
        else:
            if not isinstance(menu[category][nikaya], list):
                menu[category][nikaya] = []
            menu[category][nikaya].append((book_id, book_name))
    return menu
def replace_book(content):
    content = content.replace(
        '''<script src="js/tailwind-3.4.17.js"></script>
    <script src="js/autocomplete.js"></script>
    <script src="js/main.js" defer></script>
    <link rel="stylesheet" href="css/autocomplete-theme-classic.css">''',
        '''<script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-js@1.19.4/dist/umd/index.production.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-theme-classic@1.18.0/dist/theme.min.css" integrity="sha256-..."/>
    <script src="js/main.js" defer></script>''')
    return content.replace('a href=""', 'a href="/"')
def main():
    setup_database()
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    else:
        for f in os.listdir(OUTPUT_DIR):
            try:
                os.remove(f"{OUTPUT_DIR}/{f}")
            except:
                pass

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    env.globals['url_for'] = url_for
    env.filters['is_numbered'] = is_numbered
    book_template = env.get_template('book_gen.html')
    index_template = env.get_template('index.html')
    search_template = env.get_template('search.html')
    conn = sqlite3.connect(DB_PATH)
    books = get_books(conn)
    menu_data = organize_hierarchy(books)
    shutil.copytree('static', OUTPUT_DIR, dirs_exist_ok=True)

    # Generate index.html
    with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        content = index_template.render(menu=menu_data, base_url='')
        content = content.replace(
            '''<script src="js/tailwind-3.4.17.js"></script>
    <script src="js/autocomplete.js"></script>
    <script src="js/main.js" defer></script>
    <link rel="stylesheet" href="css/autocomplete-theme-classic.css">''',
    '''<script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-js@1.19.4/dist/umd/index.production.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-theme-classic@1.18.0/dist/theme.min.css" integrity="sha256-..."/>
    <script src="js/main.js" defer></script>'''
    )
        content = content.replace('/book/', '/')
        f.write(content)

    # Generate search.html
    with open(os.path.join(OUTPUT_DIR, 'search.html'), 'w', encoding='utf-8') as f:
        content = index_template.render(menu=menu_data, base_url='')
        content = content.replace(
            '''<script src="js/tailwind-3.4.17.js"></script>
    <script src="js/autocomplete.js"></script>
    <script src="js/main.js" defer></script>
    <link rel="stylesheet" href="css/autocomplete-theme-classic.css">''',
    '''<script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-js@1.19.4/dist/umd/index.production.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@algolia/autocomplete-theme-classic@1.18.0/dist/theme.min.css" integrity="sha256-..."/>
    <script src="js/main.js" defer></script>'''
    )
        content = content.replace('/book/', '/')
        f.write(content)
    # Generate books

    # Generate books
    src = 'templates/book.html'
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('#para-{{ heading.para_id }}', '{{ heading.url }}')
    dst = 'templates/book_gen.html'
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    for book_id, book_name, _, _, _ in books:
        print(book_id, book_name)
        headings = get_headings(conn, book_id)
        if not headings:
            continue
        toc = []
        chunks = []
        current_chunk_paras = []
        current_para_count = 0
        chunk_num = 0
        for i, (para_id, heading_number, title, count_para) in enumerate(headings):
            if current_para_count + count_para > 200 and i > 0:
                chunks.append(current_chunk_paras)
                current_chunk_paras = []
                current_para_count = 0
                chunk_num += 1
           
            current_chunk_paras.append(para_id)
            current_para_count += count_para
            toc.append({
                'para_id': para_id,
                'level': heading_number,
                'title': title,
                'chunk_num': chunk_num,
                'filename': f'{book_id}_{chunk_num}.html'
            })
        chunks.append(current_chunk_paras)
        # Merge small chunks
        para_to_count = {p[0]: p[3] for p in headings}
        new_chunks = []
        i = 0
        while i < len(chunks):
            this_chunk_paras = chunks[i]
            start_para = this_chunk_paras[0]
            last_para = this_chunk_paras[-1]
            end_para = last_para + para_to_count[last_para]
            sentences = get_sentences(conn, book_id, start_para, end_para)
            if len(sentences) < 10 and i + 1 < len(chunks):
                next_chunk_paras = chunks[i + 1]
                merged_paras = this_chunk_paras + next_chunk_paras
                new_chunks.append(merged_paras)
                i += 2
            else:
                new_chunks.append(this_chunk_paras)
                i += 1
        chunks = new_chunks
        # Update toc chunk_nums
        for k, chunk_paras_set in enumerate([set(c) for c in chunks]):
            for heading in toc:
                if heading['para_id'] in chunk_paras_set:
                    heading['chunk_num'] = k
        # Generate the main book file with TOC only
        main_toc = []
        for heading in toc:
            new_heading = heading.copy()
            new_heading['url'] = f"{book_id}_{new_heading['chunk_num']}#para-{new_heading['para_id']}"
            main_toc.append(new_heading)
        with open(os.path.join(OUTPUT_DIR, f"{book_id}.html"), 'w', encoding='utf-8') as f:
            content = book_template.render(
                book_title=book_name,
                book_id=book_id,
                toc=main_toc,
                sentences=[],
                bookref={},
                base_url='',
                request={},
                next_url=None
            )
            content = replace_book(content)
            f.write(content)
        # Generate chunk files
        for i, chunk_paras in enumerate(chunks):
            start_para = chunk_paras[0]
            last_para = chunk_paras[-1]
            end_para = last_para + para_to_count[last_para]
            sentences = get_sentences(conn, book_id, start_para, end_para)
           
            # Adjust TOC links for the current chunk
            chunk_toc = []
            for heading in toc:
                new_heading = heading.copy()
                if new_heading['chunk_num'] == i:
                    new_heading['url'] = f"#para-{new_heading['para_id']}"
                else:
                    new_heading['url'] = f"{book_id}_{new_heading['chunk_num']}.html#para-{new_heading['para_id']}"
                chunk_toc.append(new_heading)
            # Add next chunk link if not last
            next_url = f"{book_id}_{i+1}.html" if i + 1 < len(chunks) else None
            with open(os.path.join(OUTPUT_DIR, f"{book_id}_{i}.html"), 'w', encoding='utf-8') as f:
                content = book_template.render(
                    book_title=book_name,
                    book_id=book_id,
                    toc=chunk_toc,
                    sentences=[(s[0], s[1], markdown_to_html(s[2]), markdown_to_html(s[3]), markdown_to_html(s[4])) for s in sentences],
                    bookref={},
                    base_url='',
                    request={},
                    next_url=next_url
                )
                content = replace_book(content)
                f.write(content)
    conn.close()
if __name__ == '__main__':
    main()

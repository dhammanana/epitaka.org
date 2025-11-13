import sqlite3
import os
from jinja2 import Environment, FileSystemLoader
from app import is_numbered, markdown_to_html
import gdown
import tarfile
import shutil
from datetime import datetime

DB_PATH = 'temp_minimal.db'
OUTPUT_DIR = 'dist'
TEMPLATE_DIR = 'templates'

def setup_database():
    if os.path.exists(DB_PATH):
        return
    print("Database not found. Downloading and setting up...")
    file_id = '11lE7w1kuOD989q_Rxt7TpNhx9RP_VUBV'
    url = f'https://drive.google.com/uc?export=download&id={file_id}'
    tar_path = 'translations.tar.gz'
    gdown.download(url, output=tar_path, quiet=False)
    with tarfile.open(tar_path, 'r:gz') as tar:
        tar.extractall(path='.', filter='data')
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError("temp_minimal.db not found in archive")
    os.unlink(tar_path)
    print("Database setup complete.")

def url_for(endpoint, **values):
    if endpoint == 'static':
        return values.get('filename', '')
    return ""

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

def write_sitemap(output_dir, base_url, all_urls):
    sitemap_path = os.path.join(output_dir, 'sitemap.xml')
    lastmod = datetime.now().strftime('%Y-%m-%d')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for url in all_urls:
            if not url.startswith('/'): url = '/' + url
            full_url = base_url.rstrip('/') + url
            f.write(' <url>\n')
            f.write(f'  <loc>{full_url}</loc>\n')
            f.write(f'  <lastmod>{lastmod}</lastmod>\n')
            f.write('  <changefreq>monthly</changefreq>\n')
            f.write('  <priority>0.8</priority>\n')
            f.write(' </url>\n')
        f.write('</urlset>\n')
    print(f"Sitemap written with {len(all_urls)} URLs to {sitemap_path}")

# === DATABASE QUERIES ===
def get_books(conn):
    cur = conn.cursor()
    cur.execute("SELECT book_id, book_name, category, nikaya, sub_nikaya FROM books")
    return cur.fetchall()

def get_headings(conn, book_id):
    cur = conn.cursor()
    cur.execute(
        "SELECT para_id, heading_number, title, count_para FROM headings_with_count "
        "WHERE book_id = ? AND heading_number < 10 AND heading_number > 2 ORDER BY para_id",
        (book_id,)
    )
    return cur.fetchall()

def get_sentences(conn, book_id, start_para, end_para):
    cur = conn.cursor()
    cur.execute(
        "SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation "
        "FROM sentences WHERE book_id = ? AND para_id >= ? AND para_id < ? ORDER BY para_id, line_id",
        (book_id, start_para, end_para)
    )
    return cur.fetchall()

def organize_hierarchy(books):
    menu = {}
    for book_id, book_name, category, nikaya, sub_nikaya in books:
        menu.setdefault(category, {})
        menu[category].setdefault(nikaya, {})
        if sub_nikaya:
            menu[category][nikaya].setdefault(sub_nikaya, []).append((book_id, book_name))
        else:
            if not isinstance(menu[category][nikaya], list):
                menu[category][nikaya] = []
            menu[category][nikaya].append((book_id, book_name))
    return menu

# === OPTIMIZED CHUNKING (EXACT LOGIC, FAST) ===
def create_chunks_by_heading(conn, book_id, headings, min_paras=10, max_paras=300):
    if not headings:
        return []

    para_to_count = {h[0]: h[3] for h in headings}
    chunks = []
    current_section = []
    current_count = 0
    i = 0

    while i < len(headings):
        para_id, heading_number, title, count_para = headings[i]

        if heading_number == 3:
            # Find sub-headings
            sub_headings = []
            j = i + 1
            while j < len(headings) and headings[j][1] > 3:
                sub_headings.append(headings[j])
                j += 1

            section_total = count_para + sum(sh[3] for sh in sub_headings)

            if section_total <= max_paras:
                section_paras = [para_id] + [sh[0] for sh in sub_headings]
                if current_count + section_total <= max_paras:
                    current_section.extend(section_paras)
                    current_count += section_total
                else:
                    if current_section:
                        chunks.append(current_section)
                    current_section = section_paras
                    current_count = section_total
                i = j
            else:
                if current_section:
                    chunks.append(current_section)
                    current_section = []
                    current_count = 0

                if sub_headings:
                    temp_section = [para_id]
                    temp_count = count_para
                    for sh in sub_headings:
                        if temp_count + sh[3] > max_paras and temp_section:
                            chunks.append(temp_section)
                            temp_section = [sh[0]]
                            temp_count = sh[3]
                        else:
                            temp_section.append(sh[0])
                            temp_count += sh[3]
                    if temp_section:
                        chunks.append(temp_section)
                    i = j
                else:
                    # === EXACT SAME SPLIT LOGIC AS ORIGINAL ===
                    end_para = para_id + count_para
                    sentences = get_sentences(conn, book_id, para_id, end_para)
                    temp_chunk = []
                    for sentence in sentences:
                        temp_chunk.append(sentence)
                        if len(temp_chunk) >= max_paras:
                            para_ids = sorted({s[0] for s in temp_chunk})
                            chunks.append(para_ids)
                            temp_chunk = []
                    if temp_chunk:
                        para_ids = sorted({s[0] for s in temp_chunk})
                        chunks.append(para_ids)
                    i = j
        else:
            # heading_number <= 2
            if current_count + count_para <= max_paras:
                current_section.append(para_id)
                current_count += count_para
            else:
                if current_section:
                    chunks.append(current_section)
                current_section = [para_id]
                current_count = count_para
            i += 1

    if current_section:
        chunks.append(current_section)

    # === MERGE SMALL CHUNKS (EXACT LOGIC, BUT CACHED) ===
    # Pre-load all sentences for the entire book to avoid repeated DB calls
    first_para = headings[0][0]
    last_para = headings[-1][0] + headings[-1][3]
    all_sentences = get_sentences(conn, book_id, first_para, last_para)
    para_to_sentences = {}
    for s in all_sentences:
        para_to_sentences.setdefault(s[0], []).append(s)

    merged_chunks = []
    i = 0
    while i < len(chunks):
        chunk_paras = chunks[i]
        start_para = min(chunk_paras)
        end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
        sentences_in_chunk = [s for s in all_sentences if start_para <= s[0] < end_para]
        chunk_size = len(sentences_in_chunk)

        if chunk_size < min_paras and i + 1 < len(chunks):
            next_chunk_paras = chunks[i + 1]
            next_start = min(next_chunk_paras)
            next_end = max(next_chunk_paras) + para_to_count.get(max(next_chunk_paras), 1)
            next_sentences = [s for s in all_sentences if next_start <= s[0] < next_end]
            if chunk_size + len(next_sentences) <= max_paras:
                merged_chunks.append(chunk_paras + next_chunk_paras)
                i += 2
                continue
        merged_chunks.append(chunk_paras)
        i += 1

    return merged_chunks

# === INTEGRITY TEST (USING CACHED SENTENCES) ===
def test_chunk_integrity(conn, book_id, book_name, chunks, headings):
    if not headings:
        return True, "No headings found"

    first_para = headings[0][0]
    last_para = headings[-1][0] + headings[-1][3]
    total_sentences = get_sentences(conn, book_id, first_para, last_para)
    total_count = len(total_sentences)

    para_to_count = {h[0]: h[3] for h in headings}
    chunk_sentence_count = 0
    for chunk_paras in chunks:
        if not chunk_paras:
            continue
        start_para = min(chunk_paras)
        end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
        sentences = [s for s in total_sentences if start_para <= s[0] < end_para]
        chunk_sentence_count += len(sentences)

    if chunk_sentence_count == total_count:
        return True, f"✓ {book_name}: {total_count} sentences in book = {chunk_sentence_count} sentences in {len(chunks)} chunks"
    else:
        return False, f"✗ {book_name}: {total_count} sentences in book ≠ {chunk_sentence_count} sentences in {len(chunks)} chunks"

# === MAIN ===
def main():
    setup_database()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for f in os.listdir(OUTPUT_DIR):
        path = os.path.join(OUTPUT_DIR, f)
        if os.path.isfile(path):
            try: os.remove(path)
            except: pass

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    env.globals['url_for'] = url_for
    env.filters['is_numbered'] = is_numbered
    book_template = env.get_template('book_gen.html')
    index_template = env.get_template('index.html')

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode = OFF;")
    conn.execute("PRAGMA synchronous = OFF;")
    conn.execute("PRAGMA cache_size = 10000;")
    conn.execute("PRAGMA temp_store = MEMORY;")

    books = get_books(conn)
    menu_data = organize_hierarchy(books)
    shutil.copytree('static', OUTPUT_DIR, dirs_exist_ok=True)
    all_urls = []
    BASE_URL = 'https://epitaka.org'

    # Generate index.html and search.html
    for tmpl, name in [(index_template, 'index.html'), (index_template, 'search.html')]:
        with open(os.path.join(OUTPUT_DIR, name), 'w', encoding='utf-8') as f:
            content = tmpl.render(menu=menu_data, base_url='')
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
        all_urls.append(f'/{name}')

    # Prepare book_gen.html
    with open('templates/book.html', 'r', encoding='utf-8') as f:
        content = f.read().replace('#para-{{ heading.para_id }}', '{{ heading.url }}')
    with open('templates/book_gen.html', 'w', encoding='utf-8') as f:
        f.write(content)

    test_results = []

    for book_id, book_name, _, _, _ in books:
        print(f"\nProcessing: {book_id} - {book_name}")
        headings = get_headings(conn, book_id)
        if not headings:
            continue

        chunks = create_chunks_by_heading(conn, book_id, headings)
        is_valid, message = test_chunk_integrity(conn, book_id, book_name, chunks, headings)
        test_results.append((is_valid, message))
        print(message)

        if not chunks:
            continue

        para_to_count = {h[0]: h[3] for h in headings}

        # Build para_to_chunk map
        para_to_chunk = {}
        for idx, chunk in enumerate(chunks):
            for p in chunk:
                para_to_chunk[p] = idx

        # Build TOC
        toc = []
        for h in headings:
            para_id = h[0]
            chunk_num = para_to_chunk.get(para_id, 0)
            toc.append({
                'para_id': para_id,
                'level': h[1],
                'title': h[2],
                'chunk_num': chunk_num,
                'filename': f'{book_id}_{chunk_num}.html'
            })

        # Main book file
        main_toc = [dict(h, url=f"{book_id}_{h['chunk_num']}.html#para-{h['para_id']}") for h in toc]
        with open(os.path.join(OUTPUT_DIR, f"{book_id}.html"), 'w', encoding='utf-8') as f:
            content = book_template.render(
                book_title=book_name, book_id=book_id, toc=main_toc, sentences=[],
                bookref={}, base_url='', request={}, next_url=f"{book_id}_0.html" if chunks else None
            )
            f.write(replace_book(content))
        all_urls.append(f'/{book_id}.html')

        # Pre-load all sentences for this book
        first_para = headings[0][0]
        last_para = headings[-1][0] + headings[-1][3]
        all_book_sentences = get_sentences(conn, book_id, first_para, last_para)

        # Chunk files
        for i, chunk_paras in enumerate(chunks):
            start_para = min(chunk_paras)
            end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
            sentences = [s for s in all_book_sentences if start_para <= s[0] < end_para]

            print(f" Chunk {i}: {len(sentences)} sentences (para {start_para}-{end_para-1})")

            chunk_toc = [
                dict(h, url=f"#para-{h['para_id']}" if h['chunk_num'] == i else f"{book_id}_{h['chunk_num']}.html#para-{h['para_id']}")
                for h in toc
            ]

            next_url = f"{book_id}_{i+1}.html" if i + 1 < len(chunks) else None
            with open(os.path.join(OUTPUT_DIR, f"{book_id}_{i}.html"), 'w', encoding='utf-8') as f:
                content = book_template.render(
                    book_title=book_name, book_id=book_id, toc=chunk_toc,
                    sentences=[(s[0], s[1], markdown_to_html(s[2]), markdown_to_html(s[3]), markdown_to_html(s[4])) for s in sentences],
                    bookref={}, base_url='', request={}, next_url=next_url
                )
                f.write(replace_book(content))
            all_urls.append(f'/{book_id}_{i}.html')

    conn.close()
    write_sitemap(OUTPUT_DIR, BASE_URL, all_urls)

    print("\n" + "="*80)
    print("CHUNK INTEGRITY TEST RESULTS")
    print("="*80)
    passed = sum(1 for v, _ in test_results if v)
    for v, msg in test_results:
        print(msg)
    print("="*80)
    print(f"Total: {passed}/{len(test_results)} books passed integrity test")
    print("="*80)
    print("\nBuild complete!")

if __name__ == '__main__':
    main()

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
from datetime import datetime

DB_PATH = 'temp_minimal.db'
OUTPUT_DIR = 'dist'
TEMPLATE_DIR = 'templates'

# ----------------------------------------------------------------------
# 1. DATABASE SETUP (unchanged except for PRAGMAs)
# ----------------------------------------------------------------------
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

# ----------------------------------------------------------------------
# 2. HELPERS (unchanged)
# ----------------------------------------------------------------------
def url_for(endpoint, **values):
    if endpoint == 'static':
        return values.get('filename', '')
    return ""

def replace_book(content: str) -> str:
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
            if not url.startswith('/'):
                url = '/' + url
            full_url = base_url.rstrip('/') + url
            f.write(' <url>\n')
            f.write(f'  <loc>{full_url}</loc>\n')
            f.write(f'  <lastmod>{lastmod}</lastmod>\n')
            f.write('  <changefreq>monthly</changefreq>\n')
            f.write('  <priority>0.8</priority>\n')
            f.write(' </url>\n')
        f.write('</urlset>\n')
    print(f"Sitemap written with {len(all_urls)} URLs to {sitemap_path}")

# ----------------------------------------------------------------------
# 3. FAST DATABASE QUERIES
# ----------------------------------------------------------------------
def get_books(conn):
    cur = conn.execute("SELECT book_id, book_name, category, nikaya, sub_nikaya FROM books")
    return cur.fetchall()

def get_headings(conn, book_id):
    cur = conn.execute(
        """SELECT para_id, heading_number, title, count_para
           FROM headings_with_count
           WHERE book_id = ? AND heading_number BETWEEN 3 AND 9
           ORDER BY para_id""", (book_id,))
    return cur.fetchall()

def load_all_sentences_for_book(conn, book_id, first_para, last_para_plus_one):
    cur = conn.execute(
        """SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
           FROM sentences
           WHERE book_id = ? AND para_id >= ? AND para_id < ?
           ORDER BY para_id, line_id""",
        (book_id, first_para, last_para_plus_one))
    return cur.fetchall()

# ----------------------------------------------------------------------
# 4. HIERARCHY & MENU (unchanged)
# ----------------------------------------------------------------------
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

# ----------------------------------------------------------------------
# 5. OPTIMIZED CHUNK CREATION
# ----------------------------------------------------------------------
def create_chunks_by_heading(conn, book_id, headings, min_paras=10, max_paras=300):
    if not headings:
        return []

    # ----- 1. Load *all* sentences for the book once -----
    first_para = headings[0][0]
    last_para = headings[-1][0]
    last_count = headings[-1][3]
    all_sentences = load_all_sentences_for_book(conn, book_id, first_para, last_para + last_count)

    # Map para_id → list of its sentences
    para_to_sentences = {}
    for s in all_sentences:
        para_to_sentences.setdefault(s[0], []).append(s)

    # para_id → count (from headings)
    para_to_count = {h[0]: h[3] for h in headings}

    # ----- 2. Build chunks using the in-memory maps -----
    chunks = []               # list of [para_id, ...]
    current = []              # current chunk para list
    cur_cnt = 0               # sentence count of current chunk

    i = 0
    while i < len(headings):
        para_id, hnum, _title, cnt = headings[i]

        # ---- headings 1-2 (intro) ----
        if hnum <= 2:
            if cur_cnt + cnt <= max_paras:
                current.append(para_id)
                cur_cnt += cnt
            else:
                if current:
                    chunks.append(current)
                current = [para_id]
                cur_cnt = cnt
            i += 1
            continue

        # ---- heading 3 (main section) ----
        # collect sub-headings (hnum > 3)
        sub_headings = []
        j = i + 1
        while j < len(headings) and headings[j][1] > 3:
            sub_headings.append(headings[j])
            j += 1

        # total sentences for the whole section
        section_total = cnt
        for sh in sub_headings:
            section_total += sh[3]

        if section_total <= max_paras:
            # keep whole section together
            section_paras = [para_id] + [sh[0] for sh in sub_headings]
            if cur_cnt + section_total <= max_paras:
                current.extend(section_paras)
                cur_cnt += section_total
            else:
                if current:
                    chunks.append(current)
                current = section_paras
                cur_cnt = section_total
            i = j
        else:
            # ---- too large → split ----
            if current:
                chunks.append(current)
                current = []
                cur_cnt = 0

            if sub_headings:
                # split by sub-headings
                temp = [para_id]
                tcnt = cnt
                for sh in sub_headings:
                    if tcnt + sh[3] > max_paras and temp:
                        chunks.append(temp)
                        temp = [sh[0]]
                        tcnt = sh[3]
                    else:
                        temp.append(sh[0])
                        tcnt += sh[3]
                if temp:
                    chunks.append(temp)
            else:
                # split by raw sentences (max_paras per chunk)
                start = para_id
                end = para_id + cnt
                secs = all_sentences[all_sentences.index(
                    next(s for s in all_sentences if s[0] >= start)): ]
                secs = [s for s in secs if s[0] < end]

                temp = []
                for s in secs:
                    temp.append(s)
                    if len(temp) >= max_paras:
                        para_set = sorted({s[0] for s in temp})
                        chunks.append(para_set)
                        temp = []
                if temp:
                    chunks.append(sorted({s[0] for s in temp}))
            i = j

    if current:
        chunks.append(current)

    # ----- 3. Merge tiny chunks (< min_paras) -----
    merged = []
    i = 0
    while i < len(chunks):
        chunk = chunks[i]
        # size from pre-loaded map
        size = sum(len(para_to_sentences.get(p, [])) for p in chunk)

        if size < min_paras and i + 1 < len(chunks):
            nxt = chunks[i + 1]
            nxt_size = sum(len(para_to_sentences.get(p, [])) for p in nxt)
            if size + nxt_size <= max_paras:
                merged.append(chunk + nxt)
                i += 2
                continue
        merged.append(chunk)
        i += 1

    return merged

# ----------------------------------------------------------------------
# 6. INTEGRITY TEST – now O(1) per chunk
# ----------------------------------------------------------------------
def test_chunk_integrity(conn, book_id, book_name, chunks, headings):
    if not headings:
        return True, "No headings found"

    first_para = headings[0][0]
    last_para = headings[-1][0]
    last_cnt = headings[-1][3]

    # Load once (same call as in chunk creation)
    all_sentences = load_all_sentences_for_book(conn, book_id, first_para, last_para + last_cnt)
    total = len(all_sentences)

    # Build para → sentences map (re-use if you want, but cheap here)
    para_to_sentences = {}
    for s in all_sentences:
        para_to_sentences.setdefault(s[0], []).append(s)

    counted = 0
    for chunk in chunks:
        counted += sum(len(para_to_sentences.get(p, [])) for p in chunk)

    if counted == total:
        return True, f"✓ {book_name}: {total} sentences in book = {counted} sentences in {len(chunks)} chunks"
    else:
        return False, f"✗ {book_name}: {total} sentences in book ≠ {counted} sentences in {len(chunks)} chunks"

# ----------------------------------------------------------------------
# 7. MAIN – only the slow parts changed
# ----------------------------------------------------------------------
def main():
    setup_database()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for f in os.listdir(OUTPUT_DIR):
        path = os.path.join(OUTPUT_DIR, f)
        try:
            if os.path.isfile(path):
                os.remove(path)
        except Exception:
            pass

    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    env.globals['url_for'] = url_for
    env.filters['is_numbered'] = is_numbered
    book_template = env.get_template('book_gen.html')
    index_template = env.get_template('index.html')
    search_template = env.get_template('search.html')

    # ---- DB with speed PRAGMAs ----
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = OFF;")
    conn.execute("PRAGMA synchronous = OFF;")
    conn.execute("PRAGMA cache_size = 10000;")
    conn.execute("PRAGMA temp_store = MEMORY;")

    books = get_books(conn)
    menu_data = organize_hierarchy(books)
    shutil.copytree('static', OUTPUT_DIR, dirs_exist_ok=True)

    all_urls = []
    BASE_URL = 'https://yourdomain.com'   # <-- change to your domain

    # ---- index.html & search.html (unchanged logic) ----
    for tmpl, fname in [(index_template, 'index.html'), (search_template, 'search.html')]:
        with open(os.path.join(OUTPUT_DIR, fname), 'w', encoding='utf-8') as f:
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
        all_urls.append('/' + fname)

    # ---- prepare a temporary book_gen.html (unchanged) ----
    src = os.path.join(TEMPLATE_DIR, 'book.html')
    dst = os.path.join(TEMPLATE_DIR, 'book_gen.html')
    with open(src, encoding='utf-8') as f:
        content = f.read().replace('#para-{{ heading.para_id }}', '{{ heading.url }}')
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)

    test_results = []

    # ------------------------------------------------------------------
    #  BOOK GENERATION LOOP – now fast
    # ------------------------------------------------------------------
    for book_id, book_name, _, _, _ in books:
        print(f"\nProcessing: {book_id} - {book_name}")
        headings = get_headings(conn, book_id)
        if not headings:
            continue

        chunks = create_chunks_by_heading(conn, book_id, headings, min_paras=10, max_paras=300)

        is_valid, msg = test_chunk_integrity(conn, book_id, book_name, chunks, headings)
        test_results.append((is_valid, msg))
        print(msg)

        if not chunks:
            continue

        # ---- para → chunk index (O(1) lookup) ----
        para_to_chunk = {}
        for idx, chunk in enumerate(chunks):
            for p in chunk:
                para_to_chunk[p] = idx

        # ---- TOC (once per book) ----
        toc = []
        for h in headings:


            para_id = h[0]
            toc.append({
                'para_id': para_id,
                'level': h[1],
                'title': h[2],
                'chunk_num': para_to_chunk.get(para_id, 0),
                'filename': f'{book_id}_{para_to_chunk.get(para_id, 0)}.html'
            })

        # ---- main book page (TOC only) ----
        main_toc = []
        for h in toc:
            d = h.copy()
            d['url'] = f"{book_id}_{d['chunk_num']}.html#para-{d['para_id']}"
            main_toc.append(d)

        with open(os.path.join(OUTPUT_DIR, f"{book_id}.html"), 'w', encoding='utf-8') as f:
            content = book_template.render(
                book_title=book_name,
                book_id=book_id,
                toc=main_toc,
                sentences=[],
                bookref={},
                base_url='',
                request={},
                next_url=f"{book_id}_0.html" if chunks else None
            )
            f.write(replace_book(content))
        all_urls.append(f'/{book_id}.html')

        # ---- chunk pages ----
        para_to_count = {h[0]: h[3] for h in headings}
        # Pre-load *all* sentences for the whole book (already done inside create_chunks)
        first_para = headings[0][0]
        last_para = headings[-1][0] + headings[-1][3]
        all_sentences = load_all_sentences_for_book(conn, book_id, first_para, last_para)

        # Build a para → list of its sentences (once)
        para_sentences = {}
        for s in all_sentences:
            para_sentences.setdefault(s[0], []).append(s)

        for i, chunk_paras in enumerate(chunks):
            start_para = min(chunk_paras)
            end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
            sentences = [s for p in chunk_paras for s in para_sentences.get(p, [])]

            print(f" Chunk {i}: {len(sentences)} sentences (para {start_para}-{end_para-1})")

            # TOC for this chunk
            chunk_toc = []
            for h in toc:
                d = h.copy()
                if d['chunk_num'] == i:
                    d['url'] = f"#para-{d['para_id']}"
                else:
                    d['url'] = f"{book_id}_{d['chunk_num']}.html#para-{d['para_id']}"
                chunk_toc.append(d)

            next_url = f"{book_id}_{i+1}.html" if i + 1 < len(chunks) else None

            with open(os.path.join(OUTPUT_DIR, f"{book_id}_{i}.html"), 'w', encoding='utf-8') as f:
                content = book_template.render(
                    book_title=book_name,
                    book_id=book_id,
                    toc=chunk_toc,
                    sentences=[(s[0], s[1],
                                markdown_to_html(s[2]),
                                markdown_to_html(s[3]),
                                markdown_to_html(s[4])) for s in sentences],
                    bookref={},
                    base_url='',
                    request={},
                    next_url=next_url
                )
                f.write(replace_book(content))

            all_urls.append(f'/{book_id}_{i}.html')

    conn.close()

    write_sitemap(OUTPUT_DIR, BASE_URL, all_urls)

    # ---- summary ----
    print("\n" + "="*80)
    print("CHUNK INTEGRITY TEST RESULTS")
    print("="*80)
    passed = sum(1 for ok, _ in test_results if ok)
    for ok, msg in test_results:
        print(msg)
    print("="*80)
    print(f"Total: {passed}/{len(test_results)} books passed integrity test")
    print("="*80)
    print("\nBuild complete!")

if __name__ == '__main__':
    main()

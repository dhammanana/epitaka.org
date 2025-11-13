import sqlite3
import os
import re
from jinja2 import Environment, FileSystemLoader
from app import is_numbered, markdown_to_html
import requests
import tarfile
import subprocess
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
        filename = values.get('filename', '')
        return f'{filename}'
    return ""

def get_books(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT book_id, book_name, category, nikaya, sub_nikaya FROM books")
    return cursor.fetchall()

def get_headings(conn, book_id):
    cursor = conn.cursor()
    cursor.execute("SELECT para_id, heading_number, title, count_para FROM headings_with_count WHERE book_id = ? AND heading_number < 10 and heading_number > 2 ORDER BY para_id", (book_id,))
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

def write_sitemap(output_dir, base_url, all_urls):
    """
    Write sitemap.xml file with all generated URLs.
    
    Args:
        output_dir: Directory to write sitemap to
        base_url: Base URL of the site (e.g., 'https://example.com')
        all_urls: List of relative URLs to include in sitemap
    """
    from datetime import datetime
    
    sitemap_path = os.path.join(output_dir, 'sitemap.xml')
    lastmod = datetime.now().strftime('%Y-%m-%d')
    
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        
        for url in all_urls:
            # Ensure URL starts with /
            if not url.startswith('/'):
                url = '/' + url
            
            full_url = base_url.rstrip('/') + url
            
            f.write('  <url>\n')
            f.write(f'    <loc>{full_url}</loc>\n')
            f.write(f'    <lastmod>{lastmod}</lastmod>\n')
            f.write('    <changefreq>monthly</changefreq>\n')
            f.write('    <priority>0.8</priority>\n')
            f.write('  </url>\n')
        
        f.write('</urlset>\n')
    
    print(f"Sitemap written with {len(all_urls)} URLs to {sitemap_path}")

def create_chunks_by_heading(conn, book_id, headings, min_paras=10, max_paras=300):
    """
    Create chunks based on heading hierarchy.
    - Keep heading_number <= 3 together when possible
    - Split heading_number = 3 sections if they exceed max_paras
    - Only split by line count if no sub-headings exist
    
    Returns: List of chunks where each chunk is a list of para_ids
    """
    if not headings:
        return []
    
    para_to_count = {h[0]: h[3] for h in headings}
    
    # Group headings by their hierarchy
    chunks = []
    current_section = []  # Will hold para_ids for current section
    current_count = 0
    
    i = 0
    while i < len(headings):
        para_id, heading_number, title, count_para = headings[i]
        
        # heading_number 3 is the main content section
        if heading_number == 3:
            # Find all sub-headings (heading_number > 3) that belong to this section
            sub_headings = []
            j = i + 1
            while j < len(headings) and headings[j][1] > 3:
                sub_headings.append(headings[j])
                j += 1
            
            # Calculate total count for this section
            section_total = count_para
            for sh in sub_headings:
                section_total += sh[3]
            
            # If section fits in max_paras, keep it together
            if section_total <= max_paras:
                # Add the whole section
                section_paras = [para_id]
                for sh in sub_headings:
                    section_paras.append(sh[0])
                
                # Check if we can add to current chunk
                if current_count + section_total <= max_paras:
                    current_section.extend(section_paras)
                    current_count += section_total
                else:
                    # Save current chunk and start new one
                    if current_section:
                        chunks.append(current_section)
                    current_section = section_paras
                    current_count = section_total
                
                i = j  # Skip the sub-headings we just processed
            else:
                # Section is too large, need to split
                # Save current chunk first
                if current_section:
                    chunks.append(current_section)
                    current_section = []
                    current_count = 0
                
                # If there are sub-headings, split by sub-headings
                if sub_headings:
                    # Start a new chunk with the main heading
                    temp_section = [para_id]
                    temp_count = count_para
                    
                    for sh in sub_headings:
                        sh_para_id, sh_heading_number, sh_title, sh_count_para = sh
                        
                        # If adding this sub-heading exceeds max, save current and start new
                        if temp_count + sh_count_para > max_paras and temp_section:
                            chunks.append(temp_section)
                            temp_section = [sh_para_id]
                            temp_count = sh_count_para
                        else:
                            temp_section.append(sh_para_id)
                            temp_count += sh_count_para
                    
                    # Save the last temp section
                    if temp_section:
                        chunks.append(temp_section)
                    
                    i = j
                else:
                    # No sub-headings, split by actual paragraphs (300 lines each)
                    # Get all sentences for this section
                    end_para = para_id + count_para
                    sentences = get_sentences(conn, book_id, para_id, end_para)
                    
                    # Split into chunks of max_paras sentences
                    temp_chunk_sentences = []
                    for sentence in sentences:
                        temp_chunk_sentences.append(sentence)
                        if len(temp_chunk_sentences) >= max_paras:
                            # Extract para_ids from this chunk
                            para_ids_in_chunk = sorted(list(set([s[0] for s in temp_chunk_sentences])))
                            chunks.append(para_ids_in_chunk)
                            temp_chunk_sentences = []
                    
                    # Add remaining sentences
                    if temp_chunk_sentences:
                        para_ids_in_chunk = sorted(list(set([s[0] for s in temp_chunk_sentences])))
                        chunks.append(para_ids_in_chunk)
                    
                    i = j
        else:
            # heading_number <= 2, just accumulate
            if current_count + count_para <= max_paras:
                current_section.append(para_id)
                current_count += count_para
            else:
                if current_section:
                    chunks.append(current_section)
                current_section = [para_id]
                current_count = count_para
            i += 1
    
    # Add the last section
    if current_section:
        chunks.append(current_section)
    
    # Merge small chunks (< min_paras)
    merged_chunks = []
    i = 0
    while i < len(chunks):
        chunk_paras = chunks[i]
        
        # Calculate actual sentence count
        start_para = min(chunk_paras)
        end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
        sentences = get_sentences(conn, book_id, start_para, end_para)
        chunk_size = len(sentences)
        
        # If chunk is too small and there's a next chunk, try to merge
        if chunk_size < min_paras and i + 1 < len(chunks):
            next_chunk_paras = chunks[i + 1]
            next_start = min(next_chunk_paras)
            next_end = max(next_chunk_paras) + para_to_count.get(max(next_chunk_paras), 1)
            next_sentences = get_sentences(conn, book_id, next_start, next_end)
            
            # Only merge if combined size doesn't exceed max
            if chunk_size + len(next_sentences) <= max_paras:
                merged_paras = chunk_paras + next_chunk_paras
                merged_chunks.append(merged_paras)
                i += 2
            else:
                merged_chunks.append(chunk_paras)
                i += 1
        else:
            merged_chunks.append(chunk_paras)
            i += 1
    
    return merged_chunks

def test_chunk_integrity(conn, book_id, book_name, chunks, headings):
    """
    Test that all chunks together contain exactly the same number of sentences as the book.
    """
    para_to_count = {h[0]: h[3] for h in headings}
    
    # Get total sentences in book
    if not headings:
        return True, "No headings found"
    
    first_para = headings[0][0]
    last_para = headings[-1][0]
    last_count = headings[-1][3]
    total_sentences = get_sentences(conn, book_id, first_para, last_para + last_count)
    total_count = len(total_sentences)
    
    # Count sentences in all chunks
    chunk_sentence_count = 0
    all_chunk_para_ids = set()
    
    for i, chunk_paras in enumerate(chunks):
        if not chunk_paras:
            continue
        start_para = min(chunk_paras)
        end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
        sentences = get_sentences(conn, book_id, start_para, end_para)
        chunk_sentence_count += len(sentences)
        
        # Track para_ids
        for s in sentences:
            all_chunk_para_ids.add(s[0])
    
    # Check if counts match
    if chunk_sentence_count == total_count:
        return True, f"✓ {book_name}: {total_count} sentences in book = {chunk_sentence_count} sentences in {len(chunks)} chunks"
    else:
        return False, f"✗ {book_name}: {total_count} sentences in book ≠ {chunk_sentence_count} sentences in {len(chunks)} chunks"

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

    # Track all URLs for sitemap
    all_urls = []
    
    # Set your base URL here
    BASE_URL = 'https://yourdomain.com'  # Change this to your actual domain

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
    
    all_urls.append('/index.html')

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
    
    all_urls.append('/search.html')

    # Prepare book template
    src = 'templates/book.html'
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('#para-{{ heading.para_id }}', '{{ heading.url }}')
    dst = 'templates/book_gen.html'
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)

    # Test results
    test_results = []
    
    # Generate books
    for book_id, book_name, _, _, _ in books:
        print(f"\nProcessing: {book_id} - {book_name}")
        headings = get_headings(conn, book_id)
        if not headings:
            continue
        
        # Create chunks with heading-based algorithm
        chunks = create_chunks_by_heading(conn, book_id, headings, min_paras=10, max_paras=300)
        
        # Test chunk integrity
        is_valid, message = test_chunk_integrity(conn, book_id, book_name, chunks, headings)
        test_results.append((is_valid, message))
        print(message)
        
        if not chunks:
            continue
        
        para_to_count = {h[0]: h[3] for h in headings}
        
        # Build TOC with chunk assignments
        toc = []
        for para_id, heading_number, title, count_para in headings:
            # Find which chunk this para_id belongs to
            chunk_num = 0
            for i, chunk_paras in enumerate(chunks):
                if para_id in chunk_paras:
                    chunk_num = i
                    break
            
            toc.append({
                'para_id': para_id,
                'level': heading_number,
                'title': title,
                'chunk_num': chunk_num,
                'filename': f'{book_id}_{chunk_num}.html'
            })
        
        # Generate the main book file with TOC only (no content)
        main_toc = []
        for heading in toc:
            new_heading = heading.copy()
            new_heading['url'] = f"{book_id}_{new_heading['chunk_num']}.html#para-{new_heading['para_id']}"
            main_toc.append(new_heading)
        
        with open(os.path.join(OUTPUT_DIR, f"{book_id}.html"), 'w', encoding='utf-8') as f:
            content = book_template.render(
                book_title=book_name,
                book_id=book_id,
                toc=main_toc,
                sentences=[],  # No content in main file
                bookref={},
                base_url='',
                request={},
                next_url=f"{book_id}_0.html" if chunks else None
            )
            content = replace_book(content)
            f.write(content)
        
        all_urls.append(f'/{book_id}.html')
        
        # Generate chunk files
        for i, chunk_paras in enumerate(chunks):
            start_para = min(chunk_paras)
            end_para = max(chunk_paras) + para_to_count.get(max(chunk_paras), 1)
            sentences = get_sentences(conn, book_id, start_para, end_para)
            
            print(f"  Chunk {i}: {len(sentences)} sentences (para_ids: {start_para}-{end_para-1})")
            
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
            
            all_urls.append(f'/{book_id}_{i}.html')
    
    conn.close()
    
    # Generate sitemap
    write_sitemap(OUTPUT_DIR, BASE_URL, all_urls)
    
    # Print test summary
    print("\n" + "="*80)
    print("CHUNK INTEGRITY TEST RESULTS")
    print("="*80)
    passed = sum(1 for valid, _ in test_results if valid)
    total = len(test_results)
    for valid, message in test_results:
        print(message)
    print("="*80)
    print(f"Total: {passed}/{total} books passed integrity test")
    print("="*80)
    
    print("\nBuild complete!")

if __name__ == '__main__':
    main()

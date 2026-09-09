''' convert markdown file to database '''

import unicodedata
import sqlite3
import os
import json
import re
from pathlib import Path
import subprocess

def create_database(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sentences (
            book_id TEXT,
            para_id INTEGER,
            line_id INTEGER,
            pali_sentence TEXT,
            translation_sentence TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS headings (
            book_id TEXT,
            para_id INTEGER,
            heading_number INTEGER,
            title TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts USING fts5(
            book_id UNINDEXED,
            para_id UNINDEXED,
            pali_paragraph,
            translation_paragraph
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_book_id ON sentences (book_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_para_id ON sentences (para_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_line_id ON sentences (line_id)')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_headings_book_id ON headings (book_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_headings_para_id ON headings (para_id)')
    
    conn.commit()
    return conn, cursor

def parse_markdown_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    paras = {}
    paragraphs = content.split('\n\n')
    para_id = 1
    

    sentence_splitter = re.compile(r'(?<=[.!?])(?<!\d[.!?])(?<![0-9]`[.!?])\s+(?![^(]*\))(?![^\[]*\])')

    for para in paragraphs:
        if para.strip():
            para = para.replace('. (', '.(').replace('. –', '–')
            sentences = sentence_splitter.split(para.strip())
            sentences = [s.strip() for s in sentences if s.strip()]
            paras[str(para_id)] = {str(i): s for i, s in enumerate(sentences, 1)}
            para_id += 1
    
    return paras

def extract_headings_from_markdown(file_path):
    headings = []
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    paragraphs = content.split('\n\n')
    para_id = 1
    
    for para in paragraphs:
        if para.strip():
            lines = para.strip().split('\n')
            for line in lines:
                line = line.strip()
                heading_match = re.match(r'#+', line)
                if heading_match:
                    heading_level = len(heading_match.group())
                    title = line[heading_level:].strip()
                    headings.append((str(para_id), heading_level, title))
                number_match = re.match(r'^`(\d+)(?:-(\d+))?`', line)
                if number_match:
                    heading_level = 10
                    start_num = int(number_match.group(1))
                    end_num = int(number_match.group(2)) if number_match.group(2) else start_num
                    for num in range(start_num, end_num + 1):
                        title = str(num)
                        headings.append((str(para_id), heading_level, title))
                elif re.match(r'^`[^`]+`', line):
                    print(f"Non-numeric content in backticks: {line}")
            para_id += 1
    
    return headings

def normalize_pali(text):
    nfkd_form = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd_form if not unicodedata.combining(c))

def process_files(pali_file, book_id, cursor):
    print(f'Processing files: {pali_file}')
    pali_paras = parse_markdown_file(pali_file)
    headings = extract_headings_from_markdown(pali_file)
    
    for para_id, heading_number, title in headings:
        cursor.execute('''
            INSERT INTO headings (book_id, para_id, heading_number, title)
            VALUES (?, ?, ?, ?)
        ''', (book_id, para_id, heading_number, title))
    
    for para_id in pali_paras:
        pali_lines = pali_paras.get(para_id, {})
        
        pali_para_text = ' '.join(pali_lines.get(line_id, '').strip() for line_id in pali_lines if pali_lines.get(line_id, '').strip())
        
        if pali_para_text:
            cursor.execute('''
                INSERT INTO sentences_fts (book_id, para_id, pali_paragraph, translation_paragraph)
                VALUES (?, ?, ?, ?)
            ''', (book_id, para_id, pali_para_text, ''))
        
        for line_id in pali_lines:
            pali_text = pali_lines.get(line_id, '').strip()
            if pali_text: 
                cursor.execute('''
                    INSERT INTO sentences (book_id, para_id, line_id, pali_sentence, translation_sentence)
                    VALUES (?, ?, ?, ?, ?)
                ''', (book_id, para_id, line_id, pali_text, ''))

def create_sqlite_insert(json_file, db_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    cursor.execute('DROP TABLE IF EXISTS books')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER,
            book_id TEXT,
            category TEXT,
            nikaya TEXT,
            sub_nikaya TEXT,
            book_name TEXT,
            mula_ref TEXT,
            attha_ref TEXT,
            tika_ref TEXT,
            PRIMARY KEY(book_id)
        )
    ''')
    
    for item in data:
        index = item['Index']
        file_name = item['FileName'].replace('.md', '') if item['FileName'] else None
        long_nav = item['LongNavPath'].split(' > ')
        category = long_nav[0].replace('Tipiṭaka (mūla)', 'Mūla') if long_nav else ''
        nikaya = long_nav[1].replace(' (aṭṭhakathā)', '').replace(' (ṭīkā)', '') if len(long_nav) > 1 else ''
        sub_nikaya = long_nav[2].replace(' (aṭṭhakathā)', '').replace(' (ṭīkā)', '') if len(long_nav) > 3 else ''
        book_name = long_nav[-1] if len(long_nav) > 2 else ''
        
        mula_ref = item['MulaIndex'].replace('.md', '') if item['MulaIndex'] else None
        attha_ref = item['AtthakathaIndex'].replace('.md', '') if item['AtthakathaIndex'] else None
        tika_ref = item['TikaIndex'].replace('.md', '') if item['TikaIndex'] else None
        
        cursor.execute('''
            INSERT OR REPLACE INTO books (
                id, book_id, category, nikaya, sub_nikaya, book_name,
                mula_ref, attha_ref, tika_ref
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            index, file_name, category, nikaya, sub_nikaya, book_name,
            mula_ref, attha_ref, tika_ref
        ))
    
    conn.commit()
    conn.close()

def main():
    current_dir = Path(__file__).parent
    pali_folder = Path(current_dir, '../tipitaka_md')
    db_name = 'test_translations.db'
    
    if os.path.exists(db_name):
        os.remove(db_name)
    conn, cursor = create_database(db_name)
    
    for pali_file in Path(pali_folder).glob('*.md'):
        book_id = pali_file.stem
        process_files(pali_file, book_id, cursor)
    
    conn.commit()
    conn.close()
    
    create_sqlite_insert('books.json', db_name)
    
    src_db = os.path.expanduser('~/.var/app/org.americanmonk.TipitakaPaliReader/data/tipitaka_pali_reader/tipitaka_pali.db')
    dst_db = 'test_translations.db'
    cmd = f'sqlite3 "{src_db}" ".dump words" | sqlite3 "{dst_db}"'
    subprocess.run(cmd, shell=True, check=True)

if __name__ == '__main__':
    main()
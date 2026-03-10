import re
import json
import sqlite3
from pathlib import Path
from convert2db import normalize_pali
import os

def markdown_to_html(text):
    if not text:
        return ''
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    for i in range(6, 0, -1):
        pattern = r'^' + r'\#' * i + r' (.*)$'
        repl = r'<h{0}>\1</h{0}>'.format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = re.sub(r'\\(\[.*?\])', r'\1', text)
    return text

with open('hierarchy_main_vri.json', 'r', encoding='utf-8') as f:
    hierarchy = json.load(f)

def generate_book_files(book_id):
    book_id = book_id.replace('.xml', '')
    conn = sqlite3.connect('translations.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT para_id, heading_number, title
        FROM headings
        WHERE book_id = ? AND heading_number <= 6
        ORDER BY para_id
    ''', (book_id,))
    headings = cursor.fetchall()
    
    toc = []
    os.makedirs(f'static/books/{book_id}', exist_ok=True)

    for para_id, heading_number, title in headings:
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
        ''', (book_id, para_id, book_id, para_id))
        para_count = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT para_id, line_id, pali_sentence, vietnamese_sentence
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
        
        content = []
        current_para = None
        for s in sentences:
            para_id_s, line_id, pali, vietnamese = s
            if para_id_s != current_para:
                if current_para is not None:
                    content.append(para_content)
                para_content = {'para_id': para_id_s, 'sentences': []}
                current_para = para_id_s
            para_content['sentences'].append({
                'line_id': line_id,
                'pali': markdown_to_html(pali),
                'vietnamese': markdown_to_html(vietnamese)
            })
        if current_para is not None:
            content.append(para_content)
        
        
        with open(f'static/books/{book_id}/{para_id}.json', 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False)
        
        toc.append({'para_id': para_id, 'level': heading_number, 'title': title, 'para_count': para_count})
    
    with open(f'static/books/{book_id}/toc.json', 'w', encoding='utf-8') as f:
        json.dump(toc, f, ensure_ascii=False)
    
    conn.close()

if __name__ == '__main__':
    for book_id in hierarchy.keys():
        generate_book_files(book_id)
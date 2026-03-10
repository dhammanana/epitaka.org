import sqlite3
import os
from ..utils.text import markdown_to_html, trim_text
from ..utils.db import get_db

# ─────────────────────────────────────────────
# Database Helpers
# ─────────────────────────────────────────────

def load_hierarchy():
    """Load all book metadata from the books table."""

    with get_db() as conn:
      cursor = conn.cursor()
      cursor.execute('''
          SELECT book_id, category, nikaya, sub_nikaya, book_name, mula_ref, attha_ref, tika_ref
          FROM books
      ''')
      rows = cursor.fetchall()
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



import sqlite3
import os
from ..utils.text import markdown_to_html, trim_text
from ..utils.db import get_db

# ─────────────────────────────────────────────
# Database Helpers
# ─────────────────────────────────────────────

def _parse_ref_list(value):
    """
    Parse a stored ref field into a list of book_id strings.

    The field may be:
      - NULL / empty             → []
      - a single book_id         → [book_id]
      - a space-separated string → [book_id, ...]
    """
    if value is None:
        return []
    return [p.strip() for p in str(value).split(' ') if p.strip()]


def load_hierarchy():
    """
    Load all book metadata from the books table.

    The returned dict is keyed by book_id.  The ref fields
    (mula_ref, attha_ref, tika_ref) are stored directly as
    space-separated book_id strings, so no id resolution is needed.

    Each entry also exposes the new para_id and chapter_len fields
    introduced when large books were split.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, book_id, category, nikaya, sub_nikaya, book_name,
                   mula_ref, attha_ref, tika_ref,
                   para_id, chapter_len
            FROM books
            ORDER BY id
        ''')
        rows = cursor.fetchall()

    hierarchy = {}
    for row in rows:
        hierarchy[row['book_id']] = {
            'id':          row['id'],
            'category':    row['category'],
            'nikaya':      row['nikaya'],
            'sub_nikaya':  row['sub_nikaya'],
            'book_name':   row['book_name'],
            'mula_ref':    _parse_ref_list(row['mula_ref']),
            'attha_ref':   _parse_ref_list(row['attha_ref']),
            'tika_ref':    _parse_ref_list(row['tika_ref']),
            # New split-book fields
            'para_id':     row['para_id'],
            'chapter_len': row['chapter_len'],
        }

    return hierarchy


def organize_hierarchy(hierarchy):
    """Organize books into a nested menu structure."""
    menu = {}
    for book_id, book_data in hierarchy.items():
        category   = book_data['category']
        nikaya     = book_data['nikaya']
        sub_nikaya = book_data['sub_nikaya']
        book_name  = book_data['book_name']

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
            'pali':    markdown_to_html(r['pali_sentence']),
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
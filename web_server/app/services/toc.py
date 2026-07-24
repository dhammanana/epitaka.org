# app/services/toc.py
"""
Table-of-contents and sentence fetching helpers.
Works with the new epitaka.db schema where:
  - headings table uses `level` instead of `heading_number`
  - sentences table uses `pali` instead of `pali_sentence`
  - translation databases use `translation` instead of `english_translation`
"""

from ..utils.text import markdown_to_html
from ..utils.db import get_db, get_translation_db


def get_book_toc(book_id, conn):
    """Fetch table of contents (headings) for a book."""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, level, title
        FROM headings
        WHERE book_id = ? AND level <= 6
        ORDER BY para_id
    ''', (book_id,))
    rows = cursor.fetchall()
    return [
        {
            'para_id': row['para_id'],
            'level': row['level'],
            'title': row['title'],
        }
        for row in rows
    ]


def get_section_sentences(book_id, para_id, conn, lang_code=None):
    """
    Fetch Pāli sentences for a TOC section: from para_id up to (but not including)
    the next heading's para_id.

    Skips the first sentence if it matches the heading's para_id (to avoid
    duplicating the heading text), and returns its translation as a separate
    `heading_translation` field.

    Returns a dict:
      {
        'sentences': [ { para_id, line_id, pali, translation }, ... ],
        'heading_translation': str | None,  # translation of the heading sentence
        'has_content': bool,  # whether there are content sentences beyond the heading
      }
    """
    cursor = conn.cursor()

    # Compute section range from headings ONCE (headings is only in epitaka.db)
    cursor.execute('''
        SELECT COALESCE(
            (SELECT MIN(para_id) FROM headings
             WHERE book_id = ? AND para_id > ? AND level <= 6),
            999999
        ) AS end_para
    ''', (book_id, para_id))
    end_para = cursor.fetchone()['end_para']

    # Fetch Pāli sentences using the pre-computed range
    cursor.execute('''
        SELECT para_id, line_id, pali
        FROM sentences
        WHERE book_id = ? AND para_id >= ? AND para_id < ?
        ORDER BY para_id, line_id
    ''', (book_id, para_id, end_para))
    rows = cursor.fetchall()

    # Fetch translation if language is specified
    translation_map = {}
    if lang_code:
        trans_db = get_translation_db(lang_code)
        if trans_db:
            trans_cursor = trans_db.cursor()
            trans_cursor.execute('''
                SELECT para_id, line_id, translation
                FROM sentences
                WHERE book_id = ? AND para_id >= ? AND para_id < ?
                ORDER BY para_id, line_id
            ''', (book_id, para_id, end_para))
            for tr in trans_cursor.fetchall():
                translation_map[(tr['para_id'], tr['line_id'])] = tr['translation']

    # Check if the first sentence is the heading itself (same para_id)
    heading_translation = None
    result = []
    for i, r in enumerate(rows):
        pid = r['para_id']
        lid = r['line_id']
        translation = translation_map.get((pid, lid), '')

        # Skip the first row if it has the same para_id as the heading
        if i == 0 and pid == para_id:
            heading_translation = markdown_to_html(translation) if translation else None
            continue

        result.append({
            'para_id':     pid,
            'line_id':     lid,
            'pali':        markdown_to_html(r['pali']) if r['pali'] else '',
            'translation': markdown_to_html(translation) if translation else '',
        })

    return {
        'sentences': result,
        'heading_translation': heading_translation,
        'has_content': len(result) > 0,
    }


def resolve_split_book(book_id, para_id, cursor):
    """
    When a book_id doesn't exist directly (it was split into segments),
    find the segment whose para_id range covers the given para_id.
    Returns the resolved book_id string, or None if nothing matches.
    """
    cursor.execute('SELECT 1 FROM books WHERE book_id = ?', (book_id,))
    if cursor.fetchone():
        return book_id  # exact match, no resolution needed

    cursor.execute('''
        SELECT book_id, para_id, chapter_len
        FROM books
        WHERE book_id LIKE ?
        ORDER BY para_id
    ''', (book_id + '%',))
    segments = cursor.fetchall()

    for seg in segments:
        seg_start = seg['para_id'] or 0
        seg_end   = seg_start + (seg['chapter_len'] or 0)
        if seg_start <= para_id < seg_end:
            return seg['book_id']

    # Fall back to first segment
    return segments[0]['book_id'] if segments else None

# app/services/toc.py
"""
Table-of-contents and sentence fetching helpers.
"""

from ..utils.text import markdown_to_html


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
    return [
        {'para_id': row['para_id'], 'level': row['heading_number'], 'title': row['title']}
        for row in rows
    ]


def get_section_sentences(book_id, para_id, conn):
    """
    Fetch sentences for a TOC section: from para_id up to (but not including)
    the next heading-6-or-lower para_id.
    """
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, line_id, pali_sentence, english_translation, vietnamese_translation
        FROM sentences
        WHERE book_id = ? AND para_id >= ? AND para_id < (
            SELECT COALESCE(
                (SELECT MIN(para_id) FROM headings
                 WHERE book_id = ? AND para_id > ? AND heading_number <= 6),
                999999
            )
        )
        ORDER BY para_id, line_id
    ''', (book_id, para_id, book_id, para_id))
    rows = cursor.fetchall()
    return [
        {
            'para_id':     r['para_id'],
            'line_id':     r['line_id'],
            'pali':        markdown_to_html(r['pali_sentence']),
            'english':     markdown_to_html(r['english_translation']),
            'vietnamese':  markdown_to_html(r['vietnamese_translation']),
        }
        for r in rows
    ]


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
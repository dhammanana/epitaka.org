# app/services/toc.py
"""
Table-of-contents and sentence fetching helpers.
Works with the new epitaka.db schema where:
  - headings table uses `level` instead of `heading_number`
  - sentences table uses `pali` instead of `pali_sentence`
  - translation databases use `translation` instead of `english_translation`
"""
import bisect
from collections import defaultdict

from ..utils.text import markdown_to_html
from ..utils.db import get_db, get_translation_db


def get_book_toc(book_id, conn):
    """Fetch table of contents (headings) for a book.

    Each TOC item now includes a `has_content` flag indicating whether the
    heading has any content sentences beyond its own heading sentence.
    Headings without content (e.g. parent headings that only contain
    sub-headings) will not generate clickable links.

    The content check is batched into a single query instead of one query
    per heading.
    """
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, level, title
        FROM headings
        WHERE book_id = ? AND level <= 6
        ORDER BY para_id
    ''', (book_id,))
    rows = cursor.fetchall()

    if not rows:
        return []

    # ── Batch: sentence count per para_id for the book's heading span ────
    # The original code ran a `LIMIT 2` query per heading; we instead count
    # sentences per para_id once and resolve each heading's section in Python.
    # Bound the scan to the first heading so books with stray metadata rows
    # don't make the GROUP BY larger than needed.
    cursor.execute('''
        SELECT para_id, COUNT(*) AS cnt
        FROM sentences
        WHERE book_id = ? AND para_id >= ?
        GROUP BY para_id
        ORDER BY para_id
    ''', (book_id, rows[0]['para_id']))
    para_counts = cursor.fetchall()

    para_ids = [r['para_id'] for r in para_counts]
    counts = [r['cnt'] for r in para_counts]
    # Prefix sums → O(1) "how many sentences in [start, end)"
    prefix = [0]
    for c in counts:
        prefix.append(prefix[-1] + c)

    toc_items = []
    for i, h in enumerate(rows):
        # Next heading's para_id marks the end of this section
        end_para = rows[i + 1]['para_id'] if i + 1 < len(rows) else 999999999

        lo = bisect.bisect_left(para_ids, h['para_id'])
        hi = bisect.bisect_left(para_ids, end_para)
        section_count = prefix[hi] - prefix[lo]

        has_content = False
        if section_count > 1:
            # At least 2 sentences — after skipping the heading's own line
            # (first row), there's still content left.
            has_content = True
        elif section_count == 1 and lo < hi:
            # Single sentence — is it the heading itself or actual content?
            # If its para_id differs from the heading, it's content.
            has_content = para_ids[lo] != h['para_id']

        toc_items.append({
            'para_id':     h['para_id'],
            'level':       h['level'],
            'title':       h['title'],
            'has_content': has_content,
        })

    return toc_items


def build_slug_map(conn, book_para_pairs):
    """
    Given a list of (book_id, para_id) pairs, return a dict
    {(book_id, para_id): slug} where the slug is built from the nearest
    parent heading (level < 10) at or before para_id.

    All lookups are batched into one query per book.
    """
    if not book_para_pairs:
        return {}

    by_book = defaultdict(set)
    for bid, pid in book_para_pairs:
        by_book[bid].add(pid)

    cursor = conn.cursor()
    slug_map = {}
    for bid, pids in by_book.items():
        cursor.execute('''
            SELECT para_id, title FROM headings
            WHERE book_id = ? AND level < 10
            ORDER BY para_id
        ''', (bid,))
        parents = cursor.fetchall()
        if not parents:
            continue
        para_list = [r['para_id'] for r in parents]
        for pid in pids:
            idx = bisect.bisect_right(para_list, pid) - 1
            if idx >= 0 and parents[idx]['title']:
                slug_map[(bid, pid)] = (
                    parents[idx]['title'].lower().replace(' ', '-') + '-' + str(parents[idx]['para_id'])
                )
            else:
                slug_map[(bid, pid)] = ''
    return slug_map


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

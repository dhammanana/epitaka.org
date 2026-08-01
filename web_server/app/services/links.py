# app/services/links.py
"""
Batched book-links loader.

Rendering a section's book-link previews used to run one query *per link*
(sentences preview, translation preview, heading slug).  This module loads
everything for a section with a handful of batched queries instead.
"""
import bisect
from collections import defaultdict

from ..utils.db import get_translation_db
from ..utils.text import markdown_to_html

_SQLITE_MAX_VARS = 900  # keep comfortably under SQLite's 999 variable limit


def load_section_book_links(conn, book_id, para_id, lang_code=None):
    """
    Return a flat list of book-link dicts for the section containing para_id.

    Each dict:
        {
          'src_para', 'src_line', 'word',
          'dst_book', 'dst_para', 'dst_line',
          'dst_slug',
          'preview': [ {para_id, line_id, pali, translation, is_target}, ... ],
        }

    All sentence / heading lookups are batched into a small number of queries.
    """
    cursor = conn.cursor()

    # ── Section range ────────────────────────────────────────────────────
    cursor.execute('''
        SELECT para_id FROM headings
        WHERE book_id = ? AND para_id > ? AND level < 10
        ORDER BY para_id ASC LIMIT 1
    ''', (book_id, para_id))
    next_row = cursor.fetchone()
    end_para = next_row['para_id'] if next_row else 999999999

    # ── Links in this section ────────────────────────────────────────────
    cursor.execute('''
        SELECT src_para, src_line, dst_book, dst_para, dst_line, word
        FROM book_links
        WHERE src_book = ? AND src_para >= ? AND src_para < ?
        ORDER BY src_para, src_line
    ''', (book_id, para_id, end_para))
    links = cursor.fetchall()

    if not links:
        return []

    # ── Unique destination (book, para) pairs ────────────────────────────
    dst_pairs = sorted({(lnk['dst_book'], lnk['dst_para']) for lnk in links})
    pair_clauses = ['(book_id = ? AND para_id = ?)'] * len(dst_pairs)
    pair_params = [v for pair in dst_pairs for v in pair]

    # ── Batch-fetch all preview sentences (Pāli) ─────────────────────────
    pali_map = {}
    for i in range(0, len(pair_clauses), _SQLITE_MAX_VARS // 2):
        chunk = pair_clauses[i:i + (_SQLITE_MAX_VARS // 2)]
        params = pair_params[i * 2:(i + (_SQLITE_MAX_VARS // 2)) * 2]
        cursor.execute(f'''
            SELECT book_id, para_id, line_id, pali FROM sentences
            WHERE {' OR '.join(chunk)}
            ORDER BY book_id, para_id, line_id
        ''', params)
        for r in cursor.fetchall():
            pali_map[(r['book_id'], r['para_id'], r['line_id'])] = r['pali']

    # ── Batch-fetch translation previews ─────────────────────────────────
    trans_map = {}
    if lang_code:
        trans_db = get_translation_db(lang_code)
        if trans_db:
            tc = trans_db.cursor()
            for i in range(0, len(pair_clauses), _SQLITE_MAX_VARS // 2):
                chunk = pair_clauses[i:i + (_SQLITE_MAX_VARS // 2)]
                params = pair_params[i * 2:(i + (_SQLITE_MAX_VARS // 2)) * 2]
                tc.execute(f'''
                    SELECT book_id, para_id, line_id, translation FROM sentences
                    WHERE {' OR '.join(chunk)}
                    ORDER BY book_id, para_id, line_id
                ''', params)
                for tr in tc.fetchall():
                    if tr['translation']:
                        trans_map[(tr['book_id'], tr['para_id'], tr['line_id'])] = tr['translation']

    # ── Batch-fetch parent headings for slugs ────────────────────────────
    dst_books = sorted({bid for bid, _ in dst_pairs})
    parents_map = {}
    if dst_books:
        placeholders = ','.join('?' * len(dst_books))
        cursor.execute(f'''
            SELECT book_id, para_id, title FROM headings
            WHERE book_id IN ({placeholders}) AND level < 10
            ORDER BY book_id, para_id
        ''', dst_books)
        by_book = defaultdict(list)
        for r in cursor.fetchall():
            by_book[r['book_id']].append((r['para_id'], r['title']))
        parents_map = by_book

    slug_cache = {}

    def _get_slug(bid, pid):
        key = (bid, pid)
        if key in slug_cache:
            return slug_cache[key]
        plist = parents_map.get(bid, [])
        paras = [p for p, _ in plist]
        idx = bisect.bisect_right(paras, pid) - 1
        if idx >= 0 and plist[idx][1]:
            slug = plist[idx][1].lower().replace(' ', '-') + '-' + str(plist[idx][0])
        else:
            slug = ''
        slug_cache[key] = slug
        return slug

    # ── Assemble result ──────────────────────────────────────────────────
    result = []
    for lnk in links:
        dst_book = lnk['dst_book']
        dst_para = lnk['dst_para']
        dst_line = lnk['dst_line']

        preview = []
        for lid in range(max(0, dst_line - 1), dst_line + 2):
            pali = pali_map.get((dst_book, dst_para, lid))
            if pali is None:
                continue
            trans = trans_map.get((dst_book, dst_para, lid)) or ''
            preview.append({
                'para_id': dst_para,
                'line_id': lid,
                'pali': markdown_to_html(pali) if pali else '',
                'translation': markdown_to_html(trans) if trans else '',
                'is_target': lid == dst_line,
            })

        result.append({
            'src_para': lnk['src_para'],
            'src_line': lnk['src_line'],
            'word': lnk['word'],
            'dst_book': dst_book,
            'dst_para': dst_para,
            'dst_line': dst_line,
            'dst_slug': _get_slug(dst_book, dst_para),
            'preview':  preview,
        })

    return result

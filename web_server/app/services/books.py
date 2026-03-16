# app/services/books.py
"""
Book hierarchy: load from DB and organise into the menu tree.
"""

from ..utils.db import get_db


def _parse_id_list(value):
    """
    Parse a stored ref field into a list of integer ids.
    The field may be NULL/empty → [], a single int, or a
    space-separated (legacy) or comma-separated string of ints.
    """
    if value is None:
        return []
    parts = [p.strip() for p in str(value).replace(',', ' ').split() if p.strip()]
    result = []
    for p in parts:
        try:
            result.append(int(p))
        except ValueError:
            pass
    return result


def load_hierarchy():
    """
    Load all book metadata from the books table.

    Returns a dict keyed by book_id.  The ref fields
    (mula_ref, attha_ref, tika_ref) are resolved from integer id lists
    to book_id strings.  Raw id lists are kept as *_ref_ids for callers
    that need them.
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

    id_to_book_id = {row['id']: row['book_id'] for row in rows}

    hierarchy = {}
    for row in rows:
        mula_ids  = _parse_id_list(row['mula_ref'])
        attha_ids = _parse_id_list(row['attha_ref'])
        tika_ids  = _parse_id_list(row['tika_ref'])

        hierarchy[row['book_id']] = {
            'id':          row['id'],
            'category':    row['category'],
            'nikaya':      row['nikaya'],
            'sub_nikaya':  row['sub_nikaya'],
            'book_name':   row['book_name'],
            'mula_ref':    [id_to_book_id[i] for i in mula_ids  if i in id_to_book_id],
            'attha_ref':   [id_to_book_id[i] for i in attha_ids if i in id_to_book_id],
            'tika_ref':    [id_to_book_id[i] for i in tika_ids  if i in id_to_book_id],
            'mula_ref_ids':  mula_ids,
            'attha_ref_ids': attha_ids,
            'tika_ref_ids':  tika_ids,
            'para_id':     row['para_id'],
            'chapter_len': row['chapter_len'],
        }

    return hierarchy


# TAB_ORDER used by the front-end; kept here so Python and JS stay in sync.
_CATEGORY_ORDER = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā']


def organize_hierarchy(hierarchy):
    """
    Organise books into the nested menu structure expected by the templates.

    Structure:
        { category: { nikaya: [ (book_id, book_name), … ] } }          ← no sub_nikaya
        { category: { nikaya: { sub_nikaya: [ (book_id, book_name) ] } } } ← with sub_nikaya

    BUG FIX: the previous implementation would reset an already-populated
    nikaya dict to an empty list the moment it encountered a book with no
    sub_nikaya in the same nikaya, wiping all previously added entries.
    Now books with no sub_nikaya are placed under a sentinel key '' so the
    nikaya value remains a consistent dict and nothing is lost.
    """
    menu = {}
    for book_id, book_data in hierarchy.items():
        category   = book_data['category']
        nikaya     = book_data['nikaya']
        sub_nikaya = book_data['sub_nikaya'] or ''   # normalise None → ''
        book_name  = book_data['book_name']

        menu.setdefault(category, {})
        menu[category].setdefault(nikaya, {})
        menu[category][nikaya].setdefault(sub_nikaya, [])
        menu[category][nikaya][sub_nikaya].append((book_id, book_name))

    return menu
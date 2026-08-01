import threading
import time
from ..utils.db import get_db

# ─────────────────────────────────────────────
# Database Helpers
# ─────────────────────────────────────────────

# Books metadata changes only when the database is rebuilt — cache it.
_HIERARCHY_CACHE = {}
_HIERARCHY_LOCK = threading.Lock()
_HIERARCHY_TTL = 60  # seconds

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


def load_hierarchy(force=False):
    """
    Load all book metadata from the books table in epitaka.db.

    The returned dict is keyed by book_id.  The ref fields
    (mula_ref, attha_ref, tika_ref) are stored directly as
    space-separated book_id strings, so no id resolution is needed.

    Each entry also exposes the new para_id and chapter_len fields
    introduced when large books were split.

    Results are cached in-memory with a short TTL since the books
    table is effectively static at runtime.
    """
    now = time.monotonic()
    with _HIERARCHY_LOCK:
        cached = _HIERARCHY_CACHE.get('data')
        if not force and cached is not None and now - _HIERARCHY_CACHE.get('ts', 0) < _HIERARCHY_TTL:
            return cached

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

    with _HIERARCHY_LOCK:
        _HIERARCHY_CACHE['data'] = hierarchy
        _HIERARCHY_CACHE['ts'] = time.monotonic()

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

        # Use empty string as the key for books with no sub_nikaya
        key = sub_nikaya if sub_nikaya else ""
        if key not in menu[category][nikaya]:
            menu[category][nikaya][key] = []
        menu[category][nikaya][key].append((book_id, book_name))

    return menu


def get_book_name(book_id):
    """Get book name for a given book_id."""
    hierarchy = load_hierarchy()
    info = hierarchy.get(book_id, {})
    return info.get('book_name', book_id)

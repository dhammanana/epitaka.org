# app/services/book_names.py
"""Localized display names for the canon's books.

The `books.book_name` column stores the Pāli title in Roman script
("Dhammapadapāḷi"). Each translation database (epitaka_<lang>.db) also
carries a translation of the book's own title heading, so the same book can
be shown in the reader's language and script ("ဓမ္မပဒ", "Kinh Pháp Cú",
"ธรรมบทบาลี", …).

`display_book_name(book_id, lang)` is the single source of truth used by the
library menu (`/api/menu`), the book page H1/top bar, and the home page.

Fallback order:
  non-en:  translation DB heading → curated seo.BOOK_NAMES_LOCALIZED
           → English name → Pāli name
  en:      English name → Pāli name

Names shared by more than one book (e.g. "Dīgha Nikāya" for D-i/D-ii/D-iii,
or "Jātaka" for every Jātaka volume) are dropped in favour of the distinct
Pāli title, so no two entries in the library become indistinguishable.
"""
import threading
import time

from ..utils.db import get_db, get_translation_db
from ..utils.text import markdown_to_html
from ..utils import seo

# Book names change only when a translation DB or the books table is
# rebuilt, so the resolved map is cached in-process with a short TTL.
_TTL = 300
_cache = {}
_lock = threading.Lock()


def _first_heading_para_ids(conn):
    """{book_id: para_id} for each book's own title heading (level 1).

    Books without a level-1 heading fall back to their first heading so a
    name can still be resolved.
    """
    cursor = conn.cursor()
    cursor.execute(
        "SELECT book_id, MIN(para_id) AS pid FROM headings WHERE level = 1 "
        "GROUP BY book_id"
    )
    first = {r['book_id']: r['pid'] for r in cursor.fetchall()}
    cursor.execute(
        "SELECT book_id, MIN(para_id) AS pid FROM headings GROUP BY book_id"
    )
    for r in cursor.fetchall():
        first.setdefault(r['book_id'], r['pid'])
    return first


def _translated_name(trans_db, book_id, para_id):
    """Translated title heading for one book, as plain text (or None)."""
    if trans_db is None or para_id is None:
        return None
    cursor = trans_db.cursor()
    cursor.execute(
        "SELECT translation FROM sentences "
        "WHERE book_id = ? AND para_id = ? AND line_id = 1",
        (book_id, para_id),
    )
    row = cursor.fetchone()
    if not row or not row['translation']:
        return None
    text = seo.strip_html(markdown_to_html(row['translation'])).strip()
    # Heading sentences often end with sentence punctuation; a name label
    # should not carry it.
    text = text.rstrip('.,;:!?·၊။').strip()
    return text or None


def localized_book_names(lang):
    """{book_id: display name} for one language (English included)."""
    lang = (lang or '').strip().lower()
    if not lang:
        return {}

    now = time.monotonic()
    with _lock:
        entry = _cache.get(lang)
        if entry and now - entry[0] < _TTL:
            return entry[1]

    names = _build(lang)

    with _lock:
        _cache[lang] = (time.monotonic(), names)
    return names


def _build(lang):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT book_id, book_name FROM books")
        pali = {
            r['book_id']: (r['book_name'] or r['book_id'])
            for r in cursor.fetchall()
        }
        first = _first_heading_para_ids(conn)

    trans_db = get_translation_db(lang) if lang != 'en' else None
    curated = seo.BOOK_NAMES_LOCALIZED.get(lang, {})

    raw = {}
    for book_id, pali_name in pali.items():
        name = None
        if lang != 'en':
            name = _translated_name(trans_db, book_id, first.get(book_id))
        if not name:
            name = curated.get(book_id)
        if not name:
            name = seo.english_book_name(book_id)
        raw[book_id] = name or pali_name

    # Names shared by several books (a text and its commentary, or split
    # volumes) would make the library ambiguous. Keep the name for the first
    # book of each group (lexicographic order, so the base id wins — "Dhp"
    # over "Dhp-a") and fall back to the distinct Pāli title for the rest.
    groups = {}
    for book_id, name in raw.items():
        groups.setdefault(name, []).append(book_id)
    keeper = {
        name: sorted(ids)[0]
        for name, ids in groups.items()
        if len(ids) > 1
    }
    return {
        book_id: (name if keeper.get(name, book_id) == book_id else pali[book_id])
        for book_id, name in raw.items()
    }


def display_book_name(book_id, lang, pali_name=None):
    """Display name for one book in `lang` (see module docstring)."""
    if not book_id:
        return pali_name or ''
    lang = (lang or '').strip().lower()
    name = localized_book_names(lang).get(book_id) if lang else None
    if not name:
        name = seo.english_book_name(book_id)
    return name or pali_name or book_id

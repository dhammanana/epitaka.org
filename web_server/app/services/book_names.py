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
from ..utils.cache import TTLCache
from ..utils import seo

# Book names change only when a translation DB or the books table is
# rebuilt (i.e. on deploy), so the resolved map is cached in-process for a
# long time.
_TTL = 3600
_cache = {}
_lock = threading.Lock()
# The first heading of every book only changes when the DB is rebuilt.
_FIRST_HEADINGS_CACHE = TTLCache(max_size=1, ttl=3600)


def _first_heading_para_ids(conn):
    """{book_id: para_id} for each book's own title heading (level 1).

    Books without a level-1 heading fall back to their first heading so a
    name can still be resolved. Both values come from one GROUP BY scan;
    the previous implementation scanned the headings table twice.
    """
    cached = _FIRST_HEADINGS_CACHE.get('all')
    if cached is not None:
        return cached

    cursor = conn.cursor()
    cursor.execute(
        "SELECT book_id, "
        "       MIN(CASE WHEN level = 1 THEN para_id END) AS lvl1, "
        "       MIN(para_id) AS first_pid "
        "FROM headings GROUP BY book_id"
    )
    first = {}
    for r in cursor.fetchall():
        pid = r['lvl1'] if r['lvl1'] is not None else r['first_pid']
        if pid is not None:
            first[r['book_id']] = pid
    _FIRST_HEADINGS_CACHE.set('all', first)
    return first


def _translated_names(trans_db, targets):
    """Bulk version of the old per-book title lookup.

    ``targets`` is ``{book_id: para_id}``. All translations are fetched in
    one query instead of one query per book (286 round-trips on the old
    code), which was the main cold-start cost of ``localized_book_names``.
    """
    if trans_db is None or not targets:
        return {}

    items = [(bid, pid) for bid, pid in targets.items() if pid is not None]
    if not items:
        return {}

    rows = []
    # Chunked so the query stays below SQLite's variable limit even if the
    # canon grows well beyond today's 286 books.
    for start in range(0, len(items), 400):
        chunk = items[start:start + 400]
        values = ",".join(["(?,?)"] * len(chunk))
        params = [value for pair in chunk for value in pair]
        try:
            rows.extend(
                trans_db.execute(
                    f"WITH targets(book_id, para_id) AS (VALUES {values}) "
                    "SELECT s.book_id, s.para_id, s.translation "
                    "FROM sentences s "
                    "JOIN targets t "
                    "  ON s.book_id = t.book_id AND s.para_id = t.para_id "
                    "WHERE s.line_id = 1",
                    params,
                ).fetchall()
            )
        except Exception:
            return {}

    result = {}
    for row in rows:
        translation = row['translation']
        if not translation:
            continue
        text = seo.strip_html(markdown_to_html(translation)).strip()
        # Heading sentences often end with sentence punctuation; a name label
        # should not carry it.
        text = text.rstrip('.,;:!?·၊။').strip()
        if text:
            result[row['book_id']] = text
    return result


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
        # English names never consult translation headings, so skip the
        # headings scan entirely for the default language.
        first = _first_heading_para_ids(conn) if lang != 'en' else {}

    trans_db = get_translation_db(lang) if lang != 'en' else None
    curated = seo.BOOK_NAMES_LOCALIZED.get(lang, {})
    translated = (
        _translated_names(trans_db, {bid: first.get(bid) for bid in pali})
        if lang != 'en'
        else {}
    )

    raw = {}
    for book_id, pali_name in pali.items():
        name = translated.get(book_id)
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

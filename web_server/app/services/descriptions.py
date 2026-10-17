# app/services/descriptions.py
"""
Section descriptions — read-only access.

description_builder.py (see translator/) writes one short SEO description
plus a longer readable summary for each heading section of a book into the
`descriptions` table of the English translation DB (epitaka_en.db) — the
same file the reader and AI features already use. Rows are keyed by
(book_id, para_id, lang), with 'en' as the fallback language.

This module:

  - opens that DB read-only (it is written by the builder while the web
    server may be reading it — WAL makes that safe),
  - returns a section's description in the requested language, falling back
    to English, then to no description at all,
  - degrades gracefully when the table or file is missing, so a deploy
    without descriptions keeps working exactly as before.

Used by the book page to (a) use the short description as the page's meta
description and (b) render it (with the long summary) at the top of the
open section.
"""
import os
import sqlite3

from flask import g

from ..config import Config

# The descriptions table travels inside epitaka_en.db (same policy as the
# `summaries` table). Override with EPITAKA_DESCRIPTION_DB when the builder
# was pointed at a different file.
DESCRIPTION_DB = (
    os.environ.get('EPITAKA_DESCRIPTION_DB')
    or os.path.join(Config.DATA_DIR, 'epitaka_en.db')
)


# ── Connection (per request, read-only) ───────────────────────────────────

def get_description_conn():
    """
    Read-only connection to the `descriptions` table, cached on Flask's
    ``g``. Returns None when the file is absent so callers degrade gracefully.
    """
    if hasattr(g, 'description_db'):
        return g.description_db
    path = DESCRIPTION_DB
    if not os.path.isfile(path):
        setattr(g, 'description_db', None)
        return None
    conn = sqlite3.connect(f'file:{path}?mode=ro', uri=True, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute('PRAGMA busy_timeout = 10000')
    except Exception:
        pass
    setattr(g, 'description_db', conn)
    return conn


# ── Queries ───────────────────────────────────────────────────────────────

def _row_to_dict(row) -> dict:
    return {
        'book_id':     row['book_id'],
        'para_id':     row['para_id'],
        'lang':        row['lang'],
        'level':       row['level'],
        'heading':     row['heading_title'] or '',
        'para_start':  row['para_start'],
        'para_end':    row['para_end'],
        'line_count':  row['line_count'],
        'description': row['description'] or '',
        'summary':     row['summary'] or '',
    }


def get_description(book_id: str, para_id: int, lang: str = 'en') -> dict | None:
    """
    The description row for one section in ``lang``, falling back to the
    English row when that language has none. Returns None when there is
    nothing (missing DB/table, or no row at all).
    """
    if not book_id or para_id is None:
        return None
    conn = get_description_conn()
    if conn is None:
        return None

    langs = [lang] if lang == 'en' else [lang, 'en']
    for code in langs:
        try:
            row = conn.execute(
                'SELECT * FROM descriptions '
                'WHERE book_id = ? AND para_id = ? AND lang = ? '
                "AND description != ''",
                (book_id, para_id, code),
            ).fetchone()
        except sqlite3.Error:
            return None
        if row:
            return _row_to_dict(row)
    return None


def get_all_descriptions(book_id: str, lang: str = 'en') -> list[dict]:
    """All descriptions for a book in one language (English rows fill gaps)."""
    conn = get_description_conn()
    if conn is None:
        return []
    try:
        rows = conn.execute(
            'SELECT * FROM descriptions WHERE book_id = ? '
            "AND description != '' ORDER BY para_id",
            (book_id,),
        ).fetchall()
    except sqlite3.Error:
        return []

    by_lang: dict[str, dict] = {}
    for row in rows:
        if row['lang'] == lang or row['lang'] == 'en':
            by_lang.setdefault(row['lang'], {})[row['para_id']] = _row_to_dict(row)

    wanted = by_lang.get(lang, {})
    if lang != 'en':
        for pid, row in by_lang.get('en', {}).items():
            wanted.setdefault(pid, row)
    return [wanted[pid] for pid in sorted(wanted)]


def description_map(book_id: str, lang: str = 'en') -> dict:
    """{para_id: description_row} for a book — for outlines and study links."""
    return {row['para_id']: row for row in get_all_descriptions(book_id, lang)}

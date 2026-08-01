# app/utils/db.py
import os
import sqlite3
import threading
import unicodedata
from contextlib import contextmanager

from flask import current_app, g

from ..config import Config


# ── Connection tuning ──────────────────────────────────────────────────────
# Applied once when a connection is created (per-request, per-thread).
def _configure(conn, *, writable=False):
    """Apply performance pragmas for a read-heavy workload."""
    try:
        conn.execute('PRAGMA busy_timeout = 10000')
        conn.execute('PRAGMA cache_size = -32768')          # 32 MB page cache per conn
        conn.execute('PRAGMA mmap_size = 134217728')        # 128 MB mmap
        if writable:
            conn.execute('PRAGMA journal_mode = WAL')
            conn.execute('PRAGMA synchronous = NORMAL')
    except Exception:
        pass  # pragmas are best-effort


# ── Epitaka database (Pāli text, books, headings — shared with mobile) ────

@contextmanager
def get_db():
    """Connect to epitaka.db (Pāli text, books, headings, pali_definition, book_links).

    One connection per request, cached on Flask's ``g``, closed by
    ``teardown_db`` at the end of the request.
    """
    if not hasattr(g, 'db') or g.db is None:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
        _configure(g.db)
    yield g.db


# ── DPD dictionary database ────────────────────────────────────────────────

_dpd_local = threading.local()

def get_dpd_db():
    """
    Connect to dpd-dictionary.db (read-only, ~190 MB).

    Returns a raw sqlite3 connection or None if the file doesn't exist.
    Cached per-thread (thread-local) so the shared connection is safe to use
    with gunicorn's threaded workers.
    """
    db_path = os.path.join(Config.DATA_DIR, 'dpd-dictionary.db')
    if not os.path.isfile(db_path):
        return None
    conn = getattr(_dpd_local, 'conn', None)
    if conn is None:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        _configure(conn)
        _dpd_local.conn = conn
    return conn


# ── Web data database (FTS indexes, user data) ────────────────────────────
# Lives in webdata.db so it does NOT bloat epitaka.db (shared with mobile).

@contextmanager
def get_webdata_db():
    """
    Connect to webdata.db — web-only data:
      - FTS search indexes (paragraphs_fts, ...)
      - User data (users, comments, notes, bookmarks, reading_history)

    One connection per request, closed by ``teardown_db``.
    """
    db_path = Config.WEBDATA_DB
    if not hasattr(g, 'webdata_db') or g.webdata_db is None:
        g.webdata_db = sqlite3.connect(db_path)
        g.webdata_db.row_factory = sqlite3.Row
        _configure(g.webdata_db, writable=True)
    yield g.webdata_db


# ── Translation databases ──────────────────────────────────────────────────

def get_translation_db(lang_code):
    """
    Connect to epitaka_{lang_code}.db (translation database).
    Falls back to _epitaka_{lang_code}.db if the standard name is not found.
    Returns a flask-g-managed connection or None if not found.
    """
    cache_key = f'trans_db_{lang_code}'
    # Flask g doesn't support item assignment in Python 3.14+ — use getattr/setattr
    cached = getattr(g, cache_key, None)
    if cached is not None:
        return cached

    db_path = os.path.join(Config.DATA_DIR, f'epitaka_{lang_code}.db')
    if not os.path.isfile(db_path):
        # Try underscore-prefixed variant (temporary rename to avoid conflicts)
        db_path = os.path.join(Config.DATA_DIR, f'_epitaka_{lang_code}.db')
        if not os.path.isfile(db_path):
            setattr(g, cache_key, None)
            return None

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    _configure(conn, writable=True)
    setattr(g, cache_key, conn)
    return conn


# ── Translation discovery ─────────────────────────────────────────────────

def get_available_translations():
    """Get list of available language codes from translation databases."""
    return Config.get_available_languages()


def get_translation_db_path(lang_code):
    """Get the file path for a translation database.
    Falls back to _epitaka_{lang_code}.db if the standard name is not found."""
    path = os.path.join(Config.DATA_DIR, f'epitaka_{lang_code}.db')
    if os.path.isfile(path):
        return path
    # Try underscore-prefixed variant (temporary rename to avoid conflicts)
    alt_path = os.path.join(Config.DATA_DIR, f'_epitaka_{lang_code}.db')
    return alt_path if os.path.isfile(alt_path) else None


def get_translation_info(lang_code):
    """Get display info for a translation language."""
    translations = Config.detect_translations()
    info = translations.get(lang_code, {})
    if not info:
        return {'code': lang_code, 'english_name': lang_code.upper(), 'native_name': lang_code.upper()}
    return info


# ── Text normalization ────────────────────────────────────────────────────

def normalize_pali(text):
    nfkd_form = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd_form if not unicodedata.combining(c))

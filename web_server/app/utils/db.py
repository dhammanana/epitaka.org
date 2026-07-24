# app/utils/db.py
import os
import sqlite3
import unicodedata
from contextlib import contextmanager

from flask import current_app, g

from ..config import Config

# ── Epitaka database (Pāli text, books, headings — shared with mobile) ────

@contextmanager
def get_db():
    """Connect to epitaka.db (Pāli text, books, headings, pali_definition, book_links)."""
    if not hasattr(g, 'db') or g.db is None:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    try:
        yield g.db
    finally:
        if hasattr(g, 'db') and g.db is not None:
            g.db.close()
            g.pop('db', None)


# ── DPD dictionary database ────────────────────────────────────────────────

_dpd_db_connection = None

def get_dpd_db():
    """
    Connect to dpd-dictionary.db.

    Returns a raw sqlite3 connection or None if the file doesn't exist.
    Cached globally (read-only database).
    """
    global _dpd_db_connection
    db_path = os.path.join(Config.DATA_DIR, 'dpd-dictionary.db')
    if not os.path.isfile(db_path):
        return None
    if _dpd_db_connection is None:
        _dpd_db_connection = sqlite3.connect(db_path)
        _dpd_db_connection.row_factory = sqlite3.Row
    return _dpd_db_connection


# ── Web data database (FTS indexes, user data) ────────────────────────────
# Lives in webdata.db so it does NOT bloat epitaka.db (shared with mobile).

@contextmanager
def get_webdata_db():
    """
    Connect to webdata.db — web-only data:
      - FTS search indexes (sentences_fts, sentences_fts_v2, passages_fts, words, search_fts_*)
      - User data (users, comments, notes, bookmarks, reading_history)
    """
    db_path = Config.WEBDATA_DB
    if not hasattr(g, 'webdata_db') or g.webdata_db is None:
        g.webdata_db = sqlite3.connect(db_path)
        g.webdata_db.row_factory = sqlite3.Row
    try:
        yield g.webdata_db
    finally:
        if hasattr(g, 'webdata_db') and g.webdata_db is not None:
            g.webdata_db.close()
            g.pop('webdata_db', None)


# ── Translation databases ──────────────────────────────────────────────────

def get_translation_db(lang_code):
    """
    Connect to epitaka_{lang_code}.db (translation database).
    Returns a flask-g-managed connection or None if not found.
    """
    cache_key = f'trans_db_{lang_code}'
    # Flask g doesn't support item assignment in Python 3.14+ — use getattr/setattr
    cached = getattr(g, cache_key, None)
    if cached is not None:
        return cached

    db_path = os.path.join(Config.DATA_DIR, f'epitaka_{lang_code}.db')
    if not os.path.isfile(db_path):
        setattr(g, cache_key, None)
        return None

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    setattr(g, cache_key, conn)
    return conn


# ── Translation discovery ─────────────────────────────────────────────────

def get_available_translations():
    """Get list of available language codes from translation databases."""
    return Config.get_available_languages()


def get_translation_db_path(lang_code):
    """Get the file path for a translation database."""
    path = os.path.join(Config.DATA_DIR, f'epitaka_{lang_code}.db')
    return path if os.path.isfile(path) else None


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

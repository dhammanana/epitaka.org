# app/routes/reader.py
import time

from flask import Blueprint, jsonify, request, g

from ..utils.db import get_db, get_webdata_db
from .auth import require_auth

bp = Blueprint('reader', __name__)


# ── Schema migration (call at app startup) ────────────────────

def init_reader_db():
    with get_webdata_db() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS notes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                uid        TEXT    NOT NULL,
                book_id    TEXT    NOT NULL,
                para_id    INTEGER NOT NULL,
                line_id    INTEGER NOT NULL,
                text       TEXT    NOT NULL DEFAULT '',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                UNIQUE (uid, book_id, para_id, line_id),
                FOREIGN KEY (uid) REFERENCES users(uid)
            );
            CREATE INDEX IF NOT EXISTS idx_notes_uid       ON notes (uid);
            CREATE INDEX IF NOT EXISTS idx_notes_book_para ON notes (book_id, para_id);

            CREATE TABLE IF NOT EXISTS bookmarks (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                uid        TEXT    NOT NULL,
                book_id    TEXT    NOT NULL,
                para_id    INTEGER NOT NULL,
                line_id    INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                UNIQUE (uid, book_id, para_id, line_id),
                FOREIGN KEY (uid) REFERENCES users(uid)
            );
            CREATE INDEX IF NOT EXISTS idx_bookmarks_uid ON bookmarks (uid);

            CREATE TABLE IF NOT EXISTS reading_history (
                uid           TEXT    NOT NULL,
                book_id       TEXT    NOT NULL,
                book_title    TEXT    NOT NULL DEFAULT '',
                section_title TEXT    NOT NULL DEFAULT '',
                para_id       INTEGER NOT NULL,
                updated_at    INTEGER NOT NULL,
                PRIMARY KEY (uid, book_id),
                FOREIGN KEY (uid) REFERENCES users(uid)
            );
            CREATE INDEX IF NOT EXISTS idx_history_uid ON reading_history (uid);
        ''')


# ── Helper: compute section para_id range from epitaka.db ────────────────

def _get_section_para_range(book_id, para_id):
    """
    Given a heading para_id, return the (start_para, end_para) range for that
    TOC section by reading the headings table from epitaka.db.
    This avoids querying epitaka tables from webdata.db connections.
    """
    with get_db() as conn:
        row = conn.execute(
            'SELECT COALESCE(MIN(para_id), 999999) FROM headings '
            'WHERE book_id = ? AND para_id > ? AND level <= 6',
            (book_id, para_id)
        ).fetchone()
        end_para = row[0] if row and row[0] else 999999
    return para_id, end_para


# ═══════════════════════════════════════════════════════════
# COMMENTS
# ═══════════════════════════════════════════════════════════

@bp.route('/api/book/<book_id>/comments')
def api_get_comments(book_id):
    """Public. Returns all comments for a TOC section."""
    book_id = book_id.replace('_chunks', '')
    spid    = (request.args.get('section_para_id', type=int)
               or request.args.get('para_id', type=int))
    if spid is None:
        return jsonify({'error': 'section_para_id required'}), 400

    start_para, end_para = _get_section_para_range(book_id, spid)
    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT c.id, c.para_id, c.line_id, c.uid,
                   u.display_name, u.photo_url,
                   c.text, c.created_at, c.updated_at
            FROM   comments c
            JOIN   users    u ON c.uid = u.uid
            WHERE  c.book_id = ? AND c.para_id >= ? AND c.para_id < ?
            ORDER  BY c.para_id, c.line_id, c.created_at ASC
        ''', (book_id, start_para, end_para))
        rows = cursor.fetchall()
    return jsonify({'comments': [dict(r) for r in rows]})


@bp.route('/api/book/<book_id>/comments', methods=['POST'])
@require_auth
def api_add_comment(book_id):
    """Add a comment. Requires auth."""
    book_id = book_id.replace('_chunks', '')
    data    = request.get_json(silent=True) or {}
    para_id = data.get('para_id')
    line_id = data.get('line_id', 0)
    text    = (data.get('text') or '').strip()

    if not isinstance(para_id, int) or not text:
        return jsonify({'error': 'para_id and text required'}), 400
    if len(text) > 2000:
        return jsonify({'error': 'Comment too long (max 2000 chars)'}), 400

    now = int(time.time())
    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO comments (book_id, para_id, line_id, uid, text, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (book_id, para_id, line_id, g.uid, text, now, now))
        conn.commit()
        comment_id = cursor.lastrowid
        cursor.execute('''
            SELECT c.id, c.para_id, c.line_id, c.uid,
                   u.display_name, u.photo_url,
                   c.text, c.created_at, c.updated_at
            FROM   comments c JOIN users u ON c.uid = u.uid
            WHERE  c.id = ?
        ''', (comment_id,))
        row = cursor.fetchone()
    return jsonify(dict(row)), 201


@bp.route('/api/comments/<int:comment_id>', methods=['PATCH'])
@require_auth
def api_edit_comment(comment_id):
    """Edit your own comment."""
    text = (request.get_json(silent=True) or {}).get('text', '').strip()
    if not text:
        return jsonify({'error': 'text required'}), 400
    if len(text) > 2000:
        return jsonify({'error': 'Comment too long (max 2000 chars)'}), 400

    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT uid FROM comments WHERE id = ?', (comment_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        if row['uid'] != g.uid:
            return jsonify({'error': 'Forbidden'}), 403

        cursor.execute(
            'UPDATE comments SET text = ?, updated_at = ? WHERE id = ?',
            (text, int(time.time()), comment_id)
        )
        conn.commit()
        cursor.execute('''
            SELECT c.id, c.para_id, c.line_id, c.uid,
                   u.display_name, u.photo_url,
                   c.text, c.created_at, c.updated_at
            FROM   comments c JOIN users u ON c.uid = u.uid
            WHERE  c.id = ?
        ''', (comment_id,))
        updated = cursor.fetchone()
    return jsonify(dict(updated))


@bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@require_auth
def api_delete_comment(comment_id):
    """Delete your own comment."""
    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT uid FROM comments WHERE id = ?', (comment_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        if row['uid'] != g.uid:
            return jsonify({'error': 'Forbidden'}), 403

        cursor.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
        conn.commit()
    return jsonify({'deleted': comment_id})


# ═══════════════════════════════════════════════════════════
# NOTES
# ═══════════════════════════════════════════════════════════

@bp.route('/api/book/<book_id>/notes')
@require_auth
def api_get_notes(book_id):
    """Return all notes for a section belonging to the logged-in user."""
    book_id = book_id.replace('_chunks', '')
    spid    = request.args.get('section_para_id', type=int)
    if spid is None:
        return jsonify({'error': 'section_para_id required'}), 400

    start_para, end_para = _get_section_para_range(book_id, spid)
    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, para_id, line_id, text, created_at, updated_at
            FROM   notes
            WHERE  uid = ? AND book_id = ?
              AND para_id >= ? AND para_id < ?
            ORDER  BY para_id, line_id
        ''', (g.uid, book_id, start_para, end_para))
        rows = cursor.fetchall()
    return jsonify({'notes': [dict(r) for r in rows]})


@bp.route('/api/book/<book_id>/notes', methods=['PUT'])
@require_auth
def api_upsert_note(book_id):
    """Upsert a personal note. Empty text deletes the note."""
    book_id = book_id.replace('_chunks', '')
    data    = request.get_json(silent=True) or {}
    para_id = data.get('para_id')
    line_id = data.get('line_id', 0)
    text    = (data.get('text') or '').strip()

    if not isinstance(para_id, int):
        return jsonify({'error': 'para_id required'}), 400
    if len(text) > 5000:
        return jsonify({'error': 'Note too long (max 5000 chars)'}), 400

    with get_webdata_db() as conn:
        cursor = conn.cursor()
        if not text:
            cursor.execute(
                'DELETE FROM notes WHERE uid=? AND book_id=? AND para_id=? AND line_id=?',
                (g.uid, book_id, para_id, line_id)
            )
            conn.commit()
            return jsonify({'deleted': True})

        now = int(time.time())
        cursor.execute('''
            INSERT INTO notes (uid, book_id, para_id, line_id, text, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid, book_id, para_id, line_id) DO UPDATE SET
                text       = excluded.text,
                updated_at = excluded.updated_at
        ''', (g.uid, book_id, para_id, line_id, text, now, now))
        conn.commit()
        cursor.execute(
            'SELECT id, para_id, line_id, text, created_at, updated_at FROM notes '
            'WHERE uid=? AND book_id=? AND para_id=? AND line_id=?',
            (g.uid, book_id, para_id, line_id)
        )
        row = cursor.fetchone()
    return jsonify(dict(row))


# ═══════════════════════════════════════════════════════════
# BOOKMARKS
# ═══════════════════════════════════════════════════════════

@bp.route('/api/book/<book_id>/bookmarks')
@require_auth
def api_get_bookmarks(book_id):
    """Return all bookmarks for a section belonging to the logged-in user."""
    book_id = book_id.replace('_chunks', '')
    spid    = request.args.get('section_para_id', type=int)
    if spid is None:
        return jsonify({'error': 'section_para_id required'}), 400

    start_para, end_para = _get_section_para_range(book_id, spid)
    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, para_id, line_id, created_at
            FROM   bookmarks
            WHERE  uid = ? AND book_id = ?
              AND para_id >= ? AND para_id < ?
            ORDER  BY para_id, line_id
        ''', (g.uid, book_id, start_para, end_para))
        rows = cursor.fetchall()
    return jsonify({'bookmarks': [dict(r) for r in rows]})


@bp.route('/api/book/<book_id>/bookmarks', methods=['POST'])
@require_auth
def api_toggle_bookmark(book_id):
    """Toggle a bookmark. Returns {bookmarked: bool}."""
    book_id = book_id.replace('_chunks', '')
    data    = request.get_json(silent=True) or {}
    para_id = data.get('para_id')
    line_id = data.get('line_id', 0)

    if not isinstance(para_id, int):
        return jsonify({'error': 'para_id required'}), 400

    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT id FROM bookmarks WHERE uid=? AND book_id=? AND para_id=? AND line_id=?',
            (g.uid, book_id, para_id, line_id)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.execute('DELETE FROM bookmarks WHERE id=?', (existing['id'],))
            conn.commit()
            return jsonify({'bookmarked': False})

        cursor.execute(
            'INSERT INTO bookmarks (uid, book_id, para_id, line_id, created_at) VALUES (?,?,?,?,?)',
            (g.uid, book_id, para_id, line_id, int(time.time()))
        )
        conn.commit()
    return jsonify({'bookmarked': True})


# ═══════════════════════════════════════════════════════════
# READING HISTORY
# ═══════════════════════════════════════════════════════════

@bp.route('/api/book/<book_id>/history', methods=['PUT'])
@require_auth
def api_update_history(book_id):
    """Record or update the user's reading position in a book."""
    book_id = book_id.replace('_chunks', '')
    data    = request.get_json(silent=True) or {}
    para_id = data.get('para_id')

    if not isinstance(para_id, int):
        return jsonify({'error': 'para_id required'}), 400

    section_title = (data.get('section_title') or '').strip()[:300]
    book_title    = (data.get('book_title')    or '').strip()[:300]
    now           = int(time.time())

    # Look up book name from epitaka.db (books table is not in webdata.db)
    if not book_title:
        with get_db() as epi_conn:
            row = epi_conn.execute(
                'SELECT book_name FROM books WHERE book_id=?', (book_id,)
            ).fetchone()
            book_title = row['book_name'] if row else book_id

    with get_webdata_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO reading_history
                (uid, book_id, book_title, section_title, para_id, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid, book_id) DO UPDATE SET
                book_title    = excluded.book_title,
                section_title = excluded.section_title,
                para_id       = excluded.para_id,
                updated_at    = excluded.updated_at
        ''', (g.uid, book_id, book_title, section_title, para_id, now))
        conn.commit()
    return jsonify({'ok': True})


# ═══════════════════════════════════════════════════════════
# USER LIBRARY
# ═══════════════════════════════════════════════════════════

def _get_book_name(book_id):
    """Look up a book's display name from epitaka.db."""
    try:
        with get_db() as conn:
            row = conn.execute(
                'SELECT book_name FROM books WHERE book_id=?', (book_id,)
            ).fetchone()
            return row['book_name'] if row else book_id
    except Exception:
        return book_id


@bp.route('/api/user/library')
@require_auth
def api_user_library():
    """Return all comments, notes, bookmarks, and history for the logged-in user."""
    with get_webdata_db() as conn:
        cursor = conn.cursor()

        cursor.execute('''
            SELECT c.id, c.book_id, c.para_id, c.line_id, c.text, c.created_at
            FROM   comments c
            WHERE  c.uid = ?
            ORDER  BY c.created_at DESC LIMIT 200
        ''', (g.uid,))
        comments = [dict(r) for r in cursor.fetchall()]

        cursor.execute('''
            SELECT n.id, n.book_id, n.para_id, n.line_id, n.text,
                   n.created_at, n.updated_at
            FROM   notes n
            WHERE  n.uid = ?
            ORDER  BY n.updated_at DESC LIMIT 200
        ''', (g.uid,))
        notes = [dict(r) for r in cursor.fetchall()]

        cursor.execute('''
            SELECT bm.id, bm.book_id, bm.para_id, bm.line_id, bm.created_at
            FROM   bookmarks bm
            WHERE  bm.uid = ?
            ORDER  BY bm.created_at DESC LIMIT 200
        ''', (g.uid,))
        bookmarks = [dict(r) for r in cursor.fetchall()]

        cursor.execute('''
            SELECT book_id, book_title, section_title, para_id, updated_at
            FROM   reading_history
            WHERE  uid = ?
            ORDER  BY updated_at DESC LIMIT 100
        ''', (g.uid,))
        history = [dict(r) for r in cursor.fetchall()]

    # Enrich with book names from epitaka.db
    for item in comments:
        if 'book_title' not in item or not item.get('book_title'):
            item['book_title'] = _get_book_name(item.get('book_id', ''))
    for item in history:
        if not item.get('book_title'):
            item['book_title'] = _get_book_name(item.get('book_id', ''))

    return jsonify({
        'comments':  comments,
        'notes':     notes,
        'bookmarks': bookmarks,
        'history':   history,
    })

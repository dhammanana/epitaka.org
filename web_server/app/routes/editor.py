# app/routes/editor.py
"""
Translation editor console.

A closed group of translators works on the translation databases. Accounts are
created ONLY by the super admin (no public registration). Editors propose
per-line translation fixes; the super admin reviews the queue (human
suggestions + AI findings) and can apply changes selectively or all at once.

Auth: Flask session cookie (email + password). Super admin flag + allowed
languages are stored in webdata.db.

Routes are mounted under /editor/api/* so they never conflict with the public
reader API.
"""
import os
import re
import threading
import time
from functools import wraps

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

# Explicit, widely-supported hash method (scrypt hashing can fail to verify on
# some OpenSSL builds, which would lock everyone out of the editor console).
_HASH_METHOD = 'pbkdf2:sha256'

from ..utils.db import get_db, get_webdata_db, get_translation_db, get_translation_db_path
from ..config import Config
from ..services.books import load_hierarchy, organize_hierarchy
from ..services.toc import get_book_toc

bp = Blueprint('editor', __name__, url_prefix='/editor/api')

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


# ══════════════════════════════════════════════════════════════════════════
# DB SCHEMA (webdata.db)
# ══════════════════════════════════════════════════════════════════════════

def init_editor_db():
    """Create editor tables in webdata.db (idempotent)."""
    with get_webdata_db() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS editors (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                display_name  TEXT    NOT NULL DEFAULT '',
                is_super      INTEGER NOT NULL DEFAULT 0,
                created_at    INTEGER NOT NULL,
                updated_at    INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS editor_langs (
                editor_id INTEGER NOT NULL,
                lang_code TEXT    NOT NULL,
                PRIMARY KEY (editor_id, lang_code),
                FOREIGN KEY (editor_id) REFERENCES editors(id) ON DELETE CASCADE
            );
        ''')


def bootstrap_super_admin():
    """
    Create (or update) the initial super admin from environment variables
    EDITOR_ADMIN_EMAIL / EDITOR_ADMIN_PASSWORD.  This is how the first admin
    is created — afterwards, only the super admin can create further editors.
    """
    email = os.environ.get('EDITOR_ADMIN_EMAIL', '').strip().lower()
    password = os.environ.get('EDITOR_ADMIN_PASSWORD', '').strip()
    if not email or not password:
        return
    now = int(time.time())
    with get_webdata_db() as conn:
        row = conn.execute('SELECT id FROM editors WHERE email = ?', (email,)).fetchone()
        if row:
            conn.execute(
                'UPDATE editors SET password_hash = ?, is_super = 1, updated_at = ? WHERE id = ?',
                (generate_password_hash(password, method=_HASH_METHOD), now, row['id'])
            )
        else:
            conn.execute(
                'INSERT INTO editors (email, password_hash, display_name, is_super, created_at, updated_at) '
                'VALUES (?, ?, ?, 1, ?, ?)',
                (email, generate_password_hash(password, method=_HASH_METHOD), email.split('@')[0], now, now)
            )
        conn.commit()


# ══════════════════════════════════════════════════════════════════════════
# TRANSLATION DB SCHEMA (translation_remarks extensions)
# ══════════════════════════════════════════════════════════════════════════

_REMARK_COLUMNS = [
    # kind: 'ai' (existing AI finding) or 'human' (editor suggestion)
    ("kind", "TEXT NOT NULL DEFAULT 'ai'"),
    # status: 'pending' | 'applied' | 'rejected'
    ("status", "TEXT NOT NULL DEFAULT 'pending'"),
    # proposed new full-line translation (human) / alternative wording (AI)
    ("proposed", "TEXT"),
    ("editor_id", "INTEGER"),
    ("editor_name", "TEXT"),
    ("applied_at", "TEXT"),
    ("applied_by", "TEXT"),
    ("rejected_at", "TEXT"),
    ("rejected_by", "TEXT"),
]

_migrated_dbs = set()
_migrate_lock = threading.Lock()


def ensure_remark_schema(trans_db, db_path):
    """Add missing columns to translation_remarks (idempotent, per process)."""
    if db_path in _migrated_dbs:
        return
    # Guarded so concurrent threads (gunicorn --threads 8) never both try to
    # ALTER TABLE ADD COLUMN the same missing column.
    with _migrate_lock:
        if db_path in _migrated_dbs:
            return
        cols = {r['name'] for r in trans_db.execute('PRAGMA table_info(translation_remarks)')}
        for name, ddl in _REMARK_COLUMNS:
            if name not in cols:
                trans_db.execute(f'ALTER TABLE translation_remarks ADD COLUMN {name} {ddl}')
        # Cheap index for the per-book / per-section review & editor queries.
        trans_db.execute(
            'CREATE INDEX IF NOT EXISTS idx_remarks_book_para ON '
            'translation_remarks (book_id, para_id, line_id)'
        )
        trans_db.commit()
        _migrated_dbs.add(db_path)


def _open_trans_db(lang):
    """Open a translation DB and ensure the remark schema exists."""
    path = get_translation_db_path(lang)
    if not path:
        return None
    conn = get_translation_db(lang)
    if conn is None:
        return None
    ensure_remark_schema(conn, path)
    return conn


# ══════════════════════════════════════════════════════════════════════════
# AUTH DECORATORS
# ══════════════════════════════════════════════════════════════════════════

def _current_editor():
    """Return the editor dict from session, or None."""
    eid = session.get('editor_id')
    if not eid:
        return None
    return {
        'id': eid,
        'email': session.get('editor_email', ''),
        'display_name': session.get('editor_name', ''),
        'is_super': bool(session.get('editor_super')),
        'langs': session.get('editor_langs', []),
    }


def require_editor(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        editor = _current_editor()
        if not editor:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(editor, *args, **kwargs)
    return wrapper


def require_super(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        editor = _current_editor()
        if not editor:
            return jsonify({'error': 'Unauthorized'}), 401
        if not editor['is_super']:
            return jsonify({'error': 'Forbidden'}), 403
        return f(editor, *args, **kwargs)
    return wrapper


def _same_origin():
    """
    CSRF defense-in-depth for state-changing endpoints.  The session cookie is
    SameSite=Lax, which already blocks cross-site POSTs from sending it; this
    additionally rejects requests whose Origin/Referer doesn't match the host.
    """
    origin = request.headers.get('Origin') or request.headers.get('Referer') or ''
    if not origin:
        # Non-browser clients (curl, CLI) don't send Origin — allow them;
        # the session cookie requirement still protects the endpoint.
        return True
    from urllib.parse import urlparse
    host = request.host.lower()
    try:
        return urlparse(origin).netloc.lower() == host
    except Exception:
        return False


def require_same_origin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not _same_origin():
            return jsonify({'error': 'Invalid request origin'}), 403
        return f(*args, **kwargs)
    return wrapper


def _check_lang_permission(editor, lang):
    if editor['is_super']:
        return True
    return lang in editor['langs']


def _lang_meta():
    """Human-readable names for all detected translations."""
    return Config.detect_translations()


# ══════════════════════════════════════════════════════════════════════════
# SESSION AUTH
# ══════════════════════════════════════════════════════════════════════════

@bp.route('/login', methods=['POST'])
@require_same_origin
def api_login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    with get_webdata_db() as conn:
        row = conn.execute(
            'SELECT id, email, password_hash, display_name, is_super FROM editors WHERE email = ?',
            (email,)
        ).fetchone()

    if not row or not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    langs = []
    with get_webdata_db() as conn:
        rows = conn.execute(
            'SELECT lang_code FROM editor_langs WHERE editor_id = ? ORDER BY lang_code',
            (row['id'],)
        ).fetchall()
        langs = [r['lang_code'] for r in rows]

    # Session hardening
    session.clear()
    session.permanent = True
    session['editor_id'] = row['id']
    session['editor_email'] = row['email']
    session['editor_name'] = row['display_name']
    session['editor_super'] = bool(row['is_super'])
    session['editor_langs'] = langs

    return jsonify(_current_editor())


@bp.route('/logout', methods=['POST'])
@require_same_origin
def api_logout():
    session.clear()
    return jsonify({'ok': True})


@bp.route('/me')
@require_editor
def api_me(editor):
    return jsonify(editor)


# ══════════════════════════════════════════════════════════════════════════
# SUPER ADMIN — EDITOR ACCOUNTS (only super can create)
# ══════════════════════════════════════════════════════════════════════════

def _editor_row(conn, eid):
    row = conn.execute(
        'SELECT id, email, display_name, is_super, created_at FROM editors WHERE id = ?',
        (eid,)
    ).fetchone()
    if not row:
        return None
    langs = [r['lang_code'] for r in conn.execute(
        'SELECT lang_code FROM editor_langs WHERE editor_id = ? ORDER BY lang_code', (eid,)
    ).fetchall()]
    return dict(row) | {'langs': langs}


@bp.route('/editors')
@require_super
def api_list_editors(editor):
    with get_webdata_db() as conn:
        rows = conn.execute('SELECT id FROM editors ORDER BY id').fetchall()
        result = [_editor_row(conn, r['id']) for r in rows]
    return jsonify({'editors': result})


@bp.route('/editors', methods=['POST'])
@require_same_origin
@require_super
def api_create_editor(editor):
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    display_name = (data.get('display_name') or '').strip()
    is_super = bool(data.get('is_super'))
    langs = data.get('langs') or []

    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Valid email required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    valid_langs = set(_lang_meta().keys())
    langs = sorted({l for l in langs if l in valid_langs})

    now = int(time.time())
    with get_webdata_db() as conn:
        exists = conn.execute('SELECT id FROM editors WHERE email = ?', (email,)).fetchone()
        if exists:
            return jsonify({'error': 'An editor with this email already exists'}), 409
        cur = conn.execute(
            'INSERT INTO editors (email, password_hash, display_name, is_super, created_at, updated_at) '
            'VALUES (?, ?, ?, ?, ?, ?)',
            (email, generate_password_hash(password, method=_HASH_METHOD), display_name, int(is_super), now, now)
        )
        eid = cur.lastrowid
        conn.executemany(
            'INSERT INTO editor_langs (editor_id, lang_code) VALUES (?, ?)',
            [(eid, l) for l in langs]
        )
        conn.commit()
        result = _editor_row(conn, eid)
    return jsonify(result), 201


@bp.route('/editors/<int:eid>', methods=['PATCH'])
@require_same_origin
@require_super
def api_update_editor(editor, eid):
    data = request.get_json(silent=True) or {}
    with get_webdata_db() as conn:
        current = _editor_row(conn, eid)
        if not current:
            return jsonify({'error': 'Editor not found'}), 404

        sets = []
        vals = []
        if 'display_name' in data and isinstance(data.get('display_name'), str):
            sets.append('display_name = ?')
            vals.append(data['display_name'].strip()[:120])
        if 'is_super' in data:
            sets.append('is_super = ?')
            vals.append(int(bool(data['is_super'])))
        if 'password' in data and data.get('password'):
            if len(data['password']) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            sets.append('password_hash = ?')
            vals.append(generate_password_hash(data['password'], method=_HASH_METHOD))
        if 'langs' in data and isinstance(data.get('langs'), list):
            valid_langs = set(_lang_meta().keys())
            new_langs = sorted({l for l in data['langs'] if l in valid_langs})
            conn.execute('DELETE FROM editor_langs WHERE editor_id = ?', (eid,))
            conn.executemany(
                'INSERT INTO editor_langs (editor_id, lang_code) VALUES (?, ?)',
                [(eid, l) for l in new_langs]
            )
            current['langs'] = new_langs

        if sets:
            sets.append('updated_at = ?')
            vals.append(int(time.time()))
            vals.append(eid)
            conn.execute(f'UPDATE editors SET {", ".join(sets)} WHERE id = ?', vals)
        conn.commit()

        # Refresh in-session fields for self-edits (re-read the row so the
        # freshly saved display name / flags are reflected immediately).
        if session.get('editor_id') == eid:
            fresh = _editor_row(conn, eid)
            if fresh:
                session['editor_name'] = fresh['display_name']
                session['editor_super'] = bool(fresh['is_super'])
                session['editor_langs'] = fresh['langs']
        result = _editor_row(conn, eid)
    return jsonify(result)


@bp.route('/editors/<int:eid>', methods=['DELETE'])
@require_same_origin
@require_super
def api_delete_editor(editor, eid):
    if eid == editor['id']:
        return jsonify({'error': 'You cannot delete your own account'}), 400
    with get_webdata_db() as conn:
        row = conn.execute('SELECT id FROM editors WHERE id = ?', (eid,)).fetchone()
        if not row:
            return jsonify({'error': 'Editor not found'}), 404
        # SQLite doesn't enforce ON DELETE CASCADE without PRAGMA foreign_keys,
        # so clean up the language grants explicitly.
        conn.execute('DELETE FROM editor_langs WHERE editor_id = ?', (eid,))
        conn.execute('DELETE FROM editors WHERE id = ?', (eid,))
        conn.commit()
    return jsonify({'deleted': eid})


# ══════════════════════════════════════════════════════════════════════════
# EDITOR WORKSPACE
# ══════════════════════════════════════════════════════════════════════════

@bp.route('/languages')
@require_editor
def api_editor_languages(editor):
    """Languages this editor may edit (all for super)."""
    meta = _lang_meta()
    codes = sorted(meta.keys()) if editor['is_super'] else sorted(editor['langs'])
    result = []
    for c in codes:
        info = meta.get(c, {'english_name': c.upper(), 'native_name': c.upper()})
        result.append({'code': c, 'english_name': info['english_name'], 'native_name': info['native_name']})
    return jsonify({'languages': result})


@bp.route('/<lang>/books')
@require_editor
def api_editor_books(editor, lang):
    """Book hierarchy filtered to books that exist in this translation DB."""
    if not _check_lang_permission(editor, lang):
        return jsonify({'error': 'Forbidden'}), 403
    trans_db = _open_trans_db(lang)
    if trans_db is None:
        return jsonify({'error': 'Translation database not found'}), 404

    rows = trans_db.execute('SELECT DISTINCT book_id FROM sentences').fetchall()
    present = {r['book_id'] for r in rows}

    hierarchy = load_hierarchy()
    filtered = {bid: info for bid, info in hierarchy.items() if bid in present}
    menu = organize_hierarchy(filtered)
    return jsonify({'lang': lang, 'menu': menu})


@bp.route('/<lang>/book/<book_id>/toc')
@require_editor
def api_editor_toc(editor, lang, book_id):
    if not _check_lang_permission(editor, lang):
        return jsonify({'error': 'Forbidden'}), 403
    with get_db() as conn:
        toc = get_book_toc(book_id, conn)
    return jsonify({'book_id': book_id, 'toc': toc})


def _section_para_range(book_id, para_id):
    """Return (start_para, end_para) for a TOC section."""
    with get_db() as conn:
        row = conn.execute(
            'SELECT COALESCE(MIN(para_id), 999999) FROM headings '
            'WHERE book_id = ? AND para_id > ? AND level <= 6',
            (book_id, para_id)
        ).fetchone()
    return para_id, (row[0] if row else 999999)


@bp.route('/<lang>/book/<book_id>/section/<int:para_id>')
@require_editor
def api_editor_section(editor, lang, book_id, para_id):
    """Lines for a section: raw Pāli + raw translation + remarks (AI & human)."""
    if not _check_lang_permission(editor, lang):
        return jsonify({'error': 'Forbidden'}), 403
    trans_db = _open_trans_db(lang)
    if trans_db is None:
        return jsonify({'error': 'Translation database not found'}), 404

    start, end = _section_para_range(book_id, para_id)

    with get_db() as conn:
        rows = conn.execute(
            'SELECT para_id, line_id, pali FROM sentences '
            'WHERE book_id = ? AND para_id >= ? AND para_id < ? '
            'ORDER BY para_id, line_id',
            (book_id, start, end)
        ).fetchall()
        sentences = [{'para_id': r['para_id'], 'line_id': r['line_id'], 'pali': r['pali'] or ''} for r in rows]

    trans_map = {}
    trows = trans_db.execute(
        'SELECT para_id, line_id, translation FROM sentences '
        'WHERE book_id = ? AND para_id >= ? AND para_id < ?',
        (book_id, start, end)
    ).fetchall()
    for r in trows:
        trans_map[(r['para_id'], r['line_id'])] = r['translation'] or ''

    remarks = []
    rrows = trans_db.execute(
        'SELECT id, para_id, line_id, kind, status, translation, conflict, '
        'proposed, note, editor_name, source_id, created_at '
        'FROM translation_remarks WHERE book_id = ? AND para_id >= ? AND para_id < ? '
        'ORDER BY para_id, line_id, id',
        (book_id, start, end)
    ).fetchall()
    for r in rrows:
        remarks.append({
            'id': r['id'], 'para_id': r['para_id'], 'line_id': r['line_id'],
            'kind': r['kind'] or 'ai', 'status': r['status'] or 'pending',
            'translation': r['translation'] or '',
            'conflict': r['conflict'] or '', 'proposed': r['proposed'] or '',
            'note': r['note'] or '', 'editor_name': r['editor_name'] or '',
            'source_id': r['source_id'] or '', 'created_at': r['created_at'] or '',
        })

    # Heading sentence (same para_id as section) is included as context.
    for s in sentences:
        s['translation'] = trans_map.get((s['para_id'], s['line_id']), '')

    return jsonify({
        'book_id': book_id,
        'para_id': para_id,
        'sentences': sentences,
        'remarks': remarks,
    })


@bp.route('/<lang>/book/<book_id>/line', methods=['POST'])
@require_same_origin
@require_editor
def api_propose_line(editor, lang, book_id):
    """Save an editor's proposed translation for a line into translation_remarks."""
    if not _check_lang_permission(editor, lang):
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json(silent=True) or {}
    para_id = data.get('para_id')
    line_id = data.get('line_id')
    proposed = (data.get('proposed') or '').strip()
    note = (data.get('note') or '').strip()[:1000]

    if not isinstance(para_id, int) or not isinstance(line_id, int):
        return jsonify({'error': 'para_id and line_id required'}), 400
    if not proposed:
        return jsonify({'error': 'Proposed translation required'}), 400
    if len(proposed) > 20000:
        return jsonify({'error': 'Proposed translation too long'}), 400

    trans_db = _open_trans_db(lang)
    if trans_db is None:
        return jsonify({'error': 'Translation database not found'}), 404

    row = trans_db.execute(
        'SELECT translation FROM sentences WHERE book_id = ? AND para_id = ? AND line_id = ?',
        (book_id, para_id, line_id)
    ).fetchone()
    if not row:
        return jsonify({'error': 'Sentence not found'}), 404

    now = time.strftime('%Y-%m-%d %H:%M:%S')

    # Reuse an existing pending human remark for the same line (no duplicates).
    existing = trans_db.execute(
        "SELECT id FROM translation_remarks WHERE book_id = ? AND para_id = ? AND line_id = ? "
        "AND kind = 'human' AND status = 'pending' ORDER BY id DESC LIMIT 1",
        (book_id, para_id, line_id)
    ).fetchone()

    # Per the data model, `translation` holds the suggested corrected text.
    # `conflict` / `note` are reasons (kept empty for human suggestions — the
    # editor's note goes into `note`).
    if existing:
        trans_db.execute(
            'UPDATE translation_remarks SET translation = ?, note = ?, '
            'editor_id = ?, editor_name = ?, created_at = ? WHERE id = ?',
            (proposed, note, editor['id'], editor['display_name'], now, existing['id'])
        )
        remark_id = existing['id']
    else:
        cur = trans_db.execute(
            'INSERT INTO translation_remarks '
            '(book_id, para_id, line_id, kind, status, translation, note, '
            ' editor_id, editor_name, source_id, created_at) '
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (book_id, para_id, line_id, 'human', 'pending', proposed, note,
             editor['id'], editor['display_name'], book_id, now)
        )
        remark_id = cur.lastrowid
    trans_db.commit()

    return jsonify({'id': remark_id, 'status': 'pending', 'translation': proposed})


# ══════════════════════════════════════════════════════════════════════════
# SUPER ADMIN — REVIEW QUEUE
# ══════════════════════════════════════════════════════════════════════════

@bp.route('/review')
@require_super
def api_review_list(editor):
    """List remarks (AI + human) with optional filters and pagination."""
    lang = (request.args.get('lang') or '').strip()
    kind = (request.args.get('kind') or '').strip()
    status = (request.args.get('status') or '').strip()
    book_id = (request.args.get('book_id') or '').strip()
    try:
        offset = max(0, int(request.args.get('offset', 0)))
        limit = min(200, max(1, int(request.args.get('limit', 100))))
    except (TypeError, ValueError):
        offset, limit = 0, 100

    if lang and not _check_lang_permission(editor, lang):
        return jsonify({'error': 'Forbidden'}), 403

    languages = sorted(_lang_meta().keys()) if editor['is_super'] else sorted(editor['langs'])

    results = []
    totals = {}
    for lc in languages:
        if lang and lc != lang:
            continue
        trans_db = _open_trans_db(lc)
        if trans_db is None:
            continue
        where = []
        vals = []
        if kind:
            where.append('kind = ?')
            vals.append(kind)
        if status:
            where.append('status = ?')
            vals.append(status)
        if book_id:
            where.append('book_id = ?')
            vals.append(book_id)
        where_sql = (' WHERE ' + ' AND '.join(where)) if where else ''

        cnt = trans_db.execute(
            f'SELECT COUNT(*) AS c FROM translation_remarks{where_sql}', vals
        ).fetchone()['c']
        totals[lc] = cnt

        rows = trans_db.execute(
            f'SELECT id, book_id, para_id, line_id, kind, status, translation, '
            f'conflict, proposed, note, editor_name, source_id, created_at '
            f'FROM translation_remarks{where_sql} ORDER BY id DESC LIMIT ? OFFSET ?',
            vals + [limit, offset]
        ).fetchall()
        lang_rows = []
        for r in rows:
            lang_rows.append({
                'lang': lc,
                'id': r['id'], 'book_id': r['book_id'], 'para_id': r['para_id'],
                'line_id': r['line_id'], 'kind': r['kind'] or 'ai', 'status': r['status'] or 'pending',
                'translation': r['translation'] or '',
                'conflict': r['conflict'] or '', 'proposed': r['proposed'] or '',
                'note': r['note'] or '', 'editor_name': r['editor_name'] or '',
                'source_id': r['source_id'] or '', 'created_at': r['created_at'] or '',
            })
        # Current live translation for each flagged line (so the reviewer sees
        # before → after).  Real Pāli comes from the main epitaka.db (the
        # remarks table's pali column is being removed).
        # Track which (para, line) keys exist in this translation DB so rows
        # pointing at missing sentences are flagged rather than shown apply-able.
        existing_keys = {}
        for bid in sorted({rr['book_id'] for rr in lang_rows}):
            live_map = {}
            pali_map = {}
            for sr in trans_db.execute(
                'SELECT para_id, line_id, translation FROM sentences WHERE book_id = ?', (bid,)
            ).fetchall():
                live_map[(sr['para_id'], sr['line_id'])] = sr['translation'] or ''
            with get_db() as conn:
                for pr in conn.execute(
                    'SELECT para_id, line_id, pali FROM sentences WHERE book_id = ?', (bid,)
                ).fetchall():
                    pali_map[(pr['para_id'], pr['line_id'])] = pr['pali'] or ''
            existing_keys[bid] = set(live_map.keys())
            for rr in lang_rows:
                if rr['book_id'] != bid:
                    continue
                rr['live'] = live_map.get((rr['para_id'], rr['line_id']), '')
                rr['pali'] = pali_map.get((rr['para_id'], rr['line_id']), '')
        # Mark which remarks can actually be applied (so the UI can annotate
        # the rest instead of showing a misleading diff).
        for rr in lang_rows:
            if (rr['para_id'], rr['line_id']) not in existing_keys.get(rr['book_id'], set()):
                rr['applicable'] = False
                rr['apply_msg'] = 'Sentence not found in the translation database'
                continue
            ok, msg = _suggestion_check(rr, rr['live'])
            rr['applicable'] = ok
            rr['apply_msg'] = msg if not ok else ''
        results.extend(lang_rows)

    return jsonify({
        'items': results,
        'totals': totals,
        'offset': offset,
        'limit': limit,
    })


def _suggestion_check(remark, live):
    """Return (ok, message) for whether a remark's suggestion can be applied.

    Per the data model, `translation` holds the suggested corrected text, and
    `conflict` / `note` are reasons.  Older human remarks stored the suggestion
    in `proposed`, so fall back to it."""
    suggestion = remark['proposed'] or remark['translation'] or ''
    if not suggestion:
        return False, 'No suggested text'
    if suggestion == live:
        return False, 'Suggestion is identical to the current text'
    if remark['kind'] == 'ai' and suggestion in live and len(suggestion) < len(live):
        # Phrase-level AI flag: the suggestion is a snippet already inside the
        # live sentence, not a full replacement — applying would truncate it.
        return False, 'Suggestion is a phrase within the current text — needs a full-line proposal'
    return True, ''


def _apply_remark(trans_db, remark, applied_by):
    """Apply a single remark into the live sentences table. Returns (ok, message)."""
    if remark['status'] == 'applied':
        return False, 'Already applied'
    row = trans_db.execute(
        'SELECT translation FROM sentences WHERE book_id = ? AND para_id = ? AND line_id = ?',
        (remark['book_id'], remark['para_id'], remark['line_id'])
    ).fetchone()
    if not row:
        return False, 'Sentence not found'
    live = row['translation'] or ''
    ok, msg = _suggestion_check(remark, live)
    if not ok:
        return False, msg

    suggestion = remark['proposed'] or remark['translation'] or ''
    cur = trans_db.execute(
        'UPDATE sentences SET translation = ? WHERE book_id = ? AND para_id = ? AND line_id = ?',
        (suggestion, remark['book_id'], remark['para_id'], remark['line_id'])
    )
    if cur.rowcount == 0:
        return False, 'Sentence not found'

    now = time.strftime('%Y-%m-%d %H:%M:%S')
    trans_db.execute(
        'UPDATE translation_remarks SET status = ?, applied_at = ?, applied_by = ? WHERE id = ?',
        ('applied', now, applied_by, remark['id'])
    )
    return True, 'Applied'


@bp.route('/review/apply', methods=['POST'])
@require_same_origin
@require_super
def api_review_apply(editor):
    """Apply selected remarks. Ids are scoped per language, so the client sends
    a list of {lang, id} pairs."""
    data = request.get_json(silent=True) or {}
    items = data.get('items') or []
    if not isinstance(items, list) or not items:
        return jsonify({'error': 'items (list of {lang, id}) required'}), 400

    results = []
    committed = []
    for item in items:
        if not isinstance(item, dict):
            results.append({'ok': False, 'message': 'Invalid item'})
            continue
        lc = str(item.get('lang') or '')
        rid = item.get('id')
        if not lc or not isinstance(rid, int):
            results.append({'ok': False, 'message': 'Invalid item (lang + id required)'})
            continue
        if not _check_lang_permission(editor, lc):
            results.append({'id': rid, 'ok': False, 'message': 'Forbidden'})
            continue
        trans_db = _open_trans_db(lc)
        if trans_db is None:
            results.append({'id': rid, 'ok': False, 'message': 'Translation database not found'})
            continue
        row = trans_db.execute(
            'SELECT id, book_id, para_id, line_id, kind, status, translation, conflict, proposed '
            'FROM translation_remarks WHERE id = ?', (rid,)
        ).fetchone()
        if not row:
            results.append({'id': rid, 'ok': False, 'message': 'Remark not found'})
            continue
        ok, msg = _apply_remark(trans_db, dict(row), editor['display_name'])
        results.append({'id': rid, 'lang': lc, 'ok': ok, 'message': msg})
        if trans_db not in committed:
            committed.append(trans_db)
    for conn in committed:
        try:
            conn.commit()
        except Exception:
            pass
    return jsonify({'results': results})


@bp.route('/review/apply_all', methods=['POST'])
@require_same_origin
@require_super
def api_review_apply_all(editor):
    """Apply all pending remarks matching filters (per language)."""
    data = request.get_json(silent=True) or {}
    kind = (data.get('kind') or '').strip()
    status = (data.get('status') or 'pending').strip()
    book_id = (data.get('book_id') or '').strip()
    lang_filter = (data.get('lang') or '').strip()
    if lang_filter and not _check_lang_permission(editor, lang_filter):
        return jsonify({'error': 'Forbidden'}), 403

    languages = sorted(_lang_meta().keys()) if editor['is_super'] else sorted(editor['langs'])
    if lang_filter:
        languages = [l for l in languages if l == lang_filter]
    summary = []
    for lc in languages:
        trans_db = _open_trans_db(lc)
        if trans_db is None:
            continue
        where = ['status = ?']
        vals = [status]
        if kind:
            where.append('kind = ?')
            vals.append(kind)
        if book_id:
            where.append('book_id = ?')
            vals.append(book_id)
        where_sql = ' AND '.join(where)
        rows = trans_db.execute(
            f'SELECT id, book_id, para_id, line_id, kind, status, translation, conflict, proposed '
            f'FROM translation_remarks WHERE {where_sql}', vals
        ).fetchall()
        ok = 0
        fail = 0
        errors = []
        for r in rows:
            good, msg = _apply_remark(trans_db, dict(r), editor['display_name'])
            if good:
                ok += 1
            else:
                fail += 1
                if len(errors) < 5:
                    errors.append({'id': r['id'], 'message': msg})
        trans_db.commit()
        summary.append({'lang': lc, 'applied': ok, 'failed': fail, 'errors': errors})
    return jsonify({'summary': summary})


@bp.route('/review/reject', methods=['POST'])
@require_same_origin
@require_super
def api_review_reject(editor):
    """Reject selected remarks. Ids are scoped per language — the client sends
    a list of {lang, id} pairs."""
    data = request.get_json(silent=True) or {}
    items = data.get('items') or []
    if not isinstance(items, list) or not items:
        return jsonify({'error': 'items (list of {lang, id}) required'}), 400

    now = time.strftime('%Y-%m-%d %H:%M:%S')
    rejected = 0
    by_lang = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        lc = str(item.get('lang') or '')
        rid = item.get('id')
        if not lc or not isinstance(rid, int):
            continue
        if not _check_lang_permission(editor, lc):
            continue
        by_lang.setdefault(lc, []).append(rid)

    for lc, ids in by_lang.items():
        trans_db = _open_trans_db(lc)
        if trans_db is None:
            continue
        placeholders = ','.join('?' for _ in ids)
        cur = trans_db.execute(
            f'UPDATE translation_remarks SET status = ?, rejected_at = ?, rejected_by = ? '
            f'WHERE id IN ({placeholders})',
            ['rejected', now, editor['display_name']] + ids
        )
        rejected += cur.rowcount
        trans_db.commit()
    return jsonify({'rejected': rejected})

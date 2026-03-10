# app/routes/auth.py
import os
import time
from functools import wraps

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from flask import Blueprint, jsonify, request, g

from ..utils.db import get_db
from ..config import Config

bp = Blueprint('auth', __name__)


# Firebase init (should be done once – better in extensions.py later)
_SA_PATH = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON', Config.FIREBASE_SERVICE_ACCOUNT_JSON)
if not firebase_admin._apps:
    cred = credentials.Certificate(_SA_PATH)
    firebase_admin.initialize_app(cred)

def verify_firebase_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header[7:].strip()
    try:
        return firebase_auth.verify_id_token(token)
    except Exception:
        return None


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        decoded = verify_firebase_token()
        if not decoded:
            return jsonify({'error': 'Unauthorized'}), 401
        g.uid = decoded['uid']
        g.decoded_token = decoded
        return f(*args, **kwargs)
    return decorated


def _upsert_user(conn, decoded_token):
    uid = decoded_token['uid']
    name = decoded_token.get('name', '')
    email = decoded_token.get('email', '')
    photo = decoded_token.get('picture', '')
    now = int(time.time())
    conn.execute('''
        INSERT INTO users (uid, display_name, email, photo_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(uid) DO UPDATE SET
            email = excluded.email,
            photo_url = CASE WHEN users.photo_url != '' THEN users.photo_url ELSE excluded.photo_url END,
            updated_at = excluded.updated_at
    ''', (uid, name, email, photo, now, now))
    conn.commit()


# ── Schema migration (call at app startup) ────────────────────

def init_auth_db():
    with get_db() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                uid          TEXT    PRIMARY KEY,
                display_name TEXT    NOT NULL DEFAULT '',
                email        TEXT    NOT NULL DEFAULT '',
                photo_url    TEXT    NOT NULL DEFAULT '',
                created_at   INTEGER NOT NULL,
                updated_at   INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS comments (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id    TEXT    NOT NULL,
                para_id    INTEGER NOT NULL,
                line_id    INTEGER NOT NULL,
                uid        TEXT    NOT NULL,
                text       TEXT    NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (uid) REFERENCES users(uid)
            );
            CREATE INDEX IF NOT EXISTS idx_comments_book_para
                ON comments (book_id, para_id);
        ''')


# ── Routes ────────────────────────────────────────────────────

@bp.route('/api/auth/sync', methods=['POST'])
@require_auth
def api_auth_sync():
    """Sync Firebase user into SQLite; returns profile row."""
    with get_db() as conn:
        _upsert_user(conn, g.decoded_token)
        cursor = conn.cursor()
        cursor.execute(
            'SELECT uid, display_name, email, photo_url FROM users WHERE uid = ?',
            (g.uid,)
        )
        row = cursor.fetchone()
    return jsonify(dict(row))


@bp.route('/api/auth/profile', methods=['PATCH'])
@require_auth
def api_auth_profile():
    """Update display_name and/or photo_url for the logged-in user."""
    data    = request.get_json(silent=True) or {}
    updates = {}
    if isinstance(data.get('display_name'), str):
        updates['display_name'] = data['display_name'].strip()[:80]
    if isinstance(data.get('photo_url'), str):
        updates['photo_url'] = data['photo_url'].strip()[:512]
    if not updates:
        return jsonify({'error': 'Nothing to update'}), 400

    sets = ', '.join(f'{k} = ?' for k in updates)
    vals = list(updates.values()) + [int(time.time()), g.uid]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'UPDATE users SET {sets}, updated_at = ? WHERE uid = ?', vals)
        conn.commit()
        cursor.execute(
            'SELECT uid, display_name, email, photo_url FROM users WHERE uid = ?',
            (g.uid,)
        )
        row = cursor.fetchone()
    return jsonify(dict(row))
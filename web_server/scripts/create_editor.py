#!/usr/bin/env python3
"""
create_editor.py — manage E-Piṭaka translation-editor accounts.

The web app itself only lets a SUPER admin create further accounts (no public
registration).  This script is how you bootstrap the *first* super admin
(alternative: set EDITOR_ADMIN_EMAIL / EDITOR_ADMIN_PASSWORD env vars before
starting the server).

Usage (run from web_server/):

  # Create / update a super admin
  python3 scripts/create_editor.py --email admin@example.org --password 's3cret' --super

  # Create / update a regular editor with two languages
  python3 scripts/create_editor.py --email editor@example.org --password 's3cret' \
      --langs en,vi --display-name "Editor Name"

  # Reset an existing editor's password
  python3 scripts/create_editor.py --email editor@example.org --password 'newpass'

The email is matched case-insensitively; existing accounts are updated in place
(display name, password, super flag and language list are all refreshed).
"""
import argparse
import os
import sqlite3
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from werkzeug.security import generate_password_hash  # noqa: E402

_HASH_METHOD = 'pbkdf2:sha256'

from app.config import Config  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--email', required=True, help='Editor email (lowercased)')
    ap.add_argument('--password', required=True, help='Password (min 8 chars)')
    ap.add_argument('--display-name', default='', help='Display name')
    ap.add_argument('--langs', default='', help='Comma-separated language codes (e.g. en,vi)')
    ap.add_argument('--super', action='store_true', help='Make this account a super admin')
    args = ap.parse_args()

    if len(args.password) < 8:
        print('ERROR: password must be at least 8 characters', file=sys.stderr)
        sys.exit(1)

    email = args.email.strip().lower()
    langs = [l.strip() for l in args.langs.split(',') if l.strip()]
    now = int(time.time())

    db_path = Config.WEBDATA_DB
    print(f'Updating {db_path} …')
    conn = sqlite3.connect(db_path)
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS editors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            display_name TEXT NOT NULL DEFAULT '',
            is_super INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS editor_langs (
            editor_id INTEGER NOT NULL,
            lang_code TEXT NOT NULL,
            PRIMARY KEY (editor_id, lang_code)
        )''')

        row = conn.execute('SELECT id FROM editors WHERE email = ?', (email,)).fetchone()
        if row:
            eid = row[0]
            conn.execute(
                'UPDATE editors SET password_hash = ?, display_name = ?, is_super = ?, updated_at = ? '
                'WHERE id = ?',
                (generate_password_hash(args.password, method=_HASH_METHOD), args.display_name,
                 int(args.super), now, eid)
            )
            print(f'Updated editor id={eid} ({email})')
        else:
            cur = conn.execute(
                'INSERT INTO editors (email, password_hash, display_name, is_super, created_at, updated_at) '
                'VALUES (?, ?, ?, ?, ?, ?)',
                (email, generate_password_hash(args.password, method=_HASH_METHOD), args.display_name,
                 int(args.super), now, now)
            )
            eid = cur.lastrowid
            print(f'Created editor id={eid} ({email})')

        if args.langs:
            conn.execute('DELETE FROM editor_langs WHERE editor_id = ?', (eid,))
            conn.executemany(
                'INSERT INTO editor_langs (editor_id, lang_code) VALUES (?, ?)',
                [(eid, l) for l in langs]
            )
            print(f'  languages: {", ".join(langs) or "(none)"}')
        conn.commit()
    finally:
        conn.close()

    print('Done.')


if __name__ == '__main__':
    main()

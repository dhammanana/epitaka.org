#!/usr/bin/env python3
"""
Add performance indexes to epitaka.db for the web server's hot queries.

The original database shipped with indexes tuned for the mobile app.  The
web server frequently filters sentences and headings by (book_id, ...) first,
so it benefits from leading book_id indexes.  All statements are
IF NOT EXISTS — safe to run repeatedly on a live database.

Usage:
    python3 scripts/add_indexes.py
"""
import sqlite3
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data')
EPITAKA_DB = os.path.join(DATA_DIR, 'epitaka.db')

STATEMENTS = [
    # Section fetches: WHERE book_id=? AND para_id>=? AND para_id<? ORDER BY line_id
    # (also covers the GROUP BY para_id used by get_book_toc)
    "CREATE INDEX IF NOT EXISTS idx_sentences_book_para_line "
    "ON sentences(book_id, para_id, line_id)",

    # bold_suggest / bold_definition: WHERE d.plain LIKE ? (exact match in practice)
    "CREATE INDEX IF NOT EXISTS idx_palidef_plain "
    "ON pali_definition(plain)",

    # headings parent lookups already served by (book_id, para_id);
    # add level to speed level=10 scans on large books.
    "CREATE INDEX IF NOT EXISTS idx_headings_book_level "
    "ON headings(book_id, level, para_id)",
]


def main():
    if not os.path.isfile(EPITAKA_DB):
        print(f"epitaka.db not found at {EPITAKA_DB}", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(EPITAKA_DB)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")  # wait for translator/web writers
    try:
        for sql in STATEMENTS:
            conn.execute(sql)
            print(f"  ok: {sql.splitlines()[0].strip()}")
        conn.commit()
    finally:
        conn.close()
    print("Done. Indexes added to epitaka.db")


if __name__ == '__main__':
    main()

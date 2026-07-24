#!/usr/bin/env python3
"""
Migration script to create paragraphs_fts in an existing webdata.db.

This script:
  1. Creates paragraphs_fts table if it doesn't exist
  2. Populates it with newline-separated paragraph text from epitaka.db
  3. Does NOT drop any existing tables (safe to run on a live database)

Usage:
    python3 scripts/migrate_paragraphs_fts.py
"""
import sqlite3
import os
import re
import sys

# ── Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data')
EPITAKA_DB = os.path.join(DATA_DIR, 'epitaka.db')
WEBDATA_DB = os.path.join(DATA_DIR, 'webdata.db')


def clean_pali(text: str) -> str:
    """Clean Pali text for indexing."""
    text = text.lower()
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[\*\[\]\(\)]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def main():
    print("=" * 60)
    print("Migrate: Add paragraphs_fts to webdata.db")
    print("=" * 60)

    # ── Check files ─────────────────────────────────────────────────────
    for path, label in [(EPITAKA_DB, 'Source epitaka.db'), (WEBDATA_DB, 'Target webdata.db')]:
        if not os.path.isfile(path):
            print(f"ERROR: {label} not found at {path}")
            sys.exit(1)
        print(f"  {label}: {os.path.getsize(path):,} bytes")

    # ── Open databases ──────────────────────────────────────────────────
    epi_conn = sqlite3.connect(EPITAKA_DB)
    epi_conn.row_factory = sqlite3.Row
    web_conn = sqlite3.connect(WEBDATA_DB)

    # ── Create paragraphs_fts if not exists ─────────────────────────────
    print("\n[1] Creating paragraphs_fts table (if not exists)...")
    web_conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS paragraphs_fts USING fts5(
            book_id              UNINDEXED,
            para_id              UNINDEXED,
            paragraph_text,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)
    web_conn.commit()

    # Check if already populated
    count = web_conn.execute("SELECT COUNT(*) FROM paragraphs_fts").fetchone()[0]
    if count > 0:
        print(f"  ✓ paragraphs_fts already has {count:,} rows. Skipping population.")
        epi_conn.close()
        web_conn.close()
        print("Done.")
        return

    # ── Query and populate ──────────────────────────────────────────────
    print("\n[2] Querying sentences from epitaka.db...")
    rows = epi_conn.execute("""
        SELECT book_id, para_id, line_id, pali
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """).fetchall()
    print(f"    {len(rows):,} lines found.")

    # Group by (book_id, para_id), join with newline
    print("\n[3] Building paragraphs (grouping by book_id, para_id)...")
    paragraph_map = {}
    for row in rows:
        key = (row['book_id'], row['para_id'])
        if key not in paragraph_map:
            paragraph_map[key] = []
        paragraph_map[key].append((row['line_id'], row['pali']))
    print(f"    {len(paragraph_map):,} paragraphs to insert.")

    # Insert
    print("\n[4] Inserting into paragraphs_fts...")
    BATCH_SIZE = 5000
    inserted = 0
    web_cursor = web_conn.cursor()
    for (book_id, para_id), lines in paragraph_map.items():
        para_parts = []
        for (lid, pali) in lines:
            para_parts.append(clean_pali(pali or ''))
        para_text = '\n'.join(para_parts)

        web_cursor.execute(
            "INSERT INTO paragraphs_fts (book_id, para_id, paragraph_text) VALUES (?, ?, ?)",
            (book_id, para_id, para_text),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(f"    {inserted:,}/{len(paragraph_map):,} committed.")

    web_conn.commit()
    print(f"  ✓ {inserted:,} rows inserted into paragraphs_fts.")

    # ── Cleanup ─────────────────────────────────────────────────────────
    epi_conn.close()
    web_conn.close()
    print(f"\nDone! paragraphs_fts is ready with {inserted:,} paragraphs.")


if __name__ == '__main__':
    main()

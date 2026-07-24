#!/usr/bin/env python3
"""
Standalone script to rebuild FTS5 search indexes in webdata.db.

Usage:
    python3 scripts/rebuild_fts.py

This script:
  1. Creates/opens webdata.db in the data/ directory
  2. Drops and recreates paragraphs_fts (newline-separated paragraph index)
     and words (autocomplete frequency index)
  3. Reads Pāli text from epitaka.db (read-only, does not modify it)
  4. Populates the FTS tables for fast full-text search

The FTS tables live in webdata.db so they do NOT bloat epitaka.db
(which is shared with the mobile app).
"""
import sqlite3
import os
import re
import unicodedata
from collections import defaultdict
from typing import List, Optional

# ── Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data')
EPITAKA_DB = os.path.join(DATA_DIR, 'epitaka.db')
WEBDATA_DB = os.path.join(DATA_DIR, 'webdata.db')


# ── Text helpers ───────────────────────────────────────────────────────────

def strip_diacritics(text: str) -> str:
    if not text:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def clean_pali_for_indexing(text: str) -> str:
    """Clean Pali text: lowercase, remove HTML/markdown markers, normalize spaces."""
    text = text.lower()
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[\*\[\]\(\)]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# ── Database helpers ───────────────────────────────────────────────────────

def open_epitaka_db():
    """Open epitaka.db (read-only)."""
    if not os.path.isfile(EPITAKA_DB):
        print(f"ERROR: epitaka.db not found at {EPITAKA_DB}")
        exit(1)
    conn = sqlite3.connect(EPITAKA_DB)
    conn.row_factory = sqlite3.Row
    return conn


def open_webdata_db():
    """Open webdata.db (creates if not exists)."""
    conn = sqlite3.connect(WEBDATA_DB)
    conn.row_factory = sqlite3.Row
    return conn


# ── FTS table management ───────────────────────────────────────────────────

def drop_fts_tables(conn):
    """Drop all FTS tables from webdata.db."""
    tables = [
        "passages_fts",
        "sentences_fts_v2",
        "sentences_fts",
        "paragraphs_fts",
    ]
    for table in tables:
        print(f"  → Dropping {table}...")
        try:
            conn.execute(f"DROP TABLE IF EXISTS {table}")
        except Exception as e:
            print(f"    Warning: {e}")
    conn.commit()


def create_fts_tables(conn):
    """Create FTS tables in webdata.db."""
    print("  → Creating paragraphs_fts (paragraph level, newline-separated lines)...")
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS paragraphs_fts USING fts5(
            book_id              UNINDEXED,
            para_id              UNINDEXED,
            paragraph_text,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)

    print("  → Creating words table...")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS words (
            word        TEXT COLLATE NOCASE NOT NULL,
            plain       TEXT COLLATE NOCASE,
            frequency   INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (word)
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_words_plain ON words (plain)")
    conn.commit()


# ── Main rebuild ───────────────────────────────────────────────────────────

def rebuild_fts():
    print("=" * 60)
    print("Rebuilding FTS indexes in webdata.db")
    print("Source: epitaka.db (read-only)")
    print("Target: webdata.db")
    print("=" * 60)

    # ── Open databases ──────────────────────────────────────────────────
    print("\n[1] Opening databases...")
    epi_conn = open_epitaka_db()
    web_conn = open_webdata_db()
    print(f"    epitaka.db: {os.path.getsize(EPITAKA_DB):,} bytes")
    print(f"    webdata.db: {'exists' if os.path.isfile(WEBDATA_DB) else 'will be created'}")

    # ── Drop & create tables ────────────────────────────────────────────
    print("\n[2] Resetting tables in webdata.db...")
    drop_fts_tables(web_conn)
    create_fts_tables(web_conn)

    # ── Query Pali text from epitaka.db ─────────────────────────────────
    print("\n[3] Querying Pali text from epitaka.db...")
    sent_rows = epi_conn.execute("""
        SELECT book_id, para_id, line_id, pali
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """).fetchall()
    print(f"    {len(sent_rows):,} individual lines found.")

    # Group into paragraphs with newline-separated lines
    print("\n[4] Building paragraphs (grouping lines by book_id, para_id)...")
    paragraph_map = {}
    for row in sent_rows:
        key = (row['book_id'], row['para_id'])
        if key not in paragraph_map:
            paragraph_map[key] = []
        paragraph_map[key].append({
            'line_id': row['line_id'],
            'pali': row['pali'],
        })
    print(f"    {len(paragraph_map):,} paragraphs built.")

    # ── Word extraction ─────────────────────────────────────────────────
    print("\n[5] Extracting words for autocomplete index...")
    word_data = defaultdict(lambda: {"plain": "", "freq": 0})
    for key, lines in paragraph_map.items():
        for line in lines:
            pali_text = (line['pali'] or '').replace('*', '')
            pali_text = clean_pali_for_indexing(pali_text)
            for w in pali_text.split():
                w = w.strip('.,!?;:"()[]{}#*').lower()
                if w:
                    if not word_data[w]["plain"]:
                        word_data[w]["plain"] = strip_diacritics(w)
                    word_data[w]["freq"] += 1
    print(f"    {len(word_data):,} unique words extracted.")

    # ── Insert into paragraphs_fts ──────────────────────────────────────
    print("\n[6] Inserting into paragraphs_fts (paragraph level)...")
    BATCH_SIZE = 5000
    inserted = 0
    for (book_id, para_id), lines in paragraph_map.items():
        # Join lines with newline so each line is a separate token span
        para_text_parts = []
        for line in lines:
            pali = clean_pali_for_indexing((line['pali'] or '').replace('*', ''))
            para_text_parts.append(pali)
        para_text = '\n'.join(para_text_parts)

        web_conn.execute(
            "INSERT INTO paragraphs_fts (book_id, para_id, paragraph_text) VALUES (?, ?, ?)",
            (book_id, para_id, para_text),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(f"    {inserted:,}/{len(paragraph_map):,} paragraph FTS rows committed.")
    web_conn.commit()
    print(f"    ✓ {inserted:,} rows inserted into paragraphs_fts.")

    # ── Insert into words ──────────────────────────────────────────────
    print("\n[7] Inserting into words table...")
    cursor = web_conn.cursor()
    buffer = []
    for word, data in word_data.items():
        buffer.append((word, data["plain"], data["freq"]))
        if len(buffer) >= BATCH_SIZE:
            cursor.executemany(
                "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
                buffer,
            )
            web_conn.commit()
            buffer.clear()
    if buffer:
        cursor.executemany(
            "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
            buffer,
        )
        web_conn.commit()
    print(f"    ✓ {len(word_data):,} entries inserted into words.")

    # ── Finalize ──────────────────────────────────────────────────────────
    print("\n[8] Vacuuming webdata.db...")
    web_conn.execute("VACUUM")
    print(f"    Final size: {os.path.getsize(WEBDATA_DB):,} bytes")

    epi_conn.close()
    web_conn.close()

    print("\n" + "=" * 60)
    print("FTS rebuild complete!")
    print(f"  {len(paragraph_map):,} paragraphs indexed")
    print(f"  {len(word_data):,} unique words")
    print("=" * 60)


if __name__ == "__main__":
    rebuild_fts()

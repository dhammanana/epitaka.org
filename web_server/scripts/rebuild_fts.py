#!/usr/bin/env python3
"""
Standalone script to rebuild FTS5 search indexes in webdata.db.

Usage:
    python3 scripts/rebuild_fts.py

This script:
  1. Creates/opens webdata.db in the data/ directory
  2. Drops and recreates all FTS tables (sentences_fts, sentences_fts_v2, passages_fts, words)
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

PASSAGE_TARGET = 4  # soft sentence target for passage building


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
        "words",
    ]
    for table in tables:
        print(f"  → Dropping {table}...")
        try:
            conn.execute(f"DROP TABLE IF EXISTS {table}")
        except Exception as e:
            print(f"    Warning: {e}")
    conn.commit()


def create_fts_tables(conn):
    """Create all FTS tables in webdata.db."""
    print("  → Creating sentences_fts (paragraph level)...")
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts USING fts5(
            book_id              UNINDEXED,
            para_id              UNINDEXED,
            pali_paragraph,
            english_paragraph,
            vietnamese_paragraph,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)

    print("  → Creating sentences_fts_v2 (sentence level)...")
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts_v2 USING fts5(
            book_id              UNINDEXED,
            para_id              UNINDEXED,
            line_id              UNINDEXED,
            pali_sentence,
            english_translation,
            vietnamese_translation,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)

    print("  → Creating passages_fts (sliding-window passage level)...")
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS passages_fts USING fts5(
            book_id              UNINDEXED,
            anchor_para_id       UNINDEXED,
            seq_start            UNINDEXED,
            seq_end              UNINDEXED,
            pali_passage,
            english_passage,
            vietnamese_passage,
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


# ── Passage building ───────────────────────────────────────────────────────

def _emit_passage(buffer, book_id, window):
    """Append one passage tuple to buffer from a list of sentence rows."""
    pali_parts = []
    for s in window:
        pali_parts.append((s['pali'] or '').replace('*', ''))
    buffer.append((
        book_id,
        window[0]['para_id'],   # anchor_para_id
        window[0]['line_id'],   # seq_start
        window[-1]['line_id'],  # seq_end
        ' '.join(pali_parts),
        '',  # english_passage (not indexed for Pali)
        '',  # vietnamese_passage (not indexed for Pali)
    ))


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
    print("\n[2] Resetting FTS tables in webdata.db...")
    drop_fts_tables(web_conn)
    create_fts_tables(web_conn)

    # ── Query Pali text from epitaka.db ─────────────────────────────────
    print("\n[3] Querying Pali text from epitaka.db...")
    para_rows = epi_conn.execute("""
        SELECT book_id, para_id,
               GROUP_CONCAT(pali, ' ') AS pali_paragraph
        FROM sentences
        GROUP BY book_id, para_id
        ORDER BY book_id, para_id
    """).fetchall()
    print(f"    {len(para_rows):,} paragraphs found.")

    sent_rows = epi_conn.execute("""
        SELECT book_id, para_id, line_id, pali
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """).fetchall()
    print(f"    {len(sent_rows):,} sentences found.")

    # ── Word extraction ─────────────────────────────────────────────────
    print("\n[4] Extracting words for autocomplete index...")
    word_data = defaultdict(lambda: {"plain": "", "freq": 0})
    for row in para_rows:
        pali_text = (row['pali_paragraph'] or "").replace("*", "")
        pali_text = clean_pali_for_indexing(pali_text)
        for w in pali_text.split():
            w = w.strip('.,!?;:"()[]{}#*').lower()
            if w:
                if not word_data[w]["plain"]:
                    word_data[w]["plain"] = strip_diacritics(w)
                word_data[w]["freq"] += 1
    print(f"    {len(word_data):,} unique words extracted.")

    # ── Insert into sentences_fts ──────────────────────────────────────
    print("\n[5] Inserting into sentences_fts (paragraph level)...")
    BATCH_SIZE = 5000
    inserted = 0
    for row in para_rows:
        pali_text = clean_pali_for_indexing((row['pali_paragraph'] or "").replace("*", ""))
        web_conn.execute(
            "INSERT INTO sentences_fts (book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph) "
            "VALUES (?, ?, ?, ?, ?)",
            (row['book_id'], row['para_id'], pali_text, '', ''),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(f"    {inserted:,}/{len(para_rows):,} paragraph FTS rows committed.")
    web_conn.commit()
    print(f"    ✓ {inserted:,} rows inserted into sentences_fts.")

    # ── Insert into sentences_fts_v2 ───────────────────────────────────
    print("\n[6] Inserting into sentences_fts_v2 (sentence level)...")
    inserted = 0
    for row in sent_rows:
        pali_text = clean_pali_for_indexing((row['pali'] or "").replace("*", ""))
        web_conn.execute(
            "INSERT INTO sentences_fts_v2 (book_id, para_id, line_id, pali_sentence, english_translation, vietnamese_translation) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (row['book_id'], row['para_id'], row['line_id'], pali_text, '', ''),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(f"    {inserted:,}/{len(sent_rows):,} sentence FTS rows committed.")
    web_conn.commit()
    print(f"    ✓ {inserted:,} rows inserted into sentences_fts_v2.")

    # ── Build and insert passages ──────────────────────────────────────
    print(f"\n[7] Building passages (paragraph-rounded, target={PASSAGE_TARGET} sentences)...")
    books_paras = defaultdict(list)
    cur_key = None
    cur_para = None
    for row in sent_rows:
        key = row['book_id']
        pid = row['para_id']
        if key != cur_key or pid != cur_para:
            books_paras[key].append([])
            cur_key = key
            cur_para = pid
        books_paras[key][-1].append(row)

    passage_buffer = []
    total_passages = 0

    for book_id, paras in books_paras.items():
        np = len(paras)
        p = 0
        while p < np:
            window_paras = []
            sentence_count = 0
            q = p
            while q < np:
                window_paras.append(paras[q])
                sentence_count += len(paras[q])
                q += 1
                if sentence_count >= PASSAGE_TARGET:
                    break
            flat = [s for para in window_paras for s in para]
            _emit_passage(passage_buffer, book_id, flat)
            total_passages += 1
            if len(passage_buffer) >= BATCH_SIZE:
                web_conn.executemany(
                    "INSERT INTO passages_fts (book_id, anchor_para_id, seq_start, seq_end, "
                    "pali_passage, english_passage, vietnamese_passage) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    passage_buffer,
                )
                web_conn.commit()
                print(f"    {total_passages:,} passage rows committed...")
                passage_buffer.clear()
            p += 1

    if passage_buffer:
        web_conn.executemany(
            "INSERT INTO passages_fts (book_id, anchor_para_id, seq_start, seq_end, "
            "pali_passage, english_passage, vietnamese_passage) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            passage_buffer,
        )
        web_conn.commit()
    print(f"    ✓ {total_passages:,} rows inserted into passages_fts.")

    # ── Insert into words ──────────────────────────────────────────────
    print("\n[8] Inserting into words table...")
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
    print("\n[9] Vacuuming webdata.db...")
    web_conn.execute("VACUUM")
    print(f"    Final size: {os.path.getsize(WEBDATA_DB):,} bytes")

    epi_conn.close()
    web_conn.close()

    print("\n" + "=" * 60)
    print("FTS rebuild complete!")
    print(f"  {len(para_rows):,} paragraphs indexed")
    print(f"  {len(sent_rows):,} sentences indexed")
    print(f"  {total_passages:,} passages built")
    print(f"  {len(word_data):,} unique words")
    print("=" * 60)


if __name__ == "__main__":
    rebuild_fts()

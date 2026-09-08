#!/usr/bin/env python3
"""
Standalone script to rebuild FTS5 search indexes in webdata.db.

Usage:
    python3 scripts/rebuild_fts.py [--langs vi,en] [--skip-translations]

This script:
  1. Creates/opens webdata.db in the data/ directory
  2. Drops and recreates paragraphs_fts (Pāli, newline-separated paragraph
     index) and words (autocomplete frequency index)
  3. Reads Pāli text from epitaka.db (read-only, does not modify it)
  4. Reads each translation from epitaka_<lang>.db (read-only) and builds
     one FTS table per language: fts_<lang>_trans (e.g. fts_vi_trans)
  5. Populates the FTS tables for fast full-text search

All FTS tables live in webdata.db so they do NOT bloat epitaka.db
(which is shared with the mobile app) or the epitaka_<lang>.db files.
Search picks the translation table matching the user's selected language.
"""

import argparse
import sqlite3
import os
import re
import unicodedata
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

# ── Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
EPITAKA_DB = os.path.join(DATA_DIR, "epitaka.db")
WEBDATA_DB = os.path.join(DATA_DIR, "webdata.db")


# ── Text helpers ───────────────────────────────────────────────────────────


def strip_diacritics(text: str) -> str:
    if not text:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


def clean_pali_for_indexing(text: str) -> str:
    """Clean Pali text: lowercase, remove HTML/markdown markers, normalize spaces."""
    text = text.lower()
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[\*\[\]\(\)]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def clean_trans_for_indexing(text: str) -> str:
    """Clean translation text: lowercase, remove HTML/markdown, normalize spaces."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[\*\[\]\(\)]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


_LANG_RE = re.compile(r"^[a-z]{2}$")


def fts_trans_table(lang: str) -> str:
    """FTS table name for a translation language, e.g. fts_vi_trans."""
    if not _LANG_RE.match(lang):
        raise ValueError(f"invalid language code: {lang!r}")
    return f"fts_{lang}_trans"


def discover_translation_dbs() -> Dict[str, str]:
    """Find default translation DBs: epitaka_<lang>.db (fallback _epitaka_<lang>.db).

    Suffixed variants (e.g. epitaka_my_nissaya.db) are alternate versions,
    not the default — skipped, mirroring get_translation_db().
    """
    found: Dict[str, str] = {}
    if not os.path.isdir(DATA_DIR):
        return found
    for fname in sorted(os.listdir(DATA_DIR)):
        m = re.match(r"^epitaka_([a-z]{2})\.db$", fname)
        if not m:
            continue
        found[m.group(1)] = os.path.join(DATA_DIR, fname)
    for fname in sorted(os.listdir(DATA_DIR)):
        m = re.match(r"^_epitaka_([a-z]{2})\.db$", fname)
        if m and m.group(1) not in found:
            found[m.group(1)] = os.path.join(DATA_DIR, fname)
    return found


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


def drop_fts_tables(conn, trans_tables: Optional[List[str]] = None):
    """Drop FTS tables from webdata.db (Pāli + given translation tables).

    trans_tables=None drops every fts_*_trans table found; otherwise only
    the listed ones (so --langs vi doesn't wipe the other languages).
    """
    tables = [
        "passages_fts",
        "sentences_fts_v2",
        "sentences_fts",
        "paragraphs_fts",
    ]
    if trans_tables is None:
        rows = conn.execute(
            "SELECT name FROM sqlite_master "
            "WHERE type = 'table' AND name LIKE 'fts\\_%\\_trans' ESCAPE '\\'"
        ).fetchall()
        tables += [r[0] for r in rows]
    else:
        tables += list(trans_tables)
    for table in tables:
        print(f"  → Dropping {table}...")
        try:
            conn.execute(f'DROP TABLE IF EXISTS "{table}"')
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


def create_trans_fts_table(conn, lang: str) -> str:
    """Create the per-language translation FTS table. Returns its name."""
    table = fts_trans_table(lang)
    print(f"  → Creating {table} (paragraph level, newline-separated lines)...")
    conn.execute(f"""
        CREATE VIRTUAL TABLE IF NOT EXISTS "{table}" USING fts5(
            book_id              UNINDEXED,
            para_id              UNINDEXED,
            trans_text,
            tokenize = 'unicode61 remove_diacritics 2'
        )
    """)
    conn.commit()
    return table


# ── Main rebuild ───────────────────────────────────────────────────────────


def rebuild_fts(langs: Optional[List[str]] = None, skip_translations: bool = False):
    print("=" * 60)
    print("Rebuilding FTS indexes in webdata.db")
    print("Source: epitaka.db + epitaka_<lang>.db (read-only)")
    print("Target: webdata.db")
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
    print(
        f"    webdata.db: {'exists' if os.path.isfile(WEBDATA_DB) else 'will be created'}"
    )

    # ── Resolve translation targets first (so --langs only drops those) ──
    targets: List[Tuple[str, str]] = []
    if not skip_translations:
        available = discover_translation_dbs()
        if langs:
            wanted = [l.strip().lower() for l in langs if l.strip()]
            targets = [(l, available[l]) for l in wanted if l in available]
            for l in [l for l in wanted if l not in available]:
                print(f"    WARNING: no epitaka_{l}.db found — skipping.")
        else:
            targets = sorted(available.items())

    # ── Drop & create tables ────────────────────────────────────────────
    print("\n[2] Resetting tables in webdata.db...")
    if skip_translations:
        drop_fts_tables(web_conn, trans_tables=[])
    elif langs is None:
        drop_fts_tables(web_conn, trans_tables=None)
    else:
        drop_fts_tables(
            web_conn,
            trans_tables=[fts_trans_table(l) for l, _ in targets],
        )
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
        key = (row["book_id"], row["para_id"])
        if key not in paragraph_map:
            paragraph_map[key] = []
        paragraph_map[key].append(
            {
                "line_id": row["line_id"],
                "pali": row["pali"],
            }
        )
    print(f"    {len(paragraph_map):,} paragraphs built.")

    # ── Word extraction ─────────────────────────────────────────────────
    print("\n[5] Extracting words for autocomplete index...")
    word_data = defaultdict(lambda: {"plain": "", "freq": 0})
    for key, lines in paragraph_map.items():
        for line in lines:
            pali_text = (line["pali"] or "").replace("*", "")
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
            pali = clean_pali_for_indexing((line["pali"] or "").replace("*", ""))
            para_text_parts.append(pali)
        para_text = "\n".join(para_text_parts)

        web_conn.execute(
            "INSERT INTO paragraphs_fts (book_id, para_id, paragraph_text) VALUES (?, ?, ?)",
            (book_id, para_id, para_text),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(
                f"    {inserted:,}/{len(paragraph_map):,} paragraph FTS rows committed."
            )
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

    # ── Translation FTS tables (one per language) ───────────────────────
    trans_stats: List[Tuple[str, int]] = []
    if not skip_translations:
        print("\n[8] Indexing translations (one FTS table per language)...")
        if not targets:
            print("    No translation DBs found — skipping.")
        for lang, db_path in targets:
            try:
                n = index_translation(web_conn, lang, db_path)
                trans_stats.append((lang, n))
            except Exception as e:
                print(f"    ERROR indexing {lang}: {e}")
    else:
        print("\n[8] Skipping translations (--skip-translations).")

    # ── Finalize ──────────────────────────────────────────────────────────
    print("\n[9] Vacuuming webdata.db...")
    web_conn.execute("VACUUM")
    print(f"    Final size: {os.path.getsize(WEBDATA_DB):,} bytes")

    epi_conn.close()
    web_conn.close()

    print("\n" + "=" * 60)
    print("FTS rebuild complete!")
    print(f"  {len(paragraph_map):,} Pāli paragraphs indexed")
    print(f"  {len(word_data):,} unique words")
    for lang, n in trans_stats:
        print(f"  {n:,} paragraphs indexed in fts_{lang}_trans")
    print("=" * 60)


def index_translation(web_conn, lang: str, db_path: str) -> int:
    """Index one translation DB into fts_<lang>_trans. Returns paragraph count."""
    table = create_trans_fts_table(web_conn, lang)
    print(f"    Reading {os.path.basename(db_path)}...")
    tconn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    tconn.row_factory = sqlite3.Row
    rows = tconn.execute("""
        SELECT book_id, para_id, line_id, translation
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """).fetchall()
    print(f"    {len(rows):,} translation lines found for '{lang}'.")

    paragraph_map = {}
    for row in rows:
        key = (row["book_id"], row["para_id"])
        if key not in paragraph_map:
            paragraph_map[key] = []
        paragraph_map[key].append(clean_trans_for_indexing(row["translation"] or ""))
    tconn.close()

    BATCH_SIZE = 5000
    inserted = 0
    for (book_id, para_id), lines in paragraph_map.items():
        web_conn.execute(
            f'INSERT INTO "{table}" (book_id, para_id, trans_text) VALUES (?, ?, ?)',
            (book_id, para_id, "\n".join(lines)),
        )
        inserted += 1
        if inserted % BATCH_SIZE == 0:
            web_conn.commit()
            print(f"    {inserted:,}/{len(paragraph_map):,} rows committed ({lang}).")
    web_conn.commit()
    print(f"    ✓ {inserted:,} rows inserted into {table}.")
    return inserted


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Rebuild FTS indexes in webdata.db")
    parser.add_argument(
        "--langs",
        default="",
        help="Comma-separated language codes to index (default: all epitaka_<lang>.db found)",
    )
    parser.add_argument(
        "--skip-translations",
        action="store_true",
        help="Only rebuild the Pāli paragraphs_fts + words tables",
    )
    args = parser.parse_args()
    rebuild_fts(
        langs=[l for l in args.langs.split(",") if l.strip()] or None,
        skip_translations=args.skip_translations,
    )

# app/utils/index_builder.py  (or wherever you keep this)

import re
import unicodedata
from typing import List, Tuple

from ..utils.db import get_db

def strip_diacritics(text: str) -> str:
    """Remove diacritical marks (used for plain form of Pali words)."""
    if not text:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def clean_word_for_index(word: str) -> str:
    """
    Prepare word for storage/indexing:
    - lowercase
    - remove most punctuation/special chars (keep letters, numbers, spaces)
    - optional: you can make it more strict
    """
    if not word:
        return ""
    # Keep alphanumeric + spaces + common Pali chars; remove the rest
    cleaned = re.sub(r'[^a-zA-Z0-9āīūṃñṅṇḍṭṭḷ\s…]', '', word.lower())
    return cleaned.strip()


# ───────────────────────────────────────────────
# Updated regex — allows spaces inside ** ... **
# ───────────────────────────────────────────────
# Matches: **any text possibly with spaces**optionalEnding
PATTERN_BOLD = re.compile(
    r'\*\*([^*]+?)\*\*([^*]*?)(?=\s|$|\*\*|\n|[.,;:!?])',
    re.UNICODE
)
# Explanation:
# ([^*]+?)     → capture everything inside **...** (non-greedy, can include spaces)
# ([^*]*?)     → capture optional ending after ** (can be empty)
# lookahead prevents eating next ** or punctuation


def drop_search_tables_if_exist() -> None:
    """Drop fts, words and pali_definition tables if they exist."""
    with get_db() as conn:
        conn.execute("DROP TABLE IF EXISTS sentences_fts")
        conn.execute("DROP TABLE IF EXISTS words")
        conn.execute("DROP TABLE IF EXISTS pali_definition")
        conn.commit()


def create_fts_table() -> None:
    """Create sentences_fts virtual table (FTS5)"""
    with get_db() as conn:
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts USING fts5(
                book_id             UNINDEXED,
                para_id             UNINDEXED,
                pali_paragraph      UNINDEXED,
                english_paragraph   UNINDEXED,
                vietnamese_paragraph,
                tokenize = 'unicode61 remove_diacritics 2'
            )
        """)
        conn.commit()


def create_words_table() -> None:
    """Create words frequency / normalization table"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS words (
                word        TEXT COLLATE NOCASE NOT NULL,
                plain       TEXT COLLATE NOCASE,
                frequency   INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (word)
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_words_plain
            ON words (plain)
        """)
        conn.commit()


def create_pali_definition_table() -> None:
    """Create table for bold-marked words + endings in Pali sentences"""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pali_definition (
                book_id     TEXT NOT NULL,
                para_id     INTEGER NOT NULL,
                line_id     INTEGER NOT NULL,
                word        TEXT NOT NULL,
                plain       TEXT NOT NULL,
                ending      TEXT,
                PRIMARY KEY (book_id, para_id, line_id, word)
            )
        """)
        # Optional helpful indexes
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_palidef_word
            ON pali_definition (word)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_palidef_book_para
            ON pali_definition (book_id, para_id)
        """)
        conn.commit()


def populate_pali_definition(batch_size: int = 2000) -> None:
    """
    Scan sentences table → extract **word possibly with spaces**ending
    Clean word → create plain version → insert records
    """
    inserted = 0

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT book_id, para_id, line_id, pali_sentence
            FROM sentences
            WHERE pali_sentence IS NOT NULL
              AND pali_sentence LIKE '%**%**%'
            ORDER BY book_id, para_id, line_id
        """)

        rows = cursor.fetchall()

        buffer: List[Tuple[str, int, int, str, str | None, str]] = []

        for row in rows:
            book_id, para_id, line_id, text = row
            if not text:
                continue

            for match in PATTERN_BOLD.finditer(text):
                raw_word = match.group(1).strip()
                ending   = match.group(2).strip()

                if not raw_word:
                    continue

                # Clean for indexing
                raw_word = clean_word_for_index(raw_word).lower()
                if not raw_word:
                    continue

                # Remove diacritics for plain form
                plain = strip_diacritics(raw_word)

                # Store original bold text as 'word'
                # ending can be '' → store as NULL or empty string
                ending_db = ending if ending else None

                buffer.append((book_id, para_id, line_id, raw_word, ending_db, plain))
                inserted += 1

                if len(buffer) >= batch_size:
                    cursor.executemany("""
                        INSERT OR IGNORE INTO pali_definition
                        (book_id, para_id, line_id, word, ending, plain)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, buffer)
                    conn.commit()
                    buffer.clear()
                    print(f"  → {inserted:,} entries processed...")

        # Final batch
        if buffer:
            cursor.executemany("""
                INSERT OR IGNORE INTO pali_definition
                (book_id, para_id, line_id, word, ending, plain)
                VALUES (?, ?, ?, ?, ?, ?)
            """, buffer)
            conn.commit()

    print(f"Finished. Inserted {inserted:,} bold word/ending records into pali_definition.")

def init_all_search_tables(drop_existing: bool = True) -> None:
    """
    Main entry point to (re)create and partially populate search-related tables.
    """
    print("Initializing search & definition tables...")

    if drop_existing:
        print("→ Dropping existing tables if they exist")
        drop_search_tables_if_exist()

    print("→ Creating sentences_fts")
    create_fts_table()

    print("→ Creating words table")
    create_words_table()

    print("→ Creating pali_definition table")
    create_pali_definition_table()

    print("→ Populating pali_definition from sentences")
    populate_pali_definition()

    print("Search tables initialization finished.")
    print("Note: sentences_fts and words are created but not yet populated.")
    print("      You need separate functions to fill them from sentences table.")
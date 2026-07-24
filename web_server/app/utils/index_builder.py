# app/utils/index_builder.py
"""
Builds / rebuilds the search-related tables in webdata.db:
  - paragraphs_fts  (FTS5 virtual table — paragraph level, newline-separated)
  - words           (frequency + plain-form index)
  - pali_definition (bold-marked Pali terms with ending, stem, plain)
  - book_links      (cross-references between mula↔attha/tika and attha↔tika)

Flask CLI usage (register once in create_app):
    flask rebuild fts          # drop + recreate + populate paragraphs_fts & words
    flask rebuild words        # drop + recreate + populate words only
    flask rebuild palidef      # drop + recreate + populate pali_definition
    flask rebuild booklink     # drop + recreate + populate book_links
    flask rebuild all          # run all four in sequence

    flask cleanup              # drop all tables and VACUUM the database

Or call each function directly from Python.
"""

import re
import unicodedata
from collections import defaultdict
from typing import List, Optional, Set, Tuple

import click
from flask import Flask

from ..utils.db import get_db


# ─────────────────────────────────────────────────────────────────────────────
# Book-link normalisation constants
# ─────────────────────────────────────────────────────────────────────────────

# Base URL printed next to unmatched words so you can inspect them in the browser.
BOOKLINK_DEBUG_BASE_URL = "http://localhost:8080/book"

# Choose the normalisation strategy used when searching source bold-words
# inside target sentences.
#
#   "smart"       – Full rule set (recommended):
#                     • word ends with "nti"  → replace suffix with "ṃ"
#                         evanti   → evaṃ
#                     • word ends with "ti"   → two candidates:
#                         (a) strip "ti"  keeping the preceding vowel as-is
#                         (b) strip "ti"  and also shorten the preceding long vowel
#                         saddāti  → ["saddā", "sadda"]
#                     • otherwise             → strip the last vowel (original behaviour)
#
#   "strip_vowel" – Legacy: just strip the final vowel (original behaviour).
#
BOOKLINK_NORM_MODE: str = "smart"   # "smart" | "strip_vowel"

# Long-vowel → short-vowel map used by the "ti" shortening rule.
_LONG_TO_SHORT = {"ā": "a", "ī": "i", "ū": "u", "e": "e", "o": "o"}
def to_short(word: str) -> str:
    if word[-1] in _LONG_TO_SHORT:
        return word[:-1]+_LONG_TO_SHORT[word[-1]]
    return word
    

# ─────────────────────────────────────────────────────────────────────────────
# Text helpers
# ─────────────────────────────────────────────────────────────────────────────

def strip_diacritics(text: str) -> str:
    """Remove diacritical marks (used for plain form of Pali words)."""
    if not text:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )


def clean_word_for_index(word: str, remove_space = False) -> str:
    """
    Lowercase + strip non-Pali punctuation.
    Keeps letters, digits, common Pali extended chars (ā ī ū ṃ ñ ṅ ṇ ḍ ṭ ḷ).
    """
    if not word:
        return ""
    if remove_space:
        cleaned = re.sub(r"[^a-zA-Z0-9āīūṃñṅṇḍṭḷ]", "", word.lower())
    else:
        cleaned = re.sub(r"[^a-zA-Z0-9āīūṃñṅṇḍṭḷ\s]", "", word.lower())
    return cleaned.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Book-link normalisation
# ─────────────────────────────────────────────────────────────────────────────

def normalize_for_search(word: str, ending: str = '', mode: str = BOOKLINK_NORM_MODE) -> List[str]:
    """
    Return one or more normalised search candidates for *word* to look for
    inside a target sentence.

    mode="smart":
      1. Ends with "nti"  → strip "nti", append "ṃ"
                            evanti → ["evaṃ"]
      2. Ends with "ti"   → strip "ti", yield two candidates:
           (a) stem as-is  (preceding long vowel kept long)
           (b) stem with preceding long vowel shortened
                            saddāti → ["saddā", "sadda"]
                            vassati → ["vassa", "vassa"]  (no long vowel → same)
      3. Otherwise        → strip the last vowel if present (legacy rule)
                            brahmaṇo → ["brahmaṇ"]

    mode="strip_vowel":
      Always strips the last vowel — the original behaviour.

    Returns a *de-duplicated* list; never empty (falls back to the word itself).
    """
    if not word:
        return [word]

    pali_vowels = "aāiīuūeo"

    STRIP_ENDINGS = ['ādīnipi', 'ādīsu', 'ādayo' 'āpi']
    if mode == "smart":
        # Rule 1: -nti → -ṃ. In case of short words like evanti, we don't want to strip the last vowel.
        if len(word) < 4:
            if ending == "nti":
                return [word + "ṃ"]
            else:
                return [word, to_short(word)]
        if len(word) > 10 and any(word.endswith(e) for e in STRIP_ENDINGS):
            return list(set([word[:-len(e)] for e in STRIP_ENDINGS]))
        return [word[:-1]]

    else:  # "strip_vowel"
        if word[-1] in pali_vowels:
            stripped = word[:-1]
            return [stripped] if stripped else [word]
        return [word]


# ─────────────────────────────────────────────────────────────────────────────
# Stem resolution  (mirrors search_auto pipeline in dictionary.py)
# ─────────────────────────────────────────────────────────────────────────────

def _parse_tpr_headword(inflected: str, headwords_raw: str) -> Optional[str]:
    """
    Apply the TPR headword-parse + word-specific overrides to a raw headwords
    string.  Pure Python — no DB access.  Returns the resolved stem or None.
    """
    if not headwords_raw:
        return None
    parts    = headwords_raw.split(",")
    dpd_word = parts[0]
    dpd_word = re.sub(r"['\[\]\d\s]", "", dpd_word)

    # Word-specific overrides (verbatim from _resolve_tpr_word)
    if dpd_word == "āyasmant":
        return "āyasmantu"
    if dpd_word == "bhikkhave":
        return "bhikkhu"
    if dpd_word == "ambho":
        return dpd_word
    if "āyasm" in inflected:
        return "āyasmantu"
    if len(dpd_word) > 4 and dpd_word.endswith("vant"):
        return dpd_word[:-4] + "vantu"

    return dpd_word or None


def build_stem_lookup_cache(conn) -> dict:
    """
    Bulk-load all three dictionary lookup tables into a single Python dict:
        inflected_form  →  stem

    Pipeline (same priority as resolve_stem / search_auto):
      1. dpd_inflections_to_headwords  (TPR)
      2. dpr_stem
      3. dpd_word_split                (first component)

    Lower-priority tables only fill in entries not already covered by a
    higher-priority one, so the priority order is respected.

    Returns the dict.  Typically called once per rebuild_palidef() run.
    """
    cache: dict = {}

    print("  → Bulk-loading dpd_inflections_to_headwords...")
    for inflection, headwords in conn.execute(
        "SELECT inflection, headwords FROM dpd_inflections_to_headwords"
    ):
        if inflection and headwords:
            stem = _parse_tpr_headword(inflection, headwords)
            if stem:
                cache[inflection] = stem

    print(f"     {len(cache):,} TPR entries loaded.")

    print("  → Bulk-loading dpr_stem...")
    added = 0
    for word, stem in conn.execute("SELECT word, stem FROM dpr_stem"):
        if word and stem and word not in cache:
            cache[word] = stem
            added += 1
    print(f"     {added:,} dpr_stem entries added.")

    print("  → Bulk-loading dpd_word_split...")
    added = 0
    for word, breakup in conn.execute("SELECT word, breakup FROM dpd_word_split"):
        if word and breakup and word not in cache:
            parts = [p.strip() for p in breakup.split(",") if p.strip()]
            if parts:
                cache[word] = parts[0]
                added += 1
    print(f"     {added:,} dpd_word_split entries added.")
    print(f"  → Stem lookup cache ready: {len(cache):,} total entries.")

    return cache


def resolve_stem_cached(
    stem_lookup: dict,
    word: str,
    ending: Optional[str],
) -> str:
    """
    Dict-only stem resolution — no DB access.

    Pipeline (mirrors search_auto / resolve_stem):
      1. inflected form (word + ending) looked up in stem_lookup
      2. Fallback: word itself
    """
    inflected = (word + (ending or "")).strip()
    return stem_lookup.get(inflected) or word


# ─────────────────────────────────────────────────────────────────────────────
# Regex for **bold**ending pattern in Pali sentences
# ─────────────────────────────────────────────────────────────────────────────

PATTERN_BOLD = re.compile(
    r"\*\*([^*]+?)\*\*([^*]*?)(?=\s|$|\*\*|\n|[.,;:!?])",
    re.UNICODE,
)


# ─────────────────────────────────────────────────────────────────────────────
# Per-table: drop → create → populate
# ─────────────────────────────────────────────────────────────────────────────

def rebuild_fts(batch_size: int = 5000) -> None:
    """
    Drop, recreate, and populate:
      - paragraphs_fts  (paragraph level — newline-separated lines)
      - words
    """
    print("=== Rebuilding: paragraphs_fts + words ===")

    # ── Drop old tables ───────────────────────────────────────────────────────
    with get_db() as conn:
        print("  → Dropping old tables...")
        conn.execute("DROP TABLE IF EXISTS passages_fts")
        conn.execute("DROP TABLE IF EXISTS sentences_fts_v2")
        conn.execute("DROP TABLE IF EXISTS sentences_fts")
        conn.execute("DROP TABLE IF EXISTS paragraphs_fts")
        conn.execute("DROP TABLE IF EXISTS words")
        conn.commit()

    # ── Create tables ─────────────────────────────────────────────────────────
    with get_db() as conn:
        print("  → Creating paragraphs_fts (paragraph level, newline-separated lines)...")
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS paragraphs_fts USING fts5(
                book_id              UNINDEXED,
                para_id              UNINDEXED,
                paragraph_text,
                tokenize = 'unicode61 remove_diacritics 2'
            )
        """)

        print("  → Creating words...")
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

    # ── Query source data ─────────────────────────────────────────────────────

    print("  → Querying individual sentences (ordered)...")
    with get_db() as conn:
        sent_rows = conn.execute("""
            SELECT book_id, para_id, line_id, pali
            FROM sentences
            ORDER BY book_id, para_id, line_id
        """).fetchall()
    print(f"  → {len(sent_rows):,} individual lines found.")

    # Group into paragraphs
    print("  → Building paragraphs (grouping lines by book_id, para_id)...")
    paragraph_map = {}
    for row in sent_rows:
        key = (row['book_id'], row['para_id'])
        if key not in paragraph_map:
            paragraph_map[key] = []
        paragraph_map[key].append({
            'line_id': row['line_id'],
            'pali': row['pali'],
        })
    print(f"  → {len(paragraph_map):,} paragraphs built.")

    # ── Word extraction (from paragraphs) ────────────────────────────────────
    word_data: dict = defaultdict(lambda: {"plain": "", "freq": 0})
    for key, lines in paragraph_map.items():
        for line in lines:
            pali_para = (line['pali'] or '').replace('*', '')
            for w in pali_para.split():
                w = w.strip('.,!?;:"()[]{}#*').lower()
                if w:
                    if not word_data[w]["plain"]:
                        word_data[w]["plain"] = strip_diacritics(w)
                    word_data[w]["freq"] += 1
    print(f"  → {len(word_data):,} unique words extracted.")

    # ── Insert into paragraphs_fts ───────────────────────────────────────────
    print("  → Inserting into paragraphs_fts (paragraph level)...")
    with get_db() as conn:
        inserted = 0
        for (book_id, para_id), lines in paragraph_map.items():
            para_text_parts = []
            for line in lines:
                pali = (line['pali'] or '').replace('*', '')
                para_text_parts.append(pali)
            para_text = '\n'.join(para_text_parts)

            conn.execute(
                "INSERT INTO paragraphs_fts (book_id, para_id, paragraph_text) VALUES (?, ?, ?)",
                (book_id, para_id, para_text),
            )
            inserted += 1
            if inserted % batch_size == 0:
                conn.commit()
                print(f"     {inserted:,}/{len(paragraph_map):,} paragraph FTS rows committed.")
        conn.commit()
    print(f"  → paragraphs_fts populated ({inserted:,} rows).")

    # ── Insert into words ─────────────────────────────────────────────────────
    print("  → Inserting into words...")
    with get_db() as conn:
        cursor = conn.cursor()
        buffer = []
        for word, data in word_data.items():
            buffer.append((word, data["plain"], data["freq"]))
            if len(buffer) >= batch_size:
                cursor.executemany(
                    "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
                    buffer,
                )
                conn.commit()
                buffer.clear()
        if buffer:
            cursor.executemany(
                "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
                buffer,
            )
            conn.commit()
    print(f"  → words populated ({len(word_data):,} entries).")
    print("=== Done: paragraphs_fts + words ===")


def rebuild_words(batch_size: int = 5000) -> None:
    """Drop, recreate, and populate only the words table."""
    print("=== Rebuilding: words ===")

    with get_db() as conn:
        print("  → Dropping words...")
        conn.execute("DROP TABLE IF EXISTS words")
        conn.commit()

    with get_db() as conn:
        print("  → Creating words...")
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

    print("  → Querying sentences for word extraction...")
    with get_db() as conn:
        rows = conn.execute("""
            SELECT book_id, para_id,
                   GROUP_CONCAT(pali, ' ') AS pali_paragraph
            FROM sentences
            GROUP BY book_id, para_id
        """).fetchall()

    word_data: dict = defaultdict(lambda: {"plain": "", "freq": 0})
    for row in rows:
        pali_para = (row['pali_paragraph'] or '').replace('*', '')
        for w in pali_para.split():
            w = w.strip('.,!?;:"()[]{}#*').lower()
            if w:
                if not word_data[w]["plain"]:
                    word_data[w]["plain"] = strip_diacritics(w)
                word_data[w]["freq"] += 1

    print(f"  → {len(word_data):,} unique words extracted.")

    with get_db() as conn:
        cursor = conn.cursor()
        buffer = []
        for word, data in word_data.items():
            buffer.append((word, data["plain"], data["freq"]))
            if len(buffer) >= batch_size:
                cursor.executemany(
                    "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
                    buffer,
                )
                conn.commit()
                buffer.clear()
        if buffer:
            cursor.executemany(
                "INSERT OR REPLACE INTO words (word, plain, frequency) VALUES (?, ?, ?)",
                buffer,
            )
            conn.commit()

    print(f"  → words populated ({len(word_data):,} entries).")
    print("=== Done: words ===")


# ─────────────────────────────────────────────────────────────────────────────
# rebuild_palidef and rebuild_booklink are unchanged — omitted here for brevity.
# Keep them exactly as they are in the original file.
# ─────────────────────────────────────────────────────────────────────────────


# ─────────────────────────────────────────────────────────────────────────────
# Cleanup: drop all tables + VACUUM
# ─────────────────────────────────────────────────────────────────────────────

def cleanup_tables() -> None:
    """
    Drop all search/index tables and VACUUM the database to reclaim space.

    Tables dropped (in dependency order):
        book_links
        pali_definition
        passages_fts
        sentences_fts_v2
        sentences_fts
        paragraphs_fts
        words
    """
    print("=== Cleanup: dropping index tables ===")

    tables = [
        "book_links",
        "pali_definition",
        "paragraphs_fts",
        "words",
    ]

    with get_db() as conn:
        for table in tables:
            print(f"  → Dropping {table}...")
            conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.commit()
        print("  → All tables dropped.")

    print("  → Running VACUUM (this may take a moment)...")
    with get_db() as conn:
        conn.execute("VACUUM")
    print("  → VACUUM complete.")
    print("=== Done: cleanup ===")


# ─────────────────────────────────────────────────────────────────────────────
# Flask CLI registration
# ─────────────────────────────────────────────────────────────────────────────

def register_cli(app: Flask) -> None:
    """
    Call this once inside create_app() to add the `rebuild` and `cleanup`
    command groups.

    Usage:
        flask rebuild fts        # paragraphs_fts + words
        flask rebuild words      # words only
        flask rebuild palidef    # pali_definition
        flask rebuild booklink   # book_links
        flask rebuild all        # all four in sequence

        flask cleanup            # drop all tables + VACUUM
    """

    @app.cli.group("rebuild")
    def rebuild_cli():
        """Rebuild search / definition tables (drop → create → populate)."""

    @rebuild_cli.command("fts")
    def rebuild_fts_cmd():
        """Drop, recreate, and populate paragraphs_fts and words."""
        rebuild_fts()

    @rebuild_cli.command("words")
    def rebuild_words_cmd():
        """Drop, recreate, and populate the words table only."""
        rebuild_words()

    @rebuild_cli.command("palidef")
    def rebuild_palidef_cmd():
        """Drop, recreate, and populate pali_definition."""
        rebuild_palidef()

    @rebuild_cli.command("booklink")
    def rebuild_booklink_cmd():
        """Drop, recreate, and populate book_links."""
        rebuild_booklink()

    @rebuild_cli.command("all")
    def rebuild_all_cmd():
        """Run all four rebuilds in sequence: fts → words → palidef → booklink."""
        rebuild_fts()
        rebuild_words()
        rebuild_palidef()
        rebuild_booklink()

    @app.cli.command("cleanup")
    def cleanup_cmd():
        """Drop all search/index tables and VACUUM."""
        cleanup_tables()

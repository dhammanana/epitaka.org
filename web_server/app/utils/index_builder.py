# app/utils/index_builder.py
"""
Builds / rebuilds the search-related tables in translations.db:
  - sentences_fts   (FTS5 virtual table — paragraph level)
  - sentences_fts_v2 (FTS5 virtual table — sentence level)
  - passages_fts    (FTS5 virtual table — sliding-window passages for NEAR/distance search)
  - words           (frequency + plain-form index)
  - pali_definition (bold-marked Pali terms with ending, stem, plain)
  - book_links      (cross-references between mula↔attha/tika and attha↔tika)

Flask CLI usage (register once in create_app):
    flask rebuild fts          # drop + recreate + populate sentences_fts, sentences_fts_v2,
                               #   passages_fts & words
    flask rebuild words        # drop + recreate + populate words only
    flask rebuild palidef      # drop + recreate + populate pali_definition
    flask rebuild booklink     # drop + recreate + populate book_links
    flask rebuild all          # run all four in sequence

    flask cleanup              # drop all tables and VACUUM the database

Or call each function directly from Python.

Passage window constant (tune to taste):
    PASSAGE_TARGET  — soft sentence target before the window rounds up to the
                      end of the current paragraph (default 4).
                      The actual passage size is always a whole number of
                      paragraphs, so it is >= PASSAGE_TARGET sentences.
"""

import re
import unicodedata
from collections import defaultdict
from typing import List, Optional, Set, Tuple

import click
from flask import Flask

from ..utils.db import get_db


# ─────────────────────────────────────────────────────────────────────────────
# Passage-building constant
# ─────────────────────────────────────────────────────────────────────────────

# Soft sentence target.  After accumulating this many sentences the builder
# finishes the current paragraph before closing the passage.  This means every
# passage always contains complete paragraphs — it never cuts mid-paragraph.
#
# Example (PASSAGE_TARGET = 4):
#   Para A = 3 sentences, Para B = 3 sentences, Para C = 5 sentences.
#
#   Passage 1: starts at A[0].  After A (3 sentences) we have < 4, so we
#              carry on into B.  After B (6 total) we have >= 4 AND the
#              paragraph just ended → close.  Passage = A + B (6 sentences).
#
#   Passage 2: starts at B (the paragraph that pushed us over 4 last time).
#              After B (3 sentences) < 4, carry on into C.  After C (8 total)
#              >= 4 AND paragraph ended → close.  Passage = B + C (8 sentences).
#
# The overlap (Para B appears in both passage 1 and passage 2) ensures that
# words spread across the A/B or B/C boundary are always caught.

PASSAGE_TARGET: int = 4   # soft sentence target before rounding to paragraph end


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

def _emit_passage(buffer: list, book_id: str, window: list) -> None:
    """
    Append one passage tuple to buffer from a list of sentence rows.
    Called by rebuild_fts whenever a passage window is closed.
    """
    pali_parts = []
    en_parts   = []
    vi_parts   = []
    for s in window:
        pali_parts.append((s['pali_sentence']         or '').replace('*', ''))
        en_parts.append(  (s['english_translation']   or ''))
        vi_parts.append(  (s['vietnamese_translation'] or ''))

    buffer.append((
        book_id,
        window[0]['para_id'],   # anchor_para_id  (first sentence's paragraph)
        window[0]['line_id'],   # seq_start
        window[-1]['line_id'],  # seq_end
        ' '.join(pali_parts),
        ' '.join(en_parts),
        ' '.join(vi_parts),
    ))


def rebuild_fts(batch_size: int = 5000) -> None:
    """
    Drop, recreate, and populate:
      - sentences_fts      (paragraph level  — used by 'para' search mode)
      - sentences_fts_v2   (sentence level   — used by 'sentence/exact' search mode)
      - passages_fts       (paragraph-rounded windows — used by 'distance/NEAR' search mode)
      - words

    Passage parameter (at top of file):
      PASSAGE_TARGET = 4   soft sentence target; window always rounds up to end
                           of the current paragraph before closing.
    """
    print("=== Rebuilding: sentences_fts + sentences_fts_v2 + passages_fts + words ===")

    # ── Drop old tables ───────────────────────────────────────────────────────
    with get_db() as conn:
        print("  → Dropping old tables...")
        conn.execute("DROP TABLE IF EXISTS sentences_fts")
        conn.execute("DROP TABLE IF EXISTS sentences_fts_v2")
        conn.execute("DROP TABLE IF EXISTS passages_fts")
        conn.execute("DROP TABLE IF EXISTS words")
        conn.commit()

    # ── Create tables ─────────────────────────────────────────────────────────
    with get_db() as conn:
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
        # Stores concatenated text from PASSAGE_WINDOW consecutive sentences.
        # seq_start / seq_end are the line_ids of the first and last sentence
        # in the window — used after a match to fetch the individual sentences
        # for display.  anchor_para_id is the para_id of the first sentence
        # so we can group results by paragraph.
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

    print("  → Querying paragraphs from sentences...")
    with get_db() as conn:
        para_rows = conn.execute("""
            SELECT book_id, para_id,
                   GROUP_CONCAT(pali_sentence,         ' ') AS pali_paragraph,
                   GROUP_CONCAT(english_translation,   ' ') AS english_paragraph,
                   GROUP_CONCAT(vietnamese_translation, ' ') AS vietnamese_paragraph
            FROM sentences
            GROUP BY book_id, para_id
        """).fetchall()
    print(f"  → {len(para_rows):,} paragraphs found.")

    print("  → Querying individual sentences (ordered)...")
    with get_db() as conn:
        sent_rows = conn.execute("""
            SELECT book_id, para_id, line_id,
                   pali_sentence, english_translation, vietnamese_translation
            FROM sentences
            ORDER BY book_id, para_id, line_id
        """).fetchall()
    print(f"  → {len(sent_rows):,} sentences found.")

    # ── Word extraction (from paragraphs) ────────────────────────────────────
    word_data: dict = defaultdict(lambda: {"plain": "", "freq": 0})
    for row in para_rows:
        book_id, para_id, pali_para, en_para, vi_para = row
        pali_para = (pali_para or "").replace("*", "")
        for field, is_pali in [(pali_para, True), (en_para, False), (vi_para, False)]:
            if not field:
                continue
            for w in field.split():
                w = w.strip('.,!?;:"()[]{}#*').lower()
                if w:
                    if not word_data[w]["plain"]:
                        word_data[w]["plain"] = strip_diacritics(w) if is_pali else w
                    word_data[w]["freq"] += 1
    print(f"  → {len(word_data):,} unique words extracted.")

    # ── Insert into sentences_fts (paragraph level) ──────────────────────────
    print("  → Inserting into sentences_fts (paragraph level)...")
    with get_db() as conn:
        inserted = 0
        for row in para_rows:
            book_id, para_id, pali_para, en_para, vi_para = row
            conn.execute("""
                INSERT INTO sentences_fts
                    (book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph)
                VALUES (?, ?, ?, ?, ?)
            """, (book_id, para_id, (pali_para or "").replace("*", ""), en_para, vi_para))
            inserted += 1
            if inserted % batch_size == 0:
                conn.commit()
                print(f"     {inserted:,}/{len(para_rows):,} paragraph FTS rows committed.")
        conn.commit()
    print(f"  → sentences_fts populated ({inserted:,} rows).")

    # ── Insert into sentences_fts_v2 (sentence level) ────────────────────────
    print("  → Inserting into sentences_fts_v2 (sentence level)...")
    with get_db() as conn:
        inserted = 0
        for row in sent_rows:
            book_id, para_id, line_id, pali_s, en_s, vi_s = row
            conn.execute("""
                INSERT INTO sentences_fts_v2
                    (book_id, para_id, line_id,
                     pali_sentence, english_translation, vietnamese_translation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                book_id, para_id, line_id,
                (pali_s or "").replace("*", ""), en_s, vi_s,
            ))
            inserted += 1
            if inserted % batch_size == 0:
                conn.commit()
                print(f"     {inserted:,}/{len(sent_rows):,} sentence FTS rows committed.")
        conn.commit()
    print(f"  → sentences_fts_v2 populated ({inserted:,} rows).")

    # ── Build and insert passages (paragraph-rounded windows) ───────────────────
    #
    # Works at the PARAGRAPH level, not the sentence level — no rewinding.
    #
    # Algorithm:
    #   1. Group sentences into paragraphs (ordered lists).
    #   2. Walk the paragraph list with a sliding pointer `p`.
    #   3. Accumulate whole paragraphs into `window_paras` until the total
    #      sentence count >= PASSAGE_TARGET.
    #   4. Emit the passage, then advance the start pointer by 1 paragraph
    #      (the overlap: the last paragraph of this passage becomes the first
    #      paragraph of the next).  This guarantees words spanning a paragraph
    #      boundary are always captured together in at least one passage.
    #   5. Never rewind — p always moves forward.
    #
    # Example (PASSAGE_TARGET=4):
    #   Para A=3s, Para B=3s, Para C=2s, Para D=5s
    #
    #   Passage 1: add A(3) < 4 → add B(6) >= 4 → emit A+B.  Next starts at B.
    #   Passage 2: add B(3) < 4 → add C(5) >= 4 → emit B+C.  Next starts at C.
    #   Passage 3: add C(2) < 4 → add D(7) >= 4 → emit C+D.  Next starts at D.
    #   Passage 4: add D(5) >= 4 → end of book   → emit D.
    #
    print(f"  → Building passages (paragraph-rounded, target={PASSAGE_TARGET} sentences)...")

    # Step 1: group sentences by (book_id, para_id) preserving order
    # Result: books_paras[book_id] = [ [sent, sent, …], [sent, …], … ]
    books_paras: dict = defaultdict(list)
    cur_key  = None
    cur_para = None
    for row in sent_rows:   # already ordered book_id, para_id, line_id
        key = row['book_id']
        pid = row['para_id']
        if key != cur_key or pid != cur_para:
            books_paras[key].append([])
            cur_key  = key
            cur_para = pid
        books_paras[key][-1].append(row)

    passage_buffer = []
    total_passages = 0

    def flush_buffer(conn, buf):
        conn.executemany("""
            INSERT INTO passages_fts
                (book_id, anchor_para_id, seq_start, seq_end,
                 pali_passage, english_passage, vietnamese_passage)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, buf)
        conn.commit()

    with get_db() as conn:
        for book_id, paras in books_paras.items():
            # paras is a list of paragraphs; each paragraph is a list of sentence rows.
            np = len(paras)
            p  = 0   # start pointer — always moves forward, never rewinds

            while p < np:
                window_paras = []   # paragraphs accumulated for this passage
                sentence_count = 0
                q = p

                # Accumulate whole paragraphs until we hit the target
                while q < np:
                    window_paras.append(paras[q])
                    sentence_count += len(paras[q])
                    q += 1
                    if sentence_count >= PASSAGE_TARGET:
                        break
                # window_paras now contains >= PASSAGE_TARGET sentences
                # (or all remaining paragraphs if fewer than target remain)

                # Flatten window_paras into a single sentence list for _emit_passage
                flat = [s for para in window_paras for s in para]
                _emit_passage(passage_buffer, book_id, flat)
                total_passages += 1

                if len(passage_buffer) >= batch_size:
                    flush_buffer(conn, passage_buffer)
                    print(f"     {total_passages:,} passage rows committed...")
                    passage_buffer.clear()

                # Advance start by 1 paragraph (overlap = all but the first para)
                p += 1

        # Final flush
        if passage_buffer:
            flush_buffer(conn, passage_buffer)
            passage_buffer.clear()

    print(f"  → passages_fts populated ({total_passages:,} rows).")

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
    print("=== Done: sentences_fts + sentences_fts_v2 + passages_fts + words ===")


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
                   GROUP_CONCAT(pali_sentence,       ' ') AS pali_paragraph,
                   GROUP_CONCAT(english_translation,    ' ') AS english_paragraph,
                   GROUP_CONCAT(vietnamese_translation, ' ') AS vietnamese_paragraph
            FROM sentences
            GROUP BY book_id, para_id
        """).fetchall()

    word_data: dict = defaultdict(lambda: {"plain": "", "freq": 0})
    for row in rows:
        book_id, para_id, pali_para, en_para, vi_para = row
        pali_para = (pali_para or "").replace("*", "")
        for field, is_pali in [(pali_para, True), (en_para, False), (vi_para, False)]:
            if not field:
                continue
            for w in field.split():
                w = w.strip('.,!?;:"()[]{}#*').lower()
                if w:
                    if not word_data[w]["plain"]:
                        word_data[w]["plain"] = strip_diacritics(w) if is_pali else w
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
        words
    """
    print("=== Cleanup: dropping index tables ===")

    tables = [
        "book_links",
        "pali_definition",
        "passages_fts",
        "sentences_fts_v2",
        "sentences_fts",
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
        flask rebuild fts        # sentences_fts + sentences_fts_v2 + passages_fts + words
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
        """Drop, recreate, and populate sentences_fts, sentences_fts_v2, passages_fts and words."""
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
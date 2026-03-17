# app/utils/index_builder.py
"""
Builds / rebuilds the search-related tables in translations.db:
  - sentences_fts   (FTS5 virtual table)
  - words           (frequency + plain-form index)
  - pali_definition (bold-marked Pali terms with ending, stem, plain)
  - book_links      (cross-references between mula↔attha/tika and attha↔tika)

Flask CLI usage (register once in create_app):
    flask rebuild fts          # drop + recreate + populate sentences_fts & words
    flask rebuild words        # drop + recreate + populate words only
    flask rebuild palidef      # drop + recreate + populate pali_definition
    flask rebuild booklink     # drop + recreate + populate book_links
    flask rebuild all          # run all four in sequence

    flask cleanup              # drop all four tables and VACUUM the database

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
        # # Rule 2: -ti  → two candidates (keep long / shorten long)
        # if ending == "ti":
        #     stem = word
        #     candidates = [stem]
        #     if stem and stem[-1] in _LONG_TO_SHORT:
        #         short_stem = to_short(stem)
        #         if short_stem != stem:
        #             candidates.append(short_stem)
        #     # De-duplicate while preserving order
        #     seen: Set[str] = set()
        #     result = []
        #     for c in candidates:
        #         if c and c not in seen:
        #             seen.add(c)
        #             result.append(c)
        #     return result or [word]
        # if word[-1] in pali_vowels and len(word) > 3:
        #     return [word[:-1]]
        # return [word]

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
    """Drop, recreate, and populate sentences_fts and words."""
    print("=== Rebuilding: sentences_fts + words ===")

    with get_db() as conn:
        print("  → Dropping sentences_fts...")
        conn.execute("DROP TABLE IF EXISTS sentences_fts")
        conn.execute("DROP TABLE IF EXISTS words")
        conn.commit()

    with get_db() as conn:
        print("  → Creating sentences_fts...")
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts USING fts5(
                book_id              UNINDEXED,
                para_id              UNINDEXED,
                pali_paragraph       UNINDEXED,
                english_paragraph    UNINDEXED,
                vietnamese_paragraph,
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

    print("  → Querying paragraphs from sentences...")
    with get_db() as conn:
        rows = conn.execute("""
            SELECT book_id, para_id,
                   GROUP_CONCAT(pali_sentence,       ' ') AS pali_paragraph,
                   GROUP_CONCAT(english_translation,    ' ') AS english_paragraph,
                   GROUP_CONCAT(vietnamese_translation, ' ') AS vietnamese_paragraph
            FROM sentences
            GROUP BY book_id, para_id
        """).fetchall()

    print(f"  → {len(rows):,} paragraphs found.")

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

    print("  → Inserting into sentences_fts...")
    with get_db() as conn:
        inserted = 0
        for row in rows:
            book_id, para_id, pali_para, en_para, vi_para = row
            conn.execute("""
                INSERT INTO sentences_fts
                    (book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph)
                VALUES (?, ?, ?, ?, ?)
            """, (book_id, para_id, (pali_para or "").replace("*", ""), en_para, vi_para))
            inserted += 1
            if inserted % batch_size == 0:
                conn.commit()
                print(f"     {inserted:,}/{len(rows):,} FTS rows committed.")
        conn.commit()
    print(f"  → sentences_fts populated ({inserted:,} rows).")

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
    print("=== Done: sentences_fts + words ===")


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


def rebuild_palidef(batch_size: int = 2000) -> None:
    """
    Drop, recreate, and populate pali_definition.

    Speed optimisation vs the original:
    - All three dictionary lookup tables (dpd_inflections_to_headwords,
      dpr_stem, dpd_word_split) are bulk-loaded into a single Python dict
      ONCE before the main loop.  Every stem resolution is then a pure
      dict.get() with no further DB access.
    - The per-entry stem_cache from the old version is kept on top of that
      to avoid even the dict lookup for repeated (word, ending) pairs within
      the corpus (e.g. common inflections like "ti", "ssa" that appear many
      thousands of times).
    """
    print("=== Rebuilding: pali_definition ===")

    with get_db() as conn:
        print("  → Dropping pali_definition...")
        conn.execute("DROP TABLE IF EXISTS pali_definition")
        conn.commit()

    with get_db() as conn:
        print("  → Creating pali_definition...")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pali_definition (
                book_id     TEXT    NOT NULL,
                para_id     INTEGER NOT NULL,
                line_id     INTEGER NOT NULL,
                word        TEXT    NOT NULL,
                plain       TEXT    NOT NULL,
                ending      TEXT,
                stem        TEXT    NOT NULL,
                PRIMARY KEY (book_id, para_id, line_id, word)
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_palidef_word ON pali_definition (word)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_palidef_stem ON pali_definition (stem)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_palidef_book_para ON pali_definition (book_id, para_id)")
        conn.commit()

    import sqlite3 as _sqlite3

    with get_db() as conn:
        conn.row_factory = _sqlite3.Row

        # ── Step 1: bulk-load dictionary lookup tables into memory ────────────
        stem_lookup = build_stem_lookup_cache(conn)

        # ── Step 2: fetch all sentences that contain bold markers ─────────────
        print("  → Scanning sentences for bold **word**ending patterns...")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT book_id, para_id, line_id, pali_sentence
            FROM sentences
            WHERE pali_sentence IS NOT NULL
              AND pali_sentence LIKE '%**%**%'
            ORDER BY book_id, para_id, line_id
        """)
        rows = cursor.fetchall()
        print(f"  → {len(rows):,} sentences contain bold markers.")

        # ── Step 3: extract bold words, resolve stems, insert ─────────────────
        # corpus_cache avoids even the dict.get() for repeated (word, ending)
        corpus_cache: dict = {}
        buffer: List[Tuple] = []
        inserted = 0

        for book_id, para_id, line_id, text in rows:
            if not text:
                continue
            for match in PATTERN_BOLD.finditer(text):
                raw_word = match.group(1).strip()
                ending   = match.group(2).strip()
                if not raw_word:
                    continue
                word = clean_word_for_index(raw_word)
                if not word:
                    continue

                plain     = strip_diacritics(word)
                ending_db = ending if ending else None
                cache_key = (word, ending_db)

                if cache_key not in corpus_cache:
                    corpus_cache[cache_key] = resolve_stem_cached(
                        stem_lookup, word, ending_db
                    )
                stem = corpus_cache[cache_key]

                buffer.append((book_id, para_id, line_id, word, plain, ending_db, stem))
                inserted += 1

                if len(buffer) >= batch_size:
                    cursor.executemany("""
                        INSERT OR IGNORE INTO pali_definition
                            (book_id, para_id, line_id, word, plain, ending, stem)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, buffer)
                    conn.commit()
                    buffer.clear()
                    print(f"     {inserted:,} pali_definition entries committed...")

        if buffer:
            cursor.executemany("""
                INSERT OR IGNORE INTO pali_definition
                    (book_id, para_id, line_id, word, plain, ending, stem)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, buffer)
            conn.commit()

    print(f"  → pali_definition populated ({inserted:,} entries).")
    print(f"     ({len(corpus_cache):,} unique (word, ending) pairs resolved)")
    print("=== Done: pali_definition ===")

check_num = 0

def _process_book_pair(
    cursor,
    src_id: str,
    tgt_id: str,
    buffer: list,
    total_links_ref: list,    # single-element list used as a mutable int ref
    total_unmatched_ref: list,  # single-element list: total unmatched word count
    batch_size: int,
    # ── NEW: pre-loaded in-memory data (avoids per-section DB queries) ────────
    all_headings: dict,    # { book_id: [ {'para_id':, 'title':, 'heading_number':} ] }
    all_sentences: dict,   # { book_id: [ {'para_id':, 'line_id':, 'pali_sentence':} ] }
    all_bold_words: dict,  # { book_id: [ {'para_id':, 'line_id':, 'word':, 'ending':} ] }
    norm_cache: dict,      # { (word, ending): [candidates] }  shared, mutable
) -> None:
    """
    Core linking logic for one (source, target) book pair.

    Logic is identical to the original _process_book_pair.
    The only change is that the four inner SQL queries
    (src heading list, tgt heading list, tgt_sentences, src_bold_words)
    are replaced by dict lookups + list comprehensions over pre-loaded data.
    """
    print(f"      src={src_id}  →  tgt={tgt_id}")

    # ── Section alignment ────────────────────────────────────────────────────
    # Original used two SQL queries; now we look up from pre-loaded dicts.
    src_headings = [h for h in all_headings.get(src_id, []) if h['heading_number'] == 10]
    tgt_headings = [h for h in all_headings.get(tgt_id, []) if h['heading_number'] == 10]
    tgt_map = {h['title']: h['para_id'] for h in tgt_headings}

    # Full heading list for tgt (any heading_number) — needed for t_end calculation
    tgt_all_headings = all_headings.get(tgt_id, [])
    # Full heading list for src (any heading_number) — needed for next_real calculation
    src_all_headings = all_headings.get(src_id, [])

    pair_links     = 0
    pair_unmatched = 0
    unmatched_words: List[str] = []
    unmatched_terms: List[Tuple[str, str, int, str]] = []

    for i, s_h in enumerate(src_headings):
        title = s_h['title']
        if title not in tgt_map:
            continue

        # ── Source section bounds ────────────────────────────────────────────
        s_start = s_h['para_id']
        s_end   = src_headings[i + 1]['para_id'] if i + 1 < len(src_headings) else 999999
        # Original: cursor.execute("SELECT para_id FROM headings WHERE book_id=?
        #   AND para_id>? AND heading_number!=10 ORDER BY para_id LIMIT 1", ...)
        next_real_para = next(
            (h['para_id'] for h in src_all_headings
             if h['para_id'] > s_start and h['heading_number'] != 10),
            None
        )
        if next_real_para is not None and next_real_para < s_end:
            s_end = next_real_para

        # ── Target section bounds ────────────────────────────────────────────
        t_start = tgt_map[title]
        # Original: cursor.execute("SELECT para_id FROM headings WHERE book_id=?
        #   AND para_id>? ORDER BY para_id LIMIT 1", ...)
        next_tgt_para = next(
            (h['para_id'] for h in tgt_all_headings if h['para_id'] > t_start),
            None
        )
        t_end = next_tgt_para if next_tgt_para is not None else 999999

        # ── Fetch data for this section pair ─────────────────────────────────
        # Original: two SQL queries per section iteration.
        # Now: filter pre-loaded in-memory lists.
        tgt_sentences = [
            s for s in all_sentences.get(tgt_id, [])
            if t_start <= s['para_id'] < t_end
        ]
        src_bold_words = [
            b for b in all_bold_words.get(src_id, [])
            if s_start <= b['para_id'] < s_end
        ]

        # ── Match each bold word against target sentences ─────────────────────
        for sbw in src_bold_words:
            s_word     = sbw['word']
            ending     = sbw['ending']
            # Cache normalize_for_search results (shared across all pairs)
            norm_key = (s_word, ending or '')
            if norm_key not in norm_cache:
                norm_cache[norm_key] = normalize_for_search(s_word, ending or '')
            candidates = norm_cache[norm_key]
            matched    = False

            for tgt_s in tgt_sentences:
                t_text = (tgt_s['pali_sentence'] or "").lower()
                t_text = re.sub(r'\[.*?\]', '', t_text)
                t_text = re.sub(r'\(.*?\)', '', t_text)
                t_text = re.sub(r'\{.*?\}', '', t_text)
                
                if any(clean_word_for_index(c, remove_space=True) in clean_word_for_index(t_text, remove_space=True) for c in candidates if c):
                    buffer.append((
                        tgt_id,  tgt_s['para_id'], tgt_s['line_id'],
                        src_id,  sbw['para_id'],   sbw['line_id'],
                        s_word,
                    ))
                    total_links_ref[0] += 1
                    pair_links += 1
                    matched = True

                    if len(buffer) >= batch_size:
                        cursor.executemany("""
                            INSERT OR IGNORE INTO book_links
                            (src_book, src_para, src_line,
                             dst_book, dst_para, dst_line, word)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, buffer)
                        cursor.connection.commit()
                        buffer.clear()

            if not matched:
                # global check_num
                # check_num += 1
                # if check_num > 0:
                #     print('\n')
                #     print(f"    unmatched: {src_id} {sbw['para_id']} {sbw['line_id']} {s_word}")
                #     print([tgs['pali_sentence'] for tgs in tgt_sentences])
                # if check_num > 100:
                #     exit()
                pair_unmatched += 1
                total_unmatched_ref[0] += 1
                url = (
                    f"{BOOKLINK_DEBUG_BASE_URL}/{src_id}"
                    f"?para={sbw['para_id']}&line_id={sbw['line_id']}"
                )
                unmatched_terms.append((tgt_id, src_id, sbw['para_id'], s_word))
                # unmatched_words.append(f"'{s_word}'  {url}")
                unmatched_words.append(f"{s_word} => {' '.join([tgs['pali_sentence'] for tgs in tgt_sentences])}")

    # ── Per-pair summary ──────────────────────────────────────────────────────
    total_words = pair_links + pair_unmatched
    match_pct   = (pair_links / total_words * 100) if total_words else 0.0
    print(
        f"        links={pair_links:,}  "
        f"unmatched={pair_unmatched:,}  "
        f"total_bold={total_words:,}  "
        f"match_rate={match_pct:.1f}%"
    )
    if unmatched_words:
        # save the log to file
        with open("unmatched_words.log", "a") as f:
            f.write(f"\n {src_id} {tgt_id}\n")
            f.write("\n".join(unmatched_words))
            f.write("\n")
        # Print up to 20 examples to keep the log readable; show a truncation
        # notice if there are more.
        MAX_SHOW = 20
        for entry in unmatched_words[:MAX_SHOW]:
            print(f"        [unmatched] {entry}")
        if len(unmatched_words) > MAX_SHOW:
            print(f"        … and {len(unmatched_words) - MAX_SHOW:,} more unmatched words (not shown)")

def rebuild_booklink(batch_size: int = 1000) -> None:
    """
    Drop, recreate, and populate book_links.
    """
    print("=== Rebuilding: book_links ===")
    print(f"    Normalisation mode: {BOOKLINK_NORM_MODE}")

    # ── Drop + create ─────────────────────────────────────────────────────────
    with get_db() as conn:
        print("  → Dropping book_links...")
        conn.execute("DROP TABLE IF EXISTS book_links")
        conn.commit()

    with get_db() as conn:
        print("  → Creating book_links...")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS book_links (
                src_book   TEXT    NOT NULL,
                src_para   INTEGER NOT NULL,
                src_line   INTEGER NOT NULL,
                dst_book   TEXT    NOT NULL,
                dst_para   INTEGER NOT NULL,
                dst_line   INTEGER NOT NULL,
                word        TEXT    NOT NULL,
                PRIMARY KEY (src_book, src_para, src_line,
                             dst_book, dst_para, dst_line, word)
            )
        """)
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_booklinks_mula "
            "ON book_links (src_book, src_para)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_booklinks_comm "
            "ON book_links (dst_book, dst_para)"
        )
        conn.commit()

    # ── Populate ──────────────────────────────────────────────────────────────
    import sqlite3 as _sqlite3

    def _parse_refs(value) -> list:
        """Parse a space-separated string of book_ids into a list of strings."""
        if not value:
            return []
        return [part.strip() for part in str(value).split(' ') if part.strip()]

    with get_db() as conn:
        conn.row_factory = _sqlite3.Row
        cursor = conn.cursor()

        # ── Pre-load all data into memory ONCE before processing any pairs ────
        # This replaces the per-section SQL queries inside _process_book_pair.

        print("\n  → Pre-loading all headings into memory...")
        all_headings: dict = defaultdict(list)
        for row in cursor.execute(
            "SELECT book_id, para_id, title, heading_number FROM headings ORDER BY book_id, para_id"
        ):
            all_headings[row['book_id']].append({
                'para_id':        row['para_id'],
                'title':          row['title'],
                'heading_number': row['heading_number'],
            })
        print(f"     {sum(len(v) for v in all_headings.values()):,} heading rows loaded.")

        print("  → Pre-loading all sentences into memory...")
        all_sentences: dict = defaultdict(list)
        for row in cursor.execute(
            "SELECT book_id, para_id, line_id, pali_sentence FROM sentences ORDER BY book_id, para_id, line_id"
        ):
            all_sentences[row['book_id']].append({
                'para_id':       row['para_id'],
                'line_id':       row['line_id'],
                'pali_sentence': row['pali_sentence'],
            })
        print(f"     {sum(len(v) for v in all_sentences.values()):,} sentence rows loaded.")

        print("  → Pre-loading all bold words (pali_definition) into memory...")
        all_bold_words: dict = defaultdict(list)
        for row in cursor.execute(
            "SELECT book_id, para_id, line_id, word, ending FROM pali_definition ORDER BY book_id, para_id, line_id"
        ):
            all_bold_words[row['book_id']].append({
                'para_id': row['para_id'],
                'line_id': row['line_id'],
                'word':    row['word'],
                'ending':  row['ending'],
            })
        print(f"     {sum(len(v) for v in all_bold_words.values()):,} bold-word rows loaded.")

        # Shared normalize_for_search cache — reused across all book pairs
        norm_cache: dict = {}

        buffer: list = []
        total_links     = [0]
        total_unmatched = [0]

        # ── Pass 1: Mūla → attha + tika ──────────────────────────────────────
        print("\n  ── Pass 1: Mūla books (attha_ref + tika_ref) ──")
        src_books = cursor.execute("""
            SELECT book_id, attha_ref, tika_ref
            FROM books
            WHERE category = 'Mūla'
        """).fetchall()

        for mula in src_books:
            src_id  = mula['book_id']
            targets = _parse_refs(mula['attha_ref']) + _parse_refs(mula['tika_ref'])
            if not targets:
                continue
            print(f"    Mūla: {src_id}")
            for tgt_id in targets:
                _process_book_pair(cursor, tgt_id, src_id, buffer, total_links, total_unmatched, batch_size,
                                   all_headings, all_sentences, all_bold_words, norm_cache)

        # ── Pass 2: Aṭṭhakathā → tika only ──────────────────────────────────
        print("\n  ── Pass 2: Aṭṭhakathā books (tika_ref only) ──")
        attha_books = cursor.execute("""
            SELECT book_id, attha_ref, tika_ref
            FROM books
            WHERE category = 'Aṭṭhakathā'
        """).fetchall()

        for attha in attha_books:
            attha_id = attha['book_id']
            targets  = _parse_refs(attha['attha_ref']) + _parse_refs(attha['tika_ref'])
            if not targets:
                continue
            print(f"    Aṭṭha: {attha_id}")
            for tgt_id in targets:
                _process_book_pair(cursor, tgt_id, attha_id, buffer, total_links, total_unmatched, batch_size,
                                   all_headings, all_sentences, all_bold_words, norm_cache)

        # ── Pass 3: Ṭīkā → Ṭīkā only ─────────────────────────────────────────
        print("\n  ── Pass 3: Ṭīkā books (tika_ref only) ──")
        tika_books = cursor.execute("""
            SELECT book_id, tika_ref
            FROM books
            WHERE category = 'Ṭīkā'
        """).fetchall()

        for tika in tika_books:
            tika_id = tika['book_id']
            targets = _parse_refs(tika['tika_ref'])
            if not targets:
                continue
            print(f"    Tīkā: {tika_id}")
            for tgt_id in targets:
                _process_book_pair(cursor, tgt_id, tika_id, buffer, total_links, total_unmatched, batch_size,
                                   all_headings, all_sentences, all_bold_words, norm_cache)

        # ── Final flush ───────────────────────────────────────────────────────
        if buffer:
            cursor.executemany("""
                INSERT OR IGNORE INTO book_links
                (src_book, src_para, src_line,
                 dst_book, dst_para, dst_line, word)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, buffer)
            conn.commit()

    grand_total = total_links[0] + total_unmatched[0]
    overall_pct = (total_links[0] / grand_total * 100) if grand_total else 0.0
    print(f"\n  ┌─ Grand total ─────────────────────────────────────")
    print(f"  │  Links generated  : {total_links[0]:,}")
    print(f"  │  Unmatched words  : {total_unmatched[0]:,}")
    print(f"  │  Total bold words : {grand_total:,}")
    print(f"  │  Overall match    : {overall_pct:.1f}%")
    print(f"  └───────────────────────────────────────────────────")
    print("=== Done: book_links ===")

# ─────────────────────────────────────────────────────────────────────────────
# Cleanup: drop all four tables + VACUUM
# ─────────────────────────────────────────────────────────────────────────────

def cleanup_tables() -> None:
    """
    Drop all four search/index tables and VACUUM the database to reclaim space.

    Tables dropped (in dependency order):
        book_links
        pali_definition
        sentences_fts
        words
    """
    print("=== Cleanup: dropping index tables ===")

    tables = [
        "book_links",
        "pali_definition",
        "sentences_fts",
        "words",
    ]

    with get_db() as conn:
        for table in tables:
            print(f"  → Dropping {table}...")
            conn.execute(f"DROP TABLE IF EXISTS {table}")
        conn.commit()
        print("  → All tables dropped.")

    # VACUUM must run outside any transaction; get_db() context manager
    # should close the previous connection, so we open a fresh one here.
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
        flask rebuild fts        # sentences_fts + words
        flask rebuild words      # words only
        flask rebuild palidef    # pali_definition
        flask rebuild booklink   # book_links
        flask rebuild all        # all four in sequence

        flask cleanup            # drop all four tables + VACUUM
    """

    @app.cli.group("rebuild")
    def rebuild_cli():
        """Rebuild search / definition tables (drop → create → populate)."""

    @rebuild_cli.command("fts")
    def rebuild_fts_cmd():
        """Drop, recreate, and populate sentences_fts and words."""
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
        """Drop all search/index tables (book_links, pali_definition, sentences_fts, words) and VACUUM."""
        cleanup_tables()
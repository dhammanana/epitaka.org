# app/services/dictionary.py
"""
Dictionary lookup service.

Primary lookup: dpd-dictionary.db (dpd_lookup → dpd_headwords)
Fallback:     epitaka.db (dictionary + dictionary_books tables)

Pipeline:
  1. Try dpd-dictionary.db: query dpd_lookup by lookup_key → get headword IDs → fetch dpd_headwords
  2. Try epitaka.db: dictionary table for the same word
  3. Fall back to dictionary table stem matching
"""
import json
from ..utils.db import get_dpd_db, get_db
from ..services.books import load_hierarchy, get_book_name
from ..utils.text import normalize_pali, markdown_to_html
from ..config import Config
import re


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def search_auto(word: str) -> list:
    """
    Full dictionary lookup pipeline.

    Returns a list of definition dicts, each shaped like:
    {
        "word":        str,            # headword / lemma
        "definition":  str,            # HTML definition body
        "book_name":   str,            # dictionary source name
        "usages":      [               # sentence usages from pali_definition
            {
                "book_name":    str,
                "para_id":      int,
                "line_id":      int,
                "word":         str,
                "ending":       str | None,
                "pali":         str,
                "translation":  str | None,
                "reader_url":   str,
            },
            ...
        ]
    }
    """
    word = word.strip().lower()
    word = "".join(c for c in word if c.isalnum())
    if not word:
        return []

    results = []

    # ── Step 1: Try dpd-dictionary.db ────────────────────────────────────
    dpd_results = _search_dpd(word)
    results.extend(dpd_results)

    # ── Step 2: Try epitaka.db dictionary tables ─────────────────────────
    if not results:
        dict_results = _search_epitaka_dict(word)
        results.extend(dict_results)

    # ── Attach sentence usages ────────────────────────────────────────────
    for entry in results:
        stem = entry.get("stem") or entry.get("word")
        entry["usages"] = _get_usages_for_stem(stem)

    return results


# ─────────────────────────────────────────────────────────────────────────────
# DPD Dictionary (dpd-dictionary.db)
# ─────────────────────────────────────────────────────────────────────────────

def _search_dpd(word: str) -> list:
    """Search dpd-dictionary.db using the new schema (dpd_lookup → dpd_headwords)."""
    dpd_db = get_dpd_db()
    if dpd_db is None:
        return []

    results = []

    # Step 1: Look up the word in dpd_lookup table
    cursor = dpd_db.cursor()

    # Try exact match first
    cursor.execute(
        'SELECT lookup_key, headwords, deconstructor FROM dpd_lookup WHERE lookup_key = ?',
        (word,),
    )
    row = cursor.fetchone()

    # Try prefix match if exact match fails
    if not row:
        cursor.execute(
            'SELECT lookup_key, headwords, deconstructor FROM dpd_lookup WHERE lookup_key LIKE ? LIMIT 1',
            (word + '%',),
        )
        row = cursor.fetchone()

    if not row:
        return []

    # Parse headwords JSON (list of int IDs referencing dpd_headwords)
    headwords_json = row['headwords']
    deconstructor_json = row['deconstructor']

    try:
        headword_ids = json.loads(headwords_json) if headwords_json else []
    except (json.JSONDecodeError, TypeError):
        headword_ids = []

    # Parse deconstructor for compound analysis
    deconstructor_parts = []
    if deconstructor_json:
        try:
            deconstructor_parts = json.loads(deconstructor_json)
        except (json.JSONDecodeError, TypeError):
            pass

    # If no headwords but deconstructor exists, return decomposition entries
    if not headword_ids and deconstructor_parts:
        for decon_str in deconstructor_parts:
            # Parse each decomposition: "canda + gutto" → ["canda", "gutto"]
            component_words = [w.strip() for w in decon_str.replace(' + ', '+').split('+') if w.strip()]
            if component_words:
                results.append({
                    'word': word,
                    'type': 'deconstruction',
                    'deconstruction': decon_str,
                    'components': component_words,
                    'book_name': 'DPD — Compound Analysis',
                    'definition': '',
                    'stem': word,
                })
        return results

    if not headword_ids:
        return []

    # Step 2: Fetch headword entries from dpd_headwords
    placeholders = ','.join('?' * len(headword_ids))
    cursor.execute(
        f'SELECT id, lemma_1, meaning_html, antonym, synonym, stem, pattern '
        f'FROM dpd_headwords WHERE id IN ({placeholders})',
        headword_ids,
    )
    headword_rows = cursor.fetchall()

    for hw in headword_rows:
        lemma = hw['lemma_1'] or ''
        meaning_html = hw['meaning_html'] or ''
        stem = hw['stem'] or lemma

        # Clean lemma: remove trailing id suffix like " 1.1", " 2.1"
        clean_lemma = re.sub(r'\s+[\d\.]+$', '', lemma).strip()

        # Build definition HTML
        definition = meaning_html

        # Add deconstructor info if available
        if deconstructor_parts:
            decon_html = '<div class="dpd-deconstructor">'
            for part in deconstructor_parts:
                decon_html += f'<span class="dpd-decon-part">{part}</span>'
            decon_html += '</div>'
            definition = decon_html + definition

        results.append({
            'word': clean_lemma or word,
            'definition': definition,
            'book_name': 'DPD',
            'stem': stem or clean_lemma or word,
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Epitaka Dictionary (fallback from epitaka.db)
# ─────────────────────────────────────────────────────────────────────────────

def _search_epitaka_dict(word: str) -> list:
    """Fallback: search the dictionary table in epitaka.db."""
    with get_db() as conn:
        cursor = conn.cursor()

        # Try exact word match
        cursor.execute('''
            SELECT d.word, d.definition, b.name AS book_name, b.user_order
            FROM dictionary d
            JOIN dictionary_books b ON d.book_id = b.id
            WHERE d.word = ? AND b.user_choice = 1
            ORDER BY b.user_order
        ''', (word,))
        rows = cursor.fetchall()

        if not rows:
            # Try normalized match
            cursor.execute('''
                SELECT d.word, d.definition, b.name AS book_name, b.user_order
                FROM dictionary d
                JOIN dictionary_books b ON d.book_id = b.id
                WHERE d.word = ? AND b.user_choice = 1
                ORDER BY b.user_order
            ''', (normalize_pali(word),))
            rows = cursor.fetchall()

        if not rows:
            return []

        return [
            {
                'word': r['word'],
                'definition': r['definition'],
                'book_name': r['book_name'],
                'stem': r['word'],
            }
            for r in rows
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Sentence usage lookup (from epitaka.db pali_definition table)
# ─────────────────────────────────────────────────────────────────────────────

def _get_usages_for_stem(stem: str, limit: int = 5) -> list:
    """
    Find sentences in pali_definition where the word matches stem,
    then join with sentences table to get the full Pali text.

    Returns up to `limit` usage dicts.
    """
    if not stem:
        return []

    with get_db() as conn:
        cursor = conn.cursor()

        # Try matching by stem field first (if it exists)
        cursor.execute("PRAGMA table_info(pali_definition)")
        columns = [col['name'] for col in cursor.fetchall()]

        if 'stem' in columns:
            rows = cursor.execute("""
                SELECT
                    pd.book_id,
                    pd.para_id,
                    pd.line_id,
                    pd.word,
                    pd.ending,
                    s.pali
                FROM pali_definition pd
                JOIN sentences s
                  ON  s.book_id = pd.book_id
                  AND s.para_id = pd.para_id
                  AND s.line_id = pd.line_id
                WHERE pd.stem = ?
                ORDER BY pd.book_id, pd.para_id, pd.line_id
                LIMIT ?
            """, (stem, limit)).fetchall()
        else:
            # Fallback: match by word
            rows = cursor.execute("""
                SELECT
                    pd.book_id,
                    pd.para_id,
                    pd.line_id,
                    pd.word,
                    pd.ending,
                    s.pali
                FROM pali_definition pd
                JOIN sentences s
                  ON  s.book_id = pd.book_id
                  AND s.para_id = pd.para_id
                  AND s.line_id = pd.line_id
                WHERE pd.word = ?
                ORDER BY pd.book_id, pd.para_id, pd.line_id
                LIMIT ?
            """, (stem, limit)).fetchall()

        usages = []
        for row in rows:
            book_id = row['book_id']
            para_id = row['para_id']
            line_id = row['line_id']
            word = row['word']
            ending = row['ending']
            pali = row['pali'] or ''

            usages.append({
                "book_name": get_book_name(book_id),
                "para_id": para_id,
                "line_id": line_id,
                "word": word,
                "ending": ending,
                "pali": markdown_to_html(pali),
                "translation": None,
                "reader_url": f"/book/{book_id}?para={para_id}",
            })

        return usages


# ─────────────────────────────────────────────────────────────────────────────
# Word suggestions (for autocomplete)
# ─────────────────────────────────────────────────────────────────────────────

def suggest_words(query: str) -> list:
    """Get word suggestions from dpd-dictionary.db lookup keys."""
    if not query:
        return []

    dpd_db = get_dpd_db()
    if dpd_db is None:
        return _fallback_suggest(query)

    try:
        cursor = dpd_db.cursor()
        cursor.execute(
            'SELECT lookup_key FROM dpd_lookup WHERE lookup_key LIKE ? ORDER BY lookup_key LIMIT ?',
            (query + '%', Config.MAX_SUGGESTIONS),
        )
        rows = cursor.fetchall()
        if rows:
            return [r['lookup_key'] for r in rows]
    except Exception:
        pass

    return _fallback_suggest(query)


def _fallback_suggest(query: str) -> list:
    """Fallback: try from epitaka.db words table if it exists."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT word FROM words WHERE plain LIKE ? ORDER BY frequency DESC LIMIT ?',
                (normalize_pali(query) + '%', Config.MAX_SUGGESTIONS),
            )
            return [r['word'] for r in cursor.fetchall()]
    except Exception:
        return []

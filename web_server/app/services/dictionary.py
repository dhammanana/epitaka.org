# app/services/dictionary.py
from ..utils.db import get_db
from ..services.loadtocs import load_hierarchy
from ..utils.text import normalize_pali, markdown_to_html 
from ..config import Config


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────
def load_books():
    return load_hierarchy()

def get_book_name(book_id: str) -> str:
    """Get book name from book_id."""
    return load_books().get(book_id, {}).get("book_name", "")

def search_auto(word: str) -> list:
    """
    Full dictionary lookup pipeline.

    Returns a list of definition dicts, each shaped like:
    {
        "word":        str,            # headword / stem
        "definition":  str,            # HTML definition body
        "book_name":   str,            # dictionary source name
        "usages":      [               # sentence usages from pali_definition
            {
                "book_id":       str,
                "para_id":       int,
                "line_id":       int,
                "word":          str,  # inflected bold form in the sentence
                "ending":        str | None,
                "pali":          str,  # full Pali sentence
                "english":       str | None,
                "vietnamese":    str | None,
                "reader_url":    str,  # link to open in reader
            },
            ...
        ]
    }
    """
    word = word.strip().lower()
    word = "".join(c for c in word if c.isalnum())
    if not word:
        return []

    with get_db() as conn:
        results = _search_with_tpr(conn, word)
        if not results:
            results = _search_with_dpd_split(conn, word)

        # Attach sentence usages to each result based on stem
        stems_seen = set()
        for entry in results:
            stem = entry.get("stem") or entry.get("word")
            if stem and stem not in stems_seen:
                stems_seen.add(stem)
                entry["usages"] = _get_usages_for_stem(conn, stem)
            else:
                entry["usages"] = []

        return results


# ─────────────────────────────────────────────────────────────────────────────
# Sentence usage lookup
# ─────────────────────────────────────────────────────────────────────────────

def _get_usages_for_stem(conn, stem: str, limit: int = 5) -> list:
    """
    Find sentences in pali_definition where the resolved stem matches,
    then join with sentences table to get the full Pali + translations.

    Returns up to `limit` usage dicts.
    """
    rows = conn.execute("""
        SELECT
            pd.book_id,
            pd.para_id,
            pd.line_id,
            pd.word,
            pd.ending,
            s.pali_sentence,
            s.english_translation,
            s.vietnamese_translation
        FROM pali_definition pd
        JOIN sentences s
          ON  s.book_id = pd.book_id
          AND s.para_id = pd.para_id
          AND s.line_id = pd.line_id
        WHERE pd.stem = ?
        ORDER BY pd.book_id, pd.para_id, pd.line_id
        LIMIT ?
    """, (stem, limit)).fetchall()

    usages = []
    for row in rows:
        book_id, para_id, line_id, word, ending, pali, english, vietnamese = row
        usages.append({
            "book_name":    get_book_name(book_id),
            "para_id":    para_id,
            "line_id":    line_id,
            "word":       word,
            "ending":     ending,
            "pali":       markdown_to_html(pali) or "",
            "english":    markdown_to_html(english) or "",
            "vietnamese": markdown_to_html(vietnamese) or "",
            "reader_url": f"/book/{book_id}?para={para_id}",
        })

    return usages


# ─────────────────────────────────────────────────────────────────────────────
# TPR pipeline helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_dpd_headwords(conn, word: str) -> str:
    row = conn.execute(
        'SELECT headwords FROM dpd_inflections_to_headwords WHERE inflection = ?',
        (word,)
    ).fetchone()
    return row['headwords'] if row else ''


def _resolve_tpr_word(word: str, dpd_headwords: str) -> tuple[str, bool]:
    import re
    if not dpd_headwords:
        return word, False
    parts = dpd_headwords.split(',')
    dpd_word = parts[0]
    dpd_word = re.sub(r"['\[\]\d\s]", '', dpd_word)
    if dpd_word == 'āyasmant':
        return 'āyasmantu', False
    if dpd_word == 'bhikkhave':
        return 'bhikkhu', False
    if dpd_word == 'ambho':
        return dpd_word, True
    if 'āyasm' in word:
        dpd_word = 'āyasmantu'
    if len(dpd_word) > 4 and dpd_word[-4:] == 'vant':
        dpd_word = dpd_word[:-4] + 'vantu'
    return dpd_word, False


def _get_dictionary_definitions(conn, word: str, is_already_stem: bool) -> list:
    rows = conn.execute('''
        SELECT d.word, d.definition, b.name AS book_name, b.user_order
        FROM dictionary d
        JOIN dictionary_books b ON d.book_id = b.id
        WHERE d.word = ? AND b.user_choice = 1
        ORDER BY b.user_order
    ''', (word,)).fetchall()
    return [dict(r) for r in rows]


def _get_dpd_definition(conn, headwords: str) -> dict | None:
    """
    Fetch from the `dpd` table for each headword — mirrors getDpdDefinition().
    Returns a single merged Definition dict or None.
    """
    line = headwords.replace('[', '').replace(']', '').replace("'", '')
    words = [w.strip() for w in line.split(',') if w.strip()]

    combined_def = ''
    book_name = ''
    user_order = 0

    for w in words:
        row = conn.execute('''
            SELECT d.word, d.definition, d.book_id, b.name, b.user_order
            FROM dpd d
            JOIN dictionary_books b ON d.book_id = b.id
            WHERE d.word = ? AND b.user_choice = 1
        ''', (w,)).fetchone()
        if row and row['definition']:
            combined_def += row['definition']
            book_name   = row['name']
            user_order  = row['user_order']

    if not combined_def:
        return None
    return {'word': words[0] if words else '', 'definition': combined_def,
            'book_name': book_name, 'user_order': user_order}


def _get_dpd_grammar_definition(conn, word: str) -> dict | None:
    """Mirrors getDpdGrammarDefinition()."""
    row = conn.execute(
        'SELECT word, definition FROM dpd_grammar WHERE word = ?', (word,)
    ).fetchone()
    if not row:
        return None
    grammar_html = (
        "<hr><div style='text-align:center;margin-bottom:10px'>DPD Grammar</div>"
        f"<hr><br>{row['definition']}"
    )
    return {'word': row['word'], 'definition': grammar_html,
            'book_name': 'DPD Grammar', 'user_order': 0}


def _search_with_tpr(conn, original_word: str) -> list:
    """Mirrors searchWithTPR()."""
    dpd_headwords = _get_dpd_headwords(conn, original_word)
    resolved_word, is_already_stem = _resolve_tpr_word(original_word, dpd_headwords)

    definitions = _get_dictionary_definitions(conn, resolved_word, is_already_stem)

    # DPD table (book_id 11) — always attempt if headwords found
    if dpd_headwords:
        dpd_def = _get_dpd_definition(conn, dpd_headwords)
        if dpd_def:
            if Config.DPD_GRAMMAR:
                grammar_def = _get_dpd_grammar_definition(conn, original_word)
                if grammar_def:
                    dpd_def['definition'] += grammar_def['definition']
            definitions.insert(0, dpd_def)
            definitions.sort(key=lambda d: d.get('user_order', 0))

    # Attach the resolved stem so search_auto can look up usages
    stem = resolved_word
    return [
        {
            'word':      d['word'],
            'definition': d['definition'],
            'book_name': d['book_name'],
            'stem':      stem,
        }
        for d in definitions
    ]


# ─────────────────────────────────────────────────────────────────────────────
# DPD-split fallback pipeline
# ─────────────────────────────────────────────────────────────────────────────

def _get_dpr_stem(conn, word: str) -> str:
    """Mirrors getDprStem()."""
    row = conn.execute(
        'SELECT stem FROM dpr_stem WHERE word = ?', (word,)
    ).fetchone()
    return row['stem'] if row else ''


def _get_dpd_word_split(conn, word: str) -> str:
    """Mirrors getDpdWordSplit()."""
    row = conn.execute(
        'SELECT breakup FROM dpd_word_split WHERE word = ?', (word,)
    ).fetchone()
    return row['breakup'] if row else ''


def _search_with_dpd_split(conn, word: str) -> list:
    """Mirrors searchWithDpdSplit()."""
    definitions = []

    dpr_stem = _get_dpr_stem(conn, word)
    if dpr_stem:
        definitions = _get_dictionary_definitions(conn, dpr_stem, is_already_stem=True)
        # Tag each entry with its stem for usage lookup
        for d in definitions:
            d['stem'] = dpr_stem

    # DPD table lookup
    dpd_headwords = _get_dpd_headwords(conn, word)
    if dpd_headwords:
        dpd_def = _get_dpd_definition(conn, dpd_headwords)
        if dpd_def:
            dpd_def['stem'] = dpr_stem or word
            definitions.insert(0, dpd_def)

    if definitions:
        definitions.sort(key=lambda d: d.get('user_order', 0))
        return [
            {
                'word':       d['word'],
                'definition': d['definition'],
                'book_name':  d['book_name'],
                'stem':       d.get('stem', word),
            }
            for d in definitions
        ]

    # Final fallback — word split table
    breakup = _get_dpd_word_split(conn, word)
    if not breakup:
        return []

    split_words = [w.strip() for w in breakup.split(',') if w.strip()]
    split_results = []
    for sw in split_words:
        rows = _get_dictionary_definitions(conn, sw, is_already_stem=True)
        for d in rows:
            d['stem'] = sw
        split_results.extend(rows)

    return [
        {
            'word':       d['word'],
            'definition': d['definition'],
            'book_name':  d['book_name'],
            'stem':       d.get('stem', word),
        }
        for d in split_results
    ]
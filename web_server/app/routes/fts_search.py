# ─────────────────────────────────────────────────────────────
# REPLACE the fts_search section in app/routes/api.py with this.
#
# Required imports (add any missing ones at top of api.py):
from flask import Blueprint, jsonify, request
from collections import defaultdict
import re
from ..utils.db import get_db
from ..utils.text import markdown_to_html, trim_text
from ..services.loadtocs import load_hierarchy
from ..config import Config


# ── Helper: build allowed book_id set from filter params ──────────────────
def _get_allowed_books(hierarchy, pitakas_param, layers_param):
    """
    Returns a frozenset of book_ids matching the filter, or None (= allow all).
    Pitaka labels: suttanta, vinaya, abhidhamma, anna
    Layer labels:  mula, attha, tika
    """
    PITAKA_MATCH = {
        'suttanta':   lambda m: 'Sutta'      in (m.get('nikaya') or ''),
        'vinaya':     lambda m: 'Vinaya'     in (m.get('nikaya') or ''),
        'abhidhamma': lambda m: 'Abhidhamma' in (m.get('nikaya') or ''),
        'anna':       lambda m: m.get('category') == 'Añña',
    }
    LAYER_MATCH = {
        'mula':  lambda m: m.get('category') == 'Mūla',
        'attha': lambda m: m.get('category') == 'Aṭṭhakathā',
        'tika':  lambda m: m.get('category') == 'Ṭīkā',
    }

    pitakas = [p.strip() for p in pitakas_param.split(',') if p.strip()] if pitakas_param else []
    layers  = [l.strip() for l in layers_param.split(',')  if l.strip()] if layers_param  else []

    if not pitakas and not layers:
        return None

    allowed = set()
    for book_id, meta in hierarchy.items():
        pass_p = (not pitakas) or any(PITAKA_MATCH[p](meta) for p in pitakas if p in PITAKA_MATCH)
        pass_l = (not layers)  or any(LAYER_MATCH[l](meta)  for l in layers  if l in LAYER_MATCH)
        if pass_p and pass_l:
            allowed.add(book_id)
    return frozenset(allowed)


# ── Helper: normalise query → list of words ───────────────────────────────
def _normalise_query(query):
    clean = re.sub(r'[^\w\s]', ' ', query)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return [w for w in clean.split() if w]


# ── Helper: book-filter SQL fragment ─────────────────────────────────────
def _book_filter_clause(allowed_books, alias='f'):
    """Returns (sql_fragment, params_list)."""
    if allowed_books is None:
        return '', []
    placeholders = ','.join('?' * len(allowed_books))
    return f' AND {alias}.book_id IN ({placeholders})', list(allowed_books)


# ── Helper: highlight search words in HTML text ───────────────────────────
def _highlight_words(html_text: str, words: list) -> str:
    """
    Wrap each search word (prefix match) in <mark> tags inside already-rendered
    HTML.  Works on the rendered HTML string so markdown_to_html() runs first.

    We match whole-word prefixes only (\\b prefix) so that 'dukkh' matches
    'dukkha' but not 'adukkha'.  The match is case-insensitive and
    diacritic-sensitive (FTS already handles diacritic folding; here we mirror
    what was actually stored).

    HTML tags are skipped — the regex only touches text nodes between tags.
    """
    if not html_text or not words:
        return html_text

    # Build one pattern that matches any word prefix not inside an HTML tag.
    # We process the string by splitting on tags and only replacing in text nodes.
    parts = re.split(r'(<[^>]+>)', html_text)
    result = []
    for part in parts:
        if part.startswith('<'):
            # HTML tag — pass through unchanged
            result.append(part)
        else:
            # Text node — apply highlights
            for w in words:
                # Escape the word for regex, then match as a prefix
                escaped = re.escape(w)
                part = re.sub(
                    r'(?i)\b(' + escaped + r'\w*)',
                    r'<mark>\1</mark>',
                    part
                )
            result.append(part)
    return ''.join(result)


def register_search_route(bp):
    # ── /api/fts_search ────────────────────────────────────────────────────────
    @bp.route('/fts_search')
    def fts_search():
        """
        Full-text search endpoint.

        mode=sentence (was: exact)
            All words must appear in the SAME SENTENCE.
            Uses sentences_fts_v2 (one FTS row per sentence) — the FTS engine
            itself enforces co-occurrence within a row, so no Python sentence-
            splitting is needed.  Very fast even at 1.2 M rows.

        mode=para
            All words in the same paragraph (unchanged behaviour).
            Uses sentences_fts (one FTS row per paragraph).
            Sorted by canonical books.id order then para_id.

        mode=distance
            Words may be in different sentences but must appear within
            `distance` tokens of each other inside a passage window.
            Uses passages_fts (sliding windows of PASSAGE_WINDOW sentences)
            with FTS5 NEAR() operator.  Pure index scan — no Python loop over
            1.2 M rows.  The `distance` parameter maps directly to the NEAR
            token distance.

        Query params:
        q          Search string
        mode       sentence | para | distance   (default: sentence)
        distance   NEAR token distance          (default: 15)
        page       1-based page number          (default: 1)
        limit      Results per page             (default: Config.MAX_SEARCH_RESULTS or 20)
        pitakas    Comma-separated: suttanta,vinaya,abhidhamma,anna
        layers     Comma-separated: mula,attha,tika

        Response shape (unchanged from original):
        {
          results: [
            { book_id, book_name,
              items: [{ book_id, para_id, pali, english }] }
          ],
          total, page, pages, words
        }
        """
        hierarchy = load_hierarchy()
        query     = request.args.get('q', '').strip()
        mode      = request.args.get('mode', 'sentence')
        page      = max(1, int(request.args.get('page',     '1') or '1'))
        distance  = max(1, int(request.args.get('distance', '15') or '15'))
        limit     = max(1, int(request.args.get('limit',
                        str(getattr(Config, 'MAX_SEARCH_RESULTS', 20))) or '20'))
        pitakas   = request.args.get('pitakas', '').strip()
        layers    = request.args.get('layers',  '').strip()

        if not query:
            return jsonify({'results': [], 'total': 0, 'page': page, 'pages': 0})

        words = _normalise_query(query)
        if not words:
            return jsonify({'results': [], 'total': 0, 'page': page, 'pages': 0})

        allowed_books = _get_allowed_books(hierarchy, pitakas, layers)

        with get_db() as conn:
            cursor = conn.cursor()

            if mode == 'distance':
                rows, total = _search_distance(cursor, words, distance, allowed_books, page, limit)
            elif mode == 'para':
                rows, total = _search_para(cursor, words, allowed_books, page, limit)
            else:
                # 'sentence' mode (also accepts legacy 'exact' value)
                rows, total = _search_sentence(cursor, words, allowed_books, page, limit)

        # ── Group by book, ordered by books.id ────────────────────────────────
        grouped = {}
        for row in rows:
            bid = row['book_id']
            if bid not in grouped:
                grouped[bid] = {
                    'book_id':   bid,
                    'book_name': hierarchy.get(bid, {}).get('book_name', bid),
                    'items':     [],
                }

            pali_html    = markdown_to_html(row.get('pali_paragraph')    or '')
            english_html = markdown_to_html(row.get('english_paragraph') or '')

            # Apply <mark> highlights to both rendered HTML strings
            pali_html    = _highlight_words(pali_html,    words)
            english_html = _highlight_words(english_html, words)

            grouped[bid]['items'].append({
                'book_id': bid,
                'para_id': row['para_id'],
                'pali':    pali_html,
                'english': english_html,
            })

        pages = (total + limit - 1) // limit if total else 0

        return jsonify({
            'results': list(grouped.values()),
            'total':   total,
            'page':    page,
            'pages':   pages,
            'words':   words,
        })


# ─────────────────────────────────────────────────────────────────────────────
# mode=sentence  — uses sentences_fts_v2
# ─────────────────────────────────────────────────────────────────────────────

def _search_sentence(cursor, words, allowed_books, page, limit):
    """
    All words must co-occur within a single sentence row.

    sentences_fts_v2 has one row per sentence, so an FTS AND query is
    sufficient — no Python sentence-splitting needed.

    After finding matching sentence rows we resolve each back to its
    paragraph (book_id + para_id) so the caller can return full paragraph
    text in the standard output format.  Deduplication of paragraphs is
    applied: if two sentences in the same paragraph both match, the paragraph
    appears only once (at its first matching sentence's position).

    Sorted by books.id canonical order then para_id.
    """
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
    bf_sql, bf_params = _book_filter_clause(allowed_books, alias='v')

    # Count distinct paragraphs (for pagination total)
    count_sql = f'''
        SELECT COUNT(DISTINCT v.book_id || '|' || v.para_id)
        FROM sentences_fts_v2 v
        WHERE v.sentences_fts_v2 MATCH ?{bf_sql}
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

    if total == 0:
        return [], 0

    offset = (page - 1) * limit

    # Fetch the first matching sentence per paragraph, in canonical order.
    # COALESCE(b.id, 9999) puts books not in the books table at the end.
    data_sql = f'''
        SELECT v.book_id, v.para_id,
               MIN(COALESCE(b.id, 9999)) AS book_order,
               MIN(v.para_id)            AS first_para
        FROM sentences_fts_v2 v
        LEFT JOIN books b ON v.book_id = b.book_id
        WHERE v.sentences_fts_v2 MATCH ?{bf_sql}
        GROUP BY v.book_id, v.para_id
        ORDER BY book_order, v.para_id
        LIMIT ? OFFSET ?
    '''
    para_hits = cursor.execute(data_sql, [fts_query] + bf_params + [limit, offset]).fetchall()

    if not para_hits:
        return [], total

    # Fetch full paragraph text for this page's results in one batched query
    rows = _fetch_paragraphs(cursor, [(r['book_id'], r['para_id']) for r in para_hits])
    return rows, total


# ─────────────────────────────────────────────────────────────────────────────
# mode=para  — uses sentences_fts (paragraph level, unchanged logic)
# ─────────────────────────────────────────────────────────────────────────────

def _search_para(cursor, words, allowed_books, page, limit):
    """
    All words in same paragraph via FTS5 AND prefix query.
    Sorted by books.id then para_id (canonical scripture order).
    """
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
    offset            = (page - 1) * limit
    bf_sql, bf_params = _book_filter_clause(allowed_books)

    count_sql = f'''
        SELECT COUNT(*)
        FROM sentences_fts f
        WHERE f.sentences_fts MATCH ?{bf_sql}
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

    if total == 0:
        return [], 0

    data_sql = f'''
        SELECT f.book_id, f.para_id, f.pali_paragraph, f.english_paragraph,
               COALESCE(b.id, 9999) AS book_order
        FROM sentences_fts f
        LEFT JOIN books b ON f.book_id = b.book_id
        WHERE f.sentences_fts MATCH ?{bf_sql}
        ORDER BY book_order, f.para_id
        LIMIT ? OFFSET ?
    '''
    rows = cursor.execute(data_sql, [fts_query] + bf_params + [limit, offset]).fetchall()
    return [dict(r) for r in rows], total


# ─────────────────────────────────────────────────────────────────────────────
# mode=distance  — uses passages_fts with FTS5 NEAR()
# ─────────────────────────────────────────────────────────────────────────────

def _search_distance(cursor, words, max_distance, allowed_books, page, limit):
    """
    Words must appear within `max_distance` tokens of each other, but they
    can span sentence boundaries — they just need to fall within the same
    passage window (built from PASSAGE_WINDOW consecutive sentences).

    Uses passages_fts with the FTS5 NEAR() operator:
        NEAR(word1 word2 word3, max_distance)

    This is a pure index scan — no Python sliding window over 1.2 M rows.

    After finding matching passage rows we resolve back to paragraphs
    (using anchor_para_id stored in each passage row), deduplicate, and
    fetch the full paragraph text for display.

    The `distance` parameter from the API maps 1:1 to the NEAR token count.
    Reasonable defaults:
        distance=10   → words within ~1 sentence of each other
        distance=20   → words within ~2-3 sentences
        distance=50   → anywhere in the passage window
    """
    if len(words) == 1:
        # Single word — NEAR is meaningless; fall back to paragraph search
        return _search_para(cursor, words, allowed_books, page, limit)

    # Build NEAR query: NEAR(word1 word2 …, distance)
    # Each term gets a prefix wildcard so 'dukkh' matches 'dukkha' etc.
    near_terms  = ' '.join(f'"{w}"*' for w in words)
    fts_query   = f'NEAR({near_terms}, {max_distance})'
    bf_sql, bf_params = _book_filter_clause(allowed_books, alias='p')

    # Count distinct paragraphs for pagination
    count_sql = f'''
        SELECT COUNT(DISTINCT p.book_id || '|' || p.anchor_para_id)
        FROM passages_fts p
        WHERE p.passages_fts MATCH ?{bf_sql}
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

    if total == 0:
        return [], 0

    offset = (page - 1) * limit

    # One passage row per distinct paragraph, in canonical order.
    # MIN(p.seq_start) picks the earliest window when multiple passage windows
    # from the same paragraph match.
    data_sql = f'''
        SELECT p.book_id,
               p.anchor_para_id                AS para_id,
               MIN(COALESCE(b.id, 9999))        AS book_order,
               MIN(p.seq_start)                AS first_seq
        FROM passages_fts p
        LEFT JOIN books b ON p.book_id = b.book_id
        WHERE p.passages_fts MATCH ?{bf_sql}
        GROUP BY p.book_id, p.anchor_para_id
        ORDER BY book_order, p.anchor_para_id
        LIMIT ? OFFSET ?
    '''
    para_hits = cursor.execute(data_sql, [fts_query] + bf_params + [limit, offset]).fetchall()

    if not para_hits:
        return [], total

    rows = _fetch_paragraphs(cursor, [(r['book_id'], r['para_id']) for r in para_hits])
    return rows, total


# ─────────────────────────────────────────────────────────────────────────────
# Shared helper: fetch full paragraph text for a list of (book_id, para_id)
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_paragraphs(cursor, pairs: list) -> list:
    """
    Fetch pali_paragraph + english_paragraph for a page of (book_id, para_id)
    pairs from sentences_fts in one batched OR query.

    Falls back to a GROUP_CONCAT on sentences for any pair not found in
    sentences_fts (should be rare — only if index is stale).

    Returns rows in the same order as `pairs`.
    """
    if not pairs:
        return []

    placeholders = ' OR '.join('(book_id = ? AND para_id = ?)' for _ in pairs)
    params       = [val for pair in pairs for val in pair]

    rows = cursor.execute(f'''
        SELECT book_id, para_id, pali_paragraph, english_paragraph
        FROM sentences_fts
        WHERE {placeholders}
    ''', params).fetchall()

    row_map = {(r['book_id'], r['para_id']): dict(r) for r in rows}

    final = []
    for book_id, para_id in pairs:
        key = (book_id, para_id)
        if key in row_map:
            final.append(row_map[key])
        else:
            # Fallback: reconstruct from raw sentences table
            srow = cursor.execute('''
                SELECT book_id, para_id,
                       GROUP_CONCAT(pali_sentence,       ' ') AS pali_paragraph,
                       GROUP_CONCAT(english_translation, ' ') AS english_paragraph
                FROM sentences
                WHERE book_id = ? AND para_id = ?
                GROUP BY book_id, para_id
            ''', (book_id, para_id)).fetchone()
            if srow:
                final.append(dict(srow))

    return final
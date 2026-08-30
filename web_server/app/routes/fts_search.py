# app/routes/fts_search.py
"""
Full-text search route for the E-Piṭaka API.

Fetch search results from the paragraphs_fts FTS5 index in webdata.db.
Supports Pāli search and multi-language translation search.

Architecture:
  Two-level search — book summary first, then per-book detail.

  1. GET /api/fts_search?q=...
     Returns: { books: [{book_id, book_name, count}, ...], total, words }
     If total <= 30, also includes full 'results' with line-level detail.

  2. GET /api/fts_search?q=...&book_id=X&page=1&limit=30&lang=en
     Returns: { books: [...], results: [...detail...], total, page, pages, words }

  Only matched lines are returned (no context lines).
"""
from flask import Blueprint, jsonify, request
from collections import defaultdict, Counter
import re
from ..utils.db import get_db, get_webdata_db, get_translation_db
from ..utils.text import markdown_to_html, normalize_pali, highlight_text
from ..utils.cache import TTLCache
from ..utils.ratelimit import rate_limit
from ..services.loadtocs import load_hierarchy
from ..services.toc import build_slug_map
from ..config import Config


# ── Helper: build allowed book_id set from filter params ──────────────────
def _get_allowed_books(hierarchy, pitakas_param, layers_param):
    PITAKA_MATCH = {
        'suttanta':   lambda m: 'Sutta'      in (m.get('nikaya') or ''),
        'vinaya':     lambda m: 'Vinaya'     in (m.get('nikaya') or ''),
        'abhidhamma': lambda m: 'Abhidhamma' in (m.get('nikaya') or ''),
        'anna':       lambda m: m.get('category') == 'A\u00f1\u00f1a',
    }
    LAYER_MATCH = {
        'mula':  lambda m: m.get('category') == 'M\u016bla',
        'attha': lambda m: m.get('category') == 'A\u1e6d\u1e6dhakath\u0101',
        'tika':  lambda m: m.get('category') == '\u1e6c\u012bk\u0101',
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
    """Split a query without destroying Sinhala (or other Unicode) letters.

    ``\\w`` is ASCII-only in Python regexes unless the UNICODE flag is
    explicit, and punctuation-only filtering also breaks Sinhala combining
    marks. Keep every Unicode letter/mark/number and use whitespace as the
    word boundary; FTS receives the original script while the Pāli fallback
    still normalizes Roman text.
    """
    clean = ''.join(
        ch if (ch.isspace() or ch.isalnum() or __import__('unicodedata').category(ch).startswith('M')) else ' '
        for ch in query
    )
    clean = re.sub(r'\\s+', ' ', clean).strip()
    return [w for w in clean.split() if w]


# ── Helper: build the FTS5 MATCH query from search words ──────────────────
def _build_fts_query(words):
    """
    Build an FTS5 prefix query:  "w1"* AND "w2"*  (all words in same paragraph).

    The paragraphs_fts index is created with `unicode61 remove_diacritics 2`,
    so its tokens are stored WITHOUT Pāli diacritics (ā→a, ṃ→m, ṭ→t, …). FTS5
    normally applies the same normalisation to the query string, but some
    SQLite builds on older servers do not strip diacritics from query terms,
    which silently turns every query containing a diacritic into zero results.

    Stripping diacritics and lowercasing the query terms here in Python makes
    matching deterministic regardless of the server's SQLite version.
    """
    norm = []
    for w in words:
        # normalize_pali intentionally removes Pāli diacritics, but must not
        # alter Sinhala. FTS5 unicode61 tokenizes Sinhala correctly when the
        # query is passed through unchanged.
        n = normalize_pali(w).lower() if w.isascii() else w.lower()
        if n:
            norm.append(n)
    if not norm:
        # Pathological input (e.g. combining marks only) — fall back to the
        # raw words rather than emitting an empty MATCH string.
        return ' AND '.join(f'"{w}"*' for w in words)
    return ' AND '.join(f'"{w}"*' for w in norm)


# ── Helper: book-filter SQL fragment ─────────────────────────────────────
def _book_filter_clause(allowed_books, alias='p'):
    if allowed_books is None:
        return '', []
    placeholders = ','.join('?' * len(allowed_books))
    return f' AND {alias}.book_id IN ({placeholders})', list(allowed_books)


# ── Helper: highlight search words in HTML text ───────────────────────────
def _highlight_words(html_text: str, words: list) -> str:
    """Highlight search words, matching Pāli diacritics-insensitively
    (e.g. 'anuruddhattheraga' highlights 'anuruddhattheragāthā')."""
    if not html_text or not words:
        return html_text
    parts = re.split(r'(<[^>]+>)', html_text)
    result = []
    for part in parts:
        if part.startswith('<'):
            result.append(part)
        else:
            result.append(highlight_text(part, words))
    return ''.join(result)


# ── Helper: determine which lines match the search words ─────────────────
def _find_matching_lines(lines: list, words: list) -> set:
    """Match lines diacritics-insensitively so results found by the
    (diacritic-stripped) FTS index still display for diacritic queries."""
    norm_words = [
        (normalize_pali(w).lower() if w.isascii() else w.lower())
        for w in words if w
    ]
    matched = set()
    for line in lines:
        raw_line = line['pali'] or ''
        pali_norm = (normalize_pali(raw_line).lower() if raw_line.isascii() else raw_line.lower())
        if any(w in pali_norm for w in norm_words):
            matched.add(line['line_id'])
    return matched


# ── Helper: fallback substring search when the FTS index misses ───────────
# Cached (query + filters → matching paragraphs) because crawler bots hammer
# the same junk queries, and each miss would otherwise trigger a full-table
# LIKE scan — the single most expensive thing this server can do on 1 vCPU.
_FALLBACK_CACHE = TTLCache(max_size=128, ttl=60)


def _fallback_paragraph_matches(conn, words, allowed_books=None, limit=5000):
    """
    Fallback search against the authoritative `sentences` table (epitaka.db).

    Used when the FTS index returns no matches — e.g. the index is stale and
    missing recently-added paragraphs, or the server's SQLite can't match
    diacritic query terms. Returns up to `limit` (book_id, para_id) tuples
    whose paragraph text contains ALL of the search words.

    Sets are intersected progressively (not truncated per word) so a common
    word like "vaṇṇanā" never hides paragraphs that also contain a rarer word.
    """
    if not words:
        return []
    # A 1–2 char word can't be matched by the FTS index but a full-table
    # LIKE '%x%' scan would still scan the whole sentences table and peg the
    # CPU for seconds. Never fall back for those — return nothing instead.
    if any(len(w) < 3 for w in words):
        return []
    cache_key = ('|'.join(words), tuple(sorted(allowed_books)) if allowed_books else '')
    cached = _FALLBACK_CACHE.get(cache_key)
    if cached is not None:
        return cached

    bf_sql, bf_params = _book_filter_clause(allowed_books, alias='s')

    def escape_like(word):
        return (word.replace('\\', '\\\\')
                    .replace('%', '\\%')
                    .replace('_', '\\_'))

    common = None
    for w in words:
        if not w:
            continue
        pattern = f'%{escape_like(w)}%'
        # Bound each per-word set to keep pathological queries fast. The cap
        # is far above any realistic Pāli word frequency, so intersection
        # results stay correct in practice; ultra-common words ("ca", …) may
        # undercount slightly, which only affects the fallback path.
        rows = conn.execute(f'''
            SELECT DISTINCT s.book_id, s.para_id
            FROM sentences s
            WHERE s.pali LIKE ? ESCAPE '\\'{bf_sql}
            LIMIT 200000
        ''', [pattern] + bf_params).fetchall()
        word_set = {(r['book_id'], r['para_id']) for r in rows}
        if not word_set:
            _FALLBACK_CACHE.set(cache_key, [])
            return []
        common = word_set if common is None else (common & word_set)
        if not common:
            _FALLBACK_CACHE.set(cache_key, [])
            return []

    result = sorted(common)[:limit]
    _FALLBACK_CACHE.set(cache_key, result)
    return result


# ── Helper: load book ordering from books table ───────────────────────────
def _load_book_order():
    """Return a dict {book_id: sort_order} ordered by books.id."""
    try:
        with get_db() as conn:
            rows = conn.execute(
                'SELECT book_id, id FROM books ORDER BY id'
            ).fetchall()
            return {row['book_id']: row['id'] for row in rows}
    except Exception:
        return {}





# ═══════════════════════════════════════════════════════════════════════════
#  Register route
# ═══════════════════════════════════════════════════════════════════════════

def register_search_route(bp):

    @bp.route('/fts_search')
    @rate_limit(30, 60)
    def fts_search():
        """
        Full-text search endpoint.

        Two modes:
          1. No book_id       — returns book-level summary (and full results if total <= 30)
          2. book_id provided  — returns paginated line-level results for that book

        Parameters:
          q        — search query (multiple words = AND matching in same paragraph)
          book_id  — optional, restrict to one book
          page     — page number (default 1)
          limit    — results per page (default 30)
          lang     — language code for translation lookup (e.g. 'en')
          pitakas  — comma-separated pitaka filters
          layers   — comma-separated layer filters
        """
        hierarchy    = load_hierarchy()
        query        = request.args.get('q', '').strip()
        raw_book_id   = request.args.get('book_id', '').strip()
        book_id       = raw_book_id if raw_book_id and raw_book_id != 'undefined' else None
        page         = max(1, int(request.args.get('page',     '1') or '1'))
        limit        = max(1, int(request.args.get('limit', '30') or '30'))
        pitakas      = request.args.get('pitakas', '').strip()
        layers       = request.args.get('layers',  '').strip()
        lang         = request.args.get('lang', '').strip()

        if not query:
            return jsonify({'books': [], 'results': [], 'total': 0, 'page': page, 'pages': 0})

        words = _normalise_query(query)
        if not words:
            return jsonify({'books': [], 'results': [], 'total': 0, 'page': page, 'pages': 0})

        allowed_books = _get_allowed_books(hierarchy, pitakas, layers)

        with get_webdata_db() as wconn:
            wcursor = wconn.cursor()

            # ── Step 1: Get book-level counts (always fast) ─────────────
            try:
                books_data, total = _get_book_counts(wcursor, words, allowed_books)
            except Exception as e:
                # Missing / corrupt FTS index (e.g. webdata.db not built) —
                # degrade to the substring fallback below instead of 500ing.
                print(f"[fts_search] book counts error: {e}")
                books_data, total = [], 0

            # Fallback: if the FTS index found nothing (stale index missing
            # recently-added content, or an older SQLite that can't match
            # diacritic query terms), search the authoritative sentences
            # table directly so searches still return results.
            use_fallback   = False
            fallback_pairs = []
            if total == 0:
                try:
                    with get_db() as epi_conn:
                        fallback_pairs = _fallback_paragraph_matches(epi_conn, words, allowed_books)
                except Exception as e:
                    print(f"[fts_search] fallback error: {e}")
                    fallback_pairs = []
                if fallback_pairs:
                    use_fallback = True
                    counts = Counter(p[0] for p in fallback_pairs)
                    books_data = [{'book_id': bid, 'count': cnt} for bid, cnt in counts.items()]
                    total = len(fallback_pairs)

            # Look up book names and sort by books.id
            book_order = _load_book_order()
            books = []
            for b in books_data:
                bid = b['book_id']
                books.append({
                    'book_id':   bid,
                    'book_name': hierarchy.get(bid, {}).get('book_name', bid),
                    'count':     b['count'],
                })
            books.sort(key=lambda b: book_order.get(b['book_id'], 9999))

            # ── Step 2: Fetch results ──────────────────────────────────
            results = []
            if book_id:
                # Per-book paginated detail
                try:
                    if use_fallback:
                        filtered    = [p for p in fallback_pairs if p[0] == book_id]
                        book_total  = len(filtered)
                        start       = (page - 1) * limit
                        rows        = _fetch_line_details(filtered[start:start + limit], words, lang)
                    else:
                        rows, book_total = _search_book_lines(
                            wcursor, words, allowed_books, book_id, page, limit, lang
                        )
                    results = _build_results_grouped(rows, hierarchy, words, lang)
                    display_total = book_total
                except Exception as e:
                    print(f"[fts_search] book detail error: {e}")
                    results = []
                    display_total = 0

            elif total <= 30:
                # Small result set — return everything directly
                try:
                    if use_fallback:
                        rows = _fetch_line_details(fallback_pairs, words, lang)
                    else:
                        # NOTE: _search_all_lines returns a plain list — do NOT
                        # unpack it as a (rows, total) tuple here.
                        rows = _search_all_lines(
                            wcursor, words, allowed_books, lang
                        )
                    results = _build_results_grouped(rows, hierarchy, words, lang)
                    display_total = total
                except Exception as e:
                    print(f"[fts_search] full results error: {e}")
                    results = []
                    display_total = 0

            else:
                # total > 30 and no book_id — just show book summary
                display_total = total

        pages = (display_total + limit - 1) // limit if display_total else 0

        return jsonify({
            'books':   books,
            'results': results,
            'total':   display_total,
            'page':    page,
            'pages':   pages,
            'words':   words,
        })


# ═══════════════════════════════════════════════════════════════════════════
#  Book-level counts (fast, single GROUP BY)
# ═══════════════════════════════════════════════════════════════════════════

def _get_book_counts(cursor, words, allowed_books):
    """
    Get per-book match counts from paragraphs_fts.
    Returns (list_of_dicts, total_count).
    """
    fts_query         = _build_fts_query(words)
    bf_sql, bf_params = _book_filter_clause(allowed_books)

    sql = f'''
        SELECT p.book_id, COUNT(*) as count
        FROM paragraphs_fts p
        WHERE p.paragraphs_fts MATCH ?{bf_sql}
          AND p.book_id IS NOT NULL AND p.book_id != ''
        GROUP BY p.book_id
    '''
    rows = cursor.execute(sql, [fts_query] + bf_params).fetchall()
    books = [{'book_id': r['book_id'], 'count': r['count']} for r in rows]
    total = sum(r['count'] for r in rows)
    return books, total


# ═══════════════════════════════════════════════════════════════════════════
#  Full results (all books, no pagination — for small result sets)
# ═══════════════════════════════════════════════════════════════════════════

def _search_all_lines(cursor, words, allowed_books, lang=None):
    """Fetch ALL matching paragraphs (used when total <= 30)."""
    fts_query         = _build_fts_query(words)
    bf_sql, bf_params = _book_filter_clause(allowed_books)

    data_sql = f'''
        SELECT p.book_id, p.para_id
        FROM paragraphs_fts p
        WHERE p.paragraphs_fts MATCH ?{bf_sql}
          AND p.book_id IS NOT NULL AND p.book_id != ''
        ORDER BY p.book_id, p.para_id
    '''
    para_hits = cursor.execute(data_sql, [fts_query] + bf_params).fetchall()
    if not para_hits:
        return []

    book_para_pairs = [(r['book_id'], r['para_id']) for r in para_hits]
    return _fetch_line_details(book_para_pairs, words, lang)


# ═══════════════════════════════════════════════════════════════════════════
#  Per-book paginated results
# ═══════════════════════════════════════════════════════════════════════════

def _search_book_lines(cursor, words, allowed_books, book_id, page, limit, lang=None):
    """Fetch paginated results for a single book."""
    fts_query         = _build_fts_query(words)
    bf_sql, bf_params = _book_filter_clause(allowed_books)

    # Count
    count_sql = f'''
        SELECT COUNT(*)
        FROM paragraphs_fts p
        WHERE p.paragraphs_fts MATCH ?{bf_sql}
          AND p.book_id = ?
          AND p.book_id IS NOT NULL AND p.book_id != ''
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params + [book_id]).fetchone()[0]
    if total == 0:
        return [], 0

    # Fetch page
    offset = (page - 1) * limit
    data_sql = f'''
        SELECT p.book_id, p.para_id
        FROM paragraphs_fts p
        WHERE p.paragraphs_fts MATCH ?{bf_sql}
          AND p.book_id = ?
          AND p.book_id IS NOT NULL AND p.book_id != ''
        ORDER BY p.para_id
        LIMIT ? OFFSET ?
    '''
    para_hits = cursor.execute(data_sql, [fts_query] + bf_params + [book_id, limit, offset]).fetchall()
    if not para_hits:
        return [], total

    book_para_pairs = [(book_id, r['para_id']) for r in para_hits]
    return _fetch_line_details(book_para_pairs, words, lang), total


# ═══════════════════════════════════════════════════════════════════════════
#  Common: load lines, detect matches, load translations
# ═══════════════════════════════════════════════════════════════════════════

def _fetch_line_details(book_para_pairs, words, lang=None):
    """
    Given a list of (book_id, para_id) pairs, load all lines,
    detect matched lines, and look up translations.

    Returns a list of dicts:
        { 'book_id': .., 'para_id': .., 'lines': [{line_id, pali, translation, matched}, ...] }
    """
    if not book_para_pairs:
        return []

    placeholders = ' OR '.join('(book_id = ? AND para_id = ?)' for _ in book_para_pairs)
    params = [v for pair in book_para_pairs for v in pair]

    # ── Load lines from epitaka.db ──────────────────────────────────────
    with get_db() as epi_conn:
        all_lines = epi_conn.execute(f'''
            SELECT book_id, para_id, line_id, pali
            FROM sentences
            WHERE {placeholders}
            ORDER BY book_id, para_id, line_id
        ''', params).fetchall()

        lines_by_key = defaultdict(list)
        for line in all_lines:
            lines_by_key[(line['book_id'], line['para_id'])].append(line)

        # ── Load translations ───────────────────────────────────────────
        trans_map = {}
        if lang:
            trans_db = get_translation_db(lang)
            if trans_db:
                trans_cursor = trans_db.cursor()
                trans_cursor.execute(f'''
                    SELECT book_id, para_id, line_id, translation
                    FROM sentences
                    WHERE {placeholders}
                    ORDER BY book_id, para_id, line_id
                ''', params)
                for tr in trans_cursor.fetchall():
                    trans_map[(tr['book_id'], tr['para_id'], tr['line_id'])] = tr['translation']

        # ── Build results (matched lines only) ──────────────────────────
        results = []
        for book_id, para_id in book_para_pairs:
            lines = lines_by_key.get((book_id, para_id), [])
            matched_line_ids = _find_matching_lines(lines, words)

            line_results = []
            for line in lines:
                lid = line['line_id']
                if lid not in matched_line_ids:
                    continue  # skip non-matched lines

                pali_text = line['pali'] or ''
                translation = trans_map.get((book_id, para_id, lid), '') or ''
                line_results.append({
                    'line_id':    lid,
                    'pali':       pali_text,
                    'translation': translation,
                    'matched':    True,
                })

            if line_results:  # only include paragraphs with matched lines
                results.append({
                    'book_id': book_id,
                    'para_id': para_id,
                    'lines':   line_results,
                })

    return results


# ═══════════════════════════════════════════════════════════════════════════
#  Build frontend-ready grouped results
# ═══════════════════════════════════════════════════════════════════════════

def _build_results_grouped(rows, hierarchy, words, lang=None):
    """
    Take the raw results from _fetch_line_details / _search_all_lines
    and group them by book, adding book names, slugs, and highlighting.

    Slugs are resolved with one batched query instead of one per result.
    """
    grouped = defaultdict(lambda: {'book_id': '', 'book_name': '', 'items': []})

    # ── Batch slug resolution ───────────────────────────────────────────
    pairs = [(row['book_id'], row['para_id']) for row in rows]
    slug_map = {}
    if pairs:
        with get_db() as conn:
            slug_map = build_slug_map(conn, pairs)

    for row in rows:
        bid = row['book_id']
        if not grouped[bid]['book_id']:
            grouped[bid]['book_id']   = bid
            grouped[bid]['book_name'] = hierarchy.get(bid, {}).get('book_name', bid)

        slug = slug_map.get((bid, row['para_id']), '')

        lines = row.get('lines', [])
        # Highlight Pali in matched lines
        for lr in lines:
            if lr['pali']:
                lr['pali'] = markdown_to_html(lr['pali'])
                lr['pali'] = _highlight_words(lr['pali'], words)

        grouped[bid]['items'].append({
            'book_id': bid,
            'para_id': row['para_id'],
            'slug':    slug,
            'lines':   lines,
        })

    return list(grouped.values())

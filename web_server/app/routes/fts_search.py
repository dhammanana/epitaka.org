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
from collections import defaultdict
import re
from ..utils.db import get_db, get_webdata_db, get_translation_db
from ..utils.text import markdown_to_html
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
    clean = re.sub(r'[^\w\s]', ' ', query)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return [w for w in clean.split() if w]


# ── Helper: book-filter SQL fragment ─────────────────────────────────────
def _book_filter_clause(allowed_books, alias='p'):
    if allowed_books is None:
        return '', []
    placeholders = ','.join('?' * len(allowed_books))
    return f' AND {alias}.book_id IN ({placeholders})', list(allowed_books)


# ── Helper: highlight search words in HTML text ───────────────────────────
def _highlight_words(html_text: str, words: list) -> str:
    if not html_text or not words:
        return html_text
    escaped = [re.escape(w) for w in words]
    combined = '|'.join(escaped)
    parts = re.split(r'(<[^>]+>)', html_text)
    result = []
    for part in parts:
        if part.startswith('<'):
            result.append(part)
        else:
            part = re.sub(
                r'(?i)(' + combined + r')',
                r'<mark>\1</mark>',
                part
            )
            result.append(part)
    return ''.join(result)


# ── Helper: determine which lines match the search words ─────────────────
def _find_matching_lines(lines: list, words: list) -> set:
    matched = set()
    for line in lines:
        pali_lower = (line['pali'] or '').lower()
        if any(w.lower() in pali_lower for w in words):
            matched.add(line['line_id'])
    return matched


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
            books_data, total = _get_book_counts(wcursor, words, allowed_books)

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
                    rows, _ = _search_all_lines(
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
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
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
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
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
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
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

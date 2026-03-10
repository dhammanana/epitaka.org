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


def register_search_route(bp):
    # ── /api/fts_search ────────────────────────────────────────────────────────
    @bp.route('/fts_search')
    def fts_search():
        """
        Full-text search endpoint.

        mode=exact (default)
            All words must appear in the SAME SENTENCE within a paragraph.
            A sentence is defined as text between sentence-ending punctuation
            (. ; ! ? and Pāli daṇḍa │).
            Steps:
            1. FTS5 AND query finds candidate paragraphs containing all words.
            2. Python splits each paragraph into sentences and verifies
                all words co-occur in at least one sentence.
            Fast for the FTS step; sentence-check only runs on actual matches.

        mode=para
            All words in the same paragraph (FTS row). No sentence restriction.
            Sorted by canonical books.id order then para_id.

        mode=distance
            Words may be in different paragraphs of the same book, but the
            line_id distance between them must be ≤ `distance`.
            Uses the sentences table (one row per line/sentence) so that
            cross-paragraph proximity works correctly.
            Algorithm:
            1. For each word, find all (book_id, para_id, line_id) rows in
                sentences table that contain it (LIKE prefix match).
            2. Intersect by book_id to find books that have all words.
            3. For each such book, find the minimum line_id span across all
                words; if span ≤ distance, record the anchor para_id.
            4. Paginate results and fetch paragraph text.

        Query params:
        q          Search string
        mode       exact | para | distance   (default: exact)
        distance   Line distance for distance mode  (default: 5)
        page       1-based page number       (default: 1)
        limit      Results per page          (default: Config.MAX_SEARCH_RESULTS or 20)
        pitakas    Comma-separated: suttanta,vinaya,abhidhamma,anna
        layers     Comma-separated: mula,attha,tika
        """
        hierarchy = load_hierarchy()
        query     = request.args.get('q', '').strip()
        mode      = request.args.get('mode', 'exact')
        page      = max(1, int(request.args.get('page',     '1') or '1'))
        distance  = max(1, int(request.args.get('distance', '5') or '5'))
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
                # exact: same sentence
                rows, total = _search_exact_sentence(cursor, words, allowed_books, page, limit)

        # ── Group by book, ordered by books.id ────────────────────
        grouped = {}
        for row in rows:
            bid = row['book_id']
            if bid not in grouped:
                grouped[bid] = {
                    'book_id':   bid,
                    'book_name': hierarchy.get(bid, {}).get('book_name', bid),
                    'items':     [],
                }
            grouped[bid]['items'].append({
                'book_id': bid,
                'para_id': row['para_id'],
                'pali':    markdown_to_html(row.get('pali_paragraph')    or ''),
                'english': markdown_to_html(row.get('english_paragraph') or ''),
            })

        pages = (total + limit - 1) // limit if total else 0

        return jsonify({
            'results': list(grouped.values()),
            'total':   total,
            'page':    page,
            'pages':   pages,
            'words':   words,
        })


# ── _search_exact_sentence ────────────────────────────────────────────────
# Sentence boundary pattern: split on . ; ! ? and Pāli daṇḍa (│ or ।)
_SENTENCE_SPLIT = re.compile(r'[.;!?।|]+')

def _words_in_same_sentence(text, words):
    """
    Return True if all words (prefix-matched) appear in at least one
    sentence of `text`. Sentences are delimited by . ; ! ? │ ।
    """
    if not text:
        return False
    sentences = _SENTENCE_SPLIT.split(text.lower())
    wl = [w.lower() for w in words]
    for sent in sentences:
        tokens = re.findall(r'\w+', sent)
        if all(any(tok.startswith(w) for tok in tokens) for w in wl):
            return True
    return False


def _search_exact_sentence(cursor, words, allowed_books, page, limit):
    """
    Two-phase:
      Phase 1 — FTS AND query: fast index scan for paragraphs containing
                all words anywhere (may span sentence boundaries).
      Phase 2 — Python sentence filter: keep only paragraphs where all
                words co-occur within a single sentence.
    Pagination is applied AFTER the sentence filter.
    To avoid fetching the entire corpus, we fetch in batches from FTS
    and stop once we have enough verified results.
    """
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
    bf_sql, bf_params = _book_filter_clause(allowed_books)

    # Fetch candidate rows from FTS ordered by books.id, para_id.
    # We fetch all candidates to get an accurate total count.
    # This is efficient because FTS already narrowed the set significantly.
    data_sql = f'''
        SELECT f.book_id, f.para_id, f.pali_paragraph, f.english_paragraph,
               COALESCE(b.id, 9999) AS book_order
        FROM sentences_fts f
        LEFT JOIN books b ON f.book_id = b.book_id
        WHERE f.sentences_fts MATCH ?{bf_sql}
        ORDER BY book_order, f.para_id
    '''
    candidates = cursor.execute(data_sql, [fts_query] + bf_params).fetchall()

    # Filter to those where all words appear in the same sentence
    verified = []
    for row in candidates:
        pali_ok = _words_in_same_sentence(row['pali_paragraph'], words)
        eng_ok  = _words_in_same_sentence(row['english_paragraph'], words)
        if pali_ok or eng_ok:
            verified.append(dict(row))

    total  = len(verified)
    offset = (page - 1) * limit
    return verified[offset: offset + limit], total


# ── _search_para ──────────────────────────────────────────────────────────
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


# ── _search_distance ──────────────────────────────────────────────────────
def _search_distance(cursor, words, max_distance, allowed_books, page, limit):
    """
    Cross-paragraph distance search using the sentences table.

    The sentences table has one row per sentence/line with columns:
      book_id, para_id, line_id, pali_sentence, english_translation

    line_id is a sequential integer within a book. Two words are "within
    distance D" if |line_id_A - line_id_B| <= D, regardless of paragraph.

    Algorithm:
      1. For each word, query sentences table for all (book_id, line_id)
         pairs where pali_sentence or english_translation contains the
         word (LIKE prefix). Keep only books present for ALL words.
      2. For each qualifying book, compute the minimum line_id span
         across all words using a sweep:
         - Sort all per-word line_id lists.
         - Use a sliding window (one pointer per word) to find the
           tightest window containing one match per word.
      3. Record the para_id of the anchor sentence (lowest line_id in
         the best window) as the result paragraph.
      4. Deduplicate by (book_id, para_id), paginate, fetch paragraph text.
    """
    bf_sql_s, bf_params_s = _book_filter_clause(allowed_books, alias='s')

    # ── Step 1: gather (book_id, line_id) hits per word ──────
    word_hits = []   # list of dicts: {book_id → sorted list of line_ids}
    for word in words:
        like_pat = word.lower() + '%'
        rows = cursor.execute(f'''
            SELECT s.book_id, s.line_id
            FROM sentences s
            WHERE (LOWER(s.pali_sentence) LIKE ? OR LOWER(s.english_translation) LIKE ?)
            {bf_sql_s}
            ORDER BY s.book_id, s.line_id
        ''', [like_pat, like_pat] + bf_params_s).fetchall()

        hits = {}  # book_id → [line_id, ...]
        for r in rows:
            hits.setdefault(r['book_id'], []).append(r['line_id'])
        word_hits.append(hits)

    if not word_hits:
        return [], 0

    # Books that have hits for ALL words
    common_books = set(word_hits[0].keys())
    for wh in word_hits[1:]:
        common_books &= set(wh.keys())

    if not common_books:
        return [], 0

    # ── Step 2 & 3: find minimum-span windows per book ────────
    # For each book, use a sliding window over sorted per-word line_id lists
    # to find the smallest span that contains one match from each word.
    all_matches = []  # list of {book_id, anchor_line_id, span}

    for book_id in sorted(common_books):
        lists = [sorted(word_hits[w][book_id]) for w in range(len(words))]
        n     = len(lists)

        # Pointers into each word's list
        ptrs  = [0] * n

        while all(ptrs[i] < len(lists[i]) for i in range(n)):
            vals = [lists[i][ptrs[i]] for i in range(n)]
            lo, hi = min(vals), max(vals)
            span   = hi - lo

            if span <= max_distance:
                # Record anchor = para_id of the sentence at lo line_id
                anchor_line = lo
                all_matches.append({
                    'book_id':     book_id,
                    'anchor_line': anchor_line,
                    'span':        span,
                })
                # Advance all pointers past current window
                for i in range(n):
                    ptrs[i] += 1
            else:
                # Advance the pointer with the smallest value to try to close gap
                min_idx = vals.index(lo)
                ptrs[min_idx] += 1

    if not all_matches:
        return [], 0

    # ── Step 4: resolve anchor_line → para_id, deduplicate ────
    # Collect all anchor line_ids grouped by book to batch-query para_ids
    book_lines = {}  # book_id → set of line_ids
    for m in all_matches:
        book_lines.setdefault(m['book_id'], set()).add(m['anchor_line'])

    # Fetch para_id for each anchor line_id
    line_to_para = {}  # (book_id, line_id) → para_id
    for book_id, line_ids in book_lines.items():
        placeholders = ','.join('?' * len(line_ids))
        rows = cursor.execute(f'''
            SELECT line_id, para_id FROM sentences
            WHERE book_id = ? AND line_id IN ({placeholders})
        ''', [book_id] + list(line_ids)).fetchall()
        for r in rows:
            line_to_para[(book_id, r['line_id'])] = r['para_id']

    # Build deduplicated result list ordered by (books.id, para_id)
    # Fetch book order
    book_order_rows = cursor.execute(
        'SELECT book_id, id FROM books WHERE book_id IN ({})'.format(
            ','.join('?' * len(common_books))
        ), list(common_books)
    ).fetchall()
    book_order = {r['book_id']: r['id'] for r in book_order_rows}

    seen     = set()
    results_raw = []
    for m in all_matches:
        bid      = m['book_id']
        para_id  = line_to_para.get((bid, m['anchor_line']))
        if para_id is None:
            continue
        key = (bid, para_id)
        if key not in seen:
            seen.add(key)
            results_raw.append({
                'book_id': bid,
                'para_id': para_id,
                'order':   book_order.get(bid, 9999),
            })

    # Sort by canonical book order then para_id
    results_raw.sort(key=lambda r: (r['order'], r['para_id']))

    total  = len(results_raw)
    offset = (page - 1) * limit
    page_results = results_raw[offset: offset + limit]

    if not page_results:
        return [], total

    # ── Step 5: fetch paragraph text for result set ────────────
    # Batch fetch from sentences_fts (one row per para_id)
    final = []
    for item in page_results:
        row = cursor.execute('''
            SELECT book_id, para_id, pali_paragraph, english_paragraph
            FROM sentences_fts
            WHERE book_id = ? AND para_id = ?
        ''', (item['book_id'], item['para_id'])).fetchone()
        if row:
            final.append(dict(row))
        else:
            # Fallback: para might not be in FTS, use sentences table
            srows = cursor.execute('''
                SELECT book_id, para_id,
                       GROUP_CONCAT(pali_sentence, ' ') AS pali_paragraph,
                       GROUP_CONCAT(english_translation, ' ') AS english_paragraph
                FROM sentences
                WHERE book_id = ? AND para_id = ?
                GROUP BY book_id, para_id
            ''', (item['book_id'], item['para_id'])).fetchone()
            if srows:
                final.append(dict(srows))

    return final, total
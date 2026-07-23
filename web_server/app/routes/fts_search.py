# app/routes/fts_search.py
"""
Full-text search route for the E-Piṭaka API.

Fetch search results from the FTS5 indexes in epitaka.db.
Supports Pāli search (search_fts) and multi-language translation search.

Required imports (used by register_search_route):
"""
from flask import Blueprint, jsonify, request
from collections import defaultdict
import re
from ..utils.db import get_db, get_webdata_db, get_translation_db
from ..utils.text import markdown_to_html, trim_text
from ..services.loadtocs import load_hierarchy
from ..config import Config


# ── Helper: build allowed book_id set from filter params ──────────────────
def _get_allowed_books(hierarchy, pitakas_param, layers_param):
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
    if allowed_books is None:
        return '', []
    placeholders = ','.join('?' * len(allowed_books))
    return f' AND {alias}.book_id IN ({placeholders})', list(allowed_books)


# ── Helper: highlight search words in HTML text ───────────────────────────
def _highlight_words(html_text: str, words: list) -> str:
    if not html_text or not words:
        return html_text
    parts = re.split(r'(<[^>]+>)', html_text)
    result = []
    for part in parts:
        if part.startswith('<'):
            result.append(part)
        else:
            for w in words:
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

        Supports:
        - mode=sentence: All words in same sentence (Pali FTS)
        - mode=para: All words in same paragraph
        - mode=distance: Words within N tokens using NEAR

        Additional params:
        - lang: language code for translation search (e.g. 'en')
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
        lang      = request.args.get('lang', '').strip()

        if not query:
            return jsonify({'results': [], 'total': 0, 'page': page, 'pages': 0})

        words = _normalise_query(query)
        if not words:
            return jsonify({'results': [], 'total': 0, 'page': page, 'pages': 0})

        allowed_books = _get_allowed_books(hierarchy, pitakas, layers)

        # FTS tables live in webdata.db (not epitaka.db which is shared with mobile)
        with get_webdata_db() as wconn:
            wcursor = wconn.cursor()

            if lang:
                # Search in translation FTS (graceful fallback on error)
                try:
                    rows, total = _search_translation_fts(wcursor, lang, query, words, allowed_books, page, limit, distance)
                except Exception:
                    rows, total = [], 0
            elif mode == 'distance':
                try:
                    rows, total = _search_distance(wcursor, words, distance, allowed_books, page, limit)
                except Exception:
                    rows, total = [], 0
            elif mode == 'para':
                try:
                    rows, total = _search_para(wcursor, words, allowed_books, page, limit)
                except Exception:
                    rows, total = [], 0
            else:
                try:
                    rows, total = _search_sentence(wcursor, words, allowed_books, page, limit)
                except Exception:
                    rows, total = [], 0

        # Group by book
        grouped = {}
        for row in rows:
            bid = row['book_id']
            if bid not in grouped:
                grouped[bid] = {
                    'book_id':   bid,
                    'book_name': hierarchy.get(bid, {}).get('book_name', bid),
                    'items':     [],
                }

            pali_html    = markdown_to_html(row.get('pali_paragraph')    or row.get('pali')    or '')
            english_html = markdown_to_html(row.get('english_paragraph') or row.get('translation') or '')

            if not lang:
                pali_html = _highlight_words(pali_html, words)
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
# Translation FTS search
# ─────────────────────────────────────────────────────────────────────────────

def _search_translation_fts(cursor, lang, query, words, allowed_books, page, limit, distance):
    """Search the translation FTS index (search_fts_{lang} in epitaka.db)."""
    try:
        table_name = 'search_fts_' + lang
        # Check if table exists
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table_name,)
        )
        if not cursor.fetchone():
            return [], 0

        fts_query = ' AND '.join(f'"{w}"*' for w in words) if distance <= 0 else \
                    'NEAR(' + ' '.join(f'"{w}"*' for w in words) + f', {distance})'

        bf_sql, bf_params = _book_filter_clause(allowed_books, alias='t')

        count_sql = f'''
            SELECT COUNT(*)
            FROM {table_name} t
            WHERE t.translation_text MATCH ?{bf_sql}
        '''
        total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

        if total == 0:
            return [], 0

        offset = (page - 1) * limit
        data_sql = f'''
            SELECT t.book_id, t.para_id, t.translation_text AS translation,
                   COALESCE(b.id, 9999) AS book_order
            FROM {table_name} t
            LEFT JOIN books b ON t.book_id = b.book_id
            WHERE t.translation_text MATCH ?{bf_sql}
            ORDER BY book_order, t.para_id
            LIMIT ? OFFSET ?
        '''
        rows = cursor.execute(data_sql, [fts_query] + bf_params + [limit, offset]).fetchall()
        return [dict(r) for r in rows], total

    except Exception:
        return [], 0


# ─────────────────────────────────────────────────────────────────────────────
# mode=sentence  — uses sentences_fts_v2
# ─────────────────────────────────────────────────────────────────────────────

def _search_sentence(cursor, words, allowed_books, page, limit):
    """
    All words must co-occur within a single sentence row via FTS5.
    """
    fts_query         = ' AND '.join(f'"{w}"*' for w in words)
    bf_sql, bf_params = _book_filter_clause(allowed_books, alias='v')

    count_sql = f'''
        SELECT COUNT(DISTINCT v.book_id || '|' || v.para_id)
        FROM sentences_fts_v2 v
        WHERE v.sentences_fts_v2 MATCH ?{bf_sql}
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

    if total == 0:
        return [], 0

    offset = (page - 1) * limit

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

    rows = _fetch_paragraphs(cursor, [(r['book_id'], r['para_id']) for r in para_hits])
    return rows, total


# ─────────────────────────────────────────────────────────────────────────────
# mode=para  — uses sentences_fts (paragraph level)
# ─────────────────────────────────────────────────────────────────────────────

def _search_para(cursor, words, allowed_books, page, limit):
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
    if len(words) == 1:
        return _search_para(cursor, words, allowed_books, page, limit)

    near_terms  = ' '.join(f'"{w}"*' for w in words)
    fts_query   = f'NEAR({near_terms}, {max_distance})'
    bf_sql, bf_params = _book_filter_clause(allowed_books, alias='p')

    count_sql = f'''
        SELECT COUNT(DISTINCT p.book_id || '|' || p.anchor_para_id)
        FROM passages_fts p
        WHERE p.passages_fts MATCH ?{bf_sql}
    '''
    total = cursor.execute(count_sql, [fts_query] + bf_params).fetchone()[0]

    if total == 0:
        return [], 0

    offset = (page - 1) * limit

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
# Shared helper: fetch full paragraph text
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_paragraphs(cursor, pairs: list) -> list:
    """
    Fetch pali_paragraph for a page of (book_id, para_id) pairs.
    Tries sentences_fts (webdata.db) first, falls back to sentences (epitaka.db).
    """
    if not pairs:
        return []

    placeholders = ' OR '.join('(book_id = ? AND para_id = ?)' for _ in pairs)
    params       = [val for pair in pairs for val in pair]

    try:
        rows = cursor.execute(f'''
            SELECT book_id, para_id, pali_paragraph, english_paragraph
            FROM sentences_fts
            WHERE {placeholders}
        ''', params).fetchall()
    except Exception:
        rows = []

    row_map = {(r['book_id'], r['para_id']): dict(r) for r in rows}

    final = []
    for book_id, para_id in pairs:
        key = (book_id, para_id)
        if key in row_map:
            final.append(row_map[key])
        else:
            # Fallback: read from epitaka.db sentences table directly
            with get_db() as epi_conn:
                srow = epi_conn.execute('''
                    SELECT book_id, para_id,
                           GROUP_CONCAT(pali, ' ') AS pali_paragraph,
                           '' AS english_paragraph
                    FROM sentences
                    WHERE book_id = ? AND para_id = ?
                    GROUP BY book_id, para_id
                ''', (book_id, para_id)).fetchone()
            if srow:
                final.append(dict(srow))

    return final

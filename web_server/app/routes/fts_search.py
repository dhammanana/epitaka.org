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
        "suttanta": lambda m: "Sutta" in (m.get("nikaya") or ""),
        "vinaya": lambda m: "Vinaya" in (m.get("nikaya") or ""),
        "abhidhamma": lambda m: "Abhidhamma" in (m.get("nikaya") or ""),
        "anna": lambda m: m.get("category") == "A\u00f1\u00f1a",
    }
    LAYER_MATCH = {
        "mula": lambda m: m.get("category") == "M\u016bla",
        "attha": lambda m: m.get("category") == "A\u1e6d\u1e6dhakath\u0101",
        "tika": lambda m: m.get("category") == "\u1e6c\u012bk\u0101",
    }

    pitakas = (
        [p.strip() for p in pitakas_param.split(",") if p.strip()]
        if pitakas_param
        else []
    )
    layers = (
        [l.strip() for l in layers_param.split(",") if l.strip()]
        if layers_param
        else []
    )

    if not pitakas and not layers:
        return None

    allowed = set()
    for book_id, meta in hierarchy.items():
        pass_p = (not pitakas) or any(
            PITAKA_MATCH[p](meta) for p in pitakas if p in PITAKA_MATCH
        )
        pass_l = (not layers) or any(
            LAYER_MATCH[l](meta) for l in layers if l in LAYER_MATCH
        )
        if pass_p and pass_l:
            allowed.add(book_id)
    return frozenset(allowed)


# ── Query parsing (words + "quoted phrases") ─────────────────────────────
# Limits keep one request cheap on the small VPS: FTS5 cost grows with the
# number of ANDed terms, and each LIKE-fallback word is a full-table scan.
MAX_QUERY_LEN = 200
MAX_TOKENS = 10
MAX_PHRASE_WORDS = 8

_PHRASE_RE = re.compile(r'"([^"]+)"')


def _clean_token(text):
    """Keep every Unicode letter/mark/number, drop the rest (incl. FTS5
    syntax chars like `"*():^`). Whitespace becomes the word boundary, so
    Sinhala combining marks survive."""
    import unicodedata

    clean = "".join(
        ch
        if (ch.isspace() or ch.isalnum() or unicodedata.category(ch).startswith("M"))
        else " "
        for ch in text
    )
    return re.sub(r"\s+", " ", clean).strip()


def _normalise_query(query):
    """Split a query into plain words (kept for backwards-compat callers).

    Quoted phrases are returned as their words too, so highlight code that
    only knows about a flat word list keeps working.
    """
    words, phrases = _parse_query(query)
    flat = list(words)
    for ph in phrases:
        flat.extend(ph)
    return flat


def _parse_query(query):
    """Parse `query` into (words, phrases).

    - `"a b c"` → phrase: words must occur adjacently, in order, in the
      same paragraph (FTS5 phrase `"a b c"`).
    - bare words → ANDed prefix terms in the same paragraph (unchanged).
    Returns ([word, …], [[phrase words], …]), diacritics intact (stripped
    later when the FTS string is built).
    """
    query = (query or "")[:MAX_QUERY_LEN]
    phrases = []
    spans = []
    for m in _PHRASE_RE.finditer(query):
        spans.append((m.start(), m.end()))
        cleaned = _clean_token(m.group(1)).split()
        if 1 <= len(cleaned) <= MAX_PHRASE_WORDS:
            phrases.append(cleaned)
        if len(phrases) >= MAX_TOKENS:
            break
    masked = "".join(
        " " if any(s <= i < e for s, e in spans) else ch for i, ch in enumerate(query)
    )
    words = _clean_token(masked).split()
    budget = MAX_TOKENS - len(phrases)
    words = words[: max(budget, 0)]
    if len(words) + sum(len(p) for p in phrases) == 0:
        # Unbalanced quote or punctuation-only input — treat the whole
        # string as plain words rather than returning nothing.
        words = _clean_token(query.replace('"', " ")).split()[:MAX_TOKENS]
        phrases = []
    return words, phrases


# ── Helper: build the FTS5 MATCH query from words + phrases ───────────────
def _build_fts_query(words, phrases=None):
    """
    Build an FTS5 query:  "w1"* AND "w2"* AND "p1 p2"  (same paragraph).

    Bare words are prefix terms; each quoted phrase is an exact FTS5 phrase
    (adjacent, in order). Tokens are pre-cleaned so no user text — quotes,
    asterisks, parens — can reach the MATCH parser as syntax.

    The paragraphs_fts index is created with `unicode61 remove_diacritics 2`,
    so its tokens are stored WITHOUT Pāli diacritics (ā→a, ṃ→m, ṭ→t, …). FTS5
    normally applies the same normalisation to the query string, but some
    SQLite builds on older servers do not strip diacritics from query terms,
    which silently turns every query containing a diacritic into zero results.

    Stripping diacritics and lowercasing the query terms here in Python makes
    matching deterministic regardless of the server's SQLite version.
    """
    phrases = phrases or []
    parts = []
    for w in words:
        # normalize_pali is a no-op for Sinhala/non-Latin scripts, so it is
        # safe to apply unconditionally.
        n = normalize_pali(w).lower()
        if n:
            parts.append(f'"{n}"*')
    for ph in phrases:
        norm = [normalize_pali(w).lower() for w in ph]
        norm = [n for n in norm if n]
        if norm:
            parts.append('"' + " ".join(norm) + '"')
    return " AND ".join(parts)


# ── Helper: book-filter SQL fragment ─────────────────────────────────────
def _book_filter_clause(allowed_books, alias="p"):
    if allowed_books is None:
        return "", []
    placeholders = ",".join("?" * len(allowed_books))
    return f" AND {alias}.book_id IN ({placeholders})", list(allowed_books)


# ── Helper: resolve the per-language translation FTS table ────────────────
_TRANS_TABLE_RE = re.compile(r"^[a-z]{2}$")


def _trans_fts_table(cursor, lang):
    """Return the fts_<lang>_trans table name if it exists, else None.

    The language comes from the request query string, so it is strictly
    validated (two lowercase ASCII letters) before being interpolated into
    SQL — table names can't be query parameters.
    """
    if not lang or not _TRANS_TABLE_RE.match(lang):
        return None
    table = f"fts_{lang}_trans"
    row = cursor.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table,),
    ).fetchone()
    return table if row else None


def _match_branches(trans_table, bf_p_sql, bf_t_sql):
    """SELECT branches yielding distinct (book_id, para_id) pair matches.

    Pali matches UNION translation matches so a paragraph hit on either
    side counts once. Each branch consumes one MATCH parameter, in order
    (Pāli first, translation second).
    """
    branches = [
        "SELECT p.book_id AS book_id, p.para_id AS para_id "
        f"FROM paragraphs_fts p WHERE p.paragraphs_fts MATCH ?{bf_p_sql}"
    ]
    if trans_table:
        branches.append(
            "SELECT t.book_id AS book_id, t.para_id AS para_id "
            f'FROM "{trans_table}" t WHERE t."{trans_table}" MATCH ?{bf_t_sql}'
        )
    return " UNION ".join(branches)


# ── Helper: highlight search words in HTML text ───────────────────────────
def _highlight_words(html_text: str, words: list, phrases=None) -> str:
    """Highlight search words, matching Pāli diacritics-insensitively
    (e.g. 'anuruddhattheraga' highlights 'anuruddhattheragāthā')."""
    if not html_text or not words:
        return html_text
    parts = re.split(r"(<[^>]+>)", html_text)
    result = []
    for part in parts:
        if part.startswith("<"):
            result.append(part)
        else:
            result.append(highlight_text(part, words, phrases))
    return "".join(result)


# ── Helper: determine which lines match the search words ─────────────────
def _find_matching_lines(lines: list, words: list, phrases=None) -> set:
    """Match lines diacritics-insensitively so results found by the
    (diacritic-stripped) FTS index still display for diacritic queries.

    A line matches when it contains any quoted phrase (as a contiguous
    substring) or any bare word — the paragraph already satisfied the full
    AND via FTS; this only decides which lines are shown."""
    norm_words = [normalize_pali(w).lower() for w in words if w]
    norm_phrases = [
        " ".join(normalize_pali(w).lower() for w in ph if w) for ph in (phrases or [])
    ]
    norm_phrases = [p for p in norm_phrases if p]
    matched = set()
    for line in lines:
        raw_line = line["pali"] or ""
        pali_norm = normalize_pali(raw_line).lower()
        if any(p in pali_norm for p in norm_phrases):
            matched.add(line["line_id"])
        elif any(w in pali_norm for w in norm_words):
            matched.add(line["line_id"])
    return matched


def _strip_markup(text: str) -> str:
    """Remove HTML tags / markdown markers before matching translation text."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"[\*\[\]\(\)]", "", text)


def _find_matching_trans_lines(trans_items: list, words: list, phrases=None) -> set:
    """Match translation lines (line_id, translation) against the query.

    Same normalisation as the fts_<lang>_trans index (lowercase +
    diacritic-stripped), so a translation-side FTS hit always yields
    visible matched lines. Phrases match as contiguous substrings.
    """
    norm_words = [normalize_pali(w).lower() for w in words if w]
    norm_phrases = [
        " ".join(normalize_pali(w).lower() for w in ph if w) for ph in (phrases or [])
    ]
    norm_phrases = [p for p in norm_phrases if p]
    matched = set()
    for line_id, translation in trans_items:
        trans_norm = normalize_pali(_strip_markup(translation)).lower()
        if any(p in trans_norm for p in norm_phrases):
            matched.add(line_id)
        elif any(w in trans_norm for w in norm_words):
            matched.add(line_id)
    return matched


# ── Helper: fallback substring search when the FTS index misses ───────────
# Cached (query + filters → matching paragraphs) because crawler bots hammer
# the same junk queries, and each miss would otherwise trigger a full-table
# LIKE scan — the single most expensive thing this server can do on 1 vCPU.
_FALLBACK_CACHE = TTLCache(max_size=128, ttl=60)


def _fallback_paragraph_matches(
    conn, words, allowed_books=None, limit=5000, phrases=None
):
    """
    Fallback search against the authoritative `sentences` table (epitaka.db).

    Used when the FTS index returns no matches — e.g. the index is stale and
    missing recently-added paragraphs, or the server's SQLite can't match
    diacritic query terms. Returns up to `limit` (book_id, para_id) tuples
    whose paragraph text contains ALL of the search words AND every quoted
    phrase (as a contiguous substring).

    Sets are intersected progressively (not truncated per word) so a common
    word like "vaṇṇanā" never hides paragraphs that also contain a rarer word.

    Each LIKE term is a full-table scan on 1 vCPU, so the per-word row cap
    is kept small and the whole result is cached.
    """
    phrases = phrases or []
    if not words and not phrases:
        return []
    # A 1–2 char word can't be matched by the FTS index but a full-table
    # LIKE '%x%' scan would still scan the whole sentences table and peg the
    # CPU for seconds. Never fall back for those — return nothing instead.
    if any(len(w) < 3 for w in words):
        return []
    if any(len(w) < 2 for ph in phrases for w in ph):
        return []
    if len(words) + sum(len(p) for p in phrases) > MAX_TOKENS:
        return []
    cache_key = (
        "|".join(words) + "||" + "||".join(" ".join(p) for p in phrases),
        tuple(sorted(allowed_books)) if allowed_books else "",
    )
    cached = _FALLBACK_CACHE.get(cache_key)
    if cached is not None:
        return cached

    bf_sql, bf_params = _book_filter_clause(allowed_books, alias="s")

    def escape_like(word):
        return word.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

    # Diacritic-insensitive fallback: compare normalized forms so an ASCII
    # query like "dakkhina" matches "Dakkhiṇā…". Registered per connection
    # (no-op if already registered).
    try:
        conn.create_function(
            "norm_pali",
            1,
            lambda t: normalize_pali(t or "").lower(),
        )
    except Exception:
        pass

    def _like_scan(pattern):
        # Bound each per-term set to keep pathological queries fast. The cap
        # is far above any realistic Pāli word frequency, so intersection
        # results stay correct in practice; ultra-common words ("ca", …) may
        # undercount slightly, which only affects the fallback path.
        rows = conn.execute(
            f"""
            SELECT DISTINCT s.book_id, s.para_id
            FROM sentences s
            WHERE norm_pali(s.pali) LIKE ? ESCAPE '\\'{bf_sql}
            LIMIT 50000
        """,
            [pattern] + bf_params,
        ).fetchall()
        return {(r["book_id"], r["para_id"]) for r in rows}

    def _intersect(term_set):
        nonlocal common
        if not term_set:
            _FALLBACK_CACHE.set(cache_key, [])
            return False
        common = term_set if common is None else (common & term_set)
        if not common:
            _FALLBACK_CACHE.set(cache_key, [])
            return False
        return True

    common = None
    for w in words:
        if not w:
            continue
        if not _intersect(_like_scan(f"%{escape_like(normalize_pali(w).lower())}%")):
            return []
    for ph in phrases:
        phrase = " ".join(normalize_pali(w).lower() for w in ph if w)
        if not phrase:
            continue
        if not _intersect(_like_scan(f"%{escape_like(phrase)}%")):
            return []

    result = sorted(common)[:limit]
    _FALLBACK_CACHE.set(cache_key, result)
    return result


# ── Helper: fallback translation search when FTS misses ───────────────────
# Mirrors _fallback_paragraph_matches but scans the selected language's
# translation DB (epitaka_<lang>.db sentences). Covers two cases:
#   1. the fts_<lang>_trans table hasn't been built yet, and
#   2. spaceless scripts (Thai, Lao, …) where FTS prefix matching can't
#      find mid-sentence words — LIKE substring matching can.
_TRANS_FALLBACK_CACHE = TTLCache(max_size=128, ttl=60)


def _fallback_trans_pairs(
    trans_conn, words, allowed_books=None, limit=5000, phrases=None
):
    """LIKE-scan translation sentences for paragraphs containing ALL words
    AND every quoted phrase (as a contiguous substring)."""
    phrases = phrases or []
    if not words and not phrases:
        return []
    if any(len(w) < 2 for w in words):
        return []
    if any(len(w) < 2 for ph in phrases for w in ph):
        return []
    if len(words) + sum(len(p) for p in phrases) > MAX_TOKENS:
        return []
    cache_key = (
        "trans|" + "|".join(words) + "||" + "||".join(" ".join(p) for p in phrases),
        tuple(sorted(allowed_books)) if allowed_books else "",
    )
    cached = _TRANS_FALLBACK_CACHE.get(cache_key)
    if cached is not None:
        return cached

    bf_sql, bf_params = _book_filter_clause(allowed_books, alias="s")

    def escape_like(word):
        return word.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

    try:
        trans_conn.create_function(
            "norm_trans",
            1,
            lambda t: normalize_pali(_strip_markup(t or "")).lower(),
        )
    except Exception:
        pass

    def _like_scan(pattern):
        try:
            rows = trans_conn.execute(
                f"""
                SELECT DISTINCT s.book_id, s.para_id
                FROM sentences s
                WHERE norm_trans(s.translation) LIKE ? ESCAPE '\\'{bf_sql}
                LIMIT 50000
            """,
                [pattern] + bf_params,
            ).fetchall()
        except Exception:
            return None
        return {(r["book_id"], r["para_id"]) for r in rows}

    def _intersect(term_set):
        nonlocal common
        if not term_set:
            _TRANS_FALLBACK_CACHE.set(cache_key, [])
            return False
        common = term_set if common is None else (common & term_set)
        if not common:
            _TRANS_FALLBACK_CACHE.set(cache_key, [])
            return False
        return True

    common = None
    for w in words:
        if not w:
            continue
        if not _intersect(_like_scan(f"%{escape_like(normalize_pali(w).lower())}%")):
            return []
    for ph in phrases:
        phrase = " ".join(normalize_pali(w).lower() for w in ph if w)
        if not phrase:
            continue
        if not _intersect(_like_scan(f"%{escape_like(phrase)}%")):
            return []

    result = sorted(common)[:limit]
    _TRANS_FALLBACK_CACHE.set(cache_key, result)
    return result


# ── Helper: load book ordering from books table ───────────────────────────
def _load_book_order():
    """Return a dict {book_id: sort_order} ordered by books.id."""
    try:
        with get_db() as conn:
            rows = conn.execute("SELECT book_id, id FROM books ORDER BY id").fetchall()
            return {row["book_id"]: row["id"] for row in rows}
    except Exception:
        return {}


# ═══════════════════════════════════════════════════════════════════════════
#  Register route
# ═══════════════════════════════════════════════════════════════════════════


def register_search_route(bp):

    @bp.route("/fts_search")
    @rate_limit(30, 60)
    def fts_search():
        """
        Full-text search endpoint.

        Two modes:
          1. No book_id       — returns book-level summary (and full results if total <= 30)
          2. book_id provided  — returns paginated line-level results for that book

        Parameters:
          q        — search query (bare words = AND in same paragraph;
                     "quoted text" = exact phrase, adjacent in order)
          book_id  — optional, restrict to one book
          page     — page number (default 1, max 100)
          limit    — results per page (default 30, max 50)
          lang     — language code: searches Pali UNION the fts_<lang>_trans
                     index (e.g. lang=vi also matches Vietnamese), and loads
                     translations for display
          pitakas  — comma-separated pitaka filters
          layers   — comma-separated layer filters
        """
        hierarchy = load_hierarchy()
        query = request.args.get("q", "").strip()[:MAX_QUERY_LEN]
        raw_book_id = request.args.get("book_id", "").strip()
        book_id = raw_book_id if raw_book_id and raw_book_id != "undefined" else None
        try:
            page = max(1, min(100, int(request.args.get("page", "1") or "1")))
        except ValueError:
            page = 1
        try:
            limit = max(1, min(50, int(request.args.get("limit", "30") or "30")))
        except ValueError:
            limit = 30
        pitakas = request.args.get("pitakas", "").strip()
        layers = request.args.get("layers", "").strip()
        lang = request.args.get("lang", "").strip()

        if not query:
            return jsonify(
                {"books": [], "results": [], "total": 0, "page": page, "pages": 0}
            )

        words, phrases = _parse_query(query)
        if not words and not phrases:
            return jsonify(
                {"books": [], "results": [], "total": 0, "page": page, "pages": 0}
            )
        # Flat word list for highlighting + the `words` response field.
        words = list(words) + [w for ph in phrases for w in ph]

        allowed_books = _get_allowed_books(hierarchy, pitakas, layers)

        with get_webdata_db() as wconn:
            wcursor = wconn.cursor()

            # ── Translation index for the selected language ──────────
            # e.g. lang=vi searches Pali (paragraphs_fts) UNION the
            # Vietnamese index (fts_vi_trans). Missing table → Pali only.
            trans_table = _trans_fts_table(wcursor, lang)

            # ── Step 1: Get book-level counts (FTS index; cached) ────────
            try:
                books_data, total = _get_book_counts(
                    wcursor, words, allowed_books, trans_table, phrases
                )
            except Exception as e:
                # Missing / corrupt FTS index (e.g. webdata.db not built) —
                # degrade to the substring fallback below instead of 500ing.
                print(f"[fts_search] book counts error: {e}")
                books_data, total = [], 0

            # Fallback: if the FTS index found nothing (stale index missing
            # recently-added content, or an older SQLite that can't match
            # diacritic query terms), search the authoritative sentences
            # table directly so searches still return results. When a
            # language is selected, the translation DB is scanned too.
            #
            # Fast path for quoted phrases: if the bare words DO co-occur
            # per the FTS index (cheap AND query, cached), the index is
            # healthy and the phrase genuinely doesn't occur adjacently
            # (e.g. "yathā bhūta" is written "yathābhūtaṃ" as one word).
            # Skipping the LIKE fallback then avoids up to 6 full-table
            # scans with a per-row Python function — seconds on 1 vCPU —
            # for a result that would be empty anyway.
            use_fallback = False
            fallback_pairs = []
            if total == 0:
                skip_fallback = False
                if phrases:
                    try:
                        _, and_total = _get_book_counts(
                            wcursor, words, allowed_books, trans_table
                        )
                    except Exception:
                        and_total = 0
                    skip_fallback = and_total > 0
                if not skip_fallback:
                    try:
                        with get_db() as epi_conn:
                            fallback_pairs = _fallback_paragraph_matches(
                                epi_conn, words, allowed_books, phrases=phrases
                            )
                    except Exception as e:
                        print(f"[fts_search] fallback error: {e}")
                        fallback_pairs = []
                    if lang and _TRANS_TABLE_RE.match(lang):
                        try:
                            trans_db = get_translation_db(lang)
                            if trans_db is not None:
                                trans_pairs = _fallback_trans_pairs(
                                    trans_db, words, allowed_books, phrases=phrases
                                )
                                seen = set(fallback_pairs)
                                fallback_pairs = fallback_pairs + [
                                    p for p in trans_pairs if p not in seen
                                ]
                        except Exception as e:
                            print(f"[fts_search] trans fallback error: {e}")
                if fallback_pairs:
                    use_fallback = True
                    counts = Counter(p[0] for p in fallback_pairs)
                    books_data = [
                        {"book_id": bid, "count": cnt} for bid, cnt in counts.items()
                    ]
                    total = len(fallback_pairs)

            # Look up book names and sort by books.id
            book_order = _load_book_order()
            books = []
            for b in books_data:
                bid = b["book_id"]
                books.append(
                    {
                        "book_id": bid,
                        "book_name": hierarchy.get(bid, {}).get("book_name", bid),
                        "count": b["count"],
                    }
                )
            books.sort(key=lambda b: book_order.get(b["book_id"], 9999))

            # ── Step 2: Fetch results ──────────────────────────────────
            results = []
            if book_id:
                # Per-book paginated detail
                try:
                    if use_fallback:
                        filtered = [p for p in fallback_pairs if p[0] == book_id]
                        book_total = len(filtered)
                        start = (page - 1) * limit
                        rows = _fetch_line_details(
                            filtered[start : start + limit], words, lang, phrases
                        )
                    else:
                        rows, book_total = _search_book_lines(
                            wcursor,
                            words,
                            allowed_books,
                            book_id,
                            page,
                            limit,
                            lang,
                            trans_table,
                            phrases,
                        )
                    results = _build_results_grouped(
                        rows, hierarchy, words, lang, phrases
                    )
                    display_total = book_total
                except Exception as e:
                    print(f"[fts_search] book detail error: {e}")
                    results = []
                    display_total = 0

            elif total <= 30:
                # Small result set — return everything directly
                try:
                    if use_fallback:
                        rows = _fetch_line_details(fallback_pairs, words, lang, phrases)
                    else:
                        # NOTE: _search_all_lines returns a plain list — do NOT
                        # unpack it as a (rows, total) tuple here.
                        rows = _search_all_lines(
                            wcursor, words, allowed_books, lang, trans_table, phrases
                        )
                    results = _build_results_grouped(
                        rows, hierarchy, words, lang, phrases
                    )
                    display_total = total
                except Exception as e:
                    print(f"[fts_search] full results error: {e}")
                    results = []
                    display_total = 0

            else:
                # total > 30 and no book_id — just show book summary
                display_total = total

        pages = (display_total + limit - 1) // limit if display_total else 0

        return jsonify(
            {
                "books": books,
                "results": results,
                "total": display_total,
                "page": page,
                "pages": pages,
                "words": words,
            }
        )


# ═══════════════════════════════════════════════════════════════════════════
#  Book-level counts (fast, single GROUP BY)
# ═══════════════════════════════════════════════════════════════════════════


# The GROUP BY over the UNION is the most expensive FTS query here, and
# bots re-hit the same queries constantly — cache the counts per worker.
_COUNTS_CACHE = TTLCache(max_size=256, ttl=120)


def _get_book_counts(cursor, words, allowed_books, trans_table=None, phrases=None):
    """
    Get per-book match counts from paragraphs_fts (+ fts_<lang>_trans).
    Returns (list_of_dicts, total_count).
    """
    phrases = phrases or []
    cache_key = (
        _build_fts_query(words, phrases),
        tuple(sorted(allowed_books)) if allowed_books else "",
        trans_table or "",
    )
    cached = _COUNTS_CACHE.get(cache_key)
    if cached is not None:
        return cached
    fts_query = _build_fts_query(words, phrases)
    bf_p_sql, bf_p_params = _book_filter_clause(allowed_books, alias="p")
    bf_t_sql, bf_t_params = _book_filter_clause(allowed_books, alias="t")
    branches = _match_branches(trans_table, bf_p_sql, bf_t_sql)
    params = [fts_query] + bf_p_params
    if trans_table:
        params += [fts_query] + bf_t_params

    sql = f"""
        SELECT m.book_id, COUNT(*) as count
        FROM ({branches}) m
        WHERE m.book_id IS NOT NULL AND m.book_id != ''
        GROUP BY m.book_id
    """
    rows = cursor.execute(sql, params).fetchall()
    books = [{"book_id": r["book_id"], "count": r["count"]} for r in rows]
    total = sum(r["count"] for r in rows)
    _COUNTS_CACHE.set(cache_key, (books, total))
    return books, total


# ═══════════════════════════════════════════════════════════════════════════
#  Full results (all books, no pagination — for small result sets)
# ═══════════════════════════════════════════════════════════════════════════


def _search_all_lines(
    cursor, words, allowed_books, lang=None, trans_table=None, phrases=None
):
    """Fetch ALL matching paragraphs (used when total <= 30)."""
    fts_query = _build_fts_query(words, phrases)
    bf_p_sql, bf_p_params = _book_filter_clause(allowed_books, alias="p")
    bf_t_sql, bf_t_params = _book_filter_clause(allowed_books, alias="t")
    branches = _match_branches(trans_table, bf_p_sql, bf_t_sql)
    params = [fts_query] + bf_p_params
    if trans_table:
        params += [fts_query] + bf_t_params

    data_sql = f"""
        SELECT m.book_id, m.para_id
        FROM ({branches}) m
        WHERE m.book_id IS NOT NULL AND m.book_id != ''
        ORDER BY m.book_id, m.para_id
    """
    para_hits = cursor.execute(data_sql, params).fetchall()
    if not para_hits:
        return []

    book_para_pairs = [(r["book_id"], r["para_id"]) for r in para_hits]
    return _fetch_line_details(book_para_pairs, words, lang, phrases)


# ═══════════════════════════════════════════════════════════════════════════
#  Per-book paginated results
# ═══════════════════════════════════════════════════════════════════════════


def _search_book_lines(
    cursor,
    words,
    allowed_books,
    book_id,
    page,
    limit,
    lang=None,
    trans_table=None,
    phrases=None,
):
    """Fetch paginated results for a single book."""
    fts_query = _build_fts_query(words, phrases)
    bf_p_sql, bf_p_params = _book_filter_clause(allowed_books, alias="p")
    bf_t_sql, bf_t_params = _book_filter_clause(allowed_books, alias="t")
    branches = _match_branches(trans_table, bf_p_sql, bf_t_sql)
    match_params = [fts_query] + bf_p_params
    if trans_table:
        match_params += [fts_query] + bf_t_params

    # Count
    count_sql = f"""
        SELECT COUNT(*)
        FROM ({branches}) m
        WHERE m.book_id = ?
    """
    total = cursor.execute(count_sql, match_params + [book_id]).fetchone()[0]
    if total == 0:
        return [], 0

    # Fetch page
    offset = (page - 1) * limit
    data_sql = f"""
        SELECT m.book_id, m.para_id
        FROM ({branches}) m
        WHERE m.book_id = ?
        ORDER BY m.para_id
        LIMIT ? OFFSET ?
    """
    para_hits = cursor.execute(
        data_sql, match_params + [book_id, limit, offset]
    ).fetchall()
    if not para_hits:
        return [], total

    book_para_pairs = [(book_id, r["para_id"]) for r in para_hits]
    return _fetch_line_details(book_para_pairs, words, lang, phrases), total


# ═══════════════════════════════════════════════════════════════════════════
#  Common: load lines, detect matches, load translations
# ═══════════════════════════════════════════════════════════════════════════


def _fetch_line_details(book_para_pairs, words, lang=None, phrases=None):
    """
    Given a list of (book_id, para_id) pairs, load all lines,
    detect matched lines, and look up translations.

    Returns a list of dicts:
        { 'book_id': .., 'para_id': .., 'lines': [{line_id, pali, translation, matched}, ...] }
    """
    if not book_para_pairs:
        return []
    phrases = phrases or []

    placeholders = " OR ".join("(book_id = ? AND para_id = ?)" for _ in book_para_pairs)
    params = [v for pair in book_para_pairs for v in pair]

    # ── Load lines from epitaka.db ──────────────────────────────────────
    with get_db() as epi_conn:
        all_lines = epi_conn.execute(
            f"""
            SELECT book_id, para_id, line_id, pali
            FROM sentences
            WHERE {placeholders}
            ORDER BY book_id, para_id, line_id
        """,
            params,
        ).fetchall()

        lines_by_key = defaultdict(list)
        for line in all_lines:
            lines_by_key[(line["book_id"], line["para_id"])].append(line)

        # ── Load translations ───────────────────────────────────────────
        trans_map = {}
        if lang:
            trans_db = get_translation_db(lang)
            if trans_db:
                trans_cursor = trans_db.cursor()
                trans_cursor.execute(
                    f"""
                    SELECT book_id, para_id, line_id, translation
                    FROM sentences
                    WHERE {placeholders}
                    ORDER BY book_id, para_id, line_id
                """,
                    params,
                )
                for tr in trans_cursor.fetchall():
                    trans_map[(tr["book_id"], tr["para_id"], tr["line_id"])] = tr[
                        "translation"
                    ]

        # ── Build results (matched lines only) ──────────────────────────
        # A line is shown when its Pāli OR its translation matches — the
        # paragraph may have been hit via the translation FTS table only.
        results = []
        for book_id, para_id in book_para_pairs:
            lines = lines_by_key.get((book_id, para_id), [])
            matched_line_ids = _find_matching_lines(lines, words, phrases)
            if trans_map:
                trans_items = [
                    (lid, trans_map.get((book_id, para_id, lid), ""))
                    for lid in [line["line_id"] for line in lines]
                ]
                matched_line_ids |= _find_matching_trans_lines(
                    trans_items, words, phrases
                )

            line_results = []
            for line in lines:
                lid = line["line_id"]
                if lid not in matched_line_ids:
                    continue  # skip non-matched lines

                pali_text = line["pali"] or ""
                translation = trans_map.get((book_id, para_id, lid), "") or ""
                line_results.append(
                    {
                        "line_id": lid,
                        "pali": pali_text,
                        "translation": translation,
                        "matched": True,
                    }
                )

            if line_results:  # only include paragraphs with matched lines
                results.append(
                    {
                        "book_id": book_id,
                        "para_id": para_id,
                        "lines": line_results,
                    }
                )

    return results


# ═══════════════════════════════════════════════════════════════════════════
#  Build frontend-ready grouped results
# ═══════════════════════════════════════════════════════════════════════════


def _build_results_grouped(rows, hierarchy, words, lang=None, phrases=None):
    """
    Take the raw results from _fetch_line_details / _search_all_lines
    and group them by book, adding book names, slugs, and highlighting.

    Slugs are resolved with one batched query instead of one per result.
    """
    grouped = defaultdict(lambda: {"book_id": "", "book_name": "", "items": []})

    # ── Batch slug resolution ───────────────────────────────────────────
    pairs = [(row["book_id"], row["para_id"]) for row in rows]
    slug_map = {}
    if pairs:
        with get_db() as conn:
            slug_map = build_slug_map(conn, pairs)

    for row in rows:
        bid = row["book_id"]
        if not grouped[bid]["book_id"]:
            grouped[bid]["book_id"] = bid
            grouped[bid]["book_name"] = hierarchy.get(bid, {}).get("book_name", bid)

        slug = slug_map.get((bid, row["para_id"]), "")

        lines = row.get("lines", [])
        # Highlight Pali + translation in matched lines
        for lr in lines:
            if lr["pali"]:
                lr["pali"] = markdown_to_html(lr["pali"])
                lr["pali"] = _highlight_words(lr["pali"], words, phrases)
            if lr.get("translation"):
                lr["translation"] = _highlight_words(lr["translation"], words, phrases)

        grouped[bid]["items"].append(
            {
                "book_id": bid,
                "para_id": row["para_id"],
                "slug": slug,
                "lines": lines,
            }
        )

    return list(grouped.values())

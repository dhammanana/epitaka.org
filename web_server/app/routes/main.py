# app/routes/main.py
"""
Main routes for E-Piṭaka web server.

Supports multi-language URL routing:
  /                           → Redirect to default language
  /<lang>/                    → Index page in language
  /<lang>/book/<book_id>      → Book page with TOC in language
  /<lang>/book/<book_id>/<section_slug>  → Book page with expanded section (SEO)
"""
from flask import Blueprint, render_template, request, redirect, jsonify, abort

from ..utils.db   import get_db, get_available_translations, get_translation_db
from ..utils.text import normalize_pali, markdown_to_html
from ..services.books import load_hierarchy, organize_hierarchy, get_book_name
from ..services.toc   import get_book_toc, resolve_split_book, get_section_sentences
from ..config import Config

bp = Blueprint('main', __name__)


def get_lang_info(lang_code):
    """Get language display info."""
    translations = Config.detect_translations()
    info = translations.get(lang_code, {})
    if not info:
        return {'code': lang_code, 'english_name': lang_code.upper(), 'native_name': lang_code.upper()}
    return info


# ── Legacy redirects (for pre-built JS bundles that don't include lang prefix) ──

@bp.route('/book/<book_id>')
@bp.route('/book/<book_id>/<path:section_path>')
def legacy_book_redirect(book_id, section_path=None):
    """Redirect old /book/... URLs to /{lang}/book/..."""
    if section_path:
        return redirect(f'/{Config.DEFAULT_LANG}/book/{book_id}/{section_path}')
    return redirect(f'/{Config.DEFAULT_LANG}/book/{book_id}')


@bp.route('/book_ref/<book_id>')
def legacy_book_ref_redirect(book_id):
    """Redirect old /book_ref/... URLs to /{lang}/book_ref/..."""
    qs = request.query_string.decode() if request.query_string else ''
    return redirect(f'/{Config.DEFAULT_LANG}/book_ref/{book_id}?{qs}')


# ── Language redirect ──────────────────────────────────────────────────────

@bp.route('/')
def index_redirect():
    """Root URL: render the index page directly for the default language.
    Using redirect here caused a redirect loop when translations were not found.
    """
    # Render directly instead of redirecting to avoid redirect loops
    return index(Config.DEFAULT_LANG)


# ── Index page ─────────────────────────────────────────────────────────────

@bp.route('/<lang>/')
def index(lang):
    """Index page for a specific language."""
    hierarchy = load_hierarchy()  # must be before 'if' block below
    translations = Config.detect_translations()
    available_langs = list(translations.keys())

    if lang not in translations:
        # If the default language itself is not found, render anyway
        # with empty available_langs to avoid redirect loop
        print(f"WARNING: Language '{lang}' not found in translations at {Config.DATA_DIR}")
        return render_template(
            'index.html',
            base_url=Config.BASE_URL,
            menu=organize_hierarchy(hierarchy),
            lang=lang,
            lang_info={'code': lang, 'english_name': lang.upper(), 'native_name': lang.upper()},
            available_langs=[],
        )

    lang_info = translations[lang]

    return render_template(
        'index.html',
        base_url=Config.BASE_URL,
        menu=organize_hierarchy(hierarchy),
        lang=lang,
        lang_info=lang_info,
        available_langs=[translations[code] for code in sorted(translations.keys())],
    )


# ── Book page ──────────────────────────────────────────────────────────────

@bp.route('/<lang>/book/<book_id>')
@bp.route('/<lang>/book/<book_id>/<path:section_path>')
def book(lang, book_id, section_path=None):
    """Book page with TOC, optionally with expanded section for SEO."""
    translations = Config.detect_translations()
    available_langs = list(translations.keys())

    if lang not in translations:
        return redirect(Config.BASE_URL + '/' + Config.DEFAULT_LANG + '/')

    book_id = book_id.replace('_chunks', '')

    lang_info = translations[lang]
    hierarchy = load_hierarchy()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        row = cursor.fetchone()
        book_title = row['book_name'] if row else 'Unknown Book'
        toc = get_book_toc(book_id, conn)

        # ── Parse section_path for SEO-friendly deep-linking ────────────
        active_para_id = None
        active_line_id = None
        section_slug = None

        if section_path:
            parts = section_path.strip('/').split('/')
            if len(parts) >= 1:
                section_slug = parts[0]
            if len(parts) >= 2:
                try:
                    active_para_id = int(parts[1])
                except ValueError:
                    pass
            if len(parts) >= 3:
                try:
                    active_line_id = int(parts[2])
                except ValueError:
                    pass

        # If no explicit para_id, find it from the section slug
        if not active_para_id and section_slug:
            for item in toc:
                slug = item['title'].lower().replace(' ', '-') if item['title'] else ''
                if slug == section_slug:
                    active_para_id = item['para_id']
                    break

        # ── Server-side render the expanded section content for SEO ───
        section_content = None
        if active_para_id:
            section_content = get_section_sentences(book_id, active_para_id, conn, lang_code=lang)

        # ── Book links (short previews, 3 lines, with translation) ────
        book_links_html = None
        book_links_by_line = {}
        if active_para_id:
            book_links_html = _render_book_links(book_id, active_para_id, hierarchy, conn, lang_code=lang)
            book_links_by_line = group_book_links_by_line(book_links_html, lang)

        # ── Pre-compute ref_links: map each numbered paragraph (level=10)
        #    in the current book to matching paragraphs in related books ────
        #    Structure:
        #      {src_num_para_id: {ref_type: [{book_id, para_id, slug, num_title}]}}
        #    Where src_num_para_id is the para_id of a level-10 numbered item
        #    (like "1", "2", "3") within a section, and slug is from the parent
        #    level<10 heading in the related book.
        bookinfo = hierarchy.get(book_id, {})
        ref_types = {
            'mula_ref':  bookinfo.get('mula_ref',  []),
            'attha_ref': bookinfo.get('attha_ref', []),
            'tika_ref':  bookinfo.get('tika_ref',  []),
        }
        # ── Query all level=10 numbered items directly (user's requirement:
        #    "query level=10 inside headings under current section")
        #    and match them by title with related books.
        #    NOTE: get_book_toc() returns only level<=6 — we query level=10
        #    directly from headings table.
        cursor.execute('''
            SELECT title, para_id FROM headings
            WHERE book_id = ? AND level = 10
            ORDER BY para_id
        ''', (book_id,))
        numbered_items = cursor.fetchall()
        ref_links = {}
        for ni in numbered_items:
            num_title = ni['title']
            num_pid   = ni['para_id']
            if not num_title:
                continue
            entry = {}
            for rtype, book_ids in ref_types.items():
                refs = []
                for bid in book_ids:
                    # Find matching numbered item in related book
                    cursor.execute('''
                        SELECT para_id FROM headings
                        WHERE book_id = ? AND title = ? AND level = 10
                        LIMIT 1
                    ''', (bid, num_title))
                    match = cursor.fetchone()
                    if not match:
                        continue
                    dst_pid = match['para_id']
                    # Find parent level<10 heading for section slug
                    cursor.execute('''
                        SELECT title FROM headings
                        WHERE book_id = ? AND level < 10 AND para_id <= ?
                        ORDER BY para_id DESC LIMIT 1
                    ''', (bid, dst_pid))
                    parent = cursor.fetchone()
                    dst_slug = parent[0].lower().replace(' ', '-') if parent and parent[0] else ''
                    info = hierarchy.get(bid, {})
                    refs.append({
                        'book_id':   bid,
                        'book_name': info.get('book_name', bid),
                        'para_id':   dst_pid,
                        'num_title': num_title,
                        'slug':      dst_slug,
                    })
                if refs:
                    entry[rtype] = refs
            if entry:
                ref_links[num_pid] = entry
        print(f'[DEBUG] ref_links built: {len(ref_links)} keys for {book_id}')

    if not book_title:
        abort(404)

    bookinfo = hierarchy.get(book_id, {})

    def enrich_refs(ref_ids):
        result = []
        for rid in (ref_ids or []):
            info = hierarchy.get(rid, {})
            result.append({
                'book_id':   rid,
                'book_name': info.get('book_name', rid),
            })
        return result

    bookref = {
        'mula_ref':  enrich_refs(bookinfo.get('mula_ref',  [])),
        'attha_ref': enrich_refs(bookinfo.get('attha_ref', [])),
        'tika_ref':  enrich_refs(bookinfo.get('tika_ref',  [])),
    }

    canonical_url = f"{Config.BASE_URL}/{lang}/book/{book_id}"
    meta_description = f"Read {book_title} from the Chaṭṭha Saṅgāyana Tipiṭaka in {lang_info['english_name']}."

    return render_template(
        'book.html',
        book_id=book_id,
        book_title=book_title,
        bookref=bookref,
        ref_links=ref_links,
        toc=toc,
        base_url=Config.BASE_URL,
        lang=lang,
        lang_info=lang_info,
        available_langs=[translations[code] for code in sorted(translations.keys())],
        canonical_url=canonical_url,
        meta_description=meta_description,
        active_para_id=active_para_id,
        active_line_id=active_line_id,
        section_slug=section_slug,
        section_content=section_content,
        book_links_by_line=book_links_by_line,
        firebase_config=Config.FIREBASE_CONFIG,
        menu=organize_hierarchy(hierarchy),
    )


# ── Book link rendering ────────────────────────────────────────────────────

def _render_book_links(book_id, para_id, hierarchy, conn, lang_code=None):
    """Render book links as inline HTML preview (short, ~3 lines).

    Each link includes:
    - Pāli preview rows (target ±1 line)
    - Translation preview rows (in lang_code, if available)
    - dst_slug — the section heading slug for deep-linking
    """
    cursor = conn.cursor()

    cursor.execute('''
        SELECT para_id FROM headings
        WHERE book_id = ? AND para_id > ? AND level < 10
        ORDER BY para_id ASC LIMIT 1
    ''', (book_id, para_id))
    next_row = cursor.fetchone()
    end_para = next_row['para_id'] if next_row else 999999999

    cursor.execute('''
        SELECT src_para, src_line, dst_book, dst_para, dst_line, word
        FROM book_links
        WHERE src_book = ? AND src_para >= ? AND src_para < ?
        ORDER BY src_para, src_line
    ''', (book_id, para_id, end_para))
    links = cursor.fetchall()

    if not links:
        return None

    # ── Translation DB (if user wants it) ──────────────────────────────
    trans_db = None
    trans_cursor = None
    if lang_code:
        try:
            trans_db = get_translation_db(lang_code)
            if trans_db:
                trans_cursor = trans_db.cursor()
        except Exception:
            pass

    result = []
    seen_slugs = {}  # cache (book_id, para_id) → slug

    def _get_slug(bid, pid):
        """Return the heading slug for a (book_id, para_id) pair.
        Uses same method as the Jinja template: .lower().replace(' ', '-')."""
        key = (bid, pid)
        if key in seen_slugs:
            return seen_slugs[key]
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND level < 10 AND para_id <= ?
            ORDER BY para_id DESC LIMIT 1
        ''', (bid, pid))
        row = cursor.fetchone()
        title = row[0] if row else ''
        slug = title.lower().replace(' ', '-') if title else ''
        seen_slugs[key] = slug
        return slug

    for lnk in links:
        dst_book = lnk['dst_book']
        dst_para = lnk['dst_para']
        dst_line = lnk['dst_line']

        # ── Pāli preview ────────────────────────────────────────────
        cursor.execute('''
            SELECT para_id, line_id, pali
            FROM sentences
            WHERE book_id = ? AND para_id = ?
              AND line_id BETWEEN ? AND ?
            ORDER BY line_id
        ''', (dst_book, dst_para, max(0, dst_line - 1), dst_line + 1))

        preview = []
        for r in cursor.fetchall():
            preview.append({
                'para_id': r['para_id'],
                'line_id': r['line_id'],
                'pali': markdown_to_html(r['pali']) if r['pali'] else '',
                'translation': '',
                'is_target': r['line_id'] == dst_line,
            })

        # ── Translation preview ────────────────────────────────────
        if trans_cursor:
            trans_cursor.execute('''
                SELECT para_id, line_id, translation
                FROM sentences
                WHERE book_id = ? AND para_id = ?
                  AND line_id BETWEEN ? AND ?
                ORDER BY line_id
            ''', (dst_book, dst_para, max(0, dst_line - 1), dst_line + 1))
            for tr in trans_cursor.fetchall():
                for p in preview:
                    if p['para_id'] == tr['para_id'] and p['line_id'] == tr['line_id']:
                        if tr['translation']:
                            p['translation'] = markdown_to_html(tr['translation'])

        # ── Section slug for deep-link URL ──────────────────────────
        dst_slug = _get_slug(dst_book, dst_para)

        result.append({
            'src_para':      lnk['src_para'],
            'src_line':      lnk['src_line'],
            'word':          lnk['word'],
            'dst_book':      dst_book,
            'dst_book_name': hierarchy.get(dst_book, {}).get('book_name', dst_book),
            'dst_para':      dst_para,
            'dst_line':      dst_line,
            'dst_slug':      dst_slug,
            'preview':       preview,
        })

    return result


# ── Group book links by (para_id, line_id) for inline rendering ──────────

def group_book_links_by_line(links, lang_code):
    """
    Given the flat list of book-link dicts from _render_book_links(),
    return a dict: {para_id: {line_id: [link, ...]}}

    This allows the template to render badges inline with the sentence
    they reference, instead of dumping all badges at the end of the section.
    """
    if not links:
        return {}
    grouped = {}
    for link in links:
        para = link['src_para']
        line = link['src_line']
        grouped.setdefault(para, {}).setdefault(line, []).append(link)
    return grouped


# ── Navigation: go to related book ─────────────────────────────────────────

@bp.route('/<lang>/book_ref/<book_id>')
def book_ref(lang, book_id):
    """
    Navigate from the current book (ref) to a related book (book_id) at the
    paragraph matching the caller's current position.  Handles split books.
    """
    translations = Config.detect_translations()
    if lang not in translations:
        return redirect(f'/{Config.DEFAULT_LANG}/')

    ref     = request.args.get('ref', '').strip()
    raw_pid = request.args.get('para_id', '').strip().replace('para-', '')
    try:
        para_id = int(raw_pid)
    except ValueError:
        para_id = 1

    with get_db() as conn:
        cursor = conn.cursor()

        resolved = resolve_split_book(book_id, para_id, cursor)
        if not resolved:
            return redirect(f'/{lang}/book/{ref}' if ref else f'/{lang}/')
        book_id = resolved

        # Find the heading in the source book just before para_id
        cursor.execute('''
            SELECT title FROM headings
            WHERE book_id = ? AND level = 10 AND para_id < ?
            ORDER BY para_id DESC LIMIT 1
        ''', (ref, para_id))
        row = cursor.fetchone()
        if not row:
            return redirect(f'/{lang}/book/{book_id}')

        heading     = row[0]
        result_para = ''
        while not result_para:
            cursor.execute('''
                SELECT para_id FROM headings
                WHERE book_id = ? AND title = ? AND level = 10
                ORDER BY para_id DESC
            ''', (book_id, heading))
            found = cursor.fetchone()
            result_para = found[0] if found else ''
            try:
                heading = str(int(heading) - 1)
            except Exception:
                break

        if not result_para:
            return redirect(f'/{lang}/book/{book_id}')

    return redirect(f'/{lang}/book/{book_id}#{result_para}')


# ── Suggest / search API ───────────────────────────────────────────────────

@bp.route('/api/suggest_word')
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    from ..services.dictionary import suggest_words
    return jsonify(suggest_words(query))


@bp.route('/api/search_headings')
def search_headings_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT book_id, para_id, title FROM headings WHERE title LIKE ? LIMIT 10',
            (f'%{query}%',),
        )
        results = cursor.fetchall()
    return jsonify([{
        'book_id':   r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id':   r['para_id'],
        'title':     r['title'],
    } for r in results])


@bp.route('/api/bold_suggest')
def bold_suggest():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.book_id, d.para_id, d.line_id, d.word
            FROM pali_definition d
            JOIN books b ON d.book_id = b.book_id
            WHERE d.plain LIKE ?
            ORDER BY b.id, d.para_id
            LIMIT 50
        ''', (normalize_pali(query),))
        results = cursor.fetchall()
    return jsonify([{
        'book_id':   r['book_id'],
        'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
        'para_id':   r['para_id'],
        'line_id':   r['line_id'],
        'title':     r['word'],
    } for r in results])


@bp.route('/api/bold_definition')
def bold_definition():
    hierarchy = load_hierarchy()
    query = request.args.get('q', '').strip()
    lang_code = request.args.get('lang', '').strip() or None
    if not query:
        return jsonify([])

    # ── Translation DB (if requested) ──
    trans_cursor = None
    if lang_code:
        try:
            trans_db = get_translation_db(lang_code)
            if trans_db:
                trans_cursor = trans_db.cursor()
        except Exception:
            pass

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.book_id, d.para_id, d.line_id, d.word,
                   s.pali
            FROM pali_definition d
            JOIN books     b ON d.book_id = b.book_id
            JOIN sentences s ON d.book_id = s.book_id
                             AND d.para_id = s.para_id
                             AND d.line_id = s.line_id
            WHERE d.plain LIKE ?
            ORDER BY b.id, d.para_id
        ''', (normalize_pali(query),))
        results = cursor.fetchall()

    output = []
    for r in results:
        entry = {
            'book_id':         r['book_id'],
            'book_name':       hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
            'para_id':         r['para_id'],
            'line_id':         r['line_id'],
            'title':           r['word'],
            'definition_pali': markdown_to_html(r['pali']),
        }
        # Look up translation for this sentence
        if trans_cursor:
            try:
                trans_cursor.execute('''
                    SELECT translation FROM sentences
                    WHERE book_id = ? AND para_id = ? AND line_id = ?
                ''', (r['book_id'], r['para_id'], r['line_id']))
                trans_row = trans_cursor.fetchone()
                if trans_row and trans_row['translation']:
                    entry['definition_en'] = markdown_to_html(trans_row['translation'])
            except Exception:
                pass
        output.append(entry)

    return jsonify(output)

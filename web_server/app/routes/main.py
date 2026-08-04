# app/routes/main.py
"""
Main routes for E-Piṭaka web server.

Supports multi-language URL routing:
  /                           → Redirect to default language
  /<lang>/                    → Index page in language
  /<lang>/book/<book_id>      → Book page with TOC in language
  /<lang>/book/<book_id>/<section_slug>  → Book page with expanded section (SEO)
"""
from flask import Blueprint, render_template, request, redirect, jsonify, abort, send_from_directory

from ..utils.db   import get_db, get_translation_db
from ..utils.text import normalize_pali, markdown_to_html
from ..services.books import load_hierarchy, organize_hierarchy
from ..services.toc   import get_book_toc, resolve_split_book, get_section_sentences, build_slug_map
from ..services.links import load_section_book_links
from ..config import Config

import os
import json
import bisect
from collections import defaultdict

_SHARE_LINK_REDIRECT_TEMPLATE = 'app_redirect.html'

# Path to generated sitemap files
_SITEMAP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'sitemaps')

# Path to built frontend assets (web_server/frontend/dist)
_FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'frontend', 'dist')

# Path to root-level verification files (Google Search Console, Flutter app links, etc.)
_ROOT_FILES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'root_files')

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


# ── Translation editor console ────────────────────────────────────────────
# Private workspace for translators. Accounts are created only by the super
# admin; the page itself is a thin shell — all logic lives in the editor
# frontend bundle (frontend/src/editor.js) and the /editor/api/* blueprint.

@bp.route('/editor')
def editor_page():
    # Cache-bust the editor bundle with its file mtime so browsers never serve
    # a stale build after we rebuild the frontend.
    v = 0
    try:
        bundle = os.path.join(_FRONTEND_DIST, 'js', 'editor.bundle.js')
        v = int(os.path.getmtime(bundle))
    except OSError:
        pass
    return render_template(
        'editor.html',
        base_url=Config.BASE_URL,
        lang=Config.DEFAULT_LANG,
        v=v,
    )


# ── Sitemap routes ─────────────────────────────────────────────────────────

@bp.route('/sitemap.xml')
def sitemap_index():
    """Serve the sitemap index generated by scripts/build_sitemap.py."""
    sitemap_path = os.path.join(_SITEMAP_DIR, '..', 'sitemap.xml')
    sitemap_dir  = os.path.dirname(os.path.abspath(sitemap_path))
    return send_from_directory(sitemap_dir, 'sitemap.xml')


@bp.route('/sitemaps/<path:filename>')
def sitemap_file(filename):
    """Serve per-book sitemap files."""
    return send_from_directory(_SITEMAP_DIR, filename)


# ── App share link interstitials ──────────────────────────────────────────
# The mobile app generates share links of the form:
#   https://epitaka.org/app/{bookId}/{paraId}/{lineId}
#
# When clicked on a device with the app installed, the OS intercepts the link
# (via Android App Links / iOS Universal Links) and opens the app directly.
#
# When the app is NOT installed, this page serves as a fallback that:
# 1. Tries to open the app via the epitaka:// custom scheme
# 2. Redirects to the web version if the app can't be opened

@bp.route('/app/')
@bp.route('/app/<book_id>')
@bp.route('/app/<book_id>/<int:para_id>')
@bp.route('/app/<book_id>/<int:para_id>/<int:line_id>')
def app_share_link(book_id=None, para_id=None, line_id=None):
    """
    Interstitial page for mobile app share links.

    URL patterns:
      /app/{book_id}
      /app/{book_id}/{para_id}
      /app/{book_id}/{para_id}/{line_id}

    Renders a page that:
    - Attempts to open the app via epitaka:// custom scheme
    - Falls back to /{lang}/book/{book_id}#{para_id} on the web
    """
    if not book_id:
        return redirect(f'/{Config.DEFAULT_LANG}/')

    # Resolve book name from database
    book_name = book_id
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
            row = cursor.fetchone()
            if row:
                book_name = row['book_name']
    except Exception:
        pass

    # Build deep link URI for the app custom scheme
    custom_scheme_uri = f'epitaka://reader/{book_id}'
    if para_id is not None:
        custom_scheme_uri += f'?paraId={para_id}'
        if line_id is not None:
            custom_scheme_uri += f'&lineId={line_id}'

    # Build web fallback URL
    web_fallback = f'{Config.BASE_URL}/{Config.DEFAULT_LANG}/book/{book_id}'
    if para_id is not None:
        web_fallback += f'#{para_id}'

    return render_template(
        _SHARE_LINK_REDIRECT_TEMPLATE,
        book_id=book_id,
        book_name=book_name,
        para_id=para_id,
        line_id=line_id,
        custom_scheme_uri=custom_scheme_uri,
        web_fallback=web_fallback,
        base_url=Config.BASE_URL,
        app_name='Epitaka',
        app_icon_url=f'{Config.BASE_URL}/static/icon.png' if Config.BASE_URL else '',
    )


# ── Root-level verification files ─────────────────────────────────────────
# These files (Google Search Console, Flutter Digital Asset Links, etc.)
# are served at the root path for domain verification services.

# ── Google Search Console verification ──────────────────────────────
# Google generates a hex hash like google3fa1caa4638a5d58.html
@bp.route('/google<path:hash>.html')
def google_verification(hash):
    """Serve Google Search Console verification files from root_files/."""
    filename = f"google{hash}.html"
    return send_from_directory(_ROOT_FILES_DIR, filename)

@bp.route('/favicon.ico')
def favicon_ico():
    """Serve the site favicon."""
    static_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        'static'
    )
    return send_from_directory(static_dir, 'favicon.ico')

# ── .well-known (Flutter app links, Apple Universal Links) ────────────
@bp.route('/.well-known/<path:filename>')
def well_known(filename):
    """Serve .well-known files for domain verification (Flutter app links, etc.).

    Android:  /.well-known/assetlinks.json
    iOS:      /.well-known/apple-app-site-association
    """
    well_known_dir = os.path.join(_ROOT_FILES_DIR, '.well-known')
    return send_from_directory(well_known_dir, filename)


# ── Add more root-level verification routes below as needed ───────────
# For example:
# @bp.route('/BingSiteAuth.xml')
# def bing_verification():
#     return send_from_directory(_ROOT_FILES_DIR, 'BingSiteAuth.xml')
#
# @bp.route('/yandex<path:hash>.html')
# def yandex_verification(hash):
#     return send_from_directory(_ROOT_FILES_DIR, f'yandex{hash}.html')


# ── Book page ──────────────────────────────────────────────────────────────

@bp.route('/<lang>/book/<book_id>')
@bp.route('/<lang>/book/<book_id>/<path:section_path>')
def book(lang, book_id, section_path=None):
    """Book page with TOC, optionally with expanded section for SEO."""
    translations = Config.detect_translations()

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
        section_slug = section_path

        # if section_path:
        #     parts = section_path.strip('/').split('/')
        #     if len(parts) >= 1:
        #         section_slug = parts[0]
        #     if len(parts) >= 2:
        #         try:
        #             active_para_id = int(parts[1])
        #         except ValueError:
        #             pass
        #     if len(parts) >= 3:
        #         try:
        #             active_line_id = int(parts[2])
        #         except ValueError:
        #             pass

        # If no explicit para_id, extract it from the section slug ({slug}-{para_id})
        if not active_para_id and section_slug and '-' in section_slug:
            try:
                slug_para_id = int(section_slug.rsplit('-', 1)[1])
                active_para_id = slug_para_id
            except ValueError:
                pass

        # ── Server-side render the expanded section content for SEO ───
        section_content = None
        heading_translation = None
        section_has_content = False
        if active_para_id:
            section_data = get_section_sentences(book_id, active_para_id, conn, lang_code=lang)
            section_content = section_data['sentences']
            heading_translation = section_data['heading_translation']
            section_has_content = section_data['has_content']

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
        #
        #    Batched: instead of running 2 queries per numbered item per
        #    related book (thousands of round-trips), load every related
        #    book's headings in two bulk queries and match in memory.
        cursor.execute('''
            SELECT title, para_id FROM headings
            WHERE book_id = ? AND level = 10
            ORDER BY para_id
        ''', (book_id,))
        numbered_items = cursor.fetchall()

        ref_book_ids = sorted({bid for ids in ref_types.values() for bid in ids})

        # Bulk index: (book_id, num_title) -> first para_id for level-10 items
        level10_index = defaultdict(list)
        # Bulk index: book_id -> [(para_id, title)] for parent slug lookup
        parent_index = defaultdict(list)
        if ref_book_ids:
            placeholders = ','.join('?' * len(ref_book_ids))
            cursor.execute(f'''
                SELECT book_id, title, para_id FROM headings
                WHERE book_id IN ({placeholders}) AND level = 10
                ORDER BY book_id, title, para_id
            ''', ref_book_ids)
            for r in cursor.fetchall():
                level10_index[(r['book_id'], r['title'])].append(r['para_id'])

            cursor.execute(f'''
                SELECT book_id, para_id, title FROM headings
                WHERE book_id IN ({placeholders}) AND level < 10
                ORDER BY book_id, para_id
            ''', ref_book_ids)
            for r in cursor.fetchall():
                parent_index[r['book_id']].append((r['para_id'], r['title']))

        # Precompute sorted parent para lists once per related book
        parent_paras = {bid: [p for p, _ in parents] for bid, parents in parent_index.items()}

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
                    matches = level10_index.get((bid, num_title))
                    if not matches:
                        continue
                    dst_pid = matches[0]
                    # Find parent level<10 heading for section slug (bisect)
                    parents = parent_index.get(bid, [])
                    para_list = parent_paras.get(bid, [])
                    idx = bisect.bisect_right(para_list, dst_pid) - 1
                    if idx >= 0 and parents[idx][1]:
                        dst_slug = parents[idx][1].lower().replace(' ', '-') + '-' + str(parents[idx][0])
                    else:
                        dst_slug = ''
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
        heading_translation=heading_translation,
        section_has_content=section_has_content,
        book_links_by_line=book_links_by_line,
        firebase_config=Config.FIREBASE_CONFIG,
        menu=organize_hierarchy(hierarchy),
    )


# ── Book link rendering ────────────────────────────────────────────────────

def _render_book_links(book_id, para_id, hierarchy, conn, lang_code=None):
    """Render book links as inline HTML preview (short, ~3 lines).

    Delegates to the batched loader in services/links.py; adds book names.
    Each link includes:
    - Pāli preview rows (target ±1 line)
    - Translation preview rows (in lang_code, if available)
    - dst_slug — the section heading slug for deep-linking
    """
    links = load_section_book_links(conn, book_id, para_id, lang_code=lang_code)
    if not links:
        return None
    for lnk in links:
        lnk['dst_book_name'] = hierarchy.get(lnk['dst_book'], {}).get('book_name', lnk['dst_book'])
    return links


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
        'slug':      (r['title'].lower().replace(' ', '-') + '-' + str(r['para_id'])) if r['title'] else '',
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

        # Pre-compute slugs with one batched query
        slug_map = build_slug_map(conn, [(r['book_id'], r['para_id']) for r in results])
        output = []
        for r in results:
            output.append({
                'book_id':   r['book_id'],
                'book_name': hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
                'para_id':   r['para_id'],
                'line_id':   r['line_id'],
                'title':     r['word'],
                'slug':      slug_map.get((r['book_id'], r['para_id']), ''),
            })
    return jsonify(output)


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

        # ── Pre-compute slugs with one batched query ──
        slug_map = build_slug_map(conn, [(r['book_id'], r['para_id']) for r in results])
        output = []
        for r in results:
            entry = {
                'book_id':         r['book_id'],
                'book_name':       hierarchy.get(r['book_id'], {}).get('book_name', 'Unknown'),
                'para_id':         r['para_id'],
                'line_id':         r['line_id'],
                'title':           r['word'],
                'slug':            slug_map.get((r['book_id'], r['para_id']), ''),
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


# ── About / Translation page ────────────────────────────────────────────

@bp.route('/about')
@bp.route('/about-translation')
def about():
    """About the translation project page."""
    return render_template(
        'about.html',
        base_url=Config.BASE_URL,
    )


# ── Privacy policy ─────────────────────────────────────────────────────────

@bp.route('/privacy')
def privacy():
    """Privacy policy page."""
    return render_template(
        'privacy.html',
        base_url=Config.BASE_URL,
    )

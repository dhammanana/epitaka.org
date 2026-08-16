# app/routes/main.py
"""
Main routes for E-Piṭaka web server.

Supports multi-language URL routing:
  /                           → Redirect to default language
  /<lang>/                    → Index page in language
  /<lang>/book/<book_id>      → Book page with TOC in language
  /<lang>/book/<book_id>/<section_slug>  → Book page with expanded section (SEO)
"""
from flask import Blueprint, render_template, request, redirect, jsonify, abort, send_from_directory, make_response

from ..utils.db   import get_db, get_translation_db
from ..utils.text import normalize_pali, markdown_to_html
from ..utils.cache import TTLCache
from ..utils.ratelimit import rate_limit
from ..utils.assets import get_asset_version
from ..utils import seo
from ..services.books import load_hierarchy, organize_hierarchy
from ..services.toc   import get_book_toc, resolve_split_book, get_section_sentences, build_slug_map
from ..services.links import load_section_book_links
from ..services import summaries as summaries_svc
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

# Rendered book-page HTML cache. The book page is the most expensive route
# (TOC + ref_links bulk queries + Jinja render of a long TOC) and crawlers
# re-hit the same URLs constantly. Bounded LRU so memory stays flat on the
# small VPS; strings are cached (not Response objects) so each request gets
# a fresh response to finalize.
_BOOK_PAGE_CACHE = TTLCache(max_size=24, ttl=300)
# Study-guide and outline pages are English-only content served at /en/…;
# cached like the book page (crawlers re-hit the same URLs constantly).
_STUDY_PAGE_CACHE   = TTLCache(max_size=64, ttl=300)
_OUTLINE_PAGE_CACHE = TTLCache(max_size=32, ttl=300)


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
    """Redirect old /book/... URLs to /{lang}/book/... (permanently —
    Google still indexes legacy URLs like /book/Moh; a 301 consolidates
    their authority onto the canonical /en/book/... pages)."""
    if section_path:
        return redirect(f'/{Config.DEFAULT_LANG}/book/{book_id}/{section_path}', code=301)
    return redirect(f'/{Config.DEFAULT_LANG}/book/{book_id}', code=301)


@bp.route('/book_ref/<book_id>')
def legacy_book_ref_redirect(book_id):
    """Redirect old /book_ref/... URLs to /{lang}/book_ref/..."""
    qs = request.query_string.decode() if request.query_string else ''
    return redirect(f'/{Config.DEFAULT_LANG}/book_ref/{book_id}?{qs}', code=301)


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
        if lang != Config.DEFAULT_LANG:
            # Unknown language segment (bots probing /wp-admin, /tmp, …)
            # — 404 instead of rendering the home-page shell for them.
            abort(404)
        # If the default language itself is not found, render anyway
        # with empty available_langs to avoid redirect loop
        print(f"WARNING: Language '{lang}' not found in translations at {Config.DATA_DIR}")
        return render_template(
            'index.html',
            base_url=Config.BASE_URL,
            site_url=seo.site_base(),
            home_url=seo.absolute(f'/{lang}/'),
            menu=organize_hierarchy(hierarchy),
            lang=lang,
            lang_info={'code': lang, 'english_name': lang.upper(), 'native_name': lang.upper()},
            available_langs=[],
            seo_home=seo.home_l10n(lang, 0),
            popular_books=[],
            website_jsonld=seo.website_jsonld(lang),
        )

    lang_info = translations[lang]
    available = [translations[code] for code in sorted(translations.keys())]

    return render_template(
        'index.html',
        base_url=Config.BASE_URL,
        site_url=seo.site_base(),
        home_url=seo.absolute(f'/{lang}/'),
        menu=organize_hierarchy(hierarchy),
        lang=lang,
        lang_info=lang_info,
        available_langs=available,
        seo_home=seo.home_l10n(lang, len(available)),
        popular_books=seo.popular_books(lang),
        website_jsonld=seo.website_jsonld(lang),
    )


# ── Translation editor console ────────────────────────────────────────────
# Private workspace for translators. Accounts are created only by the super
# admin; the page itself is a thin shell — all logic lives in the editor
# frontend bundle (frontend/src/editor.js) and the /editor/api/* blueprint.

@bp.route('/editor')
@bp.route('/editor/')
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


# ── robots.txt ─────────────────────────────────────────────────────────────
# Previously the site had NO robots.txt — every compliant crawler treated
# the whole site as open season, and bots requesting /robots.txt itself got
# a 404→home redirect. Disallow the non-content paths and point crawlers at
# the sitemap.

@bp.route('/robots.txt')
def robots_txt():
    robots = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /editor\n'
        'Disallow: /app\n'
        'Disallow: /static/\n'
        'Disallow: /*?*\n'  # query-string URLs (search pages etc.)
        'Disallow: /api/\n'
        '\n'
        # Ahrefs crawler + site-audit bot: block entirely (heavy scraper
        # that burns CPU on deep-crawl re-hits; nothing in it for SEO).
        'User-agent: AhrefsBot\n'
        'Disallow: /\n'
        '\n'
        'User-agent: AhrefsSiteAudit\n'
        'Disallow: /\n'
        '\n'
        f'Sitemap: {seo.site_base()}/sitemap.xml\n'
    )
    resp = make_response(robots, 200, {'Content-Type': 'text/plain'})
    resp.headers['Cache-Control'] = 'public, max-age=86400'
    return resp


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
#   https://epitaka.org/app/{lang}/{bookId}/{heading-slug}#{paraId}-{lineId}
# (canonical) or the legacy https://epitaka.org/app/{bookId}/{paraId}/{lineId}.
#
# When clicked on a device with the app installed, the OS intercepts the link
# (via Android App Links / iOS Universal Links) and opens the app directly.
#
# When the app is NOT installed, this page serves as a fallback that:
# 1. Tries to open the app via the epitaka:// custom scheme
# 2. Redirects to the web version if the app can't be opened
#
# NOTE: the #paraId-lineId fragment never reaches the server. The interstitial
# template reads window.location.hash client-side and re-appends it to the web
# fallback / custom-scheme URI, so the exact passage survives (see DEEP_LINKS.md).

@bp.route('/app/reader/<book_id>')
def legacy_app_reader_redirect(book_id):
    """Redirect old /app/reader/{bookId} universal links to the plain
    /app/{bookId} form (preserving ?paraId=…&lineId=…), so they flow
    through the same interstitial handling as the rest of the legacy links.
    """
    qs = request.query_string.decode() if request.query_string else ''
    return redirect(f'/app/{book_id}?{qs}' if qs else f'/app/{book_id}')


@bp.route('/app/')
@bp.route('/app/<book_id>')
@bp.route('/app/<book_id>/<int:para_id>')
@bp.route('/app/<book_id>/<int:para_id>/<int:line_id>')
@bp.route('/app/<lang>/<book_id>')
@bp.route('/app/<lang>/<book_id>/<path:section_path>')
def app_share_link(lang=None, book_id=None, para_id=None, line_id=None, section_path=None):
    """
    Interstitial page for mobile app share links.

    URL patterns:
      Canonical: /app/{lang}/{book_id}[/{heading-slug}]#{paraId}-{lineId}
      Legacy:    /app/{book_id}[/{para_id}[/{line_id}]]

    The heading slug is carried in the path (matched as section_path); the
    exact passage (#paraId-lineId) is carried in the URL fragment, which is
    handled client-side by the template.

    Renders a page that:
    - Attempts to open the app via epitaka:// custom scheme
    - Falls back to /{lang}/book/{book_id}[/{slug}]#{paraId}-{lineId} on the web
    """
    # Legacy links have no language prefix; canonical ones do. Flask routes
    # the legacy int-segment forms (/app/{bookId}/{paraId}/{lineId}) to this
    # handler with lang=None, so only canonical links set a lang here.
    if lang is not None and lang not in Config.detect_translations():
        # Not a real translation language (e.g. an old bookId-first link) —
        # fall back to the default-language home.
        return redirect(f'/{Config.DEFAULT_LANG}/')

    if not book_id:
        return redirect(f'/{Config.DEFAULT_LANG}/')

    # The app also emits /app/search?q=… deep links, but search lives in the
    # home-dialog on the web (no standalone search URL) — send those to the
    # language home instead of rendering a bogus book interstitial.
    if book_id == 'search':
        return redirect(f'/{lang or Config.DEFAULT_LANG}/')

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

    # ── Web fallback base (fragment appended client-side) ────────────
    web_lang = lang or Config.DEFAULT_LANG
    web_fallback = f'{Config.BASE_URL}/{web_lang}/book/{book_id}'
    if section_path:
        web_fallback += f'/{section_path}'
    # Legacy path segments carry the position; encode it into the fragment
    # (#paraId or #paraId-lineId) so the reader lands on the exact passage.
    if para_id is not None:
        web_fallback += f'#{para_id}'
        if line_id is not None:
            web_fallback += f'-{line_id}'

    # ── Custom scheme URI base (para/line appended client-side from the
    #    fragment for canonical links; from path segments for legacy) ──
    custom_scheme_uri = f'epitaka://reader/{book_id}'
    if lang is None and para_id is not None:
        custom_scheme_uri += f'?paraId={para_id}'
        if line_id is not None:
            custom_scheme_uri += f'&lineId={line_id}'

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


# ── Study guides (AI summaries) ────────────────────────────────────────────
# The study pipeline (translator/study_builder.py) writes one study guide per
# level-10 section into the `summaries` table of epitaka_en.db. Three
# surfaces expose them:
#   /<lang>/study/<book_id>/<slug>        full SEO page for one study guide
#   /<lang>/book/<book_id>/outline        the book's outline (all sections)
#   /api/study/<book_id>/<section_id>     JSON for the in-book popup
# Guides are English content, so all three canonicalise to /en/… (non-en
# prefixes 301 to /en, and hreflang is emitted for en + x-default only).

@bp.route('/<lang>/study/<book_id>/<slug>')
def study_guide(lang, book_id, slug):
    """Server-rendered SEO page for a single study guide."""
    translations = Config.detect_translations()
    if lang not in translations:
        return redirect(Config.BASE_URL + '/' + Config.DEFAULT_LANG + '/')
    if lang != Config.DEFAULT_LANG:
        return redirect(seo.absolute(f'/{Config.DEFAULT_LANG}/study/{book_id}/{slug}'), code=301)

    book_id = book_id.replace('_chunks', '')
    cache_key = ('study', book_id, slug, get_asset_version())
    cached = _STUDY_PAGE_CACHE.get(cache_key)
    if cached is not None:
        return make_response(cached)

    # Resolve slug → summary (slugs end with -{section_id}; verify, else scan).
    target = None
    tail = slug.rsplit('-', 1)[-1] if '-' in slug else ''
    if tail.isdigit():
        row = summaries_svc.get_summary(book_id, int(tail))
        if row and summaries_svc.summary_slug(row) == slug:
            target = row
    if target is None:
        for row in summaries_svc.get_all_summaries(book_id):
            if summaries_svc.summary_slug(row) == slug:
                target = row
                break
    if target is None:
        abort(404)

    hierarchy = load_hierarchy()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        brow = cursor.fetchone()
        if not brow:
            abort(404)
        book_title = brow['book_name']
        # Enclosing-section slugs for every cited (book, para) so citation
        # links open the reader on the section page, not an empty book page.
        citation_slugs = build_slug_map(
            conn, list(summaries_svc.extract_citation_pairs(target['content'])))

    section_id = target['section_id']
    # Link to the enclosing (parent-heading) section page so the reader
    # renders it open, then scroll to the numbered item via the hash.
    parent_slug = citation_slugs.get((book_id, section_id)) if citation_slugs else None
    section_url = None
    if parent_slug:
        section_url = seo.absolute(
            f'/{Config.DEFAULT_LANG}/book/{book_id}/{parent_slug}#{section_id}')
    book_url    = seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}')
    outline_url = seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}/outline')
    page_url    = seo.absolute(f'/{Config.DEFAULT_LANG}/study/{book_id}/{slug}')
    home_url    = seo.absolute(f'/{Config.DEFAULT_LANG}/')

    content_html = summaries_svc.render_study_markdown(
        target['content'], book_id, Config.DEFAULT_LANG, citation_slugs)
    plain = summaries_svc.study_plain_text(target['content'])

    # Prev / next in section order
    ordered = summaries_svc.get_all_summaries(book_id)
    idx = next((i for i, s in enumerate(ordered)
                if s['section_id'] == section_id), None)
    prev_s, next_s = None, None
    if idx is not None:
        if idx > 0:
            prev_s = ordered[idx - 1]
        if idx + 1 < len(ordered):
            next_s = ordered[idx + 1]

    def _nav_url(row):
        return seo.absolute(
            f'/{Config.DEFAULT_LANG}/study/{book_id}/{summaries_svc.summary_slug(row)}')

    summary_title = target['title'] or target['heading_title'] or 'Study Guide'
    seo_title = seo.study_seo_title(book_id, summary_title, book_title)
    meta_description = seo.study_seo_description(summary_title, book_title, plain)
    jsonld = seo.study_jsonld(
        book_id, summary_title, book_title, page_url, home_url, book_url,
        sutta_title=target.get('sutta_title') or None,
        section_url=section_url,
    )

    sources = []
    try:
        raw_sources = json.loads(target.get('sources') or '[]')
    except (TypeError, ValueError):
        raw_sources = []
    for sid in raw_sources:
        info = hierarchy.get(sid, {})
        sources.append({'book_id': sid, 'book_name': info.get('book_name', sid)})

    lang_info = translations[Config.DEFAULT_LANG]
    html = render_template(
        'study.html',
        book_id=book_id,
        book_title=book_title,
        english_name=seo.english_book_name(book_id),
        summary=target,
        summary_title=summary_title,
        content_html=content_html,
        seo_title=seo_title,
        meta_description=meta_description,
        canonical_url=page_url,
        page_url=page_url,
        home_url=home_url,
        book_url=book_url,
        outline_url=outline_url,
        section_url=section_url,
        study_jsonld=jsonld,
        sources=sources,
        prev_s=prev_s,
        next_s=next_s,
        prev_url=_nav_url(prev_s) if prev_s else None,
        next_url=_nav_url(next_s) if next_s else None,
        prev_title=(prev_s.get('title') or prev_s.get('heading_title') or '') if prev_s else '',
        next_title=(next_s.get('title') or next_s.get('heading_title') or '') if next_s else '',
        sutta_title=target.get('sutta_title') or '',
        vagga_title=target.get('vagga_title') or '',
        model=target.get('model') or '',
        base_url=Config.BASE_URL,
        site_url=seo.site_base(),
        lang=Config.DEFAULT_LANG,
        lang_info=lang_info,
        available_langs=[translations[code] for code in sorted(translations.keys())],
    )
    _STUDY_PAGE_CACHE.set(cache_key, html)
    return make_response(html)


# ── Outline helpers (shared by the outline page route, the sidebar JSON
#    API, and the per-section inline outline in the book reader) ────────────

def _book_outline_items(conn, book_id):
    """
    The sections that make up a book's outline, in document order.

    Books normally have numbered (level-10) sections; some books (grammars,
    anthologies, saṅgāyana summaries) only have level 2–6 headings — for
    those, fall back to the headings themselves so every book gets a
    non-empty outline.

    Returns [{'para_id', 'title', 'level', 'sutta_title', 'vagga_title'}, ...]
    where vagga (level 2) / sutta (level 4) are resolved via the parent
    chain (a level-2/4 heading is its own group when no ancestor exists).
    """
    cursor = conn.cursor()
    cursor.execute('''
        SELECT para_id, level, title, parent FROM headings
        WHERE book_id = ? AND level = 10
        ORDER BY para_id
    ''', (book_id,))
    items = cursor.fetchall()
    if not items:
        cursor.execute('''
            SELECT para_id, level, title, parent FROM headings
            WHERE book_id = ? AND level BETWEEN 2 AND 6
            ORDER BY para_id
        ''', (book_id,))
        items = cursor.fetchall()
    if not items:
        return []

    cursor.execute('''
        SELECT para_id, level, title, parent FROM headings
        WHERE book_id = ? AND level < 10
    ''', (book_id,))
    parents = {r['para_id']: r for r in cursor.fetchall()}

    def _ancestor_titles(pid, target_levels):
        """Walk the parent chain, collecting the title of each target level."""
        found = {}
        seen = set()
        while pid and pid not in seen and pid in parents:
            seen.add(pid)
            h = parents[pid]
            if h['level'] in target_levels:
                found[h['level']] = h['title'] or ''
            pid = h['parent']
        return found

    out = []
    for it in items:
        level = it['level']
        own = it['title'] or ''
        anc = _ancestor_titles(it['parent'], (2, 4))
        out.append({
            'para_id':     it['para_id'],
            'title':       own,
            'level':       level,
            # A level-2/4 heading acts as its own vagga/sutta group; deeper
            # headings inherit from their level-2/4 ancestor instead.
            'vagga_title': own if level == 2 else anc.get(2, ''),
            'sutta_title': own if level == 4 else anc.get(4, ''),
        })
    return out


def _group_outline(items):
    """Group outline items vagga (level 2) → sutta (level 4) → items."""
    groups = []
    vagga = None
    sutta = None
    for sec in items:
        if sec['vagga_title'] != (vagga['title'] if vagga else None):
            vagga = {'title': sec['vagga_title'], 'suttas': []}
            groups.append(vagga)
            sutta = None
        if sec['sutta_title'] != (sutta['title'] if sutta else None):
            sutta = {'title': sec['sutta_title'], 'sections': []}
            vagga['suttas'].append(sutta)
        sutta['sections'].append(sec)
    return groups


def _enrich_outline(groups, book_id, summary_map, slug_map=None):
    """Add per-item book URLs and (when a study guide exists) study URLs.

    Level-10 (numbered) items deep-link to their enclosing level<10 section
    with a #para_id hash — the reader renders that section open and scrolls
    to the item. Level 2–6 headings (books without numbered sections) link
    to their own section page.
    """
    for g in groups:
        for st in g['suttas']:
            for item in st['sections']:
                pid = item['para_id']
                if item.get('level') == 10:
                    parent_slug = (slug_map or {}).get((book_id, pid)) or ''
                    if parent_slug:
                        item['book_url'] = seo.absolute(
                            f'/{Config.DEFAULT_LANG}/book/{book_id}/{parent_slug}#{pid}')
                        item.pop('level', None)
                        sm = summary_map.get(pid)
                        item['study_url'] = seo.absolute(
                            f'/{Config.DEFAULT_LANG}' + sm['url_path']) if sm else None
                        item['study_title'] = sm['title'] if sm else ''
                        continue
                slug = (item['title'].lower().replace(' ', '-') + '-' + str(pid)) \
                    if item['title'] else str(pid)
                item['book_url'] = seo.absolute(
                    f'/{Config.DEFAULT_LANG}/book/{book_id}/{slug}')
                sm = summary_map.get(pid)
                item['study_url'] = seo.absolute(
                    f'/{Config.DEFAULT_LANG}' + sm['url_path']) if sm else None
                item['study_title'] = sm['title'] if sm else ''
                item.pop('level', None)
    return groups


@bp.route('/<lang>/book/<book_id>/outline')
def outline(lang, book_id):
    """Server-rendered outline of every section of a book, with links to each
    section's study guide (when one exists) and to the section in the book."""
    translations = Config.detect_translations()
    if lang not in translations:
        return redirect(Config.BASE_URL + '/' + Config.DEFAULT_LANG + '/')
    if lang != Config.DEFAULT_LANG:
        return redirect(seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}/outline'), code=301)

    book_id = book_id.replace('_chunks', '')
    cache_key = ('outline', book_id, get_asset_version())
    cached = _OUTLINE_PAGE_CACHE.get(cache_key)
    if cached is not None:
        return make_response(cached)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        brow = cursor.fetchone()
        if not brow:
            abort(404)
        book_title = brow['book_name']
        items = _book_outline_items(conn, book_id)
        slug_map = build_slug_map(conn, [(book_id, it['para_id']) for it in items])

    summary_map = summaries_svc.book_summary_map(book_id)
    groups = _enrich_outline(_group_outline(items), book_id, summary_map, slug_map)

    page_url = seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}/outline')
    book_url = seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}')
    home_url = seo.absolute(f'/{Config.DEFAULT_LANG}/')
    english_name = seo.english_book_name(book_id)

    html = render_template(
        'outline.html',
        book_id=book_id,
        book_title=book_title,
        english_name=english_name,
        seo_title=seo.outline_seo_title(book_id, book_title),
        meta_description=seo.outline_seo_description(book_id, book_title),
        canonical_url=page_url,
        page_url=page_url,
        home_url=home_url,
        book_url=book_url,
        groups=groups,
        summary_count=len(summary_map),
        base_url=Config.BASE_URL,
        site_url=seo.site_base(),
        lang=Config.DEFAULT_LANG,
        lang_info=translations[Config.DEFAULT_LANG],
        available_langs=[translations[code] for code in sorted(translations.keys())],
    )
    _OUTLINE_PAGE_CACHE.set(cache_key, html)
    return make_response(html)


@bp.route('/api/outline/<book_id>')
def api_outline(book_id):
    """JSON outline for the book-page sidebar Outline panel.

    Same data as the /book/<id>/outline page (grouped vagga → sutta →
    sections, each with its book + study-guide URLs), so the panel and the
    SEO page never drift apart.
    """
    book_id = book_id.replace('_chunks', '')
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        brow = cursor.fetchone()
        if not brow:
            return jsonify({'error': 'not found'}), 404
        items = _book_outline_items(conn, book_id)
        slug_map = build_slug_map(conn, [(book_id, it['para_id']) for it in items])
    summary_map = summaries_svc.book_summary_map(book_id)
    groups = _enrich_outline(_group_outline(items), book_id, summary_map, slug_map)
    return jsonify({
        'book_id':      book_id,
        'book_title':   brow['book_name'],
        'english_name': seo.english_book_name(book_id),
        'outline_url':  seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}/outline'),
        'groups':       groups,
        'summary_count': len(summary_map),
    })


@bp.route('/api/study/<book_id>/<int:section_id>')
@rate_limit(120, 60)
def api_study_section(book_id, section_id):
    """JSON for the in-book study popup (rendered HTML + title + full URL)."""
    row = summaries_svc.get_summary(book_id, section_id)
    if row is None:
        return jsonify({'error': 'not found'}), 404
    lang = request.args.get('lang', '').strip() or Config.DEFAULT_LANG
    if lang not in Config.detect_translations():
        lang = Config.DEFAULT_LANG
    with get_db() as conn:
        citation_slugs = build_slug_map(
            conn, list(summaries_svc.extract_citation_pairs(row.get('content') or '')))
    return jsonify({
        'book_id':      book_id,
        'section_id':   section_id,
        'title':        row.get('title') or '',
        # Server-rendered HTML for web embeds AND the raw markdown so the
        # mobile app can render citations client-side with its own markdown
        # widget (which turns [book:para:line] into tap-to-preview links).
        'content_html': summaries_svc.render_study_markdown(
            row.get('content') or '', book_id, lang, citation_slugs),
        'content_md':   row.get('content') or '',
        'url': seo.absolute(
            f'/{Config.DEFAULT_LANG}/study/{book_id}/{summaries_svc.summary_slug(row)}'),
    })


# ── Book page ──────────────────────────────────────────────────────────────

@bp.route('/<lang>/book/<book_id>')
@bp.route('/<lang>/book/<book_id>/<path:section_path>')
def book(lang, book_id, section_path=None):
    """Book page with TOC, optionally with expanded section for SEO."""
    translations = Config.detect_translations()

    if lang not in translations:
        return redirect(Config.BASE_URL + '/' + Config.DEFAULT_LANG + '/')

    book_id = book_id.replace('_chunks', '')

    # Serve the cached render for identical URLs (crawlers hammer the same
    # deep section links). Keyed on asset version too, so a deploy can never
    # serve pages pointing at old bundles beyond the TTL.
    cache_key = (lang, book_id, section_path, get_asset_version())
    cached_html = _BOOK_PAGE_CACHE.get(cache_key)
    if cached_html is not None:
        return make_response(cached_html)

    lang_info = translations[lang]
    hierarchy = load_hierarchy()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT book_name FROM books WHERE book_id = ?', (book_id,))
        row = cursor.fetchone()
        book_exists = row is not None
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
        # ── Inline section outline: the level-10 numbered items inside the
        #    active section, listed at the top of its content so readers can
        #    see (and jump to) the section's structure ──
        section_outline_rows = []
        if active_para_id:
            cursor.execute('''
                SELECT COALESCE(
                    (SELECT MIN(para_id) FROM headings
                     WHERE book_id = ? AND para_id > ? AND level <= 6),
                    999999999
                ) AS end_para
            ''', (book_id, active_para_id))
            end_para = cursor.fetchone()['end_para']
            cursor.execute('''
                SELECT para_id, title FROM headings
                WHERE book_id = ? AND level = 10
                  AND para_id >= ? AND para_id < ?
                ORDER BY para_id
            ''', (book_id, active_para_id, end_para))
            section_outline_rows = cursor.fetchall()

    if not book_exists:
        # Unknown book_id (bots probing junk paths) — 404 immediately
        # instead of rendering a full page around 'Unknown Book'.
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

    # ── SEO: English display name + breadcrumb path to the active section ──
    english_name = seo.english_book_name(book_id)

    # Walk the TOC once, keeping the most recent heading per level up to the
    # active section, so the full path (book › sutta › … › section) can go
    # into the H1, <title>, meta description, and BreadcrumbList schema.
    # The level-1 heading is skipped — it's the Pāli book title, already
    # covered by the English book name that leads the path.
    section_path = []
    section_title = None
    if active_para_id:
        last_by_level = {}
        target_level = None
        for item in toc:
            if item['para_id'] == active_para_id:
                target_level = item['level']
                last_by_level[target_level] = item
                break
            if item['para_id'] > active_para_id:
                break
            last_by_level[item['level']] = item
        if target_level is not None:
            path_items = []
            for lvl in sorted(k for k in last_by_level if k <= target_level):
                item = last_by_level[lvl]
                if item['level'] == 1:
                    continue  # covered by the English book name below
                slug = (item['title'].lower().replace(' ', '-') + '-' + str(item['para_id'])) if item['title'] else ''
                path_items.append({
                    'title': item['title'],
                    'translation': None,
                    'url': seo.absolute(f'/{lang}/book/{book_id}/{slug}') if (item['has_content'] and slug) else None,
                })
            if path_items:
                # Lead the path with the English book name (the level-1 Pāli
                # heading was skipped above as redundant with it).
                section_path = [{
                    'title': english_name or book_title,
                    'translation': None,
                    'url': seo.absolute(f'/{lang}/book/{book_id}'),
                }] + path_items
                section_title = section_path[-1]['title']
                # Translation of the section's own heading sentence.
                leaf_translation = seo.clean_translation(heading_translation) if heading_translation else None
                section_path[-1]['translation'] = leaf_translation

    # ── Canonical: deep-section pages are self-canonical so each passage
    #    URL is indexed with its own metadata instead of collapsing onto
    #    the book page (previously every /book/D-i/<slug> canonicalised to
    #    /book/D-i, which is why all the book's links shared one title /
    #    description in search results).
    canonical_url = seo.absolute(f'/{lang}/book/{book_id}')
    canonical_slug = None
    if section_title and active_para_id:
        canonical_slug = (section_title.lower().replace(' ', '-') + '-' + str(active_para_id))
        canonical_url = seo.absolute(f'/{lang}/book/{book_id}/{canonical_slug}')
    page_url = canonical_url
    home_url = seo.absolute(f'/{lang}/')

    # Path display strings for metadata: "book › sutta" (excluding the
    # section itself, which leads the title) and the section's first
    # translated sentence as a unique excerpt.
    path_titles = [p['title'] for p in section_path]
    context_titles = path_titles[:-1] if path_titles else []  # book › sutta (excl. section)
    section_excerpt = None
    if section_content:
        first = section_content[0]
        section_excerpt = seo.strip_html(first.get('translation', '')) or None
    leaf_translation = section_path[-1]['translation'] if section_path else None

    seo_title = seo.book_seo_title(
        book_id, book_title, lang, lang_info['native_name'],
        section_title=section_title,
        section_translation=leaf_translation,
        section_path_titles=context_titles or None)
    meta_description = seo.book_seo_description(
        book_id, book_title, lang, lang_info['english_name'],
        section_title=section_title,
        section_translation=leaf_translation,
        section_path=' › '.join(context_titles) or None,
        section_excerpt=section_excerpt)
    book_ld = seo.book_jsonld(
        book_id, book_title, lang, page_url, home_url,
        book_url=seo.absolute(f'/{lang}/book/{book_id}'),
        # book_jsonld already emits the book as breadcrumb position 2, so
        # hand it the headings only (drop the leading book element).
        section_path=(section_path[1:] if len(section_path) > 1 else None))

    # Study-guide icons: which para_ids in this book have a summary, plus the
    # outline page URL (the “Outline” tab in the top bar).
    summary_map = summaries_svc.book_summary_map(book_id)
    outline_url = seo.absolute(f'/{Config.DEFAULT_LANG}/book/{book_id}/outline')

    # Inline outline of the open section (numbered items, each with its
    # study-guide link when one exists). Anchored to the para-group ids the
    # template renders, so the browser jumps to the item natively.
    section_outline = []
    for r in section_outline_rows:
        sm = summary_map.get(r['para_id'])
        section_outline.append({
            'para_id':     r['para_id'],
            'title':       r['title'] or '',
            'study_url':   seo.absolute(f'/{Config.DEFAULT_LANG}' + sm['url_path']) if sm else None,
            'study_title': sm['title'] if sm else '',
        })

    html = render_template(
        'book.html',
        book_id=book_id,
        book_title=book_title,
        english_name=english_name,
        seo_title=seo_title,
        site_url=seo.site_base(),
        home_url=home_url,
        page_url=page_url,
        book_jsonld=book_ld,
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
        section_slug_canonical=canonical_slug,
        section_path=section_path,
        section_content=section_content,
        heading_translation=heading_translation,
        section_has_content=section_has_content,
        book_links_by_line=book_links_by_line,
        summary_map=summary_map,
        outline_url=outline_url,
        section_outline=section_outline,
        firebase_config=Config.FIREBASE_CONFIG,
    )
    _BOOK_PAGE_CACHE.set(cache_key, html)
    return make_response(html)


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


# ── Library menu API ──────────────────────────────────────────────────────
# Served to the client so the book-page sidebar and home dialog can build
# the library tree without embedding the (large) menu JSON in every HTML
# render — keeps page HTML small and cache-friendly.

@bp.route('/api/menu')
def api_menu():
    hierarchy = load_hierarchy()
    return jsonify({
        'menu': organize_hierarchy(hierarchy),
        # Flat map used by the search filter (pitaka / layer chips):
        #   {book_id: {nikaya, category, book_name}}
        'hierarchy': {
            bid: {
                'nikaya':    h.get('nikaya'),
                'category':  h.get('category'),
                'book_name': h.get('book_name'),
            }
            for bid, h in hierarchy.items()
        },
    })


# ── Suggest / search API ───────────────────────────────────────────────────

@bp.route('/api/suggest_word')
@rate_limit(60, 60)
def suggest_word():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    from ..services.dictionary import suggest_words
    return jsonify(suggest_words(query))


@bp.route('/api/search_headings')
@rate_limit(60, 60)
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
@rate_limit(60, 60)
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
@rate_limit(60, 60)
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
        site_url=seo.site_base(),
        page_url=seo.absolute('/about'),
    )


# ── Privacy policy ─────────────────────────────────────────────────────────

@bp.route('/privacy')
def privacy():
    """Privacy policy page."""
    return render_template(
        'privacy.html',
        base_url=Config.BASE_URL,
        site_url=seo.site_base(),
        page_url=seo.absolute('/privacy'),
    )

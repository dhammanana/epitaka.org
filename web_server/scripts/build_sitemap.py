#!/usr/bin/env python3
"""
Build sitemap.xml and per-book sitemaps for epitaka.org.

Generates:
  sitemap.xml                  — Sitemap index pointing to per-book sitemaps
  sitemaps/book_<book_id>.xml  — Per-book sitemaps with heading URLs

Each heading URL includes `<xhtml:link rel="alternate" hreflang="...">`
entries for every available translation language, so search engines
understand the language variants of each page.

Usage:
    cd web_server && python3 scripts/build_sitemap.py
    # BASE_URL defaults to https://epitaka.org; override to build for another
    # origin (e.g. staging):
    BASE_URL=https://staging.example.org python3 scripts/build_sitemap.py

Every generated <loc> and xhtml:link href is absolute — the sitemap protocol
requires it — and the build fails (non-zero exit) if any relative URL slips in.
"""
import datetime
import os
import re
import sys
import sqlite3
from xml.sax.saxutils import escape as xml_escape

# ── Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR   = os.path.join(SCRIPT_DIR, 'data')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, 'sitemaps')        # per-book sitemaps
EPITAKA_DB = os.path.join(DATA_DIR, 'epitaka.db')
# AI study guides live in the `summaries` table of the English translation
# DB (epitaka_en.db) — no separate summary DB to deploy.
SUMMARY_DB = os.path.join(DATA_DIR, 'epitaka_en.db')

# Canonical public origin. BASE_URL env var overrides it; when unset we fall
# back to the production domain so generated sitemaps always carry absolute,
# spec-valid URLs (the sitemap protocol requires absolute <loc> values —
# relative ones previously shipped and made the whole index invalid).
CANONICAL_BASE_URL = 'https://epitaka.org'


def _resolve_base_url() -> str:
    """Return the absolute origin used in every generated URL.

    Prefers the BASE_URL env var; otherwise falls back to CANONICAL_BASE_URL.
    Exits non-zero when the value is not an absolute http(s) origin, because a
    relative origin silently produces an invalid sitemap.
    """
    base = (os.environ.get('BASE_URL') or CANONICAL_BASE_URL).strip().rstrip('/')
    if not re.match(r'^https?://[^/]+', base):
        print(f"ERROR: BASE_URL must be an absolute http(s) origin, got {base!r}")
        sys.exit(1)
    return base


BASE_URL = _resolve_base_url()

# ── Language sorting ───────────────────────────────────────────────────────
# Default language listed first, remaining sorted alphabetically
LANG_PRIORITY = ['en', 'si', 'th', 'lo', 'my', 'vi', 'ta', 'zh', 'hi', 'ja',
                 'ko', 'km', 'de', 'fr', 'es', 'pt', 'it', 'ru', 'id']


# ── Helpers ────────────────────────────────────────────────────────────────

def slug_from_title(title: str, para_id: int) -> str:
    """Build the URL slug exactly as the Jinja template does:
    title.lower().replace(' ', '-') + '-' + para_id
    """
    if not title:
        return str(para_id)
    slug_part = title.lower().replace(' ', '-')
    # Remove characters that are problematic in URLs but keep Unicode
    slug_part = re.sub(r'[^\w\s\-]', '', slug_part, flags=re.UNICODE)
    slug_part = re.sub(r'-+', '-', slug_part).strip('-')
    return f"{slug_part}-{para_id}"


def sanitize_book_id(book_id: str) -> str:
    """Sanitize book_id for use as a filename component.
    Replace characters like | that are invalid in filenames.
    """
    safe = book_id.replace('|', '_')
    safe = re.sub(r'[^\w\.\-]', '_', safe)
    return safe


def open_epitaka_db():
    """Open epitaka.db."""
    if not os.path.isfile(EPITAKA_DB):
        print(f"ERROR: epitaka.db not found at {EPITAKA_DB}")
        sys.exit(1)
    conn = sqlite3.connect(EPITAKA_DB)
    conn.row_factory = sqlite3.Row
    return conn


def detect_translations():
    """Detect available translation databases in DATA_DIR.

    Returns a list of language codes sorted by priority.
    """
    pattern = re.compile(r'^_?epitaka_([a-z]{2})(?:_(.+))?\.db$')
    codes = set()

    if not os.path.isdir(DATA_DIR):
        return ['en']  # fallback

    for fname in os.listdir(DATA_DIR):
        match = pattern.match(fname)
        if match:
            codes.add(match.group(1))

    # Sort: priority languages first, rest alphabetically
    sorted_codes = [c for c in LANG_PRIORITY if c in codes]
    remaining = sorted(c for c in codes if c not in LANG_PRIORITY)
    return sorted_codes + remaining


def build_section_url(lang: str, book_id: str, slug: str) -> str:
    """Build the full URL for a section heading."""
    return f"{BASE_URL}/{lang}/book/{book_id}/{slug}"


def study_slug_from_title(title: str, section_id: int) -> str:
    """
    URL slug for a study-guide page — must match app/services/summaries.py's
    summary_slug() exactly.
    """
    base = re.sub(r'^Study Guide[\s:\-\u2013\u2014]*', '', title or '', flags=re.IGNORECASE)
    base = re.sub(r'\([^)]*\)', '', base)          # drop (…) parentheticals
    base = re.sub(r'\[[^\]]*\]', '', base)          # drop [citation] spans
    base = re.sub(r'[^\w\s\-]', '', base, flags=re.UNICODE).strip()
    base = re.sub(r'\s+', '-', base).strip('-')
    base = re.sub(r'-+', '-', base)[:60].rstrip('-').lower()
    if not base:
        base = 'study-guide'
    return f'{base}-{section_id}'


def write_study_sitemap(book_id: str, summaries: list, langs: list[str]):
    """
    Per-book sitemap for study-guide pages: the outline URL plus every
    summary URL (English-only content → /en/…, no hreflang alternates).
    """
    safe_id = sanitize_book_id(book_id)
    filename = f'study_{safe_id}.xml'
    filepath = os.path.join(OUTPUT_DIR, filename)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    # Outline hub page
    lines.append('  <url>')
    lines.append(f'    <loc>{xml_escape(f"{BASE_URL}/en/book/{book_id}/outline")}</loc>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.7</priority>')
    lines.append('  </url>')

    for s in summaries:
        slug = study_slug_from_title(s['title'] or s['heading_title'] or '', s['section_id'])
        url = f'{BASE_URL}/en/study/{book_id}/{slug}'
        lastmod = (s['updated_at'] or '')[:10]
        lines.append('  <url>')
        lines.append(f'    <loc>{xml_escape(url)}</loc>')
        if lastmod:
            lines.append(f'    <lastmod>{xml_escape(lastmod)}</lastmod>')
        lines.append('    <changefreq>weekly</changefreq>')
        lines.append('    <priority>0.8</priority>')
        lines.append('  </url>')

    lines.append('</urlset>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'  ✓ {filename}: {len(summaries) + 1} URLs (outline + {len(summaries)} study guides)')


# ── XML generators ─────────────────────────────────────────────────────────

def write_pages_sitemap(langs: list[str]):
    """Sitemap for the site's own pages: every language home page, every
    language's full-canon index, and the (English) ebook download page.

    Home and canon URLs carry hreflang alternates so their language variants
    are grouped; the download page is English-only (en + x-default).
    """
    filename = 'pages.xml'
    filepath = os.path.join(OUTPUT_DIR, filename)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]

    def alt_links(path_template, hreflangs, x_default):
        links = [f'    <xhtml:link rel="alternate" hreflang="x-default" '
                 f'href="{xml_escape(BASE_URL + x_default)}"/>']
        for code in hreflangs:
            href = BASE_URL + path_template.format(lang=code)
            links.append(f'    <xhtml:link rel="alternate" hreflang="{xml_escape(code)}" '
                         f'href="{xml_escape(href)}"/>')
        return links

    for lang in langs:
        lines.append('  <url>')
        lines.append(f'    <loc>{xml_escape(BASE_URL + f"/{lang}/")}</loc>')
        lines += alt_links('/{lang}/', langs, '/en/')
        lines.append('    <changefreq>weekly</changefreq>')
        lines.append('    <priority>1.0</priority>')
        lines.append('  </url>')

    for lang in langs:
        lines.append('  <url>')
        lines.append(f'    <loc>{xml_escape(BASE_URL + f"/{lang}/canon")}</loc>')
        lines += alt_links('/{lang}/canon', langs, '/en/canon')
        lines.append('    <changefreq>weekly</changefreq>')
        lines.append('    <priority>0.9</priority>')
        lines.append('  </url>')

    lines.append('  <url>')
    lines.append(f'    <loc>{xml_escape(BASE_URL + "/en/download")}</loc>')
    lines.append('    <xhtml:link rel="alternate" hreflang="x-default" '
                 f'href="{xml_escape(BASE_URL + "/en/download")}"/>')
    lines.append('    <xhtml:link rel="alternate" hreflang="en" '
                 f'href="{xml_escape(BASE_URL + "/en/download")}"/>')
    lines.append('    <changefreq>monthly</changefreq>')
    lines.append('    <priority>0.8</priority>')
    lines.append('  </url>')

    lines.append('</urlset>')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'  ✓ {filename}: home + canon per language + download')


def write_sitemap_index(sitemap_files: list[str]):
    """Write the sitemap index XML file to OUTPUT_DIR/../sitemap.xml."""
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    quote_map = {'"': '&quot;'}
    for filename in sorted(sitemap_files):
        loc = f"{BASE_URL}/sitemaps/{xml_escape(filename, quote_map)}"
        lines.append('  <sitemap>')
        lines.append(f'    <loc>{loc}</loc>')
        # lastmod = the sitemap's own mtime (just written by this run), so
        # crawlers know when each child sitemap last changed.
        try:
            mtime = os.path.getmtime(os.path.join(OUTPUT_DIR, filename))
            lastmod = datetime.datetime.fromtimestamp(
                mtime, datetime.timezone.utc).strftime('%Y-%m-%d')
            lines.append(f'    <lastmod>{lastmod}</lastmod>')
        except OSError:
            pass
        lines.append('  </sitemap>')
    lines.append('</sitemapindex>')

    index_path = os.path.join(OUTPUT_DIR, '..', 'sitemap.xml')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"  ✓ Written: sitemap.xml ({len(sitemap_files)} sitemaps referenced)")


def write_book_sitemap(book_id: str, headings: list[dict], langs: list[str]):
    """Write a per-book sitemap XML file.

    Each heading gets one <url> entry (with the default language as <loc>)
    and <xhtml:link> alternates for every available language.

    Also includes <lastmod>, <changefreq>, and <priority> hints.
    """
    safe_id = sanitize_book_id(book_id)
    filename = f"book_{safe_id}.xml"
    filepath = os.path.join(OUTPUT_DIR, filename)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]

    # The book's outline page (English-only, like the study guides) is the
    # hub linking every section to its study guide — always include it so
    # every book's outline is crawlable, not just books with summaries.
    lines.append('  <url>')
    lines.append(f'    <loc>{xml_escape(f"{BASE_URL}/en/book/{book_id}/outline")}</loc>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.7</priority>')
    lines.append('  </url>')

    for h in headings:
        para_id = h['para_id']
        title = h['title'] or ''
        level = h['level'] or 10
        slug = slug_from_title(title, para_id)

        # Priority: deeper heading level = more specific = higher priority
        # Level 1 (book title) = 0.5, Level 6 (deepest) = 0.9
        priority = round(0.5 + (min(level, 6) - 1) * 0.08, 1)
        if priority > 1.0:
            priority = 1.0

        # Default language URL
        default_lang = langs[0]
        default_url = build_section_url(default_lang, book_id, slug)

        lines.append('  <url>')
        lines.append(f'    <loc>{xml_escape(default_url)}</loc>')

        # Alternate language links
        for lang in langs:
            alt_url = build_section_url(lang, book_id, slug)
            hreflang = lang.split('_')[0]  # strip suffix like _nissaya
            lines.append(
                f'    <xhtml:link rel="alternate" '
                f'hreflang="{xml_escape(hreflang)}" '
                f'href="{xml_escape(alt_url)}"/>'
            )

        lines.append('    <changefreq>weekly</changefreq>')
        lines.append(f'    <priority>{priority}</priority>')
        lines.append('  </url>')

    lines.append('</urlset>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    num_urls = len(headings) + 1  # +1 outline page
    num_alt = len(headings) * len(langs)
    print(f"  ✓ {filename}: {num_urls} URLs (incl. outline) × {len(langs)} languages = {num_alt} alternates")


# ── Output validation ──────────────────────────────────────────────────────

_LOC_RE = re.compile(r'<loc>(.*?)</loc>')
_HREF_RE = re.compile(r'href="(.*?)"')


def assert_absolute_urls():
    """Verify every generated <loc> and xhtml:link href is an absolute URL.

    The sitemap protocol requires absolute URLs; a relative value such as
    "/sitemaps/book_Dhp.xml" invalidates the file and crawlers may discard the
    whole index. Fail the build loudly rather than ship one.
    """
    bad = []
    checked = 0
    index_path = os.path.join(OUTPUT_DIR, '..', 'sitemap.xml')
    paths = [index_path] + [
        os.path.join(OUTPUT_DIR, name)
        for name in sorted(os.listdir(OUTPUT_DIR))
        if name.endswith('.xml')
    ]
    for path in paths:
        with open(path, encoding='utf-8') as f:
            content = f.read()
        for url in _LOC_RE.findall(content) + _HREF_RE.findall(content):
            checked += 1
            if not url.startswith(('http://', 'https://')):
                bad.append((os.path.basename(path), url))

    if bad:
        print(f"\nERROR: {len(bad)} relative URL(s) in generated sitemaps "
              f"(all URLs must be absolute):")
        for name, url in bad[:10]:
            print(f"  {name}: {url}")
        if len(bad) > 10:
            print(f"  … and {len(bad) - 10} more")
        print(f"\n  BASE_URL resolved to: {BASE_URL!r}")
        sys.exit(1)

    print(f"  ✓ URL check: all {checked:,} <loc>/href values are absolute")


# ── Main ───────────────────────────────────────────────────────────────────

def build_sitemaps():
    print("=" * 60)
    print("Building sitemaps for epitaka.org")
    print("=" * 60)

    print(f"BASE_URL: {BASE_URL}")
    if not os.environ.get('BASE_URL'):
        print(f"         (env BASE_URL unset — using canonical {CANONICAL_BASE_URL})")
    print()

    # ── Detect translation languages ──────────────────────────────────────
    print("\n[1] Detecting translation languages...")
    langs = detect_translations()
    print(f"    Found {len(langs)} language(s): {', '.join(langs)}")

    # ── Open database ────────────────────────────────────────────────────
    print(f"\n[2] Opening epitaka.db...")
    conn = open_epitaka_db()
    cursor = conn.cursor()
    print(f"    epitaka.db: {os.path.getsize(EPITAKA_DB):,} bytes")

    # ── Get all books ────────────────────────────────────────────────────
    print("\n[3] Fetching books...")
    cursor.execute("""
        SELECT book_id, book_name, para_id, chapter_len
        FROM books
        ORDER BY id
    """)
    books = cursor.fetchall()
    print(f"    {len(books)} books found.")

    # ── Create output directory ──────────────────────────────────────────
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ── Study-guide table (optional — opened once if present) ─────────────
    # The summaries table only exists once study_builder.py has run against
    # this English translation DB; without it, skip study sitemaps quietly.
    sum_conn = None
    if os.path.isfile(SUMMARY_DB):
        try:
            conn_tmp = sqlite3.connect(f'file:{SUMMARY_DB}?mode=ro', uri=True)
            conn_tmp.row_factory = sqlite3.Row
            has_table = conn_tmp.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name='summaries'"
            ).fetchone()
            if has_table:
                sum_conn = conn_tmp
            else:
                conn_tmp.close()
        except sqlite3.Error as exc:
            print(f"    ! study-guide sitemaps skipped (summary DB unreadable): {exc}")
            sum_conn = None

    # ── Generate per-book sitemaps ────────────────────────────────────────
    print("\n[4] Generating per-book sitemaps...")
    sitemap_files = []
    total_urls = 0
    study_urls = 0
    book_count = 0

    for book in books:
        book_id = book['book_id']

        # Fetch headings for this book
        cursor.execute("""
            SELECT para_id, level, title
            FROM headings
            WHERE book_id = ? AND level <= 6
            ORDER BY para_id
        """, (book_id,))
        headings = cursor.fetchall()

        if not headings:
            continue

        # Write the per-book sitemap
        write_book_sitemap(book_id, headings, langs)
        safe_id = sanitize_book_id(book_id)
        sitemap_files.append(f"book_{safe_id}.xml")
        total_urls += len(headings)
        book_count += 1

        # Study-guide sitemap (outline + every summary for this book)
        if sum_conn is not None:
            try:
                rows = sum_conn.execute(
                    'SELECT title, heading_title, section_id, updated_at '
                    'FROM summaries WHERE book_id = ? ORDER BY section_id',
                    (book_id,),
                ).fetchall()
                if rows:
                    write_study_sitemap(book_id, rows, langs)
                    sitemap_files.append(f"study_{safe_id}.xml")
                    study_urls += len(rows)
            except sqlite3.Error as exc:
                print(f"    ! study sitemap for {book_id} skipped: {exc}")

        # Progress indicator for large books
        if book_count % 50 == 0:
            print(f"    ... {book_count}/{len(books)} books processed ({total_urls} URLs so far)")

    if sum_conn is not None:
        sum_conn.close()
    conn.close()

    # ── Site pages (home, canon, download) ───────────────────────────────
    print("\n[5] Generating site-pages sitemap...")
    write_pages_sitemap(langs)
    sitemap_files.append('pages.xml')

    # ── Generate sitemap index ───────────────────────────────────────────
    print("\n[6] Generating sitemap index...")
    write_sitemap_index(sitemap_files)

    # ── Validate: every URL must be absolute ─────────────────────────────
    print("\n[7] Validating generated URLs...")
    assert_absolute_urls()

    # ── Summary ─────────────────────────────────────────────────────────
    print(f"\n{'=' * 60}")
    print(f"Sitemap build complete!")
    print(f"  {book_count} books with headings")
    print(f"  {total_urls:,} heading URLs")
    print(f"  {total_urls * len(langs):,} total alternate links across {len(langs)} languages")
    if study_urls:
        print(f"  {study_urls:,} study-guide URLs (outline + summaries)")
    print(f"  {len(sitemap_files)} per-book sitemap files")
    print(f"  Index file:  {os.path.join(OUTPUT_DIR, '..', 'sitemap.xml')}")
    print(f"  Sitemaps in: {OUTPUT_DIR}/")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    build_sitemaps()

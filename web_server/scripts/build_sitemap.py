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
    # Optionally set BASE_URL if running outside the Flask app:
    BASE_URL=https://epitaka.org python3 scripts/build_sitemap.py
"""
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

# Default base URL — override via BASE_URL env var
BASE_URL = os.environ.get('BASE_URL', '').rstrip('/')

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


# ── XML generators ─────────────────────────────────────────────────────────

def write_sitemap_index(sitemap_files: list[str]):
    """Write the sitemap index XML file to OUTPUT_DIR/../sitemap.xml."""
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for filename in sorted(sitemap_files):
        loc = f"{BASE_URL}/sitemaps/{xml_escape(filename, {'\"': '&quot;'})}"
        lines.append('  <sitemap>')
        lines.append(f'    <loc>{loc}</loc>')
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

    num_urls = len(headings)
    num_alt = num_urls * len(langs)
    print(f"  ✓ {filename}: {num_urls} URLs × {len(langs)} languages = {num_alt} alternates")


# ── Main ───────────────────────────────────────────────────────────────────

def build_sitemaps():
    print("=" * 60)
    print("Building sitemaps for epitaka.org")
    print("=" * 60)

    if not BASE_URL:
        print("WARNING: BASE_URL is not set. Set the BASE_URL env var.")
        print("         URLs will be relative (/path/...).")
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

    # ── Generate per-book sitemaps ────────────────────────────────────────
    print("\n[4] Generating per-book sitemaps...")
    sitemap_files = []
    total_urls = 0
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

        # Progress indicator for large books
        if book_count % 50 == 0:
            print(f"    ... {book_count}/{len(books)} books processed ({total_urls} URLs so far)")

    conn.close()

    # ── Generate sitemap index ───────────────────────────────────────────
    print("\n[5] Generating sitemap index...")
    write_sitemap_index(sitemap_files)

    # ── Summary ─────────────────────────────────────────────────────────
    print(f"\n{'=' * 60}")
    print(f"Sitemap build complete!")
    print(f"  {book_count} books with headings")
    print(f"  {total_urls:,} heading URLs")
    print(f"  {total_urls * len(langs):,} total alternate links across {len(langs)} languages")
    print(f"  {len(sitemap_files)} per-book sitemap files")
    print(f"  Index file:  {os.path.join(OUTPUT_DIR, '..', 'sitemap.xml')}")
    print(f"  Sitemaps in: {OUTPUT_DIR}/")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    build_sitemaps()

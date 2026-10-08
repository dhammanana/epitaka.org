# app/utils/slugs.py
"""Canonical URL slugs for book sections — ONE implementation.

Every URL that points at a section of a book is built here: sitemap <loc>
entries, the page's <link rel="canonical">, the TOC, hreflang alternates,
reference links and the search API. Each of those sites used to slugify on
its own, and they disagreed — the sitemap stripped punctuation
("1-rūpādivaggo-4") while the app kept it ("1.-rūpādivaggo-4") — so 37k
sitemap URLs were not self-canonical and crawlers saw the same passage under
two addresses.

Pure stdlib on purpose: scripts/build_sitemap.py imports this module directly
(by path) and must not drag in the Flask app package.
"""
import re

# Punctuation is dropped; letters, digits, underscore, spaces and hyphens
# survive, so non-ASCII titles (rūpādivaggo, ธรรมบท) keep their diacritics.
_NOT_SLUG = re.compile(r'[^\w\s\-]', re.UNICODE)
_DASHES = re.compile(r'-+')


def slugify(text: str) -> str:
    """Lowercase URL fragment: spaces become '-', punctuation is dropped."""
    if not text:
        return ''
    part = _NOT_SLUG.sub('', str(text).lower().replace(' ', '-'))
    return _DASHES.sub('-', part).strip('-')


def section_slug(title: str, para_id: int) -> str:
    """`{slugified-heading}-{para_id}` — the canonical slug for a section.

    The trailing para_id is what actually identifies the section (routes take
    the number after the last '-'), so the title is decoration. A heading with
    no usable title still gets a resolvable slug: the bare para_id.
    """
    part = slugify(title)
    return f'{part}-{para_id}' if part else str(para_id)

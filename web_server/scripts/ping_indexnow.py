#!/usr/bin/env python3
"""Notify IndexNow about added/updated URLs.

IndexNow is a free, open protocol (Bing, Yandex, Seznam, Naver) that tells
search engines a URL changed so they recrawl it in minutes instead of days.
Bing's index feeds ChatGPT and Copilot, so pinging after a deploy is the
cheapest way to get new pages into AI answers.

Usage:
    # URLs given explicitly:
    INDEXNOW_KEY=<key> python3 scripts/ping_indexnow.py \
        https://epitaka.org/en/canon https://epitaka.org/en/book/Dhp

    # Every URL in the site-pages sitemap (home / canon / download):
    INDEXNOW_KEY=<key> python3 scripts/ping_indexnow.py --sitemap sitemaps/pages.xml

    # Every URL on the whole site, via the sitemap index
    # (sitemap.xml lists sitemaps/book_*.xml + study_*.xml + pages.xml):
    INDEXNOW_KEY=<key> python3 scripts/ping_indexnow.py --sitemap sitemap.xml

    # Repeat --sitemap for several files:
    INDEXNOW_KEY=<key> python3 scripts/ping_indexnow.py \
        --sitemap sitemaps/pages.xml --sitemap sitemaps/book_Dhp.xml

    # Print the payload without sending (no network, no key needed):
    python3 scripts/ping_indexnow.py --dry-run --sitemap sitemaps/pages.xml

Only submit changed URLs on routine deploys. A full-index submit (~46k URLs,
5 requests of 10k) is for first-time indexing or a full rebuild — Bing may
throttle repeated bulk submits.

The key must also be served at https://<host>/<key>.txt — see the
`indexnow_keyfile` route in app/routes/main.py. Set INDEXNOW_KEY in the server
.env so the route and this script agree (defaults to DEFAULT_INDEXNOW_KEY
when the env var is unset; export INDEXNOW_KEY to override).
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ENDPOINT = 'https://api.indexnow.org/indexnow'
MAX_URLS_PER_REQUEST = 10_000  # protocol limit per request
# Default key, used when $INDEXNOW_KEY is unset. The key is public by design
# (IndexNow verifies it via https://<host>/<key>.txt), so shipping it here
# as a fallback is safe; $INDEXNOW_KEY still overrides it.
DEFAULT_INDEXNOW_KEY = '473ae9c09c265e983dd36ed0ec72802b'
_DRY_RUN_PREVIEW_LIMIT = 50  # full JSON only for small lists; summary above that
_LOC_RE = re.compile(r'<loc>\s*(.*?)\s*</loc>', re.DOTALL)


def read_sitemap_urls(path: str, _seen: set[str] | None = None) -> list[str]:
    """Return every page <loc> in a sitemap file (order preserved).

    Sitemap *index* files (sitemap.xml) list other sitemaps instead of pages,
    so they are expanded recursively: each child <loc> like
    https://<host>/sitemaps/book_X.xml is resolved to a local file next to
    the index and read in turn. Missing children are skipped with a warning.
    """
    if _seen is None:
        _seen = set()
    abspath = os.path.abspath(path)
    if abspath in _seen:
        return []
    _seen.add(abspath)
    with open(path, encoding='utf-8') as f:
        content = f.read()
    locs = [u.strip() for u in _LOC_RE.findall(content) if u.strip()]
    if '<sitemapindex' not in content:
        return locs
    base_dir = os.path.dirname(abspath)
    urls: list[str] = []
    for loc in locs:
        child = _loc_to_local_file(loc, base_dir)
        if child and os.path.isfile(child):
            urls += read_sitemap_urls(child, _seen)
        else:
            print(f'  ! warning: sitemap not found locally, skipped: {loc}',
                  file=sys.stderr)
    return urls


def _loc_to_local_file(loc: str, base_dir: str) -> str | None:
    """Map a sitemap-index <loc> to a local file path, or None."""
    parsed = urllib.parse.urlparse(loc)
    # Remote file on another host: cannot resolve locally.
    if parsed.scheme and parsed.netloc:
        rel = parsed.path.lstrip('/')
    else:
        rel = loc
    # Bare filename (book_X.xml) lives in the sitemaps/ dir next to the index.
    if '/' not in rel and base_dir.endswith('sitemaps'):
        return os.path.join(base_dir, os.path.basename(rel))
    candidate = os.path.join(base_dir, rel)
    if os.path.isfile(candidate):
        return candidate
    # Fall back: same basename in a sitemaps/ sibling dir (index at root,
    # children in sitemaps/).
    fallback = os.path.join(base_dir, 'sitemaps', os.path.basename(rel))
    if os.path.isfile(fallback):
        return fallback
    return None


def chunks(seq: list[str], size: int):
    for i in range(0, len(seq), size):
        yield seq[i:i + size]


def submit(host: str, key: str, urls: list[str], dry_run: bool = False) -> int:
    payload = {
        'host': host,
        'key': key,
        'keyLocation': f'https://{host}/{key}.txt',
        'urlList': urls,
    }
    if dry_run:
        if len(urls) <= _DRY_RUN_PREVIEW_LIMIT:
            print(json.dumps(payload, indent=2, ensure_ascii=False))
        else:
            preview = {
                'host': host,
                'key': key,
                'keyLocation': payload['keyLocation'],
                'urlCount': len(urls),
                'firstUrls': urls[:5],
            }
            print(json.dumps(preview, indent=2, ensure_ascii=False))
            print(f'  … ({len(urls)} URLs total, '
                  f'{(len(urls) + MAX_URLS_PER_REQUEST - 1) // MAX_URLS_PER_REQUEST} '
                  f'request(s) of up to {MAX_URLS_PER_REQUEST:,}; '
                  f'full list hidden, {len(urls)} URLs would be sent)')
        return 0

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f'  \u2713 IndexNow: HTTP {resp.status} for {len(urls)} URL(s)')
            return 0
    except urllib.error.HTTPError as exc:
        body = exc.read()[:200]
        print(f'  ! IndexNow returned HTTP {exc.code}: {body!r}')
        return 1
    except urllib.error.URLError as exc:
        print(f'  ! IndexNow request failed: {exc.reason}')
        return 1


def main(argv=None) -> int:
    p = argparse.ArgumentParser(
        description='Ping IndexNow about changed URLs.')
    p.add_argument('urls', nargs='*', help='URLs to submit')
    p.add_argument('--sitemap', action='append', dest='sitemaps', default=[],
                   help='read URLs from this sitemap file; repeatable; '
                        'a sitemap index (sitemap.xml) is expanded to all '
                        'its child sitemaps')
    p.add_argument('--host',
                   default=os.environ.get('INDEXNOW_HOST', 'epitaka.org'),
                   help='site host (default: $INDEXNOW_HOST or epitaka.org)')
    p.add_argument('--dry-run', action='store_true',
                   help='print the request payload without sending')
    args = p.parse_args(argv)

    urls = list(args.urls)
    for sm in args.sitemaps:
        try:
            urls += read_sitemap_urls(sm)
        except OSError as exc:
            print(f'ERROR: cannot read sitemap: {exc}')
            return 2

    # De-duplicate, preserving order.
    urls = list(dict.fromkeys(urls))
    if not urls:
        print('ERROR: no URLs given. Pass URLs or --sitemap <file>.')
        return 2
    print(f'  Collected {len(urls)} unique URL(s) from '
          f'{len(args.sitemaps)} sitemap(s) + {len(args.urls)} explicit URL(s)'
          if args.sitemaps else f'  Collected {len(urls)} URL(s)')

    host = (args.host.strip().rstrip('/')
            .replace('https://', '').replace('http://', ''))

    key = (os.environ.get('INDEXNOW_KEY') or DEFAULT_INDEXNOW_KEY).strip()
    if not key:
        if not args.dry_run:
            print('ERROR: INDEXNOW_KEY is not set and no default is configured.')
            return 2
        key = 'YOUR_INDEXNOW_KEY'

    total = 0
    for batch in chunks(urls, MAX_URLS_PER_REQUEST):
        if submit(host, key, batch, dry_run=args.dry_run):
            return 1
        total += len(batch)

    if not args.dry_run:
        print(f'  \u2713 Submitted {total} URL(s) to IndexNow for {host}')
    return 0


if __name__ == '__main__':
    sys.exit(main())

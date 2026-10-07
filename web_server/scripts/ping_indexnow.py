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

    # Print the payload without sending (no network, no key needed):
    python3 scripts/ping_indexnow.py --dry-run --sitemap sitemaps/pages.xml

The key must also be served at https://<host>/<key>.txt — see the
`indexnow_keyfile` route in app/routes/main.py. Set INDEXNOW_KEY in the server
.env so the route and this script agree.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

ENDPOINT = 'https://api.indexnow.org/indexnow'
MAX_URLS_PER_REQUEST = 10_000  # protocol limit per request
_LOC_RE = re.compile(r'<loc>\s*(.*?)\s*</loc>', re.DOTALL)


def read_sitemap_urls(path: str) -> list[str]:
    """Return every <loc> value in a sitemap file (order preserved)."""
    with open(path, encoding='utf-8') as f:
        content = f.read()
    return [u.strip() for u in _LOC_RE.findall(content) if u.strip()]


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
        print(json.dumps(payload, indent=2, ensure_ascii=False))
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
    p.add_argument('--sitemap', help='read URLs from this sitemap file instead')
    p.add_argument('--host',
                   default=os.environ.get('INDEXNOW_HOST', 'epitaka.org'),
                   help='site host (default: $INDEXNOW_HOST or epitaka.org)')
    p.add_argument('--dry-run', action='store_true',
                   help='print the request payload without sending')
    args = p.parse_args(argv)

    urls = list(args.urls)
    if args.sitemap:
        try:
            urls += read_sitemap_urls(args.sitemap)
        except OSError as exc:
            print(f'ERROR: cannot read sitemap: {exc}')
            return 2

    # De-duplicate, preserving order.
    urls = list(dict.fromkeys(urls))
    if not urls:
        print('ERROR: no URLs given. Pass URLs or --sitemap <file>.')
        return 2

    host = (args.host.strip().rstrip('/')
            .replace('https://', '').replace('http://', ''))

    key = (os.environ.get('INDEXNOW_KEY') or '').strip()
    if not key:
        if not args.dry_run:
            print('ERROR: INDEXNOW_KEY is not set. Export it, or use --dry-run.')
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

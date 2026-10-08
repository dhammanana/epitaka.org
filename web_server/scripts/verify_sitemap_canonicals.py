#!/usr/bin/env python3
"""Check that every sitemap <loc> is self-canonical on a running server.

The sitemap and the page must agree: a <loc> whose page declares a different
canonical (or that redirects elsewhere) is a URL Google will refuse to index
as advertised. Run this after deploying a slug change.

Usage:
    python3 scripts/verify_sitemap_canonicals.py                      # localhost:8083
    python3 scripts/verify_sitemap_canonicals.py https://epitaka.org  # live site
    python3 scripts/verify_sitemap_canonicals.py https://epitaka.org --sample 200

Exit code 0 = every checked URL is self-canonical and nothing declares a
SearchAction; 1 = problems (details printed).
"""
import argparse
import glob
import os
import random
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'sitemaps')
LOC = re.compile(r'<loc>(.*?)</loc>')
CANON = re.compile(r'<link rel="canonical" href="([^"]*)"', re.I)
# Whole-file checks, then a random sample spread over every book sitemap.
WHOLE = ('book_A-i.xml', 'book_Dhatup.xml', 'pages.xml')


def url_path(url: str) -> str:
    return urllib.parse.unquote(urllib.parse.urlparse(url).path)


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Treat 3xx as a result, not a step: the redirect *is* the finding, and
    following it would also need TLS trust for the canonical host."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def build_opener() -> urllib.request.OpenerDirector:
    """Opener that never follows redirects and trusts a certifi CA bundle.

    macOS/Homebrew pythons ship without a system CA store, so a plain
    urlopen() fails every HTTPS request with CERTIFICATE_VERIFY_FAILED.
    """
    try:
        import certifi
        context = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        context = ssl.create_default_context()
    return urllib.request.build_opener(
        urllib.request.HTTPSHandler(context=context), _NoRedirect)


def fetch(opener, base: str, url: str, timeout: int):
    """(status, final_path, canonical_path, has_search_action)."""
    path = url_path(url)
    req = urllib.request.Request(
        base + urllib.parse.quote(path),
        headers={'User-Agent': 'epitaka-canonical-check'})
    try:
        resp = opener.open(req, timeout=timeout)
    except urllib.error.HTTPError as exc:
        if 300 <= exc.code < 400:
            location = exc.headers.get('Location') or ''
            return exc.code, (url_path(location) or path), None, False
        raise
    with resp:
        html = resp.read().decode('utf-8', 'replace')
        canon = CANON.search(html)
        return (resp.status, url_path(resp.geturl()),
                (url_path(canon.group(1)) if canon else None),
                'SearchAction' in html)


def check(opener, base: str, locs, label: str, timeout: int) -> int:
    bad, redirected, search_action, errors = [], [], [], []
    for loc in locs:
        try:
            status, final, canon, has_sa = fetch(opener, base, loc, timeout)
        except Exception as exc:                      # network/HTTP failure
            errors.append((loc, str(exc)))
            continue
        if 300 <= status < 400 or final != url_path(loc):
            redirected.append((loc, final))
            continue                                  # already a problem
        if has_sa:
            search_action.append(loc)
        if canon != url_path(loc):
            bad.append((loc, canon))
    print(f'\n=== {label}: {len(locs)} URLs ===')
    print(f'  not self-canonical : {len(bad)}')
    print(f'  redirected         : {len(redirected)}')
    print(f'  SearchAction found : {len(search_action)}')
    print(f'  request errors     : {len(errors)}')
    for loc, canon in bad[:10]:
        print(f'    MISMATCH {url_path(loc)}  ->  canonical {canon}')
    for loc, final in redirected[:5]:
        print(f'    redirect {url_path(loc)} -> {final}')
    for loc, exc in errors[:5]:
        print(f'    ERROR    {url_path(loc)}: {exc}')
    return len(bad) + len(redirected) + len(search_action) + len(errors)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('base', nargs='?', default='http://127.0.0.1:8083',
                    help='origin to check (default: %(default)s)')
    ap.add_argument('--sample', type=int, default=60,
                    help='random URLs to check across all book sitemaps')
    ap.add_argument('--timeout', type=int, default=30)
    args = ap.parse_args()
    base = args.base.rstrip('/')
    opener = build_opener()

    total = failures = 0
    for name in WHOLE:
        path = os.path.join(DIR, name)
        if not os.path.isfile(path):
            continue
        with open(path, encoding='utf-8') as f:
            locs = LOC.findall(f.read())
        failures += check(opener, base, locs, f'{name} (all)', args.timeout)
        total += len(locs)

    files = sorted(glob.glob(os.path.join(DIR, 'book_*.xml')))
    if files and args.sample:
        random.seed(1)
        sample = []
        for path in random.sample(files, min(args.sample, len(files))):
            with open(path, encoding='utf-8') as f:
                sample.append(random.choice(LOC.findall(f.read())))
        failures += check(opener, base, sample,
                          f'{len(sample)} random URLs from {len(files)} book sitemaps',
                          args.timeout)
        total += len(sample)

    print(f'\nTOTAL: {total} URLs checked, {failures} problem(s)')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())

# E-Piṭaka web server — handling large / bot traffic

The site is served as `Cloudflare → nginx (aaPanel) → gunicorn (systemd)`
on a 1 vCPU / ~2 GB VPS. This document explains the layered defense and
what changed in the code.

## Why the site used to hang

The old setup had a single gunicorn worker with **2 threads**. Each
gunicorn thread handles exactly one connection at a time, so:

- 2 idle keep-alive connections (bots keep sockets open) = the whole site
  blocked;
- a single slow request (e.g. the full-text-search **fallback** running
  `LIKE '%…%'` over the whole `sentences` table — triggered by any query
  the FTS index didn't match, i.e. almost every random bot query) pegged
  the one CPU for seconds;
- every request re-walked `frontend/dist/` and hashed ~6 MB of JS/CSS
  every 2 seconds;
- every unknown URL (`/wp-admin`, `/.env`, …) returned a **302 to the
  home page**, doubling each bot probe into two requests.

## What changed (in this repo)

Code (`app/`):

| Change | Effect |
|---|---|
| `utils/cache.py` — TTL/LRU cache | In-process cache for expensive read-only results |
| `utils/ratelimit.py` — per-IP limiter | Caps expensive public APIs per client IP (defense in depth behind Cloudflare) |
| `utils/assets.py` — asset version via mtime | Replaces the per-request 6 MB hash with a cheap stat walk |
| 404 handler returns a real 404 | No more redirect-to-home for every bot probe |
| `robots.txt` route | Compliant crawlers stop hitting `/editor`, `/app`, `/api/`, query URLs; `AhrefsBot` / `AhrefsSiteAudit` are blocked entirely |
| `Cache-Control: public, max-age=300` on book pages + read-only APIs | Browsers, nginx, and Cloudflare can cache responses |
| Book page rendered-HTML cache (LRU, 24 entries, 5 min) | Crawler re-hits of the same deep URLs skip the heavy render entirely |
| `toc.py` caches TOC + section sentences (5 min) | The book page, section API, and mobile app share one DB fetch per section |
| FTS fallback guarded + cached (min 3 chars, 60 s TTL) | Random bot queries can no longer trigger full-table LIKE scans |
| Rate limits on `fts_search`, `suggest_word`, `bold_*`, `dictionary` | One client can't peg the CPU |

Config (`deploy/`):

- `epitaka.service` — systemd unit: 2 workers × 4 threads, bind to
  127.0.0.1, keep-alive 2 s, timeout 30 s.
- `nginx_epitaka.conf` — nginx: serves `/static/` from disk, gzip, 7-day
  asset expiry, proxy timeouts, per-IP rate limits on `/api/*`.

## Deploy steps

1. **Code**: copy `app/`, `templates/`, `frontend/dist/` to the server
   (your existing deploy method), then restart.

2. **systemd** (takes effect immediately):
   ```bash
   sudo cp deploy/epitaka.service /etc/systemd/system/epitaka.service
   sudo systemctl daemon-reload
   sudo systemctl restart epitaka
   journalctl -u epitaka -f          # watch logs
   ```
   RAM note: if the box has < 1.5 GB free, edit the unit to
   `--workers 1 --threads 8` (fewer processes, more threads).

3. **nginx (aaPanel)**: see the header of `deploy/nginx_epitaka.conf`.
   At minimum: point the reverse proxy at `http://127.0.0.1:8080`,
   enable gzip, add the `/static/` alias, and set the proxy timeouts.

4. **Verify**:
   ```bash
   curl -sI https://epitaka.org/en/book/Dhp | grep -i cache-control   # public, max-age=300
   curl -sI https://epitaka.org/robots.txt | head
   curl -s https://epitaka.org/nonexistent -o /dev/null -w '%{http_code}\n'   # 404, not 302
   ```

## Server `.env` (set this once)

The app falls back to the incoming request when `BASE_URL` is empty, which is
how `http://` values reach `og:url`/JSON-LD. Pin the origin — and the editor —
on the server:

```bash
BASE_URL=https://epitaka.org       # canonical origin for canonical/OG/hreflang/sitemap URLs
EDITOR_NAME=Your Name              # E-E-A-T: named editor on /about + schema.org "editor"
EDITOR_CREDENTIALS=…               # optional: how you are qualified
EDITOR_URL=https://…               # optional: profile (defaults to /about)
EDITOR_SAME_AS=https://…,https://… # optional: sameAs profiles
```

Restart the service afterwards (`sudo systemctl restart epitaka`). The
editor fields are optional: while `EDITOR_NAME` is unset the site simply
claims no human editor (and emits no `editor` in JSON-LD) rather than
inventing one.

## Cloudflare settings (the first line of defense)

1. **Security → Bots → Bot Fight Mode: ON** (free). Blocks most known
   scraper/AI-crawler traffic at the edge before it reaches your VPS.
2. **SSL/TLS → Always Use HTTPS: ON**.
3. **Caching** (book pages are now `Cache-Control: public, max-age=300`):
   - Page Rule (free tier allows 3): `epitaka.org/*book/*` →
     *Cache Level: Cache Everything*, *Edge Cache TTL: 5 minutes*.
   - `epitaka.org/static/*` → *Cache Everything*, *Edge Cache TTL:
     7 days* (assets already send `immutable`).
4. **Security → WAF / Rate limiting**: add a rule limiting `/api/*`
   to ~120 requests/min/IP (burst 40). Cloudflare rate limiting on the
   free tier gives one rule — spend it on `/api/`.
5. If the site is actively down under attack, toggle **Security Level →
   I'm Under Attack** for the duration.
6. **Purge stale cached HTML** after deploying URL fixes: Caching →
   Configuration → Purge by URL (or Purge Everything) for `/` and every
   `/<lang>/`. Edge copies cached before the `BASE_URL` fix keep serving
   `http://` in `og:url`/JSON-LD to social scrapers even though the origin
   is now correct.

## SEO checklist (boost organic traffic)

The site now ships these on every page (see `app/utils/seo.py` + the
`templates/`): absolute canonical/OG/hreflang URLs (with `x-default`),
`Book` + `BreadcrumbList` JSON-LD on book pages, `WebSite`/`Organization`
JSON-LD on the home page, English book names in titles/H1s (e.g.
"Dhammapada (Dhammapadapāḷi) — English Translation | E-Piṭaka"), a
server-rendered home-page section with popular-book links (Google sees
real content instead of an empty JS shell), 301 (not 302) legacy
redirects, and a `robots.txt`. To finish the job:

1. **Google Search Console** — verify `epitaka.org` and submit
   `https://epitaka.org/sitemap.xml`. Also submit the site to Bing Webmaster
   Tools.
2. **robots.txt is served by Cloudflare**, not the origin (the live
   `/robots.txt` is "Cloudflare Managed Content"). It blocks AI bots
   (good) but drops the origin's `Sitemap:` line — that is why step 1
   matters. If you disable Cloudflare's managed robots, the origin
   `robots.txt` route (`main.robots_txt`) takes over and includes the
   sitemap reference.
3. **Cloudflare caching** (from the performance section above) makes the
   now-cacheable book pages cheap for crawlers.
4. **Internal linking** — every book page links its translations and the
   home page links the popular books; keep the `BOOK_NAMES` map in
   `app/utils/seo.py` up to date as translations are added so titles stay
   keyword-rich ("Kinh Pháp Cú", "ธรรมบท", "தம்மபதம்" searches are the
   multilingual upside of this site).
5. Re-run `curl -s https://epitaka.org/ | grep -c 'application/ld+json'`
   after deploy to confirm the schema is live.

## 2026-10-08 audit fixes (sitemap ↔ canonical)

The published audit (`../../epitaka.org-audit/FULL-AUDIT-REPORT.md`) found the
sitemap and the page `<link rel="canonical">` disagreeing on **37,097**
section URLs — the sitemap stripped punctuation (`1-rūpādivaggo-4`) while the
page kept it (`1.-rūpādivaggo-4`), so every `<loc>` canonicalised elsewhere.

What changed:

- **One slug builder** — `app/utils/slugs.py::section_slug()`. The sitemap,
  the page canonical tag, the TOC, hreflang alternates, reference links and
  the search API all call it. Legacy/edited slugs now 301 to the canonical
  URL instead of being served as duplicates.
- **Broken `SearchAction` removed** — the homepage JSON-LD advertised
  `/search?q=…`, which has never existed (search is a client-side dialog over
  `/api/fts_search`). Re-add `potentialAction` only together with a real
  server-rendered results page.
- **Per-URL `<lastmod>`** — book-section and site pages carry the date of the
  data they were built from (`data/epitaka.db`, `templates/`); study guides
  carry their own `summaries.updated_at`.
- **HTTPS + security headers** — origin-side 301 for HTTP visitors and
  HSTS/`nosniff`/`Referrer-Policy`/`X-Frame-Options` in
  `nginx_epitaka.conf`; `X-Forwarded-Proto: https` so Flask never builds an
  `http://` canonical.

After deploying:

```bash
cd web_server && python3 scripts/build_sitemap.py   # regenerate sitemaps
```

Then resubmit `https://epitaka.org/sitemap.xml` in Search Console, and purge
the Cloudflare cache (below). Spot-check that a `<loc>` and the page it
points at now agree:

```bash
curl -s https://epitaka.org/en/book/A-i/1-rūpādivaggo-4 | grep -o '<link rel="canonical"[^>]*>'
```

## AI discoverability (AI answers, ChatGPT/Copilot, Perplexity, AI Overviews)

The site is deliberately open to AI search/answer crawlers *and* AI training —
the canon is meant to spread. Code added for this:

- **`/llms.txt`** (`main.llms_txt`) — a curated Markdown map for AI agents
  (llmstxt.org v2). Generated by `seo.llms_txt()`; cached 24 h. Every HTML
  response also advertises it via `Link: </llms.txt>; rel="describedby"`
  (set once in `app/__init__.py`).
- **`robots.txt` AI policy** (`main.robots_txt`) — explicit `Allow` entries for
  `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`,
  `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`.
  Remove a group to opt that crawler out. Note: if Cloudflare's *Managed
  robots.txt* is enabled it replaces this file — disable it for these to apply.
- **Structured data** — the homepage `Organization` now carries `sameAs`
  (GitHub repos; add a Wikidata URL here once one exists) and the canon page
  adds a `Dataset` node (`seo.canon_dataset_jsonld`). Study guides carry
  `Article.dateModified`.
- **IndexNow** — set `INDEXNOW_KEY` in the server `.env`; the route
  `main.indexnow_keyfile` serves `https://<host>/<INDEXNOW_KEY>.txt`, and
  `scripts/ping_indexnow.py` notifies Bing/Yandex after a deploy, e.g.:
  `INDEXNOW_KEY=<key> python3 scripts/ping_indexnow.py --sitemap sitemaps/pages.xml`
  (use `--dry-run` to preview). Bing feeds ChatGPT/Copilot, so this is the
  fastest way to get new pages into AI answers.
- **Sitemaps** — `scripts/build_sitemap.py` fails the build if any `<loc>` or
  `xhtml:link href` is not absolute, stamps each entry of `sitemap.xml` with a
  `<lastmod>`, and marks every `<url>` with the date of the data it came from.

Manual (owner) steps that complete the picture: **Bing Webmaster Tools**
(verify + submit the sitemap) and a **Wikidata entity** for E-Piṭaka.

## Notes / trade-offs

- The in-process caches mean a translation edit by an editor may take up
  to ~5 minutes to appear on the public site (TTL). That is the price of
  making crawler traffic nearly free — lower the TTLs in
  `app/utils/cache.py` / `toc.py` if you edit content often and have CPU
  to spare.
- The rate limiter is in-memory and per-worker, so it is approximate
  across processes — keep the Cloudflare rule as the hard limit.
- `get_asset_version()` now keys on bundle mtime; if you rebuild assets
  twice within the same second, set `APP_VERSION` in the systemd unit to
  force a version bump (see `deploy/epitaka.service`).

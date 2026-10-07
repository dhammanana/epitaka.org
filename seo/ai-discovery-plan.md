# E-Piṭaka — Getting AI to Use and Cite the Site

Research + implementation plan. Date: 2026-10-07.

Scope: make epitaka.org easy for AI assistants (ChatGPT, Claude, Perplexity,
Google AI Overviews / Gemini, Copilot) to crawl, understand, quote, and link —
and answer the question *"do I need to post my website link somewhere?"*

---

## 0. TL;DR

- **"Posting your link somewhere" is real, but it is not an "AI registry."**
  There is no place you submit a site *to AI*. What actually feeds AI answers is
  the **search indexes behind them** — overwhelmingly **Bing** (ChatGPT/Copilot)
  and **Google** (AI Overviews). You are on Google Search Console already; you
  are **not** on **Bing Webmaster Tools**. That is the single most valuable
  "submit my link" action available, plus **IndexNow** for instant recrawl.
- The site is already in good shape technically (server-rendered HTML, sitemaps,
  JSON-LD, hreflang, canonical). The wins now are: **fix a live sitemap bug**,
  add **`/llms.txt`**, publish an **explicit AI-crawler policy**, and strengthen
  **structured data + entity grounding**.
- Biggest *content* lever: your `seo/questions.md` (118 curated questions) is not
  on the site as answerable content. Turning the top P1 questions into
  **answer-first pages** with FAQ/Article schema is what earns AI citations.

---

## 1. How AI answers actually find sites (2026)

There are three distinct jobs a "bot" can do, and the major vendors now expose
them as **separate user-agents**:

| Job | What it does | Example agents |
|---|---|---|
| **Training** | Harvests pages into model weights. No attribution, no traffic back. | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Amazonbot`, `Bytespider` |
| **Search indexing** | Builds the index an assistant searches when a user asks something. **Sends citations/traffic.** | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Amzn-SearchBot` |
| **Real-time fetch** | Fetches a specific page *because a user asked right now*. | `ChatGPT-User`, `Claude-User`, `Perplexity-User` |

**The critical 2026 lesson:** the old "block all AI bots" advice is now harmful.
Blocking `GPTBot` opts you out of training only (fine). Blocking `OAI-SearchBot`
removes you from **ChatGPT search citations entirely** (almost never what you
want). Cloudflare measured training at ~82% of AI bot traffic but search crawling
is the half that sends visitors back; AI-referred traffic grew roughly 975%
Jan 2025 → Jan 2026.

**Where each assistant's answers come from:**

- **ChatGPT / Copilot** → own crawler (`OAI-SearchBot`) **and** the **Bing**
  index. Bing Webmaster Tools therefore matters a lot.
- **Perplexity** → own `PerplexityBot` index + live fetch.
- **Google AI Overviews / AI Mode / Gemini grounding** → **Google Search index**
  (classic ranking signals still decide inclusion).
- **Claude** → `Claude-SearchBot` index + live fetch.

So "SEO" and "AI visibility" are the same problem for ~80% of the work. Rank
crawlable, well-structured pages in Google and Bing, and AI answers follow.

---

## 2. Do I need to "post my link somewhere"? — Yes, exactly three places

There is **no AI submission portal**. What exists:

| Action | Why | Status for epitaka.org |
|---|---|---|
| **Google Search Console** — verify + submit sitemap | Google AI Overviews/AI Mode draw from Google's index | ✅ already verified (`root_files/google3fa1caa4638a5d58.html`) |
| **Bing Webmaster Tools** — verify + submit sitemap + IndexNow | **Powers ChatGPT + Copilot + DuckDuckGo + Yahoo.** The highest-leverage missing item | ❌ not verified (no `BingSiteAuth.xml` in `root_files/`) |
| **IndexNow** — ping on publish/change | Near-instant (re)crawl by Bing/Yandex/Seznam; free | ❌ not implemented |
| *(optional)* **Wikidata / Wikipedia entity** | Grounds "what is E-Piṭaka" so assistants describe the site correctly instead of hallucinating | ❌ no entity; `Organization` schema has no `sameAs` |
| *(optional)* **LLM vendor programs** | e.g. publisher programs for Perplexity/OpenAI; nothing to submit, mostly partnership/commercial | n/a |

Also worth doing: **`/llms.txt`** — a curated Markdown map of your best content.
It is *not* a training opt-out and *not* a replacement for a sitemap; it is a
navigation aid read at inference time by agents. Support is confirmed by
Anthropic and Perplexity, observable for OpenAI, and absent for Google. Adoption
is still modest (~10% of domains), but it is cheap, low-risk, audited by Chrome
Lighthouse's agentic checks, and reads as a sophistication signal.

---

## 3. What we already have (strengths — do not rebuild)

- **Server-rendered HTML.** Book, outline, study, canon, download pages render
  full text/TOC/headings without JS. This is the #1 requirement for AI crawlers —
  many sites fail it. ✅
- **`robots.txt`** served correctly, allows content and blocks `/editor`,
  `/app`, `/static/`, `/api/`; blocks Ahrefs. ✅
- **Sitemap index + 286 per-book sitemaps** with hreflang alternates. ✅ *(but see bug below)*
- **JSON-LD**: `WebSite`+`Organization` (home), `Book`/`BreadcrumbList` (books),
  `StudyGuide` (study pages). ✅
- **Canonical, hreflang (incl. `x-default`), OG/Twitter** on every page. ✅
- **AI-generated study guides** per section — already ideal "quotable" units. ✅
- **Free, no paywall** — a major AI-citation advantage (assistants prefer
  accessible canonical sources). ✅
- Curated `seo/questions.md` (118 Qs) + `seo/keywords.md` (192) as an editorial backlog. ✅

---

## 4. Gaps (ranked by impact)

| # | Gap | Impact | Effort |
|---|---|---|---|
| 1 | **Sitemap `<loc>` values are relative** (`/sitemaps/book_A-i.xml`) — invalid per the sitemap spec; crawlers may reject the whole index. Live in production. | 🔴 Critical | S |
| 2 | **Bing Webmaster Tools not set up** → weak ChatGPT/Copilot presence | 🔴 High | S (manual) |
| 3 | **No `/llms.txt`** | 🟠 Medium | S |
| 4 | **No explicit AI-crawler policy** in `robots.txt` (default allow works, but it's undeliberate, and no explicit allow for AI search bots) | 🟠 Medium | S |
| 5 | **`Organization` schema lacks `sameAs`**; no Wikidata entity → weak entity grounding | 🟠 Medium | S–M |
| 6 | **No `FAQPage`/`Dataset` schema**; the curated Q&A lives only in `seo/questions.md`, not on-site | 🟠 Medium | M |
| 7 | **No `lastmod` in sitemaps**, no visible content dates → assistants can't tell freshness | 🟡 Low–Med | S |
| 8 | **No clean Markdown/agent endpoint** (`/api/` is disallowed); no `.md` alternates (llms.txt v2) | 🟡 Low | M |
| 9 | **No IndexNow** → slow recrawl after deploys | 🟡 Low | S |
| 10 | **No AI-referral measurement** (no UA segmentation in GA/Cloudflare) | 🟡 Low | S |

---

## 5. Implementation plan

### Phase 0 — Fix the live blocker + get found (days)

**0.1 Fix sitemap absolute URLs** — `web_server/scripts/build_sitemap.py`
Root cause: `BASE_URL = os.environ.get('BASE_URL', '')` is empty when the script
runs, so every `<loc>` and `xhtml:link href` is relative. Fixes:
- Default to the canonical origin when unset: `BASE_URL = (os.environ.get('BASE_URL') or 'https://epitaka.org').rstrip('/')`.
- Add a hard guard that **exits non-zero if any generated `<loc>` is not absolute**
  (fail the build rather than ship an invalid sitemap).
- Regenerate `sitemap.xml` + `sitemaps/*.xml` and re-submit in Google/Bing.
- Verify: `grep -c '<loc>https://' sitemap.xml` equals total `<loc>` count.

**0.2 Bing Webmaster Tools** — manual (owner action)
- Sign in at bing.com/webmasters with the Google account → "Import from Google
  Search Console" (fastest), or verify with a `BingSiteAuth.xml` in
  `root_files/` (route pattern already demonstrated by the Google one).
- Submit `https://epitaka.org/sitemap.xml`.

**0.3 IndexNow** — `web_server/scripts/` + deploy hook
- Add a small `ping_indexnow.py` (host + key file) called after redeploys and
  after sitemap regeneration; serve the key at `/{key}.txt` from `root_files/`.

### Phase 1 — AI access layer (days)

**1.1 Publish `/llms.txt`** — new route in `app/routes/main.py` (mirror the
`robots_txt` route: `Content-Type: text/plain`, `Cache-Control: public,
max-age=86400`, add to `_CACHEABLE_ENDPOINTS`).
Content (per llmstxt.org v2 spec — H1, blockquote summary, H2 file lists, keep
< 5 KB, **curate — do not dump 200 URLs**):
```
# E-Piṭaka
> Free, open reader of the Pāli Tipiṭaka (Chaṭṭha Saṅgāyana edition) with
> line-by-line translations and AI study guides in English, Sinhala, Thai,
> Burmese, Vietnamese, Tamil and more.

## Core
- [Read the canon](/en/): full-text reader with translations
- [Canon index](/en/canon): every book, by Piṭaka
- [Downloads](/en/download): PDF/EPUB/DOCX packs
...
## Reference
- [Study guides](/en/study/...): section-by-section summaries with citations
## Optional
- [About](/en/about), [Privacy](/en/privacy)
```
Add `<link rel="describedby" href="/llms.txt">` in the page `<head>`.

**1.2 Explicit AI-crawler policy** — `robots_txt()` in `app/routes/main.py`
**Decided: allow training too (§6).** Keep the permissive base and add explicit
`Allow: /` entries for the AI search/retrieval bots so the policy is deliberate
and self-documenting. Shape:
```
# AI search / retrieval — keep these OPEN so we get cited
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended      # policy token: allow Gemini grounding
Allow: /
User-agent: Applebot-Extended
Allow: /
```
*(If this policy is ever reversed, denying training means replacing `Allow: /`
with `Disallow: /` for `GPTBot`, `ClaudeBot`, `CCBot`, `Applebot-Extended`,
`Google-Extended`, `Amazonbot`, `Bytespider` — and noting `Bytespider` ignores
robots.txt, so it needs a Cloudflare WAF rule.)*

### Phase 2 — Entity + structured data (weeks)

**2.1 Enrich `Organization` JSON-LD** — `app/utils/seo.py::website_jsonld()`
Add `sameAs` (Wikipedia/Wikidata URL, GitHub, official social), `foundingDate`,
`description`, and a stable `@id`. This is the highest-impact schema change for
"what is E-Piṭaka" questions.

**2.2 Wikidata entity.** Create/verify an item for E-Piṭaka; add the Wikidata URL
to `sameAs`. Grounds the entity so assistants describe it accurately.

**2.3 `Dataset` schema** on `/en/canon` (and/or `/en/download`) describing the
Tipiṭaka corpus (name, edition = Chaṭṭha Saṅgāyana / VRI, license, languages,
`distribution`). Research/citation queries ("Pāli Canon dataset", "full text
download") respond well to `Dataset`.

**2.4 `FAQPage` schema** for definition/answer pages (Phase 3.1) and optionally
`Article` with `datePublished`/`dateModified` on study guides.

### Phase 3 — Content that earns citations (weeks–ongoing)

**3.1 Answer-first pages from `seo/questions.md`.** The 118 questions are already
curated with intent/difficulty/answer-angle. Ship the **P1** set (≈40) as
server-rendered pages, each: direct 1–3 sentence answer up top, then depth, then
links to the relevant sutta/section. Mark up with `FAQPage`/`Article` +
`dateModified`. This is the single biggest lever for being *quoted*.
Suggested route: `/<lang>/answers/<slug>` (canonical to `/en/`), generated from a
data file so it stays in sync with the sutta DB.

**3.2 Markdown alternates.** Serve `.md` versions of study guides / canon /
answer pages (llms.txt v2: `page.md` next to `page.html`, linked with
`rel="alternate" type="text/markdown"`). Cheap because the source is already
Markdown (`summaries.render_study_markdown`).

**3.3 Dates + `lastmod`.** Add `dateModified` to schema and `<lastmod>` to
sitemap entries (uses DB mtime). Helps freshness-sensitive AI answers.

### Phase 4 — Measurement (ongoing)

- **GA4 / Cloudflare:** segment sessions by referrer (`chatgpt.com`,
  `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai`) and
  by AI user-agent to see crawler coverage.
- **Manual probes:** monthly, ask each assistant your P1 questions; record
  whether epitaka.org is cited.
- **Log review:** confirm `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`
  are actually hitting the site (in gunicorn access logs).

---

## 6. Decisions

1. **Training crawlers — ALLOW (decided 2026-10-07).**
   The operator chose to allow both search/retrieval *and* training crawlers, so
   the Tipiṭaka spreads as widely as possible. Concretely this means:
   - Keep `User-agent: *` / `Allow: /` as the base policy (no training blocks).
   - Add explicit `Allow: /` entries for the AI search/retrieval bots so the
     policy is deliberate and self-documenting: `OAI-SearchBot`,
     `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`,
     `Perplexity-User`, `Google-Extended`, `Applebot-Extended`.
   - Do **not** add `Disallow` rules for `GPTBot`, `ClaudeBot`, `CCBot`,
     `Amazonbot`, `Bytespider`, or `meta-externalagent`.
   - Still consider a Cloudflare WAF rule only if bots cause load problems —
     that is a performance call, not a content-policy one.
2. **Scope — IMPLEMENTED 2026-10-07.** Phases 0.1, 0.3, 1, 2.1, 2.3 and 3.3
   are in the code (see §8). Still deferred: 3.1, 3.2, 4, and the manual owner
   steps (0.2 Bing, 2.2 Wikidata).
3. **Still open: on-site answer pages (3.1)** — build or defer after Phases 0–2?
4. **Still open: Wikidata entity** — create it (needs an owner with a Wikidata
   account), or just add `sameAs` once one exists?

---

## 8. Implementation status (2026-10-07)

| Plan item | Status | Where |
|---|---|---|
| 0.1 Absolute sitemap URLs + build guard | ✅ Done | `web_server/scripts/build_sitemap.py` (+ regenerated `sitemap.xml`, `sitemaps/*.xml`) |
| 0.2 Bing Webmaster Tools | ⏳ Owner action | verify + submit `https://epitaka.org/sitemap.xml` |
| 0.3 IndexNow | ✅ Done | `web_server/scripts/ping_indexnow.py`, route `main.indexnow_keyfile`; set `INDEXNOW_KEY` |
| 1.1 `/llms.txt` + `rel=describedby` | ✅ Done | `seo.llms_txt()`, route `main.llms_txt`, `Link` header in `app/__init__.py` |
| 1.2 AI-crawler robots.txt policy | ✅ Done | `main.robots_txt()` (explicit allow for AI search bots; training allowed) |
| 2.1 `Organization` `sameAs` | ✅ Done | `seo.website_jsonld()` (GitHub repos; add Wikidata when it exists) |
| 2.2 Wikidata entity | ⏳ Owner action | needs an owner with a Wikidata account |
| 2.3 `Dataset` schema | ✅ Done | `seo.canon_dataset_jsonld()`, `templates/canon.html` |
| 2.4 `FAQPage` / `Article` dates | ⚠️ Partial | `Article.dateModified` added; `FAQPage` waits on 3.1 |
| 3.1 Answer-first pages | ⏸ Deferred | largest content build — still open (decision 3) |
| 3.2 Markdown `.md` alternates | ⏸ Deferred | not yet implemented |
| 3.3 `lastmod` / dates | ✅ Done | sitemap-index `<lastmod>`; `Article.dateModified` |
| 4 Measurement | ⏸ Deferred | GA4/Cloudflare AI-referrer + UA segmentation |

**Caveat:** if Cloudflare's *Managed robots.txt* is enabled it replaces the
origin `robots.txt` — disable it for the Phase 1.2 policy to apply.

---

## 7. Concrete file map (for whoever implements)

| Change | File |
|---|---|
| Absolute sitemap URLs + absolute-URL guard | `web_server/scripts/build_sitemap.py` |
| Regenerated sitemaps | `web_server/sitemap.xml`, `web_server/sitemaps/*.xml` |
| `/llms.txt` route + cache list + `rel=describedby` | `web_server/app/routes/main.py`, `app/__init__.py`, `templates/*.html` |
| AI-crawler policy in robots.txt | `web_server/app/routes/main.py::robots_txt()` |
| Richer Organization/WebSite, Dataset, FAQ schema | `web_server/app/utils/seo.py` |
| IndexNow ping script + key file | `web_server/scripts/ping_indexnow.py`, `web_server/root_files/` |
| Bing verification (if not importing from GSC) | `web_server/root_files/BingSiteAuth.xml` + route |
| Answer pages (Phase 3.1) | `web_server/app/routes/`, `web_server/templates/`, data in `seo/questions.md` |

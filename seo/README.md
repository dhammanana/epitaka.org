# E-Piṭaka — SEO Research & Tooling

Keyword, question and tooling research to improve organic search for
**[epitaka.org](https://epitaka.org)** — the Chaṭṭha Saṅgāyana Tipiṭaka reader
with inline commentary and sub-commentary.

## What's in this folder

| File | Contents |
|---|---|
| `keywords.csv` | 192 target search terms with cluster, intent, difficulty (band + 0-100 KD), priority, target page, notes |
| `keywords.md` | Same data, readable tables grouped by cluster |
| `questions.csv` | 118 question-style queries (People-Also-Ask style) with difficulty and an answer angle |
| `questions.md` | Same data, readable tables grouped by cluster |
| `build_seo_docs.py` | Generator — edit the dataset here and re-run to refresh all four files |

Regenerate after editing:

```bash
cd epitaka.org/seo && python3 build_seo_docs.py
```

All files are **UTF-8**. The data includes Thai, Sinhala, Myanmar, Tamil, Lao,
Chinese and Vietnamese text — if a spreadsheet shows garbled characters, import
with UTF-8 encoding.

### Difficulty bands

| Band | KD estimate | Meaning |
|---|---|---|
| Easy | 0–19 | Realistic page-1 target with one good page |
| Medium | 20–44 | Needs a strong, focused page + internal links |
| Hard | 45–69 | Needs pillar content, links, and time |
| Very Hard | 70+ | Track only — do not target head-on |

> **These difficulty numbers are editorial estimates, not live Ahrefs/Semrush
> data.** They are for prioritisation. Validate the P1 terms with a real tool
> (below) before committing budget.

## How the site is already set up for SEO

- `web_server/app/utils/seo.py` already generates English page titles, meta
  descriptions, canonical URLs and JSON-LD (`WebSite`, `Organization`,
  `SearchAction`, `Article`).
- `web_server/scripts/build_sitemap.py` + the `/sitemap.xml` route serve a
  sitemap index with per-book sitemaps.
- `/robots.txt`, Google verification route, `hreflang`-style localized
  `/{lang}/` landing pages, and `.well-known/` handlers exist.
- Book pages render under `/{lang}/book/{book_id}`, deep sections at
  `/{lang}/book/{book_id}/{section_path}`, outlines at
  `/{lang}/book/{book_id}/outline`, and study guides at
  `/{lang}/study/{book_id}/{slug}` — all indexable, server-rendered.

The biggest untapped wins from the research: **section-level and study-guide
pages** (long-tail, already unique titles), the **inline commentary/ṭīkā
differentiator** (`atthakatha`, `dhammapada commentary`, `pali commentary
english translation`), **script conversion** (`pali script converter`,
`roman to sinhala pali converter`), and **localized landing pages** for the
Vietnamese/Thai/Sinhala/Myanmar terms.

## Tool stack

### 1. Free essentials (start here)

| Tool | Use it for |
|---|---|
| **Google Search Console** | Real queries, impressions, CTR, indexing — the only source of your *actual* data. Free forever. |
| **Bing Webmaster Tools** | Second index; IndexNow submission. Free. |
| **Google Keyword Planner** | Volumes + ideas (free with a Google Ads account, no spend needed). |
| **Google Trends** | Seasonality and rising queries. |
| **Ahrefs Webmaster Tools** | Free backlink + site audit for a verified domain; free Keyword Generator for ideas. |
| **Semrush free keyword tool** | Limited free volume/difficulty lookups. |
| **AnswerThePublic / AlsoAsked** | Question mining — the `questions.csv` list is seeded from this style of research. |
| **Google Rich Results Test + Schema Markup Validator** | Verify the JSON-LD the site already emits. |
| **PageSpeed Insights / Lighthouse** | Core Web Vitals for the reader pages. |
| **Screaming Frog SEO Spider** | Full crawl, free up to 500 URLs (enough to audit the book templates). |
| **Keyword Surfer** (Chrome ext.) | Inline volumes while browsing SERPs. |

### 2. Open-source / self-hosted

| Tool | License | Use it for |
|---|---|---|
| **SEOnaut** | Apache-2.0 | Web-based technical SEO audit / crawler |
| **SerpBear** | MIT | Self-hosted rank tracking with unlimited keywords + GSC integration |
| **Unlighthouse** | MIT | Lighthouse scores across the whole site in one run |
| **Lighthouse CI** | Apache-2.0 | Run audits on every deploy |
| **OpenSEO** | OSS | Keyword research / rank tracking / agent workflows |
| **LibreCrawl** | OSS | Self-hosted crawler |
| **Matomo** | GPL | Privacy-friendly analytics alternative to GA4 |

### 3. MCP servers (connect your AI assistant to live SEO data)

**Open-source / free first:**

| Server | Repo / source | Notes |
|---|---|---|
| **mcp-gsc** | `AminForou/mcp-gsc` (MIT) | Google Search Console → AI. Best free starting point: query traffic, CTR, indexing. |
| **mcp-server-gsc** | `ahonn/mcp-server-gsc` | Alternative GSC server with analytics extras. |
| **google-analytics-mcp** | `googleanalytics/google-analytics-mcp` | **Official Google** GA4 MCP (local, read-only). |
| **seo-mcp** | `cnych/seo-mcp` | Free bundle of SEO utilities; scrapes public data (no paid API). |
| **Chrome DevTools MCP** | `ChromeDevTools/chrome-devtools-mcp` | Performance/technical audits via an AI agent. |
| **Firecrawl MCP** | `mendableai/firecrawl-mcp-server` | Crawl + extract your own pages for content/IA analysis. |

**Vendor (paid API / subscription):**

| Server | Notes |
|---|---|
| **Ahrefs MCP** | Official remote server; keyword difficulty, backlinks, competitor gap (paid plan). |
| **Semrush MCP** | Official; keyword DB + competitive intel (paid + API units). |
| **SE Ranking MCP** | Official; includes **AI-search share-of-voice** (ChatGPT / Perplexity / AI Overviews). |
| **DataForSEO MCP** | Official; live SERPs, volumes, backlinks — pay-per-call. |
| **Screaming Frog MCP** | Official; drive the crawler from an AI assistant. |
| **Coupler.io MCP** | Merge several SEO sources in one connection. |

### 4. AI search / GEO visibility (emerging — evaluate)

As AI assistants absorb discovery, track how often E-Piṭaka is cited in AI
answers. Options: **Semrush AI Visibility Toolkit**, **Profound**,
**Peec AI**, **Otterly.ai**, **Scrunch**, **Rankscale**, **Athena HQ**.
Shared **SE Ranking MCP** also exposes this. Budget tools only after the free
Search Console loop is working.

## Suggested workflow

1. **Verify GSC + Bing** (routes already exist) and submit `/sitemap.xml`.
2. **Connect `mcp-gsc`** to your AI assistant and pull the last 90 days of
   queries — this tells you which terms you *already* near-rank for.
3. Cross-reference that with `keywords.csv` to pick P1 targets you can win
   early (Easy/Medium in `Core Canon Access`, `Commentaries`, `Pāli Language`,
   `Abhidhamma`).
4. Turn the biggest clusters into **section-level or study-guide pages**
   (the site already renders these with unique titles/descriptions).
5. Add **FAQ / Q&A blocks** on book and topic pages from `questions.csv`
   (these map to People-Also-Ask boxes and AI answers).
6. Re-crawl with **SEOnaut** or **Screaming Frog**, and track P1 rankings
   with **SerpBear**.
7. Re-check GSC monthly; promote the next batch of Easy/Medium terms.

## Notes & caveats

- Difficulty/volume are **estimates**. Validate before spending.
- Non-English clusters (Vietnamese, Thai, Sinhala, Burmese, Chinese) are
  under-served online — often the fastest wins for a multi-language site.
- Prefer building on the **commentary/ṭīkā** and **inline-translation**
  differentiators rather than competing head-on with SuttaCentral for
  `pali canon online`.

## Sources (October 2026)

- seoprofy.com — *Best MCP Server for SEO (2026)*
- seranking.com, dashthis.com, seoptimer.com — SEO MCP server round-ups
- github.com/serpapi/awesome-seo-tools; xcloud.host — *Best Open Source SEO
  Tools 2026*
- github.com/AminForou/mcp-gsc; github.com/googleanalytics/google-analytics-mcp
- explodingtopics.com, kime.ai — AI visibility / GEO tool comparisons

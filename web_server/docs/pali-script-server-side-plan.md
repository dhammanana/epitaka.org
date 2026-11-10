# Server-side Pāli script rendering — implementation plan

Status: **planning + performance pre-work**
Last updated: 2026-11-10

This document is written so the work can be paused and resumed across sessions.
Keep the checkboxes and the progress log up to date.

---

## 1. Goal

Serve Pāli text in the script implied by the URL language (`/si/` → Sinhala,
`/my/` → Myanmar, `/th/` → Thai, `/en/` → Roman, …) directly in the HTML, so
search engines and no-JS clients see the correct script without executing
JavaScript.

Keep the existing client-side converter only for manual script switching, so
readers can still pick any script from Settings without changing the URL.

**Hard constraint:** the 1 vCPU / ~2 GB origin must not become slower. All
conversion work must happen off the request path.

---

## 2. Current state (measured 2026-11-10)

- `epitaka.db`: 1,274,540 sentences, ~101 MB of Pāli text, ~160,920 headings.
- `epitaka_en.db`: 122,808 study guides, ~254 MB of markdown content.
- Server renders Roman Pāli in `.pali-text` nodes; `frontend/src/pali-text.js`
  converts after load. Crawlers index Roman Pāli on every locale.
- Cold render times on the development checkout (before the performance
  pre-work in section 3):

  | URL | Cold time |
  |---|---|
  | `/en/book/Dhp` | 415 ms |
  | `/si/book/Dhp` | 723 ms |
  | `/my/book/Dhp` | 790 ms |
  | `/en/book/D-i/1-mahavaggo-2` | 1273 ms |

- After the section 3 pre-work, the same cold renders measured **195 ms**,
  **377 ms**, **273 ms** and **~136–510 ms** respectively (high variance while
  the OS page cache warms). Warm requests are ~1 ms.
- Profiling showed the cold cost was **not** transliteration:
  - `book_names.localized_book_names()`: 286 `_translated_name` queries per
    language (~0.7–1.0 s).
  - `summaries.get_all_summaries()`: `SELECT *` loading ~254 MB of study-guide
    markdown just to build a slug map (~0.7 s).
  - Jinja template compilation on first use (~0.9 s, once per process).
  - Page caches were small (24 book pages / 5 min) and per worker.

---

## 3. Performance pre-work (do first)

These are fixes that make the server faster **without** adding transliteration.
They are a prerequisite: if the origin is already slow, adding server-side
script rendering will look like the culprit even if it is not.

- [x] **Batch book-name lookup** — replace the N+1 `_translated_name()` loop
  with one batched query for all books; collapse the two headings scans into
  one. (`app/services/book_names.py`)
- [x] **Lightweight study-guide index** — add a summary index query that selects
  only `section_id, title, heading_title`; use it from `book_summary_map()` and
  the prev/next navigation. Keep `get_summary()` for full content.
  (`app/services/summaries.py`)
- [x] **Cache summary index / map** per book with a TTL (600 s).
- [x] **Cache book names longer** (3600 s; they only change on deploy).
- [x] **Increase page/section cache sizes and TTLs** and keep them script-aware
  when the feature lands. (`app/routes/main.py`, `app/services/toc.py`)
- [x] **Jinja bytecode cache + startup template warmup** so the first request in
  each worker does not pay template compilation.
- [x] **Trim large `fetchall()` work** where the profile showed it:
  - book-name lookups are now one batched query;
  - summary index no longer loads the 254 MB `content` column;
  - `api_heading_translations` now batches its per-heading queries.
- [x] **Reuse the read-only summaries SQLite connection per worker thread**
  instead of opening a 600 MB+ database on every request, and close the
  connection leak on request teardown.
- [x] **Shared-cache headers** — `s-maxage=3600` +
  `stale-while-revalidate=600` for read-only HTML/JSON.
- [x] Re-run `web_server/benchmark.py` and the cold-page script; results in
  the progress log.

---

## 4. Recommended architecture

Do **not** transliterate per request. The Pāli corpus is static and conversion
is deterministic, so conversion belongs in the deploy pipeline.

```
Build:   epitaka.db ──(frontend/src/pali-script.js in Node)──> epitaka_scripts.db.zlib blobs
Request: lang ──> script_for_lang(lang) ──> indexed lookup ──> Jinja ──> cached HTML/CDN
Client:  skip conversion when data-pali-script matches; convert only on manual switch
```

### 4.1 Why reuse the JavaScript converter

`frontend/src/pali-script.js` already runs under Node (verified with Node 25),
including the custom Tamil and Korean converters. A build script can import it
directly, which guarantees output parity with the browser and avoids porting
~900 lines of script-specific rules to Python.

Node 25 also has built-in `node:sqlite`, so the build script can read
`epitaka.db` without extra dependencies:

```js
import { DatabaseSync } from 'node:sqlite';
import { TextProcessor, Script } from '../frontend/src/pali-script.js';
```

### 4.2 Compressed sidecar database (target < 500 MB)

Do **not** store 1.5 GB of plain text. Store one compressed blob per section,
and only for scripts actually used by deployed language URLs.

Target scripts (derived from `frontend/src/settings.js` `LANG_SCRIPT_MAP`):

| Script | Languages |
|---|---|
| Roman (`ro`) | en, de, fr, pt, vi, … |
| Sinhala (`si`) | si |
| Myanmar (`my`) | my |
| Thai (`th`) | th |
| Lao (`lo`) | lo |
| Khmer (`km`) | km |
| Tamil (`ta`) | ta |

Optional (only if those locales are deployed): Devanagari, Bengali, Gujarati,
Gurmukhi, Telugu, Kannada, Malayalam, Cyrillic.

Proposed schema for `data/epitaka_scripts.db`:

```sql
-- One compressed JSON array per section: [[para_id, line_id, pali], ...]
CREATE TABLE section_text (
  script   TEXT NOT NULL,
  book_id  TEXT NOT NULL,
  para_id  INTEGER NOT NULL,
  data     BLOB NOT NULL,          -- zlib.deflate(JSON), level 6
  PRIMARY KEY (script, book_id, para_id)
) WITHOUT ROWID;

-- One compressed JSON object per book: {para_id: title}
CREATE TABLE book_headings (
  script   TEXT NOT NULL,
  book_id  TEXT NOT NULL,
  data     BLOB NOT NULL,
  PRIMARY KEY (script, book_id)
) WITHOUT ROWID;

-- One converted Pāli book title per book
CREATE TABLE book_names (
  script   TEXT NOT NULL,
  book_id  TEXT NOT NULL,
  name     TEXT NOT NULL,
  PRIMARY KEY (script, book_id)
) WITHOUT ROWID;
```

Compression details:

- Use `zlib.deflateSync(Buffer.from(JSON.stringify(rows)))` in Node (level 6)
  and `zlib.decompress()` in Python.
- Do not compress individual short strings; compress the whole section/book
  blob. This keeps row count at ~160k × scripts instead of ~9M.
- Expected size: source Pāli is ~101 MB. Compressed native-script blobs should
  land roughly in the **250–500 MB** range for the seven scripts above.
  Measure after the first build and record the result in the progress log.
- If space is still a problem:
  1. Generate only scripts for languages that are actually deployed.
  2. Increase zlib level to 9 (slower build, smaller file).
  3. Generate on demand and persist, with Roman fallback.
- The sidecar is read-only at runtime:
  `sqlite3.connect("file:...epitaka_scripts.db?mode=ro&immutable=1", uri=True)`.

### 4.3 Request-time path

- Add `script_for_lang(lang)` to `app/languages.py`, mirroring
  `LANG_SCRIPT_MAP` in `frontend/src/settings.js`.
- `get_section_sentences(book_id, para_id, conn, lang_code, script)`:
  fetch the compressed section blob once, decompress, and attach `pali` to the
  sentence rows. Keep the existing `_SECTION_CACHE`, now keyed by script.
- `get_book_toc(book_id, conn, script)`: fetch the book's compressed heading
  blob and replace `title` values. Keep `_TOC_CACHE`, keyed by script.
- `book()`: convert/attach book title and heading titles, and pass the script
  to the template.
- `api_book_section` / `api_book_sections`: optional `script` parameter; if it
  is absent, keep returning Roman and let the client convert as today.
- Fallback: if an entry is missing from the sidecar, leave the Roman text in
  place and log once. A stale sidecar must never break the page.

### 4.4 Template + client changes

- Render `data-pali-script="{{ script }}"` on Pāli elements (or `<body>`).
- `transliterateElement()` already returns early when
  `el.dataset.paliScript === script` (`frontend/src/pali-text.js:41`), so a
  correctly rendered page does zero conversion work.
- On a manual switch, `convertFromMixed()` detects the server-rendered script
  and converts from it. Test round-trips (si → ro → th) for every custom
  script; if a round-trip loses information, fetch the Roman source from the
  API for that switch.
- Add the same treatment to outline/canon/study pages where Pāli titles are
  currently plain Roman text.

### 4.5 SEO rules

- Keep one canonical URL per language. The script is a presentation variant of
  the language page; it must not create new indexable URLs.
- A `?script=` override (if added) must stay non-indexable / non-canonical.
- Add `lang="pi"` (optionally script-tagged) on Pāli nodes; keep
  `<html lang="xx">` for the translation.
- Verify with `curl` (no JS): `/si/…` → Sinhala, `/my/…` → Myanmar,
  `/th/…` → Thai, `/en/…` → Roman.
- Re-check canonical, hreflang, sitemaps, and Google Rich Results after rollout.

---

## 5. Performance reasoning

| Path | Work per request | Expected |
|---|---|---|
| Warm page | in-process page cache lookup | ~1–5 ms |
| Cold book page | existing queries + one headings blob | no conversion; faster after section 3 |
| Cold section page | existing queries + one section blob | +≈1–5 ms (decompress only) |
| Client load | no `.pali-text` sweep | better LCP/INP |
| Crawler | full native-script HTML in first response | better indexing |

Additional levers:

- Cloudflare/nginx HTML caching: `Cache-Control: public, s-maxage=3600,
  stale-while-revalidate=600`, purge on deploy. Biggest win on 1 vCPU.
- Pre-warm top URLs after deploy.
- Large per-section blobs keep SQLite row counts low; decompression is C-speed
  and happens once per section per TTL.

---

## 6. Implementation phases

### Phase 0 — golden tests
- [ ] Script that runs the JS converter over a sample corpus for every script
  and writes fixtures.
- [ ] Python/Node comparison test for the same corpus.
- [ ] Edge cases: Tamil superscript markers, Korean, Thai/Lao e/o swap,
  Khmer, ZWJ cleanup, digits, virama, Sanskrit vowels, mixed-script strings.

### Phase 1 — performance pre-work
- [x] See section 3; complete and benchmark it before adding the sidecar.

### Phase 2 — build the compressed sidecar
- [ ] `web_server/scripts/build_script_cache.mjs`
  - read `epitaka.db` with `node:sqlite`,
  - group sentences by heading section,
  - convert with `TextProcessor`,
  - write zlib-compressed blobs to `data/epitaka_scripts.db`,
  - print input/output sizes and per-script totals.
- [ ] Add a deploy hook / make target and document it.
- [ ] Add `epitaka_scripts.db` to deploy artifacts and `.gitignore` (generated).

### Phase 3 — server rendering
- [ ] `script_for_lang()` in `app/languages.py`.
- [ ] Sidecar connection helper in `app/utils/db.py` (read-only, thread-local).
- [ ] Script-aware `get_section_sentences()` and `get_book_toc()`.
- [ ] `book()` + template `data-pali-script`.
- [ ] Optional `script` parameter for section/book-link APIs.
- [ ] Env flag `PALI_SCRIPT_RENDER=1` for rollback.

### Phase 4 — client cleanup
- [ ] Skip conversion of server-rendered nodes (already supported by the
  `data-pali-script` check).
- [ ] Verify manual switching per script.
- [ ] Remove any redundant conversion work on first paint.

### Phase 5 — caching + monitoring
- [ ] CDN/nginx HTML cache rules and purge-on-deploy.
- [ ] Pre-warm script.
- [ ] Monitor origin TTFB, cache hit ratio, CPU, and HTML transfer size.

---

## 7. Verification checklist

- [ ] Golden outputs match the JS converter for all scripts.
- [ ] `curl` shows native script per locale with JavaScript disabled.
- [ ] Cold book/section render is no slower than the section 3 baseline.
- [ ] Warm origin response < 10 ms.
- [ ] No client-side `.pali-text` conversion on initial load.
- [ ] HTML gzip size increase < 25%.
- [ ] Manual script switching still works and can return to Roman.
- [ ] Canonical/hreflang/sitemap unchanged.
- [ ] Origin stable under a crawler-style load test.

---

## 8. Commands

```bash
# Baseline benchmark (warm)
cd web_server
SECRET_KEY=dev-only-dev-only-dev-only-dev-only ./env/bin/python benchmark.py

# Cold page timings (one process per URL)
cd web_server
for url in /en/book/Dhp /si/book/Dhp; do
  SECRET_KEY=dev-only-dev-only-dev-only-dev-only ./env/bin/python - "$url" <<'PY'
import os, sys, time
os.environ.setdefault('ENV', 'production'); sys.path.insert(0, '.')
from run import app
c = app.test_client(); u = sys.argv[1]
t = time.perf_counter(); r = c.get(u)
print(f'{(time.perf_counter()-t)*1000:8.1f} ms {r.status_code} {u} {len(r.data)} bytes')
PY
done

# Build the sidecar (after Phase 2)
cd web_server
node scripts/build_script_cache.mjs

# Inspect sidecar size
ls -lh data/epitaka_scripts.db
```

---

## 9. Progress log

### 2026-11-10
- Wrote this plan.
- Completed section 3 performance pre-work:
  - `book_names.py`: one batched title query (was 286), one headings scan
    (was two), first-heading map cached for 1 hour, name cache TTL 1 hour.
  - `summaries.py`: new `get_summary_index()` selects only
    `section_id, title, heading_title`; `book_summary_map()` and prev/next
    navigation use it. Both index and map cached for 10 minutes. Summary
    connection is now thread-local (reused across requests).
  - `main.py`: page caches raised from 24–64 entries / 5 min to
    64–128 entries / 15 min; download page 1 hour.
  - `toc.py`: section cache 1024 / 15 min, TOC cache 512 / 15 min.
  - `books.py`: hierarchy cache TTL 1 hour.
  - `__init__.py`: Jinja filesystem bytecode cache + all templates compiled at
    startup; shared-cache headers now
    `max-age=300, s-maxage=3600, stale-while-revalidate=600`.
  - `api.py`: `heading_translations` batched in chunks of 500.
- Benchmarks (this checkout): warm `/en/book/Dhp` 0.6 ms, `/api/fts_search`
  (book-filtered) 27 ms (was 91 ms). Cold `/en/book/Dhp` is now ~41 ms;
  the first non-English render still pays ~250 ms to build the localized
  book-name map, then stays cached for an hour.
- Next: start Phase 0 (golden converter tests) and Phase 2 (compressed
  sidecar build script).

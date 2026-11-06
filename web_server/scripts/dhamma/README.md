# Dhamma publisher

One-shot script that plans, writes, renders and optionally publishes a single
Dhamma post. No daemon, no Docker, no database writes. Both text and background
images come from Cloudflare Workers AI; source texts come from the bundled
corpus and, when present, `epitaka.db`.

```
web_server/scripts/
├── dhamma_publisher.py          # CLI entry point
├── requirements-dhamma.txt
├── .env                         # keys (not committed)
├── output/<scenario>/<date>/    # generated JPG + JSON, grouped for browsing
├── state/history.json           # last 200 plans, used by the variety engine
└── dhamma/
    ├── config.py                # paths, .env loading, database locations
    ├── cloudflare.py            # Workers AI text + image calls
    ├── corpus.py                # verified verses/stories + epitaka.db reader
    ├── scenarios.py             # scenarios, formats, history, planner
    ├── content.py               # prompts, validation, tags, similarity guard
    ├── render.py                # four card layouts, six palettes
    ├── storage.py               # output folders, manifest, cleanup
    └── facebook.py              # Page photo upload
```

## Install

```bash
cd web_server/scripts
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dhamma.txt
```

## Configure

```bash
cp .env.example .env      # or edit the existing .env
```

| Variable | Purpose |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |
| `CLOUDFLARE_API_TOKEN` | token with Workers AI permission |
| `CLOUDFLARE_TEXT_MODEL` | optional, default `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `CLOUDFLARE_IMAGE_MODEL` | optional, default `@cf/black-forest-labs/flux-1-schnell` |
| `FACEBOOK_PAGE_ID` | only for `--post-facebook` |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | only for `--post-facebook` |
| `EPITAKA_DB_PATH` | optional; defaults to `web_server/data/epitaka.db` |
| `EPITAKA_TRANSLATION_DB` | optional; defaults to `epitaka_<lang>.db` beside the Pāli database |
| `EPITAKA_TRANSLATION_LANG` | optional, default `en` |
| `FONT_PATH` / `FONT_PATH_BOLD` | optional TTF overrides for Pāli diacritics |

## Commands

```bash
python3 dhamma_publisher.py                     # one post, saved only
python3 dhamma_publisher.py --post-facebook     # one post, published
python3 dhamma_publisher.py --text-only         # caption JSON only
python3 dhamma_publisher.py --sample            # offline, no keys needed
python3 dhamma_publisher.py --sample --samples 8  # preview variation
python3 dhamma_publisher.py --db-info           # verify the database reader
python3 dhamma_publisher.py --scenario anger-and-repair
python3 dhamma_publisher.py --format tipitaka-story
```

`--scenario` and `--format` override the rotation for one run; `--seed` repeats a
plan when the corpus and history are unchanged.

## Why posts stop repeating

The post is not written from a single prompt. Each run:

1. **Picks a scenario** — one of eleven editorial situations (morning stillness,
   anger and repair, generosity, first steps, stories from the texts, ...). The
   two most recently used scenarios are excluded.
2. **Picks a format** — verse reflection, quiet reflection, practice invitation,
   open question, Tipiṭaka story, sutta reading, or a mettā wish. The last two
   formats are excluded, and the brief supplies a required opening shape and a
   required ending shape from rotating lists.
3. **Picks source material** — a verified verse, a story, or a real passage from
   `epitaka.db`. Verses, stories and readings are excluded once used in the last
   twenty posts.
4. **Picks presentation** — one of four layouts and one of six palettes, neither
   repeated from the previous post. Layout, palette and scenario are recorded in
   `state/history.json`.
5. **Checks the draft** against the last eight posts with a word-overlap score.
   If the draft is too close, the model is asked once more with an explicit
   "different opening, different central image" instruction, and the retry is
   logged.

Because scenario, format, source, layout and palette are all rotated on separate
cycles, consecutive posts diverge in structure as well as in wording.

## Quotation accuracy

- Verses are bundled in `corpus.py` with their Pāli and an English rendering
  written for this publisher. The Pāli is quoted whole and is never altered by
  the model.
- The model is instructed never to invent a quotation, verse or reference, and
  the source text is printed on the card by the renderer rather than by the model.
- Story posts state their source. `kind="commentary"` marks traditional material
  from the Pāli commentaries (for example the Kisā Gotamī story), so it is not
  presented as canonical sutta text.
- English lines are renderings, not a quoted translation.

## Reading epitaka.db

`corpus.EpitakaCorpus` opens the Pāli database read-only (`mode=ro`,
`PRAGMA query_only`) and attaches the translation database:

- `books` → book ids, names, nikāya, paragraph range
- `sentences.pali` → source text, grouped by `(book_id, para_id)`
- `tr.sentences.translation` → translation for the same paragraph
- `tr.summaries` → optional context for the passage

`--db-info` prints the detected paths, tables, columns, preferred reading books
and a few real passages, which is the quickest way to confirm the reader is
pointing at the right database.

If no database is found, the run continues with the bundled corpus and logs a
debug message; it never crashes because of a missing database.

## Output

```
output/stories-from-the-texts/2026-11-06/dhamma_20261106_071500.jpg
output/stories-from-the-texts/2026-11-06/dhamma_20261106_071500.json
output/manifest.jsonl
```

Each JSON file holds the title, card text, caption, composed Facebook caption,
tags, source reference, scenario, format, layout, palette and image prompt.
`output/` is pruned oldest-first at 200 MB.

## Scheduling

```cron
15 6,19 * * * cd /srv/epitaka.org/web_server/scripts && .venv/bin/python dhamma_publisher.py --post-facebook >> logs/cron.log 2>&1
```

Set the server timezone (for example `Asia/Ho_Chi_Minh`) or convert the schedule.
Review one or two `--sample` cards before enabling `--post-facebook`.

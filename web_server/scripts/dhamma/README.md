# Dhamma publisher

One-shot script that plans, writes, renders and optionally publishes a single
Dhamma post — a photo post or a vertical Reel, whichever the plan picks. No
daemon, no Docker, no database writes. Both text and background images come from
Cloudflare Workers AI; source texts come from the bundled corpus and, when
present, `epitaka.db`.

```
web_server/scripts/
├── dhamma_publisher.py          # CLI entry point
├── requirements-dhamma.txt
├── .env                         # keys (not committed)
├── output/<scenario>/<date>/    # generated JPG/MP4 + JSON, grouped for browsing
├── state/history.json           # last 200 plans, used by the variety engine
├── assets/music/                # CC0 background tracks for Reels
└── dhamma/
    ├── config.py                # paths, .env loading, database locations
    ├── cloudflare.py            # Workers AI text + image calls
    ├── corpus.py                # verified verses/stories + epitaka.db reader
    ├── scenarios.py             # scenarios, formats, history, planner
    ├── content.py               # prompts, validation, tags, similarity guard
    ├── render.py                # four card layouts, six palettes
    ├── storage.py               # output folders, manifest, cleanup
    ├── reel.py                  # card → 9:16 MP4 via ffmpeg
    └── facebook.py              # Page photo and Reel upload
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
| `FACEBOOK_PAGE_ACCESS_TOKEN` | only for `--post-facebook`; written by `--setup-facebook-token` |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | App settings → Basic; lets the run renew the Page token |
| `FACEBOOK_LONG_LIVED_USER_TOKEN` | optional; written by `--setup-facebook-token`, used to renew |
| `EPITAKA_DB_PATH` | optional; defaults to `web_server/data/epitaka.db` |
| `EPITAKA_TRANSLATION_DB` | optional; defaults to `epitaka_<lang>.db` beside the Pāli database |
| `EPITAKA_TRANSLATION_LANG` | optional, default `en` |
| `FONT_PATH` / `FONT_PATH_BOLD` | optional TTF overrides for Pāli diacritics |
| `FFMPEG_PATH` | optional; ffmpeg binary for reels, default `ffmpeg` on `PATH` |
| `REEL_MUSIC_DIR` | optional; folder of CC0 music, default `assets/music` |
| `REEL_MUSIC_VOLUME` | optional; background music level, default `0.6` (0–2) |

## Keeping the Page token alive

`FACEBOOK_PAGE_ACCESS_TOKEN` must be a Page token derived from a **long-lived
user token**: that kind never expires, so a daily cron keeps posting. A Page
token taken straight from a short-lived user token dies within hours and
publishing then fails with `HTTP 400 … code 190, subcode 463: Session has
expired`.

### One-time setup

1. Open <https://developers.facebook.com/tools/explorer>, pick the app, choose
   **User Token**, add `pages_show_list`, `pages_manage_posts` and
   `pages_read_engagement`, generate the token, and log in as someone who
   manages the Page. Copy it.
2. Put the app credentials in `.env` (App settings → Basic):

   ```
   FACEBOOK_APP_ID=…
   FACEBOOK_APP_SECRET=…
   FACEBOOK_PAGE_ID=…
   ```

3. Hand the user token to the publisher. It trades it for a ~60-day user token,
   reads that user's Page token, writes `FACEBOOK_PAGE_ACCESS_TOKEN` as one
   unbroken line, and also stores the user token for later repairs:

   ```bash
   python3 dhamma_publisher.py --setup-facebook-token 'PASTE_USER_TOKEN'
   ```

   Expected output includes the Page name and
   `Token expires: never (a Page token from a long-lived user token)`.
   A bare `--setup-facebook-token` re-derives the Page token from the stored
   `FACEBOOK_LONG_LIVED_USER_TOKEN` instead.
4. Check the stored token at any time without posting:

   ```bash
   python3 dhamma_publisher.py --check-facebook-token
   ```

### What the daily run does by itself

When Facebook rejects the stored token — expired, malformed, revoked — the
publisher renews it from `FACEBOOK_LONG_LIVED_USER_TOKEN`, rewrites the
`FACEBOOK_PAGE_ACCESS_TOKEN` line in `.env`, and posts once with the new token.
No manual step and no cron change. The Page token keeps working past the 60-day
life of the user token; only this repair path needs the stored user token to
still be alive. Rerun step 3 if the user token itself has died (password change,
lost Page admin role, app removed).

Manual equivalents, if you prefer curl: exchange the short-lived token at
`/oauth/access_token?grant_type=fb_exchange_token`, read
`/me/accounts?access_token=LONG_LIVED_USER_TOKEN`, and use the Page's
`access_token` (not the user token). <https://developers.facebook.com/tools/debug/accesstoken>
should show `Expires: Never`.

### If publishing still fails

| Error | Cause |
| --- | --- |
| `code 190, subcode 463: Session has expired` | short-lived token (hours) or a revoked one — rerun `--setup-facebook-token` |
| `code 190: Malformed access token` | the value is not usable: truncated paste, line break inside the token, quotes copied from the docs, or a URL/JSON copied instead of the token |
| `cannot be used: …` (before any network call) | the publisher's own shape check; the message says what is wrong |
| `Automatic renewal failed: …` | Facebook refused the stored user token too — rerun `--setup-facebook-token` with a fresh one |
| `code 10 / 200: permissions error` | the user token lacks `pages_manage_posts` / `pages_read_engagement` |

`--setup-facebook-token` writes the line itself, so quoting and line wrapping can
no longer corrupt the token. `--check-facebook-token` prints validity, expiry and
scopes without revealing the token.

## Commands

```bash
python3 dhamma_publisher.py                     # one post, saved only
python3 dhamma_publisher.py --post-facebook     # one post, published (photo or Reel)
python3 dhamma_publisher.py --post-facebook --reel-seconds 15   # Reels are longer
python3 dhamma_publisher.py --text-only         # caption JSON only
python3 dhamma_publisher.py --sample            # offline, no keys needed
python3 dhamma_publisher.py --sample --samples 8  # preview variation
python3 dhamma_publisher.py --db-info           # verify the database reader
python3 dhamma_publisher.py --setup-facebook-token 'USER_TOKEN'  # once: store a non-expiring Page token
python3 dhamma_publisher.py --check-facebook-token               # validity and expiry of the stored token
python3 dhamma_publisher.py --scenario anger-and-repair
python3 dhamma_publisher.py --format tipitaka-story
```

`--scenario` and `--format` override the rotation for one run; `--seed` repeats a
plan when the corpus and history are unchanged. One run publishes one post.

## Photo or Reel, chosen by the plan

`--post-facebook` is the only publishing flag. The planner picks the medium the
same way it picks layout and palette — one of `photo` or `reel`, a fresh coin
flip every run — so a daily cron produces a mix of photo posts and Reels on its
own and the choice is recorded in `state/history.json`. `--reel-seconds` only
affects the runs where a Reel is picked. If ffmpeg cannot render, the run logs
the reason and publishes the card as a photo instead of losing the post.

A Reel takes the same rendered card and turns it into a video: the 4:5 card sits
on a blurred, darkened copy of itself and the frame drifts in slowly, so the text
is never cropped. The MP4 is written beside the JPEG
(`output/<scenario>/<date>/dhamma_<stamp>.mp4`) and uploaded through the Reels
Publishing API — `upload_phase=start`, the binary upload to
`rupload.facebook.com`, then `upload_phase=finish` with
`video_state=PUBLISHED`.

The output matches Meta's specifications: 1080x1920, 30 fps, H.264 High with
4:2:0 chroma, a closed 2-second GOP, and a 48 kHz stereo AAC track. Duration
defaults to 12 seconds; `--reel-seconds` accepts 3 to 90.

A system ffmpeg is preferred (`sudo apt install ffmpeg`). If there is none, the
publisher falls back to the static binary from `imageio-ffmpeg`, which
`requirements-dhamma.txt` installs into the venv — no root needed. When neither
is present the photo post is published instead. Only one Reel is published per
run, and the Reels API allows 30 published posts per Page per 24 hours.

## Background music

The Reels API requires an audio stream, so the MP4 cannot be silent. ffmpeg loops
a track from `assets/music/` under the video, trims it to the reel length, fades
it in over 1.2 s and out over the last second, and mixes it at
`REEL_MUSIC_VOLUME`. When the folder is empty the track is silence, exactly as
before.

Use **CC0 / public-domain tracks only**: the CC0 filter on Free Music Archive or
Openverse, or the Library of Congress Citizen DJ archive. Two CC0 tracks are
bundled, so Reels carry music out of the box (FreePD, a long-standing CC0
source, closed in November 2026). CC0 carries
no attribution requirement and no claimant to match the upload; CC BY-NC and
"royalty-free" tracks do not belong here. `assets/music/README.md` lists the
sources and asks for a `LICENSES.md` beside the files. The track name is stored
in the post JSON (`reel_music`) and a track used in the last four posts is
skipped.

## Where the render runs, and what Cloudflare limits

Nothing in the video pipeline is AI: the card is drawn with Pillow and the MP4
is an ffmpeg filter graph (blurred backdrop, overlay, `zoompan` drift, fades).
Cloudflare Workers AI supplies only the text and the background photograph.

That split matters because a Worker cannot host this render: 128 MB memory per
isolate, 10 ms CPU on the free plan (30 s default, 5 min maximum, on paid), no
native binaries, and ffmpeg.wasm is not usable there (no threads, 128 MB
including Wasm). Cloudflare's own escape hatch is Containers — paid-only, billed
per 10 ms after the $5/month Workers Paid fee — and Workers AI has no video
model. Rendering on the server that already runs this script is free and
unmetered by Cloudflare.

On the free Workers plan, the account-wide budget is 10,000 Neurons per day:
about 173 Neurons for one 1024×1024, 4-step FLUX.1 schnell image and roughly
120 for one llama-3.3-70B reply, so about 30–35 posts a day (fewer when the
similarity retry asks for a second draft). Reels reuse the same image, so video
does not cost extra. Figures are from Cloudflare's Workers AI pricing page and
Workers limits page, both checked in November 2026; recheck them before sizing a
schedule.

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
   repeated from the previous post, plus the medium (photo or 9:16 Reel). Layout,
   palette, medium and scenario are recorded in `state/history.json`.
5. **Checks the draft** against the last eight posts with a word-overlap score.
   If the draft is too close, the model is asked once more with an explicit
   "different opening, different central image" instruction, and the retry is
   logged.

Because scenario, format, source, layout, palette and medium all vary on
separate cycles, consecutive posts diverge in structure as well as in wording.

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
15 6,19 * * * /home/deploy/apps/epitaka/web_server/scripts/run_dhamma_publisher.sh --post-facebook >> /home/deploy/apps/epitaka/web_server/scripts/logs/cron.log 2>&1
```

Reels are part of the same line: the plan picks the medium per run, so a daily
schedule produces a mix of photos and Reels without a second cron entry.
Rendering takes a few seconds of CPU per Reel, so do not schedule more than a
handful of runs a day on a small server.

`run_dhamma_publisher.sh` picks whichever virtualenv has Pillow installed
(`web_server/env`, `web_server/venv`, …), runs from `scripts/`, and forwards
its arguments, so the cron line does not depend on the venv's name.

Set the server timezone (for example `Asia/Ho_Chi_Minh`) or convert the schedule.
Review one or two `--sample` cards before enabling `--post-facebook`.

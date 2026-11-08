# Reel background music

Drop audio files here and `--post-facebook` will loop one under each Reel it
publishes. Supported: `.mp3`, `.m4a`, `.aac`, `.ogg`, `.opus`, `.wav`. Subfolders
are not scanned. `REEL_MUSIC_DIR` points the publisher at another folder.

**Only put public-domain (CC0) tracks here.** A Reel is uploaded to Meta as-is,
and third-party music can be matched by rights holders, muted, or blocked on the
Page. CC0 means no attribution is legally required, no collecting society, and
no Content ID claimant.

## Where to get CC0 tracks

| Source | License | Notes |
| --- | --- | --- |
| [Free Music Archive](https://freemusicarchive.org/) | per track | Filter by **CC0 / Public Domain**; most of FMA is *not* CC0. |
| [Openverse](https://openverse.org/) | per track | Filter `License: CC0`; searches FMA, Jamendo, Wikimedia. |
| [Citizen DJ / Library of Congress](https://citizen-dj.labs.loc.gov/loc-fma/) | public domain | Bulk-archived CC0 subset of FMA; old recordings, good loops. |
| [Pixabay Music](https://pixabay.com/music/) | Pixabay Content License | Free for commercial use, no attribution, but not CC0 — keep the license page URL for each track you use. |
| [SoundSafari/CC0-1.0-Music](https://github.com/SoundSafari/CC0-1.0-Music) | CC0-1.0 | ~40 GB corpus of verified CC0 music from FMA, FreePD, Chosic, Pixabay, Freesound. |

FreePD closed in November 2026, after 17 years; its catalogue is still mirrored
inside the SoundSafari corpus above.

Avoid anything marked CC BY-NC (no commercial use), CC BY-ND (no derivatives),
or "royalty-free" without a written license — Facebook Page posting is a
commercial use.

## Choosing tracks

- Instrumental only; the reel carries no narration, but words fight the text on
  the card.
- Calm, slow, low dynamics. Ambient, piano, drone, soft strings.
- 60 seconds or longer is comfortable; shorter files are looped seamlessly by
  ffmpeg (`-stream_loop -1`), so a loop point that clicks is audible.
- 5–10 tracks is enough to avoid repetition; the publisher skips a track used in
  the last four posts.

The track is trimmed to the reel length, faded in over 1.2 s and out over the
last second, and played at `REEL_MUSIC_VOLUME` (default `0.6`).

## Bundled tracks

Two CC0 tracks ship with the publisher so Reels are never silent out of the box.
Both were converted to mono AAC 96 kbps to keep the repository small; the
licence is unchanged by the format conversion.

| File | Title | Creator | Licence | Source |
| --- | --- | --- | --- | --- |
| `meditation-bowls.m4a` | Meditation Bowls (110 s) | Sandhwani | CC0 1.0 | [freesound.org/s/473813](https://freesound.org/people/Sandhwani/sounds/473813) |
| `meditation-pad.m4a` | meditation pad (166 s) | artefakt | CC0 1.0 | [freesound.org/s/342599](https://freesound.org/people/artefakt/sounds/342599) |

CC0 requires no attribution; the credit above is courtesy and provenance only.
See `LICENSES.md` for the download record.

## Provenance

Keep a `LICENSES.md` in this folder naming each file, its source URL, its
license, and the download date. It costs a minute and answers a takedown
question later. Example:

```
ambient-dawn.mp3 — FreePD, "Dawn", CC0 — https://freepd.com/... — 2026-11-08
```

Large files are fine to keep out of git: add them on the server in this same
folder, or set `REEL_MUSIC_DIR=/srv/epitaka/music` in `.env`.

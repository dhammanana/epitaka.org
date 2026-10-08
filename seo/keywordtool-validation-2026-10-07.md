# KeywordTool guest validation — 2026-10-07

Live check of the `seo/` editorial dataset via the guest MCP
(`https://mcp.keywordtool.io/guest`, server v1.0.1), wired into this
project as `keywordtool-guest` in `opencode.json`.

## Quota

- Guest pool: 60 req/hour, 120 req/day (shared by suggestions calls).
- Used **17** requests this session (12 suggestions + 4 question-mining + quota checks).
- Quota checks are free-ish but count normally; stop at ~50/hour to be safe.

## Method

- `tools/call keywordtool-quota-guest` → fresh pool confirmed.
- `keywordtool-suggestions-guest` (Google, limit 50) for 12 P1 seeds:
  `tipitaka online`, `pali canon english translation`, `dhammapada commentary`,
  `atthakatha`, `pali script converter`, `abhidhamma`, `dhammapada`,
  `theravada buddhism`, `satipatthana sutta`, `sutta study guide`,
  `tipitaka app`, `tam tang pali`.
- `type=questions` for `dhammapada`, `theravada buddhism`, `abhidhamma`.
- One locale-targeted call: `tam tạng pali` with
  `country=Vietnam, language=Vietnamese` — far cleaner than the unqualified
  `tam tang pali` (which returns food noise like "tam tam near me").

## Metrics (the only cached hit)

- Guest returns volume/competition **only when cached** (first 5 rows max).
  Niche Pali terms all came back text-only — expected, not a bug.
- **`dhammapada`: 40,500/mo, competition 0.66, trend 0, top-of-page bid
  $0.06–$0.76.** Supports the editorial KD 62/Hard: real demand, real
  competition. Page-1 needs the commentary/translation differentiator,
  not a plain definition page.
- Noise to ignore: `tam tam near me` (590/mo, food) matched the unqualified
  `tam tang pali` seed — the locale-targeted call fixes this.

## What changed in the dataset

- `build_seo_docs.py` +27 keywords (192→219), +10 questions (118→128);
  regenerated all four files. Every addition is tagged
  `Live suggestion/question-suggestion` in its notes/answer-angle.
- New clusters of note:
  - **Commentary differentiator (live):** `dhammapada atthakatha english
    translation`, `jataka atthakatha`, `dhammapada commentary pdf`,
    `satipatthana sutta commentary`.
  - **Vietnamese (locale-targeted, live):** `kinh tam tạng pali`,
    `chú giải tam tạng pali`, `tam tạng song ngữ pali việt`,
    `tam tạng kinh điển pali pdf`.
  - **Reader intent (live):** `where can i read the dhammapada`,
    `how to read the dhammapada`, `dhammapada online`, `dhammapada pdf`.
  - **Doctrine Q&A (live):** `Where did Theravada Buddhism originate?`,
    `How do I practice Theravada Buddhism?`, `Did the Buddha teach the
    Abhidhamma?`, `Does Theravada Buddhism believe in God?`

## Next steps

1. Pro plan (`https://mcp.keywordtool.io`) unlocks volume/competition on
   **every** keyword + bulk search-volume (up to 1,000/call) — worth it
   before committing budget to P1 head terms (`tipitaka online`,
   `pali canon english translation`, `theravada buddhism`).
2. Validate `dhammapada pdf` / `dhammapada quotes` volumes next (likely
   cached, high intent).
3. Bing-side check: guest covers Bing suggestions too; run the top 5 P1
   seeds with `platform=bing` for the Bing Webmaster Tools push
   (see `ai-discovery-plan.md` §0.2).

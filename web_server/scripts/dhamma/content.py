"""Post writing: prompt construction, validation, similarity guard, tags."""

from __future__ import annotations

import json
import logging
import re

from . import cloudflare
from .scenarios import Plan

LOGGER = logging.getLogger(__name__)

REQUIRED_FIELDS = ("title", "card_text", "caption")

SYSTEM_PROMPT = """You write daily Dhamma posts for a Theravāda Buddhist page read by ordinary people: commuters, parents, people grieving, people who are only curious. You are not a scholar and not a motivational speaker. You sound like one practising friend talking to another: warm, plain, specific, unhurried, occasionally dry. You never sound like a content generator.

HARD RULES
- Quote only material that appears in the brief. Never invent a quotation, a verse or a sutta reference, and never put new words in the Buddha's mouth. If the brief has no verse, do not quote anything.
- Never change the wording of a supplied verse or passage. Never put the supplied source text inside card_text; the card prints it separately.
- No invented Pāli. At most one Pāli word per post, and explain it in ordinary words.
- Banned words and phrases: journey, universe, energy, vibration, manifest, embrace, delve, tapestry, unpack, transformative, guru, "in today's fast-paced world", "we've all been there", "remember that", "it's important to", "inner peace".
- No emoji. No numbered list longer than three items. No rhetorical question stacked on another.
- Concrete before abstract: every post needs at least one physical detail (a sound, an object, a time of day, a gesture).
- Write complete sentences. No comma splices, no run-on sentences. Vary sentence length; a four-word sentence is allowed.
- Do not explain the teaching line by line. Say what it opens in a real life.

Return only a JSON object with exactly these fields:
- title: plain heading, 3 to 7 words, no colon, no question mark
- card_text: the words printed on the image; complete in itself; no hashtags, no quotation marks, no source reference
- caption: the text used for the social post; speak to one reader; it may end with one honest question
- tags: 3 to 6 lowercase hyphenated tags without '#'
- image_detail: at most 10 words, one visual detail for a background photo (no people, no text)
"""


def _brief(plan: Plan, last_cards: list[str]) -> str:
    fmt = plan.fmt
    lines = [
        f"SCENARIO: {plan.scenario.label} - {plan.scenario.intent}",
        f"TONE: {plan.scenario.tone}",
        f"FORMAT: {fmt.label}",
        f"FORMAT INSTRUCTION: {fmt.instruction}",
        f"OPENING: {plan.angle}",
        f"ENDING: {plan.closing}",
        f"CARD TEXT LENGTH: {fmt.card_words[0]}-{fmt.card_words[1]} words",
        f"CAPTION LENGTH: {fmt.caption_words[0]}-{fmt.caption_words[1]} words",
    ]

    if plan.verse:
        lines += [
            "",
            "VERSE (real, printed on the card; not to be repeated in card_text):",
            f"  Reference: {plan.verse.ref}",
            f"  Pāli: {plan.verse.pali.replace(chr(10), ' / ')}",
            f"  Meaning: {plan.verse.english}",
        ]
    if plan.story:
        lines += [
            "",
            f"STORY: {plan.story.title}",
            f"  Source: {plan.story.source} ({plan.story.kind})",
            f"  What happens: {plan.story.summary}",
            f"  What it opens: {plan.story.teaching}",
        ]
        if plan.story.key_line:
            lines += [f"  Only quotable line (verbatim, optional): \"{plan.story.key_line}\""]
        else:
            lines += ["  Do not quote anything: no quotation is supplied for this post."]
    if plan.reading:
        lines += [
            "",
            "READING (real, printed on the card; paraphrase, do not repeat):",
            f"  Reference: {plan.reading.ref} ({plan.reading.book_name})",
            f"  Translation: {plan.reading.translation}",
        ]
        if plan.reading.context:
            lines += [f"  Section title in that edition: {plan.reading.context}"]

    if last_cards:
        lines += ["", "RECENT POST TEXT (do not reuse their openings, images or sentence shapes):"]
        lines += [f"  - {text}" for text in last_cards[-5:]]

    return "\n".join(lines)


def _parse(raw) -> dict:
    if isinstance(raw, dict):
        return raw
    if not isinstance(raw, str):
        raise RuntimeError(f"Workers AI returned no text: {raw!r}"[:600])
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.rstrip().endswith("```"):
            cleaned = cleaned.rstrip()[:-3]
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        first, last = cleaned.find("{"), cleaned.rfind("}")
        if first < 0 or last <= first:
            raise RuntimeError(f"Could not find JSON in the model response: {raw[:600]}")
        return json.loads(cleaned[first:last + 1])


def _word_count(text: str) -> int:
    return len(re.findall(r"[^\s]+", text))


def _normalize(content: dict, plan: Plan) -> dict:
    if not isinstance(content, dict):
        raise RuntimeError("Text model did not return a JSON object.")
    clean: dict = {}
    for key in REQUIRED_FIELDS:
        value = content.get(key)
        if not isinstance(value, str) or not value.strip():
            raise RuntimeError(f"Text model returned an empty '{key}' field.")
        clean[key] = re.sub(r"\s+", " ", value.strip()).strip("\"'“”")

    clean["title"] = clean["title"].rstrip(".:;,")
    if len(clean["title"].split()) > 9:
        clean["title"] = " ".join(clean["title"].split()[:7])
    clean["card_text"] = clean["card_text"].replace("#", "").strip()

    card_words = _word_count(clean["card_text"])
    caption_words = _word_count(clean["caption"])
    if not 8 <= card_words <= 95:
        raise RuntimeError(f"card_text is {card_words} words; expected 8-95.")
    if not 25 <= caption_words <= 230:
        raise RuntimeError(f"caption is {caption_words} words; expected 25-230.")

    raw_tags = content.get("tags")
    tags: list[str] = []
    if isinstance(raw_tags, str):
        raw_tags = re.split(r"[,\s]+", raw_tags)
    if isinstance(raw_tags, list):
        for tag in raw_tags:
            text = re.sub(r"[^a-z0-9-]+", "-", str(tag).lower().replace("#", "")).strip("-")
            if not text or len(text) > 24 or text.count("-") > 2:
                continue
            if text not in tags:
                tags.append(text)

    detail = content.get("image_detail")
    clean["tags"] = tags
    clean["image_detail"] = (
        re.sub(r"\s+", " ", detail).strip(" .") if isinstance(detail, str) else ""
    )
    return clean


_STOPWORDS = {
    "the", "and", "but", "for", "with", "that", "this", "you", "your", "our",
    "are", "was", "were", "have", "has", "had", "not", "its", "it's", "they",
    "them", "their", "when", "what", "who", "how", "why", "can", "could",
    "would", "should", "will", "just", "like", "into", "from", "there", "then",
    "than", "about", "because", "been", "being", "does", "did", "one", "all",
    "now", "still", "very", "more", "most", "some", "any", "own", "out", "you",
    "your", "we", "us", "do", "so", "if", "of", "to", "in", "on", "at", "as",
}


def _tokens(text: str) -> set[str]:
    return {
        word
        for word in re.findall(r"[a-z']+", str(text).lower())
        if len(word) > 2 and word not in _STOPWORDS
    }


def similarity(a: str, b: str) -> float:
    left, right = _tokens(a), _tokens(b)
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def too_similar(text: str, history: list[dict], threshold: float = 0.4, window: int = 8) -> bool:
    for record in history[-window:]:
        if similarity(text, record.get("card_text", "")) >= threshold:
            return True
    return False


def generate_content(plan: Plan, history: list[dict], attempts: int = 3) -> dict:
    last_cards = [record.get("card_text", "") for record in history[-5:] if record.get("card_text")]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": _brief(plan, last_cards)},
    ]
    draft: dict | None = None
    for attempt in range(attempts):
        raw = cloudflare.text_completion(messages, temperature=0.85 + 0.06 * attempt)
        try:
            draft = _normalize(_parse(raw), plan)
        except RuntimeError as exc:
            LOGGER.warning("Draft %d was unusable: %s", attempt + 1, exc)
            LOGGER.debug("Raw response: %s", str(raw)[:1500])
            if attempt == attempts - 1:
                raise
            messages += [
                {
                    "role": "user",
                    "content": (
                        f"That response was unusable ({exc}). Write it again and follow "
                        "the word counts and the JSON fields exactly. card_text must be "
                        "a complete reflection on its own, not a fragment or a heading."
                    ),
                }
            ]
            continue

        draft["tags"] = merge_tags(draft.get("tags", []), plan)
        if attempt == 0 and too_similar(draft["card_text"], history):
            LOGGER.info("Draft was too close to a recent post; asking for a different angle.")
            messages += [
                {
                    "role": "assistant",
                    "content": json.dumps(
                        {k: draft[k] for k in ("title", "card_text", "caption")},
                        ensure_ascii=False,
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "That draft repeats the shape and imagery of recent posts. "
                        "Rewrite it: a different opening sentence, a different central "
                        "image, a different rhythm. Do not reuse any phrase from it. "
                        "Return the same JSON fields."
                    ),
                },
            ]
            continue
        return draft

    assert draft is not None
    LOGGER.warning("Kept a draft that is still close to recent posts.")
    return draft


def merge_tags(model_tags: list[str], plan: Plan) -> list[str]:
    tags: list[str] = []
    for tag in model_tags:
        if tag not in tags:
            tags.append(tag)
    for tag in (*plan.scenario.tags, *plan.fmt.tags):
        if tag not in tags:
            tags.append(tag)
    if plan.verse:
        for topic in plan.verse.topics:
            if topic not in tags:
                tags.append(topic)
    if plan.story:
        for topic in plan.story.topics:
            if topic not in tags:
                tags.append(topic)
    return tags[:6]


def hashtags(tags: list[str]) -> str:
    words = []
    for tag in ["dhamma", *tags]:
        tag = tag.strip("-")
        if not tag or tag in words:
            continue
        words.append(tag)
    return " ".join("#" + "".join(part.capitalize() for part in tag.split("-")) for tag in words[:5])


def compose_caption(post: dict) -> str:
    parts = [post["caption"]]
    if post.get("ref"):
        parts.append(f"— {post['ref']}")
    elif post.get("source_label"):
        parts.append(f"Source: {post['source_label']}")
    parts.append(hashtags(post.get("tags", [])))
    return "\n\n".join(part for part in parts if part)


def build_image_prompt(plan: Plan, content: dict) -> str:
    detail = (content.get("image_detail") or "").strip(" .")
    parts = [plan.scene]
    if detail:
        parts.append(detail)
    parts.append(
        "soft natural light, muted desaturated colours, quiet contemplative atmosphere, "
        "photograph, shallow depth of field, no people, no text, no letters, no watermark"
    )
    return ", ".join(parts)


# -- offline composer (samples and first light without API keys) -----------

_OFFLINE_BODIES = {
    "verse-reflection": (
        "Read it once for the words, then once for the place in you that already "
        "recognises it. Nothing here needs to be believed. It only needs to be "
        "tested on an ordinary afternoon."
    ),
    "quiet-reflection": (
        "It usually arrives in the middle of something unremarkable: a kettle, a "
        "queue, the moment before you answer a message you do not want to answer. "
        "Nothing has to change for it to be seen."
    ),
    "practice-invitation": (
        "Choose one ordinary moment today and let it be the bell. The kettle before "
        "it boils. The door handle. The first step outside. Stay for three breaths, "
        "then continue exactly as you were."
    ),
    "open-question": (
        "The honest answer is that it is not a switch. It is a habit, and habits are "
        "built out of very small repeats, most of which feel like nothing at the time."
    ),
    "tipitaka-story": (
        "The story is old and still slightly uncomfortable, which is probably why it "
        "was kept. Nobody in it is a hero in the way we would cast one."
    ),
    "sutta-reading": (
        "Read it slowly enough to notice which word catches. That word is usually "
        "where the reading is actually happening."
    ),
    "metta-wish": (
        "May you get through today without having to become someone else. May the "
        "difficult hour pass gently, and may you notice when it has."
    ),
}


def _shorten(text: str, max_words: int = 45) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text.strip()
    cut = " ".join(words[:max_words]).rstrip(",;:")
    return cut + " ..."


def offline_content(plan: Plan) -> dict:
    """Deterministic sample text so the renderer can be tried without keys."""
    if plan.story:
        title = plan.story.title
        body = _shorten(plan.story.summary)
    elif plan.reading and plan.reading.translation:
        title = plan.scenario.label
        body = _shorten(plan.reading.translation)
    else:
        title = plan.scenario.label
        body = _OFFLINE_BODIES.get(plan.fmt.key, _OFFLINE_BODIES["quiet-reflection"])

    caption = f"{plan.scenario.intent.capitalize()}. {body} {plan.closing}"
    return {
        "title": title,
        "card_text": body,
        "caption": caption,
        "tags": merge_tags([], plan),
        "image_detail": "",
    }

"""Scenarios, post formats and the planner that keeps consecutive posts apart.

A *scenario* is a recurring editorial situation (morning quiet, anger, grief,
daily practice). A *format* is the shape of the post. The planner rotates both,
plus layout, palette, verse and story, and remembers what was used recently.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from . import config
from .corpus import EpitakaCorpus, Passage, Story, Verse, pick_story, pick_verse
from .render import LAYOUTS, PALETTES

# How a finished card reaches the Page. Chosen with the other presentation
# details, so `--post-facebook` alternates photos and Reels on its own.
MEDIUMS = ("photo", "reel")


@dataclass(frozen=True)
class PostFormat:
    key: str
    label: str
    needs: str  # "verse" | "story" | "reading" | "none"
    instruction: str
    tags: tuple[str, ...]
    card_words: tuple[int, int]
    caption_words: tuple[int, int]


@dataclass(frozen=True)
class Scenario:
    key: str
    label: str
    intent: str
    tone: str
    themes: tuple[str, ...]
    scenes: tuple[str, ...]
    tags: tuple[str, ...]
    formats: tuple[PostFormat, ...]
    quote_bias: float = 0.45


FORMATS: dict[str, PostFormat] = {
    fmt.key: fmt
    for fmt in (
        PostFormat(
            key="verse-reflection",
            label="A verse and what it opens",
            needs="verse",
            instruction=(
                "The brief gives one verse. Do not retell it and do not explain it "
                "word by word. Begin with a concrete moment from ordinary life that "
                "the verse quietly corrects, then leave the reader standing a little "
                "differently in that moment. The verse itself is printed on the card."
            ),
            tags=("verse",),
            card_words=(18, 45),
            caption_words=(55, 110),
        ),
        PostFormat(
            key="quiet-reflection",
            label="A quiet reflection",
            needs="none",
            instruction=(
                "One observation, followed through. No verse is printed, so do not "
                "quote or allude to a quotation. Anchor it in a physical detail: a "
                "sound, an object, a time of day, a small failure."
            ),
            tags=("reflection",),
            card_words=(20, 45),
            caption_words=(50, 105),
        ),
        PostFormat(
            key="practice-invitation",
            label="Something to try today",
            needs="none",
            instruction=(
                "Give one small practice for today that fits inside an ordinary "
                "routine, in two or three plain sentences. No lists longer than three "
                "items, no promises about results, no meditation jargon."
            ),
            tags=("practice",),
            card_words=(20, 50),
            caption_words=(55, 115),
        ),
        PostFormat(
            key="open-question",
            label="A question people actually ask",
            needs="none",
            instruction=(
                "Open with the question in the reader's own words, the slightly "
                "awkward way someone would type it at midnight. Answer as a practising "
                "friend would: honestly, without pretending certainty, without a neat "
                "bow at the end."
            ),
            tags=("question",),
            card_words=(20, 48),
            caption_words=(60, 120),
        ),
        PostFormat(
            key="tipitaka-story",
            label="A story from the texts",
            needs="story",
            instruction=(
                "The brief gives a story with its source. Retell only what is given, "
                "in your own words, with one concrete detail rather than a summary. Do "
                "not add dialogue that is not in the brief and do not invent a "
                "quotation. End on what the story opens, not on a moral."
            ),
            tags=("story",),
            card_words=(25, 65),
            caption_words=(75, 150),
        ),
        PostFormat(
            key="sutta-reading",
            label="A short reading",
            needs="reading",
            instruction=(
                "The brief gives a real passage and its reference. The passage is "
                "printed on the card, so do not repeat it. Say what a reader should "
                "notice in it, in plain language, as if you had just read it together."
            ),
            tags=("reading",),
            card_words=(18, 45),
            caption_words=(55, 115),
        ),
        PostFormat(
            key="metta-wish",
            label="A wish for someone",
            needs="none",
            instruction=(
                "Write a short, unembarrassed wish for another person: the difficult "
                "colleague, the stranger on the bus, the person who is ill. Direct, "
                "warm, no sentimentality, no 'sending love and light'."
            ),
            tags=("metta",),
            card_words=(16, 40),
            caption_words=(45, 95),
        ),
    )
}


def _formats(*keys: str) -> tuple[PostFormat, ...]:
    return tuple(FORMATS[key] for key in keys)


SCENARIOS: tuple[Scenario, ...] = (
    Scenario(
        key="morning-stillness",
        label="Morning stillness",
        intent="the first quiet minutes of the day, before the noise starts",
        tone="calm, unhurried, slightly slow",
        themes=("attention", "diligence", "mind"),
        scenes=(
            "a stone Buddha statue half lost in morning mist, forest temple courtyard, soft grey-green light",
            "a monk in saffron robes walking a misty forest path, seen from behind",
            "a bare swept stone courtyard with a small white cetiya at dawn, faint fog",
            "rain on broad leaves beside an old temple wall, soft grey light",
        ),
        tags=("morning", "stillness"),
        formats=_formats("verse-reflection", "quiet-reflection", "practice-invitation", "metta-wish"),
        quote_bias=0.55,
    ),
    Scenario(
        key="letting-go",
        label="Letting go",
        intent="impermanence and the small daily releases it asks for",
        tone="plain, spacious, not solemn",
        themes=("impermanence", "letting-go", "peace"),
        scenes=(
            "fallen leaves on the wet stone steps of a stupa, muted ochre and grey",
            "river stones and a small brass offering bowl under shallow clear water",
            "an empty walking path through tall grass by a monastery, disappearing into morning fog",
            "a single withered leaf resting on the worn stone base of a Buddha statue",
        ),
        tags=("letting-go", "impermanence"),
        formats=_formats("verse-reflection", "quiet-reflection", "sutta-reading", "open-question"),
        quote_bias=0.6,
    ),
    Scenario(
        key="loving-kindness",
        label="Loving-kindness",
        intent="mettā as something practical, not a mood",
        tone="warm, steady, without sweetness",
        themes=("metta", "compassion", "kindness"),
        scenes=(
            "lotus flowers in a still temple pond, soft dawn light, muted pink and green",
            "a small clay oil lamp burning on a stone ledge beside a Buddha statue at dusk",
            "a saffron robe drying on a bamboo rail in soft afternoon light",
            "a grove of tall sal trees around a forest monastery, soft green haze",
        ),
        tags=("metta", "kindness"),
        formats=_formats("metta-wish", "verse-reflection", "tipitaka-story", "practice-invitation"),
        quote_bias=0.5,
    ),
    Scenario(
        key="anger-and-repair",
        label="Anger and repair",
        intent="what to do with anger after it has already spoken",
        tone="direct, honest, unsentimental, gentle at the end",
        themes=("anger", "forgiveness", "conflict", "resentment"),
        scenes=(
            "storm clouds over an old monastery stupa, dark grey with a thin line of light",
            "rain on the roof tiles of a forest monastery, blurred green trees behind",
            "wet stone steps of a temple after heavy rain, subdued browns and grey",
            "incense smoke rising and thinning in a quiet shrine room, low light",
        ),
        tags=("anger", "forgiveness"),
        formats=_formats("verse-reflection", "quiet-reflection", "open-question", "practice-invitation"),
        quote_bias=0.55,
    ),
    Scenario(
        key="practice-in-daily-life",
        label="Practice in daily life",
        intent="waking up inside ordinary work, traffic, dishes and queues",
        tone="grounded, slightly wry, practical",
        themes=("habit", "effort", "patience", "self-reflection", "practice"),
        scenes=(
            "a plain clay cup and an alms bowl on a wooden table in a monastery kitchen, soft afternoon light",
            "a broom resting against a whitewashed temple wall, swept stone path, warm light",
            "a monk's sandals beside a wooden door, sunlight across the floorboards",
            "a kettle steaming on a charcoal stove in a temple kitchen, warm light",
        ),
        tags=("daily-life", "practice"),
        formats=_formats("practice-invitation", "quiet-reflection", "verse-reflection", "open-question"),
        quote_bias=0.4,
    ),
    Scenario(
        key="generosity",
        label="Giving",
        intent="dāna as the smallest, most ordinary thing",
        tone="plain, generous, free of guilt",
        themes=("generosity", "merit", "truth", "habit"),
        scenes=(
            "an alms bowl resting on worn stone, warm morning light",
            "rice being offered into a monk's alms bowl, hands only, warm morning light",
            "small paper lanterns at a temple at dusk, soft warm glow, muted colours",
            "monsoon rain falling on a temple roof, grey and green",
        ),
        tags=("generosity", "dana"),
        formats=_formats("verse-reflection", "quiet-reflection", "tipitaka-story", "practice-invitation"),
        quote_bias=0.5,
    ),
    Scenario(
        key="stories-from-the-texts",
        label="Stories from the texts",
        intent="old stories that still land in a modern week",
        tone="storytelling, concrete, warm, unhurried",
        themes=("transformation", "courage", "grief", "friendship", "humility"),
        scenes=(
            "an old stone monastery wall with vines, late afternoon light",
            "a saffron robe folded on a wooden bench, soft shadow",
            "a group of monks walking single file along a forest path, seen from behind",
            "an ancient stone step worn smooth by feet at a stupa, close-up, muted grey",
        ),
        tags=("tipitaka", "stories"),
        formats=_formats("tipitaka-story", "tipitaka-story", "verse-reflection", "sutta-reading"),
        quote_bias=0.3,
    ),
    Scenario(
        key="wisdom-and-seeing",
        label="Wisdom and seeing",
        intent="seeing clearly, without adding a story on top",
        tone="spare, clear, quietly demanding",
        themes=("wisdom", "understanding", "impermanence", "mind"),
        scenes=(
            "a weathered Buddha statue seated under a bodhi tree, soft dawn light",
            "the moon reflected in a still temple pond at night, dark blue and silver",
            "bare branches above a small brick cetiya against a pale winter sky",
            "a mountain ridge at dawn beyond a hilltop monastery, muted blue and grey",
        ),
        tags=("wisdom", "insight"),
        formats=_formats("verse-reflection", "sutta-reading", "quiet-reflection", "open-question"),
        quote_bias=0.6,
    ),
    Scenario(
        key="friendship-and-community",
        label="Friendship and community",
        intent="the people we practise with, and the ones we find difficult",
        tone="warm, candid, a little humorous",
        themes=("friendship", "sangha", "speech", "community", "care"),
        scenes=(
            "two monks in saffron robes talking on a monastery porch, seen from behind",
            "monks' alms bowls lined up along a low stone wall, warm muted colours",
            "a narrow forest path between tall trees used by monks, dappled light",
            "tea cups and a small brass bell on a low table in a monastery hall, warm light, no readable text",
        ),
        tags=("friendship", "community"),
        formats=_formats("tipitaka-story", "quiet-reflection", "verse-reflection", "metta-wish"),
        quote_bias=0.45,
    ),
    Scenario(
        key="evening-reflection",
        label="Evening reflection",
        intent="the end of the day, looking back without judgement",
        tone="quiet, honest, low-lit, forgiving",
        themes=("peace", "death", "gratitude", "self-reflection"),
        scenes=(
            "a single candle flame on a shrine altar in a dark room, warm glow, deep shadows",
            "dusk over a calm lake beside a small monastery, deep blue and soft violet",
            "the silhouette of a stupa and trees against the last light, very quiet",
            "a small monastery window at night with warm light and rain outside",
        ),
        tags=("evening", "reflection"),
        formats=_formats("quiet-reflection", "verse-reflection", "open-question", "metta-wish"),
        quote_bias=0.5,
    ),
    Scenario(
        key="first-steps",
        label="First steps",
        intent="for someone curious about the practice and unsure where to begin",
        tone="welcoming, clear, never condescending",
        themes=("beginner", "practice", "ethics", "doubt"),
        scenes=(
            "worn stone steps leading up to a simple temple door, morning light",
            "an empty meditation cushion on a wooden floor, soft side light",
            "a narrow path entering a green forest towards a forest monastery, inviting and quiet",
            "a young monk sweeping leaves in a temple courtyard, seen from a distance",
        ),
        tags=("beginners", "practice"),
        formats=_formats("practice-invitation", "open-question", "verse-reflection", "quiet-reflection"),
        quote_bias=0.4,
    ),
)

SCENARIOS_BY_KEY = {scenario.key: scenario for scenario in SCENARIOS}

ANGLES = (
    "Open inside a small, specific scene: a room, a sound, a time of day.",
    "Open with one short sentence naming a feeling most people would recognise.",
    "Open with the question a person would actually type into a search box.",
    "Open with a small contradiction or surprise, then make sense of it.",
    "Open with an image from the natural world, then turn to the mind.",
    "Open mid-thought, as if continuing a conversation from yesterday.",
    "Open with a plain instruction, no preamble at all.",
    "Open with one line of ordinary dialogue, no attribution.",
)

CLOSINGS = (
    "End on a plain image, not an explanation.",
    "End with one honest question the reader can carry.",
    "End one sentence earlier than feels comfortable.",
    "End by returning to the physical detail you opened with.",
    "End with something the reader can do in the next ten minutes.",
    "End flat and quiet, with no resolution.",
)

AVOID_WORDS = (
    "journey", "universe", "energy", "vibration", "manifest", "embrace",
    "delve", "tapestry", "unpack", "transformative", "guru", "blessed",
    "fast-paced", "mindful journey", "inner peace", "positivity",
)


@dataclass
class Plan:
    scenario: Scenario
    fmt: PostFormat
    layout: str
    palette: str
    angle: str
    closing: str
    scene: str
    medium: str = "photo"
    verse: Verse | None = None
    story: Story | None = None
    reading: Passage | None = None

    def describe(self) -> str:
        pieces = [
            f"scenario={self.scenario.key}",
            f"format={self.fmt.key}",
            f"layout={self.layout}",
            f"medium={self.medium}",
        ]
        if self.verse:
            pieces.append(f"verse={self.verse.ref}")
        if self.story:
            pieces.append(f"story={self.story.key}")
        if self.reading:
            pieces.append(f"reading={self.reading.ref}")
        return " ".join(pieces)


# -- history ---------------------------------------------------------------

def load_history(path: Path | None = None) -> list[dict]:
    path = path or config.HISTORY_FILE
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def append_history(record: dict, path: Path | None = None, limit: int = 200) -> list[dict]:
    path = path or config.HISTORY_FILE
    records = load_history(path)
    records.append(record)
    records = records[-limit:]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    return records


def _recent(history: list[dict], window: int) -> set[str]:
    return {str(item.get("scenario")) for item in history[-window:]}


def _rotate(options, history: list[dict], key: str, rng: random.Random):
    recent = {item.get(key) for item in history[-2:]}
    pool = [option for option in options if option not in recent] or list(options)
    return rng.choice(pool)


def build_plan(
    history: list[dict],
    corpus: EpitakaCorpus,
    rng: random.Random,
    scenario_key: str | None = None,
    format_key: str | None = None,
) -> Plan:
    if scenario_key:
        if scenario_key not in SCENARIOS_BY_KEY:
            raise ValueError(
                f"Unknown scenario '{scenario_key}'. "
                f"Choose from: {', '.join(SCENARIOS_BY_KEY)}"
            )
        scenario = SCENARIOS_BY_KEY[scenario_key]
    else:
        recent_scenarios = _recent(history, 2)
        pool = [s for s in SCENARIOS if s.key not in recent_scenarios] or list(SCENARIOS)
        scenario = rng.choice(pool)

    if format_key:
        if format_key not in FORMATS:
            raise ValueError(
                f"Unknown format '{format_key}'. Choose from: {', '.join(FORMATS)}"
            )
        fmt = FORMATS[format_key]
        if fmt not in scenario.formats:
            fmt = FORMATS["quiet-reflection"]
    else:
        recent_formats = {item.get("format") for item in history[-2:]}
        pool = [f for f in scenario.formats if f.key not in recent_formats] or list(scenario.formats)
        fmt = rng.choice(pool)

    used_refs = [item.get("ref") for item in history[-20:] if item.get("ref")]
    used_stories = [item.get("story") for item in history[-20:] if item.get("story")]

    verse = story = reading = None
    if fmt.needs == "verse":
        verse = pick_verse(scenario.themes, used_refs, rng)
    elif fmt.needs == "story":
        story = pick_story(scenario.themes, used_stories, rng)
    elif fmt.needs == "reading":
        reading = corpus.random_reading(rng, used_refs) if corpus.available else None
        if reading is None:
            fmt = FORMATS["quiet-reflection"]

    if fmt.needs == "none" and rng.random() < scenario.quote_bias:
        verse = pick_verse(scenario.themes, used_refs, rng)

    return Plan(
        scenario=scenario,
        fmt=fmt,
        layout=_rotate(LAYOUTS, history, "layout", rng),
        palette=_rotate(list(PALETTES), history, "palette", rng),
        medium=_rotate(MEDIUMS, history, "medium", rng),
        angle=rng.choice(ANGLES),
        closing=rng.choice(CLOSINGS),
        scene=rng.choice(scenario.scenes),
        verse=verse,
        story=story,
        reading=reading,
    )


def record_for(plan: Plan, post: dict, when: datetime, image: str | None) -> dict:
    return {
        "time": when.isoformat(timespec="seconds"),
        "scenario": plan.scenario.key,
        "format": plan.fmt.key,
        "layout": plan.layout,
        "palette": plan.palette,
        "medium": plan.medium,
        "ref": post.get("ref"),
        "story": plan.story.key if plan.story else None,
        "title": post.get("title"),
        "card_text": post.get("card_text"),
        "tags": post.get("tags"),
        "image": image,
        "reel_music": post.get("reel_music"),
    }

"""Source material for posts.

Two layers:

* ``VERSES`` / ``STORIES`` - a small, hand-checked corpus so a post can always
  be built with an accurate quotation, even without the database.
* ``EpitakaCorpus`` - read-only access to ``epitaka.db`` (Pāli) joined with the
  per-language ``epitaka_<lang>.db`` translations, plus the ``summaries`` table
  when the translation database provides it.

Nothing here writes to the database.
"""

from __future__ import annotations

import logging
import re
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

from . import config

LOGGER = logging.getLogger(__name__)

# Books whose texts make good standalone readings. Matched against book_name so
# the reader also works if book ids differ between database builds.
PREFERRED_BOOK_NAMES = (
    "Dhammapada",
    "Udāna",
    "Itivuttaka",
    "Sutta Nipāta",
    "Theragāthā",
    "Therīgāthā",
    "Khuddakapāṭha",
)


@dataclass(frozen=True)
class Verse:
    ref: str
    pali: str
    english: str
    topics: tuple[str, ...]


@dataclass(frozen=True)
class Story:
    key: str
    title: str
    source: str
    kind: str  # "sutta" | "commentary"
    summary: str
    teaching: str
    key_line: str
    topics: tuple[str, ...]


@dataclass(frozen=True)
class Passage:
    ref: str
    book_id: str
    book_name: str
    para_id: int
    pali: str
    translation: str
    confidence: str
    context: str = ""


def _v(ref: str, pali: str, english: str, topics: Sequence[str]) -> Verse:
    return Verse(ref=ref, pali=pali, english=english, topics=tuple(topics))


# English lines are fresh renderings written for this publisher; the Pāli is the
# source text. Verses are quoted whole, never spliced with new wording.
VERSES: tuple[Verse, ...] = (
    _v(
        "Dhammapada 1",
        "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;\n"
        "Manasā ce paduṭṭhena, bhāsati vā karoti vā;\n"
        "Tato naṃ dukkhamanveti, cakkaṃva vahato padaṃ.",
        "Mind runs ahead of everything we experience; mind is chief, and "
        "everything is shaped by mind. Speak or act from a troubled mind and "
        "suffering follows, the way the wheel follows the ox's hoof.",
        ("mind", "intention", "habit"),
    ),
    _v(
        "Dhammapada 3",
        "Akkocchi maṃ avadhi maṃ, ajini maṃ ahāsi me;\n"
        "Ye ca taṃ upanayhanti, veraṃ tesaṃ na sammati.",
        "\"They insulted me, struck me, defeated me, robbed me.\" Those who "
        "keep turning that over never let their hatred settle.",
        ("anger", "resentment", "forgiveness"),
    ),
    _v(
        "Dhammapada 5",
        "Na hi verena verāni, sammantīdha kudācanaṃ;\n"
        "Averena ca sammanti, esa dhammo sanantano.",
        "Hatred is never settled by hatred, not here, not ever. It is settled "
        "by non-hatred alone. This is a law that does not change.",
        ("anger", "forgiveness", "metta"),
    ),
    _v(
        "Dhammapada 6",
        "Pare ca na vijānanti, mayamettha yamāmase;\n"
        "Ye ca tattha vijānanti, tato sammanti medhagā.",
        "Others do not understand that we have to restrain ourselves here. "
        "Those who do understand bring their quarrels to an end.",
        ("conflict", "self-reflection", "speech"),
    ),
    _v(
        "Dhammapada 21",
        "Appamādo amatapadaṃ, pamādo maccuno padaṃ;\n"
        "Appamattā na mīyanti, ye pamattā yathā matā.",
        "Heedfulness is the road to the deathless; carelessness is the road "
        "to death. The heedful do not die; the heedless are like people "
        "already gone.",
        ("diligence", "practice", "attention"),
    ),
    _v(
        "Dhammapada 26",
        "Pamādamanuyuñjanti, bālā dummedhino janā;\n"
        "Appamādañca medhāvī, dhanaṃ seṭṭhaṃva rakkhati.",
        "Foolish people give themselves to carelessness. The wise one guards "
        "heedfulness the way one guards a treasure.",
        ("diligence", "wisdom", "habit"),
    ),
    _v(
        "Dhammapada 35",
        "Dunniggahassa lahuno, yatthakāmanipātino;\n"
        "Cittassa damatho sādhu, cittaṃ dantaṃ sukhāvahaṃ.",
        "The mind is hard to hold back, light, landing wherever it likes. It "
        "is good to train it. A trained mind brings happiness.",
        ("mind", "restraint", "meditation"),
    ),
    _v(
        "Dhammapada 50",
        "Na paresaṃ vilomāni, na paresaṃ katākataṃ;\n"
        "Attano va avekkheyya, katāni akatāni ca.",
        "Do not go looking for what others did wrong, or what they did or did "
        "not do. Look instead at what you yourself have done and left undone.",
        ("self-reflection", "humility", "speech"),
    ),
    _v(
        "Dhammapada 60",
        "Dīghā jāgarato ratti, dīghaṃ santassa yojanaṃ;\n"
        "Dīgho bālānaṃ saṃsāro, saddhammaṃ avijānataṃ.",
        "Long is the night for the one who cannot sleep. Long is the road for "
        "the tired. Long is the wandering for the foolish who do not know the "
        "true Dhamma.",
        ("patience", "understanding", "effort"),
    ),
    _v(
        "Dhammapada 103",
        "Yo sahassaṃ sahassena, saṅgāme mānuse jine;\n"
        "Ekañca jeyyamattānaṃ, sa ve saṅgāmajuttamo.",
        "Someone might defeat a thousand men a thousand times in battle. The "
        "one who defeats themselves is the greater victor.",
        ("self-mastery", "courage", "effort"),
    ),
    _v(
        "Dhammapada 112",
        "Yo ca vassasataṃ jīve, kusīto hīnavīriyo;\n"
        "Ekāhaṃ jīvitaṃ seyyo, viriyamārabhato daḷhaṃ.",
        "Better one day of effort and resolve than a hundred years lived idle "
        "and without strength.",
        ("effort", "urgency", "practice"),
    ),
    _v(
        "Dhammapada 118",
        "Puññaṃ ce puriso kayirā, kayirā naṃ punappunaṃ;\n"
        "Tamhi chandaṃ kayirātha, sukho puññassa uccayo.",
        "If someone does something good, they should do it again and again. "
        "They should enjoy it. Happiness grows from good done over and over.",
        ("generosity", "habit", "merit"),
    ),
    _v(
        "Dhammapada 121",
        "Māvamaññetha pāpassa, na mantaṃ āgamissati;\n"
        "Udabindunipātena, udakumbho pi pūrati;\n"
        "Bālo pūrati pāpassa, thokaṃ thokaṃ pi ācinaṃ.",
        "Do not treat a small wrong as nothing, thinking it will not reach "
        "you. A jar fills drop by drop. A fool fills up with wrong, gathered "
        "little by little.",
        ("habit", "heedfulness", "ethics"),
    ),
    _v(
        "Dhammapada 122",
        "Māvamaññetha puññassa, na mantaṃ āgamissati;\n"
        "Udabindunipātena, udakumbho pi pūrati;\n"
        "Dhīro pūrati puññassa, thokaṃ thokaṃ pi ācinaṃ.",
        "Do not treat a small good as nothing, thinking it will not reach you. "
        "A jar fills drop by drop. A wise person fills up with good, gathered "
        "little by little.",
        ("habit", "merit", "generosity"),
    ),
    _v(
        "Dhammapada 165",
        "Attanā hi kataṃ pāpaṃ, attanā saṃkilissati;\n"
        "Attanā akataṃ pāpaṃ, attanā va visujjhati;\n"
        "Suddhī asuddhī paccattaṃ, nāñño aññaṃ visodhaye.",
        "Wrong is done by oneself; by oneself one is stained. Wrong is left "
        "undone by oneself; by oneself one becomes clean. Purity belongs to "
        "each person. No one can make another pure.",
        ("responsibility", "purification", "self-reliance"),
    ),
    _v(
        "Dhammapada 183",
        "Sabbapāpassa akaraṇaṃ, kusalassa upasampadā;\n"
        "Sacittapariyodapanaṃ, etaṃ buddhāna sāsanaṃ.",
        "Not doing any wrong, taking up what is wholesome, cleaning one's own "
        "mind: this is the teaching of the Buddhas.",
        ("ethics", "practice", "purification"),
    ),
    _v(
        "Dhammapada 197",
        "Susukhaṃ vata jīvāma, verinesu averino;\n"
        "Verinesu manussesu, viharāma averino.",
        "We live happily indeed, without hatred among those who hate; among "
        "hateful people we dwell free of hatred.",
        ("metta", "forgiveness", "peace"),
    ),
    _v(
        "Dhammapada 202",
        "Natthi rāgasamo aggi, natthi dosasamo kali;\n"
        "Natthi khandhasamā dukkhā, natthi santiparaṃ sukhaṃ.",
        "There is no fire like lust, no stain like ill will. There is no "
        "suffering like the body-and-mind we carry, and no happiness greater "
        "than peace.",
        ("peace", "letting-go", "mind"),
    ),
    _v(
        "Dhammapada 223",
        "Akkodhena jine kodhaṃ, asādhuṃ sādhunā jine;\n"
        "Jine kadariyaṃ dānena, saccenālikavādinaṃ.",
        "Beat anger with non-anger. Beat what is unwholesome with what is "
        "wholesome. Beat stinginess with giving. Beat a lie with the truth.",
        ("anger", "generosity", "truth"),
    ),
    _v(
        "Dhammapada 224",
        "Saccaṃ bhaṇe na kujjheyya, dajjā appampi yācito;\n"
        "Etehi tīhi ṭhānehi, gacche devāna santike.",
        "Speak the truth. Do not give in to anger. Give when asked, even if "
        "only a little. These three things lead to the gods.",
        ("truth", "generosity", "anger"),
    ),
    _v(
        "Dhammapada 270",
        "Na tena ariyo hoti, yena pāṇāni hiṃsati;\n"
        "Ahiṃsā sabbapāṇānaṃ, ariyo'ti pavuccati.",
        "A person is not noble because they harm living beings. One who harms "
        "no living being at all is called noble.",
        ("compassion", "non-harm", "ethics"),
    ),
    _v(
        "Dhammapada 277",
        "Sabbe saṅkhārā aniccāti, yadā paññāya passati;\n"
        "Atha nibbindati dukkhe, esa maggo visuddhiyā.",
        "All conditioned things pass. When you see this with wisdom, you turn "
        "away from suffering. This is the road to purity.",
        ("impermanence", "wisdom", "letting-go"),
    ),
    _v(
        "Dhammapada 328",
        "Sace labhetha nipakaṃ sahāyaṃ, saddhiṃcaraṃ sādhuvihāridhīraṃ;\n"
        "Abhibhuyya sabbāni parissayāni, careyya tenattamano satīmā.",
        "If you find a wise companion, someone who lives well and walks "
        "steadily, go with them, glad and mindful, and you will get through "
        "every danger.",
        ("friendship", "sangha", "courage"),
    ),
    _v(
        "Dhammapada 380",
        "Attā hi attano nātho, ko hi nātho paro siyā;\n"
        "Attanā hi sudantena, nāthaṃ labhati dullabhaṃ.",
        "You are your own support. Who else could be? When you have trained "
        "yourself well, you find a support that is hard to find.",
        ("self-reliance", "practice", "courage"),
    ),
    _v(
        "Sutta Nipāta 1.8",
        "Sukhino vā khemino hontu, sabbe sattā bhavantu sukhitattā.",
        "May all beings be happy and safe. May every living being be glad at "
        "heart.",
        ("metta", "kindness", "compassion"),
    ),
    _v(
        "Sutta Nipāta 1.8",
        "Mātā yathā niyaṃ puttaṃ, āyusā ekaputtamanurakkhe;\n"
        "Evampi sabbabhūtesu, mānasaṃ bhāvaye aparimāṇaṃ.",
        "As a mother protects her only child with her own life, so let the "
        "heart be boundless toward every living thing.",
        ("metta", "compassion", "kindness"),
    ),
)


STORIES: tuple[Story, ...] = (
    Story(
        key="sona-lute",
        title="The string that was too tight",
        source="AN 6.55 (Soṇasutta)",
        kind="sutta",
        summary=(
            "Soṇa was a musician's son who became a monk and practised until his "
            "feet bled, yet still felt stuck. He thought about going home. The "
            "Buddha asked him how a lute sounds when its strings are too tight, "
            "too loose, or tuned evenly. Soṇa answered: only the evenly tuned "
            "strings sound right. Practise like that, the Buddha said, and Soṇa "
            "found the middle way of effort."
        ),
        teaching="Effort that strains breaks; effort that slackens stalls.",
        key_line="",
        topics=("effort", "patience", "practice", "balance"),
    ),
    Story(
        key="bahiya",
        title="Only the seen",
        source="Ud 1.10 (Bāhiyasutta)",
        kind="sutta",
        summary=(
            "Bāhiya believed he was already free. A deity told him he was not, "
            "and he walked through the night to find the Buddha, who was out on "
            "almsround. In a few sentences the Buddha told him: in what is seen, "
            "let there be only the seen; in what is heard, only the heard. "
            "Bāhiya understood on the spot. He died not long after, and the "
            "Buddha named him foremost among those quick to understand."
        ),
        teaching="A mind that has been prepared can open in a single sentence.",
        key_line="In the seen, only the seen; in the heard, only the heard.",
        topics=("attention", "wisdom", "letting-go", "understanding"),
    ),
    Story(
        key="angulimala",
        title="I have stopped",
        source="MN 86 (Aṅgulimālasutta)",
        kind="sutta",
        summary=(
            "Aṅgulimāla was a bandit who wore a necklace of fingers and terrified "
            "the whole region. He ran after the Buddha, who kept walking calmly. "
            "Aṅgulimāla shouted, \"Stop!\" The Buddha answered that he had "
            "stopped, and that Aṅgulimāla had not. Something in that landed. He "
            "ordained, and later endured stones and insults without hating back."
        ),
        teaching="No past is a final sentence on anyone.",
        key_line="I have stopped, Aṅgulimāla; you have not stopped.",
        topics=("transformation", "forgiveness", "courage", "compassion"),
    ),
    Story(
        key="cula-panthaka",
        title="The cloth of dust",
        source="Dhammapada commentary (traditional)",
        kind="commentary",
        summary=(
            "Cūḷa Panthaka could not remember one verse in four months. His "
            "brother, tired of it, told him to leave the monastery. The Buddha "
            "gave him a plain cloth and asked him to rub it while repeating, "
            "\"rajoharaṇaṃ\" - cloth of dust. Day after day Cūḷa Panthaka rubbed "
            "it, and saw the cloth grow soiled and thin. That simple attention "
            "became his way in."
        ),
        teaching="Steady attention often arrives where cleverness cannot.",
        key_line="",
        topics=("patience", "effort", "attention", "beginner"),
    ),
    Story(
        key="kisa-gotami",
        title="A handful of mustard seeds",
        source="Dhammapada commentary, verses in Therīgāthā 10.1",
        kind="commentary",
        summary=(
            "Kisā Gotamī's small child died, and she carried the body from house "
            "to house asking for medicine. The Buddha asked her to bring a "
            "handful of mustard seeds from a home where no one had ever died. "
            "She searched the whole village and found none. She understood what "
            "she had been asking, and went back to bury her child."
        ),
        teaching="Grief is not a private failure; it is the price of having loved.",
        key_line="",
        topics=("grief", "death", "compassion", "understanding"),
    ),
    Story(
        key="patacara",
        title="The path she was already walking",
        source="Dhammapada commentary, verses in Therīgāthā 5.10",
        kind="commentary",
        summary=(
            "Paṭācārā lost her husband, her children and her parents in a few "
            "days. She wandered half-mad until she came to the Buddha, who "
            "received her without judgement. Her own grief, seen clearly, became "
            "the ground of her freedom. She later taught other women whose lives "
            "had broken in the same places."
        ),
        teaching="What breaks us can also be the place where understanding begins.",
        key_line="",
        topics=("grief", "loss", "transformation", "compassion"),
    ),
    Story(
        key="suppabuddha",
        title="The man at the back",
        source="Ud 5.3 (Suppabuddhakuṭṭhisutta)",
        kind="sutta",
        summary=(
            "Suppabuddha was a leper, poor and shunned. Seeing a crowd gathered "
            "for a teaching, he sat at the very back. The Buddha welcomed him "
            "by name and taught in careful steps until his mind was ready and "
            "unguarded. Before long Suppabuddha was declared a stream-enterer. "
            "Then he was gored by a cow and died."
        ),
        teaching="You cannot judge the depth of a person by the surface of their life.",
        key_line="Whatever has the nature to arise, all of it has the nature to cease.",
        topics=("compassion", "humility", "death", "understanding"),
    ),
    Story(
        key="meghiya",
        title="The mango grove",
        source="Ud 4.1 (Meghiyasutta)",
        kind="sutta",
        summary=(
            "Meghiya was the Buddha's attendant for a while. One afternoon, while "
            "alone, his mind kept pulling toward a beautiful mango grove and he "
            "wanted to meditate there. The Buddha asked him to wait, twice. "
            "Meghiya went anyway, and the quiet grove filled with restless "
            "thoughts. He came back, and the Buddha spoke about good company and "
            "the slow ripening of a mind."
        ),
        teaching="Even a beautiful place cannot do the work the mind is not yet ready for.",
        key_line="",
        topics=("friendship", "patience", "practice", "balance"),
    ),
    Story(
        key="sick-monk",
        title="The monk nobody nursed",
        source="Vinaya, Mahāvagga",
        kind="sutta",
        summary=(
            "One monk fell severely ill and lay in his own filth, cared for by "
            "nobody. The Buddha came with Ānanda, had water brought, and washed "
            "him with his own hands. Then he called the monks together and said "
            "plainly: whoever would look after him should look after the sick."
        ),
        teaching="Care is not an interruption of practice; it is practice.",
        key_line="Whoever would nurse me should nurse the sick.",
        topics=("compassion", "community", "generosity", "care"),
    ),
    Story(
        key="nanda",
        title="Borrowed motivation",
        source="Ud 3.2 (Nandasutta)",
        kind="sutta",
        summary=(
            "Nanda was about to be married and was not happy about ordaining. The "
            "Buddha took him to see the deva women and asked whether they or his "
            "fiancée were lovelier. Nanda's motivation shifted, uncomfortably. "
            "The monks teased him for practising for a lesser aim. In time that "
            "borrowed wish matured into something honest, and he became one of "
            "the awakened."
        ),
        teaching="It is fine to begin for a small reason; the practice will ask more of you later.",
        key_line="",
        topics=("motivation", "practice", "humility", "transformation"),
    ),
    Story(
        key="sigala",
        title="Six directions",
        source="DN 31 (Sigalovādasutta)",
        kind="sutta",
        summary=(
            "Sigāla was a young man who worshipped the six directions each "
            "morning, as his father had asked. The Buddha did not mock it. He "
            "reinterpreted it: parents, teachers, spouse, friends, workers and "
            "the ascetics are the six directions, and each comes with duty in "
            "both directions, the ones you owe and the ones owed to you."
        ),
        teaching="Compassion becomes real when it is specific and mutual.",
        key_line="",
        topics=("friendship", "ethics", "family", "community"),
    ),
    Story(
        key="raft",
        title="The raft",
        source="MN 22 (Alagaddūpamasutta)",
        kind="sutta",
        summary=(
            "The Buddha compared the teaching to a raft. You build a raft to cross "
            "a dangerous river, then you leave it on the bank and go on. You do "
            "not carry it on your head. The point is not to collect the teaching "
            "or defend it, but to use it and put it down."
        ),
        teaching="Even the map must be released once you are walking.",
        key_line="The teaching is like a raft: for crossing over, not for grasping.",
        topics=("letting-go", "wisdom", "practice", "understanding"),
    ),
    Story(
        key="nalagiri",
        title="The elephant and the open hand",
        source="Vinaya, Cūḷavagga",
        kind="sutta",
        summary=(
            "Devadatta arranged for the great elephant Nāḷāgiri, drunk and "
            "enraged, to be released down a street where the Buddha was walking. "
            "Ānanda stood in front of the Buddha. The Buddha held his ground and "
            "radiated kindness; the elephant stopped, then lowered his head to "
            "the ground. It is told that the streets went quiet."
        ),
        teaching="Kindness can meet what force cannot.",
        key_line="",
        topics=("metta", "compassion", "fear", "courage"),
    ),
)


def verse_by_ref(ref: str) -> Verse | None:
    for verse in VERSES:
        if verse.ref == ref:
            return verse
    return None


def pick_verse(topics: Iterable[str], used_refs: Iterable[str], rng) -> Verse:
    used = set(used_refs)
    unused = [v for v in VERSES if v.ref not in used]
    wanted = set(topics)
    matching = [v for v in unused if wanted.intersection(v.topics)]
    pool = matching or unused or list(VERSES)
    return rng.choice(pool)


def pick_story(topics: Iterable[str], used_keys: Iterable[str], rng) -> Story:
    used = set(used_keys)
    unused = [s for s in STORIES if s.key not in used]
    wanted = set(topics)
    matching = [s for s in unused if wanted.intersection(s.topics)]
    pool = matching or unused or list(STORIES)
    return rng.choice(pool)


def _clean(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text.replace("\u00a0", " "))
    return text.strip()


def _display_name(book_name: str) -> str:
    """'Dhammapadapāḷi' -> 'Dhammapada', for card references."""
    name = book_name.strip()
    for suffix in ("pāḷi", "aṭṭhakathā", "ṭīkā"):
        if name.lower().endswith(suffix):
            name = name[: -len(suffix)].rstrip(" -")
    return name or book_name


_BOOK_REF_PREFIX = {
    "Dhp": "Dhammapada",
    "Ud": "Udāna",
    "It": "Itivuttaka",
    "Khp": "Khuddakapāṭha",
    "Th": "Theragāthā",
    "Thī": "Therīgāthā",
}


def _canonical_ref(title: str) -> str:
    """'Dhp 5: Hatred Ceases ...' -> 'Dhammapada 5'; '' when unnumbered.

    A descriptive summary title is not a citation, and a section index such as
    "Blessings 7" is not a verse number, so units without a recognisable book
    reference are not used as readings.
    """
    label = title.split(" — ")[0].strip()
    head = label.split(":")[0].strip()
    match = re.match(r"^([A-Za-zĀ-ž]+)\s+(\d+(?:\.\d+)*)", head)
    if not match:
        return ""
    prefix, number = match.group(1), match.group(2)
    if prefix not in _BOOK_REF_PREFIX and prefix not in _BOOK_REF_PREFIX.values():
        return ""
    return f"{_BOOK_REF_PREFIX.get(prefix, prefix)} {number}"


def _quoted_line(line: str) -> str:
    """Strip verse numbers, variant marks and stray spaces before quoting."""
    line = re.sub(r"\[[^\]]*\]", "", line)
    line = re.sub(r"^\d+\.\s*", "", line.strip())
    line = re.sub(r"\s+([,.;:!?])", r"\1", line)
    return re.sub(r"\s{2,}", " ", line).strip()


def _quoted_pali(lines: Iterable[str]) -> str:
    """Clean Pāli lines and drop trailing edition notes (chapter colophons)."""
    cleaned = [_quoted_line(line) for line in lines if line.strip()]
    while cleaned and _CHAPTER_NOTE.match(cleaned[-1]):
        cleaned.pop()
    return "\n".join(cleaned)


_CHAPTER_NOTE = re.compile(
    r"^\s*(?:\d+\.\s*)?(?:the\s+)?(?:[a-zāīū]+(?:-[a-zāīū]+)?\s+)?"
    r"(?:chapter|vagga)\b",
    re.IGNORECASE,
)


def _quoted_prose(text: str) -> str:
    """Strip variant marks and editorial chapter notes from a translation."""
    text = re.sub(r"\[[^\]]*\]", "", text)
    text = re.sub(r"^\s*\d+\.\s*", "", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", re.sub(r"\s{2,}", " ", text).strip()) if s]
    return " ".join(s for s in sentences if not _CHAPTER_NOTE.match(s)).strip()


class EpitakaCorpus:
    """Read-only reader for epitaka.db + a translation database."""

    def __init__(self, pali_db: Path | None = None, translation_db: Path | None = None):
        self.pali_db = Path(pali_db or config.pali_db_path())
        self.translation_db = (
            Path(translation_db)
            if translation_db
            else config.translation_db_path(self.pali_db)
        )
        self._connection: sqlite3.Connection | None = None
        self._books: dict[str, dict] | None = None
        self._failed = False

    # -- connection -----------------------------------------------------
    @property
    def available(self) -> bool:
        return self.connection is not None

    def connection(self) -> sqlite3.Connection | None:
        if self._connection is not None or self._failed:
            return self._connection
        if not self.pali_db.is_file():
            LOGGER.debug("epitaka.db not found at %s", self.pali_db)
            return None
        try:
            con = sqlite3.connect(f"file:{self.pali_db}?mode=ro", uri=True)
            con.row_factory = sqlite3.Row
            con.execute("PRAGMA query_only = 1")
            if self.translation_db and self.translation_db.is_file():
                con.execute(
                    "ATTACH DATABASE ? AS tr",
                    (f"file:{self.translation_db}?mode=ro",),
                )
            tables = {
                row[0]
                for row in con.execute(
                    "SELECT name FROM sqlite_master WHERE type IN ('table','view')"
                )
            }
            if "sentences" not in tables:
                LOGGER.warning("%s has no 'sentences' table; corpus disabled", self.pali_db)
                con.close()
                self._failed = True
                return None
            self._connection = con
            return con
        except sqlite3.Error as exc:
            LOGGER.warning("Could not open %s: %s", self.pali_db, exc)
            self._failed = True
            return None

    def close(self) -> None:
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    # -- books ----------------------------------------------------------
    def books(self) -> dict[str, dict]:
        if self._books is not None:
            return self._books
        con = self.connection()
        self._books = {}
        if con is None:
            return self._books
        try:
            rows = con.execute(
                "SELECT book_id, book_name, nikaya, sub_nikaya, category, para_id, "
                "chapter_len FROM books"
            )
        except sqlite3.Error as exc:
            LOGGER.debug("books table unavailable: %s", exc)
            return self._books
        for row in rows:
            self._books[str(row["book_id"])] = {
                "book_id": str(row["book_id"]),
                "book_name": row["book_name"] or "",
                "nikaya": row["nikaya"] or "",
                "sub_nikaya": row["sub_nikaya"] or "",
                "category": row["category"] or "",
                "start": int(row["para_id"] or 1),
                "length": int(row["chapter_len"] or 0),
            }
        return self._books

    def preferred_books(self) -> list[dict]:
        """Canonical (mūla) books only: no commentaries, ṭīkā or nissaya."""
        found = []
        for book in self.books().values():
            name = book["book_name"].lower()
            if book["category"] and book["category"] != "Mūla":
                continue
            if any(skip in name for skip in ("aṭṭhakathā", "ṭīkā", "nissaya", "commentary")):
                continue
            if any(preferred.lower() in name for preferred in PREFERRED_BOOK_NAMES):
                found.append(book)
        return found

    # -- passages -------------------------------------------------------
    def _translation(self, con: sqlite3.Connection, book_id: str, para_id: int) -> tuple[str, str]:
        if "tr" not in {row[1] for row in con.execute("PRAGMA database_list")}:
            return "", ""
        try:
            row = con.execute(
                "SELECT translation, translation_confidence FROM tr.sentences "
                "WHERE book_id = ? AND para_id = ? ORDER BY line_id LIMIT 1",
                (book_id, para_id),
            ).fetchone()
        except sqlite3.Error:
            return "", ""
        if row is None:
            return "", ""
        return _clean(row["translation"] or ""), (row["translation_confidence"] or "")

    def passage(self, book_id: str, para_id: int) -> Passage | None:
        con = self.connection()
        if con is None:
            return None
        book = self.books().get(book_id)
        if not book:
            return None
        try:
            rows = con.execute(
                "SELECT pali FROM sentences WHERE book_id = ? AND para_id = ? "
                "ORDER BY line_id",
                (book_id, para_id),
            ).fetchall()
        except sqlite3.Error:
            return None
        pali = "\n".join(_clean(row["pali"] or "") for row in rows if (row["pali"] or "").strip())
        if not pali:
            return None
        translation, confidence = self._translation(con, book_id, para_id)
        return Passage(
            ref=f"{_display_name(book['book_name'])} ¶{para_id}",
            book_id=book_id,
            book_name=book["book_name"],
            para_id=para_id,
            pali=pali,
            translation=translation,
            confidence=confidence,
            context=self.summary_title(book_id, para_id),
        )

    def summary_title(self, book_id: str, para_id: int) -> str:
        """Editorial section title for a paragraph, if the edition has one."""
        con = self.connection()
        if con is None:
            return ""
        try:
            row = con.execute(
                "SELECT title FROM tr.summaries WHERE book_id = ? "
                "AND para_start <= ? AND para_end >= ? LIMIT 1",
                (book_id, para_id, para_id),
            ).fetchone()
        except sqlite3.Error:
            return ""
        return _clean(row["title"] or "")[:200] if row else ""

    def random_reading(self, rng, used_refs: Iterable[str] = (), attempts: int = 40) -> Passage | None:
        """A complete, translated unit (verse or short section) from a mūla book.

        Paragraph ids are internal to this edition (``Dhp 4`` is a chapter
        heading, not verse 4), so a reading is taken from a ``summaries`` row:
        its ``para_start``..``para_end`` range is the unit the edition itself
        treats as one text, and its title carries the canonical reference.
        """
        con = self.connection()
        candidates = self.preferred_books()
        if con is None or not candidates:
            return None
        used = set(used_refs)
        for _ in range(attempts):
            book = rng.choice(candidates)
            try:
                total = con.execute(
                    "SELECT count(*) FROM tr.summaries WHERE book_id = ? "
                    "AND title IS NOT NULL AND title <> ''",
                    (book["book_id"],),
                ).fetchone()[0]
            except sqlite3.Error:
                return None
            if not total:
                continue
            row = con.execute(
                "SELECT para_start, para_end, title FROM tr.summaries "
                "WHERE book_id = ? AND title IS NOT NULL AND title <> '' "
                "ORDER BY para_start, para_end LIMIT 1 OFFSET ?",
                (book["book_id"], rng.randrange(total)),
            ).fetchone()
            if row is None:
                continue
            start, end = int(row["para_start"]), int(row["para_end"])
            if end < start or end - start > 6:
                continue

            pali_lines: list[str] = []
            translations: list[str] = []
            for para_id in range(start, end + 1):
                chunk = self.passage(book["book_id"], para_id)
                if chunk is None:
                    continue
                pali_lines.extend(chunk.pali.split("\n"))
                if chunk.translation:
                    translations.append(chunk.translation)

            pali = _quoted_pali(pali_lines)
            translation = _quoted_prose(" ".join(translations))
            ref = _canonical_ref(row["title"])
            if not ref or ref in used or not translation or not 60 <= len(pali) <= 520:
                continue

            label = row["title"].split(" — ")[0].strip()
            return Passage(
                ref=ref,
                book_id=book["book_id"],
                book_name=book["book_name"],
                para_id=start,
                pali=pali,
                translation=translation,
                confidence="",
                context=label.split(":", 1)[1].strip() if ":" in label else "",
            )
        return None

    # -- diagnostics ----------------------------------------------------
    def describe(self) -> dict:
        con = self.connection()
        info = {
            "pali_db": str(self.pali_db),
            "pali_db_exists": self.pali_db.is_file(),
            "translation_db": str(self.translation_db) if self.translation_db else None,
            "translation_db_exists": bool(self.translation_db and self.translation_db.is_file()),
            "tables": {},
            "books": 0,
            "preferred_books": [],
        }
        if con is None:
            return info
        for row in con.execute(
            "SELECT name FROM sqlite_master WHERE type IN ('table','view') ORDER BY name"
        ):
            name = row[0]
            try:
                info["tables"][name] = [
                    r[1] for r in con.execute(f'PRAGMA table_info("{name}")')
                ]
            except sqlite3.Error:
                info["tables"][name] = []
        info["books"] = len(self.books())
        info["preferred_books"] = [
            f'{b["book_id"]} - {b["book_name"]}' for b in self.preferred_books()
        ]
        return info

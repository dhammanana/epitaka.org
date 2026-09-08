import re
import unicodedata
from functools import lru_cache
from ..config import Config

# ─────────────────────────────────────────────
# Text Processing Helpers
# ─────────────────────────────────────────────


def remove_stars_inside_brackets(text):
    PATTERN = re.compile(r"\[(.*?)\]")

    def repl(match):
        return "[" + match.group(1).replace("*", "") + "]"

    return PATTERN.sub(repl, text)


@lru_cache(maxsize=8192)
def markdown_to_html(text):
    """Convert lightweight markdown to HTML (cached — pure function)."""
    if not text:
        return ""
    if isinstance(text, int):
        return str(text)
    text = remove_stars_inside_brackets(text)
    text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.*?)\*", r"<i>\1</i>", text)
    text = text.replace("\\ வர", "[").replace("\\ ]", "]")
    text = text.replace("<strong>", " <strong>")
    for i in range(6, 0, -1):
        pattern = r"^" + r"\#" * i + r" (.*)$"
        repl = r"<h{0}>\1</h{0}>".format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r"`(.*?)`", r"<code>\1</code>", text)
    text = re.sub(r" *\\\[(.*?)\\\]", r'<sup title="\1">*</sup>', text)
    text = re.sub(r" *\[(.*?)\]", r'<sup title="\1">*</sup>', text)
    return text


def _strip_with_map(text):
    """NFD-strip combining marks, keeping original indices.

    Returns (stripped_text, index_map) where index_map[i] is the index in
    the original string of stripped_text[i].
    """
    stripped = []
    index_map = []
    for i, ch in enumerate(text):
        base = "".join(
            c
            for c in unicodedata.normalize("NFD", ch)
            if unicodedata.category(c) != "Mn"
        )
        for b in base:
            stripped.append(b)
            index_map.append(i)
    return "".join(stripped), index_map


# Function words carry no signal as highlights — the FTS index matches
# every token, but marking "a" inside *every* word (or whole-word "is" /
# "the" dozens of times per paragraph) only adds noise. Pāli content words
# are unaffected: the list is English-only, and 2-letter Pāli words such
# as "ca"/"na" are still highlighted (whole-word).
HIGHLIGHT_STOPWORDS = frozenset(
    "a an the is are was were be been being and or nor not no so to of in "
    "on at by for with as it its this that these those which what who whom "
    "whose how when where why i you he she we they me him her us them my "
    "your his our their do does did done have has had having will would "
    "shall should can could may might must from into over under than then "
    "there here all any each few more most other some such only own same "
    "too very just but if while also".split()
)


def highlight_text(text, query_words, phrases=None):
    """Wrap query matches in <mark>, diacritic-insensitively.

    Rules (standard search-result highlighting):
      - quoted phrases mark one contiguous span per occurrence;
      - single words mark whole words only — never a substring inside a
        larger word ("a" must not light up inside "Katamaṃ");
      - a word that *starts with* a query term still marks the whole word,
        mirroring the FTS prefix query ("theraga" marks "theragāthā");
      - stopwords / 1-char tokens never mark on their own (they still mark
        as part of a phrase span).

    Both the query and the text are mark-stripped before matching (so an
    ASCII query highlights accented text and vice versa — Pāli, Vietnamese
    tones, German umlauts, …), while the tags are inserted into the
    ORIGINAL text so nothing is re-spelled.
    """
    if not text:
        return text
    words = set()
    for w in query_words or []:
        n = normalize_pali((w or "").lower())
        if len(n) >= 2 and n not in HIGHLIGHT_STOPWORDS:
            words.add(n)
    norm_phrases = []
    for ph in phrases or []:
        p = re.sub(
            r"\s+", " ", " ".join(normalize_pali((w or "").lower()) for w in ph)
        ).strip()
        if len(p) >= 2:
            norm_phrases.append(p)
    if not words and not norm_phrases:
        return text
    stripped, index_map = _strip_with_map(text)
    if not stripped:
        return text
    lowered = stripped.lower()
    spans = []
    for p in norm_phrases:
        pattern = r"(?<!\w)" + r"\s+".join(re.escape(t) for t in p.split()) + r"(?!\w)"
        for m in re.finditer(pattern, lowered):
            spans.append((index_map[m.start()], index_map[m.end() - 1] + 1))
    if words:
        for m in re.finditer(r"\w+", lowered, re.UNICODE):
            token = m.group(0)
            if any(token.startswith(q) for q in words):
                spans.append((index_map[m.start()], index_map[m.end() - 1] + 1))
    if not spans:
        return text
    spans.sort()
    merged = [spans[0]]
    for s, e in spans[1:]:
        if s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    parts = []
    last = 0
    for s, e in merged:
        parts.append(text[last:s])
        parts.append("<mark>")
        parts.append(text[s:e])
        parts.append("</mark>")
        last = e
    parts.append(text[last:])
    return "".join(parts)


def trim_text(text, query_words):
    query_pos = min(
        [
            text.lower().find(word.lower())
            for word in query_words
            if text.lower().find(word.lower()) != -1
        ]
        or [0]
    )
    CONTEXT_LENGTH = 100
    start = max(0, query_pos - CONTEXT_LENGTH // 2)
    end = min(len(text), query_pos + CONTEXT_LENGTH // 2)
    temp_text = text[end - 10 : end + 10]
    if re.match(r"<\w", temp_text, re.I):
        end = end - 10 + temp_text.find("<")
    ret = (
        ("..." if start > 0 else "")
        + text[start:end]
        + ("..." if end < len(text) else "")
    )
    pos = ret.rfind("strong>")
    if pos > 0 and ret[pos - 1] == "<":
        ret = ret + "</strong>"
    pos = ret.rfind("code>")
    if pos > 0 and ret[pos - 1] == "<":
        ret = ret + "</code>"
    return highlight_text(ret, query_words)


def normalize_pali(text):
    nfkd_form = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd_form if not unicodedata.combining(c))

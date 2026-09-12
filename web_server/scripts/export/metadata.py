"""
metadata.py — Single source of truth for language / script names.

Used by data_loader, cover, builders, cli and the CI helper (ci.py)
so release notes, cover badges and descriptions never show raw codes
like "hi_hi" or "script=si translation=si".

Canonical sources:
- Script names follow frontend/src/pali-script.js `paliScriptInfo`
  (SI Sinhala, HI Devanagari, RO Roman, THAI Thai, LAOS Lao, ...).
- Language names follow epitaka_app
  lib/features/translator/translator_constants.dart
  `kTranslatorLangNames` (English display names).
"""

VALID_SCRIPTS = (
    "ro",
    "si",
    "hi",
    "be",
    "as",
    "th",
    "lo",
    "my",
    "km",
    "gm",
    "tt",
    "gj",
    "te",
    "ka",
    "mm",
    "br",
    "tb",
    "cy",
)

VALID_FORMATS = ("epub", "pdf", "md", "docx")

# Short script code (export CLI / workflow tag) -> English script name.
# Matches pali-script.js paliScriptInfo; "Laos" normalised to "Lao".
SCRIPT_NAMES = {
    "ro": "Roman",
    "si": "Sinhala",
    "hi": "Devanagari",
    "be": "Bengali",
    "as": "Assamese",
    "th": "Thai",
    "lo": "Lao",
    "my": "Myanmar",
    "km": "Khmer",
    "gm": "Gurmukhi",
    "tt": "Tai Tham",
    "gj": "Gujarati",
    "te": "Telugu",
    "ka": "Kannada",
    "mm": "Malayalam",
    "br": "Brahmi",
    "tb": "Tibetan",
    "cy": "Cyrillic",
}

# Translation DB suffix -> English language name.
# Matches epitaka_app kTranslatorLangNames (English part only, so it
# stays readable in release notes and cover badges).
LANGUAGE_NAMES = {
    "en": "English",
    "si": "Sinhala",
    "ta": "Tamil",
    "hi": "Hindi",
    "ne": "Nepali",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "or": "Odia",
    "th": "Thai",
    "lo": "Lao",
    "km": "Khmer",
    "my": "Myanmar",
    "my_nissaya": "Myanmar Nissaya",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "ms": "Malay",
    "tl": "Filipino",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "de": "German",
    "fr": "French",
    "es": "Spanish",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "pl": "Polish",
    "ru": "Russian",
    "uk": "Ukrainian",
    "tr": "Turkish",
    "el": "Greek",
    "ro": "Romanian",
    "cs": "Czech",
    "hu": "Hungarian",
    "sv": "Swedish",
    "da": "Danish",
    "fi": "Finnish",
    "no": "Norwegian",
    "ar": "Arabic",
    "he": "Hebrew",
    "fa": "Persian",
}


def language_name(code: str) -> str:
    """English language name for a translation DB code."""
    if not code:
        return ""
    key = code.strip().lower()
    if key in LANGUAGE_NAMES:
        return LANGUAGE_NAMES[key]
    return key.replace("_", " ").title() or code.upper()


def script_name(code: str) -> str:
    """English script name for a Pali output script code."""
    if not code:
        return ""
    return SCRIPT_NAMES.get(code.strip().lower(), code.upper())


def pack_label(script: str, lang: str) -> str:
    """Short human label, e.g. "Pali (Sinhala script) + Sinhala translation"."""
    s = script_name(script)
    lang_label = language_name(lang)
    if lang_label:
        return f"Pali ({s} script) + {lang_label} translation"
    return f"Pali ({s} script)"


def release_title(tag: str, script: str, lang: str) -> str:
    """Clear release title — names first, raw tag kept for uniqueness."""
    return f"Tipitaka Ebooks — {pack_label(script, lang)} [{tag}]"


def release_body(script: str, lang: str) -> str:
    """Human-readable release notes paragraph (no raw codes)."""
    s = script_name(script)
    lang_label = language_name(lang)
    if lang_label:
        return (
            "These ebooks are generated from the E-Pitaka database "
            "(epitaka.org, Chattha Sangayana Tipitaka). "
            f"This pack contains the complete Pali canon text in {s} script "
            f"with the {lang_label} translation."
        )
    return (
        "These ebooks are generated from the E-Pitaka database "
        "(epitaka.org, Chattha Sangayana Tipitaka). "
        f"This pack contains the complete Pali canon text in {s} script."
    )


def parse_tag(tag: str) -> tuple[str, str]:
    """Split a release tag on the FIRST underscore: script=prefix, lang=rest.

    Supports variants like ro_my_nissaya -> ("ro", "my_nissaya").
    """
    tag = (tag or "").strip().lower()
    if "_" not in tag:
        raise ValueError(f"Bad tag '{tag}'. Expected <script>_<lang>, e.g. ro_si.")
    script, _, lang = tag.partition("_")
    return script.strip(), lang.strip()

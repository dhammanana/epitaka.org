# app/languages.py
"""Single source of truth for translation language codes and display names.

Canonical language list follows the translator's
``translator/src/common/common_utils.py`` ``LANG_NAMES`` table — the
website supports whatever translation DBs exist in ``DATA_DIR``
(``epitaka_<lang>.db``, discovered dynamically by
``Config.detect_translations()``), and this file only provides the
human-readable names for those codes.

DO NOT hard-code language lists elsewhere. Import from here:

    from ..languages import LANGUAGES, get_language_info
    from .languages import LANGUAGES  # from app/utils/

Adding a new translation language = add one entry here (and in the
translator's LANG_NAMES). The language selector, SEO hreflangs,
sitemaps and JSON-LD pick it up automatically; UI home-page strings
fall back to English until a HOME_L10N entry is added in utils/seo.py.
"""

# code -> English name + native (endonym) name.
# English names match translator/src/common/common_utils.py LANG_NAMES
# (English part before the parenthesis); native names are the endonyms.
LANGUAGES: dict[str, dict[str, str]] = {
    # ── Core canon languages (the current 19 deployed translations) ──
    "en": {"english_name": "English", "native_name": "English"},
    "si": {"english_name": "Sinhala", "native_name": "සිංහල"},
    "ta": {"english_name": "Tamil", "native_name": "தமிழ்"},
    "hi": {"english_name": "Hindi", "native_name": "हिन्दी"},
    "ne": {"english_name": "Nepali", "native_name": "नेपाली"},
    "bn": {"english_name": "Bengali", "native_name": "বাংলা"},
    "mr": {"english_name": "Marathi", "native_name": "मराठी"},
    "gu": {"english_name": "Gujarati", "native_name": "ગુજરાતી"},
    "pa": {"english_name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
    "te": {"english_name": "Telugu", "native_name": "తెలుగు"},
    "kn": {"english_name": "Kannada", "native_name": "ಕನ್ನಡ"},
    "ml": {"english_name": "Malayalam", "native_name": "മലയാളം"},
    "or": {"english_name": "Odia", "native_name": "ଓଡ଼ିଆ"},
    "th": {"english_name": "Thai", "native_name": "ไทย"},
    "lo": {"english_name": "Lao", "native_name": "ລາວ"},
    "km": {"english_name": "Khmer", "native_name": "ខ្មែរ"},
    "my": {"english_name": "Myanmar", "native_name": "မြန်မာ"},
    "vi": {"english_name": "Vietnamese", "native_name": "Tiếng Việt"},
    "id": {"english_name": "Indonesian", "native_name": "Bahasa Indonesia"},
    "ms": {"english_name": "Malay", "native_name": "Bahasa Melayu"},
    "tl": {"english_name": "Filipino", "native_name": "Tagalog"},
    "zh": {"english_name": "Chinese", "native_name": "中文"},
    "ja": {"english_name": "Japanese", "native_name": "日本語"},
    "ko": {"english_name": "Korean", "native_name": "한국어"},
    "de": {"english_name": "German", "native_name": "Deutsch"},
    "fr": {"english_name": "French", "native_name": "Français"},
    "es": {"english_name": "Spanish", "native_name": "Español"},
    "pt": {"english_name": "Portuguese", "native_name": "Português"},
    "it": {"english_name": "Italian", "native_name": "Italiano"},
    "nl": {"english_name": "Dutch", "native_name": "Nederlands"},
    "pl": {"english_name": "Polish", "native_name": "Polski"},
    "ru": {"english_name": "Russian", "native_name": "Русский"},
    "uk": {"english_name": "Ukrainian", "native_name": "Українська"},
    "tr": {"english_name": "Turkish", "native_name": "Türkçe"},
    "el": {"english_name": "Greek", "native_name": "Ελληνικά"},
    "ro": {"english_name": "Romanian", "native_name": "Română"},
    "cs": {"english_name": "Czech", "native_name": "Čeština"},
    "hu": {"english_name": "Hungarian", "native_name": "Magyar"},
    "sv": {"english_name": "Swedish", "native_name": "Svenska"},
    "da": {"english_name": "Danish", "native_name": "Dansk"},
    "fi": {"english_name": "Finnish", "native_name": "Suomi"},
    "no": {"english_name": "Norwegian", "native_name": "Norsk"},
    "ar": {"english_name": "Arabic", "native_name": "العربية"},
    "he": {"english_name": "Hebrew", "native_name": "עברית"},
    "fa": {"english_name": "Persian", "native_name": "فارسی"},
    # ── Legacy aliases (old DB filenames / codes still floating around) ──
    # "np" duplicates "ne" (glossary_np.db); "cn" duplicates "zh";
    # "fil" duplicates "tl". Kept so old files still resolve to a name.
    "np": {"english_name": "Nepali", "native_name": "नेपाली"},
    "cn": {"english_name": "Chinese", "native_name": "中文"},
    "fil": {"english_name": "Filipino", "native_name": "Filipino"},
}


def get_language_info(code: str) -> dict[str, str]:
    """Display info for one language code; falls back to CODE.upper()."""
    info = LANGUAGES.get((code or "").strip().lower())
    if info:
        return {"code": code.strip().lower(), **info}
    fallback = (code or "").strip() or "??"
    return {
        "code": fallback.lower(),
        "english_name": fallback.upper(),
        "native_name": fallback.upper(),
    }


def language_english_name(code: str) -> str:
    """English name for a language code (e.g. 'de' -> 'German')."""
    return get_language_info(code)["english_name"]

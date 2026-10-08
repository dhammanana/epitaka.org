import os
import json
import re
import threading
import time

from .languages import LANGUAGES as _LANGUAGES

# Translations are discovered by scanning DATA_DIR — cache the scan result
# (filesystem I/O on every request is wasteful).
_TRANSLATIONS_CACHE = {}
_TRANSLATIONS_LOCK = threading.Lock()
_TRANSLATIONS_TTL = 60  # seconds


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "secret-key"

    # config.py lives at epitaka.org/web_server/app/config.py
    _ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.abspath(os.path.join(_ROOT, "data"))

    # Paths to the Pali text database and DPD dictionary database
    DATABASE = os.path.join(DATA_DIR, "epitaka.db")
    DPD_DICTIONARY_DB = os.path.join(DATA_DIR, "dpd-dictionary.db")
    WEBDATA_DB = os.path.join(
        DATA_DIR, "webdata.db"
    )  # web-only FTS indexes, separate from mobile DB

    BASE_URL = os.environ.get("BASE_URL", "")
    DEFAULT_LANG = "en"

    # Cache static assets (JS/CSS/fonts) in the browser — templates already
    # version their URLs with ?v=<git hash>, so long expiry is safe.
    SEND_FILE_MAX_AGE_DEFAULT = 86400 * 7  # 7 days

    MAX_SUGGESTIONS = 20
    MAX_SEARCH_RESULTS = 50

    FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get(
        "FIREBASE_SERVICE_ACCOUNT_JSON", "serviceAccountKey.json"
    )
    DPD_GRAMMAR = False
    DPD_IPA = False

    FIREBASE_CONFIG = {
        # Public web API key (starts with AIza…). Safe to expose in browser —
        # Firebase Auth JS SDK needs it to identify the project. Set via
        # FIREBASE_WEB_API_KEY env var so it is not committed to git.
        "apiKey": os.environ.get("FIREBASE_WEB_API_KEY", ""),
        "authDomain": "epitaka-org.firebaseapp.com",
        "projectId": "epitaka-org",
        "storageBucket": "epitaka-org.firebasestorage.app",
        "messagingSenderId": "806999836281",
        "appId": "1:806999836281:web:491d6eb9dc73ac0defb6a8",
        "measurementId": "G-MFCG30HTCQ",
    }
    FIREBASE_WEB_CONFIG = os.environ.get(
        "FIREBASE_WEB_CONFIG", json.dumps(FIREBASE_CONFIG)
    )

    @classmethod
    def get_firebase_web_config(cls):
        try:
            cfg = json.loads(cls.FIREBASE_WEB_CONFIG)
            if not cfg.get("apiKey") and cls.FIREBASE_CONFIG.get("apiKey"):
                cfg["apiKey"] = cls.FIREBASE_CONFIG["apiKey"]
            return cfg
        except (ValueError, TypeError):
            return dict(cls.FIREBASE_CONFIG)

    # ── Translation DB auto-detection ─────────────────────────────────────

    @classmethod
    def detect_translations(cls):
        """
        Scan DATA_DIR for files matching `epitaka_<lang>.db` or
        `epitaka_<lang>_<suffix>.db` and return metadata about each.

        Cached in-memory with a short TTL since the set of translation
        databases only changes when the server is redeployed.
        """
        now = time.monotonic()
        with _TRANSLATIONS_LOCK:
            cached = _TRANSLATIONS_CACHE.get("data")
            if (
                cached is not None
                and now - _TRANSLATIONS_CACHE.get("ts", 0) < _TRANSLATIONS_TTL
            ):
                return cached

        result = cls._scan_translations()

        with _TRANSLATIONS_LOCK:
            _TRANSLATIONS_CACHE["data"] = result
            _TRANSLATIONS_CACHE["ts"] = time.monotonic()
        return result

    @classmethod
    def _scan_translations(cls):
        """
        Scan DATA_DIR for files matching `epitaka_<lang>.db` or
        `epitaka_<lang>_<suffix>.db` and return metadata about each.

        Returns a dict keyed by language code, e.g.:
            {
              "en": {
                "code": "en",
                "english_name": "English",
                "native_name": "English",
                "filename": "epitaka_en.db",
                "versions": [
                  {"filename": "epitaka_en.db", "label": "Default"}
                ]
              },
              "th": { ... },
              "my": {
                "code": "my",
                ...
                "versions": [
                  {"filename": "epitaka_my.db", "label": "Default"},
                  {"filename": "epitaka_my_nissaya.db", "label": "Nissaya"}
                ]
              },
            }
        """
        pattern = re.compile(r"^_?epitaka_([a-z]{2})(?:_(.+))?\.db$")
        translations = {}

        if not os.path.isdir(cls.DATA_DIR):
            return translations

        for fname in os.listdir(cls.DATA_DIR):
            match = pattern.match(fname)
            if not match:
                continue
            code = match.group(1)
            suffix = match.group(2)

            # Language display names
            lang_names = cls._LANG_NAMES.get(
                code,
                {
                    "english_name": code.upper(),
                    "native_name": code.upper(),
                },
            )

            if code not in translations:
                translations[code] = {
                    "code": code,
                    "english_name": lang_names["english_name"],
                    "native_name": lang_names["native_name"],
                    "filename": f"epitaka_{code}.db",
                    "versions": [],
                }

            label = suffix.replace("_", " ").title() if suffix else "Default"
            translations[code]["versions"].append(
                {
                    "filename": fname,
                    "label": label,
                    "suffix": suffix,
                }
            )

        return translations

    @classmethod
    def get_available_languages(cls):
        """Return sorted list of language codes that have translation DBs."""
        return sorted(cls.detect_translations().keys())

    # ── Known language names ──────────────────────────────────────────────
    # Single source of truth lives in app/languages.py (follows the
    # translator's LANG_NAMES). Kept as a class attribute alias so existing
    # imports (Config._LANG_NAMES) keep working.
    _LANG_NAMES = _LANGUAGES


class DevelopmentConfig(Config):
    DEBUG = True
    PORT = 8083
    HOST = "0.0.0.0"


class ProductionConfig(Config):
    DEBUG = False
    PORT = 8083
    HOST = "0.0.0.0"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}

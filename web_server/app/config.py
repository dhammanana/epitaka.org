import os
import json
import re

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'secret-key'

    # config.py lives at epitaka.org/web_server/app/config.py
    # _ROOT = epitaka.org/web_server/
    # data/ lives at project root: ../../data/ from _ROOT
    _ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.abspath(os.path.join(_ROOT, '..', '..', 'data'))

    # Paths to the Pali text database and DPD dictionary database
    DATABASE = os.path.join(DATA_DIR, 'epitaka.db')
    DPD_DICTIONARY_DB = os.path.join(DATA_DIR, 'dpd-dictionary.db')
    WEBDATA_DB = os.path.join(DATA_DIR, 'webdata.db')       # web-only FTS indexes, separate from mobile DB

    BASE_URL = os.environ.get('BASE_URL', '')
    DEFAULT_LANG = 'en'

    MAX_SUGGESTIONS = 20
    MAX_SEARCH_RESULTS = 50

    FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON', 'serviceAccountKey.json')
    DPD_GRAMMAR = False
    DPD_IPA = False

    FIREBASE_CONFIG = {
      "apiKey":            "AIzaSyBzh0o8SV-6I5meJkWgH_3ic-f8vpSMzyQ",
      "authDomain":        "epitaka-org.firebaseapp.com",
      "projectId":         "epitaka-org",
      "storageBucket":     "epitaka-org.firebasestorage.app",
      "messagingSenderId": "806999836281",
      "appId":             "1:806999836281:web:491d6eb9dc73ac0defb6a8",
      "measurementId": "G-MFCG30HTCQ",
    }
    FIREBASE_WEB_CONFIG = os.environ.get('FIREBASE_WEB_CONFIG', json.dumps(FIREBASE_CONFIG))

    # ── Translation DB auto-detection ─────────────────────────────────────

    @classmethod
    def detect_translations(cls):
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
        pattern = re.compile(r'^epitaka_([a-z]{2})(?:_(.+))?\.db$')
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
            lang_names = cls._LANG_NAMES.get(code, {
                'english_name': code.upper(),
                'native_name': code.upper(),
            })

            if code not in translations:
                translations[code] = {
                    'code': code,
                    'english_name': lang_names['english_name'],
                    'native_name': lang_names['native_name'],
                    'filename': f'epitaka_{code}.db',
                    'versions': [],
                }

            label = suffix.replace('_', ' ').title() if suffix else 'Default'
            translations[code]['versions'].append({
                'filename': fname,
                'label': label,
                'suffix': suffix,
            })

        return translations

    @classmethod
    def get_available_languages(cls):
        """Return sorted list of language codes that have translation DBs."""
        return sorted(cls.detect_translations().keys())

    # ── Known language names ──────────────────────────────────────────────
    _LANG_NAMES = {
        'en': {'english_name': 'English',      'native_name': 'English'},
        'th': {'english_name': 'Thai',         'native_name': 'ไทย'},
        'si': {'english_name': 'Sinhala',      'native_name': 'සිංහල'},
        'my': {'english_name': 'Myanmar',      'native_name': 'မြန်မာ'},
        'vi': {'english_name': 'Vietnamese',   'native_name': 'Tiếng Việt'},
    }


class DevelopmentConfig(Config):
    DEBUG = True
    PORT  = 8083
    HOST  = '0.0.0.0'


class ProductionConfig(Config):
    DEBUG = False
    PORT = 8083
    HOST  = '0.0.0.0'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

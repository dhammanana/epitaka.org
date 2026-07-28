import os
import json
import re

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'secret-key'

    # config.py lives at epitaka.org/web_server/app/config.py
    _ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.abspath(os.path.join(_ROOT, 'data'))

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
        pattern = re.compile(r'^_?epitaka_([a-z]{2})(?:_(.+))?\.db$')
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

    # # ── Known language names ──────────────────────────────────────────────
    # _LANG_NAMES = {
    #     'en': {'english_name': 'English',      'native_name': 'English'},
    #     'th': {'english_name': 'Thai',         'native_name': 'ไทย'},
    #     'si': {'english_name': 'Sinhala',      'native_name': 'සිංහල'},
    #     'my': {'english_name': 'Myanmar',      'native_name': 'မြန်မာ'},
    #     'vi': {'english_name': 'Vietnamese',   'native_name': 'Tiếng Việt'},
    #     'lo': {'english_name': 'Lao',          'native_name': 'ລາວ'},
    # }

    _LANG_NAMES = {
        # ============================================================
        # Major international languages
        # ============================================================
        'en': {'english_name': 'English',      'native_name': 'English'},
        'zh': {'english_name': 'Chinese',      'native_name': '中文'},
        'es': {'english_name': 'Spanish',      'native_name': 'Español'},
        'fr': {'english_name': 'French',       'native_name': 'Français'},
        'de': {'english_name': 'German',       'native_name': 'Deutsch'},
        'pt': {'english_name': 'Portuguese',   'native_name': 'Português'},
        'it': {'english_name': 'Italian',      'native_name': 'Italiano'},
        'ru': {'english_name': 'Russian',      'native_name': 'Русский'},
        'ar': {'english_name': 'Arabic',       'native_name': 'العربية'},
        'tr': {'english_name': 'Turkish',      'native_name': 'Türkçe'},
        'nl': {'english_name': 'Dutch',        'native_name': 'Nederlands'},
        'pl': {'english_name': 'Polish',       'native_name': 'Polski'},
        'uk': {'english_name': 'Ukrainian',    'native_name': 'Українська'},
        'ro': {'english_name': 'Romanian',     'native_name': 'Română'},
        'el': {'english_name': 'Greek',        'native_name': 'Ελληνικά'},
        'cs': {'english_name': 'Czech',        'native_name': 'Čeština'},
        'hu': {'english_name': 'Hungarian',    'native_name': 'Magyar'},
        'sv': {'english_name': 'Swedish',      'native_name': 'Svenska'},
        'da': {'english_name': 'Danish',       'native_name': 'Dansk'},
        'no': {'english_name': 'Norwegian',    'native_name': 'Norsk'},
        'fi': {'english_name': 'Finnish',      'native_name': 'Suomi'},
        'sk': {'english_name': 'Slovak',       'native_name': 'Slovenčina'},
        'bg': {'english_name': 'Bulgarian',    'native_name': 'Български'},
        'sr': {'english_name': 'Serbian',      'native_name': 'Српски'},
        'hr': {'english_name': 'Croatian',     'native_name': 'Hrvatski'},
        'sl': {'english_name': 'Slovenian',    'native_name': 'Slovenščina'},
        'he': {'english_name': 'Hebrew',       'native_name': 'עברית'},
        'la': {'english_name': 'Latin',        'native_name': 'Latina'},

        # ============================================================
        # South Asia
        # ============================================================
        'si': {'english_name': 'Sinhala',      'native_name': 'සිංහල'},
        'hi': {'english_name': 'Hindi',        'native_name': 'हिन्दी'},
        'bn': {'english_name': 'Bengali',      'native_name': 'বাংলা'},
        'ta': {'english_name': 'Tamil',        'native_name': 'தமிழ்'},
        'te': {'english_name': 'Telugu',       'native_name': 'తెలుగు'},
        'mr': {'english_name': 'Marathi',      'native_name': 'मराठी'},
        'gu': {'english_name': 'Gujarati',     'native_name': 'ગુજરાતી'},
        'kn': {'english_name': 'Kannada',      'native_name': 'ಕನ್ನಡ'},
        'ml': {'english_name': 'Malayalam',    'native_name': 'മലയാളം'},
        'or': {'english_name': 'Odia',         'native_name': 'ଓଡ଼ିଆ'},
        'pa': {'english_name': 'Punjabi',      'native_name': 'ਪੰਜਾਬੀ'},
        'ur': {'english_name': 'Urdu',         'native_name': 'اردو'},
        'ne': {'english_name': 'Nepali',       'native_name': 'नेपाली'},
        'as': {'english_name': 'Assamese',     'native_name': 'অসমীয়া'},
        'sa': {'english_name': 'Sanskrit',     'native_name': 'संस्कृतम्'},
        'pi': {'english_name': 'Pali',         'native_name': 'Pāḷi'},

        # ============================================================
        # Southeast Asia — especially important for Theravāda
        # ============================================================
        'my': {'english_name': 'Myanmar',      'native_name': 'မြန်မာ'},
        'th': {'english_name': 'Thai',         'native_name': 'ไทย'},
        'lo': {'english_name': 'Lao',          'native_name': 'ລາວ'},
        'km': {'english_name': 'Khmer',        'native_name': 'ខ្មែរ'},
        'vi': {'english_name': 'Vietnamese',   'native_name': 'Tiếng Việt'},
        'id': {'english_name': 'Indonesian',   'native_name': 'Bahasa Indonesia'},
        'ms': {'english_name': 'Malay',        'native_name': 'Bahasa Melayu'},
        'jv': {'english_name': 'Javanese',     'native_name': 'Basa Jawa'},
        'su': {'english_name': 'Sundanese',    'native_name': 'Basa Sunda'},
        'fil': {'english_name': 'Filipino',   'native_name': 'Filipino'},
        'tl': {'english_name': 'Tagalog',      'native_name': 'Tagalog'},

        # ============================================================
        # East Asia — especially important for Mahāyāna Buddhism
        # ============================================================
        'zh-CN': {'english_name': 'Chinese (Simplified)',   'native_name': '简体中文'},
        'zh-TW': {'english_name': 'Chinese (Traditional)',  'native_name': '繁體中文'},
        'zh-HK': {'english_name': 'Chinese (Hong Kong)',    'native_name': '繁體中文'},
        'ja':    {'english_name': 'Japanese',               'native_name': '日本語'},
        'ko':    {'english_name': 'Korean',                 'native_name': '한국어'},
        'mn':    {'english_name': 'Mongolian',              'native_name': 'Монгол'},
        'bo':    {'english_name': 'Tibetan',                'native_name': 'བོད་ཡིག'},

        # ============================================================
        # Central Asia / Himalayan Buddhist regions
        # ============================================================
        'dz': {'english_name': 'Dzongkha',     'native_name': 'རྫོང་ཁ'},
        'kk': {'english_name': 'Kazakh',       'native_name': 'Қазақша'},
        'ky': {'english_name': 'Kyrgyz',       'native_name': 'Кыргызча'},
        'uz': {'english_name': 'Uzbek',        'native_name': 'O‘zbekcha'},
        'tg': {'english_name': 'Tajik',        'native_name': 'Тоҷикӣ'},
        'tk': {'english_name': 'Turkmen',      'native_name': 'Türkmençe'},
        'ug': {'english_name': 'Uyghur',       'native_name': 'ئۇيغۇرچە'},
        'ka': {'english_name': 'Georgian',     'native_name': 'ქართული'},
        'hy': {'english_name': 'Armenian',     'native_name': 'Հայերեն'},

        # ============================================================
        # Middle East / Iran
        # ============================================================
        'fa': {'english_name': 'Persian',      'native_name': 'فارسی'},
        'ps': {'english_name': 'Pashto',       'native_name': 'پښتو'},

        # ============================================================
        # Africa
        # ============================================================
        'sw': {'english_name': 'Swahili',      'native_name': 'Kiswahili'},
        'am': {'english_name': 'Amharic',      'native_name': 'አማርኛ'},
        'zu': {'english_name': 'Zulu',         'native_name': 'isiZulu'},
        'xh': {'english_name': 'Xhosa',        'native_name': 'isiXhosa'},
        'af': {'english_name': 'Afrikaans',    'native_name': 'Afrikaans'},
        'yo': {'english_name': 'Yoruba',       'native_name': 'Yorùbá'},
        'ig': {'english_name': 'Igbo',         'native_name': 'Igbo'},
        'ha': {'english_name': 'Hausa',        'native_name': 'Hausa'},

        # ============================================================
        # Oceania / Pacific
        # ============================================================
        'mi': {'english_name': 'Māori',        'native_name': 'Te reo Māori'},
        'sm': {'english_name': 'Samoan',       'native_name': 'Gagana Samoa'},
        'to': {'english_name': 'Tongan',       'native_name': 'Lea fakatonga'},

        # ============================================================
        # Additional useful languages
        # ============================================================
        'et': {'english_name': 'Estonian',     'native_name': 'Eesti'},
        'lv': {'english_name': 'Latvian',      'native_name': 'Latviešu'},
        'lt': {'english_name': 'Lithuanian',   'native_name': 'Lietuvių'},
        'is': {'english_name': 'Icelandic',    'native_name': 'Íslenska'},
        'ga': {'english_name': 'Irish',        'native_name': 'Gaeilge'},
        'cy': {'english_name': 'Welsh',        'native_name': 'Cymraeg'},
        'eu': {'english_name': 'Basque',       'native_name': 'Euskara'},
        'ca': {'english_name': 'Catalan',      'native_name': 'Català'},
        'gl': {'english_name': 'Galician',     'native_name': 'Galego'},
        'sq': {'english_name': 'Albanian',     'native_name': 'Shqip'},
        'mk': {'english_name': 'Macedonian',   'native_name': 'Македонски'},
        'bs': {'english_name': 'Bosnian',      'native_name': 'Bosanski'},
        'be': {'english_name': 'Belarusian',   'native_name': 'Беларуская'},

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

import os, json


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-change-me'
    DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'translations.db')
    BASE_URL = os.environ.get('BASE_URL', '')
    MAX_SUGGESTIONS = 20
    MAX_SEARCH_RESULTS = 50
    FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON', 'serviceAccountKey.json')

    FIREBASE_CONFIG = {
      "apiKey":            "AIzaSyBzh0o8SV-6I5meJkWgH_3ic-f8vpSMzyQ",
      "authDomain":        "epitaka-org.firebaseapp.com",
      "projectId":         "epitaka-org",
      "storageBucket":     "epitaka-org.firebasestorage.app",
      "messagingSenderId": "806999836281",
      "appId":             "1:806999836281:web:491d6eb9dc73ac0defb6a8",
      "measurementId": "G-MFCG30HTCQ",
    }
    FIREBASE_WEB_CONFIG = os.environ.get('FIREBASE_WEB_CONFIG', json.dumps(FIREBASE_CONFIG))  # JSON string

class DevelopmentConfig(Config):
    DEBUG = True



class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
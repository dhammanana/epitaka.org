# app/__init__.py

from flask import Flask, g, redirect
from .config import config_by_name
from .config import Config
from .routes.main import bp as main_bp
from .routes.api import bp as api_bp
from .routes.dictionary import bp as dict_bp
from .routes.auth   import bp as auth_bp,   init_auth_db
from .routes.readers import bp as reader_bp, init_reader_db
from .routes.editor import bp as editor_bp, init_editor_db, bootstrap_super_admin
from .services.initialize_db import init_all_search_tables
import subprocess, os, time
from werkzeug.security import generate_password_hash

INIT = False

# ── Resolve the frontend dist directory ────────────────────────────────
# __file__ = epitaka.org/web_server/app/__init__.py
# _ROOT = epitaka.org/web_server/
# frontend/dist/ = epitaka.org/web_server/frontend/dist/
_WEB_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_FRONTEND_DIST = os.path.join(_WEB_ROOT, 'frontend', 'dist')

def get_git_hash():
    try:
        return subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode().strip()
    except:
        return os.environ.get('APP_VERSION', 'dev')

APP_VERSION = get_git_hash()

def create_app(config_name='default'):
    app = Flask(__name__,
                template_folder='../templates',
                # Serve built frontend assets from frontend/dist/.
                # Vite outputs JS, CSS, and fonts here — clean separation.
                static_folder=_FRONTEND_DIST,
                static_url_path='/static')

    app.config.from_object(config_by_name[config_name])

    # The editor console signs auth sessions with SECRET_KEY.  A weak default
    # ships in development only — warn loudly in production.
    if config_name in ('production', 'prod') and \
            (os.environ.get('SECRET_KEY') or '') in ('', 'secret-key'):
        print('\n'.join([
            '\n',
            '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !',
            'WARNING: SECRET_KEY is not set in production. The translation',
            'editor console signs session cookies with the default secret.',
            'Set it, e.g.:  export SECRET_KEY=$(python -c "import secrets;',
            'print(secrets.token_hex(32))")',
            '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !',
            '\n',
        ]))

    # Session cookie hardening (editor console auth)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = not app.debug
    app.config['PERMANENT_SESSION_LIFETIME'] = 60 * 60 * 24 * 30  # 30 days

    with app.app_context():
        if INIT:
            init_auth_db()
            init_reader_db()
        init_editor_db()
        bootstrap_super_admin()

    # Register all blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(dict_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reader_bp)
    app.register_blueprint(editor_bp)

    # Template filter
    @app.template_filter('is_numbered')
    def is_numbered(text):
        import re
        return bool(re.match(r'^<code>\d+</code>\.$', str(text)))

    @app.errorhandler(404)
    def page_not_found(e):
        return redirect(Config.BASE_URL + '/' + Config.DEFAULT_LANG + '/')

    @app.teardown_appcontext
    def teardown_db(exception=None):
        # Close epitaka.db connection
        db = g.pop('db', None)
        if db is not None:
            db.close()
        # Close webdata.db connection
        wdb = g.pop('webdata_db', None)
        if wdb is not None:
            wdb.close()
        # Clean up translation DB connections (stored as g.trans_db_{lang})
        for key in list(g.__dict__.keys()):
            if key.startswith('trans_db_'):
                try:
                    conn = g.pop(key, None)
                    if conn is not None:
                        conn.close()
                except Exception:
                    pass

    @app.context_processor
    def inject_version():
        return dict(v=APP_VERSION)

    return app

# app/__init__.py

from flask import Flask, g, request
from .config import config_by_name
from .config import Config
from .routes.main import bp as main_bp
from .routes.api import bp as api_bp
from .routes.dictionary import bp as dict_bp
from .routes.auth   import bp as auth_bp,   init_auth_db
from .routes.readers import bp as reader_bp, init_reader_db
from .routes.editor import bp as editor_bp, init_editor_db, bootstrap_super_admin
from .services.initialize_db import init_all_search_tables
from .utils.assets import get_asset_version, APP_VERSION
import os, time
from werkzeug.security import generate_password_hash

INIT = False

# ── Resolve the frontend dist directory ────────────────────────────────
# __file__ = epitaka.org/web_server/app/__init__.py
# _ROOT = epitaka.org/web_server/
# frontend/dist/ = epitaka.org/web_server/frontend/dist/
_WEB_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_FRONTEND_DIST = os.path.join(_WEB_ROOT, 'frontend', 'dist')

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
        # Return a real 404 (with a short cache lifetime) instead of
        # redirecting every unknown URL to the home page. Bots probing
        # /wp-admin, /.env, /wp-login.php, … previously got a 302 for
        # every hit — doubling request volume and teaching crawlers to
        # keep coming back.
        return (
            '<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="robots" content="noindex">'
            '<title>404 — Not Found</title></head>'
            '<body style="font-family:sans-serif;text-align:center;padding:3rem">'
            '<h1>404</h1><p>Page not found.</p>'
            f'<p><a href="{Config.BASE_URL}/{Config.DEFAULT_LANG}/">Home</a></p>'
            '</body></html>',
            404,
            {'Cache-Control': 'public, max-age=300'},
        )

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
        return dict(v=get_asset_version())

    # ── HTTP caching headers ────────────────────────────────────────────────
    # These endpoints render the same output for every visitor (no per-user
    # content — auth is API-only), so they can be cached by Cloudflare,
    # nginx proxy_cache, and the client. Short TTLs keep stale content to
    # at most a few minutes after a deploy.
    _CACHEABLE_ENDPOINTS = {
        # Server-rendered HTML pages
        # (index_redirect = the bare `/` home page — must be listed too or
        # the most-hit URL on the site ships without a Cache-Control header
        # and gets re-rendered by the origin on every request)
        'main.index', 'main.index_redirect', 'main.book', 'main.about', 'main.privacy',
        'main.sitemap_index', 'main.sitemap_file', 'main.robots_txt',
        'main.app_share_link', 'main.study_guide', 'main.outline',
        'main.api_study_section',
        # Read-only JSON APIs (frontend + mobile app)
        'main.api_menu', 'main.suggest_word', 'main.search_headings_suggest',
        'main.bold_suggest', 'main.bold_definition',
        'api.api_book_section', 'api.api_book_sections', 'api.book_links',
        'api.book_link_section', 'api.get_related_para',
        'dictionary.api_dictionary', 'api.fts_search',
    }

    @app.after_request
    def add_cache_headers(response):
        ep = request.endpoint or ''
        if ep.startswith('static.'):
            # Static files already carry Flask's long expiry
            # (SEND_FILE_MAX_AGE_DEFAULT = 7 days).
            return response
        if ep in _CACHEABLE_ENDPOINTS and 'Cache-Control' not in response.headers:
            response.headers['Cache-Control'] = 'public, max-age=300'
        return response

    return app

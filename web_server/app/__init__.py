# app/__init__.py

from flask import Flask, g, redirect
from .config import config_by_name
from .config import Config
from .routes.main import bp as main_bp
from .routes.api import bp as api_bp
from .routes.edit import bp as edit_bp
from .routes.dictionary import bp as dict_bp
from .routes.auth   import bp as auth_bp,   init_auth_db
from .routes.readers import bp as reader_bp, init_reader_db
from .services.initialize_db import init_all_search_tables
from .utils.index_builder import register_cli

INIT = False

def create_app(config_name='default'):
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static',
                static_url_path='/tpk/static')

    app.config.from_object(config_by_name[config_name])
    
    with app.app_context():
        if INIT:
            init_auth_db()
            init_reader_db()
            init_all_search_tables()
    # Register all blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(edit_bp)
    app.register_blueprint(dict_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reader_bp)

    register_cli(app)


    # Template filter — this belongs here or in a separate filters module
    @app.template_filter('is_numbered')
    def is_numbered(text):
        import re
        return bool(re.match(r'^<code>\d+</code>\.$', str(text)))

    @app.errorhandler(404)
    def page_not_found(e):
        return redirect(Config.BASE_URL + '/')
        
    # CORRECT teardown handler
    @app.teardown_appcontext
    def teardown_db(exception=None):
        db = g.pop('db', None)
        if db is not None:
            db.close()
    return app

    
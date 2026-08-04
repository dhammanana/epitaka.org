from app import create_app
import os
from app.config import Config
from dotenv import load_dotenv

load_dotenv()
# Accept both ENV and FLASK_ENV (docker-compose historically set FLASK_ENV).
_env = (os.environ.get('ENV') or os.environ.get('FLASK_ENV') or '').lower()
if _env in ('production', 'prod'):
    app = create_app('production')
else:
    app = create_app('development')   # or read from ENV

if __name__ == '__main__':
    port = int(os.environ.get('PORT', app.config.get('PORT', 8080)))
    host = os.environ.get('HOST', app.config.get('HOST', '0.0.0.0'))
    app.run(host=host, port=port, debug=app.config['DEBUG'])

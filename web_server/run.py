from app import create_app
import os
from app.config import Config

if os.environ.get('ENV') == 'production':
    app = create_app('production')
else:
    app = create_app('development')   # or read from ENV

if __name__ == '__main__':
    port = int(os.environ.get('PORT', app.config.get('PORT', 8080)))
    host = os.environ.get('HOST', app.config.get('HOST', '0.0.0.0'))
    app.run(host=host, port=port, debug=app.config['DEBUG'])

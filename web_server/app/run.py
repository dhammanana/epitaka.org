# run.py
from app import create_app
from utils.db import init_auth_db

app = create_app('development')  # or 'production'


if __name__ == '__main__':
    print('Running at http://localhost:8080/tpk')
    init_auth_db()
    app.run(host='0.0.0.0', port=8080, debug=True)
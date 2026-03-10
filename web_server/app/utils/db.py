# app/utils/db.py
from contextlib import contextmanager
from flask import g, current_app
import sqlite3
import unicodedata
from collections import defaultdict


@contextmanager
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    try:
        yield g.db
    finally:
        if 'db' in g:
            g.db.close()
            g.pop('db', None)

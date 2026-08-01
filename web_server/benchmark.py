#!/usr/bin/env python3
"""Quick benchmark of key endpoints using Flask's test client."""
import os
import sys
import time

os.environ.setdefault('ENV', 'production')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run import app

ENDPOINTS = [
    ('GET /',                    lambda c: c.get('/')),
    ('GET /en/',                 lambda c: c.get('/en/')),
    ('GET /en/book/Dhp',         lambda c: c.get('/en/book/Dhp')),
    ('GET /en/book/Sn',          lambda c: c.get('/en/book/Sn')),
    ('GET /api/fts_search?q=buddha',          lambda c: c.get('/api/fts_search?q=buddha')),
    ('GET /api/fts_search?q=mett&book_id=Sn&limit=10', lambda c: c.get('/api/fts_search?q=mett&book_id=Sn&limit=10')),
    ('GET /api/book/Dhp/section/1', lambda c: c.get('/api/book/Dhp/section/1?lang=en')),
    ('GET /api/suggest_word?q=buddh', lambda c: c.get('/api/suggest_word?q=buddh')),
]


def run(label):
    client = app.test_client()
    results = []
    for name, fn in ENDPOINTS:
        # warm-up once (connects DB, caches)
        try:
            fn(client)
        except Exception:
            pass
        best = float('inf')
        for _ in range(3):
            t0 = time.perf_counter()
            try:
                fn(client)
            except Exception as e:
                best = -1
                break
            dt = (time.perf_counter() - t0) * 1000
            best = min(best, dt)
        results.append((name, best))
    print(f'\n=== {label} ===')
    for name, ms in results:
        print(f'  {ms:9.1f} ms  {name}')
    return results


if __name__ == '__main__':
    run('BENCHMARK')

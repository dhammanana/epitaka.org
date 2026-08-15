# app/utils/ratelimit.py
"""Tiny in-process sliding-window rate limiter (per gunicorn worker).

Cloudflare sits in front and does the real bot filtering at the edge;
this is defense-in-depth so a single runaway client (direct-to-origin
traffic, or bursts between Cloudflare rule refreshes) cannot peg the
1-CPU box with expensive search/suggest queries.

Because the counters are in-memory and per-worker, limits are
approximate across processes — generous limits are intentional.
"""
import threading
import time
from functools import wraps

from flask import jsonify, request

_limits = {}   # key -> list of request timestamps (sorted ascending)
_lock = threading.Lock()
_MAX_KEYS = 5000


def _client_ip():
    """Best-effort real client IP. Cloudflare sets CF-Connecting-IP;
    nginx provides X-Forwarded-For as a fallback."""
    cf = request.headers.get('CF-Connecting-IP')
    if cf:
        return cf.strip()
    xff = request.headers.get('X-Forwarded-For')
    if xff:
        return xff.split(',')[0].strip() or request.remote_addr or 'unknown'
    return request.remote_addr or 'unknown'


def _prune_locked():
    """Keep the counter table bounded (crude, called occasionally)."""
    if len(_limits) <= _MAX_KEYS:
        return
    for key in list(_limits.keys())[: len(_limits) // 2]:
        del _limits[key]


def _check(key, limit, window):
    now = time.monotonic()
    with _lock:
        stamps = _limits.setdefault(key, [])
        cutoff = now - window
        if stamps and stamps[0] < cutoff:
            # Keep only timestamps inside the window (list is sorted).
            i = 0
            while i < len(stamps) and stamps[i] < cutoff:
                i += 1
            if i:
                del stamps[:i]
        if len(stamps) >= limit:
            return False
        stamps.append(now)
        if len(_limits) > _MAX_KEYS * 2:
            _prune_locked()
        return True


def rate_limit(limit, window=60):
    """Decorator: allow ``limit`` requests per ``window`` seconds per IP.

    Applies to the expensive read-only endpoints only — never to the
    editor console or write endpoints.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            key = f'{request.endpoint}:{_client_ip()}'
            if not _check(key, limit, window):
                return jsonify({'error': 'Too many requests. Please try again in a minute.'}), 429
            return f(*args, **kwargs)
        return wrapper
    return decorator

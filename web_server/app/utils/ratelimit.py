# app/utils/ratelimit.py
"""Tiny in-process sliding-window rate limiter (per gunicorn worker).

Cloudflare sits in front and does the real bot filtering at the edge;
this is defense-in-depth so a single runaway client (direct-to-origin
traffic, or bursts between Cloudflare rule refreshes) cannot peg the
1-CPU box with expensive search/suggest queries.

Because the counters are in-memory and per-worker, limits are
approximate across processes — generous limits are intentional.
"""
import ipaddress
import os
import threading
import time
from functools import wraps

from flask import jsonify, request

_limits = {}   # key -> list of request timestamps (sorted ascending)
_lock = threading.Lock()
_MAX_KEYS = 5000

_TRUSTED_PROXY_NETS = None


def _trusted_proxy_nets():
    global _TRUSTED_PROXY_NETS
    if _TRUSTED_PROXY_NETS is None:
        raw = os.environ.get('TRUSTED_PROXY_IPS', '127.0.0.1,::1')
        nets = []
        for part in raw.split(','):
            part = part.strip()
            if not part:
                continue
            try:
                nets.append(ipaddress.ip_network(part, strict=False))
            except ValueError:
                continue
        _TRUSTED_PROXY_NETS = nets
    return _TRUSTED_PROXY_NETS


def _is_trusted_proxy(addr):
    try:
        ip = ipaddress.ip_address(addr)
    except ValueError:
        return False
    return any(ip in net for net in _trusted_proxy_nets())


def _clean_ip(value):
    value = (value or '').strip()
    try:
        ipaddress.ip_address(value)
        return value
    except ValueError:
        return ''


def client_ip():
    """Resolve the client address, trusting proxy headers only from a
    configured trusted peer (loopback by default).

    A direct visitor can therefore never rotate the rate-limit bucket by
    sending CF-Connecting-IP / X-Forwarded-For; only the local nginx/edge
    hop may supply them. Override the trusted peers with TRUSTED_PROXY_IPS.
    """
    peer = request.remote_addr or ''
    if not _is_trusted_proxy(peer):
        return peer or 'unknown'
    cf = _clean_ip(request.headers.get('CF-Connecting-IP'))
    if cf:
        return cf
    xff = request.headers.get('X-Forwarded-For')
    if xff:
        # nginx appends the real peer last; earlier values are caller-supplied.
        forwarded = _clean_ip(xff.split(',')[-1])
        if forwarded:
            return forwarded
    return peer or 'unknown'


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
            key = f'{request.endpoint}:{client_ip()}'
            if not _check(key, limit, window):
                return jsonify({'error': 'Too many requests. Please try again in a minute.'}), 429
            return f(*args, **kwargs)
        return wrapper
    return decorator

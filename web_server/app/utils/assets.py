# app/utils/assets.py
"""Static-asset versioning (the ?v= cache-buster on every JS/CSS link).

Own module (not app/__init__.py) so routes can import it without creating
an import cycle.
"""
import os
import time
import hashlib

# app/utils/assets.py → app/utils → app → web_server/
_FRONTEND_DIST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'frontend',
    'dist',
)

_asset_version_cache = {'at': 0.0, 'version': ''}


def _compute_asset_version():
    """Version string derived from the newest built bundle's mtime.

    A stat-only walk (no file reads) — fast enough to re-run every few
    seconds, unlike the old implementation which hashed every JS/CSS file
    (≈6 MB of reads) on a 2-second timer, wasting CPU on every request
    batch under bot load.
    """
    latest = 0.0
    try:
        for root, _, files in os.walk(_FRONTEND_DIST):
            for name in files:
                if name.endswith(('.js', '.css')):
                    m = os.path.getmtime(os.path.join(root, name))
                    if m > latest:
                        latest = m
    except OSError:
        return 'dev'
    if not latest:
        return 'dev'

    # A timestamp alone is unsafe when deploys preserve file mtimes or when
    # an intermediary serves HTML from a different release than the assets.
    # Include the complete asset set's metadata so every release gets a new
    # URL version.
    entries = []
    try:
        for root, _, files in os.walk(_FRONTEND_DIST):
            for name in files:
                if name.endswith(('.js', '.css')):
                    path = os.path.join(root, name)
                    entries.append((os.path.relpath(path, _FRONTEND_DIST),
                                    os.path.getsize(path), os.path.getmtime(path)))
    except OSError:
        return str(int(latest))
    digest = hashlib.sha256(repr(sorted(entries)).encode()).hexdigest()[:16]
    return digest


def get_asset_version():
    """Static-asset cache-buster used for ?v= on every JS/CSS link.

    Version = newest bundle mtime (cheap stat walk), refreshed at most
    every 2 seconds so a running dev server picks up rebuilds without a
    restart. An explicit APP_VERSION env var overrides it (set it at
    deploy time to skip even the stat walk).
    """
    env_ver = os.environ.get('APP_VERSION')
    if env_ver:
        return env_ver
    now = time.time()
    if _asset_version_cache['version'] and now - _asset_version_cache['at'] < 2:
        return _asset_version_cache['version']
    version = _compute_asset_version()
    _asset_version_cache.update(at=now, version=version)
    return version


# Seeds the cache at import so the first request doesn't pay the stat walk.
APP_VERSION = get_asset_version()

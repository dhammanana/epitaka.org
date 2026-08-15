# app/utils/assets.py
"""Static-asset versioning (the ?v= cache-buster on every JS/CSS link).

Own module (not app/__init__.py) so routes can import it without creating
an import cycle.
"""
import os
import time

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
    return str(int(latest)) if latest else 'dev'


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

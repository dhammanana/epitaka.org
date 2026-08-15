# app/utils/cache.py
"""Small in-process TTL cache with an LRU-ish size cap.

Used for expensive *read-only* results (rendered book pages, section
sentences, search responses, …). One instance exists per gunicorn worker
process, which is fine for a read-heavy Flask app; Cloudflare / nginx sit
in front for cross-process caching.

Only values that are safe to reuse across requests may be stored here —
never per-user data.
"""
import threading
import time


class TTLCache:
    """Thread-safe cache: entries expire after ``ttl`` seconds; when the
    cache exceeds ``max_size`` the oldest-accessed entries are evicted.
    """

    def __init__(self, max_size=128, ttl=300.0):
        self._max_size = max_size
        self._ttl = ttl
        # key -> (expires_at, value); dict order doubles as recency order
        # (get/set re-insert so the dict stays roughly LRU-ordered).
        self._data = {}
        self._lock = threading.Lock()

    def get(self, key):
        now = time.monotonic()
        with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            expires_at, value = item
            if now >= expires_at:
                del self._data[key]
                return None
            # Refresh recency (move to the end) on a hit.
            self._data.pop(key)
            self._data[key] = (expires_at, value)
            return value

    def set(self, key, value, ttl=None):
        now = time.monotonic()
        expires_at = now + (ttl if ttl is not None else self._ttl)
        with self._lock:
            self._data.pop(key, None)
            self._data[key] = (expires_at, value)
            over = len(self._data) - self._max_size
            if over > 0:
                for stale in list(self._data.keys())[:over]:
                    del self._data[stale]

    def clear(self):
        with self._lock:
            self._data.clear()

    def __len__(self):
        with self._lock:
            return len(self._data)

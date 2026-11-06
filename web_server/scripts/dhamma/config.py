"""Filesystem paths and environment configuration for the Dhamma publisher.

Everything is derived from this file's location so the script can be run from
any working directory (cron, systemd, a shell):

    epitaka.org/web_server/scripts/dhamma_publisher.py
"""

from __future__ import annotations

import os
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent      # web_server/scripts/dhamma
SCRIPTS_DIR = PACKAGE_DIR.parent                   # web_server/scripts
WEB_SERVER_DIR = SCRIPTS_DIR.parent                # web_server
APP_ROOT = WEB_SERVER_DIR.parent                   # epitaka.org

ENV_CANDIDATES = (SCRIPTS_DIR / ".env", WEB_SERVER_DIR / ".env")

OUTPUT_DIR = SCRIPTS_DIR / "output"
LOG_DIR = SCRIPTS_DIR / "logs"
STATE_DIR = SCRIPTS_DIR / "state"
HISTORY_FILE = STATE_DIR / "history.json"
MANIFEST_FILE = OUTPUT_DIR / "manifest.jsonl"

DEFAULT_TRANSLATION_LANG = "en"


def _read_env(path: Path) -> None:
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def load_env() -> None:
    """Tiny .env reader; avoids a python-dotenv dependency."""
    for path in ENV_CANDIDATES:
        if path.is_file():
            _read_env(path)


def setting(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)


def data_dir() -> Path:
    return Path(os.getenv("EPITAKA_DATA_DIR", str(WEB_SERVER_DIR / "data"))).expanduser()


def pali_db_path() -> Path:
    configured = os.getenv("EPITAKA_DB_PATH")
    if configured:
        return Path(configured).expanduser()
    data = data_dir()
    for name in ("epitaka.db", "tipitaka.db"):
        candidate = data / name
        if candidate.is_file():
            return candidate
    return data / "epitaka.db"


def translation_db_path(pali_db: Path) -> Path | None:
    configured = os.getenv("EPITAKA_TRANSLATION_DB")
    if configured:
        return Path(configured).expanduser()
    lang = os.getenv("EPITAKA_TRANSLATION_LANG", DEFAULT_TRANSLATION_LANG)
    candidate = pali_db.with_name(f"epitaka_{lang}.db")
    if candidate.is_file() and candidate.resolve() != pali_db.resolve():
        return candidate
    return None

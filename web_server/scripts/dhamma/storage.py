"""Output folders, metadata files, manifest and size-limited cleanup."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from . import config

LOGGER = logging.getLogger(__name__)

MAX_OUTPUT_MB = 200


@dataclass(frozen=True)
class PostPaths:
    image: Path
    meta: Path

    @property
    def folder(self) -> Path:
        return self.image.parent


def post_paths(scenario_key: str, when: datetime, prefix: str = "dhamma") -> PostPaths:
    """Files grouped by scenario, then by day: output/<scenario>/<YYYY-MM-DD>/."""
    folder = config.OUTPUT_DIR / scenario_key / when.strftime("%Y-%m-%d")
    folder.mkdir(parents=True, exist_ok=True)
    stamp = when.strftime("%Y%m%d_%H%M%S")
    stem = f"{prefix}_{stamp}"
    suffix = 2
    while (folder / f"{stem}.jpg").exists() or (folder / f"{stem}.json").exists():
        stem = f"{prefix}_{stamp}_{suffix}"
        suffix += 1
    return PostPaths(folder / f"{stem}.jpg", folder / f"{stem}.json")


def save_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def append_manifest(record: dict) -> None:
    config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with config.MANIFEST_FILE.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def cleanup_output(max_size_mb: int = MAX_OUTPUT_MB) -> None:
    """Delete the oldest generated files until output/ is under the size limit."""
    root = config.OUTPUT_DIR
    if not root.is_dir():
        return
    protected = {".gitkeep", config.MANIFEST_FILE.name}
    files = [path for path in root.rglob("*") if path.is_file() and path.name not in protected]
    total = sum(path.stat().st_size for path in files)
    if total <= max_size_mb * 1024 * 1024:
        return
    files.sort(key=lambda path: path.stat().st_mtime)
    limit = max_size_mb * 1024 * 1024
    for path in files:
        if total <= limit:
            break
        size = path.stat().st_size
        try:
            path.unlink()
        except OSError as exc:
            LOGGER.warning("Could not delete %s: %s", path, exc)
            continue
        total -= size
        LOGGER.info("Deleted old output file %s (%.2f MB)", path.name, size / (1024 * 1024))
    for folder in sorted(
        (path for path in root.rglob("*") if path.is_dir()),
        key=lambda path: len(path.parts),
        reverse=True,
    ):
        try:
            folder.rmdir()
        except OSError:
            pass

#!/usr/bin/env python3
"""
ci.py — Testable helpers for the export-ebooks GitHub workflow.

The workflow file stays small; all logic lives here so it can be
tested locally without waiting for CI:

    python -m scripts.export.ci describe --tag si_si
    python -m scripts.export.ci describe --tag hi_hi
    python -m scripts.export.ci resolve --tag ro_en --formats epub,pdf --shards 6
    python -m scripts.export.ci shard-books --data-dir ./data --shard 0 --shards 6
    python -m scripts.export.ci package --src ebook-output/ro_si --dist dist \\
        --tag ro_si --lang si --formats epub,pdf,md,docx

Subcommands:
    describe     Human-readable release title/body for a tag (local preview).
    resolve      Resolve + validate workflow inputs; prints values and
                 optionally appends KEY=VALUE lines to $GITHUB_OUTPUT.
    shard-books  Print the comma-separated book list for one shard.
    fetch-dbs    Download epitaka.db + epitaka_<lang>.db and verify them.
    package      Zip per-format outputs + write SHA256SUMS.
"""

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
import urllib.request
import zipfile

from .metadata import (
    VALID_FORMATS,
    VALID_SCRIPTS,
    language_name,
    pack_label,
    parse_tag,
    release_body,
    release_title,
    script_name,
)

_LANG_RE = re.compile(r"^[a-z]{2}(_[a-z]+)?$")


def resolve_config(
    event: str = "push",
    ref_name: str = "",
    script: str = "ro",
    lang: str = "",
    formats: str = "epub,pdf,md,docx",
    shards: str | int = 6,
    smoke_only: str | bool = False,
) -> dict:
    """Resolve + validate config. Pure logic — easy to unit test."""
    if event == "push":
        script, lang = parse_tag(ref_name)
        formats = "epub,pdf,md,docx"
        shards = 6
        smoke_only = False
    else:
        script = (script or "ro").strip().lower()
        lang = (lang or "").strip().lower()
        formats = (formats or "").replace(" ", "").lower()
        smoke_only = str(smoke_only).lower() in ("1", "true", "yes", "on")

    try:
        shards = int(str(shards).strip() or "6")
    except ValueError:
        raise ValueError(f"Shards must be 1-10, got '{shards}'.")

    tag = f"{script}_{lang}"
    if script not in VALID_SCRIPTS:
        raise ValueError(
            f"Unknown script '{script}'. Tag must be <script>_<lang>, e.g. ro_si."
        )
    if lang and not _LANG_RE.match(lang):
        raise ValueError(
            f"Bad language '{lang}'. Tag must be <script>_<lang>, e.g. ro_si."
        )
    fmt_list = [f for f in formats.split(",") if f]
    if not fmt_list or any(f not in VALID_FORMATS for f in fmt_list):
        raise ValueError(f"Bad formats '{formats}'. Use a subset of epub,pdf,md,docx.")
    if not 1 <= shards <= 10:
        raise ValueError(f"Shards must be 1-10, got '{shards}'.")

    matrix = {"shard": list(range(shards))}
    return {
        "script": script,
        "lang": lang,
        "tag": tag,
        "formats": ",".join(fmt_list),
        "shards": str(shards),
        "smoke_only": "true" if smoke_only else "false",
        "matrix": json.dumps(matrix),
        "script_name": script_name(script),
        "lang_name": language_name(lang) if lang else "",
        "pack_label": pack_label(script, lang),
        "release_title": release_title(tag, script, lang),
        "release_body": release_body(script, lang),
    }


def shard_book_ids(data_dir: str, shard: int, shards: int) -> list[str]:
    """Book IDs for one shard (stride i, i+N, ... — keeps shards balanced)."""
    db = os.path.join(data_dir, "epitaka.db")
    if not os.path.isfile(db):
        raise FileNotFoundError(f"Pali database not found: {db}")
    with sqlite3.connect(db) as conn:
        ids = [r[0] for r in conn.execute("SELECT book_id FROM books ORDER BY id")]
    shard, shards = int(shard), int(shards)
    return ids[shard::shards]


def db_urls(db_base_url: str, lang: str) -> dict[str, str]:
    """Download URLs for the core + translation DB zips (pure, testable)."""
    base = (db_base_url or "").rstrip("/")
    urls = {"epitaka": f"{base}/epitaka.zip"}
    if lang:
        urls[f"epitaka_{lang}"] = f"{base}/epitaka_{lang}.zip"
    return urls


def fetch_dbs(data_dir: str, lang: str, db_base_url: str) -> list[str]:
    """Download + unzip DBs, run integrity checks. Returns verified db paths."""
    import shutil
    import subprocess
    import tempfile

    os.makedirs(data_dir, exist_ok=True)
    verified = []
    for name, url in db_urls(db_base_url, lang).items():
        print(f"Downloading {name} from {url} ...")
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            urllib.request.urlretrieve(url, tmp_path)
            with zipfile.ZipFile(tmp_path) as zf:
                for member in zf.namelist():
                    if member.endswith(".db"):
                        zf.extract(member, data_dir)
                        # Flatten subdirectories (unzip -j behaviour)
                        src = os.path.join(data_dir, member)
                        dst = os.path.join(data_dir, os.path.basename(member))
                        if src != dst:
                            shutil.move(src, dst)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        for db in (
            os.path.join(data_dir, "epitaka.db"),
            os.path.join(data_dir, f"epitaka_{lang}.db") if lang else None,
        ):
            if db and db not in verified and os.path.isfile(db):
                _check_integrity(db)
                verified.append(db)
    # Cleanup stray subdirs left by extraction
    for root, dirs, _files in os.walk(data_dir):
        for d in dirs:
            p = os.path.join(root, d)
            if not os.listdir(p):
                os.rmdir(p)
    _run_cli_list_languages()
    return verified


def _check_integrity(db_path: str) -> None:
    with sqlite3.connect(db_path) as conn:
        row = conn.execute("PRAGMA integrity_check;").fetchone()
    if not row or row[0] != "ok":
        raise RuntimeError(f"{db_path} failed integrity check: {row}")
    print(f"  OK: {db_path}")


def _run_cli_list_languages() -> None:
    import subprocess

    subprocess.run(
        [sys.executable, "-m", "scripts.export.cli", "--list-languages"],
        check=False,
    )


def package_outputs(
    src: str, dist: str, tag: str, lang: str, formats: str
) -> list[str]:
    """Zip per-format outputs + write checksums. Returns created files."""
    import shutil

    if not os.path.isdir(src):
        raise FileNotFoundError(f"Nothing exported in {src}")
    os.makedirs(dist, exist_ok=True)
    fmt_list = [f.strip() for f in formats.split(",") if f.strip()]

    total = sum(len(fs) for _, _, fs in os.walk(src))
    print(f"Total files: {total}")

    created: list[str] = []
    lang_dir = os.path.join(src, lang) if lang else ""
    if lang and os.path.isdir(lang_dir):
        for fmt in fmt_list:
            fmt_dir = os.path.join(lang_dir, fmt)
            if not os.path.isdir(fmt_dir):
                print(f"No output for format {fmt}, skipping")
                continue
            out = os.path.join(dist, f"{tag}-{fmt}.zip")
            _zip_dir(src, os.path.join(lang, fmt), out)
            created.append(out)
    else:
        out = os.path.join(dist, f"{tag}-all.zip")
        _zip_dir(src, ".", out)
        created.append(out)

    sums = os.path.join(dist, "SHA256SUMS.txt")
    with open(sums, "w", encoding="utf-8") as f:
        for path in created:
            f.write(f"{_sha256(path)}  {os.path.basename(path)}\n")
    created.append(sums)
    for path in created:
        if os.path.getsize(path) == 0:
            raise RuntimeError(f"Empty file would break the release upload: {path}")
        print(f"  {os.path.basename(path)} ({os.path.getsize(path) / 1e6:.1f} MB)")
    return created


def _zip_dir(src_root: str, rel_dir: str, out_path: str) -> None:
    base = os.path.join(src_root, rel_dir) if rel_dir != "." else src_root
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(base):
            for fn in sorted(files):
                full = os.path.join(root, fn)
                arc = os.path.relpath(full, src_root)
                zf.write(full, arc)


def _sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _write_github_output(cfg: dict, path: str = "") -> None:
    path = path or os.environ.get("GITHUB_OUTPUT", "")
    if not path:
        return
    keys = (
        "script",
        "lang",
        "tag",
        "formats",
        "shards",
        "smoke_only",
        "matrix",
        "script_name",
        "lang_name",
        "pack_label",
        "release_title",
        "release_body",
    )
    with open(path, "a", encoding="utf-8") as f:
        for k in keys:
            # Multiline-safe: GitHub heredoc syntax for release_body
            if "\n" in cfg[k]:
                f.write(f"{k}<<EOF\n{cfg[k]}\nEOF\n")
            else:
                f.write(f"{k}={cfg[k]}\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Testable helpers for the export-ebooks workflow"
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("describe", help="Preview release title/body for a tag")
    p.add_argument("--tag", required=True, help="e.g. si_si, hi_hi, ro_en")

    p = sub.add_parser("resolve", help="Resolve workflow inputs")
    p.add_argument("--event", default="workflow_dispatch")
    p.add_argument("--ref-name", default="")
    p.add_argument("--tag", default="")
    p.add_argument("--script", default="ro")
    p.add_argument("--language", default="")
    p.add_argument("--formats", default="epub,pdf,md,docx")
    p.add_argument("--shards", default="6")
    p.add_argument("--smoke-only", default="false")
    p.add_argument("--github-output", default="")

    p = sub.add_parser("shard-books", help="Print book IDs for one shard")
    p.add_argument("--data-dir", default="data")
    p.add_argument("--shard", required=True)
    p.add_argument("--shards", required=True)

    p = sub.add_parser("fetch-dbs", help="Download + verify databases")
    p.add_argument("--data-dir", default="data")
    p.add_argument("--lang", default="")
    p.add_argument("--db-base-url", required=True)

    p = sub.add_parser("package", help="Zip per-format outputs + checksums")
    p.add_argument("--src", required=True)
    p.add_argument("--dist", default="dist")
    p.add_argument("--tag", required=True)
    p.add_argument("--lang", default="")
    p.add_argument("--formats", default="epub,pdf,md,docx")

    args = parser.parse_args(argv)

    if args.cmd == "describe":
        script, lang = parse_tag(args.tag)
        print(f"Tag:          {args.tag.strip().lower()}")
        print(f"Pali script:  {script_name(script)} ({script})")
        print(
            f"Translation:  {language_name(lang) if lang else '—'}"
            + (f" ({lang})" if lang else "")
        )
        print(f"Title:        {release_title(args.tag.strip().lower(), script, lang)}")
        print(f"Body:         {release_body(script, lang)}")
        return 0

    if args.cmd == "resolve":
        if args.tag and not args.ref_name:
            # Local shorthand: --tag ro_si derives script/lang but keeps
            # the other flags (formats/shards) as given.
            tag_script, tag_lang = parse_tag(args.tag)
            args.script, args.language = tag_script, tag_lang
        cfg = resolve_config(
            event=args.event,
            ref_name=args.ref_name,
            script=args.script,
            lang=args.language,
            formats=args.formats,
            shards=args.shards,
            smoke_only=args.smoke_only,
        )
        print(
            f"Resolved: tag={cfg['tag']} script={cfg['script']} "
            f"lang={cfg['lang'] or '<pali-only>'} formats={cfg['formats']} "
            f"shards={cfg['shards']} smoke={cfg['smoke_only']}"
        )
        print(f"Pack: {cfg['pack_label']}")
        print(f"Release: {cfg['release_title']}")
        _write_github_output(cfg, args.github_output)
        return 0

    if args.cmd == "shard-books":
        ids = shard_book_ids(args.data_dir, args.shard, args.shards)
        if not ids:
            print(f"Shard {args.shard} got no books", file=sys.stderr)
            return 1
        print(",".join(ids))
        return 0

    if args.cmd == "fetch-dbs":
        fetch_dbs(args.data_dir, args.lang, args.db_base_url)
        return 0

    if args.cmd == "package":
        package_outputs(args.src, args.dist, args.tag, args.lang, args.formats)
        return 0

    parser.error(f"Unknown command {args.cmd}")
    return 2


if __name__ == "__main__":
    sys.exit(main())

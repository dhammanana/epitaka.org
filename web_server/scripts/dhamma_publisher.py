#!/usr/bin/env python3
"""Generate one varied Dhamma social post, and optionally publish it.

    python3 web_server/scripts/dhamma_publisher.py              # generate
    python3 web_server/scripts/dhamma_publisher.py --post-facebook
    python3 web_server/scripts/dhamma_publisher.py --sample     # offline preview
    python3 web_server/scripts/dhamma_publisher.py --db-info    # inspect epitaka.db

No daemon, no database writes, no Docker.
"""

from __future__ import annotations

import argparse
import json
import logging
import random
import sys
import time
from datetime import datetime
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from dhamma import cloudflare, config  # noqa: E402
from dhamma.content import (  # noqa: E402
    build_image_prompt,
    compose_caption,
    generate_content,
    offline_content,
)
from dhamma.corpus import EpitakaCorpus  # noqa: E402
from dhamma.facebook import publish_facebook_photo  # noqa: E402
from dhamma.render import painted_background, render_card  # noqa: E402
from dhamma.scenarios import (  # noqa: E402
    FORMATS,
    SCENARIOS_BY_KEY,
    append_history,
    build_plan,
    load_history,
    record_for,
)
from dhamma.storage import (  # noqa: E402
    append_manifest,
    cleanup_output,
    post_paths,
    save_json,
)

LOGGER = logging.getLogger("dhamma")
MAX_LOG_BYTES = 50 * 1024 * 1024


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate one Dhamma image post.")
    parser.add_argument("--sample", action="store_true", help="Offline card from the bundled corpus; no API keys needed.")
    parser.add_argument("--samples", type=int, default=1, metavar="N", help="With --sample: render N different posts (default 1).")
    parser.add_argument("--text-only", action="store_true", help="Write the caption JSON without rendering an image.")
    parser.add_argument("--post-facebook", action="store_true", help="Publish the result to the Facebook Page.")
    parser.add_argument("--scenario", choices=sorted(SCENARIOS_BY_KEY), help="Force one scenario instead of rotating.")
    parser.add_argument("--format", choices=sorted(FORMATS), dest="format_key", help="Force one post format.")
    parser.add_argument("--seed", type=int, help="Reproduce a particular plan (same corpus, same history).")
    parser.add_argument("--db-info", action="store_true", help="Print epitaka.db schema, books and sample passages, then exit.")
    return parser.parse_args(argv)


def setup_logging() -> None:
    config.LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_file = config.LOG_DIR / "publisher.log"
    if log_file.exists() and log_file.stat().st_size > MAX_LOG_BYTES:
        log_file.unlink()
        print("Old log deleted because it exceeded 50 MB.")
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )


def build_post(plan, content: dict) -> dict:
    post = {
        "title": content["title"],
        "card_text": content["card_text"],
        "caption": content["caption"],
        "tags": content["tags"],
        "label": plan.scenario.label,
        "scenario": plan.scenario.key,
        "format": plan.fmt.key,
        "layout": plan.layout,
        "palette": plan.palette,
        "image_prompt": build_image_prompt(plan, content),
    }
    if plan.verse:
        post.update(
            pali=plan.verse.pali,
            quote=plan.verse.english,
            ref=plan.verse.ref,
            source_label=plan.verse.ref,
        )
    elif plan.reading:
        post.update(
            pali=plan.reading.pali,
            quote=plan.reading.translation,
            ref=plan.reading.ref,
            source_label=f'{plan.reading.book_name}, {plan.reading.ref}',
        )
    elif plan.story:
        post.update(
            pali="",
            quote=plan.story.key_line,
            ref=plan.story.source,
            source_label=plan.story.source,
        )
    else:
        post.update(pali="", quote="", ref="", source_label="")
    return post


def post_background(plan, post: dict, offline: bool):
    if offline:
        return painted_background(plan.palette, seed=abs(hash((plan.scenario.key, plan.fmt.key))) & 0xFFFF)
    LOGGER.info("Requesting a background image...")
    try:
        return cloudflare.image(post["image_prompt"])
    except RuntimeError as exc:
        LOGGER.warning("Background generation failed (%s); using a painted background.", exc)
        return painted_background(plan.palette, seed=int(time.time()) & 0xFFFF)


def print_db_info(corpus: EpitakaCorpus) -> int:
    info = corpus.describe()
    print(json.dumps(info, ensure_ascii=False, indent=2))
    if not info["pali_db_exists"]:
        print(
            "\nNo epitaka.db found. Set EPITAKA_DB_PATH, or put the database at "
            f"{config.data_dir()}/epitaka.db. Bundled verses and stories are used instead.",
            file=sys.stderr,
        )
        return 1
    rng = random.Random(7)
    for _ in range(3):
        passage = corpus.random_reading(rng, attempts=60)
        if passage:
            print(f"\n--- sample: {passage.ref} ({passage.book_name})")
            print(passage.pali[:300])
            print("   ->", (passage.translation or "(no translation)")[:300])
    return 0


def run(args: argparse.Namespace) -> int:
    config.load_env()
    corpus = EpitakaCorpus()
    try:
        if args.db_info:
            return print_db_info(corpus)

        history = load_history()
        rng = random.Random(args.seed if args.seed is not None else time.time_ns())
        total = max(1, args.samples) if args.sample else 1

        for index in range(total):
            plan = build_plan(history, corpus, rng, args.scenario, args.format_key)
            LOGGER.info("Plan: %s", plan.describe())
            content = offline_content(plan) if args.sample else generate_content(plan, history)
            post = build_post(plan, content)
            post["caption_composed"] = compose_caption(post)

            when = datetime.now()
            paths = post_paths(plan.scenario.key, when)
            post["created_at"] = when.isoformat(timespec="seconds")

            if args.text_only:
                save_json(paths.meta, post)
                LOGGER.info("Text saved to %s", paths.meta)
                print("\n--- POST ---\n" + json.dumps(post, ensure_ascii=False, indent=2))
                continue

            background = post_background(plan, post, args.sample)
            render_card(background, post, paths.image, plan.layout, plan.palette)
            save_json(paths.meta, post)
            LOGGER.info("Saved %s", paths.image)

            append_manifest(
                {
                    "time": post["created_at"],
                    "scenario": plan.scenario.key,
                    "format": plan.fmt.key,
                    "layout": plan.layout,
                    "palette": plan.palette,
                    "ref": post.get("ref"),
                    "tags": post["tags"],
                    "image": str(paths.image.relative_to(config.OUTPUT_DIR)),
                    "title": post["title"],
                }
            )
            cleanup_output()

            print("\n--- CAPTION ---\n" + post["caption_composed"])
            print(f"\nImage: {paths.image}")

            if args.post_facebook:
                LOGGER.info("Publishing to Facebook...")
                result = publish_facebook_photo(paths.image, post["caption_composed"])
                post["facebook_photo_id"] = result.get("id")
                post["facebook_post_id"] = result.get("post_id")
                save_json(paths.meta, post)

            if not args.sample:
                history = append_history(record_for(plan, post, when, str(paths.image)))
        return 0
    finally:
        corpus.close()


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging()
    try:
        return run(args)
    except Exception as exc:  # noqa: BLE001 - top-level guard for cron
        logging.exception("FAILED: %s", exc)
        print(f"\nERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

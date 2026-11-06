"""Publish one photo and caption to a Facebook Page."""

from __future__ import annotations

import json
import logging
import ssl
import urllib.error
import urllib.request
from pathlib import Path

import certifi

from .config import setting

LOGGER = logging.getLogger(__name__)


def publish_facebook_photo(image_path: Path, caption: str) -> dict:
    page_id = setting("FACEBOOK_PAGE_ID")
    access_token = setting("FACEBOOK_PAGE_ACCESS_TOKEN")
    api_version = setting("FACEBOOK_GRAPH_API_VERSION", "v26.0")

    if not page_id or not access_token:
        raise RuntimeError("Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in .env")

    image_path = Path(image_path)
    if not image_path.is_file():
        raise RuntimeError(f"Image not found: {image_path}")

    boundary = "----DhammaPublisherBoundary7MA4YWxkTrZu0gW"
    parts: list[bytes] = []

    def add_field(name: str, value: str) -> None:
        parts.append(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{name}"\r\n'
                f"\r\n{value}\r\n"
            ).encode("utf-8")
        )

    add_field("message", caption)
    add_field("access_token", access_token)
    parts.append(
        (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="source"; '
            f'filename="{image_path.name}"\r\n'
            f"Content-Type: image/jpeg\r\n"
            f"\r\n"
        ).encode("utf-8")
        + image_path.read_bytes()
        + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))

    url = f"https://graph.facebook.com/{api_version}/{page_id}/photos"
    request = urllib.request.Request(
        url,
        data=b"".join(parts),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )

    try:
        context = ssl.create_default_context(cafile=certifi.where())
        with urllib.request.urlopen(request, timeout=120, context=context) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Facebook API error HTTP {exc.code}: {detail[:1200]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Facebook network error: {exc.reason}") from exc

    if "id" not in result:
        raise RuntimeError(f"Facebook did not return a photo ID: {result}")

    LOGGER.info("Published Facebook photo %s", result["id"])
    if result.get("post_id"):
        LOGGER.info("Facebook post %s", result["post_id"])
    return result

"""Publish one photo or one reel, with its caption, to a Facebook Page."""

from __future__ import annotations

import json
import logging
import ssl
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Callable

import certifi

from . import token as page_token_store
from .config import setting

LOGGER = logging.getLogger(__name__)

AUTH_ERROR_CODES = {102, 190}


class FacebookAuthError(RuntimeError):
    """The Page access token is missing, expired, or lacks permission."""


def _error_payload(detail: str) -> dict:
    try:
        payload = json.loads(detail)
    except ValueError:
        return {}
    error = payload.get("error") if isinstance(payload, dict) else None
    return error if isinstance(error, dict) else {}


def _is_auth_error(detail: str) -> bool:
    error = _error_payload(detail)
    return error.get("code") in AUTH_ERROR_CODES or error.get("type") == "OAuthException"


def _auth_message(detail: str, token_len: int) -> str:
    reason = _error_payload(detail).get("message") or detail[:300]
    return (
        f"Facebook rejected FACEBOOK_PAGE_ACCESS_TOKEN ({token_len} characters): {reason} "
        "Generate a new long-lived Page access token, update it in web_server/.env, "
        "and rerun (steps: scripts/dhamma/README.md, 'Keeping the Page token alive')."
    )


def _renewal_hint(exc: FacebookAuthError) -> FacebookAuthError:
    return FacebookAuthError(
        f"{exc} To have this renewed automatically on future runs, set FACEBOOK_APP_ID, "
        "FACEBOOK_APP_SECRET and a user token (FACEBOOK_LONG_LIVED_USER_TOKEN) in .env."
    )


def _token_problem(token: str) -> str | None:
    """Describe why a value cannot be an access token, or None if it looks plausible.

    Catches the bad pastes that Facebook only answers with an opaque
    "Malformed access token": truncated tokens, wrapped lines, quotes kept from
    the docs, or a URL/JSON blob copied instead of the token itself.
    """
    if not token:
        return "it is empty"
    if any(char.isspace() for char in token):
        return "it contains a space or line break, so it was probably wrapped when copied"
    if any(char in token for char in '"\''):
        return "it contains quote characters, so the quotes were copied along with it"
    if token.startswith("{") or token.startswith("["):
        return "it starts with a brace, so a JSON response was copied instead of the token"
    if token.lower().startswith("http"):
        return "it is a URL, not a token"
    if "=" in token or "&" in token:
        return "it looks like a query string such as access_token=… rather than the token alone"
    if len(token) < 40:
        return f"it is only {len(token)} characters long; Page tokens are usually 150 or more"
    return None


def _ssl_context() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def _send(request: urllib.request.Request, access_token: str) -> dict:
    """Perform one Graph or rupload call and return its JSON body."""
    try:
        with urllib.request.urlopen(request, timeout=120, context=_ssl_context()) as response:
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if _is_auth_error(detail):
            raise FacebookAuthError(_auth_message(detail, len(access_token))) from exc
        raise RuntimeError(f"Facebook API error HTTP {exc.code}: {detail[:1200]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Facebook network error: {exc.reason}") from exc

    try:
        return json.loads(body)
    except ValueError:
        raise RuntimeError(f"Facebook returned a non-JSON response: {body[:1200]}") from None


def _json_post(url: str, payload: dict) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )


def _form_post(url: str, fields: dict) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        data=urllib.parse.urlencode(fields).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )


def _attempt_with_renewal(attempt: Callable[[str | None], dict]) -> dict:
    """Run the attempt, renewing the Page token once if Facebook rejects it."""
    try:
        return attempt(None)
    except FacebookAuthError as exc:
        if not page_token_store.refresh_configured():
            raise _renewal_hint(exc) from None
        LOGGER.warning("Facebook rejected the stored Page token; renewing it now.")
        try:
            page = page_token_store.refresh_page_token()
        except page_token_store.TokenError as renewal:
            raise FacebookAuthError(f"{exc} Automatic renewal failed: {renewal}") from renewal
        LOGGER.info("Stored a new Page token for %s.", page.get("name") or page.get("id") or "the Page")
        try:
            return attempt(str(page["access_token"]))
        except FacebookAuthError as retry:
            raise FacebookAuthError(f"{retry} (the renewed token was rejected too)") from retry


def _credentials(access_token: str | None) -> tuple[str, str, str]:
    page_id = setting("FACEBOOK_PAGE_ID")
    access_token = access_token or setting("FACEBOOK_PAGE_ACCESS_TOKEN")
    api_version = setting("FACEBOOK_GRAPH_API_VERSION", "v26.0")

    if not page_id or not access_token:
        raise FacebookAuthError("Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in .env")

    problem = _token_problem(access_token)
    if problem:
        raise FacebookAuthError(
            f"FACEBOOK_PAGE_ACCESS_TOKEN cannot be used: {problem} "
            "Fix the value in web_server/.env (steps: scripts/dhamma/README.md, "
            "'Keeping the Page token alive') and rerun."
        )
    return page_id, access_token, api_version


def publish_facebook_photo(image_path: Path, caption: str) -> dict:
    """Publish the photo, renewing the Page token once if Facebook rejects it."""
    return _attempt_with_renewal(lambda token: _post_photo(image_path, caption, token))


def _post_photo(image_path: Path, caption: str, access_token: str | None = None) -> dict:
    page_id, access_token, api_version = _credentials(access_token)

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

    result = _send(request, access_token)
    if "id" not in result:
        raise RuntimeError(f"Facebook did not return a photo ID: {result}")

    LOGGER.info("Published Facebook photo %s", result["id"])
    if result.get("post_id"):
        LOGGER.info("Facebook post %s", result["post_id"])
    return result


def publish_facebook_reel(video_path: Path, caption: str) -> dict:
    """Publish the video as a Reel, renewing the Page token once if rejected."""
    return _attempt_with_renewal(lambda token: _post_reel(video_path, caption, token))


def _post_reel(video_path: Path, caption: str, access_token: str | None = None) -> dict:
    """Three-step Reels Publishing API flow: start, upload, finish."""
    page_id, access_token, api_version = _credentials(access_token)

    video_path = Path(video_path)
    if not video_path.is_file():
        raise RuntimeError(f"Video not found: {video_path}")

    reels_url = f"https://graph.facebook.com/{api_version}/{page_id}/video_reels"
    session = _send(
        _json_post(reels_url, {"upload_phase": "start", "access_token": access_token}),
        access_token,
    )
    video_id = session.get("video_id")
    upload_url = session.get("upload_url")
    if not video_id or not upload_url:
        raise RuntimeError(f"Facebook did not open a reel upload session: {session}")

    size = video_path.stat().st_size
    upload = urllib.request.Request(
        str(upload_url),
        data=video_path.read_bytes(),
        headers={
            "Authorization": f"OAuth {access_token}",
            "offset": "0",
            "file_size": str(size),
            "Content-Type": "application/octet-stream",
        },
        method="POST",
    )
    _send(upload, access_token)

    result = _send(
        _form_post(
            reels_url,
            {
                "access_token": access_token,
                "video_id": video_id,
                "upload_phase": "finish",
                "video_state": "PUBLISHED",
                "description": caption,
            },
        ),
        access_token,
    )
    if not result.get("success"):
        raise RuntimeError(f"Facebook did not confirm the reel: {result}")

    LOGGER.info("Published Facebook Reel %s", video_id)
    if result.get("post_id"):
        LOGGER.info("Facebook post %s", result["post_id"])
    return {"video_id": video_id, **result}

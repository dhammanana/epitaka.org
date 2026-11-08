"""Long-lived Facebook Page access tokens.

A Page token derived from a long-lived user token does not expire, so the daily
publisher can keep posting without manual token swaps. This module performs the
exchange, stores the result back into .env (one unbroken line), and reports
expiry through /debug_token.
"""

from __future__ import annotations

import json
import logging
import os
import ssl
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

import certifi

from .config import ENV_CANDIDATES, setting

LOGGER = logging.getLogger(__name__)

PAGE_TOKEN_KEY = "FACEBOOK_PAGE_ACCESS_TOKEN"
USER_TOKEN_KEYS = ("FACEBOOK_LONG_LIVED_USER_TOKEN", "FACEBOOK_USER_ACCESS_TOKEN")
REQUIRED_SCOPES = ("pages_show_list", "pages_manage_posts", "pages_read_engagement")


class TokenError(RuntimeError):
    """The Page token could not be exchanged, fetched, verified or stored."""


def _graph_root() -> str:
    version = setting("FACEBOOK_GRAPH_API_VERSION", "v26.0") or "v26.0"
    return f"https://graph.facebook.com/{version}"


def _error_text(detail: str) -> str:
    try:
        error = json.loads(detail).get("error") or {}
    except (ValueError, AttributeError):
        return detail[:300]
    if not isinstance(error, dict):
        return detail[:300]
    message = str(error.get("message") or detail[:300])
    extras = ", ".join(str(error[key]) for key in ("code", "error_subcode") if error.get(key))
    return f"{message} ({extras})" if extras else message


def _request(method: str, path: str, params: dict[str, str]) -> dict:
    data = urllib.parse.urlencode(params).encode("utf-8") if method == "POST" else None
    url = f"{_graph_root()}/{path}"
    if method == "GET":
        url = f"{url}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"} if data else {},
        method=method,
    )
    context = ssl.create_default_context(cafile=certifi.where())
    try:
        with urllib.request.urlopen(request, timeout=30, context=context) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise TokenError(f"Facebook refused {path}: {_error_text(detail)}") from exc
    except urllib.error.URLError as exc:
        raise TokenError(f"Facebook network error while reaching {path}: {exc.reason}") from exc
    except ValueError as exc:
        raise TokenError(f"Facebook returned invalid JSON for {path}") from exc
    if not isinstance(payload, dict):
        raise TokenError(f"Unexpected Facebook response from {path}")
    return payload


def _get(path: str, params: dict[str, str]) -> dict:
    return _request("GET", path, params)


def _post(path: str, params: dict[str, str]) -> dict:
    return _request("POST", path, params)


def _app_credentials() -> tuple[str, str]:
    app_id = setting("FACEBOOK_APP_ID")
    app_secret = setting("FACEBOOK_APP_SECRET")
    if not app_id or not app_secret:
        raise TokenError(
            "Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in .env "
            "(App settings → Basic) so the Page token can be renewed."
        )
    return app_id, app_secret


def _clean_token(value: str) -> str:
    token = (value or "").strip().strip('"').strip("'")
    if not token:
        raise TokenError("The token is empty.")
    if any(char.isspace() for char in token):
        raise TokenError("The token contains a space or line break; copy it as one unbroken string.")
    return token


def user_token() -> str | None:
    """The stored long-lived user token, if any."""
    for key in USER_TOKEN_KEYS:
        value = (setting(key) or "").strip()
        if value:
            return value
    return None


def refresh_configured() -> bool:
    """True when the app id/secret and a long-lived user token are all present."""
    return bool(setting("FACEBOOK_APP_ID") and setting("FACEBOOK_APP_SECRET") and user_token())


def exchange_user_token(short_token: str) -> str:
    """Trade a short-lived user token for a ~60-day user token."""
    app_id, app_secret = _app_credentials()
    payload = _post(
        "oauth/access_token",
        {
            "grant_type": "fb_exchange_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "fb_exchange_token": _clean_token(short_token),
        },
    )
    token = payload.get("access_token")
    if not token:
        raise TokenError(f"Facebook returned no access_token: {payload}")
    return str(token)


def list_pages(user_access_token: str) -> list[dict]:
    payload = _get(
        "me/accounts",
        {
            "fields": "id,name,access_token",
            "limit": "100",
            "access_token": _clean_token(user_access_token),
        },
    )
    pages = payload.get("data") or []
    if not isinstance(pages, list):
        raise TokenError(f"Unexpected /me/accounts response: {payload}")
    return [page for page in pages if isinstance(page, dict) and page.get("access_token")]


def page_token(user_access_token: str, page_id: str | None = None) -> dict:
    """The Page entry (id, name, access_token) for FACEBOOK_PAGE_ID."""
    wanted = (page_id or setting("FACEBOOK_PAGE_ID") or "").strip()
    pages = list_pages(user_access_token)
    if not pages:
        raise TokenError(
            "That user token cannot see any Pages. Log in to the Graph API Explorer as someone "
            "who manages the Page, and request pages_show_list and pages_manage_posts."
        )
    if wanted:
        for page in pages:
            if str(page.get("id")) == wanted:
                return page
        available = ", ".join(f"{page.get('name')} ({page.get('id')})" for page in pages)
        raise TokenError(
            f"Page {wanted} (FACEBOOK_PAGE_ID) is not in this token's /me/accounts. "
            f"Available: {available}. Check the Page id and that the user still administers it."
        )
    if len(pages) > 1:
        available = ", ".join(f"{page.get('name')} ({page.get('id')})" for page in pages)
        raise TokenError(
            f"FACEBOOK_PAGE_ID is not set and this user manages several Pages: {available}. "
            "Set FACEBOOK_PAGE_ID in .env and rerun."
        )
    return pages[0]


def debug_token(access_token: str) -> dict:
    """Token metadata from /debug_token; expires_at == 0 means no expiry."""
    app_id, app_secret = _app_credentials()
    payload = _get(
        "debug_token",
        {"input_token": _clean_token(access_token), "access_token": f"{app_id}|{app_secret}"},
    )
    data = payload.get("data")
    if not isinstance(data, dict):
        raise TokenError(f"Unexpected /debug_token response: {payload}")
    return data


def describe_debug(info: dict) -> str:
    if not info:
        return "Facebook returned no token information."
    expires = info.get("expires_at")
    if expires in (0, "0"):
        expiry = "never (a Page token from a long-lived user token)"
    elif isinstance(expires, (int, float)):
        expiry = datetime.fromtimestamp(expires).strftime("%Y-%m-%d %H:%M")
    else:
        expiry = "unknown"
    scopes = [str(scope) for scope in (info.get("scopes") or [])]
    lines = [
        f"Token valid: {'yes' if info.get('is_valid') else 'NO'}",
        f"Token expires: {expiry}",
        f"Type: {info.get('type') or 'unknown'}",
        f"Scopes: {' '.join(scopes) or 'unknown'}",
    ]
    missing = [scope for scope in REQUIRED_SCOPES if scope not in scopes]
    if missing:
        lines.append(f"Missing scopes: {' '.join(missing)}")
    return "\n".join(lines)


def _target_for(key: str) -> Path:
    """The .env that already holds ``key``, so a rewrite lands where cron reads it."""
    existing = [candidate for candidate in ENV_CANDIDATES if candidate.is_file()]
    for candidate in existing:
        if _contains_key(candidate, key):
            return candidate
    # A new key belongs beside the other Facebook settings, not in a fresh file
    # that the earlier candidate would shadow.
    for candidate in existing:
        if _contains_key(candidate, PAGE_TOKEN_KEY) or _contains_key(candidate, "FACEBOOK_APP_ID"):
            return candidate
    return existing[0] if existing else ENV_CANDIDATES[0]


def save_setting(key: str, value: str, path: Path | None = None) -> Path:
    """Write ``key=value`` as one line in .env, keeping every other line as it is."""
    value = _clean_token(value)
    target = path or _target_for(key)

    text = target.read_text(encoding="utf-8") if target.is_file() else ""
    lines: list[str] = []
    replaced = False
    for raw in text.splitlines():
        stripped = raw.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            if stripped.split("=", 1)[0].strip() == key:
                lines.append(f"{key}={value}")
                replaced = True
                continue
        lines.append(raw)
    if not replaced:
        lines.append(f"{key}={value}")

    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(f"{target.name}.tmp")
    temporary.write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")
    temporary.chmod(target.stat().st_mode & 0o777 if target.is_file() else 0o600)
    os.replace(temporary, target)
    os.environ[key] = value
    LOGGER.info("Saved %s to %s", key, target)
    return target


def _contains_key(path: Path, key: str) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return False
    for raw in text.splitlines():
        stripped = raw.strip()
        if stripped and not stripped.startswith("#") and "=" in stripped:
            if stripped.split("=", 1)[0].strip() == key:
                return True
    return False


def setup_from_user_token(raw_token: str | None = None) -> tuple[dict, dict, Path]:
    """Short-lived user token → long-lived user token → permanent Page token.

    Also stores the long-lived user token, so later runs can re-derive the Page
    token if it is ever invalidated.
    """
    source = (raw_token or "").strip() or user_token()
    if not source:
        raise TokenError(
            "No user token given and no FACEBOOK_LONG_LIVED_USER_TOKEN stored. "
            "Pass the user token from the Graph API Explorer."
        )
    target = _target_for(PAGE_TOKEN_KEY)
    long_user_token = exchange_user_token(source)
    save_setting(USER_TOKEN_KEYS[0], long_user_token, target)
    page = page_token(long_user_token)
    path = save_setting(PAGE_TOKEN_KEY, str(page["access_token"]), target)
    info = debug_token(str(page["access_token"]))
    return page, info, path


def refresh_page_token() -> dict:
    """Re-derive the Page token from the stored long-lived user token."""
    stored = user_token()
    if not stored:
        raise TokenError("No FACEBOOK_LONG_LIVED_USER_TOKEN stored, so the Page token cannot be renewed.")
    page = page_token(stored)
    save_setting(PAGE_TOKEN_KEY, str(page["access_token"]))
    return page


def check_token(value: str | None = None) -> tuple[bool, dict]:
    token = _clean_token(value or setting(PAGE_TOKEN_KEY) or "")
    info = debug_token(token)
    return bool(info.get("is_valid")), info

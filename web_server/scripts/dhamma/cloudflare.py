"""Cloudflare Workers AI: JSON helpers for text and image generation."""

from __future__ import annotations

import base64
import io
import json
import ssl
import urllib.error
import urllib.request

import certifi
from PIL import Image

from .config import setting

DEFAULT_TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
DEFAULT_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell"


def _credentials() -> tuple[str, str]:
    account = setting("CLOUDFLARE_ACCOUNT_ID")
    token = setting("CLOUDFLARE_API_TOKEN")
    if not account or not token:
        raise RuntimeError("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env")
    return account, token


def _request_json(url: str, payload: dict, headers: dict | None, timeout: int = 120):
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST",
    )
    try:
        context = ssl.create_default_context(cafile=certifi.where())
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            raw = response.read()
            if raw[:1] in (b"{", b"["):
                return json.loads(raw.decode("utf-8"))
            return raw
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:1500]
        raise RuntimeError(f"Workers AI returned HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Network error: {exc.reason}") from exc


def text_completion(messages: list[dict], temperature: float = 0.9, max_tokens: int = 800):
    account, token = _credentials()
    model = setting("CLOUDFLARE_TEXT_MODEL", DEFAULT_TEXT_MODEL)
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}"
    payload = {
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }
    result = _request_json(url, payload, {"Authorization": f"Bearer {token}"}, timeout=120)
    if not isinstance(result, dict):
        raise RuntimeError("Workers AI returned a non-JSON response.")
    if result.get("success") is False:
        errors = json.dumps(result.get("errors", result), ensure_ascii=False)
        raise RuntimeError(f"Workers AI rejected the request: {errors[:1200]}")
    return (result.get("result") or {}).get("response")


def image(prompt: str) -> Image.Image:
    account, token = _credentials()
    model = setting("CLOUDFLARE_IMAGE_MODEL", DEFAULT_IMAGE_MODEL)
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}"
    result = _request_json(
        url, {"prompt": prompt, "steps": 4}, {"Authorization": f"Bearer {token}"}, timeout=180
    )
    if not isinstance(result, dict):
        raise RuntimeError("Workers AI returned a non-JSON image response.")
    encoded = (result.get("result") or {}).get("image")
    if not encoded:
        raise RuntimeError(
            "Workers AI image response had no image: "
            + json.dumps(result, ensure_ascii=False)[:800]
        )
    try:
        return Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
    except Exception as exc:  # noqa: BLE001 - any decode failure is fatal for the image
        raise RuntimeError(f"Could not decode the Workers AI image: {exc}") from exc

"""Turn a post into a vertical MP4 that Facebook accepts as a Reel.

The reel is the post's photo, full-bleed in 9:16, with a small frosted-glass
panel that hugs the text. The panel is translucent and blurs whatever is behind
it live, so the photo shows through while it moves. The photo zooms in and
slides one way (left, right, up or down; random by default). The panel stays
put, and the text animates in with a randomly chosen style (rise, drop, left,
right, zigzag, fade or line-by-line), then holds still so it is easy to read.

Everything heavy is done once, in Pillow, before ffmpeg starts: the photo is
fitted and the panel is tinted and set with text. ffmpeg then only moves the
photo, blurs the glass, lays the panel on top and encodes. That keeps the
render fast and the memory low enough for a small (1 GB) server.

The first frame is already the photo with its glass panel (no fade from
black). Because the text builds up over the first seconds, a cover image of the
finished frame is saved next to the video as ``<name>.thumb.jpg``. The video and
the music fade out together at the end.

Music: with no tracks in ``assets/music`` the first call to ``pick_music``
downloads a few calm CC0 (public domain) tracks from OpenGameArt. A page is
used only if it lists the CC0 licence, and what was downloaded is recorded in
``SOURCES.md`` next to the tracks. Set ``REEL_MUSIC_AUTOFETCH=0`` to turn this
off; add your own CC0 / public-domain files to the folder at any time.

Call ``build_reel(..., post=post, background=photo, palette="...")`` for the
photo-and-glass look. Without ``post``/``background`` it falls back to the
finished card image, staged on a blurred backdrop.

The output follows Facebook's Reels specs: 1080x1920, 30 fps, H.264 4:2:0 with
a closed 2-second GOP, BT.709 colour tags, and a stereo AAC track (silence when
there is no music).
"""

from __future__ import annotations

import html as htmllib
import logging
import random
import re
import shutil
import subprocess
import tempfile
from dataclasses import replace
from pathlib import Path
from typing import Iterable
from urllib import error as urlerror
from urllib import request as urlrequest
from urllib.parse import unquote, urljoin

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps, ImageStat

from . import config
from . import render
from .config import setting

LOGGER = logging.getLogger(__name__)

REEL_SIZE = (1080, 1920)
FPS = 30
MIN_SECONDS = 3
MAX_SECONDS = 90
DEFAULT_SECONDS = 12
DEFAULT_MUSIC_VOLUME = 0.6
MUSIC_SUFFIXES = (".mp3", ".m4a", ".aac", ".ogg", ".opus", ".wav")

# --- motion ---------------------------------------------------------------------
ZOOM_START = 1.10            # the photo is always a little zoomed in, so it has
ZOOM_END = 1.22              # room to slide; it pushes in from start to end
SLIDE_X = 0.90               # how much of the spare room a sideways slide uses
SLIDE_Y = 0.55               # same for up/down (the photo has more room there)
MOTIONS = ("left", "right", "up", "down")
HI_RES = 2                   # photo is moved from a 2x copy, so motion is smooth
FADE_OUT = 0.6               # seconds; video and music fade out together

# --- text animation ----------------------------------------------------------------
TEXT_STYLES = ("rise", "drop", "left", "right", "zigzag", "fade", "lines")
TEXT_START = 0.25            # seconds before the first piece of text appears
TEXT_SHARE = 0.40            # all the text is in by this share of the reel
EL_PAD = 10                  # spare pixels round each text layer (descenders)
MAX_LINE_ELEMENTS = 24       # more lines than this: animate by block instead

# --- glass panel -------------------------------------------------------------------
# BOX_ALPHA is the tint strength: lower = more see-through.
BOX_ALPHA = 0.50
BOX_MAX_WIDTH = 880          # widest the panel may be (text + padding)
BOX_MIN_WIDTH = 520
BOX_PAD_X = 50
BOX_PAD_Y = 46
BOX_MAX_TEXT_HEIGHT = 760
BOX_RADIUS = 34
FROST_SIGMA = 3.5            # blur behind the glass, measured at 1/4 resolution
SHADOW_ALPHA = 90
SHADOW_MARGIN = 64           # room around the panel for its shadow

# The Reels interface covers the top ~14 % and the bottom ~28 % of the screen.
SAFE_TOP = 270
SAFE_BOTTOM = 1400
BOX_CENTER_Y = 860

# --- music download -----------------------------------------------------------------
MAX_FETCH = 3                # tracks downloaded on the first run
MAX_TRACK_BYTES = 40 * 1024 * 1024
USER_AGENT = "Mozilla/5.0 (compatible; epitaka-reel/1.0)"
AUDIO_PREFERENCE = (".mp3", ".ogg", ".oga", ".wav", ".flac")

# Calm tracks listed as CC0 on OpenGameArt. The licence is checked again on the
# live page before anything is downloaded.
CC0_TRACKS = (
    {"title": "Calm Track", "author": "pmiller",
     "page": "https://opengameart.org/content/calm-track"},
    {"title": "Calm Ambient 1 (Synthwave 4k)", "author": "cynicmusic",
     "page": "https://opengameart.org/node/97098"},
    {"title": "Daydream", "author": "Shuukura",
     "page": "https://opengameart.org/node/159092"},
    {"title": "Contemplation", "author": "Joth",
     "page": "https://opengameart.org/content/contemplation-0"},
    {"title": "Simple menu/background music loop", "author": "polosik",
     "page": "https://opengameart.org/node/186484"},
    {"title": "calm theme", "author": "pebonius",
     "page": "https://opengameart.org/node/156511"},
)
_FETCH_TRIED = False


class ReelError(RuntimeError):
    """ffmpeg is missing, or it could not produce the video."""


# --- ffmpeg helpers ------------------------------------------------------------------
def ffmpeg_path() -> str:
    """System ffmpeg, else the static binary shipped by imageio-ffmpeg."""
    configured = setting("FFMPEG_PATH")
    if configured:
        found = shutil.which(configured)
        if not found and Path(configured).is_file():
            found = configured
        if not found:
            raise ReelError(
                f"FFMPEG_PATH points to {configured}, which is not an executable file."
            )
        return found

    found = shutil.which("ffmpeg")
    if found:
        return found

    try:
        import imageio_ffmpeg  # optional: a static ffmpeg bundled with the venv

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as exc:  # noqa: BLE001 - fall through to the install hint
        LOGGER.debug("No bundled ffmpeg available: %s", exc)

    raise ReelError(
        "ffmpeg was not found, so the reel cannot be rendered. Install it "
        "(Debian/Ubuntu: sudo apt install ffmpeg), or pip install imageio-ffmpeg, "
        "or set FFMPEG_PATH in .env."
    )


# --- music: folder, CC0 download, picking -----------------------------------------------
def music_dir() -> Path:
    """Folder holding the background tracks; ``REEL_MUSIC_DIR`` overrides it."""
    configured = setting("REEL_MUSIC_DIR")
    if configured:
        return Path(configured).expanduser()
    return config.SCRIPTS_DIR / "assets" / "music"


def available_music() -> list[Path]:
    folder = music_dir()
    if not folder.is_dir():
        return []
    return sorted(
        path
        for path in folder.iterdir()
        if path.is_file()
        and not path.name.startswith(".")
        and path.suffix.lower() in MUSIC_SUFFIXES
    )


def _page_is_cc0(page: str) -> bool:
    """True when the page's own licence field lists CC0."""
    text = htmllib.unescape(re.sub(r"<[^>]+>", " ", page))
    section = re.search(
        r"License\(s\):(.{0,400}?)(?:Collections:|Favorites:|Preview:|$)", text, re.S | re.I
    )
    if section:
        return re.search(r"\bCC0\b", section.group(1)) is not None
    return re.search(r"creativecommons\.org/publicdomain/zero/1\.0", page, re.I) is not None


def _audio_links(page: str, page_url: str) -> list[str]:
    """Audio file links on an OpenGameArt page, best format first."""
    found: list[str] = []
    pattern = r"""href=["']([^"'#?]*/sites/default/files/[^"'#?]+\.(?:mp3|ogg|oga|wav|flac))["']"""
    for match in re.finditer(pattern, page, re.I):
        url = urljoin(page_url, htmllib.unescape(match.group(1)))
        if "/styles/" in url or "audio_preview" in url or url in found:
            continue
        found.append(url)
    order = {suffix: i for i, suffix in enumerate(AUDIO_PREFERENCE)}
    return sorted(found, key=lambda u: order.get(Path(unquote(u)).suffix.lower(), 99))


def _http_get(url: str, limit: int) -> bytes:
    request = urlrequest.Request(url, headers={"User-Agent": USER_AGENT})
    with urlrequest.urlopen(request, timeout=30) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ReelError(f"{url} is larger than {limit // (1024 * 1024)} MB")
    return data


def _decodes(path: Path) -> bool:
    """True when ffmpeg can read the first seconds of the audio file."""
    try:
        result = subprocess.run(
            [ffmpeg_path(), "-v", "error", "-t", "2", "-i", str(path), "-f", "null", "-"],
            capture_output=True, timeout=60, check=False,
        )
    except (OSError, subprocess.TimeoutExpired, ReelError):
        return False
    return result.returncode == 0


def fetch_cc0_music(
    max_tracks: int = MAX_FETCH, rng: random.Random | None = None
) -> list[Path]:
    """Download a few CC0 tracks into the music folder; returns the new files.

    Never raises on network trouble: a reel without music is better than none.
    """
    folder = music_dir()
    folder.mkdir(parents=True, exist_ok=True)
    candidates = list(CC0_TRACKS)
    (rng or random).shuffle(candidates)
    saved: list[Path] = []
    for track in candidates:
        if len(saved) >= max_tracks:
            break
        try:
            page = _http_get(track["page"], 2 * 1024 * 1024).decode("utf-8", "replace")
            if not _page_is_cc0(page):
                LOGGER.warning("Skipping %r: the page does not list CC0.", track["title"])
                continue
            links = _audio_links(page, track["page"])
            if not links:
                LOGGER.warning("Skipping %r: no audio file link found.", track["title"])
                continue
            url = links[0]
            suffix = Path(unquote(url)).suffix.lower()
            slug = re.sub(r"[^a-z0-9]+", "-", track["title"].lower()).strip("-")
            target = folder / f"cc0-{slug}{suffix}"
            if target.exists():
                continue
            part = target.with_suffix(target.suffix + ".part")
            part.write_bytes(_http_get(url, MAX_TRACK_BYTES))
            if not _decodes(part):
                part.unlink(missing_ok=True)
                LOGGER.warning("Skipping %r: the download is not playable audio.", track["title"])
                continue
            part.replace(target)
            with (folder / "SOURCES.md").open("a", encoding="utf-8") as sources:
                sources.write(
                    f"- {target.name}: \"{track['title']}\" by {track['author']}, "
                    f"CC0 1.0 (public domain), {track['page']}\n"
                )
            LOGGER.info("Downloaded CC0 track %s", target.name)
            saved.append(target)
        except (OSError, urlerror.URLError, ReelError, ValueError) as exc:
            LOGGER.warning("Could not download %r: %s", track["title"], exc)
    if not saved:
        LOGGER.warning(
            "No CC0 music could be downloaded; reels will have a silent track. "
            "Put CC0 / public-domain files in %s to add music.", folder,
        )
    return saved


def _autofetch_enabled() -> bool:
    return str(setting("REEL_MUSIC_AUTOFETCH", "1")).strip().lower() not in ("0", "false", "no", "off")


def pick_music(
    rng: random.Random | None = None, avoid: Iterable[str] = ()
) -> Path | None:
    """A random track, preferring ones not used in the last few posts.

    With an empty music folder it downloads CC0 tracks first (once per run).
    """
    global _FETCH_TRIED
    tracks = available_music()
    if not tracks and not _FETCH_TRIED and _autofetch_enabled():
        _FETCH_TRIED = True
        fetch_cc0_music(rng=rng)
        tracks = available_music()
    if not tracks:
        return None
    skip = {str(name) for name in avoid if name}
    fresh = [path for path in tracks if path.name not in skip]
    return (rng or random).choice(fresh or tracks)


def _volume() -> float:
    raw = setting("REEL_MUSIC_VOLUME", str(DEFAULT_MUSIC_VOLUME))
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return DEFAULT_MUSIC_VOLUME
    return max(0.0, min(2.0, value))


def _box_alpha() -> float:
    raw = setting("REEL_BOX_ALPHA", str(BOX_ALPHA))
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return BOX_ALPHA
    return max(0.15, min(0.95, value))


def clamp_seconds(seconds: float) -> float:
    try:
        value = float(seconds)
    except (TypeError, ValueError):
        value = DEFAULT_SECONDS
    return max(float(MIN_SECONDS), min(float(MAX_SECONDS), value))


def pick_motion(motion: str | None = None, rng: random.Random | None = None) -> str:
    """'left', 'right', 'up' or 'down' (the way the photo slides on screen)."""
    choice = (motion or setting("REEL_MOTION", "random") or "random").strip().lower()
    if choice in MOTIONS:
        return choice
    return (rng or random).choice(MOTIONS)


def pick_text_style(style: str | None = None, rng: random.Random | None = None) -> str:
    """One of TEXT_STYLES, or "none" for text that is simply there."""
    choice = (style or setting("REEL_TEXT_STYLE", "random") or "random").strip().lower()
    if choice in TEXT_STYLES or choice == "none":
        return choice
    return (rng or random).choice(TEXT_STYLES)


# --- scene composition (Pillow, runs once) --------------------------------------------------
def _flatten(image: Image.Image) -> Image.Image:
    """RGB copy; transparent areas become neutral grey, not black."""
    if image.mode in ("RGBA", "LA") or "transparency" in image.info:
        rgba = image.convert("RGBA")
        base = Image.new("RGBA", rgba.size, (128, 128, 128, 255))
        return Image.alpha_composite(base, rgba).convert("RGB")
    return image.convert("RGB")


def _text_layer(size, blocks, text_width: int, colors, origin=None) -> Image.Image:
    """The text on a transparent layer, with clean anti-aliased edges.

    Drawn twice (on black and on white); the difference gives the true
    coverage, so there is no dark fringe around letters on the glass.
    """
    black = Image.new("RGB", size, (0, 0, 0))
    white = Image.new("RGB", size, (255, 255, 255))
    where = (*(origin or (BOX_PAD_X, BOX_PAD_Y)), text_width)
    render._draw_blocks(ImageDraw.Draw(black), blocks, where, colors)
    render._draw_blocks(ImageDraw.Draw(white), blocks, where, colors)
    coverage = ImageChops.invert(
        ImageChops.subtract(white.getchannel("G"), black.getchannel("G"))
    )
    r, g, b = black.split()
    return Image.merge("RGBa", (r, g, b, coverage)).convert("RGBA")


def _text_elements(blocks, colors, text_width: int, origin: tuple[int, int], per_line: bool) -> list[dict]:
    """Each block (or each line) as its own transparent layer, with its position."""
    elements: list[dict] = []
    row = 0
    for group, block in enumerate(blocks):
        if per_line:
            parts = [
                (k, replace(block, lines=[line], gap=0))
                for k, line in enumerate(block.lines) if line
            ]
        else:
            parts = [(0, replace(block, gap=0))]
        for k, part in parts:
            height = part.line_height * len(part.lines)
            # Video keeps colour at half resolution, so a layer must sit on an
            # even pixel. Where the text starts on an odd one, the spare pixel
            # goes into the layer's own padding instead.
            want_x = origin[0] - EL_PAD
            want_y = origin[1] + row + k * block.line_height - EL_PAD
            at = (want_x - want_x % 2, want_y - want_y % 2)
            inset = (EL_PAD + want_x - at[0], EL_PAD + want_y - at[1])
            size = (text_width + 2 * EL_PAD + 2, height + 2 * EL_PAD + 2)
            image = _text_layer(size, [part], text_width, colors, inset)
            elements.append({"image": image, "at": at, "group": group})
        row += block.line_height * len(block.lines) + block.gap
    return elements


def _animation_plan(elements: list[dict], style: str, seconds: float) -> tuple[list[dict], float]:
    """When and how each text layer arrives; returns the plan and when it ends."""
    n = len(elements)
    duration = {"fade": 0.9, "lines": 0.55}.get(style, 0.75)
    budget = max(0.5, seconds * TEXT_SHARE - TEXT_START - duration)
    stagger = min(0.13 if style == "lines" else 0.4, budget / max(1, n - 1))
    moves = {"rise": (0, 30), "drop": (0, -30), "left": (-70, 0),
             "right": (70, 0), "fade": (0, 0), "lines": (0, 18)}
    plan = []
    for i, element in enumerate(elements):
        if style == "zigzag":
            dx, dy = (-70 if element["group"] % 2 == 0 else 70), 0
        else:
            dx, dy = moves.get(style, (0, 0))
        plan.append({"start": TEXT_START + i * stagger, "dur": duration, "dx": dx, "dy": dy})
    end = plan[-1]["start"] + duration if plan else 0.0
    return plan, end


def _glass_panel(photo: Image.Image, post: dict, palette: dict, style: str = "none") -> dict:
    """The translucent panel, sized to the text, plus its mask and position."""
    draw = ImageDraw.Draw(photo)
    text_width = BOX_MAX_WIDTH - 2 * BOX_PAD_X
    blocks, total = render._plan_text(
        draw, render.build_specs(post), text_width, BOX_MAX_TEXT_HEIGHT
    )
    content_h = max(1, total - blocks[-1].gap)
    widest = max(
        (draw.textlength(line, font=b.font) for b in blocks for line in b.lines),
        default=0,
    )
    box_w = int(min(BOX_MAX_WIDTH, max(BOX_MIN_WIDTH, widest + 2 * BOX_PAD_X)))
    box_h = int(content_h + 2 * BOX_PAD_Y)
    box_w -= box_w % 2          # even sizes keep ffmpeg's 4:2:0 maths exact
    box_h -= box_h % 2

    x0 = (REEL_SIZE[0] - box_w) // 2
    y0 = int(BOX_CENTER_Y - box_h / 2)
    y0 = max(SAFE_TOP, min(SAFE_BOTTOM - box_h, y0))
    x0 -= x0 % 2
    y0 -= y0 % 2

    # Light type on a dark tint, or dark ink on a light tint. The photo moves,
    # so judge a wider patch than the panel itself.
    look = (max(0, x0 - 120), max(0, y0 - 120),
            min(REEL_SIZE[0], x0 + box_w + 120), min(REEL_SIZE[1], y0 + box_h + 120))
    bright = render._region_luma(photo, look) >= 140
    tint = palette["card"] if bright else palette["band"]
    colors = render._colors(palette, on_card=bright)

    # Rounded-corner mask and hairline edge, drawn at 4x for smooth corners.
    big = Image.new("L", (box_w * 4, box_h * 4), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        (0, 0, box_w * 4 - 1, box_h * 4 - 1), radius=BOX_RADIUS * 4, fill=255
    )
    mask = big.resize((box_w, box_h), Image.Resampling.LANCZOS)
    edge = Image.new("RGBA", (box_w * 4, box_h * 4), (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle(
        (2, 2, box_w * 4 - 3, box_h * 4 - 3), radius=BOX_RADIUS * 4,
        outline=(255, 255, 255, 150 if bright else 70), width=5,
    )
    edge = edge.resize((box_w, box_h), Image.Resampling.LANCZOS)

    # Panel layer: shadow (with a hole where the glass is), tint, text, edge.
    m = SHADOW_MARGIN
    size = (box_w + 2 * m, box_h + 2 * m)
    shadow = Image.new("L", size, 0)
    ImageDraw.Draw(shadow).rounded_rectangle(
        (m, m + 12, m + box_w, m + box_h + 12), radius=BOX_RADIUS, fill=SHADOW_ALPHA
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    hole = Image.new("L", size, 0)
    hole.paste(mask, (m, m))
    shadow = ImageChops.multiply(shadow, ImageChops.invert(hole))
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    layer.putalpha(shadow)

    glass = Image.new("RGBA", (box_w, box_h), (*tint, 0))
    glass.putalpha(mask.point([int(i * _box_alpha()) for i in range(256)]))
    layer.alpha_composite(glass, (m, m))
    elements: list[dict] = []
    if style == "none":
        layer.alpha_composite(_text_layer((box_w, box_h), blocks, text_width, colors), (m, m))
    else:
        line_count = sum(1 for b in blocks for line in b.lines if line)
        per_line = style == "lines" and line_count <= MAX_LINE_ELEMENTS
        elements = _text_elements(
            blocks, colors, text_width, (x0 + BOX_PAD_X, y0 + BOX_PAD_Y), per_line
        )
    layer.alpha_composite(edge, (m, m))
    return {"panel": layer, "mask": mask, "at": (x0 - m, y0 - m),
            "box": (x0, y0, box_w, box_h), "elements": elements}


def _scene_from_post(
    post: dict, background: Image.Image, palette_name: str, style: str = "none"
) -> dict:
    """Full-bleed photo at the working size, and the glass panel over it."""
    palette = render.PALETTES.get(palette_name, render.PALETTES["saffron-dusk"])
    source = _flatten(background)
    photo = ImageOps.fit(source, REEL_SIZE, method=Image.Resampling.LANCZOS)
    LOGGER.info("Photo brightness %.0f / 255", ImageStat.Stat(photo.convert("L")).mean[0])
    scene = _glass_panel(photo, post, palette, style)
    scene["hires"] = ImageOps.fit(
        source, (REEL_SIZE[0] * HI_RES, REEL_SIZE[1] * HI_RES),
        method=Image.Resampling.LANCZOS,
    )
    return scene


def _scene_from_card(card: Image.Image) -> dict:
    """Fallback: the finished card on a lightly blurred copy of itself."""
    card = _flatten(card)
    scale = max(REEL_SIZE[0] / card.width, REEL_SIZE[1] / card.height)
    cover = card.resize(
        (round(card.width * scale), round(card.height * scale)), Image.Resampling.BILINEAR
    )
    left, top = (cover.width - REEL_SIZE[0]) // 2, (cover.height - REEL_SIZE[1]) // 2
    cover = cover.crop((left, top, left + REEL_SIZE[0], top + REEL_SIZE[1]))
    small = cover.resize((REEL_SIZE[0] // 6, REEL_SIZE[1] // 6), Image.Resampling.BILINEAR)
    back = small.filter(ImageFilter.GaussianBlur(9)).resize(REEL_SIZE, Image.Resampling.BICUBIC)
    # Only a touch of darkening: enough for the card to stand out, not enough to go black.
    back = Image.blend(back, Image.new("RGB", REEL_SIZE, (0, 0, 0)), 0.12).convert("RGBA")

    width = 944
    height = round(width * card.height / card.width)
    x, y = (REEL_SIZE[0] - width) // 2, 860 - height // 2
    big = Image.new("L", (width * 4, height * 4), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        (0, 0, width * 4 - 1, height * 4 - 1), radius=120, fill=255
    )
    mask = big.resize((width, height), Image.Resampling.LANCZOS)
    shadow = Image.new("L", REEL_SIZE, 0)
    ImageDraw.Draw(shadow).rounded_rectangle(
        (x, y + 24, x + width, y + height + 24), radius=30, fill=120
    )
    shade = Image.new("RGBA", REEL_SIZE, (0, 0, 0, 0))
    shade.putalpha(shadow.filter(ImageFilter.GaussianBlur(22)))
    back.alpha_composite(shade)
    back.paste(card.resize((width, height), Image.Resampling.LANCZOS), (x, y), mask)
    still = back.convert("RGB")
    LOGGER.info("Backdrop brightness %.0f / 255", ImageStat.Stat(still.convert("L")).mean[0])
    hires = still.resize((REEL_SIZE[0] * HI_RES, REEL_SIZE[1] * HI_RES), Image.Resampling.LANCZOS)
    return {"hires": hires, "panel": None, "mask": None, "at": (0, 0), "box": None, "elements": []}


# --- ffmpeg graph ------------------------------------------------------------------------------
def _graph(
    seconds: float, frames: int, motion: str, scene: dict,
    panel_in: int | None, mask_in: int | None, audio_in: int | None,
    text_in: list[int], plan: list[dict],
) -> str:
    w, h = REEL_SIZE
    p = f"(on/{max(1, frames - 1)})"
    q = f"({p}*{p}*(3-2*{p}))"                      # smoothstep ease-in-out
    zoom = f"{ZOOM_START}+{ZOOM_END - ZOOM_START}*{q}"
    # The camera starts near one edge of the spare room and ends near the other.
    # The photo slides left when the camera moves right, and so on.
    sx = {"left": 1, "right": -1}.get(motion, 0) * SLIDE_X
    sy = {"up": 1, "down": -1}.get(motion, 0) * SLIDE_Y
    x_expr = f"(iw-iw/zoom)/2*(1+({sx})*(2*{q}-1))"
    y_expr = f"(ih-ih/zoom)/2*(1+({sy})*(2*{q}-1))"
    fade_out = max(0.0, seconds - FADE_OUT)
    # RGB -> BT.709 limited-range YUV, once, on the single still.
    to_yuv = "scale=in_range=full:out_range=tv:out_color_matrix=bt709"

    graph = (
        f"[0:v]{to_yuv},format=yuv420p,"
        f"zoompan=z='{zoom}':x='{x_expr}':y='{y_expr}'"
        f":d={frames}:s={w}x{h}:fps={FPS}[bg];"
    )
    if scene["panel"] is not None:
        bx, by, bw, bh = scene["box"]
        sw, sh = max(2, (bw // 8) * 2), max(2, (bh // 8) * 2)   # 1/4 size, even
        px, py = scene["at"]
        graph += (
            # Live frosted glass: the part of the moving photo under the panel,
            # blurred at low resolution (fast), cut to the rounded shape.
            f"[bg]split=2[bga][bgb];"
            f"[bgb]crop={bw}:{bh}:{bx}:{by},scale={sw}:{sh}:flags=bilinear,"
            f"gblur=sigma={FROST_SIGMA}:steps=2,scale={bw}:{bh}:flags=bilinear[frost];"
            f"[{mask_in}:v]format=gray[mask];"
            f"[frost][mask]alphamerge[glass];"
            f"[bga][glass]overlay=x={bx}:y={by}:format=yuv420[lit];"
            f"[{panel_in}:v]{to_yuv},format=yuva420p[panel];"
            f"[lit][panel]overlay=x={px}:y={py}:format=yuv420[c0];"
        )
        # Text pieces: each is held as one looped frame, faded in at its start
        # time, and moved from an offset to its place with an ease-out curve.
        for k, (inp, step, element) in enumerate(zip(text_in, plan, scene["elements"]), start=1):
            s, d = f"{step['start']:.2f}", f"{step['dur']:.2f}"
            ease = f"pow(1-min(max((t-{s})/{d},0),1),3)"
            ex, ey = element["at"]
            graph += (
                f"[{inp}:v]{to_yuv},format=yuva420p,loop=loop=-1:size=1:start=0,"
                f"setpts=N/{FPS}/TB,fade=t=in:st={s}:d={d}:alpha=1[t{k}];"
                f"[c{k - 1}][t{k}]overlay=x='{ex}+({step['dx']})*{ease}'"
                f":y='{ey}+({step['dy']})*{ease}':format=yuv420[c{k}];"
            )
        graph += f"[c{len(text_in)}]null[comp];"
    else:
        graph += "[bg]null[comp];"
    graph += f"[comp]fade=t=out:st={fade_out:.2f}:d={FADE_OUT},format=yuv420p[v]"
    if audio_in is not None:
        # Loop as needed, even out the loudness, fade in, and out with the
        # picture; stereo 48 kHz.
        graph += (
            f";[{audio_in}:a]atrim=duration={seconds:.2f},asetpts=N/SR/TB,"
            "loudnorm=I=-18:TP=-2:LRA=9,"
            "afade=t=in:st=0:d=1.0:curve=qsin,"
            f"afade=t=out:st={fade_out:.2f}:d={FADE_OUT}:curve=qsin,"
            f"volume={_volume():.2f},aresample=48000,"
            "aformat=sample_fmts=fltp:channel_layouts=stereo[a]"
        )
    return graph


def build_reel(
    image_path: Path | None,
    output_path: Path,
    seconds: float = DEFAULT_SECONDS,
    music: Path | None = None,
    *,
    post: dict | None = None,
    background: Image.Image | None = None,
    palette: str = "saffron-dusk",
    motion: str | None = None,
    text_style: str | None = None,
    thumbnail: bool = True,
) -> Path:
    """Render a 9:16 MP4 at ``output_path``.

    Pass ``post`` (the dict given to ``render_card``), ``background`` (the photo)
    and ``palette`` for the full-bleed photo with a glass text panel. Otherwise
    the finished card at ``image_path`` is used. ``motion`` is "left", "right",
    "up", "down" or "random" (default; ``REEL_MOTION`` in .env also works).
    ``text_style`` is "rise", "drop", "left", "right", "zigzag", "fade", "lines",
    "none" (static text) or "random" (default; ``REEL_TEXT_STYLE``). With
    ``thumbnail`` a cover image of the finished frame is written next to the
    video as ``<name>.thumb.jpg``.
    """
    output_path = Path(output_path)
    use_post = post is not None and background is not None
    if not use_post:
        if image_path is None or not Path(image_path).is_file():
            raise ReelError(f"Image not found: {image_path}")
    if music is not None and not Path(music).is_file():
        raise ReelError(f"Music file not found: {music}")
    seconds = clamp_seconds(seconds)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    style = pick_text_style(text_style)
    try:
        if use_post:
            scene = _scene_from_post(post, background, palette, style)
            source_name = "post"
        else:
            with Image.open(image_path) as card:
                scene = _scene_from_card(card)
            source_name = Path(image_path).name
    except OSError as exc:
        raise ReelError(f"Could not read the image: {exc}") from exc

    frames = max(1, int(round(seconds * FPS)))
    direction = pick_motion(motion)
    plan, text_end = _animation_plan(scene["elements"], style, seconds)
    LOGGER.info(
        "Rendering a %.0f-second reel from %s, zoom + slide %s, text %s, %s",
        seconds, source_name, direction, style if scene["elements"] else "static",
        f"music {Path(music).name}" if music is not None
        else f"silent track (no music in {music_dir()})",
    )

    with tempfile.TemporaryDirectory(prefix="reel-") as tmp:
        photo_file = Path(tmp) / "photo.png"
        scene["hires"].save(photo_file, format="PNG", compress_level=1)
        scene["hires"] = None
        command = [
            ffmpeg_path(), "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(photo_file),
        ]
        next_input = 1
        panel_in = mask_in = None
        if scene["panel"] is not None:
            panel_file, mask_file = Path(tmp) / "panel.png", Path(tmp) / "mask.png"
            scene["panel"].save(panel_file, format="PNG", compress_level=1)
            scene["mask"].save(mask_file, format="PNG", compress_level=1)
            command += ["-i", str(panel_file), "-i", str(mask_file)]
            panel_in, mask_in, next_input = 1, 2, 3
        text_in: list[int] = []
        for k, element in enumerate(scene["elements"]):
            element_file = Path(tmp) / f"text{k}.png"
            element["image"].save(element_file, format="PNG", compress_level=1)
            command += ["-i", str(element_file)]
            text_in.append(next_input)
            next_input += 1
        if music is not None:
            command += ["-stream_loop", "-1", "-i", str(music)]
        else:
            command += [
                "-f", "lavfi", "-t", f"{seconds:.2f}",
                "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
            ]
        audio_in = next_input
        command += [
            "-filter_complex",
            _graph(seconds, frames, direction, scene, panel_in, mask_in,
                   audio_in if music is not None else None, text_in, plan),
            "-map", "[v]", "-map", "[a]" if music is not None else f"{audio_in}:a",
            "-c:v", "libx264", "-profile:v", "high", "-level", "4.2",
            "-preset", setting("REEL_X264_PRESET", "veryfast") or "veryfast",
            "-crf", "21", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
            "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
            "-color_range", "tv",
            "-r", str(FPS), "-g", "60", "-keyint_min", "60", "-sc_threshold", "0",
            "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", "-t", f"{seconds:.2f}",
            str(output_path),
        ]
        try:
            result = subprocess.run(
                command, capture_output=True, text=True, timeout=900, check=False
            )
        except subprocess.TimeoutExpired as exc:
            raise ReelError(f"ffmpeg timed out rendering {output_path.name}") from exc

    if result.returncode != 0 or not output_path.is_file():
        detail = (result.stderr or result.stdout or "").strip()[-1500:]
        raise ReelError(f"ffmpeg failed (exit {result.returncode}): {detail}")

    size = output_path.stat().st_size
    if size == 0:
        raise ReelError(f"ffmpeg produced an empty file: {output_path}")
    LOGGER.info("Reel written to %s (%.1f MB)", output_path, size / (1024 * 1024))
    if thumbnail:
        _save_thumbnail(output_path, min(max(text_end + 0.3, 0.8), seconds - FADE_OUT - 0.2))
    return output_path


def _save_thumbnail(video: Path, at: float) -> Path | None:
    """Cover image: a frame after the text has finished arriving."""
    target = video.with_suffix(".thumb.jpg")
    try:
        result = subprocess.run(
            [ffmpeg_path(), "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{at:.2f}",
             "-i", str(video), "-frames:v", "1", "-q:v", "2", str(target)],
            capture_output=True, timeout=120, check=False,
        )
    except (OSError, subprocess.TimeoutExpired, ReelError) as exc:
        LOGGER.warning("Could not save the cover image: %s", exc)
        return None
    if result.returncode != 0 or not target.is_file():
        LOGGER.warning("Could not save the cover image.")
        return None
    LOGGER.info("Cover image written to %s", target)
    return target


if __name__ == "__main__":  # python -m <your_package>.reel fetch-music
    import sys

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if sys.argv[1:] == ["fetch-music"]:
        got = fetch_cc0_music()
        print(f"Downloaded {len(got)} track(s) into {music_dir()}")
    else:
        print("usage: python -m <package>.reel fetch-music")
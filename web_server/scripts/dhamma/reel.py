"""Turn a post into a vertical MP4 that Facebook accepts as a Reel.

The reel is the post's photo, full-bleed in 9:16, with a small frosted-glass
panel that hugs the text. The panel is translucent and blurs whatever is behind
it live, so the photo shows through while it moves. The photo zooms in and
slides one way (left, right, up or down; random by default). The panel stays
put, so the text is always steady and easy to read.

Everything heavy is done once, in Pillow, before ffmpeg starts: the photo is
fitted and the panel is tinted and set with text. ffmpeg then only moves the
photo, blurs the glass, lays the panel on top and encodes. That keeps the
render fast and the memory low enough for a small (1 GB) server.

The first frame is already the finished picture (no fade from black), so the
thumbnail shows the photo and the text. The video and the music fade out
together at the end.

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


# --- scene composition (Pillow, runs once) --------------------------------------------------
def _flatten(image: Image.Image) -> Image.Image:
    """RGB copy; transparent areas become neutral grey, not black."""
    if image.mode in ("RGBA", "LA") or "transparency" in image.info:
        rgba = image.convert("RGBA")
        base = Image.new("RGBA", rgba.size, (128, 128, 128, 255))
        return Image.alpha_composite(base, rgba).convert("RGB")
    return image.convert("RGB")


def _text_layer(size, blocks, text_width: int, colors) -> Image.Image:
    """The text on a transparent layer, with clean anti-aliased edges.

    Drawn twice (on black and on white); the difference gives the true
    coverage, so there is no dark fringe around letters on the glass.
    """
    black = Image.new("RGB", size, (0, 0, 0))
    white = Image.new("RGB", size, (255, 255, 255))
    where = (BOX_PAD_X, BOX_PAD_Y, text_width)
    render._draw_blocks(ImageDraw.Draw(black), blocks, where, colors)
    render._draw_blocks(ImageDraw.Draw(white), blocks, where, colors)
    coverage = ImageChops.invert(
        ImageChops.subtract(white.getchannel("G"), black.getchannel("G"))
    )
    r, g, b = black.split()
    return Image.merge("RGBa", (r, g, b, coverage)).convert("RGBA")


def _glass_panel(photo: Image.Image, post: dict, palette: dict) -> dict:
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
    layer.alpha_composite(_text_layer((box_w, box_h), blocks, text_width, colors), (m, m))
    layer.alpha_composite(edge, (m, m))
    return {"panel": layer, "mask": mask, "at": (x0 - m, y0 - m), "box": (x0, y0, box_w, box_h)}


def _scene_from_post(post: dict, background: Image.Image, palette_name: str) -> dict:
    """Full-bleed photo at the working size, and the glass panel over it."""
    palette = render.PALETTES.get(palette_name, render.PALETTES["saffron-dusk"])
    source = _flatten(background)
    photo = ImageOps.fit(source, REEL_SIZE, method=Image.Resampling.LANCZOS)
    LOGGER.info("Photo brightness %.0f / 255", ImageStat.Stat(photo.convert("L")).mean[0])
    scene = _glass_panel(photo, post, palette)
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
    return {"hires": hires, "panel": None, "mask": None, "at": (0, 0), "box": None}


# --- ffmpeg graph ------------------------------------------------------------------------------
def _graph(
    seconds: float, frames: int, motion: str, scene: dict,
    panel_in: int | None, mask_in: int | None, audio_in: int | None,
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
            f"[lit][panel]overlay=x={px}:y={py}:format=yuv420[comp];"
        )
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
) -> Path:
    """Render a 9:16 MP4 at ``output_path``.

    Pass ``post`` (the dict given to ``render_card``), ``background`` (the photo)
    and ``palette`` for the full-bleed photo with a glass text panel. Otherwise
    the finished card at ``image_path`` is used. ``motion`` is "left", "right",
    "up", "down" or "random" (default; ``REEL_MOTION`` in .env also works).
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

    try:
        if use_post:
            scene = _scene_from_post(post, background, palette)
            source_name = "post"
        else:
            with Image.open(image_path) as card:
                scene = _scene_from_card(card)
            source_name = Path(image_path).name
    except OSError as exc:
        raise ReelError(f"Could not read the image: {exc}") from exc

    frames = max(1, int(round(seconds * FPS)))
    direction = pick_motion(motion)
    LOGGER.info(
        "Rendering a %.0f-second reel from %s, zoom + slide %s, %s",
        seconds, source_name, direction,
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
                   audio_in if music is not None else None),
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
    return output_path


if __name__ == "__main__":  # python -m <your_package>.reel fetch-music
    import sys

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    if sys.argv[1:] == ["fetch-music"]:
        got = fetch_cc0_music()
        print(f"Downloaded {len(got)} track(s) into {music_dir()}")
    else:
        print("usage: python -m <package>.reel fetch-music")
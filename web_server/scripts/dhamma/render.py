"""Card rendering: four layouts, six palettes, one 1080x1350 JPEG.

The layout and palette are chosen by the planner, so consecutive posts do not
look like the same template with new words.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

from .config import setting

CARD_SIZE = (1080, 1350)
MARGIN = 92

LAYOUTS = ("lower-panel", "centered-quote", "paper-card", "split-band")

PALETTES: dict[str, dict[str, tuple[int, int, int]]] = {
    "saffron-dusk": {
        "band": (40, 30, 22),
        "text": (255, 249, 240),
        "muted": (226, 203, 173),
        "accent": (224, 171, 99),
        "card": (249, 242, 229),
        "ink": (51, 39, 29),
    },
    "monsoon-slate": {
        "band": (25, 32, 39),
        "text": (246, 248, 248),
        "muted": (198, 210, 214),
        "accent": (146, 176, 190),
        "card": (241, 244, 244),
        "ink": (31, 41, 46),
    },
    "forest-calm": {
        "band": (25, 34, 26),
        "text": (250, 250, 242),
        "muted": (203, 213, 190),
        "accent": (171, 187, 135),
        "card": (245, 246, 235),
        "ink": (37, 44, 31),
    },
    "clay-warm": {
        "band": (45, 33, 28),
        "text": (255, 246, 240),
        "muted": (228, 203, 190),
        "accent": (206, 143, 112),
        "card": (250, 240, 233),
        "ink": (55, 38, 31),
    },
    "evening-plum": {
        "band": (32, 26, 39),
        "text": (250, 246, 252),
        "muted": (211, 200, 221),
        "accent": (184, 160, 201),
        "card": (245, 240, 248),
        "ink": (44, 37, 51),
    },
    "river-stone": {
        "band": (29, 34, 36),
        "text": (249, 250, 248),
        "muted": (204, 212, 208),
        "accent": (174, 185, 175),
        "card": (243, 245, 241),
        "ink": (39, 45, 44),
    },
}

# kind -> (base size, font style, line height ratio)
FONT_BASE = {
    "kicker": (24, "sans", 1.0),
    "title": (56, "serif_bold", 1.08),
    "body": (39, "serif", 1.2),
    "pali": (35, "serif_bold", 1.24),
    "quote": (31, "serif", 1.24),
    "ref": (25, "sans", 1.0),
}

GAP = {"kicker": 28, "title": 30, "body": 24, "pali": 22, "quote": 16, "ref": 12}

_FONTS = {
    "serif": [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Palatino.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf",
    ],
    "serif_bold": [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf",
    ],
    "sans": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ],
}


@dataclass(frozen=True)
class TextSpec:
    kind: str
    text: str


@dataclass(frozen=True)
class TextBlock:
    kind: str
    lines: list[str]
    font: ImageFont.FreeTypeFont
    line_height: int
    gap: int


def _candidates(style: str) -> list[str]:
    configured = setting("FONT_PATH")
    bold = setting("FONT_PATH_BOLD")
    candidates: list[str] = []
    if style == "serif_bold":
        if bold:
            candidates.append(bold)
        candidates.extend(_FONTS["serif_bold"])
        if configured:
            candidates.append(configured)
    else:
        if configured and style != "sans":
            candidates.append(configured)
        candidates.extend(_FONTS[style])
    return candidates


@lru_cache(maxsize=64)
def load_font(size: int, style: str = "serif") -> ImageFont.FreeTypeFont:
    for candidate in _candidates(style):
        try:
            if Path(candidate).is_file():
                return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow without a size argument
        return ImageFont.load_default()


def _mix(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in str(text).split("\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for word in paragraph.split():
            trial = f"{current} {word}".strip()
            if not current or draw.textlength(trial, font=font) <= max_width:
                current = trial
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines or [""]


def _plan_text(
    draw: ImageDraw.ImageDraw,
    specs: list[TextSpec],
    width: int,
    height: int,
    min_scale: float = 0.5,
) -> tuple[list[TextBlock], int]:
    """Shrink type until the whole block fits the given box."""
    blocks: list[TextBlock] = []
    total = 0
    for step in range(0, 60):
        scale = max(min_scale, 1.0 - 0.03 * step)
        blocks = []
        total = 0
        for spec in specs:
            base, style, ratio = FONT_BASE[spec.kind]
            size = max(16, int(round(base * scale)))
            font = load_font(size, style)
            lines = _wrap(draw, spec.text, font, width)
            line_height = int(round(size * ratio))
            gap = int(round(GAP[spec.kind] * scale))
            blocks.append(
                TextBlock(spec.kind, lines, font, line_height, gap)
            )
            total += line_height * len(lines) + gap
        if total <= height or scale <= min_scale:
            break
    return blocks, total


def _colors(palette: dict, on_card: bool = False) -> dict[str, tuple[int, int, int]]:
    if on_card:
        return {
            "kicker": _mix(palette["accent"], palette["ink"], 0.45),
            "title": palette["ink"],
            "body": palette["ink"],
            "pali": _mix(palette["ink"], palette["accent"], 0.35),
            "quote": palette["ink"],
            "ref": _mix(palette["ink"], palette["card"], 0.4),
        }
    return {
        "kicker": palette["accent"],
        "title": palette["text"],
        "body": palette["text"],
        "pali": palette["accent"],
        "quote": palette["text"],
        "ref": palette["muted"],
    }


def _draw_blocks(
    draw: ImageDraw.ImageDraw,
    blocks: list[TextBlock],
    box: tuple[int, int, int],
    colors: dict[str, tuple[int, int, int]],
    align: str = "left",
) -> int:
    x, y, width = box
    for block in blocks:
        for line in block.lines:
            if line:
                if align == "center":
                    line_width = draw.textlength(line, font=block.font)
                    draw.text(
                        (x + (width - line_width) / 2, y), line,
                        font=block.font, fill=colors[block.kind],
                    )
                else:
                    draw.text((x, y), line, font=block.font, fill=colors[block.kind])
            y += block.line_height
        y += block.gap
    return y


def _solid(size: tuple[int, int], color: tuple[int, int, int], alpha: int) -> Image.Image:
    layer = Image.new("RGBA", size, (*color, alpha))
    return layer


def _luma(color: tuple[int, int, int]) -> float:
    return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]


def _region_luma(canvas: Image.Image, box: tuple[int, int, int, int], percentile: float = 0.75) -> int:
    """Brightness of a region, read at the bright end so glare counts."""
    x0, y0, x1, y1 = box
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(canvas.width, x1), min(canvas.height, y1)
    if x1 <= x0 or y1 <= y0:
        return 0
    crop = canvas.convert("L").crop((x0, y0, x1, y1))
    hist = crop.resize((48, 48), Image.Resampling.BILINEAR).histogram()
    wanted = sum(hist) * percentile
    seen = 0
    for value, count in enumerate(hist):
        seen += count
        if seen >= wanted:
            return value
    return 255


def _soft_scrim(
    canvas: Image.Image,
    box: tuple[int, int, int, int],
    color: tuple[int, int, int],
    alpha: int,
    blur: int = 46,
) -> None:
    """A blurred panel, so the text area is toned without a hard rectangle."""
    if alpha <= 0:
        return
    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(box, radius=34, fill=(*color, min(255, alpha)))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def _text_colors(
    canvas: Image.Image,
    box: tuple[int, int, int, int],
    palette: dict,
    pad: int = 40,
) -> dict[str, tuple[int, int, int]]:
    """Pick type that reads on this photo, washing only the text area.

    Bright photos get dark ink on a light wash; darker photos keep the light
    palette and are shaded just enough. The photo itself stays visible.
    """
    probe = (box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad)
    brightness = _region_luma(canvas, probe)
    if brightness >= 150:
        _soft_scrim(canvas, probe, palette["card"], int(min(170, 46 + (brightness - 150) * 0.9)))
        return _colors(palette, on_card=True)
    floor = _luma(palette["band"])
    if brightness > 96:
        alpha = int(min(220, (brightness - 96) / max(1.0, brightness - floor) * 268))
        _soft_scrim(canvas, probe, palette["band"], alpha)
    return _colors(palette)


def _vertical_fade(
    size: tuple[int, int],
    color: tuple[int, int, int],
    start_y: int,
    top_alpha: int,
    bottom_alpha: int,
) -> Image.Image:
    width, height = size
    mask = Image.new("L", (1, height), 0)
    span = max(1, height - start_y)
    for y in range(start_y, height):
        value = int(top_alpha + (bottom_alpha - top_alpha) * (y - start_y) / span)
        mask.putpixel((0, y), max(0, min(255, value)))
    layer = Image.new("RGBA", size, (*color, 255))
    layer.putalpha(mask.resize(size))
    return layer


def _prepare_background(background: Image.Image, layout: str, palette: dict) -> Image.Image:
    canvas = ImageOps.fit(
        background.convert("RGB"), CARD_SIZE, method=Image.Resampling.LANCZOS
    ).convert("RGBA")
    if layout == "lower-panel":
        canvas = Image.alpha_composite(
            canvas, _vertical_fade(CARD_SIZE, palette["band"], 360, 92, 238)
        )
    elif layout == "centered-quote":
        canvas = Image.alpha_composite(canvas, _solid(CARD_SIZE, palette["band"], 116))
        canvas = Image.alpha_composite(
            canvas, _vertical_fade(CARD_SIZE, palette["band"], 640, 0, 150)
        )
    elif layout == "paper-card":
        canvas = Image.alpha_composite(canvas, _solid(CARD_SIZE, palette["band"], 45))
    else:  # split-band
        canvas = Image.alpha_composite(canvas, _solid(CARD_SIZE, palette["band"], 28))
    return canvas


def _draw_lower_panel(canvas: Image.Image, specs: list[TextSpec], palette: dict) -> None:
    draw = ImageDraw.Draw(canvas)
    width = CARD_SIZE[0] - 2 * MARGIN
    blocks, total = _plan_text(draw, specs, width, 780)
    top = 470 + max(0, (790 - total) // 2)
    colors = _text_colors(canvas, (MARGIN, top, CARD_SIZE[0] - MARGIN, top + total), palette)
    _draw_blocks(ImageDraw.Draw(canvas), blocks, (MARGIN, top, width), colors)


def _draw_centered_quote(canvas: Image.Image, specs: list[TextSpec], palette: dict) -> None:
    draw = ImageDraw.Draw(canvas)
    width = CARD_SIZE[0] - 2 * 165
    blocks, total = _plan_text(draw, specs, width, 780)
    top = 350 + max(0, (780 - total) // 2)
    colors = _text_colors(canvas, (165, 175, CARD_SIZE[0] - 165, top + total), palette)

    draw = ImageDraw.Draw(canvas)
    glyph = load_font(150, "serif_bold")
    glyph_width = draw.textlength("\u201c", font=glyph)
    draw.text(((CARD_SIZE[0] - glyph_width) / 2, 175), "\u201c", font=glyph, fill=colors["kicker"])
    _draw_blocks(draw, blocks, (165, top, width), colors, align="center")


def _draw_paper_card(canvas: Image.Image, specs: list[TextSpec], palette: dict) -> None:
    """Paper sheet sized to its text at the foot of the card, photo above."""
    padding = 64
    left, right = 56, CARD_SIZE[0] - 56
    width = right - left - 2 * padding
    draw = ImageDraw.Draw(canvas)
    blocks, total = _plan_text(draw, specs, width, 800)
    height = min(CARD_SIZE[1] - 200, max(520, total + 2 * padding))
    card = (left, CARD_SIZE[1] - 56 - height, right, CARD_SIZE[1] - 56)

    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle(
        card, radius=28, fill=(*palette["card"], 251),
        outline=(*palette["accent"], 200), width=2,
    )
    canvas.alpha_composite(layer)

    draw = ImageDraw.Draw(canvas)
    top = card[1] + padding + max(0, (height - 2 * padding - total) // 2)
    _draw_blocks(
        draw, blocks, (left + padding, top, width), _colors(palette, on_card=True)
    )


def _draw_split_band(canvas: Image.Image, specs: list[TextSpec], palette: dict) -> None:
    band_top = 660
    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)
    layer_draw.rectangle((0, band_top, CARD_SIZE[0], CARD_SIZE[1]), fill=(*palette["band"], 246))
    layer_draw.rectangle((0, band_top, CARD_SIZE[0], band_top + 5), fill=(*palette["accent"], 235))
    canvas.alpha_composite(layer)

    draw = ImageDraw.Draw(canvas)
    width = CARD_SIZE[0] - 2 * 96
    blocks, total = _plan_text(draw, specs, width, 540)
    top = 730 + max(0, (540 - total) // 2)
    _draw_blocks(draw, blocks, (96, top, width), _colors(palette))


def build_specs(post: dict) -> list[TextSpec]:
    specs: list[TextSpec] = []
    if post.get("label"):
        specs.append(TextSpec("kicker", post["label"]))
    specs.append(TextSpec("title", post["title"]))
    specs.append(TextSpec("body", post["card_text"]))
    if post.get("pali"):
        specs.append(TextSpec("pali", post["pali"]))
    if post.get("quote"):
        specs.append(TextSpec("quote", post["quote"]))
    if post.get("ref"):
        specs.append(TextSpec("ref", post["ref"]))
    return specs


def render_card(
    background: Image.Image,
    post: dict,
    output_path: Path,
    layout: str = "lower-panel",
    palette_name: str = "saffron-dusk",
) -> Path:
    palette = PALETTES.get(palette_name, PALETTES["saffron-dusk"])
    canvas = _prepare_background(background, layout, palette)
    specs = build_specs(post)
    if layout == "centered-quote":
        _draw_centered_quote(canvas, specs, palette)
    elif layout == "paper-card":
        _draw_paper_card(canvas, specs, palette)
    elif layout == "split-band":
        _draw_split_band(canvas, specs, palette)
    else:
        _draw_lower_panel(canvas, specs, palette)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(
        output_path, format="JPEG", quality=92, optimize=True, progressive=True
    )
    return output_path


def painted_background(palette_name: str, seed: int = 0) -> Image.Image:
    """Soft abstract background used for --sample and as an image fallback."""
    palette = PALETTES.get(palette_name, PALETTES["saffron-dusk"])
    rng = random.Random(seed)
    base = _mix(palette["band"], (255, 255, 255), 0.22)
    image = Image.new("RGB", CARD_SIZE, base)
    layer = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(6):
        cx = rng.randint(0, CARD_SIZE[0])
        cy = rng.randint(0, CARD_SIZE[1])
        radius = rng.randint(220, 540)
        tint = _mix(palette["accent"], (255, 255, 255), rng.uniform(0.0, 0.55))
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            fill=(*tint, rng.randint(26, 68)),
        )
    layer = layer.filter(ImageFilter.GaussianBlur(130))
    return Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

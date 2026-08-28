"""
cover.py — Generate cover images for exported books.

Creates a clean, minimal cover with:
- Warm earth-tone background (#faf7f2)
- Dharma wheel SVG rendered as a centered emblem
- Book title in the appropriate script font
- Publisher / source line
- Category-specific color themes
"""
import math
import os
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont


# ── Design tokens (matches the website's CSS variables) ─────────────────
BG_COLOR      = (250, 247, 242)   # #faf7f2
ACCENT_COLOR  = (139, 94, 60)     # #8b5e3c
TEXT_COLOR     = (45, 36, 32)      # #2d2420
MUTED_COLOR   = (138, 122, 110)   # #8a7a6e
WHITE         = (255, 255, 255)
WHEEL_COLOR   = (212, 169, 122)   # #d4a97a  (muted gold)
WHEEL_RADIUS  = 140
WHEEL_SPOKES  = 8
HUB_RADIUS    = 16

_FONTS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'fonts'
))

# Script code → font filename (matches website common.css @font-face)
_SCRIPT_FONT_FILES = {
    'ro': 'NotoSerif-Regular.ttf',
    'si': 'NotoSerifSinhala-Regular.ttf',
    'hi': 'NotoSerifDevanagari-Regular.ttf',
    'th': 'thai/THSarabunPali.ttf',
    'lo': 'lao/LaoPaliAlpha-Regular.woff',
    'my': 'myanmar/mm3-multi-os(16-08-2011).ttf',
    'km': 'NotoSerifKhmer-Regular.ttf',
    'be': 'NotoSerifBengali-Regular.ttf',
    'gm': 'NotoSansGurmukhi-Regular.ttf',
    'tt': 'lanna/Hariphunchai.otf',
    'gj': 'NotoSerifGujarati-Regular.ttf',
    'te': 'NotoSerifTelugu-Regular.ttf',
    'ka': 'NotoSerifKannada-Regular.ttf',
    'mm': 'NotoSerifMalayalam-Regular.ttf',
}


def generate_cover(
    title: str,
    subtitle: str = '',
    author: str = 'Chaṭṭha Saṅgāyana Tipiṭaka',
    output_path: str = '',
    width: int = 1600,
    height: int = 2400,
    lang_name: str = '',
    category: str = 'Mūla',
    script: str = 'ro',
) -> bytes:
    """
    Generate a book cover image.

    Returns raw PNG bytes. If output_path is given, also writes to disk.
    """
    img = Image.new('RGB', (width, height), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # ── Load fonts ────────────────────────────────────────────────────
    title_font, sans_font = _load_fonts(width, script)
    theme = _theme(category)

    # ── Decorative top bar ────────────────────────────────────────────
    bar_h = 6
    draw.rectangle([0, 0, width, bar_h], fill=theme['accent'])

    # ── Dharma wheel ──────────────────────────────────────────────────
    cx, cy = width // 2, height // 3
    _draw_dharma_wheel(draw, cx, cy, WHEEL_RADIUS, theme['wheel'])

    # ── Title ─────────────────────────────────────────────────────────
    title_y = cy + WHEEL_RADIUS + 80
    title_lines = _wrap_text(title, title_font, width - 160)
    for i, line in enumerate(title_lines):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        draw.text((x, title_y + i * 100), line, fill=TEXT_COLOR, font=title_font)

    # ── Subtitle ──────────────────────────────────────────────────────
    if subtitle:
        sub_y = title_y + len(title_lines) * 100 + 35
        sub_font_size = max(28, width // 50)
        sub_font = _get_font(sans_font, sub_font_size)
        bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        draw.text((x, sub_y), subtitle, fill=theme['muted'], font=sub_font)

    # ── Language badge ────────────────────────────────────────────────
    if lang_name:
        badge_y = title_y + len(title_lines) * 100 + 110
        if subtitle:
            badge_y += 50
        badge_text = lang_name
        badge_font = _get_font(sans_font, 26)
        bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
        bw = bbox[2] - bbox[0] + 40
        bh = 44
        bx = (width - bw) // 2
        draw.rounded_rectangle(
            [bx, badge_y, bx + bw, badge_y + bh],
            radius=bh // 2,
            fill=theme['accent'],
        )
        draw.text((bx + 20, badge_y + 8), badge_text, fill=WHITE, font=badge_font)

    # ── Bottom section: source ────────────────────────────────────────
    bottom_y = height - 200
    # Decorative line
    line_w = width // 3
    line_x = (width - line_w) // 2
    draw.line([(line_x, bottom_y), (line_x + line_w, bottom_y)],
              fill=WHEEL_COLOR, width=2)

    # Publisher
    pub_font = _get_font(sans_font, 28)
    bbox = draw.textbbox((0, 0), author, font=pub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, bottom_y + 30), author,
              fill=theme['muted'], font=pub_font)

    # Website
    site = 'epitaka.org'
    site_font = _get_font(sans_font, 24)
    bbox = draw.textbbox((0, 0), site, font=site_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, bottom_y + 75), site,
              fill=theme['accent'], font=site_font)

    # ── Bottom bar ────────────────────────────────────────────────────
    draw.rectangle([0, height - bar_h, width, height], fill=theme['accent'])

    # ── Save ──────────────────────────────────────────────────────────
    buf = BytesIO()
    img.save(buf, format='PNG', optimize=True)
    png_bytes = buf.getvalue()

    if output_path:
        os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(png_bytes)

    return png_bytes


def _theme(category):
    themes = {
        'Mūla': {'accent': (139, 94, 60), 'wheel': (212, 169, 122), 'muted': (138, 122, 110)},
        'Aṭṭhakathā': {'accent': (43, 93, 108), 'wheel': (111, 174, 181), 'muted': (91, 119, 123)},
        'Ṭīkā': {'accent': (104, 78, 137), 'wheel': (169, 140, 196), 'muted': (119, 106, 130)},
        'Aññā': {'accent': (174, 91, 45), 'wheel': (224, 157, 91), 'muted': (137, 113, 98)},
    }
    return themes.get(category, themes['Mūla'])


def _draw_dharma_wheel(draw: ImageDraw.Draw, cx: int, cy: int,
                       radius: int, color: tuple):
    """Draw an eight-spoked Dharma wheel."""
    # Outer circle
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        outline=color, width=3,
    )
    # Inner circle
    inner_r = int(radius * 0.55)
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        outline=color, width=2,
    )
    # Hub
    draw.ellipse(
        [cx - HUB_RADIUS, cy - HUB_RADIUS, cx + HUB_RADIUS, cy + HUB_RADIUS],
        fill=color,
    )
    # Spokes
    for i in range(WHEEL_SPOKES):
        angle = (2 * math.pi * i) / WHEEL_SPOKES
        x1 = cx + int(HUB_RADIUS * math.cos(angle))
        y1 = cy + int(HUB_RADIUS * math.sin(angle))
        x2 = cx + int(inner_r * math.cos(angle))
        y2 = cy + int(inner_r * math.sin(angle))
        draw.line([(x1, y1), (x2, y2)], fill=color, width=3)
    # Spokes from inner to outer
    for i in range(WHEEL_SPOKES):
        angle = (2 * math.pi * i) / WHEEL_SPOKES
        x1 = cx + int(inner_r * math.cos(angle))
        y1 = cy + int(inner_r * math.sin(angle))
        x2 = cx + int((radius - 4) * math.cos(angle))
        y2 = cy + int((radius - 4) * math.sin(angle))
        draw.line([(x1, y1), (x2, y2)], fill=color, width=2)
    # Outer nubs on each spoke
    for i in range(WHEEL_SPOKES):
        angle = (2 * math.pi * i) / WHEEL_SPOKES
        nx = cx + int(radius * math.cos(angle))
        ny = cy + int(radius * math.sin(angle))
        draw.ellipse([nx - 6, ny - 6, nx + 6, ny + 6], fill=color)


def _wrap_text(text: str, font: ImageFont.FreeTypeFont,
               max_width: int) -> list[str]:
    """Word-wrap text to fit within max_width pixels."""
    words = text.split()
    lines = []
    current = ''
    for word in words:
        test = f'{current} {word}'.strip()
        bbox = font.getbbox(test)
        if bbox[2] - bbox[0] > max_width and current:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    return lines or [text]


def _load_fonts(width: int, script: str = 'ro'):
    """Load the script-appropriate font for the title and a sans font for metadata."""
    title_size = max(78, width // 20)
    sans_size = max(28, width // 50)

    # Title font: use the script-specific font from the website
    title_font = None
    if script in _SCRIPT_FONT_FILES:
        path = os.path.join(_FONTS_DIR, _SCRIPT_FONT_FILES[script])
        if os.path.isfile(path):
            try:
                title_font = ImageFont.truetype(path, title_size)
            except Exception:
                pass

    # Fallback: Roman Noto Serif
    if title_font is None:
        candidates = [
            os.path.join(_FONTS_DIR, 'NotoSerif-Regular.ttf'),
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
            '/System/Library/Fonts/Georgia.ttc',
            '/System/Library/Fonts/Times.ttc',
        ]
        for path in candidates:
            if os.path.exists(path):
                try:
                    title_font = ImageFont.truetype(path, title_size)
                    break
                except Exception:
                    continue

    # Sans font for metadata
    sans_font = None
    sans_candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/System/Library/Fonts/Supplemental/Arial.ttf',
        os.path.join(_FONTS_DIR, 'NotoSerif-Regular.ttf'),
        '/System/Library/Fonts/Helvetica.ttc',
    ]
    for path in sans_candidates:
        if os.path.exists(path):
            try:
                sans_font = ImageFont.truetype(path, sans_size)
                break
            except Exception:
                continue

    if title_font is None:
        title_font = ImageFont.load_default()
    if sans_font is None:
        sans_font = ImageFont.load_default()

    return title_font, sans_font


def _get_font(base_font: ImageFont.FreeTypeFont, size: int):
    """Create a new font at the given size, using the same file as base."""
    try:
        return ImageFont.truetype(base_font.path, size)
    except Exception:
        return base_font

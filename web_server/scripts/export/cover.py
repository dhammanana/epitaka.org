"""
cover.py — Generate cover images for exported books.

Creates a clean, minimal cover with:
- Warm earth-tone background (#faf7f2)
- Dharma wheel SVG rendered as a centered emblem
- Book title in the appropriate script font
- Metadata: Pali name, nikaya, sub-nikaya, category, description
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
WHEEL_RADIUS  = 120
WHEEL_SPOKES  = 8
HUB_RADIUS    = 14

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

# Script code → human-readable name
_SCRIPT_NAMES = {
    'ro': 'Rōmani',
    'si': 'Sinhala',
    'hi': 'Devanāgarī',
    'th': 'Thai',
    'lo': 'Lao',
    'my': 'Myanmar',
    'km': 'Khmer',
    'be': 'Bengali',
    'gm': 'Gurmukhī',
    'tt': 'Tai Tham',
    'gj': 'Gujarātī',
    'te': 'Telugu',
    'ka': 'Kannaḍa',
    'mm': 'Malayāḷaṃ',
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
    book_name: str = '',
    nikaya: str = '',
    sub_nikaya: str = '',
    description: str = '',
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
    bar_h = 8
    draw.rectangle([0, 0, width, bar_h], fill=theme['accent'])

    # ── Dharma wheel ──────────────────────────────────────────────────
    cx, cy = width // 2, int(height * 0.18)
    _draw_dharma_wheel(draw, cx, cy, WHEEL_RADIUS, theme['wheel'])

    # ── Title logic ───────────────────────────────────────────────────
    # If script != 'ro': big title = book_name in script, small = English title
    # If script == 'ro': big title = English title, no second line
    title_y = cy + WHEEL_RADIUS + 70
    current_y = title_y

    is_roman = (script == 'ro')
    has_script_title = (not is_roman) and book_name and book_name != title

    if has_script_title:
        # Big title: book name in the target script
        big_font_size = max(80, width // 14)
        big_font = _get_script_font(script, big_font_size)
        if big_font:
            big_lines = _wrap_text(book_name, big_font, width - 140)
            for i, line in enumerate(big_lines):
                bbox = draw.textbbox((0, 0), line, font=big_font)
                tw = bbox[2] - bbox[0]
                x = (width - tw) // 2
                draw.text((x, current_y + i * 110), line, fill=TEXT_COLOR, font=big_font)
            current_y += len(big_lines) * 110 + 30
        # Small subtitle: English title
        small_font_size = max(40, width // 32)
        small_font = _get_font(title_font, small_font_size)
        small_lines = _wrap_text(title, small_font, width - 160)
        for i, line in enumerate(small_lines):
            bbox = draw.textbbox((0, 0), line, font=small_font)
            tw = bbox[2] - bbox[0]
            x = (width - tw) // 2
            draw.text((x, current_y + i * 55), line, fill=theme['muted'], font=small_font)
        current_y += len(small_lines) * 55 + 30
    else:
        # Single title (Roman or no script-specific name)
        big_font_size = max(80, width // 14)
        big_font = _get_font(title_font, big_font_size)
        big_lines = _wrap_text(title, big_font, width - 140)
        for i, line in enumerate(big_lines):
            bbox = draw.textbbox((0, 0), line, font=big_font)
            tw = bbox[2] - bbox[0]
            x = (width - tw) // 2
            draw.text((x, current_y + i * 110), line, fill=TEXT_COLOR, font=big_font)
        current_y += len(big_lines) * 110 + 30

    # ── Thin divider ──────────────────────────────────────────────────
    div_w = width // 4
    div_x = (width - div_w) // 2
    draw.line([(div_x, current_y), (div_x + div_w, current_y)],
              fill=theme['wheel'], width=2)
    current_y += 40

    # ── Nikaya / Sub-nikaya hierarchy ────────────────────────────────
    meta_font = _get_font(sans_font, max(32, width // 35))
    if sub_nikaya:
        bbox = draw.textbbox((0, 0), sub_nikaya, font=meta_font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2, current_y), sub_nikaya,
                  fill=theme['muted'], font=meta_font)
        current_y += 65
    elif nikaya:
        bbox = draw.textbbox((0, 0), nikaya, font=meta_font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2, current_y), nikaya,
                  fill=theme['muted'], font=meta_font)
        current_y += 65

    # ── Category badge ───────────────────────────────────────────────
    if category:
        cat_font = _get_font(sans_font, max(28, width // 42))
        bbox = draw.textbbox((0, 0), category, font=cat_font)
        bw = bbox[2] - bbox[0] + 70
        bh = 65
        bx = (width - bw) // 2
        draw.rounded_rectangle(
            [bx, current_y, bx + bw, current_y + bh],
            radius=bh // 2,
            outline=theme['accent'], width=2,
        )
        draw.text((bx + 35, current_y + 12), category,
                  fill=theme['accent'], font=cat_font)
        current_y += bh + 35

    # ── Language + script badge ──────────────────────────────────────
    script_name = _SCRIPT_NAMES.get(script, '')
    if lang_name or script_name:
        badge_font = _get_font(sans_font, max(30, width // 38))
        # Build combined label: "English Translation · Sinhala Script"
        parts = []
        if lang_name:
            parts.append(lang_name)
        if script_name and script != 'ro':
            parts.append(f'{script_name} Script')
        badge_text = ' · '.join(parts) if parts else ''
        if badge_text:
            bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
            bw = bbox[2] - bbox[0] + 70
            bh = 62
            bx = (width - bw) // 2
            draw.rounded_rectangle(
                [bx, current_y, bx + bw, current_y + bh],
                radius=bh // 2,
                fill=theme['accent'],
            )
            draw.text((bx + 35, current_y + 13), badge_text,
                      fill=WHITE, font=badge_font)
            current_y += bh + 40

    # ── Description ──────────────────────────────────────────────────
    if description:
        desc_font = _get_font(sans_font, max(28, width // 42))
        max_desc_len = 240
        if len(description) > max_desc_len:
            description = description[:max_desc_len].rsplit(' ', 1)[0] + '…'
        desc_lines = _wrap_text(description, desc_font, width - 240)
        for i, line in enumerate(desc_lines[:4]):  # max 4 lines
            bbox = draw.textbbox((0, 0), line, font=desc_font)
            tw = bbox[2] - bbox[0]
            draw.text(((width - tw) // 2, current_y + i * 42), line,
                      fill=MUTED_COLOR, font=desc_font)
        current_y += min(len(desc_lines), 4) * 42 + 20

    # ── Bottom section: source ────────────────────────────────────────
    bottom_y = height - 240
    # Decorative line
    line_w = width // 3
    line_x = (width - line_w) // 2
    draw.line([(line_x, bottom_y), (line_x + line_w, bottom_y)],
              fill=WHEEL_COLOR, width=2)

    # Publisher
    pub_font = _get_font(sans_font, max(30, width // 40))
    bbox = draw.textbbox((0, 0), author, font=pub_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, bottom_y + 30), author,
              fill=theme['muted'], font=pub_font)

    # Website
    site = 'epitaka.org'
    site_font = _get_font(sans_font, max(26, width // 45))
    bbox = draw.textbbox((0, 0), site, font=site_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, bottom_y + 80), site,
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
        draw.ellipse([nx - 5, ny - 5, nx + 5, ny + 5], fill=color)


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

    # Title font: always use a Latin serif font (cover title is English)
    title_font = None
    title_candidates = [
        os.path.join(_FONTS_DIR, 'NotoSerif-Regular.ttf'),
        '/System/Library/Fonts/Georgia.ttc',
        '/System/Library/Fonts/Times.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
    ]
    for path in title_candidates:
        if os.path.exists(path):
            try:
                title_font = ImageFont.truetype(path, title_size)
                break
            except Exception:
                continue

    # Sans font for metadata
    sans_font = None
    sans_candidates = [
        os.path.join(_FONTS_DIR, 'NotoSans-Regular.ttf'),
        '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        os.path.join(_FONTS_DIR, 'NotoSerif-Regular.ttf'),
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


def _get_script_font(script: str, size: int) -> ImageFont.FreeTypeFont | None:
    """Load a script-specific font for rendering non-Latin text on the cover."""
    if script not in _SCRIPT_FONT_FILES:
        return None
    path = os.path.join(_FONTS_DIR, _SCRIPT_FONT_FILES[script])
    if not os.path.exists(path):
        return None
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return None


def _get_font(base_font: ImageFont.FreeTypeFont, size: int):
    """Create a new font at the given size, using the same file as base."""
    try:
        return ImageFont.truetype(base_font.path, size)
    except Exception:
        return base_font

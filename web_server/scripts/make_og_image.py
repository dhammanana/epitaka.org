#!/usr/bin/env python3
"""Generate the branded 1200×630 Open Graph image for epitaka.org.

Run from the repo root (web_server/):

    python3 scripts/make_og_image.py

Writes frontend/src/public/og-image.png (vite copies it into dist/ on
build) and frontend/dist/og-image.png (so it is live even without a
rebuild). Commit both copies — dist/ is deployed as-is.

Requires: Pillow. Fonts are macOS system fonts (Palatino + Helvetica
Neue); swap the paths below for the platform you regenerate on.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT_PUBLIC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          'frontend', 'src', 'public', 'og-image.png')
OUT_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                        'frontend', 'dist', 'og-image.png')
ICON = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    'static', 'icon.png')

W, H = 1200, 630

# ── Brand palette (matches static/icon.png and the site theme) ─────────
MAROON_TOP = (94, 35, 32)      # #5E2320
MAROON_BOT = (43, 15, 16)      # #2B0F10
GOLD       = (201, 154, 75)    # #C99A4B  (borders / ornaments)
GOLD_BRIGHT = (232, 197, 126)  # #E8C57E  (tagline)
GOLD_DEEP  = (217, 164, 65)    # #D9A441  (divider)
CREAM      = (245, 230, 198)   # #F5E6C6  (brand name / domain)

# ── Fonts (macOS system fonts; Palatino for the classical serif brand) ─
PALATINO = '/System/Library/Fonts/Palatino.ttc'
HELVETICA = '/System/Library/Fonts/HelveticaNeue.ttc'


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(top, bottom, w, h):
    img = Image.new('RGB', (w, h))
    px = img.load()
    for y in range(h):
        color = lerp(top, bottom, y / (h - 1))
        for x in range(w):
            px[x, y] = color
    return img


def tracked_text(draw, xy, text, font, fill, tracking=0, anchor='lm'):
    """Draw text with manual letter-spacing (tracking in px).

    y is always the vertical center (PIL 'm'); horizontal placement is
    computed here (l = left edge, r = right edge, c = centered).
    """
    total = sum(font.getlength(ch) for ch in text) + tracking * (len(text) - 1)
    x, y = xy
    if anchor.startswith('l'):
        cur = x
    elif anchor.startswith('r'):
        cur = x - total
    else:  # center
        cur = x - total / 2
    for ch in text:
        draw.text((cur, y), ch, font=font, fill=fill, anchor='lm')
        cur += font.getlength(ch) + tracking


def main():
    img = vertical_gradient(MAROON_TOP, MAROON_BOT, W, H)
    draw = ImageDraw.Draw(img, 'RGBA')

    # ── Decorative gold double border ─────────────────────────────────
    draw.rectangle([26, 26, W - 26, H - 26], outline=GOLD + (185,), width=3)
    draw.rectangle([40, 40, W - 40, H - 40], outline=GOLD + (120,), width=1)

    # ── Soft gold glow behind the wheel ───────────────────────────────
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([90, 85, 450, 445], fill=GOLD + (26,))
    img = Image.alpha_composite(img.convert('RGBA'), glow)
    draw = ImageDraw.Draw(img, 'RGBA')

    # ── Dhamma wheel medallion (the app icon) ─────────────────────────
    wheel = Image.open(ICON).convert('RGBA').resize((360, 360), Image.Resampling.LANCZOS)
    img.paste(wheel, (270 - 180, H // 2 - 180), wheel)
    draw = ImageDraw.Draw(img, 'RGBA')
    # thin gold ring around the medallion
    draw.ellipse([270 - 190, H // 2 - 190, 270 + 190, H // 2 + 190],
                 outline=GOLD + (150,), width=2)

    # ── Brand text (right column) ─────────────────────────────────────
    tx = 500                      # text column left edge
    cx = tx + 190                 # column center (for centered elements)

    brand = ImageFont.truetype(PALATINO, 108, index=0)
    tracked_text(draw, (cx, 188), 'E-Piṭaka', brand, CREAM, tracking=6, anchor='cm')

    # gold divider
    draw.rounded_rectangle([cx - 55, 262, cx + 55, 266], 2, fill=GOLD_DEEP + (230,))

    tag1 = ImageFont.truetype(PALATINO, 46, index=0)
    draw.text((cx, 318), 'The Pāli Canon', font=tag1, fill=GOLD_BRIGHT,
              anchor='mm')

    tag2 = ImageFont.truetype(HELVETICA, 27, index=0)
    draw.text((cx, 372), 'Chaṭṭha Saṅgāyana Tipiṭaka · line-by-line',
              font=tag2, fill=(234, 217, 184, 235), anchor='mm')

    # ── Domain, bottom-right in tracked small caps ────────────────────
    domain = ImageFont.truetype(HELVETICA, 30, index=0)
    tracked_text(draw, (W - 60, H - 58), 'EPITAKA.ORG', domain,
                 CREAM + (200,), tracking=5, anchor='rm')

    # ── Small wheel ornament above the domain ─────────────────────────
    ow, oh = 20, 20
    ox, oy = W - 60 - domain.getlength('EPITAKA.ORG') - 5 * 10 - 46, H - 58
    for r, wd in [(10, 2), (3, 2)]:
        draw.ellipse([ox - r, oy - r, ox + r, oy + r],
                     outline=GOLD + (200,), width=wd)

    img = img.convert('RGB')
    for path in (OUT_PUBLIC, OUT_DIST):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.save(path, 'PNG')
        print(f'wrote {path}  {img.size[0]}×{img.size[1]}')


if __name__ == '__main__':
    main()

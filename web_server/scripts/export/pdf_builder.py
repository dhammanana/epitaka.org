"""
pdf_builder.py — Generate PDF files from Book data.

Uses ReportLab with:
- Cover page
- PDF bookmarks (clickable outline in sidebar)
- Hierarchical headings (vaggas -> verses)
- Bilingual paragraphs (Pali + translation)
- VRI page break markers (right-aligned chips)
- Script-specific fonts for non-Roman Pali text
"""
import os
import re
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Image as RLImage, KeepTogether, HRFlowable, Flowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from .data_loader import Book

# ── Font setup ──────────────────────────────────────────────────────────
_SERIF = 'Helvetica'
_SANS = 'Helvetica'
_SERIF_B = 'Helvetica-Bold'
_PALI_FONT = None   # script-specific font for Pali body text
_SCRIPT_H_FONT = None  # script-specific font for headings (bold weight)

_FONTS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'fonts'
))

# Map script codes → font filename (same as website common.css)
_SCRIPT_FONT_FILES = {
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
    'br': 'NotoSansBrahmi-Regular.ttf',
    'tb': 'tibetian/NotoSansTibetan-Regular.ttf',
    'cy': 'NotoSerif-Regular.ttf',
}

# Bold variants of script fonts (used for cover & headings when non-Roman)
_SCRIPT_FONT_BOLD_FILES = {
    'si': 'NotoSerifSinhala-Bold.ttf',
    'hi': 'NotoSerifDevanagari-Bold.ttf',
    'th': 'thai/THSarabun-Bold.ttf',
    'km': 'NotoSerifKhmer-Bold.ttf',
    'be': 'NotoSerifBengali-Bold.ttf',
    'gm': 'NotoSansGurmukhi-Bold.ttf',
    'gj': 'NotoSerifGujarati-Bold.ttf',
    'te': 'NotoSerifTelugu-Bold.ttf',
    'ka': 'NotoSerifKannada-Bold.ttf',
    'mm': 'NotoSerifMalayalam-Bold.ttf',
    'tb': 'tibetian/NotoSansTibetan-Bold.ttf',
    'cy': 'NotoSerif-Bold.ttf',
}


def _init_fonts(script: str = 'ro'):
    global _SERIF, _SANS, _SERIF_B, _PALI_FONT, _SCRIPT_H_FONT
    registered = set()

    def _try_register(name, candidates):
        if name in registered:
            return
        for p in candidates:
            if os.path.exists(p):
                try:
                    pdfmetrics.registerFont(TTFont(name, p))
                    registered.add(name)
                    return
                except Exception:
                    continue

    # Register base fonts
    _try_register('serif', [
        os.path.join(_FONTS_DIR, 'NotoSerif-Regular.ttf'),
        '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
        '/System/Library/Fonts/Supplemental/Georgia.ttf',
    ])
    _try_register('serif_b', [
        os.path.join(_FONTS_DIR, 'NotoSerif-Bold.ttf'),
        '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',
    ])
    _try_register('sans', [
        os.path.join(_FONTS_DIR, 'NotoSans-Regular.ttf'),
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/System/Library/Fonts/Supplemental/Arial.ttf',
    ])

    if 'serif' in registered: _SERIF = 'serif'
    if 'serif_b' in registered: _SERIF_B = 'serif_b'
    if 'sans' in registered: _SANS = 'sans'

    # Register script-specific Pali font
    _PALI_FONT = _SERIF       # default fallback (Roman serif)
    _SCRIPT_H_FONT = _SERIF_B  # default fallback (Roman serif bold)

    if script != 'ro' and script in _SCRIPT_FONT_FILES:
        fname = _SCRIPT_FONT_FILES[script]
        path = os.path.join(_FONTS_DIR, fname)
        pali_name = f'pali_{script}'
        _try_register(pali_name, [path])
        if pali_name in registered:
            _PALI_FONT = pali_name

        # Register bold variant for headings (NOT for _SERIF_B — cover
        # title is always Roman and must use the base serif bold font).
        bold_name = pali_name  # fallback: same as regular
        if script in _SCRIPT_FONT_BOLD_FILES:
            bold_fname = _SCRIPT_FONT_BOLD_FILES[script]
            bold_path = os.path.join(_FONTS_DIR, bold_fname)
            bold_name = f'pali_{script}_bold'
            _try_register(bold_name, [bold_path])
            if bold_name in registered:
                _SCRIPT_H_FONT = bold_name

        # Register a font family so <b>/<i> tags resolve correctly
        # inside ReportLab Paragraph markup.
        if pali_name in registered:
            pdfmetrics.registerFontFamily(
                pali_name,
                normal=pali_name,
                bold=bold_name if bold_name in registered else pali_name,
            )


# ── Colors ──────────────────────────────────────────────────────────────
ACCENT  = colors.Color(139/255, 94/255, 60/255)
PALI_C  = colors.Color(124/255, 45/255, 18/255)
TRANS_C = colors.Color(30/255, 58/255, 95/255)
MUTED   = colors.Color(138/255, 122/255, 110/255)
BORDER  = colors.Color(232/255, 224/255, 213/255)


# ── Bookmark flowable ──────────────────────────────────────────────────
class _Bookmark(Flowable):
    """Invisible flowable that adds a PDF bookmark at its position."""
    def __init__(self, text, level=0):
        Flowable.__init__(self)
        self.text = text
        self.level = level
        self.width = 0
        self.height = 0

    def draw(self):
        self.canv.bookmarkPage(self.text)
        self.canv.addOutlineEntry(self.text, self.text, level=self.level)


def build_pdf(book: Book, output_path: str, cover_bytes: bytes = b'') -> str:
    _init_fonts(book.script)
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    st = _styles()
    story = []

    # ── Cover ─────────────────────────────────────────────────────────
    if cover_bytes:
        try:
            img = RLImage(BytesIO(cover_bytes), width=14*cm, height=21*cm)
            img.hAlign = 'CENTER'
            story.append(img)
        except Exception:
            _text_cover(story, book, st)
    else:
        _text_cover(story, book, st)
    story.append(PageBreak())

    # ── Intro ─────────────────────────────────────────────────────────
    if book.intro_sentences:
        # book.book_name is now in the target script (converted in data_loader)
        intro_title = book.book_name or book.english_name
        story.append(_Bookmark(intro_title, level=0))
        story.append(Paragraph(_esc(intro_title), st['h1']))
        for s in book.intro_sentences:
            _add_sent(story, s, st)

    # ── Vaggas ────────────────────────────────────────────────────────
    for vagga in book.vagga_sections:
        h = vagga.heading
        # When the heading title is empty, use only the para_id number
        # (no "Section" prefix) so it renders with any font.
        title = h.title or str(h.para_id)
        story.append(_Bookmark(title, level=0))
        story.append(Paragraph(_esc(title), st['h1']))
        if vagga.heading_translation:
            story.append(Paragraph(f'<i>{_esc(vagga.heading_translation)}</i>', st['trans']))

        for verse in vagga.verses:
            vh = verse.heading
            vtitle = vh.title or str(vh.para_id)
            if vh.para_id != h.para_id:
                story.append(_Bookmark(vtitle, level=1))
                story.append(Paragraph(_esc(vtitle), st['h2']))
            if verse.heading_translation:
                story.append(Paragraph(f'<i>{_esc(verse.heading_translation)}</i>', st['trans']))
            for s in verse.sentences:
                _add_sent(story, s, st)

        story.append(HRFlowable(width='25%', thickness=0.5, color=BORDER,
                                spaceAfter=10, spaceBefore=10, hAlign='CENTER'))

    # ── Build ─────────────────────────────────────────────────────────
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=2.2*cm, rightMargin=2.2*cm,
        topMargin=2.5*cm, bottomMargin=2.5*cm,
        title=_pdf_title(book),
        author='Chattha Sangayana Tipitaka',
        subject=book.description or '',
    )
    doc.build(story)
    return output_path


def _add_sent(story, s, st):
    if s.vripage:
        story.append(Paragraph(
            f'<font size="7" color="#8a7a6e">— VRI page {_esc(s.vripage)} —</font>',
            st['vri']))
        story.append(Spacer(1, 2))
    elems = []
    if s.pali:
        elems.append(Paragraph(_inline_markup(s.pali), st['pali']))
    if s.translation:
        elems.append(Paragraph(_inline_markup(s.translation), st['trans']))
    if elems:
        story.append(KeepTogether(elems))


def _pdf_title(book):
    en = book.english_name
    if en and en.lower() != book.book_name.lower():
        return f'{en} ({book.book_name})'
    return book.book_name


def _text_cover(story, book, st):
    story.append(Spacer(1, 80))
    story.append(Paragraph('☸', ParagraphStyle(
        'w', fontName=_SANS, fontSize=40, alignment=TA_CENTER, textColor=ACCENT, spaceAfter=30)))
    story.append(Paragraph(_esc(_pdf_title(book)), st['title_main']))
    if book.nikaya:
        story.append(Paragraph(_esc(book.nikaya), st['title_sub']))
    if book.lang_name:
        story.append(Paragraph(f'{book.lang_name} Translation', st['title_lang']))
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width='25%', color=ACCENT, thickness=1.5, hAlign='CENTER'))
    story.append(Spacer(1, 16))
    story.append(Paragraph('Chattha Sangayana Tipitaka', st['title_pub']))
    story.append(Paragraph('epitaka.org', st['title_pub']))


def _styles():
    # Headings use the script-specific bold font when available,
    # falling back to the base serif bold.  Cover & translation text
    # always use the base serif/sans fonts (they contain Latin glyphs).
    h_font = _SCRIPT_H_FONT or _SERIF_B
    return {
        'h1': ParagraphStyle('h1', fontName=h_font, fontSize=14,
            leading=18, textColor=ACCENT, spaceBefore=16, spaceAfter=4),
        'h2': ParagraphStyle('h2', fontName=h_font, fontSize=11,
            leading=15, textColor=ACCENT, spaceBefore=12, spaceAfter=3,
            leftIndent=12),
        'pali': ParagraphStyle('pali', fontName=_PALI_FONT or _SERIF, fontSize=10.5,
            leading=15, textColor=PALI_C, spaceAfter=1),
        'trans': ParagraphStyle('trans', fontName=_SANS, fontSize=9.5,
            leading=13, textColor=TRANS_C, leftIndent=10, spaceAfter=4),
        'vri': ParagraphStyle('vri', fontName=_SANS, fontSize=7,
            leading=10, textColor=MUTED, alignment=TA_RIGHT, spaceBefore=8, spaceAfter=2,
            borderColor=BORDER, borderWidth=0.5, borderPadding=3),
        'title_main': ParagraphStyle('tm', fontName=_SERIF_B, fontSize=28,
            leading=34, alignment=TA_CENTER, textColor=ACCENT, spaceAfter=12),
        'title_sub': ParagraphStyle('ts', fontName=_SANS, fontSize=14,
            leading=18, alignment=TA_CENTER, textColor=MUTED, spaceAfter=6),
        'title_lang': ParagraphStyle('tl', fontName=_SANS, fontSize=12,
            leading=16, alignment=TA_CENTER, textColor=ACCENT, spaceAfter=20),
        'title_pub': ParagraphStyle('tp', fontName=_SANS, fontSize=10,
            leading=14, alignment=TA_CENTER, textColor=MUTED, spaceAfter=4),
    }


def _esc(t):
    return (t or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _inline_markup(text):
    """Escape source text while preserving basic inline HTML for ReportLab."""
    placeholders = []
    def hold(match):
        placeholders.append(match.group(0))
        return f'@@MARKUP{len(placeholders) - 1}@@'
    safe = re.sub(r'</?(?:b|strong|i|em|sup|sub)\b[^>]*>', hold, text or '', flags=re.I)
    safe = _esc(safe)
    for i, tag in enumerate(placeholders):
        safe = safe.replace(f'@@MARKUP{i}@@', tag)
    return safe

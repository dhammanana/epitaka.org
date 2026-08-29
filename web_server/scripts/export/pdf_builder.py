"""
pdf_builder.py — Generate PDF files from Book data.

Uses ReportLab with full (non-subsetted) font embedding so that modern
PDF viewers can perform OpenType text shaping (GSUB/GPOS) for complex
scripts like Sinhala, Devanagari, Thai, etc.

Pipeline:
  Book data → ReportLab Platypus flowables → PDF

Features:
- Cover page (image or text fallback)
- PDF bookmarks (clickable outline in sidebar)
- Hierarchical headings (vaggas -> verses)
- Bilingual paragraphs (Pāli + translation)
- VRI page break markers
- Script-specific fonts (full embedding, no subsetting)
"""
import os
import re
import unicodedata

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)
from reportlab.platypus.tableofcontents import TableOfContents

from .data_loader import Book

# ── Font mapping: script code → (reportlab_name, font_filename) ─────────
_SCRIPT_FONTS = {
    'si':  ('pali_si',              'NotoSerifSinhala-Regular.ttf',      'NotoSerifSinhala-Bold.ttf',      None),
    'hi':  ('pali_hi',              'NotoSerifDevanagari-Regular.ttf',   'NotoSerifDevanagari-Bold.ttf',   None),
    'th':  ('pali_th',              'thai/THSarabunPali.ttf',           'thai/THSarabun-Bold.ttf',        None),
    'lo':  ('pali_lo',              'lao/LaoPaliAlpha-Regular.woff',     None,                              None),
    'my':  ('pali_my',              'myanmar/mm3-multi-os(16-08-2011).ttf', None,                           None),
    'km':  ('pali_km',              'NotoSerifKhmer-Regular.ttf',       'NotoSerifKhmer-Bold.ttf',        None),
    'be':  ('pali_be',              'NotoSerifBengali-Regular.ttf',     'NotoSerifBengali-Bold.ttf',      None),
    'gm':  ('pali_gm',              'NotoSansGurmukhi-Regular.ttf',     'NotoSansGurmukhi-Bold.ttf',      None),
    'tt':  ('pali_tt',              'lanna/Hariphunchai.otf',           None,                              None),
    'gj':  ('pali_gj',              'NotoSerifGujarati-Regular.ttf',    'NotoSerifGujarati-Bold.ttf',     None),
    'te':  ('pali_te',              'NotoSerifTelugu-Regular.ttf',      'NotoSerifTelugu-Bold.ttf',       None),
    'ka':  ('pali_ka',              'NotoSerifKannada-Regular.ttf',     'NotoSerifKannada-Bold.ttf',      None),
    'mm':  ('pali_mm',              'NotoSerifMalayalam-Regular.ttf',   'NotoSerifMalayalam-Bold.ttf',    None),
    'br':  ('pali_br',              'NotoSansBrahmi-Regular.ttf',       None,                              None),
    'tb':  ('pali_tb',              'tibetian/NotoSansTibetan-Regular.ttf', 'tibetian/NotoSansTibetan-Bold.ttf', None),
    'cy':  ('pali_cy',              'NotoSerif-Regular.ttf',            'NotoSerif-Bold.ttf',             None),
}

_FONTS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'fonts'
))

# ── Colors (matching the website theme) ─────────────────────────────────
ACCENT  = colors.HexColor('#8b5e3c')
PALI_C  = colors.HexColor('#7c2d12')
TRANS_C = colors.HexColor('#1e3a5f')
MUTED   = colors.HexColor('#8a7a6e')
BORDER  = colors.HexColor('#e8e0d5')
DARK    = colors.HexColor('#2d2420')


def build_pdf(book: Book, output_path: str, cover_bytes: bytes = b'') -> str:
    """Build a PDF from the Book data."""
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

    # Register fonts for this book's script
    _register_fonts(book.script)

    doc = _build_doc(book, output_path)
    story = _build_story(book, cover_bytes)

    doc.build(story)
    return output_path


# ── Font registration ───────────────────────────────────────────────────

def _register_fonts(script: str):
    """Register all needed fonts with ReportLab (full, non-subsetted)."""
    fonts_to_register = ['ro', script]

    for s in fonts_to_register:
        if s not in _SCRIPT_FONTS:
            continue
        rl_name, regular, bold, italic = _SCRIPT_FONTS[s]

        # Register regular
        if regular:
            _try_add_font(rl_name, regular)

        # Register bold
        if bold:
            _try_add_font(rl_name + '_bold', bold)

        # Register italic
        if italic:
            _try_add_font(rl_name + '_italic', italic)

        # Register font family so <b> and <i> tags work in Paragraphs
        pdfmetrics.registerFontFamily(
            rl_name,
            normal=rl_name,
            bold=rl_name + '_bold' if bold else rl_name,
            italic=rl_name + '_italic' if italic else rl_name,
            boldItalic=rl_name + '_bold' if bold else rl_name,
        )


def _try_add_font(rl_name: str, filename: str):
    """Register a font, silently skipping if file not found."""
    path = os.path.join(_FONTS_DIR, filename)
    if os.path.isfile(path):
        try:
            pdfmetrics.registerFont(TTFont(rl_name, path))
        except Exception:
            pass  # Font may already be registered


# ── Document setup ──────────────────────────────────────────────────────

def _build_doc(book: Book, output_path: str) -> BaseDocTemplate:
    """Create the PDF document with page templates."""
    page_w, page_h = A4
    margin_lr = 2.2 * cm
    margin_top = 2.5 * cm
    margin_bot = 2.5 * cm

    doc = BaseDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=margin_lr,
        rightMargin=margin_lr,
        topMargin=margin_top,
        bottomMargin=margin_bot,
        title=_pdf_title(book),
        author='epitaka.org',
    )

    frame = Frame(
        margin_lr, margin_bot,
        page_w - 2 * margin_lr,
        page_h - margin_top - margin_bot,
        id='normal',
    )

    def add_bookmark(canvas, doc):
        """Add page number footer."""
        canvas.saveState()
        canvas.setFont('pali_ro', 8)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(page_w / 2, 1.2 * cm, f'— {doc.page} —')
        canvas.restoreState()

    template = PageTemplate(id='normal', frames=[frame], onPage=add_bookmark)
    doc.addPageTemplates([template])

    return doc


# ── Styles ──────────────────────────────────────────────────────────────

def _make_styles(script: str):
    """Create paragraph styles for the book."""
    rl_name = _SCRIPT_FONTS.get(script, ('pali_ro',))[0]
    ro_name = 'pali_ro'

    styles = {}

    styles['title'] = ParagraphStyle(
        'title',
        fontName=f'{rl_name}_bold' if script != 'ro' else f'{ro_name}_bold',
        fontSize=20,
        leading=26,
        alignment=TA_CENTER,
        textColor=ACCENT,
        spaceAfter=8,
    )

    styles['subtitle'] = ParagraphStyle(
        'subtitle',
        fontName=ro_name,
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=4,
    )

    styles['lang_line'] = ParagraphStyle(
        'lang_line',
        fontName=ro_name,
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        textColor=ACCENT,
        spaceAfter=4,
    )

    styles['description'] = ParagraphStyle(
        'description',
        fontName=ro_name,
        fontSize=8.5,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=6,
        leftIndent=40,
        rightIndent=40,
    )

    styles['publisher'] = ParagraphStyle(
        'publisher',
        fontName=ro_name,
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=MUTED,
        spaceAfter=4,
    )

    styles['section_heading'] = ParagraphStyle(
        'section_heading',
        fontName=f'{rl_name}_bold' if script != 'ro' else f'{ro_name}_bold',
        fontSize=13,
        leading=18,
        textColor=ACCENT,
        spaceBefore=18,
        spaceAfter=6,
        borderWidth=0,
        borderPadding=0,
    )

    styles['verse_heading'] = ParagraphStyle(
        'verse_heading',
        fontName=f'{rl_name}_bold' if script != 'ro' else f'{ro_name}_bold',
        fontSize=10.5,
        leading=14,
        textColor=ACCENT,
        spaceBefore=14,
        spaceAfter=4,
    )

    styles['pali'] = ParagraphStyle(
        'pali',
        fontName=rl_name,
        fontSize=10.5,
        leading=17,
        textColor=PALI_C,
        spaceAfter=2,
        leftIndent=0,
    )

    styles['translation'] = ParagraphStyle(
        'translation',
        fontName=ro_name,
        fontSize=9.5,
        leading=14,
        textColor=TRANS_C,
        spaceAfter=6,
        leftIndent=10,
    )

    styles['section_translation'] = ParagraphStyle(
        'section_translation',
        fontName=ro_name,
        fontSize=9,
        leading=12,
        textColor=TRANS_C,
        spaceAfter=8,
    )

    styles['vri_page'] = ParagraphStyle(
        'vri_page',
        fontName=ro_name,
        fontSize=7,
        leading=10,
        alignment=TA_LEFT,
        textColor=MUTED,
        spaceAfter=4,
        rightIndent=0,
    )

    return styles


# ── Story building ──────────────────────────────────────────────────────

def _build_story(book: Book, cover_bytes: bytes) -> list:
    """Build the list of flowables for the PDF."""
    styles = _make_styles(book.script)
    story = []

    # Cover
    if cover_bytes:
        try:
            from io import BytesIO
            from PIL import Image as PILImage
            pil = PILImage.open(BytesIO(cover_bytes))
            pw, ph = pil.size  # pixel dimensions
            page_w, page_h = A4
            max_w = page_w - 5.0 * cm
            max_h = page_h - 5.5 * cm
            ratio = min(max_w / pw, max_h / ph)
            img = Image(BytesIO(cover_bytes), width=pw * ratio, height=ph * ratio)
            story.append(img)
        except Exception:
            _add_text_cover(story, book, styles)
    else:
        _add_text_cover(story, book, styles)

    story.append(PageBreak())

    # Title page (always show, even with cover)
    _add_title_page(story, book, styles)
    story.append(PageBreak())

    # Intro
    if book.intro_sentences:
        intro_title = book.book_name or book.english_name
        story.append(Paragraph(_esc(intro_title), styles['section_heading']))
        for s in book.intro_sentences:
            _add_sentence(story, s, styles)
        story.append(PageBreak())

    # Vaggas
    for vagga in book.vagga_sections:
        h = vagga.heading
        title = h.title or str(h.para_id)
        story.append(Paragraph(_esc(title), styles['section_heading']))
        if vagga.heading_translation:
            story.append(Paragraph(
                f'<i>{_esc(vagga.heading_translation)}</i>',
                styles['section_translation'],
            ))

        for verse in vagga.verses:
            vh = verse.heading
            vtitle = vh.title or str(vh.para_id)
            if vh.para_id != h.para_id:
                story.append(Paragraph(_esc(vtitle), styles['verse_heading']))
            if verse.heading_translation:
                story.append(Paragraph(
                    f'<i>{_esc(verse.heading_translation)}</i>',
                    styles['section_translation'],
                ))
            for s in verse.sentences:
                _add_sentence(story, s, styles)

        # Divider between vaggas
        story.append(Spacer(1, 12))
        div_style = ParagraphStyle(
            'divider', fontSize=1, leading=1, textColor=BORDER,
            alignment=TA_CENTER, spaceBefore=4, spaceAfter=4,
        )
        story.append(Paragraph('· · ·', div_style))
        story.append(Spacer(1, 8))

    return story


# ── Content helpers ─────────────────────────────────────────────────────

def _add_text_cover(story: list, book: Book, styles: dict):
    """Text-based cover page when no cover image."""
    story.append(Spacer(1, 6 * cm))

    title = _pdf_title(book)
    story.append(Paragraph(_esc(title), styles['title']))

    if book.sub_nikaya:
        story.append(Paragraph(_esc(book.sub_nikaya), styles['subtitle']))
    elif book.nikaya:
        story.append(Paragraph(_esc(book.nikaya), styles['subtitle']))

    if book.lang_name:
        story.append(Paragraph(
            f'{_esc(book.lang_name)} Translation', styles['lang_line']
        ))

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + '…'
        story.append(Paragraph(_esc(desc), styles['description']))

    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph('Chattha Sangayana Tipiṭaka', styles['publisher']))
    story.append(Paragraph('epitaka.org', styles['publisher']))


def _add_title_page(story: list, book: Book, styles: dict):
    """Standalone title page (shown after cover image or as main cover)."""
    story.append(Spacer(1, 6 * cm))

    title = _pdf_title(book)
    story.append(Paragraph(_esc(title), styles['title']))

    if book.sub_nikaya:
        story.append(Paragraph(_esc(book.sub_nikaya), styles['subtitle']))
    elif book.nikaya:
        story.append(Paragraph(_esc(book.nikaya), styles['subtitle']))

    if book.lang_name:
        story.append(Paragraph(
            f'{_esc(book.lang_name)} Translation', styles['lang_line']
        ))

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + '…'
        story.append(Paragraph(_esc(desc), styles['description']))

    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph('Chattha Sangayana Tipiṭaka', styles['publisher']))
    story.append(Paragraph('epitaka.org', styles['publisher']))


def _add_sentence(story: list, s, styles: dict):
    """Add a single sentence (pali + translation) to the story."""
    if s.vripage:
        story.append(Paragraph(
            f'— VRI page {_esc(s.vripage)} —',
            styles['vri_page'],
        ))
    if s.pali:
        pali = unicodedata.normalize('NFC', s.pali)
        story.append(Paragraph(pali, styles['pali']))
    if s.translation:
        story.append(Paragraph(
            _inline_markup(s.translation),
            styles['translation'],
        ))


# ── Helpers ─────────────────────────────────────────────────────────────

def _pdf_title(book):
    en = book.english_name
    bn = book.book_name or ''
    if en and en.lower() != bn.lower():
        return f'{en} ({bn})'
    return bn


def _esc(text):
    """Escape HTML special characters."""
    return (text or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _inline_markup(text):
    """Preserve <b>, <i>, etc. tags while escaping everything else."""
    placeholders = []
    def hold(match):
        placeholders.append(match.group(0))
        return f'@@MARKUP{len(placeholders) - 1}@@'
    safe = re.sub(r'</?(?:b|strong|i|em|sup|sub)\b[^>]*>', hold, text or '', flags=re.I)
    safe = _esc(safe)
    for i, tag in enumerate(placeholders):
        safe = safe.replace(f'@@MARKUP{i}@@', tag)
    return safe

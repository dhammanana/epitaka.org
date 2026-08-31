"""
pdf_builder.py — Generate PDF files from Book data.

Uses fpdf2 with HarfBuzz text shaping (via uharfbuzz) for proper
rendering of complex scripts like Sinhala, Devanagari, Thai, etc.

Unlike ReportLab, fpdf2 + HarfBuzz processes OpenType GSUB/GPOS tables,
so combining characters, vowel signs, and contextual forms render correctly.

Pipeline:
  Book data → HTML (with CSS) → fpdf2 → PDF

Features:
- Cover page (image or text fallback)
- PDF bookmarks (clickable outline in sidebar)
- Hierarchical headings (vaggas -> verses)
- Bilingual paragraphs (Pāli + translation)
- VRI page break markers
- Script-specific fonts with HarfBuzz text shaping
"""
import os
import re
import unicodedata
from io import BytesIO

from fpdf import FPDF

from .data_loader import Book


# ── Font mapping: script code → (css_font_name, font_filename) ─────────
# Matches the website's @font-face declarations in common.css.
_SCRIPT_FONTS = {
    'ro':  ('roman',              'NotoSerif-Regular.ttf',             'NotoSerif-Bold.ttf'),
    'si':  ('sinhala',            'NotoSerifSinhala-Regular.ttf',      'NotoSerifSinhala-Bold.ttf'),
    'hi':  ('devanagari',         'NotoSerifDevanagari-Regular.ttf',   'NotoSerifDevanagari-Bold.ttf'),
    'th':  ('thai',               'THSarabunPali.ttf',                 'THSarabunPali.ttf'),
    'lo':  ('lao',                'LaoPaliAlpha-Regular.woff',         None),
    'my':  ('myanmar',            'mm3-multi-os(16-08-2011).ttf',      None),
    'km':  ('khmer',              'NotoSerifKhmer-Regular.ttf',        'NotoSerifKhmer-Bold.ttf'),
    'be':  ('bengali',            'NotoSerifBengali-Regular.ttf',      'NotoSerifBengali-Bold.ttf'),
    'gm':  ('gurmukhi',           'NotoSansGurmukhi-Regular.ttf',      'NotoSansGurmukhi-Bold.ttf'),
    'tt':  ('tai tham',           'Hariphunchai.otf',                  None),
    'gj':  ('gujarati',           'NotoSerifGujarati-Regular.ttf',     'NotoSerifGujarati-Bold.ttf'),
    'te':  ('telugu',             'NotoSerifTelugu-Regular.ttf',       'NotoSerifTelugu-Bold.ttf'),
    'ka':  ('kannada',            'NotoSerifKannada-Regular.ttf',      'NotoSerifKannada-Bold.ttf'),
    'mm':  ('malayalam',          'NotoSerifMalayalam-Regular.ttf',    'NotoSerifMalayalam-Bold.ttf'),
    'br':  ('brahmi',             'NotoSansBrahmi-Regular.ttf',        None),
    'tb':  ('tibetan',            'NotoSansTibetan-Regular.ttf',       'NotoSansTibetan-Bold.ttf'),
    'cy':  ('cyrillic',           'NotoSerif-Regular.ttf',             'NotoSerif-Bold.ttf'),
}

# OpenType script tags for HarfBuzz (used for text shaping)
_SCRIPT_OT_TAGS = {
    'ro':  ('latn', 'eng'),
    'si':  ('sinh', 'sin'),
    'hi':  ('dev2', 'hin'),
    'th':  ('thai', 'tha'),
    'lo':  ('lao ', 'lao'),
    'my':  ('mymr', 'mya'),
    'km':  ('khmr', 'khm'),
    'be':  ('beng', 'ben'),
    'gm':  ('guru', 'pan'),
    'tt':  ('lana', 'nod'),
    'gj':  ('gjr2', 'guj'),
    'te':  ('tel2', 'tel'),
    'ka':  ('knda', 'kan'),
    'mm':  ('mlym', 'mal'),
    'br':  ('brah', 'san'),
    'tb':  ('tibt', 'bod'),
    'cy':  ('cyrl', 'rus'),
}

_FONTS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'fonts'
))

# ── Colors (matching the website theme) ─────────────────────────────────
ACCENT  = (139, 94, 60)    # #8b5e3c
PALI_C  = (124, 45, 18)    # #7c2d12
TRANS_C = (30, 58, 95)     # #1e3a5f
MUTED   = (138, 122, 110)  # #8a7a6e
DARK    = (45, 36, 32)     # #2d2420


def build_pdf(book: Book, output_path: str, cover_bytes: bytes = b'') -> str:
    """Build a PDF from the Book data using fpdf2 + HarfBuzz."""
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

    pdf = _PDF(book)
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()

    # Cover
    if cover_bytes:
        try:
            from PIL import Image as PILImage
            pil = PILImage.open(BytesIO(cover_bytes))
            pw, ph = pil.size
            page_w = pdf.w - pdf.l_margin - pdf.r_margin
            page_h = pdf.h - pdf.t_margin - pdf.b_margin
            ratio = min(page_w / pw, page_h / ph)
            pdf.image(BytesIO(cover_bytes), x=pdf.l_margin, y=pdf.t_margin,
                      w=pw * ratio, h=ph * ratio)
            pdf.add_page()
        except Exception:
            _add_text_cover(pdf, book)
    else:
        _add_text_cover(pdf, book)

    pdf.add_page()
    _add_title_page(pdf, book)

    # Intro
    if book.intro_sentences:
        intro_title = book.book_name or book.english_name
        _add_section_heading(pdf, intro_title)
        for s in book.intro_sentences:
            _add_sentence(pdf, s, book.script)
        pdf.add_page()

    # Vaggas
    for vagga in book.vagga_sections:
        h = vagga.heading
        title = h.title or str(h.para_id)
        _add_section_heading(pdf, title)
        if vagga.heading_translation:
            _add_translation_text(pdf, vagga.heading_translation)

        for verse in vagga.verses:
            vh = verse.heading
            vtitle = vh.title or str(vh.para_id)
            if vh.para_id != h.para_id:
                _add_verse_heading(pdf, vtitle)
            if verse.heading_translation:
                _add_translation_text(pdf, verse.heading_translation)
            for s in verse.sentences:
                _add_sentence(pdf, s, book.script)

        # Divider between vaggas
        pdf.ln(8)
        pdf.set_font('roman', size=8)
        pdf.set_text_color(*MUTED)
        pdf.cell(0, 5, '· · ·', align='C')
        pdf.ln(12)

    pdf.output(output_path)
    return output_path


# ── Custom PDF class ────────────────────────────────────────────────────

class _PDF(FPDF):
    """Custom FPDF subclass with HarfBuzz text shaping and font management."""

    def __init__(self, book: Book):
        super().__init__()
        self._book = book
        self._fonts_registered = False
        self._register_fonts()

    def _register_fonts(self):
        """Register fonts for the book's script with HarfBuzz shaping."""
        if self._fonts_registered:
            return
        self._fonts_registered = True

        script = self._book.script
        fonts_to_register = ['ro', script]

        for s in set(fonts_to_register):
            if s not in _SCRIPT_FONTS:
                continue
            css_name, regular, bold = _SCRIPT_FONTS[s]

            # Register regular
            if regular:
                path = os.path.join(_FONTS_DIR, regular)
                if os.path.isfile(path):
                    try:
                        self.add_font(css_name, fname=path)
                    except Exception:
                        pass

            # Register bold (use script-specific bold if available,
            # otherwise fall back to regular for bold style)
            if bold:
                path = os.path.join(_FONTS_DIR, bold)
                if os.path.isfile(path):
                    try:
                        self.add_font(css_name, style='B', fname=path)
                    except Exception:
                        pass
            elif regular and s != 'ro':
                # No separate bold font — register regular as bold fallback
                path = os.path.join(_FONTS_DIR, regular)
                if os.path.isfile(path):
                    try:
                        self.add_font(css_name, style='B', fname=path)
                    except Exception:
                        pass

    def _set_pali_font(self, script: str):
        """Set font for Pāli text with HarfBuzz shaping enabled."""
        css_name = _SCRIPT_FONTS.get(script, ('roman',))[0]
        self.set_font(css_name, size=11)
        # Enable HarfBuzz text shaping for complex scripts
        ot_script, ot_lang = _SCRIPT_OT_TAGS.get(script, ('latn', 'eng'))
        self.set_text_shaping(use_shaping_engine=True, script=ot_script, language=ot_lang)

    def _set_roman_font(self, size: int = 10):
        """Set font for Roman/English text (no shaping needed)."""
        self.set_font('roman', size=size)
        self.set_text_shaping(use_shaping_engine=False)

    def _set_roman_bold(self, size: int = 10):
        """Set bold Roman font."""
        self.set_font('roman', style='B', size=size)
        self.set_text_shaping(use_shaping_engine=False)

    def footer(self):
        """Page number footer."""
        self.set_y(-15)
        self.set_font('roman', size=8)
        self.set_text_color(*MUTED)
        self.cell(0, 10, f'— {self.page_no()} —', align='C')


# ── Cover & title page ──────────────────────────────────────────────────

def _centered_cell(pdf: _PDF, w: float, h: float, text: str):
    """Write a centered multi_cell and reset X to left margin after."""
    pdf.multi_cell(w, h, text, align='C')
    pdf.set_x(pdf.l_margin)


def _add_text_cover(pdf: _PDF, book: Book):
    """Text-based cover page when no cover image."""
    pdf.ln(60)
    title = _pdf_title(book)
    pdf._set_roman_bold(20)
    pdf.set_text_color(*ACCENT)
    _centered_cell(pdf, 0, 10, title)
    pdf.ln(5)

    if book.sub_nikaya:
        pdf._set_roman_font(11)
        pdf.set_text_color(*MUTED)
        _centered_cell(pdf, 0, 6, book.sub_nikaya)
    elif book.nikaya:
        pdf._set_roman_font(11)
        pdf.set_text_color(*MUTED)
        _centered_cell(pdf, 0, 6, book.nikaya)

    if book.lang_name:
        pdf._set_roman_font(10)
        pdf.set_text_color(*ACCENT)
        _centered_cell(pdf, 0, 6, f'{book.lang_name} Translation')
        pdf.ln(3)

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + '…'
        pdf._set_roman_font(8)
        pdf.set_text_color(107, 114, 128)
        pdf.set_x(pdf.l_margin + 30)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin - 60, 5, desc, align='C')
        pdf.set_x(pdf.l_margin)
        pdf.ln(8)

    pdf._set_roman_font(9)
    pdf.set_text_color(*MUTED)
    _centered_cell(pdf, 0, 5, 'Chattha Sangayana Tipiṭaka')
    pdf.ln(2)
    _centered_cell(pdf, 0, 5, 'epitaka.org')


def _add_title_page(pdf: _PDF, book: Book):
    """Standalone title page."""
    pdf.ln(60)
    title = _pdf_title(book)
    pdf._set_roman_bold(20)
    pdf.set_text_color(*ACCENT)
    _centered_cell(pdf, 0, 10, title)
    pdf.ln(5)

    if book.sub_nikaya:
        pdf._set_roman_font(11)
        pdf.set_text_color(*MUTED)
        _centered_cell(pdf, 0, 6, book.sub_nikaya)
    elif book.nikaya:
        pdf._set_roman_font(11)
        pdf.set_text_color(*MUTED)
        _centered_cell(pdf, 0, 6, book.nikaya)

    if book.lang_name:
        pdf._set_roman_font(10)
        pdf.set_text_color(*ACCENT)
        _centered_cell(pdf, 0, 6, f'{book.lang_name} Translation')
        pdf.ln(3)

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + '…'
        pdf._set_roman_font(8)
        pdf.set_text_color(107, 114, 128)
        pdf.set_x(pdf.l_margin + 30)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin - 60, 5, desc, align='C')
        pdf.set_x(pdf.l_margin)
        pdf.ln(8)

    pdf._set_roman_font(9)
    pdf.set_text_color(*MUTED)
    _centered_cell(pdf, 0, 5, 'Chattha Sangayana Tipiṭaka')
    pdf.ln(2)
    _centered_cell(pdf, 0, 5, 'epitaka.org')


# ── Content helpers ─────────────────────────────────────────────────────

def _add_section_heading(pdf: _PDF, title: str):
    """Add a major section heading (vagga)."""
    pdf.ln(10)
    pdf._set_roman_bold(13)
    pdf.set_text_color(*ACCENT)
    pdf.multi_cell(0, 7, _strip_html(title))
    pdf.set_x(pdf.l_margin)
    pdf.ln(3)


def _add_verse_heading(pdf: _PDF, title: str):
    """Add a verse/sub-section heading."""
    pdf.ln(6)
    pdf._set_roman_bold(10)
    pdf.set_text_color(*ACCENT)
    pdf.multi_cell(0, 5, _strip_html(title))
    pdf.set_x(pdf.l_margin)
    pdf.ln(2)


def _add_sentence(pdf: _PDF, s, script: str):
    """Add a single sentence (pali + translation) to the PDF."""
    if s.vripage:
        pdf._set_roman_font(7)
        pdf.set_text_color(*MUTED)
        pdf.cell(0, 4, f'— VRI page {s.vripage} —', align='L')
        pdf.set_x(pdf.l_margin)
        pdf.ln(5)

    if s.pali:
        pali = unicodedata.normalize('NFC', s.pali)
        pdf._set_pali_font(script)
        pdf.set_text_color(*PALI_C)
        pdf.multi_cell(0, 6, _strip_html(pali))
        pdf.set_x(pdf.l_margin)
        pdf.ln(1)

    if s.translation:
        pdf._set_roman_font(9)
        pdf.set_text_color(*TRANS_C)
        # Preserve inline <i>, <b> tags
        trans = _strip_html_keep_inline(s.translation)
        pdf.multi_cell(0, 5, trans)
        pdf.set_x(pdf.l_margin)
        pdf.ln(3)


def _add_translation_text(pdf: _PDF, text: str):
    """Add a translation text line (e.g. section translation)."""
    pdf._set_roman_font(9)
    pdf.set_text_color(*TRANS_C)
    pdf.multi_cell(0, 5, _strip_html(text))
    pdf.set_x(pdf.l_margin)
    pdf.ln(3)


# ── Helpers ─────────────────────────────────────────────────────────────

def _pdf_title(book):
    en = book.english_name
    bn = book.book_name or ''
    if en and en.lower() != bn.lower():
        return f'{en} ({bn})'
    return bn


def _strip_html(text):
    """Strip HTML tags, return plain text."""
    if not text:
        return ''
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()


def _strip_html_keep_inline(text):
    """Strip block-level HTML but keep <b>, <i> inline tags for fpdf2."""
    if not text:
        return ''
    # Remove block-level tags but keep inline ones
    text = re.sub(r'</?(?:div|p|br|ul|ol|li|h[1-6])\b[^>]*>', '\n', text, flags=re.I)
    # Keep <b>, <i>, <strong>, <em> tags (fpdf2 supports them)
    return text.strip()

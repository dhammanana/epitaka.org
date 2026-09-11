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

import logging
import os
import re
import unicodedata
from io import BytesIO

from fpdf import FPDF

# Noto fonts ship a non-standard "TTFA" metadata table that fontTools
# cannot subset. It carries no rendering data and is safely dropped,
# but fontTools logs a warning per embedded font — silence it.
logging.getLogger("fontTools.subset").setLevel(logging.ERROR)

from .data_loader import (
    Book,
    VariantCounter,
    clean_variant_note,
    tokenize_pali_variants,
)


# ── Font mapping: script code → (css_font_name, font_filename) ─────────
# Matches the website's @font-face declarations in common.css.
_SCRIPT_FONTS = {
    "ro": ("roman", "NotoSans-Regular.ttf", "NotoSans-Bold.ttf"),
    "si": ("sinhala", "NotoSansSinhala-Regular.ttf", "NotoSansSinhala-Bold.ttf"),
    "hi": (
        "devanagari",
        "NotoSansDevanagari-Regular.ttf",
        "NotoSansDevanagari-Bold.ttf",
    ),
    "th": ("thai", "thai/NotoSansThai-Regular.ttf", "thai/NotoSansThai-Bold.ttf"),
    "lo": ("lao", "lao/NotoSansLao-Regular.ttf", "lao/NotoSansLao-Bold.ttf"),
    "my": (
        "myanmar",
        "myanmar/NotoSansMyanmar-Regular.ttf",
        "myanmar/NotoSansMyanmar-Bold.ttf",
    ),
    "km": ("khmer", "NotoSansKhmer-Regular.ttf", "NotoSansKhmer-Bold.ttf"),
    "be": ("bengali", "NotoSansBengali-Regular.ttf", "NotoSansBengali-Bold.ttf"),
    "gm": ("gurmukhi", "NotoSansGurmukhi-Regular.ttf", "NotoSansGurmukhi-Bold.ttf"),
    "tt": (
        "tai tham",
        "lanna/NotoSansTaiTham-Regular.ttf",
        "lanna/NotoSansTaiTham-Bold.ttf",
    ),
    "gj": ("gujarati", "NotoSansGujarati-Regular.ttf", "NotoSansGujarati-Bold.ttf"),
    "te": ("telugu", "NotoSansTelugu-Regular.ttf", "NotoSansTelugu-Bold.ttf"),
    "ka": ("kannada", "NotoSansKannada-Regular.ttf", "NotoSansKannada-Bold.ttf"),
    "mm": (
        "malayalam",
        "NotoSansMalayalam-Regular.ttf",
        "NotoSansMalayalam-Bold.ttf",
    ),
    "br": ("brahmi", "NotoSansBrahmi-Regular.ttf", None),
    "tb": (
        "tibetan",
        "tibetian/NotoSansTibetan-Regular.ttf",
        "tibetian/NotoSansTibetan-Bold.ttf",
    ),
    "cy": ("cyrillic", "NotoSans-Regular.ttf", "NotoSans-Bold.ttf"),
}

# Scripts with conjuncts/reordering that REQUIRE HarfBuzz shaping to render
# correctly (Sinhala, Devanagari, Myanmar, Khmer, ...). Thai, Lao, Roman
# and Cyrillic render correctly with plain glyph advances as long as the
# right font is used — and shaping makes fpdf2's line-breaking ~3x slower
# (it re-shapes the whole string on every width probe), so keep it off.
_SHAPING_SCRIPTS = {
    "si",
    "hi",
    "my",
    "km",
    "be",
    "gm",
    "tt",
    "gj",
    "te",
    "ka",
    "mm",
    "br",
    "tb",
}

# OpenType script tags for HarfBuzz (used for text shaping)
_SCRIPT_OT_TAGS = {
    "ro": ("latn", "eng"),
    "si": ("sinh", "sin"),
    "hi": ("dev2", "hin"),
    "th": ("thai", "tha"),
    "lo": ("lao ", "lao"),
    "my": ("mymr", "mya"),
    "km": ("khmr", "khm"),
    "be": ("beng", "ben"),
    "gm": ("guru", "pan"),
    "tt": ("lana", "nod"),
    "gj": ("gjr2", "guj"),
    "te": ("tel2", "tel"),
    "ka": ("knda", "kan"),
    "mm": ("mlym", "mal"),
    "br": ("brah", "san"),
    "tb": ("tibt", "bod"),
    "cy": ("cyrl", "rus"),
}

_FONTS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "fonts")
)


def _trans_script_for_lang(lang_code: str) -> str:
    """Script font for translation text. Falls back to roman."""
    if not lang_code:
        return "ro"
    if lang_code in _SCRIPT_FONTS:
        return lang_code
    return {"my_nissaya": "my"}.get(lang_code, "ro")


# ── Colors (matching the website theme) ─────────────────────────────────
ACCENT = (139, 94, 60)  # #8b5e3c
PALI_C = (124, 45, 18)  # #7c2d12
TRANS_C = (30, 58, 95)  # #1e3a5f
MUTED = (138, 122, 110)  # #8a7a6e
DARK = (45, 36, 32)  # #2d2420


AI_DISCLAIMER = (
    "This translation was produced with AI assistance, using the Sinhala, "
    "Thai, and Myanmar Nissaya translations as references. It has not been "
    "verified by humans and may contain errors. "
    "Please consult a qualified scholar for verification."
)


def build_pdf(book: Book, output_path: str, cover_bytes: bytes = b"") -> str:
    """Build a PDF from the Book data using fpdf2 + HarfBuzz."""
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    pdf = _PDF(book)
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()

    # Cover (page 1). Bookmarks from start_section() remain in the
    # PDF outline, so no visible Table of Contents page is needed.
    cover_ok = False
    if cover_bytes:
        try:
            from PIL import Image as PILImage

            pil = PILImage.open(BytesIO(cover_bytes))
            pw, ph = pil.size
            page_w = pdf.w - pdf.l_margin - pdf.r_margin
            page_h = pdf.h - pdf.t_margin - pdf.b_margin
            ratio = min(page_w / pw, page_h / ph)
            pdf.image(
                BytesIO(cover_bytes),
                x=pdf.l_margin,
                y=pdf.t_margin,
                w=pw * ratio,
                h=ph * ratio,
            )
            cover_ok = True
        except Exception:
            _add_text_cover(pdf, book)
    else:
        _add_text_cover(pdf, book)

    if cover_ok:
        pdf.add_page()
        _add_title_page(pdf, book)

    pdf.add_page()
    vcounter = VariantCounter()

    # Intro
    if book.intro_sentences:
        intro_title = book.book_name or book.english_name
        _add_section_heading(pdf, intro_title)
        intro_notes: list[tuple[int, str]] = []
        for s in book.intro_sentences:
            _add_sentence(pdf, s, book.script, vcounter, intro_notes)
        _add_variant_notes(pdf, intro_notes)
        pdf.add_page()

    # Vaggas
    for vagga in book.vagga_sections:
        h = vagga.heading
        title = h.title or str(h.para_id)
        _add_section_heading(pdf, title)
        if vagga.heading_translation:
            _add_translation_text(pdf, vagga.heading_translation)

        vagga_notes: list[tuple[int, str]] = []
        for verse in vagga.verses:
            vh = verse.heading
            vtitle = vh.title or str(vh.para_id)
            if vh.para_id != h.para_id:
                _add_verse_heading(pdf, vtitle)
            if verse.heading_translation:
                _add_translation_text(pdf, verse.heading_translation)
            for s in verse.sentences:
                _add_sentence(pdf, s, book.script, vcounter, vagga_notes)

        _add_variant_notes(pdf, vagga_notes)

        # Divider between vaggas
        pdf.ln(8)
        pdf.set_font("roman", size=8)
        pdf.set_text_color(*MUTED)
        pdf.cell(0, 5, "· · ·", align="C")
        pdf.ln(12)

    pdf.output(output_path)
    return output_path


# ── Custom PDF class ────────────────────────────────────────────────────


class _PDF(FPDF):
    """Custom FPDF subclass with HarfBuzz text shaping and font management."""

    # Unicode range → script code, for per-paragraph fallback detection.
    _FALLBACK_RANGES = (
        (0x0D80, 0x0DFF, "si"),
        (0x0900, 0x097F, "hi"),
        (0x0E00, 0x0E7F, "th"),
        (0x0E80, 0x0EFF, "lo"),
        (0x1000, 0x109F, "my"),
        (0x1780, 0x17FF, "km"),
        (0x0980, 0x09FF, "be"),
        (0x0A00, 0x0A7F, "gm"),
        (0x0A80, 0x0AFF, "gj"),
        (0x0C00, 0x0C7F, "te"),
        (0x0C80, 0x0CFF, "ka"),
        (0x0D00, 0x0D7F, "mm"),
        (0x1A20, 0x1AAF, "tt"),
        (0x11000, 0x1107F, "br"),
        (0x0F00, 0x0FFF, "tb"),
    )

    def __init__(self, book: Book):
        super().__init__()
        self._book = book
        self._trans_script = _trans_script_for_lang(book.lang_code)
        self._fonts_registered = False
        self._fallback_key = None
        self._register_fonts()

    def set_fallback_for(self, text: str, main: str = "roman"):
        """Narrow fallback fonts to scripts actually present in `text`.

        A long fallback list makes every width probe scan every font
        per character — keep it to 1-2 families per paragraph. `main`
        is the current font's family (already checked first by fpdf2,
        so it is excluded from the list).
        """
        found = set()
        for ch in text:
            o = ord(ch)
            if o < 0x0900:
                continue
            for lo, hi, code in self._FALLBACK_RANGES:
                if lo <= o <= hi:
                    found.add(code)
                    break
        key = (frozenset(found), main)
        if key == self._fallback_key:
            return
        self._fallback_key = key
        for code in found:
            self._ensure_family(code)
        fams = ["roman"]
        for code in sorted(found):
            fam = _SCRIPT_FONTS.get(code, (None,))[0]
            if fam and fam not in ("roman", main):
                fams.append(fam)
        try:
            self.set_fallback_fonts(fams, exact_match=False)
        except Exception:
            pass

    def _ensure_family(self, s: str):
        """Register regular/bold/italic/bold-italic for one script code.

        No italic files ship with the project, so "I" reuses the
        regular file and "BI" the bold file (upright fallback). Without
        these, markdown italics crash with "Undefined font".
        """
        if s in self._families_registered or s not in _SCRIPT_FONTS:
            return
        css_name, regular, bold = _SCRIPT_FONTS[s]

        def _add(style: str, fname: str):
            if not fname:
                return
            path = os.path.join(_FONTS_DIR, fname)
            if os.path.isfile(path):
                try:
                    self.add_font(css_name, style=style, fname=path)
                except Exception:
                    pass

        _add("", regular)
        _add("B", bold or regular)
        _add("I", regular)
        _add("BI", bold or regular)
        self._families_registered.add(s)

    def _register_fonts(self):
        """Register fonts for the book's script with HarfBuzz shaping."""
        if self._fonts_registered:
            return
        self._fonts_registered = True
        self._families_registered = set()

        script = self._book.script
        for s in set(["ro", script, self._trans_script]):
            self._ensure_family(s)

        # Fallback list starts narrow; set_fallback_for() registers and
        # widens it per paragraph to only the scripts actually present.
        try:
            self.set_fallback_fonts(["roman"], exact_match=False)
        except Exception:
            pass
        self._fallback_key = frozenset()

    def _set_pali_font(self, script: str, size: int = 11):
        """Set font for Pāli text with HarfBuzz shaping enabled."""
        self._set_script_font(script, size=size, bold=False)

    def _set_pali_bold(self, script: str, size: int):
        """Set bold font for Pāli headings with shaping enabled."""
        self._set_script_font(script, size=size, bold=True)

    def _set_trans_font(self, size: int = 9):
        """Set font for translation text (script follows lang_code)."""
        self._set_script_font(self._trans_script, size=size, bold=False)

    def _trans_family(self) -> str:
        return _SCRIPT_FONTS.get(self._trans_script, ("roman",))[0]

    def _set_script_font(self, script: str, size: int, bold: bool = False):
        """Set a script font, falling back to roman if unavailable."""
        css_name = _SCRIPT_FONTS.get(script, ("roman",))[0]
        style = "B" if bold else ""
        try:
            self.set_font(css_name, style=style, size=size)
        except Exception:
            try:
                self.set_font(css_name, size=size)
            except Exception:
                self.set_font("roman", size=size)
                self.set_text_shaping(use_shaping_engine=False)
                return
        if script not in _SHAPING_SCRIPTS:
            self.set_text_shaping(use_shaping_engine=False)
            return
        # Enable HarfBuzz text shaping for complex scripts
        ot_script, ot_lang = _SCRIPT_OT_TAGS.get(script, ("latn", "eng"))
        self.set_text_shaping(
            use_shaping_engine=True, script=ot_script, language=ot_lang
        )

    def _set_roman_font(self, size: int = 10):
        """Set font for Roman/English text (no shaping needed)."""
        self.set_font("roman", size=size)
        self.set_text_shaping(use_shaping_engine=False)

    def _set_roman_bold(self, size: int = 10):
        """Set bold Roman font."""
        self.set_font("roman", style="B", size=size)
        self.set_text_shaping(use_shaping_engine=False)

    def footer(self):
        """Page number footer."""
        self.set_y(-15)
        self.set_font("roman", size=8)
        self.set_text_color(*MUTED)
        self.cell(0, 10, f"— {self.page_no()} —", align="C")


# ── Cover & title page ──────────────────────────────────────────────────


def _centered_cell(pdf: _PDF, w: float, h: float, text: str):
    """Write a centered multi_cell and reset X to left margin after."""
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(w, h, text, align="C")
    pdf.set_x(pdf.l_margin)


def _add_disclaimer(pdf: _PDF, book: Book):
    if not book.lang_code:
        return
    pdf._set_roman_font(8)
    pdf.set_text_color(*MUTED)
    pdf.set_x(pdf.l_margin + 20)
    pdf.multi_cell(
        pdf.w - pdf.l_margin - pdf.r_margin - 40, 5, AI_DISCLAIMER, align="C"
    )
    pdf.set_x(pdf.l_margin)
    pdf.ln(8)


def _add_centered_title(pdf: _PDF, book: Book, size: int = 20):
    en = (book.english_name or "").strip()
    bn = (book.book_name or "").strip()
    pdf.set_text_color(*ACCENT)
    if en and bn and en.lower() != bn.lower():
        pdf._set_roman_bold(size)
        _centered_cell(pdf, 0, 10, en)
        pdf._set_pali_bold(pdf._book.script, size)
        _centered_cell(pdf, 0, 10, f"({bn})")
    else:
        title = en or bn
        if bn and not en:
            pdf._set_pali_bold(pdf._book.script, size)
        else:
            pdf._set_roman_bold(size)
        _centered_cell(pdf, 0, 10, title)


def _add_text_cover(pdf: _PDF, book: Book):
    """Text-based cover page when no cover image."""
    pdf.ln(60)
    _add_centered_title(pdf, book)
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
        _centered_cell(pdf, 0, 6, f"{book.lang_name} Translation")
        pdf.ln(3)

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + "…"
        pdf._set_roman_font(8)
        pdf.set_text_color(107, 114, 128)
        pdf.set_x(pdf.l_margin + 30)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin - 60, 5, desc, align="C")
        pdf.set_x(pdf.l_margin)
        pdf.ln(8)

    _add_disclaimer(pdf, book)

    pdf._set_roman_font(9)
    pdf.set_text_color(*MUTED)
    _centered_cell(pdf, 0, 5, "Chattha Sangayana Tipiṭaka")
    pdf.ln(2)
    _centered_cell(pdf, 0, 5, "epitaka.org")


def _add_title_page(pdf: _PDF, book: Book):
    """Standalone title page."""
    pdf.ln(60)
    _add_centered_title(pdf, book)
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
        _centered_cell(pdf, 0, 6, f"{book.lang_name} Translation")
        pdf.ln(3)

    if book.description:
        desc = book.description
        if len(desc) > 200:
            desc = desc[:200] + "…"
        pdf._set_roman_font(8)
        pdf.set_text_color(107, 114, 128)
        pdf.set_x(pdf.l_margin + 30)
        pdf.multi_cell(pdf.w - pdf.l_margin - pdf.r_margin - 60, 5, desc, align="C")
        pdf.set_x(pdf.l_margin)
        pdf.ln(8)

    _add_disclaimer(pdf, book)

    pdf._set_roman_font(9)
    pdf.set_text_color(*MUTED)
    _centered_cell(pdf, 0, 5, "Chattha Sangayana Tipiṭaka")
    pdf.ln(2)
    _centered_cell(pdf, 0, 5, "epitaka.org")


# ── Content helpers ─────────────────────────────────────────────────────


def _add_section_heading(pdf: _PDF, title: str):
    """Add a major section heading (vagga)."""
    plain = _strip_html(title)
    pdf.ln(10)
    pdf.start_section(plain, level=0)
    pdf._set_pali_bold(pdf._book.script, 13)
    pdf.set_text_color(*ACCENT)
    pdf.set_fallback_for(plain, _SCRIPT_FONTS.get(pdf._book.script, ("roman",))[0])
    pdf.multi_cell(0, 7, plain, align="C")
    pdf.set_x(pdf.l_margin)
    pdf.ln(3)


def _add_verse_heading(pdf: _PDF, title: str):
    """Add a verse/sub-section heading."""
    plain = _strip_html(title)
    pdf.ln(6)
    pdf.start_section(plain, level=1)
    pdf._set_pali_bold(pdf._book.script, 10)
    pdf.set_text_color(*ACCENT)
    pdf.set_fallback_for(plain, _SCRIPT_FONTS.get(pdf._book.script, ("roman",))[0])
    pdf.multi_cell(0, 5, plain, align="C")
    pdf.set_x(pdf.l_margin)
    pdf.ln(2)


def _add_sentence(pdf: _PDF, s, script: str, vcounter, notes):
    """Add a single sentence (pali + translation) to the PDF."""
    if s.vripage:
        pdf._set_roman_font(7)
        pdf.set_text_color(*MUTED)
        pdf.cell(0, 4, f"— VRI page {s.vripage} —", align="L")
        pdf.set_x(pdf.l_margin)
        pdf.ln(5)

    if s.pali:
        parts = []
        for kind, val in tokenize_pali_variants(s.pali):
            if kind == "text":
                parts.append(val)
            else:
                num = vcounter.take()
                notes.append((num, clean_variant_note(val)))
                parts.append(f"[{num}]")
        pali = unicodedata.normalize("NFC", _strip_html("".join(parts)))
        pdf._set_pali_font(script)
        pdf.set_text_color(*PALI_C)
        pdf.set_fallback_for(pali, _SCRIPT_FONTS.get(script, ("roman",))[0])
        pdf.multi_cell(0, 6, pali)
        pdf.set_x(pdf.l_margin)
        pdf.ln(1)

    if s.translation:
        pdf._set_trans_font(9)
        pdf.set_text_color(*TRANS_C)
        trans = _to_markdown(s.translation)
        pdf.set_fallback_for(trans, pdf._trans_family())
        pdf.multi_cell(0, 5, trans, markdown=True)
        pdf.set_x(pdf.l_margin)
        pdf.ln(3)


def _add_translation_text(pdf: _PDF, text: str):
    """Add a translation text line (e.g. section translation)."""
    pdf._set_trans_font(9)
    pdf.set_text_color(*TRANS_C)
    md = _to_markdown(text)
    pdf.set_fallback_for(md, pdf._trans_family())
    pdf.multi_cell(0, 5, md, markdown=True)
    pdf.set_x(pdf.l_margin)
    pdf.ln(3)


def _add_variant_notes(pdf: _PDF, notes):
    """List collected variant readings as numbered footnotes."""
    if not notes:
        return
    pdf.ln(4)
    pdf._set_pali_font(pdf._book.script, 8)
    pdf.set_text_color(*MUTED)
    for num, note in notes:
        pdf.multi_cell(0, 4, f"[{num}] {note}")
        pdf.set_x(pdf.l_margin)
    pdf.ln(2)


# ── Helpers ─────────────────────────────────────────────────────────────


def _pdf_title(book):
    en = (book.english_name or "").strip()
    bn = (book.book_name or "").strip()
    if en and bn and en.lower() != bn.lower():
        return f"{en} ({bn})"
    return en or bn


def _strip_html(text):
    """Strip HTML tags, return plain text."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def _to_markdown(text):
    """Convert stored HTML to fpdf2 markdown (**bold**, __italics__).

    fpdf2's multi_cell does not parse HTML — raw <i>/<b> tags would
    print literally — so translate them to markdown and render with
    markdown=True.
    """
    if not text:
        return ""
    text = re.sub(r"</?(?:div|p|br|ul|ol|li|h[1-6])\b[^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"</?(?:b|strong)\b[^>]*>", "**", text, flags=re.I)
    text = re.sub(r"</?(?:i|em)\b[^>]*>", "__", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()

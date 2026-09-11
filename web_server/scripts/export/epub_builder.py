"""
epub_builder.py — Generate EPUB 3 files from Book data.

Uses ebooklib to create a standards-compliant EPUB 3 with:
- Proper metadata
- Hierarchical TOC (vaggas with verse sub-items)
- CSS styling for bilingual reading with script-appropriate fonts
- Cover image
- VRI page markers
- HTML tag preservation (<b>, <i>, etc.)
"""

import os
import re

from ebooklib import epub

from .data_loader import (
    Book,
    VaggaSection,
    VariantCounter,
    clean_variant_note,
    tokenize_pali_variants,
)


# ── Font mapping: script code → (css_font_name, font_filename) ──────────
# Matches the website's @font-face declarations in common.css.
_SCRIPT_FONTS = {
    "ro": ("roman", "NotoSans-Regular.ttf"),
    "si": ("sinhala", "NotoSansSinhala-Regular.ttf"),
    "hi": ("devanagari", "NotoSansDevanagari-Regular.ttf"),
    "th": ("thai", "thai/NotoSansThai-Regular.ttf"),
    "lo": ("lao", "lao/NotoSansLao-Regular.ttf"),
    "my": ("myanmar", "myanmar/NotoSansMyanmar-Regular.ttf"),
    "km": ("khmer", "NotoSansKhmer-Regular.ttf"),
    "be": ("bengali", "NotoSansBengali-Regular.ttf"),
    "gm": ("gurmukhi", "NotoSansGurmukhi-Regular.ttf"),
    "tt": ("tai tham", "lanna/NotoSansTaiTham-Regular.ttf"),
    "gj": ("gujarati", "NotoSansGujarati-Regular.ttf"),
    "te": ("telugu", "NotoSansTelugu-Regular.ttf"),
    "ka": ("kannada", "NotoSansKannada-Regular.ttf"),
    "mm": ("malayalam", "NotoSansMalayalam-Regular.ttf"),
    "br": ("brahmi", "NotoSansBrahmi-Regular.ttf"),
    "tb": ("tibetan", "tibetian/NotoSansTibetan-Regular.ttf"),
    "cy": ("cyrillic", "NotoSans-Regular.ttf"),
}

_FONTS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "fonts")
)


def _trans_script_for_lang(lang_code: str) -> str:
    if not lang_code:
        return "ro"
    if lang_code in _SCRIPT_FONTS:
        return lang_code
    return {"my_nissaya": "my"}.get(lang_code, "ro")


def build_epub(book: Book, output_path: str, cover_bytes: bytes = b"") -> str:
    ebook = epub.EpubBook()

    lang = book.lang_code or "pi"
    ebook.set_identifier(f"epitaka-{book.book_id}-{lang}")
    ebook.set_title(_epub_title(book))
    ebook.set_language(lang)
    ebook.add_metadata("DC", "language", book.lang_code or "pi")
    ebook.add_metadata("DC", "language", book.script)
    ebook.add_author("Chattha Sangayana Tipitaka")
    if cover_bytes:
        ebook.add_metadata("OPF", "cover", "cover-image", {"name": "cover"})
    ebook.add_metadata("DC", "subject", "Buddhism")
    ebook.add_metadata("DC", "subject", "Pali Canon")
    if book.sub_nikaya:
        ebook.add_metadata("DC", "subject", book.sub_nikaya)
    ebook.add_metadata("DC", "description", _epub_description(book))
    ebook.add_metadata("DC", "publisher", "E-Pitaka (epitaka.org)")
    source = "https://epitaka.org"
    if book.vri_id:
        source += f" (VRI: {book.vri_id})"
    ebook.add_metadata("DC", "source", source)
    ebook.add_metadata("DC", "rights", "Public Domain")
    ebook.add_metadata("DC", "date", "2026")

    if cover_bytes:
        ebook.set_cover("cover.png", cover_bytes, create_page=False)

    trans_script = _trans_script_for_lang(book.lang_code)
    css = epub.EpubItem(
        uid="style",
        file_name="style/default.css",
        media_type="text/css",
        content=_css(book.script, trans_script).encode("utf-8"),
    )
    ebook.add_item(css)
    _embed_fonts(ebook, book.script, trans_script)
    nav = epub.EpubNcx()
    nav.id = "ncx"
    ebook.add_item(nav)
    nav_file = epub.EpubNav()
    nav_file.id = "nav"
    ebook.add_item(nav_file)

    # ── Title page ────────────────────────────────────────────────────
    title_ch = _title_page(book, lang, css)
    title_ch.id = "title_page"
    ebook.add_item(title_ch)

    # ── Chapters ──────────────────────────────────────────────────────
    chapters = []
    vcounter = VariantCounter()

    ch_idx = 0
    if book.intro_sentences:
        chap_notes: list[tuple[int, str]] = []
        ch = _intro_chapter(book, lang, css, vcounter, chap_notes)
        ebook.add_item(ch)
        chapters.append(ch)
        ch_idx += 1

    toc_items = []
    for vagga in book.vagga_sections:
        chap_notes = []
        ch, verse_links = _vagga_chapter(
            vagga, book, lang, css, ch_idx, vcounter, chap_notes
        )
        ebook.add_item(ch)
        chapters.append(ch)
        if verse_links:
            toc_items.append((ch, verse_links))
        else:
            toc_items.append(ch)
        ch_idx += 1

    # ── Table of contents ─────────────────────────────────────────────
    # ebooklib expects TOC entries as:
    #   - epub.Link (flat entry)
    #   - epub.EpubHtml (flat entry)
    #   - tuple (section_link, [child_links]) for nested entries
    ebook.toc = [epub.Link("chap_title.xhtml", "Title Page", "title")]
    for item in toc_items:
        if isinstance(item, tuple):
            ch, verse_links = item
            ch_id = ch.id if hasattr(ch, "id") else ""
            section_link = epub.Link(ch.file_name, ch.title[:80], ch_id)
            child_links = [epub.Link(v.href, v.title, v.uid) for v in verse_links]
            ebook.toc.append((section_link, child_links))
        else:
            ch_id = item.id if hasattr(item, "id") else getattr(item, "uid", "")
            ebook.toc.append(epub.Link(item.file_name, item.title[:80], ch_id))

    # ── Spine ─────────────────────────────────────────────────────────
    spine_items = ["nav", title_ch]
    spine_items.extend(chapters)
    ebook.spine = spine_items

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    epub.write_epub(output_path, ebook)
    return output_path


# ── Chapter builders ────────────────────────────────────────────────────


def _title_page(book, lang, css):
    title = _epub_title(book)
    parts = []
    parts.append('<div class="title-page">')
    parts.append(f'<h1 class="book-title">{_h(book.book_name)}</h1>')
    if book.english_name and book.english_name.lower() != book.book_name.lower():
        parts.append(f'<p class="book-subtitle">{_h(book.english_name)}</p>')
    parts.append('<div class="title-divider"></div>')
    if book.sub_nikaya:
        parts.append(f'<p class="book-lang">{_h(book.sub_nikaya)}</p>')
    elif book.nikaya:
        parts.append(f'<p class="book-lang">{_h(book.nikaya)}</p>')
    if book.lang_name:
        parts.append(f'<p class="book-lang">{_h(book.lang_name)} Translation</p>')
    if book.description:
        parts.append(f'<p class="book-description">{_h(book.description)}</p>')
    parts.append(f'<p class="book-publisher">Chattha Sangayana Tipiṭaka</p>')
    parts.append(f'<p class="book-source">epitaka.org</p>')
    parts.append("</div>")
    ch = epub.EpubHtml(title=title, file_name="chap_title.xhtml", lang=lang)
    ch.content = "\n".join(parts)
    ch.add_item(css)
    return ch


def _intro_chapter(book, lang, css, vcounter, chap_notes):
    ch = epub.EpubHtml(title="Introduction", file_name="chap_intro.xhtml", lang=lang)
    ch.id = "chap_intro"
    body = ["<h2>Introduction</h2>"]
    for s in book.intro_sentences:
        body.append(_sentence_html(s, vcounter, chap_notes, "intro"))
    body.append(_footnotes_html(chap_notes, "intro"))
    ch.content = "\n".join(body)
    ch.add_item(css)
    return ch


def _vagga_chapter(vagga, book, lang, css, idx, vcounter, chap_notes):
    title = vagga.heading.title or f"Section {idx}"
    fname = f"chap_{idx:03d}.xhtml"
    ch = epub.EpubHtml(title=title, file_name=fname, lang=lang)
    ch.id = f"chap_{idx:03d}"
    body = [f'<h2 class="section-heading">{_h(title)}</h2>']
    if vagga.heading_translation:
        body.append(f'<p class="section-translation">{vagga.heading_translation}</p>')

    verse_links = []
    for vi, verse in enumerate(vagga.verses):
        vid = f"v_{idx}_{vi}"
        vtitle = verse.heading.title or f"Verse {vi + 1}"
        body.append(f'<h3 class="verse-heading" id="{vid}">{_h(vtitle)}</h3>')
        if verse.heading_translation:
            body.append(
                f'<p class="section-translation">{verse.heading_translation}</p>'
            )
        body.append('<div class="verse-block">')
        for s in verse.sentences:
            body.append(_sentence_html(s, vcounter, chap_notes, f"c{idx}"))
        body.append("</div>")
        verse_link = epub.Link(fname, vtitle, vid)
        verse_links.append(verse_link)

    body.append(_footnotes_html(chap_notes, f"c{idx}"))
    ch.content = "\n".join(body)
    ch.add_item(css)
    return ch, verse_links


def _sentence_html(s, vcounter, chap_notes, chap_key):
    parts = []
    if s.vripage:
        parts.append(f'<span class="vri-page-marker">— VRI page {s.vripage} —</span>')
    if s.pali:
        parts.append(
            f'<div class="sentence-row"><span class="pali-text">'
            f"{_pali_with_notes(s.pali, vcounter, chap_notes, chap_key)}</span></div>"
        )
    if s.translation:
        parts.append(
            f'<div class="sentence-row"><span class="translation-text">{s.translation}</span></div>'
        )
    return "\n".join(parts)


def _pali_with_notes(pali, vcounter, chap_notes, chap_key):
    """Pāli HTML with bracketed variants replaced by footnote markers."""
    out = []
    for kind, val in tokenize_pali_variants(pali):
        if kind == "text":
            out.append(val)
        else:
            num = vcounter.take()
            chap_notes.append((num, clean_variant_note(val)))
            out.append(
                f'<sup class="variant-marker">'
                f'<a href="#fn{chap_key}-{num}" id="rfn{chap_key}-{num}">{num}</a>'
                f"</sup>"
            )
    return "".join(out)


def _footnotes_html(chap_notes, chap_key):
    if not chap_notes:
        return ""
    items = [
        f'<li id="fn{chap_key}-{num}">{_h(note)} '
        f'<a href="#rfn{chap_key}-{num}" class="footnote-back">↩</a></li>'
        for num, note in chap_notes
    ]
    return '<div class="footnotes"><hr/><ol>\n' + "\n".join(items) + "\n</ol></div>"


# ── Metadata helpers ────────────────────────────────────────────────────


def _epub_title(book):
    en = (book.english_name or "").strip()
    bn = (book.book_name or "").strip()
    if en and bn and en.lower() != bn.lower():
        return f"{en} ({bn})"
    return en or bn


def _epub_description(book):
    # Prefer the DB description if available
    if book.description:
        return book.description
    parts = [book.book_name]
    if book.english_name and book.english_name.lower() != book.book_name.lower():
        parts.append(f"({book.english_name})")
    if book.nikaya:
        parts.append(f"— {book.nikaya}")
    if book.lang_name:
        parts.append(f"with {book.lang_name} translation")
    parts.append("from the Chattha Sangayana Tipitaka.")
    return " ".join(parts)


def _h(text):
    return (
        (text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


# ── Font embedding ──────────────────────────────────────────────────────


def _embed_fonts(ebook, script, trans_script="ro"):
    """Embed the script-appropriate font file in the EPUB.

    Always embed the Roman (Noto Sans) font as a fallback, plus the
    Pāli script font and the translation-language font when available.
    Without the translation font, e.g. Lao translations render as tofu.
    """
    fonts_to_embed = set()
    fonts_to_embed.add(_SCRIPT_FONTS["ro"])  # always include Roman fallback
    for s in {script, trans_script}:
        if s in _SCRIPT_FONTS and s != "ro":
            fonts_to_embed.add(_SCRIPT_FONTS[s])

    for css_name, filename in fonts_to_embed:
        path = os.path.join(_FONTS_DIR, filename)
        if os.path.isfile(path):
            media_type = "font/woff" if filename.endswith(".woff") else "font/truetype"
            uid = f"font-{css_name.replace(' ', '-')}"
            with open(path, "rb") as f:
                item = epub.EpubItem(
                    uid=uid,
                    file_name=f"fonts/{filename}",
                    media_type=media_type,
                    content=f.read(),
                )
                ebook.add_item(item)


# ── CSS ─────────────────────────────────────────────────────────────────


def _css(script: str, trans_script: str = "ro") -> str:
    """Generate EPUB stylesheet with @font-face for all relevant fonts.

    Uses the same font-family names as the website (common.css) so
    readers that support @font-face will render each script correctly.
    """
    # Build @font-face declarations for the fonts we embed
    font_faces = _build_font_faces([script, trans_script])
    pali_font = _SCRIPT_FONTS.get(script, ("roman",))[0]
    trans_font = _SCRIPT_FONTS.get(trans_script, ("roman",))[0]

    return f"""\
@charset "utf-8";

/* ── Font declarations ─────────────────────────────────────────── */
{font_faces}

/* ── Base ───────────────────────────────────────────────────────── */
body {{
  font-family: 'roman', 'Noto Sans', Verdana, sans-serif;
  line-height: 1.7;
  margin: 1em;
  color: #2d2420;
}}
.pali-text {{
  font-family: '{pali_font}', 'roman', 'Noto Sans', Verdana, sans-serif;
  color: #7c2d12;
  font-size: 1.05em;
  line-height: 1.7;
}}
.translation-text {{
  font-family: '{trans_font}', 'roman', 'Noto Sans', Verdana, sans-serif;
  font-size: 0.95em;
  color: #1e3a5f;
  line-height: 1.5;
  margin-top: 0.15em;
  padding-left: 0.8em;
}}
.section-translation {{
  font-family: '{trans_font}', 'roman', 'Noto Sans', Verdana, sans-serif;
}}

/* ── Script-specific Pāli font ─────────────────────────────────── */
.book-title {{
  font-family: '{pali_font}', 'roman', serif;
}}

/* ── VRI page marker (right-aligned chip) ──────────────────────── */
.vri-page-marker {{
  display: block;
  text-align: right;
  margin: 1.5em 0 .5em auto;
  padding: .3em .65em;
  width: fit-content;
  border: 1px solid #d4a97a;
  border-radius: 999px;
  color: #8a7a6e;
  font: .75em sans-serif;
}}

/* ── Title page ────────────────────────────────────────────────── */
.title-page {{ text-align: center; padding-top: 25%; }}
.book-title {{ font-size: 1.8em; font-weight: bold; margin-bottom: 0.3em; }}
.book-subtitle {{ font-size: 1.1em; color: #8a7a6e; }}
.book-lang {{ font-size: 0.9em; color: #8b5e3c; }}
.book-description {{ font-size: 0.85em; color: #6b7280; font-style: italic; margin: 1em 2em; line-height: 1.5; }}
.title-divider {{ width: 40%; margin: 2em auto; border-top: 2px solid #d4a97a; }}
.book-publisher, .book-source {{ font-size: 0.9em; color: #8a7a6e; margin-top: 1em; }}

/* ── Headings ──────────────────────────────────────────────────── */
.section-heading {{
  font-family: '{pali_font}', 'roman', 'Noto Sans', Verdana, sans-serif;
  font-size: 1.4em;
  font-weight: bold;
  text-align: center;
  margin: 1.2em 0 0.4em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e8e0d5;
  color: #8b5e3c;
}}
.verse-heading {{
  font-family: '{pali_font}', 'roman', 'Noto Sans', Verdana, sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  text-align: center;
  margin: 1.5em 0 0.3em;
  color: #8b5e3c;
}}
.section-translation {{
  font-style: italic;
  text-align: center;
  color: #1e3a5f;
  font-size: 0.9em;
  margin-bottom: 0.8em;
}}

/* ── Verse / sentence blocks ───────────────────────────────────── */
.verse-block {{ margin-bottom: 2.5em; padding-bottom: 1.5em; }}
.sentence-row {{ margin-bottom: 0.6em; padding: 0.15em 0; }}

/* ── Inline markup ─────────────────────────────────────────────── */
.pali-text b, .pali-text strong {{ font-weight: bold; }}
.pali-text i, .pali-text em {{ font-style: italic; }}
.translation-text i, .translation-text em {{ font-style: italic; }}
.pali-text sup {{ font-size: 0.7em; vertical-align: super; }}

/* ── Variant footnotes ───────────────────────────────────────── */
.variant-marker a {{
  color: #8b5e3c;
  text-decoration: none;
}}
.footnotes {{
  margin-top: 2em;
  font-size: 0.85em;
  color: #6b7280;
}}
.footnotes hr {{ border: none; border-top: 1px solid #e8e0d5; }}
.footnotes ol {{ margin-left: 1.2em; }}
.footnote-back {{ text-decoration: none; color: #8b5e3c; }}
"""


def _build_font_faces(target_scripts) -> str:
    """Build @font-face CSS for the target scripts + Roman fallback."""
    if isinstance(target_scripts, str):
        target_scripts = [target_scripts]
    faces = []
    seen = set()

    for script in ["ro", *target_scripts]:
        if script not in _SCRIPT_FONTS or script in seen:
            continue
        seen.add(script)
        css_name, filename = _SCRIPT_FONTS[script]
        path = os.path.join(_FONTS_DIR, filename)
        if not os.path.isfile(path):
            continue
        fmt = "woff" if filename.endswith(".woff") else "truetype"
        faces.append(
            f"@font-face {{ src: url('../fonts/{filename}') format('{fmt}'); "
            f"font-weight: normal; font-family: '{css_name}'; }}"
        )

    return "\n".join(faces)

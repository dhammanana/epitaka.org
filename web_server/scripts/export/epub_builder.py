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

from .data_loader import Book, VaggaSection


# ── Font mapping: script code → (css_font_name, font_filename) ──────────
# Matches the website's @font-face declarations in common.css.
_SCRIPT_FONTS = {
    'ro':  ('roman',              'NotoSerif-Regular.ttf'),
    'si':  ('sinhala',            'NotoSerifSinhala-Regular.ttf'),
    'hi':  ('devanagari',         'NotoSerifDevanagari-Regular.ttf'),
    'th':  ('thai',               'thai/THSarabunPali.ttf'),
    'lo':  ('lao',                'lao/LaoPaliAlpha-Regular.woff'),
    'my':  ('myanmar',            'myanmar/mm3-multi-os(16-08-2011).ttf'),
    'km':  ('khmer',              'NotoSerifKhmer-Regular.ttf'),
    'be':  ('bengali',            'NotoSerifBengali-Regular.ttf'),
    'gm':  ('gurmukhi',           'NotoSansGurmukhi-Regular.ttf'),
    'tt':  ('tai tham',           'lanna/Hariphunchai.otf'),
    'gj':  ('gujarati',           'NotoSerifGujarati-Regular.ttf'),
    'te':  ('telugu',             'NotoSerifTelugu-Regular.ttf'),
    'ka':  ('kannada',            'NotoSerifKannada-Regular.ttf'),
    'mm':  ('malayalam',          'NotoSerifMalayalam-Regular.ttf'),
    'br':  ('brahmi',             'NotoSansBrahmi-Regular.ttf'),
    'tb':  ('tibetan',            'tibetian/NotoSansTibetan-Regular.ttf'),
    'cy':  ('cyrillic',           'NotoSerif-Regular.ttf'),
}

_FONTS_DIR = os.path.normpath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'fonts'
))


def build_epub(book: Book, output_path: str, cover_bytes: bytes = b'') -> str:
    ebook = epub.EpubBook()

    lang = book.lang_code or 'pi'
    ebook.set_identifier(f'epitaka-{book.book_id}-{lang}')
    ebook.set_title(_epub_title(book))
    ebook.set_language(lang)
    ebook.add_metadata('DC', 'language', book.lang_code or 'pi')
    ebook.add_metadata('DC', 'language', book.script)
    ebook.add_author('Chattha Sangayana Tipitaka')
    if cover_bytes:
        ebook.add_metadata('OPF', 'cover', 'cover-image', {'name': 'cover'})
    ebook.add_metadata('DC', 'subject', 'Buddhism')
    ebook.add_metadata('DC', 'subject', 'Pali Canon')
    ebook.add_metadata('DC', 'description', _epub_description(book))
    ebook.add_metadata('DC', 'publisher', 'E-Pitaka (epitaka.org)')
    ebook.add_metadata('DC', 'source', 'https://epitaka.org')
    ebook.add_metadata('DC', 'rights', 'Public Domain')
    ebook.add_metadata('DC', 'date', '2026')

    if cover_bytes:
        ebook.set_cover('cover.png', cover_bytes, create_page=False)

    css = epub.EpubItem(
        uid='style', file_name='style/default.css',
        media_type='text/css', content=_css(book.script).encode('utf-8'),
    )
    ebook.add_item(css)
    _embed_fonts(ebook, book.script)
    nav = epub.EpubNcx(); nav.id = 'ncx'; ebook.add_item(nav)
    nav_file = epub.EpubNav(); nav_file.id = 'nav'; ebook.add_item(nav_file)

    # ── Title page ────────────────────────────────────────────────────
    title_ch = _title_page(book, lang, css)
    title_ch.id = 'title_page'

    # ── Chapters ──────────────────────────────────────────────────────
    chapters = []

    ch_idx = 0
    if book.intro_sentences:
        ch = _intro_chapter(book, lang, css)
        chapters.append(ch)
        ch_idx += 1

    toc_items = []
    for vagga in book.vagga_sections:
        ch, verse_links = _vagga_chapter(vagga, book, lang, css, ch_idx)
        chapters.append(ch)
        if verse_links:
            toc_items.append((ch, verse_links))
        else:
            toc_items.append(ch)
        ch_idx += 1

    # ── Table of contents ─────────────────────────────────────────────
    ebook.toc = [epub.Link('chap_title.xhtml', 'Title Page', 'title')]
    for item in toc_items:
        if isinstance(item, tuple):
            ch, verse_links = item
            ebook.toc.append(
                epub.Section(ch.title[:80], [
                    epub.Link(v.href, v.title, v.uid) for v in verse_links
                ])
            )
        else:
            # EpubHtml has .id; epub.Link has .uid
            ch_id = item.id if hasattr(item, 'id') else getattr(item, 'uid', '')
            ebook.toc.append(epub.Link(item.file_name, item.title[:80], ch_id))

    # ── Spine ─────────────────────────────────────────────────────────
    spine_items = ['nav', title_ch]
    spine_items.extend(chapters)
    ebook.spine = spine_items

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
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
    if book.nikaya:
        parts.append(f'<p class="book-lang">{_h(book.nikaya)}</p>')
    if book.lang_name:
        parts.append(f'<p class="book-lang">{_h(book.lang_name)} Translation</p>')
    parts.append(f'<p class="book-publisher">Chattha Sangayana Tipiṭaka</p>')
    parts.append(f'<p class="book-source">epitaka.org</p>')
    parts.append('</div>')
    ch = epub.EpubHtml(title=title, file_name='chap_title.xhtml', lang=lang)
    ch.content = '\n'.join(parts)
    ch.add_item(css)
    return ch


def _intro_chapter(book, lang, css):
    ch = epub.EpubHtml(title='Introduction', file_name='chap_intro.xhtml', lang=lang)
    ch.id = 'chap_intro'
    body = ['<h2>Introduction</h2>']
    for s in book.intro_sentences:
        body.append(_sentence_html(s))
    ch.content = '\n'.join(body)
    ch.add_item(css)
    return ch


def _vagga_chapter(vagga, book, lang, css, idx):
    title = vagga.heading.title or f'Section {idx}'
    fname = f'chap_{idx:03d}.xhtml'
    ch = epub.EpubHtml(title=title, file_name=fname, lang=lang)
    ch.id = f'chap_{idx:03d}'
    body = [f'<h2 class="section-heading">{_h(title)}</h2>']
    if vagga.heading_translation:
        body.append(f'<p class="section-translation">{vagga.heading_translation}</p>')

    verse_links = []
    for vi, verse in enumerate(vagga.verses):
        vid = f'v_{idx}_{vi}'
        vtitle = verse.heading.title or f'Verse {vi + 1}'
        body.append(f'<h3 class="verse-heading" id="{vid}">{_h(vtitle)}</h3>')
        if verse.heading_translation:
            body.append(f'<p class="section-translation">{verse.heading_translation}</p>')
        body.append('<div class="verse-block">')
        for s in verse.sentences:
            body.append(_sentence_html(s))
        body.append('</div>')
        verse_link = epub.Link(fname, vtitle, vid)
        verse_links.append(verse_link)

    ch.content = '\n'.join(body)
    ch.add_item(css)
    return ch, verse_links


def _sentence_html(s):
    parts = []
    if s.vripage:
        parts.append(f'<span class="vri-page-marker">— VRI page {s.vripage} —</span>')
    if s.pali:
        parts.append(f'<div class="sentence-row"><span class="pali-text">{s.pali}</span></div>')
    if s.translation:
        parts.append(f'<div class="sentence-row"><span class="translation-text">{s.translation}</span></div>')
    return '\n'.join(parts)


# ── Metadata helpers ────────────────────────────────────────────────────

def _epub_title(book):
    en = book.english_name
    return f'{en} ({book.book_name})' if en and en.lower() != book.book_name.lower() else book.book_name


def _epub_description(book):
    # Prefer the DB description if available
    if book.description:
        return book.description
    parts = [book.book_name]
    if book.english_name and book.english_name.lower() != book.book_name.lower():
        parts.append(f'({book.english_name})')
    if book.nikaya:
        parts.append(f'— {book.nikaya}')
    if book.lang_name:
        parts.append(f'with {book.lang_name} translation')
    parts.append('from the Chattha Sangayana Tipitaka.')
    return ' '.join(parts)


def _h(text):
    return (text or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


# ── Font embedding ──────────────────────────────────────────────────────

def _embed_fonts(ebook, script):
    """Embed the script-appropriate font file in the EPUB.

    Always embed the Roman (Noto Serif) font as a fallback, plus the
    target script font when available.
    """
    fonts_to_embed = set()
    fonts_to_embed.add(_SCRIPT_FONTS['ro'])  # always include Roman fallback
    if script in _SCRIPT_FONTS and script != 'ro':
        fonts_to_embed.add(_SCRIPT_FONTS[script])

    for css_name, filename in fonts_to_embed:
        path = os.path.join(_FONTS_DIR, filename)
        if os.path.isfile(path):
            media_type = 'font/woff' if filename.endswith('.woff') else 'font/truetype'
            uid = f'font-{css_name.replace(" ", "-")}'
            with open(path, 'rb') as f:
                item = epub.EpubItem(
                    uid=uid,
                    file_name=f'fonts/{filename}',
                    media_type=media_type,
                    content=f.read(),
                )
                ebook.add_item(item)


# ── CSS ─────────────────────────────────────────────────────────────────

def _css(script: str) -> str:
    """Generate EPUB stylesheet with @font-face for all relevant fonts.

    Uses the same font-family names as the website (common.css) so
    readers that support @font-face will render each script correctly.
    """
    # Build @font-face declarations for the fonts we embed
    font_faces = _build_font_faces(script)
    body_class = f'body.script-{script}'

    return f'''\
@charset "utf-8";

/* ── Font declarations ─────────────────────────────────────────── */
{font_faces}

/* ── Base ───────────────────────────────────────────────────────── */
body {{
  font-family: 'roman', 'Noto Serif', Georgia, serif;
  line-height: 1.7;
  margin: 1em;
  color: #2d2420;
}}
.pali-text {{
  font-family: 'roman', 'Noto Serif', Georgia, serif;
  color: #7c2d12;
  font-size: 1.05em;
  line-height: 1.7;
}}
.translation-text {{
  font-family: 'roman', 'Noto Serif', Georgia, serif;
  font-size: 0.95em;
  color: #1e3a5f;
  line-height: 1.5;
  margin-top: 0.15em;
  padding-left: 0.8em;
}}

/* ── Script-specific Pāli font ─────────────────────────────────── */
{body_class} .pali-text,
{body_class} .book-title {{
  font-family: '{_SCRIPT_FONTS.get(script, ('roman',))[0]}', 'roman', serif;
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
.title-divider {{ width: 40%; margin: 2em auto; border-top: 2px solid #d4a97a; }}
.book-publisher, .book-source {{ font-size: 0.9em; color: #8a7a6e; margin-top: 1em; }}

/* ── Headings ──────────────────────────────────────────────────── */
.section-heading {{
  font-size: 1.4em;
  font-weight: bold;
  margin: 1.2em 0 0.4em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e8e0d5;
  color: #8b5e3c;
}}
.verse-heading {{
  font-size: 1.1em;
  font-weight: 600;
  margin: 1.5em 0 0.3em;
  color: #8b5e3c;
}}
.section-translation {{
  font-style: italic;
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
'''


def _build_font_faces(target_script: str) -> str:
    """Build @font-face CSS for the target script + Roman fallback."""
    faces = []
    seen = set()

    for script in ['ro', target_script]:
        if script not in _SCRIPT_FONTS or script in seen:
            continue
        seen.add(script)
        css_name, filename = _SCRIPT_FONTS[script]
        path = os.path.join(_FONTS_DIR, filename)
        if not os.path.isfile(path):
            continue
        fmt = 'woff' if filename.endswith('.woff') else 'truetype'
        faces.append(
            f"@font-face {{ src: url('../fonts/{filename}') format('{fmt}'); "
            f"font-weight: normal; font-family: '{css_name}'; }}"
        )

    return '\n'.join(faces)

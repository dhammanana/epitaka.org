"""
data_loader.py — Load book data from SQLite databases.

Reads the original Pāli text from epitaka.db and joins translations
from epitaka_<lang>.db.  Returns structured data ready for all four
export formats (EPUB, PDF, Markdown, DOCX).

Key design decisions:
- Headings are grouped hierarchically: level-2 vagga headings contain
  their child level-10 verse headings as sub-sections.
- HTML tags (<b>, <i>, <sup>, etc.) in the text are preserved for
  output formats that support them (EPUB, PDF, DOCX).
- VRI page numbers mark actual page breaks in the VRI edition.
- Script conversion delegates to the web app's pali-script.js via
  a Node.js subprocess, ensuring identical transliteration.
"""
import os
import re
import shutil
import sqlite3
import subprocess
from dataclasses import dataclass, field


# ── English book names (matches seo.py BOOK_NAMES) ──────────────────────
BOOK_NAMES_EN = {
    'Vin': 'Vinaya Piṭaka',
    'D': 'Dīgha Nikāya', 'D-i': 'Dīgha Nikāya', 'D-ii': 'Dīgha Nikāya', 'D-iii': 'Dīgha Nikāya',
    'M': 'Majjhima Nikāya', 'M-i': 'Majjhima Nikāya', 'M-ii': 'Majjhima Nikāya', 'M-iii': 'Majjhima Nikāya',
    'S': 'Saṃyutta Nikāya', 'S-i': 'Saṃyutta Nikāya', 'S-ii': 'Saṃyutta Nikāya',
    'S-iii': 'Saṃyutta Nikāya', 'S-iv': 'Saṃyutta Nikāya', 'S-v': 'Saṃyutta Nikāya',
    'A': 'Aṅguttara Nikāya', 'A-i': 'Aṅguttara Nikāya', 'A-ii': 'Aṅguttara Nikāya',
    'A-iii': 'Aṅguttara Nikāya', 'A-iv': 'Aṅguttara Nikāya', 'A-v': 'Aṅguttara Nikāya',
    'KN': 'Khuddaka Nikāya',
    'Khp': 'Khuddakapāṭha', 'Dhp': 'Dhammapada', 'Ud': 'Udāna', 'It': 'Itivuttaka',
    'Sn': 'Sutta Nipāta', 'Vv': 'Vimānavatthu', 'Pv': 'Petavatthu',
    'Th': 'Theragāthā', 'Thī': 'Therīgāthā', 'Ap': 'Apadāna', 'Bv': 'Buddhavaṃsa',
    'Cp': 'Cariyāpiṭaka', 'Ja': 'Jātaka', 'Netti': 'Nettippakaraṇa',
    'Pe': 'Peṭakopadesa', 'Mil': 'Milindapañha',
    'Dhs': 'Dhammasaṅgaṇī', 'Vibh': 'Vibhaṅga', 'Dhatuk': 'Dhātukathā',
    'Pp': 'Puggalapaññatti', 'Kv': 'Kathāvatthu', 'Yam': 'Yamaka', 'Patth': 'Paṭṭhāna',
}


@dataclass
class Sentence:
    """One line of text (Pāli + optional translation)."""
    book_id: str
    para_id: int
    line_id: int
    pali: str = ''           # may contain <b>, <i>, <sup> etc.
    translation: str = ''    # may contain <i> etc.
    vripage: str = ''        # VRI page number (triggers page break)


@dataclass
class Heading:
    """A structural heading within a book."""
    book_id: str
    para_id: int
    level: int
    title: str
    chapter_len: int
    parent: int = -1
    sc_id: str = ''


@dataclass
class VerseSection:
    """One verse or sub-section under a vagga heading."""
    heading: Heading
    sentences: list[Sentence] = field(default_factory=list)
    heading_translation: str = ''


@dataclass
class VaggaSection:
    """A major section (vagga/chapter) containing verses."""
    heading: Heading
    verses: list[VerseSection] = field(default_factory=list)
    heading_translation: str = ''


@dataclass
class Book:
    """Complete book data ready for export."""
    book_id: str
    book_name: str           # Pāli name from DB
    english_name: str        # derived English name
    description: str         # from books.description column
    category: str
    nikaya: str
    sub_nikaya: str
    lang_code: str           # translation language code
    lang_name: str           # e.g. "English"
    script: str = 'ro'       # Pāli destination script
    vagga_sections: list[VaggaSection] = field(default_factory=list)
    intro_sentences: list[Sentence] = field(default_factory=list)  # before first heading
    total_sentences: int = 0


# ── Script conversion via Node.js pali-script.js ────────────────────────
#
# The web app uses frontend/src/pali-script.js for all transliteration.
# Rather than duplicating that logic in Python, we call it via a small
# Node.js wrapper (convert_pali.mjs) that reads lines from stdin and
# writes converted lines to stdout.
#
# HTML tags in the Pāli text (<b>, <i>, <sup>, etc.) must be protected
# during conversion.  We replace them with Unicode Private Use Area
# characters (U+E000–U+E00F) that the JS converter won't touch, then
# restore them after.

_TAG_PLACEHOLDERS = {
    '<b>': '\ue001', '</b>': '\ue002',
    '<i>': '\ue003', '</i>': '\ue004',
    '<sup>': '\ue005', '</sup>': '\ue006',
    '<sub>': '\ue007', '</sub>': '\ue008',
    '<br>': '\ue009', '<br/>': '\ue00a', '<br />': '\ue00a',
}
_TAG_RESTORE = {v: k for k, v in _TAG_PLACEHOLDERS.items()}

# Regex to match any HTML tag not in the placeholder map
_HTML_TAG_RE = re.compile(r'<[^>]+>')


def _protect_tags(text: str) -> str:
    """Replace known HTML tags with PUA placeholders, unknown with ⍰."""
    for tag, ph in _TAG_PLACEHOLDERS.items():
        text = text.replace(tag, ph)
    # Handle any remaining HTML tags (case-insensitive variants, attributes)
    text = _HTML_TAG_RE.sub('\ue00f', text)
    return text


def _restore_tags(text: str) -> str:
    """Restore PUA placeholders back to HTML tags."""
    for ph, tag in _TAG_RESTORE.items():
        text = text.replace(ph, tag)
    # Remove any remaining unknown-tag placeholders
    text = text.replace('\ue00f', '')
    return text


# Cache the Node.js converter path
_CONVERTER_SCRIPT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 'convert_pali.mjs'
)
_node_path = None  # resolved lazily


def _find_node() -> str:
    """Find a usable Node.js binary."""
    global _node_path
    if _node_path:
        return _node_path
    for candidate in ('node', 'nodejs'):
        path = shutil.which(candidate)
        if path:
            _node_path = path
            return path
    raise FileNotFoundError(
        'Node.js is required for Pāli script conversion. '
        'Install Node.js or set the PATH so "node" is available.'
    )


def batch_convert_pali(texts: list[str], script: str) -> list[str]:
    """Convert a batch of Roman Pāli texts to the target script.

    Uses the web app's pali-script.js via Node.js subprocess for
    identical transliteration.  Preserves HTML tags across conversion.
    """
    if not texts or script == 'ro':
        return texts

    node = _find_node()

    # Protect HTML tags, then send plain text lines to the converter
    protected = [_protect_tags(t) for t in texts]
    input_data = '\n'.join(protected) + '\n'

    result = subprocess.run(
        [node, _CONVERTER_SCRIPT, script],
        input=input_data,
        capture_output=True,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        # Log warning and fall back to unconverted text
        print(f'  ⚠️  Node.js converter failed (script={script}): {result.stderr.strip()[:200]}')
        return texts

    output_lines = result.stdout.split('\n')
    # The output may have one fewer or one more line; pad as needed
    while len(output_lines) < len(texts):
        output_lines.append('')
    output_lines = output_lines[:len(texts)]

    return [_restore_tags(line) for line in output_lines]


def convert_pali_script(text: str, script: str) -> str:
    """Convert a single Roman Pāli text to the target script.

    Convenience wrapper around batch_convert_pali for single texts.
    """
    if not text or script == 'ro':
        return text or ''
    return batch_convert_pali([text], script)[0]


def _strip_html(text: str) -> str:
    """Convert stored HTML to readable plain text."""
    if not text:
        return ''
    text = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.I)
    text = re.sub(r'</?p\b[^>]*>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s*\n\s*', '\n', text).strip()


def load_book(
    book_id: str,
    lang_code: str = '',
    script: str = 'ro',
    data_dir: str = '',
) -> Book | None:
    """
    Load a single book with its Pāli text and optional translation.

    The book is organized hierarchically:
    - intro_sentences: text before the first heading
    - vagga_sections: major sections (level 1-2 headings)
      - verses: sub-sections (level 10 headings) under each vagga
    """
    if not data_dir:
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    data_dir = os.path.abspath(data_dir)

    pali_db = os.path.join(data_dir, 'epitaka.db')
    if not os.path.isfile(pali_db):
        raise FileNotFoundError(f'Pāli database not found: {pali_db}')

    # ── Load book metadata ────────────────────────────────────────────
    with sqlite3.connect(pali_db) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            'SELECT * FROM books WHERE book_id = ?', (book_id,)
        ).fetchone()
        if not row:
            return None

        book = Book(
            book_id=row['book_id'],
            book_name=row['book_name'] or book_id,
            english_name=_resolve_english_name(book_id, row['book_name']),
            description=row['description'] or '',
            category=row['category'] or '',
            nikaya=row['nikaya'] or '',
            sub_nikaya=row['sub_nikaya'] or '',
            lang_code=lang_code,
            lang_name=_lang_display(lang_code),
            script=script or 'ro',
        )

    # ── Load headings ─────────────────────────────────────────────────
    # Level 10 rows are verse/content markers, not publishable headings.
    headings = [h for h in _load_headings(pali_db, book_id) if h.level < 10]

    # ── Load Pāli sentences ───────────────────────────────────────────
    pali_sentences = _load_pali_sentences(pali_db, book_id)

    # ── Load translations (if available) ──────────────────────────────
    translations = {}
    heading_translations = {}
    if lang_code:
        trans_db = os.path.join(data_dir, f'epitaka_{lang_code}.db')
        if os.path.isfile(trans_db):
            translations = _load_translations(trans_db, book_id)
            heading_translations = _load_heading_translations(trans_db, book_id)

    # ── Batch-convert all Pāli text via Node.js ──────────────────────
    raw_texts = [s.pali for s in pali_sentences]
    raw_headings = [h.title for h in headings]
    all_raw = raw_texts + raw_headings

    if script != 'ro' and all_raw:
        print(f'  🔄 Converting {len(all_raw)} text segments to script "{script}" via pali-script.js …')
        converted = batch_convert_pali(all_raw, script)
        converted_texts = converted[:len(raw_texts)]
        converted_headings = converted[len(raw_texts):]
    else:
        converted_texts = raw_texts
        converted_headings = raw_headings

    # Update heading titles with converted text
    for h, new_title in zip(headings, converted_headings):
        h.title = new_title

    # Also convert book_name so the intro heading renders correctly
    # in the target script (e.g. Sinhala).
    if script != 'ro' and book.book_name:
        book.book_name = batch_convert_pali([book.book_name], script)[0]

    # ── Group sentences by para_id ────────────────────────────────────
    para_sentences: dict[int, list[Sentence]] = {}
    for s, converted_pali in zip(pali_sentences, converted_texts):
        key = s.para_id
        if key not in para_sentences:
            para_sentences[key] = []
        t = translations.get((s.para_id, s.line_id), '')
        para_sentences[key].append(Sentence(
            book_id=s.book_id,
            para_id=s.para_id,
            line_id=s.line_id,
            pali=converted_pali,
            translation=t,
            vripage=s.vripage.split('.')[-1] if s.vripage else None,
        ))

    # ── Build hierarchical sections ───────────────────────────────────
    if not headings:
        # No headings — flat list of sentences
        all_sents = []
        for para_id in sorted(para_sentences.keys()):
            all_sents.extend(para_sentences[para_id])
        book.intro_sentences = all_sents
        book.total_sentences = len(all_sents)
        return book

    # Every paragraph must be exported, including paragraphs that have no
    # publishable heading. They are attached to the current section below.
    min_heading_para = min(h.para_id for h in headings)

    for para_id in sorted(para_sentences.keys()):
        if para_id < min_heading_para:
            book.intro_sentences.extend(para_sentences[para_id])

    # Separate publishable headings into major sections and sub-sections.
    current_vagga = None

    heading_para_ids = {h.para_id for h in headings}
    for h in headings:
        ht = heading_translations.get(h.para_id, '')
        if h.level <= 2:
            current_vagga = VaggaSection(heading=h, heading_translation=ht)
            book.vagga_sections.append(current_vagga)
        else:
            verse = VerseSection(heading=h, heading_translation=ht)
            if current_vagga is not None:
                current_vagga.verses.append(verse)
            else:
                # Verse before any vagga — create a wrapper vagga
                current_vagga = VaggaSection(
                    heading=Heading(
                        book_id=book_id, para_id=h.para_id,
                        level=2, title='', chapter_len=0,
                    ),
                    heading_translation='',
                )
                current_vagga.verses.append(verse)
                book.vagga_sections.append(current_vagga)

    # Attach sentences to the correct section
    current_vagga = None
    current_verse = None

    for para_id in sorted(para_sentences.keys()):
        sents = para_sentences[para_id]

        # Check if this para starts a new section
        if para_id in heading_para_ids:
            for h in headings:
                if h.para_id == para_id:
                    if h.level <= 2:
                        # Find the vagga we just created
                        for v in book.vagga_sections:
                            if v.heading.para_id == para_id:
                                current_vagga = v
                                current_verse = None
                                break
                    else:
                        # Find the verse under current vagga
                        if current_vagga:
                            for vs in current_vagga.verses:
                                if vs.heading.para_id == para_id:
                                    current_verse = vs
                                    break
                    break

        # Skip the heading para itself (title already stored in heading)
        if para_id in heading_para_ids:
            continue

        # Attach to current section
        if current_verse is not None:
            current_verse.sentences.extend(sents)
        elif current_vagga is not None:
            # Paragraph after vagga heading but before first verse
            if current_vagga.verses:
                current_vagga.verses[-1].sentences.extend(sents)
            else:
                # No verses yet — attach as intro to this vagga
                # Create a pseudo-verse for intro content
                intro_verse = VerseSection(
                    heading=Heading(
                        book_id=book_id, para_id=para_id,
                        level=10, title='', chapter_len=0,
                    ),
                )
                intro_verse.sentences.extend(sents)
                current_vagga.verses.append(intro_verse)
        else:
            book.intro_sentences.extend(sents)

    # Count total sentences
    book.total_sentences = len(book.intro_sentences)
    for vagga in book.vagga_sections:
        for verse in vagga.verses:
            book.total_sentences += len(verse.sentences)

    return book


def load_all_books(
    lang_code: str = '',
    script: str = 'ro',
    data_dir: str = '',
    mula_only: bool = True,
) -> list[Book]:
    """Load all books from the database."""
    if not data_dir:
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    data_dir = os.path.abspath(data_dir)

    pali_db = os.path.join(data_dir, 'epitaka.db')
    if not os.path.isfile(pali_db):
        raise FileNotFoundError(f'Pāli database not found: {pali_db}')

    with sqlite3.connect(pali_db) as conn:
        conn.row_factory = sqlite3.Row
        if mula_only:
            rows = conn.execute(
                "SELECT book_id FROM books WHERE category = 'Mūla' ORDER BY sort_order"
            ).fetchall()
        else:
            rows = conn.execute(
                'SELECT book_id FROM books ORDER BY sort_order'
            ).fetchall()

    books = []
    for row in rows:
        book = load_book(row['book_id'], lang_code=lang_code, script=script, data_dir=data_dir)
        if book:
            books.append(book)
    return books


def list_available_languages(data_dir: str = '') -> list[dict]:
    """List all available translation languages."""
    if not data_dir:
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
    data_dir = os.path.abspath(data_dir)

    langs = []
    for f in sorted(os.listdir(data_dir)):
        m = re.match(r'epitaka_(\w+)\.db$', f)
        if m:
            code = m.group(1)
            langs.append({
                'code': code,
                'name': _lang_display(code),
                'filename': f,
            })
    return langs


# ── Private helpers ─────────────────────────────────────────────────────

_LANG_NAMES = {
    'en': 'English', 'vi': 'Vietnamese', 'th': 'Thai', 'si': 'Sinhala',
    'ta': 'Tamil', 'my': 'Myanmar', 'lo': 'Lao', 'km': 'Khmer',
    'pt': 'Portuguese', 'de': 'German', 'fr': 'French', 'es': 'Spanish',
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi',
    'ne': 'Nepali', 'bn': 'Bengali', 'id': 'Indonesian', 'ru': 'Russian',
}


def _lang_display(code: str) -> str:
    return _LANG_NAMES.get(code, code.upper())


def _resolve_english_name(book_id: str, pali_name: str) -> str:
    if book_id in BOOK_NAMES_EN:
        return BOOK_NAMES_EN[book_id]
    # Try parent book (e.g., D-i → D)
    parent = book_id.split('-')[0]
    if parent in BOOK_NAMES_EN:
        return BOOK_NAMES_EN[parent]
    return pali_name or book_id


def _load_headings(db_path: str, book_id: str) -> list[Heading]:
    headings = []
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            'SELECT * FROM headings WHERE book_id = ? ORDER BY para_id',
            (book_id,),
        ).fetchall()
        for r in rows:
            headings.append(Heading(
                book_id=r['book_id'],
                para_id=r['para_id'],
                level=r['level'],
                title=r['title'] or '',
                chapter_len=r['chapter_len'] or 0,
                parent=r['parent'] or -1,
                sc_id=r['sc_id'] or '',
            ))
    return headings


def _load_pali_sentences(db_path: str, book_id: str) -> list[Sentence]:
    sentences = []
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            'SELECT * FROM sentences WHERE book_id = ? ORDER BY para_id, line_id',
            (book_id,),
        ).fetchall()
        for r in rows:
            sentences.append(Sentence(
                book_id=r['book_id'],
                para_id=r['para_id'],
                line_id=r['line_id'],
                pali=r['pali'] or '',
                vripage=r['vripage'] if 'vripage' in r.keys() else '',
            ))
    return sentences


def _load_translations(db_path: str, book_id: str) -> dict:
    """Returns dict mapping (para_id, line_id) → translation text."""
    translations = {}
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            'SELECT * FROM sentences WHERE book_id = ? ORDER BY para_id, line_id',
            (book_id,),
        ).fetchall()
        for r in rows:
            key = (r['para_id'], r['line_id'])
            translations[key] = r['translation'] or ''
    return translations


def _load_heading_translations(db_path: str, book_id: str) -> dict:
    """Returns dict mapping para_id → heading translation title.

    Translation DBs store heading translations in the `summaries` table
    (column `title`), keyed by `para_start` which maps to `para_id`
    in the Pali headings table.
    """
    ht = {}
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        # Try summaries table (translation DBs)
        tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        if 'summaries' in tables:
            rows = conn.execute(
                'SELECT para_start, title FROM summaries '
                'WHERE book_id = ? AND title != ""',
                (book_id,),
            ).fetchall()
            for r in rows:
                ht[r['para_start']] = r['title'] or ''
        elif 'headings' in tables:
            rows = conn.execute(
                'SELECT para_id, heading_translation FROM headings '
                'WHERE book_id = ? AND heading_translation != ""',
                (book_id,),
            ).fetchall()
            for r in rows:
                ht[r['para_id']] = r['heading_translation'] or ''
    return ht

# app/services/summaries.py
"""
AI study-guide summaries — read-only access + rendering.

The study_builder.py pipeline (see translator/) generates one markdown
"study guide" per level-10 section of a mūla book, synthesising the mūla
text, its aṭṭhakathā, its ṭīkā, and Pāli word definitions, with citations
of the form [book:para:line] (ranges and comma-separated lists allowed).

Summaries are stored in the `summaries` table of the ENGLISH translation
DB (epitaka_en.db) — the same file the reader/AI features use — so there
is no separate summary DB to deploy. This module:

  - opens the summary connection read-only (it is written by the study
    pipeline while the web server may be reading it — WAL makes that safe),
  - exposes the rows as dicts,
  - renders the markdown to semantic HTML, turning every citation into a
    link back into the book reader that opens in a NEW tab.

The summaries table may not exist yet (or a book may not have summaries)
— every helper degrades gracefully to empty results.
"""
import html
import os
import re
import sqlite3

from flask import g

from ..config import Config

# ── Connection (per request, read-only) ───────────────────────────────────

def get_summary_conn():
    """
    Read-only connection to the `summaries` table inside epitaka_en.db,
    cached on Flask's ``g``. Returns None when the file is absent so
    callers can degrade gracefully.
    """
    if hasattr(g, 'summary_db'):
        return g.summary_db
    # Summaries live inside the English translation DB (summaries table),
    # which is always deployed alongside the other translation files.
    path = os.path.join(Config.DATA_DIR, 'epitaka_en.db')
    if not os.path.isfile(path):
        setattr(g, 'summary_db', None)
        return None
    conn = sqlite3.connect(f'file:{path}?mode=ro', uri=True, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute('PRAGMA busy_timeout = 10000')
    except Exception:
        pass
    setattr(g, 'summary_db', conn)
    return conn


# ── Queries ───────────────────────────────────────────────────────────────

def get_summary(book_id: str, section_id: int) -> dict | None:
    """One summary row as a dict, or None."""
    conn = get_summary_conn()
    if conn is None:
        return None
    try:
        row = conn.execute(
            'SELECT * FROM summaries WHERE book_id = ? AND section_id = ?',
            (book_id, section_id),
        ).fetchone()
    except sqlite3.Error:
        return None
    return dict(row) if row else None


def get_all_summaries(book_id: str) -> list[dict]:
    """All summaries for a book, in section order."""
    conn = get_summary_conn()
    if conn is None:
        return []
    try:
        rows = conn.execute(
            'SELECT * FROM summaries WHERE book_id = ? ORDER BY section_id',
            (book_id,),
        ).fetchall()
    except sqlite3.Error:
        return []
    return [dict(r) for r in rows]


def summary_slug(row: dict) -> str:
    """
    URL slug for a summary page: the study-guide title, trimmed of prefixes,
    parentheticals and citations, capped at ~60 chars, plus the section id
    for uniqueness:
        "the-discourse-on-the-root-of-all-phenomena-6"
    """
    base = (row.get('title') or row.get('heading_title') or 'study-guide').strip()
    base = re.sub(r'^Study Guide[\s:\-–—]*', '', base, flags=re.IGNORECASE)
    base = re.sub(r'\([^)]*\)', '', base)          # drop (…) parentheticals
    base = re.sub(r'\[[^\]]*\]', '', base)          # drop [citation] spans
    base = re.sub(r'[^\w\s\-]', '', base, flags=re.UNICODE)
    base = re.sub(r'\s+', '-', base).strip('-')
    base = re.sub(r'-+', '-', base)[:60].rstrip('-').lower()
    if not base:
        base = 'study-guide'
    return f'{base}-{row.get("section_id")}'


def book_summary_map(book_id: str) -> dict:
    """
    {section_id: {'title', 'slug', 'url_path'}} for every summary of a book,
    so the book page can render a study icon on the right headings and the
    outline page can link each section to its study guide.
    """
    out = {}
    for row in get_all_summaries(book_id):
        slug = summary_slug(row)
        out[row['section_id']] = {
            'title':     row.get('title') or '',
            'slug':      slug,
            'url_path':  f'/study/{book_id}/{slug}',
        }
    return out


# ── Markdown → HTML (study guides only) ───────────────────────────────────

# [book:para:line], [book:para:line–end], [book:para:1–98:9], comma-separated lists
_CITE_PART_RE = re.compile(
    r'^([A-Za-z0-9_\-]+):(\d+)(?::(\d+))?(?:[–-]\d+(?::\d+)?)?$'
)
_CITE_BRACKET_RE = re.compile(r'\[([^\]]+)\]')


def extract_citation_pairs(content: str) -> set:
    """All (book_id, para_id) pairs cited anywhere in the study content."""
    pairs = set()
    for m in _CITE_BRACKET_RE.finditer(content or ''):
        inner = m.group(1).strip()
        for part in inner.split(','):
            pm = _CITE_PART_RE.match(part.strip())
            if pm:
                pairs.add((pm.group(1), int(pm.group(2))))
    return pairs


def _link_citations(text: str, lang: str, citation_slugs: dict | None) -> str:
    """
    Replace [book:para:line] citations with links back into the book reader,
    opening in a new tab. Ranges link to their start; comma-separated
    citation lists become one link per citation. Non-citation brackets are
    left untouched.

    Each link points at the enclosing section page (parent-heading slug) so
    the reader renders that section open and scrolls to the exact line:
    /{lang}/book/{book}/{section_slug}#{para}-{line}. Falls back to
    /{lang}/book/{book}#{para} when no slug is known.
    """
    def _repl(m):
        inner = m.group(1).strip()
        parts = [p.strip() for p in inner.split(',')]
        if not parts or not all(_CITE_PART_RE.match(p) for p in parts):
            return m.group(0)
        links = []
        for p in parts:
            pm = _CITE_PART_RE.match(p)
            dst_book = pm.group(1)
            para     = pm.group(2)
            line     = pm.group(3)
            slug = None
            if citation_slugs:
                slug = citation_slugs.get((dst_book, int(para))) or None
            href = f'/{lang}/book/{dst_book}'
            if slug:
                href += f'/{slug}'
            href += f'#{para}'
            if line:
                href += f'-{line}'
            links.append(
                f'<a class="study-citation" href="{href}" '
                f'target="_blank" rel="noopener noreferrer">[{p}]</a>'
            )
        return ' '.join(links)

    return _CITE_BRACKET_RE.sub(_repl, text)


def _inline(text: str, lang: str, citation_slugs: dict | None) -> str:
    """Inline formatting for one line/block of study markdown (escaped input)."""
    text = _link_citations(text, lang, citation_slugs)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Single-asterisk emphasis (bold pairs were consumed above).
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text


def _split_table_row(line: str) -> list[str]:
    line = line.strip()
    if line.startswith('|'):
        line = line[1:]
    if line.endswith('|'):
        line = line[:-1]
    return [c.strip() for c in line.split('|')]


def _render_list(items: list, lang: str, citation_slugs: dict | None) -> str:
    """
    Render nested bullet/ordered lists. `items` is a list of
    (indent, ordered, text) tuples; indentation is 2 spaces per level.
    """
    out: list[str] = []
    stack: list[tuple[int, bool, str]] = []  # (indent, ordered, tag)
    for indent, ordered, text in items:
        tag = 'ol' if ordered else 'ul'
        while stack and indent < stack[-1][0]:
            out.append(f'</{stack.pop()[2]}>')
        if stack and indent == stack[-1][0] and ordered == stack[-1][1]:
            out.append(f'<li>{_inline(text, lang, citation_slugs)}</li>')
        else:
            out.append(f'<{tag}><li>{_inline(text, lang, citation_slugs)}</li>')
            stack.append((indent, ordered, tag))
    while stack:
        out.append(f'</{stack.pop()[2]}>')
    return '\n'.join(out)


_BLOCK_START_RE = re.compile(r'^(#{1,6}\s|```|>\s?|[-*+]\s|\d+\.\s|-{3,}\s*$)')


def render_study_markdown(content: str, book_id: str, lang: str = 'en',
                          citation_slugs: dict | None = None) -> str:
    """
    Render a study-guide markdown document to semantic HTML.

    Supports: #-headings, **bold**, *italic*, `code`, ``` fences, bullet and
    ordered lists (with nesting), > blockquotes, --- rules, pipe tables and
    [book:para:line] citations (→ links, new tab). The leading `#` title is
    dropped — the study page renders its own <h1>.
    """
    if not content:
        return ''
    raw = content.split('\n')
    # Drop leading level-1 headings (they duplicate the page title).
    while raw and raw[0].strip().startswith('# '):
        raw.pop(0)
    lines = [html.escape(l) for l in raw]

    out: list[str] = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        # Fenced code block
        if line.startswith('```'):
            buf = []
            i += 1
            while i < n and not lines[i].strip().startswith('```'):
                buf.append(lines[i])
                i += 1
            i += 1
            out.append('<pre><code>' + '\n'.join(buf) + '</code></pre>')
            continue

        # Heading
        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            lvl = len(m.group(1))
            out.append(f'<h{lvl}>{_inline(m.group(2), lang, citation_slugs)}</h{lvl}>')
            i += 1
            continue

        # Horizontal rule
        if re.match(r'^-{3,}\s*$', line):
            out.append('<hr>')
            i += 1
            continue

        # Blockquote
        if line.startswith('>'):
            buf = []
            while i < n and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip()[1:].strip())
                i += 1
            out.append('<blockquote>'
                       + '<br>'.join(_inline(b, lang, citation_slugs) for b in buf)
                       + '</blockquote>')
            continue

        # Pipe table (header row followed by a |---|---| separator)
        if '|' in line and i + 1 < n and re.match(r'^\s*\|?[\s:|-]+\|[\s:|-]*$',
                                                  lines[i + 1].strip()):
            header = _split_table_row(line)
            i += 2
            rows = []
            while i < n and '|' in lines[i]:
                rows.append(_split_table_row(lines[i]))
                i += 1
            thead = '<tr>' + ''.join(
                f'<th>{_inline(c, lang, citation_slugs)}</th>' for c in header
            ) + '</tr>'
            tbody = ''.join(
                '<tr>' + ''.join(
                    f'<td>{_inline(c, lang, citation_slugs)}</td>' for c in r
                ) + '</tr>' for r in rows
            )
            out.append(f'<table><thead>{thead}</thead><tbody>{tbody}</tbody></table>')
            continue

        # Bullet list
        if re.match(r'^[-*+]\s+', line):
            items = []
            while i < n:
                ln = lines[i]
                stripped = ln.lstrip()
                indent = (len(ln) - len(stripped)) // 2
                if re.match(r'^[-*+]\s+', stripped):
                    items.append((indent, False, re.sub(r'^[-*+]\s+', '', stripped)))
                    i += 1
                    continue
                if re.match(r'^\d+\.\s+', stripped) or stripped.startswith('>') \
                        or re.match(r'^#{1,6}\s', stripped) or stripped.startswith('```') \
                        or not stripped:
                    break
                # Continuation line of the current item
                if items:
                    items.append((indent, False, stripped))
                i += 1
            out.append(_render_list(items, lang, citation_slugs))
            continue

        # Ordered list
        if re.match(r'^\d+\.\s+', line):
            items = []
            while i < n:
                ln = lines[i]
                stripped = ln.lstrip()
                indent = (len(ln) - len(stripped)) // 2
                if re.match(r'^\d+\.\s+', stripped):
                    items.append((indent, True, re.sub(r'^\d+\.\s+', '', stripped)))
                    i += 1
                    continue
                if re.match(r'^[-*+]\s+', stripped) or stripped.startswith('>') \
                        or re.match(r'^#{1,6}\s', stripped) or stripped.startswith('```') \
                        or not stripped:
                    break
                if items:
                    items.append((indent, True, stripped))
                i += 1
            out.append(_render_list(items, lang, citation_slugs))
            continue

        # Plain paragraph
        buf = [line]
        i += 1
        while i < n and lines[i].strip() and not _BLOCK_START_RE.match(lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        out.append('<p>' + '<br>'.join(_inline(b, lang, citation_slugs) for b in buf) + '</p>')

    return '\n'.join(out)


# ── Plain text (meta descriptions) ────────────────────────────────────────

def study_plain_text(content: str, limit: int = 320) -> str:
    """
    Rough plain-text extraction of the study content for <title>/<meta
    description>: strip citations, markdown markers and extra whitespace.
    """
    text = _CITE_BRACKET_RE.sub(' ', content or '')
    text = re.sub(r'[#>*`|~-]{2,}', ' ', text)
    text = re.sub(r'[#>*`|]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > limit:
        text = text[:limit - 1].rstrip() + '…'
    return text

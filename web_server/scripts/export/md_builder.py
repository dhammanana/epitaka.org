"""
md_builder.py — Generate Markdown files from Book data.
"""

import os
import re

from .data_loader import (
    Book,
    VariantCounter,
    _strip_html,
    clean_variant_note,
    tokenize_pali_variants,
)


def build_markdown(book: Book, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    lines = []

    # ── YAML front matter ─────────────────────────────────────────────
    lines.append("---")
    lines.append(f'title: "{_esc_yaml(_md_title(book))}"')
    lines.append(f'author: "Chattha Sangayana Tipitaka"')
    lines.append(f'lang: "{book.lang_code or "pi"}"')
    lines.append(f'book_id: "{book.book_id}"')
    if book.nikaya:
        lines.append(f'nikaya: "{_esc_yaml(book.nikaya)}"')
    if book.sub_nikaya:
        lines.append(f'sub_nikaya: "{_esc_yaml(book.sub_nikaya)}"')
    if book.category:
        lines.append(f'category: "{_esc_yaml(book.category)}"')
    if book.lang_name:
        lines.append(f'translation_language: "{book.lang_name}"')
    if book.description:
        lines.append(f'description: "{_esc_yaml(book.description)}"')
    if book.vri_id:
        lines.append(f'vri_id: "{book.vri_id}"')
    if book.attha_ref:
        lines.append(f'attha_ref: "{book.attha_ref}"')
    if book.tika_ref:
        lines.append(f'tika_ref: "{book.tika_ref}"')
    lines.append(f'source: "https://epitaka.org"')
    lines.append("---")
    lines.append("")

    # ── Title ─────────────────────────────────────────────────────────
    lines.append(f"# {_md_title(book)}")
    lines.append("")
    if book.sub_nikaya:
        lines.append(f"*{book.sub_nikaya}*")
        lines.append("")
    elif book.nikaya:
        lines.append(f"*{book.nikaya}*")
        lines.append("")
    if book.lang_name:
        lines.append(f"**{book.lang_name} Translation**")
        lines.append("")
    if book.description:
        lines.append(f"> {book.description}")
        lines.append("")
    lines.append("---")
    lines.append("")

    # ── TOC (Pāli line + translation line, one link each) ─────────────
    lines.append('<h2 align="center">Table of Contents</h2>')
    lines.append("")
    if book.intro_sentences:
        lines.append(f"- [**{_esc_md(_strip_html(book.book_name))}**](#toc-intro)")
    for vi, vagga in enumerate(book.vagga_sections):
        h = vagga.heading
        title = h.title or f"Section {h.para_id}"
        lines.append(
            f"- [{_toc_link_text(title, vagga.heading_translation)}](#toc-vagga-{vi})"
        )
        for vidx, verse in enumerate(vagga.verses):
            vh = verse.heading
            vtitle = vh.title or f"Section {vh.para_id}"
            if vh.para_id != h.para_id:
                lines.append(
                    f"  - [{_toc_link_text(vtitle, verse.heading_translation)}]"
                    f"(#toc-verse-{vi}-{vidx})"
                )
    lines.append("")
    lines.append("---")
    lines.append("")

    # ── Intro ─────────────────────────────────────────────────────────
    vcounter = VariantCounter()
    notes: list[tuple[int, str]] = []
    if book.intro_sentences:
        lines.append(
            f'<h2 align="center"><a id="toc-intro"></a>{_esc_html(book.book_name)}</h2>'
        )
        lines.append("")
        for s in book.intro_sentences:
            _add_md_sent(lines, s, vcounter, notes)

    # ── Body ──────────────────────────────────────────────────────────
    for vi, vagga in enumerate(book.vagga_sections):
        h = vagga.heading
        title = h.title or f"Section {h.para_id}"
        lines.append(
            f'<h2 align="center"><a id="toc-vagga-{vi}"></a>{_esc_html(title)}</h2>'
        )
        lines.append("")
        if vagga.heading_translation:
            lines.append(f"*{_esc_md(vagga.heading_translation)}*")
            lines.append("")

        for vidx, verse in enumerate(vagga.verses):
            vh = verse.heading
            vtitle = vh.title or f"Section {vh.para_id}"
            if vh.para_id != h.para_id:
                lines.append(
                    f'<h3 align="center"><a id="toc-verse-{vi}-{vidx}"></a>'
                    f"{_esc_html(vtitle)}</h3>"
                )
                lines.append("")
            if verse.heading_translation:
                lines.append(f"*{_esc_md(verse.heading_translation)}*")
                lines.append("")
            for s in verse.sentences:
                _add_md_sent(lines, s, vcounter, notes)

        lines.append("---")
        lines.append("")

    # ── Variant footnotes ─────────────────────────────────────────────
    if notes:
        lines.append("## Variants")
        lines.append("")
        for num, note in notes:
            lines.append(f"[^{num}]: {_esc_md(note)}")
        lines.append("")

    # ── Footer ────────────────────────────────────────────────────────
    lines.append(f"*{_esc_md(book.book_name)} — Chattha Sangayana Tipitaka*")
    lines.append(f"*Source: [epitaka.org](https://epitaka.org)*")
    lines.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return output_path


def _add_md_sent(lines, s, vcounter, notes):
    if s.vripage:
        lines.append(f"*[VRI page {s.vripage}]*")
        lines.append("")
    if s.pali:
        parts = []
        for kind, val in tokenize_pali_variants(s.pali):
            if kind == "text":
                parts.append(val)
            else:
                num = vcounter.take()
                notes.append((num, clean_variant_note(val)))
                parts.append(f"[^{num}]")
        lines.append(f"> **{_esc_md(_strip_html(''.join(parts)))}**")
        lines.append("")
    if s.translation:
        lines.append(f"{_esc_md(_strip_html(s.translation))}")
        lines.append("")


def _md_title(book):
    en = (book.english_name or "").strip()
    bn = (book.book_name or "").strip()
    if en and bn and en.lower() != bn.lower():
        return f"{en} ({bn})"
    return en or bn


def _toc_link_text(pali, trans):
    """Bilingual link text: bold Pāli, then italic translation on a new line."""
    text = f"**{_esc_md(_strip_html(pali))}**"
    if (trans or "").strip():
        text += f"<br/>*{_esc_md(_strip_html(trans))}*"
    return text


def _esc_md(text):
    return (text or "").replace("\\", "\\\\")


def _esc_html(text):
    return (
        (text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _esc_yaml(text):
    return (text or "").replace('"', '\\"')

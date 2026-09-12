"""
docx_builder.py — Generate DOCX files from Book data.

Embeds script-specific fonts so Sinhala and other complex scripts
render correctly even on systems without the fonts installed.
"""

import os
import re
from copy import deepcopy
from lxml import etree

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn, nsdecls
from docx.oxml import OxmlElement, parse_xml

from .data_loader import (
    Book,
    VariantCounter,
    clean_variant_note,
    tokenize_pali_variants,
)

_FONTS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "fonts")
)

# Script code → (regular_font_filename, bold_font_filename)
_SCRIPT_FONT_FILES = {
    "ro": ("NotoSans-Regular.ttf", "NotoSans-Bold.ttf"),
    "si": ("NotoSansSinhala-Regular.ttf", "NotoSansSinhala-Bold.ttf"),
    "hi": ("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari-Bold.ttf"),
    "th": ("thai/NotoSansThai-Regular.ttf", "thai/NotoSansThai-Bold.ttf"),
    "lo": ("lao/NotoSansLao-Regular.ttf", "lao/NotoSansLao-Bold.ttf"),
    "my": (
        "myanmar/NotoSansMyanmar-Regular.ttf",
        "myanmar/NotoSansMyanmar-Bold.ttf",
    ),
    "km": ("NotoSansKhmer-Regular.ttf", "NotoSansKhmer-Bold.ttf"),
    "be": ("NotoSansBengali-Regular.ttf", "NotoSansBengali-Bold.ttf"),
    "gm": ("NotoSansGurmukhi-Regular.ttf", "NotoSansGurmukhi-Bold.ttf"),
    "tt": (
        "lanna/NotoSansTaiTham-Regular.ttf",
        "lanna/NotoSansTaiTham-Bold.ttf",
    ),
    "gj": ("NotoSansGujarati-Regular.ttf", "NotoSansGujarati-Bold.ttf"),
    "te": ("NotoSansTelugu-Regular.ttf", "NotoSansTelugu-Bold.ttf"),
    "ka": ("NotoSansKannada-Regular.ttf", "NotoSansKannada-Bold.ttf"),
    "mm": ("NotoSansMalayalam-Regular.ttf", "NotoSansMalayalam-Bold.ttf"),
    "br": ("NotoSansBrahmi-Regular.ttf", None),
    "tb": (
        "tibetian/NotoSansTibetan-Regular.ttf",
        "tibetian/NotoSansTibetan-Bold.ttf",
    ),
    "cy": ("NotoSans-Regular.ttf", "NotoSans-Bold.ttf"),
}

ACCENT = RGBColor(139, 94, 60)
PALI_C = RGBColor(124, 45, 18)
TRANS_C = RGBColor(30, 58, 95)
MUTED = RGBColor(138, 122, 110)
TEXT = RGBColor(45, 36, 32)


# Script code → font name for DOCX (installed system fonts)
_SCRIPT_DOCX_FONTS = {
    "ro": "Noto Sans",
    "si": "Noto Sans Sinhala",
    "hi": "Noto Sans Devanagari",
    "th": "Noto Sans Thai",
    "lo": "Noto Sans Lao",
    "km": "Noto Sans Khmer",
    "be": "Noto Sans Bengali",
    "my": "Noto Sans Myanmar",
    "gm": "Noto Sans Gurmukhi",
    "tt": "Noto Sans Tai Tham",
    "gj": "Noto Sans Gujarati",
    "te": "Noto Sans Telugu",
    "ka": "Noto Sans Kannada",
    "mm": "Noto Sans Malayalam",
    "br": "Noto Sans Brahmi",
    "tb": "Noto Sans Tibetan",
    "cy": "Noto Sans",
}


def build_docx(book: Book, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    style.font.color.rgb = TEXT
    for sec in doc.sections:
        sec.top_margin = Cm(2.5)
        sec.bottom_margin = Cm(2.5)
        sec.left_margin = Cm(2.5)
        sec.right_margin = Cm(2.5)
    # Set the Pāli font for the document
    pali_font_name = _SCRIPT_DOCX_FONTS.get(book.script, "Noto Serif")
    trans_script = book.lang_code if book.lang_code in _SCRIPT_DOCX_FONTS else "ro"
    if book.lang_code == "my_nissaya":
        trans_script = "my"
    trans_font_name = _SCRIPT_DOCX_FONTS.get(trans_script, "Noto Sans")
    vcounter = VariantCounter()
    # Collect fonts to embed
    fonts_to_embed = _get_fonts_to_embed(book.script)
    for _f in _get_fonts_to_embed(trans_script):
        if _f not in fonts_to_embed:
            fonts_to_embed.append(_f)

    for _ in range(6):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Dharma Wheel")
    r.font.size = Pt(40)
    r.font.color.rgb = ACCENT
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(_docx_title(book))
    r.font.size = Pt(26)
    r.font.color.rgb = ACCENT
    r.bold = True
    if book.sub_nikaya:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(book.sub_nikaya)
        r.font.size = Pt(13)
        r.font.color.rgb = MUTED
    elif book.nikaya:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(book.nikaya)
        r.font.size = Pt(13)
        r.font.color.rgb = MUTED
    if book.lang_name:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(f"{book.lang_name} Translation")
        r.font.size = Pt(11)
        r.font.color.rgb = ACCENT
    if book.description:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(book.description)
        r.font.size = Pt(9)
        r.font.color.rgb = MUTED
        r.italic = True
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Chattha Sangayana Tipitaka")
    r.font.size = Pt(10)
    r.font.color.rgb = MUTED
    doc.add_page_break()

    toc_title = doc.add_heading("Table of Contents", level=1)
    toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if book.intro_sentences:
        _add_toc_entry(
            doc,
            "toc-intro",
            _strip_basic(book.book_name),
            "",
            pali_font_name,
            trans_font_name,
            level=0,
        )
    for vi, vagga in enumerate(book.vagga_sections):
        h = vagga.heading
        _add_toc_entry(
            doc,
            f"toc-vagga-{vi}",
            _strip_basic(h.title or f"Section {h.para_id}"),
            _strip_basic(vagga.heading_translation),
            pali_font_name,
            trans_font_name,
            level=0,
        )
        for vidx, verse in enumerate(vagga.verses):
            vh = verse.heading
            if vh.para_id == h.para_id:
                continue
            _add_toc_entry(
                doc,
                f"toc-verse-{vi}-{vidx}",
                _strip_basic(vh.title or f"Section {vh.para_id}"),
                _strip_basic(verse.heading_translation),
                pali_font_name,
                trans_font_name,
                level=1,
            )
    doc.add_page_break()

    if book.intro_sentences:
        heading = doc.add_heading(book.book_name, level=1)
        heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in heading.runs:
            _apply_run_font(run, pali_font_name)
        _add_bookmark(heading, "toc-intro")
        for s in book.intro_sentences:
            _add_docx_sent(doc, s, pali_font_name, vcounter, trans_font_name)

    for vi, vagga in enumerate(book.vagga_sections):
        h = vagga.heading
        title = h.title or f"Section {h.para_id}"
        heading = doc.add_heading(title, level=1)
        heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in heading.runs:
            run.font.color.rgb = ACCENT
            _apply_run_font(run, pali_font_name)
        _add_bookmark(heading, f"toc-vagga-{vi}")
        if vagga.heading_translation:
            _add_translation_heading(
                doc, vagga.heading_translation, 10, trans_font_name
            )
        for vidx, verse in enumerate(vagga.verses):
            vh = verse.heading
            vtitle = vh.title or f"Section {vh.para_id}"
            if vh.para_id != h.para_id:
                heading = doc.add_heading(vtitle, level=2)
                heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in heading.runs:
                    run.font.color.rgb = ACCENT
                    _apply_run_font(run, pali_font_name)
                _add_bookmark(heading, f"toc-verse-{vi}-{vidx}")
            if verse.heading_translation:
                _add_translation_heading(
                    doc, verse.heading_translation, 9, trans_font_name
                )
            for s in verse.sentences:
                _add_docx_sent(doc, s, pali_font_name, vcounter, trans_font_name)
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run("- - -")
        r.font.color.rgb = MUTED

    doc.add_page_break()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(f"{book.book_name} — Chattha Sangayana Tipitaka")
    r.italic = True
    r.font.color.rgb = MUTED
    r.font.size = Pt(9)
    doc.save(output_path)
    # Embed fonts after saving (need the file on disk)
    _embed_fonts_in_docx(output_path, fonts_to_embed)
    return output_path


_BOOKMARK_ID = [100]


def _add_bookmark(paragraph, name: str) -> None:
    """Wrap a heading paragraph in a bookmark so TOC hyperlinks can target it."""
    _BOOKMARK_ID[0] += 1
    bid = str(_BOOKMARK_ID[0])
    start = OxmlElement("w:bookmarkStart")
    start.set(qn("w:id"), bid)
    start.set(qn("w:name"), name)
    end = OxmlElement("w:bookmarkEnd")
    end.set(qn("w:id"), bid)
    p = paragraph._p
    p.insert(0, start)
    p.append(end)


def _add_toc_entry(doc, anchor, pali, trans, pali_font, trans_font, level=0):
    """One centered TOC entry — Pāli line, then translation line, one link."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if level == 1:
        p.paragraph_format.left_indent = Cm(1.0)
    r1 = p.add_run(pali)
    r1.bold = True
    r1.font.size = Pt(12 if level == 0 else 10.5)
    r1.font.color.rgb = ACCENT
    _apply_run_font(r1, pali_font)
    if trans:
        r1.add_break()
        r2 = p.add_run(trans)
        r2.italic = True
        r2.font.size = Pt(10 if level == 0 else 9)
        r2.font.color.rgb = TRANS_C
        _apply_run_font(r2, trans_font)
    # Wrap all runs in a single internal hyperlink to the bookmark.
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("w:anchor"), anchor)
    hyperlink.set(qn("w:history"), "1")
    for r in list(p._p.findall(qn("w:r"))):
        hyperlink.append(r)
    p._p.append(hyperlink)


def _add_translation_heading(doc, text, size=10, font_name=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(_strip_basic(text))
    r.italic = True
    r.font.color.rgb = TRANS_C
    r.font.size = Pt(size)
    if font_name:
        _apply_run_font(r, font_name)


def _add_docx_sent(
    doc, s, pali_font_name="Noto Sans", vcounter=None, trans_font_name=None
):
    if s.vripage:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p.add_run(f"— VRI page {s.vripage} —")
        r.font.color.rgb = MUTED
        r.font.size = Pt(8)
    if s.pali:
        _add_rich_paragraph(doc, s.pali, PALI_C, 11, 0, pali_font_name, vcounter)
    if s.translation:
        _add_rich_paragraph(
            doc, s.translation, TRANS_C, 10, Cm(0.5), trans_font_name or "Noto Sans"
        )


def _add_rich_paragraph(doc, html, color, size, indent, font_name=None, vcounter=None):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.left_indent = indent
    chunks = tokenize_pali_variants(html) if vcounter is not None else [("text", html)]
    for kind, val in chunks:
        if kind == "note":
            _insert_footnote(doc, p, clean_variant_note(val))
            continue
        for text, attrs in _parse_inline(val):
            _append_run(p, text, attrs, color, size, font_name)


def _append_run(p, text, attrs, color, size, font_name=None):
    r = p.add_run(text)
    r.font.color.rgb = color
    r.font.size = Pt(size)
    if font_name:
        _apply_run_font(r, font_name)
    r.bold = attrs.get("bold", False)
    r.italic = attrs.get("italic", False)
    r.font.superscript = attrs.get("sup", False)
    r.font.subscript = attrs.get("sub", False)


def _apply_run_font(run, font_name):
    """Point a run at a font family across all script categories."""
    run.font.name = font_name
    # Set all font categories so non-Latin scripts render correctly
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = parse_xml(f"<w:rFonts {nsdecls('w')}/>")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), font_name)
    rFonts.set(qn("w:hAnsi"), font_name)
    rFonts.set(qn("w:cs"), font_name)
    rFonts.set(qn("w:eastAsia"), font_name)


def _parse_inline(html):
    pattern = re.compile(
        r"(<(?:b|strong|i|em|sup|sub)>|</(?:b|strong|i|em|sup|sub)>)", re.I
    )
    attrs = {"bold": False, "italic": False, "sup": False, "sub": False}
    out = []
    for part in pattern.split(html or ""):
        if not part:
            continue
        tag = part.lower()
        if tag in ("<b>", "<strong>"):
            attrs["bold"] = True
        elif tag in ("</b>", "</strong>"):
            attrs["bold"] = False
        elif tag in ("<i>", "<em>"):
            attrs["italic"] = True
        elif tag in ("</i>", "</em>"):
            attrs["italic"] = False
        elif tag == "<sup>":
            attrs["sup"] = True
        elif tag == "</sup>":
            attrs["sup"] = False
        elif tag == "<sub>":
            attrs["sub"] = True
        elif tag == "</sub>":
            attrs["sub"] = False
        elif not part.startswith("<"):
            out.append((re.sub(r"<[^>]+>", "", part), attrs.copy()))
    return out


def _strip_basic(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def _get_fonts_to_embed(script):
    """Get list of (family_name, is_bold, file_path) tuples to embed."""
    if script not in _SCRIPT_FONT_FILES:
        return []
    family = _SCRIPT_DOCX_FONTS.get(script, "Noto Sans")
    regular_file, bold_file = _SCRIPT_FONT_FILES[script]
    fonts = []
    if regular_file:
        path = os.path.join(_FONTS_DIR, regular_file)
        if os.path.isfile(path):
            fonts.append((family, False, path))
    if bold_file:
        path = os.path.join(_FONTS_DIR, bold_file)
        if os.path.isfile(path):
            fonts.append((family, True, path))
    return fonts


_FONT_RELTYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font"
)
_FONT_CT = "application/vnd.ms-office.obfuscated-opentype"
_RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
_CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
_DOC_RELS_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def _obfuscate_font(data: bytes, key) -> bytes:
    """XOR the first 32 bytes with the fontKey GUID (ECMA-376)."""
    kb = key.bytes_le
    out = bytearray(data)
    for i in range(min(32, len(out))):
        out[i] ^= kb[i % 16]
    return bytes(out)


def _embed_fonts_in_docx(docx_path, fonts_to_embed):
    """Embed TrueType fonts as obfuscated odttf parts (ECMA-376 §11).

    Adds word/fonts/fontN.odttf parts, links them from
    word/_rels/document.xml.rels and word/fontTable.xml, and declares
    the odttf content type. Word and LibreOffice then render the
    document with these fonts even when not installed on the system.
    """
    if not fonts_to_embed:
        return

    import uuid
    import zipfile

    # Read existing DOCX
    with zipfile.ZipFile(docx_path, "r") as zin:
        contents = {name: zin.read(name) for name in zin.namelist()}

    # ── document rels ───────────────────────────────────────────────
    rels_name = "word/_rels/document.xml.rels"
    rels_root = etree.fromstring(contents[rels_name])
    existing_ids = {
        el.get("Id") for el in rels_root.findall(f"{{{_RELS_NS}}}Relationship")
    }
    rid_counter = [0]

    def _next_rid():
        while True:
            rid_counter[0] += 1
            rid = f"rIdFont{rid_counter[0]}"
            if rid not in existing_ids:
                existing_ids.add(rid)
                return rid

    # ── content types ───────────────────────────────────────────────
    ct_name = "[Content_Types].xml"
    ct_root = etree.fromstring(contents[ct_name])
    if not any(
        el.get("Extension") == "odttf" for el in ct_root.findall(f"{{{_CT_NS}}}Default")
    ):
        default = etree.SubElement(ct_root, f"{{{_CT_NS}}}Default")
        default.set("Extension", "odttf")
        default.set("ContentType", _FONT_CT)
    contents[ct_name] = etree.tostring(
        ct_root, xml_declaration=True, encoding="UTF-8", standalone=True
    )

    # ── fontTable.xml ───────────────────────────────────────────────
    ft_name = "word/fontTable.xml"
    ft_root = etree.fromstring(contents[ft_name])

    font_idx = [0]
    for family, is_bold, font_path in fonts_to_embed:
        with open(font_path, "rb") as f:
            raw = f.read()
        key = uuid.uuid4()

        while True:
            part_name = f"word/fonts/font{font_idx[0]}.odttf"
            font_idx[0] += 1
            if part_name not in contents:
                break
        contents[part_name] = _obfuscate_font(raw, key)

        rid = _next_rid()
        rel = etree.SubElement(rels_root, f"{{{_RELS_NS}}}Relationship")
        rel.set("Id", rid)
        rel.set("Type", _FONT_RELTYPE)
        rel.set("Target", "fonts/" + part_name.rsplit("/", 1)[-1])

        font_el = None
        for fe in ft_root.findall(qn("w:font")):
            if fe.get(qn("w:name")) == family:
                font_el = fe
                break
        if font_el is None:
            font_el = etree.SubElement(ft_root, qn("w:font"))
            font_el.set(qn("w:name"), family)

        tag = "embedBold" if is_bold else "embedRegular"
        emb = font_el.find(qn(f"w:{tag}"))
        if emb is None:
            emb = etree.SubElement(font_el, qn(f"w:{tag}"))
        emb.set(qn("w:fontKey"), "{" + str(key).upper() + "}")
        emb.set(qn("w:subsetted"), "0")
        emb.set(f"{{{_DOC_RELS_NS}}}id", rid)

    contents[rels_name] = etree.tostring(
        rels_root, xml_declaration=True, encoding="UTF-8", standalone=True
    )
    contents[ft_name] = etree.tostring(
        ft_root, xml_declaration=True, encoding="UTF-8", standalone=True
    )

    # ── settings flag ───────────────────────────────────────────────
    if "word/settings.xml" in contents:
        settings = etree.fromstring(contents["word/settings.xml"])
        if settings.find(qn("w:embedTrueTypeFonts")) is None:
            etree.SubElement(settings, qn("w:embedTrueTypeFonts"))
        contents["word/settings.xml"] = etree.tostring(
            settings, xml_declaration=True, encoding="UTF-8", standalone=True
        )

    # Write updated DOCX
    with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in contents.items():
            zout.writestr(name, data)


def _docx_title(book):
    en = (book.english_name or "").strip()
    bn = (book.book_name or "").strip()
    if en and bn and en.lower() != bn.lower():
        return f"{en}\n({bn})"
    return en or bn


_FOOTNOTES_RELTYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes"
)
_FOOTNOTES_CT = (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"
)
_W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def _insert_footnote(doc, paragraph, note_text):
    """Insert a real Word footnote reference at the end of `paragraph`."""
    fid = _add_footnote(doc, note_text)
    ref_run = paragraph.add_run()
    rPr = ref_run._r.get_or_add_rPr()
    va = parse_xml(f'<w:vertAlign {nsdecls("w")} w:val="superscript"/>')
    rPr.append(va)
    ref_run._r.append(parse_xml(f'<w:footnoteReference {nsdecls("w")} w:id="{fid}"/>'))
    return ref_run


def _add_footnote(doc, note_text):
    """Append a footnote to word/footnotes.xml, returning its id."""
    part = _footnotes_part(doc)
    root = etree.fromstring(part.blob)
    used = set()
    for fn in root.findall(qn("w:footnote")):
        try:
            used.add(int(fn.get(qn("w:id"))))
        except (TypeError, ValueError):
            pass
    fid = max(used | {1}) + 1

    fn = etree.SubElement(root, qn("w:footnote"))
    fn.set(qn("w:id"), str(fid))
    p = etree.SubElement(fn, qn("w:p"))
    r = etree.SubElement(p, qn("w:r"))
    rPr = etree.SubElement(r, qn("w:rPr"))
    sz = etree.SubElement(rPr, qn("w:sz"))
    sz.set(qn("w:val"), "18")
    t = etree.SubElement(r, qn("w:t"))
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = note_text
    part._blob = etree.tostring(
        root, xml_declaration=True, encoding="UTF-8", standalone=True
    )
    return fid


def _footnotes_part(doc):
    """Get (creating if needed) the word/footnotes.xml part."""
    for part in doc.part.package.iter_parts():
        if part.partname == "/word/footnotes.xml":
            return part

    from docx.opc.packuri import PackURI
    from docx.opc.part import Part

    blob = (
        b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        b'<w:footnotes xmlns:w="' + _W_NS.encode("ascii") + b'">'
        b'<w:footnote w:id="0"><w:p><w:r><w:separator/></w:r></w:p></w:footnote>'
        b'<w:footnote w:id="1"><w:p><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>'
        b"</w:footnotes>"
    )
    part = Part(PackURI("/word/footnotes.xml"), _FOOTNOTES_CT, blob, doc.part.package)
    doc.part.relate_to(part, _FOOTNOTES_RELTYPE)
    return part

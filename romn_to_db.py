'''
Convert VRI XML files directly to SQLite database without intermediate markdown files.
Extracts page numbers (T, V, P, M editions) from <pb> elements.
'''

import xml.etree.ElementTree as ET
from io import BytesIO, StringIO
import os, re, sys, json, sqlite3, unicodedata, subprocess
from pathlib import Path

DB_PATH = 'test_translations.db'
is_oldtrans = True
# ---------------------------------------------------------------------------
# XML → structured data
# ---------------------------------------------------------------------------

def process_rend(rend, text):
    if rend == "centre":
        return f"*{text.strip()}*"
    elif rend == "nikaya":
        return f"# {text.strip()}"
    elif rend == "book":
        return f"## {text.strip()}"
    elif rend == "chapter":
        return f"### {text.strip()}"
    elif rend == "title":
        return f"#### {text.strip()}"
    elif rend == "subhead":
        return f"##### {text.strip()}"
    elif rend == "subsubhead":
        return f"###### {text.strip()}"
    elif rend == "bodytext":
        return text
    elif rend == "paranum":
        return f"`{text.strip()}`"
    elif rend == "dot":
        return text.strip()
    elif rend == "bold":
        return f"**{text.strip()}**"
    elif rend.startswith("gatha"):
        return text.strip()
    return text


def strip_leading_zero(page_n):
    """Convert '3.0001' -> '3.1', '2.0001' -> '2.1', '3.0012' -> '3.12'."""
    if page_n and "." in page_n:
        vol, num = page_n.split(".", 1)
        return f"{vol}.{int(num)}"
    return page_n


def process_hi_elements_with_pb(element):
    """
    Render text content of a <p> element and track where <pb> tags occur.

    Returns:
        text   : full rendered string (pb positions marked with sentinel)
        pb_map : dict mapping sentinel key -> {ed: page_n} for pages starting at that position
    """
    # We insert a sentinel placeholder at each <pb> position so we can later
    # map sentence index → pages that began within that sentence.
    SENTINEL = "\x00PB{idx}\x00"
    result = ""
    pb_events = []  # list of (char_position, {ed: page_n})

    if element.text:
        result = element.text

    for child in element:
        if child.tag == "pb":
            ed = child.attrib.get("ed", "")
            n  = child.attrib.get("n", "")
            if ed and n:
                # Merge into the last event at this position if it exists, else new event
                pos = len(result)
                if pb_events and pb_events[-1][0] == pos:
                    pb_events[-1][1][ed] = strip_leading_zero(n)
                else:
                    pb_events.append((pos, {ed: strip_leading_zero(n)}))
            # if child.tail:          # ← add this
            #     result += child.tail  # ← and this
            # continue

        elif child.tag == "hi" and "rend" in child.attrib:
            rend = child.attrib["rend"]
            # Recursively process this <hi> element to capture nested <pb> and text
            inner_text, inner_pb_events = process_hi_elements_with_pb(child)
            # Adjust pb_event positions to be relative to current result length
            offset = len(result)
            for pos, pages in inner_pb_events:
                adjusted_pos = pos + offset
                if pb_events and pb_events[-1][0] == adjusted_pos:
                    pb_events[-1][1].update(pages)
                else:
                    pb_events.append((adjusted_pos, pages))
            result += process_rend(rend, inner_text)
        # elif child.tag == "trailer":
        #     result += f"*{(child.text or '').strip()}*"
        elif child.tag == "note":
            result += f" \\[{(child.text or '').strip()}\\] "
        else:
            if child.text:
                result += child.text
        if child.tail:
            result += child.tail

    return result if result else (element.text or ""), pb_events


def get_paranum(element):
    """Return the paranum value from a <hi rend='paranum'> child, or None."""
    for child in element:
        if child.tag == "hi" and child.attrib.get("rend") == "paranum":
            return (child.text or "").strip()
    return None


def parse_xml_to_paragraphs(file_path):
    """
    Parse a VRI XML file and return:
      paragraphs : list of dicts with keys:
                    rend, text, paranum, pb_events (list of (char_pos, {ed:page}))
      headings   : list of (para_index, heading_level, title)
    para_index is 1-based.
    """
    xml_string = open(file_path, encoding="utf-16").read()
    xml_bytes = xml_string.encode("utf-16")

    tree = ET.parse(BytesIO(xml_bytes))
    root = tree.getroot()

    body = root.find(".//body")
    if body is None:
        return [], []

    paragraphs = []
    headings = []

    def walk(elem):
        # if elem.tag in ("p", "trailer") and "rend" in elem.attrib:
        if elem.tag in ("p",) and "rend" in elem.attrib:
            rend = elem.attrib["rend"]
            raw_text, pb_events = process_hi_elements_with_pb(elem)
            processed_text = process_rend(rend, raw_text)
            paranum = get_paranum(elem)
            if not processed_text.strip():
                return

            para_index = len(paragraphs) + 1  # 1-based

            # Heading detection
            heading_level = None
            if rend == "nikaya":       heading_level = 1
            elif rend == "book":       heading_level = 2
            elif rend == "chapter":    heading_level = 3
            elif rend == "title":      heading_level = 4
            elif rend == "subhead":    heading_level = 5
            elif rend == "subsubhead": heading_level = 6

            if heading_level is not None:
                headings.append((para_index, heading_level, processed_text.lstrip("#").strip()))

            # paranum → heading level 10
            if paranum is not None:
                try:
                    start, end = (int(x) for x in paranum.split("-")) if "-" in paranum else (int(paranum), int(paranum))
                    for num in range(start, end + 1):
                        headings.append((para_index, 10, str(num)))
                except ValueError:
                    print(f"Non-numeric paranum: {paranum}")

            paragraphs.append({
                "text": processed_text,
                "raw_text": raw_text,
                "rend": rend,
                "paranum": paranum,
                "pb_events": pb_events,  # [(char_pos, {ed: page_n}), ...]
            })

            # Do NOT recurse into children of <p>/<trailer> — they are already
            # handled by process_hi_elements_with_pb. Recursing would cause
            # double-counting of any child elements that also have rend attributes.
            return

        elif elem.tag == "head" and "rend" in elem.attrib:
            rend = elem.attrib["rend"]
            text = elem.text or ""
            processed_text = process_rend(rend, text)
            para_index = len(paragraphs) + 1

            heading_level = None
            if rend == "nikaya":       heading_level = 1
            elif rend == "book":       heading_level = 2
            elif rend == "chapter":    heading_level = 3
            elif rend == "title":      heading_level = 4
            elif rend == "subhead":    heading_level = 5
            elif rend == "subsubhead": heading_level = 6

            if heading_level:
                headings.append((para_index, heading_level, processed_text.lstrip("#").strip()))

            paragraphs.append({
                "text": processed_text,
                "raw_text": text,
                "rend": rend,
                "paranum": None,
                "pb_events": [],
            })
            return  # <head> has no meaningful children to recurse into

        for child in elem:
            walk(child)

    for elem in body:
        walk(elem)

    return paragraphs, headings


# ---------------------------------------------------------------------------
# Sentence splitting (same logic as convert_md2db.py)
# ---------------------------------------------------------------------------

sentence_splitter = re.compile(
    r'(?<=[.!?])(?<!\d[.!?])(?<![0-9]`[.!?])\s+(?![^(]*\))(?![^\[]*\])'
)


def split_sentences(text):
    text = text.replace('. (', '.(').replace('. –', '–')
    # text = text.replace('.**', '**.').replace(';**', '**;').replace('!**', '**!')
    parts = sentence_splitter.split(text.strip())
    return [s.strip() for s in parts if s.strip()]

########### new splitter (to adapt with wikipali nissaya) ###################
if not is_oldtrans:
    sentence_splitter = re.compile(
        r'(?<=[.!?;])'
        r'(?<!\d[.!?])'
        r'(?<![0-9]`[.!?])'
        r'[\s]+'
        r'(?![^(]*\))'
        r'(?![^\[]*\])'
        r'|(?<=–)\s+(?=\")'
        r'|(?<=[.!?;])'          # must follow . ! ? or ;
        r'(?<!\d[.!?])'          # but not after digit+punctuation
        r'(?<![0-9]`[.!?])'      # but not after digit+backtick+punctuation
        r'(?=[A-ZĀĪŪṬḌ])'        # next char is a capital (extended set)
    )

    def split_sentences(text):
        text = text.replace('. (', '.(').replace('. –', '–')
        text = text.replace('.**', '**.').replace(';**', '**;').replace('!**', '**!').replace('?**', '**?')
        text = text.replace('‘‘','‘').replace('‘', '"')
        text = text.replace('’’','’').replace('’', '"') #’’
        parts = sentence_splitter.split(text.strip())
        return [s.strip() for s in parts if s.strip()]
else:
    


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def create_database(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sentences (
            book_id             TEXT,
            para_id             INTEGER,
            line_id             INTEGER,
            vripara             TEXT,
            thaipage            TEXT,
            vripage             TEXT,
            ptspage             TEXT,
            mypage              TEXT,
            pali_sentence       TEXT,
            english_translation   TEXT,
            vietnamese_translation  TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS headings (
            book_id         TEXT,
            para_id         INTEGER,
            heading_number  INTEGER,
            title           TEXT
        )
    ''')

    cursor.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS sentences_fts USING fts5(
            book_id UNINDEXED,
            para_id UNINDEXED,
            pali_paragraph,
            english_translation,
            vietnamese_translation
        )
    ''')

    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_book_id ON sentences (book_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_para_id ON sentences (para_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sentences_line_id ON sentences (line_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_headings_book_id ON headings (book_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_headings_para_id ON headings (para_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS sentences_indices ON sentences (book_id ASC,para_id ASC,line_id ASC)')

    conn.commit()
    return conn, cursor


def assign_pages_to_sentences(raw_text, pb_events, sentences):
    """
    Given the raw (pre-process_rend) text, the list of pb_events
    [(char_pos, {ed: page_n}), ...], and the split sentences,
    return a list of dicts (one per sentence) with keys thaipage/vripage/ptspage/mypage.
    Only the sentence that contains the char_pos of a <pb> gets that page number.
    """
    # Build cumulative character offsets for each sentence within raw_text.
    # We search for each sentence in order since split_sentences may alter spacing.
    offsets = []   # (start, end) char positions in raw_text per sentence
    cursor = 0
    for s in sentences:
        # Find the sentence starting from where we left off
        idx = raw_text.find(s, cursor)
        if idx == -1:
            # Fallback: use cursor position (shouldn't normally happen)
            offsets.append((cursor, cursor + len(s)))
            cursor += len(s)
        else:
            offsets.append((idx, idx + len(s)))
            cursor = idx + len(s)

    # For each sentence, collect pages whose char_pos falls within it
    result = [{} for _ in sentences]
    for char_pos, pages in pb_events:
        for i, (start, end) in enumerate(offsets):
            if start <= char_pos <= end:
                result[i].update(pages)
                break
        else:
            # If it falls between sentences (whitespace), assign to the next sentence
            for i, (start, end) in enumerate(offsets):
                if char_pos < start:
                    result[i].update(pages)
                    break

    return result


def process_xml_file(file_path, book_id, cursor):
    print(f'Processing: {file_path}')
    paragraphs, headings = parse_xml_to_paragraphs(file_path)

    for para_index, heading_level, title in headings:
        cursor.execute('''
            INSERT INTO headings (book_id, para_id, heading_number, title)
            VALUES (?, ?, ?, ?)
        ''', (book_id, para_index, heading_level, title))

    for para_index, para in enumerate(paragraphs, 1):
        text = para["text"]
        
        sentences = split_sentences(text)
        if not sentences:
            continue

        # FTS: whole paragraph
        pali_para_text = " ".join(sentences)
        cursor.execute('''
            INSERT INTO sentences_fts (book_id, para_id, pali_paragraph, english_translation, vietnamese_translation)
            VALUES (?, ?, ?, ?, ?)
        ''', (book_id, para_index, pali_para_text, "", ""))

        vripara = para["paranum"]
        sentence_pages = assign_pages_to_sentences(para["raw_text"], para["pb_events"], sentences)

        for line_id, (sentence, pages) in enumerate(zip(sentences, sentence_pages), 1):
            cursor.execute('''
                INSERT INTO sentences (
                    book_id, para_id, line_id,
                    vripara, thaipage, vripage, ptspage, mypage,
                    pali_sentence, english_translation, vietnamese_translation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                book_id, para_index, line_id,
                vripara,
                pages.get("T"),
                pages.get("V"),
                pages.get("P"),
                pages.get("M"),
                sentence, "", ""
            ))


# ---------------------------------------------------------------------------
# Books metadata (unchanged from convert_md2db.py)
# ---------------------------------------------------------------------------

def create_sqlite_insert(json_file, db_file):
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    cursor.execute('DROP TABLE IF EXISTS books')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id          INTEGER,
            book_id     TEXT,
            category    TEXT,
            nikaya      TEXT,
            sub_nikaya  TEXT,
            book_name   TEXT,
            mula_ref    TEXT,
            attha_ref   TEXT,
            tika_ref    TEXT,
            PRIMARY KEY(book_id)
        )
    ''')

    for item in data:
        index = item['Index']
        file_name = item['FileName'].replace('.md', '') if item['FileName'] else None
        long_nav = item['LongNavPath'].split(' > ')
        category  = long_nav[0].replace('Tipiṭaka (mūla)', 'Mūla') if long_nav else ''
        nikaya    = long_nav[1].replace(' (aṭṭhakathā)', '').replace(' (ṭīkā)', '') if len(long_nav) > 1 else ''
        sub_nikaya = long_nav[2].replace(' (aṭṭhakathā)', '').replace(' (ṭīkā)', '') if len(long_nav) > 3 else ''
        book_name = long_nav[-1] if len(long_nav) > 2 else ''

        mula_ref  = item['MulaIndex'].replace('.md', '')  if item['MulaIndex']  else None
        attha_ref = item['AtthakathaIndex'].replace('.md', '') if item['AtthakathaIndex'] else None
        tika_ref  = item['TikaIndex'].replace('.md', '')  if item['TikaIndex']  else None

        cursor.execute('''
            INSERT OR REPLACE INTO books (
                id, book_id, category, nikaya, sub_nikaya, book_name,
                mula_ref, attha_ref, tika_ref
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            index, file_name, category, nikaya, sub_nikaya, book_name,
            mula_ref, attha_ref, tika_ref
        ))

    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    current_dir = Path(__file__).parent
    xml_folder  = Path(current_dir, 'romn')       # VRI XML source folder
    db_name     = DB_PATH

    if os.path.exists(db_name):
        os.remove(db_name)
    conn, cursor = create_database(db_name)

    for xml_file in sorted(xml_folder.glob('*.xml')):
        book_id = xml_file.stem
        process_xml_file(xml_file, book_id, cursor)

    conn.commit()
    conn.close()

    books_json = current_dir / 'books.json'
    if books_json.exists():
        create_sqlite_insert(str(books_json), db_name)

    # Copy words table from the existing Tipitaka Pali Reader database
    src_db = os.path.expanduser(
        # '~/.var/app/org.americanmonk.TipitakaPaliReader/data/tipitaka_pali_reader/tipitaka_pali.db'
        '~/Library/Containers/org.americanmonk.tpp/Data/Documents/tipitaka_pali.db'
    )
    if os.path.exists(src_db):
        cmd = f'sqlite3 "{src_db}" ".dump words" | sqlite3 "{db_name}"'
        subprocess.run(cmd, shell=True, check=True)
    else:
        print(f"Warning: source DB not found at {src_db}, skipping words table copy.")



###############################################################
############# UPDATE PAGE NUMBER ##############################
###############################################################
PAGE_COLS = ["thaipage", "vripage", "ptspage", "mypage"]

def is_heading(pali_sentence: str) -> bool:
    """Check if a line is a markdown heading."""
    return pali_sentence is not None and pali_sentence.strip().startswith("#")


def is_namo(pali_sentence: str) -> bool:
    """Check if a line is a *Namo...* style line."""
    s = pali_sentence.strip() if pali_sentence else ""
    return 'tassa bhagavato arahato sammāsambuddhassa' in s

def is_paranum(pali_sentence: str) -> bool:
    "check if it is only a paragraph number"
    return pali_sentence[0] == '`' and len(pali_sentence) < 10


def find_target_row(rows, current_idx):
    """
    Given the list of all rows (ordered by rowid) and the index of the row
    with page numbers, walk backwards to find the target row that should
    receive the page numbers.

    Returns the rowid of the target row, or None if no relocation needed.
    """
    # Walk backwards from the row just before current_idx
    headings_seen = []  # list of (rowid, pali_sentence) for heading rows passed

    for i in range(current_idx - 1, -1, -1):
        row = rows[i]
        rowid, book_id, para_id, line_id, pali = (
            row["rowid"], row["book_id"], row["para_id"], row["line_id"], row["pali_sentence"] or ""
        )

        if is_heading(pali) or is_paranum(pali):
            headings_seen.append(row)
            continue
        else:
            # Non-heading row found
            if is_namo(pali):
                # Move page number to this *Namo...* line
                return row["rowid"]
            else:
                # Move to the first top-level '#' heading (single #) among seen headings
                # (the last one appended = the closest heading = lowest level;
                #  the first appended = the one farthest back = highest ancestor)
                # We want the single-# heading if present, else the closest heading
                for h in headings_seen:
                    h_pali = (h["pali_sentence"] or "").strip()
                    if h_pali.startswith("# ") or h_pali == "#":
                        return h["rowid"]
                # Fallback: return the farthest heading (first seen while walking back)
                if headings_seen:
                    return headings_seen[-1]["rowid"]  # closest heading
                return None  # nothing to move

    # Reached the beginning — if only headings were seen, pick the # heading
    for h in headings_seen:
        h_pali = (h["pali_sentence"] or "").strip()
        if h_pali.startswith("# ") or h_pali == "#":
            return h["rowid"]
    if headings_seen:
        return headings_seen[-1]["rowid"]
    return None


def preview_page_relocations(db_path: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Fetch all rows ordered by rowid
    cur.execute("""
        SELECT rowid, book_id, para_id, line_id, vripara,
               thaipage, vripage, ptspage, mypage,
               pali_sentence, english_translation
        FROM sentences
        ORDER BY book_id, para_id, line_id
    """)
    rows = cur.fetchall()

    # Build a rowid → index map
    rowid_to_idx = {row["rowid"]: i for i, row in enumerate(rows)}
    # Build a rowid → row map
    rowid_to_row = {row["rowid"]: row for row in rows}

    changes = []  # list of dicts describing proposed changes

    for idx, row in enumerate(rows):
        # Check if this row has any page numbers
        has_pages = any(row[col] for col in PAGE_COLS)
        if not has_pages:
            continue

        target_rowid = find_target_row(rows, idx)

        if target_rowid is None or target_rowid == row["rowid"]:
            # No relocation needed
            continue

        target = rowid_to_row[target_rowid]

        change = {
            "source_rowid": row["rowid"],
            "source_book_id": row["book_id"],
            "source_para_id": row["para_id"],
            "source_line_id": row["line_id"],
            "source_pali": (row["pali_sentence"] or "")[:80],
            "target_rowid": target_rowid,
            "target_book_id": target["book_id"],
            "target_para_id": target["para_id"],
            "target_line_id": target["line_id"],
            "target_pali": (target["pali_sentence"] or "")[:80],
        }
        for col in PAGE_COLS:
            change[col] = row[col]
        changes.append(change)

    conn.close()

    if not changes:
        print("No relocations found.")
        return changes

    print(f"{'='*100}")
    print(f"Found {len(changes)} page number(s) to relocate:\n")
    for c in changes:
        pages = {col: c[col] for col in PAGE_COLS if c[col]}
        print(f"  SOURCE  rowid={c['source_rowid']} ({c['source_book_id']} para={c['source_para_id']} line={c['source_line_id']})")
        print(f"          pali: {c['source_pali']}")
        print(f"          pages: {pages}")
        print(f"  TARGET  rowid={c['target_rowid']} ({c['target_book_id']} para={c['target_para_id']} line={c['target_line_id']})")
        print(f"          pali: {c['target_pali']}")
        print(f"  {'─'*96}")

    return changes


def apply_page_relocations(db_path: str, changes: list):
    """
    Call this ONLY after reviewing the preview output and confirming it looks correct.
    """
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    for c in changes:
        # Set page numbers on the target row
        for col in PAGE_COLS:
            if c[col]:
                cur.execute(
                    f"UPDATE sentences SET {col} = ? WHERE rowid = ?",
                    (c[col], c["target_rowid"])
                )
        # Clear page numbers from the source row
        set_nulls = ", ".join(f"{col} = NULL" for col in PAGE_COLS)
        cur.execute(
            f"UPDATE sentences SET {set_nulls} WHERE rowid = ?",
            (c["source_rowid"],)
        )
    conn.commit()
    conn.close()
    print(f"Applied {len(changes)} relocations.")




if __name__ == '__main__':
    # main()

    # Step 1: Preview
    changes = preview_page_relocations(DB_PATH)

    # Step 2: Uncomment the line below ONLY after you've reviewed the output
    apply_page_relocations(DB_PATH, changes)
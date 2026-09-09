import re
import sqlite3
from pathlib import Path

def split_md_to_sentences(md_text):
    paragraphs = md_text.split("\n")
    para_counter = 1
    result = []
    sentence_splitter = re.compile(r'(?<=[.!?])(?<!\d[.!?])(?<![0-9]`[.!?])\s*(?![^(]*\))')

    for paragraph in paragraphs:
        if paragraph.strip():
            sentences = sentence_splitter.split(paragraph.strip())
            sentences = [s.strip() for s in sentences if s.strip()]
            for line_idx, sentence in enumerate(sentences, 1):
                result.append({"para_id": str(para_counter), "line_id": str(line_idx), "text": sentence})
            para_counter += 1
    
    return result

def compare_with_db(md_sentences, db_path, book_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    differences = []

    cursor.execute("SELECT para_id, line_id, pali_sentence FROM sentences WHERE book_id = ?", (book_id,))
    db_sentences = cursor.fetchall()

    updated_para = 0
    for idx, md_sent in enumerate(md_sentences):
        para_id, line_id, md_text = md_sent["para_id"], md_sent["line_id"], md_sent["text"]
        db_match = next((s for p, l, s in db_sentences if str(p) == para_id and str(l) == line_id), None)
        if not db_match:
            differences.append({
                "para_id": para_id,
                "line_id": line_id,
                "md_text": md_text,
                "db_text": None
            })
            #add this line to database
            cursor.execute("INSERT INTO sentences (book_id, para_id, line_id, pali_sentence) VALUES (?, ?, ?, ?)", (book_id, para_id, line_id, md_text))
            continue
        if md_text != db_match.strip():
            # Compare current and next MD line with current DB line
            db_line_id = int(line_id)
            if idx + 1 < len(md_sentences) and md_sentences[idx + 1]["para_id"] == para_id:
                next_md_text = md_sentences[idx + 1]["text"]
                if next_md_text != db_match.strip():
                    if next_md_text.replace('<br/>', '') == db_match.strip():
                        cursor.execute("UPDATE sentences SET pali_sentence = ? WHERE book_id = ? AND para_id = ? AND line_id = ?", (md_text, book_id, para_id, line_id))
                        continue

                    differences.append({
                        "para_id": para_id,
                        "line_id": line_id,
                        "md_text": md_text,
                        "db_text": db_match.strip()
                    })
                    # Update the DB with the MD text
                    # cursor.execute("UPDATE sentences SET pali_sentence = ?, vietnamese_sentence = ? WHERE book_id = ? AND para_id = ? AND line_id = ?", (md_text, '', book_id, para_id, line_id))
                    cursor.execute("UPDATE sentences SET pali_sentence = ? WHERE book_id = ? AND para_id = ? AND line_id = ?", (md_text, book_id, para_id, line_id))

                else:
                    if  updated_para != para_id:
                        print(f"Skipping {para_id}-{line_id} as it matches the next MD line.")
                        cursor.execute("UPDATE sentences SET line_id = line_id + 1 WHERE book_id = ? AND para_id = ? AND line_id >= ?", (book_id, para_id, line_id))
                        updated_para = para_id
            else:
                differences.append({
                    "para_id": para_id,
                    "line_id": line_id,
                    "md_text": md_text,
                    "db_text": db_match.strip()
                })
                # Update the DB with the MD text
                cursor.execute("UPDATE sentences SET pali_sentence = ?, vietnamese_sentence = ? WHERE book_id = ? AND para_id = ? AND line_id = ?", (md_text, '', book_id, para_id, line_id))

    conn.commit()
    conn.close()
    return differences

def main():
    md_folder = Path("../tipitaka_md")
    db_path = Path("translations.db")
    
    for md_file in md_folder.glob("*.md"):
        book_id = md_file.stem
        with open(md_file, "r", encoding="utf-8") as f:
            md_text = f.read()
        md_sentences = split_md_to_sentences(md_text)
        
        print(f"Comparing {md_file.name} with database...")
        differences = compare_with_db(md_sentences, db_path, book_id)
        if differences:
            # print(f"Differences found in {md_file.name}:")
            # for diff in differences:
            #     print(f"Para ID: {diff['para_id']}, Line ID: {diff['line_id']}")
            #     print(f"MD Text: {diff['md_text']}")
            #     print(f"DB Text: {diff['db_text']}")
            #     print("-" * 50)
            print(f"Total differences found: {len(differences)}")
            # exit()

if __name__ == "__main__":
    main()
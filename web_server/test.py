import sqlite3
import re

DB_PATH = "translations.db"
BATCH_SIZE = 50000

def fix_spaces(text):
    if text is None:
        return None
    return re.sub(r' {2,}', ' ', text)

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=-64000")  # 64MB cache
    cur = conn.cursor()

    # Only fetch rows that actually have double spaces
    cur.execute("""
        SELECT rowid, pali_sentence
        FROM sentences
        WHERE pali_sentence LIKE '%  %'
    """)

    batch = []
    total = 0

    while True:
        rows = cur.fetchmany(BATCH_SIZE)
        if not rows:
            break

        for rowid, text in rows:
            fixed = fix_spaces(text)
            if fixed != text:
                batch.append((fixed, rowid))

        if batch:
            conn.executemany(
                "UPDATE sentences SET pali_sentence = ? WHERE rowid = ?",
                batch
            )
            conn.commit()
            total += len(batch)
            print(f"Updated {total} rows so far...")
            batch.clear()

    conn.close()
    print(f"Done. Total rows updated: {total}")

if __name__ == "__main__":
    main()

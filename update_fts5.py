import pysqlite3 as sqlite3
import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import os
import csv
import json  # New: For embedding serialization
import sqlite_vec  # New: Successor extension
import sqlite_vss
import unicodedata  # New: For diacritics stripping
from collections import defaultdict  # New: For word frequency tracking

RESET = True

# Connect to database
db_path = 'translations.db'
print("Step 1: Connecting to database...")
conn = sqlite3.connect(db_path)
print("Step 1: Connected successfully.")
cursor = conn.cursor()
print("Step 1: Cursor created.")
conn.enable_load_extension(True)
print("Step 1: Load extension enabled.")
sqlite_vss.load(conn)

print("Step 2: Loading sqlite-vec extension...")
sqlite_vec.load(conn)
print("Step 2: sqlite-vec loaded successfully.")

# Drop existing tables BEFORE loading extension
if RESET:
    print("Step 3: Dropping tables (pre-extension load)...")
    cursor.execute('DROP TABLE IF EXISTS sentences_fts')
    print("Step 3a: sentences_fts dropped.")
    cursor.execute('DROP TABLE IF EXISTS sentences_vec')
    print("Step 3b: sentences_vec dropped.")
    cursor.execute('DROP TABLE IF EXISTS words')
    print("Step 3.c: words table is dropped.")
    conn.commit()
    print("Step 3: Tables dropped successfully.")


# Recreate tables AFTER load
if RESET:
    print("Step 4: Creating sentences_fts table...")
    cursor.execute('''
        CREATE VIRTUAL TABLE sentences_fts USING fts5(
            book_id UNINDEXED,
            para_id UNINDEXED,
            pali_paragraph,
            english_paragraph,
            vietnamese_paragraph,
            content_rowid='rowid'
        )
    ''')
    print("Step 4: sentences_fts created successfully.")

    print("Step 5: Creating sentences_vec table...")
    cursor.execute('''
        CREATE VIRTUAL TABLE sentences_vec USING vec0(
            embedding float[384],
            book_id text,
            para_id int
        )
    ''')
    print("Step 5: sentences_vec created successfully.")

    print("Step 5.5: Creating words table if not exists...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS "words" (
            "word" TEXT COLLATE NOCASE,
            "plain" TEXT COLLATE NOCASE,
            "frequency" INTEGER
        )
    ''')
    print("Step 5.5: words table created if not exists.")
    conn.commit()
    print("Step 5: Commit after table creation successful.")

print("Step 6: Querying paragraphs from sentences table...")
cursor.execute('''
    SELECT book_id, para_id,
           GROUP_CONCAT(pali_sentence, ' ') AS pali_paragraph,
           GROUP_CONCAT(english_translation, ' ') AS english_paragraph,
           GROUP_CONCAT(vietnamese_translation, ' ') AS vietnamese_paragraph
    FROM sentences
    GROUP BY book_id, para_id
''')
rows = cursor.fetchall()
print(f"Step 6: Found {len(rows)} paragraphs in sentences table.")

# Step 6.5: Extract words from paragraphs
print("Step 6.5: Extracting words from paragraphs...")
def strip_diacritics(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

word_data = defaultdict(lambda: {'plain': '', 'freq': 0})

for row in tqdm(rows, desc="Extracting words"):
    book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph = row
    pali_paragraph = pali_paragraph.replace('*', '') if pali_paragraph else ''
    
    for field, do_strip in [(pali_paragraph, True), (english_paragraph, False), (vietnamese_paragraph, False)]:
        if not field:
            continue
        words = field.split()
        for w in words:
            w = w.strip('.,!?;:"()[]{}#*').lower()
            if w:
                if word_data[w]['plain'] == '':  # First time seeing this word
                    plain = strip_diacritics(w) if do_strip else w
                    word_data[w]['plain'] = plain
                word_data[w]['freq'] += 1

print(f"Step 6.5: Extracted {len(word_data)} unique words.")

# Optional CSV (batch write for efficiency)
csvfile = open('output.csv', 'w', newline='', encoding='utf-8')
writer = csv.writer(csvfile)
writer.writerow(['book_id', 'para_id', 'pali_paragraph', 'english_paragraph', 'vietnamese_paragraph'])

if RESET:
    print("Step 7: Inserting into sentences_fts (progress every 1000)...")
    insert_count = 0
    for row in rows:
        book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph = row
        pali_paragraph = pali_paragraph.replace('*', '')

        writer.writerow([book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph])
        
        cursor.execute('''
            INSERT INTO sentences_fts (book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph)
            VALUES (?, ?, ?, ?, ?)
        ''', (book_id, para_id, pali_paragraph, english_paragraph, vietnamese_paragraph))
        
        insert_count += 1
        if insert_count % 10000 == 0:
            print(f"Step 7: Inserted {insert_count}/{len(rows)} rows into FTS.")
            conn.commit()
    
    print("Step 7: All FTS inserts complete.")
    conn.commit()
    print("Step 7: Final FTS commit successful.")

csvfile.close()
print("Step 8: CSV writing complete.")

# # Generate embeddings
# print('Step 9: Generating embeddings vectors...')
# model = SentenceTransformer('intfloat/multilingual-e5-small', device='cpu')
# texts = [f"{row[2]} [SEP] {row[3]}" for row in rows]

# batch_size = 64
# embeddings = []
# if os.path.exists('embeddings.npz'):
#     embeddings = np.load('embeddings.npz')['embeddings']
#     print("Step 9: Loaded existing embeddings from file.")
# else:
#     print("Step 9: Encoding texts in batches...")
#     for i in tqdm(range(0, len(texts), batch_size), desc="Encoding texts"):
#         batch_texts = texts[i:i + batch_size]
#         batch_embeddings = model.encode(
#             batch_texts,
#             normalize_embeddings=True,
#             batch_size=batch_size,
#             show_progress_bar=False,
#             convert_to_numpy=True
#         ).astype(np.float32)
#         embeddings.append(batch_embeddings)
#     embeddings = np.concatenate(embeddings)
#     print("Step 9: Embeddings generation complete.")

# # Insert embeddings
# print('Step 10: Inserting embeddings into sentences_vec (progress every 1000)...')
# insert_count = 0
# for i in range(len(rows)):
#     row = rows[i]
#     book_id, para_id, _, _, _ = row
#     # Serialize as JSON array for vec0
#     emb_json = json.dumps(embeddings[i].tolist())
#     cursor.execute(
#         "INSERT INTO sentences_vec (embedding, book_id, para_id) VALUES (?, ?, ?)",
#         (emb_json, book_id, para_id)
#     )
    
#     insert_count += 1
#     if insert_count % 1000 == 0:
#         print(f"Step 10: Inserted {insert_count}/{len(rows)} embeddings.")
#         conn.commit()

# print("Step 10: All embeddings inserts complete.")
# conn.commit()
# print("Step 10: Final embeddings commit successful.")

# Step 11: Insert words into words table
print("Step 11: Inserting words into words table...")
insert_count = 0
for word, data in tqdm(word_data.items(), desc="Inserting words"):
    cursor.execute(
        'INSERT OR REPLACE INTO "words" ("word", "plain", "frequency") VALUES (?, ?, ?)',
        (word, data['plain'], data['freq'])
    )
    insert_count += 1
    if insert_count % 1000 == 0:
        print(f"Step 11: Inserted {insert_count}/{len(word_data)} words.")
        conn.commit()
print("Step 11: All words inserts complete.")
conn.commit()
print("Step 11: Final words commit successful.")

print("Database update complete.")
conn.close()

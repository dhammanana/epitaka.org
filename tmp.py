import sqlite3
import pandas as pd

# Connect to the SQLite database
conn = sqlite3.connect('translations.db')

# Query the headings table, ordered by book_id and para_id
query = """
SELECT book_id, para_id, heading_number, title
FROM headings
ORDER BY book_id, para_id
"""
df = pd.read_sql_query(query, conn)

# Compute max_para_id + 1 (exclusive end) per book from the paragraphs table
books = df['book_id'].unique()
max_ends = {}
for book in books:
    max_query = f"""
    SELECT MAX(para_id) + 1 as max_end
    FROM sentences
    WHERE book_id = '{book}'
    """
    result = pd.read_sql_query(max_query, conn)
    if not result.empty and pd.notna(result.iloc[0]['max_end']):
        max_ends[book] = int(result.iloc[0]['max_end'])
    else:
        # Fallback: use max from headings if paragraphs table is unavailable
        fallback_query = f"""
        SELECT MAX(para_id) + 1 as max_end
        FROM headings
        WHERE book_id = '{book}'
        """
        fallback_result = pd.read_sql_query(fallback_query, conn)
        max_ends[book] = int(fallback_result.iloc[0]['max_end'])

# Close the connection temporarily
conn.close()

# Function to compute count_para within a group (per book)
def compute_count_para(group, max_end):
    # Ensure sorted by para_id
    group = group.sort_values('para_id').reset_index(drop=True)
    n = len(group)
    count_list = [pd.NA] * n
    for i in range(n):
        H = group.iloc[i]['heading_number']
        P = group.iloc[i]['para_id']
        found = False
        for j in range(i + 1, n):
            if group.iloc[j]['heading_number'] <= H:
                count_list[i] = group.iloc[j]['para_id'] - P
                found = True
                break
        if not found:
            count_list[i] = max_end - P
    group['count_para'] = count_list
    return group

# Apply computation per book
df = df.groupby('book_id', group_keys=False).apply(
    lambda g: compute_count_para(g, max_ends[g.name])
).sort_values(['book_id', 'para_id']).reset_index(drop=True)

# Convert count_para to nullable integer
df['count_para'] = df['count_para'].astype('Int64')

# Reconnect to create/insert into the new table
conn = sqlite3.connect('translations.db')

# Drop if exists
conn.execute('DROP TABLE IF EXISTS headings_with_count;')

# Create table with explicit types
create_table_sql = """
CREATE TABLE headings_with_count (
    book_id TEXT,
    para_id INTEGER,
    heading_number INTEGER,
    title TEXT,
    count_para INTEGER
)
"""
conn.execute(create_table_sql)

# Insert data
df.to_sql('headings_with_count', conn, index=False, if_exists='append')

# Close connection
conn.close()

# Verification: Print schema and preview for the example book (adjust book_id as needed)
conn = sqlite3.connect('translations.db')
schema_query = "PRAGMA table_info(headings_with_count)"
schema = pd.read_sql_query(schema_query, conn)
print("Table Schema:")
print(schema)

data_query = """
SELECT para_id, heading_number, title, count_para
FROM headings_with_count 
WHERE book_id = 'abh01a.att'  -- Replace with actual book_id, e.g., 'abh01a.att'
ORDER BY para_id 
LIMIT 10
"""
preview = pd.read_sql_query(data_query, conn)
print("\nPreview:")
print(preview)
conn.close()
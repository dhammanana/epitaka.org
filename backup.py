import sqlite3
import shutil
import os
from datetime import datetime

def create_minimal_backup(source_db='translations.db', backup_dir='backup'):
    temp_db = 'temp_minimal.db'
    os.makedirs(backup_dir, exist_ok=True)
    
    # Create empty temp DB
    conn_temp = sqlite3.connect(temp_db)
    conn_source = sqlite3.connect(source_db)
    
    # Copy schema for the 4 tables
    schema_sql = conn_source.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name IN ('books', 'headings', 'headings_with_count', 'sentences');").fetchall()
    for table_sql in schema_sql:
        if table_sql[0]:  # Skip None
            conn_temp.executescript(table_sql[0])
    
    # Copy data for each table
    tables = ['books', 'headings', 'headings_with_count', 'sentences']
    for table in tables:
        data = conn_source.execute(f"SELECT * FROM {table};").fetchall()
        if data:
            placeholders = ','.join(['?' for _ in data[0]])
            conn_temp.executemany(f"INSERT INTO {table} VALUES ({placeholders})", data)
    
    conn_temp.commit()
    conn_source.close()
    conn_temp.close()
    
    # Tar the temp DB
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    tar_path = os.path.join(backup_dir, f'backup_{timestamp}.tar.gz')
    shutil.make_archive(tar_path[:-7], 'gztar', temp_db)  # Extracts to backup_*.tar.gz
    os.unlink(temp_db)
    print(f"Minimal backup created: {tar_path}")

# Run it
create_minimal_backup()
"""
convert_refs.py

Converts mula_ref, attha_ref, and tika_ref columns in the books table
from numeric IDs (possibly comma-separated lists) to their corresponding
book_id values.

Usage:
    python convert_refs.py                  # uses translations.db in current dir
    python convert_refs.py path/to/my.db    # specify a different path
"""

import sqlite3
import sys
import shutil
from pathlib import Path


def ids_to_book_ids(value: str, id_map: dict) -> str | None:
    """Convert a single ID or comma-separated list of IDs to book_id(s)."""
    if value is None:
        return None

    parts = [p.strip() for p in str(value).split(" ") if p.strip()]
    resolved = []

    for part in parts:
        try:
            numeric_id = int(part)
        except ValueError:
            # Already a non-numeric value (e.g. already converted) — keep as-is
            resolved.append(part)
            continue

        book_id = id_map.get(numeric_id)
        if book_id is None:
            print(f"  WARNING: no book found for id={numeric_id}, keeping raw value")
            resolved.append(part)
        else:
            resolved.append(book_id)

    return " ".join(resolved) if resolved else None


def convert_refs(db_path: str):
    db_file = Path(db_path)
    if not db_file.exists():
        print(f"ERROR: database not found: {db_path}")
        sys.exit(1)

    # Backup before making changes
    backup_path = db_file.with_suffix(".db.bak")
    shutil.copy2(db_file, backup_path)
    print(f"Backup created: {backup_path}")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Build a full id -> book_id map from the books table
    cur.execute("SELECT id, book_id FROM books")
    id_map = {row["id"]: row["book_id"] for row in cur.fetchall()}
    print(f"Loaded {len(id_map)} book id->book_id mappings")

    # Fetch all rows that have at least one ref to convert
    cur.execute("""
        SELECT id, mula_ref, attha_ref, tika_ref
        FROM books
        WHERE mula_ref IS NOT NULL
           OR attha_ref IS NOT NULL
           OR tika_ref  IS NOT NULL
    """)
    rows = cur.fetchall()
    print(f"Rows to process: {len(rows)}")

    updated = 0
    for row in rows:
        new_mula  = ids_to_book_ids(row["mula_ref"],  id_map)
        new_attha = ids_to_book_ids(row["attha_ref"], id_map)
        new_tika  = ids_to_book_ids(row["tika_ref"],  id_map)

        # Only update if something actually changed
        if (new_mula  != str(row["mula_ref"])  if row["mula_ref"]  is not None else new_mula  is not None) or \
           (new_attha != str(row["attha_ref"]) if row["attha_ref"] is not None else new_attha is not None) or \
           (new_tika  != str(row["tika_ref"])  if row["tika_ref"]  is not None else new_tika  is not None):

            cur.execute("""
                UPDATE books
                SET mula_ref  = ?,
                    attha_ref = ?,
                    tika_ref  = ?
                WHERE id = ?
            """, (new_mula, new_attha, new_tika, row["id"]))
            updated += 1

    conn.commit()
    conn.close()
    print(f"Done. {updated} rows updated.")


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else "translations.db"
    convert_refs(db_path)

#!/usr/bin/env python3
"""
Book ID Update Script
=====================
Step 1: Run with --export to generate books_export.json
Step 2: Edit book_id values in books_export.json
Step 3: Run with --update --db <path> to apply changes to the database

Usage:
    python update_book_id.py --export --db path/to/database.db
    # Edit books_export.json manually
    python update_book_id.py --update --db path/to/database.db

How book_id scoping works
--------------------------
Each book owns an exclusive para_id range:
    [para_id, para_id + chapter_len - 1]

When updating dependent tables (headings, sentences, etc.) we therefore
restrict every UPDATE to rows whose para_id falls inside that range AND
whose current book_id matches the old value.  This prevents accidentally
touching rows that belong to a different book which happens to share the
same old book_id string (possible after previous bulk-renames) or the
same para_id numbers (very common – many books start at para_id = 1).
"""

import sqlite3
import json
import argparse
import sys
from pathlib import Path

EXPORT_FILE = "books_export.json"

# The books table itself is keyed on book_id with no para_id range filter.
# All other tables are updated with a para_id range constraint.
BOOKS_TABLE = "books"
DEPENDENT_TABLES = [
    "headings",
    "headings_with_count",
    "pali_definition",
    "sentences",
]


def export_books(db_path: str):
    """Export books table to JSON for manual editing."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM books ORDER BY para_id")
    rows = cur.fetchall()
    conn.close()

    books = [dict(row) for row in rows]

    with open(EXPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(books)} books to '{EXPORT_FILE}'")
    print("Edit the 'book_id' values in that file, then run --update.")


def load_export() -> list[dict]:
    if not Path(EXPORT_FILE).exists():
        print(f"ERROR: '{EXPORT_FILE}' not found. Run --export first.")
        sys.exit(1)
    with open(EXPORT_FILE, encoding="utf-8") as f:
        return json.load(f)


def build_changes(
    original_rows: list[dict], edited_rows: list[dict]
) -> list[dict]:
    """
    Return a list of change descriptors, one per book whose book_id changed.

    Each descriptor:
        {
            "old_id":      str,   # current book_id in DB
            "new_id":      str,   # desired book_id
            "para_start":  int,   # inclusive start of the book's para_id range
            "para_end":    int,   # inclusive end   (para_start + chapter_len - 1)
        }

    Matching between original and edited rows is done by the row's primary
    key (`id`), which must not be changed by the user.
    """
    orig_by_id: dict[int, dict] = {r["id"]: r for r in original_rows}

    changes: list[dict] = []
    warnings: list[str] = []

    for edited in edited_rows:
        row_id = edited["id"]
        orig = orig_by_id.get(row_id)

        if orig is None:
            warnings.append(
                f"  Row id={row_id} not found in DB — skipped"
            )
            continue

        old_id = orig["book_id"]
        new_id = edited["book_id"]

        if old_id == new_id:
            continue  # nothing to do

        para_start: int = orig["para_id"]
        chapter_len: int = orig["chapter_len"]
        para_end: int = para_start + chapter_len - 1

        changes.append(
            {
                "old_id": old_id,
                "new_id": new_id,
                "para_start": para_start,
                "para_end": para_end,
            }
        )

    if warnings:
        print("Warnings during mapping:")
        for w in warnings:
            print(w)

    return changes


def update_database(db_path: str):
    """Apply book_id changes derived from the edited JSON to all relevant tables."""
    edited_rows = load_export()

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Fetch current state of books table for comparison
    cur.execute("SELECT * FROM books")
    original_rows = [dict(r) for r in cur.fetchall()]

    changes = build_changes(original_rows, edited_rows)

    if not changes:
        print("No book_id changes detected. Nothing to update.")
        conn.close()
        return

    print(f"\nDetected {len(changes)} book_id change(s):")
    for c in changes:
        print(
            f"  '{c['old_id']}'  ->  '{c['new_id']}'  "
            f"(para_id {c['para_start']}..{c['para_end']})"
        )

    # Detect which tables actually exist in the DB
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = {r["name"] for r in cur.fetchall()}

    pragma_cur = conn.cursor()

    def col_exists(table: str, column: str) -> bool:
        pragma_cur.execute(f"PRAGMA table_info({table})")
        return any(r["name"] == column for r in pragma_cur.fetchall())

    try:
        conn.execute("BEGIN")

        for change in changes:
            old_id = change["old_id"]
            new_id = change["new_id"]
            para_start = change["para_start"]
            para_end = change["para_end"]

            # ── 1. Update the books table (no para_id range needed here
            #        because book_id is the unique identifier for the row) ──
            if BOOKS_TABLE in existing_tables and col_exists(BOOKS_TABLE, "book_id"):
                cur.execute(
                    f"UPDATE {BOOKS_TABLE} SET book_id = ? WHERE book_id = ?",
                    (new_id, old_id),
                )
                if cur.rowcount:
                    print(f"  Updated {cur.rowcount:5d} row(s) in '{BOOKS_TABLE}'")

            # ── 2. Update dependent tables, scoped to this book's para_id range ──
            for table in DEPENDENT_TABLES:
                if table not in existing_tables:
                    continue
                if not col_exists(table, "book_id"):
                    continue
                if not col_exists(table, "para_id"):
                    # Fallback: no para_id column — update by book_id only
                    # (should not normally happen, but handled gracefully)
                    cur.execute(
                        f"UPDATE {table} SET book_id = ? WHERE book_id = ?",
                        (new_id, old_id),
                    )
                else:
                    cur.execute(
                        f"""UPDATE {table}
                               SET book_id = ?
                             WHERE book_id = ?
                               AND para_id BETWEEN ? AND ?""",
                        (new_id, old_id, para_start, para_end),
                    )
                if cur.rowcount:
                    print(f"  Updated {cur.rowcount:5d} row(s) in '{table}'")

        conn.commit()
        print("\nAll changes committed successfully.")

    except Exception as exc:
        conn.rollback()
        print(f"\nERROR: {exc}")
        print("Transaction rolled back — database unchanged.")
        sys.exit(1)
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(
        description="Update book_id across database tables."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--export",
        action="store_true",
        help="Export books table to books_export.json for editing",
    )
    group.add_argument(
        "--update",
        action="store_true",
        help="Apply edited books_export.json changes to the database",
    )
    parser.add_argument(
        "--db",
        required=True,
        metavar="PATH",
        help="Path to the SQLite database file",
    )

    args = parser.parse_args()

    if not Path(args.db).exists():
        print(f"ERROR: Database file '{args.db}' not found.")
        sys.exit(1)

    if args.export:
        export_books(args.db)
    elif args.update:
        update_database(args.db)


if __name__ == "__main__":
    main()
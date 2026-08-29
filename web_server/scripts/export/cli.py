#!/usr/bin/env python3
"""
cli.py — E-Piṭaka Export Script

Convert books from the Chaṭṭha Saṅgāyana Tipiṭaka to EPUB, PDF, Markdown, and DOCX.

Usage:
    python -m scripts.export.cli --book Dhp --lang en --formats epub,pdf
    python -m scripts.export.cli --all --lang en --formats epub,pdf,md,docx
    python -m scripts.export.cli --list-languages
    python -m scripts.export.cli --book Dhp --lang en --output-dir ./out

Output naming:
    {book_id}_{lang}.{ext}  — e.g. Dhp_en.epub, Dhp_en.pdf
"""
import argparse
import os
import re
import sys
import time

# Add the parent directory to the path so we can import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.export.data_loader import (
    load_book, load_all_books, list_available_languages,
)
from scripts.export.cover import generate_cover
from scripts.export.epub_builder import build_epub
from scripts.export.pdf_builder import build_pdf
from scripts.export.md_builder import build_markdown
from scripts.export.docx_builder import build_docx


def _sanitize_name(name: str) -> str:
    """Convert a book name to a safe folder name.

    Removes or replaces characters that are unsafe for file paths,
    while preserving Unicode letters (including non-Latin scripts).
    """
    if not name:
        return 'Untitled'
    # Replace characters unsafe for file systems
    safe = re.sub(r'[\\/:*?"<>|]', '', name)
    # Replace multiple spaces/underscores with single underscore
    safe = re.sub(r'[\s_]+', '_', safe).strip('_')
    # Limit length
    if len(safe) > 60:
        safe = safe[:60].rstrip('_')
    return safe or 'Untitled'


def main():
    parser = argparse.ArgumentParser(
        description='E-Piṭaka Export — Convert Pāli Tipiṭaka books to ebook formats',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --book Dhp --lang en                     # Export Dhammapada (English)
  %(prog)s --book Dhp --lang en --formats epub,pdf  # Only EPUB + PDF
  %(prog)s --all --lang en --formats epub            # All books, EPUB only
  %(prog)s --list-languages                           # Show available translations
  %(prog)s --book Dhp --lang vi --output-dir ./out   # Vietnamese, custom output dir
        ''',
    )
    parser.add_argument('--book', '-b', type=str, default='',
                        help='Book ID to export (e.g. Dhp, D-i, Vin-iii)')
    parser.add_argument('--all', '-a', action='store_true',
                        help='Export all Mūla books')
    parser.add_argument('--lang', '-l', type=str, default='',
                        help='Translation language code (e.g. en, si, th)')
    parser.add_argument('--script', '-s', type=str, default='ro',
                        help='Pāli output script (ro, si, hi, be; default: ro)')
    parser.add_argument('--formats', '-f', type=str, default='epub,pdf,md,docx',
                        help='Comma-separated output formats (default: epub,pdf,md,docx)')
    parser.add_argument('--output-dir', '-o', type=str, default='./output',
                        help='Output directory (default: ./output)')
    parser.add_argument('--data-dir', type=str, default='',
                        help='Path to data/ directory (auto-detected if omitted)')
    parser.add_argument('--list-languages', action='store_true',
                        help='List available translation languages and exit')
    parser.add_argument('--no-cover', action='store_true',
                        help='Skip cover image generation')
    parser.add_argument('--mula-only', action='store_true', default=True,
                        help='Export only Mūla (original) books (default: True)')
    parser.add_argument('--all-categories', action='store_true',
                        help='Export all categories (Mūla + Aṭṭhakathā + Ṭīkā)')

    args = parser.parse_args()

    # ── Auto-detect data directory ────────────────────────────────────
    data_dir = args.data_dir
    if not data_dir:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(script_dir, '..', '..', 'data')
        data_dir = os.path.abspath(data_dir)
        if not os.path.isdir(data_dir):
            print(f'Error: data directory not found at {data_dir}')
            print('Use --data-dir to specify the path.')
            sys.exit(1)

    # ── List languages ────────────────────────────────────────────────
    if args.list_languages:
        langs = list_available_languages(data_dir)
        print('\nAvailable translation languages:')
        print(f'{"Code":<6} {"Language":<20} {"Database file"}')
        print('-' * 50)
        for lang in langs:
            print(f'{lang["code"]:<6} {lang["name"]:<20} {lang["filename"]}')
        print(f'\n({len(langs)} languages available)')
        return

    # ── Validate arguments ────────────────────────────────────────────
    if not args.book and not args.all:
        parser.error('Specify --book <ID> or --all')

    formats = [f.strip().lower() for f in args.formats.split(',')]
    valid_formats = {'epub', 'pdf', 'md', 'docx'}
    for fmt in formats:
        if fmt not in valid_formats:
            parser.error(f'Invalid format: {fmt}. Choose from: {", ".join(sorted(valid_formats))}')

    # ── Load books ────────────────────────────────────────────────────
    print(f'\n📂 Data directory: {data_dir}')
    print(f'📝 Formats: {", ".join(formats)}')
    if args.lang:
        print(f'🌐 Language: {args.lang}')
    print()

    start_time = time.time()

    if args.all:
        mula_only = not args.all_categories
        books = load_all_books(
            lang_code=args.lang, script=args.script, data_dir=data_dir, mula_only=mula_only,
        )
        print(f'📚 Loaded {len(books)} books')
    else:
        book = load_book(args.book, lang_code=args.lang, script=args.script, data_dir=data_dir)
        if not book:
            print(f'Error: book "{args.book}" not found.')
            sys.exit(1)
        books = [book]
        print(f'📚 Loaded: {book.book_name} ({book.book_id}) — {book.total_sentences} sentences')

    # ── Export each book ──────────────────────────────────────────────
    output_dir = os.path.abspath(args.output_dir)
    os.makedirs(output_dir, exist_ok=True)

    success = 0
    failed = 0

    for book in books:
        print(f'\n{"=" * 60}')
        print(f'📖 {book.book_name} ({book.book_id}) — {book.total_sentences} sentences')
        print(f'{"=" * 60}')

        # Generate cover
        cover_bytes = b''
        if not args.no_cover:
            try:
                lang_label = book.lang_name if book.lang_code else 'Pāli'
                # Build subtitle: prefer sub_nikaya > nikaya > category
                subtitle = book.sub_nikaya or book.nikaya or book.category
                cover_bytes = generate_cover(
                    title=book.english_name or book.book_name,
                    subtitle=subtitle,
                    author='Chaṭṭha Saṅgāyana Tipiṭaka',
                    lang_name=f'{lang_label} Translation',
                    category=book.category,
                    script=book.script,
                    book_name=book.book_name or '',
                    nikaya=book.nikaya or '',
                    sub_nikaya=book.sub_nikaya or '',
                    description=book.description or '',
                )
                print(f'  🎨 Cover generated')
            except Exception as e:
                print(f'  ⚠️  Cover generation failed: {e}')

        # Export each format
        for fmt in formats:
            suffix = f'_{args.lang}' if args.lang else '_pali'
            ext_map = {'epub': '.epub', 'pdf': '.pdf', 'md': '.md', 'docx': '.docx'}
            filename = f'{book.book_id}{suffix}{ext_map[fmt]}'

            # Build folder path: lang/extension/category/nikaya/sub_nikaya/book_name
            lang_folder = args.lang or 'pali'
            cat_folder = book.category or 'Uncategorized'
            nik_folder = book.nikaya or 'Uncategorized'
            sub_folder = book.sub_nikaya or ''
            # Use English book name for folder, sanitized
            book_folder = _sanitize_name(book.english_name or book.book_name)

            folder_parts = [lang_folder, fmt, cat_folder, nik_folder]
            if sub_folder:
                folder_parts.append(sub_folder)
            folder_parts.append(book_folder)

            rel_dir = os.path.join(*folder_parts)
            filepath = os.path.join(output_dir, rel_dir, filename)

            try:
                if fmt == 'epub':
                    build_epub(book, filepath, cover_bytes)
                elif fmt == 'pdf':
                    build_pdf(book, filepath, cover_bytes)
                elif fmt == 'md':
                    build_markdown(book, filepath)
                elif fmt == 'docx':
                    build_docx(book, filepath)

                size_mb = os.path.getsize(filepath) / (1024 * 1024)
                rel_path = os.path.relpath(filepath, output_dir)
                print(f'  ✅ {fmt.upper():<6} → {rel_path} ({size_mb:.1f} MB)')
                success += 1
            except Exception as e:
                print(f'  ❌ {fmt.upper():<6} → FAILED: {e}')
                failed += 1

    # ── Summary ───────────────────────────────────────────────────────
    elapsed = time.time() - start_time
    print(f'\n{"=" * 60}')
    print(f'✨ Done! {success} files exported, {failed} failed')
    print(f'⏱️  Time: {elapsed:.1f}s')
    print(f'📁 Output: {output_dir}')
    print(f'{"=" * 60}\n')

    return 0 if failed == 0 else 1


if __name__ == '__main__':
    sys.exit(main())

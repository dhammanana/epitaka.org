# E-Piṭaka Export Scripts

Convert books from the Chaṭṭha Saṅgāyana Tipiṭaka to EPUB, PDF, Markdown, and DOCX formats.

## Features

- **4 Output Formats**: EPUB 3, PDF, Markdown, DOCX
- **Cover Generation**: Automatic Dharma wheel cover with book metadata
- **Bilingual Support**: Pāli text + translation side-by-side
- **Metadata**: Proper Dublin Core metadata for EPUB, front matter for Markdown
- **Unicode**: Full support for Pāli diacritics (ā, ī, ū, ṃ, ṇ, ṭ, ḍ, ṣ, ḷ)
- **65 Books**: All Mūla (original) texts from the Tipiṭaka
- **10 Languages**: English, Vietnamese, Thai, Sinhala, Tamil, Lao, Myanmar, Portuguese, German, Khmer

## Quick Start

```bash
# Export a single book (English)
cd web_server
python -m scripts.export.cli --book Dhp --lang en

# Export with specific formats
python -m scripts.export.cli --book Dhp --lang en --formats epub,pdf

# Export ALL books
python -m scripts.export.cli --all --lang en

# List available languages
python -m scripts.export.cli --list-languages
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--book`, `-b` | Book ID to export (e.g., `Dhp`, `D-i`, `Vin-iii`) |
| `--all`, `-a` | Export all Mūla books |
| `--lang`, `-l` | Translation language code (e.g., `en`, `vi`, `th`) |
| `--formats`, `-f` | Comma-separated formats (default: `epub,pdf,md,docx`) |
| `--output-dir`, `-o` | Output directory (default: `./output`) |
| `--data-dir` | Path to `data/` directory (auto-detected) |
| `--list-languages` | Show available translations |
| `--no-cover` | Skip cover image generation |
| `--all-categories` | Include Aṭṭhakathā and Ṭīkā books |

## Output Files

Files are named: `{book_id}_{lang}.{ext}`

Example:
```
Dhp_en.epub    (0.6 MB)
Dhp_en.pdf     (0.3 MB)
Dhp_en.md      (0.0 MB)
Dhp_en.docx    (0.0 MB)
```

## Architecture

```
scripts/export/
├── __init__.py          # Package init
├── cli.py               # CLI entry point
├── data_loader.py       # SQLite database reader
├── cover.py             # Pillow cover image generator
├── epub_builder.py      # EPUB 3 builder (ebooklib)
├── pdf_builder.py       # PDF builder (ReportLab)
├── md_builder.py        # Markdown builder
├── docx_builder.py      # DOCX builder (python-docx)
└── requirements.txt     # Export dependencies
```

## Database Schema

The export reads from:

1. **`epitaka.db`** (Pāli text):
   - `books` — book metadata
   - `headings` — section structure
   - `sentences` — Pāli text

2. **`epitaka_{lang}.db`** (Translations):
   - `sentences` — translations
   - `summaries` — heading translations (optional)

## GitHub Actions

The workflow `.github/workflows/export-ebooks.yml` automates exports:

1. **Manual Trigger**: Run from GitHub Actions UI
2. **Tag Trigger**: Push `ebook-*` tags
3. **Artifacts**: Downloads available for 90 days
4. **Releases**: Creates GitHub releases with all exported files

### Triggering an Export

```bash
# Via tag
git tag ebook-v1
git push origin ebook-v1

# Or manually from GitHub Actions UI
```

## Dependencies

```bash
pip install ebooklib Pillow reportlab python-docx
```

## Font Requirements

For PDF export, the script tries to find Unicode-capable fonts:
- **Linux**: DejaVu, Liberation (install via `apt-get install fonts-dejavu-core fonts-liberation`)
- **macOS**: Georgia, Arial (pre-installed)
- **Windows**: Calibri (pre-installed)

## License

- **Pāli text**: Public Domain
- **AI translations**: CC-BY-4.0
- **Export scripts**: MIT

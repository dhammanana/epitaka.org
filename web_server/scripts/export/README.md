# E-Piṭaka Export Script

Convert books from the Chaṭṭha Saṅgāyana Tipiṭaka to EPUB, PDF, Markdown, and DOCX formats.

## Quick Start

```bash
# Export a single book
python -m scripts.export.cli --book Dhp --lang en

# Export all Mūla books
python -m scripts.export.cli --all --lang en

# List available languages
python -m scripts.export.cli --list-languages
```

## Usage

```bash
python -m scripts.export.cli [OPTIONS]
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--book BOOK` | `-b` | Book ID to export (e.g., Dhp, D-i, Vin-iii) | - |
| `--all` | `-a` | Export all Mūla books | - |
| `--lang LANG` | `-l` | Translation language code (e.g., en, si, th) | - |
| `--script SCRIPT` | `-s` | Pāli output script (ro, si, hi, be, etc.) | `ro` |
| `--formats FORMATS` | `-f` | Comma-separated output formats | `epub,pdf,md,docx` |
| `--output-dir DIR` | `-o` | Output directory | `./output` |
| `--data-dir DIR` | - | Path to data/ directory (auto-detected) | - |
| `--list-languages` | - | Show available translations and exit | - |
| `--no-cover` | - | Skip cover image generation | - |
| `--mula-only` | - | Export only Mūla (original) books | `True` |
| `--all-categories` | - | Include Aṭṭhakathā and Ṭīkā books | - |

## Examples

### Export a single book

```bash
# English translation, Roman script
python -m scripts.export.cli --book Dhp --lang en

# English translation, Sinhala script
python -m scripts.export.cli --book Dhp --lang en --script si

# Thai translation, Thai script
python -m scripts.export.cli --book Dhp --lang th --script th

# Vietnamese translation, Roman script
python -m scripts.export.cli --book Dhp --lang vi
```

### Export all books

```bash
# Export all Mūla books (default)
python -m scripts.export.cli --all --lang en

# Export all books including Aṭṭhakathā and Ṭīkā
python -m scripts.export.cli --all --all-categories --lang en

# Export all books with Sinhala script
python -m scripts.export.cli --all --lang en --script si
```

### Export specific formats

```bash
# EPUB only
python -m scripts.export.cli --book Dhp --lang en --formats epub

# PDF and DOCX only
python -m scripts.export.cli --book Dhp --lang en --formats pdf,docx

# All formats
python -m scripts.export.cli --book Dhp --lang en --formats epub,pdf,md,docx
```

### Custom output directory

```bash
python -m scripts.export.cli --book Dhp --lang en --output-dir ./exports
```

### Skip cover generation

```bash
python -m scripts.export.cli --book Dhp --lang en --no-cover
```

## Available Languages

Run `--list-languages` to see all available translations:

```bash
python -m scripts.export.cli --list-languages
```

Common languages:
- `en` - English
- `si` - Sinhala
- `th` - Thai
- `vi` - Vietnamese
- `my` - Myanmar
- `km` - Khmer
- `lo` - Lao
- `hi` - Hindi
- `ta` - Tamil

## Available Scripts

| Code | Script Name | Example |
|------|-------------|---------|
| `ro` | Rōmani (Latin) | Dhammapada |
| `si` | Sinhala | ධම්මපදපාළි |
| `hi` | Devanāgarī | धम्मपद |
| `th` | Thai | ธรรมบท |
| `lo` | Lao | ທຳມະບາດ |
| `my` | Myanmar | ဓမ္မပဒ |
| `km` | Khmer | ធម្មបទ |
| `be` | Bengali | ধম্মপদ |
| `gm` | Gurmukhī | ਧੰਮਪਦ |
| `tt` | Tai Tham | ᨭ᩠ umiejęᩢᩔᩅ锠ᩘ |
| `gj` | Gujarātī | ધમ્મપદ |
| `te` | Telugu | ధమ్మపద |
| `ka` | Kannaḍa | ಧಮ್ಮಪದ |
| `mm` | Malayāḷaṃ | ധമ്മപദ |

## Output Structure

Files are organized by language, format, category, nikaya, and book:

```
output/
  en/
    epub/
      Mūla/
        Sutta Piṭaka/
          Khuddaka Nikāya/
            Dhammapada/
              Dhp_en.epub
    pdf/
      Mūla/
        Sutta Piṭaka/
          Khuddaka Nikāya/
            Dhammapada/
              Dhp_en.pdf
    md/
      ...
    docx/
      ...
```

## Book IDs

Common book IDs:

| ID | Book Name |
|----|-----------|
| `Dhp` | Dhammapada |
| `D-i` | Dīgha Nikāya (Volume 1) |
| `D-ii` | Dīgha Nikāya (Volume 2) |
| `D-iii` | Dīgha Nikāya (Volume 3) |
| `M-i` | Majjhima Nikāya (Volume 1) |
| `M-ii` | Majjhima Nikāya (Volume 2) |
| `M-iii` | Majjhima Nikāya (Volume 3) |
| `S-i` | Saṃyutta Nikāya (Volume 1) |
| `S-ii` | Saṃyutta Nikāya (Volume 2) |
| `S-iii` | Saṃyutta Nikāya (Volume 3) |
| `S-iv` | Saṃyutta Nikāya (Volume 4) |
| `S-v` | Saṃyutta Nikāya (Volume 5) |
| `A-i` | Aṅguttara Nikāya (Volume 1) |
| `A-ii` | Aṅguttara Nikāya (Volume 2) |
| `A-iii` | Aṅguttara Nikāya (Volume 3) |
| `A-iv` | Aṅguttara Nikāya (Volume 4) |
| `A-v` | Aṅguttara Nikāya (Volume 5) |
| `Vin` | Vinaya Piṭaka |
| `Khp` | Khuddakapāṭha |
| `Ud` | Udāna |
| `It` | Itivuttaka |
| `Sn` | Sutta Nipāta |
| `Th` | Theragāthā |
| `Thī` | Therīgāthā |
| `Ap` | Apadāna |
| `Bv` | Buddhavaṃsa |
| `Cp` | Cariyāpiṭaka |
| `Ja` | Jātaka |

## Features

- **Cover images**: Generated with Dharma wheel, book title, and metadata
- **PDF bookmarks**: Clickable outline in sidebar
- **EPUB TOC**: Hierarchical table of contents
- **Script conversion**: Roman Pāli to any Indic script via pali-script.js
- **Bilingual layout**: Pāli text + translation side by side
- **VRI page markers**: Page break indicators from VRI edition

## Requirements

- Python 3.10+
- ReportLab (for PDF generation)
- Pillow (for cover images)
- ebooklib (for EPUB generation)
- python-docx (for DOCX generation)
- Node.js (for script conversion)

## Troubleshooting

### "Node.js not found" error

Install Node.js or ensure it's in your PATH:

```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt install nodejs

# Check installation
node --version
```

### "Font not found" error

Ensure fonts are in the correct location:

```bash
ls -la epitaka.org/web_server/frontend/src/fonts/
```

### Cover generation fails

Check if Pillow is installed:

```bash
pip install Pillow
```

### PDF generation fails

Check if ReportLab is installed:

```bash
pip install reportlab
```

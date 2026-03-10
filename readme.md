# E-Piṭaka

E-Piṭaka is a web application for browsing and searching the Pāli Canon (Tipiṭaka) and its commentaries. It provides access to the original Pāli texts along with English and Vietnamese translations. The application is built with Flask and SQLite.

## Features

*   **Browse the Tipiṭaka:** Navigate through the Pāli Canon by category, Nikāya, and book.
*   **Trilingual View:** Read texts with Pāli, English, and Vietnamese side-by-side.
*   **Powerful Search:**
    *   **Full-Text Search:** Search for words and phrases across the entire canon.
    *   **Semantic Search:** Use AI-powered semantic search to find conceptually related passages (requires a sentence transformer model).
*   **Translation Editing:** Edit and improve the translations directly in the web interface.
*   **Cross-References:** Easily jump between root texts, commentaries, and sub-commentaries.

## Project Structure

The project is organized as follows:

```
├── app.py                      # Main Flask application
├── config.py                   # Configuration settings
├── convert_md2db.py            # Script to import data from Markdown to the database
├── dbwriter.py                 # Script to create and populate the database
├── requirements.txt            # Python dependencies
├── static/                     # Static assets (CSS, JavaScript)
├── templates/                  # HTML templates
├── tipitaka_en/                # English Tipiṭaka in Markdown format
├── tipitaka_vn/                # Vietnamese Tipiṭaka in Markdown format
└── backup/
    └── translation.db          # SQLite database file
```

## Database Schema

The application uses a SQLite database named `translation.db` with the following tables:

*   **`books`**: Stores the hierarchy of the Tipiṭaka.
    *   `book_id` (TEXT): Unique ID for each book (e.g., `DN1.mul`).
    *   `category` (TEXT): "Sutta Piṭaka", "Vinaya Piṭaka", etc.
    *   `nikaya` (TEXT): "Dīgha Nikāya", "Majjhima Nikāya", etc.
    *   `sub_nikaya` (TEXT): Sub-collection, if any.
    *   `book_name` (TEXT): Full name of the book.
    *   `mula_ref` (TEXT): Reference to the root text.
    *   `attha_ref` (TEXT): Reference to the commentary.
    *   `tika_ref` (TEXT): Reference to the sub-commentary.

*   **`headings`**: Stores the headings within each book.
    *   `book_id` (TEXT): Foreign key to `books.book_id`.
    *   `para_id` (INTEGER): Paragraph number.
    *   `heading_number` (INTEGER): Heading level (1-6).
    *   `title` (TEXT): The heading text.

*   **`sentences`**: Stores the individual sentences and their translations.
    *   `book_id` (TEXT): Foreign key to `books.book_id`.
    *   `para_id` (INTEGER): Paragraph number.
    *   `line_id` (INTEGER): Line number within the paragraph.
    *   `pali_sentence` (TEXT): The sentence in Pāli.
    *   `english_translation` (TEXT): The English translation.
    *   `vietnamese_translation` (TEXT): The Vietnamese translation.

*   **`words`**: A dictionary of Pāli words for search suggestions.
    *   `word` (TEXT): The Pāli word.
    *   `plain` (TEXT): A normalized version of the word.
    *   `frequency` (INTEGER): The word's frequency.

*   **`sentences_fts`**: A virtual table for full-text search using SQLite's FTS5 extension.

*   **`sentences_vec`**: A table for semantic search, storing vector embeddings of sentences.

## Setup and Running

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Create the database:**
    The database `translation.db` is currently empty. You will need to run the data import scripts to populate it. The scripts `convert_md2db.py` and `dbwriter.py` appear to be responsible for this. (Further investigation of these scripts is needed to provide exact instructions).

3.  **Run the application:**
    ```bash
    python app.py
    ```
    The application will be available at `http://0.0.0.0:8080/tpk`.


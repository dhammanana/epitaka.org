import sqlite3
import os
import re
from subprocess import run
import unicodedata

LANGUAGE = 'vietnamese' #'english'


def markdown_to_html(text):
    if not text:
        return ''
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = text.replace('\\[', '[').replace('\\]', ']')
    text = text.replace('<strong>', ' <strong>')
    for i in range(6, 0, -1):
        pattern = r'^' + r'\#' * i + r' (.*)$'
        repl = r'<h{0}>\1</h{0}>'.format(i)
        text = re.sub(pattern, repl, text, flags=re.MULTILINE)
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    text = re.sub(r'\\\[(.*?)\\\]', r'\[\1\]', text)
    return text

def pali_to_slug(text):
    # Normalize Unicode to decompose diacritics
    text = unicodedata.normalize('NFD', text)
    # Remove combining diacritical marks
    text = ''.join(c for c in text if unicodedata.combining(c) == 0)
    # Replace specific Pali characters with their base forms
    replacements = {
        'ñ': 'n', 'ṅ': 'n', 'ṇ': 'n', 'ṁ': 'm', 'ṃ': 'm',
        'ā': 'a', 'ī': 'i', 'ū': 'u', 'ḷ': 'l', 'ṭ': 't', 'ḍ': 'd'
    }
    for pali_char, base_char in replacements.items():
        text = text.replace(pali_char, base_char)
    # Convert to lowercase and replace spaces with hyphens
    text = text.lower()
    text = re.sub(r'\s+', '-', text)
    # Remove any non-alphanumeric characters except hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    # Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    # Strip leading/trailing hyphens
    text = text.strip('-')
    return text

# Connect to SQLite database
conn = sqlite3.connect('translations.db')
cursor = conn.cursor()

# Create output directories
os.makedirs('epub', exist_ok=True)
os.makedirs('cover', exist_ok=True)

# Get all books
cursor.execute("SELECT book_id, category, nikaya, sub_nikaya, book_name FROM books")
books = cursor.fetchall()

for book_id, category, nikaya, sub_nikaya, book_name in books:
    category = pali_to_slug(category.split(' ')[0])
    nikaya = pali_to_slug(nikaya.split(' ')[0])
    sub_nikaya = pali_to_slug(sub_nikaya.split(' ')[0])
    book_name = pali_to_slug(book_name)


    # Check if EPUB already exists
    epub_folder = os.path.join("epub", category, nikaya, sub_nikaya)
    epub_path = f"{epub_folder}/{book_name}.epub"
    if os.path.exists(epub_path):
        print(f"Book {book_name} exists")
        continue

    print(f"Running for {book_name}")
    os.makedirs(epub_folder, exist_ok=True)

    # Initialize HTML content
    html_content = """
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>{}</title>
        <style>
            .gemini-trans {{ display: block; color: darkblue; font-style: italic; margin: 15px; }}
            .pali {{ color: maroon; font-weight: 500; }}
            .para {{ border-bottom: gray 1px solid; margin-bottom: 20px; }}
            .content {{ max-width: 4xl; margin: auto; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
            .chunk {{ margin-bottom: 24px; }}
        </style>
    </head>
    <body>
        <div class="content">
            <div class="chunk">
    """.format(book_name)

    # Fetch table of contents (heading_number 3, 4, 5, 6)
    cursor.execute("""
        SELECT para_id, heading_number, title
        FROM headings
        WHERE book_id = ? AND heading_number IN (3, 4, 5, 6)
        ORDER BY para_id
    """, (book_id,))
    headings = cursor.fetchall()

    # Add table of contents
    if headings:
        html_content += '<h2>Table of Contents</h2><ul>'
        for para_id, heading_number, title in headings:
            title = markdown_to_html(title)
            html_content += f'<li><a href="#para_{para_id}">{title}</a></li>'
        html_content += '</ul>'

    # Fetch sentences, sorted by para_id and line_id
    cursor.execute(f"""
        SELECT para_id, line_id, pali_sentence, {LANGUAGE}_translation
        FROM sentences
        WHERE book_id = ?
        ORDER BY para_id, line_id
    """, (book_id,))
    sentences = cursor.fetchall()

    # Group sentences by para_id
    current_para_id = None
    for para_id, line_id, pali_sentence, translation_sentence in sentences:
        # Apply Markdown conversion
        pali_sentence = markdown_to_html(pali_sentence)
        translation_sentence = markdown_to_html(translation_sentence)

        # Check if this is a new paragraph
        if para_id != current_para_id:
            if current_para_id is not None:
                html_content += '</div></div>'  # Close previous paragraph
            html_content += '<div class="para"><div class="line">'
            current_para_id = para_id

            # Check if this para_id has a heading
            cursor.execute("""
                SELECT heading_number, title
                FROM headings
                WHERE book_id = ? AND para_id = ?
            """, (book_id, para_id))
            heading = cursor.fetchone()
            if heading and heading[0] in (3, 4, 5, 6):
                heading_number, title = heading
                title = markdown_to_html(title)
                html_content += f'<h{heading_number} id="para_{para_id}">{title}</h{heading_number}>'

        # Add Pali and Vietnamese sentences (skip Vietnamese headings)
        if not (pali_sentence.startswith('<h') and pali_sentence.endswith('>')):
            html_content += f"""
                <div class="pali">{pali_sentence}</div>
                <div class="gemini-trans">{translation_sentence}</div>
            """
            # html_content += f"""
            #     <div class="gemini-trans">{translation_sentence}</div>
            # """

    # Close final paragraph and HTML
    html_content += """
            </div></div>
        </div>
    </div>
    </body>
    </html>
    """

    # Write HTML to file
    html_filename = f"{book_name}.html"
    with open(html_filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Create cover image
    run([
        'convert', 'cover/cover.webp',
        '-gravity', 'North', '-pointsize', '40', '-fill', 'white', '-annotate', '+0+150', book_name,
        '-gravity', 'South', '-pointsize', '20', '-fill', 'lightblue', '-annotate', '+0+50', 'Buddhaghosācariya',
        f'cover_{book_name}.jpg'
    ])

    # Convert to EPUB
    style = """
    <style>
    .gemini-trans {
        display: block;
        color: darkblue;
        margin-top: 5px;
    }
    .pali {
        color: maroon;
        font-weight: 500;
    }
    .para {
        border-bottom: gray 1px solid;
        margin-bottom: 20px;
    }
    </style>
    """
    with open(html_filename, 'r', encoding='utf-8') as f:
        content = f.read()
    with open('temp_file.html', 'w', encoding='utf-8') as f:
        f.write(style + '\n\n' + content)

    run([
        'ebook-convert', 'temp_file.html', epub_path,
        '--cover', f'cover_{book_name}.jpg',
        '--level1-toc', '//h:h3|//h:h4',
        '--level2-toc', '//h:h5|//h:h6',
        '--title', book_name,
        '--authors', 'Buddhaghosa',
        '--language', 'vi'
    ])

    # Clean up
    os.remove(f'cover_{book_name}.jpg')
    os.remove('temp_file.html')
    os.remove(html_filename)

# Close database connection
conn.close()
# app/services/loadtocs.py
"""
Legacy module: re-exports functions from books.py and toc.py for backward
compatibility with imports in routes/fts_search.py and other modules.
"""
from ..services.books import load_hierarchy, organize_hierarchy
from ..services.toc import get_book_toc, get_section_sentences, resolve_split_book
from ..utils.text import normalize_pali, markdown_to_html, trim_text

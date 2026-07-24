/**
 * home-dialog-search.js
 * Handles all search functionality for the Home Dialog.
 */

import { BookFilter } from './home-dialog-search-filter.js';
import { installPaliInput } from '../libs/pali_typing.js';
import '../css/home-dialog-fts.css';
/* ─────────────────────────────────────────────────────────────
   Search type configuration
───────────────────────────────────────────────────────────── */
export const SEARCH_TYPES = [
  {
    id:    'headings',
    icon:  '☰',
    label: 'Search Headings',
    desc:  'Find by section titles',
    placeholder: 'Search section headings…',
    hasAutocomplete: true,
    hasFtsOptions:   false,
  },
  {
    id:    'fulltext',
    icon:  '🔍',
    label: 'Full Text',
    desc:  'Search Pāli & translations',
    placeholder: 'Type words to search…',
    hasAutocomplete: true,
    hasFtsOptions:   false,
    autocompleteMode: 'word',
  },
  {
    id:    'pali-def',
    icon:  '📖',
    label: 'Pāli Definitions',
    desc:  'Look up Pāli dictionary',
    placeholder: 'Search Pāli word…',
    hasAutocomplete: true,
    hasFtsOptions:   false,
  },
  {
    id:    'ai',
    icon:  '✨',
    label: 'AI Search',
    desc:  'Semantic meaning search',
    placeholder: 'Ask a question…',
    hasAutocomplete: false,
    hasFtsOptions:   false,
  },
];

/* ─────────────────────────────────────────────────────────────
   HomeDialogSearch class
───────────────────────────────────────────────────────────── */
export class HomeDialogSearch {
  /**
   * @param {object} opts
   * @param {string}   opts.baseUrl
   * @param {object}   [opts.initialState]          Persisted state from localStorage
   * @param {string}   [opts.initialState.searchTypeId]
   * @param {object}   opts.hierarchy
   * @param {Function} opts.onResultSelect
   * @param {Function} opts.onShowResults
   * @param {Function} opts.onShowBooks
   */
  constructor({ baseUrl, lang, initialState = {}, hierarchy = {}, onResultSelect, onShowResults, onShowBooks }) {
    this.baseUrl        = baseUrl;
    this.lang           = lang;
    this.hierarchy      = hierarchy;
    this.onResultSelect = onResultSelect;
    this.onShowResults  = onShowResults;
    this.onShowBooks    = onShowBooks;

    // ── Initialise internal state from persisted values (with fallbacks) ──
    const savedType = SEARCH_TYPES.find(t => t.id === initialState.searchTypeId);
    this.currentType = savedType ?? SEARCH_TYPES[0];

    this._acDebounce    = null;
    this._acController  = null;
    this._focusedIdx    = -1;
    this._suggestions   = [];

    this.bookFilter = new BookFilter(hierarchy, {
      onChange: () => this._onFilterChange(),
    });

    // DOM refs — set in bind()
    this.typeBtn        = null;
    this.typeMenu       = null;
    this.searchInput    = null;
    this.suggestionsEl  = null;
    this.goBtn          = null;
    this.resultsPanel   = null;
    this.filterWrap     = null;

    this._lastResults   = null;
    this._lastQuery     = '';
    this._lastType      = null;

    // FTS state
    this._ftsData            = null;   // last full response from API
    this._ftsPage            = 1;
    this._ftsTotalPages      = 1;
    this._ftsWords           = [];
    this._ftsLoading         = false;
    this._ftsExpandedBookId  = null;   // which book card is currently expanded (accordion)
  }

  /**
   * Bind all DOM elements and apply the initial (possibly restored) state.
   * Must be called after the dialog HTML has been inserted into the page.
   */
  bind() {
    this.typeBtn       = document.getElementById('search-type-btn');
    this.typeMenu      = document.getElementById('search-type-menu');
    this.searchInput   = document.getElementById('home-search-input');
    this.suggestionsEl = document.getElementById('home-suggestions');
    this.goBtn         = document.getElementById('home-search-go');
    this.resultsPanel  = document.getElementById('home-results-panel');
    this.filterWrap    = document.getElementById('home-filter-wrap');

    this._bindTypeDropdown();
    this._bindInput();
    this._bindGoButton();

    if (this.filterWrap) {
      this.bookFilter.mount(this.filterWrap);
    }

    // Apply the (possibly restored) state to the DOM.
    this._applyTypeUI(this.currentType);
  }

  /* ── Type dropdown ───────────────────────────────────────── */

  _bindTypeDropdown() {
    this.typeBtn.addEventListener('click', e => {
      e.stopPropagation();
      this._toggleTypeMenu();
    });

    this.typeMenu.querySelectorAll('.search-type-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const type = SEARCH_TYPES.find(t => t.id === opt.dataset.type);
        if (type) this._selectType(type);
      });
    });

    document.addEventListener('click', () => this._closeTypeMenu());
  }

  _toggleTypeMenu() {
    this.typeMenu.classList.contains('show') ? this._closeTypeMenu() : this._openTypeMenu();
  }
  _openTypeMenu() {
    this._positionBelow(this.typeBtn, this.typeMenu);
    this.typeMenu.classList.add('show');
    this.typeBtn.classList.add('open');
  }
  _closeTypeMenu() {
    this.typeMenu.classList.remove('show');
    this.typeBtn.classList.remove('open');
  }

  _positionBelow(anchor, dropdown) {
    const r = anchor.getBoundingClientRect();
    dropdown.style.top      = `${r.bottom + 4}px`;
    dropdown.style.left     = `${r.left}px`;
    dropdown.style.maxWidth = `${window.innerWidth - r.left - 8}px`;
  }

  _selectType(type) {
    this.currentType  = type;
    this._lastResults = null;
    this._applyTypeUI(type);
    this._closeTypeMenu();
    this._closeSuggestions();
    this.searchInput.value = '';
    this.searchInput.focus();
    if (this.resultsPanel) {
      this.resultsPanel.innerHTML = '';
      this.resultsPanel.classList.remove('active');
    }
    this.onShowBooks();
  }

  _applyTypeUI(type) {
    // Update button label
    this.typeBtn.innerHTML =
      `<span>${type.icon} ${type.label}</span><span class=\"arrow\">▾</span>`;

    // Update placeholder
    this.searchInput.placeholder = type.placeholder;

    // Highlight selected option in menu
    this.typeMenu.querySelectorAll('.search-type-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.type === type.id);
    });
  }

  /* ── Filter change handler ───────────────────────────────── */

  _onFilterChange() {
    if (!this._lastResults || !this._lastQuery) return;

    if (this._lastType === 'headings') {
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderHeadingResults(filtered, this._lastQuery);
    } else if (this._lastType === 'pali-def') {
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderDictResults(filtered, this._lastQuery);
    }
    // FTS re-fetches from API when filter changes (handled by storing _ftsData)
  }

  /* ── Input & autocomplete ────────────────────────────────── */

  _bindInput() {
    this.searchInput.addEventListener('input', () => this._onInput());
    this.searchInput.addEventListener('keydown', e => this._onKeydown(e));
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => this._closeSuggestions(), 160);
    });

    this.removePaliHandler = installPaliInput(this.searchInput, {
      mode: 'both',
      onConvert: (normalized) => {
        const q = normalized.trim();
        if (!q) { this._closeSuggestions(); return; }
        if (this.currentType.hasAutocomplete) {
          clearTimeout(this._acDebounce);
          this._acDebounce = setTimeout(() => this._fetchSuggestions(q), 220);
        }
      }
    });
  }

  _onInput() {
    const q = this.searchInput.value.trim();
    if (!q) { this._closeSuggestions(); return; }
    if (this.currentType.hasAutocomplete) {
      clearTimeout(this._acDebounce);
      this._acDebounce = setTimeout(() => this._fetchSuggestions(q), 220);
    }
  }

  async _fetchSuggestions(q) {
    if (this._acController) this._acController.abort();
    this._acController = new AbortController();

    this._showSuggestionsLoading();

    try {
      let url;
      if (this.currentType.id === 'headings') {
        url = `${this.baseUrl}/api/search_headings?q=${encodeURIComponent(q)}&limit=12`;
      } else if (this.currentType.id === 'pali-def') {
        url = `${this.baseUrl}/api/bold_suggest?q=${encodeURIComponent(q)}&limit=12`;
      } else if (this.currentType.autocompleteMode === 'word') {
        const lastWord = q.split(/\s+/).pop();
        if (!lastWord) { this._closeSuggestions(); return; }
        url = `${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(lastWord)}&limit=10`;
      } else {
        return;
      }

      const res  = await fetch(url, { signal: this._acController.signal });
      const data = await res.json();

      if (this.currentType.autocompleteMode === 'word') {
        this._renderWordSuggestions(data, q);
      } else {
        const filtered = this.bookFilter.filterResults(data);
        this._renderSuggestions(filtered, q);
      }
    } catch (err) {
      if (err.name !== 'AbortError') this._closeSuggestions();
    }
  }

  _renderWordSuggestions(words, currentInput) {
    this._positionBelow(this.searchInput, this.suggestionsEl);
    this.suggestionsEl.style.width = `${this.searchInput.getBoundingClientRect().width}px`;

    if (!words?.length) {
      this.suggestionsEl.innerHTML = '<div class="suggestion-empty">No suggestions</div>';
      this.suggestionsEl.classList.add('show');
      this._suggestions = [];
      return;
    }

    this._suggestions = words.map(w => ({ _word: w }));
    this._focusedIdx  = -1;

    const lastWord = currentInput.split(/\s+/).pop();
    const prefix   = currentInput.slice(0, currentInput.length - lastWord.length);
    const hl = str => str.replace(
      new RegExp(`^(${escapeRegex(lastWord)})`, 'i'),
      '<mark>$1</mark>'
    );

    this.suggestionsEl.innerHTML = words.map((word, i) =>
      `<div class="suggestion-item suggestion-word" data-idx="${i}" tabindex="-1">
        <span class="sug-pali">${hl(word)}</span>
      </div>`
    ).join('');

    this.suggestionsEl.classList.add('show');

    this.suggestionsEl.querySelectorAll('.suggestion-word').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        const word = this._suggestions[parseInt(el.dataset.idx)]?._word;
        if (word) {
          this.searchInput.value = prefix + word + ' ';
          this._closeSuggestions();
          this.searchInput.focus();
        }
      });
    });
  }

  _showSuggestionsLoading() {
    this._positionBelow(this.searchInput, this.suggestionsEl);
    this.suggestionsEl.style.width = `${this.searchInput.getBoundingClientRect().width}px`;
    this.suggestionsEl.innerHTML = '<div class="suggestion-loading">Searching…</div>';
    this.suggestionsEl.classList.add('show');
    this._focusedIdx  = -1;
    this._suggestions = [];
  }

  _renderSuggestions(data, query) {
    this._positionBelow(this.searchInput, this.suggestionsEl);
    this.suggestionsEl.style.width = `${this.searchInput.getBoundingClientRect().width}px`;

    if (!data?.length) {
      this.suggestionsEl.innerHTML = '<div class="suggestion-empty">No results</div>';
      this.suggestionsEl.classList.add('show');
      this._suggestions = [];
      return;
    }

    this._suggestions = data;
    this._focusedIdx  = -1;

    const hl = str => str.replace(
      new RegExp(`(${escapeRegex(query)})`, 'gi'),
      '<mark>$1</mark>'
    );

    this.suggestionsEl.innerHTML = data.map((item, i) => {
      if (this.currentType.id === 'headings') {
        return `<div class="suggestion-item" data-idx="${i}" tabindex="-1">
          <span class="sug-pali">${hl(item.title || '')}</span>
          <span class="sug-book">${item.book_name || item.book_id || ''}</span>
          <span class="sug-para">#${item.para_id || ''}</span>
        </div>`;
      } else {
        return `<div class="suggestion-item" data-idx="${i}" tabindex="-1">
          <span class="sug-pali">${hl(item.word || item.title || '')}</span>
          <span class="sug-book">${item.definition_short || ''}</span>
        </div>`;
      }
    }).join('');

    this.suggestionsEl.classList.add('show');

    this.suggestionsEl.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        this._selectSuggestion(parseInt(el.dataset.idx));
      });
    });
  }

  _selectSuggestion(idx) {
    const item = this._suggestions[idx];
    if (!item) return;

    if (item._word !== undefined) {
      const cur      = this.searchInput.value;
      const lastWord = cur.split(/\s+/).pop();
      const prefix   = cur.slice(0, cur.length - lastWord.length);
      this.searchInput.value = prefix + item._word + ' ';
      this._closeSuggestions();
      this.searchInput.focus();
      return;
    }

    this._closeSuggestions();

    if (this.currentType.id === 'headings') {
      const slug = item.slug || '';
      this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}`);
    } else if (this.currentType.id === 'pali-def') {
      const slug = item.slug || '';
      this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}-${item.line_id}`);
    }
  }

  _closeSuggestions() {
    this.suggestionsEl.classList.remove('show');
    this.suggestionsEl.innerHTML = '';
    this._focusedIdx  = -1;
    this._suggestions = [];
  }

  _onKeydown(e) {
    const items = this.suggestionsEl.querySelectorAll('.suggestion-item');
    if (items.length && this.suggestionsEl.classList.contains('show')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._focusedIdx = Math.min(this._focusedIdx + 1, items.length - 1);
        this._updateFocused(items);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._focusedIdx = Math.max(this._focusedIdx - 1, -1);
        this._updateFocused(items);
        return;
      }
      if (e.key === 'Enter' && this._focusedIdx >= 0) {
        e.preventDefault();
        this._selectSuggestion(this._focusedIdx);
        return;
      }
      if (e.key === 'Escape') {
        this._closeSuggestions();
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this._executeSearch();
    }
  }

  _updateFocused(items) {
    items.forEach((el, i) => el.classList.toggle('focused', i === this._focusedIdx));
    if (this._focusedIdx >= 0) items[this._focusedIdx].scrollIntoView({ block: 'nearest' });
  }

  /* ── Go button ───────────────────────────────────────────── */

  _bindGoButton() {
    this.goBtn.addEventListener('click', () => this._executeSearch());
  }

  async _executeSearch() {
    const q = this.searchInput.value.trim();
    if (!q) return;
    this._closeSuggestions();

    const type = this.currentType;

    if (type.id === 'headings') {
      this._showResultsLoading();
      const data = await this._apiFetch(
        `${this.baseUrl}/api/search_headings?q=${encodeURIComponent(q)}&limit=30`
      );
      this._lastResults = data || [];
      this._lastQuery   = q;
      this._lastType    = 'headings';
      this._renderHeadingResults(this.bookFilter.filterResults(this._lastResults), q);

    } else if (type.id === 'fulltext') {
      this._ftsPage = 1;
      this._ftsData = null;
      await this._executeFtsSearch(q);

    } else if (type.id === 'pali-def') {
      this._showResultsLoading();
      const data = await this._apiFetch(
        `${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(q)}&lang=${this.lang}&limit=80`
      );
      this._lastResults = data || [];
      this._lastQuery   = q;
      this._lastType    = 'pali-def';
      this._renderDictResults(this.bookFilter.filterResults(this._lastResults), q);

    } else if (type.id === 'ai') {
      const params = new URLSearchParams({ q, mode: 'ai' });
      this._appendFilterParams(params);
      window.location.href = `${this.baseUrl}/${this.lang}/search?${params}`;
    }
  }

  _appendFilterParams(params) {
    const { pitakas, layers } = this.bookFilter.getFilterParams();
    if (pitakas.length) params.set('pitakas', pitakas.join(','));
    if (layers.length)  params.set('layers',  layers.join(','));
  }

  /* ── Result rendering ────────────────────────────────────── */

  _showResultsLoading() {
    this.onShowResults();
    this.resultsPanel.innerHTML = '<div class="hd-loading">Searching…</div>';
  }

  _renderHeadingResults(data, query) {
    this.onShowResults();
    if (!data.length) {
      this.resultsPanel.innerHTML = '<div class="hd-empty">No results found.</div>';
      return;
    }
    const hl = str => str.replace(
      new RegExp(`(${escapeRegex(query)})`, 'gi'),
      '<mark>$1</mark>'
    );
    this.resultsPanel.innerHTML = data.map(item => {
      const slug = item.slug || '';
      const url = `${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}`;
      return `
      <a href="${url}"
         class="search-result-item"
         data-url="${url}">
        <div class="search-result-book">${item.book_name || item.book_id}</div>
        <div class="search-result-heading">${hl(item.title || '')}</div>
        <div class="search-result-meta">Paragraph ${item.para_id}</div>
      </a>
    `}).join('');

    this.resultsPanel.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });
  }

  _renderDictResults(data, query) {
    this.onShowResults();
    if (!data.length) {
      this.resultsPanel.innerHTML = '<div class="hd-empty">No definitions found.</div>';
      return;
    }
    const hl = str => str.replace(
      new RegExp(`(${escapeRegex(query)})`, 'gi'),
      '<mark>$1</mark>'
    );

    const groups = new Map();
    for (const item of data) {
      if (!groups.has(item.book_id)) {
        groups.set(item.book_id, { book_id: item.book_id, book_name: item.book_name || item.book_id, items: [] });
      }
      groups.get(item.book_id).items.push(item);
    }

    const totalBooks   = groups.size;
    const totalResults = data.length;
    let html = `<div class="dict-results-summary">${totalResults} result${totalResults !== 1 ? 's' : ''} in ${totalBooks} book${totalBooks !== 1 ? 's' : ''}</div>`;

    let groupIndex = 0;
    for (const [, group] of groups) {
      const groupId  = `dict-group-${groupIndex++}`;
      const expanded = groupIndex === 1;
      html += `
        <div class="dict-book-group ${expanded ? 'expanded' : ''}" id="${groupId}">
          <button class="dict-book-header" data-group="${groupId}" aria-expanded="${expanded}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${group.book_name}</span>
            <span class="dict-book-count">${group.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${group.items.map(item => {
              const slug = item.slug || '';
              const url = `${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}-${item.line_id}`;
              return `
              <a href="${url}"
                 class="search-result-item dict-entry"
                 data-url="${url}">
                <div class="search-result-heading">${hl(item.title || '')}</div>
                ${item.definition_pali ? `<div class="search-result-meta pali">${item.definition_pali}</div>` : ''}
                ${item.definition_en   ? `<div class="search-result-meta translation">${item.definition_en}</div>` : ''}
              </a>
            `}).join('')}
          </div>
        </div>`;
    }

    this.resultsPanel.innerHTML = html;

    this.resultsPanel.querySelectorAll('.dict-book-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const groupEl = document.getElementById(btn.dataset.group);
        if (!groupEl) return;
        const isOpen = groupEl.classList.contains('expanded');
        groupEl.classList.toggle('expanded', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    this.resultsPanel.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });
  }

  /* ── FTS search ─────────────────────────────────────────── */

  async _executeFtsSearch(q, page = null) {
    if (this._ftsLoading) return;
    this._ftsLoading = true;

    if (page !== null) this._ftsPage = page;

    const params = new URLSearchParams({
      q,
      page: this._ftsPage,
      limit: 30,
      lang: this.lang,
    });

    const { pitakas, layers } = this.bookFilter.getFilterParams();
    if (pitakas.length) params.set('pitakas', pitakas.join(','));
    if (layers.length)  params.set('layers',  layers.join(','));

    this._showResultsLoading();

    const data = await this._apiFetch(`${this.baseUrl}/api/fts_search?${params}`);
    this._ftsLoading = false;

    if (!data) {
      this.resultsPanel.innerHTML = '<div class="hd-empty">Search failed. Please try again.</div>';
      return;
    }

    this._ftsData       = data;
    this._ftsWords      = data.words || [];
    this._ftsExpandedBookId = null;   // reset on new search
    this._lastQuery     = q;
    this._lastType      = 'fulltext';

    this._renderFtsResults(data, q);
  }

  /**
   * Render FTS search results.
   *
   * Two display modes:
   *   - Book summary: shown when total > 30 and no book is selected
   *   - Full results: shown when total <= 30, or when a book is selected
   */
  _renderFtsResults(data, query) {
    this.onShowResults();

    const books         = data.books   || [];
    const results       = data.results || [];
    const totalResults  = data.total   || 0;
    const page          = data.page    || 1;
    const totalPages    = data.pages   || 1;

    if (!totalResults) {
      this.resultsPanel.innerHTML = '<div class="hd-empty">No results found.</div>';
      return;
    }

    if (results.length) {
      // ── Full results mode ──────────────────────────────────────────
      this._renderFtsFullResults(results, totalResults, page, totalPages, query);
    } else {
      // ── Book summary mode (total > 30) ────────────────────────────
      this._renderFtsBookSummary(books, totalResults, query);
    }
  }

  /**
   * Show book-level summary with result counts.
   * Each book card acts as an accordion: click to expand results inline,
   * click again to collapse. Only one book expanded at a time.
   * Respects the reader's layout preference (stacked vs side-by-side).
   */
  _renderFtsBookSummary(books, totalResults, query) {
    const layoutMode = this._getLayoutMode();

    let html = `<div class="dict-results-summary1">${totalResults.toLocaleString()} results in ${books.length} book${books.length !== 1 ? 's' : ''}</div>`;
    html += `<div class="fts-book-list">`;

    for (const book of books) {
      html += `
        <div class="fts-book-card-wrap">
          <button class="fts-book-card" data-book-id="${book.book_id}" data-book-name="${this._escapeAttr(book.book_name)}">
            <span class="fts-book-name">${book.book_name}</span>
            <span class="fts-book-count-badge">${book.count.toLocaleString()}</span>
          </button>
          <div class="fts-book-results ${layoutMode}" data-book-id="${book.book_id}"></div>
        </div>`;
    }

    html += `</div>`;
    this.resultsPanel.innerHTML = html;

    // Bind click — accordion expand/collapse
    this.resultsPanel.querySelectorAll('.fts-book-card').forEach(card => {
      card.addEventListener('click', async () => {
        const bid   = card.dataset.bookId;
        const name  = card.dataset.bookName;
        const wrap  = card.closest('.fts-book-card-wrap');
        const resultsEl = wrap?.querySelector('.fts-book-results');

        if (!bid || !resultsEl) return;

        // Invalid bookId guard
        if (bid === 'undefined' || bid === 'null') {
          resultsEl.innerHTML = '';
          resultsEl.classList.remove('expanded');
          return;
        }

        // If already expanded → collapse
        if (this._ftsExpandedBookId === bid) {
          card.classList.remove('active');
          resultsEl.innerHTML = '';
          resultsEl.classList.remove('expanded');
          this._ftsExpandedBookId = null;
          this._ftsData = null;
          return;
        }

        // Collapse any other currently expanded book
        if (this._ftsExpandedBookId) {
          const prevCard  = this.resultsPanel.querySelector(`.fts-book-card[data-book-id="${this._ftsExpandedBookId}"]`);
          const prevWrap  = prevCard?.closest('.fts-book-card-wrap');
          if (prevCard)  prevCard.classList.remove('active');
          if (prevWrap) {
            const prevResults = prevWrap.querySelector('.fts-book-results');
            if (prevResults) {
              prevResults.innerHTML = '';
              prevResults.classList.remove('expanded');
            }
          }
        }

        // Expand this book
        card.classList.add('active');
        resultsEl.innerHTML = '<div class="hd-loading">Loading…</div>';
        resultsEl.classList.add('expanded');
        this._ftsExpandedBookId = bid;
        this._ftsPage = 1;
        this._ftsData = null;

        // Fetch results for this book
        await this._loadBookResults(bid, name, resultsEl);

        // Scroll so the results are visible
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  /**
   * Fetch and render results for a single book into its inline results container.
   */
  async _loadBookResults(bookId, bookName, containerEl) {
    if (!bookId || bookId === 'undefined' || bookId === 'null') {
      console.warn('[FTS] _loadBookResults called with invalid book_id:', bookId);
      return;
    }
    if (!containerEl) return;

    const params = new URLSearchParams({
      q: this._lastQuery,
      book_id: bookId,
      page: 1,
      limit: 30,
      lang: this.lang,
    });

    const { pitakas, layers } = this.bookFilter.getFilterParams();
    if (pitakas.length) params.set('pitakas', pitakas.join(','));
    if (layers.length)  params.set('layers',  layers.join(','));

    const data = await this._apiFetch(`${this.baseUrl}/api/fts_search?${params}`);
    if (!data || !data.results?.length) {
      containerEl.innerHTML = '<div class="hd-empty">No results found for this book.</div>';
      return;
    }

    this._ftsData = data;
    this._renderPerBookView(data, bookName || bookId, containerEl);
  }

  /**
   * Render per-book results into the given container element.
   * Respects the reader's layout preference (stacked vs side-by-side).
   */
  _renderPerBookView(data, bookName, containerEl) {
    if (!containerEl) return;

    const results      = data.results || [];
    const total        = data.total   || 0;
    const page         = data.page    || 1;
    const totalPages   = data.pages   || 1;
    const layoutMode   = this._getLayoutMode();

    let html = `
      <div class="fts-results-header">
        <span class="fts-results-name">${this._escapeHtml(bookName)}</span>
        <span class="fts-results-count">${total} result${total !== 1 ? 's' : ''}</span>
      </div>`;

    for (const group of results) {
      html += `
        <div class="dict-book-group expanded">
          <div class="dict-book-body" style="display:block">
            ${group.items.map(item => {
              const slug = item.slug || '';
              const url = `${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}`;
              const lines = item.lines || [];

              let linesHtml = '';
              for (const line of lines) {
                if (!line.matched) continue;
                const sideClass = layoutMode === 'sidebyside' ? ' side-by-side' : '';
                linesHtml += `
                  <div class="fts-line-row fts-line-matched${sideClass}">
                    <div class="fts-line-pali">${line.pali || ''}</div>
                    ${line.translation ? `<div class="fts-line-trans">${line.translation}</div>` : ''}
                  </div>`;
              }

              return `
                <a href="${url}" class="search-result-item dict-entry fts-entry" data-url="${url}">
                  <div class="fts-para-meta">Paragraph ${item.para_id}</div>
                  ${linesHtml}
                </a>`;
            }).join('')}
          </div>
        </div>`;
    }

    if (totalPages > 1) {
      html += `
        <div class="fts-pagination">
          <button class="fts-page-btn fts-prev" ${page <= 1 ? 'disabled' : ''}>← Prev</button>
          <span class="fts-page-info">Page ${page} / ${totalPages}</span>
          <button class="fts-page-btn fts-next" ${page >= totalPages ? 'disabled' : ''}>Next →</button>
        </div>`;
    }

    containerEl.innerHTML = html;

    // Entry click → navigate
    containerEl.querySelectorAll('.fts-entry').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });

    // Pagination — find buttons within this container only
    containerEl.querySelector('.fts-prev')?.addEventListener('click', () => {
      this._handleFtsPage(this._ftsPage - 1);
    });
    containerEl.querySelector('.fts-next')?.addEventListener('click', () => {
      this._handleFtsPage(this._ftsPage + 1);
    });
  }

  /**
   * Render full line-level results (with matched lines only).
   */
  _renderFtsFullResults(results, totalResults, page, totalPages, query) {
    let html = `<div class="dict-results-summary1">${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`;

    // If multiple books shown, show back button
    if (results.length > 1 && this._ftsData?.books?.length > 1) {
      html += ` &mdash; <button class="fts-back-btn" id="fts-back-summary">← Back to all books</button>`;
    }
    html += `</div>`;

    let groupIndex = 0;
    for (const group of results) {
      const groupId  = `fts-group-${groupIndex++}`;
      const expanded = groupIndex === 1;
      html += `
        <div class="dict-book-group ${expanded ? 'expanded' : ''}" id="${groupId}">
          <button class="dict-book-header" data-group="${groupId}" aria-expanded="${expanded}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${group.book_name}</span>
            <span class="dict-book-count">${group.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${group.items.map(item => {
              const slug = item.slug || '';
              const url = `${this.baseUrl}/${this.lang}/book/${item.book_id}/${slug}#${item.para_id}`;
              const lines = item.lines || [];

              // Show only matched lines (backend already highlights with <mark>)
              let linesHtml = '';
              for (const line of lines) {
                if (!line.matched) continue;
                linesHtml += `
                  <div class="fts-line-row fts-line-matched">
                    <div class="fts-line-pali">${line.pali || ''}</div>
                    ${line.translation ? `<div class="fts-line-trans">${line.translation}</div>` : ''}
                  </div>`;
              }

              return `
                <a href="${url}" class="search-result-item dict-entry fts-entry" data-url="${url}">
                  <div class="fts-para-meta">Paragraph ${item.para_id}</div>
                  ${linesHtml}
                </a>`;
            }).join('')}
          </div>
        </div>`;
    }

    if (totalPages > 1) {
      html += `
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${page <= 1 ? 'disabled' : ''}>← Prev</button>
          <span class="fts-page-info">Page ${page} / ${totalPages}</span>
          <button class="fts-page-btn" id="fts-next" ${page >= totalPages ? 'disabled' : ''}>Next →</button>
        </div>`;
    }

    this.resultsPanel.innerHTML = html;

    // Book group toggle
    this.resultsPanel.querySelectorAll('.dict-book-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const groupEl = document.getElementById(btn.dataset.group);
        if (!groupEl) return;
        const isOpen = groupEl.classList.contains('expanded');
        groupEl.classList.toggle('expanded', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    // Entry click → navigate
    this.resultsPanel.querySelectorAll('.fts-entry').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });

    // Pagination
    this.resultsPanel.querySelector('#fts-prev')?.addEventListener('click', () => {
      this._handleFtsPage(this._ftsPage - 1);
    });
    this.resultsPanel.querySelector('#fts-next')?.addEventListener('click', () => {
      this._handleFtsPage(this._ftsPage + 1);
    });

    // Back to book summary
    this.resultsPanel.querySelector('#fts-back-summary')?.addEventListener('click', () => {
      this._renderFtsBookSummary(this._ftsData.books, this._ftsData.total, this._lastQuery);
    });
  }

  /**
   * Handle pagination page change — re-fetch and update the expanded book's container.
   */
  async _handleFtsPage(newPage) {
    const bookId = this._ftsExpandedBookId;
    if (!bookId) return;

    // Find the container for the currently expanded book
    const wrap = this.resultsPanel.querySelector('.fts-book-results.expanded');
    if (!wrap) return;

    wrap.innerHTML = '<div class="hd-loading">Loading…</div>';

    const params = new URLSearchParams({
      q: this._lastQuery,
      book_id: bookId,
      page: newPage,
      limit: 30,
      lang: this.lang,
    });
    const { pitakas, layers } = this.bookFilter.getFilterParams();
    if (pitakas.length) params.set('pitakas', pitakas.join(','));
    if (layers.length)  params.set('layers',  layers.join(','));

    const newData = await this._apiFetch(`${this.baseUrl}/api/fts_search?${params}`);
    if (newData && newData.results?.length) {
      this._ftsData  = newData;
      this._ftsPage  = newPage;
      const card = wrap.closest('.fts-book-card-wrap')?.querySelector('.fts-book-card');
      const name = card?.dataset.bookName || bookId;
      this._renderPerBookView(newData, name, wrap);
    }
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  async _apiFetch(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Read the user's layout preference from the reader settings (localStorage).
   * Returns 'sidebyside' or 'stacked'.
   */
  _getLayoutMode() {
    try {
      const settings = JSON.parse(localStorage.getItem('epitaka_settings_v3') || '{}');
      return settings.layout === 'sidebyside' ? 'sidebyside' : 'stacked';
    } catch {
      return 'stacked';
    }
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  _escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

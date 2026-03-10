/**
 * home-dialog-search.js
 * Handles all search functionality for the Home Dialog:
 *   - Search type selection (headings / fulltext / pali-def / ai)
 *   - Full-text sub-options (exact, distance, paragraph)
 *   - Autocomplete suggestions (headings API)
 *   - Search execution → renders results into results panel
 *   - BookFilter integration for all search types
 */

import { BookFilter } from './home-dialog-search-filter.js';
import { installPaliInput } from '../libs/pali_typing.js';

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
    hasAutocomplete: true,   // word-by-word suggest
    hasFtsOptions:   true,
    autocompleteMode: 'word', // append word + space on select
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

export const FTS_MODES = [
  { id: 'exact',    label: 'Sentence' },
  { id: 'para',     label: 'Paragraph' },
  { id: 'distance', label: 'Distance' },
];

/* ─────────────────────────────────────────────────────────────
   HomeDialogSearch class
───────────────────────────────────────────────────────────── */
export class HomeDialogSearch {
  /**
   * @param {object} opts
   * @param {string}   opts.baseUrl
   * @param {object}   opts.hierarchy        The full hierarchy dict (book_id → metadata)
   * @param {Function} opts.onResultSelect   Called with the URL when user picks a result
   * @param {Function} opts.onShowResults    Called to switch results panel visible
   * @param {Function} opts.onShowBooks      Called to switch back to book-list tabs
   */
  constructor({ baseUrl, hierarchy = {}, onResultSelect, onShowResults, onShowBooks }) {
    this.baseUrl        = baseUrl;
    this.hierarchy      = hierarchy;
    this.onResultSelect = onResultSelect;
    this.onShowResults  = onShowResults;
    this.onShowBooks    = onShowBooks;

    this.currentType    = SEARCH_TYPES[0];
    this.ftsModeId      = 'exact';
    this.ftsDistance    = 2;
    this._acDebounce    = null;
    this._acController  = null;
    this._focusedIdx    = -1;
    this._suggestions   = [];

    // BookFilter (shared across search types)
    this.bookFilter     = new BookFilter(hierarchy, {
      onChange: () => this._onFilterChange(),
    });

    // DOM refs (set after dialog HTML is rendered)
    this.typeBtn        = null;
    this.typeMenu       = null;
    this.searchInput    = null;
    this.suggestionsEl  = null;
    this.ftsBar         = null;
    this.distanceWrap   = null;
    this.distanceNum    = null;
    this.goBtn          = null;
    this.resultsPanel   = null;
    this.filterWrap     = null;

    // Cache last search results for live re-filtering
    this._lastResults   = null;
    this._lastQuery     = '';
    this._lastType      = null;

    // FTS pagination state
    this._ftsPage       = 1;
    this._ftsTotalPages = 1;
    this._ftsWords      = [];
    this._ftsLoading    = false;
  }

  /** Bind all DOM elements after dialog is inserted into the page. */
  bind() {
    this.typeBtn       = document.getElementById('search-type-btn');
    this.typeMenu      = document.getElementById('search-type-menu');
    this.searchInput   = document.getElementById('home-search-input');
    this.suggestionsEl = document.getElementById('home-suggestions');
    this.ftsBar        = document.getElementById('fts-options-bar');
    this.distanceWrap  = document.getElementById('fts-distance-wrap');
    this.distanceNum   = document.getElementById('fts-distance-num');
    this.goBtn         = document.getElementById('home-search-go');
    this.resultsPanel  = document.getElementById('home-results-panel');
    this.filterWrap    = document.getElementById('home-filter-wrap');

    this._bindTypeDropdown();
    this._bindFtsOptions();
    this._bindInput();
    this._bindGoButton();

    // Mount the shared filter into its container
    if (this.filterWrap) {
      this.bookFilter.mount(this.filterWrap);
    }

    // Initial state
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
        const id   = opt.dataset.type;
        const type = SEARCH_TYPES.find(t => t.id === id);
        if (type) this._selectType(type);
      });
    });

    document.addEventListener('click', () => this._closeTypeMenu());
  }

  _toggleTypeMenu() {
    const open = this.typeMenu.classList.contains('show');
    open ? this._closeTypeMenu() : this._openTypeMenu();
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

  /**
   * Position a fixed dropdown directly below an anchor element using
   * getBoundingClientRect — escapes any overflow/transform stacking context.
   */
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
    // clear results
    if (this.resultsPanel) {
      this.resultsPanel.innerHTML = '';
      this.resultsPanel.classList.remove('active');
    }
    this.onShowBooks();
  }

  _applyTypeUI(type) {
    // Update button label
    this.typeBtn.innerHTML =
      `<span>${type.icon} ${type.label}</span><span class="arrow">▾</span>`;

    // Update input placeholder
    this.searchInput.placeholder = type.placeholder;

    // Highlight selected option in menu
    this.typeMenu.querySelectorAll('.search-type-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.type === type.id);
    });

    // FTS sub-options
    if (type.hasFtsOptions) {
      this.ftsBar.classList.add('show');
    } else {
      this.ftsBar.classList.remove('show');
    }
  }

  /* ── Filter change handler ───────────────────────────────── */

  /**
   * Called whenever the BookFilter changes.
   * Re-renders cached results immediately (no new network request needed
   * for client-side search types like headings & pali-def).
   * For fulltext/ai the filter params are baked into the redirect URL,
   * so we just need to keep them in sync.
   */
  _onFilterChange() {
    if (!this._lastResults || !this._lastQuery) return;

    if (this._lastType === 'headings') {
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderHeadingResults(filtered, this._lastQuery);
    } else if (this._lastType === 'pali-def') {
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderDictResults(filtered, this._lastQuery);
    }
  }

  /* ── FTS sub-options ─────────────────────────────────────── */

  _bindFtsOptions() {
    this.ftsBar.querySelectorAll('.fts-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.ftsModeId = chip.dataset.mode;
        this.ftsBar.querySelectorAll('.fts-chip').forEach(c =>
          c.classList.toggle('active', c.dataset.mode === this.ftsModeId)
        );
        // Show / hide distance number input
        if (this.ftsModeId === 'distance') {
          this.distanceWrap.classList.add('show');
        } else {
          this.distanceWrap.classList.remove('show');
        }
      });
    });

    this.distanceNum.addEventListener('change', () => {
      this.ftsDistance = Math.max(1, parseInt(this.distanceNum.value) || 2);
      this.distanceNum.value = this.ftsDistance;
    });
  }

  /* ── Input & autocomplete ────────────────────────────────── */

  _bindInput() {
    this.searchInput.addEventListener('input', () => {
      this._onInput();
    });

    this.searchInput.addEventListener('keydown', e => {
      this._onKeydown(e);
    });

    this.searchInput.addEventListener('blur', () => {
      // Delay so click on suggestion fires first
      setTimeout(() => this._closeSuggestions(), 160);
    });

    this.removePaliHandler = installPaliInput(this.searchInput, {
      mode: 'both',   // or 'velthuis' or 'deadkey'
      onConvert: (normalized) => {
        // instead of duplicating logic, just trigger the same flow
        const q = normalized.trim();
        if (!q) {
          this._closeSuggestions();
          return;
        }
        if (this.currentType.hasAutocomplete) {
          clearTimeout(this._acDebounce);
          this._acDebounce = setTimeout(() => this._fetchSuggestions(q), 220);
        }
      }
    });
  }

  _onInput() {
    const q = this.searchInput.value.trim();
    if (!q) {
      this._closeSuggestions();
      return;
    }
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
        // For fulltext: only suggest based on the last word being typed
        const lastWord = q.split(/\s+/).pop();
        if (!lastWord) { this._closeSuggestions(); return; }
        url = `${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(lastWord)}&limit=10`;
      } else {
        return;
      }

      const res  = await fetch(url, { signal: this._acController.signal });
      const data = await res.json();

      if (this.currentType.autocompleteMode === 'word') {
        // data is a plain array of word strings
        this._renderWordSuggestions(data, q);
      } else {
        const filtered = this.bookFilter.filterResults(data);
        this._renderSuggestions(filtered, q);
      }
    } catch (err) {
      if (err.name !== 'AbortError') this._closeSuggestions();
    }
  }

  /**
   * Render word-append suggestions for fulltext mode.
   * Selecting a suggestion appends the word to the input and keeps focus.
   */
  _renderWordSuggestions(words, currentInput) {
    this._positionBelow(this.searchInput, this.suggestionsEl);
    this.suggestionsEl.style.width = `${this.searchInput.getBoundingClientRect().width}px`;

    if (!words?.length) {
      this.suggestionsEl.innerHTML = '<div class="suggestion-empty">No suggestions</div>';
      this.suggestionsEl.classList.add('show');
      this._suggestions = [];
      return;
    }

    // Store as objects so keyboard nav works uniformly
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
          // Replace last partial word with the selected full word + space
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

  /**
   * Render suggestions. Expected API shapes:
   *   headings: [{ title, book_id, book_name, para_id }, ...]
   *   pali-def: [{ word, definition_short }, ...]
   */
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

    // Word-append mode (fulltext)
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
      const url = `${this.baseUrl}/book/${item.book_id}?para=${item.para_id}`;
      this.onResultSelect(url);
    } else if (this.currentType.id === 'pali-def') {
      const url = `${this.baseUrl}/book/${item.book_id}?para=${item.para_id}&line=${item.line_id}`;
      this.onResultSelect(url);
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
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderHeadingResults(filtered, q);

    } else if (type.id === 'fulltext') {
      this._ftsPage = 1;
      await this._executeFtsSearch(q);

    } else if (type.id === 'pali-def') {
      this._showResultsLoading();
      const data = await this._apiFetch(
        `${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(q)}&limit=80`
      );
      this._lastResults = data || [];
      this._lastQuery   = q;
      this._lastType    = 'pali-def';
      const filtered = this.bookFilter.filterResults(this._lastResults);
      this._renderDictResults(filtered, q);

    } else if (type.id === 'ai') {
      const params = new URLSearchParams({ q, mode: 'ai' });
      this._appendFilterParams(params);
      window.location.href = `${this.baseUrl}/search?${params}`;
    }
  }

  /**
   * Append the current filter state as URL params.
   * The server can read `pitakas` and `layers` query params to pre-filter.
   */
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
    this.resultsPanel.innerHTML = data.map(item => `
      <a href="${this.baseUrl}/book/${item.book_id}?para=${item.para_id}"
         class="search-result-item"
         data-url="${this.baseUrl}/book/${item.book_id}?para=${item.para_id}">
        <div class="search-result-book">${item.book_name || item.book_id}</div>
        <div class="search-result-heading">${hl(item.title || '')}</div>
        <div class="search-result-meta">Paragraph ${item.para_id}</div>
      </a>
    `).join('');

    this.resultsPanel.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });
  }

  /**
   * Render Pāli dictionary results grouped by book.
   * Each book group is collapsible; collapsed by default.
   *
   * @param {Array}  data   Already-filtered array of result objects
   * @param {string} query  Original search query (for highlighting)
   */
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

    // ── Group results by book_id ────────────────────────────
    const groups = new Map(); // book_id → { book_name, items[] }
    for (const item of data) {
      if (!groups.has(item.book_id)) {
        groups.set(item.book_id, {
          book_id:   item.book_id,
          book_name: item.book_name || item.book_id,
          items:     [],
        });
      }
      groups.get(item.book_id).items.push(item);
    }

    const totalBooks   = groups.size;
    const totalResults = data.length;

    // ── Build HTML ──────────────────────────────────────────
    let html = `<div class="dict-results-summary">${totalResults} result${totalResults !== 1 ? 's' : ''} in ${totalBooks} book${totalBooks !== 1 ? 's' : ''}</div>`;

    let groupIndex = 0;
    for (const [book_id, group] of groups) {
      const groupId  = `dict-group-${groupIndex++}`;
      const count    = group.items.length;
      // Expand the first group automatically, collapse the rest
      const expanded = groupIndex === 1;

      html += `
        <div class="dict-book-group ${expanded ? 'expanded' : ''}" id="${groupId}">
          <button class="dict-book-header" data-group="${groupId}" aria-expanded="${expanded}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${group.book_name}</span>
            <span class="dict-book-count">${count}</span>
          </button>
          <div class="dict-book-body">
            ${group.items.map(item => `
              <a href="${this.baseUrl}/book/${item.book_id}?para=${item.para_id}&line=${item.line_id}"
                 class="search-result-item dict-entry"
                 data-url="${this.baseUrl}/book/${item.book_id}?para=${item.para_id}&line=${item.line_id}">
                <div class="search-result-heading">${hl(item.title || '')}</div>
                ${item.definition_pali ? `<div class="search-result-meta pali">${item.definition_pali}</div>` : ''}
                ${item.definition_en   ? `<div class="search-result-meta translation">${item.definition_en}</div>` : ''}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.resultsPanel.innerHTML = html;

    // ── Collapse/expand interaction ─────────────────────────
    this.resultsPanel.querySelectorAll('.dict-book-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const groupEl = document.getElementById(btn.dataset.group);
        if (!groupEl) return;
        const isOpen = groupEl.classList.contains('expanded');
        groupEl.classList.toggle('expanded', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    // ── Navigation ─────────────────────────────────────────
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

    const params = new URLSearchParams({ q, page: this._ftsPage, limit: 20 });

    if (this.ftsModeId === 'distance') {
      params.set('mode', 'distance');
      params.set('distance', this.ftsDistance);
    } else if (this.ftsModeId === 'para') {
      params.set('mode', 'para');
    } else {
      params.set('mode', 'exact');
    }

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

    this._ftsTotalPages = data.pages || 1;
    this._ftsWords      = data.words || [];
    this._lastResults   = data.results || [];
    this._lastQuery     = q;
    this._lastType      = 'fulltext';

    this._renderFtsResults(data, q);
  }

  _renderFtsResults(data, query) {
    this.onShowResults();

    const results = data.results || [];
    const words   = data.words   || [query];

    if (!results.length) {
      this.resultsPanel.innerHTML = '<div class="hd-empty">No results found.</div>';
      return;
    }

    // Highlight all searched words
    const hlPattern = new RegExp(
      `(${words.map(w => escapeRegex(w)).join('|')})`,
      'gi'
    );
    const hl = str => (str || '').replace(hlPattern, '<mark>$1</mark>');

    const totalResults = data.total  || 0;
    const page         = data.page   || 1;
    const totalPages   = data.pages  || 1;

    let html = `<div class="dict-results-summary">${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''} &mdash; page ${page} of ${totalPages}</div>`;

    let groupIndex = 0;
    for (const group of results) {
      const groupId  = `fts-group-${groupIndex++}`;
      const count    = group.items.length;
      const expanded = groupIndex === 1;

      html += `
        <div class="dict-book-group ${expanded ? 'expanded' : ''}" id="${groupId}">
          <button class="dict-book-header" data-group="${groupId}" aria-expanded="${expanded}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${group.book_name}</span>
            <span class="dict-book-count">${count}</span>
          </button>
          <div class="dict-book-body">
            ${group.items.map(item => {
              const url = `${this.baseUrl}/book/${item.book_id}?para=${item.para_id}`;
              return `
                <a href="${url}" class="search-result-item dict-entry fts-entry" data-url="${url}">
                  ${item.pali    ? `<div class="fts-pali">${hl(item.pali)}</div>`    : ''}
                  ${item.english ? `<div class="fts-english">${hl(item.english)}</div>` : ''}
                  <div class="fts-meta">para ${item.para_id}</div>
                </a>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Pagination controls
    if (totalPages > 1) {
      const prevDisabled = page <= 1 ? 'disabled' : '';
      const nextDisabled = page >= totalPages ? 'disabled' : '';
      html += `
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${prevDisabled}>← Prev</button>
          <span class="fts-page-info">Page ${page} / ${totalPages}</span>
          <button class="fts-page-btn" id="fts-next" ${nextDisabled}>Next →</button>
        </div>
      `;
    }

    this.resultsPanel.innerHTML = html;

    // Collapse/expand
    this.resultsPanel.querySelectorAll('.dict-book-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const groupEl = document.getElementById(btn.dataset.group);
        if (!groupEl) return;
        const isOpen = groupEl.classList.contains('expanded');
        groupEl.classList.toggle('expanded', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    // Navigation
    this.resultsPanel.querySelectorAll('.fts-entry').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.onResultSelect(el.dataset.url);
      });
    });

    // Pagination buttons
    const prevBtn = this.resultsPanel.querySelector('#fts-prev');
    const nextBtn = this.resultsPanel.querySelector('#fts-next');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      this._executeFtsSearch(this._lastQuery, this._ftsPage - 1);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      this._executeFtsSearch(this._lastQuery, this._ftsPage + 1);
    });
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
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * home-dialog-booklist.js
 * Renders the tabbed book-list panels (Mūla / Attha / Ṭīkā) inside
 * the home dialog, matching the data structure used in index.html.
 *
 * Expected menu shape (same as Flask `menu` context variable):
 * {
 *   "Mūla": {
 *     "Vinaya Piṭaka": [ [book_id, title], ... ],
 *     "Sutta Piṭaka": {
 *       "Dīgha Nikāya": [ [book_id, title], ... ],
 *       ...
 *     },
 *     "Abhidhamma Piṭaka": [ [book_id, title], ... ]
 *   },
 *   "Attha": { ... },
 *   "Ṭīkā":  { ... }
 * }
 */

const TAB_ORDER = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā'];

export class HomeDialogBookList {
  /**
   * @param {object} opts
   * @param {string}   opts.baseUrl
   * @param {object}   opts.menu     The full menu object from the server
   * @param {Function} opts.onNavigate  Called with URL when a book link is clicked
   */
  constructor({ baseUrl, menu, onNavigate }) {
    this.baseUrl    = baseUrl;
    this.menu       = menu;
    this.onNavigate = onNavigate;

    this._filterText = '';
  }

  /** Build tab bar + panels HTML and insert into dialog body. */
  buildHTML() {
    const categories = this._resolvedCategories();

    const tabsHTML = categories.map((cat, i) => `
      <button class="home-tab${i === 0 ? ' active' : ''}"
              data-tab="${i}" type="button">${cat.label}</button>
    `).join('');

    const panelsHTML = categories.map((cat, i) => `
      <div class="home-tab-panel${i === 0 ? ' active' : ''}" data-panel="${i}">
        ${this._buildCategoryHTML(cat)}
      </div>
    `).join('');

    return `
      <div id="home-tabs">${tabsHTML}</div>
      <div id="home-tab-panels-wrap" style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${panelsHTML}
        <div id="home-results-panel"></div>
      </div>
    `;
  }

  /** Attach tab-switching events. Call after HTML is in the DOM. */
  bindTabs() {
    const tabs   = document.querySelectorAll('.home-tab');
    const panels = document.querySelectorAll('.home-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.dataset.tab);
        tabs.forEach(t   => t.classList.toggle('active',   t === tab));
        panels.forEach(p => p.classList.toggle('active',   parseInt(p.dataset.panel) === idx));
        // hide results panel when switching tabs
        const rp = document.getElementById('home-results-panel');
        if (rp) rp.classList.remove('active');
      });
    });

    // Nikaya collapse toggles
    document.querySelectorAll('.book-nikaya-title').forEach(title => {
      title.addEventListener('click', () => {
        title.classList.toggle('open');
        const list = title.nextElementSibling;
        if (list) list.classList.toggle('open');
      });
    });

    // Book link clicks
    document.querySelectorAll('.book-entry').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.onNavigate(link.href);
      });
    });
  }

  /** Filter visible books by text; call after user types in search */
  filter(text) {
    this._filterText = text.toLowerCase().trim();

    document.querySelectorAll('.home-tab-panel').forEach(panel => {
      panel.querySelectorAll('.book-entry').forEach(entry => {
        const name = entry.querySelector('.book-name')?.textContent?.toLowerCase() || '';
        const show = !this._filterText || name.includes(this._filterText);
        entry.style.display = show ? '' : 'none';

        // Mark matching text
        if (this._filterText && show) {
          const nameEl = entry.querySelector('.book-name');
          if (nameEl) {
            nameEl.innerHTML = highlight(nameEl.textContent, this._filterText);
          }
        }
      });

      // Show/hide nikaya groups based on whether they have visible children
      panel.querySelectorAll('.book-nikaya').forEach(nikaya => {
        const hasVisible = [...nikaya.querySelectorAll('.book-entry')]
          .some(e => e.style.display !== 'none');
        nikaya.style.display = hasVisible ? '' : 'none';
        // Auto-expand if filtering
        if (this._filterText) {
          nikaya.querySelector('.book-nikaya-title')?.classList.add('open');
          nikaya.querySelector('.book-nikaya-list')?.classList.add('open');
        }
      });

      // Show/hide categories
      panel.querySelectorAll('.book-category').forEach(cat => {
        const hasVisible = [...cat.querySelectorAll('.book-entry')]
          .some(e => e.style.display !== 'none');
        cat.style.display = hasVisible ? '' : 'none';
      });
    });
  }

  /** Clear filter highlights — call when search is cleared */
  clearFilter() {
    this._filterText = '';
    document.querySelectorAll('.book-entry').forEach(entry => {
      entry.style.display = '';
      const nameEl = entry.querySelector('.book-name');
      if (nameEl) nameEl.textContent = nameEl.textContent; // strips HTML
    });
    document.querySelectorAll('.book-nikaya, .book-category').forEach(el => {
      el.style.display = '';
    });
  }

  /* ── Private helpers ─────────────────────────────────────── */

  _resolvedCategories() {
    // Try TAB_ORDER keys first, then whatever keys the menu has
    const keys = Object.keys(this.menu);
    const ordered = [
      ...TAB_ORDER.filter(k => keys.includes(k)),
      ...keys.filter(k => !TAB_ORDER.includes(k)),
    ];
    return ordered.map(k => ({ label: k, data: this.menu[k] }));
  }

  _buildCategoryHTML({ data }) {
    if (!data || typeof data !== 'object') return '';

    return Object.entries(data).map(([pitakaName, books]) => `
      <div class="book-category">
        <div class="book-category-title">${pitakaName}</div>
        ${this._buildPitakaContent(pitakaName, books)}
      </div>
    `).join('');
  }

  _buildPitakaContent(pitakaName, books) {
    // Sutta Piṭaka has an extra nikaya level: { nikaya: [[id,title],...], ... }
    if (books && typeof books === 'object' && !Array.isArray(books)) {
      return Object.entries(books).map(([nikayaName, nikayaBooks]) => `
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${nikayaName}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(nikayaBooks)}
          </ol>
        </div>
      `).join('');
    }

    // Flat list
    return `<ol>${this._buildBookList(books)}</ol>`;
  }

  _buildBookList(books) {
    if (!Array.isArray(books)) return '';
    return books.map(([bookId, title], i) => `
      <li>
        <a href="${this.baseUrl}/book/${bookId}"
           class="book-entry"
           data-book-id="${bookId}">
          <span class="book-num">${i + 1}.</span>
          <span class="book-name">${title}</span>
        </a>
      </li>
    `).join('');
  }
}

function highlight(text, query) {
  if (!query) return text;
  return text.replace(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<mark>$1</mark>'
  );
}
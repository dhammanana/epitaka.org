/**
 * home-dialog-booklist.js
 *
 * Renders the browsable book list inside the home dialog.
 *
 * Menu structure produced by books.py organize_hierarchy():
 *
 *   { category: { nikaya: { sub_nikaya: [ [book_id, title], … ] } } }
 *
 * Books with no sub_nikaya are stored under the '' (empty-string) key.
 * This avoids the previous bug where a mixed nikaya (some books with
 * sub_nikaya, some without) would wipe all its entries.
 */

import { highlight } from '../libs/highlight.js';

const TAB_ORDER    = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā'];
const PITAKA_ORDER = ['Vinaya', 'Suttanta', 'Sutta', 'Abhidhamma'];

export class HomeDialogBookList {
  constructor({ baseUrl, menu, onNavigate }) {
    this.baseUrl    = baseUrl;
    this.menu       = menu;
    this.onNavigate = onNavigate;
    this._filterText = '';
  }

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
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${panelsHTML}
        <div id="home-results-panel"></div>
      </div>
    `;
  }

  bindTabs() {
    const tabs   = document.querySelectorAll('.home-tab');
    const panels = document.querySelectorAll('.home-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.dataset.tab);
        tabs.forEach(t   => t.classList.toggle('active', t === tab));
        panels.forEach(p => p.classList.toggle('active', parseInt(p.dataset.panel) === idx));
        document.getElementById('home-results-panel')?.classList.remove('active');
      });
    });

    document.querySelectorAll('.book-nikaya-title').forEach(title => {
      title.addEventListener('click', () => {
        title.classList.toggle('open');
        title.nextElementSibling?.classList.toggle('open');
      });
    });

    document.querySelectorAll('.book-entry').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.onNavigate(link.href);
      });
    });
  }

  filter(text) {
    this._filterText = text.toLowerCase().trim();

    document.querySelectorAll('.home-tab-panel').forEach(panel => {
      panel.querySelectorAll('.book-entry').forEach(entry => {
        const name = entry.querySelector('.book-name')?.textContent?.toLowerCase() || '';
        const show = !this._filterText || name.includes(this._filterText);
        entry.style.display = show ? '' : 'none';
        if (this._filterText && show) {
          const nameEl = entry.querySelector('.book-name');
          if (nameEl) nameEl.innerHTML = highlight(nameEl.textContent, this._filterText);
        }
      });

      panel.querySelectorAll('.book-nikaya').forEach(nikaya => {
        const hasVisible = [...nikaya.querySelectorAll('.book-entry')]
          .some(e => e.style.display !== 'none');
        nikaya.style.display = hasVisible ? '' : 'none';
        if (this._filterText) {
          nikaya.querySelector('.book-nikaya-title')?.classList.add('open');
          nikaya.querySelector('.book-nikaya-list')?.classList.add('open');
        }
      });

      panel.querySelectorAll('.book-category').forEach(cat => {
        const hasVisible = [...cat.querySelectorAll('.book-entry')]
          .some(e => e.style.display !== 'none');
        cat.style.display = hasVisible ? '' : 'none';
      });
    });
  }

  clearFilter() {
    this._filterText = '';
    document.querySelectorAll('.book-entry').forEach(entry => {
      entry.style.display = '';
      const nameEl = entry.querySelector('.book-name');
      if (nameEl) nameEl.textContent = nameEl.textContent;
    });
    document.querySelectorAll('.book-nikaya, .book-category').forEach(el => {
      el.style.display = '';
    });
  }

  /* ── Private helpers ──────────────────────────────────────── */

  _resolvedCategories() {
    const keys    = Object.keys(this.menu);
    const ordered = [
      ...TAB_ORDER.filter(k => keys.includes(k)),
      ...keys.filter(k => !TAB_ORDER.includes(k)),
    ];
    return ordered.map(k => ({ label: k, data: this.menu[k] }));
  }

  _buildCategoryHTML({ data }) {
    if (!data || typeof data !== 'object') return '';

    const pitakaNames = Object.keys(data).sort((a, b) => {
      const idx = name => {
        const i = PITAKA_ORDER.findIndex(p => name.includes(p));
        return i === -1 ? 99 : i;
      };
      return idx(a) - idx(b);
    });

    return pitakaNames.map(name => `
      <div class="book-category">
        <div class="book-category-title">${name}</div>
        <div class="book-category-content">
          ${this._renderNikaya(data[name])}
        </div>
      </div>
    `).join('');
  }

  /**
   * Render a nikaya dict: { sub_nikaya: [ [book_id, title], … ] }
   *
   * '' key  → books with no sub_nikaya, rendered as a flat list.
   * other keys → collapsible sub-nikaya group.
   */
  _renderNikaya(nikayaDict) {
    if (!nikayaDict || typeof nikayaDict !== 'object') return '';

    const parts = [];

    // Flat books (no sub_nikaya) — render first, no collapsible wrapper
    if (nikayaDict['']) {
      parts.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(nikayaDict[''])}
          </ol>
        </div>
      `);
    }

    // Sub-nikaya groups
    Object.entries(nikayaDict).forEach(([subNikaya, books]) => {
      if (subNikaya === '') return; // already handled above
      parts.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${subNikaya}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(books)}
          </ol>
        </div>
      `);
    });

    return parts.join('');
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
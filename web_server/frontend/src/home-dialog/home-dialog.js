/**
 * home-dialog.js
 * Entry point for the Home / Book-Chooser Dialog.
 *
 * Usage (in book.js or wherever you mount the topbar):
 *
 *   import { initHomeDialog } from './home-dialog.js';
 *
 *   // Call once after DOM ready, passing the server-side menu data:
 *   initHomeDialog({
 *     triggerSelector: '#home-dialog-trigger',   // the ⌂ button
 *     baseUrl: window.BOOK_CONFIG.baseUrl,
 *     menu: window.HOME_MENU,   // injected from Flask: window.HOME_MENU = {{ menu | tojson }}
 *   });
 *
 * The trigger button in book.html should be changed to:
 *   <button id="home-dialog-trigger" class="topbar-btn icon-btn" aria-label="Home">⌂</button>
 *
 * And add to the <script> block in book.html:
 *   window.HOME_MENU = {{ menu | tojson }};
 */

import { HomeDialogSearch, SEARCH_TYPES, FTS_MODES } from './home-dialog-search.js';
import { HomeDialogBookList }                         from './home-dialog-booklist.js';

/* ─────────────────────────────────────────────────────────────
   Public init function
───────────────────────────────────────────────────────────── */

/**
 * @param {object} opts
 * @param {string}  opts.triggerSelector  CSS selector for the ⌂ button
 * @param {string}  opts.baseUrl
 * @param {object}  opts.menu             Full menu object from Flask
 */
export function initHomeDialog({ triggerSelector, baseUrl, menu }) {
  // Guard: only init once
  if (document.getElementById('home-dialog-overlay')) return;

  const trigger = document.querySelector(triggerSelector);
  if (!trigger) {
    console.warn('[HomeDialog] trigger not found:', triggerSelector);
    return;
  }

  /* ── Build sub-modules ──────────────────────────────────── */

  const bookList = new HomeDialogBookList({
    baseUrl,
    menu,
    onNavigate: url => { _close(); window.location.href = url; },
  });

  const search = new HomeDialogSearch({
    baseUrl,
    onResultSelect: url => { _close(); window.location.href = url; },
    onShowResults:  ()  => _showResultsPanel(),
    onShowBooks:    ()  => _showBookPanels(),
  });

  /* ── Inject HTML ─────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'home-dialog-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Browse books');

  overlay.innerHTML = `
    <div id="home-dialog" role="document">

      <!-- Header: title + close -->
      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        <!-- Search row -->
        <div id="home-search-row">
          <div style="position:relative">
            <button id="search-type-btn" type="button" aria-haspopup="true">
              <span>☰ Search Headings</span>
              <span class="arrow">▾</span>
            </button>

            <!-- Type dropdown menu -->
            <div id="search-type-menu" role="listbox">
              ${SEARCH_TYPES.map(t => `
                <div class="search-type-option${t === SEARCH_TYPES[0] ? ' selected' : ''}"
                     data-type="${t.id}" role="option" tabindex="0">
                  <span class="opt-icon">${t.icon}</span>
                  <div>
                    <div class="opt-label">${t.label}</div>
                    <div class="opt-desc">${t.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div id="home-search-input-wrap">
            <input id="home-search-input"
                   type="search"
                   autocomplete="off"
                   spellcheck="false"
                   placeholder="Search section headings…"
                   aria-label="Search"
                   aria-autocomplete="list"
                   aria-controls="home-suggestions">
            <div id="home-suggestions" role="listbox" aria-label="Suggestions"></div>
          </div>

          <button id="home-search-go" type="button">Go</button>
        </div>

        <!-- Full-text sub-options (hidden unless fulltext mode) -->
        <div id="fts-options-bar">
          <span class="fts-label">Match:</span>
          ${FTS_MODES.map((m, i) => `
            <button class="fts-chip${i === 0 ? ' active' : ''}"
                    data-mode="${m.id}" type="button">${m.label}</button>
          `).join('')}
          <div id="fts-distance-wrap">
            <label for="fts-distance-num">words apart:</label>
            <input id="fts-distance-num" type="number" min="1" max="50" value="2">
          </div>
        </div>
          <div id="home-filter-wrap"></div>
      </div>

      <!-- Body: tab bar + panels (built by bookList) -->
      <div id="home-dialog-body">
        ${bookList.buildHTML()}
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  /* ── Bind events ─────────────────────────────────────────── */

  // Trigger button
  trigger.addEventListener('click', e => { e.preventDefault(); _open(); });

  // Close button & overlay click
  document.getElementById('home-dialog-close').addEventListener('click', _close);
  overlay.addEventListener('click', e => { if (e.target === overlay) _close(); });

  // Keyboard: Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) _close();
  });

  // Book list tabs & links
  bookList.bindTabs();

  // Search module
  search.bind();

  // When typing in the search input, also filter the book list
  document.getElementById('home-search-input').addEventListener('input', e => {
    const q = e.target.value.trim();
    if (!q) {
      bookList.clearFilter();
    } else if (search.currentType.id === 'headings') {
      // live filter while waiting for API
      bookList.filter(q);
    }
  });

  /* ── Open / close helpers ────────────────────────────────── */

  function _open() {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Focus search input
    setTimeout(() => {
      document.getElementById('home-search-input')?.focus();
    }, 60);
  }

  function _close() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function _showResultsPanel() {
    // Hide all tab panels, show results panel
    document.querySelectorAll('.home-tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
    const rp = document.getElementById('home-results-panel');
    if (rp) rp.classList.add('active');
  }

  function _showBookPanels() {
    const rp = document.getElementById('home-results-panel');
    if (rp) rp.classList.remove('active');
    // Re-activate first tab
    const firstPanel = document.querySelector('.home-tab-panel');
    const firstTab   = document.querySelector('.home-tab');
    if (firstPanel) firstPanel.classList.add('active');
    if (firstTab)   firstTab.classList.add('active');
  }

  return { open: _open, close: _close };
}
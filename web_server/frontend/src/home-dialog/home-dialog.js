/**
 * home-dialog.js
 * Entry point for the Home / Book-Chooser Dialog.
 */

import { HomeDialogSearch, SEARCH_TYPES, FTS_MODES } from './home-dialog-search.js';
import { HomeDialogBookList }                         from './home-dialog-booklist.js';
import { LocalState }                                 from '../libs/local-state.js';
import '../css/home-dialog.css';

/* ─────────────────────────────────────────────────────────────
   Public init function
───────────────────────────────────────────────────────────── */

export function initHomeDialog({ triggerSelector, baseUrl, menu }) {
  if (document.getElementById('home-dialog-overlay')) return;

  const trigger = document.querySelector(triggerSelector);
  if (!trigger) {
    console.warn('[HomeDialog] trigger not found:', triggerSelector);
    return;
  }

  const state = new LocalState('homeDialog_state', {
    searchQuery:  '',
    searchTypeId: SEARCH_TYPES[0]?.id ?? '',
    ftsModeId:    FTS_MODES[0]?.id ?? '',
    ftsDistance:  2,
    activeTabId:  null,
  });

  /* ── Sub-modules ────────────────────────────────────────── */

  const bookList = new HomeDialogBookList({
    baseUrl,
    menu,
    onNavigate: url => { _close(); window.location.href = url; },
  });

  const search = new HomeDialogSearch({
    baseUrl,
    initialState: {
      searchTypeId: state.get('searchTypeId'),
      ftsModeId:    state.get('ftsModeId'),
      ftsDistance:  state.get('ftsDistance'),
    },
    onResultSelect: url => { _close(); window.location.href = url; },
    onShowResults:  ()  => _showResultsPanel(),
    onShowBooks:    ()  => _showBookPanels(),
  });

  /* ── Inject HTML ─────────────────────────────────────────── */

  const overlay = document.createElement('div');
  overlay.id = 'home-dialog-overlay';
  overlay.setAttribute('role',       'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Browse books');

  overlay.innerHTML = `
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        <div id="home-search-row">
          <div style="position:relative">
            <button id="search-type-btn" type="button" aria-haspopup="true">
              <span>${_labelForTypeId(state.get('searchTypeId'))}</span>
              <span class="arrow">▾</span>
            </button>
            <div id="search-type-menu" role="listbox">
              ${SEARCH_TYPES.map(t => `
                <div class="search-type-option${t.id === state.get('searchTypeId') ? ' selected' : ''}"
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
                   aria-controls="home-suggestions"
                   value="${_escapeAttr(state.get('searchQuery'))}">
            <div id="home-suggestions" role="listbox" aria-label="Suggestions"></div>
          </div>

          <button id="home-search-go" type="button">Go</button>
        </div>

        <div id="fts-options-bar">
          <span class="fts-label">Match:</span>
          ${FTS_MODES.map(m => `
            <button class="fts-chip${m.id === state.get('ftsModeId') ? ' active' : ''}"
                    data-mode="${m.id}" type="button">${m.label}</button>
          `).join('')}
          <div id="fts-distance-wrap">
            <label for="fts-distance-num">words apart:</label>
            <input id="fts-distance-num" type="number" min="1" max="50"
                   value="${Number.isFinite(state.get('ftsDistance')) ? state.get('ftsDistance') : 2}">
          </div>
        </div>
        <div id="home-filter-wrap"></div>
      </div>

      <div id="home-dialog-body">
        ${bookList.buildHTML()}
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  /* ── Restore active tab ──────────────────────────────────── */

  const savedTabId = state.get('activeTabId');
  if (savedTabId) {
    const savedTab   = document.querySelector(`.home-tab[data-tab="${savedTabId}"]`);
    const savedPanel = document.querySelector(`.home-tab-panel[data-panel="${savedTabId}"]`);
    if (savedTab && savedPanel) {
      document.querySelectorAll('.home-tab, .home-tab-panel').forEach(el => el.classList.remove('active'));
      savedTab.classList.add('active');
      savedPanel.classList.add('active');
    }
  }

  /* ── Bind events ─────────────────────────────────────────── */

  trigger.addEventListener('click', e => { e.preventDefault(); _open(); });
  document.getElementById('home-dialog-close').addEventListener('click', _close);
  overlay.addEventListener('click', e => { if (e.target === overlay) _close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) _close();
  });

  bookList.bindTabs();

  overlay.addEventListener('click', e => {
    const tab = e.target.closest('.home-tab');
    if (tab?.dataset.tab) state.set('activeTabId', tab.dataset.tab);
  });

  search.bind();

  document.getElementById('search-type-menu').addEventListener('click', e => {
    const opt = e.target.closest('.search-type-option');
    if (opt) state.set('searchTypeId', opt.dataset.type);
  });

  document.getElementById('fts-options-bar').addEventListener('click', e => {
    const chip = e.target.closest('.fts-chip');
    if (chip) state.set('ftsModeId', chip.dataset.mode);
  });

  document.getElementById('fts-distance-num').addEventListener('change', e => {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val)) state.set('ftsDistance', val);
  });

  document.getElementById('home-search-input').addEventListener('input', e => {
    state.set('searchQuery', e.target.value);
    const q = e.target.value.trim();
    if (!q) {
      bookList.clearFilter();
    } else if (search.currentType.id === 'headings') {
      bookList.filter(q);
    }
  });

  /* ── Open / close ────────────────────────────────────────── */

  function _open() {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('home-search-input')?.focus(), 60);
  }

  function _close() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function _showResultsPanel() {
    document.querySelectorAll('.home-tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('home-results-panel')?.classList.add('active');
  }

  function _showBookPanels() {
    document.getElementById('home-results-panel')?.classList.remove('active');
    const tabId = state.get('activeTabId');
    const tab   = tabId && document.querySelector(`.home-tab[data-tab="${tabId}"]`);
    const panel = tabId && document.querySelector(`.home-tab-panel[data-panel="${tabId}"]`);
    if (tab && panel) {
      tab.classList.add('active');
      panel.classList.add('active');
    } else {
      document.querySelector('.home-tab-panel')?.classList.add('active');
      document.querySelector('.home-tab')?.classList.add('active');
    }
  }

  return { open: _open, close: _close };
}

/* ── Private utilities ────────────────────────────────────── */

function _labelForTypeId(id) {
  const found = SEARCH_TYPES.find(t => t.id === id);
  return found ? `${found.icon} ${found.label}` : '☰ Search Headings';
}

function _escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
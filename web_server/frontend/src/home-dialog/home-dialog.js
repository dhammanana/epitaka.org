/**
 * home-dialog.js
 * Entry point for the Home / Book-Chooser Dialog.
 */

import { HomeDialogSearch, SEARCH_TYPES, buildSearchHeaderHTML, HOME_SEARCH_IDS } from './home-dialog-search.js';
import { HomeDialogBookList }                         from './home-dialog-booklist.js';
import { LocalState }                                 from '../libs/local-state.js';
import '../css/home-dialog.css';
import { TextProcessor, Script } from '../pali-script.js';
import { loadSettings } from '../settings.js';

/* ─────────────────────────────────────────────────────────────
   Public init function
───────────────────────────────────────────────────────────── */

export function initHomeDialog({ triggerSelector, baseUrl, lang, menu, hierarchy }) {
  if (document.getElementById('home-dialog-overlay')) return;

  const trigger = document.querySelector(triggerSelector);
  if (!trigger) {
    console.warn('[HomeDialog] trigger not found:', triggerSelector);
    return;
  }

  const state = new LocalState('homeDialog_state', {
    searchQuery:  '',
    searchTypeId: SEARCH_TYPES[0]?.id ?? '',
    activeTabId:  null,
  });

  /* ── Derive book hierarchy from menu for the BookFilter ──── */
  const effectiveHierarchy = hierarchy || buildHierarchyFromMenu(menu || {});

  /* ── Sub-modules ────────────────────────────────────────── */

  const bookList = new HomeDialogBookList({
    baseUrl,
    lang,
    menu: menu || {},
    onNavigate: url => { _close(); window.location.href = url; },
  });

  const search = new HomeDialogSearch({
    baseUrl,
    lang,
    hierarchy: effectiveHierarchy,
    initialState: {
      searchTypeId: state.get('searchTypeId'),
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

        ${buildSearchHeaderHTML(HOME_SEARCH_IDS, state.get('searchTypeId'), state.get('searchQuery'))}


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
    // Apply pali script to all book names and group titles in the dialog
    _applyPaliScript();
    // Skip auto-focus on mobile to prevent the virtual keyboard from opening
    if (window.innerWidth >= 768) {
      setTimeout(() => document.getElementById('home-search-input')?.focus(), 60);
    }
  }

  function _close() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function _showResultsPanel() {
    document.querySelectorAll('.home-tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('home-tabs')?.classList.add('tabs-hidden');
    document.getElementById('home-filter-wrap')?.classList.add('show');
    document.getElementById('home-results-panel')?.classList.add('active');
  }

  function _showBookPanels() {
    document.getElementById('home-results-panel')?.classList.remove('active');
    document.getElementById('home-tabs')?.classList.remove('tabs-hidden');
    document.getElementById('home-filter-wrap')?.classList.remove('show');
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

/** Apply the user's chosen Pali script to all .pali-text elements in the dialog. */
function _applyPaliScript() {
  const dialog = document.getElementById('home-dialog-overlay');
  if (!dialog) return;
  const s = loadSettings();
  const script = s?.paliScript || Script.RO;
  const originals = new WeakMap();
  dialog.querySelectorAll('.pali-text').forEach(el => {
    if (!originals.has(el)) originals.set(el, el.innerHTML);
    const roman = originals.get(el);
    el.innerHTML = script === Script.RO
      ? roman
      : roman.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
          if (tag) return tag;
          return TextProcessor.convert(TextProcessor.convertFromMixed(text), script);
        });
  });
}

function _escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build a book_id → metadata lookup from the menu structure.
 * Menu shape: { category: { nikaya: { sub_nikaya: [[book_id, title], …] } } }
 */
export function buildHierarchyFromMenu(menu) {
  const hierarchy = {};
  for (const [category, nikayas] of Object.entries(menu)) {
    for (const [nikayaName, subNikayas] of Object.entries(nikayas)) {
      for (const [, books] of Object.entries(subNikayas)) {
        if (Array.isArray(books)) {
          for (const [bookId] of books) {
            hierarchy[bookId] = {
              nikaya: nikayaName,
              category: category,
            };
          }
        }
      }
    }
  }
  return hierarchy;
}
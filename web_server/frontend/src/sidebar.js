/**
 * sidebar.js
 * VSCode-style sidebar for the book page.
 *
 * An activity rail (Library / Search / Table of Contents / Dictionary) plus
 * a sliding drawer panel. Responsive behaviour:
 *   - Phone (<768px): no rail — the topbar hamburger opens the drawer as a
 *     near-full-width overlay with a tab row for switching panels.
 *   - Tablet & desktop (≥768px): the rail is always visible; clicking an icon
 *     opens the panel next to it.
 *
 * Design notes / best practices applied:
 *   - The library tree is fetched from /api/menu at runtime instead of being
 *     embedded in the page HTML, so book pages stay small and cacheable.
 *   - The table of contents is built client-side from the already-rendered
 *     section headings — no server-side duplication of the whole TOC list.
 *   - Search reuses the HomeDialogSearch module bound to the same element ids
 *     (book pages never mount the home dialog, so there is no id clash, and
 *     the shared id-based CSS from home-dialog.css applies for free).
 *   - Search state (query, type, filters) is persisted to sessionStorage.
 *     Clicking a search result is a full page load to a new URL; on arrival
 *     the sidebar reopens the Search panel and re-runs the search, so users
 *     can click through results one after another.
 */

import './css/sidebar.css';
import {
  HomeDialogSearch,
  buildSearchHeaderHTML,
  HOME_SEARCH_IDS,
  SEARCH_TYPES,
} from './home-dialog/home-dialog-search.js';
import { installPaliInput, removeDiacritics } from './libs/pali_typing.js';
import { initDictionary } from './dictionary.js';
import {
  saveSidebarSearchState,
  loadSidebarSearchState,
  clearSidebarSearchState,
  saveSidebarPin,
  loadSidebarPin,
  clearSidebarPin,
} from './libs/sidebar-state.js';

const { baseUrl = '', lang = 'en' } = window.BOOK_CONFIG || {};

const TAB_ORDER    = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā', 'Añña'];
const PITAKA_ORDER = ['Vinaya', 'Suttanta', 'Sutta', 'Abhidhamma'];

const PANELS = ['library', 'search', 'toc', 'dict'];
const PANEL_TITLES = {
  library: 'Library', search: 'Search', toc: 'Table of Contents', dict: 'Dictionary',
};
const PANEL_ICONS = {
  library: '📚', search: '🔍', toc: '☰', dict: '📖',
};
const ACTIVITY_ICONS = [
  { panel: 'library', icon: '📚', label: 'Library' },
  { panel: 'search',  icon: '🔍', label: 'Search' },
  { panel: 'toc',     icon: '☰',  label: 'Table of contents' },
  { panel: 'dict',    icon: '📖', label: 'Dictionary' },
];

// Search type restored from a persisted search. Kept in module scope so both
// buildDom (header markup) and initAsync (search module instance) use it.
const initialTypeId = loadSidebarSearchState()?.search?.typeId || SEARCH_TYPES[0].id;

// ── DOM refs (filled in initSidebar) ──────────────────────────
let rootEl, drawerEl, backdropEl, railEl, panelTitleEl, hamburgerBtn;
let search = null;
let currentBookId = '';
let activePanel = 'library';

/* ════════════════════════════════════════════
   Public API
   ════════════════════════════════════════════ */

export function initSidebar({ bookId = '' } = {}) {
  if (rootEl) return api;
  currentBookId = bookId;

  buildDom();
  initDictionary();  // must run after buildDom() creates #dict-word-input
  applyPinState();
  bindHamburger();
  bindActivity();
  bindBackdrop();
  bindKeyboard();
  bindToc();
  initResize();

  // Load the library menu + search in the background, then restore any
  // persisted search state (e.g. after clicking a search result).
  initAsync();

  return api;
}

const api = {
  openPanel,
  close,
  isOpen: () => drawerEl.classList.contains('open'),
};

/* ════════════════════════════════════════════
   DOM construction
   ════════════════════════════════════════════ */

function buildDom() {
  rootEl = document.createElement('div');
  rootEl.id = 'sb-root';

  rootEl.innerHTML = `
    <nav id="sb-activity" aria-label="Sidebar">
      ${ACTIVITY_ICONS.map(b => `
        <button type="button" class="sb-activity-btn" data-panel="${b.panel}"
                aria-label="${b.label}" title="${b.label}">${b.icon}</button>
      `).join('')}
    </nav>

    <div id="sb-drawer" role="complementary" aria-labelledby="sb-panel-title">
      <div id="sb-drawer-header">
        <span id="sb-panel-title">Library</span>
        <div class="sb-header-actions">
          <button type="button" id="sb-pin" aria-label="Pin sidebar open"
                  title="Keep sidebar open" aria-pressed="false">📌</button>
          <button type="button" id="sb-close" aria-label="Close sidebar">✕</button>
        </div>
      </div>

      <div id="sb-tabs" role="tablist" aria-label="Sidebar panels">
        ${PANELS.map(p => `
          <button type="button" class="sb-tab" data-panel="${p}"
                  role="tab" aria-selected="false"
                  title="${PANEL_TITLES[p]}">${PANEL_ICONS[p]}</button>
        `).join('')}
      </div>

      <div id="sb-panel-library" class="sb-panel" role="tabpanel">
        <div id="sb-lib-header">
          <input id="sb-library-filter" type="search" placeholder="Filter books…"
                 autocomplete="off" aria-label="Filter books">
          <div id="sb-lib-tabs" role="tablist" aria-label="Library categories"></div>
        </div>
        <div id="sb-lib-panels"></div>
      </div>

      <div id="sb-panel-search" class="sb-panel" role="tabpanel">
        <div class="sb-search-wrap">
          ${buildSearchHeaderHTML(HOME_SEARCH_IDS, initialTypeId)}
          <div id="home-filter-wrap"></div>
        </div>
        <div id="home-results-panel"></div>
      </div>

      <div id="sb-panel-toc" class="sb-panel" role="tabpanel">
        <div class="sb-toc-head">
          <a id="sb-toc-outline" class="sb-outline-link"
             href="${baseUrl}/en/book/${currentBookId}/outline">📋 Outline of this book</a>
          <input id="toc-search" type="search" placeholder="Filter headings…"
                 autocomplete="off" aria-label="Filter table of contents">
        </div>
        <ul id="toc-list" role="list"></ul>
      </div>

      <div id="sb-panel-dict" class="sb-panel" role="tabpanel">
        <div class="sb-dict-wrap">
          <div class="sb-dict-header">
            <input id="dict-word-input" type="text" autocomplete="off"
                   aria-label="Dictionary search word" placeholder="Search word…"
                   class="sb-dict-input">
            <ul id="dict-suggestions" role="listbox" aria-label="Suggestions"></ul>
          </div>
          <div id="dict-results" class="sb-dict-results"></div>
        </div>
      </div>

      <div id="sb-resize-handle" aria-label="Resize sidebar" title="Drag to resize"></div>
    </div>
  `;

  document.body.appendChild(rootEl);

  backdropEl = document.createElement('div');
  backdropEl.id = 'sb-backdrop';
  document.body.appendChild(backdropEl);

  drawerEl    = document.getElementById('sb-drawer');
  railEl      = document.getElementById('sb-activity');
  panelTitleEl = document.getElementById('sb-panel-title');
  hamburgerBtn = document.getElementById('toc-toggle-btn');
}

async function initAsync() {
  const data = await loadMenu();
  const hierarchy = data?.hierarchy || {};

  search = new HomeDialogSearch({
    baseUrl,
    lang,
    hierarchy,
    ids: HOME_SEARCH_IDS,
    initialState: { searchTypeId: initialTypeId },
    onResultSelect: url => {
      saveSidebarSearchState({ panel: 'search', search: search.getState() });
      window.location.href = url;
    },
    onShowResults: () => _showResults(),
    onShowBooks:   () => _hideResults(),
  });
  search.bind();

  renderLibraryTree(data?.menu || {});

  // Notify book.js that the library tree is ready (for pali-script re-application).
  document.dispatchEvent(new CustomEvent('sidebar:library-ready'));

  // Restore a persisted search (user clicked a search result → new page).
  // Only restore if the sidebar is pinned — otherwise the user closed it
  // and doesn't want it reopening on every navigation.
  const saved = loadSidebarSearchState();
  if (isPinned()) {
    if (saved?.search?.query) {
      openPanel('search');
      search.restore(saved.search);
    } else {
      openPanel(loadSidebarPin()?.panel || 'library');
    }
  }
  // Always clear the search state after attempting restore — if the
  // sidebar isn't pinned, the state is stale and should not persist.
  clearSidebarSearchState();
}

/* ════════════════════════════════════════════
   Open / close / panel switching
   ════════════════════════════════════════════ */

function openPanel(name) {
  if (!PANELS.includes(name)) name = 'library';

  activePanel = name;
  // Keep the pinned panel in sync so the next page load restores the panel
  // the user last viewed (not the one active at pin time).
  if (isPinned()) saveSidebarPin({ pinned: true, panel: name });
  document.querySelectorAll('#sb-root .sb-panel').forEach(p =>
    p.classList.toggle('active', p.id === `sb-panel-${name}`));
  document.querySelectorAll('#sb-root .sb-activity-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.panel === name));
  document.querySelectorAll('#sb-root .sb-tab').forEach(t => {
    const isActive = t.dataset.panel === name;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });

  panelTitleEl.textContent = PANEL_TITLES[name];
  drawerEl.classList.add('open');
  backdropEl.classList.add('show');
  document.body.classList.add('sb-drawer-open');
  hamburgerBtn?.setAttribute('aria-expanded', 'true');

  // Focus the panel's primary control (best practice for drawers/dialogs).
  // Skip on mobile to prevent the virtual keyboard from opening automatically.
  requestAnimationFrame(() => {
    if (window.innerWidth < 768) return;
    const focusTarget =
      name === 'search'  ? document.getElementById(HOME_SEARCH_IDS.searchInput)
      : name === 'toc'   ? document.getElementById('toc-search')
      : name === 'dict'  ? document.getElementById('dict-word-input')
      : document.getElementById('sb-library-filter');
    focusTarget?.focus({ preventScroll: true });
  });
}

function close() {
  drawerEl.classList.remove('open');
  backdropEl.classList.remove('show');
  document.body.classList.remove('sb-drawer-open');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
  // Return focus to the trigger (a11y best practice).
  if (document.activeElement?.closest('#sb-root')) hamburgerBtn?.focus();
}

function toggleDict() {
  // Dict is now a regular sidebar panel.
  // Clicking the dict button when it's already open → close.
  if (activePanel === 'dict' && drawerEl.classList.contains('open') && !isPinned()) {
    close();
  } else {
    openPanel('dict');
  }
}

function _showResults() {
  document.getElementById(HOME_SEARCH_IDS.resultsPanel)?.classList.add('active');
  document.getElementById(HOME_SEARCH_IDS.filterWrap)?.classList.add('show');
}

function _hideResults() {
  document.getElementById(HOME_SEARCH_IDS.resultsPanel)?.classList.remove('active');
  document.getElementById(HOME_SEARCH_IDS.filterWrap)?.classList.remove('show');
}

/* ════════════════════════════════════════════
   Event bindings
   ════════════════════════════════════════════ */

function bindHamburger() {
  hamburgerBtn?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (drawerEl.classList.contains('open')) {
      close();
      return;
    }
    // Default panel: search if there is a persisted search, else library.
    const saved = loadSidebarSearchState();
    openPanel(saved?.search?.query ? 'search' : 'library');
  });
}

function bindActivity() {
  railEl.addEventListener('click', e => {
    const btn = e.target.closest('.sb-activity-btn');
    if (!btn) return;
    const panel = btn.dataset.panel;
    if (panel === activePanel && drawerEl.classList.contains('open') && panel !== 'dict' && !isPinned()) {
      close();
    } else {
      openPanel(panel);
    }
  });

  // Phone-only tab row inside the drawer
  document.getElementById('sb-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.sb-tab');
    if (tab) openPanel(tab.dataset.panel);
  });

  // Pin: keep the drawer (library/search/toc) open across page loads.
  document.getElementById('sb-pin').addEventListener('click', e => {
    e.stopPropagation();
    if (isPinned()) {
      clearSidebarPin();
      applyPinState();   // drop body.sb-pinned so reopening overlays again
      close();
    } else {
      saveSidebarPin({ pinned: true, panel: activePanel });
      applyPinState();
    }
  });

  document.getElementById('sb-close').addEventListener('click', close);
}

function isPinned() {
  return !!loadSidebarPin()?.pinned;
}

function applyPinState() {
  const pinBtn = document.getElementById('sb-pin');
  const pinned = isPinned();
  pinBtn?.classList.toggle('active', pinned);
  pinBtn?.setAttribute('aria-pressed', String(pinned));
  pinBtn?.setAttribute('aria-label', pinned ? 'Unpin sidebar' : 'Pin sidebar open');
  pinBtn?.setAttribute('title', pinned ? 'Unpin sidebar' : 'Keep sidebar open');
  // Docked (pushes the reading column) only when pinned — unpinned the
  // drawer overlays the page so the reader never loses their place.
  document.body.classList.toggle('sb-pinned', pinned);
}

function bindBackdrop() {
  backdropEl.addEventListener('click', close);

  // Desktop: close sidebar when clicking outside it (only when not pinned).
  // Skip closing when the click triggers a dictionary lookup (clicking a
  // Pali word in the reading area) or when the click target is the
  // hamburger toggle button.
  document.addEventListener('click', e => {
    if (!isPinned() && drawerEl.classList.contains('open')) {
      const target = e.target;
      if (!target.closest('#sb-root')
          && !target.closest('#toc-toggle-btn')
          && !target.closest('.sentence-row .pali-text')) {
        close();
      }
    }
  });
}

function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawerEl.classList.contains('open')) {
      close();
    }
  });
}

/* ════════════════════════════════════════════
   Sidebar resize (drag the right edge)
   ════════════════════════════════════════════ */

const RESIZE_KEY = 'epitaka_sidebar_width';
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;

function initResize() {
  const handle = document.getElementById('sb-resize-handle');
  if (!handle) return;

  // Restore saved width
  try {
    const saved = parseInt(localStorage.getItem(RESIZE_KEY));
    if (saved >= MIN_WIDTH && saved <= MAX_WIDTH) {
      document.documentElement.style.setProperty('--sb-width', saved + 'px');
    }
  } catch { /* ignore */ }

  let startX, startW;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX;
    startW = drawerEl.offsetWidth;
    document.body.classList.add('sb-resizing');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function onMove(e) {
    const dx = e.clientX - startX;
    const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW + dx));
    document.documentElement.style.setProperty('--sb-width', w + 'px');
  }

  function onUp() {
    document.body.classList.remove('sb-resizing');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    // Persist
    try {
      const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sb-width'));
      if (w) localStorage.setItem(RESIZE_KEY, String(w));
    } catch { /* ignore */ }
  }
}

/* ════════════════════════════════════════════
   Library panel (fetched from /api/menu)
   ════════════════════════════════════════════ */

async function loadMenu() {
  try {
    const res = await fetch(`${baseUrl}/api/menu`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[sidebar] failed to load menu', err);
    return { menu: {}, hierarchy: {} };
  }
}

function renderLibraryTree(menu) {
  const tabsEl    = document.getElementById('sb-lib-tabs');
  const panelsEl  = document.getElementById('sb-lib-panels');
  if (!tabsEl || !panelsEl) return;
  tabsEl.innerHTML = '';
  panelsEl.innerHTML = '';

  const categories = _resolvedCategories(menu);

  // Build tab buttons + panel containers
  categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lib-tab' + (i === 0 ? ' active' : '');
    btn.dataset.tab = String(i);
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.textContent = cat.label;
    tabsEl.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'lib-tab-panel' + (i === 0 ? ' active' : '');
    panel.dataset.panel = String(i);
    panel.setAttribute('role', 'tabpanel');
    _renderCategoryPanel(panel, cat.data);
    panelsEl.appendChild(panel);
  });

  // Tab switching
  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.lib-tab');
    if (!btn) return;
    const idx = btn.dataset.tab;
    tabsEl.querySelectorAll('.lib-tab').forEach(t => {
      t.classList.toggle('active', t === btn);
      t.setAttribute('aria-selected', t === btn ? 'true' : 'false');
    });
    panelsEl.querySelectorAll('.lib-tab-panel').forEach(p =>
      p.classList.toggle('active', p.dataset.panel === idx));
  });

  // Bind collapsible nikaya titles
  panelsEl.querySelectorAll('.book-nikaya-title').forEach(title => {
    title.addEventListener('click', () => {
      title.classList.toggle('open');
      title.nextElementSibling?.classList.toggle('open');
    });
  });

  bindLibraryFilter();
}

/** Resolve category ordering: TAB_ORDER first, then any extras as Añña. */
function _resolvedCategories(menu) {
  const keys = Object.keys(menu);
  const result = [];

  // Mūla, Aṭṭhakathā, Ṭīkā — direct from menu
  for (const label of ['Mūla', 'Aṭṭhakathā', 'Ṭīkā']) {
    if (keys.includes(label)) {
      result.push({ label, data: menu[label] });
    }
  }

  // Añña — everything else merged under this label
  const otherKeys = keys.filter(k => !['Mūla', 'Aṭṭhakathā', 'Ṭīkā'].includes(k));
  if (otherKeys.length) {
    const merged = {};
    for (const k of otherKeys) {
      Object.assign(merged, menu[k] || {});
    }
    result.push({ label: 'Añña', data: merged });
  }

  return result;
}

/** Render a category (Mūla / Aṭṭhakathā / Ṭīkā / Añña) into a panel. */
function _renderCategoryPanel(panel, catData) {
  if (!catData || typeof catData !== 'object') return;

  const pitakaNames = Object.keys(catData).sort((a, b) => {
    const idx = name => {
      const i = PITAKA_ORDER.findIndex(p => name.includes(p));
      return i === -1 ? 99 : i;
    };
    return idx(a) - idx(b);
  });

  for (const pitakaName of pitakaNames) {
    const group = document.createElement('div');
    group.className = 'lib-pitaka-group';

    const title = document.createElement('div');
    title.className = 'lib-pitaka-title pali-text';
    title.textContent = pitakaName;
    group.appendChild(title);

    const content = document.createElement('div');
    content.className = 'lib-pitaka-content';
    _renderNikayaDict(content, catData[pitakaName]);
    group.appendChild(content);

    panel.appendChild(group);
  }
}

/** Render a nikaya dictionary: { sub_nikaya: [[book_id, title], …] } */
function _renderNikayaDict(container, nikayaDict) {
  if (!nikayaDict || typeof nikayaDict !== 'object') return;

  // Flat books (no sub_nikaya) — render first, no collapsible wrapper
  if (nikayaDict['']) {
    const flatGroup = document.createElement('div');
    flatGroup.className = 'book-nikaya flat-group';
    const list = document.createElement('ol');
    list.className = 'book-nikaya-list open';
    _appendBookItems(list, nikayaDict['']);
    flatGroup.appendChild(list);
    container.appendChild(flatGroup);
  }

  // Sub-nikaya groups
  for (const [subNikaya, books] of Object.entries(nikayaDict)) {
    if (subNikaya === '') continue;
    const wrap = document.createElement('div');
    wrap.className = 'book-nikaya';

    const title = document.createElement('div');
    title.className = 'book-nikaya-title pali-text';
    title.innerHTML = `${escapeHtml(subNikaya)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;

    const list = document.createElement('ol');
    list.className = 'book-nikaya-list';
    _appendBookItems(list, books);

    wrap.append(title, list);
    container.appendChild(wrap);
  }
}

/** Append <li> book entries to a list element. */
function _appendBookItems(list, books) {
  if (!Array.isArray(books)) return;
  books.forEach(([bookId, title]) => {
    const li = document.createElement('li');
    li.appendChild(bookLink([bookId, title]));
    list.appendChild(li);
  });
}

function bookLink([id, title]) {
  const a = document.createElement('a');
  a.className = 'book-entry pali-text' + (id === currentBookId ? ' current' : '');
  a.href = `${baseUrl}/${lang}/book/${id}`;
  a.dataset.bookId = id;
  a.innerHTML = `<span class="book-name pali-text">${escapeHtml(title)}</span>`;
  // Browsing the library = leaving the search flow → clear persisted search.
  a.addEventListener('click', () => clearSidebarSearchState());
  return a;
}

function bindLibraryFilter() {
  const input = document.getElementById('sb-library-filter');
  const panelsEl = document.getElementById('sb-lib-panels');
  if (!input || !panelsEl) return;

  // Collect all book entries across all tab panels
  const entries = [...panelsEl.querySelectorAll('.book-entry')];
  const names   = entries.map(e => removeDiacritics(e.textContent || '').toLowerCase());
  const rows    = entries.map(e => e.closest('li'));

  input.addEventListener('input', () => {
    const q = removeDiacritics(input.value).toLowerCase();

    // Show/hide individual book rows
    entries.forEach((e, i) => {
      const show = !q || names[i].includes(q);
      e.style.display = show ? '' : 'none';
      if (rows[i]) rows[i].style.display = show ? '' : 'none';
    });

    // Expand groups that contain matches, and hide groups with none.
    panelsEl.querySelectorAll('.book-nikaya').forEach(group => {
      const hasVisible = [...group.querySelectorAll('.book-entry')].some(x => x.style.display !== 'none');
      group.style.display = !q || hasVisible ? '' : 'none';
      if (!q || !hasVisible) return;
      const list = group.querySelector('.book-nikaya-list');
      if (list) {
        list.classList.add('open');
        list.previousElementSibling?.classList.add('open');
      }
    });

    // Also show/hide pitaka groups if all their entries are hidden
    panelsEl.querySelectorAll('.lib-pitaka-group').forEach(group => {
      const hasVisible = [...group.querySelectorAll('.book-entry')].some(x => x.style.display !== 'none');
      group.style.display = !q || hasVisible ? '' : 'none';
    });

    // Show/hide tab panels and highlight tabs with matches
    const tabsEl = document.getElementById('sb-lib-tabs');
    panelsEl.querySelectorAll('.lib-tab-panel').forEach((panel, i) => {
      const hasVisible = [...panel.querySelectorAll('.book-entry')].some(x => x.style.display !== 'none');
      panel.style.display = !q || hasVisible ? '' : 'none';
      // Highlight tabs that have matches
      const tab = tabsEl?.querySelector(`.lib-tab[data-tab="${i}"]`);
      if (tab) tab.classList.toggle('has-match', !!q && hasVisible);
    });

    // Final sweep: hide empty <li> wrappers
    panelsEl.querySelectorAll('li').forEach(li => {
      const hasVisible = [...li.querySelectorAll('.book-entry')].some(x => x.style.display !== 'none');
      li.style.display = hasVisible ? '' : 'none';
    });
  });
}

/* ════════════════════════════════════════════
   Table of contents — built from the DOM
   ════════════════════════════════════════════ */

function bindToc() {
  const list = document.getElementById('toc-list');
  const searchInput = document.getElementById('toc-search');

  // Build TOC items from the already-rendered section headings.
  document.querySelectorAll('.section-block').forEach(block => {
    const paraId = block.dataset.paraId;
    const heading = block.querySelector('.section-heading-link, .section-heading-empty');
    if (!heading || !paraId) return;
    const level = heading.dataset.level || 1;
    const title = heading.querySelector('.section-heading-text')?.textContent?.trim();
    if (!title) return;

    const li = document.createElement('li');
    li.innerHTML = `<div class="toc-item" role="button" tabindex="0" data-para-id="${paraId}" data-level="${level}"><span class="toc-item-text pali-text"></span></div>`;
    li.querySelector('.toc-item-text').textContent = title;
    list.appendChild(li);
  });

  const tocItems = [...list.querySelectorAll('.toc-item')];
  const normalized = tocItems.map(item => removeDiacritics(item.textContent).toLowerCase());

  installPaliInput(searchInput, {
    mode: 'both',
    onConvert: normalizedText => {
      searchInput.value = normalizedText;
      searchInput.dispatchEvent(new Event('input'));
    },
  });

  searchInput.addEventListener('input', () => {
    const q = removeDiacritics(searchInput.value).toLowerCase();
    tocItems.forEach((item, i) => {
      item.closest('li').style.display = !q || normalized[i].includes(q) ? '' : 'none';
    });
  });

  tocItems.forEach(item => {
    item.addEventListener('click', () => {
      const paraId = parseInt(item.dataset.paraId);
      if (window.innerWidth < 768) close();
      // Browsing the contents = leaving the search flow → clear persisted search.
      clearSidebarSearchState();
      const section = document.querySelector(`.section-block[data-para-id="${paraId}"]`);
      const headingLink = section?.querySelector('.section-heading-link');
      if (headingLink?.href) {
        const url = new URL(headingLink.href, window.location.href);
        url.hash = String(paraId);
        window.location.href = url.href;
      }
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  // Scroll-spy: highlight the TOC item of the visible section.
  const tocObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const paraId = parseInt(entry.target.dataset.paraId);
      highlightTocItem(paraId);
    }
  }, { rootMargin: '-52px 0px -67% 0px' });

  document.querySelectorAll('.section-block').forEach(el => tocObserver.observe(el));
}

function highlightTocItem(paraId) {
  document.querySelectorAll('#toc-list .toc-item').forEach(item => {
    const active = parseInt(item.dataset.paraId) === paraId;
    item.classList.toggle('active', active);
    if (active && drawerEl.classList.contains('open')) {
      item.scrollIntoView({ block: 'nearest' });
    }
  });
}

/* ════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════ */

function toggleCollapse(btn, body) {
  const open = body.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
}

function orderNikayas(keys) {
  // The database row id is the canonical order for books. This ordering is
  // only a fallback for the collection labels themselves; individual books
  // arrive from the API already ordered by books.id.
  const order = ['Vinaya', 'Suttanta', 'Sutta', 'Abhidhamma'];
  return [...order.filter(k => keys.includes(k)), ...keys.filter(k => !order.includes(k))];
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

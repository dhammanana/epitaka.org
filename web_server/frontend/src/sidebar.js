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
import { setDictOpen } from './dictionary.js';
import {
  saveSidebarSearchState,
  loadSidebarSearchState,
  clearSidebarSearchState,
  saveSidebarPin,
  loadSidebarPin,
  clearSidebarPin,
} from './libs/sidebar-state.js';

const { baseUrl = '', lang = 'en' } = window.BOOK_CONFIG || {};

const PANELS = ['library', 'search', 'toc'];
const PANEL_TITLES = { library: 'Library', search: 'Search', toc: 'Table of Contents' };
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
  applyPinState();
  bindHamburger();
  bindActivity();
  bindBackdrop();
  bindKeyboard();
  bindToc();

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
                  role="tab" aria-selected="false">${PANEL_TITLES[p]}</button>
        `).join('')}
      </div>

      <div id="sb-panel-library" class="sb-panel" role="tabpanel">
        <div class="sb-panel-scroll">
          <input id="sb-library-filter" type="search" placeholder="Filter books…"
                 autocomplete="off" aria-label="Filter books">
          <div id="sb-library-tree" class="sb-library-tree"></div>
        </div>
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
          <input id="toc-search" type="search" placeholder="Filter headings…"
                 autocomplete="off" aria-label="Filter table of contents">
        </div>
        <ul id="toc-list" role="list"></ul>
      </div>
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

  // Restore a persisted search (user clicked a search result → new page).
  // If there's no in-flight search, fall back to a pinned panel so the
  // library stays open while browsing between pages (VSCode-style pin).
  const saved = loadSidebarSearchState();
  if (saved?.search?.query) {
    openPanel('search');
    search.restore(saved.search);
  } else if (isPinned()) {
    openPanel(loadSidebarPin()?.panel || 'library');
  }
}

/* ════════════════════════════════════════════
   Open / close / panel switching
   ════════════════════════════════════════════ */

function openPanel(name) {
  if (name === 'dict') { toggleDict(); return; }
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
  requestAnimationFrame(() => {
    const focusTarget =
      name === 'search' ? document.getElementById(HOME_SEARCH_IDS.searchInput)
      : name === 'toc'   ? document.getElementById('toc-search')
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
  const dictPanel = document.getElementById('dict-panel');
  if (!dictPanel) return;
  const isOpen = dictPanel.classList.contains('open');
  // Keep the 📖 activity button in sync with the panel state.
  const dictBtn = document.querySelector('#sb-activity .sb-activity-btn[data-panel="dict"]');
  if (isOpen) {
    setDictOpen(false);
    dictBtn?.classList.remove('active');
    dictBtn?.setAttribute('aria-pressed', 'false');
  } else {
    setDictOpen(true);
    dictBtn?.classList.add('active');
    dictBtn?.setAttribute('aria-pressed', 'true');
    close();
    requestAnimationFrame(() =>
      document.getElementById('dict-word-input')?.focus({ preventScroll: true }));
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
}

function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawerEl.classList.contains('open')) {
      close();
    }
  });
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
  const tree = document.getElementById('sb-library-tree');
  if (!tree) return;
  tree.innerHTML = '';

  const categories = orderCategories(Object.keys(menu));
  for (const cat of categories) {
    tree.appendChild(renderCategory(cat, menu[cat] || {}));
  }

  bindLibraryFilter(tree);
}

function renderCategory(catName, catData) {
  const catEl = document.createElement('div');
  catEl.className = 'sb-cat';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sb-cat-title';
  btn.setAttribute('aria-expanded', 'true');
  btn.innerHTML = `<span>${escapeHtml(catName)}</span><span class="sb-caret" aria-hidden="true">▾</span>`;

  const body = document.createElement('div');
  body.className = 'sb-cat-body open';   // categories start expanded so books are visible

  for (const nik of orderNikayas(Object.keys(catData))) {
    body.appendChild(renderNikaya(catData[nik] || {}, nik));
  }

  btn.addEventListener('click', () => toggleCollapse(btn, body));
  catEl.append(btn, body);
  return catEl;
}

function renderNikaya(subMap, nikName) {
  const wrap = document.createElement('div');
  wrap.className = 'book-nikaya';

  const flatBooks = subMap[''] || [];
  const subKeys   = Object.keys(subMap).filter(k => k !== '');

  if (!subKeys.length) {
    // Simple group: header + flat book list (no sub-nikaya)
    const title = document.createElement('div');
    title.className = 'book-nikaya-title open';
    title.innerHTML = `${escapeHtml(nikName)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;
    const list = document.createElement('ol');
    list.className = 'book-nikaya-list open';
    flatBooks.forEach(b => {
      const li = document.createElement('li');
      li.appendChild(bookLink(b));
      list.appendChild(li);
    });
    wrap.append(title, list);
    title.addEventListener('click', () => {
      title.classList.toggle('open');
      list.classList.toggle('open');
    });
    return wrap;
  }

  // Nikaya with sub-groups: header collapses the whole group
  const title = document.createElement('div');
  title.className = 'book-nikaya-title open';
  title.innerHTML = `${escapeHtml(nikName)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;

  const list = document.createElement('ol');
  list.className = 'book-nikaya-list open';

  if (flatBooks.length) {
    flatBooks.forEach(b => {
      const li = document.createElement('li');
      li.appendChild(bookLink(b));
      list.appendChild(li);
    });
  }
  for (const sub of subKeys) {
    const li = document.createElement('li');
    li.appendChild(renderSubGroup(sub, subMap[sub]));
    list.appendChild(li);
  }

  title.addEventListener('click', () => {
    title.classList.toggle('open');
    list.classList.toggle('open');
  });
  wrap.append(title, list);
  return wrap;
}

function renderSubGroup(subName, books) {
  const sub = document.createElement('div');
  sub.className = 'sb-sub';
  const title = document.createElement('div');
  title.className = 'book-nikaya-title sb-sub-title open';
  title.innerHTML = `${escapeHtml(subName)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;
  const list = document.createElement('ol');
  list.className = 'book-nikaya-list open';
  books.forEach(b => {
    const li = document.createElement('li');
    li.appendChild(bookLink(b));
    list.appendChild(li);
  });
  title.addEventListener('click', () => {
    title.classList.toggle('open');
    list.classList.toggle('open');
  });
  sub.append(title, list);
  return sub;
}

function bookLink([id, title]) {
  const a = document.createElement('a');
  a.className = 'book-entry' + (id === currentBookId ? ' current' : '');
  a.href = `${baseUrl}/${lang}/book/${id}`;
  a.dataset.bookId = id;
  a.innerHTML = `<span class="book-name">${escapeHtml(title)}</span>`;
  // Browsing the library = leaving the search flow → clear persisted search.
  a.addEventListener('click', () => clearSidebarSearchState());
  return a;
}

function bindLibraryFilter(tree) {
  const input = document.getElementById('sb-library-filter');
  if (!input) return;
  const entries = [...tree.querySelectorAll('.book-entry')];
  const names   = entries.map(e => removeDiacritics(e.textContent || '').toLowerCase());
  const rows    = entries.map(e => e.closest('li'));

  input.addEventListener('input', () => {
    const q = removeDiacritics(input.value).toLowerCase();

    // Show/hide individual book rows (the <li> wrapper too, so no empty
    // rows are left behind).
    entries.forEach((e, i) => {
      const show = !q || names[i].includes(q);
      e.style.display = show ? '' : 'none';
      if (rows[i]) rows[i].style.display = show ? '' : 'none';
    });

    // Expand groups that contain matches, and hide groups with none.
    tree.querySelectorAll('.sb-cat, .book-nikaya, .sb-sub').forEach(group => {
      const hasVisible = [...group.querySelectorAll('.book-entry')].some(x => x.style.display !== 'none');
      group.style.display = !q || hasVisible ? '' : 'none';
      if (!q || !hasVisible) return;
      const list = group.querySelector('.sb-cat-body, .book-nikaya-list');
      if (list) {
        list.classList.add('open');
        const title = list.previousElementSibling;
        if (title?.classList?.contains('sb-cat-title')) title.setAttribute('aria-expanded', 'true');
        if (title?.classList?.contains('book-nikaya-title')) title.classList.add('open');
      }
    });

    // Final sweep: hide any <li> that ended up empty — e.g. the outer row
    // wrapping a collapsed sub-group (.sb-sub) — so no blank rows show
    // while filtering.
    tree.querySelectorAll('li').forEach(li => {
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
      if (headingLink?.href) window.location.href = headingLink.href;
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

function orderCategories(keys) {
  const order = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā'];
  return [...order.filter(k => keys.includes(k)), ...keys.filter(k => !order.includes(k))];
}

function orderNikayas(keys) {
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

/**
 * book.js
 * Main reader logic for E-Piṭaka book page.
 * Handles: TOC sidebar, lazy section loading, deep-link,
 *          Pali script conversion, dictionary word lookup,
 *          Firebase auth UI, inline comments (SQLite backend),
 *          book_links (cross-book linked lines with popup + dialog).
 */
import './css/book.css';
import './css/book-links.css';
import './css/common.css';
import { TextProcessor, Script } from './pali-script.js';
import {
  loadSettings, saveSettings, applySettings,
  populateSettingsForm, readSettingsForm,
  buildScriptOptions,
} from './settings.js';
import { attachPaliClickListeners } from './dictionary.js';
import { initAuthUI }               from './auth/auth-ui.js';
import { initLibraryUI }            from './row_actions/library-ui.js';
import { attachCommentIcons }       from './row_actions/comments-ui.js';
import { attachRowActions }         from './row_actions/row-actions.js';
import { auth, getIdToken }         from './auth/auth.js';
import { initHomeDialog }           from './home-dialog/home-dialog.js';
import { installPaliInput, removeDiacritics } from './libs/pali_typing.js';
import { createDraggableDialog }    from './libs/draggable-dialog.js';
import { initRefDropdowns }         from './libs/refbutton.js';

// ── Config injected from book.html ────────────────────────────
const { bookId, baseUrl, bookref } = window.BOOK_CONFIG;

// ── State ─────────────────────────────────────────────────────
const loadedSections   = new Set();
const loadingPromises  = {};
const originalPaliText = new WeakMap();

// book_links: Map<"para-line", Array<linkObj>>
// Populated once per section load when load_attha setting is true.
let bookLinksMap = new Map();

// ── DOM refs ──────────────────────────────────────────────────
const tocSidebar     = document.getElementById('toc-sidebar');
const tocOverlay     = document.getElementById('toc-overlay');
const tocList        = document.getElementById('toc-list');
const tocToggle      = document.getElementById('toc-toggle-btn');
const tocSearch      = document.getElementById('toc-search');
const settingsBtn    = document.getElementById('settings-btn');
const settingsModal  = document.getElementById('settings-modal');
const settingsForm   = document.getElementById('settings-form');
const settingsCancel = document.getElementById('settings-cancel');

// ════════════════════════════════════════════
// TOC
// ════════════════════════════════════════════

function openToc()  { tocSidebar.classList.add('open');    tocOverlay.classList.add('show'); }
function closeToc() { tocSidebar.classList.remove('open'); tocOverlay.classList.remove('show'); }

tocToggle.addEventListener('click', () =>
  tocSidebar.classList.contains('open') ? closeToc() : openToc()
);
tocOverlay.addEventListener('click', closeToc);

installPaliInput(tocSearch, {
  mode: 'both',
  onConvert: (normalized) => {
    const q = normalized.trim();
    tocSearch.value = q;
    tocSearch.dispatchEvent(new Event('input'));
  },
});

function normalizeForSearch(text) {
  if (!text) return '';
  return removeDiacritics(text).toLowerCase();
}

const tocItems = tocList.querySelectorAll('.toc-item');
const normalizedTocTexts = Array.from(tocItems).map(item =>
  normalizeForSearch(item.textContent)
);

tocSearch.addEventListener('input', () => {
  const rawQuery = tocSearch.value;
  const normalizedQuery = normalizeForSearch(rawQuery);

  if (!normalizedQuery) {
    tocItems.forEach(item => { item.closest('li').style.display = ''; });
    return;
  }

  tocItems.forEach((item, index) => {
    const matches = normalizedTocTexts[index].includes(normalizedQuery);
    item.closest('li').style.display = matches ? '' : 'none';
  });
});

tocList.querySelectorAll('.toc-item').forEach(item => {
  item.addEventListener('click', async () => {
    const paraId = parseInt(item.dataset.paraId);
    if (window.innerWidth < 960) closeToc();
    const section = getSectionEl(paraId);
    if (!section) return;
    const content = section.querySelector('.section-content');
    if (!content.classList.contains('open')) await openSection(paraId);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  item.addEventListener('keydown', e => { if (e.key === 'Enter') item.click(); });
});

const tocObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const paraId = parseInt(entry.target.dataset.paraId);
    highlightTocItem(paraId);
    updateCrossRefLinks(paraId);
    updateUrl(paraId);
  }
}, { rootMargin: '-52px 0px -60% 0px' });

document.querySelectorAll('.section-block').forEach(el => tocObserver.observe(el));

// ── Para-level scroll observer ────────────────────────────────
const paraObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const m = entry.target.id.match(/^p-(\d+)-l-0$/);
    if (!m) continue;
    const paraId = parseInt(m[1]);
    updateUrl(paraId);
    updateCrossRefLinks(paraId);
  }
}, {
  rootMargin: '-52px 0px -75% 0px',
  threshold: 0,
});

function highlightTocItem(paraId) {
  document.querySelectorAll('#toc-list .toc-item').forEach(item => {
    const active = parseInt(item.dataset.paraId) === paraId;
    item.classList.toggle('active', active);
    if (active && tocSidebar.classList.contains('open')) {
      item.scrollIntoView({ block: 'nearest' });
    }
  });
}

// ════════════════════════════════════════════
// Section loading
// ════════════════════════════════════════════

function getSectionEl(paraId) {
  return document.querySelector(`.section-block[data-para-id="${paraId}"]`);
}

async function loadSection(paraId) {
  if (loadedSections.has(paraId)) return;
  if (loadingPromises[paraId])    return loadingPromises[paraId];

  const section   = getSectionEl(paraId);
  const contentEl = section?.querySelector('.section-content');
  if (!contentEl) return;

  contentEl.innerHTML = '<div class="section-loading">Loading…</div>';

  loadingPromises[paraId] = fetch(`${baseUrl}/api/book/${bookId}/section/${paraId}`)
    .then(r => r.json())
    .then(async data => {
      loadedSections.add(paraId);
      renderSection(contentEl, data.sentences);
      const s = loadSettings();
      applySettings(s);
      applyPaliScript(s.paliScript);
      await attachCommentIcons(contentEl, paraId);
      await attachRowActions(contentEl, paraId);
      await loadBookLinksForSection(paraId);
      applyBookLinksToContent(contentEl);
    })
    .catch(() => {
      contentEl.innerHTML =
        '<div class="section-loading error">Failed to load. Click to retry.</div>';
      contentEl.addEventListener('click', () => {
        loadedSections.delete(paraId);
        openSection(paraId);
      }, { once: true });
    })
    .finally(() => { delete loadingPromises[paraId]; });

  return loadingPromises[paraId];
}

function renderSection(contentEl, sentences) {
  if (!sentences?.length) {
    contentEl.innerHTML = '<div class="section-loading muted">No content.</div>';
    return;
  }

  const groups = {};
  for (const s of sentences) {
    (groups[s.para_id] = groups[s.para_id] || []).push(s);
  }

  let html = '';
  for (const paraId of Object.keys(groups).sort((a, b) => a - b)) {
    html += `<div class="para-group" id="p-${paraId}-l-0">`;
    for (const [idx, s] of groups[paraId].entries()) {
      const isLast = idx === groups[paraId].length - 1;
      html += `<div class="sentence-row${isLast ? ' is-last-in-para' : ''}" id="p-${s.para_id}-l-${s.line_id}">`;
      if (s.pali)       html += `<div class="pali-text">${s.pali}</div>`;
      if (s.english)    html += `<div class="eng-text">${s.english}</div>`;
      if (s.vietnamese) html += `<div class="viet-text">${s.vietnamese}</div>`;
      html += '</div>';
    }
    html += '</div>';
  }

  contentEl.innerHTML = html;
  attachPaliClickListeners(contentEl);

  contentEl.querySelectorAll('.para-group[id^="p-"]').forEach(el => paraObserver.observe(el));
}

async function openSection(paraId) {
  const section   = getSectionEl(paraId);
  if (!section) return;
  const heading   = section.querySelector('.section-heading');
  const contentEl = section.querySelector('.section-content');
  const isOpen    = contentEl.classList.contains('open');

  if (!isOpen) {
    heading.classList.add('expanded');
    heading.setAttribute('aria-expanded', 'true');
    contentEl.classList.add('open');
    contentEl.setAttribute('aria-hidden', 'false');
    await loadSection(paraId);
  } else {
    heading.classList.remove('expanded');
    heading.setAttribute('aria-expanded', 'false');
    contentEl.classList.remove('open');
    contentEl.setAttribute('aria-hidden', 'true');
  }
  updateUrl();
}

document.querySelectorAll('.section-heading').forEach(heading => {
  const paraId = parseInt(heading.closest('.section-block').dataset.paraId);
  heading.addEventListener('click',   () => openSection(paraId));
  heading.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSection(paraId); }
  });
});

// ════════════════════════════════════════════
// URL & cross-ref links
// ════════════════════════════════════════════

function updateUrl(scrollParaId) {
  let paraId = scrollParaId;
  if (!paraId) {
    const openIds = [...document.querySelectorAll('.section-content.open')]
      .map(el => parseInt(el.closest('.section-block').dataset.paraId))
      .sort((a, b) => a - b);
    paraId = openIds[0];
  }
  if (!paraId) { history.replaceState(null, '', window.location.pathname); return; }
  history.replaceState(null, '', `${window.location.pathname}?para=${paraId}`);
  updateCrossRefLinks(paraId);
}

function updateCrossRefLinks(paraId) {
  const refs = { mula: 'ref-mula', attha: 'ref-attha', tika: 'ref-tika' };
  for (const [key, elId] of Object.entries(refs)) {
    if (!bookref[key]) continue;
    const el = document.getElementById(elId);
    if (el) el.href = `${baseUrl}/book_ref/${bookref[key]}?ref=${bookId}&para_id=${paraId}`;
  }
}

// ════════════════════════════════════════════
// Deep-link on load
// ════════════════════════════════════════════

async function handleDeepLink() {
  const params    = new URLSearchParams(window.location.search);
  const paraParam = params.get('para');
  const lineParam = params.get('line');
  if (!paraParam) return;

  const paraId = parseInt(paraParam);
  if (isNaN(paraId)) return;

  const sectionParaId = [...document.querySelectorAll('.section-block')]
    .map(el => parseInt(el.dataset.paraId))
    .filter(id => id <= paraId)
    .at(-1);

  if (!sectionParaId) return;
  await openSection(sectionParaId);

  const targetEl =
    (lineParam && document.getElementById(`p-${paraId}-l-${lineParam}`)) ||
    document.getElementById(`p-${paraId}-l-0`) ||
    getSectionEl(sectionParaId);

  if (targetEl) {
    setTimeout(() => {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('highlight-flash');
    }, 150);
  }
}

// ════════════════════════════════════════════
// Pali script conversion
// ════════════════════════════════════════════

export function applyPaliScript(targetScript) {
  document.querySelectorAll('.pali-text').forEach(el => {
    if (!originalPaliText.has(el)) originalPaliText.set(el, el.innerHTML);
    const roman = originalPaliText.get(el);
    el.innerHTML = targetScript === Script.RO
      ? roman
      : convertHtmlPali(roman, targetScript);
  });
}

function convertHtmlPali(html, script) {
  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    return TextProcessor.convert(TextProcessor.convertFromMixed(text), script);
  });
}

// ════════════════════════════════════════════
// Settings modal
// ════════════════════════════════════════════

settingsBtn.addEventListener('click', () => {
  const s = loadSettings();
  populateSettingsForm(s);
  buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);
  settingsModal.classList.add('show');
});
settingsCancel.addEventListener('click', () => settingsModal.classList.remove('show'));
settingsModal.addEventListener('click', e => {
  if (e.target === settingsModal) settingsModal.classList.remove('show');
});
settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  const s = readSettingsForm();
  saveSettings(s); applySettings(s); applyPaliScript(s.paliScript);
  settingsModal.classList.remove('show');
});

// ════════════════════════════════════════════
// Book-links (cross-book annotations)
// ════════════════════════════════════════════

/**
 * Fetch book_links for a single section (identified by its para_id).
 * Results are merged into bookLinksMap so previously loaded sections stay cached.
 * Called once per section expand, just before applyBookLinksToContent().
 * Only runs when the load_attha setting is truthy.
 */
async function loadBookLinksForSection(paraId) {
  const settings = loadSettings();
  if (!settings.load_attha) return;

  try {
    const res = await fetch(`${baseUrl}/api/book/${bookId}/links?para_id=${paraId}`);
    if (!res.ok) return;
    const data = (await res.json()).reverse();
    for (const link of data) {
      const key = `${link.src_para}-${link.src_line}`;
      if (!bookLinksMap.has(key)) bookLinksMap.set(key, []);
      bookLinksMap.get(key).push(link);
    }
  } catch (err) {
    console.warn('book_links: failed to load section', paraId, err);
  }
}

/**
 * After a section's sentences are rendered into contentEl,
 * scan every .sentence-row and inject .book-link-badge elements
 * for rows that have entries in bookLinksMap.
 */
function applyBookLinksToContent(contentEl) {
  const settings = loadSettings();
  if (!settings.load_attha) return;

  contentEl.querySelectorAll('.sentence-row[id]').forEach(row => {
    const m = row.id.match(/^p-(\d+)-l-(\d+)$/);
    if (!m) return;
    const paraId = parseInt(m[1]);
    const lineId = parseInt(m[2]);
    if (lineId === 0) return; // skip the anchor-only para-group row

    const key   = `${paraId}-${lineId}`;
    const links = bookLinksMap.get(key);
    if (!links?.length) return;

    for (const link of links) {
      const badge = document.createElement('span');
      badge.className    = 'book-link-badge pali-text';
      badge.textContent  = link.word;
      badge.title        = link.dst_book_name;
      badge.dataset.link = JSON.stringify(link);
      badge.setAttribute('role', 'button');
      badge.setAttribute('tabindex', '0');

      badge.addEventListener('click', e => {
        e.stopPropagation();
        showBookLinkPopup(badge, link);
      });
      badge.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showBookLinkPopup(badge, link);
        }
      });

      const paliDiv = row.querySelector('.pali-text');
      if (paliDiv) paliDiv.after(badge);
      else row.appendChild(badge);
    }
  });
}

// ── Popup (3-line preview) ────────────────────────────────────────────────

let _activePopup = null;

function showBookLinkPopup(anchorEl, link) {
  closeBookLinkPopup();

  const popup = document.createElement('div');
  popup.className = 'book-link-popup';
  popup.setAttribute('role', 'tooltip');

  const header = document.createElement('div');
  header.className = 'blp-header';
  header.textContent = link.dst_book_name;
  popup.appendChild(header);

  const preview = document.createElement('div');
  preview.className = 'blp-preview';
  for (const row of link.preview) {
    const rowEl = document.createElement('div');
    const setting = loadSettings();
    rowEl.className = 'blp-row' + (row.is_target ? ' blp-target' : '');
    if (row.pali && setting.pali)    rowEl.innerHTML += `<span class="pali-text blp-pali">${row.pali}</span>`;
    if (row.english && setting.english) rowEl.innerHTML += `<span class="blp-eng">${row.english}</span>`;
    if (row.vietnamese && setting.vietnamese) rowEl.innerHTML += `<span class="blp-viet">${row.vietnamese}</span>`;
    preview.appendChild(rowEl);
  }
  popup.appendChild(preview);

  const moreBtn = document.createElement('button');
  moreBtn.className   = 'blp-more-btn';
  moreBtn.textContent = 'Show full section ›';
  moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeBookLinkPopup();
    showBookLinkDialog(link);
  });
  popup.appendChild(moreBtn);

  document.body.appendChild(popup);
  positionPopup(popup, anchorEl);
  _activePopup = popup;

  const onOutside = e => {
    if (!popup.contains(e.target) && e.target !== anchorEl) closeBookLinkPopup();
  };
  const onEsc = e => { if (e.key === 'Escape') closeBookLinkPopup(); };
  setTimeout(() => {
    document.addEventListener('click',   onOutside, { once: true });
    document.addEventListener('keydown', onEsc,     { once: true });
  }, 0);
}

function positionPopup(popup, anchor) {
  const rect    = anchor.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  let top  = rect.bottom + scrollY + 6;
  let left = rect.left   + scrollX;

  const popW = 320;
  if (left + popW > window.innerWidth + scrollX - 8) {
    left = window.innerWidth + scrollX - popW - 8;
  }
  if (left < 8) left = 8;

  popup.style.top  = `${top}px`;
  popup.style.left = `${left}px`;
}

function closeBookLinkPopup() {
  if (_activePopup) { _activePopup.remove(); _activePopup = null; }
}

// ── Full-section dialog (draggable, via draggable-dialog.js) ──────────────

// Track open dialogs keyed by book+para+line so we never duplicate.
const _openDialogs = new Map();

async function showBookLinkDialog(link) {
  const dlgKey = `${link.dst_book}-${link.dst_para}-${link.dst_line}`;

  // Bring existing dialog to front instead of reopening.
  if (_openDialogs.has(dlgKey)) {
    _openDialogs.get(dlgKey).bringToFront();
    return;
  }

  // Build a placeholder body element that we'll fill after the fetch.
  const bodyContent = document.createElement('div');
  bodyContent.className = 'bld-body';
  bodyContent.innerHTML = '<div class="section-loading">Loading…</div>';

  const dlg = createDraggableDialog({
    id:        `bld-${dlgKey.replace(/[^a-z0-9]/gi, '-')}`,
    title:     link.dst_book_name,
    content:   bodyContent,
    width:     600,
    height:    560,
    minWidth:  300,
    minHeight: 200,
    className: 'book-link-dialog-draggable',
    onClose:   () => _openDialogs.delete(dlgKey),
  });

  _openDialogs.set(dlgKey, dlg);
  dlg.open();

  try {
    const url = `${baseUrl}/api/book_link_section`
              + `?dst_book=${encodeURIComponent(link.dst_book)}`
              + `&dst_para=${link.dst_para}&dst_line=${link.dst_line}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();

    // Update title to include section name.
    if (data.section_title) {
      dlg.setTitle(`${link.dst_book_name} — ${data.section_title}`);
    }

    bodyContent.innerHTML = '';

    const subtitle = document.createElement('div');
    subtitle.className   = 'bld-subtitle pali-text';
    subtitle.textContent = data.section_title || '';
    bodyContent.appendChild(subtitle);

    const groups = {};
    for (const s of data.sentences) {
      (groups[s.para_id] = groups[s.para_id] || []).push(s);
    }

    for (const paraId of Object.keys(groups).sort((a, b) => a - b)) {
      const paraEl = document.createElement('div');
      paraEl.className = 'bld-para';

      for (const s of groups[paraId]) {
        const rowEl    = document.createElement('div');
        const isTarget = s.para_id === link.dst_para && s.line_id === link.dst_line;
        rowEl.className = 'bld-sentence' + (isTarget ? ' bld-target' : '');
        rowEl.id        = `bld-p${s.para_id}-l${s.line_id}`;
        let setting = loadSettings()

        if (s.pali && setting.pali)    rowEl.innerHTML += `<div class="pali-text bld-pali">${s.pali}</div>`;
        if (s.english && setting.english) rowEl.innerHTML += `<div class="blp-eng">${s.english}</div>`;
        if (s.vietnamese && setting.vietnamese) rowEl.innerHTML += `<div class="blp-viet">${s.vietnamese}</div>`;
        paraEl.appendChild(rowEl);
      }
      bodyContent.appendChild(paraEl);
    }

    // Scroll target sentence into view inside the dialog body.
    setTimeout(() => {
      const targetRow = bodyContent.querySelector('.bld-target');
      if (targetRow) targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);

    // Footer: "Open in new tab" link.
    const footer = document.createElement('div');
    footer.className = 'bld-footer';
    const openLink = document.createElement('a');
    openLink.className   = 'bld-open-link';
    openLink.href        = `${baseUrl}/book/${link.dst_book}?para=${link.dst_para}&line=${link.dst_line}`;
    openLink.target      = '_blank';
    openLink.rel         = 'noopener noreferrer';
    openLink.textContent = `Open in ${data.section_title || link.dst_book_name} ↗`;
    footer.appendChild(openLink);
    bodyContent.appendChild(footer);

  } catch {
    bodyContent.innerHTML =
      '<div class="section-loading error">Could not load section.</div>';
  }
}

// ════════════════════════════════════════════
// Reading history tracking
// ════════════════════════════════════════════

function _initHistoryTracking() {
  if (!window.BOOK_CONFIG) return;
  const { baseUrl, bookId } = window.BOOK_CONFIG;

  let _lastReportedParaId   = null;
  let _currentVisibleParaId = null;
  let _reportTimer          = null;

  function _reportHistory(paraId) {
    _currentVisibleParaId = paraId;
    if (!auth.loggedIn) return;
    if (paraId === _lastReportedParaId) return;
    _lastReportedParaId = paraId;

    clearTimeout(_reportTimer);
    _reportTimer = setTimeout(async () => {
      const section      = document.querySelector(`.section-block[data-para-id="${paraId}"]`);
      const titleEl      = section?.querySelector('.section-heading-text');
      const sectionTitle = titleEl?.textContent?.trim() || '';
      const bookTitleEl  = document.querySelector('.book-title');
      const bookTitle    = bookTitleEl?.textContent?.trim() || '';

      try {
        const token = await getIdToken();
        if (!token) return;
        fetch(`${baseUrl}/api/book/${bookId}/history`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ para_id: paraId, section_title: sectionTitle, book_title: bookTitle }),
        });
      } catch {}
    }, 5000);
  }

  const histObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const paraId = parseInt(entry.target.dataset.paraId);
      if (!isNaN(paraId)) _reportHistory(paraId);
    }
  }, { rootMargin: '-10% 0px -50% 0px' });

  document.querySelectorAll('.section-block').forEach(el => histObserver.observe(el));

  auth.onChange((user) => {
    if (user && _currentVisibleParaId !== null) {
      _reportHistory(_currentVisibleParaId);
    }
  });
}

// ════════════════════════════════════════════
// Init
// ════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', initRefDropdowns);
document.addEventListener('DOMContentLoaded', async () => {
  const s = loadSettings();
  applySettings(s);
  buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);

  initAuthUI();
  initLibraryUI();

  handleDeepLink();
  _initHistoryTracking();

  if (window.HOME_MENU) {
    initHomeDialog({
      triggerSelector: '#home-dialog-trigger',
      baseUrl: window.BOOK_CONFIG.baseUrl,
      menu: window.HOME_MENU,
    });
  }
});
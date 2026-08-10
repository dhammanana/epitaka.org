/**
 * book.js
 * Main reader logic for E-Piṭaka book page.
 *
 * Sections are server-rendered — clicking a heading or TOC item
 * navigates to the section's SEO-friendly URL, causing a full page
 * load.  JS handles: TOC sidebar, Pali script conversion, dictionary,
 * settings modal, Firebase auth, reading history, cross-ref links.
 */

import './css/book.css';
import './css/book-links.css';
import './css/refbutton.css';
// Note: common.css is loaded via @import in book.css, NOT via JS import.
// This avoids Vite CSS code-splitting (index.js also imports common.css).
import { TextProcessor, Script } from './pali-script.js';
import {
  loadSettings, saveSettings, applySettings,
  populateSettingsForm, readSettingsForm,
  buildScriptOptions,
} from './settings.js';
import { attachPaliClickListeners } from './dictionary.js';
import { initAuthUI }               from './auth/auth-ui.js';
import { initLibraryUI }            from './row_actions/library-ui.js';
import { initAppBanner }            from './app-banner.js';
import { initSidebar }              from './sidebar.js';

import { auth, getIdToken }         from './auth/auth.js';

// ── Config injected from book.html ────────────────────────────
const { bookId, baseUrl, lang, bookref } = window.BOOK_CONFIG;

// ── State ─────────────────────────────────────────────────────
const originalPaliText = new WeakMap();

// ── DOM refs ──────────────────────────────────────────────────
const settingsBtn    = document.getElementById('settings-btn');
const settingsModal  = document.getElementById('settings-modal');
const settingsForm   = document.getElementById('settings-form');
const settingsCancel = document.getElementById('settings-cancel');

// ════════════════════════════════════════════
// Sidebar — VSCode-style activity rail + drawer.
// Owns: library tree, search panel, table of contents, dictionary toggle.
// ════════════════════════════════════════════
const sidebar = initSidebar({ bookId });

// ── Sentence-row observer for granular ref-link tracking ───────────
// When a sentence row enters the viewport, find the nearest numbered
// item para_id in REF_LINKS that is <= the sentence's para_id, and
// update the M/A/Ṭ buttons accordingly.
const refLinks = window.REF_LINKS || {};
console.debug('[REF_LINKS] loaded:', Object.keys(refLinks).length, 'keys', refLinks);
const sortedRefPids = Object.keys(refLinks).map(Number).sort((a, b) => a - b);
console.debug('[REF_LINKS] sorted para_ids:', sortedRefPids);

function findNearestRefParaId(sentenceParaId) {
  // Find the largest ref_links key that is <= sentenceParaId
  let lo = 0, hi = sortedRefPids.length - 1, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (sortedRefPids[mid] <= sentenceParaId) {
      best = sortedRefPids[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

const sentinelObserver = new IntersectionObserver(entries => {
  let bestParaId = Infinity;
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    // Extract paraId from the element ID: p-{paraId}-l-{lineId}
    // Pick the smallest (topmost) visible para_id = user's reading position
    const id = entry.target.id;
    const m = id && id.match(/^p-(\d+)-l-\d+$/);
    if (m) {
      const pid = parseInt(m[1]);
      if (pid < bestParaId) bestParaId = pid;
    }
  }
  if (bestParaId < Infinity) {
    const nearest = findNearestRefParaId(bestParaId);
    console.debug('[sentinel] visible sentence para_id:', bestParaId, '→ nearest ref:', nearest);
    if (nearest > 0) {
      updateCrossRefLinks(nearest);
    }
  }
}, { rootMargin: '0px 0px -10% 0px' });

// Observe sentence rows inside the open section
function observeSentenceRows() {
  document.querySelectorAll('.section-content.open .sentence-row')
    .forEach(el => sentinelObserver.observe(el));
}
observeSentenceRows();



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
// Cross-reference links
// ════════════════════════════════════════════

function updateCrossRefLinks(paraId) {
  const types = ['mula_ref', 'attha_ref', 'tika_ref'];
  const prefixes = { mula_ref: 'ref-mula', attha_ref: 'ref-attha', tika_ref: 'ref-tika' };
  const refLinks = window.REF_LINKS || {};

  // Look up pre-computed links for this para_id
  const paraRefs = refLinks[paraId];

  if (paraRefs) {
    // Use direct links from pre-computed data
    for (const key of types) {
      const entries = paraRefs[key] || [];
      for (let i = 0; i < entries.length; i++) {
        const el = document.getElementById(`${prefixes[key]}-${i + 1}`);
        if (el) {
          const e = entries[i];
          const dstPath = [lang, 'book', e.book_id, e.slug].filter(Boolean).join('/');
          el.href = baseUrl + '/' + dstPath + '#' + e.para_id;
        }
      }
    }
  } else {
    // Fallback: no pre-computed links — use book_ref route
    // This happens when no section heading is visible (e.g. intro paragraphs)
    for (const key of types) {
      const refs = bookref[key] || [];
      for (let i = 0; i < refs.length; i++) {
        const el = document.getElementById(`${prefixes[key]}-${i + 1}`);
        if (el) {
          el.href = `${baseUrl}/${lang}/book_ref/${refs[i].book_id}?ref=${bookId}&para_id=${paraId}`;
        }
      }
    }
  }
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

document.addEventListener('DOMContentLoaded', async () => {
  // Attach click-to-lookup on server-rendered Pali text
  attachPaliClickListeners(document.getElementById('main-content'));

  const s = loadSettings();
  applySettings(s);
  applyPaliScript(s.paliScript);
  buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);

  initAuthUI();
  initLibraryUI();
  initAppBanner();

  _initHistoryTracking();

  // ── Helper: find the enclosing section block for a given para_id ──
  function _findEnclosingSection(paraId) {
    // Section blocks are in DOM order (ascending para_id).
    // Find the last section-block whose data-para-id <= paraId.
    const blocks = document.querySelectorAll('.section-block');
    let best = null;
    for (const b of blocks) {
      const pid = parseInt(b.dataset.paraId);
      if (!isNaN(pid) && pid <= paraId) {
        best = b;
      }
    }
    return best;
  }

  // ── Helper: find the first sentence-row element for a paragraph ──
  function _findFirstSentenceRow(paraId) {
    // Cannot use querySelector `^=` alone because `p-1` matches `p-12`.
    // Query all candidates and filter by exact regex match.
    const candidates = document.querySelectorAll('[id^="p-' + paraId + '-l-"]');
    for (const el of candidates) {
      const m = el.id.match(/^p-(\d+)-l-(\d+)$/);
      if (m && parseInt(m[1]) === paraId) return el;
    }
    return null;
  }

  // ── Helper: ensure section-content is open ──
  function _openSection(section) {
    if (!section) return;
    const content = section.querySelector('.section-content');
    if (content && !content.classList.contains('open')) {
      content.classList.add('open');
      content.setAttribute('aria-hidden', 'false');
      // Observe newly-revealed sentence rows for ref-link tracking
      content.querySelectorAll('.sentence-row').forEach(el => sentinelObserver.observe(el));
    }
  }

  // ── Helper: scroll an element into view with highlight ──
  function _scrollToEl(el) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-flash');
    }, 200);
  }

  // ── Deep-link: read hash fragment #para_id-line_id and scroll ──
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const parts = hash.split('-');
    const paraId = parseInt(parts[0]);
    const lineId = parts.length >= 2 ? parseInt(parts[1]) : NaN;

    if (!isNaN(paraId)) {
      if (!isNaN(lineId)) {
        // ── Hash has both para_id and line_id: #997-5 ──
        const targetId = 'p-' + paraId + '-l-' + lineId;
        let targetEl = document.getElementById(targetId);
        if (!targetEl) {
          // Section might not be open yet — find and open it
          const section = _findEnclosingSection(paraId);
          _openSection(section);
          targetEl = document.getElementById(targetId);
        }
        if (targetEl) {
          _scrollToEl(targetEl);
        } else {
          // Fallback: scroll to section
          const section = _findEnclosingSection(paraId);
          if (section) _scrollToEl(section);
        }
      } else {
        // ── Hash has only para_id: #997 (e.g. from ref_links M/A/T) ──
        // Try to find any sentence row in this paragraph
        let targetEl = _findFirstSentenceRow(paraId);
        if (!targetEl) {
          const section = _findEnclosingSection(paraId);
          _openSection(section);
          targetEl = _findFirstSentenceRow(paraId);
        }
        if (targetEl) {
          _scrollToEl(targetEl);
        } else {
          const section = _findEnclosingSection(paraId);
          if (section) _scrollToEl(section);
        }
      }
    }
  } else if (window.BOOK_CONFIG.paraId) {
    // ── No hash: scroll to the active section opened by the server ──
    const section = _findEnclosingSection(window.BOOK_CONFIG.paraId);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
});

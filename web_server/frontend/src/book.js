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
  populateSettingsForm, readSettingsForm, setThemePreference, applyTheme,
  buildScriptOptions, getScriptForLang, onLanguageSelect,
} from './settings.js';
import { attachPaliClickListeners } from './dictionary.js';
import { initAuthUI, showLoginDialog, showProfileDialog } from './auth/auth-ui.js';
import { initLibraryUI }            from './row_actions/library-ui.js';
import { initAppBanner }            from './app-banner.js';
import { initSidebar }              from './sidebar.js';
import { initCookieConsent }         from './cookie-consent.js';

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

applyTheme();

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
  document.querySelectorAll('.pali-text, .book-link-badge').forEach(el => {
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

  // Sync mobile dropdown ref links
  _syncMobileRefLinks();
}

// ════════════════════════════════════════════
// Book-link badges: move to end of paragraph in flow mode
// ════════════════════════════════════════════

function _moveBookLinksToEndOfPara() {
  const isFlow = document.body.getAttribute('data-flow') === 'true';
  document.querySelectorAll('.para-group').forEach(pg => {
    let endContainer = pg.querySelector('.book-links-end');

    if (isFlow) {
      // Collect all book-link badges from sentence rows
      const badges = pg.querySelectorAll('.sentence-row .book-link-badge, .sentence-row .book-link-more');
      if (!badges.length) return;

      if (!endContainer) {
        endContainer = document.createElement('div');
        endContainer.className = 'book-links-end';
        pg.appendChild(endContainer);
      }
      endContainer.innerHTML = '';
      badges.forEach(b => endContainer.appendChild(b.cloneNode(true)));
    } else {
      // Flow mode off — remove the end container (badges stay inline)
      if (endContainer) endContainer.remove();
    }
  });
}

// ════════════════════════════════════════════
// Settings modal
// ════════════════════════════════════════════

settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    // Toggle the "more" dropdown on mobile
    const menu = document.getElementById('topbar-more-menu');
    const isOpen = menu?.classList.contains('open');
    menu?.classList.toggle('open');
    settingsBtn.setAttribute('aria-expanded', !isOpen);
  } else {
    // Open settings modal on desktop
    const s = loadSettings();
    populateSettingsForm(s);
    buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);
    settingsModal.classList.add('show');
  }
});
settingsCancel.addEventListener('click', () => settingsModal.classList.remove('show'));
settingsModal.addEventListener('click', e => {
  if (e.target === settingsModal) settingsModal.classList.remove('show');
});
settingsForm.addEventListener('submit', e => {
  e.preventDefault();
  const s = readSettingsForm();
  s.scriptManuallySet = true;  // user explicitly chose a script
  saveSettings(s); setThemePreference(s.theme); applySettings(s); applyPaliScript(s.paliScript);
  _moveBookLinksToEndOfPara();
  settingsModal.classList.remove('show');
});

// ════════════════════════════════════════════
// Topbar "more" dropdown (mobile settings menu)
// ════════════════════════════════════════════

function _syncMobileRefLinks() {
  const mula1   = document.getElementById('ref-mula-1');
  const attha1  = document.getElementById('ref-attha-1');
  const tika1   = document.getElementById('ref-tika-1');
  const mM      = document.getElementById('ref-mula-mobile');
  const mA      = document.getElementById('ref-attha-mobile');
  // For tika with only one ref, sync the direct link button
  const mTGroup = document.getElementById('topbar-more-tika-group');
  if (mula1 && mM) mM.href = mula1.href;
  if (attha1 && mA) mA.href = attha1.href;
  // If tika has only 1 ref, sync the group button itself as a link
  if (tika1 && mTGroup && !mTGroup.querySelector('.topbar-more__tika-menu')) {
    mTGroup.querySelector('.topbar-more__ref-btn')?.setAttribute('href', tika1.href);
  }
}

function _initTopbarMore() {
  const menu = document.getElementById('topbar-more-menu');
  if (!menu) return;

  function closeMenu() {
    menu.classList.remove('open');
    settingsBtn.setAttribute('aria-expanded', 'false');
  }

  // Settings item → open the settings modal
  menu.querySelector('.topbar-more__settings')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
    const s = loadSettings();
    populateSettingsForm(s);
    buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);
    settingsModal.classList.add('show');
  });

  // Auth / login item
  menu.querySelector('.topbar-more__auth')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
    if (auth.loggedIn) {
      showProfileDialog();
    } else {
      showLoginDialog();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#topbar-more')) closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  // Close when a menu item link is clicked
  menu.querySelectorAll('.topbar-more__link').forEach(item => {
    item.addEventListener('click', closeMenu);
  });

  // Tika sub-dropdown toggle (only when multiple tika refs)
  const tikaGroup = document.getElementById('topbar-more-tika-group');
  const tikaMenu  = tikaGroup?.querySelector('.topbar-more__tika-menu');
  const tikaBtn   = tikaGroup?.querySelector('.topbar-more__ref-btn');
  if (tikaBtn && tikaMenu) {
    tikaBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = tikaMenu.classList.contains('open');
      // Close any other open tika menus
      tikaMenu.classList.toggle('open');
      tikaBtn.setAttribute('aria-expanded', !isOpen);
    });
    // Close tika menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#topbar-more-tika-group')) {
        tikaMenu.classList.remove('open');
        tikaBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Update mobile auth button text based on login state
  function _updateMobileAuth(profile) {
    const btn = menu.querySelector('.topbar-more__auth');
    if (!btn) return;
    if (auth.loggedIn && profile) {
      btn.textContent = '👤 ' + (profile.display_name || 'Profile');
    } else {
      btn.textContent = '👤 Login';
    }
  }
  auth.onChange(_updateMobileAuth);
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
// Fetch heading translations for ALL sections
// ════════════════════════════════════════════

async function _fetchHeadingTranslations() {
  try {
    const res = await fetch(`${baseUrl}/api/book/${bookId}/heading_translations?lang=${encodeURIComponent(lang)}`);
    if (!res.ok) return;
    const data = await res.json();
    // data = { para_id: translation_html, ... }
    for (const [paraId, translation] of Object.entries(data)) {
      const section = document.querySelector(`.section-block[data-para-id="${paraId}"]`);
      if (!section) continue;
      // Find or create the heading translation element
      let transEl = section.querySelector('.section-heading-translation');
      if (!transEl) {
        // Insert after the heading text
        const headingLink = section.querySelector('.section-heading-link, .section-heading-empty');
        if (!headingLink) continue;
        transEl = document.createElement('span');
        transEl.className = 'section-heading-translation';
        headingLink.appendChild(transEl);
      }
      transEl.innerHTML = translation;
    }
  } catch (err) {
    console.debug('[book] failed to fetch heading translations', err);
  }
}

// ════════════════════════════════════════════
// Init
// ════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  // Attach click-to-lookup on server-rendered Pali text
  attachPaliClickListeners(document.getElementById('main-content'));

  const s = loadSettings(lang);
  applySettings(s);
  applyPaliScript(s.paliScript);
  buildScriptOptions(document.getElementById('pali-script-select'), s.paliScript);
  _moveBookLinksToEndOfPara();

  // ── Language selector: set matching Pāli script on click ────
  document.querySelectorAll('.lang-dropdown__menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Extract the language code from the link URL: /{lang}/book/...
      const m = link.getAttribute('href')?.match(/\/([a-z]{2})\b/);
      if (m) onLanguageSelect(m[1]);
    });
  });

  initAuthUI();
  initLibraryUI();
  initAppBanner();
  initCookieConsent({ gaId: 'G-7NQWX1DCC2' });
  _initTopbarMore();

  _initHistoryTracking();
  _fetchHeadingTranslations();
  _syncMobileRefLinks();

  // Re-apply pali script when sidebar library tree is ready (async load).
  document.addEventListener('sidebar:library-ready', () => {
    const s = loadSettings(lang);
    applyPaliScript(s.paliScript);
  });

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

  // ── Helper: find the first sentence row for a paragraph ──
  function _findFirstSentenceRow(paraId) {
    const rows = [...document.querySelectorAll('.sentence-row')];
    return rows.find(el => {
      const match = el.id.match(/^p-(\d+)-l-(\d+)$/);
      return match && parseInt(match[1], 10) === paraId;
    }) || null;
  }

  function _findLineRow(paraId, lineId) {
    const el = document.getElementById(`p-${paraId}-l-${lineId}`);
    return el?.id === `p-${paraId}-l-${lineId}` ? el : null;
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

  // ── Helper: scroll an element into view and show the jump marker ──
  function _clearJumpHighlight() {
    document.querySelectorAll('.jump-target-highlight').forEach(el => {
      el.classList.remove('jump-target-highlight');
    });
  }

  function _highlightSearchTerm(paragraph, term) {
    if (!paragraph || !term) return;
    const needle = term.trim();
    if (!needle) return;
    const lowerNeedle = needle.toLocaleLowerCase();
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script, style, mark')) continue;
      if (node.nodeValue.toLocaleLowerCase().includes(lowerNeedle)) nodes.push(node);
    }
    nodes.forEach(textNode => {
      const text = textNode.nodeValue;
      const lower = text.toLocaleLowerCase();
      const frag = document.createDocumentFragment();
      let from = 0;
      let index;
      while ((index = lower.indexOf(lowerNeedle, from)) !== -1) {
        frag.append(text.slice(from, index));
        const mark = document.createElement('mark');
        mark.className = 'jump-search-term';
        mark.textContent = text.slice(index, index + needle.length);
        frag.append(mark);
        from = index + needle.length;
      }
      frag.append(text.slice(from));
      textNode.replaceWith(frag);
    });
  }

  function _scrollToEl(el, searchTerm = '') {
    requestAnimationFrame(() => {
      _clearJumpHighlight();
      const paragraph = el.closest('.para-group') || el;
      paragraph.classList.remove('jump-target-highlight');
      void paragraph.offsetWidth;
      paragraph.classList.add('jump-target-highlight');
      _highlightSearchTerm(paragraph, searchTerm);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => paragraph.classList.remove('jump-target-highlight'), 5000);
    });
  }

  // Shared handler for links that jump to a paragraph/line in this book.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank') return;

    let url;
    try { url = new URL(link.href, window.location.href); } catch { return; }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;

    const hash = url.hash.replace(/^#/, '');
    if (!hash) return;
    const hashParts = hash.split('-');
    const paraId = parseInt(hashParts[0], 10);
    if (isNaN(paraId)) return;

    const lineId = parseInt(hashParts[1], 10);
    let target = !isNaN(lineId)
      ? _findLineRow(paraId, lineId)
      : _findFirstSentenceRow(paraId);
    if (!target) {
      const section = _findEnclosingSection(paraId);
      _openSection(section);
      target = !isNaN(lineId)
        ? _findLineRow(paraId, lineId)
        : _findFirstSentenceRow(paraId) || section;
    }
    if (target) {
      event.preventDefault();
      history.pushState(null, '', url.hash);
      _scrollToEl(target, url.searchParams.get('q') || '');
    }
  });

  // ── Deep-link: read hash fragment #para_id-line_id and scroll ──
  const hash = window.location.hash.replace(/^#/, '');
  const jumpSearchTerm = new URLSearchParams(window.location.search).get('q') || '';
  if (hash) {
    const parts = hash.split('-');
    const paraId = parseInt(parts[0]);
    const lineId = parts.length >= 2 ? parseInt(parts[1]) : NaN;

    if (!isNaN(paraId)) {
      if (!isNaN(lineId)) {
        // ── Hash has both para_id and line_id: #997-5 ──
        let targetEl = _findLineRow(paraId, lineId);
        if (!targetEl) {
          // Section might not be open yet — find and open it
          const section = _findEnclosingSection(paraId);
          _openSection(section);
          targetEl = _findLineRow(paraId, lineId);
        }
        if (targetEl) {
          _scrollToEl(targetEl, jumpSearchTerm);
        } else {
          // Fallback: scroll to section
          const section = _findEnclosingSection(paraId);
          if (section) _scrollToEl(section, jumpSearchTerm);
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
          _scrollToEl(targetEl, jumpSearchTerm);
        } else {
          const section = _findEnclosingSection(paraId);
          if (section) _scrollToEl(section, jumpSearchTerm);
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

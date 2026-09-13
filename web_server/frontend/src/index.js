/**
 * index.js
 * Entry point for the E-Piṭaka landing / index page.
 *
 * Responsibilities:
 *   - Import index.css so Vite extracts it to static/css/index.css
 *   - Read window.INDEX_CONFIG (injected by Flask) — note the library menu
 *     is deliberately NOT embedded in the page HTML anymore; it is fetched
 *     from /api/menu so the HTML output stays small.
 *   - Initialise the home-dialog module
 *   - Wire the disclaimer overlay logic
 */

import './css/index.css';
import './css/common.css';
import { initHomeDialog } from './home-dialog/home-dialog.js';
import { initCookieConsent } from './cookie-consent.js';
import { initSidebar } from './sidebar.js';
import { applyTheme, onLanguageSelect, loadSettings, applySettings } from './settings.js';
import { applyPaliScript } from './pali-text.js';

// ── Config injected from index.html via Flask ──────────────────
const { baseUrl, lang } = window.INDEX_CONFIG;

const SKIP_KEY = 'epika_disclaimer_skip';

function hasSkippedDisclaimer() {
  try {
    return localStorage.getItem(SKIP_KEY) === '1';
  } catch {
    return false;
  }
}

// ── DOM refs ───────────────────────────────────────────────────
const overlay  = document.getElementById('disclaimer-overlay');
const okBtn    = document.getElementById('disclaimer-ok');
const checkbox = document.getElementById('disclaimer-no-show');

let homeDialog = null;

/**
 * Fetch the book hierarchy (menu) from the API. The menu is loaded at
 * runtime — not baked into the HTML — so page size stays small and the
 * hierarchy is always fresh.
 */
async function loadMenu() {
  try {
    const res = await fetch(`${baseUrl}/api/menu`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[index] failed to load menu, falling back to empty', err);
    return { menu: {}, hierarchy: {} };
  }
}

// Hide the server-rendered disclaimer before the module executes, avoiding
// a flash for visitors who already saved the preference.
if (hasSkippedDisclaimer()) {
  overlay?.classList.add('hidden');
}

async function init() {
  applyTheme();

  // Same settings bootstrap as the book page: derive the Pāli script from
  // the URL language (e.g. /km/ → Khmer), mirror it to body[script] for
  // script fonts, and transliterate existing .pali-text nodes. Content
  // rendered later (sidebar library, search results, dialogs) is picked
  // up automatically by the pali-text.js observer.
  const s = loadSettings(lang);
  applySettings(s);
  applyPaliScript(s.paliScript);

  // ── Cookie consent (GDPR) ──
  // Must run BEFORE the slow menu fetch so the banner appears immediately.
  initCookieConsent({ gaId: 'G-7NQWX1DCC2' });

  // ── Reader-style shell: same sidebar + topbar as the book page ──
  // No book is open (BOOK_CONFIG.bookId is ''), so the sidebar runs in
  // no-book mode and the top bar has no M/A/Ṭ ref buttons.
  initSidebar({ bookId: '' });
  _bindTopbar();

  const { menu, hierarchy } = await loadMenu();

  // ── Home dialog ────────────────────────────────────────────────
  // Bound to the "Browse the Canon" button on the landing screen.
  // The dialog itself is appended to <body> by initHomeDialog().
  homeDialog = initHomeDialog({
    triggerSelector: '#open-books-btn',
    baseUrl,
    lang,
    menu,
    hierarchy,
  });

  // ── Top-bar language selector: set matching Pāli script on click ──
  document.querySelectorAll('.lang-dropdown__item').forEach(link => {
    link.addEventListener('click', () => {
      // Extract the language code from the link URL: /{lang}/
      const m = link.getAttribute('href')?.match(/\/([a-z]{2})\/?$/);
      if (m) onLanguageSelect(m[1]);
    });
  });

  // ── Disclaimer logic ───────────────────────────────────────────

  function dismissDisclaimer(savePref) {
    if (savePref && checkbox.checked) {
      try {
        localStorage.setItem(SKIP_KEY, '1');
        document.cookie = `${SKIP_KEY}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
      } catch {}
    }
    overlay.classList.add('hidden');
    // Library stays closed — user clicks "Browse the Canon" to open it.
  }

  // Skip disclaimer if the user previously ticked "don't show again"
  if (hasSkippedDisclaimer()) {
    overlay.classList.add('hidden');
    // Library stays closed — user clicks "Browse the Canon" to open it.
  }

  // OK button — saves preference if checkbox is ticked
  okBtn.addEventListener('click', () => dismissDisclaimer(true));

  // Click on dark backdrop — dismiss without saving preference
  overlay.addEventListener('click', e => {
    if (e.target === overlay) dismissDisclaimer(false);
  });

  // Escape key — same as backdrop click
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      dismissDisclaimer(false);
    }
  });
}

/**
 * Reader-style top bar dropdowns (language + ⋯ menu). Mirrors the inline
 * script on the book page; the index top bar has no M/A/Ṭ ref buttons
 * because no book is open.
 */
function _bindTopbar() {
  const langToggle = document.querySelector('.lang-dropdown__toggle');
  const langMenu = document.querySelector('.lang-dropdown__menu');
  if (langToggle && langMenu) {
    const langFilter = langMenu.querySelector('.lang-dropdown__filter');
    const langEmpty = langMenu.querySelector('.lang-dropdown__empty');
    const langRows = [...langMenu.querySelectorAll('.lang-dropdown__list > li')];
    const applyFilter = () => {
      if (!langFilter) return;
      const q = langFilter.value.trim().toLowerCase();
      let visible = 0;
      for (const li of langRows) {
        const hit = !q || (li.dataset.search || li.textContent).toLowerCase().includes(q);
        li.hidden = !hit;
        if (hit) visible++;
      }
      if (langEmpty) langEmpty.hidden = visible !== 0;
    };
    langFilter?.addEventListener('input', applyFilter);
    langMenu.addEventListener('click', (e) => e.stopPropagation());
    const closeLang = () => {
      langToggle.setAttribute('aria-expanded', 'false');
      langMenu.classList.remove('open');
    };
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !langMenu.classList.contains('open');
      langToggle.setAttribute('aria-expanded', String(willOpen));
      langMenu.classList.toggle('open', willOpen);
      if (willOpen) {
        if (langFilter) { langFilter.value = ''; applyFilter(); }
        langMenu.querySelector('.lang-dropdown__item.selected')
          ?.scrollIntoView({ block: 'nearest' });
        langFilter?.focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLang();
    });
  }

  const moreToggle = document.getElementById('more-btn');
  const moreMenu = document.getElementById('topbar-more-menu');
  if (moreToggle && moreMenu) {
    moreToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = moreToggle.getAttribute('aria-expanded') === 'true';
      moreToggle.setAttribute('aria-expanded', String(!expanded));
      moreMenu.classList.toggle('open');
    });
  }

  document.addEventListener('click', () => {
    langToggle?.setAttribute('aria-expanded', 'false');
    langMenu?.classList.remove('open');
    moreToggle?.setAttribute('aria-expanded', 'false');
    moreMenu?.classList.remove('open');
  });
}

init();

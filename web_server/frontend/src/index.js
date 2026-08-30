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
import { applyTheme, onLanguageSelect } from './settings.js';

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

  // ── Cookie consent (GDPR) ──
  initCookieConsent({ gaId: 'G-7NQWX1DCC2' });

  // ── Language selector: set matching Pāli script on click ────
  document.querySelectorAll('.landing-languages a').forEach(link => {
    link.addEventListener('click', (e) => {
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

init();

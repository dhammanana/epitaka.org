/**
 * index.js
 * Entry point for the E-Piṭaka landing / index page.
 *
 * Responsibilities:
 *   - Import index.css so Vite extracts it to static/css/index.css
 *   - Read window.INDEX_CONFIG (injected by Flask)
 *   - Initialise the home-dialog module
 *   - Wire the disclaimer overlay logic
 */

import './css/index.css';
import { initHomeDialog } from './home-dialog/home-dialog.js';

// ── Config injected from index.html via Flask ──────────────────
const { baseUrl, menu } = window.INDEX_CONFIG;

const SKIP_KEY = 'epika_disclaimer_skip';

// ── DOM refs ───────────────────────────────────────────────────
const overlay  = document.getElementById('disclaimer-overlay');
const okBtn    = document.getElementById('disclaimer-ok');
const checkbox = document.getElementById('disclaimer-no-show');

// ── Home dialog ────────────────────────────────────────────────
// Bound to the "Browse the Canon" button on the landing screen.
// The dialog itself is appended to <body> by initHomeDialog().
const homeDialog = initHomeDialog({
  triggerSelector: '#open-books-btn',
  baseUrl,
  menu,
});

// ── Disclaimer logic ───────────────────────────────────────────

function dismissDisclaimer(savePref) {
  if (savePref && checkbox.checked) {
    localStorage.setItem(SKIP_KEY, '1');
  }
  overlay.classList.add('hidden');
  homeDialog.open();
}

// Skip disclaimer if the user previously ticked "don't show again"
if (localStorage.getItem(SKIP_KEY) === '1') {
  overlay.classList.add('hidden');
  homeDialog.open();
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
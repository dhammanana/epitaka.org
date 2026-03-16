/**
 * settings.js
 * Manages all user preferences for the E-Piṭaka reader.
 * Exported functions are called by book.js and the settings modal.
 */

import { Script, paliScriptInfo } from './pali-script.js';

export { Script, paliScriptInfo };

// ── Storage key ──────────────────────────────────────
const STORAGE_KEY = 'epitaka_settings_v3';

// ── Defaults ─────────────────────────────────────────
export function defaultSettings() {
  return {
    pali:           true,
    english:        true,
    vietnamese:     false,
    layout:         'stacked',   // 'stacked' | 'sidebyside'
    paliScript:     Script.RO,   // default Roman
    paliColor:      '#7c2d12',
    engColor:       '#1e3a5f',
    vietColor:      '#4a1d6b',
    bgColor:        '#faf7f2',
    actionButtons:  'line',      // 'line' | 'para' | 'none'
    fontSize:       16,          // px – applied to #main-content
    actionCollapse: false,       // true = collapse row buttons into a single ⋯ menu
    load_attha: true,
    
  };
}

export function loadSettings() {
  try {
    return { ...defaultSettings(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ── Apply settings to the DOM ─────────────────────────
export function applySettings(s) {
  // CSS variables for colors
  const root = document.documentElement;
  root.style.setProperty('--pali-color', s.paliColor);
  root.style.setProperty('--eng-color',  s.engColor);
  root.style.setProperty('--viet-color', s.vietColor);
  root.style.setProperty('--bg',         s.bgColor);
  document.body.style.backgroundColor = s.bgColor;

  // Font size – clamp to sensible range
  const fs = Math.min(Math.max(parseInt(s.fontSize) || 16, 10), 32);
  root.style.setProperty('--reader-font-size', `${fs}px`);

  document.querySelector('body').setAttribute('script', s.paliScript);
  document.body.setAttribute('data-ra-mode',     s.actionButtons  || 'line');
  document.body.setAttribute('data-ra-collapse', s.actionCollapse ? 'true' : 'false');

  const visibleCount = [s.pali, s.english, s.vietnamese].filter(Boolean).length;
  document.body.setAttribute('data-flow', visibleCount === 1 ? 'true' : 'false');

  // Language visibility
  document.querySelectorAll('.pali-text').forEach(el => el.style.display = s.pali ? '' : 'none');
  document.querySelectorAll('.eng-text').forEach(el  => el.style.display = s.english ? '' : 'none');
  document.querySelectorAll('.viet-text').forEach(el => el.style.display = s.vietnamese ? '' : 'none');

  // Layout: side-by-side only makes sense when exactly 1 translation is shown alongside pali
  applyLayout(s);
}

function applyLayout(s) {
  const singleTranslation =
    (s.pali && s.english && !s.vietnamese) ||
    (s.pali && !s.english && s.vietnamese);

  document.querySelectorAll('.sentence-row').forEach(row => {
    if (s.layout === 'sidebyside' && singleTranslation) {
      row.classList.add('side-by-side');
    } else {
      row.classList.remove('side-by-side');
    }
  });
}

// ── Populate settings form ────────────────────────────
export function populateSettingsForm(s) {
  document.getElementById('cb-pali').checked       = s.pali;
  document.getElementById('cb-english').checked    = s.english;
  document.getElementById('cb-vietnamese').checked = s.vietnamese;

  document.querySelector(`input[name="layout"][value="${s.layout}"]`).checked = true;
  document.querySelector(`input[name="action-mode"][value="${s.actionButtons || 'line'}"]`).checked = true;

  document.getElementById('color-pali').value = s.paliColor;
  document.getElementById('color-eng').value  = s.engColor;
  document.getElementById('color-viet').value = s.vietColor;
  document.getElementById('color-bg').value   = s.bgColor;

  // Pali script selector
  const sel = document.getElementById('pali-script-select');
  if (sel) sel.value = s.paliScript;

  // Font size
  const fsEl = document.getElementById('range-font-size');
  if (fsEl) { fsEl.value = s.fontSize || 16; _updateFontSizeLabel(fsEl.value); }

  // Action collapse toggle
  const acEl = document.getElementById('cb-action-collapse');
  if (acEl) acEl.checked = !!s.actionCollapse;

  // Cross-book links toggle
  const athaEl = document.getElementById('cb-load-attha');
  if (athaEl) athaEl.checked = s.load_attha ?? true;
}

// ── Read settings from form ───────────────────────────
export function readSettingsForm() {
  return {
    pali:           document.getElementById('cb-pali').checked,
    english:        document.getElementById('cb-english').checked,
    vietnamese:     document.getElementById('cb-vietnamese').checked,
    layout:         document.querySelector('input[name="layout"]:checked')?.value || 'stacked',
    actionButtons:  document.querySelector('input[name="action-mode"]:checked')?.value || 'line',
    paliScript:     document.getElementById('pali-script-select')?.value || Script.RO,
    paliColor:      document.getElementById('color-pali').value,
    engColor:       document.getElementById('color-eng').value,
    vietColor:      document.getElementById('color-viet').value,
    bgColor:        document.getElementById('color-bg').value,
    fontSize:       parseInt(document.getElementById('range-font-size')?.value) || 16,
    actionCollapse: document.getElementById('cb-action-collapse')?.checked || false,
    load_attha:     document.getElementById('cb-load-attha')?.checked ?? true,
  };
}

// ── Internal helper: sync font-size label ─────────────
export function _updateFontSizeLabel(val) {
  const lbl = document.getElementById('font-size-label');
  if (lbl) lbl.textContent = `${val}px`;
}

// ── Build the script <select> options ─────────────────
export function buildScriptOptions(selectEl, currentScript) {
  selectEl.innerHTML = '';
  for (const [key, info] of paliScriptInfo) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${info[0]} — ${info[1]}`;
    if (key === currentScript) opt.selected = true;
    selectEl.appendChild(opt);
  }
}
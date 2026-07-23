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
    translation:    true,
    layout:         'stacked',   // 'stacked' | 'sidebyside'
    paliScript:     Script.RO,   // default Roman
    paliColor:      '#7c2d12',
    transColor:     '#1e3a5f',
    bgColor:        '#faf7f2',
    actionButtons:  'line',      // 'line' | 'para' | 'none'
    fontSize:       16,          // px – applied to #main-content
    actionCollapse: false,       // true = collapse row buttons into a single ⋯ menu
    load_attha:     true,
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
  const root = document.documentElement;
  root.style.setProperty('--pali-color',    s.paliColor);
  root.style.setProperty('--trans-color',   s.transColor);
  root.style.setProperty('--bg',            s.bgColor);
  document.body.style.backgroundColor = s.bgColor;

  const fs = Math.min(Math.max(parseInt(s.fontSize) || 16, 10), 32);
  root.style.setProperty('--reader-font-size', `${fs}px`);
  root.style.setProperty('font-size', `${fs}px`);

  document.querySelector('body').setAttribute('script', s.paliScript);
  document.body.setAttribute('data-ra-mode',     s.actionButtons  || 'line');
  document.body.setAttribute('data-ra-collapse', s.actionCollapse ? 'true' : 'false');

  const visibleCount = [s.pali, s.translation].filter(Boolean).length;
  document.body.setAttribute('data-flow', visibleCount <= 1 ? 'true' : 'false');

  // Language visibility
  document.querySelectorAll('.pali-text').forEach(el => el.style.display = s.pali ? '' : 'none');
  document.querySelectorAll('.translation-text').forEach(el => el.style.display = s.translation ? '' : 'none');

  applyLayout(s);
}

function applyLayout(s) {
  const singleTranslation = s.pali && s.translation;

  document.querySelectorAll('.sentence-row').forEach(row => {
    if (s.layout === 'sidebyside' && singleTranslation) {
      row.classList.add('side-by-side');
    } else {
      row.classList.remove('side-by-side');
    }
  });
}

// ── Helpers for null-safe DOM access ──────────────────
function _setChecked(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = !!value;
}

function _getChecked(id, fallback) {
  const el = document.getElementById(id);
  return el ? el.checked : (fallback ?? false);
}

function _setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function _getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// ── Populate settings form ────────────────────────────
export function populateSettingsForm(s) {
  _setChecked('cb-pali',        s.pali);
  _setChecked('cb-translation', s.translation);

  const layoutRadio = document.querySelector(`input[name="layout"][value="${s.layout}"]`);
  if (layoutRadio) layoutRadio.checked = true;
  const modeRadio = document.querySelector(`input[name="action-mode"][value="${s.actionButtons || 'line'}"]`);
  if (modeRadio) modeRadio.checked = true;

  _setValue('color-pali',  s.paliColor);
  _setValue('color-trans', s.transColor);
  _setValue('color-bg',    s.bgColor);

  const sel = document.getElementById('pali-script-select');
  if (sel) sel.value = s.paliScript;

  const fsEl = document.getElementById('range-font-size');
  if (fsEl) { fsEl.value = s.fontSize || 16; _updateFontSizeLabel(fsEl.value); }

  _setChecked('cb-action-collapse', !!s.actionCollapse);
  _setChecked('cb-load-attha', s.load_attha ?? true);
}

// ── Read settings from form ───────────────────────────
export function readSettingsForm() {
  return {
    pali:           _getChecked('cb-pali'),
    translation:    _getChecked('cb-translation'),
    layout:         document.querySelector('input[name="layout"]:checked')?.value || 'stacked',
    actionButtons:  document.querySelector('input[name="action-mode"]:checked')?.value || 'line',
    paliScript:     document.getElementById('pali-script-select')?.value || Script.RO,
    paliColor:      _getValue('color-pali'),
    transColor:     _getValue('color-trans'),
    bgColor:        _getValue('color-bg'),
    fontSize:       parseInt(document.getElementById('range-font-size')?.value) || 16,
    actionCollapse: _getChecked('cb-action-collapse'),
    load_attha:     _getChecked('cb-load-attha', true),
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

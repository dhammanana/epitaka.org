/**
 * settings.js
 * Manages all user preferences for the E-Piṭaka reader.
 * Exported functions are called by book.js and the settings modal.
 */

import { Script, paliScriptInfo } from './pali-script.js';

export { Script, paliScriptInfo };

// ── Storage key ──────────────────────────────────────
const STORAGE_KEY = 'epitaka_settings_v3';
const THEME_KEY = 'epitaka_theme';

// ── Map translation language codes → matching Pāli script ──────
const LANG_SCRIPT_MAP = {
  si: Script.SI,    // Sinhala → Sinhala script
  hi: Script.HI,    // Hindi → Devanagari
  my: Script.MY,    // Myanmar → Myanmar
  th: Script.THAI,  // Thai → Thai
  lo: Script.LAOS,  // Lao → Lao
  km: Script.KM,    // Khmer → Khmer
  be: Script.BENG,  // Bengali → Bengali
  as: Script.ASSE,  // Assamese → Assamese
  gu: Script.GUJA,  // Gujarati → Gujarati
  te: Script.TELU,  // Telugu → Telugu
  ka: Script.KANN,  // Kannada → Kannada
  mm: Script.MALA,  // Malayalam → Malayalam
  bo: Script.TIBT,  // Tibetan → Tibetan
  cy: Script.CYRL,  // Russian → Cyrillic
  // All others (en, fr, de, etc.) → Roman
};

/**
 * Return the native Pāli script for a translation language code.
 * Falls back to Roman if the language has no specific script mapping.
 */
export function getScriptForLang(lang) {
  return LANG_SCRIPT_MAP[lang] || Script.RO;
}

// ── Defaults ─────────────────────────────────────────
export function defaultSettings() {
  return {
    pali:             true,
    translation:      true,
    layout:           'stacked',   // 'stacked' | 'sidebyside'
    paliScript:       Script.RO,   // default Roman
    paliColor:        '#7c2d12',
    transColor:       '#1e3a5f',
    actionButtons:    'line',      // 'line' | 'para' | 'none'
    fontSize:         22,          // px – applied to #main-content
    actionCollapse:   false,       // true = collapse row buttons into a single ⋯ menu
    load_attha:       true,
    pageSystem:       'vri',       // 'none' | 'vri' | 'pts' | 'myanmar' | 'thai'
    theme:            'system',    // 'light' | 'dark' | 'system'
    scriptManuallySet: false,      // true = user explicitly chose a script in Settings
  };
}

/**
 * Load settings from localStorage, optionally considering the current
 * translation language. When `scriptManuallySet` is false, the Pāli
 * script is derived from the translation language so it always matches.
 * @param {string} [lang] - Current translation language code (e.g. 'si').
 */
export function loadSettings(lang) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const merged = { ...defaultSettings(), ...saved };
    // When the user hasn't explicitly chosen a script, derive it from
    // the translation language so Pāli text matches the reader's language.
    if (!merged.scriptManuallySet && lang) {
      merged.paliScript = getScriptForLang(lang);
    }
    return merged;
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings) {
  const next = { ...settings };
  delete next.bgColor;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/**
 * Called when the user clicks a translation language link.
 * Sets the Pāli script to match the target language and clears
 * the manual flag so the script follows the language going forward.
 * @param {string} lang - Target translation language code (e.g. 'si').
 */
export function onLanguageSelect(lang) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    saved.paliScript = getScriptForLang(lang);
    saved.scriptManuallySet = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* storage unavailable */ }
}

export function getThemePreference() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return ['light', 'dark', 'system'].includes(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function setThemePreference(theme) {
  const value = ['light', 'dark', 'system'].includes(theme) ? theme : 'system';
  try { localStorage.setItem(THEME_KEY, value); } catch {}
  applyTheme(value);
}

export function applyTheme(theme = getThemePreference()) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'system' ? 'light dark' : theme;
}

// ── Apply settings to the DOM ─────────────────────────
export function applySettings(s) {
  const root = document.documentElement;
  applyTheme(getThemePreference());
  const theme = root.dataset.theme;
  const isDark = theme === 'dark' ||
    (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const lightenColor = color => {
    if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
    const channels = color.slice(1).match(/../g).map(value => parseInt(value, 16));
    const amount = isDark ? 0.45 : -0.25;
    return '#' + channels.map(channel => {
      const target = amount > 0 ? 255 : 0;
      return Math.round(channel + (target - channel) * Math.abs(amount))
        .toString(16).padStart(2, '0');
    }).join('');
  };
  root.style.setProperty('--pali-color',    lightenColor(s.paliColor));
  root.style.setProperty('--trans-color',   lightenColor(s.transColor));

  const fs = Math.min(Math.max(parseInt(s.fontSize) || 22, 10), 32);
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

  // Page number system visibility
  const pageSystem = s.pageSystem || 'vri';
  document.querySelectorAll('.page-num-badge').forEach(el => {
    const system = el.dataset.pageSystem;
    el.style.display = (pageSystem !== 'none' && system === pageSystem) ? '' : 'none';
  });

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

  const sel = document.getElementById('pali-script-select');
  if (sel) sel.value = s.paliScript;

  const fsEl = document.getElementById('range-font-size');
  if (fsEl) { fsEl.value = s.fontSize || 22; _updateFontSizeLabel(fsEl.value); }

  _setChecked('cb-action-collapse', !!s.actionCollapse);
  _setChecked('cb-load-attha', s.load_attha ?? true);
  _setValue('page-system-select', s.pageSystem || 'vri');
  _setValue('theme-select', getThemePreference());
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
    fontSize:       parseInt(document.getElementById('range-font-size')?.value) || 22,
    actionCollapse: _getChecked('cb-action-collapse'),
    load_attha:     _getChecked('cb-load-attha', true),
    pageSystem:     _getValue('page-system-select') || 'vri',
    theme:          _getValue('theme-select') || 'system',
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

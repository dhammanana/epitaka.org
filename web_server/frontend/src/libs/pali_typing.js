/**
 * pali_typing.js
 * Helper functions for real-time Pali diacritic input support.
 *
 * Supports two popular input styles:
 *   1. Velthuis scheme     (aa → ā, .t → ṭ, .m → ṃ, .n → ṅ, etc.)
 *   2. Deadkey/semicolon style  (;a → ā, ;t → ṭ, ;n → ñ / ṅ, etc.)
 *
 * Usage:
 *   import { installPaliInput } from './pali_typing.js';
 *
 *   // Simple – Velthuis only
 *   installPaliInput(searchInputElement);
 *
 *   // With options
 *   installPaliInput(searchInputElement, {
 *     mode: 'both',           // 'velthuis' | 'deadkey' | 'both'
 *     onConvert: (normalized) => { /* optional extra processing * / }
 *   });
 */

const VELTHUIS_MAP = [
  // Vowels – long forms by doubling
  { pat: /aa/gi,  rep: match => match === 'aa' ? 'ā' : 'Ā' },
  { pat: /ii/gi,  rep: match => match === 'ii' ? 'ī' : 'Ī' },
  { pat: /uu/gi,  rep: match => match === 'uu' ? 'ū' : 'Ū' },

  // Consonants – dot or tilde / quotes
  { pat: /\.t/gi, rep: match => match === '.t' ? 'ṭ' : 'Ṭ' },
  { pat: /\.d/gi, rep: match => match === '.d' ? 'ḍ' : 'Ḍ' },
  { pat: /\.n/gi, rep: match => match === '.n' ? 'ṇ' : 'Ṇ' },
  { pat: /\.m/gi, rep: match => match === '.m' ? 'ṃ' : 'Ṃ' },
  { pat: /\.l/gi, rep: match => match === '.l' ? 'ḷ' : 'Ḷ' },
  { pat: /\.s/gi, rep: match => match === '.s' ? 'ṣ' : 'Ṣ' },   // retroflex s (less common in Pali)

  // ñ (often written ~n or "n or ñ directly)
  { pat: /~n/g,   rep: 'ñ' },
  { pat: /~N/g,   rep: 'Ñ' },
  { pat: /"n/gi,  rep: match => match === '"n' ? 'ṅ' : 'Ṅ' },   // sometimes used

  // rarer / alternate forms
  { pat: /"s/gi,  rep: match => match === '"s' ? 'ś' : 'Ś' },
];

/**
 * Convert Velthuis-style ASCII to Unicode Pali
 * @param {string} text
 * @returns {string}
 */
function convertVelthuisToUnicode(text) {
  let result = text;
  for (const { pat, rep } of VELTHUIS_MAP) {
    result = result.replace(pat, (m) => typeof rep === 'function' ? rep(m) : rep);
  }
  return result;
}

/**
 * Convert semicolon-deadkey style to Unicode
 * ;a → ā    ;A → Ā
 * ;t → ṭ    ;T → Ṭ
 * ;n → ñ    ;N → Ñ     (most common convention for ñ)
 * ;m → ṃ    ;M → Ṃ
 * ;d → ḍ    etc.
 *
 * @param {string} text
 * @returns {string}
 */
function convertDeadkeySemicolon(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === ';' && i + 1 < text.length) {
      const ch = text[i + 1];
      const lower = ch.toLowerCase();
      const isUpper = ch !== lower;

      let repl = null;  // null = not handled → keep ; + ch

      switch (lower) {
        case 'a': repl = isUpper ? 'Ā' : 'ā'; break;
        case 'i': repl = isUpper ? 'Ī' : 'ī'; break;
        case 'u': repl = isUpper ? 'Ū' : 'ū'; break;
        case 't': repl = isUpper ? 'Ṭ' : 'ṭ'; break;
        case 'd': repl = isUpper ? 'Ḍ' : 'ḍ'; break;
        case 'n': repl = isUpper ? 'Ñ' : 'ñ'; break;     // most common: ;n → ñ / Ñ
        case 'm': repl = isUpper ? 'Ṃ' : 'ṃ'; break;
        case 'l': repl = isUpper ? 'Ḷ' : 'ḷ'; break;
        case 's': repl = isUpper ? 'Ś' : 'ś'; break;     // ś — palatal s
        // case 's': repl = isUpper ? 'Ṣ' : 'ṣ'; break;  // ṣ — retroflex s (uncomment if preferred)
        case 'k': repl = isUpper ? 'Ṅ' : 'ṅ'; break;     // ;k → ṅ (common alternate)
        case 'j': repl = isUpper ? 'Ñ' : 'ñ'; break;     // ;j → ñ (if you prefer this over ;n)
      }

      if (repl !== null) {
        // supported → use replacement
        result += repl;
        i += 2;
      } else {
        // not supported → keep ; and the next character
        result += ';' + ch;
        i += 2;
      }
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

/**
 * Apply selected conversion(s) to text
 * @param {string} text
 * @param {'velthuis' | 'deadkey' | 'both'} mode
 * @returns {string}
 */
function normalizePaliInput(text, mode = 'velthuis') {
  let result = text;

  if (mode === 'velthuis' || mode === 'both') {
    result = convertVelthuisToUnicode(result);
  }
  if (mode === 'deadkey' || mode === 'both') {
    result = convertDeadkeySemicolon(result);
  }

  return result;
}

/**
 * Install Pali typing helper on an input/textarea element
 *
 * @param {HTMLInputElement | HTMLTextAreaElement} elm
 * @param {object} [options]
 * @param {'velthuis'|'deadkey'|'both'} [options.mode='velthuis']
 * @param {(normalized: string) => void} [options.onConvert]
 * @param {number} [options.cursorRestoreDelta=0]  // try to improve cursor position
 */
export function installPaliInput(elm, options = {}) {
  const {
    mode = 'velthuis',
    onConvert = null,
    cursorRestoreDelta = 0,   // can be tweaked if cursor jumps annoy user
  } = options;

  let composing = false;

  const handler = () => {
    if (composing) return;

    const start = elm.selectionStart;
    const end   = elm.selectionEnd;
    const raw   = elm.value;

    const normalized = normalizePaliInput(raw, mode);

    if (normalized === raw) return;

    composing = true;  // prevent recursion

    const oldLen = raw.length;
    const newLen = normalized.length;

    elm.value = normalized;

    // Try to keep cursor roughly in place
    let newPos = start;
    if (start === end && start === oldLen) {
      // was at end → stay at end
      newPos = newLen;
    } else {
      // heuristic – adjust roughly by length difference
      const delta = newLen - oldLen;
      newPos = Math.min(Math.max(0, start + delta + cursorRestoreDelta), newLen);
    }

    elm.setSelectionRange(newPos, newPos);

    composing = false;

    if (onConvert) onConvert(normalized);
  };

  elm.addEventListener('input', handler);

  // Optional: also handle composition events (better IME support)
  elm.addEventListener('compositionstart', () => { composing = true; });
  elm.addEventListener('compositionend',   () => { composing = false; handler(); });

  // Return remover if needed
  return () => {
    elm.removeEventListener('input', handler);
    elm.removeEventListener('compositionstart', () => {});
    elm.removeEventListener('compositionend',   () => {});
  };
}

// ── Quick usage example (for copy-paste testing) ──────────────────────
//
// const input = document.querySelector('#searchInput');
// installPaliInput(input, { mode: 'both' });
//
// Try typing:
//   dhamma.m      → dhammaṃ     (Velthuis)
//   su;taa        → sutā
//   pi.ti.        → piṭi
//   vi~n~naa.na   → viññāṇa


export function removeDiacritics(str) {
  return str
    .normalize("NFD")                     // decompose: ā → a + combining macron, ṃ → m + combining dot below, etc.
    .replace(/[\u0300-\u036f]/g, "");    // remove all combining diacritical marks
}
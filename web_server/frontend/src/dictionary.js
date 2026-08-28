import { TextProcessor, Script } from './pali-script.js';
import { loadSettings } from './settings.js';
import { installPaliInput } from './libs/pali_typing.js';
import './css/dictionary.css';

const { bookId, baseUrl, bookref } = window.BOOK_CONFIG;

// ── DOM refs — resolved lazily after sidebar builds the DOM ──────
let dictWordInput, dictSuggestions, dictResults;
let initialized = false;

let suggestAbortController = null;
let activeSuggestionIndex  = -1;

export function setDictOpen(open) {
  // Dict is now a sidebar panel — the sidebar handles open/close.
  // This function is kept for backward compat but is now a no-op.
}

/**
 * Initialize the dictionary module. Must be called AFTER sidebar.buildDom()
 * so that #dict-word-input, #dict-suggestions, and #dict-results exist.
 */
export function initDictionary() {
  if (initialized) return;
  initialized = true;

  dictWordInput   = document.getElementById('dict-word-input');
  dictSuggestions = document.getElementById('dict-suggestions');
  dictResults     = document.getElementById('dict-results');

  if (!dictWordInput) {
    console.warn('[dict] #dict-word-input not found — sidebar may not have rendered yet');
    return;
  }

  installPaliInput(dictWordInput, { mode: 'both' });

  dictWordInput.addEventListener('input', () => {
    const q = dictWordInput.value.trim();
    activeSuggestionIndex = -1;
    if (!q) { hideSuggestions(); return; }
    fetchSuggestions(q);
  });

  dictWordInput.addEventListener('keydown', e => {
    const items = dictSuggestions.querySelectorAll('.dict-suggestion-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
      updateActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, -1);
      updateActiveSuggestion(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && items[activeSuggestionIndex]) {
        selectSuggestion(items[activeSuggestionIndex].dataset.word);
      } else {
        selectSuggestion(dictWordInput.value.trim());
      }
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.sb-dict-header') && e.target !== dictWordInput) {
      hideSuggestions();
    }
  });
}

export function attachPaliClickListeners(root) {
  root.querySelectorAll('.sentence-row .pali-text').forEach(el => {
    if (!el.hasAttribute('title')) {
      el.setAttribute('title', 'Click a word to look it up in the dictionary');
    }
    el.addEventListener('click', onPaliClick);
  });
}

function onPaliClick(e) {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) return;

  const word = getWordAtPoint(e);
  if (!word) return;

  const s = loadSettings();
  let romanWord = word;
  if (s.paliScript !== Script.RO) {
    const sinhWord = TextProcessor.convertFrom(word, s.paliScript);
    romanWord = TextProcessor.convert(sinhWord, Script.RO);
  }
  romanWord = romanWord.trim().replace(/[.,;:!?()[\]{}'"]/g, '').toLowerCase();
  if (!romanWord) return;

  openDictionary(romanWord);
}

function openDictionary(word) {
  if (!dictWordInput) return;
  dictWordInput.value = word;
  hideSuggestions();
  // Click the sidebar's dict activity button to open the panel
  const dictBtn = document.querySelector('#sb-activity .sb-activity-btn[data-panel="dict"]');
  if (dictBtn) dictBtn.click();
  lookupDictionary(word);
}

async function lookupDictionary(word) {
  if (!word || !dictResults) return;
  dictResults.innerHTML = '<div class="dict-loading">Looking up…</div>';

  try {
    const res  = await fetch(`${baseUrl}/api/dictionary?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    renderDictResults(data);
  } catch {
    dictResults.innerHTML = '<div class="dict-error">Lookup failed.</div>';
  }
}

// ── Autocomplete suggestions ──────────────────────────────────────

async function fetchSuggestions(query) {
  if (suggestAbortController) suggestAbortController.abort();
  suggestAbortController = new AbortController();

  try {
    const res  = await fetch(
      `${baseUrl}/api/suggest_word?q=${encodeURIComponent(query)}`,
      { signal: suggestAbortController.signal }
    );
    const data = await res.json();
    renderSuggestions(data);
  } catch (err) {
    if (err.name !== 'AbortError') hideSuggestions();
  }
}

function renderSuggestions(items) {
  if (!items?.length || !dictSuggestions) { hideSuggestions(); return; }

  dictSuggestions.innerHTML = items.map(item => `
    <li class="dict-suggestion-item"
        role="option"
        data-word="${item}"
        tabindex="-1">
      <span class="suggest-word pali-text">${item}</span>
    </li>
  `).join('');

  dictSuggestions.querySelectorAll('.dict-suggestion-item').forEach(li => {
    li.addEventListener('mousedown', e => {
      e.preventDefault();
      selectSuggestion(li.dataset.word);
    });
  });

  dictSuggestions.classList.add('open');
}

function updateActiveSuggestion(items) {
  items.forEach((li, i) => li.classList.toggle('active', i === activeSuggestionIndex));
  if (activeSuggestionIndex >= 0) {
    items[activeSuggestionIndex]?.scrollIntoView({ block: 'nearest' });
  }
}

function selectSuggestion(word) {
  if (!word || !dictWordInput) return;
  dictWordInput.value = word;
  hideSuggestions();
  lookupDictionary(word);
}

function hideSuggestions() {
  if (dictSuggestions) {
    dictSuggestions.innerHTML = '';
    dictSuggestions.classList.remove('open');
  }
  activeSuggestionIndex = -1;
}

// ── Render dictionary results ─────────────────────────────────────

function renderDictResults(data) {
  if (!data?.length || !dictResults) {
    if (dictResults) dictResults.innerHTML = `<p class="dict-empty">No results found.</p>`;
    return;
  }

  let html = '';
  let lastBook = null;

  for (const entry of data) {
    if (entry.type === 'deconstruction') {
      html += `<div class="dict-book-group">
        <div class="dict-book-name">${entry.book_name}</div>
        ${buildDeconstructionHtml(entry)}
      </div>`;
      continue;
    }

    if (entry.book_name !== lastBook) {
      if (lastBook) html += '</div>';
      html += `<div class="dict-book-group">
        <div class="dict-book-name">${entry.book_name}</div>`;
      lastBook = entry.book_name;
    }

    html += `<div class="dict-entry">
      <div class="dict-entry-word">${entry.word}</div>
      <div class="dict-entry-def">${entry.definition}</div>
      ${buildUsagesHtml(entry.usages || [])}
    </div>`;
  }

  if (lastBook) html += '</div>';
  dictResults.innerHTML = html;

  // Bind click handlers for component word chips
  dictResults.querySelectorAll('.decon-part').forEach(el => {
    const word = el.dataset.word;
    if (word) {
      el.addEventListener('click', e => {
        e.stopPropagation();
        selectSuggestion(word);
      });
    }
  });
}

function buildDeconstructionHtml(entry) {
  const components = entry.components || [];
  if (!components.length) return '';

  const partsHtml = components.map((part, i) => {
    const isLast = i === components.length - 1;
    return `
      <span class="decon-part" data-word="${escHtml(part)}" tabindex="0" role="button">
        <span class="decon-part-word">${escHtml(part)}</span>
      </span>
      ${!isLast ? '<span class="decon-plus">+</span>' : ''}`;
  }).join('');

  return `<div class="decon-card">
    <div class="decon-formula">
      <span class="decon-original-word">${escHtml(entry.word)}</span>
      <span class="decon-arrow">→</span>
      <span class="decon-breakdown">${partsHtml}</span>
    </div>
  </div>`;
}

function buildUsagesHtml(usages) {
  if (!usages.length) return '';

  const cards = usages.map(u => {
    const surface  = u.word + (u.ending || '');
    const paliHtml = highlightInflected(u.pali || '', surface);
    const trans    = u.translation;

    return `<div class="dict-usage">
      <div class="dict-usage-pali">${paliHtml}</div>
      ${trans ? `<div class="dict-usage-trans">${escHtml(trans)}</div>` : ''}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${escHtml(u.book_name)}</span>
        <a class="dict-usage-open" href="${escHtml(u.reader_url)}" target="_blank" rel="noopener">↗</a>
      </div>
    </div>`;
  }).join('');

  return `<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${cards}
  </div>`;
}

function highlightInflected(sentence, surface) {
  if (!surface || !sentence) return escHtml(sentence);
  const idx = sentence.toLowerCase().indexOf(surface.toLowerCase());
  if (idx === -1) return escHtml(sentence);
  return escHtml(sentence.slice(0, idx))
    + `<mark>${escHtml(sentence.slice(idx, idx + surface.length))}</mark>`
    + escHtml(sentence.slice(idx + surface.length));
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Get word at cursor ────────────────────────────────────────────

export function getWordAtPoint(e) {
  if (!document.caretRangeFromPoint) return null;
  const range = document.caretRangeFromPoint(e.clientX, e.clientY);
  if (!range) return null;

  const node = range.startContainer;
  const offset = range.startOffset;

  if (node.nodeType !== Node.TEXT_NODE) return null;

  const fullText = node.textContent;
  const lang = node.parentElement?.closest('[lang]')?.getAttribute('lang') || 'en';
  const script = node.parentElement?.closest('[data-script]')?.getAttribute('data-script') || null;

  return extractWordAt(fullText, offset, lang, script);
}

function extractWordAt(text, offset, lang, script) {
  const spaceDelimitedScripts = ['ro', 'si', 'hi', 'be', 'as', 'gm', 'gj', 'te', 'ka', 'mm', 'tb', 'cy', 'br'];
  const spaceDelimitedLangs   = ['en', 'in', 'es', 'pt', 'hi', 'si', 'ch'];

  const isSpaceDelimited = spaceDelimitedLangs.includes(lang) || spaceDelimitedScripts.includes(script);

  if (isSpaceDelimited) {
    return extractByWhitespace(text, offset);
  }

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return extractBySegmenter(text, offset, lang);
  }

  return extractByScriptRange(text, offset);
}

function extractByWhitespace(text, offset) {
  const wordBoundary = /[\s\u200b\u00a0।॥၊။,\.\!\?;:\"\'()\[\]{}<>\/\\]/;
  const ch = text[offset];
  if (ch === undefined || wordBoundary.test(ch)) return null;

  let start = offset;
  let end = offset;

  while (start > 0 && !wordBoundary.test(text[start - 1])) start--;
  while (end < text.length && !wordBoundary.test(text[end])) end++;

  return text.slice(start, end).trim() || null;
}

function extractBySegmenter(text, offset, lang) {
  const langMap = {
    th: 'th', my: 'my', lo: 'lo', km: 'km',
    tt: 'th', en: 'en', hi: 'hi', si: 'si', be: 'bn',
    as: 'as', gm: 'pa', gj: 'gu', te: 'te',
    ka: 'kn', mm: 'ml', tb: 'bo', cy: 'ru',
  };
  const locale = langMap[lang] || lang;

  try {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    const segments = [...segmenter.segment(text)];

    for (const seg of segments) {
      const segStart = seg.index;
      const segEnd   = seg.index + seg.segment.length;
      if (offset >= segStart && offset <= segEnd) {
        if (seg.isWordLike === false) return null;
        return seg.segment.trim() || null;
      }
    }
  } catch { /* fall through */ }

  return extractByScriptRange(text, offset);
}

function extractByScriptRange(text, offset) {
  const scriptRanges = [
    [0x0E00, 0x0E7F], [0x0E80, 0x0EFF], [0x1000, 0x109F],
    [0x1780, 0x17FF], [0x1A20, 0x1AAF],
  ];

  function isScriptChar(ch) {
    const cp = ch.codePointAt(0);
    return scriptRanges.some(([lo, hi]) => cp >= lo && cp <= hi);
  }

  const ch = text[offset];
  if (ch === undefined || !isScriptChar(ch)) return null;

  let start = offset;
  let end   = offset;

  while (start > 0 && isScriptChar(text[start - 1])) start--;
  while (end < text.length && isScriptChar(text[end]))  end++;

  return text.slice(start, end).trim() || null;
}

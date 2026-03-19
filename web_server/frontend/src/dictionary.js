import { TextProcessor, Script } from './pali-script.js';
import { loadSettings } from './settings.js';
import { installPaliInput } from './libs/pali_typing.js';
import './css/dictionary.css';

const { bookId, baseUrl, bookref } = window.BOOK_CONFIG;
console.log(window.BOOK_CONFIG)

const dictWordInput   = document.getElementById('dict-word-input');
const dictSuggestions = document.getElementById('dict-suggestions');
const dictPanel     = document.getElementById('dict-panel');
const dictClose     = document.getElementById('dict-close');
const dictWord      = document.getElementById('dict-word');
const dictResults   = document.getElementById('dict-results');


let suggestAbortController = null;
let activeSuggestionIndex  = -1;

export function attachPaliClickListeners(root) {
  root.querySelectorAll('.sentence-row .pali-text').forEach(el => {
    el.addEventListener('click', onPaliClick);
  });
}

function onPaliClick(e) {
  const selection = window.getSelection();
  let word = selection?.toString().trim();
  if (!word) word = getWordAtPoint(e);
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
  dictWordInput.value = word;
  hideSuggestions();
  dictPanel.classList.add('open');
  lookupDictionary(word);
}

async function lookupDictionary(word) {
  if (!word) return;
  dictResults.innerHTML = '<div class="dict-loading">Looking up…</div>';

  try {
    const res  = await fetch(`${baseUrl}/api/dictionary?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    renderDictResults(data);
  } catch {
    dictResults.innerHTML = '<div class="dict-error">Lookup failed.</div>';
  }
}

// ── Autocomplete suggestions ──────────────────────────────────────────────

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
  if (!e.target.closest('#dict-word-wrapper')) hideSuggestions();
});

async function fetchSuggestions(query) {
  // Cancel any in-flight request
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
  if (!items?.length) { hideSuggestions(); return; }

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
      e.preventDefault(); // prevent input blur before click fires
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
  if (!word) return;
  dictWordInput.value = word;
  hideSuggestions();
  lookupDictionary(word);
}

function hideSuggestions() {
  dictSuggestions.innerHTML = '';
  dictSuggestions.classList.remove('open');
  activeSuggestionIndex = -1;
}


function renderDictResults(data) {
  if (!data?.length) {
    dictResults.innerHTML = `<p class="dict-empty">No results found.</p>`;
    return;
  }

  let html = '';
  let lastBook = null;

  for (const entry of data) {
    if (entry.book_name !== lastBook) {
      if (lastBook) html += '</div>'; // close prev dict-book-group
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
}


// ── Usage cards ───────────────────────────────────────────────────────────────

function buildUsagesHtml(usages) {
  if (!usages.length) return '';

  const cards = usages.map(u => {
    const surface  = u.word + (u.ending || '');
    const paliHtml = highlightInflected(u.pali || '', surface);
    const settings = loadSettings();
    const trans    = settings.vietnamese ? u.vietnamese : u.english;

    return `<div class="dict-usage">
      <div class="dict-usage-pali">${paliHtml}</div>
      ${trans ? `<div class="dict-usage-trans">${escHtml(trans)}</div>` : ''}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${escHtml(u.book_name)}</span>
        <a class="dict-usage-open" href="${escHtml(u.reader_url)}" target="_blank" rel="noopener">
          ↗
        </a>
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
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

dictClose?.addEventListener('click', () => dictPanel.classList.remove('open'));

// Close dict panel when clicking outside
document.addEventListener('click', e => {
  if (dictPanel.classList.contains('open') &&
      !dictPanel.contains(e.target) &&
      !e.target.closest('.pali-text')) {
    dictPanel.classList.remove('open');
  }
});


//-----------------------------
// Get word at the cursor
//-----------------------------

export function getWordAtPoint(e) {
  if (!document.caretRangeFromPoint) return null;
  const range = document.caretRangeFromPoint(e.clientX, e.clientY);
  if (!range) return null;

  const node = range.startContainer;
  const offset = range.startOffset;

  // Only works on text nodes
  if (node.nodeType !== Node.TEXT_NODE) return null;

  const fullText = node.textContent;
  const lang = node.parentElement?.closest('[lang]')?.getAttribute('lang') || 'en';
  const script = node.parentElement?.closest('[data-script]')?.getAttribute('data-script') || null;

  return extractWordAt(fullText, offset, lang, script);
}

function extractWordAt(text, offset, lang, script) {
  // Scripts that use spaces as word boundaries (Roman, Devanagari, Sinhala, etc.)
  const spaceDelimitedScripts = ['ro', 'si', 'hi', 'be', 'as', 'gm', 'gj', 'te', 'ka', 'mm', 'tb', 'cy', 'br'];
  const spaceDelimitedLangs   = ['en', 'in', 'es', 'pt', 'hi', 'si', 'ch'];

  const isSpaceDelimited = spaceDelimitedLangs.includes(lang) || spaceDelimitedScripts.includes(script);

  if (isSpaceDelimited) {
    // Standard approach: find boundaries by whitespace/punctuation
    return extractByWhitespace(text, offset);
  }

  // For non-space-delimited scripts: Thai, Lao, Myanmar, Khmer, Tai Tham
  // Try Intl.Segmenter first (Chrome 87+, Firefox 126+, Safari 16.4+)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return extractBySegmenter(text, offset, lang);
  }

  // Fallback: grab the full "run" of script characters around the caret
  return extractByScriptRange(text, offset);
}

function extractByWhitespace(text, offset) {
  const wordBoundary = /[\s\u200b\u00a0।॥၊။,\.!\?;:"'()\[\]{}<>\/\\]/;
  let start = offset;
  let end = offset;

  while (start > 0 && !wordBoundary.test(text[start - 1])) start--;
  while (end < text.length && !wordBoundary.test(text[end])) end++;

  return text.slice(start, end).trim() || null;
}

function extractBySegmenter(text, offset, lang) {
  // Map our lang codes to BCP 47 tags for Intl.Segmenter
  const langMap = {
    th: 'th', my: 'my', lo: 'lo', km: 'km',
    tt: 'th', // Tai Tham - use Thai segmenter as closest
    en: 'en', hi: 'hi', si: 'si', be: 'bn',
    as: 'as', gm: 'pa', gj: 'gu', te: 'te',
    ka: 'kn', mm: 'ml', tb: 'bo', cy: 'ru',
  };
  const locale = langMap[lang] || lang;

  try {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    const segments = [...segmenter.segment(text)];

    // Find the segment that contains our caret offset
    for (const seg of segments) {
      const segStart = seg.index;
      const segEnd   = seg.index + seg.segment.length;
      if (offset >= segStart && offset <= segEnd) {
        // isWordLike filters out punctuation/whitespace segments
        if (seg.isWordLike === false) return null;
        return seg.segment.trim() || null;
      }
    }
  } catch (err) {
    // Segmenter failed for this locale, fall through
  }

  return extractByScriptRange(text, offset);
}

function extractByScriptRange(text, offset) {
  // Unicode ranges for non-space-delimited scripts
  const scriptRanges = [
    [0x0E00, 0x0E7F],   // Thai
    [0x0E80, 0x0EFF],   // Lao
    [0x1000, 0x109F],   // Myanmar
    [0x1780, 0x17FF],   // Khmer
    [0x1A20, 0x1AAF],   // Tai Tham
    [0x1000, 0x109F],   // Myanmar extended
  ];

  function isScriptChar(ch) {
    const cp = ch.codePointAt(0);
    return scriptRanges.some(([lo, hi]) => cp >= lo && cp <= hi);
  }

  let start = offset;
  let end   = offset;

  while (start > 0 && isScriptChar(text[start - 1])) start--;
  while (end < text.length && isScriptChar(text[end]))  end++;

  return text.slice(start, end).trim() || null;
}
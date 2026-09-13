/**
 * pali-text.js
 * Single owner of Pāli transliteration for the whole frontend.
 *
 * Every Pāli string in the UI carries the `.pali-text` class (plus
 * `.book-link-badge` for cross-book link chips) in its original Roman
 * spelling. This module converts those nodes to the user's chosen script
 * and keeps them converted no matter when they are rendered:
 *
 *   - `applyPaliScript()` converts everything currently in the DOM.
 *   - A MutationObserver converts nodes added later (async library tree,
 *     search results, dialogs, suggestions, …) — no per-call-site hooks.
 *
 * The Roman original is cached per element, so switching scripts back and
 * forth never double-converts, and a `data-pali-script` marker skips nodes
 * that are already in the requested script.
 */

import { TextProcessor, Script } from './pali-script.js';

export const PALI_TEXT_SELECTOR = '.pali-text, .book-link-badge';

// Roman originals, remembered per element so re-conversion is always clean.
const originals = new WeakMap();
let observing = false;

/** Currently active script, mirrored from `body[script]` by applySettings(). */
export function currentPaliScript() {
  return document.body?.getAttribute('script') || Script.RO;
}

function convertHtmlPali(html, script) {
  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    return TextProcessor.convert(TextProcessor.convertFromMixed(text), script);
  });
}

export function transliterateElement(el, script = currentPaliScript()) {
  if (!(el instanceof Element)) return;
  if (el.dataset.paliScript === script) return;
  if (!originals.has(el)) originals.set(el, el.innerHTML);
  const roman = originals.get(el);
  el.innerHTML = script === Script.RO ? roman : convertHtmlPali(roman, script);
  el.dataset.paliScript = script;
}

/** Convert all matching nodes under `root` (root itself included). */
export function applyPaliScript(script = currentPaliScript(), root = document) {
  if (root instanceof Element && root.matches(PALI_TEXT_SELECTOR)) {
    transliterateElement(root, script);
  }
  root.querySelectorAll?.(PALI_TEXT_SELECTOR).forEach(el => transliterateElement(el, script));
}

/**
 * Sweep once, then watch for future nodes. Idempotent — safe to call from
 * every entry point. MutationObserver callbacks run before repaint, so
 * late-rendered content never flashes in the wrong script.
 */
export function observePaliScript() {
  applyPaliScript();
  if (observing || typeof MutationObserver === 'undefined' || !document.body) return;
  observing = true;
  new MutationObserver(mutations => {
    const script = currentPaliScript();
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(PALI_TEXT_SELECTOR)) transliterateElement(node, script);
        node.querySelectorAll(PALI_TEXT_SELECTOR).forEach(el => transliterateElement(el, script));
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Auto-start on import so every bundle (reader, landing, sidebar, dialogs)
// is covered without per-page wiring.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => observePaliScript(), { once: true });
  } else {
    observePaliScript();
  }
}

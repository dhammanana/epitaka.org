/**
 * libs/clipboard.js
 * Cross-device reliable text copying to clipboard.
 *
 * Works well on:
 * - Desktop (Chrome, Firefox, Safari, Edge)
 * - iOS Safari
 * - Android Chrome / Samsung Internet / Firefox
 * - Most modern WebViews
 *
 * Features:
 * - Tries modern Clipboard API first (supports rich text if needed)
 * - Falls back to textarea + document.execCommand('copy') for maximum compatibility
 * - Handles mobile focus/selection quirks
 * - Secure context check
 *
 * Usage:
 *   import { copyToClipboard } from './libs/clipboard.js';
 *
 *   copyToClipboard("My text to copy", {
 *     successMessage: "Copied ✓",
 *     errorMessage:   "Copy failed – please copy manually"
 *   });
 */

export async function copyToClipboard(text, options = {}) {
  const {
    successMessage = "Copied ✓",
    errorMessage   = "Copy failed – please select & copy manually",
    toast          = null,
  } = options;

  // ── 1. Modern Clipboard API (desktop Chrome/Firefox/Edge, Android Chrome 66+) ──
  // Must be called synchronously within the user-gesture stack.
  // We intentionally do NOT await anything before this call.
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (toast) toast(successMessage);
      else console.log(successMessage);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed:", err);
      // fall through
    }
  }

  // ── 2. execCommand fallback (older Android WebViews, Samsung Internet, iOS < 13.4) ──
  // Create a textarea that is visible and in the viewport so mobile browsers
  // allow selection (opacity:0 + pointer-events:none blocks selection on some
  // Android versions – we use a transparent overlay instead).
  const textarea = document.createElement("textarea");
  Object.assign(textarea.style, {
    position    : "fixed",
    top         : "0",
    left        : "0",
    width       : "1px",
    height      : "1px",
    fontSize    : "16px",   // prevents iOS zoom on focus
    border      : "none",
    outline     : "none",
    background  : "transparent",
    color       : "transparent",
    caretColor  : "transparent",
  });
  textarea.setAttribute("readonly", "");   // prevents soft-keyboard popping up
  textarea.value = text;

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (err) {
    console.warn("execCommand('copy') failed:", err);
  }
  document.body.removeChild(textarea);

  if (success) {
    if (toast) toast(successMessage);
    else console.log(successMessage);
    return true;
  }

  // ── 3. Last resort: show a modal so the user can copy manually ──
  _showManualCopyModal(text);
  return false;
}

/**
 * Show a modal overlay containing the text pre-selected so the user
 * can long-press → Copy on Android or Cmd/Ctrl+C on desktop.
 */
function _showManualCopyModal(text) {
  // Remove any stale modal
  document.getElementById("_cb-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "_cb-modal";
  Object.assign(overlay.style, {
    position        : "fixed",
    inset           : "0",
    zIndex          : "999999",
    background      : "rgba(0,0,0,0.55)",
    display         : "flex",
    alignItems      : "center",
    justifyContent  : "center",
    padding         : "16px",
    boxSizing       : "border-box",
  });

  overlay.innerHTML = `
    <div style="
      background:#fff; color:#111; border-radius:12px;
      padding:20px; width:100%; max-width:480px;
      box-shadow:0 8px 32px rgba(0,0,0,.35); font-family:sans-serif;
    ">
      <p style="margin:0 0 10px; font-size:15px; font-weight:600;">
        Tap &amp; hold the text below, then choose <em>Copy</em>:
      </p>
      <textarea readonly style="
        width:100%; box-sizing:border-box; height:120px;
        font-size:14px; line-height:1.5; padding:8px;
        border:1px solid #ccc; border-radius:6px;
        resize:none; background:#f9f9f9; color:#111;
      ">${text.replace(/</g,"&lt;")}</textarea>
      <button id="_cb-close" style="
        margin-top:12px; width:100%; padding:10px;
        background:#4a90e2; color:#fff; border:none;
        border-radius:8px; font-size:15px; cursor:pointer;
      ">Close</button>
    </div>`;

  document.body.appendChild(overlay);

  // Auto-select the textarea so on desktop Ctrl+C works immediately
  const ta = overlay.querySelector("textarea");
  setTimeout(() => { ta.focus(); ta.select(); }, 50);

  const close = () => overlay.remove();
  overlay.querySelector("#_cb-close").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
}

// Optional: if you want to support rich text / multiple formats in the future
// (Clipboard API only – fallback stays plain text)
export async function copyRichText(richText, plainFallback, options = {}) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plainFallback || richText], { type: "text/plain" }),
          // Add "text/html" if you have HTML version
          // "text/html": new Blob([richText], { type: "text/html" }),
        })
      ]);
      if (options.toast) options.toast(options.successMessage || "Copied ✓");
      return true;
    } catch (err) {
      console.warn("Rich clipboard failed:", err);
    }
  }

  // Fall back to plain text copy
  return copyToClipboard(plainFallback || richText, options);
}
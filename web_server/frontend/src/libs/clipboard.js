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
    toast          = null,                  // optional: your toast function
  } = options;

  // Prefer modern Clipboard API when available and in secure context
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (toast) toast(successMessage);
      else console.log(successMessage);
      return true;
    } catch (err) {
      console.warn("Clipboard API failed:", err);
      // continue to fallback
    }
  }

  // Fallback: create a temporary textarea (most reliable on Android/iOS)
  const textarea = document.createElement("textarea");

  // Position off-screen but focusable (helps mobile browsers)
  textarea.style.position = "fixed";
  textarea.style.top      = "0";
  textarea.style.left     = "0";
  textarea.style.opacity  = "0";
  textarea.style.pointerEvents = "none";
  textarea.value = text;

  document.body.appendChild(textarea);

  // Force focus and selection (critical for mobile!)
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, 999999); // Extra safety for iOS & some Android

  let success = false;

  try {
    success = document.execCommand("copy");
  } catch (err) {
    console.warn("execCommand('copy') failed:", err);
  }

  // Clean up immediately
  document.body.removeChild(textarea);

  if (success) {
    if (toast) toast(successMessage);
    else console.log(successMessage);
    return true;
  }

  // Failure path
  if (toast) toast(errorMessage);
  else console.warn(errorMessage);
  return false;
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
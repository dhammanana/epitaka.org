/**
 * libs/sidebar-state.js
 * Persist the book-page sidebar's search state (query, type, filters) in
 * sessionStorage so that after a full page load — e.g. clicking a search
 * result, which navigates to a new book URL — the sidebar can restore the
 * results. This lets users click through search results one after another.
 *
 * Shape:
 *   { panel: 'search', search: { typeId, query, pitakas: [], layers: [] } }
 */

const KEY = 'epitaka_sidebar_state';

export function saveSidebarSearchState(state) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — ignore */
  }
}

export function loadSidebarSearchState() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSidebarSearchState() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/* ── Pin (keep sidebar open across page loads) ───────────────
   Stored in localStorage (survives full page loads; sessionStorage would
   be lost on the first navigation away). */

const PIN_KEY = 'epitaka_sidebar_pin';

export function saveSidebarPin(state) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadSidebarPin() {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSidebarPin() {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {
    /* ignore */
  }
}

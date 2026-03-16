/**
 * library-ui.js
 * ─────────────────────────────────────────────────────────────
 * Renders the "My Library" full-screen dialog accessible from
 * the profile dropdown.  Four tabs:
 *   📚 History   – reading positions per book
 *   🔖 Bookmarks – bookmarked sentences
 *   📝 Notes     – private sentence notes
 *   💬 Comments  – public comments written by user
 *
 * export initLibraryUI()  — call once at startup
 * export showLibraryDialog()
 */

import { auth }      from '../auth/auth.js';
import { authFetch } from '../auth/auth.js';
import '../css/extras.css'

const { baseUrl } = window.BOOK_CONFIG;

// ── Inject HTML shell once ────────────────────────────────────
function _injectShell() {
  if (document.getElementById('lib-dialog')) return;
  document.body.insertAdjacentHTML('beforeend', `
<div id="lib-dialog" class="lib-backdrop" aria-modal="true" role="dialog" aria-label="My Library">
  <div class="lib-box">
    <div class="lib-header">
      <h2 class="lib-title">My Library</h2>
      <button class="lib-close" data-close-lib aria-label="Close">✕</button>
    </div>

    <div class="lib-tabs" role="tablist">
      <button class="lib-tab is-active" data-tab="history"   role="tab">📚 History</button>
      <button class="lib-tab"           data-tab="bookmarks" role="tab">🔖 Bookmarks</button>
      <button class="lib-tab"           data-tab="notes"     role="tab">📝 Notes</button>
      <button class="lib-tab"           data-tab="comments"  role="tab">💬 Comments</button>
    </div>

    <div class="lib-body">
      <div class="lib-loading" id="lib-loading">Loading…</div>
      <div id="lib-pane-history"   class="lib-pane"></div>
      <div id="lib-pane-bookmarks" class="lib-pane" style="display:none"></div>
      <div id="lib-pane-notes"     class="lib-pane" style="display:none"></div>
      <div id="lib-pane-comments"  class="lib-pane" style="display:none"></div>
    </div>
  </div>
</div>`);
}

// ── Open / close ──────────────────────────────────────────────
export function showLibraryDialog() {
  const dlg = document.getElementById('lib-dialog');
  if (!dlg) return;
  dlg.classList.add('is-visible');
  requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('open')));
  _loadLibrary();
}

function _closeLibrary() {
  const dlg = document.getElementById('lib-dialog');
  if (!dlg) return;
  dlg.classList.remove('open');
  const onEnd = () => dlg.classList.remove('is-visible');
  dlg.addEventListener('transitionend', onEnd, { once: true });
  setTimeout(onEnd, 300);
}

// ── Load data & render ────────────────────────────────────────
async function _loadLibrary() {
  const loading = document.getElementById('lib-loading');
  loading.style.display = 'block';
  // Hide all panes
  document.querySelectorAll('.lib-pane').forEach(p => p.style.display = 'none');

  try {
    const res  = await authFetch(`${baseUrl}/api/user/library`);
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    _renderPane('history',   _buildHistory(data.history));
    _renderPane('bookmarks', _buildBookmarks(data.bookmarks));
    _renderPane('notes',     _buildNotes(data.notes));
    _renderPane('comments',  _buildComments(data.comments));
  } catch (e) {
    document.getElementById('lib-pane-history').innerHTML =
      '<p class="lib-empty">Could not load library. Please sign in.</p>';
  }

  loading.style.display = 'none';
  // Show active tab's pane
  const activeTab = document.querySelector('.lib-tab.is-active');
  _showPane(activeTab?.dataset.tab || 'history');
}

function _renderPane(name, html) {
  document.getElementById(`lib-pane-${name}`).innerHTML = html;
}

function _showPane(name) {
  document.querySelectorAll('.lib-pane').forEach(p => p.style.display = 'none');
  const pane = document.getElementById(`lib-pane-${name}`);
  if (pane) pane.style.display = 'block';
}

// ── Renderers ─────────────────────────────────────────────────
function _fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString(undefined,
    { year:'numeric', month:'short', day:'numeric' });
}

function _bookLink(bookId, paraId) {
  return `${baseUrl}/book/${bookId}?para=${paraId}`;
}

function _buildHistory(rows) {
  if (!rows?.length) return '<p class="lib-empty">No reading history yet.</p>';
  return rows.map(r => `
    <a class="lib-card lib-card-link" href="${_bookLink(r.book_id, r.para_id)}">
      <div class="lib-card-title">${_esc(r.book_title)}</div>
      <div class="lib-card-sub">
        ${r.section_title ? `<span class="lib-section">${_esc(r.section_title)}</span>` : ''}
        <span class="lib-para">¶${r.para_id}</span>
      </div>
      <div class="lib-card-date">${_fmtDate(r.updated_at)}</div>
    </a>`).join('');
}

function _buildBookmarks(rows) {
  if (!rows?.length) return '<p class="lib-empty">No bookmarks yet.</p>';
  return rows.map(r => `
    <a class="lib-card lib-card-link" href="${_bookLink(r.book_id, r.para_id)}">
      <div class="lib-card-title">${_esc(r.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${r.para_id} · line ${r.line_id}</span>
      </div>
      <div class="lib-card-date">${_fmtDate(r.created_at)}</div>
    </a>`).join('');
}

function _buildNotes(rows) {
  if (!rows?.length) return '<p class="lib-empty">No personal notes yet.</p>';
  return rows.map(r => `
    <a class="lib-card lib-card-link" href="${_bookLink(r.book_id, r.para_id)}">
      <div class="lib-card-title">${_esc(r.book_title)}
        <span class="lib-para"> · ¶${r.para_id}</span>
      </div>
      <div class="lib-card-note">${_esc(r.text)}</div>
      <div class="lib-card-date">${_fmtDate(r.updated_at)}</div>
    </a>`).join('');
}

function _buildComments(rows) {
  if (!rows?.length) return '<p class="lib-empty">No comments yet.</p>';
  return rows.map(r => `
    <a class="lib-card lib-card-link" href="${_bookLink(r.book_id, r.para_id)}">
      <div class="lib-card-title">${_esc(r.book_title)}
        <span class="lib-para"> · ¶${r.para_id}</span>
      </div>
      <div class="lib-card-note">${_esc(r.text)}</div>
      <div class="lib-card-date">${_fmtDate(r.created_at)}</div>
    </a>`).join('');
}

function _esc(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Wire events ───────────────────────────────────────────────
export function initLibraryUI() {
  _injectShell();

  document.addEventListener('click', e => {
    // Tab switching
    const tab = e.target.closest('.lib-tab');
    if (tab) {
      document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      _showPane(tab.dataset.tab);
      return;
    }
    // Close button
    if (e.target.closest('[data-close-lib]')) { _closeLibrary(); return; }
    // Backdrop click
    if (e.target.id === 'lib-dialog') { _closeLibrary(); return; }
  });
}

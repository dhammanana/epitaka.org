/**
 * row-actions.js
 * ─────────────────────────────────────────────────────────────
 * Adds three action buttons alongside the existing 💬 comment icon
 * on every .sentence-row:
 *
 *   📌  Bookmark  — toggle; filled when active; requires login
 *   📝  Note      — private note per sentence; requires login
 *   🔗  Share     — copy deep-link URL + Pali/English text to clipboard
 *
 * Called from book.js after attachCommentIcons():
 *   await attachRowActions(contentEl, sectionParaId);
 */

import { auth }            from '../auth/auth.js';
import { showLoginDialog } from '../auth/auth-ui.js';
import { authFetch }       from '../auth/auth.js';
import { loadSettings }    from '../settings.js';
import { copyToClipboard }   from '../libs/clipboard.js';
import { installPaliInput } from '../libs/pali_typing.js';
import '../css/extras.css';

const { baseUrl, bookId } = window.BOOK_CONFIG;

// ── Public ────────────────────────────────────────────────────
export async function attachRowActions(contentEl, sectionParaId) {
  // Load bookmarks + notes for this section in parallel (auth-gated; skip if not logged in)
  let bookmarkSet = new Set();   // Set of "paraId-lineId" keys
  let noteMap     = new Map();   // Map<"paraId-lineId", noteText>

  if (auth.loggedIn) {
    [bookmarkSet, noteMap] = await Promise.all([
      _loadBookmarks(sectionParaId),
      _loadNotes(sectionParaId),
    ]);
  }

  contentEl.querySelectorAll('.sentence-row').forEach(row => {
    const m = row.id.match(/^p-(\d+)-l-(\d+)$/);
    if (!m) return;
    const paraId = parseInt(m[1], 10);
    const lineId = parseInt(m[2], 10);
    _injectActions(row, paraId, lineId, bookmarkSet, noteMap);
  });

  // Re-attach if user logs in after the section is already open
  auth.onChange((fbUser) => {
    if (!fbUser) {
      // Logged out: reset all bookmark/note states
      contentEl.querySelectorAll('.ra-bookmark-btn').forEach(btn => {
        btn.classList.remove('is-active');
        btn.title = 'Bookmark (sign in)';
      });
      contentEl.querySelectorAll('.ra-note-btn').forEach(btn => {
        btn.classList.remove('has-note');
        btn.title = 'Personal note (sign in)';
      });
      return;
    }
    // Logged in after render: reload and update badges
    Promise.all([_loadBookmarks(sectionParaId), _loadNotes(sectionParaId)])
      .then(([bSet, nMap]) => {
        contentEl.querySelectorAll('.sentence-row').forEach(row => {
          const m2 = row.id.match(/^p-(\d+)-l-(\d+)$/);
          if (!m2) return;
          const key = `${m2[1]}-${m2[2]}`;
          const bBtn = row.querySelector('.ra-bookmark-btn');
          const nBtn = row.querySelector('.ra-note-btn');
          if (bBtn) bBtn.classList.toggle('is-active', bSet.has(key));
          if (nBtn) nBtn.classList.toggle('has-note', nMap.has(key));
        });
      }).catch(() => {});
  });
}

// ── Inject actions into one row ───────────────────────────────
function _injectActions(row, paraId, lineId, bookmarkSet, noteMap) {
  if (row.querySelector('.ra-wrap')) return;

  const key        = `${paraId}-${lineId}`;
  const isBookmarked = bookmarkSet.has(key);
  const existingNote = noteMap.get(key) || '';

  // Re-use the shared bar created by comments-ui.js, or create one if comments aren't loaded
  let actionsBar = row.querySelector('.row-actions-bar');
  if (!actionsBar) {
    actionsBar = _el('div', 'row-actions-bar');
    row.appendChild(actionsBar);
  }

  const wrap = _el('div', 'ra-wrap');

  // ── Bookmark ──
  const bmBtn = _el('button', 'ra-btn ra-bookmark-btn');
  bmBtn.innerHTML   = '🔖';
  bmBtn.title       = 'Bookmark';
  bmBtn.setAttribute('aria-label', 'Toggle bookmark');
  if (isBookmarked) bmBtn.classList.add('is-active');

  bmBtn.addEventListener('click', async () => {
    if (!auth.loggedIn) { showLoginDialog(); return; }
    try {
      const res = await authFetch(`${baseUrl}/api/book/${bookId}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify({ para_id: paraId, line_id: lineId }),
      });
      const data = await res.json();
      bmBtn.classList.toggle('is-active', data.bookmarked);
      _toast(data.bookmarked ? 'Bookmarked ✓' : 'Bookmark removed');
    } catch { _toast('Could not update bookmark.'); }
  });

  // ── Note ──
  const noteBtn  = _el('button', 'ra-btn ra-note-btn');
  noteBtn.innerHTML = '📝';
  noteBtn.title     = 'Personal note';
  noteBtn.setAttribute('aria-label', 'Toggle personal note');
  if (existingNote) noteBtn.classList.add('has-note');

  const notePanel = _el('div', 'ra-note-panel');
  notePanel.style.display = 'none';
  notePanel.innerHTML = `
    <textarea class="ra-note-input" rows="3" maxlength="5000"
      placeholder="Private note visible only to you…">${_esc(existingNote)}</textarea>
    <div class="ra-note-footer">
      <span class="ra-note-char">${existingNote.length} / 5000</span>
      <button class="ra-note-delete cmt-btn-ghost">Delete</button>
      <button class="ra-note-save  cmt-btn-primary">Save</button>
    </div>`;

  const ta      = notePanel.querySelector('.ra-note-input');
  const charEl  = notePanel.querySelector('.ra-note-char');
  const saveBtn = notePanel.querySelector('.ra-note-save');
  const delBtn  = notePanel.querySelector('.ra-note-delete');

  installPaliInput(ta, {mode: "both"});

  ta.addEventListener('input', () => { charEl.textContent = `${ta.value.length} / 5000`; });

  saveBtn.addEventListener('click', async () => {
    if (!auth.loggedIn) { showLoginDialog(); return; }
    const text = ta.value.trim();
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    try {
      await authFetch(`${baseUrl}/api/book/${bookId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ para_id: paraId, line_id: lineId, text }),
      });
      noteBtn.classList.toggle('has-note', !!text);
      notePanel.style.display = 'none';
      noteBtn.classList.remove('is-open');
      _toast(text ? 'Note saved ✓' : 'Note deleted');
    } catch { _toast('Could not save note.'); }
    saveBtn.disabled = false; saveBtn.textContent = 'Save';
  });

  delBtn.addEventListener('click', async () => {
    if (!confirm('Delete this note?')) return;
    ta.value = '';
    saveBtn.click();
  });

  noteBtn.addEventListener('click', () => {
    if (!auth.loggedIn) { showLoginDialog(); return; }
    const isOpen = notePanel.style.display !== 'none';
    notePanel.style.display = isOpen ? 'none' : 'block';
    noteBtn.classList.toggle('is-open', !isOpen);
    if (!isOpen) setTimeout(() => ta.focus(), 40);
  });

  // ── Share ──
  const shareBtn = _el('button', 'ra-btn ra-share-btn');
  shareBtn.innerHTML = '🔗';
  shareBtn.title     = 'Copy link & text';
  shareBtn.setAttribute('aria-label', 'Share');

  shareBtn.addEventListener('click', () => {
    const s       = loadSettings();
    const bookName = window.BOOK_CONFIG?.bookName || document.title || 'E-Piṭaka';
    const url     = `${location.origin}${location.pathname}?para=${paraId}&line=${lineId}`;
    const pali    = row.querySelector('.pali-text')?.innerText?.trim() || '';

    // Pick the first active translation language from settings
    let translation = '';
    if (s.english && !translation) {
      translation = row.querySelector('.eng-text')?.innerText?.trim() || '';
    }
    if (s.vietnamese && !translation) {
      translation = row.querySelector('.viet-text')?.innerText?.trim() || '';
    }

    // Rich share: bookName → hyperlink → translation text
    const richParts = [bookName, url, pali];
    if (translation) richParts.push(translation);

    // Fallback plain text: bookName → pali → link
    const plainParts = [bookName, pali, url];

    copyToClipboard(richParts.join('\n\n'), {
      successMessage: 'Link & text copied ✓',
      errorMessage:   'Copy failed – please copy manually',
      toast: _toast,
    });
  }); 

  // ── Collapse toggle ⋯ ──────────────────────────────────────────────
  // ── Collapse toggle ⋯ ──────────────────────────────────────────
  // Note: NOT given ra-btn class — it must stay visible when collapsed.
  const collapseToggle = _el('button', 'ra-collapse-toggle');
  collapseToggle.innerHTML = '⋯';
  collapseToggle.title = 'Actions';
  collapseToggle.setAttribute('aria-label', 'Expand actions');
  collapseToggle.setAttribute('aria-expanded', 'false');
  collapseToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = wrap.classList.toggle('ra-expanded');
    collapseToggle.setAttribute('aria-expanded', String(isExpanded));
    if (isExpanded) {
      const closeOnOutside = (ev) => {
        if (!wrap.contains(ev.target)) {
          wrap.classList.remove('ra-expanded');
          collapseToggle.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeOnOutside);
        }
      };
      setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
    }
  });

  // Pull the comment button that comments-ui already created into this wrap,
  // so ALL buttons live in one container — collapse then works with simple CSS.
  const cmtWrap = actionsBar.querySelector('.cmt-wrap');
  const cmtBtn  = cmtWrap?.querySelector('.cmt-icon-btn');
  if (cmtBtn) {
    cmtBtn.classList.add('ra-btn');   // ensure it participates in collapse
    cmtWrap.remove();                 // remove the now-redundant wrapper
  }

  // Order: ⋯ toggle | 💬 comment | 🔖 bookmark | 📝 note | 🔗 share
  wrap.append(collapseToggle);
  if (cmtBtn) wrap.append(cmtBtn);
  wrap.append(bmBtn, noteBtn, shareBtn);

  actionsBar.appendChild(wrap);
  row.append(notePanel);
};

// ── API loaders ───────────────────────────────────────────────
async function _loadBookmarks(sectionParaId) {
  try {
    const res  = await authFetch(`${baseUrl}/api/book/${bookId}/bookmarks?section_para_id=${sectionParaId}`);
    const data = await res.json();
    return new Set((data.bookmarks || []).map(b => `${b.para_id}-${b.line_id}`));
  } catch { return new Set(); }
}

async function _loadNotes(sectionParaId) {
  try {
    const res  = await authFetch(`${baseUrl}/api/book/${bookId}/notes?section_para_id=${sectionParaId}`);
    const data = await res.json();
    const m    = new Map();
    for (const n of (data.notes || [])) m.set(`${n.para_id}-${n.line_id}`, n.text);
    return m;
  } catch { return new Map(); }
}

// ── Utilities ─────────────────────────────────────────────────
function _el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}
function _esc(s = '') {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _toast(msg) {
  const t = document.createElement('div');
  t.className = 'cmt-toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}
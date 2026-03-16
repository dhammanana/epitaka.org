/**
 * comment-ui.js
 * ───────────────────────────────────────────────────────────
 * Attaches a 💬 icon to every sentence row after a section loads.
 * Clicking it opens an inline thread showing existing comments
 * and a compose box (or a sign-in prompt if logged out).
 *
 * Called from book.js:
 *   await attachCommentIcons(contentEl, sectionParaId);
 */

import { auth }            from '../auth/auth.js';
import { showLoginDialog } from '../auth/auth-ui.js';
import {
  loadCommentsForSection,
  addComment,
  editComment,
  deleteComment,
} from './comments.js';
import { installPaliInput } from '../libs/pali_typing.js';
import '../css/comments.css';

// ── Public ────────────────────────────────────────────────────
export async function attachCommentIcons(contentEl, sectionParaId) {
  // Load all comments for this section in a single API call
  let commentMap = new Map();
  try {
    commentMap = await loadCommentsForSection(sectionParaId);
  } catch (e) {
    console.warn('[comments] failed to load for section', sectionParaId, e);
  }

  // Give the browser one frame to finish painting the innerHTML
  await new Promise(resolve => requestAnimationFrame(resolve));

  const rows = contentEl.querySelectorAll('.sentence-row');
  console.log(`[comments] section ${sectionParaId}: found ${rows.length} sentence rows, ${commentMap.size} keyed comment groups`);

  if (rows.length === 0) {
    console.warn('[comments] No .sentence-row elements found in contentEl. Check renderSection output.');
    return;
  }

  rows.forEach(row => {
    const m = row.id.match(/^p-(\d+)-l-(\d+)$/);
    if (!m) {
      console.warn('[comments] unexpected row id format:', row.id);
      return;
    }
    const paraId = parseInt(m[1], 10);
    const lineId = parseInt(m[2], 10);
    _injectRow(row, paraId, lineId, commentMap);
  });

  console.log(`[comments] icons attached to ${rows.length} rows`);
}

// ── Inject icon + collapsible thread into one sentence row ────
function _injectRow(row, paraId, lineId, commentMap) {
  if (row.querySelector('.cmt-wrap')) return; // already done

  const key      = `${paraId}-${lineId}`;
  const comments = commentMap.get(key) || [];

  // Shared action bar — row-actions.js will also append into this element.
  // comments-ui runs FIRST (called before attachRowActions in book.js), so
  // we create the bar here. row-actions will prepend the ⋯ toggle via
  // actionsBar.insertBefore so it always sits at position 0.
  let actionsBar = row.querySelector('.row-actions-bar');
  if (!actionsBar) {
    actionsBar = _el('div', 'row-actions-bar');
    row.appendChild(actionsBar);
  }

  // FIX: give wrap + button the ra-btn class family so the collapse CSS
  // applies uniformly to all action items regardless of which module made them.
  const wrap   = _el('div', 'cmt-wrap');
  const btn    = _buildIconBtn(comments.length);
  const thread = _el('div', 'cmt-thread');
  thread.style.display = 'none';

  _renderThread(thread, comments, paraId, lineId);

  btn.addEventListener('click', () => {
    const isOpen = thread.style.display !== 'none';
    thread.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('is-open', !isOpen);
    if (!isOpen) {
      setTimeout(() => thread.querySelector('.cmt-new-input')?.focus(), 50);
    }
  });

  wrap.appendChild(btn);
  actionsBar.appendChild(wrap);
  // Thread lives outside the bar so it can expand full-width below the row
  row.appendChild(thread);
}

// ── Icon button ───────────────────────────────────────────────
function _buildIconBtn(count) {
  // ra-btn: participates in the collapse system (hidden when collapsed, shown when expanded)
  const btn = _el('button', 'cmt-icon-btn');
  btn.setAttribute('title', 'Comments');
  btn.setAttribute('aria-label', 'Toggle comments');
  _syncBtnBadge(btn, count);
  return btn;
}

function _syncBtnBadge(btn, count) {
  btn.innerHTML = count > 0
    ? `<span class="cmt-icon">💬</span><span class="cmt-count">${count}</span>`
    : `<span class="cmt-icon">💬</span>`;
}

// ── Thread ────────────────────────────────────────────────────
function _renderThread(threadEl, comments, paraId, lineId) {
  threadEl.innerHTML = '';

  const list = _el('div', 'cmt-list');
  if (comments.length === 0) {
    list.innerHTML = '<p class="cmt-empty">No notes yet.</p>';
  } else {
    comments.forEach(c => list.appendChild(_buildItem(c, list, paraId, lineId)));
  }

  threadEl.appendChild(list);
  threadEl.appendChild(_buildCompose(paraId, lineId, list));
}

// ── Single comment ────────────────────────────────────────────
function _buildItem(c, listEl, paraId, lineId) {
  const isOwn = auth.profile?.uid === c.uid;
  const time  = c.created_at
    ? new Date(c.created_at * 1000).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  const item = _el('div', 'cmt-item');
  item.dataset.id = c.id;
  item.innerHTML = `
    <div class="cmt-header">
      <span class="cmt-avatar">${_avatarHtml(c.photo_url, c.display_name)}</span>
      <span class="cmt-author">${_esc(c.display_name || 'Anonymous')}</span>
      <span class="cmt-time">${time}</span>
      ${isOwn ? `
        <button class="cmt-action-btn cmt-edit-btn"   title="Edit">✏</button>
        <button class="cmt-action-btn cmt-delete-btn" title="Delete">🗑</button>` : ''}
    </div>
    <div class="cmt-body">${_esc(c.text)}</div>
    <div class="cmt-edit-area" style="display:none">
      <textarea class="cmt-edit-input" rows="3" maxlength="2000">${_esc(c.text)}</textarea>
      <div class="cmt-edit-actions">
        <button class="cmt-btn-primary cmt-save-btn">Save</button>
        <button class="cmt-btn-ghost cmt-cancel-btn">Cancel</button>
      </div>
    </div>`;

  // Edit
  item.querySelector('.cmt-edit-btn')?.addEventListener('click', () => {
    item.querySelector('.cmt-body').style.display      = 'none';
    item.querySelector('.cmt-edit-area').style.display = 'block';
    item.querySelector('.cmt-edit-input').focus();
  });
  item.querySelector('.cmt-cancel-btn')?.addEventListener('click', () => {
    item.querySelector('.cmt-body').style.display      = '';
    item.querySelector('.cmt-edit-area').style.display = 'none';
  });
  item.querySelector('.cmt-save-btn')?.addEventListener('click', async () => {
    const newText = item.querySelector('.cmt-edit-input').value.trim();
    if (!newText) return;
    try {
      const updated = await editComment(c.id, newText);
      c.text = updated.text;
      item.querySelector('.cmt-body').textContent    = updated.text;
      item.querySelector('.cmt-body').style.display  = '';
      item.querySelector('.cmt-edit-area').style.display = 'none';
    } catch (e) {
      console.error('[comments] edit failed', e);
      _toast('Could not save edit.');
    }
  });

  // Delete
  item.querySelector('.cmt-delete-btn')?.addEventListener('click', async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(c.id);
      item.remove();
      _refreshEmpty(listEl);
      _updateBadge(paraId, lineId, listEl.querySelectorAll('.cmt-item').length);
    } catch (e) {
      console.error('[comments] delete failed', e);
      _toast('Could not delete.');
    }
  });

  return item;
}

// ── Compose area ──────────────────────────────────────────────
function _buildCompose(paraId, lineId, listEl) {
  const wrap = _el('div', 'cmt-compose');

  function render() {
    const profile = auth.profile;
    wrap.innerHTML = '';

    if (!profile) {
      const cta = _el('button', 'cmt-login-cta');
      cta.textContent = 'Sign in to add a note';
      cta.addEventListener('click', showLoginDialog);
      wrap.appendChild(cta);
      return;
    }

    wrap.innerHTML = `
      <div class="cmt-compose-row">
        <span class="cmt-avatar">${_avatarHtml(profile.photo_url, profile.display_name)}</span>
        <textarea class="cmt-new-input" rows="2" maxlength="2000" placeholder="Suggest a better translation or add a study note…"></textarea>
      </div>
      <div class="cmt-compose-footer">
        <span class="cmt-char">0 / 2000</span>
        <button class="cmt-btn-primary cmt-post-btn">Post</button>
      </div>`;

    const ta      = wrap.querySelector('.cmt-new-input');
    const charEl  = wrap.querySelector('.cmt-char');
    const postBtn = wrap.querySelector('.cmt-post-btn');

    installPaliInput(ta, {mode: 'both'});
    ta.addEventListener('input', () => {
      charEl.textContent = `${ta.value.length} / 2000`;
    });

    postBtn.addEventListener('click', async () => {
      const text = ta.value.trim();
      if (!text) return;
      postBtn.disabled    = true;
      postBtn.textContent = 'Posting…';
      try {
        const newC = await addComment({ paraId, lineId, text });
        ta.value = '';
        charEl.textContent = '0 / 2000';
        _refreshEmpty(listEl, true);
        listEl.appendChild(_buildItem(newC, listEl, paraId, lineId));
        _updateBadge(paraId, lineId, listEl.querySelectorAll('.cmt-item').length);
      } catch (e) {
        console.error('[comments] post failed', e);
        _toast('Could not post comment.');
      }
      postBtn.disabled    = false;
      postBtn.textContent = 'Post';
    });
  }

  render();
  auth.onChange(render);
  return wrap;
}

// ── Utilities ─────────────────────────────────────────────────
function _el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function _esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _avatarHtml(photoUrl, name) {
  if (photoUrl) {
    return `<img src="${_esc(photoUrl)}" class="cmt-avatar-img" alt="${_esc(name || '')}">`;
  }
  const ini = (name || '?').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  return `<span class="cmt-avatar-initials">${ini}</span>`;
}

function _updateBadge(paraId, lineId, count) {
  const row = document.getElementById(`p-${paraId}-l-${lineId}`);
  const btn = row?.querySelector('.cmt-icon-btn');
  if (btn) _syncBtnBadge(btn, count);
}

function _refreshEmpty(listEl, removing = false) {
  const p = listEl.querySelector('.cmt-empty');
  if (removing && p) { p.remove(); return; }
  if (!removing && listEl.querySelectorAll('.cmt-item').length === 0 && !p) {
    listEl.innerHTML = '<p class="cmt-empty">No notes yet.</p>';
  }
}

function _toast(msg) {
  const t = document.createElement('div');
  t.className   = 'cmt-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
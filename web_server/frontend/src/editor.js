/**
 * editor.js
 * ─────────────────────────────────────────────────────────────
 * E-Piṭaka Translation Editor console (private).
 *
 * Views:
 *   - Login          (email + password, no public registration)
 *   - Workspace      (choose language → book → section → edit lines)
 *   - Review  (super) pending AI + human remarks, apply selected/all
 *   - Editors (super) manage translator accounts & permissions
 *
 * Talks to the Flask blueprint at /editor/api/* using session cookies.
 */

import './css/editor.css';

const { baseUrl } = window.EDITOR_CONFIG;

// ── API helper ────────────────────────────────────────────────
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── State ─────────────────────────────────────────────────────
const state = {
  me: null,
  langs: [],
  currentLang: null,
  menu: null,          // book hierarchy for current lang
  currentBook: null,
  toc: [],
  currentSection: null,
  sentences: [],
  remarks: [],
  // review
  reviewFilter: { lang: '', kind: '', status: 'pending', book_id: '', offset: 0 },
  reviewItems: [],
  reviewTotals: {},
  selectedReview: new Map(),   // key `${lang}:${id}` → {lang, id}
};

const root = document.getElementById('editor-root');

// ── Escape / utils ────────────────────────────────────────────
// Escapes quotes too so the value is safe inside HTML attributes
// (data-book-name="…", value="…", data-key="…") as well as text nodes.
function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════════════════════
// LOGIN VIEW
// ══════════════════════════════════════════════════════════════
function renderLogin() {
  root.innerHTML = `
    <div class="ed-login-wrap">
      <div class="ed-login-card">
        <div class="ed-login-logo">📖 E-Piṭaka</div>
        <h1 class="ed-login-title">Translation Editor</h1>
        <p class="ed-login-sub">Sign in to edit translations. Accounts are granted by the site administrator.</p>
        <form id="ed-login-form" class="ed-login-form" novalidate>
          <label class="ed-field">
            <span>Email</span>
            <input type="email" id="ed-login-email" autocomplete="username" required>
          </label>
          <label class="ed-field">
            <span>Password</span>
            <input type="password" id="ed-login-password" autocomplete="current-password" required>
          </label>
          <p id="ed-login-error" class="ed-error" hidden></p>
          <button type="submit" class="ed-btn ed-btn-primary ed-btn-block" id="ed-login-btn">Sign in</button>
        </form>
      </div>
    </div>`;

  document.getElementById('ed-login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('ed-login-btn');
    const err = document.getElementById('ed-login-error');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    err.hidden = true;
    try {
      const me = await api('/editor/api/login', {
        method: 'POST',
        body: {
          email: document.getElementById('ed-login-email').value,
          password: document.getElementById('ed-login-password').value,
        },
      });
      state.me = me;
      await bootWorkspace();
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
}

// ══════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════
function renderShell() {
  const me = state.me;
  const superTabs = me.is_super
    ? `<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>
       <button class="ed-nav-btn" data-view="review">🛂 Review${state.pendingCount ? ` <span class="ed-badge">${state.pendingCount}</span>` : ''}</button>
       <button class="ed-nav-btn" data-view="editors">👥 Editors</button>`
    : `<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>`;

  root.innerHTML = `
    <header class="ed-topbar">
      <div class="ed-brand">📖 E-Piṭaka <span class="ed-brand-sub">Translation Editor</span></div>
      <nav class="ed-nav">${superTabs}</nav>
      <div class="ed-user">
        <span class="ed-user-name">${esc(me.display_name || me.email)}</span>
        ${me.is_super ? '<span class="ed-super-tag">admin</span>' : ''}
        <button class="ed-btn ed-btn-ghost" id="ed-logout">Sign out</button>
      </div>
    </header>
    <div class="ed-body">
      <div id="ed-workspace-view" class="ed-view" hidden></div>
      <div id="ed-review-view"   class="ed-view" hidden></div>
      <div id="ed-editors-view"  class="ed-view" hidden></div>
    </div>`;

  document.querySelectorAll('.ed-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  document.getElementById('ed-logout').addEventListener('click', async () => {
    try { await api('/editor/api/logout', { method: 'POST' }); } catch (_) { /* noop */ }
    state.me = null;
    renderLogin();
  });

  switchView('workspace');
}

function switchView(name) {
  document.querySelectorAll('.ed-nav-btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  document.querySelectorAll('.ed-view').forEach(v => v.hidden = true);
  const target = document.getElementById(`ed-${name}-view`);
  target.hidden = false;
  if (name === 'workspace') renderWorkspace();
  else if (name === 'review') renderReview();
  else if (name === 'editors') renderEditors();
}

async function bootWorkspace() {
  // Load languages once
  const data = await api('/editor/api/languages');
  state.langs = data.languages;
  state.currentLang = state.langs[0]?.code || null;
  if (state.currentLang) await loadBooks();
  renderShell();
}

async function loadBooks() {
  if (!state.currentLang) return;
  const data = await api(`/editor/api/${state.currentLang}/books`);
  state.menu = data.menu;
  state.currentBook = null;
  state.toc = [];
  state.currentSection = null;
  state.sentences = [];
  state.remarks = [];
}

// ══════════════════════════════════════════════════════════════
// WORKSPACE VIEW
// ══════════════════════════════════════════════════════════════
const TAB_ORDER = ['Mūla', 'Aṭṭhakathā', 'Ṭīkā'];
const PITAKA_ORDER = ['Vinaya', 'Suttanta', 'Sutta', 'Abhidhamma'];

function renderWorkspace() {
  const el = document.getElementById('ed-workspace-view');
  el.innerHTML = `
    <div class="ed-ws">
      <aside class="ed-ws-side">
        <div class="ed-ws-block">
          <div class="ed-ws-label">Language</div>
          <div class="ed-lang-row">
            ${state.langs.map(l =>
              `<button class="ed-lang-chip${l.code === state.currentLang ? ' is-active' : ''}" data-lang="${l.code}" title="${esc(l.english_name)}">${esc(l.native_name)}</button>`
            ).join('')}
          </div>
        </div>
        <div class="ed-ws-block ed-ws-books">
          <div class="ed-ws-label">Book</div>
          <div id="ed-book-tabs"></div>
          <div id="ed-book-tree" class="ed-book-tree"></div>
        </div>
        <div class="ed-ws-block ed-ws-sections">
          <div class="ed-ws-label">Section</div>
          <div id="ed-toc" class="ed-toc"></div>
        </div>
      </aside>
      <main class="ed-ws-main">
        <div class="ed-ws-head">
          <h2 class="ed-ws-bookname">${state.currentBook ? esc(state.currentBook.name) : 'Choose a book'}</h2>
          <span class="ed-ws-hint">Click a translation line to propose an edit</span>
        </div>
        <div id="ed-lines" class="ed-lines"></div>
      </main>
    </div>`;

  document.querySelectorAll('.ed-lang-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      if (chip.dataset.lang === state.currentLang) return;
      state.currentLang = chip.dataset.lang;
      await loadBooks();
      renderWorkspace();
    });
  });

  renderBookTree();
  renderToc();
  renderLines();
}

function _resolvedCategories() {
  if (!state.menu) return [];
  const keys = Object.keys(state.menu);
  const ordered = [...TAB_ORDER.filter(k => keys.includes(k)), ...keys.filter(k => !TAB_ORDER.includes(k))];
  return ordered.map(k => ({ label: k, data: state.menu[k] }));
}

function renderBookTree() {
  const tabsEl = document.getElementById('ed-book-tabs');
  const treeEl = document.getElementById('ed-book-tree');
  if (!tabsEl || !treeEl) return;

  const categories = _resolvedCategories();
  if (!categories.length) {
    treeEl.innerHTML = '<p class="ed-empty">No books in this language.</p>';
    return;
  }
  tabsEl.innerHTML = categories.map((c, i) =>
    `<button class="ed-tab${i === 0 ? ' is-active' : ''}" data-tab="${i}">${esc(c.label)}</button>`
  ).join('');

  const active = 0;
  const panels = categories.map((c, i) =>
    `<div class="ed-tree-panel${i === active ? ' is-active' : ''}" data-panel="${i}">${_buildCategoryHTML(c.data)}</div>`
  ).join('');
  treeEl.innerHTML = panels;

  tabsEl.querySelectorAll('.ed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.ed-tab').forEach(t => t.classList.toggle('is-active', t === tab));
      treeEl.querySelectorAll('.ed-tree-panel').forEach(p => p.classList.toggle('is-active', parseInt(p.dataset.panel) === parseInt(tab.dataset.tab)));
    });
  });

  treeEl.querySelectorAll('.ed-nikaya-title').forEach(title => {
    title.addEventListener('click', () => {
      title.classList.toggle('open');
      title.nextElementSibling?.classList.toggle('open');
    });
  });

  treeEl.querySelectorAll('.ed-book').forEach(link => {
    link.addEventListener('click', async () => {
      const bid = link.dataset.bookId;
      state.currentBook = { id: bid, name: link.dataset.bookName };
      const data = await api(`/editor/api/${state.currentLang}/book/${bid}/toc`);
      state.toc = data.toc;
      state.currentSection = null;
      state.sentences = [];
      state.remarks = [];
      renderWorkspace();
      document.querySelector('.ed-ws-sections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function _buildCategoryHTML(data) {
  if (!data || typeof data !== 'object') return '';
  const names = Object.keys(data).sort((a, b) => {
    const idx = n => { const i = PITAKA_ORDER.findIndex(p => n.includes(p)); return i === -1 ? 99 : i; };
    return idx(a) - idx(b);
  });
  return names.map(name => `
    <div class="ed-category">
      <div class="ed-category-title">${esc(name)}</div>
      ${_renderNikaya(data[name])}
    </div>`).join('');
}

function _renderNikaya(nikayaDict) {
  if (!nikayaDict || typeof nikayaDict !== 'object') return '';
  const parts = [];
  if (nikayaDict['']) {
    parts.push(`<ol class="ed-book-list open">${_buildBookList(nikayaDict[''])}</ol>`);
  }
  Object.entries(nikayaDict).forEach(([sub, books]) => {
    if (sub === '') return;
    parts.push(`
      <div class="ed-nikaya">
        <div class="ed-nikaya-title">${esc(sub)} <span class="ed-chev">▶</span></div>
        <ol class="ed-book-list">${_buildBookList(books)}</ol>
      </div>`);
  });
  return parts.join('');
}

function _buildBookList(books) {
  if (!Array.isArray(books)) return '';
  return books.map(([bid, title]) =>
    `<li><button class="ed-book" data-book-id="${esc(bid)}" data-book-name="${esc(title)}">${esc(title)}</button></li>`
  ).join('');
}

function renderToc() {
  const el = document.getElementById('ed-toc');
  if (!el) return;
  if (!state.toc.length) {
    el.innerHTML = '<p class="ed-empty">Pick a book to see its sections.</p>';
    return;
  }
  el.innerHTML = state.toc.map(t => {
    const hasContent = t.has_content;
    const active = state.currentSection === t.para_id;
    return `
      <button class="ed-toc-item${active ? ' is-active' : ''}" data-para="${t.para_id}"
              style="padding-left:${Math.min((t.level || 1) - 1, 4) * 14 + 8}px"
              ${hasContent ? '' : 'disabled'}>
        ${esc(t.title)}${hasContent ? '' : ' <span class="ed-toc-no">·</span>'}
      </button>`;
  }).join('');

  el.querySelectorAll('.ed-toc-item:not([disabled])').forEach(item => {
    item.addEventListener('click', async () => {
      state.currentSection = parseInt(item.dataset.para);
      const data = await api(`/editor/api/${state.currentLang}/book/${state.currentBook.id}/section/${state.currentSection}`);
      state.sentences = data.sentences;
      state.remarks = data.remarks;
      renderLines();
    });
  });
}

function _remarksFor(paraId, lineId) {
  return (state.remarks || []).filter(r => r.para_id === paraId && r.line_id === lineId);
}

function renderLines() {
  const el = document.getElementById('ed-lines');
  if (!el) return;
  if (!state.sentences.length) {
    el.innerHTML = '<p class="ed-empty">Pick a section to edit its lines.</p>';
    return;
  }

  el.innerHTML = state.sentences.map((s, i) => {
    const remarks = _remarksFor(s.para_id, s.line_id);
    const aiRemarks = remarks.filter(r => r.kind === 'ai');
    const humanRemarks = remarks.filter(r => r.kind === 'human');

    const aiHtml = aiRemarks.map(r => `
      <div class="ed-remark ed-remark-ai" title="AI finding">
        <div class="ed-remark-head">⚡ AI finding${r.status === 'applied' ? ' <em class="ed-st-applied">· applied</em>' : ''}</div>
        ${r.translation && r.translation !== s.translation
          ? `<p class="ed-remark-fix"><span class="ed-remark-label">Suggestion</span><ins>${esc(r.translation)}</ins></p>`
          : ''}
        ${r.conflict ? `<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${esc(r.conflict)}</p>` : ''}
        ${r.note ? `<p class="ed-remark-note">${esc(r.note)}</p>` : ''}
      </div>`).join('');

    const humanHtml = humanRemarks.map(r => {
      const suggestion = r.proposed || r.translation || '';
      return `
      <div class="ed-remark ed-remark-human">
        <div class="ed-remark-head">
          🖊 ${esc(r.editor_name || 'Human')} · <em class="ed-st-${r.status}">${r.status}</em>
          ${r.created_at ? ` <span class="ed-remark-date">${esc(r.created_at)}</span>` : ''}
        </div>
        ${r.note ? `<p class="ed-remark-note">${esc(r.note)}</p>` : ''}
        ${suggestion && suggestion !== s.translation
          ? `<p class="ed-remark-fix"><del>${esc(s.translation)}</del> → <ins>${esc(suggestion)}</ins></p>`
          : ''}
      </div>`;
    }).join('');

    const hasPending = humanRemarks.some(r => r.status === 'pending');

    return `
      <div class="ed-line" data-para="${s.para_id}" data-line="${s.line_id}" id="edl-${s.para_id}-${s.line_id}">
        <div class="ed-line-meta">
          <span class="ed-line-num">¶${s.para_id}.${s.line_id}</span>
          ${hasPending ? '<span class="ed-chip ed-chip-pending">proposed</span>' : ''}
        </div>
        <div class="ed-line-pali">${esc(s.pali)}</div>
        <div class="ed-line-trans" data-role="trans">${esc(s.translation)}</div>
        ${aiHtml}
        ${humanHtml}
        <div class="ed-edit-box" hidden>
          <textarea class="ed-textarea" rows="3" placeholder="Proposed translation…">${esc(s.translation)}</textarea>
          <input type="text" class="ed-note" placeholder="Optional note for the reviewer" maxlength="1000">
          <div class="ed-edit-actions">
            <button class="ed-btn ed-btn-primary ed-save">Save proposal</button>
            <button class="ed-btn ed-btn-ghost ed-cancel">Cancel</button>
            <span class="ed-save-msg"></span>
          </div>
        </div>
      </div>`;
  }).join('');

  // Inline editing: click on the translation text opens the edit box
  el.querySelectorAll('.ed-line-trans').forEach(trans => {
    trans.addEventListener('click', () => {
      const line = trans.closest('.ed-line');
      line.querySelector('.ed-edit-box').hidden = false;
      const ta = line.querySelector('.ed-textarea');
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    });
  });

  el.querySelectorAll('.ed-edit-box').forEach(box => {
    const line = box.closest('.ed-line');
    const para = parseInt(line.dataset.para);
    const lid = parseInt(line.dataset.line);

    box.querySelector('.ed-cancel').addEventListener('click', () => { box.hidden = true; });

    box.querySelector('.ed-save').addEventListener('click', async () => {
      const proposed = box.querySelector('.ed-textarea').value.trim();
      const note = box.querySelector('.ed-note').value.trim();
      const msg = box.querySelector('.ed-save-msg');
      if (!proposed) { msg.textContent = 'Translation cannot be empty.'; return; }
      msg.textContent = 'Saving…';
      const saveBtn = box.querySelector('.ed-save');
      saveBtn.disabled = true;
      try {
        await api(`/editor/api/${state.currentLang}/book/${state.currentBook.id}/line`, {
          method: 'POST',
          body: { para_id: para, line_id: lid, proposed, note },
        });
        msg.textContent = '✓ Saved as proposal';
        box.hidden = true;
        // Refresh the section to show the new pending chip/remark
        const data = await api(`/editor/api/${state.currentLang}/book/${state.currentBook.id}/section/${state.currentSection}`);
        state.sentences = data.sentences;
        state.remarks = data.remarks;
        renderLines();
      } catch (ex) {
        msg.textContent = ex.message;
        saveBtn.disabled = false;
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════
// REVIEW VIEW (super admin)
// ══════════════════════════════════════════════════════════════
async function loadReview() {
  const f = state.reviewFilter;
  const qs = new URLSearchParams();
  if (f.lang) qs.set('lang', f.lang);
  if (f.kind) qs.set('kind', f.kind);
  if (f.status) qs.set('status', f.status);
  if (f.book_id) qs.set('book_id', f.book_id);
  qs.set('offset', f.offset);
  const data = await api(`/editor/api/review?${qs}`);
  state.reviewItems = data.items;
  state.reviewTotals = data.totals;
  state.selectedReview = new Map();
  // pending count for nav badge (approx: sum of pending totals across langs)
  state.pendingCount = f.status === 'pending'
    ? Object.values(data.totals).reduce((a, b) => a + b, 0)
    : state.pendingCount || 0;
}

function renderReview() {
  const el = document.getElementById('ed-review-view');
  el.innerHTML = `
    <div class="ed-review">
      <div class="ed-review-head">
        <h2>🛂 Review queue</h2>
        <p class="ed-ws-hint">Approve AI findings and human proposals. Applied changes write directly into the translation database.</p>
      </div>
      <div class="ed-filters">
        <select id="rf-lang">
          <option value="">All languages</option>
          ${state.langs.map(l => `<option value="${l.code}" ${state.reviewFilter.lang === l.code ? 'selected' : ''}>${esc(l.english_name)}</option>`).join('')}
        </select>
        <select id="rf-kind">
          <option value="">All kinds</option>
          <option value="human" ${state.reviewFilter.kind === 'human' ? 'selected' : ''}>Human proposals</option>
          <option value="ai" ${state.reviewFilter.kind === 'ai' ? 'selected' : ''}>AI findings</option>
        </select>
        <select id="rf-status">
          <option value="pending">Pending</option>
          <option value="applied" ${state.reviewFilter.status === 'applied' ? 'selected' : ''}>Applied</option>
          <option value="rejected" ${state.reviewFilter.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
        <input type="text" id="rf-book" placeholder="Book id (e.g. Dhp-a)" value="${esc(state.reviewFilter.book_id)}">
        <button class="ed-btn" id="rf-apply">Filter</button>
      </div>
      <div class="ed-review-actions">
        <button class="ed-btn ed-btn-primary" id="rv-apply-selected">✓ Apply selected</button>
        <button class="ed-btn ed-btn-danger" id="rv-reject-selected">✕ Reject selected</button>
        <button class="ed-btn" id="rv-apply-all">Apply all pending in filter</button>
        <span id="rv-msg" class="ed-save-msg"></span>
      </div>
      <div class="ed-review-list" id="ed-review-list"></div>
      <div class="ed-pager">
        <button class="ed-btn ed-btn-ghost" id="rv-prev" ${state.reviewFilter.offset === 0 ? 'disabled' : ''}>← Prev</button>
        <span class="ed-pager-info">offset ${state.reviewFilter.offset}</span>
        <button class="ed-btn ed-btn-ghost" id="rv-next" ${state.reviewItems.length < 100 ? 'disabled' : ''}>Next →</button>
      </div>
    </div>`;

  el.querySelectorAll('#rf-lang, #rf-kind, #rf-status').forEach(sel => {
    sel.addEventListener('change', () => {
      state.reviewFilter.lang = document.getElementById('rf-lang').value;
      state.reviewFilter.kind = document.getElementById('rf-kind').value;
      state.reviewFilter.status = document.getElementById('rf-status').value;
      state.reviewFilter.offset = 0;
    });
  });
  el.querySelector('#rf-apply').addEventListener('click', async () => {
    state.reviewFilter.book_id = document.getElementById('rf-book').value.trim();
    state.reviewFilter.offset = 0;
    try {
      await loadReview();
      renderReviewList();
    } catch (ex) { showReviewMsg(ex.message); }
  });
  el.querySelector('#rv-prev').addEventListener('click', async () => {
    state.reviewFilter.offset = Math.max(0, state.reviewFilter.offset - 100);
    await loadReview(); renderReviewList();
  });
  el.querySelector('#rv-next').addEventListener('click', async () => {
    state.reviewFilter.offset += 100;
    await loadReview(); renderReviewList();
  });
  el.querySelector('#rv-apply-selected').addEventListener('click', async () => {
    const items = [...state.selectedReview.values()];
    if (!items.length) return showReviewMsg('Select remarks first.');
    const msg = await api('/editor/api/review/apply', { method: 'POST', body: { items } });
    await loadReview(); renderReviewList();
    const ok = msg.results.filter(r => r.ok).length;
    const fails = msg.results.filter(r => !r.ok).map(r => r.message).join('; ');
    showReviewMsg(`Applied ${ok}/${items.length}.${fails ? ' ' + fails : ''}`);
  });
  el.querySelector('#rv-reject-selected').addEventListener('click', async () => {
    const items = [...state.selectedReview.values()];
    if (!items.length) return showReviewMsg('Select remarks first.');
    await api('/editor/api/review/reject', { method: 'POST', body: { items } });
    await loadReview(); renderReviewList();
    showReviewMsg(`Rejected ${items.length}.`);
  });
  el.querySelector('#rv-apply-all').addEventListener('click', async () => {
    if (!confirm('Apply ALL pending remarks matching the current filter? This directly changes the translation database.')) return;
    const res = await api('/editor/api/review/apply_all', {
      method: 'POST',
      body: {
        lang: state.reviewFilter.lang,
        kind: state.reviewFilter.kind,
        status: 'pending',
        book_id: state.reviewFilter.book_id,
      },
    });
    const sum = res.summary.reduce((a, s) => a + s.applied, 0);
    const fail = res.summary.reduce((a, s) => a + s.failed, 0);
    await loadReview(); renderReviewList();
    showReviewMsg(`Applied ${sum}, failed ${fail}.`);
  });

  renderReviewList();
}

function renderReviewList() {
  const el = document.getElementById('ed-review-list');
  if (!el) return;
  if (!state.reviewItems.length) {
    el.innerHTML = '<p class="ed-empty">Nothing here. Adjust the filters.</p>';
    return;
  }
  el.innerHTML = state.reviewItems.map(r => {
    const key = `${r.lang}:${r.id}`;
    const checked = state.selectedReview.has(key) ? 'checked' : '';
    const human = r.kind === 'human';
    // New human remarks store the suggestion in `translation`; older ones used
    // `proposed`. AI remarks always use `translation`.
    const suggestion = (human ? (r.proposed || r.translation) : r.translation) || '';
    const fix = r.applicable && suggestion
      ? `<p class="ed-remark-fix"><del>${esc(r.live)}</del> → <ins>${esc(suggestion)}</ins></p>`
      : '';
    const notApplicable = !r.applicable && (suggestion || r.apply_msg)
      ? `<p class="ed-remark-note"><span class="ed-remark-label">Not auto-appliable</span>${esc(r.apply_msg || 'See reasons below')}</p>`
      : '';
    return `
      <div class="ed-rv-item" data-key="${esc(key)}">
        <label class="ed-rv-check">
          <input type="checkbox" class="rv-cb" data-lang="${esc(r.lang)}" data-id="${r.id}" ${checked}>
        </label>
        <div class="ed-rv-body">
          <div class="ed-rv-meta">
            <span class="ed-chip ed-chip-${r.kind}">${human ? 'human' : 'AI'}</span>
            <span class="ed-rv-book">${esc(r.book_id)}</span>
            <span class="ed-rv-pos">¶${r.para_id}.${r.line_id}</span>
            <span class="ed-rv-lang">${esc(r.lang)}</span>
            ${r.editor_name ? `<span class="ed-rv-editor">by ${esc(r.editor_name)}</span>` : ''}
            <em class="ed-st-${r.status}">${r.status}</em>
          </div>
          <div class="ed-rv-pali">${esc(r.pali)}</div>
          ${fix}
          ${notApplicable}
          ${r.conflict ? `<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${esc(r.conflict)}</p>` : ''}
          ${r.note ? `<p class="ed-remark-note">${esc(r.note)}</p>` : ''}
        </div>
      </div>`;
  }).join('');

  el.querySelectorAll('.rv-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const lang = cb.dataset.lang;
      const id = parseInt(cb.dataset.id);
      const key = `${lang}:${id}`;
      if (cb.checked) state.selectedReview.set(key, { lang, id });
      else state.selectedReview.delete(key);
    });
  });
}

function showReviewMsg(text) {
  const el = document.getElementById('rv-msg');
  if (el) el.textContent = text;
}

// ══════════════════════════════════════════════════════════════
// EDITORS VIEW (super admin)
// ══════════════════════════════════════════════════════════════
async function loadEditors() {
  const data = await api('/editor/api/editors');
  return data.editors;
}

function renderEditors() {
  const el = document.getElementById('ed-editors-view');
  el.innerHTML = `
    <div class="ed-editors">
      <div class="ed-review-head">
        <h2>👥 Editor accounts</h2>
        <p class="ed-ws-hint">Only the super admin can create or modify translator accounts. No public registration.</p>
      </div>

      <div class="ed-editors-grid">
        <div class="ed-create-card">
          <h3>Create editor</h3>
          <form id="ed-new-form" class="ed-form" novalidate>
            <label class="ed-field"><span>Display name</span><input type="text" id="ne-name" maxlength="120"></label>
            <label class="ed-field"><span>Email</span><input type="email" id="ne-email" required></label>
            <label class="ed-field"><span>Password (min 8 chars)</span><input type="password" id="ne-pass" required minlength="8"></label>
            <div class="ed-field">
              <span>Can edit languages</span>
              <div class="ed-lang-checkbox-row" id="ne-langs">
                ${state.langs.map(l => `<label class="ed-lang-check"><input type="checkbox" value="${l.code}"> ${esc(l.english_name)}</label>`).join('')}
              </div>
            </div>
            <label class="ed-check"><input type="checkbox" id="ne-super"> Super admin</label>
            <p id="ne-msg" class="ed-error" hidden></p>
            <button type="submit" class="ed-btn ed-btn-primary">Create account</button>
          </form>
        </div>

        <div class="ed-list-card">
          <h3>Translators</h3>
          <div id="ed-editor-list"></div>
        </div>
      </div>
    </div>`;

  document.getElementById('ed-new-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('ne-msg');
    msg.hidden = true;
    const langs = [...document.querySelectorAll('#ne-langs input:checked')].map(i => i.value);
    try {
      await api('/editor/api/editors', {
        method: 'POST',
        body: {
          display_name: document.getElementById('ne-name').value,
          email: document.getElementById('ne-email').value,
          password: document.getElementById('ne-pass').value,
          langs,
          is_super: document.getElementById('ne-super').checked,
        },
      });
      await renderEditorList();
      document.getElementById('ed-new-form').reset();
    } catch (ex) { msg.textContent = ex.message; msg.hidden = false; }
  });

  renderEditorList();
}

async function renderEditorList() {
  const el = document.getElementById('ed-editor-list');
  if (!el) return;
  const editors = await loadEditors();
  el.innerHTML = editors.map(ed => `
    <div class="ed-editor-card" data-eid="${ed.id}">
      <div class="ed-editor-top">
        <div>
          <strong>${esc(ed.display_name || ed.email)}</strong>
          ${ed.is_super ? '<span class="ed-super-tag">admin</span>' : ''}
        </div>
        <div class="ed-editor-actions">
          <button class="ed-btn ed-btn-ghost ed-ed-save" data-eid="${ed.id}">Save</button>
          <button class="ed-btn ed-btn-danger ed-ed-del" data-eid="${ed.id}">Delete</button>
        </div>
      </div>
      <div class="ed-editor-fields">
        <label class="ed-field"><span>Display name</span>
          <input type="text" class="ed-f-name" value="${esc(ed.display_name)}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" class="ed-f-email" value="${esc(ed.email)}"></label>
        <label class="ed-field"><span>New password (leave blank to keep)</span>
          <input type="password" class="ed-f-pass" placeholder="••••••••"></label>
        <div class="ed-field"><span>Languages</span>
          <div class="ed-lang-checkbox-row">
            ${state.langs.map(l =>
              `<label class="ed-lang-check"><input type="checkbox" class="ed-f-lang" value="${l.code}" ${ed.langs.includes(l.code) ? 'checked' : ''}> ${esc(l.english_name)}</label>`
            ).join('')}
          </div>
        </div>
        <label class="ed-check"><input type="checkbox" class="ed-f-super" ${ed.is_super ? 'checked' : ''}> Super admin</label>
      </div>
      <p class="ed-error ed-ed-msg" hidden></p>
    </div>`).join('');

  el.querySelectorAll('.ed-ed-save').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.ed-editor-card');
      const eid = parseInt(btn.dataset.eid);
      const msgEl = card.querySelector('.ed-ed-msg');
      msgEl.hidden = true;
      try {
        const body = {
          display_name: card.querySelector('.ed-f-name').value,
          is_super: card.querySelector('.ed-f-super').checked,
          langs: [...card.querySelectorAll('.ed-f-lang:checked')].map(i => i.value),
        };
        const pass = card.querySelector('.ed-f-pass').value;
        if (pass) body.password = pass;
        await api(`/editor/api/editors/${eid}`, { method: 'PATCH', body });
        msgEl.textContent = '✓ Saved';
        msgEl.classList.add('ed-ok');
        msgEl.hidden = false;
        setTimeout(() => { msgEl.hidden = true; }, 2000);
      } catch (ex) {
        msgEl.textContent = ex.message;
        msgEl.hidden = false;
      }
    });
  });

  el.querySelectorAll('.ed-ed-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const eid = parseInt(btn.dataset.eid);
      if (!confirm('Delete this editor account? This cannot be undone.')) return;
      try {
        await api(`/editor/api/editors/${eid}`, { method: 'DELETE' });
        await renderEditorList();
      } catch (ex) { alert(ex.message); }
    });
  });
}

// ══════════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════════
(async function boot() {
  try {
    const me = await api('/editor/api/me');
    state.me = me;
    await bootWorkspace();
  } catch (_) {
    renderLogin();
  }
})();

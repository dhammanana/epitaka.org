/**
 * editor.js
 * ─────────────────────────────────────────────────────────────
 * E-Piṭaka Translation Editor console (private).
 *
 * Views:
 *   - Login          (email + password, no public registration)
 *   - Workspace      (choose language → book → section → edit lines)
 *   - Review         editors review AI findings; super admins review AI + human
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
  glossary: [],          // context-aware glossary terms for the current section
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

// Renders text that may legitimately contain <b>/<i> markup (Pāli & translation
// text).  Everything is escaped first, then ONLY the two allowed tags are
// turned back into real HTML — any other markup (<script>, <img onerror=…>,
// …) stays escaped, so a malicious value can never inject HTML into the page.
const ALLOWED_TAG = /&lt;(\/?)(b|i)&gt;/gi;
function fmt(s = '') {
  return esc(s).replace(ALLOWED_TAG, (m, slash, tag) => `<${slash}${tag.toLowerCase()}>`);
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
// ACCOUNT MODAL (self-service: display name + password)
// ══════════════════════════════════════════════════════════════
function renderAccountModal() {
  if (document.querySelector('.ed-modal-overlay')) return;
  const me = state.me;
  const overlay = document.createElement('div');
  overlay.className = 'ed-modal-overlay';
  overlay.innerHTML = `
    <div class="ed-modal" role="dialog" aria-modal="true" aria-label="My account">
      <div class="ed-modal-head">
        <h3>👤 My account</h3>
        <button class="ed-modal-close" aria-label="Close">✕</button>
      </div>
      <div class="ed-form">
        <label class="ed-field"><span>Display name</span>
          <input type="text" id="acc-name" maxlength="120" value="${esc(me.display_name || '')}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" id="acc-email" value="${esc(me.email)}" disabled></label>
        <div class="ed-account-sep">Change password</div>
        <label class="ed-field"><span>Current password</span>
          <input type="password" id="acc-cur" autocomplete="current-password"></label>
        <label class="ed-field"><span>New password (min 8 chars)</span>
          <input type="password" id="acc-new" autocomplete="new-password" minlength="8"></label>
        <label class="ed-field"><span>Confirm new password</span>
          <input type="password" id="acc-confirm" autocomplete="new-password" minlength="8"></label>
        <p id="acc-msg" class="ed-error" hidden></p>
        <div class="ed-edit-actions">
          <button class="ed-btn ed-btn-primary" id="acc-save">Save changes</button>
          <span class="ed-save-msg" id="acc-msg-ok"></span>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const onKey = ev => { if (ev.key === 'Escape') close(); };
  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };
  overlay.querySelector('.ed-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  overlay.querySelector('#acc-save').addEventListener('click', async () => {
    const errEl = overlay.querySelector('#acc-msg');
    const okEl = overlay.querySelector('#acc-msg-ok');
    const saveBtn = overlay.querySelector('#acc-save');
    errEl.hidden = true;
    okEl.textContent = '';
    const name = overlay.querySelector('#acc-name').value.trim();
    const cur = overlay.querySelector('#acc-cur').value;
    const neu = overlay.querySelector('#acc-new').value;
    const conf = overlay.querySelector('#acc-confirm').value;
    if (!name) { errEl.textContent = 'Display name cannot be empty.'; errEl.hidden = false; return; }
    const changing = cur || neu || conf;
    if (changing) {
      if (!cur || !neu || !conf) {
        errEl.textContent = 'Fill in all three password fields to change your password.'; errEl.hidden = false; return;
      }
      if (neu.length < 8) {
        errEl.textContent = 'New password must be at least 8 characters.'; errEl.hidden = false; return;
      }
      if (neu !== conf) {
        errEl.textContent = 'New password and confirmation do not match.'; errEl.hidden = false; return;
      }
    }
    saveBtn.disabled = true;
    try {
      await api('/editor/api/account', { method: 'PATCH', body: { display_name: name } });
      if (changing) {
        await api('/editor/api/account/password', {
          method: 'POST',
          body: { current_password: cur, new_password: neu },
        });
      }
      state.me.display_name = name;
      const nameEl = document.querySelector('.ed-user-name');
      if (nameEl) nameEl.textContent = name;
      okEl.textContent = '✓ Saved';
      overlay.querySelector('#acc-cur').value = '';
      overlay.querySelector('#acc-new').value = '';
      overlay.querySelector('#acc-confirm').value = '';
      setTimeout(close, 900);
    } catch (ex) {
      errEl.textContent = ex.message;
      errEl.hidden = false;
      saveBtn.disabled = false;
    }
  });
}

// ══════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════
function renderShell() {
  const me = state.me;
  // Editors review AI findings; super admins also review human proposals and
  // manage accounts.
  const navTabs = `<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>
    <button class="ed-nav-btn" data-view="review">🛂 Review${state.pendingCount ? ` <span class="ed-badge">${state.pendingCount}</span>` : ''}</button>
    ${me.is_super ? '<button class="ed-nav-btn" data-view="editors">👥 Editors</button>' : ''}`;

  root.innerHTML = `
    <header class="ed-topbar">
      <div class="ed-brand">📖 E-Piṭaka <span class="ed-brand-sub">Translation Editor</span></div>
      <nav class="ed-nav">${navTabs}</nav>
      <div class="ed-user">
        <span class="ed-user-name">${esc(me.display_name || me.email)}</span>
        ${me.is_super ? '<span class="ed-super-tag">admin</span>' : ''}
        <button class="ed-btn ed-btn-ghost" id="ed-account">👤 Account</button>
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
  document.getElementById('ed-account').addEventListener('click', renderAccountModal);
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
  state.glossary = [];
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
        <div class="ed-ws-block ed-ws-glossary">
          <div class="ed-ws-label">Glossary <span id="ed-gloss-count" class="ed-gloss-count"></span></div>
          <div id="ed-glossary" class="ed-glossary"></div>
        </div>
      </aside>
      <main class="ed-ws-main">
        <div class="ed-ws-head">
          <h2 class="ed-ws-bookname">${state.currentBook ? esc(state.currentBook.name) : 'Choose a book'}</h2>
          <span class="ed-ws-hint">Click a translation line to propose an edit · double-click a Pāli word for the dictionary</span>
          <span id="ed-check-summary" class="ed-check-summary"></span>
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
  renderGlossary();
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
      state.glossary = [];
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
      state.glossary = data.glossary || [];
      renderLines();
      renderGlossary();
    });
  });
}

// ══════════════════════════════════════════════════════════════
// GLOSSARY (context-aware)
// ══════════════════════════════════════════════════════════════
function renderGlossary() {
  const el = document.getElementById('ed-glossary');
  const countEl = document.getElementById('ed-gloss-count');
  if (!el) return;
  const terms = state.glossary || [];
  if (countEl) countEl.textContent = terms.length ? `${terms.length} term${terms.length === 1 ? '' : 's'}` : '';
  if (!terms.length) {
    el.innerHTML = '<p class="ed-empty">No glossary terms for this section.</p>';
    return;
  }
  el.innerHTML = terms.map(t => `
    <button class="ed-gloss-term" data-word="${esc(t.pali)}" title="${esc(t.translation || '')}">
      <span class="ed-gloss-term-pali">${esc(t.pali)}</span>
      <span class="ed-gloss-term-trans">${esc(t.translation || '')}</span>
    </button>
    ${t.note ? `<p class="ed-gloss-note">${esc(t.note)}</p>` : ''}
  `).join('');
  el.querySelectorAll('.ed-gloss-term').forEach(btn => {
    btn.addEventListener('click', () => showLookup(btn.dataset.word, btn));
  });
}

function escRegex(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Lookbehind in regex needs Safari 16.4+ / modern Chrome/Firefox.  The editor
// is an internal tool, but guard so old browsers fall back to no highlighting
// instead of throwing inside renderLines.
let SUPPORTS_LOOKBEHIND = true;
try { new RegExp('(?<=a)b'); } catch (_) { SUPPORTS_LOOKBEHIND = false; }

// Wraps glossary terms that appear in each Pāli line with a highlighted span.
// Runs on the rendered DOM (text nodes only) so the <b>/<i> markup is untouched.
function highlightGlossaryTerms() {
  // Single words first (so longer terms win overlap), then multi-word phrases.
  const terms = (state.glossary || [])
    .filter(t => t.pali && t.pali.length <= 40)
    .sort((a, b) => b.pali.length - a.pali.length);
  if (!SUPPORTS_LOOKBEHIND || !terms.length) return;
  document.querySelectorAll('.ed-line-pali').forEach(div => {
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue || '';
      if (!text) return;
      // Find all whole-word matches (longer terms first), then keep non-overlapping.
      const ranges = [];
      for (const t of terms) {
        const re = new RegExp(`(?<![\\p{L}\\p{N}])(${escRegex(t.pali)})(?![\\p{L}\\p{N}])`, 'giu');
        let m;
        while ((m = re.exec(text)) !== null) ranges.push({ start: m.index, end: m.index + m[1].length, term: t });
      }
      if (!ranges.length) return;
      ranges.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
      const keep = [];
      let curEnd = -1;
      for (const r of ranges) {
        if (r.start >= curEnd) { keep.push(r); curEnd = r.end; }
      }
      const parent = node.parentNode;
      const frag = document.createDocumentFragment();
      let pos = 0;
      for (const r of keep) {
        if (r.start > pos) frag.appendChild(document.createTextNode(text.slice(pos, r.start)));
        const span = document.createElement('span');
        span.className = 'ed-gloss-hit';
        span.dataset.word = r.term.pali;
        span.title = r.term.translation || 'Glossary term';
        span.textContent = text.slice(r.start, r.end);
        frag.appendChild(span);
        pos = r.end;
      }
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      parent.replaceChild(frag, node);
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

  // Summary bar for suspicious lines flagged by the length check.
  const flaggedCount = state.sentences.filter(s => (s.checks || []).length).length;
  const summaryEl = document.getElementById('ed-check-summary');
  if (summaryEl) {
    summaryEl.textContent = flaggedCount ? `⚠ ${flaggedCount} line${flaggedCount === 1 ? '' : 's'} flagged by length check — hover the chip for details` : '';
  }

  el.innerHTML = state.sentences.map((s, i) => {
    const remarks = _remarksFor(s.para_id, s.line_id);
    const aiRemarks = remarks.filter(r => r.kind === 'ai');
    const humanRemarks = remarks.filter(r => r.kind === 'human');

    const aiHtml = aiRemarks.map(r => `
      <div class="ed-remark ed-remark-ai" title="AI finding">
        <div class="ed-remark-head">⚡ AI finding${r.status === 'applied' ? ' <em class="ed-st-applied">· applied</em>' : ''}</div>
        ${r.translation && r.translation !== s.translation
          ? `<p class="ed-remark-fix"><span class="ed-remark-label">Suggestion</span><ins>${fmt(r.translation)}</ins></p>`
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
          ? `<p class="ed-remark-fix"><del>${fmt(s.translation)}</del> → <ins>${fmt(suggestion)}</ins></p>`
          : ''}
      </div>`;
    }).join('');

    const hasPending = humanRemarks.some(r => r.status === 'pending');
    const checkChips = (s.checks || []).map(c =>
      `<span class="ed-chip ed-chip-check ed-chip-${c.code}" title="${esc(c.msg)}">⚠ ${esc(c.label)}</span>`
    ).join('');

    return `
      <div class="ed-line" data-para="${s.para_id}" data-line="${s.line_id}" id="edl-${s.para_id}-${s.line_id}">
        <div class="ed-line-meta">
          <span class="ed-line-num">¶${s.para_id}.${s.line_id}</span>
          ${hasPending ? '<span class="ed-chip ed-chip-pending">proposed</span>' : ''}
          ${checkChips}
        </div>
        <div class="ed-line-pali" data-role="pali" title="Double-click a Pāli word for the dictionary">${fmt(s.pali)}</div>
        <div class="ed-line-trans" data-role="trans">${fmt(s.translation)}</div>
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

  // Inline editing: click on the translation text opens the edit box.  The
  // static translation display is hidden while editing so the text appears
  // only once (in the textarea).
  el.querySelectorAll('.ed-line-trans').forEach(trans => {
    trans.addEventListener('click', () => {
      const line = trans.closest('.ed-line');
      const box = line.querySelector('.ed-edit-box');
      trans.hidden = true;
      box.hidden = false;
      const ta = line.querySelector('.ed-textarea');
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    });
  });

  // Glossary term highlighting + dictionary lookup on the Pāli text.
  highlightGlossaryTerms();
  el.querySelectorAll('.ed-gloss-hit').forEach(span => {
    span.addEventListener('click', ev => {
      ev.stopPropagation();
      showLookup(span.dataset.word, span);
    });
  });
  el.querySelectorAll('.ed-line-pali').forEach(pali => {
    pali.addEventListener('dblclick', ev => {
      let word = '';
      const sel = window.getSelection();
      if (sel && sel.rangeCount && !sel.isCollapsed) word = sel.toString().trim();
      if (!word || /\s/.test(word) || word.length > 40) word = wordAtPoint(pali, ev.clientX, ev.clientY);
      if (!word) return;
      showLookup(word, ev.target);
    });
  });

  el.querySelectorAll('.ed-edit-box').forEach(box => {
    const line = box.closest('.ed-line');
    const para = parseInt(line.dataset.para);
    const lid = parseInt(line.dataset.line);

    box.querySelector('.ed-cancel').addEventListener('click', () => {
      box.hidden = true;
      line.querySelector('.ed-line-trans').hidden = false;
    });

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
// REVIEW VIEW
// Editors review AI findings only; super admins review AI + human.
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
  const isSuper = !!state.me?.is_super;
  if (!isSuper) state.reviewFilter.kind = 'ai';
  const kindFilter = isSuper
    ? `<select id="rf-kind">
        <option value="">All kinds</option>
        <option value="human" ${state.reviewFilter.kind === 'human' ? 'selected' : ''}>Human proposals</option>
        <option value="ai" ${state.reviewFilter.kind === 'ai' ? 'selected' : ''}>AI findings</option>
      </select>`
    : '<span class="ed-filter-note">AI findings</span>';
  const hint = isSuper
    ? 'Approve AI findings and human proposals. Applied changes write directly into the translation database.'
    : 'You review the AI findings; the admin reviews human proposals. Applied changes write directly into the translation database.';
  el.innerHTML = `
    <div class="ed-review">
      <div class="ed-review-head">
        <h2>🛂 Review queue</h2>
        <p class="ed-ws-hint">${esc(hint)}</p>
      </div>
      <div class="ed-filters">
        <select id="rf-lang">
          <option value="">All languages</option>
          ${state.langs.map(l => `<option value="${l.code}" ${state.reviewFilter.lang === l.code ? 'selected' : ''}>${esc(l.english_name)}</option>`).join('')}
        </select>
        ${kindFilter}
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
      const kindSel = document.getElementById('rf-kind');
      if (kindSel) state.reviewFilter.kind = kindSel.value;
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

  // Load the queue on arrival so the view is never empty on first open.
  loadReview()
    .then(() => renderReviewList())
    .catch(ex => showReviewMsg(ex.message));
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
      ? `<p class="ed-remark-fix"><del>${fmt(r.live)}</del> → <ins>${fmt(suggestion)}</ins></p>`
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
          <div class="ed-rv-pali">${fmt(r.pali)}</div>
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
// DICTIONARY LOOKUP POPOVER (DPD)
// ══════════════════════════════════════════════════════════════
// Returns the word under (x, y) inside `rootEl`, if any.
function wordAtPoint(rootEl, x, y) {
  const range = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
  if (!range || !range.startContainer || !rootEl.contains(range.startContainer)) return '';
  const text = range.startContainer.nodeValue || '';
  let pos = range.startOffset;
  let start = pos, end = pos;
  while (start > 0 && /[\p{L}\p{N}]/u.test(text[start - 1])) start--;
  while (end < text.length && /[\p{L}\p{N}]/u.test(text[end])) end++;
  return text.slice(start, end);
}

function hideLookup() {
  document.querySelectorAll('.ed-lookup-pop').forEach(p => p.remove());
}

document.addEventListener('click', ev => {
  if (!ev.target.closest('.ed-lookup-pop')) hideLookup();
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') hideLookup();
});

async function showLookup(word, anchor) {
  hideLookup();
  if (!word) return;
  const pop = document.createElement('div');
  pop.className = 'ed-lookup-pop';
  pop.innerHTML = `
    <div class="ed-lookup-head">
      <span class="ed-lookup-title">📖 ${esc(word)}</span>
      <button class="ed-lookup-close" aria-label="Close">✕</button>
    </div>
    <div class="ed-lookup-body ed-empty">Looking up…</div>`;
  document.body.appendChild(pop);
  const rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
  const left = rect ? rect.left : 120;
  const top = rect ? rect.bottom + 8 : 120;
  pop.style.left = `${Math.max(8, Math.min(left, window.innerWidth - 360))}px`;
  pop.style.top = `${Math.max(8, Math.min(top, window.innerHeight - 200))}px`;
  pop.querySelector('.ed-lookup-close').addEventListener('click', hideLookup);
  try {
    const data = await api(`/editor/api/lookup?word=${encodeURIComponent(word)}`);
    const body = pop.querySelector('.ed-lookup-body');
    if (!data.results || !data.results.length) {
      body.textContent = 'No dictionary entry found for this word.';
      return;
    }
    body.innerHTML = data.results.map(r => `
      <div class="ed-lookup-entry">
        <div class="ed-lookup-word">${esc(r.word)}${r.book_name ? ` <span class="ed-lookup-src">${esc(r.book_name)}</span>` : ''}</div>
        ${r.type === 'deconstruction' && r.deconstruction ? `<div class="ed-lookup-def">${esc(r.deconstruction)}</div>` : ''}
        ${r.definition ? `<div class="ed-lookup-def">${esc(r.definition)}</div>` : ''}
      </div>`).join('');
  } catch (ex) {
    pop.querySelector('.ed-lookup-body').textContent = ex.message;
  }
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

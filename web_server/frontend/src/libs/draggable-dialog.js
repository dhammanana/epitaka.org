/**
 * draggable-dialog.js
 * A lightweight, framework-free library for draggable, minimizable,
 * resizable floating dialogs that gracefully adapt to all screen sizes.
 *
 * Usage:
 *   import { createDraggableDialog } from './libs/draggable-dialog.js';
 *
 *   const dlg = createDraggableDialog({
 *     id:        'my-dialog',           // unique id (optional, auto-generated)
 *     title:     'Dialog Title',        // header text
 *     content:   htmlStringOrElement,   // body content
 *     width:     480,                   // initial width  (px, clamped to viewport)
 *     height:    520,                   // initial height (px, clamped to viewport)
 *     minWidth:  300,
 *     minHeight: 200,
 *     className: 'my-extra-class',      // added to .dd-dialog
 *     onClose:   () => {},              // called after dialog is removed
 *     onMinimize: (minimized) => {},    // called on minimize/restore
 *   });
 *
 *   dlg.open();         // mount & show
 *   dlg.close();        // animate out & remove
 *   dlg.minimize();     // collapse to title bar
 *   dlg.restore();      // expand back
 *   dlg.setTitle(str);  // update title text
 *   dlg.setContent(el); // replace body
 *   dlg.bringToFront(); // raise z-index
 *   dlg.el;             // the .dd-dialog DOM element
 *   dlg.bodyEl;         // the .dd-body DOM element
 */

// ─── Z-index manager ────────────────────────────────────────────────────────
let _topZ = 800;
function nextZ() { return ++_topZ; }

// ─── Unique ID helper ────────────────────────────────────────────────────────
let _uid = 0;
function uid() { return `dd-${Date.now()}-${++_uid}`; }

// ─── CSS (injected once) ────────────────────────────────────────────────────
const STYLE_ID = 'draggable-dialog-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* ════════════════════════════════════════════
   Draggable Dialog  –  draggable-dialog.js
   ════════════════════════════════════════════ */

/* Mobile: full-screen sheet */
.dd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.42);
  z-index: 750;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  transition: opacity 0.2s;
}
.dd-overlay.dd-hidden { opacity: 0; pointer-events: none; }

.dd-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--surface, #fff);
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -4px 48px rgba(0,0,0,0.22);
  width: 100%;
  max-width: 100%;
  max-height: 92dvh;
  overflow: hidden;
  transition: height 0.22s cubic-bezier(.4,0,.2,1),
              border-radius 0.22s,
              transform 0.22s cubic-bezier(.4,0,.2,1),
              opacity 0.18s;
  will-change: transform, height;
  user-select: none;
}
.dd-dialog.dd-animating-in  { animation: dd-slide-up 0.22s cubic-bezier(.4,0,.2,1) both; }
.dd-dialog.dd-animating-out { animation: dd-slide-down 0.22s cubic-bezier(.4,0,.2,1) both; }

@keyframes dd-slide-up   { from { transform: translateY(40px); opacity:0; } to { transform:none; opacity:1; } }
@keyframes dd-slide-down { from { transform:none; opacity:1; } to { transform: translateY(40px); opacity:0; } }

/* Desktop: floating panel */
@media (min-width: 640px) {
  .dd-overlay {
    align-items: center;
    justify-content: center;
    padding: 1rem;
    pointer-events: none;        /* let clicks pass through to stacked dialogs */
    background: transparent;
  }
  .dd-overlay.dd-backdrop { background: rgba(0,0,0,0.32); pointer-events: all; }

  .dd-dialog {
    pointer-events: all;
    position: fixed;             /* JS overrides top/left */
    border-radius: 14px;
    max-height: 90dvh;
    max-width: 90vw;
    box-shadow: 0 8px 48px rgba(0,0,0,0.24), 0 1px 0 rgba(255,255,255,0.08) inset;
    transition: height 0.22s cubic-bezier(.4,0,.2,1),
                border-radius 0.22s,
                opacity 0.18s;  /* no transform transition on desktop while dragging */
    resize: none;
  }
  .dd-dialog.dd-animating-in  { animation: dd-pop-in  0.22s cubic-bezier(.4,0,.2,1) both; }
  .dd-dialog.dd-animating-out { animation: dd-pop-out 0.18s cubic-bezier(.4,0,.2,1) both; }

  @keyframes dd-pop-in  { from { opacity:0; transform: scale(0.94) translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes dd-pop-out { from { opacity:1; transform:none; } to { opacity:0; transform: scale(0.94) translateY(8px); } }
}

/* ── Header / drag handle ─────────────────── */
.dd-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem 0.4rem;
  background: var(--surface, #fff);
  border-bottom: 1px solid var(--border, #e5ddd6);
  flex-shrink: 0;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile: show a drag handle pill */
.dd-header::before {
  content: '';
  display: block;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border, #d5c9bd);
  opacity: 0.7;
}
@media (min-width: 640px) {
  .dd-header { cursor: grab; padding: 0.2rem 0.9rem 0.25rem;}
  .dd-header:active { cursor: grabbing; }
  .dd-header::before { display: none; }
}

.dd-drag-icon {
  flex-shrink: 0;
  display: none;
  color: var(--muted, #999);
  opacity: 0.5;
  font-size: 0.9rem;
}
@media (min-width: 640px) { .dd-drag-icon { display: block; } }

.dd-title {
  flex: 1;
  font-family: var(--font-serif, Georgia, serif);
  font-size: 0.97rem;
  font-weight: 600;
  color: var(--accent, #8b5c2a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.dd-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 7px;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--muted, #888);
  transition: background 0.12s, color 0.12s;
  padding: 0;
  line-height: 1;
}
.dd-btn:hover {
  background: var(--accent-light, #f5e9dc);
  color: var(--accent, #8b5c2a);
}
.dd-btn:focus-visible {
  outline: 2px solid var(--accent, #8b5c2a);
  outline-offset: 1px;
}
.dd-btn-minimize { font-size: 1.1rem; font-weight: 700; }
.dd-btn-close    { font-size: 1rem; }

/* ── Body ────────────────────────────────── */
.dd-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0;                    /* callers manage their own padding */
}
.dd-body::-webkit-scrollbar { width: 4px; }
.dd-body::-webkit-scrollbar-thumb { background: #d5c9bd; border-radius: 2px; }

/* ── Minimized state ─────────────────────── */
.dd-dialog.dd-minimized .dd-body { display: none; }
.dd-dialog.dd-minimized {
  height: auto !important;
  min-height: unset !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
}
@media (max-width: 639px) {
  .dd-dialog.dd-minimized { border-radius: 14px 14px 0 0 !important; }
}

/* ── Resize handle (desktop only) ────────── */
.dd-resize-handle {
  display: none;
}
@media (min-width: 640px) {
  .dd-resize-handle {
    display: block;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
    z-index: 2;
    opacity: 0.4;
    transition: opacity 0.15s;
  }
  .dd-resize-handle::after {
    content: '';
    display: block;
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 10px;
    height: 10px;
    border-right: 2px solid var(--muted, #999);
    border-bottom: 2px solid var(--muted, #999);
    border-radius: 0 0 3px 0;
  }
  .dd-resize-handle:hover { opacity: 0.9; }
}

/* ── Stacked / raised ─────────────────────── */
.dd-dialog.dd-raised { box-shadow: 0 12px 60px rgba(0,0,0,0.28); }

/* ── Snap to edge indicator ──────────────── */
.dd-dialog.dd-snapped-left  { border-radius: 0 14px 14px 0 !important; }
.dd-dialog.dd-snapped-right { border-radius: 14px 0 0 14px !important; }
  `;
  document.head.appendChild(style);
}

// ─── Core factory ────────────────────────────────────────────────────────────

/**
 * @param {Object} opts
 * @returns {{ open, close, minimize, restore, toggle, setTitle, setContent, bringToFront, el, bodyEl }}
 */
export function createDraggableDialog(opts = {}) {
  injectStyles();

  const {
    id         = uid(),
    title      = '',
    content    = '',
    width      = 520,
    height     = 560,
    minWidth   = 280,
    minHeight  = 160,
    className  = '',
    onClose    = null,
    onMinimize = null,
  } = opts;

  const isDesktop = () => window.matchMedia('(min-width: 640px)').matches;

  // ── Build DOM ─────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'dd-overlay';
  overlay.setAttribute('role', 'presentation');

  const dialog = document.createElement('div');
  dialog.className = `dd-dialog${className ? ' ' + className : ''}`;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  dialog.id = id;

  // Header
  const header = document.createElement('div');
  header.className = 'dd-header';

  const dragIcon = document.createElement('span');
  dragIcon.className = 'dd-drag-icon';
  dragIcon.setAttribute('aria-hidden', 'true');
  dragIcon.innerHTML = `<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
    <circle cx="4" cy="3" r="1.3"/><circle cx="8" cy="3" r="1.3"/>
    <circle cx="4" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/>
    <circle cx="4" cy="13" r="1.3"/><circle cx="8" cy="13" r="1.3"/>
  </svg>`;

  const titleEl = document.createElement('span');
  titleEl.className = 'dd-title';
  titleEl.id = `${id}-title`;
  titleEl.textContent = title;

  const controls = document.createElement('div');
  controls.className = 'dd-controls';

  const minBtn = document.createElement('button');
  minBtn.className = 'dd-btn dd-btn-minimize';
  minBtn.setAttribute('aria-label', 'Minimize');
  minBtn.title = 'Minimize';
  minBtn.innerHTML = '&minus;';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dd-btn dd-btn-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.title = 'Close';
  closeBtn.innerHTML = '&#x2715;';

  controls.append(minBtn, closeBtn);
  header.append(dragIcon, titleEl, controls);

  // Body
  const body = document.createElement('div');
  body.className = 'dd-body';
  if (typeof content === 'string') body.innerHTML = content;
  else if (content instanceof Element) body.appendChild(content);

  // Resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'dd-resize-handle';
  resizeHandle.setAttribute('aria-hidden', 'true');

  dialog.append(header, body, resizeHandle);
  overlay.appendChild(dialog);

  // ── State ──────────────────────────────────────────────────
  let minimized = false;
  let _savedHeight = null;
  let mounted = false;

  // ── Positioning (desktop) ─────────────────────────────────
  function applyDesktopSize() {
    if (!isDesktop()) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w  = Math.min(width,  vw - 32);
    const h  = Math.min(height, vh - 32);
    dialog.style.width  = `${w}px`;
    dialog.style.height = `${h}px`;
    _savedHeight = h;
  }

  function centerOnScreen() {
    if (!isDesktop()) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w  = dialog.offsetWidth  || Math.min(width,  vw - 32);
    const h  = dialog.offsetHeight || Math.min(height, vh - 32);
    dialog.style.left = `${Math.round((vw - w) / 2)}px`;
    dialog.style.top  = `${Math.round((vh - h) / 2)}px`;
  }

  function clampToViewport() {
    if (!isDesktop()) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let  l = parseFloat(dialog.style.left) || 0;
    let  t = parseFloat(dialog.style.top)  || 0;
    const w = dialog.offsetWidth;
    const h = dialog.offsetHeight;
    l = Math.max(0, Math.min(l, vw - w));
    t = Math.max(0, Math.min(t, vh - 40));  // keep header accessible
    dialog.style.left = `${l}px`;
    dialog.style.top  = `${t}px`;
  }

  // ── Drag (mouse + touch, desktop only) ───────────────────
  let _dragging  = false;
  let _dragOffX  = 0;
  let _dragOffY  = 0;

  function onDragStart(e) {
    if (!isDesktop()) return;
    if (e.target.closest('.dd-controls')) return;       // don't drag via buttons
    if (e.button !== undefined && e.button !== 0) return;
    _dragging = true;
    const rect = dialog.getBoundingClientRect();
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    _dragOffX  = cx - rect.left;
    _dragOffY  = cy - rect.top;
    dialog.style.transition = 'none';
    bringToFront();
    e.preventDefault();
  }

  function onDragMove(e) {
    if (!_dragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = cx - _dragOffX;
    let top  = cy - _dragOffY;
    const w = dialog.offsetWidth;
    left = Math.max(0, Math.min(left, vw - w));
    top  = Math.max(0, Math.min(top,  vh - 40));
    dialog.style.left = `${left}px`;
    dialog.style.top  = `${top}px`;
    e.preventDefault();
  }

  function onDragEnd() {
    if (!_dragging) return;
    _dragging = false;
    dialog.style.transition = '';
    clampToViewport();
  }

  header.addEventListener('mousedown',  onDragStart, { passive: false });
  header.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('mousemove',  onDragMove, { passive: false });
  document.addEventListener('touchmove',  onDragMove, { passive: false, capture: true });
  document.addEventListener('mouseup',   onDragEnd);
  document.addEventListener('touchend',  onDragEnd);

  // ── Resize (mouse, desktop) ───────────────────────────────
  let _resizing = false;
  let _resizeStartX = 0;
  let _resizeStartY = 0;
  let _resizeStartW = 0;
  let _resizeStartH = 0;

  resizeHandle.addEventListener('mousedown', e => {
    if (!isDesktop() || minimized) return;
    _resizing     = true;
    _resizeStartX = e.clientX;
    _resizeStartY = e.clientY;
    _resizeStartW = dialog.offsetWidth;
    _resizeStartH = dialog.offsetHeight;
    dialog.style.transition = 'none';
    bringToFront();
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', e => {
    if (!_resizing) return;
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const l   = parseFloat(dialog.style.left) || 0;
    const t   = parseFloat(dialog.style.top)  || 0;
    const dx  = e.clientX - _resizeStartX;
    const dy  = e.clientY - _resizeStartY;
    const w   = Math.max(minWidth,  Math.min(_resizeStartW + dx, vw - l - 8));
    const h   = Math.max(minHeight, Math.min(_resizeStartH + dy, vh - t - 8));
    dialog.style.width  = `${w}px`;
    dialog.style.height = `${h}px`;
    _savedHeight = h;
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    if (_resizing) { _resizing = false; dialog.style.transition = ''; }
  });

  // ── Mobile swipe-to-close ─────────────────────────────────
  let _touchStartY = 0;
  let _touchCurY   = 0;

  header.addEventListener('touchstart', e => {
    if (isDesktop()) return;
    _touchStartY = e.touches[0].clientY;
    _touchCurY   = _touchStartY;
  }, { passive: true });

  header.addEventListener('touchmove', e => {
    if (isDesktop()) return;
    _touchCurY = e.touches[0].clientY;
    const dy = Math.max(0, _touchCurY - _touchStartY);
    dialog.style.transform = `translateY(${dy}px)`;
    dialog.style.transition = 'none';
  }, { passive: true });

  header.addEventListener('touchend', () => {
    if (isDesktop()) return;
    const dy = _touchCurY - _touchStartY;
    dialog.style.transition = '';
    dialog.style.transform  = '';
    if (dy > 90) close();
  });

  // ── Minimize / restore ────────────────────────────────────
  function minimize() {
    if (minimized) return;
    minimized = true;
    _savedHeight = dialog.offsetHeight;
    dialog.classList.add('dd-minimized');
    minBtn.innerHTML = '&#x25A1;';
    minBtn.setAttribute('aria-label', 'Restore');
    minBtn.title = 'Restore';
    if (onMinimize) onMinimize(true);
  }

  function restore() {
    if (!minimized) return;
    minimized = false;
    dialog.classList.remove('dd-minimized');
    if (_savedHeight && isDesktop()) dialog.style.height = `${_savedHeight}px`;
    minBtn.innerHTML = '&minus;';
    minBtn.setAttribute('aria-label', 'Minimize');
    minBtn.title = 'Minimize';
    if (onMinimize) onMinimize(false);
  }

  function toggleMinimize() {
    minimized ? restore() : minimize();
  }

  minBtn.addEventListener('click', toggleMinimize);

  // Double-click header to minimize/restore (desktop)
  header.addEventListener('dblclick', e => {
    if (!isDesktop()) return;
    if (e.target.closest('.dd-controls')) return;
    toggleMinimize();
  });

  // ── Z / focus ─────────────────────────────────────────────
  function bringToFront() {
    dialog.style.zIndex = nextZ();
    dialog.classList.add('dd-raised');
  }

  dialog.addEventListener('mousedown', bringToFront, { capture: true });
  dialog.addEventListener('touchstart', bringToFront, { capture: true, passive: true });

  // ── Close ─────────────────────────────────────────────────
  function close() {
    dialog.classList.add('dd-animating-out');
    overlay.classList.add('dd-hidden');

    // Cleanup drag/resize listeners on close
    document.removeEventListener('mousemove',  onDragMove);
    document.removeEventListener('touchmove',  onDragMove, { capture: true });
    document.removeEventListener('mouseup',    onDragEnd);
    document.removeEventListener('touchend',   onDragEnd);

    const dur = parseFloat(getComputedStyle(dialog).animationDuration || 0) * 1000 || 200;
    setTimeout(() => {
      overlay.remove();
      mounted = false;
      if (onClose) onClose();
    }, dur + 20);
  }

  closeBtn.addEventListener('click', close);

  // Mobile: overlay tap closes (but not desktop — overlay is transparent there)
  overlay.addEventListener('click', e => {
    if (!isDesktop() && e.target === overlay) close();
  });

  // Escape key
  const onEsc = e => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
  };

  // ── Open ─────────────────────────────────────────────────
  function open() {
    if (mounted) { bringToFront(); return; }
    mounted = true;
    document.body.appendChild(overlay);
    dialog.classList.add('dd-animating-in');
    bringToFront();

    // Desktop-specific positioning
    if (isDesktop()) {
      overlay.classList.add('dd-backdrop');
      applyDesktopSize();
      requestAnimationFrame(() => {
        centerOnScreen();
      });
    }

    dialog.addEventListener('animationend', () => {
      dialog.classList.remove('dd-animating-in', 'dd-animating-out');
    }, { once: true });

    document.addEventListener('keydown', onEsc);

    // Respond to viewport resize
    window.addEventListener('resize', onViewportResize);
  }

  function onViewportResize() {
    if (!mounted) { window.removeEventListener('resize', onViewportResize); return; }
    if (isDesktop()) {
      overlay.classList.add('dd-backdrop');
      clampToViewport();
    } else {
      overlay.classList.remove('dd-backdrop');
      dialog.style.left   = '';
      dialog.style.top    = '';
      dialog.style.width  = '';
      dialog.style.height = minimized ? '' : '';
    }
  }

  // ── Public API ────────────────────────────────────────────
  function setTitle(text) { titleEl.textContent = text; }
  function setContent(el) {
    body.innerHTML = '';
    if (typeof el === 'string') body.innerHTML = el;
    else if (el instanceof Element) body.appendChild(el);
  }

  return {
    open,
    close,
    minimize,
    restore,
    toggle: toggleMinimize,
    bringToFront,
    setTitle,
    setContent,
    el:     dialog,
    bodyEl: body,
    get minimized() { return minimized; },
  };
}
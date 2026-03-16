/**
 * auth-ui.js
 * ───────────────────────────────────────────────────────────
 * Renders:
 *   1. Avatar button injected into #topbar .topbar-right
 *   2. Login dialog  (Google / Facebook)
 *   3. Profile management dialog (edit name & avatar URL)
 *   4. Dropdown user menu
 *
 * All DOM is injected at runtime so book.html stays clean.
 */

import { showLibraryDialog } from '../row_actions/library-ui.js';
import '../css/auth.css';
import {
  auth,
  signInWithGoogle,
  signInWithFacebook,
  signOutUser,
  updateProfile,
} from './auth.js';

// ── Build and inject all DOM shells once ──────────────────────
function injectShell() {
  // Avatar button ─── goes at the start of .topbar-right
  if (!document.getElementById('auth-avatar-btn')) {
    const btn = document.createElement('button');
    btn.id        = 'auth-avatar-btn';
    btn.className = 'topbar-btn auth-avatar-btn';
    btn.setAttribute('aria-label', 'Account');
    btn.innerHTML = `
      <span class="auth-avatar-inner">
        <img id="auth-avatar-img" src="" alt="" hidden>
        <span id="auth-avatar-initials" aria-hidden="true">👤</span>
      </span>`;
    document.querySelector('.topbar-right')?.prepend(btn);
  }

  // Login dialog — no `hidden` attribute; visibility is controlled by CSS classes
  if (!document.getElementById('auth-login-dialog')) {
    document.body.insertAdjacentHTML('beforeend', `
<div id="auth-login-dialog" class="auth-backdrop" aria-modal="true" role="dialog" aria-labelledby="auth-login-title">
  <div class="auth-dialog auth-login-box">
    <button class="auth-dialog-close" data-close="auth-login-dialog" aria-label="Close">✕</button>
    <div class="auth-brand">📖</div>
    <h2 id="auth-login-title" class="auth-dialog-title">Sign in to E-Piṭaka</h2>
    <p class="auth-dialog-sub">Add notes and study alongside the community</p>
    <div class="auth-providers">
      <button id="btn-google"   class="auth-provider-btn" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <button id="btn-facebook" class="auth-provider-btn" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>
    </div>
    <p id="auth-login-error" class="auth-error-msg" style="display:none"></p>
    <p class="auth-legal">By continuing you agree to our <a href="#">Terms</a></p>
  </div>
</div>`);
  }

  // Profile dialog — no `hidden` attribute; controlled by CSS classes
  if (!document.getElementById('auth-profile-dialog')) {
    document.body.insertAdjacentHTML('beforeend', `
<div id="auth-profile-dialog" class="auth-backdrop" aria-modal="true" role="dialog" aria-labelledby="auth-profile-title">
  <div class="auth-dialog auth-profile-box">
    <button class="auth-dialog-close" data-close="auth-profile-dialog" aria-label="Close">✕</button>
    <h2 id="auth-profile-title" class="auth-dialog-title">My Profile</h2>

    <div class="auth-profile-hero">
      <div class="auth-profile-avatar" id="profile-avatar-wrap">
        <img id="profile-avatar-img" src="" alt="" hidden>
        <span id="profile-avatar-initials"></span>
      </div>
      <div>
        <div id="profile-hero-name"  class="auth-profile-name"></div>
        <div id="profile-hero-email" class="auth-profile-email"></div>
      </div>
    </div>

    <form id="auth-profile-form" novalidate>
      <label class="auth-label" for="profile-input-name">Display name</label>
      <input id="profile-input-name"  class="auth-input" type="text" maxlength="80" placeholder="Your name" autocomplete="off">

      <label class="auth-label" for="profile-input-photo">Avatar URL <small>(optional)</small></label>
      <input id="profile-input-photo" class="auth-input" type="url"  maxlength="512" placeholder="https://…" autocomplete="off">

      <button type="submit" class="auth-submit-btn">Save changes</button>
      <p id="profile-status" class="auth-status-msg" aria-live="polite"></p>
    </form>

    <hr class="auth-rule">
    <button id="btn-signout" class="auth-signout-btn" type="button">Sign out</button>
  </div>
</div>`);
  }

  // Dropdown user menu — visibility controlled by CSS .is-visible/.open classes
  if (!document.getElementById('auth-user-menu')) {
    document.body.insertAdjacentHTML('beforeend', `
<div id="auth-user-menu" class="auth-user-menu" role="menu">
  <div id="auth-menu-name"  class="auth-menu-name"></div>
  <div id="auth-menu-email" class="auth-menu-email"></div>
  <hr class="auth-menu-rule">
  <button class="auth-menu-item" id="auth-menu-library-btn" role="menuitem">📚 My Library</button>
  <button class="auth-menu-item" id="auth-menu-profile-btn" role="menuitem">⚙&#xFE0E; Manage profile</button>
  <button class="auth-menu-item auth-menu-danger" id="auth-menu-signout-btn" role="menuitem">↩ Sign out</button>
</div>`);
  }
}

// ── Open / close dialogs ──────────────────────────────────────
// We do NOT use the `hidden` attribute because it sets display:none which
// prevents CSS opacity/transform transitions from running.
// Instead we use .is-visible to show the backdrop, and .open for the animation.
function openDialog(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('is-visible');
  // Double rAF guarantees the browser has painted is-visible before adding .open
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
}
function closeDialog(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  const onEnd = () => { el.classList.remove('is-visible'); };
  el.addEventListener('transitionend', onEnd, { once: true });
  // Fallback in case transitionend doesn't fire (e.g. reduced-motion)
  setTimeout(onEnd, 300);
}

export function showLoginDialog()   { closeUserMenu(); openDialog('auth-login-dialog'); }
export function hideLoginDialog()   { closeDialog('auth-login-dialog'); }
export function showProfileDialog() { closeUserMenu(); _populateProfile(); openDialog('auth-profile-dialog'); }
export function hideProfileDialog() { closeDialog('auth-profile-dialog'); }

// ── User menu ─────────────────────────────────────────────────
function openUserMenu() {
  const menu = document.getElementById('auth-user-menu');
  const btn  = document.getElementById('auth-avatar-btn');
  if (!menu || !btn) return;
  const rect = btn.getBoundingClientRect();
  menu.style.top   = `${rect.bottom + 6}px`;
  menu.style.right = `${window.innerWidth - rect.right}px`;
  menu.classList.add('is-visible');
  requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('open')));
}
function closeUserMenu() {
  const menu = document.getElementById('auth-user-menu');
  if (!menu) return;
  menu.classList.remove('open');
  const onEnd = () => { menu.classList.remove('is-visible'); };
  menu.addEventListener('transitionend', onEnd, { once: true });
  setTimeout(onEnd, 200);
}

// ── Avatar helpers ────────────────────────────────────────────
function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) || '?';
}

function setAvatar(imgEl, initialsEl, profile) {
  if (profile?.photo_url) {
    imgEl.src             = profile.photo_url;
    imgEl.hidden          = false;
    initialsEl.hidden     = true;
  } else {
    imgEl.hidden          = true;
    initialsEl.hidden     = false;
    initialsEl.textContent = initials(profile?.display_name);
  }
}

// ── Populate profile form ─────────────────────────────────────
function _populateProfile() {
  const p = auth.profile;
  if (!p) return;
  document.getElementById('profile-hero-name').textContent  = p.display_name || '';
  document.getElementById('profile-hero-email').textContent = p.email || '';
  document.getElementById('profile-input-name').value       = p.display_name || '';
  document.getElementById('profile-input-photo').value      = p.photo_url    || '';
  setAvatar(
    document.getElementById('profile-avatar-img'),
    document.getElementById('profile-avatar-initials'),
    p
  );
}

// ── React to auth state ───────────────────────────────────────
function onAuthChange(fbUser, profile) {
  const btn      = document.getElementById('auth-avatar-btn');
  const img      = document.getElementById('auth-avatar-img');
  const initEl   = document.getElementById('auth-avatar-initials');
  if (!btn) return;

  if (fbUser && profile) {
    btn.classList.add('is-signed-in');
    setAvatar(img, initEl, profile);
    // populate menu
    const nameEl  = document.getElementById('auth-menu-name');
    const emailEl = document.getElementById('auth-menu-email');
    if (nameEl)  nameEl.textContent  = profile.display_name || 'User';
    if (emailEl) emailEl.textContent = profile.email || '';
  } else {
    btn.classList.remove('is-signed-in');
    if (img)    img.hidden    = true;
    if (initEl) { initEl.hidden = false; initEl.textContent = '👤'; }
  }
}

// ── Wire events ───────────────────────────────────────────────
// All handlers use event delegation on document so they work regardless
// of when injectShell() created the elements.
function wireEvents() {

  // Single delegated click handler for everything auth-related
  document.addEventListener('click', async e => {
    const target = e.target;

    // ── Avatar button ──────────────────────────────────────
    if (target.closest('#auth-avatar-btn')) {
      e.stopPropagation();
      if (auth.loggedIn) {
        const menu = document.getElementById('auth-user-menu');
        menu?.classList.contains('is-visible') ? closeUserMenu() : openUserMenu();
      } else {
        showLoginDialog();
      }
      return;
    }

    // ── Close buttons (data-close="dialog-id") ─────────────
    const closeId = target.closest('[data-close]')?.dataset.close;
    if (closeId) { closeDialog(closeId); return; }

    // ── Backdrop click to close ────────────────────────────
    if (target.classList.contains('auth-backdrop') && target.id) {
      closeDialog(target.id); return;
    }

    // ── Close user menu on outside click ───────────────────
    if (!target.closest('#auth-user-menu') && !target.closest('#auth-avatar-btn')) {
      closeUserMenu();
    }

    // ── Google sign-in ─────────────────────────────────────
    if (target.closest('#btn-google')) {
      _setProviderBusy(true);
      try {
        await signInWithGoogle();
        hideLoginDialog();
      } catch (err) {
        console.error('Google sign-in error:', err);
        _showLoginError(
          err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request'
            ? 'Sign-in cancelled.'
            : `Sign-in failed: ${err.message || err.code || 'unknown error'}`
        );
      } finally { _setProviderBusy(false); }
      return;
    }

    // ── Facebook sign-in ───────────────────────────────────
    if (target.closest('#btn-facebook')) {
      _setProviderBusy(true);
      try {
        await signInWithFacebook();
        hideLoginDialog();
      } catch (err) {
        console.error('Facebook sign-in error:', err);
        _showLoginError(
          err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request'
            ? 'Sign-in cancelled.'
            : `Sign-in failed: ${err.message || err.code || 'unknown error'}`
        );
      } finally { _setProviderBusy(false); }
      return;
    }

    // ── Sign-out button (inside profile dialog) ────────────
    if (target.closest('#btn-signout')) {
      await signOutUser(); hideProfileDialog(); return;
    }

    // ── User menu: open library ───────────────────────────
    if (target.closest('#auth-menu-library-btn')) {
      closeUserMenu(); showLibraryDialog(); return;
    }

    // ── User menu: open profile ────────────────────────────
    if (target.closest('#auth-menu-profile-btn')) {
      showProfileDialog(); return;
    }

    // ── User menu: sign out ────────────────────────────────
    if (target.closest('#auth-menu-signout-btn')) {
      closeUserMenu(); await signOutUser(); return;
    }
  });

  // Profile form submit (needs separate listener for the submit event)
  document.addEventListener('submit', async e => {
    if (!e.target.closest('#auth-profile-form')) return;
    e.preventDefault();
    const nameVal  = document.getElementById('profile-input-name').value.trim();
    const photoVal = document.getElementById('profile-input-photo').value.trim();
    const status   = document.getElementById('profile-status');
    status.textContent = 'Saving…'; status.className = 'auth-status-msg';
    try {
      await updateProfile({ display_name: nameVal, photo_url: photoVal || undefined });
      status.textContent = '✓ Saved'; status.classList.add('success');
      _populateProfile();
    } catch (err) {
      console.error('Profile update error:', err);
      status.textContent = 'Failed to save.'; status.classList.add('error');
    }
  });
}

function _setProviderBusy(busy) {
  ['btn-google', 'btn-facebook'].forEach(id => {
    const b = document.getElementById(id);
    if (b) { b.disabled = busy; b.classList.toggle('is-loading', busy); }
  });
}
function _showLoginError(msg) {
  const el = document.getElementById('auth-login-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// ── Init ──────────────────────────────────────────────────────
export function initAuthUI() {
  injectShell();
  wireEvents();
  auth.onChange(onAuthChange);
}

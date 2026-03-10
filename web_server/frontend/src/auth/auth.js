/**
 * auth.js
 * ───────────────────────────────────────────────────────────
 * Firebase Authentication (Google + Facebook).
 * After sign-in, syncs the user to our Flask/SQLite backend
 * via POST /api/auth/sync.
 *
 * Exports a tiny reactive state so every module can subscribe
 * to auth changes without coupling to Firebase directly.
 */

import { initializeApp }            from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';

// ── Initialise ───────────────────────────────────────────────
// window.FIREBASE_CONFIG is injected by book.html from Flask.
const app  = initializeApp(window.FIREBASE_CONFIG);
export const firebaseAuth = getAuth(app);

const googleProvider   = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// ── Reactive state ────────────────────────────────────────────
// _profile is the SQLite-backed profile (richer than Firebase user).
let _firebaseUser = null;
let _profile      = null;          // { uid, display_name, email, photo_url }
const _listeners  = new Set();

export const auth = {
  get user()    { return _firebaseUser; },
  get profile() { return _profile; },
  get loggedIn(){ return !!_firebaseUser; },
  onChange(fn)  {
    _listeners.add(fn);
    fn(_firebaseUser, _profile);          // immediate call
    return () => _listeners.delete(fn);
  },
};

function _emit() {
  _listeners.forEach(fn => fn(_firebaseUser, _profile));
}

// ── Firebase token helper ─────────────────────────────────────
export async function getIdToken() {
  if (!_firebaseUser) return null;
  return _firebaseUser.getIdToken();
}

/** Authenticated fetch — adds Bearer token automatically. */
export async function authFetch(url, options = {}) {
  const token = await getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ── Sync with SQLite backend ──────────────────────────────────
async function syncWithBackend(firebaseUser) {
  if (!firebaseUser) return null;
  try {
    const token = await firebaseUser.getIdToken();
    const res   = await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Auth sync failed', e);
  }
  // Fallback: construct profile from Firebase data
  return {
    uid:          firebaseUser.uid,
    display_name: firebaseUser.displayName || '',
    email:        firebaseUser.email || '',
    photo_url:    firebaseUser.photoURL || '',
  };
}

// ── Auth state observer ────────────────────────────────────────
onAuthStateChanged(firebaseAuth, async fbUser => {
  _firebaseUser = fbUser;
  _profile      = fbUser ? await syncWithBackend(fbUser) : null;
  _emit();
});

// ── Sign in ────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

export async function signInWithFacebook() {
  const result = await signInWithPopup(firebaseAuth, facebookProvider);
  return result.user;
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}

// ── Update profile (name / avatar) via Flask API ──────────────
export async function updateProfile({ display_name, photo_url }) {
  const body = {};
  if (display_name !== undefined) body.display_name = display_name;
  if (photo_url    !== undefined) body.photo_url    = photo_url;

  const res = await authFetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`, {
    method: 'PATCH',
    body:   JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  _profile = await res.json();
  _emit();
  return _profile;
}
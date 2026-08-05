/**
 * app-banner.js
 * ─────────────────────────────────────────────────────────────
 * Small, dismissible banner inviting mobile readers to open the
 * E-Piṭaka native app instead of continuing in the browser.
 *
 * Platform matrix:
 *   Add a platform by appending an entry to APP_STORES with a
 *   `detect()` predicate (user-agent / capability check) and its
 *   store URL. Nothing else needs to change.
 *
 * Non-intrusive by design:
 *   - shown only once per browser session (sessionStorage),
 *   - hidden for 30 days once the user closes it (localStorage),
 *   - auto-fades after a few seconds so it never blocks reading.
 */

const APP_STORES = {
  android: {
    name:   'Google Play',
    detect: () => /Android/i.test(navigator.userAgent),
    url:    'https://play.google.com/store/apps/details?id=com.dn.epitaka',
  },
  // ── Future platforms ────────────────────────────────────────
  // ios: {
  //   name:   'App Store',
  //   detect: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
  //   url:    'https://apps.apple.com/app/id000000000',
  // },
};

// sessionStorage — only nag once per session (covers multi-book navigation)
const SHOWN_KEY     = 'epitaka_app_banner_shown';
// localStorage — remember dismissal so the banner stays away
const DISMISS_KEY   = 'epitaka_app_banner_dismissed';
const DISMISS_TTL   = 30 * 24 * 60 * 60 * 1000; // 30 days
const AUTO_HIDE_MS  = 9000;                     // fade away after 9s
const FADE_MS       = 400;                      // CSS transition duration

function _detectPlatform() {
  for (const key of Object.keys(APP_STORES)) {
    try {
      if (APP_STORES[key].detect()) {
        return APP_STORES[key];
      }
    } catch { /* keep probing other platforms */ }
  }
  return null;
}

function _isDismissed() {
  try {
    const t = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    return t > 0 && (Date.now() - t) < DISMISS_TTL;
  } catch { return false; }
}

function _hide(banner) {
  banner.classList.remove('show');
  banner.classList.add('hide');
  setTimeout(() => banner.remove(), FADE_MS);
}

export function initAppBanner() {
  const platform = _detectPlatform();
  if (!platform) return;

  let alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1'; } catch {}
  if (alreadyShown || _isDismissed()) return;
  try { sessionStorage.setItem(SHOWN_KEY, '1'); } catch {}

  const banner = document.createElement('div');
  banner.className = 'app-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-label', 'E-Piṭaka mobile app');

  banner.innerHTML = `
    <div class="app-banner-icon" aria-hidden="true">📖</div>
    <div class="app-banner-body">
      <div class="app-banner-title">Read with the E-Piṭaka app</div>
      <div class="app-banner-text">Faster reading &amp; offline access on your phone.</div>
    </div>
    <a class="app-banner-btn" href="${platform.url}"
       target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">▶</span> Get it on ${platform.name}
    </a>
    <button class="app-banner-close" type="button" aria-label="Dismiss">✕</button>
  `;

  banner.querySelector('.app-banner-close').addEventListener('click', () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    clearTimeout(autoHideTimer);
    _hide(banner);
  });

  document.body.appendChild(banner);

  // Gentle entrance after the page has settled
  requestAnimationFrame(() =>
    requestAnimationFrame(() => banner.classList.add('show'))
  );

  // Auto-fade so it never lingers over the text
  const autoHideTimer = setTimeout(() => _hide(banner), AUTO_HIDE_MS);
}

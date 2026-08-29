/**
 * cookie-consent.js
 * GDPR-compliant cookie consent for E-Piṭaka.
 *
 * Stores the user's choice in localStorage under 'epika_cookie_consent'.
 * Only loads Google Analytics after the user clicks "Accept".
 *
 * Usage:
 *   import { initCookieConsent } from './cookie-consent.js';
 *   initCookieConsent({ gaId: 'G-7NQWX1DCC2' });
 *
 * Or call from inline <script> on pages without a Vite bundle.
 */

import './css/cookie-consent.css';

// Keep this module's public API stable when Vite shares the chunk with other
// entry points. In particular, do not rely on minified export names in HTML.


const STORAGE_KEY = 'epika_cookie_consent';

/**
 * Load Google Analytics gtag.js dynamically.
 * Only called after the user explicitly consents.
 */
function loadGoogleAnalytics(measurementId) {
  if (!measurementId || document.getElementById('ga-script')) return;

  // Set up dataLayer first
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  // Default deny all until explicitly granted
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
  });

  // Now load the gtag.js script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.onload = () => {
    gtag('config', measurementId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });
    // Grant analytics storage now that consent is given
    gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  };
  document.head.appendChild(script);
}

/**
 * Build and inject the cookie consent banner into the DOM.
 */
function createBanner(onAccept, onReject) {
  const overlay = document.createElement('div');
  overlay.className = 'cc-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Cookie consent');

  overlay.innerHTML = `
    <div class="cc-banner">
      <div class="cc-body">
        <div class="cc-title">🍪 Privacy &amp; Cookies</div>
        <div class="cc-text">
          We use Google Analytics to understand how visitors use this site —
          which pages are popular, how people navigate. This helps us improve
          the experience. No personally identifiable information is collected.
          <a href="/privacy">Read our privacy policy</a>.
        </div>
      </div>

      <div class="cc-settings" id="cc-settings">
        <div class="cc-setting-row">
          <div>
            <div class="cc-setting-label">Google Analytics</div>
            <div class="cc-setting-desc">Anonymised usage statistics</div>
          </div>
          <label class="cc-toggle">
            <input type="checkbox" id="cc-analytics-toggle" checked>
            <span class="cc-toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="cc-actions">
        <button type="button" class="cc-btn cc-btn-accept" id="cc-accept">
          Accept
        </button>
        <button type="button" class="cc-btn cc-btn-reject" id="cc-reject">
          Reject
        </button>
        <button type="button" class="cc-btn cc-btn-settings" id="cc-settings-btn">
          Settings
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // ── Event handlers ──────────────────────────────
  const acceptBtn = overlay.querySelector('#cc-accept');
  const rejectBtn = overlay.querySelector('#cc-reject');
  const settingsBtn = overlay.querySelector('#cc-settings-btn');
  const settingsPanel = overlay.querySelector('#cc-settings');
  const analyticsToggle = overlay.querySelector('#cc-analytics-toggle');

  acceptBtn.addEventListener('click', () => {
    const analytics = analyticsToggle.checked;
    saveConsent({ analytics });
    closeBanner(overlay);
    if (analytics) onAccept();
    else onReject();
  });

  rejectBtn.addEventListener('click', () => {
    saveConsent({ analytics: false });
    closeBanner(overlay);
    onReject();
  });

  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
    settingsBtn.textContent = settingsPanel.classList.contains('open')
      ? 'Hide settings'
      : 'Settings';
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      // Treat backdrop click as reject (safe default)
      saveConsent({ analytics: false });
      closeBanner(overlay);
      onReject();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.contains(overlay)) {
      saveConsent({ analytics: false });
      closeBanner(overlay);
      onReject();
    }
  });

  return overlay;
}

function closeBanner(overlay) {
  overlay.classList.add('removing');
  overlay.remove();
}

function saveConsent(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...prefs,
      timestamp: Date.now(),
      version: 1,
    }));
  } catch { /* localStorage unavailable */ }
}

function getConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const consent = raw ? JSON.parse(raw) : null;
    return consent && typeof consent === 'object' ? consent : null;
  } catch { return null; }
}

/**
 * Main entry point.
 * @param {{ gaId: string }} options
 */
export function initCookieConsent({ gaId } = {}) {
  const consent = getConsent();

  if (consent) {
    // User already chose — apply their preference silently
    if (consent.analytics && gaId) {
      loadGoogleAnalytics(gaId);
    }
    return;
  }

  // No choice yet — show the banner
  createBanner(
    // onAccept
    () => { if (gaId) loadGoogleAnalytics(gaId); },
    // onReject
    () => { /* do nothing — no tracking */ },
  );
}

/**
 * Allow external code (e.g. a "Cookie Settings" link in the footer)
 * to re-open the consent banner.
 */
export function reopenConsent({ gaId } = {}) {
  // Remove existing banner if any
  const existing = document.querySelector('.cc-overlay');
  if (existing) existing.remove();

  const consent = getConsent();

  createBanner(
    () => { if (gaId) loadGoogleAnalytics(gaId); },
    () => { if (gaId) { /* revoke: could strip GA cookies here */ } },
  );

  // Pre-fill the toggle with current consent
  if (consent) {
    const toggle = document.querySelector('#cc-analytics-toggle');
    if (toggle) toggle.checked = !!consent.analytics;
  }
}

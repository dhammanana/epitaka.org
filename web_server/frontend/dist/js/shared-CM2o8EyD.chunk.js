const g="epika_cookie_consent";function r(e){var a,i;if(!e)return;if(document.getElementById("ga-script")){(a=window.gtag)==null||a.call(window,"consent","update",{analytics_storage:"granted"}),(i=window.gtag)==null||i.call(window,"config",e,{anonymize_ip:!0});return}window.dataLayer=window.dataLayer||[];function t(){window.dataLayer.push(arguments)}window.gtag=t,t("js",new Date),t("consent","default",{analytics_storage:"denied",ad_storage:"denied"});const n=document.createElement("script");n.id="ga-script",n.async=!0,n.referrerPolicy="no-referrer",n.src=`https://www.googletagmanager.com/gtag/js?id=${e}`,n.onload=()=>{try{t("config",e,{anonymize_ip:!0,cookie_flags:"SameSite=None;Secure"}),t("consent","update",{analytics_storage:"granted"})}catch{}},n.onerror=()=>n.remove();try{document.head.appendChild(n)}catch{}}function u(e,c){const t=document.createElement("div");t.className="cc-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Cookie consent"),t.innerHTML=`
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
  `,document.body.appendChild(t);const n=t.querySelector("#cc-accept"),a=t.querySelector("#cc-reject"),i=t.querySelector("#cc-settings-btn"),d=t.querySelector("#cc-settings"),p=t.querySelector("#cc-analytics-toggle");return n.addEventListener("click",()=>{const s=p.checked;l({analytics:s}),o(t),s?e():c()}),a.addEventListener("click",()=>{l({analytics:!1}),o(t),c()}),i.addEventListener("click",()=>{d.classList.toggle("open"),i.textContent=d.classList.contains("open")?"Hide settings":"Settings"}),t.addEventListener("click",s=>{s.target===t&&(l({analytics:!1}),o(t),c())}),document.addEventListener("keydown",s=>{s.key==="Escape"&&document.body.contains(t)&&(l({analytics:!1}),o(t),c())}),t}function o(e){e.classList.add("removing"),e.remove()}function l(e){try{localStorage.setItem(g,JSON.stringify({...e,timestamp:Date.now(),version:1}))}catch{}}function y(){try{const e=localStorage.getItem(g),c=e?JSON.parse(e):null;return c&&typeof c=="object"?c:null}catch{return null}}function v({gaId:e}={}){const c=y();if(c){(c.analytics===!0||c.analytics==="true")&&e&&r(e);return}u(()=>{e&&r(e)},()=>{})}function f({gaId:e}={}){const c=document.querySelector(".cc-overlay");c&&c.remove();const t=y();if(u(()=>{e&&r(e)},()=>{}),t){const n=document.querySelector("#cc-analytics-toggle");n&&(n.checked=!!t.analytics)}}export{v as initCookieConsent,f as reopenConsent};

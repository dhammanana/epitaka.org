import{g as H,H as C,h as j,j as M,k as O,l as R,S as w,T as I,a as N,f as P,i as D,o as F}from"./cookie-consent-7gef3AxB.chunk.js";function Q(n,t){if(!t)return n;const a=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return n.replace(new RegExp(`(${a})`,"gi"),"<mark>$1</mark>")}const T=["Mūla","Aṭṭhakathā","Ṭīkā"],K=["Vinaya","Suttanta","Sutta","Abhidhamma"];class V{constructor({baseUrl:t,lang:a,menu:e,onNavigate:o}){this.baseUrl=t,this.lang=a,this.menu=e,this.onNavigate=o,this._filterText=""}buildHTML(){const t=this._resolvedCategories(),a=t.map((o,s)=>`
      <button class="home-tab${s===0?" active":""}"
              data-tab="${s}" type="button">${o.label}</button>
    `).join(""),e=t.map((o,s)=>`
      <div class="home-tab-panel${s===0?" active":""}" data-panel="${s}">
        ${this._buildCategoryHTML(o)}
      </div>
    `).join("");return`
      <div id="home-tabs">${a}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${e}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const t=document.querySelectorAll(".home-tab"),a=document.querySelectorAll(".home-tab-panel");t.forEach(e=>{e.addEventListener("click",()=>{var s;const o=parseInt(e.dataset.tab);t.forEach(r=>r.classList.toggle("active",r===e)),a.forEach(r=>r.classList.toggle("active",parseInt(r.dataset.panel)===o)),(s=document.getElementById("home-results-panel"))==null||s.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(e=>{e.addEventListener("click",()=>{var o;e.classList.toggle("open"),(o=e.nextElementSibling)==null||o.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(e=>{e.addEventListener("click",o=>{o.preventDefault(),this.onNavigate(e.href)})})}filter(t){this._filterText=t.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(e=>{var r,l;const o=((l=(r=e.querySelector(".book-name"))==null?void 0:r.textContent)==null?void 0:l.toLowerCase())||"",s=!this._filterText||o.includes(this._filterText);if(e.style.display=s?"":"none",this._filterText&&s){const d=e.querySelector(".book-name");d&&(d.innerHTML=Q(d.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(e=>{var s,r;const o=[...e.querySelectorAll(".book-entry")].some(l=>l.style.display!=="none");e.style.display=o?"":"none",this._filterText&&((s=e.querySelector(".book-nikaya-title"))==null||s.classList.add("open"),(r=e.querySelector(".book-nikaya-list"))==null||r.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(e=>{const o=[...e.querySelectorAll(".book-entry")].some(s=>s.style.display!=="none");e.style.display=o?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(t=>{t.style.display="";const a=t.querySelector(".book-name");a&&(a.textContent=a.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(t=>{t.style.display=""})}_resolvedCategories(){const t=Object.keys(this.menu);return[...T.filter(e=>t.includes(e)),...t.filter(e=>!T.includes(e))].map(e=>({label:e,data:this.menu[e]}))}_buildCategoryHTML({data:t}){return!t||typeof t!="object"?"":Object.keys(t).sort((e,o)=>{const s=r=>{const l=K.findIndex(d=>r.includes(d));return l===-1?99:l};return s(e)-s(o)}).map(e=>`
      <div class="book-category">
        <div class="book-category-title pali-text">${e}</div>
        <div class="book-category-content">
          ${this._renderNikaya(t[e])}
        </div>
      </div>
    `).join("")}_renderNikaya(t){if(!t||typeof t!="object")return"";const a=[];return t[""]&&a.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(t[""])}
          </ol>
        </div>
      `),Object.entries(t).forEach(([e,o])=>{e!==""&&a.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title pali-text">
            ${e}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(o)}
          </ol>
        </div>
      `)}),a.join("")}_buildBookList(t){return Array.isArray(t)?t.map(([a,e],o)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${a}"
           class="book-entry"
           data-book-id="${a}">
          <span class="book-num">${o+1}.</span>
          <span class="book-name pali-text">${e}</span>
        </a>
      </li>
    `).join(""):""}}class W{constructor(t,a){this._key=t,this._defaults=a,this._data=this._load()}get(t){return this._data[t]}set(t,a){this._data[t]=a,this._save()}patch(t){Object.assign(this._data,t),this._save()}snapshot(){return{...this._data}}_load(){try{const t=localStorage.getItem(this._key);return t?{...this._defaults,...JSON.parse(t)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function G({triggerSelector:n,baseUrl:t,lang:a,menu:e,hierarchy:o}){var k;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(n);if(!s){console.warn("[HomeDialog] trigger not found:",n);return}const r=new W("homeDialog_state",{searchQuery:"",searchTypeId:((k=H[0])==null?void 0:k.id)??"",activeTabId:null}),l=o||J(e||{}),d=new V({baseUrl:t,lang:a,menu:e||{},onNavigate:i=>{y(),window.location.href=i}}),b=new C({baseUrl:t,lang:a,hierarchy:l,initialState:{searchTypeId:r.get("searchTypeId")},onResultSelect:i=>{try{j({panel:"search",search:b.getState()})}catch{}y(),window.location.href=i},onShowResults:()=>q(),onShowBooks:()=>B(),onRenderResults:()=>A()}),u=document.createElement("div");u.id="home-dialog-overlay",u.setAttribute("role","dialog"),u.setAttribute("aria-modal","true"),u.setAttribute("aria-label","Browse books"),u.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${M(O,r.get("searchTypeId"),r.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${d.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(u);const f=r.get("activeTabId");if(f){const i=document.querySelector(`.home-tab[data-tab="${f}"]`),c=document.querySelector(`.home-tab-panel[data-panel="${f}"]`);i&&c&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(m=>m.classList.remove("active")),i.classList.add("active"),c.classList.add("active"))}s.addEventListener("click",i=>{i.preventDefault(),v()}),document.getElementById("home-dialog-close").addEventListener("click",y),u.addEventListener("click",i=>{i.target===u&&y()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&u.classList.contains("show")&&y()}),d.bindTabs(),u.addEventListener("click",i=>{const c=i.target.closest(".home-tab");c!=null&&c.dataset.tab&&r.set("activeTabId",c.dataset.tab)}),b.bind(),document.getElementById("search-type-menu").addEventListener("click",i=>{const c=i.target.closest(".search-type-option");c&&r.set("searchTypeId",c.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",i=>{r.set("searchQuery",i.target.value);const c=i.target.value.trim();c?b.currentType.id==="headings"&&d.filter(c):d.clearFilter()});function v(){u.classList.add("show"),document.body.style.overflow="hidden",A(),window.innerWidth>=768&&setTimeout(()=>{var i;return(i=document.getElementById("home-search-input"))==null?void 0:i.focus()},60)}function y(){u.classList.remove("show"),document.body.style.overflow=""}function q(){var i,c,m;document.querySelectorAll(".home-tab-panel").forEach(p=>p.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(p=>p.classList.remove("active")),(i=document.getElementById("home-tabs"))==null||i.classList.add("tabs-hidden"),(c=document.getElementById("home-filter-wrap"))==null||c.classList.add("show"),(m=document.getElementById("home-results-panel"))==null||m.classList.add("active")}function B(){var p,L,E,S,_;(p=document.getElementById("home-results-panel"))==null||p.classList.remove("active"),(L=document.getElementById("home-tabs"))==null||L.classList.remove("tabs-hidden"),(E=document.getElementById("home-filter-wrap"))==null||E.classList.remove("show");const i=r.get("activeTabId"),c=i&&document.querySelector(`.home-tab[data-tab="${i}"]`),m=i&&document.querySelector(`.home-tab-panel[data-panel="${i}"]`);c&&m?(c.classList.add("active"),m.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:v,close:y}}function A(){const n=document.getElementById("home-dialog-overlay");if(!n)return;const t=R(),a=(t==null?void 0:t.paliScript)||w.RO,e=new WeakMap;n.querySelectorAll(".pali-text").forEach(o=>{e.has(o)||e.set(o,o.innerHTML);const s=e.get(o);o.innerHTML=a===w.RO?s:s.replace(/(<[^>]+>)|([^<]+)/g,(r,l,d)=>l||I.convert(I.convertFromMixed(d),a))})}function J(n){const t={};for(const[a,e]of Object.entries(n))for(const[o,s]of Object.entries(e))for(const[,r]of Object.entries(s))if(Array.isArray(r))for(const[l]of r)t[l]={nikaya:o,category:a};return t}const{baseUrl:x,lang:U}=window.INDEX_CONFIG,g="epika_disclaimer_skip";function $(){try{return localStorage.getItem(g)==="1"}catch{return!1}}const h=document.getElementById("disclaimer-overlay"),X=document.getElementById("disclaimer-ok"),Y=document.getElementById("disclaimer-no-show");async function z(){try{const n=await fetch(`${x}/api/menu`);if(!n.ok)throw new Error(`HTTP ${n.status}`);return await n.json()}catch(n){return console.warn("[index] failed to load menu, falling back to empty",n),{menu:{},hierarchy:{}}}}$()&&(h==null||h.classList.add("hidden"));async function Z(){N(),P({gaId:"G-7NQWX1DCC2"}),D({bookId:""}),ee();const{menu:n,hierarchy:t}=await z();G({triggerSelector:"#open-books-btn",baseUrl:x,lang:U,menu:n,hierarchy:t}),document.querySelectorAll(".lang-dropdown__item").forEach(e=>{e.addEventListener("click",()=>{var s;const o=(s=e.getAttribute("href"))==null?void 0:s.match(/\/([a-z]{2})\/?$/);o&&F(o[1])})});function a(e){if(e&&Y.checked)try{localStorage.setItem(g,"1"),document.cookie=`${g}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}h.classList.add("hidden")}$()&&h.classList.add("hidden"),X.addEventListener("click",()=>a(!0)),h.addEventListener("click",e=>{e.target===h&&a(!1)}),document.addEventListener("keydown",e=>{e.key==="Escape"&&!h.classList.contains("hidden")&&a(!1)})}function ee(){const n=document.querySelector(".lang-dropdown__toggle"),t=document.querySelector(".lang-dropdown__menu");n&&t&&n.addEventListener("click",o=>{o.stopPropagation();const s=n.getAttribute("aria-expanded")==="true";n.setAttribute("aria-expanded",String(!s)),t.classList.toggle("open")});const a=document.getElementById("more-btn"),e=document.getElementById("topbar-more-menu");a&&e&&a.addEventListener("click",o=>{o.stopPropagation();const s=a.getAttribute("aria-expanded")==="true";a.setAttribute("aria-expanded",String(!s)),e.classList.toggle("open")}),document.addEventListener("click",()=>{n==null||n.setAttribute("aria-expanded","false"),t==null||t.classList.remove("open"),a==null||a.setAttribute("aria-expanded","false"),e==null||e.classList.remove("open")})}Z();

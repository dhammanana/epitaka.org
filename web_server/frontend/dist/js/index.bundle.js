const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/shared-CM2o8EyD.chunk.js","css/cookie-consent.css"])))=>i.map(i=>d[i]);
import{S as $,H as B,g as C,h as H,j,a as O,l as P,d as N,e as R,_ as M,i as D,o as V}from"./sidebar-VEsCgIY-.chunk.js";function Q(r,e){if(!e)return r;const o=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return r.replace(new RegExp(`(${o})`,"gi"),"<mark>$1</mark>")}const I=["Mūla","Aṭṭhakathā","Ṭīkā"],K=["Vinaya","Suttanta","Sutta","Abhidhamma"];class U{constructor({baseUrl:e,lang:o,menu:a,onNavigate:t}){this.baseUrl=e,this.lang=o,this.menu=a,this.onNavigate=t,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),o=e.map((t,s)=>`
      <button class="home-tab${s===0?" active":""}"
              data-tab="${s}" type="button">${t.label}</button>
    `).join(""),a=e.map((t,s)=>`
      <div class="home-tab-panel${s===0?" active":""}" data-panel="${s}">
        ${this._buildCategoryHTML(t)}
      </div>
    `).join("");return`
      <div id="home-tabs">${o}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${a}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}_root(){return document.getElementById("home-dialog")||document}bindTabs(){const e=this._root(),o=e.querySelectorAll(".home-tab"),a=e.querySelectorAll(".home-tab-panel");o.forEach(t=>{t.addEventListener("click",()=>{var n;const s=parseInt(t.dataset.tab);o.forEach(c=>c.classList.toggle("active",c===t)),a.forEach(c=>c.classList.toggle("active",parseInt(c.dataset.panel)===s)),(n=document.getElementById("home-results-panel"))==null||n.classList.remove("active")})}),e.querySelectorAll(".book-nikaya-title").forEach(t=>{t.addEventListener("click",()=>{var s;t.classList.toggle("open"),(s=t.nextElementSibling)==null||s.classList.toggle("open")})}),e.querySelectorAll(".book-entry").forEach(t=>{t.addEventListener("click",s=>{s.preventDefault(),this.onNavigate(t.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),this._root().querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(t=>{var c,h;const s=((h=(c=t.querySelector(".book-name"))==null?void 0:c.textContent)==null?void 0:h.toLowerCase())||"",n=!this._filterText||s.includes(this._filterText);if(t.style.display=n?"":"none",this._filterText&&n){const u=t.querySelector(".book-name");u&&(u.innerHTML=Q(u.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(t=>{var n,c;const s=[...t.querySelectorAll(".book-entry")].some(h=>h.style.display!=="none");t.style.display=s?"":"none",this._filterText&&((n=t.querySelector(".book-nikaya-title"))==null||n.classList.add("open"),(c=t.querySelector(".book-nikaya-list"))==null||c.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(t=>{const s=[...t.querySelectorAll(".book-entry")].some(n=>n.style.display!=="none");t.style.display=s?"":"none"})})}clearFilter(){this._filterText="",this._root().querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const o=e.querySelector(".book-name");o&&(o.textContent=o.textContent)}),this._root().querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...I.filter(a=>e.includes(a)),...e.filter(a=>!I.includes(a))].map(a=>({label:a,data:this.menu[a]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((a,t)=>{const s=n=>{const c=K.findIndex(h=>n.includes(h));return c===-1?99:c};return s(a)-s(t)}).map(a=>`
      <div class="book-category">
        <div class="book-category-title pali-text">${a}</div>
        <div class="book-category-content">
          ${this._renderNikaya(e[a])}
        </div>
      </div>
    `).join("")}_renderNikaya(e){if(!e||typeof e!="object")return"";const o=[];return e[""]&&o.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(e[""])}
          </ol>
        </div>
      `),Object.entries(e).forEach(([a,t])=>{a!==""&&o.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title pali-text">
            ${a}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(t)}
          </ol>
        </div>
      `)}),o.join("")}_buildBookList(e){return Array.isArray(e)?e.map(([o,a],t)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${o}"
           class="book-entry"
           data-book-id="${o}">
          <span class="book-num">${t+1}.</span>
          <span class="book-name pali-text">${a}</span>
        </a>
      </li>
    `).join(""):""}}class F{constructor(e,o){this._key=e,this._defaults=o,this._data=this._load()}get(e){return this._data[e]}set(e,o){this._data[e]=o,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function G({triggerSelector:r,baseUrl:e,lang:o,menu:a,hierarchy:t}){var L;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(r);if(!s){console.warn("[HomeDialog] trigger not found:",r);return}const n=new F("homeDialog_state",{searchQuery:"",searchTypeId:((L=$[0])==null?void 0:L.id)??"",activeTabId:null}),c=t||J(a||{}),h=new U({baseUrl:e,lang:o,menu:a||{},onNavigate:i=>{b(),window.location.href=i}}),u=new B({baseUrl:e,lang:o,hierarchy:c,initialState:{searchTypeId:n.get("searchTypeId")},onResultSelect:i=>{try{C({panel:"search",search:u.getState()})}catch{}b(),window.location.href=i},onShowResults:()=>q(),onShowBooks:()=>x()}),l=document.createElement("div");l.id="home-dialog-overlay",l.setAttribute("role","dialog"),l.setAttribute("aria-modal","true"),l.setAttribute("aria-label","Browse books"),l.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${H(j,n.get("searchTypeId"),n.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${h.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(l);const m=n.get("activeTabId");if(m){const i=document.querySelector(`.home-tab[data-tab="${m}"]`),d=document.querySelector(`.home-tab-panel[data-panel="${m}"]`);i&&d&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(p=>p.classList.remove("active")),i.classList.add("active"),d.classList.add("active"))}s.addEventListener("click",i=>{i.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",b),l.addEventListener("click",i=>{i.target===l&&b()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&l.classList.contains("show")&&b()}),h.bindTabs(),l.addEventListener("click",i=>{const d=i.target.closest(".home-tab");d!=null&&d.dataset.tab&&n.set("activeTabId",d.dataset.tab)}),u.bind(),document.getElementById("search-type-menu").addEventListener("click",i=>{const d=i.target.closest(".search-type-option");d&&n.set("searchTypeId",d.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",i=>{n.set("searchQuery",i.target.value);const d=i.target.value.trim();d?u.currentType.id==="headings"&&h.filter(d):h.clearFilter()});function g(){l.classList.add("show"),document.body.style.overflow="hidden",window.innerWidth>=768&&setTimeout(()=>{var i;return(i=document.getElementById("home-search-input"))==null?void 0:i.focus()},60)}function b(){l.classList.remove("show"),document.body.style.overflow=""}function q(){var i,d,p;document.querySelectorAll(".home-tab-panel").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(f=>f.classList.remove("active")),(i=document.getElementById("home-tabs"))==null||i.classList.add("tabs-hidden"),(d=document.getElementById("home-filter-wrap"))==null||d.classList.add("show"),(p=document.getElementById("home-results-panel"))==null||p.classList.add("active")}function x(){var f,_,E,S,w;(f=document.getElementById("home-results-panel"))==null||f.classList.remove("active"),(_=document.getElementById("home-tabs"))==null||_.classList.remove("tabs-hidden"),(E=document.getElementById("home-filter-wrap"))==null||E.classList.remove("show");const i=n.get("activeTabId"),d=i&&document.querySelector(`.home-tab[data-tab="${i}"]`),p=i&&document.querySelector(`.home-tab-panel[data-panel="${i}"]`);d&&p?(d.classList.add("active"),p.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(w=document.querySelector(".home-tab"))==null||w.classList.add("active"))}return{open:g,close:b}}function J(r){const e={};for(const[o,a]of Object.entries(r))for(const[t,s]of Object.entries(a))for(const[,n]of Object.entries(s))if(Array.isArray(n))for(const[c]of n)e[c]={nikaya:t,category:o};return e}const{baseUrl:A,lang:v}=window.INDEX_CONFIG,k="epika_disclaimer_skip";function T(){try{return localStorage.getItem(k)==="1"}catch{return!1}}const y=document.getElementById("disclaimer-overlay"),W=document.getElementById("disclaimer-ok"),X=document.getElementById("disclaimer-no-show");async function Y(){try{const r=await fetch(`${A}/api/menu?lang=${encodeURIComponent(v)}`);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){return console.warn("[index] failed to load menu, falling back to empty",r),{menu:{},hierarchy:{}}}}T()&&(y==null||y.classList.add("hidden"));async function z(){O();const r=P(v);N(r),R(r.paliScript),M(()=>import("./shared-CM2o8EyD.chunk.js"),__vite__mapDeps([0,1])).then(t=>t.initCookieConsent({gaId:"G-7NQWX1DCC2"}),()=>{}),D({bookId:""}),Z();const{menu:e,hierarchy:o}=await Y();G({triggerSelector:"#open-books-btn",baseUrl:A,lang:v,menu:e,hierarchy:o}),document.querySelectorAll(".lang-dropdown__item").forEach(t=>{t.addEventListener("click",()=>{var n;const s=(n=t.getAttribute("href"))==null?void 0:n.match(/\/([a-z]{2})\/?$/);s&&V(s[1])})});function a(t){if(t&&X.checked)try{localStorage.setItem(k,"1"),document.cookie=`${k}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}y.classList.add("hidden")}T()&&y.classList.add("hidden"),W.addEventListener("click",()=>a(!0)),y.addEventListener("click",t=>{t.target===y&&a(!1)}),document.addEventListener("keydown",t=>{t.key==="Escape"&&!y.classList.contains("hidden")&&a(!1)})}function Z(){const r=document.querySelector(".lang-dropdown__toggle"),e=document.querySelector(".lang-dropdown__menu");if(r&&e){const t=e.querySelector(".lang-dropdown__filter"),s=e.querySelector(".lang-dropdown__empty"),n=[...e.querySelectorAll(".lang-dropdown__list > li")],c=()=>{if(!t)return;const u=t.value.trim().toLowerCase();let l=0;for(const m of n){const g=!u||(m.dataset.search||m.textContent).toLowerCase().includes(u);m.hidden=!g,g&&l++}s&&(s.hidden=l!==0)};t==null||t.addEventListener("input",c),e.addEventListener("click",u=>u.stopPropagation());const h=()=>{r.setAttribute("aria-expanded","false"),e.classList.remove("open")};r.addEventListener("click",u=>{var m;u.stopPropagation();const l=!e.classList.contains("open");r.setAttribute("aria-expanded",String(l)),e.classList.toggle("open",l),l&&(t&&(t.value="",c()),(m=e.querySelector(".lang-dropdown__item.selected"))==null||m.scrollIntoView({block:"nearest"}),t==null||t.focus({preventScroll:!0}))}),document.addEventListener("keydown",u=>{u.key==="Escape"&&h()})}const o=document.getElementById("more-btn"),a=document.getElementById("topbar-more-menu");o&&a&&o.addEventListener("click",t=>{t.stopPropagation();const s=o.getAttribute("aria-expanded")==="true";o.setAttribute("aria-expanded",String(!s)),a.classList.toggle("open")}),document.addEventListener("click",()=>{r==null||r.setAttribute("aria-expanded","false"),e==null||e.classList.remove("open"),o==null||o.setAttribute("aria-expanded","false"),a==null||a.classList.remove("open")})}z();

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/shared-CM2o8EyD.chunk.js","css/cookie-consent.css"])))=>i.map(i=>d[i]);
import{S as $,H as B,g as C,h as H,j,a as O,l as P,d as N,e as M,_ as R,i as D,o as V}from"./sidebar-CN3j_6oj.chunk.js";function Q(r,e){if(!e)return r;const a=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return r.replace(new RegExp(`(${a})`,"gi"),"<mark>$1</mark>")}const w=["Mūla","Aṭṭhakathā","Ṭīkā"],K=["Vinaya","Suttanta","Sutta","Abhidhamma"];class F{constructor({baseUrl:e,lang:a,menu:t,onNavigate:o}){this.baseUrl=e,this.lang=a,this.menu=t,this.onNavigate=o,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),a=e.map((o,s)=>`
      <button class="home-tab${s===0?" active":""}"
              data-tab="${s}" type="button">${o.label}</button>
    `).join(""),t=e.map((o,s)=>`
      <div class="home-tab-panel${s===0?" active":""}" data-panel="${s}">
        ${this._buildCategoryHTML(o)}
      </div>
    `).join("");return`
      <div id="home-tabs">${a}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${t}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),a=document.querySelectorAll(".home-tab-panel");e.forEach(t=>{t.addEventListener("click",()=>{var s;const o=parseInt(t.dataset.tab);e.forEach(i=>i.classList.toggle("active",i===t)),a.forEach(i=>i.classList.toggle("active",parseInt(i.dataset.panel)===o)),(s=document.getElementById("home-results-panel"))==null||s.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(t=>{t.addEventListener("click",()=>{var o;t.classList.toggle("open"),(o=t.nextElementSibling)==null||o.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(t=>{t.addEventListener("click",o=>{o.preventDefault(),this.onNavigate(t.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(t=>{var i,d;const o=((d=(i=t.querySelector(".book-name"))==null?void 0:i.textContent)==null?void 0:d.toLowerCase())||"",s=!this._filterText||o.includes(this._filterText);if(t.style.display=s?"":"none",this._filterText&&s){const u=t.querySelector(".book-name");u&&(u.innerHTML=Q(u.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(t=>{var s,i;const o=[...t.querySelectorAll(".book-entry")].some(d=>d.style.display!=="none");t.style.display=o?"":"none",this._filterText&&((s=t.querySelector(".book-nikaya-title"))==null||s.classList.add("open"),(i=t.querySelector(".book-nikaya-list"))==null||i.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(t=>{const o=[...t.querySelectorAll(".book-entry")].some(s=>s.style.display!=="none");t.style.display=o?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const a=e.querySelector(".book-name");a&&(a.textContent=a.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...w.filter(t=>e.includes(t)),...e.filter(t=>!w.includes(t))].map(t=>({label:t,data:this.menu[t]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((t,o)=>{const s=i=>{const d=K.findIndex(u=>i.includes(u));return d===-1?99:d};return s(t)-s(o)}).map(t=>`
      <div class="book-category">
        <div class="book-category-title pali-text">${t}</div>
        <div class="book-category-content">
          ${this._renderNikaya(e[t])}
        </div>
      </div>
    `).join("")}_renderNikaya(e){if(!e||typeof e!="object")return"";const a=[];return e[""]&&a.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(e[""])}
          </ol>
        </div>
      `),Object.entries(e).forEach(([t,o])=>{t!==""&&a.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title pali-text">
            ${t}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(o)}
          </ol>
        </div>
      `)}),a.join("")}_buildBookList(e){return Array.isArray(e)?e.map(([a,t],o)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${a}"
           class="book-entry"
           data-book-id="${a}">
          <span class="book-num">${o+1}.</span>
          <span class="book-name pali-text">${t}</span>
        </a>
      </li>
    `).join(""):""}}class G{constructor(e,a){this._key=e,this._defaults=a,this._data=this._load()}get(e){return this._data[e]}set(e,a){this._data[e]=a,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function J({triggerSelector:r,baseUrl:e,lang:a,menu:t,hierarchy:o}){var k;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(r);if(!s){console.warn("[HomeDialog] trigger not found:",r);return}const i=new G("homeDialog_state",{searchQuery:"",searchTypeId:((k=$[0])==null?void 0:k.id)??"",activeTabId:null}),d=o||U(t||{}),u=new F({baseUrl:e,lang:a,menu:t||{},onNavigate:n=>{b(),window.location.href=n}}),h=new B({baseUrl:e,lang:a,hierarchy:d,initialState:{searchTypeId:i.get("searchTypeId")},onResultSelect:n=>{try{C({panel:"search",search:h.getState()})}catch{}b(),window.location.href=n},onShowResults:()=>q(),onShowBooks:()=>x()}),c=document.createElement("div");c.id="home-dialog-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-label","Browse books"),c.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${H(j,i.get("searchTypeId"),i.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${u.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(c);const m=i.get("activeTabId");if(m){const n=document.querySelector(`.home-tab[data-tab="${m}"]`),l=document.querySelector(`.home-tab-panel[data-panel="${m}"]`);n&&l&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(p=>p.classList.remove("active")),n.classList.add("active"),l.classList.add("active"))}s.addEventListener("click",n=>{n.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",b),c.addEventListener("click",n=>{n.target===c&&b()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&c.classList.contains("show")&&b()}),u.bindTabs(),c.addEventListener("click",n=>{const l=n.target.closest(".home-tab");l!=null&&l.dataset.tab&&i.set("activeTabId",l.dataset.tab)}),h.bind(),document.getElementById("search-type-menu").addEventListener("click",n=>{const l=n.target.closest(".search-type-option");l&&i.set("searchTypeId",l.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",n=>{i.set("searchQuery",n.target.value);const l=n.target.value.trim();l?h.currentType.id==="headings"&&u.filter(l):u.clearFilter()});function g(){c.classList.add("show"),document.body.style.overflow="hidden",window.innerWidth>=768&&setTimeout(()=>{var n;return(n=document.getElementById("home-search-input"))==null?void 0:n.focus()},60)}function b(){c.classList.remove("show"),document.body.style.overflow=""}function q(){var n,l,p;document.querySelectorAll(".home-tab-panel").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(f=>f.classList.remove("active")),(n=document.getElementById("home-tabs"))==null||n.classList.add("tabs-hidden"),(l=document.getElementById("home-filter-wrap"))==null||l.classList.add("show"),(p=document.getElementById("home-results-panel"))==null||p.classList.add("active")}function x(){var f,L,E,S,_;(f=document.getElementById("home-results-panel"))==null||f.classList.remove("active"),(L=document.getElementById("home-tabs"))==null||L.classList.remove("tabs-hidden"),(E=document.getElementById("home-filter-wrap"))==null||E.classList.remove("show");const n=i.get("activeTabId"),l=n&&document.querySelector(`.home-tab[data-tab="${n}"]`),p=n&&document.querySelector(`.home-tab-panel[data-panel="${n}"]`);l&&p?(l.classList.add("active"),p.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:g,close:b}}function U(r){const e={};for(const[a,t]of Object.entries(r))for(const[o,s]of Object.entries(t))for(const[,i]of Object.entries(s))if(Array.isArray(i))for(const[d]of i)e[d]={nikaya:o,category:a};return e}const{baseUrl:A,lang:I}=window.INDEX_CONFIG,v="epika_disclaimer_skip";function T(){try{return localStorage.getItem(v)==="1"}catch{return!1}}const y=document.getElementById("disclaimer-overlay"),W=document.getElementById("disclaimer-ok"),X=document.getElementById("disclaimer-no-show");async function Y(){try{const r=await fetch(`${A}/api/menu`);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){return console.warn("[index] failed to load menu, falling back to empty",r),{menu:{},hierarchy:{}}}}T()&&(y==null||y.classList.add("hidden"));async function z(){O();const r=P(I);N(r),M(r.paliScript),R(()=>import("./shared-CM2o8EyD.chunk.js"),__vite__mapDeps([0,1])).then(o=>o.initCookieConsent({gaId:"G-7NQWX1DCC2"}),()=>{}),D({bookId:""}),Z();const{menu:e,hierarchy:a}=await Y();J({triggerSelector:"#open-books-btn",baseUrl:A,lang:I,menu:e,hierarchy:a}),document.querySelectorAll(".lang-dropdown__item").forEach(o=>{o.addEventListener("click",()=>{var i;const s=(i=o.getAttribute("href"))==null?void 0:i.match(/\/([a-z]{2})\/?$/);s&&V(s[1])})});function t(o){if(o&&X.checked)try{localStorage.setItem(v,"1"),document.cookie=`${v}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}y.classList.add("hidden")}T()&&y.classList.add("hidden"),W.addEventListener("click",()=>t(!0)),y.addEventListener("click",o=>{o.target===y&&t(!1)}),document.addEventListener("keydown",o=>{o.key==="Escape"&&!y.classList.contains("hidden")&&t(!1)})}function Z(){const r=document.querySelector(".lang-dropdown__toggle"),e=document.querySelector(".lang-dropdown__menu");if(r&&e){const o=e.querySelector(".lang-dropdown__filter"),s=e.querySelector(".lang-dropdown__empty"),i=[...e.querySelectorAll(".lang-dropdown__list > li")],d=()=>{if(!o)return;const h=o.value.trim().toLowerCase();let c=0;for(const m of i){const g=!h||(m.dataset.search||m.textContent).toLowerCase().includes(h);m.hidden=!g,g&&c++}s&&(s.hidden=c!==0)};o==null||o.addEventListener("input",d),e.addEventListener("click",h=>h.stopPropagation());const u=()=>{r.setAttribute("aria-expanded","false"),e.classList.remove("open")};r.addEventListener("click",h=>{var m;h.stopPropagation();const c=!e.classList.contains("open");r.setAttribute("aria-expanded",String(c)),e.classList.toggle("open",c),c&&(o&&(o.value="",d()),(m=e.querySelector(".lang-dropdown__item.selected"))==null||m.scrollIntoView({block:"nearest"}),o==null||o.focus({preventScroll:!0}))}),document.addEventListener("keydown",h=>{h.key==="Escape"&&u()})}const a=document.getElementById("more-btn"),t=document.getElementById("topbar-more-menu");a&&t&&a.addEventListener("click",o=>{o.stopPropagation();const s=a.getAttribute("aria-expanded")==="true";a.setAttribute("aria-expanded",String(!s)),t.classList.toggle("open")}),document.addEventListener("click",()=>{r==null||r.setAttribute("aria-expanded","false"),e==null||e.classList.remove("open"),a==null||a.setAttribute("aria-expanded","false"),t==null||t.classList.remove("open")})}z();

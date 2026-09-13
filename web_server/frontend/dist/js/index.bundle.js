import{S as $,H as B,h as C,j as H,k as j,a as O,l as N,d as P,e as M,g as R,i as D,o as Q}from"./cookie-consent-D7Z6kgb8.chunk.js";function V(r,e){if(!e)return r;const o=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return r.replace(new RegExp(`(${o})`,"gi"),"<mark>$1</mark>")}const w=["Mūla","Aṭṭhakathā","Ṭīkā"],K=["Vinaya","Suttanta","Sutta","Abhidhamma"];class F{constructor({baseUrl:e,lang:o,menu:t,onNavigate:a}){this.baseUrl=e,this.lang=o,this.menu=t,this.onNavigate=a,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),o=e.map((a,s)=>`
      <button class="home-tab${s===0?" active":""}"
              data-tab="${s}" type="button">${a.label}</button>
    `).join(""),t=e.map((a,s)=>`
      <div class="home-tab-panel${s===0?" active":""}" data-panel="${s}">
        ${this._buildCategoryHTML(a)}
      </div>
    `).join("");return`
      <div id="home-tabs">${o}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${t}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),o=document.querySelectorAll(".home-tab-panel");e.forEach(t=>{t.addEventListener("click",()=>{var s;const a=parseInt(t.dataset.tab);e.forEach(n=>n.classList.toggle("active",n===t)),o.forEach(n=>n.classList.toggle("active",parseInt(n.dataset.panel)===a)),(s=document.getElementById("home-results-panel"))==null||s.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(t=>{t.addEventListener("click",()=>{var a;t.classList.toggle("open"),(a=t.nextElementSibling)==null||a.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(t=>{t.addEventListener("click",a=>{a.preventDefault(),this.onNavigate(t.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(o=>{o.querySelectorAll(".book-entry").forEach(t=>{var n,d;const a=((d=(n=t.querySelector(".book-name"))==null?void 0:n.textContent)==null?void 0:d.toLowerCase())||"",s=!this._filterText||a.includes(this._filterText);if(t.style.display=s?"":"none",this._filterText&&s){const u=t.querySelector(".book-name");u&&(u.innerHTML=V(u.textContent,this._filterText))}}),o.querySelectorAll(".book-nikaya").forEach(t=>{var s,n;const a=[...t.querySelectorAll(".book-entry")].some(d=>d.style.display!=="none");t.style.display=a?"":"none",this._filterText&&((s=t.querySelector(".book-nikaya-title"))==null||s.classList.add("open"),(n=t.querySelector(".book-nikaya-list"))==null||n.classList.add("open"))}),o.querySelectorAll(".book-category").forEach(t=>{const a=[...t.querySelectorAll(".book-entry")].some(s=>s.style.display!=="none");t.style.display=a?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const o=e.querySelector(".book-name");o&&(o.textContent=o.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...w.filter(t=>e.includes(t)),...e.filter(t=>!w.includes(t))].map(t=>({label:t,data:this.menu[t]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((t,a)=>{const s=n=>{const d=K.findIndex(u=>n.includes(u));return d===-1?99:d};return s(t)-s(a)}).map(t=>`
      <div class="book-category">
        <div class="book-category-title pali-text">${t}</div>
        <div class="book-category-content">
          ${this._renderNikaya(e[t])}
        </div>
      </div>
    `).join("")}_renderNikaya(e){if(!e||typeof e!="object")return"";const o=[];return e[""]&&o.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(e[""])}
          </ol>
        </div>
      `),Object.entries(e).forEach(([t,a])=>{t!==""&&o.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title pali-text">
            ${t}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(a)}
          </ol>
        </div>
      `)}),o.join("")}_buildBookList(e){return Array.isArray(e)?e.map(([o,t],a)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${o}"
           class="book-entry"
           data-book-id="${o}">
          <span class="book-num">${a+1}.</span>
          <span class="book-name pali-text">${t}</span>
        </a>
      </li>
    `).join(""):""}}class G{constructor(e,o){this._key=e,this._defaults=o,this._data=this._load()}get(e){return this._data[e]}set(e,o){this._data[e]=o,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function J({triggerSelector:r,baseUrl:e,lang:o,menu:t,hierarchy:a}){var k;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(r);if(!s){console.warn("[HomeDialog] trigger not found:",r);return}const n=new G("homeDialog_state",{searchQuery:"",searchTypeId:((k=$[0])==null?void 0:k.id)??"",activeTabId:null}),d=a||U(t||{}),u=new F({baseUrl:e,lang:o,menu:t||{},onNavigate:i=>{b(),window.location.href=i}}),h=new B({baseUrl:e,lang:o,hierarchy:d,initialState:{searchTypeId:n.get("searchTypeId")},onResultSelect:i=>{try{C({panel:"search",search:h.getState()})}catch{}b(),window.location.href=i},onShowResults:()=>q(),onShowBooks:()=>x()}),c=document.createElement("div");c.id="home-dialog-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-label","Browse books"),c.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${H(j,n.get("searchTypeId"),n.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${u.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(c);const m=n.get("activeTabId");if(m){const i=document.querySelector(`.home-tab[data-tab="${m}"]`),l=document.querySelector(`.home-tab-panel[data-panel="${m}"]`);i&&l&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(p=>p.classList.remove("active")),i.classList.add("active"),l.classList.add("active"))}s.addEventListener("click",i=>{i.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",b),c.addEventListener("click",i=>{i.target===c&&b()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&c.classList.contains("show")&&b()}),u.bindTabs(),c.addEventListener("click",i=>{const l=i.target.closest(".home-tab");l!=null&&l.dataset.tab&&n.set("activeTabId",l.dataset.tab)}),h.bind(),document.getElementById("search-type-menu").addEventListener("click",i=>{const l=i.target.closest(".search-type-option");l&&n.set("searchTypeId",l.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",i=>{n.set("searchQuery",i.target.value);const l=i.target.value.trim();l?h.currentType.id==="headings"&&u.filter(l):u.clearFilter()});function g(){c.classList.add("show"),document.body.style.overflow="hidden",window.innerWidth>=768&&setTimeout(()=>{var i;return(i=document.getElementById("home-search-input"))==null?void 0:i.focus()},60)}function b(){c.classList.remove("show"),document.body.style.overflow=""}function q(){var i,l,p;document.querySelectorAll(".home-tab-panel").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(f=>f.classList.remove("active")),(i=document.getElementById("home-tabs"))==null||i.classList.add("tabs-hidden"),(l=document.getElementById("home-filter-wrap"))==null||l.classList.add("show"),(p=document.getElementById("home-results-panel"))==null||p.classList.add("active")}function x(){var f,L,E,S,_;(f=document.getElementById("home-results-panel"))==null||f.classList.remove("active"),(L=document.getElementById("home-tabs"))==null||L.classList.remove("tabs-hidden"),(E=document.getElementById("home-filter-wrap"))==null||E.classList.remove("show");const i=n.get("activeTabId"),l=i&&document.querySelector(`.home-tab[data-tab="${i}"]`),p=i&&document.querySelector(`.home-tab-panel[data-panel="${i}"]`);l&&p?(l.classList.add("active"),p.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:g,close:b}}function U(r){const e={};for(const[o,t]of Object.entries(r))for(const[a,s]of Object.entries(t))for(const[,n]of Object.entries(s))if(Array.isArray(n))for(const[d]of n)e[d]={nikaya:a,category:o};return e}const{baseUrl:A,lang:I}=window.INDEX_CONFIG,v="epika_disclaimer_skip";function T(){try{return localStorage.getItem(v)==="1"}catch{return!1}}const y=document.getElementById("disclaimer-overlay"),W=document.getElementById("disclaimer-ok"),X=document.getElementById("disclaimer-no-show");async function Y(){try{const r=await fetch(`${A}/api/menu`);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){return console.warn("[index] failed to load menu, falling back to empty",r),{menu:{},hierarchy:{}}}}T()&&(y==null||y.classList.add("hidden"));async function z(){O();const r=N(I);P(r),M(r.paliScript),R({gaId:"G-7NQWX1DCC2"}),D({bookId:""}),Z();const{menu:e,hierarchy:o}=await Y();J({triggerSelector:"#open-books-btn",baseUrl:A,lang:I,menu:e,hierarchy:o}),document.querySelectorAll(".lang-dropdown__item").forEach(a=>{a.addEventListener("click",()=>{var n;const s=(n=a.getAttribute("href"))==null?void 0:n.match(/\/([a-z]{2})\/?$/);s&&Q(s[1])})});function t(a){if(a&&X.checked)try{localStorage.setItem(v,"1"),document.cookie=`${v}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}y.classList.add("hidden")}T()&&y.classList.add("hidden"),W.addEventListener("click",()=>t(!0)),y.addEventListener("click",a=>{a.target===y&&t(!1)}),document.addEventListener("keydown",a=>{a.key==="Escape"&&!y.classList.contains("hidden")&&t(!1)})}function Z(){const r=document.querySelector(".lang-dropdown__toggle"),e=document.querySelector(".lang-dropdown__menu");if(r&&e){const a=e.querySelector(".lang-dropdown__filter"),s=e.querySelector(".lang-dropdown__empty"),n=[...e.querySelectorAll(".lang-dropdown__list > li")],d=()=>{if(!a)return;const h=a.value.trim().toLowerCase();let c=0;for(const m of n){const g=!h||(m.dataset.search||m.textContent).toLowerCase().includes(h);m.hidden=!g,g&&c++}s&&(s.hidden=c!==0)};a==null||a.addEventListener("input",d),e.addEventListener("click",h=>h.stopPropagation());const u=()=>{r.setAttribute("aria-expanded","false"),e.classList.remove("open")};r.addEventListener("click",h=>{var m;h.stopPropagation();const c=!e.classList.contains("open");r.setAttribute("aria-expanded",String(c)),e.classList.toggle("open",c),c&&(a&&(a.value="",d()),(m=e.querySelector(".lang-dropdown__item.selected"))==null||m.scrollIntoView({block:"nearest"}),a==null||a.focus({preventScroll:!0}))}),document.addEventListener("keydown",h=>{h.key==="Escape"&&u()})}const o=document.getElementById("more-btn"),t=document.getElementById("topbar-more-menu");o&&t&&o.addEventListener("click",a=>{a.stopPropagation();const s=o.getAttribute("aria-expanded")==="true";o.setAttribute("aria-expanded",String(!s)),t.classList.toggle("open")}),document.addEventListener("click",()=>{r==null||r.setAttribute("aria-expanded","false"),e==null||e.classList.remove("open"),o==null||o.setAttribute("aria-expanded","false"),t==null||t.classList.remove("open")})}z();

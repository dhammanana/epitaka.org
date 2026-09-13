import{g as H,H as C,h as j,j as M,k as O,l as R,S as w,T as I,a as P,f as N,i as D,o as Q}from"./cookie-consent-7gef3AxB.chunk.js";function V(i,e){if(!e)return i;const a=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return i.replace(new RegExp(`(${a})`,"gi"),"<mark>$1</mark>")}const T=["Mūla","Aṭṭhakathā","Ṭīkā"],F=["Vinaya","Suttanta","Sutta","Abhidhamma"];class K{constructor({baseUrl:e,lang:a,menu:t,onNavigate:o}){this.baseUrl=e,this.lang=a,this.menu=t,this.onNavigate=o,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),a=e.map((o,s)=>`
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
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),a=document.querySelectorAll(".home-tab-panel");e.forEach(t=>{t.addEventListener("click",()=>{var s;const o=parseInt(t.dataset.tab);e.forEach(r=>r.classList.toggle("active",r===t)),a.forEach(r=>r.classList.toggle("active",parseInt(r.dataset.panel)===o)),(s=document.getElementById("home-results-panel"))==null||s.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(t=>{t.addEventListener("click",()=>{var o;t.classList.toggle("open"),(o=t.nextElementSibling)==null||o.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(t=>{t.addEventListener("click",o=>{o.preventDefault(),this.onNavigate(t.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(t=>{var r,d;const o=((d=(r=t.querySelector(".book-name"))==null?void 0:r.textContent)==null?void 0:d.toLowerCase())||"",s=!this._filterText||o.includes(this._filterText);if(t.style.display=s?"":"none",this._filterText&&s){const u=t.querySelector(".book-name");u&&(u.innerHTML=V(u.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(t=>{var s,r;const o=[...t.querySelectorAll(".book-entry")].some(d=>d.style.display!=="none");t.style.display=o?"":"none",this._filterText&&((s=t.querySelector(".book-nikaya-title"))==null||s.classList.add("open"),(r=t.querySelector(".book-nikaya-list"))==null||r.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(t=>{const o=[...t.querySelectorAll(".book-entry")].some(s=>s.style.display!=="none");t.style.display=o?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const a=e.querySelector(".book-name");a&&(a.textContent=a.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...T.filter(t=>e.includes(t)),...e.filter(t=>!T.includes(t))].map(t=>({label:t,data:this.menu[t]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((t,o)=>{const s=r=>{const d=F.findIndex(u=>r.includes(u));return d===-1?99:d};return s(t)-s(o)}).map(t=>`
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
    `).join(""):""}}class W{constructor(e,a){this._key=e,this._defaults=a,this._data=this._load()}get(e){return this._data[e]}set(e,a){this._data[e]=a,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function G({triggerSelector:i,baseUrl:e,lang:a,menu:t,hierarchy:o}){var k;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(i);if(!s){console.warn("[HomeDialog] trigger not found:",i);return}const r=new W("homeDialog_state",{searchQuery:"",searchTypeId:((k=H[0])==null?void 0:k.id)??"",activeTabId:null}),d=o||J(t||{}),u=new K({baseUrl:e,lang:a,menu:t||{},onNavigate:n=>{f(),window.location.href=n}}),h=new C({baseUrl:e,lang:a,hierarchy:d,initialState:{searchTypeId:r.get("searchTypeId")},onResultSelect:n=>{try{j({panel:"search",search:h.getState()})}catch{}f(),window.location.href=n},onShowResults:()=>$(),onShowBooks:()=>B(),onRenderResults:()=>A()}),c=document.createElement("div");c.id="home-dialog-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-label","Browse books"),c.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${M(O,r.get("searchTypeId"),r.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${u.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(c);const m=r.get("activeTabId");if(m){const n=document.querySelector(`.home-tab[data-tab="${m}"]`),l=document.querySelector(`.home-tab-panel[data-panel="${m}"]`);n&&l&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(p=>p.classList.remove("active")),n.classList.add("active"),l.classList.add("active"))}s.addEventListener("click",n=>{n.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",f),c.addEventListener("click",n=>{n.target===c&&f()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&c.classList.contains("show")&&f()}),u.bindTabs(),c.addEventListener("click",n=>{const l=n.target.closest(".home-tab");l!=null&&l.dataset.tab&&r.set("activeTabId",l.dataset.tab)}),h.bind(),document.getElementById("search-type-menu").addEventListener("click",n=>{const l=n.target.closest(".search-type-option");l&&r.set("searchTypeId",l.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",n=>{r.set("searchQuery",n.target.value);const l=n.target.value.trim();l?h.currentType.id==="headings"&&u.filter(l):u.clearFilter()});function g(){c.classList.add("show"),document.body.style.overflow="hidden",A(),window.innerWidth>=768&&setTimeout(()=>{var n;return(n=document.getElementById("home-search-input"))==null?void 0:n.focus()},60)}function f(){c.classList.remove("show"),document.body.style.overflow=""}function $(){var n,l,p;document.querySelectorAll(".home-tab-panel").forEach(b=>b.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(b=>b.classList.remove("active")),(n=document.getElementById("home-tabs"))==null||n.classList.add("tabs-hidden"),(l=document.getElementById("home-filter-wrap"))==null||l.classList.add("show"),(p=document.getElementById("home-results-panel"))==null||p.classList.add("active")}function B(){var b,L,E,S,_;(b=document.getElementById("home-results-panel"))==null||b.classList.remove("active"),(L=document.getElementById("home-tabs"))==null||L.classList.remove("tabs-hidden"),(E=document.getElementById("home-filter-wrap"))==null||E.classList.remove("show");const n=r.get("activeTabId"),l=n&&document.querySelector(`.home-tab[data-tab="${n}"]`),p=n&&document.querySelector(`.home-tab-panel[data-panel="${n}"]`);l&&p?(l.classList.add("active"),p.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:g,close:f}}function A(){const i=document.getElementById("home-dialog-overlay");if(!i)return;const e=R(),a=(e==null?void 0:e.paliScript)||w.RO,t=new WeakMap;i.querySelectorAll(".pali-text").forEach(o=>{t.has(o)||t.set(o,o.innerHTML);const s=t.get(o);o.innerHTML=a===w.RO?s:s.replace(/(<[^>]+>)|([^<]+)/g,(r,d,u)=>d||I.convert(I.convertFromMixed(u),a))})}function J(i){const e={};for(const[a,t]of Object.entries(i))for(const[o,s]of Object.entries(t))for(const[,r]of Object.entries(s))if(Array.isArray(r))for(const[d]of r)e[d]={nikaya:o,category:a};return e}const{baseUrl:x,lang:U}=window.INDEX_CONFIG,v="epika_disclaimer_skip";function q(){try{return localStorage.getItem(v)==="1"}catch{return!1}}const y=document.getElementById("disclaimer-overlay"),X=document.getElementById("disclaimer-ok"),Y=document.getElementById("disclaimer-no-show");async function z(){try{const i=await fetch(`${x}/api/menu`);if(!i.ok)throw new Error(`HTTP ${i.status}`);return await i.json()}catch(i){return console.warn("[index] failed to load menu, falling back to empty",i),{menu:{},hierarchy:{}}}}q()&&(y==null||y.classList.add("hidden"));async function Z(){P(),N({gaId:"G-7NQWX1DCC2"}),D({bookId:""}),ee();const{menu:i,hierarchy:e}=await z();G({triggerSelector:"#open-books-btn",baseUrl:x,lang:U,menu:i,hierarchy:e}),document.querySelectorAll(".lang-dropdown__item").forEach(t=>{t.addEventListener("click",()=>{var s;const o=(s=t.getAttribute("href"))==null?void 0:s.match(/\/([a-z]{2})\/?$/);o&&Q(o[1])})});function a(t){if(t&&Y.checked)try{localStorage.setItem(v,"1"),document.cookie=`${v}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}y.classList.add("hidden")}q()&&y.classList.add("hidden"),X.addEventListener("click",()=>a(!0)),y.addEventListener("click",t=>{t.target===y&&a(!1)}),document.addEventListener("keydown",t=>{t.key==="Escape"&&!y.classList.contains("hidden")&&a(!1)})}function ee(){const i=document.querySelector(".lang-dropdown__toggle"),e=document.querySelector(".lang-dropdown__menu");if(i&&e){const o=e.querySelector(".lang-dropdown__filter"),s=e.querySelector(".lang-dropdown__empty"),r=[...e.querySelectorAll(".lang-dropdown__list > li")],d=()=>{if(!o)return;const h=o.value.trim().toLowerCase();let c=0;for(const m of r){const g=!h||(m.dataset.search||m.textContent).toLowerCase().includes(h);m.hidden=!g,g&&c++}s&&(s.hidden=c!==0)};o==null||o.addEventListener("input",d),e.addEventListener("click",h=>h.stopPropagation());const u=()=>{i.setAttribute("aria-expanded","false"),e.classList.remove("open")};i.addEventListener("click",h=>{var m;h.stopPropagation();const c=!e.classList.contains("open");i.setAttribute("aria-expanded",String(c)),e.classList.toggle("open",c),c&&(o&&(o.value="",d()),(m=e.querySelector(".lang-dropdown__item.selected"))==null||m.scrollIntoView({block:"nearest"}),o==null||o.focus({preventScroll:!0}))}),document.addEventListener("keydown",h=>{h.key==="Escape"&&u()})}const a=document.getElementById("more-btn"),t=document.getElementById("topbar-more-menu");a&&t&&a.addEventListener("click",o=>{o.stopPropagation();const s=a.getAttribute("aria-expanded")==="true";a.setAttribute("aria-expanded",String(!s)),t.classList.toggle("open")}),document.addEventListener("click",()=>{i==null||i.setAttribute("aria-expanded","false"),e==null||e.classList.remove("open"),a==null||a.setAttribute("aria-expanded","false"),t==null||t.classList.remove("open")})}Z();

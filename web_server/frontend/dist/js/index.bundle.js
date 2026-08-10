import{S as q,a as B,b as x,H}from"./home-dialog-search.chunk.js";function j(r,t){if(!t)return r;const o=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return r.replace(new RegExp(`(${o})`,"gi"),"<mark>$1</mark>")}const w=["Mūla","Aṭṭhakathā","Ṭīkā"],C=["Vinaya","Suttanta","Sutta","Abhidhamma"];class M{constructor({baseUrl:t,lang:o,menu:e,onNavigate:s}){this.baseUrl=t,this.lang=o,this.menu=e,this.onNavigate=s,this._filterText=""}buildHTML(){const t=this._resolvedCategories(),o=t.map((s,n)=>`
      <button class="home-tab${n===0?" active":""}"
              data-tab="${n}" type="button">${s.label}</button>
    `).join(""),e=t.map((s,n)=>`
      <div class="home-tab-panel${n===0?" active":""}" data-panel="${n}">
        ${this._buildCategoryHTML(s)}
      </div>
    `).join("");return`
      <div id="home-tabs">${o}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${e}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const t=document.querySelectorAll(".home-tab"),o=document.querySelectorAll(".home-tab-panel");t.forEach(e=>{e.addEventListener("click",()=>{var n;const s=parseInt(e.dataset.tab);t.forEach(i=>i.classList.toggle("active",i===e)),o.forEach(i=>i.classList.toggle("active",parseInt(i.dataset.panel)===s)),(n=document.getElementById("home-results-panel"))==null||n.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(e=>{e.addEventListener("click",()=>{var s;e.classList.toggle("open"),(s=e.nextElementSibling)==null||s.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault(),this.onNavigate(e.href)})})}filter(t){this._filterText=t.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(o=>{o.querySelectorAll(".book-entry").forEach(e=>{var i,d;const s=((d=(i=e.querySelector(".book-name"))==null?void 0:i.textContent)==null?void 0:d.toLowerCase())||"",n=!this._filterText||s.includes(this._filterText);if(e.style.display=n?"":"none",this._filterText&&n){const u=e.querySelector(".book-name");u&&(u.innerHTML=j(u.textContent,this._filterText))}}),o.querySelectorAll(".book-nikaya").forEach(e=>{var n,i;const s=[...e.querySelectorAll(".book-entry")].some(d=>d.style.display!=="none");e.style.display=s?"":"none",this._filterText&&((n=e.querySelector(".book-nikaya-title"))==null||n.classList.add("open"),(i=e.querySelector(".book-nikaya-list"))==null||i.classList.add("open"))}),o.querySelectorAll(".book-category").forEach(e=>{const s=[...e.querySelectorAll(".book-entry")].some(n=>n.style.display!=="none");e.style.display=s?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(t=>{t.style.display="";const o=t.querySelector(".book-name");o&&(o.textContent=o.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(t=>{t.style.display=""})}_resolvedCategories(){const t=Object.keys(this.menu);return[...w.filter(e=>t.includes(e)),...t.filter(e=>!w.includes(e))].map(e=>({label:e,data:this.menu[e]}))}_buildCategoryHTML({data:t}){return!t||typeof t!="object"?"":Object.keys(t).sort((e,s)=>{const n=i=>{const d=C.findIndex(u=>i.includes(u));return d===-1?99:d};return n(e)-n(s)}).map(e=>`
      <div class="book-category">
        <div class="book-category-title">${e}</div>
        <div class="book-category-content">
          ${this._renderNikaya(t[e])}
        </div>
      </div>
    `).join("")}_renderNikaya(t){if(!t||typeof t!="object")return"";const o=[];return t[""]&&o.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(t[""])}
          </ol>
        </div>
      `),Object.entries(t).forEach(([e,s])=>{e!==""&&o.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${e}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(s)}
          </ol>
        </div>
      `)}),o.join("")}_buildBookList(t){return Array.isArray(t)?t.map(([o,e],s)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${o}"
           class="book-entry"
           data-book-id="${o}">
          <span class="book-num">${s+1}.</span>
          <span class="book-name">${e}</span>
        </a>
      </li>
    `).join(""):""}}class O{constructor(t,o){this._key=t,this._defaults=o,this._data=this._load()}get(t){return this._data[t]}set(t,o){this._data[t]=o,this._save()}patch(t){Object.assign(this._data,t),this._save()}snapshot(){return{...this._data}}_load(){try{const t=localStorage.getItem(this._key);return t?{...this._defaults,...JSON.parse(t)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function N({triggerSelector:r,baseUrl:t,lang:o,menu:e,hierarchy:s}){var k;if(document.getElementById("home-dialog-overlay"))return;const n=document.querySelector(r);if(!n){console.warn("[HomeDialog] trigger not found:",r);return}const i=new O("homeDialog_state",{searchQuery:"",searchTypeId:((k=q[0])==null?void 0:k.id)??"",activeTabId:null}),d=s||R(e||{}),u=new M({baseUrl:t,lang:o,menu:e||{},onNavigate:a=>{m(),window.location.href=a}}),p=new B({baseUrl:t,lang:o,hierarchy:d,initialState:{searchTypeId:i.get("searchTypeId")},onResultSelect:a=>{m(),window.location.href=a},onShowResults:()=>$(),onShowBooks:()=>A()}),c=document.createElement("div");c.id="home-dialog-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-label","Browse books"),c.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${x(H,i.get("searchTypeId"),i.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${u.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(c);const f=i.get("activeTabId");if(f){const a=document.querySelector(`.home-tab[data-tab="${f}"]`),l=document.querySelector(`.home-tab-panel[data-panel="${f}"]`);a&&l&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(h=>h.classList.remove("active")),a.classList.add("active"),l.classList.add("active"))}n.addEventListener("click",a=>{a.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",m),c.addEventListener("click",a=>{a.target===c&&m()}),document.addEventListener("keydown",a=>{a.key==="Escape"&&c.classList.contains("show")&&m()}),u.bindTabs(),c.addEventListener("click",a=>{const l=a.target.closest(".home-tab");l!=null&&l.dataset.tab&&i.set("activeTabId",l.dataset.tab)}),p.bind(),document.getElementById("search-type-menu").addEventListener("click",a=>{const l=a.target.closest(".search-type-option");l&&i.set("searchTypeId",l.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",a=>{i.set("searchQuery",a.target.value);const l=a.target.value.trim();l?p.currentType.id==="headings"&&u.filter(l):u.clearFilter()});function g(){c.classList.add("show"),document.body.style.overflow="hidden",setTimeout(()=>{var a;return(a=document.getElementById("home-search-input"))==null?void 0:a.focus()},60)}function m(){c.classList.remove("show"),document.body.style.overflow=""}function $(){var a,l,h;document.querySelectorAll(".home-tab-panel").forEach(y=>y.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(y=>y.classList.remove("active")),(a=document.getElementById("home-tabs"))==null||a.classList.add("tabs-hidden"),(l=document.getElementById("home-filter-wrap"))==null||l.classList.add("show"),(h=document.getElementById("home-results-panel"))==null||h.classList.add("active")}function A(){var y,E,L,S,_;(y=document.getElementById("home-results-panel"))==null||y.classList.remove("active"),(E=document.getElementById("home-tabs"))==null||E.classList.remove("tabs-hidden"),(L=document.getElementById("home-filter-wrap"))==null||L.classList.remove("show");const a=i.get("activeTabId"),l=a&&document.querySelector(`.home-tab[data-tab="${a}"]`),h=a&&document.querySelector(`.home-tab-panel[data-panel="${a}"]`);l&&h?(l.classList.add("active"),h.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:g,close:m}}function R(r){const t={};for(const[o,e]of Object.entries(r))for(const[s,n]of Object.entries(e))for(const[,i]of Object.entries(n))if(Array.isArray(i))for(const[d]of i)t[d]={nikaya:s,category:o};return t}const{baseUrl:T,lang:D}=window.INDEX_CONFIG,I="epika_disclaimer_skip",b=document.getElementById("disclaimer-overlay"),P=document.getElementById("disclaimer-ok"),F=document.getElementById("disclaimer-no-show");let v=null;async function K(){try{const r=await fetch(`${T}/api/menu`);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){return console.warn("[index] failed to load menu, falling back to empty",r),{menu:{},hierarchy:{}}}}async function Q(){const{menu:r,hierarchy:t}=await K();v=N({triggerSelector:"#open-books-btn",baseUrl:T,lang:D,menu:r,hierarchy:t});function o(e){e&&F.checked&&localStorage.setItem(I,"1"),b.classList.add("hidden"),v.open()}localStorage.getItem(I)==="1"&&(b.classList.add("hidden"),v.open()),P.addEventListener("click",()=>o(!0)),b.addEventListener("click",e=>{e.target===b&&o(!1)}),document.addEventListener("keydown",e=>{e.key==="Escape"&&!b.classList.contains("hidden")&&o(!1)})}Q();

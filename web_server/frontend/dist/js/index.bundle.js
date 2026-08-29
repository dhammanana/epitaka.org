import{a as q,c as B,b as x,H,d as C,j}from"./cookie-consent-D4J6y3b6.chunk.js";function M(c,t){if(!t)return c;const a=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return c.replace(new RegExp(`(${a})`,"gi"),"<mark>$1</mark>")}const w=["Mūla","Aṭṭhakathā","Ṭīkā"],N=["Vinaya","Suttanta","Sutta","Abhidhamma"];class O{constructor({baseUrl:t,lang:a,menu:e,onNavigate:s}){this.baseUrl=t,this.lang=a,this.menu=e,this.onNavigate=s,this._filterText=""}buildHTML(){const t=this._resolvedCategories(),a=t.map((s,n)=>`
      <button class="home-tab${n===0?" active":""}"
              data-tab="${n}" type="button">${s.label}</button>
    `).join(""),e=t.map((s,n)=>`
      <div class="home-tab-panel${n===0?" active":""}" data-panel="${n}">
        ${this._buildCategoryHTML(s)}
      </div>
    `).join("");return`
      <div id="home-tabs">${a}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${e}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const t=document.querySelectorAll(".home-tab"),a=document.querySelectorAll(".home-tab-panel");t.forEach(e=>{e.addEventListener("click",()=>{var n;const s=parseInt(e.dataset.tab);t.forEach(i=>i.classList.toggle("active",i===e)),a.forEach(i=>i.classList.toggle("active",parseInt(i.dataset.panel)===s)),(n=document.getElementById("home-results-panel"))==null||n.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(e=>{e.addEventListener("click",()=>{var s;e.classList.toggle("open"),(s=e.nextElementSibling)==null||s.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault(),this.onNavigate(e.href)})})}filter(t){this._filterText=t.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(e=>{var i,d;const s=((d=(i=e.querySelector(".book-name"))==null?void 0:i.textContent)==null?void 0:d.toLowerCase())||"",n=!this._filterText||s.includes(this._filterText);if(e.style.display=n?"":"none",this._filterText&&n){const u=e.querySelector(".book-name");u&&(u.innerHTML=M(u.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(e=>{var n,i;const s=[...e.querySelectorAll(".book-entry")].some(d=>d.style.display!=="none");e.style.display=s?"":"none",this._filterText&&((n=e.querySelector(".book-nikaya-title"))==null||n.classList.add("open"),(i=e.querySelector(".book-nikaya-list"))==null||i.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(e=>{const s=[...e.querySelectorAll(".book-entry")].some(n=>n.style.display!=="none");e.style.display=s?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(t=>{t.style.display="";const a=t.querySelector(".book-name");a&&(a.textContent=a.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(t=>{t.style.display=""})}_resolvedCategories(){const t=Object.keys(this.menu);return[...w.filter(e=>t.includes(e)),...t.filter(e=>!w.includes(e))].map(e=>({label:e,data:this.menu[e]}))}_buildCategoryHTML({data:t}){return!t||typeof t!="object"?"":Object.keys(t).sort((e,s)=>{const n=i=>{const d=N.findIndex(u=>i.includes(u));return d===-1?99:d};return n(e)-n(s)}).map(e=>`
      <div class="book-category">
        <div class="book-category-title">${e}</div>
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
      `),Object.entries(t).forEach(([e,s])=>{e!==""&&a.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${e}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(s)}
          </ol>
        </div>
      `)}),a.join("")}_buildBookList(t){return Array.isArray(t)?t.map(([a,e],s)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${a}"
           class="book-entry"
           data-book-id="${a}">
          <span class="book-num">${s+1}.</span>
          <span class="book-name">${e}</span>
        </a>
      </li>
    `).join(""):""}}class D{constructor(t,a){this._key=t,this._defaults=a,this._data=this._load()}get(t){return this._data[t]}set(t,a){this._data[t]=a,this._save()}patch(t){Object.assign(this._data,t),this._save()}snapshot(){return{...this._data}}_load(){try{const t=localStorage.getItem(this._key);return t?{...this._defaults,...JSON.parse(t)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function R({triggerSelector:c,baseUrl:t,lang:a,menu:e,hierarchy:s}){var k;if(document.getElementById("home-dialog-overlay"))return;const n=document.querySelector(c);if(!n){console.warn("[HomeDialog] trigger not found:",c);return}const i=new D("homeDialog_state",{searchQuery:"",searchTypeId:((k=q[0])==null?void 0:k.id)??"",activeTabId:null}),d=s||P(e||{}),u=new O({baseUrl:t,lang:a,menu:e||{},onNavigate:o=>{y(),window.location.href=o}}),v=new B({baseUrl:t,lang:a,hierarchy:d,initialState:{searchTypeId:i.get("searchTypeId")},onResultSelect:o=>{y(),window.location.href=o},onShowResults:()=>$(),onShowBooks:()=>A()}),l=document.createElement("div");l.id="home-dialog-overlay",l.setAttribute("role","dialog"),l.setAttribute("aria-modal","true"),l.setAttribute("aria-label","Browse books"),l.innerHTML=`
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
  `,document.body.appendChild(l);const f=i.get("activeTabId");if(f){const o=document.querySelector(`.home-tab[data-tab="${f}"]`),r=document.querySelector(`.home-tab-panel[data-panel="${f}"]`);o&&r&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(m=>m.classList.remove("active")),o.classList.add("active"),r.classList.add("active"))}n.addEventListener("click",o=>{o.preventDefault(),g()}),document.getElementById("home-dialog-close").addEventListener("click",y),l.addEventListener("click",o=>{o.target===l&&y()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&l.classList.contains("show")&&y()}),u.bindTabs(),l.addEventListener("click",o=>{const r=o.target.closest(".home-tab");r!=null&&r.dataset.tab&&i.set("activeTabId",r.dataset.tab)}),v.bind(),document.getElementById("search-type-menu").addEventListener("click",o=>{const r=o.target.closest(".search-type-option");r&&i.set("searchTypeId",r.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",o=>{i.set("searchQuery",o.target.value);const r=o.target.value.trim();r?v.currentType.id==="headings"&&u.filter(r):u.clearFilter()});function g(){l.classList.add("show"),document.body.style.overflow="hidden",window.innerWidth>=768&&setTimeout(()=>{var o;return(o=document.getElementById("home-search-input"))==null?void 0:o.focus()},60)}function y(){l.classList.remove("show"),document.body.style.overflow=""}function $(){var o,r,m;document.querySelectorAll(".home-tab-panel").forEach(b=>b.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(b=>b.classList.remove("active")),(o=document.getElementById("home-tabs"))==null||o.classList.add("tabs-hidden"),(r=document.getElementById("home-filter-wrap"))==null||r.classList.add("show"),(m=document.getElementById("home-results-panel"))==null||m.classList.add("active")}function A(){var b,E,L,S,_;(b=document.getElementById("home-results-panel"))==null||b.classList.remove("active"),(E=document.getElementById("home-tabs"))==null||E.classList.remove("tabs-hidden"),(L=document.getElementById("home-filter-wrap"))==null||L.classList.remove("show");const o=i.get("activeTabId"),r=o&&document.querySelector(`.home-tab[data-tab="${o}"]`),m=o&&document.querySelector(`.home-tab-panel[data-panel="${o}"]`);r&&m?(r.classList.add("active"),m.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:g,close:y}}function P(c){const t={};for(const[a,e]of Object.entries(c))for(const[s,n]of Object.entries(e))for(const[,i]of Object.entries(n))if(Array.isArray(i))for(const[d]of i)t[d]={nikaya:s,category:a};return t}const{baseUrl:I,lang:F}=window.INDEX_CONFIG,p="epika_disclaimer_skip";function T(){try{return localStorage.getItem(p)==="1"}catch{return!1}}const h=document.getElementById("disclaimer-overlay"),Q=document.getElementById("disclaimer-ok"),K=document.getElementById("disclaimer-no-show");async function V(){try{const c=await fetch(`${I}/api/menu`);if(!c.ok)throw new Error(`HTTP ${c.status}`);return await c.json()}catch(c){return console.warn("[index] failed to load menu, falling back to empty",c),{menu:{},hierarchy:{}}}}T()&&(h==null||h.classList.add("hidden"));async function G(){C();const{menu:c,hierarchy:t}=await V();R({triggerSelector:"#open-books-btn",baseUrl:I,lang:F,menu:c,hierarchy:t}),j({gaId:"G-7NQWX1DCC2"});function a(e){if(e&&K.checked)try{localStorage.setItem(p,"1"),document.cookie=`${p}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}h.classList.add("hidden")}T()&&h.classList.add("hidden"),Q.addEventListener("click",()=>a(!0)),h.addEventListener("click",e=>{e.target===h&&a(!1)}),document.addEventListener("keydown",e=>{e.key==="Escape"&&!h.classList.contains("hidden")&&a(!1)})}G();

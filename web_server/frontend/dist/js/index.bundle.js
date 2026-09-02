import{a as H,c as C,b as M,H as j,l as O,S as w,T,d as R,j as N,o as P}from"./cookie-consent-DVN8nd_X.chunk.js";function D(r,t){if(!t)return r;const a=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return r.replace(new RegExp(`(${a})`,"gi"),"<mark>$1</mark>")}const I=["Mūla","Aṭṭhakathā","Ṭīkā"],F=["Vinaya","Suttanta","Sutta","Abhidhamma"];class Q{constructor({baseUrl:t,lang:a,menu:e,onNavigate:o}){this.baseUrl=t,this.lang=a,this.menu=e,this.onNavigate=o,this._filterText=""}buildHTML(){const t=this._resolvedCategories(),a=t.map((o,s)=>`
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
    `}bindTabs(){const t=document.querySelectorAll(".home-tab"),a=document.querySelectorAll(".home-tab-panel");t.forEach(e=>{e.addEventListener("click",()=>{var s;const o=parseInt(e.dataset.tab);t.forEach(n=>n.classList.toggle("active",n===e)),a.forEach(n=>n.classList.toggle("active",parseInt(n.dataset.panel)===o)),(s=document.getElementById("home-results-panel"))==null||s.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(e=>{e.addEventListener("click",()=>{var o;e.classList.toggle("open"),(o=e.nextElementSibling)==null||o.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(e=>{e.addEventListener("click",o=>{o.preventDefault(),this.onNavigate(e.href)})})}filter(t){this._filterText=t.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(a=>{a.querySelectorAll(".book-entry").forEach(e=>{var n,l;const o=((l=(n=e.querySelector(".book-name"))==null?void 0:n.textContent)==null?void 0:l.toLowerCase())||"",s=!this._filterText||o.includes(this._filterText);if(e.style.display=s?"":"none",this._filterText&&s){const d=e.querySelector(".book-name");d&&(d.innerHTML=D(d.textContent,this._filterText))}}),a.querySelectorAll(".book-nikaya").forEach(e=>{var s,n;const o=[...e.querySelectorAll(".book-entry")].some(l=>l.style.display!=="none");e.style.display=o?"":"none",this._filterText&&((s=e.querySelector(".book-nikaya-title"))==null||s.classList.add("open"),(n=e.querySelector(".book-nikaya-list"))==null||n.classList.add("open"))}),a.querySelectorAll(".book-category").forEach(e=>{const o=[...e.querySelectorAll(".book-entry")].some(s=>s.style.display!=="none");e.style.display=o?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(t=>{t.style.display="";const a=t.querySelector(".book-name");a&&(a.textContent=a.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(t=>{t.style.display=""})}_resolvedCategories(){const t=Object.keys(this.menu);return[...I.filter(e=>t.includes(e)),...t.filter(e=>!I.includes(e))].map(e=>({label:e,data:this.menu[e]}))}_buildCategoryHTML({data:t}){return!t||typeof t!="object"?"":Object.keys(t).sort((e,o)=>{const s=n=>{const l=F.findIndex(d=>n.includes(d));return l===-1?99:l};return s(e)-s(o)}).map(e=>`
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
    `).join(""):""}}class K{constructor(t,a){this._key=t,this._defaults=a,this._data=this._load()}get(t){return this._data[t]}set(t,a){this._data[t]=a,this._save()}patch(t){Object.assign(this._data,t),this._save()}snapshot(){return{...this._data}}_load(){try{const t=localStorage.getItem(this._key);return t?{...this._defaults,...JSON.parse(t)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function V({triggerSelector:r,baseUrl:t,lang:a,menu:e,hierarchy:o}){var k;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(r);if(!s){console.warn("[HomeDialog] trigger not found:",r);return}const n=new K("homeDialog_state",{searchQuery:"",searchTypeId:((k=H[0])==null?void 0:k.id)??"",activeTabId:null}),l=o||W(e||{}),d=new Q({baseUrl:t,lang:a,menu:e||{},onNavigate:i=>{y(),window.location.href=i}}),g=new C({baseUrl:t,lang:a,hierarchy:l,initialState:{searchTypeId:n.get("searchTypeId")},onResultSelect:i=>{y(),window.location.href=i},onShowResults:()=>x(),onShowBooks:()=>B(),onRenderResults:()=>A()}),u=document.createElement("div");u.id="home-dialog-overlay",u.setAttribute("role","dialog"),u.setAttribute("aria-modal","true"),u.setAttribute("aria-label","Browse books"),u.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        ${M(j,n.get("searchTypeId"),n.get("searchQuery"))}


      </div>

      <div id="home-dialog-body">
        ${d.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(u);const b=n.get("activeTabId");if(b){const i=document.querySelector(`.home-tab[data-tab="${b}"]`),c=document.querySelector(`.home-tab-panel[data-panel="${b}"]`);i&&c&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(m=>m.classList.remove("active")),i.classList.add("active"),c.classList.add("active"))}s.addEventListener("click",i=>{i.preventDefault(),v()}),document.getElementById("home-dialog-close").addEventListener("click",y),u.addEventListener("click",i=>{i.target===u&&y()}),document.addEventListener("keydown",i=>{i.key==="Escape"&&u.classList.contains("show")&&y()}),d.bindTabs(),u.addEventListener("click",i=>{const c=i.target.closest(".home-tab");c!=null&&c.dataset.tab&&n.set("activeTabId",c.dataset.tab)}),g.bind(),document.getElementById("search-type-menu").addEventListener("click",i=>{const c=i.target.closest(".search-type-option");c&&n.set("searchTypeId",c.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",i=>{n.set("searchQuery",i.target.value);const c=i.target.value.trim();c?g.currentType.id==="headings"&&d.filter(c):d.clearFilter()});function v(){u.classList.add("show"),document.body.style.overflow="hidden",A(),window.innerWidth>=768&&setTimeout(()=>{var i;return(i=document.getElementById("home-search-input"))==null?void 0:i.focus()},60)}function y(){u.classList.remove("show"),document.body.style.overflow=""}function x(){var i,c,m;document.querySelectorAll(".home-tab-panel").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(f=>f.classList.remove("active")),(i=document.getElementById("home-tabs"))==null||i.classList.add("tabs-hidden"),(c=document.getElementById("home-filter-wrap"))==null||c.classList.add("show"),(m=document.getElementById("home-results-panel"))==null||m.classList.add("active")}function B(){var f,E,L,S,_;(f=document.getElementById("home-results-panel"))==null||f.classList.remove("active"),(E=document.getElementById("home-tabs"))==null||E.classList.remove("tabs-hidden"),(L=document.getElementById("home-filter-wrap"))==null||L.classList.remove("show");const i=n.get("activeTabId"),c=i&&document.querySelector(`.home-tab[data-tab="${i}"]`),m=i&&document.querySelector(`.home-tab-panel[data-panel="${i}"]`);c&&m?(c.classList.add("active"),m.classList.add("active")):((S=document.querySelector(".home-tab-panel"))==null||S.classList.add("active"),(_=document.querySelector(".home-tab"))==null||_.classList.add("active"))}return{open:v,close:y}}function A(){const r=document.getElementById("home-dialog-overlay");if(!r)return;const t=O(),a=(t==null?void 0:t.paliScript)||w.RO,e=new WeakMap;r.querySelectorAll(".pali-text").forEach(o=>{e.has(o)||e.set(o,o.innerHTML);const s=e.get(o);o.innerHTML=a===w.RO?s:s.replace(/(<[^>]+>)|([^<]+)/g,(n,l,d)=>l||T.convert(T.convertFromMixed(d),a))})}function W(r){const t={};for(const[a,e]of Object.entries(r))for(const[o,s]of Object.entries(e))for(const[,n]of Object.entries(s))if(Array.isArray(n))for(const[l]of n)t[l]={nikaya:o,category:a};return t}const{baseUrl:$,lang:G}=window.INDEX_CONFIG,p="epika_disclaimer_skip";function q(){try{return localStorage.getItem(p)==="1"}catch{return!1}}const h=document.getElementById("disclaimer-overlay"),J=document.getElementById("disclaimer-ok"),U=document.getElementById("disclaimer-no-show");async function X(){try{const r=await fetch(`${$}/api/menu`);if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(r){return console.warn("[index] failed to load menu, falling back to empty",r),{menu:{},hierarchy:{}}}}q()&&(h==null||h.classList.add("hidden"));async function Y(){R(),N({gaId:"G-7NQWX1DCC2"});const{menu:r,hierarchy:t}=await X();V({triggerSelector:"#open-books-btn",baseUrl:$,lang:G,menu:r,hierarchy:t}),document.querySelectorAll(".landing-languages a").forEach(e=>{e.addEventListener("click",o=>{var n;const s=(n=e.getAttribute("href"))==null?void 0:n.match(/\/([a-z]{2})\/?$/);s&&P(s[1])})});function a(e){if(e&&U.checked)try{localStorage.setItem(p,"1"),document.cookie=`${p}=1; Max-Age=31536000; Path=/; SameSite=Lax`}catch{}h.classList.add("hidden")}q()&&h.classList.add("hidden"),J.addEventListener("click",()=>a(!0)),h.addEventListener("click",e=>{e.target===h&&a(!1)}),document.addEventListener("keydown",e=>{e.key==="Escape"&&!h.classList.contains("hidden")&&a(!1)})}Y();

import{g as E,t as x,T as C,S as N}from"./settings-TTsbx4mH.chunk.js";const{baseUrl:O}=window.EDITOR_CONFIG;async function v(t,{method:e="GET",body:n}={}){const o=await fetch(O+t,{method:e,headers:n?{"Content-Type":"application/json"}:void 0,body:n?JSON.stringify(n):void 0}),a=await o.json().catch(()=>({}));if(!o.ok)throw new Error(a.error||`HTTP ${o.status}`);return a}const s={me:null,langs:[],currentLang:null,menu:null,currentBook:null,toc:[],currentSection:null,sentences:[],remarks:[],glossary:[],reviewFilter:{lang:"",kind:"",status:"pending",book_id:"",offset:0},reviewItems:[],reviewTotals:{},selectedReview:new Map},B=document.getElementById("editor-root");function j(){var t;(t=document.body)==null||t.setAttribute("script",E(s.currentLang))}function l(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const D=/&lt;(\/?)(b|i)&gt;/gi;function y(t=""){return l(t).replace(D,(e,n,o)=>`<${n}${o.toLowerCase()}>`)}function M(){B.innerHTML=`
    <div class="ed-login-wrap">
      <div class="ed-login-card">
        <div class="ed-login-logo">📖 E-Piṭaka</div>
        <h1 class="ed-login-title">Translation Editor</h1>
        <p class="ed-login-sub">Sign in to edit translations. Accounts are granted by the site administrator.</p>
        <form id="ed-login-form" class="ed-login-form" novalidate>
          <label class="ed-field">
            <span>Email</span>
            <input type="email" id="ed-login-email" autocomplete="username" required>
          </label>
          <label class="ed-field">
            <span>Password</span>
            <input type="password" id="ed-login-password" autocomplete="current-password" required>
          </label>
          <p id="ed-login-error" class="ed-error" hidden></p>
          <button type="submit" class="ed-btn ed-btn-primary ed-btn-block" id="ed-login-btn">Sign in</button>
        </form>
      </div>
    </div>`,document.getElementById("ed-login-form").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("ed-login-btn"),n=document.getElementById("ed-login-error");e.disabled=!0,e.textContent="Signing in…",n.hidden=!0;try{const o=await v("/editor/api/login",{method:"POST",body:{email:document.getElementById("ed-login-email").value,password:document.getElementById("ed-login-password").value}});s.me=o,await R()}catch(o){n.textContent=o.message,n.hidden=!1,e.disabled=!1,e.textContent="Sign in"}})}function G(){if(document.querySelector(".ed-modal-overlay"))return;const t=s.me,e=document.createElement("div");e.className="ed-modal-overlay",e.innerHTML=`
    <div class="ed-modal" role="dialog" aria-modal="true" aria-label="My account">
      <div class="ed-modal-head">
        <h3>👤 My account</h3>
        <button class="ed-modal-close" aria-label="Close">✕</button>
      </div>
      <div class="ed-form">
        <label class="ed-field"><span>Display name</span>
          <input type="text" id="acc-name" maxlength="120" value="${l(t.display_name||"")}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" id="acc-email" value="${l(t.email)}" disabled></label>
        <div class="ed-account-sep">Change password</div>
        <label class="ed-field"><span>Current password</span>
          <input type="password" id="acc-cur" autocomplete="current-password"></label>
        <label class="ed-field"><span>New password (min 8 chars)</span>
          <input type="password" id="acc-new" autocomplete="new-password" minlength="8"></label>
        <label class="ed-field"><span>Confirm new password</span>
          <input type="password" id="acc-confirm" autocomplete="new-password" minlength="8"></label>
        <p id="acc-msg" class="ed-error" hidden></p>
        <div class="ed-edit-actions">
          <button class="ed-btn ed-btn-primary" id="acc-save">Save changes</button>
          <span class="ed-save-msg" id="acc-msg-ok"></span>
        </div>
      </div>
    </div>`,document.body.appendChild(e);const n=a=>{a.key==="Escape"&&o()},o=()=>{document.removeEventListener("keydown",n),e.remove()};e.querySelector(".ed-modal-close").addEventListener("click",o),e.addEventListener("click",a=>{a.target===e&&o()}),document.addEventListener("keydown",n),e.querySelector("#acc-save").addEventListener("click",async()=>{const a=e.querySelector("#acc-msg"),i=e.querySelector("#acc-msg-ok"),d=e.querySelector("#acc-save");a.hidden=!0,i.textContent="";const r=e.querySelector("#acc-name").value.trim(),p=e.querySelector("#acc-cur").value,m=e.querySelector("#acc-new").value,g=e.querySelector("#acc-confirm").value;if(!r){a.textContent="Display name cannot be empty.",a.hidden=!1;return}const f=p||m||g;if(f){if(!p||!m||!g){a.textContent="Fill in all three password fields to change your password.",a.hidden=!1;return}if(m.length<8){a.textContent="New password must be at least 8 characters.",a.hidden=!1;return}if(m!==g){a.textContent="New password and confirmation do not match.",a.hidden=!1;return}}d.disabled=!0;try{await v("/editor/api/account",{method:"PATCH",body:{display_name:r}}),f&&await v("/editor/api/account/password",{method:"POST",body:{current_password:p,new_password:m}}),s.me.display_name=r;const u=document.querySelector(".ed-user-name");u&&(u.textContent=r),i.textContent="✓ Saved",e.querySelector("#acc-cur").value="",e.querySelector("#acc-new").value="",e.querySelector("#acc-confirm").value="",setTimeout(o,900)}catch(u){a.textContent=u.message,a.hidden=!1,d.disabled=!1}})}function W(){const t=s.me,e=`<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>
    <button class="ed-nav-btn" data-view="review">🛂 Review${s.pendingCount?` <span class="ed-badge">${s.pendingCount}</span>`:""}</button>
    ${t.is_super?'<button class="ed-nav-btn" data-view="editors">👥 Editors</button>':""}`;B.innerHTML=`
    <header class="ed-topbar">
      <div class="ed-brand">📖 E-Piṭaka <span class="ed-brand-sub">Translation Editor</span></div>
      <nav class="ed-nav">${e}</nav>
      <div class="ed-user">
        <span class="ed-user-name">${l(t.display_name||t.email)}</span>
        ${t.is_super?'<span class="ed-super-tag">admin</span>':""}
        <button class="ed-btn ed-btn-ghost" id="ed-account">👤 Account</button>
        <button class="ed-btn ed-btn-ghost" id="ed-logout">Sign out</button>
      </div>
    </header>
    <div class="ed-body">
      <div id="ed-workspace-view" class="ed-view" hidden></div>
      <div id="ed-review-view"   class="ed-view" hidden></div>
      <div id="ed-editors-view"  class="ed-view" hidden></div>
    </div>`,document.querySelectorAll(".ed-nav-btn").forEach(n=>{n.addEventListener("click",()=>A(n.dataset.view))}),document.getElementById("ed-account").addEventListener("click",G),document.getElementById("ed-logout").addEventListener("click",async()=>{try{await v("/editor/api/logout",{method:"POST"})}catch{}s.me=null,M()}),A("workspace")}function A(t){document.querySelectorAll(".ed-nav-btn").forEach(n=>n.classList.toggle("is-active",n.dataset.view===t)),document.querySelectorAll(".ed-view").forEach(n=>n.hidden=!0);const e=document.getElementById(`ed-${t}-view`);e.hidden=!1,t==="workspace"?q():t==="review"?ee():t==="editors"&&ae()}async function R(){var e;const t=await v("/editor/api/languages");s.langs=t.languages,s.currentLang=((e=s.langs[0])==null?void 0:e.code)||null,j(),s.currentLang&&await F(),W()}async function F(){if(!s.currentLang)return;const t=await v(`/editor/api/${s.currentLang}/books`);s.menu=t.menu,s.currentBook=null,s.toc=[],s.currentSection=null,s.sentences=[],s.remarks=[],s.glossary=[]}const T=["Mūla","Aṭṭhakathā","Ṭīkā"],V=["Vinaya","Suttanta","Sutta","Abhidhamma"];function q(){const t=document.getElementById("ed-workspace-view");t.innerHTML=`
    <div class="ed-ws">
      <aside class="ed-ws-side">
        <div class="ed-ws-block">
          <div class="ed-ws-label">Language</div>
          <div class="ed-lang-row">
            ${s.langs.map(e=>`<button class="ed-lang-chip${e.code===s.currentLang?" is-active":""}" data-lang="${e.code}" title="${l(e.english_name)}">${l(e.native_name)}</button>`).join("")}
          </div>
        </div>
        <div class="ed-ws-block ed-ws-books">
          <div class="ed-ws-label">Book</div>
          <div id="ed-book-tabs"></div>
          <div id="ed-book-tree" class="ed-book-tree"></div>
        </div>
        <div class="ed-ws-block ed-ws-sections">
          <div class="ed-ws-label">Section</div>
          <div id="ed-toc" class="ed-toc"></div>
        </div>
        <div class="ed-ws-block ed-ws-glossary">
          <div class="ed-ws-label">Glossary <span id="ed-gloss-count" class="ed-gloss-count"></span></div>
          <div id="ed-glossary" class="ed-glossary"></div>
        </div>
      </aside>
      <main class="ed-ws-main">
        <div class="ed-ws-head">
          <h2 class="ed-ws-bookname">${s.currentBook?l(s.currentBook.name):"Choose a book"}</h2>
          <span class="ed-ws-hint">Click a translation line to propose an edit · double-click a Pāli word for the dictionary</span>
          <span id="ed-check-summary" class="ed-check-summary"></span>
        </div>
        <div id="ed-lines" class="ed-lines"></div>
      </main>
    </div>`,document.querySelectorAll(".ed-lang-chip").forEach(e=>{e.addEventListener("click",async()=>{e.dataset.lang!==s.currentLang&&(s.currentLang=e.dataset.lang,j(),await F(),q())})}),K(),J(),_(),P()}function U(){if(!s.menu)return[];const t=Object.keys(s.menu);return[...T.filter(n=>t.includes(n)),...t.filter(n=>!T.includes(n))].map(n=>({label:n,data:s.menu[n]}))}function K(){const t=document.getElementById("ed-book-tabs"),e=document.getElementById("ed-book-tree");if(!t||!e)return;const n=U();if(!n.length){e.innerHTML='<p class="ed-empty">No books in this language.</p>';return}t.innerHTML=n.map((i,d)=>`<button class="ed-tab${d===0?" is-active":""}" data-tab="${d}">${l(i.label)}</button>`).join("");const o=0,a=n.map((i,d)=>`<div class="ed-tree-panel${d===o?" is-active":""}" data-panel="${d}">${X(i.data)}</div>`).join("");e.innerHTML=a,t.querySelectorAll(".ed-tab").forEach(i=>{i.addEventListener("click",()=>{t.querySelectorAll(".ed-tab").forEach(d=>d.classList.toggle("is-active",d===i)),e.querySelectorAll(".ed-tree-panel").forEach(d=>d.classList.toggle("is-active",parseInt(d.dataset.panel)===parseInt(i.dataset.tab)))})}),e.querySelectorAll(".ed-nikaya-title").forEach(i=>{i.addEventListener("click",()=>{var d;i.classList.toggle("open"),(d=i.nextElementSibling)==null||d.classList.toggle("open")})}),e.querySelectorAll(".ed-book").forEach(i=>{i.addEventListener("click",async()=>{var p;const d=i.dataset.bookId;s.currentBook={id:d,name:i.dataset.bookName};const r=await v(`/editor/api/${s.currentLang}/book/${d}/toc`);s.toc=r.toc,s.currentSection=null,s.sentences=[],s.remarks=[],s.glossary=[],q(),(p=document.querySelector(".ed-ws-sections"))==null||p.scrollIntoView({behavior:"smooth",block:"start"})})})}function X(t){return!t||typeof t!="object"?"":Object.keys(t).sort((n,o)=>{const a=i=>{const d=V.findIndex(r=>i.includes(r));return d===-1?99:d};return a(n)-a(o)}).map(n=>`
    <div class="ed-category">
      <div class="ed-category-title">${l(n)}</div>
      ${Y(t[n])}
    </div>`).join("")}function Y(t){if(!t||typeof t!="object")return"";const e=[];return t[""]&&e.push(`<ol class="ed-book-list open">${I(t[""])}</ol>`),Object.entries(t).forEach(([n,o])=>{n!==""&&e.push(`
      <div class="ed-nikaya">
        <div class="ed-nikaya-title">${l(n)} <span class="ed-chev">▶</span></div>
        <ol class="ed-book-list">${I(o)}</ol>
      </div>`)}),e.join("")}function I(t){return Array.isArray(t)?t.map(([e,n])=>`<li><button class="ed-book" data-book-id="${l(e)}" data-book-name="${l(n)}">${l(n)}</button></li>`).join(""):""}function J(){const t=document.getElementById("ed-toc");if(t){if(!s.toc.length){t.innerHTML='<p class="ed-empty">Pick a book to see its sections.</p>';return}t.innerHTML=s.toc.map(e=>{const n=(e.level||1)===1,o=e.has_content||n;return`
      <button class="ed-toc-item${s.currentSection===e.para_id?" is-active":""}" data-para="${e.para_id}"
              style="padding-left:${Math.min((e.level||1)-1,4)*14+8}px"
              ${o?"":"disabled"}>
        ${l(e.title)}${o?"":' <span class="ed-toc-no">·</span>'}
      </button>`}).join(""),t.querySelectorAll(".ed-toc-item:not([disabled])").forEach(e=>{e.addEventListener("click",async()=>{s.currentSection=parseInt(e.dataset.para);const n=await v(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/section/${s.currentSection}`);s.sentences=n.sentences,s.remarks=n.remarks,s.glossary=n.glossary||[],_(),P()})})}}function P(){const t=document.getElementById("ed-glossary"),e=document.getElementById("ed-gloss-count");if(!t)return;const n=s.glossary||[];if(e&&(e.textContent=n.length?`${n.length} term${n.length===1?"":"s"}`:""),!n.length){t.innerHTML='<p class="ed-empty">No glossary terms for this section.</p>';return}t.innerHTML=n.map(a=>`
    <button class="ed-gloss-term" data-word="${l(a.pali)}" title="${l(a.translation||"")}">
      <span class="ed-gloss-term-pali">${l(a.pali)}</span>
      <span class="ed-gloss-term-trans">${l(a.translation||"")}</span>
    </button>
    ${a.note?`<p class="ed-gloss-note">${l(a.note)}</p>`:""}
  `).join(""),t.querySelectorAll(".ed-gloss-term").forEach(a=>{a.addEventListener("click",()=>S(a.dataset.word,a))});const o=E(s.currentLang);t.querySelectorAll(".ed-gloss-term-pali").forEach(a=>x(a,o))}function z(t=""){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}let H=!0;try{new RegExp("(?<=a)b")}catch{H=!1}function Q(){const t=(s.glossary||[]).filter(e=>e.pali&&e.pali.length<=40).sort((e,n)=>n.pali.length-e.pali.length);!H||!t.length||document.querySelectorAll(".ed-line-pali").forEach(e=>{const n=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),o=[];for(;n.nextNode();)o.push(n.currentNode);o.forEach(a=>{const i=a.nodeValue||"";if(!i)return;const d=[];for(const u of t){const c=new RegExp(`(?<![\\p{L}\\p{N}])(${z(u.pali)})(?![\\p{L}\\p{N}])`,"giu");let h;for(;(h=c.exec(i))!==null;)d.push({start:h.index,end:h.index+h[1].length,term:u})}if(!d.length)return;d.sort((u,c)=>u.start-c.start||c.end-c.start-(u.end-u.start));const r=[];let p=-1;for(const u of d)u.start>=p&&(r.push(u),p=u.end);const m=a.parentNode,g=document.createDocumentFragment();let f=0;for(const u of r){u.start>f&&g.appendChild(document.createTextNode(i.slice(f,u.start)));const c=document.createElement("span");c.className="ed-gloss-hit",c.dataset.word=u.term.pali,c.title=u.term.translation||"Glossary term",c.textContent=i.slice(u.start,u.end),g.appendChild(c),f=u.end}f<i.length&&g.appendChild(document.createTextNode(i.slice(f))),m.replaceChild(g,a)})})}function Z(t,e){return(s.remarks||[]).filter(n=>n.para_id===t&&n.line_id===e)}function _(){const t=document.getElementById("ed-lines");if(!t)return;if(!s.sentences.length){t.innerHTML='<p class="ed-empty">Pick a section to edit its lines.</p>';return}const e=s.sentences.filter(a=>(a.checks||[]).length).length,n=document.getElementById("ed-check-summary");n&&(n.textContent=e?`⚠ ${e} line${e===1?"":"s"} flagged by length check — hover the chip for details`:""),t.innerHTML=s.sentences.map((a,i)=>{const d=Z(a.para_id,a.line_id),r=d.filter(c=>c.kind==="ai"),p=d.filter(c=>c.kind==="human"),m=r.map(c=>`
      <div class="ed-remark ed-remark-ai" title="AI finding">
        <div class="ed-remark-head">⚡ AI finding${c.status==="applied"?' <em class="ed-st-applied">· applied</em>':""}</div>
        ${c.translation&&c.translation!==a.translation?`<p class="ed-remark-fix"><span class="ed-remark-label">Suggestion</span><ins>${y(c.translation)}</ins></p>`:""}
        ${c.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${l(c.conflict)}</p>`:""}
        ${c.note?`<p class="ed-remark-note">${l(c.note)}</p>`:""}
      </div>`).join(""),g=p.map(c=>{const h=c.proposed||c.translation||"";return`
      <div class="ed-remark ed-remark-human">
        <div class="ed-remark-head">
          🖊 ${l(c.editor_name||"Human")} · <em class="ed-st-${c.status}">${c.status}</em>
          ${c.created_at?` <span class="ed-remark-date">${l(c.created_at)}</span>`:""}
        </div>
        ${c.note?`<p class="ed-remark-note">${l(c.note)}</p>`:""}
        ${h&&h!==a.translation?`<p class="ed-remark-fix"><del>${y(a.translation)}</del> → <ins>${y(h)}</ins></p>`:""}
      </div>`}).join(""),f=p.some(c=>c.status==="pending"),u=(a.checks||[]).map(c=>`<span class="ed-chip ed-chip-check ed-chip-${c.code}" title="${l(c.msg)}">⚠ ${l(c.label)}</span>`).join("");return`
      <div class="ed-line" data-para="${a.para_id}" data-line="${a.line_id}" id="edl-${a.para_id}-${a.line_id}">
        <div class="ed-line-meta">
          <span class="ed-line-num">¶${a.para_id}.${a.line_id}</span>
          ${f?'<span class="ed-chip ed-chip-pending">proposed</span>':""}
          ${u}
        </div>
        <div class="ed-line-pali" data-role="pali" title="Double-click a Pāli word for the dictionary">${y(a.pali)}</div>
        <div class="ed-line-trans" data-role="trans">${y(a.translation)}</div>
        ${m}
        ${g}
        <div class="ed-edit-box" hidden>
          <textarea class="ed-textarea" rows="3" placeholder="Proposed translation…">${l(a.translation)}</textarea>
          <input type="text" class="ed-note" placeholder="Optional note for the reviewer" maxlength="1000">
          <div class="ed-edit-actions">
            <button class="ed-btn ed-btn-primary ed-save">Save proposal</button>
            <button class="ed-btn ed-btn-ghost ed-cancel">Cancel</button>
            <span class="ed-save-msg"></span>
          </div>
        </div>
      </div>`}).join(""),t.querySelectorAll(".ed-line-trans").forEach(a=>{a.addEventListener("click",()=>{const i=a.closest(".ed-line"),d=i.querySelector(".ed-edit-box");a.hidden=!0,d.hidden=!1;const r=i.querySelector(".ed-textarea");r.focus(),r.setSelectionRange(r.value.length,r.value.length)})}),Q(),t.querySelectorAll(".ed-gloss-hit").forEach(a=>{a.addEventListener("click",i=>{i.stopPropagation(),S(a.dataset.word,a)})}),t.querySelectorAll(".ed-line-pali").forEach(a=>{a.addEventListener("dblclick",i=>{let d="";const r=window.getSelection();r&&r.rangeCount&&!r.isCollapsed&&(d=r.toString().trim()),(!d||/\s/.test(d)||d.length>40)&&(d=te(a,i.clientX,i.clientY)),d&&S(d,i.target)})});const o=E(s.currentLang);t.querySelectorAll(".ed-line-pali").forEach(a=>x(a,o)),t.querySelectorAll(".ed-edit-box").forEach(a=>{const i=a.closest(".ed-line"),d=parseInt(i.dataset.para),r=parseInt(i.dataset.line);a.querySelector(".ed-cancel").addEventListener("click",()=>{a.hidden=!0,i.querySelector(".ed-line-trans").hidden=!1}),a.querySelector(".ed-save").addEventListener("click",async()=>{const p=a.querySelector(".ed-textarea").value.trim(),m=a.querySelector(".ed-note").value.trim(),g=a.querySelector(".ed-save-msg");if(!p){g.textContent="Translation cannot be empty.";return}g.textContent="Saving…";const f=a.querySelector(".ed-save");f.disabled=!0;try{await v(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/line`,{method:"POST",body:{para_id:d,line_id:r,proposed:p,note:m}}),g.textContent="✓ Saved as proposal",a.hidden=!0;const u=await v(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/section/${s.currentSection}`);s.sentences=u.sentences,s.remarks=u.remarks,_()}catch(u){g.textContent=u.message,f.disabled=!1}})})}async function b(){const t=s.reviewFilter,e=new URLSearchParams;t.lang&&e.set("lang",t.lang),t.kind&&e.set("kind",t.kind),t.status&&e.set("status",t.status),t.book_id&&e.set("book_id",t.book_id),e.set("offset",t.offset);const n=await v(`/editor/api/review?${e}`);s.reviewItems=n.items,s.reviewTotals=n.totals,s.selectedReview=new Map,s.pendingCount=t.status==="pending"?Object.values(n.totals).reduce((o,a)=>o+a,0):s.pendingCount||0}function ee(){var a;const t=document.getElementById("ed-review-view"),e=!!((a=s.me)!=null&&a.is_super);e||(s.reviewFilter.kind="ai");const n=e?`<select id="rf-kind">
        <option value="">All kinds</option>
        <option value="human" ${s.reviewFilter.kind==="human"?"selected":""}>Human proposals</option>
        <option value="ai" ${s.reviewFilter.kind==="ai"?"selected":""}>AI findings</option>
      </select>`:'<span class="ed-filter-note">AI findings</span>',o=e?"Approve AI findings and human proposals. Applied changes write directly into the translation database.":"You review the AI findings; the admin reviews human proposals. Applied changes write directly into the translation database.";t.innerHTML=`
    <div class="ed-review">
      <div class="ed-review-head">
        <h2>🛂 Review queue</h2>
        <p class="ed-ws-hint">${l(o)}</p>
      </div>
      <div class="ed-filters">
        <select id="rf-lang">
          <option value="">All languages</option>
          ${s.langs.map(i=>`<option value="${i.code}" ${s.reviewFilter.lang===i.code?"selected":""}>${l(i.english_name)}</option>`).join("")}
        </select>
        ${n}
        <select id="rf-status">
          <option value="pending">Pending</option>
          <option value="applied" ${s.reviewFilter.status==="applied"?"selected":""}>Applied</option>
          <option value="rejected" ${s.reviewFilter.status==="rejected"?"selected":""}>Rejected</option>
        </select>
        <input type="text" id="rf-book" placeholder="Book id (e.g. Dhp-a)" value="${l(s.reviewFilter.book_id)}">
        <button class="ed-btn" id="rf-apply">Filter</button>
      </div>
      <div class="ed-review-actions">
        <button class="ed-btn ed-btn-primary" id="rv-apply-selected">✓ Apply selected</button>
        <button class="ed-btn ed-btn-danger" id="rv-reject-selected">✕ Reject selected</button>
        <button class="ed-btn" id="rv-apply-all">Apply all pending in filter</button>
        <span id="rv-msg" class="ed-save-msg"></span>
      </div>
      <div class="ed-review-list" id="ed-review-list"></div>
      <div class="ed-pager">
        <button class="ed-btn ed-btn-ghost" id="rv-prev" ${s.reviewFilter.offset===0?"disabled":""}>← Prev</button>
        <span class="ed-pager-info">offset ${s.reviewFilter.offset}</span>
        <button class="ed-btn ed-btn-ghost" id="rv-next" ${s.reviewItems.length<100?"disabled":""}>Next →</button>
      </div>
    </div>`,t.querySelectorAll("#rf-lang, #rf-kind, #rf-status").forEach(i=>{i.addEventListener("change",()=>{s.reviewFilter.lang=document.getElementById("rf-lang").value;const d=document.getElementById("rf-kind");d&&(s.reviewFilter.kind=d.value),s.reviewFilter.status=document.getElementById("rf-status").value,s.reviewFilter.offset=0})}),t.querySelector("#rf-apply").addEventListener("click",async()=>{s.reviewFilter.book_id=document.getElementById("rf-book").value.trim(),s.reviewFilter.offset=0;try{await b(),w()}catch(i){k(i.message)}}),t.querySelector("#rv-prev").addEventListener("click",async()=>{s.reviewFilter.offset=Math.max(0,s.reviewFilter.offset-100),await b(),w()}),t.querySelector("#rv-next").addEventListener("click",async()=>{s.reviewFilter.offset+=100,await b(),w()}),t.querySelector("#rv-apply-selected").addEventListener("click",async()=>{const i=[...s.selectedReview.values()];if(!i.length)return k("Select remarks first.");const d=await v("/editor/api/review/apply",{method:"POST",body:{items:i}});await b(),w();const r=d.results.filter(m=>m.ok).length,p=d.results.filter(m=>!m.ok).map(m=>m.message).join("; ");k(`Applied ${r}/${i.length}.${p?" "+p:""}`)}),t.querySelector("#rv-reject-selected").addEventListener("click",async()=>{const i=[...s.selectedReview.values()];if(!i.length)return k("Select remarks first.");await v("/editor/api/review/reject",{method:"POST",body:{items:i}}),await b(),w(),k(`Rejected ${i.length}.`)}),t.querySelector("#rv-apply-all").addEventListener("click",async()=>{if(!confirm("Apply ALL pending remarks matching the current filter? This directly changes the translation database."))return;const i=await v("/editor/api/review/apply_all",{method:"POST",body:{lang:s.reviewFilter.lang,kind:s.reviewFilter.kind,status:"pending",book_id:s.reviewFilter.book_id}}),d=i.summary.reduce((p,m)=>p+m.applied,0),r=i.summary.reduce((p,m)=>p+m.failed,0);await b(),w(),k(`Applied ${d}, failed ${r}.`)}),b().then(()=>w()).catch(i=>k(i.message))}function w(){const t=document.getElementById("ed-review-list");if(t){if(!s.reviewItems.length){t.innerHTML='<p class="ed-empty">Nothing here. Adjust the filters.</p>';return}t.innerHTML=s.reviewItems.map(e=>{const n=`${e.lang}:${e.id}`,o=s.selectedReview.has(n)?"checked":"",a=e.kind==="human",i=a&&e.proposed||e.translation||"",d=e.applicable&&i?`<p class="ed-remark-fix"><del>${y(e.live)}</del> → <ins>${y(i)}</ins></p>`:"",r=!e.applicable&&(i||e.apply_msg)?`<p class="ed-remark-note"><span class="ed-remark-label">Not auto-appliable</span>${l(e.apply_msg||"See reasons below")}</p>`:"";return`
      <div class="ed-rv-item" data-key="${l(n)}">
        <label class="ed-rv-check">
          <input type="checkbox" class="rv-cb" data-lang="${l(e.lang)}" data-id="${e.id}" ${o}>
        </label>
        <div class="ed-rv-body">
          <div class="ed-rv-meta">
            <span class="ed-chip ed-chip-${e.kind}">${a?"human":"AI"}</span>
            <span class="ed-rv-book">${l(e.book_id)}</span>
            <span class="ed-rv-pos">¶${e.para_id}.${e.line_id}</span>
            <span class="ed-rv-lang">${l(e.lang)}</span>
            ${e.editor_name?`<span class="ed-rv-editor">by ${l(e.editor_name)}</span>`:""}
            <em class="ed-st-${e.status}">${e.status}</em>
          </div>
          <div class="ed-rv-pali">${y(e.pali)}</div>
          ${d}
          ${r}
          ${e.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${l(e.conflict)}</p>`:""}
          ${e.note?`<p class="ed-remark-note">${l(e.note)}</p>`:""}
        </div>
      </div>`}).join(""),t.querySelectorAll(".rv-cb").forEach(e=>{e.addEventListener("change",()=>{const n=e.dataset.lang,o=parseInt(e.dataset.id),a=`${n}:${o}`;e.checked?s.selectedReview.set(a,{lang:n,id:o}):s.selectedReview.delete(a)})}),t.querySelectorAll(".ed-rv-item").forEach(e=>{var o;const n=((o=e.querySelector(".rv-cb"))==null?void 0:o.dataset.lang)||s.currentLang;e.querySelectorAll(".ed-rv-pali").forEach(a=>x(a,E(n)))})}}function k(t){const e=document.getElementById("rv-msg");e&&(e.textContent=t)}function te(t,e,n){const o=document.caretRangeFromPoint?document.caretRangeFromPoint(e,n):null;if(!o||!o.startContainer||!t.contains(o.startContainer))return"";const a=o.startContainer.nodeValue||"";let i=o.startOffset,d=i,r=i;for(;d>0&&/[\p{L}\p{N}]/u.test(a[d-1]);)d--;for(;r<a.length&&/[\p{L}\p{N}]/u.test(a[r]);)r++;return a.slice(d,r)}function $(){document.querySelectorAll(".ed-lookup-pop").forEach(t=>t.remove())}document.addEventListener("click",t=>{t.target.closest(".ed-lookup-pop")||$()});document.addEventListener("keydown",t=>{t.key==="Escape"&&$()});async function S(t,e){if($(),!t)return;try{const d=C.convertFromMixed(t);t=C.convert(d,N.RO).trim()||t}catch{}const n=document.createElement("div");n.className="ed-lookup-pop",n.innerHTML=`
    <div class="ed-lookup-head">
      <span class="ed-lookup-title">📖 ${l(t)}</span>
      <button class="ed-lookup-close" aria-label="Close">✕</button>
    </div>
    <div class="ed-lookup-body ed-empty">Looking up…</div>`,document.body.appendChild(n);const o=e&&e.getBoundingClientRect?e.getBoundingClientRect():null,a=o?o.left:120,i=o?o.bottom+8:120;n.style.left=`${Math.max(8,Math.min(a,window.innerWidth-360))}px`,n.style.top=`${Math.max(8,Math.min(i,window.innerHeight-200))}px`,n.querySelector(".ed-lookup-close").addEventListener("click",$);try{const d=await v(`/editor/api/lookup?word=${encodeURIComponent(t)}`),r=n.querySelector(".ed-lookup-body");if(!d.results||!d.results.length){r.textContent="No dictionary entry found for this word.";return}r.innerHTML=d.results.map(p=>`
      <div class="ed-lookup-entry">
        <div class="ed-lookup-word">${l(p.word)}${p.book_name?` <span class="ed-lookup-src">${l(p.book_name)}</span>`:""}</div>
        ${p.type==="deconstruction"&&p.deconstruction?`<div class="ed-lookup-def">${l(p.deconstruction)}</div>`:""}
        ${p.definition?`<div class="ed-lookup-def">${l(p.definition)}</div>`:""}
      </div>`).join("")}catch(d){n.querySelector(".ed-lookup-body").textContent=d.message}}async function ne(){return(await v("/editor/api/editors")).editors}function ae(){const t=document.getElementById("ed-editors-view");t.innerHTML=`
    <div class="ed-editors">
      <div class="ed-review-head">
        <h2>👥 Editor accounts</h2>
        <p class="ed-ws-hint">Only the super admin can create or modify translator accounts. No public registration.</p>
      </div>

      <div class="ed-editors-grid">
        <div class="ed-create-card">
          <h3>Create editor</h3>
          <form id="ed-new-form" class="ed-form" novalidate>
            <label class="ed-field"><span>Display name</span><input type="text" id="ne-name" maxlength="120"></label>
            <label class="ed-field"><span>Email</span><input type="email" id="ne-email" required></label>
            <label class="ed-field"><span>Password (min 8 chars)</span><input type="password" id="ne-pass" required minlength="8"></label>
            <div class="ed-field">
              <span>Can edit languages</span>
              <div class="ed-lang-checkbox-row" id="ne-langs">
                ${s.langs.map(e=>`<label class="ed-lang-check"><input type="checkbox" value="${e.code}"> ${l(e.english_name)}</label>`).join("")}
              </div>
            </div>
            <label class="ed-check"><input type="checkbox" id="ne-super"> Super admin</label>
            <p id="ne-msg" class="ed-error" hidden></p>
            <button type="submit" class="ed-btn ed-btn-primary">Create account</button>
          </form>
        </div>

        <div class="ed-list-card">
          <h3>Translators</h3>
          <div id="ed-editor-list"></div>
        </div>
      </div>
    </div>`,document.getElementById("ed-new-form").addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("ne-msg");n.hidden=!0;const o=[...document.querySelectorAll("#ne-langs input:checked")].map(a=>a.value);try{await v("/editor/api/editors",{method:"POST",body:{display_name:document.getElementById("ne-name").value,email:document.getElementById("ne-email").value,password:document.getElementById("ne-pass").value,langs:o,is_super:document.getElementById("ne-super").checked}}),await L(),document.getElementById("ed-new-form").reset()}catch(a){n.textContent=a.message,n.hidden=!1}}),L()}async function L(){const t=document.getElementById("ed-editor-list");if(!t)return;const e=await ne();t.innerHTML=e.map(n=>`
    <div class="ed-editor-card" data-eid="${n.id}">
      <div class="ed-editor-top">
        <div>
          <strong>${l(n.display_name||n.email)}</strong>
          ${n.is_super?'<span class="ed-super-tag">admin</span>':""}
        </div>
        <div class="ed-editor-actions">
          <button class="ed-btn ed-btn-ghost ed-ed-save" data-eid="${n.id}">Save</button>
          <button class="ed-btn ed-btn-danger ed-ed-del" data-eid="${n.id}">Delete</button>
        </div>
      </div>
      <div class="ed-editor-fields">
        <label class="ed-field"><span>Display name</span>
          <input type="text" class="ed-f-name" value="${l(n.display_name)}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" class="ed-f-email" value="${l(n.email)}"></label>
        <label class="ed-field"><span>New password (leave blank to keep)</span>
          <input type="password" class="ed-f-pass" placeholder="••••••••"></label>
        <div class="ed-field"><span>Languages</span>
          <div class="ed-lang-checkbox-row">
            ${s.langs.map(o=>`<label class="ed-lang-check"><input type="checkbox" class="ed-f-lang" value="${o.code}" ${n.langs.includes(o.code)?"checked":""}> ${l(o.english_name)}</label>`).join("")}
          </div>
        </div>
        <label class="ed-check"><input type="checkbox" class="ed-f-super" ${n.is_super?"checked":""}> Super admin</label>
      </div>
      <p class="ed-error ed-ed-msg" hidden></p>
    </div>`).join(""),t.querySelectorAll(".ed-ed-save").forEach(n=>{n.addEventListener("click",async()=>{const o=n.closest(".ed-editor-card"),a=parseInt(n.dataset.eid),i=o.querySelector(".ed-ed-msg");i.hidden=!0;try{const d={display_name:o.querySelector(".ed-f-name").value,is_super:o.querySelector(".ed-f-super").checked,langs:[...o.querySelectorAll(".ed-f-lang:checked")].map(p=>p.value)},r=o.querySelector(".ed-f-pass").value;r&&(d.password=r),await v(`/editor/api/editors/${a}`,{method:"PATCH",body:d}),i.textContent="✓ Saved",i.classList.add("ed-ok"),i.hidden=!1,setTimeout(()=>{i.hidden=!0},2e3)}catch(d){i.textContent=d.message,i.hidden=!1}})}),t.querySelectorAll(".ed-ed-del").forEach(n=>{n.addEventListener("click",async()=>{const o=parseInt(n.dataset.eid);if(confirm("Delete this editor account? This cannot be undone."))try{await v(`/editor/api/editors/${o}`,{method:"DELETE"}),await L()}catch(a){alert(a.message)}})})}(async function(){try{const e=await v("/editor/api/me");s.me=e,await R()}catch{M()}})();

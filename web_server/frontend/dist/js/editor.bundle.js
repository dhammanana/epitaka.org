const{baseUrl:R}=window.EDITOR_CONFIG;async function m(t,{method:e="GET",body:n}={}){const a=await fetch(R+t,{method:e,headers:n?{"Content-Type":"application/json"}:void 0,body:n?JSON.stringify(n):void 0}),o=await a.json().catch(()=>({}));if(!a.ok)throw new Error(o.error||`HTTP ${a.status}`);return o}const s={me:null,langs:[],currentLang:null,menu:null,currentBook:null,toc:[],currentSection:null,sentences:[],remarks:[],glossary:[],reviewFilter:{lang:"",kind:"",status:"pending",book_id:"",offset:0},reviewItems:[],reviewTotals:{},selectedReview:new Map},I=document.getElementById("editor-root");function r(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const F=/&lt;(\/?)(b|i)&gt;/gi;function h(t=""){return r(t).replace(F,(e,n,a)=>`<${n}${a.toLowerCase()}>`)}function T(){I.innerHTML=`
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
    </div>`,document.getElementById("ed-login-form").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("ed-login-btn"),n=document.getElementById("ed-login-error");e.disabled=!0,e.textContent="Signing in…",n.hidden=!0;try{const a=await m("/editor/api/login",{method:"POST",body:{email:document.getElementById("ed-login-email").value,password:document.getElementById("ed-login-password").value}});s.me=a,await A()}catch(a){n.textContent=a.message,n.hidden=!1,e.disabled=!1,e.textContent="Sign in"}})}function H(){if(document.querySelector(".ed-modal-overlay"))return;const t=s.me,e=document.createElement("div");e.className="ed-modal-overlay",e.innerHTML=`
    <div class="ed-modal" role="dialog" aria-modal="true" aria-label="My account">
      <div class="ed-modal-head">
        <h3>👤 My account</h3>
        <button class="ed-modal-close" aria-label="Close">✕</button>
      </div>
      <div class="ed-form">
        <label class="ed-field"><span>Display name</span>
          <input type="text" id="acc-name" maxlength="120" value="${r(t.display_name||"")}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" id="acc-email" value="${r(t.email)}" disabled></label>
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
    </div>`,document.body.appendChild(e);const n=o=>{o.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",n),e.remove()};e.querySelector(".ed-modal-close").addEventListener("click",a),e.addEventListener("click",o=>{o.target===e&&a()}),document.addEventListener("keydown",n),e.querySelector("#acc-save").addEventListener("click",async()=>{const o=e.querySelector("#acc-msg"),i=e.querySelector("#acc-msg-ok"),d=e.querySelector("#acc-save");o.hidden=!0,i.textContent="";const c=e.querySelector("#acc-name").value.trim(),p=e.querySelector("#acc-cur").value,u=e.querySelector("#acc-new").value,f=e.querySelector("#acc-confirm").value;if(!c){o.textContent="Display name cannot be empty.",o.hidden=!1;return}const v=p||u||f;if(v){if(!p||!u||!f){o.textContent="Fill in all three password fields to change your password.",o.hidden=!1;return}if(u.length<8){o.textContent="New password must be at least 8 characters.",o.hidden=!1;return}if(u!==f){o.textContent="New password and confirmation do not match.",o.hidden=!1;return}}d.disabled=!0;try{await m("/editor/api/account",{method:"PATCH",body:{display_name:c}}),v&&await m("/editor/api/account/password",{method:"POST",body:{current_password:p,new_password:u}}),s.me.display_name=c;const l=document.querySelector(".ed-user-name");l&&(l.textContent=c),i.textContent="✓ Saved",e.querySelector("#acc-cur").value="",e.querySelector("#acc-new").value="",e.querySelector("#acc-confirm").value="",setTimeout(a,900)}catch(l){o.textContent=l.message,o.hidden=!1,d.disabled=!1}})}function P(){const t=s.me,e=`<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>
    <button class="ed-nav-btn" data-view="review">🛂 Review${s.pendingCount?` <span class="ed-badge">${s.pendingCount}</span>`:""}</button>
    ${t.is_super?'<button class="ed-nav-btn" data-view="editors">👥 Editors</button>':""}`;I.innerHTML=`
    <header class="ed-topbar">
      <div class="ed-brand">📖 E-Piṭaka <span class="ed-brand-sub">Translation Editor</span></div>
      <nav class="ed-nav">${e}</nav>
      <div class="ed-user">
        <span class="ed-user-name">${r(t.display_name||t.email)}</span>
        ${t.is_super?'<span class="ed-super-tag">admin</span>':""}
        <button class="ed-btn ed-btn-ghost" id="ed-account">👤 Account</button>
        <button class="ed-btn ed-btn-ghost" id="ed-logout">Sign out</button>
      </div>
    </header>
    <div class="ed-body">
      <div id="ed-workspace-view" class="ed-view" hidden></div>
      <div id="ed-review-view"   class="ed-view" hidden></div>
      <div id="ed-editors-view"  class="ed-view" hidden></div>
    </div>`,document.querySelectorAll(".ed-nav-btn").forEach(n=>{n.addEventListener("click",()=>_(n.dataset.view))}),document.getElementById("ed-account").addEventListener("click",H),document.getElementById("ed-logout").addEventListener("click",async()=>{try{await m("/editor/api/logout",{method:"POST"})}catch{}s.me=null,T()}),_("workspace")}function _(t){document.querySelectorAll(".ed-nav-btn").forEach(n=>n.classList.toggle("is-active",n.dataset.view===t)),document.querySelectorAll(".ed-view").forEach(n=>n.hidden=!0);const e=document.getElementById(`ed-${t}-view`);e.hidden=!1,t==="workspace"?L():t==="review"?Y():t==="editors"&&Q()}async function A(){var e;const t=await m("/editor/api/languages");s.langs=t.languages,s.currentLang=((e=s.langs[0])==null?void 0:e.code)||null,s.currentLang&&await B(),P()}async function B(){if(!s.currentLang)return;const t=await m(`/editor/api/${s.currentLang}/books`);s.menu=t.menu,s.currentBook=null,s.toc=[],s.currentSection=null,s.sentences=[],s.remarks=[],s.glossary=[]}const q=["Mūla","Aṭṭhakathā","Ṭīkā"],N=["Vinaya","Suttanta","Sutta","Abhidhamma"];function L(){const t=document.getElementById("ed-workspace-view");t.innerHTML=`
    <div class="ed-ws">
      <aside class="ed-ws-side">
        <div class="ed-ws-block">
          <div class="ed-ws-label">Language</div>
          <div class="ed-lang-row">
            ${s.langs.map(e=>`<button class="ed-lang-chip${e.code===s.currentLang?" is-active":""}" data-lang="${e.code}" title="${r(e.english_name)}">${r(e.native_name)}</button>`).join("")}
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
          <h2 class="ed-ws-bookname">${s.currentBook?r(s.currentBook.name):"Choose a book"}</h2>
          <span class="ed-ws-hint">Click a translation line to propose an edit · double-click a Pāli word for the dictionary</span>
          <span id="ed-check-summary" class="ed-check-summary"></span>
        </div>
        <div id="ed-lines" class="ed-lines"></div>
      </main>
    </div>`,document.querySelectorAll(".ed-lang-chip").forEach(e=>{e.addEventListener("click",async()=>{e.dataset.lang!==s.currentLang&&(s.currentLang=e.dataset.lang,await B(),L())})}),D(),V(),x(),j()}function O(){if(!s.menu)return[];const t=Object.keys(s.menu);return[...q.filter(n=>t.includes(n)),...t.filter(n=>!q.includes(n))].map(n=>({label:n,data:s.menu[n]}))}function D(){const t=document.getElementById("ed-book-tabs"),e=document.getElementById("ed-book-tree");if(!t||!e)return;const n=O();if(!n.length){e.innerHTML='<p class="ed-empty">No books in this language.</p>';return}t.innerHTML=n.map((i,d)=>`<button class="ed-tab${d===0?" is-active":""}" data-tab="${d}">${r(i.label)}</button>`).join("");const a=0,o=n.map((i,d)=>`<div class="ed-tree-panel${d===a?" is-active":""}" data-panel="${d}">${G(i.data)}</div>`).join("");e.innerHTML=o,t.querySelectorAll(".ed-tab").forEach(i=>{i.addEventListener("click",()=>{t.querySelectorAll(".ed-tab").forEach(d=>d.classList.toggle("is-active",d===i)),e.querySelectorAll(".ed-tree-panel").forEach(d=>d.classList.toggle("is-active",parseInt(d.dataset.panel)===parseInt(i.dataset.tab)))})}),e.querySelectorAll(".ed-nikaya-title").forEach(i=>{i.addEventListener("click",()=>{var d;i.classList.toggle("open"),(d=i.nextElementSibling)==null||d.classList.toggle("open")})}),e.querySelectorAll(".ed-book").forEach(i=>{i.addEventListener("click",async()=>{var p;const d=i.dataset.bookId;s.currentBook={id:d,name:i.dataset.bookName};const c=await m(`/editor/api/${s.currentLang}/book/${d}/toc`);s.toc=c.toc,s.currentSection=null,s.sentences=[],s.remarks=[],s.glossary=[],L(),(p=document.querySelector(".ed-ws-sections"))==null||p.scrollIntoView({behavior:"smooth",block:"start"})})})}function G(t){return!t||typeof t!="object"?"":Object.keys(t).sort((n,a)=>{const o=i=>{const d=N.findIndex(c=>i.includes(c));return d===-1?99:d};return o(n)-o(a)}).map(n=>`
    <div class="ed-category">
      <div class="ed-category-title">${r(n)}</div>
      ${W(t[n])}
    </div>`).join("")}function W(t){if(!t||typeof t!="object")return"";const e=[];return t[""]&&e.push(`<ol class="ed-book-list open">${C(t[""])}</ol>`),Object.entries(t).forEach(([n,a])=>{n!==""&&e.push(`
      <div class="ed-nikaya">
        <div class="ed-nikaya-title">${r(n)} <span class="ed-chev">▶</span></div>
        <ol class="ed-book-list">${C(a)}</ol>
      </div>`)}),e.join("")}function C(t){return Array.isArray(t)?t.map(([e,n])=>`<li><button class="ed-book" data-book-id="${r(e)}" data-book-name="${r(n)}">${r(n)}</button></li>`).join(""):""}function V(){const t=document.getElementById("ed-toc");if(t){if(!s.toc.length){t.innerHTML='<p class="ed-empty">Pick a book to see its sections.</p>';return}t.innerHTML=s.toc.map(e=>{const n=e.has_content;return`
      <button class="ed-toc-item${s.currentSection===e.para_id?" is-active":""}" data-para="${e.para_id}"
              style="padding-left:${Math.min((e.level||1)-1,4)*14+8}px"
              ${n?"":"disabled"}>
        ${r(e.title)}${n?"":' <span class="ed-toc-no">·</span>'}
      </button>`}).join(""),t.querySelectorAll(".ed-toc-item:not([disabled])").forEach(e=>{e.addEventListener("click",async()=>{s.currentSection=parseInt(e.dataset.para);const n=await m(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/section/${s.currentSection}`);s.sentences=n.sentences,s.remarks=n.remarks,s.glossary=n.glossary||[],x(),j()})})}}function j(){const t=document.getElementById("ed-glossary"),e=document.getElementById("ed-gloss-count");if(!t)return;const n=s.glossary||[];if(e&&(e.textContent=n.length?`${n.length} term${n.length===1?"":"s"}`:""),!n.length){t.innerHTML='<p class="ed-empty">No glossary terms for this section.</p>';return}t.innerHTML=n.map(a=>`
    <button class="ed-gloss-term" data-word="${r(a.pali)}" title="${r(a.translation||"")}">
      <span class="ed-gloss-term-pali">${r(a.pali)}</span>
      <span class="ed-gloss-term-trans">${r(a.translation||"")}</span>
    </button>
    ${a.note?`<p class="ed-gloss-note">${r(a.note)}</p>`:""}
  `).join(""),t.querySelectorAll(".ed-gloss-term").forEach(a=>{a.addEventListener("click",()=>E(a.dataset.word,a))})}function U(t=""){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}let M=!0;try{new RegExp("(?<=a)b")}catch{M=!1}function K(){const t=(s.glossary||[]).filter(e=>e.pali&&e.pali.length<=40).sort((e,n)=>n.pali.length-e.pali.length);!M||!t.length||document.querySelectorAll(".ed-line-pali").forEach(e=>{const n=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),a=[];for(;n.nextNode();)a.push(n.currentNode);a.forEach(o=>{const i=o.nodeValue||"";if(!i)return;const d=[];for(const l of t){const g=new RegExp(`(?<![\\p{L}\\p{N}])(${U(l.pali)})(?![\\p{L}\\p{N}])`,"giu");let k;for(;(k=g.exec(i))!==null;)d.push({start:k.index,end:k.index+k[1].length,term:l})}if(!d.length)return;d.sort((l,g)=>l.start-g.start||g.end-g.start-(l.end-l.start));const c=[];let p=-1;for(const l of d)l.start>=p&&(c.push(l),p=l.end);const u=o.parentNode,f=document.createDocumentFragment();let v=0;for(const l of c){l.start>v&&f.appendChild(document.createTextNode(i.slice(v,l.start)));const g=document.createElement("span");g.className="ed-gloss-hit",g.dataset.word=l.term.pali,g.title=l.term.translation||"Glossary term",g.textContent=i.slice(l.start,l.end),f.appendChild(g),v=l.end}v<i.length&&f.appendChild(document.createTextNode(i.slice(v))),u.replaceChild(f,o)})})}function X(t,e){return(s.remarks||[]).filter(n=>n.para_id===t&&n.line_id===e)}function x(){const t=document.getElementById("ed-lines");if(!t)return;if(!s.sentences.length){t.innerHTML='<p class="ed-empty">Pick a section to edit its lines.</p>';return}const e=s.sentences.filter(a=>(a.checks||[]).length).length,n=document.getElementById("ed-check-summary");n&&(n.textContent=e?`⚠ ${e} line${e===1?"":"s"} flagged by length check — hover the chip for details`:""),t.innerHTML=s.sentences.map((a,o)=>{const i=X(a.para_id,a.line_id),d=i.filter(l=>l.kind==="ai"),c=i.filter(l=>l.kind==="human"),p=d.map(l=>`
      <div class="ed-remark ed-remark-ai" title="AI finding">
        <div class="ed-remark-head">⚡ AI finding${l.status==="applied"?' <em class="ed-st-applied">· applied</em>':""}</div>
        ${l.translation&&l.translation!==a.translation?`<p class="ed-remark-fix"><span class="ed-remark-label">Suggestion</span><ins>${h(l.translation)}</ins></p>`:""}
        ${l.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${r(l.conflict)}</p>`:""}
        ${l.note?`<p class="ed-remark-note">${r(l.note)}</p>`:""}
      </div>`).join(""),u=c.map(l=>{const g=l.proposed||l.translation||"";return`
      <div class="ed-remark ed-remark-human">
        <div class="ed-remark-head">
          🖊 ${r(l.editor_name||"Human")} · <em class="ed-st-${l.status}">${l.status}</em>
          ${l.created_at?` <span class="ed-remark-date">${r(l.created_at)}</span>`:""}
        </div>
        ${l.note?`<p class="ed-remark-note">${r(l.note)}</p>`:""}
        ${g&&g!==a.translation?`<p class="ed-remark-fix"><del>${h(a.translation)}</del> → <ins>${h(g)}</ins></p>`:""}
      </div>`}).join(""),f=c.some(l=>l.status==="pending"),v=(a.checks||[]).map(l=>`<span class="ed-chip ed-chip-check ed-chip-${l.code}" title="${r(l.msg)}">⚠ ${r(l.label)}</span>`).join("");return`
      <div class="ed-line" data-para="${a.para_id}" data-line="${a.line_id}" id="edl-${a.para_id}-${a.line_id}">
        <div class="ed-line-meta">
          <span class="ed-line-num">¶${a.para_id}.${a.line_id}</span>
          ${f?'<span class="ed-chip ed-chip-pending">proposed</span>':""}
          ${v}
        </div>
        <div class="ed-line-pali" data-role="pali" title="Double-click a Pāli word for the dictionary">${h(a.pali)}</div>
        <div class="ed-line-trans" data-role="trans">${h(a.translation)}</div>
        ${p}
        ${u}
        <div class="ed-edit-box" hidden>
          <textarea class="ed-textarea" rows="3" placeholder="Proposed translation…">${r(a.translation)}</textarea>
          <input type="text" class="ed-note" placeholder="Optional note for the reviewer" maxlength="1000">
          <div class="ed-edit-actions">
            <button class="ed-btn ed-btn-primary ed-save">Save proposal</button>
            <button class="ed-btn ed-btn-ghost ed-cancel">Cancel</button>
            <span class="ed-save-msg"></span>
          </div>
        </div>
      </div>`}).join(""),t.querySelectorAll(".ed-line-trans").forEach(a=>{a.addEventListener("click",()=>{const o=a.closest(".ed-line"),i=o.querySelector(".ed-edit-box");a.hidden=!0,i.hidden=!1;const d=o.querySelector(".ed-textarea");d.focus(),d.setSelectionRange(d.value.length,d.value.length)})}),K(),t.querySelectorAll(".ed-gloss-hit").forEach(a=>{a.addEventListener("click",o=>{o.stopPropagation(),E(a.dataset.word,a)})}),t.querySelectorAll(".ed-line-pali").forEach(a=>{a.addEventListener("dblclick",o=>{let i="";const d=window.getSelection();d&&d.rangeCount&&!d.isCollapsed&&(i=d.toString().trim()),(!i||/\s/.test(i)||i.length>40)&&(i=J(a,o.clientX,o.clientY)),i&&E(i,o.target)})}),t.querySelectorAll(".ed-edit-box").forEach(a=>{const o=a.closest(".ed-line"),i=parseInt(o.dataset.para),d=parseInt(o.dataset.line);a.querySelector(".ed-cancel").addEventListener("click",()=>{a.hidden=!0,o.querySelector(".ed-line-trans").hidden=!1}),a.querySelector(".ed-save").addEventListener("click",async()=>{const c=a.querySelector(".ed-textarea").value.trim(),p=a.querySelector(".ed-note").value.trim(),u=a.querySelector(".ed-save-msg");if(!c){u.textContent="Translation cannot be empty.";return}u.textContent="Saving…";const f=a.querySelector(".ed-save");f.disabled=!0;try{await m(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/line`,{method:"POST",body:{para_id:i,line_id:d,proposed:c,note:p}}),u.textContent="✓ Saved as proposal",a.hidden=!0;const v=await m(`/editor/api/${s.currentLang}/book/${s.currentBook.id}/section/${s.currentSection}`);s.sentences=v.sentences,s.remarks=v.remarks,x()}catch(v){u.textContent=v.message,f.disabled=!1}})})}async function y(){const t=s.reviewFilter,e=new URLSearchParams;t.lang&&e.set("lang",t.lang),t.kind&&e.set("kind",t.kind),t.status&&e.set("status",t.status),t.book_id&&e.set("book_id",t.book_id),e.set("offset",t.offset);const n=await m(`/editor/api/review?${e}`);s.reviewItems=n.items,s.reviewTotals=n.totals,s.selectedReview=new Map,s.pendingCount=t.status==="pending"?Object.values(n.totals).reduce((a,o)=>a+o,0):s.pendingCount||0}function Y(){var o;const t=document.getElementById("ed-review-view"),e=!!((o=s.me)!=null&&o.is_super);e||(s.reviewFilter.kind="ai");const n=e?`<select id="rf-kind">
        <option value="">All kinds</option>
        <option value="human" ${s.reviewFilter.kind==="human"?"selected":""}>Human proposals</option>
        <option value="ai" ${s.reviewFilter.kind==="ai"?"selected":""}>AI findings</option>
      </select>`:'<span class="ed-filter-note">AI findings</span>',a=e?"Approve AI findings and human proposals. Applied changes write directly into the translation database.":"You review the AI findings; the admin reviews human proposals. Applied changes write directly into the translation database.";t.innerHTML=`
    <div class="ed-review">
      <div class="ed-review-head">
        <h2>🛂 Review queue</h2>
        <p class="ed-ws-hint">${r(a)}</p>
      </div>
      <div class="ed-filters">
        <select id="rf-lang">
          <option value="">All languages</option>
          ${s.langs.map(i=>`<option value="${i.code}" ${s.reviewFilter.lang===i.code?"selected":""}>${r(i.english_name)}</option>`).join("")}
        </select>
        ${n}
        <select id="rf-status">
          <option value="pending">Pending</option>
          <option value="applied" ${s.reviewFilter.status==="applied"?"selected":""}>Applied</option>
          <option value="rejected" ${s.reviewFilter.status==="rejected"?"selected":""}>Rejected</option>
        </select>
        <input type="text" id="rf-book" placeholder="Book id (e.g. Dhp-a)" value="${r(s.reviewFilter.book_id)}">
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
    </div>`,t.querySelectorAll("#rf-lang, #rf-kind, #rf-status").forEach(i=>{i.addEventListener("change",()=>{s.reviewFilter.lang=document.getElementById("rf-lang").value;const d=document.getElementById("rf-kind");d&&(s.reviewFilter.kind=d.value),s.reviewFilter.status=document.getElementById("rf-status").value,s.reviewFilter.offset=0})}),t.querySelector("#rf-apply").addEventListener("click",async()=>{s.reviewFilter.book_id=document.getElementById("rf-book").value.trim(),s.reviewFilter.offset=0;try{await y(),b()}catch(i){w(i.message)}}),t.querySelector("#rv-prev").addEventListener("click",async()=>{s.reviewFilter.offset=Math.max(0,s.reviewFilter.offset-100),await y(),b()}),t.querySelector("#rv-next").addEventListener("click",async()=>{s.reviewFilter.offset+=100,await y(),b()}),t.querySelector("#rv-apply-selected").addEventListener("click",async()=>{const i=[...s.selectedReview.values()];if(!i.length)return w("Select remarks first.");const d=await m("/editor/api/review/apply",{method:"POST",body:{items:i}});await y(),b();const c=d.results.filter(u=>u.ok).length,p=d.results.filter(u=>!u.ok).map(u=>u.message).join("; ");w(`Applied ${c}/${i.length}.${p?" "+p:""}`)}),t.querySelector("#rv-reject-selected").addEventListener("click",async()=>{const i=[...s.selectedReview.values()];if(!i.length)return w("Select remarks first.");await m("/editor/api/review/reject",{method:"POST",body:{items:i}}),await y(),b(),w(`Rejected ${i.length}.`)}),t.querySelector("#rv-apply-all").addEventListener("click",async()=>{if(!confirm("Apply ALL pending remarks matching the current filter? This directly changes the translation database."))return;const i=await m("/editor/api/review/apply_all",{method:"POST",body:{lang:s.reviewFilter.lang,kind:s.reviewFilter.kind,status:"pending",book_id:s.reviewFilter.book_id}}),d=i.summary.reduce((p,u)=>p+u.applied,0),c=i.summary.reduce((p,u)=>p+u.failed,0);await y(),b(),w(`Applied ${d}, failed ${c}.`)}),y().then(()=>b()).catch(i=>w(i.message))}function b(){const t=document.getElementById("ed-review-list");if(t){if(!s.reviewItems.length){t.innerHTML='<p class="ed-empty">Nothing here. Adjust the filters.</p>';return}t.innerHTML=s.reviewItems.map(e=>{const n=`${e.lang}:${e.id}`,a=s.selectedReview.has(n)?"checked":"",o=e.kind==="human",i=o&&e.proposed||e.translation||"",d=e.applicable&&i?`<p class="ed-remark-fix"><del>${h(e.live)}</del> → <ins>${h(i)}</ins></p>`:"",c=!e.applicable&&(i||e.apply_msg)?`<p class="ed-remark-note"><span class="ed-remark-label">Not auto-appliable</span>${r(e.apply_msg||"See reasons below")}</p>`:"";return`
      <div class="ed-rv-item" data-key="${r(n)}">
        <label class="ed-rv-check">
          <input type="checkbox" class="rv-cb" data-lang="${r(e.lang)}" data-id="${e.id}" ${a}>
        </label>
        <div class="ed-rv-body">
          <div class="ed-rv-meta">
            <span class="ed-chip ed-chip-${e.kind}">${o?"human":"AI"}</span>
            <span class="ed-rv-book">${r(e.book_id)}</span>
            <span class="ed-rv-pos">¶${e.para_id}.${e.line_id}</span>
            <span class="ed-rv-lang">${r(e.lang)}</span>
            ${e.editor_name?`<span class="ed-rv-editor">by ${r(e.editor_name)}</span>`:""}
            <em class="ed-st-${e.status}">${e.status}</em>
          </div>
          <div class="ed-rv-pali">${h(e.pali)}</div>
          ${d}
          ${c}
          ${e.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${r(e.conflict)}</p>`:""}
          ${e.note?`<p class="ed-remark-note">${r(e.note)}</p>`:""}
        </div>
      </div>`}).join(""),t.querySelectorAll(".rv-cb").forEach(e=>{e.addEventListener("change",()=>{const n=e.dataset.lang,a=parseInt(e.dataset.id),o=`${n}:${a}`;e.checked?s.selectedReview.set(o,{lang:n,id:a}):s.selectedReview.delete(o)})})}}function w(t){const e=document.getElementById("rv-msg");e&&(e.textContent=t)}function J(t,e,n){const a=document.caretRangeFromPoint?document.caretRangeFromPoint(e,n):null;if(!a||!a.startContainer||!t.contains(a.startContainer))return"";const o=a.startContainer.nodeValue||"";let i=a.startOffset,d=i,c=i;for(;d>0&&/[\p{L}\p{N}]/u.test(o[d-1]);)d--;for(;c<o.length&&/[\p{L}\p{N}]/u.test(o[c]);)c++;return o.slice(d,c)}function $(){document.querySelectorAll(".ed-lookup-pop").forEach(t=>t.remove())}document.addEventListener("click",t=>{t.target.closest(".ed-lookup-pop")||$()});document.addEventListener("keydown",t=>{t.key==="Escape"&&$()});async function E(t,e){if($(),!t)return;const n=document.createElement("div");n.className="ed-lookup-pop",n.innerHTML=`
    <div class="ed-lookup-head">
      <span class="ed-lookup-title">📖 ${r(t)}</span>
      <button class="ed-lookup-close" aria-label="Close">✕</button>
    </div>
    <div class="ed-lookup-body ed-empty">Looking up…</div>`,document.body.appendChild(n);const a=e&&e.getBoundingClientRect?e.getBoundingClientRect():null,o=a?a.left:120,i=a?a.bottom+8:120;n.style.left=`${Math.max(8,Math.min(o,window.innerWidth-360))}px`,n.style.top=`${Math.max(8,Math.min(i,window.innerHeight-200))}px`,n.querySelector(".ed-lookup-close").addEventListener("click",$);try{const d=await m(`/editor/api/lookup?word=${encodeURIComponent(t)}`),c=n.querySelector(".ed-lookup-body");if(!d.results||!d.results.length){c.textContent="No dictionary entry found for this word.";return}c.innerHTML=d.results.map(p=>`
      <div class="ed-lookup-entry">
        <div class="ed-lookup-word">${r(p.word)}${p.book_name?` <span class="ed-lookup-src">${r(p.book_name)}</span>`:""}</div>
        ${p.type==="deconstruction"&&p.deconstruction?`<div class="ed-lookup-def">${r(p.deconstruction)}</div>`:""}
        ${p.definition?`<div class="ed-lookup-def">${r(p.definition)}</div>`:""}
      </div>`).join("")}catch(d){n.querySelector(".ed-lookup-body").textContent=d.message}}async function z(){return(await m("/editor/api/editors")).editors}function Q(){const t=document.getElementById("ed-editors-view");t.innerHTML=`
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
                ${s.langs.map(e=>`<label class="ed-lang-check"><input type="checkbox" value="${e.code}"> ${r(e.english_name)}</label>`).join("")}
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
    </div>`,document.getElementById("ed-new-form").addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("ne-msg");n.hidden=!0;const a=[...document.querySelectorAll("#ne-langs input:checked")].map(o=>o.value);try{await m("/editor/api/editors",{method:"POST",body:{display_name:document.getElementById("ne-name").value,email:document.getElementById("ne-email").value,password:document.getElementById("ne-pass").value,langs:a,is_super:document.getElementById("ne-super").checked}}),await S(),document.getElementById("ed-new-form").reset()}catch(o){n.textContent=o.message,n.hidden=!1}}),S()}async function S(){const t=document.getElementById("ed-editor-list");if(!t)return;const e=await z();t.innerHTML=e.map(n=>`
    <div class="ed-editor-card" data-eid="${n.id}">
      <div class="ed-editor-top">
        <div>
          <strong>${r(n.display_name||n.email)}</strong>
          ${n.is_super?'<span class="ed-super-tag">admin</span>':""}
        </div>
        <div class="ed-editor-actions">
          <button class="ed-btn ed-btn-ghost ed-ed-save" data-eid="${n.id}">Save</button>
          <button class="ed-btn ed-btn-danger ed-ed-del" data-eid="${n.id}">Delete</button>
        </div>
      </div>
      <div class="ed-editor-fields">
        <label class="ed-field"><span>Display name</span>
          <input type="text" class="ed-f-name" value="${r(n.display_name)}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" class="ed-f-email" value="${r(n.email)}"></label>
        <label class="ed-field"><span>New password (leave blank to keep)</span>
          <input type="password" class="ed-f-pass" placeholder="••••••••"></label>
        <div class="ed-field"><span>Languages</span>
          <div class="ed-lang-checkbox-row">
            ${s.langs.map(a=>`<label class="ed-lang-check"><input type="checkbox" class="ed-f-lang" value="${a.code}" ${n.langs.includes(a.code)?"checked":""}> ${r(a.english_name)}</label>`).join("")}
          </div>
        </div>
        <label class="ed-check"><input type="checkbox" class="ed-f-super" ${n.is_super?"checked":""}> Super admin</label>
      </div>
      <p class="ed-error ed-ed-msg" hidden></p>
    </div>`).join(""),t.querySelectorAll(".ed-ed-save").forEach(n=>{n.addEventListener("click",async()=>{const a=n.closest(".ed-editor-card"),o=parseInt(n.dataset.eid),i=a.querySelector(".ed-ed-msg");i.hidden=!0;try{const d={display_name:a.querySelector(".ed-f-name").value,is_super:a.querySelector(".ed-f-super").checked,langs:[...a.querySelectorAll(".ed-f-lang:checked")].map(p=>p.value)},c=a.querySelector(".ed-f-pass").value;c&&(d.password=c),await m(`/editor/api/editors/${o}`,{method:"PATCH",body:d}),i.textContent="✓ Saved",i.classList.add("ed-ok"),i.hidden=!1,setTimeout(()=>{i.hidden=!0},2e3)}catch(d){i.textContent=d.message,i.hidden=!1}})}),t.querySelectorAll(".ed-ed-del").forEach(n=>{n.addEventListener("click",async()=>{const a=parseInt(n.dataset.eid);if(confirm("Delete this editor account? This cannot be undone."))try{await m(`/editor/api/editors/${a}`,{method:"DELETE"}),await S()}catch(o){alert(o.message)}})})}(async function(){try{const e=await m("/editor/api/me");s.me=e,await A()}catch{T()}})();

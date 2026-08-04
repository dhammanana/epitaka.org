const{baseUrl:I}=window.EDITOR_CONFIG;async function c(t,{method:e="GET",body:a}={}){const s=await fetch(I+t,{method:e,headers:a?{"Content-Type":"application/json"}:void 0,body:a?JSON.stringify(a):void 0}),l=await s.json().catch(()=>({}));if(!s.ok)throw new Error(l.error||`HTTP ${s.status}`);return l}const n={me:null,langs:[],currentLang:null,menu:null,currentBook:null,toc:[],currentSection:null,sentences:[],remarks:[],reviewFilter:{lang:"",kind:"",status:"pending",book_id:"",offset:0},reviewItems:[],reviewTotals:{},selectedReview:new Map},E=document.getElementById("editor-root");function d(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(){E.innerHTML=`
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
    </div>`,document.getElementById("ed-login-form").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("ed-login-btn"),a=document.getElementById("ed-login-error");e.disabled=!0,e.textContent="Signing in…",a.hidden=!0;try{const s=await c("/editor/api/login",{method:"POST",body:{email:document.getElementById("ed-login-email").value,password:document.getElementById("ed-login-password").value}});n.me=s,await L()}catch(s){a.textContent=s.message,a.hidden=!1,e.disabled=!1,e.textContent="Sign in"}})}function A(){const t=n.me,e=t.is_super?`<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>
       <button class="ed-nav-btn" data-view="review">🛂 Review${n.pendingCount?` <span class="ed-badge">${n.pendingCount}</span>`:""}</button>
       <button class="ed-nav-btn" data-view="editors">👥 Editors</button>`:'<button class="ed-nav-btn" data-view="workspace">✏️ Edit</button>';E.innerHTML=`
    <header class="ed-topbar">
      <div class="ed-brand">📖 E-Piṭaka <span class="ed-brand-sub">Translation Editor</span></div>
      <nav class="ed-nav">${e}</nav>
      <div class="ed-user">
        <span class="ed-user-name">${d(t.display_name||t.email)}</span>
        ${t.is_super?'<span class="ed-super-tag">admin</span>':""}
        <button class="ed-btn ed-btn-ghost" id="ed-logout">Sign out</button>
      </div>
    </header>
    <div class="ed-body">
      <div id="ed-workspace-view" class="ed-view" hidden></div>
      <div id="ed-review-view"   class="ed-view" hidden></div>
      <div id="ed-editors-view"  class="ed-view" hidden></div>
    </div>`,document.querySelectorAll(".ed-nav-btn").forEach(a=>{a.addEventListener("click",()=>k(a.dataset.view))}),document.getElementById("ed-logout").addEventListener("click",async()=>{try{await c("/editor/api/logout",{method:"POST"})}catch{}n.me=null,S()}),k("workspace")}function k(t){document.querySelectorAll(".ed-nav-btn").forEach(a=>a.classList.toggle("is-active",a.dataset.view===t)),document.querySelectorAll(".ed-view").forEach(a=>a.hidden=!0);const e=document.getElementById(`ed-${t}-view`);e.hidden=!1,t==="workspace"?h():t==="review"?R():t==="editors"&&M()}async function L(){var e;const t=await c("/editor/api/languages");n.langs=t.languages,n.currentLang=((e=n.langs[0])==null?void 0:e.code)||null,n.currentLang&&await _(),A()}async function _(){if(!n.currentLang)return;const t=await c(`/editor/api/${n.currentLang}/books`);n.menu=t.menu,n.currentBook=null,n.toc=[],n.currentSection=null,n.sentences=[],n.remarks=[]}const w=["Mūla","Aṭṭhakathā","Ṭīkā"],q=["Vinaya","Suttanta","Sutta","Abhidhamma"];function h(){const t=document.getElementById("ed-workspace-view");t.innerHTML=`
    <div class="ed-ws">
      <aside class="ed-ws-side">
        <div class="ed-ws-block">
          <div class="ed-ws-label">Language</div>
          <div class="ed-lang-row">
            ${n.langs.map(e=>`<button class="ed-lang-chip${e.code===n.currentLang?" is-active":""}" data-lang="${e.code}" title="${d(e.english_name)}">${d(e.native_name)}</button>`).join("")}
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
      </aside>
      <main class="ed-ws-main">
        <div class="ed-ws-head">
          <h2 class="ed-ws-bookname">${n.currentBook?d(n.currentBook.name):"Choose a book"}</h2>
          <span class="ed-ws-hint">Click a translation line to propose an edit</span>
        </div>
        <div id="ed-lines" class="ed-lines"></div>
      </main>
    </div>`,document.querySelectorAll(".ed-lang-chip").forEach(e=>{e.addEventListener("click",async()=>{e.dataset.lang!==n.currentLang&&(n.currentLang=e.dataset.lang,await _(),h())})}),T(),C(),y()}function B(){if(!n.menu)return[];const t=Object.keys(n.menu);return[...w.filter(a=>t.includes(a)),...t.filter(a=>!w.includes(a))].map(a=>({label:a,data:n.menu[a]}))}function T(){const t=document.getElementById("ed-book-tabs"),e=document.getElementById("ed-book-tree");if(!t||!e)return;const a=B();if(!a.length){e.innerHTML='<p class="ed-empty">No books in this language.</p>';return}t.innerHTML=a.map((i,o)=>`<button class="ed-tab${o===0?" is-active":""}" data-tab="${o}">${d(i.label)}</button>`).join("");const s=0,l=a.map((i,o)=>`<div class="ed-tree-panel${o===s?" is-active":""}" data-panel="${o}">${x(i.data)}</div>`).join("");e.innerHTML=l,t.querySelectorAll(".ed-tab").forEach(i=>{i.addEventListener("click",()=>{t.querySelectorAll(".ed-tab").forEach(o=>o.classList.toggle("is-active",o===i)),e.querySelectorAll(".ed-tree-panel").forEach(o=>o.classList.toggle("is-active",parseInt(o.dataset.panel)===parseInt(i.dataset.tab)))})}),e.querySelectorAll(".ed-nikaya-title").forEach(i=>{i.addEventListener("click",()=>{var o;i.classList.toggle("open"),(o=i.nextElementSibling)==null||o.classList.toggle("open")})}),e.querySelectorAll(".ed-book").forEach(i=>{i.addEventListener("click",async()=>{var u;const o=i.dataset.bookId;n.currentBook={id:o,name:i.dataset.bookName};const p=await c(`/editor/api/${n.currentLang}/book/${o}/toc`);n.toc=p.toc,n.currentSection=null,n.sentences=[],n.remarks=[],h(),(u=document.querySelector(".ed-ws-sections"))==null||u.scrollIntoView({behavior:"smooth",block:"start"})})})}function x(t){return!t||typeof t!="object"?"":Object.keys(t).sort((a,s)=>{const l=i=>{const o=q.findIndex(p=>i.includes(p));return o===-1?99:o};return l(a)-l(s)}).map(a=>`
    <div class="ed-category">
      <div class="ed-category-title">${d(a)}</div>
      ${j(t[a])}
    </div>`).join("")}function j(t){if(!t||typeof t!="object")return"";const e=[];return t[""]&&e.push(`<ol class="ed-book-list open">${$(t[""])}</ol>`),Object.entries(t).forEach(([a,s])=>{a!==""&&e.push(`
      <div class="ed-nikaya">
        <div class="ed-nikaya-title">${d(a)} <span class="ed-chev">▶</span></div>
        <ol class="ed-book-list">${$(s)}</ol>
      </div>`)}),e.join("")}function $(t){return Array.isArray(t)?t.map(([e,a])=>`<li><button class="ed-book" data-book-id="${d(e)}" data-book-name="${d(a)}">${d(a)}</button></li>`).join(""):""}function C(){const t=document.getElementById("ed-toc");if(t){if(!n.toc.length){t.innerHTML='<p class="ed-empty">Pick a book to see its sections.</p>';return}t.innerHTML=n.toc.map(e=>{const a=e.has_content;return`
      <button class="ed-toc-item${n.currentSection===e.para_id?" is-active":""}" data-para="${e.para_id}"
              style="padding-left:${Math.min((e.level||1)-1,4)*14+8}px"
              ${a?"":"disabled"}>
        ${d(e.title)}${a?"":' <span class="ed-toc-no">·</span>'}
      </button>`}).join(""),t.querySelectorAll(".ed-toc-item:not([disabled])").forEach(e=>{e.addEventListener("click",async()=>{n.currentSection=parseInt(e.dataset.para);const a=await c(`/editor/api/${n.currentLang}/book/${n.currentBook.id}/section/${n.currentSection}`);n.sentences=a.sentences,n.remarks=a.remarks,y()})})}}function F(t,e){return(n.remarks||[]).filter(a=>a.para_id===t&&a.line_id===e)}function y(){const t=document.getElementById("ed-lines");if(t){if(!n.sentences.length){t.innerHTML='<p class="ed-empty">Pick a section to edit its lines.</p>';return}t.innerHTML=n.sentences.map((e,a)=>{const s=F(e.para_id,e.line_id),l=s.filter(r=>r.kind==="ai"),i=s.filter(r=>r.kind==="human"),o=l.map(r=>`
      <div class="ed-remark ed-remark-ai" title="AI finding">
        <div class="ed-remark-head">⚡ AI finding${r.status==="applied"?' <em class="ed-st-applied">· applied</em>':""}</div>
        ${r.translation&&r.translation!==e.translation?`<p class="ed-remark-fix"><span class="ed-remark-label">Suggestion</span><ins>${d(r.translation)}</ins></p>`:""}
        ${r.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${d(r.conflict)}</p>`:""}
        ${r.note?`<p class="ed-remark-note">${d(r.note)}</p>`:""}
      </div>`).join(""),p=i.map(r=>{const b=r.proposed||r.translation||"";return`
      <div class="ed-remark ed-remark-human">
        <div class="ed-remark-head">
          🖊 ${d(r.editor_name||"Human")} · <em class="ed-st-${r.status}">${r.status}</em>
          ${r.created_at?` <span class="ed-remark-date">${d(r.created_at)}</span>`:""}
        </div>
        ${r.note?`<p class="ed-remark-note">${d(r.note)}</p>`:""}
        ${b&&b!==e.translation?`<p class="ed-remark-fix"><del>${d(e.translation)}</del> → <ins>${d(b)}</ins></p>`:""}
      </div>`}).join(""),u=i.some(r=>r.status==="pending");return`
      <div class="ed-line" data-para="${e.para_id}" data-line="${e.line_id}" id="edl-${e.para_id}-${e.line_id}">
        <div class="ed-line-meta">
          <span class="ed-line-num">¶${e.para_id}.${e.line_id}</span>
          ${u?'<span class="ed-chip ed-chip-pending">proposed</span>':""}
        </div>
        <div class="ed-line-pali">${d(e.pali)}</div>
        <div class="ed-line-trans" data-role="trans">${d(e.translation)}</div>
        ${o}
        ${p}
        <div class="ed-edit-box" hidden>
          <textarea class="ed-textarea" rows="3" placeholder="Proposed translation…">${d(e.translation)}</textarea>
          <input type="text" class="ed-note" placeholder="Optional note for the reviewer" maxlength="1000">
          <div class="ed-edit-actions">
            <button class="ed-btn ed-btn-primary ed-save">Save proposal</button>
            <button class="ed-btn ed-btn-ghost ed-cancel">Cancel</button>
            <span class="ed-save-msg"></span>
          </div>
        </div>
      </div>`}).join(""),t.querySelectorAll(".ed-line-trans").forEach(e=>{e.addEventListener("click",()=>{const a=e.closest(".ed-line");a.querySelector(".ed-edit-box").hidden=!1;const s=a.querySelector(".ed-textarea");s.focus(),s.setSelectionRange(s.value.length,s.value.length)})}),t.querySelectorAll(".ed-edit-box").forEach(e=>{const a=e.closest(".ed-line"),s=parseInt(a.dataset.para),l=parseInt(a.dataset.line);e.querySelector(".ed-cancel").addEventListener("click",()=>{e.hidden=!0}),e.querySelector(".ed-save").addEventListener("click",async()=>{const i=e.querySelector(".ed-textarea").value.trim(),o=e.querySelector(".ed-note").value.trim(),p=e.querySelector(".ed-save-msg");if(!i){p.textContent="Translation cannot be empty.";return}p.textContent="Saving…";const u=e.querySelector(".ed-save");u.disabled=!0;try{await c(`/editor/api/${n.currentLang}/book/${n.currentBook.id}/line`,{method:"POST",body:{para_id:s,line_id:l,proposed:i,note:o}}),p.textContent="✓ Saved as proposal",e.hidden=!0;const r=await c(`/editor/api/${n.currentLang}/book/${n.currentBook.id}/section/${n.currentSection}`);n.sentences=r.sentences,n.remarks=r.remarks,y()}catch(r){p.textContent=r.message,u.disabled=!1}})})}}async function m(){const t=n.reviewFilter,e=new URLSearchParams;t.lang&&e.set("lang",t.lang),t.kind&&e.set("kind",t.kind),t.status&&e.set("status",t.status),t.book_id&&e.set("book_id",t.book_id),e.set("offset",t.offset);const a=await c(`/editor/api/review?${e}`);n.reviewItems=a.items,n.reviewTotals=a.totals,n.selectedReview=new Map,n.pendingCount=t.status==="pending"?Object.values(a.totals).reduce((s,l)=>s+l,0):n.pendingCount||0}function R(){const t=document.getElementById("ed-review-view");t.innerHTML=`
    <div class="ed-review">
      <div class="ed-review-head">
        <h2>🛂 Review queue</h2>
        <p class="ed-ws-hint">Approve AI findings and human proposals. Applied changes write directly into the translation database.</p>
      </div>
      <div class="ed-filters">
        <select id="rf-lang">
          <option value="">All languages</option>
          ${n.langs.map(e=>`<option value="${e.code}" ${n.reviewFilter.lang===e.code?"selected":""}>${d(e.english_name)}</option>`).join("")}
        </select>
        <select id="rf-kind">
          <option value="">All kinds</option>
          <option value="human" ${n.reviewFilter.kind==="human"?"selected":""}>Human proposals</option>
          <option value="ai" ${n.reviewFilter.kind==="ai"?"selected":""}>AI findings</option>
        </select>
        <select id="rf-status">
          <option value="pending">Pending</option>
          <option value="applied" ${n.reviewFilter.status==="applied"?"selected":""}>Applied</option>
          <option value="rejected" ${n.reviewFilter.status==="rejected"?"selected":""}>Rejected</option>
        </select>
        <input type="text" id="rf-book" placeholder="Book id (e.g. Dhp-a)" value="${d(n.reviewFilter.book_id)}">
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
        <button class="ed-btn ed-btn-ghost" id="rv-prev" ${n.reviewFilter.offset===0?"disabled":""}>← Prev</button>
        <span class="ed-pager-info">offset ${n.reviewFilter.offset}</span>
        <button class="ed-btn ed-btn-ghost" id="rv-next" ${n.reviewItems.length<100?"disabled":""}>Next →</button>
      </div>
    </div>`,t.querySelectorAll("#rf-lang, #rf-kind, #rf-status").forEach(e=>{e.addEventListener("change",()=>{n.reviewFilter.lang=document.getElementById("rf-lang").value,n.reviewFilter.kind=document.getElementById("rf-kind").value,n.reviewFilter.status=document.getElementById("rf-status").value,n.reviewFilter.offset=0})}),t.querySelector("#rf-apply").addEventListener("click",async()=>{n.reviewFilter.book_id=document.getElementById("rf-book").value.trim(),n.reviewFilter.offset=0;try{await m(),v()}catch(e){g(e.message)}}),t.querySelector("#rv-prev").addEventListener("click",async()=>{n.reviewFilter.offset=Math.max(0,n.reviewFilter.offset-100),await m(),v()}),t.querySelector("#rv-next").addEventListener("click",async()=>{n.reviewFilter.offset+=100,await m(),v()}),t.querySelector("#rv-apply-selected").addEventListener("click",async()=>{const e=[...n.selectedReview.values()];if(!e.length)return g("Select remarks first.");const a=await c("/editor/api/review/apply",{method:"POST",body:{items:e}});await m(),v();const s=a.results.filter(i=>i.ok).length,l=a.results.filter(i=>!i.ok).map(i=>i.message).join("; ");g(`Applied ${s}/${e.length}.${l?" "+l:""}`)}),t.querySelector("#rv-reject-selected").addEventListener("click",async()=>{const e=[...n.selectedReview.values()];if(!e.length)return g("Select remarks first.");await c("/editor/api/review/reject",{method:"POST",body:{items:e}}),await m(),v(),g(`Rejected ${e.length}.`)}),t.querySelector("#rv-apply-all").addEventListener("click",async()=>{if(!confirm("Apply ALL pending remarks matching the current filter? This directly changes the translation database."))return;const e=await c("/editor/api/review/apply_all",{method:"POST",body:{lang:n.reviewFilter.lang,kind:n.reviewFilter.kind,status:"pending",book_id:n.reviewFilter.book_id}}),a=e.summary.reduce((l,i)=>l+i.applied,0),s=e.summary.reduce((l,i)=>l+i.failed,0);await m(),v(),g(`Applied ${a}, failed ${s}.`)}),v()}function v(){const t=document.getElementById("ed-review-list");if(t){if(!n.reviewItems.length){t.innerHTML='<p class="ed-empty">Nothing here. Adjust the filters.</p>';return}t.innerHTML=n.reviewItems.map(e=>{const a=`${e.lang}:${e.id}`,s=n.selectedReview.has(a)?"checked":"",l=e.kind==="human",i=l&&e.proposed||e.translation||"",o=e.applicable&&i?`<p class="ed-remark-fix"><del>${d(e.live)}</del> → <ins>${d(i)}</ins></p>`:"",p=!e.applicable&&(i||e.apply_msg)?`<p class="ed-remark-note"><span class="ed-remark-label">Not auto-appliable</span>${d(e.apply_msg||"See reasons below")}</p>`:"";return`
      <div class="ed-rv-item" data-key="${d(a)}">
        <label class="ed-rv-check">
          <input type="checkbox" class="rv-cb" data-lang="${d(e.lang)}" data-id="${e.id}" ${s}>
        </label>
        <div class="ed-rv-body">
          <div class="ed-rv-meta">
            <span class="ed-chip ed-chip-${e.kind}">${l?"human":"AI"}</span>
            <span class="ed-rv-book">${d(e.book_id)}</span>
            <span class="ed-rv-pos">¶${e.para_id}.${e.line_id}</span>
            <span class="ed-rv-lang">${d(e.lang)}</span>
            ${e.editor_name?`<span class="ed-rv-editor">by ${d(e.editor_name)}</span>`:""}
            <em class="ed-st-${e.status}">${e.status}</em>
          </div>
          <div class="ed-rv-pali">${d(e.pali)}</div>
          ${o}
          ${p}
          ${e.conflict?`<p class="ed-remark-note"><span class="ed-remark-label">Conflict</span>${d(e.conflict)}</p>`:""}
          ${e.note?`<p class="ed-remark-note">${d(e.note)}</p>`:""}
        </div>
      </div>`}).join(""),t.querySelectorAll(".rv-cb").forEach(e=>{e.addEventListener("change",()=>{const a=e.dataset.lang,s=parseInt(e.dataset.id),l=`${a}:${s}`;e.checked?n.selectedReview.set(l,{lang:a,id:s}):n.selectedReview.delete(l)})})}}function g(t){const e=document.getElementById("rv-msg");e&&(e.textContent=t)}async function H(){return(await c("/editor/api/editors")).editors}function M(){const t=document.getElementById("ed-editors-view");t.innerHTML=`
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
                ${n.langs.map(e=>`<label class="ed-lang-check"><input type="checkbox" value="${e.code}"> ${d(e.english_name)}</label>`).join("")}
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
    </div>`,document.getElementById("ed-new-form").addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("ne-msg");a.hidden=!0;const s=[...document.querySelectorAll("#ne-langs input:checked")].map(l=>l.value);try{await c("/editor/api/editors",{method:"POST",body:{display_name:document.getElementById("ne-name").value,email:document.getElementById("ne-email").value,password:document.getElementById("ne-pass").value,langs:s,is_super:document.getElementById("ne-super").checked}}),await f(),document.getElementById("ed-new-form").reset()}catch(l){a.textContent=l.message,a.hidden=!1}}),f()}async function f(){const t=document.getElementById("ed-editor-list");if(!t)return;const e=await H();t.innerHTML=e.map(a=>`
    <div class="ed-editor-card" data-eid="${a.id}">
      <div class="ed-editor-top">
        <div>
          <strong>${d(a.display_name||a.email)}</strong>
          ${a.is_super?'<span class="ed-super-tag">admin</span>':""}
        </div>
        <div class="ed-editor-actions">
          <button class="ed-btn ed-btn-ghost ed-ed-save" data-eid="${a.id}">Save</button>
          <button class="ed-btn ed-btn-danger ed-ed-del" data-eid="${a.id}">Delete</button>
        </div>
      </div>
      <div class="ed-editor-fields">
        <label class="ed-field"><span>Display name</span>
          <input type="text" class="ed-f-name" value="${d(a.display_name)}"></label>
        <label class="ed-field"><span>Email</span>
          <input type="email" class="ed-f-email" value="${d(a.email)}"></label>
        <label class="ed-field"><span>New password (leave blank to keep)</span>
          <input type="password" class="ed-f-pass" placeholder="••••••••"></label>
        <div class="ed-field"><span>Languages</span>
          <div class="ed-lang-checkbox-row">
            ${n.langs.map(s=>`<label class="ed-lang-check"><input type="checkbox" class="ed-f-lang" value="${s.code}" ${a.langs.includes(s.code)?"checked":""}> ${d(s.english_name)}</label>`).join("")}
          </div>
        </div>
        <label class="ed-check"><input type="checkbox" class="ed-f-super" ${a.is_super?"checked":""}> Super admin</label>
      </div>
      <p class="ed-error ed-ed-msg" hidden></p>
    </div>`).join(""),t.querySelectorAll(".ed-ed-save").forEach(a=>{a.addEventListener("click",async()=>{const s=a.closest(".ed-editor-card"),l=parseInt(a.dataset.eid),i=s.querySelector(".ed-ed-msg");i.hidden=!0;try{const o={display_name:s.querySelector(".ed-f-name").value,is_super:s.querySelector(".ed-f-super").checked,langs:[...s.querySelectorAll(".ed-f-lang:checked")].map(u=>u.value)},p=s.querySelector(".ed-f-pass").value;p&&(o.password=p),await c(`/editor/api/editors/${l}`,{method:"PATCH",body:o}),i.textContent="✓ Saved",i.classList.add("ed-ok"),i.hidden=!1,setTimeout(()=>{i.hidden=!0},2e3)}catch(o){i.textContent=o.message,i.hidden=!1}})}),t.querySelectorAll(".ed-ed-del").forEach(a=>{a.addEventListener("click",async()=>{const s=parseInt(a.dataset.eid);if(confirm("Delete this editor account? This cannot be undone."))try{await c(`/editor/api/editors/${s}`,{method:"DELETE"}),await f()}catch(l){alert(l.message)}})})}(async function(){try{const e=await c("/editor/api/me");n.me=e,await L()}catch{S()}})();

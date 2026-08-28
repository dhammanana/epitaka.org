const M=[{pat:/aa/gi,rep:i=>i==="aa"?"ā":"Ā"},{pat:/ii/gi,rep:i=>i==="ii"?"ī":"Ī"},{pat:/uu/gi,rep:i=>i==="uu"?"ū":"Ū"},{pat:/\.t/gi,rep:i=>i===".t"?"ṭ":"Ṭ"},{pat:/\.d/gi,rep:i=>i===".d"?"ḍ":"Ḍ"},{pat:/\.n/gi,rep:i=>i===".n"?"ṇ":"Ṇ"},{pat:/\.m/gi,rep:i=>i===".m"?"ṃ":"Ṃ"},{pat:/\.l/gi,rep:i=>i===".l"?"ḷ":"Ḷ"},{pat:/\.s/gi,rep:i=>i===".s"?"ṣ":"Ṣ"},{pat:/~n/g,rep:"ñ"},{pat:/~N/g,rep:"Ñ"},{pat:/"n/gi,rep:i=>i==='"n'?"ṅ":"Ṅ"},{pat:/"s/gi,rep:i=>i==='"s'?"ś":"Ś"}];function B(i){let t=i;for(const{pat:s,rep:e}of M)t=t.replace(s,a=>typeof e=="function"?e(a):e);return t}function F(i){let t="",s=0;for(;s<i.length;)if(i[s]===";"&&s+1<i.length){const e=i[s+1],a=e.toLowerCase(),o=e!==a;let n=null;switch(a){case"a":n=o?"Ā":"ā";break;case"i":n=o?"Ī":"ī";break;case"u":n=o?"Ū":"ū";break;case"t":n=o?"Ṭ":"ṭ";break;case"d":n=o?"Ḍ":"ḍ";break;case"n":n=o?"Ñ":"ñ";break;case"m":n=o?"Ṃ":"ṃ";break;case"l":n=o?"Ḷ":"ḷ";break;case"s":n=o?"Ś":"ś";break;case"k":n=o?"Ṅ":"ṅ";break;case"j":n=o?"Ñ":"ñ";break}n!==null?(t+=n,s+=2):(t+=";"+e,s+=2)}else t+=i[s],s++;return t}function E(i,t="velthuis"){let s=i;return(t==="velthuis"||t==="both")&&(s=B(s)),(t==="deadkey"||t==="both")&&(s=F(s)),s}function A(i,t={}){const{mode:s="velthuis",onConvert:e=null,cursorRestoreDelta:a=0}=t;let o=!1,n=!1;const l=()=>{if(n)return;const c=i.selectionStart??i.value.length,p=i.selectionEnd??c,u=i.value;if(o){const b=u.slice(0,c),y=u.slice(c),m=E(b,s);if(m===b)return;n=!0;const $=b.length,k=m.length;i.value=m+y;const R=k-$,w=Math.min(Math.max(0,c+R+a),k);i.setSelectionRange(w,w),n=!1,e&&e(i.value);return}const h=E(u,s);if(h===u)return;n=!0;const g=u.length,f=h.length;i.value=h;let _=c;if(c===p&&c===g)_=f;else{const b=f-g;_=Math.min(Math.max(0,c+b+a),f)}i.setSelectionRange(_,_),n=!1,e&&e(h)},d=()=>{o=!0},r=()=>{o=!1,l()};return i.addEventListener("input",l),i.addEventListener("compositionstart",d),i.addEventListener("compositionend",r),()=>{i.removeEventListener("input",l),i.removeEventListener("compositionstart",d),i.removeEventListener("compositionend",r)}}function j(i){return i.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}const x=[{id:"sutta",label:"Sutta",match:i=>{var t;return(t=i.nikaya)==null?void 0:t.includes("Sutta")}},{id:"vinaya",label:"Vinaya",match:i=>{var t;return(t=i.nikaya)==null?void 0:t.includes("Vinaya")}},{id:"abhidhamma",label:"Abhidhamma",match:i=>{var t;return(t=i.nikaya)==null?void 0:t.includes("Abhidhamma")}},{id:"anna",label:"Añña",match:i=>i.category==="Añña"}],P=[{id:"mula",label:"Mūla",match:i=>i.category==="Mūla"},{id:"attha",label:"Aṭṭhakathā",match:i=>i.category==="Aṭṭhakathā"},{id:"tika",label:"Ṭīkā",match:i=>i.category==="Ṭīkā"}];class C{constructor(t,{onChange:s}={}){this.hierarchy=t,this.onChange=s||(()=>{}),this._pitakas=new Set,this._layers=new Set,this._el=null}getActiveBookIds(){const t=this._pitakas.size>0,s=this._layers.size>0;if(!t&&!s)return null;const e=new Set;for(const[a,o]of Object.entries(this.hierarchy)){const n=!t||x.filter(d=>this._pitakas.has(d.id)).some(d=>d.match(o)),l=!s||P.filter(d=>this._layers.has(d.id)).some(d=>d.match(o));n&&l&&e.add(a)}return e}filterResults(t){const s=this.getActiveBookIds();return s?t.filter(e=>s.has(e.book_id)):t}getFilterParams(){return{pitakas:[...this._pitakas],layers:[...this._layers]}}setFilterParams({pitakas:t=[],layers:s=[]}={}){this._pitakas=new Set(Array.isArray(t)?t:[]),this._layers=new Set(Array.isArray(s)?s:[]),this.refresh(),this.onChange()}mount(t){this._el=document.createElement("div"),this._el.className="book-filter",this._el.innerHTML=this._buildHTML(),t.appendChild(this._el),this._bindEvents()}unmount(){this._el&&(this._el.remove(),this._el=null)}refresh(){this._el&&(this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(t=>{t.classList.toggle("active",this._pitakas.has(t.dataset.id))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(t=>{t.classList.toggle("active",this._layers.has(t.dataset.id))}),this._updateClearBtn())}_buildHTML(){const t=x.map(e=>`<button class="bf-chip" data-group="pitaka" data-id="${e.id}">${e.label}</button>`).join(""),s=P.map(e=>`<button class="bf-chip" data-group="layer" data-id="${e.id}">${e.label}</button>`).join("");return`
      <div class="bf-row">
        <span class="bf-label">Piṭaka</span>
        <div class="bf-chips" id="bf-pitaka-chips">${t}</div>
      </div>
      <div class="bf-row">
        <span class="bf-label">Group</span>
        <div class="bf-chips" id="bf-layer-chips">${s}</div>
      </div>
      <button class="bf-clear" id="bf-clear-btn" style="display:none">✕ Clear filters</button>
    `}_bindEvents(){this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(t=>{t.addEventListener("click",()=>this._toggle(this._pitakas,t))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(t=>{t.addEventListener("click",()=>this._toggle(this._layers,t))}),this._el.querySelector("#bf-clear-btn").addEventListener("click",()=>{this._pitakas.clear(),this._layers.clear(),this.refresh(),this.onChange()})}_toggle(t,s){const e=s.dataset.id;t.has(e)?(t.delete(e),s.classList.remove("active")):(t.add(e),s.classList.add("active")),this._updateClearBtn(),this.onChange()}_updateClearBtn(){var e;const t=(e=this._el)==null?void 0:e.querySelector("#bf-clear-btn");if(!t)return;const s=this._pitakas.size>0||this._layers.size>0;t.style.display=s?"inline-flex":"none"}}const v=[{id:"headings",icon:"☰",label:"Search Headings",desc:"Find by section titles",placeholder:"Search section headings…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"fulltext",icon:"🔍",label:"Full Text",desc:"Search Pāli & translations",placeholder:"Type words to search…",hasAutocomplete:!0,hasFtsOptions:!1,autocompleteMode:"word"},{id:"pali-def",icon:"📖",label:"Pāli Definitions",desc:"Look up Pāli dictionary",placeholder:"Search Pāli word…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"ai",icon:"✨",label:"AI Search",desc:"Semantic meaning search",placeholder:"Ask a question…",hasAutocomplete:!1,hasFtsOptions:!1}],H={searchRow:"home-search-row",searchInputWrap:"home-search-input-wrap",typeBtn:"search-type-btn",typeMenu:"search-type-menu",searchInput:"home-search-input",suggestions:"home-suggestions",goBtn:"home-search-go",resultsPanel:"home-results-panel",filterWrap:"home-filter-wrap"};function W(i,t,s=""){const e=v.find(a=>a.id===t)??v[0];return`
    <div id="${i.searchRow}">
      <div style="position:relative">
        <button id="${i.typeBtn}" type="button" aria-haspopup="true">
          <span>${e.icon} ${e.label}</span>
          <span class="arrow">▾</span>
        </button>
        <div id="${i.typeMenu}" role="listbox">
          ${v.map(a=>`
            <div class="search-type-option${a.id===e.id?" selected":""}"
                 data-type="${a.id}" role="option" tabindex="0">
              <span class="opt-icon">${a.icon}</span>
              <div>
                <div class="opt-label">${a.label}</div>
                <div class="opt-desc">${a.desc}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div id="${i.searchInputWrap}">
        <input id="${i.searchInput}"
               type="search"
               autocomplete="off"
               spellcheck="false"
               placeholder="${e.placeholder}"
               aria-label="Search"
               aria-autocomplete="list"
               aria-controls="${i.suggestions}"
               value="${q(s)}">
        <div id="${i.suggestions}" role="listbox" aria-label="Suggestions"></div>
      </div>

      <button id="${i.goBtn}" type="button">Go</button>
    </div>
  `}class N{constructor({baseUrl:t,lang:s,initialState:e={},hierarchy:a={},ids:o=H,onResultSelect:n,onShowResults:l,onShowBooks:d}){this.baseUrl=t,this.lang=s,this.hierarchy=a,this.ids=o,this.onResultSelect=n,this.onShowResults=l,this.onShowBooks=d;const r=v.find(c=>c.id===e.searchTypeId);this.currentType=r??v[0],this._acDebounce=null,this._acController=null,this._focusedIdx=-1,this._suggestions=[],this.bookFilter=new C(a,{onChange:()=>this._onFilterChange()}),this.typeBtn=null,this.typeMenu=null,this.searchInput=null,this.suggestionsEl=null,this.goBtn=null,this.resultsPanel=null,this.filterWrap=null,this._lastResults=null,this._lastQuery="",this._lastType=null,this._ftsData=null,this._ftsPage=1,this._ftsTotalPages=1,this._ftsWords=[],this._ftsLoading=!1,this._ftsExpandedBookId=null}bind(){const t=s=>document.getElementById(s);this.typeBtn=t(this.ids.typeBtn),this.typeMenu=t(this.ids.typeMenu),this.searchInput=t(this.ids.searchInput),this.suggestionsEl=t(this.ids.suggestions),this.goBtn=t(this.ids.goBtn),this.resultsPanel=t(this.ids.resultsPanel),this.filterWrap=t(this.ids.filterWrap),this._bindTypeDropdown(),this._bindInput(),this._bindGoButton(),this.filterWrap&&this.bookFilter.mount(this.filterWrap),this._applyTypeUI(this.currentType)}getState(){var t,s,e;return{typeId:((t=this.currentType)==null?void 0:t.id)||v[0].id,query:((e=(s=this.searchInput)==null?void 0:s.value)==null?void 0:e.trim())||"",pitakas:[...this.bookFilter.getFilterParams().pitakas],layers:[...this.bookFilter.getFilterParams().layers]}}async restore(t){var s,e;if(t){if(t.typeId){const a=v.find(o=>o.id===t.typeId);a&&a.id!==this.currentType.id&&this._selectType(a)}t.query&&this.searchInput&&(this.searchInput.value=t.query),((s=t.pitakas)!=null&&s.length||(e=t.layers)!=null&&e.length)&&this.bookFilter&&this.bookFilter.setFilterParams({pitakas:t.pitakas,layers:t.layers}),t.query&&await this._executeSearch()}}_bindTypeDropdown(){this.typeBtn.addEventListener("click",t=>{t.stopPropagation(),this._toggleTypeMenu()}),this.typeMenu.querySelectorAll(".search-type-option").forEach(t=>{t.addEventListener("click",()=>{const s=v.find(e=>e.id===t.dataset.type);s&&this._selectType(s)})}),document.addEventListener("click",()=>this._closeTypeMenu())}_toggleTypeMenu(){this.typeMenu.classList.contains("show")?this._closeTypeMenu():this._openTypeMenu()}_openTypeMenu(){this._positionBelow(this.typeBtn,this.typeMenu),this.typeMenu.classList.add("show"),this.typeBtn.classList.add("open")}_closeTypeMenu(){this.typeMenu.classList.remove("show"),this.typeBtn.classList.remove("open")}_positionBelow(t,s){const e=t.getBoundingClientRect();if(getComputedStyle(s).position==="absolute"&&s.offsetParent){const o=s.offsetParent.getBoundingClientRect();s.style.top=`${e.bottom-o.top+4}px`,s.style.left=`${e.left-o.left}px`,s.style.maxWidth=`${s.offsetParent.clientWidth-(e.left-o.left)}px`}else s.style.top=`${e.bottom+4}px`,s.style.left=`${e.left}px`,s.style.maxWidth=`${window.innerWidth-e.left-8}px`}_selectType(t){this.currentType=t,this._lastResults=null,this._applyTypeUI(t),this._closeTypeMenu(),this._closeSuggestions(),this.searchInput.value="",this.searchInput.focus(),this.resultsPanel&&(this.resultsPanel.innerHTML="",this.resultsPanel.classList.remove("active")),this.onShowBooks()}_applyTypeUI(t){this.typeBtn.innerHTML=`<span>${t.icon} ${t.label}</span><span class="arrow">▾</span>`,this.searchInput.placeholder=t.placeholder,this.typeMenu.querySelectorAll(".search-type-option").forEach(s=>{s.classList.toggle("selected",s.dataset.type===t.id)})}_onFilterChange(){if(!(!this._lastResults||!this._lastQuery)){if(this._lastType==="headings"){const t=this.bookFilter.filterResults(this._lastResults);this._renderHeadingResults(t,this._lastQuery)}else if(this._lastType==="pali-def"){const t=this.bookFilter.filterResults(this._lastResults);this._renderDictResults(t,this._lastQuery)}}}_bindInput(){this.searchInput.addEventListener("input",()=>this._onInput()),this.searchInput.addEventListener("keydown",t=>this._onKeydown(t)),this.searchInput.addEventListener("blur",()=>{setTimeout(()=>this._closeSuggestions(),160)}),this.removePaliHandler=A(this.searchInput,{mode:"both",onConvert:t=>{const s=t.trim();if(!s){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(s),220))}})}_onInput(){const t=this.searchInput.value.trim();if(!t){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(t),220))}async _fetchSuggestions(t){this._acController&&this._acController.abort(),this._acController=new AbortController,this._showSuggestionsLoading();try{let s;if(this.currentType.id==="headings")s=`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(t)}&limit=12`;else if(this.currentType.id==="pali-def")s=`${this.baseUrl}/api/bold_suggest?q=${encodeURIComponent(t)}&limit=12`;else if(this.currentType.autocompleteMode==="word"){const o=t.split(/\s+/).pop();if(!o){this._closeSuggestions();return}s=`${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(o)}&limit=10`}else return;const a=await(await fetch(s,{signal:this._acController.signal})).json();if(this.currentType.autocompleteMode==="word")this._renderWordSuggestions(a,t);else{const o=this.bookFilter.filterResults(a);this._renderSuggestions(o,t)}}catch(s){s.name!=="AbortError"&&this._closeSuggestions()}}_renderWordSuggestions(t,s){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(t!=null&&t.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No suggestions</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=t.map(n=>({_word:n})),this._focusedIdx=-1;const e=s.split(/\s+/).pop(),a=s.slice(0,s.length-e.length),o=n=>n.replace(new RegExp(`^(${S(e)})`,"i"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=t.map((n,l)=>`<div class="suggestion-item suggestion-word" data-idx="${l}" tabindex="-1">
        <span class="sug-pali">${o(n)}</span>
      </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-word").forEach(n=>{n.addEventListener("mousedown",l=>{var r;l.preventDefault();const d=(r=this._suggestions[parseInt(n.dataset.idx)])==null?void 0:r._word;d&&(this.searchInput.value=a+d+" ",this._closeSuggestions(),this.searchInput.focus())})})}_showSuggestionsLoading(){this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,this.suggestionsEl.innerHTML='<div class="suggestion-loading">Searching…</div>',this.suggestionsEl.classList.add("show"),this._focusedIdx=-1,this._suggestions=[]}_renderSuggestions(t,s){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(t!=null&&t.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No results</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=t,this._focusedIdx=-1;const e=a=>a.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=t.map((a,o)=>this.currentType.id==="headings"?`<div class="suggestion-item" data-idx="${o}" tabindex="-1">
          <span class="sug-pali">${e(a.title||"")}</span>
          <span class="sug-book">${a.book_name||a.book_id||""}</span>
          <span class="sug-para">#${a.para_id||""}</span>
        </div>`:`<div class="suggestion-item" data-idx="${o}" tabindex="-1">
          <span class="sug-pali">${e(a.word||a.title||"")}</span>
          <span class="sug-book">${a.definition_short||""}</span>
        </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-item").forEach(a=>{a.addEventListener("mousedown",o=>{o.preventDefault(),this._selectSuggestion(parseInt(a.dataset.idx))})})}_selectSuggestion(t){const s=this._suggestions[t];if(s){if(s._word!==void 0){const e=this.searchInput.value,a=e.split(/\s+/).pop(),o=e.slice(0,e.length-a.length);this.searchInput.value=o+s._word+" ",this._closeSuggestions(),this.searchInput.focus();return}if(this._closeSuggestions(),this.currentType.id==="headings"){const e=s.slug||"";this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${s.book_id}/${e}#${s.para_id}`)}else if(this.currentType.id==="pali-def"){const e=s.slug||"";this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${s.book_id}/${e}#${s.para_id}-${s.line_id}`)}}}_closeSuggestions(){this.suggestionsEl.classList.remove("show"),this.suggestionsEl.innerHTML="",this._focusedIdx=-1,this._suggestions=[]}_onKeydown(t){const s=this.suggestionsEl.querySelectorAll(".suggestion-item");if(s.length&&this.suggestionsEl.classList.contains("show")){if(t.key==="ArrowDown"){t.preventDefault(),this._focusedIdx=Math.min(this._focusedIdx+1,s.length-1),this._updateFocused(s);return}if(t.key==="ArrowUp"){t.preventDefault(),this._focusedIdx=Math.max(this._focusedIdx-1,-1),this._updateFocused(s);return}if(t.key==="Enter"&&this._focusedIdx>=0){t.preventDefault(),this._selectSuggestion(this._focusedIdx);return}if(t.key==="Escape"){this._closeSuggestions();return}}t.key==="Enter"&&(t.preventDefault(),this._executeSearch())}_updateFocused(t){t.forEach((s,e)=>s.classList.toggle("focused",e===this._focusedIdx)),this._focusedIdx>=0&&t[this._focusedIdx].scrollIntoView({block:"nearest"})}_bindGoButton(){this.goBtn.addEventListener("click",()=>this._executeSearch())}async _executeSearch(){const t=this.searchInput.value.trim();if(!t)return;this._closeSuggestions();const s=this.currentType;if(s.id==="headings"){this._showResultsLoading();const e=await this._apiFetch(`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(t)}&limit=30`);this._lastResults=e||[],this._lastQuery=t,this._lastType="headings",this._renderHeadingResults(this.bookFilter.filterResults(this._lastResults),t)}else if(s.id==="fulltext")this._ftsPage=1,this._ftsData=null,await this._executeFtsSearch(t);else if(s.id==="pali-def"){this._showResultsLoading();const e=await this._apiFetch(`${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(t)}&lang=${this.lang}&limit=80`);this._lastResults=e||[],this._lastQuery=t,this._lastType="pali-def",this._renderDictResults(this.bookFilter.filterResults(this._lastResults),t)}else if(s.id==="ai"){const e=new URLSearchParams({q:t,mode:"ai"});this._appendFilterParams(e),window.location.href=`${this.baseUrl}/${this.lang}/search?${e}`}}_appendFilterParams(t){const{pitakas:s,layers:e}=this.bookFilter.getFilterParams();s.length&&t.set("pitakas",s.join(",")),e.length&&t.set("layers",e.join(","))}_showResultsLoading(){this.onShowResults(),this.resultsPanel.innerHTML='<div class="hd-loading">Searching…</div>'}_renderHeadingResults(t,s){if(this.onShowResults(),!t.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const e=a=>a.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>");this.resultsPanel.innerHTML=t.map(a=>{const o=a.slug||"",n=`${this.baseUrl}/${this.lang}/book/${a.book_id}/${o}#${a.para_id}`;return`
      <a href="${n}"
         class="search-result-item"
         data-url="${n}">
        <div class="search-result-book">${a.book_name||a.book_id}</div>
        <div class="search-result-heading">${e(a.title||"")}</div>
        <div class="search-result-meta">Paragraph ${a.para_id}</div>
      </a>
    `}).join(""),this.resultsPanel.querySelectorAll(".search-result-item").forEach(a=>{a.addEventListener("click",o=>{o.preventDefault(),this.onResultSelect(a.dataset.url)})})}_renderDictResults(t,s){if(this.onShowResults(),!t.length){this.resultsPanel.innerHTML='<div class="hd-empty">No definitions found.</div>';return}const e=r=>r.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>"),a=new Map;for(const r of t)a.has(r.book_id)||a.set(r.book_id,{book_id:r.book_id,book_name:r.book_name||r.book_id,items:[]}),a.get(r.book_id).items.push(r);const o=a.size,n=t.length;let l=`<div class="dict-results-summary">${n} result${n!==1?"s":""} in ${o} book${o!==1?"s":""}</div>`,d=0;for(const[,r]of a){const c=`dict-group-${d++}`,p=d===1;l+=`
        <div class="dict-book-group ${p?"expanded":""}" id="${c}">
          <button class="dict-book-header" data-group="${c}" aria-expanded="${p}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${r.book_name}</span>
            <span class="dict-book-count">${r.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${r.items.map(u=>{const h=u.slug||"",g=`${this.baseUrl}/${this.lang}/book/${u.book_id}/${h}#${u.para_id}-${u.line_id}`;return`
              <a href="${g}"
                 class="search-result-item dict-entry"
                 data-url="${g}">
                <div class="search-result-heading">${e(u.title||"")}</div>
                ${u.definition_pali?`<div class="search-result-meta pali">${u.definition_pali}</div>`:""}
                ${u.definition_en?`<div class="search-result-meta translation">${u.definition_en}</div>`:""}
              </a>
            `}).join("")}
          </div>
        </div>`}this.resultsPanel.innerHTML=l,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(r=>{r.addEventListener("click",()=>{const c=document.getElementById(r.dataset.group);if(!c)return;const p=c.classList.contains("expanded");c.classList.toggle("expanded",!p),r.setAttribute("aria-expanded",String(!p))})}),this.resultsPanel.querySelectorAll(".search-result-item").forEach(r=>{r.addEventListener("click",c=>{c.preventDefault(),this.onResultSelect(r.dataset.url)})})}async _executeFtsSearch(t,s=null){if(this._ftsLoading)return;this._ftsLoading=!0,s!==null&&(this._ftsPage=s);const e=new URLSearchParams({q:t,page:this._ftsPage,limit:30,lang:this.lang}),{pitakas:a,layers:o}=this.bookFilter.getFilterParams();a.length&&e.set("pitakas",a.join(",")),o.length&&e.set("layers",o.join(",")),this._showResultsLoading();const n=await this._apiFetch(`${this.baseUrl}/api/fts_search?${e}`);if(this._ftsLoading=!1,!n){this.resultsPanel.innerHTML='<div class="hd-empty">Search failed. Please try again.</div>';return}this._ftsData=n,this._ftsWords=n.words||[],this._ftsExpandedBookId=null,this._lastQuery=t,this._lastType="fulltext",this._renderFtsResults(n,t)}_renderFtsResults(t,s){this.onShowResults();const e=t.books||[],a=t.results||[],o=t.total||0,n=t.page||1,l=t.pages||1;if(!o){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}a.length?this._renderFtsFullResults(a,o,n,l,s):this._renderFtsBookSummary(e,o,s)}_renderFtsBookSummary(t,s,e){const a=this._getLayoutMode();let o=`<div class="dict-results-summary1">${s.toLocaleString()} results in ${t.length} book${t.length!==1?"s":""}</div>`;o+='<div class="fts-book-list">';for(const n of t)o+=`
        <div class="fts-book-card-wrap">
          <button class="fts-book-card" data-book-id="${n.book_id}" data-book-name="${this._escapeAttr(n.book_name)}">
            <span class="fts-book-name">${n.book_name}</span>
            <span class="fts-book-count-badge">${n.count.toLocaleString()}</span>
          </button>
          <div class="fts-book-results ${a}" data-book-id="${n.book_id}"></div>
        </div>`;o+="</div>",this.resultsPanel.innerHTML=o,this.resultsPanel.querySelectorAll(".fts-book-card").forEach(n=>{n.addEventListener("click",async()=>{const l=n.dataset.bookId,d=n.dataset.bookName,r=n.closest(".fts-book-card-wrap"),c=r==null?void 0:r.querySelector(".fts-book-results");if(!(!l||!c)){if(l==="undefined"||l==="null"){c.innerHTML="",c.classList.remove("expanded");return}if(this._ftsExpandedBookId===l){n.classList.remove("active"),c.innerHTML="",c.classList.remove("expanded"),this._ftsExpandedBookId=null,this._ftsData=null;return}if(this._ftsExpandedBookId){const p=this.resultsPanel.querySelector(`.fts-book-card[data-book-id="${this._ftsExpandedBookId}"]`),u=p==null?void 0:p.closest(".fts-book-card-wrap");if(p&&p.classList.remove("active"),u){const h=u.querySelector(".fts-book-results");h&&(h.innerHTML="",h.classList.remove("expanded"))}}n.classList.add("active"),c.innerHTML='<div class="hd-loading">Loading…</div>',c.classList.add("expanded"),this._ftsExpandedBookId=l,this._ftsPage=1,this._ftsData=null,await this._loadBookResults(l,d,c),c.scrollIntoView({behavior:"smooth",block:"nearest"})}})})}async _loadBookResults(t,s,e){var d;if(!t||t==="undefined"||t==="null"){console.warn("[FTS] _loadBookResults called with invalid book_id:",t);return}if(!e)return;const a=new URLSearchParams({q:this._lastQuery,book_id:t,page:1,limit:30,lang:this.lang}),{pitakas:o,layers:n}=this.bookFilter.getFilterParams();o.length&&a.set("pitakas",o.join(",")),n.length&&a.set("layers",n.join(","));const l=await this._apiFetch(`${this.baseUrl}/api/fts_search?${a}`);if(!l||!((d=l.results)!=null&&d.length)){e.innerHTML='<div class="hd-empty">No results found for this book.</div>';return}this._ftsData=l,this._renderPerBookView(l,s||t,e)}_renderPerBookView(t,s,e){var c,p;if(!e)return;const a=t.results||[],o=t.total||0,n=t.page||1,l=t.pages||1,d=this._getLayoutMode();let r=`
      <div class="fts-results-header">
        <span class="fts-results-name">${this._escapeHtml(s)}</span>
        <span class="fts-results-count">${o} result${o!==1?"s":""}</span>
      </div>`;for(const u of a)r+=`
        <div class="dict-book-group expanded">
          <div class="dict-book-body" style="display:block">
            ${u.items.map(h=>{const g=h.slug||"",f=`${this.baseUrl}/${this.lang}/book/${h.book_id}/${g}#${h.para_id}`,_=h.lines||[];let b="";for(const y of _){if(!y.matched)continue;b+=`
                  <div class="fts-line-row fts-line-matched${d==="sidebyside"?" side-by-side":""}">
                    <div class="fts-line-pali">${y.pali||""}</div>
                    ${y.translation?`<div class="fts-line-trans">${y.translation}</div>`:""}
                  </div>`}return`
                <a href="${f}" class="search-result-item dict-entry fts-entry" data-url="${f}">
                  <div class="fts-para-meta">Paragraph ${h.para_id}</div>
                  ${b}
                </a>`}).join("")}
          </div>
        </div>`;l>1&&(r+=`
        <div class="fts-pagination">
          <button class="fts-page-btn fts-prev" ${n<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${n} / ${l}</span>
          <button class="fts-page-btn fts-next" ${n>=l?"disabled":""}>Next →</button>
        </div>`),e.innerHTML=r,e.querySelectorAll(".fts-entry").forEach(u=>{u.addEventListener("click",h=>{h.preventDefault(),this.onResultSelect(u.dataset.url)})}),(c=e.querySelector(".fts-prev"))==null||c.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage-1)}),(p=e.querySelector(".fts-next"))==null||p.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage+1)})}_renderFtsFullResults(t,s,e,a,o){var d,r,c,p,u;let n=`<div class="dict-results-summary1">${s.toLocaleString()} result${s!==1?"s":""}`;t.length>1&&((r=(d=this._ftsData)==null?void 0:d.books)==null?void 0:r.length)>1&&(n+=' &mdash; <button class="fts-back-btn" id="fts-back-summary">← Back to all books</button>'),n+="</div>";let l=0;for(const h of t){const g=`fts-group-${l++}`,f=l===1;n+=`
        <div class="dict-book-group ${f?"expanded":""}" id="${g}">
          <button class="dict-book-header" data-group="${g}" aria-expanded="${f}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${h.book_name}</span>
            <span class="dict-book-count">${h.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${h.items.map(_=>{const b=_.slug||"",y=`${this.baseUrl}/${this.lang}/book/${_.book_id}/${b}#${_.para_id}`,m=_.lines||[];let $="";for(const k of m)k.matched&&($+=`
                  <div class="fts-line-row fts-line-matched">
                    <div class="fts-line-pali">${k.pali||""}</div>
                    ${k.translation?`<div class="fts-line-trans">${k.translation}</div>`:""}
                  </div>`);return`
                <a href="${y}" class="search-result-item dict-entry fts-entry" data-url="${y}">
                  <div class="fts-para-meta">Paragraph ${_.para_id}</div>
                  ${$}
                </a>`}).join("")}
          </div>
        </div>`}a>1&&(n+=`
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${e<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${e} / ${a}</span>
          <button class="fts-page-btn" id="fts-next" ${e>=a?"disabled":""}>Next →</button>
        </div>`),this.resultsPanel.innerHTML=n,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(h=>{h.addEventListener("click",()=>{const g=document.getElementById(h.dataset.group);if(!g)return;const f=g.classList.contains("expanded");g.classList.toggle("expanded",!f),h.setAttribute("aria-expanded",String(!f))})}),this.resultsPanel.querySelectorAll(".fts-entry").forEach(h=>{h.addEventListener("click",g=>{g.preventDefault(),this.onResultSelect(h.dataset.url)})}),(c=this.resultsPanel.querySelector("#fts-prev"))==null||c.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage-1)}),(p=this.resultsPanel.querySelector("#fts-next"))==null||p.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage+1)}),(u=this.resultsPanel.querySelector("#fts-back-summary"))==null||u.addEventListener("click",()=>{this._renderFtsBookSummary(this._ftsData.books,this._ftsData.total,this._lastQuery)})}async _handleFtsPage(t){var d,r;const s=this._ftsExpandedBookId;if(!s)return;const e=this.resultsPanel.querySelector(".fts-book-results.expanded");if(!e)return;e.innerHTML='<div class="hd-loading">Loading…</div>';const a=new URLSearchParams({q:this._lastQuery,book_id:s,page:t,limit:30,lang:this.lang}),{pitakas:o,layers:n}=this.bookFilter.getFilterParams();o.length&&a.set("pitakas",o.join(",")),n.length&&a.set("layers",n.join(","));const l=await this._apiFetch(`${this.baseUrl}/api/fts_search?${a}`);if(l&&((d=l.results)!=null&&d.length)){this._ftsData=l,this._ftsPage=t;const c=(r=e.closest(".fts-book-card-wrap"))==null?void 0:r.querySelector(".fts-book-card"),p=(c==null?void 0:c.dataset.bookName)||s;this._renderPerBookView(l,p,e)}}async _apiFetch(t){try{return await(await fetch(t)).json()}catch{return null}}_getLayoutMode(){try{return JSON.parse(localStorage.getItem("epitaka_settings_v3")||"{}").layout==="sidebyside"?"sidebyside":"stacked"}catch{return"stacked"}}_escapeHtml(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}_escapeAttr(t){return t?t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}}function S(i){return i.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function q(i){return String(i??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const I="epika_cookie_consent";function T(i){if(!i||document.getElementById("ga-script"))return;window.dataLayer=window.dataLayer||[];function t(){window.dataLayer.push(arguments)}window.gtag=t,t("js",new Date),t("consent","default",{analytics_storage:"denied",ad_storage:"denied"});const s=document.createElement("script");s.id="ga-script",s.async=!0,s.src=`https://www.googletagmanager.com/gtag/js?id=${i}`,s.onload=()=>{t("config",i,{anonymize_ip:!0,cookie_flags:"SameSite=None;Secure"}),t("consent","update",{analytics_storage:"granted"})},document.head.appendChild(s)}function D(i,t){const s=document.createElement("div");s.className="cc-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Cookie consent"),s.innerHTML=`
    <div class="cc-banner">
      <div class="cc-body">
        <div class="cc-title">🍪 Privacy &amp; Cookies</div>
        <div class="cc-text">
          We use Google Analytics to understand how visitors use this site —
          which pages are popular, how people navigate. This helps us improve
          the experience. No personally identifiable information is collected.
          <a href="/privacy">Read our privacy policy</a>.
        </div>
      </div>

      <div class="cc-settings" id="cc-settings">
        <div class="cc-setting-row">
          <div>
            <div class="cc-setting-label">Google Analytics</div>
            <div class="cc-setting-desc">Anonymised usage statistics</div>
          </div>
          <label class="cc-toggle">
            <input type="checkbox" id="cc-analytics-toggle" checked>
            <span class="cc-toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="cc-actions">
        <button type="button" class="cc-btn cc-btn-accept" id="cc-accept">
          Accept
        </button>
        <button type="button" class="cc-btn cc-btn-reject" id="cc-reject">
          Reject
        </button>
        <button type="button" class="cc-btn cc-btn-settings" id="cc-settings-btn">
          Settings
        </button>
      </div>
    </div>
  `,document.body.appendChild(s);const e=s.querySelector("#cc-accept"),a=s.querySelector("#cc-reject"),o=s.querySelector("#cc-settings-btn"),n=s.querySelector("#cc-settings"),l=s.querySelector("#cc-analytics-toggle");return e.addEventListener("click",()=>{const d=l.checked;L({analytics:d}),s.classList.add("hidden"),d&&i()}),a.addEventListener("click",()=>{L({analytics:!1}),s.classList.add("hidden")}),o.addEventListener("click",()=>{n.classList.toggle("open"),o.textContent=n.classList.contains("open")?"Hide settings":"Settings"}),s.addEventListener("click",d=>{d.target===s&&(L({analytics:!1}),s.classList.add("hidden"))}),document.addEventListener("keydown",d=>{d.key==="Escape"&&!s.classList.contains("hidden")&&(L({analytics:!1}),s.classList.add("hidden"))}),s}function L(i){try{localStorage.setItem(I,JSON.stringify({...i,timestamp:Date.now(),version:1}))}catch{}}function U(){try{const i=localStorage.getItem(I);return i?JSON.parse(i):null}catch{return null}}function O({gaId:i}={}){const t=U();if(t){t.analytics&&i&&T(i);return}D(()=>{i&&T(i)})}export{H,v as S,N as a,W as b,O as c,A as i,j as r};

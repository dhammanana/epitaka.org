import{i as A}from"./pali_typing.chunk.js";const T=[{id:"sutta",label:"Sutta",match:c=>{var e;return(e=c.nikaya)==null?void 0:e.includes("Sutta")}},{id:"vinaya",label:"Vinaya",match:c=>{var e;return(e=c.nikaya)==null?void 0:e.includes("Vinaya")}},{id:"abhidhamma",label:"Abhidhamma",match:c=>{var e;return(e=c.nikaya)==null?void 0:e.includes("Abhidhamma")}},{id:"anna",label:"Añña",match:c=>c.category==="Añña"}],x=[{id:"mula",label:"Mūla",match:c=>c.category==="Mūla"},{id:"attha",label:"Aṭṭhakathā",match:c=>c.category==="Aṭṭhakathā"},{id:"tika",label:"Ṭīkā",match:c=>c.category==="Ṭīkā"}];class M{constructor(e,{onChange:s}={}){this.hierarchy=e,this.onChange=s||(()=>{}),this._pitakas=new Set,this._layers=new Set,this._el=null}getActiveBookIds(){const e=this._pitakas.size>0,s=this._layers.size>0;if(!e&&!s)return null;const t=new Set;for(const[i,a]of Object.entries(this.hierarchy)){const o=!e||T.filter(d=>this._pitakas.has(d.id)).some(d=>d.match(a)),l=!s||x.filter(d=>this._layers.has(d.id)).some(d=>d.match(a));o&&l&&t.add(i)}return t}filterResults(e){const s=this.getActiveBookIds();return s?e.filter(t=>s.has(t.book_id)):e}getFilterParams(){return{pitakas:[...this._pitakas],layers:[...this._layers]}}mount(e){this._el=document.createElement("div"),this._el.className="book-filter",this._el.innerHTML=this._buildHTML(),e.appendChild(this._el),this._bindEvents()}unmount(){this._el&&(this._el.remove(),this._el=null)}refresh(){this._el&&(this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.classList.toggle("active",this._pitakas.has(e.dataset.id))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.classList.toggle("active",this._layers.has(e.dataset.id))}),this._updateClearBtn())}_buildHTML(){const e=T.map(t=>`<button class="bf-chip" data-group="pitaka" data-id="${t.id}">${t.label}</button>`).join(""),s=x.map(t=>`<button class="bf-chip" data-group="layer" data-id="${t.id}">${t.label}</button>`).join("");return`
      <div class="bf-row">
        <span class="bf-label">Piṭaka</span>
        <div class="bf-chips" id="bf-pitaka-chips">${e}</div>
      </div>
      <div class="bf-row">
        <span class="bf-label">Group</span>
        <div class="bf-chips" id="bf-layer-chips">${s}</div>
      </div>
      <button class="bf-clear" id="bf-clear-btn" style="display:none">✕ Clear filters</button>
    `}_bindEvents(){this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._pitakas,e))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._layers,e))}),this._el.querySelector("#bf-clear-btn").addEventListener("click",()=>{this._pitakas.clear(),this._layers.clear(),this.refresh(),this.onChange()})}_toggle(e,s){const t=s.dataset.id;e.has(t)?(e.delete(t),s.classList.remove("active")):(e.add(t),s.classList.add("active")),this._updateClearBtn(),this.onChange()}_updateClearBtn(){var t;const e=(t=this._el)==null?void 0:t.querySelector("#bf-clear-btn");if(!e)return;const s=this._pitakas.size>0||this._layers.size>0;e.style.display=s?"inline-flex":"none"}}const k=[{id:"headings",icon:"☰",label:"Search Headings",desc:"Find by section titles",placeholder:"Search section headings…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"fulltext",icon:"🔍",label:"Full Text",desc:"Search Pāli & translations",placeholder:"Type words to search…",hasAutocomplete:!0,hasFtsOptions:!1,autocompleteMode:"word"},{id:"pali-def",icon:"📖",label:"Pāli Definitions",desc:"Look up Pāli dictionary",placeholder:"Search Pāli word…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"ai",icon:"✨",label:"AI Search",desc:"Semantic meaning search",placeholder:"Ask a question…",hasAutocomplete:!1,hasFtsOptions:!1}];class q{constructor({baseUrl:e,lang:s,initialState:t={},hierarchy:i={},onResultSelect:a,onShowResults:o,onShowBooks:l}){this.baseUrl=e,this.lang=s,this.hierarchy=i,this.onResultSelect=a,this.onShowResults=o,this.onShowBooks=l;const d=k.find(n=>n.id===t.searchTypeId);this.currentType=d??k[0],this._acDebounce=null,this._acController=null,this._focusedIdx=-1,this._suggestions=[],this.bookFilter=new M(i,{onChange:()=>this._onFilterChange()}),this.typeBtn=null,this.typeMenu=null,this.searchInput=null,this.suggestionsEl=null,this.goBtn=null,this.resultsPanel=null,this.filterWrap=null,this._lastResults=null,this._lastQuery="",this._lastType=null,this._ftsData=null,this._ftsPage=1,this._ftsTotalPages=1,this._ftsWords=[],this._ftsLoading=!1,this._ftsExpandedBookId=null}bind(){this.typeBtn=document.getElementById("search-type-btn"),this.typeMenu=document.getElementById("search-type-menu"),this.searchInput=document.getElementById("home-search-input"),this.suggestionsEl=document.getElementById("home-suggestions"),this.goBtn=document.getElementById("home-search-go"),this.resultsPanel=document.getElementById("home-results-panel"),this.filterWrap=document.getElementById("home-filter-wrap"),this._bindTypeDropdown(),this._bindInput(),this._bindGoButton(),this.filterWrap&&this.bookFilter.mount(this.filterWrap),this._applyTypeUI(this.currentType)}_bindTypeDropdown(){this.typeBtn.addEventListener("click",e=>{e.stopPropagation(),this._toggleTypeMenu()}),this.typeMenu.querySelectorAll(".search-type-option").forEach(e=>{e.addEventListener("click",()=>{const s=k.find(t=>t.id===e.dataset.type);s&&this._selectType(s)})}),document.addEventListener("click",()=>this._closeTypeMenu())}_toggleTypeMenu(){this.typeMenu.classList.contains("show")?this._closeTypeMenu():this._openTypeMenu()}_openTypeMenu(){this._positionBelow(this.typeBtn,this.typeMenu),this.typeMenu.classList.add("show"),this.typeBtn.classList.add("open")}_closeTypeMenu(){this.typeMenu.classList.remove("show"),this.typeBtn.classList.remove("open")}_positionBelow(e,s){const t=e.getBoundingClientRect();s.style.top=`${t.bottom+4}px`,s.style.left=`${t.left}px`,s.style.maxWidth=`${window.innerWidth-t.left-8}px`}_selectType(e){this.currentType=e,this._lastResults=null,this._applyTypeUI(e),this._closeTypeMenu(),this._closeSuggestions(),this.searchInput.value="",this.searchInput.focus(),this.resultsPanel&&(this.resultsPanel.innerHTML="",this.resultsPanel.classList.remove("active")),this.onShowBooks()}_applyTypeUI(e){this.typeBtn.innerHTML=`<span>${e.icon} ${e.label}</span><span class="arrow">▾</span>`,this.searchInput.placeholder=e.placeholder,this.typeMenu.querySelectorAll(".search-type-option").forEach(s=>{s.classList.toggle("selected",s.dataset.type===e.id)})}_onFilterChange(){if(!(!this._lastResults||!this._lastQuery)){if(this._lastType==="headings"){const e=this.bookFilter.filterResults(this._lastResults);this._renderHeadingResults(e,this._lastQuery)}else if(this._lastType==="pali-def"){const e=this.bookFilter.filterResults(this._lastResults);this._renderDictResults(e,this._lastQuery)}}}_bindInput(){this.searchInput.addEventListener("input",()=>this._onInput()),this.searchInput.addEventListener("keydown",e=>this._onKeydown(e)),this.searchInput.addEventListener("blur",()=>{setTimeout(()=>this._closeSuggestions(),160)}),this.removePaliHandler=A(this.searchInput,{mode:"both",onConvert:e=>{const s=e.trim();if(!s){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(s),220))}})}_onInput(){const e=this.searchInput.value.trim();if(!e){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(e),220))}async _fetchSuggestions(e){this._acController&&this._acController.abort(),this._acController=new AbortController,this._showSuggestionsLoading();try{let s;if(this.currentType.id==="headings")s=`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.id==="pali-def")s=`${this.baseUrl}/api/bold_suggest?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.autocompleteMode==="word"){const a=e.split(/\s+/).pop();if(!a){this._closeSuggestions();return}s=`${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(a)}&limit=10`}else return;const i=await(await fetch(s,{signal:this._acController.signal})).json();if(this.currentType.autocompleteMode==="word")this._renderWordSuggestions(i,e);else{const a=this.bookFilter.filterResults(i);this._renderSuggestions(a,e)}}catch(s){s.name!=="AbortError"&&this._closeSuggestions()}}_renderWordSuggestions(e,s){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(e!=null&&e.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No suggestions</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e.map(o=>({_word:o})),this._focusedIdx=-1;const t=s.split(/\s+/).pop(),i=s.slice(0,s.length-t.length),a=o=>o.replace(new RegExp(`^(${S(t)})`,"i"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((o,l)=>`<div class="suggestion-item suggestion-word" data-idx="${l}" tabindex="-1">
        <span class="sug-pali">${a(o)}</span>
      </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-word").forEach(o=>{o.addEventListener("mousedown",l=>{var n;l.preventDefault();const d=(n=this._suggestions[parseInt(o.dataset.idx)])==null?void 0:n._word;d&&(this.searchInput.value=i+d+" ",this._closeSuggestions(),this.searchInput.focus())})})}_showSuggestionsLoading(){this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,this.suggestionsEl.innerHTML='<div class="suggestion-loading">Searching…</div>',this.suggestionsEl.classList.add("show"),this._focusedIdx=-1,this._suggestions=[]}_renderSuggestions(e,s){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(e!=null&&e.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No results</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e,this._focusedIdx=-1;const t=i=>i.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((i,a)=>this.currentType.id==="headings"?`<div class="suggestion-item" data-idx="${a}" tabindex="-1">
          <span class="sug-pali">${t(i.title||"")}</span>
          <span class="sug-book">${i.book_name||i.book_id||""}</span>
          <span class="sug-para">#${i.para_id||""}</span>
        </div>`:`<div class="suggestion-item" data-idx="${a}" tabindex="-1">
          <span class="sug-pali">${t(i.word||i.title||"")}</span>
          <span class="sug-book">${i.definition_short||""}</span>
        </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-item").forEach(i=>{i.addEventListener("mousedown",a=>{a.preventDefault(),this._selectSuggestion(parseInt(i.dataset.idx))})})}_selectSuggestion(e){const s=this._suggestions[e];if(s){if(s._word!==void 0){const t=this.searchInput.value,i=t.split(/\s+/).pop(),a=t.slice(0,t.length-i.length);this.searchInput.value=a+s._word+" ",this._closeSuggestions(),this.searchInput.focus();return}if(this._closeSuggestions(),this.currentType.id==="headings"){const t=s.slug||"";this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${s.book_id}/${t}#${s.para_id}`)}else if(this.currentType.id==="pali-def"){const t=s.slug||"";this.onResultSelect(`${this.baseUrl}/${this.lang}/book/${s.book_id}/${t}#${s.para_id}-${s.line_id}`)}}}_closeSuggestions(){this.suggestionsEl.classList.remove("show"),this.suggestionsEl.innerHTML="",this._focusedIdx=-1,this._suggestions=[]}_onKeydown(e){const s=this.suggestionsEl.querySelectorAll(".suggestion-item");if(s.length&&this.suggestionsEl.classList.contains("show")){if(e.key==="ArrowDown"){e.preventDefault(),this._focusedIdx=Math.min(this._focusedIdx+1,s.length-1),this._updateFocused(s);return}if(e.key==="ArrowUp"){e.preventDefault(),this._focusedIdx=Math.max(this._focusedIdx-1,-1),this._updateFocused(s);return}if(e.key==="Enter"&&this._focusedIdx>=0){e.preventDefault(),this._selectSuggestion(this._focusedIdx);return}if(e.key==="Escape"){this._closeSuggestions();return}}e.key==="Enter"&&(e.preventDefault(),this._executeSearch())}_updateFocused(e){e.forEach((s,t)=>s.classList.toggle("focused",t===this._focusedIdx)),this._focusedIdx>=0&&e[this._focusedIdx].scrollIntoView({block:"nearest"})}_bindGoButton(){this.goBtn.addEventListener("click",()=>this._executeSearch())}async _executeSearch(){const e=this.searchInput.value.trim();if(!e)return;this._closeSuggestions();const s=this.currentType;if(s.id==="headings"){this._showResultsLoading();const t=await this._apiFetch(`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=30`);this._lastResults=t||[],this._lastQuery=e,this._lastType="headings",this._renderHeadingResults(this.bookFilter.filterResults(this._lastResults),e)}else if(s.id==="fulltext")this._ftsPage=1,this._ftsData=null,await this._executeFtsSearch(e);else if(s.id==="pali-def"){this._showResultsLoading();const t=await this._apiFetch(`${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(e)}&lang=${this.lang}&limit=80`);this._lastResults=t||[],this._lastQuery=e,this._lastType="pali-def",this._renderDictResults(this.bookFilter.filterResults(this._lastResults),e)}else if(s.id==="ai"){const t=new URLSearchParams({q:e,mode:"ai"});this._appendFilterParams(t),window.location.href=`${this.baseUrl}/${this.lang}/search?${t}`}}_appendFilterParams(e){const{pitakas:s,layers:t}=this.bookFilter.getFilterParams();s.length&&e.set("pitakas",s.join(",")),t.length&&e.set("layers",t.join(","))}_showResultsLoading(){this.onShowResults(),this.resultsPanel.innerHTML='<div class="hd-loading">Searching…</div>'}_renderHeadingResults(e,s){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const t=i=>i.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>");this.resultsPanel.innerHTML=e.map(i=>{const a=i.slug||"",o=`${this.baseUrl}/${this.lang}/book/${i.book_id}/${a}#${i.para_id}`;return`
      <a href="${o}"
         class="search-result-item"
         data-url="${o}">
        <div class="search-result-book">${i.book_name||i.book_id}</div>
        <div class="search-result-heading">${t(i.title||"")}</div>
        <div class="search-result-meta">Paragraph ${i.para_id}</div>
      </a>
    `}).join(""),this.resultsPanel.querySelectorAll(".search-result-item").forEach(i=>{i.addEventListener("click",a=>{a.preventDefault(),this.onResultSelect(i.dataset.url)})})}_renderDictResults(e,s){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No definitions found.</div>';return}const t=n=>n.replace(new RegExp(`(${S(s)})`,"gi"),"<mark>$1</mark>"),i=new Map;for(const n of e)i.has(n.book_id)||i.set(n.book_id,{book_id:n.book_id,book_name:n.book_name||n.book_id,items:[]}),i.get(n.book_id).items.push(n);const a=i.size,o=e.length;let l=`<div class="dict-results-summary">${o} result${o!==1?"s":""} in ${a} book${a!==1?"s":""}</div>`,d=0;for(const[,n]of i){const h=`dict-group-${d++}`,f=d===1;l+=`
        <div class="dict-book-group ${f?"expanded":""}" id="${h}">
          <button class="dict-book-header" data-group="${h}" aria-expanded="${f}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${n.book_name}</span>
            <span class="dict-book-count">${n.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${n.items.map(u=>{const p=u.slug||"",b=`${this.baseUrl}/${this.lang}/book/${u.book_id}/${p}#${u.para_id}-${u.line_id}`;return`
              <a href="${b}"
                 class="search-result-item dict-entry"
                 data-url="${b}">
                <div class="search-result-heading">${t(u.title||"")}</div>
                ${u.definition_pali?`<div class="search-result-meta pali">${u.definition_pali}</div>`:""}
                ${u.definition_en?`<div class="search-result-meta translation">${u.definition_en}</div>`:""}
              </a>
            `}).join("")}
          </div>
        </div>`}this.resultsPanel.innerHTML=l,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(n=>{n.addEventListener("click",()=>{const h=document.getElementById(n.dataset.group);if(!h)return;const f=h.classList.contains("expanded");h.classList.toggle("expanded",!f),n.setAttribute("aria-expanded",String(!f))})}),this.resultsPanel.querySelectorAll(".search-result-item").forEach(n=>{n.addEventListener("click",h=>{h.preventDefault(),this.onResultSelect(n.dataset.url)})})}async _executeFtsSearch(e,s=null){if(this._ftsLoading)return;this._ftsLoading=!0,s!==null&&(this._ftsPage=s);const t=new URLSearchParams({q:e,page:this._ftsPage,limit:30,lang:this.lang}),{pitakas:i,layers:a}=this.bookFilter.getFilterParams();i.length&&t.set("pitakas",i.join(",")),a.length&&t.set("layers",a.join(",")),this._showResultsLoading();const o=await this._apiFetch(`${this.baseUrl}/api/fts_search?${t}`);if(this._ftsLoading=!1,!o){this.resultsPanel.innerHTML='<div class="hd-empty">Search failed. Please try again.</div>';return}this._ftsData=o,this._ftsWords=o.words||[],this._ftsExpandedBookId=null,this._lastQuery=e,this._lastType="fulltext",this._renderFtsResults(o,e)}_renderFtsResults(e,s){this.onShowResults();const t=e.books||[],i=e.results||[],a=e.total||0,o=e.page||1,l=e.pages||1;if(!a){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}i.length?this._renderFtsFullResults(i,a,o,l,s):this._renderFtsBookSummary(t,a,s)}_renderFtsBookSummary(e,s,t){const i=this._getLayoutMode();let a=`<div class="dict-results-summary1">${s.toLocaleString()} results in ${e.length} book${e.length!==1?"s":""}</div>`;a+='<div class="fts-book-list">';for(const o of e)a+=`
        <div class="fts-book-card-wrap">
          <button class="fts-book-card" data-book-id="${o.book_id}" data-book-name="${this._escapeAttr(o.book_name)}">
            <span class="fts-book-name">${o.book_name}</span>
            <span class="fts-book-count-badge">${o.count.toLocaleString()}</span>
          </button>
          <div class="fts-book-results ${i}" data-book-id="${o.book_id}"></div>
        </div>`;a+="</div>",this.resultsPanel.innerHTML=a,this.resultsPanel.querySelectorAll(".fts-book-card").forEach(o=>{o.addEventListener("click",async()=>{const l=o.dataset.bookId,d=o.dataset.bookName,n=o.closest(".fts-book-card-wrap"),h=n==null?void 0:n.querySelector(".fts-book-results");if(!(!l||!h)){if(l==="undefined"||l==="null"){h.innerHTML="",h.classList.remove("expanded");return}if(this._ftsExpandedBookId===l){o.classList.remove("active"),h.innerHTML="",h.classList.remove("expanded"),this._ftsExpandedBookId=null,this._ftsData=null;return}if(this._ftsExpandedBookId){const f=this.resultsPanel.querySelector(`.fts-book-card[data-book-id="${this._ftsExpandedBookId}"]`),u=f==null?void 0:f.closest(".fts-book-card-wrap");if(f&&f.classList.remove("active"),u){const p=u.querySelector(".fts-book-results");p&&(p.innerHTML="",p.classList.remove("expanded"))}}o.classList.add("active"),h.innerHTML='<div class="hd-loading">Loading…</div>',h.classList.add("expanded"),this._ftsExpandedBookId=l,this._ftsPage=1,this._ftsData=null,await this._loadBookResults(l,d,h),h.scrollIntoView({behavior:"smooth",block:"nearest"})}})})}async _loadBookResults(e,s,t){var d;if(!e||e==="undefined"||e==="null"){console.warn("[FTS] _loadBookResults called with invalid book_id:",e);return}if(!t)return;const i=new URLSearchParams({q:this._lastQuery,book_id:e,page:1,limit:30,lang:this.lang}),{pitakas:a,layers:o}=this.bookFilter.getFilterParams();a.length&&i.set("pitakas",a.join(",")),o.length&&i.set("layers",o.join(","));const l=await this._apiFetch(`${this.baseUrl}/api/fts_search?${i}`);if(!l||!((d=l.results)!=null&&d.length)){t.innerHTML='<div class="hd-empty">No results found for this book.</div>';return}this._ftsData=l,this._renderPerBookView(l,s||e,t)}_renderPerBookView(e,s,t){var h,f;if(!t)return;const i=e.results||[],a=e.total||0,o=e.page||1,l=e.pages||1,d=this._getLayoutMode();let n=`
      <div class="fts-results-header">
        <span class="fts-results-name">${this._escapeHtml(s)}</span>
        <span class="fts-results-count">${a} result${a!==1?"s":""}</span>
      </div>`;for(const u of i)n+=`
        <div class="dict-book-group expanded">
          <div class="dict-book-body" style="display:block">
            ${u.items.map(p=>{const b=p.slug||"",_=`${this.baseUrl}/${this.lang}/book/${p.book_id}/${b}#${p.para_id}`,r=p.lines||[];let g="";for(const m of r){if(!m.matched)continue;g+=`
                  <div class="fts-line-row fts-line-matched${d==="sidebyside"?" side-by-side":""}">
                    <div class="fts-line-pali">${m.pali||""}</div>
                    ${m.translation?`<div class="fts-line-trans">${m.translation}</div>`:""}
                  </div>`}return`
                <a href="${_}" class="search-result-item dict-entry fts-entry" data-url="${_}">
                  <div class="fts-para-meta">Paragraph ${p.para_id}</div>
                  ${g}
                </a>`}).join("")}
          </div>
        </div>`;l>1&&(n+=`
        <div class="fts-pagination">
          <button class="fts-page-btn fts-prev" ${o<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${o} / ${l}</span>
          <button class="fts-page-btn fts-next" ${o>=l?"disabled":""}>Next →</button>
        </div>`),t.innerHTML=n,t.querySelectorAll(".fts-entry").forEach(u=>{u.addEventListener("click",p=>{p.preventDefault(),this.onResultSelect(u.dataset.url)})}),(h=t.querySelector(".fts-prev"))==null||h.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage-1)}),(f=t.querySelector(".fts-next"))==null||f.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage+1)})}_renderFtsFullResults(e,s,t,i,a){var d,n,h,f,u;let o=`<div class="dict-results-summary1">${s.toLocaleString()} result${s!==1?"s":""}`;e.length>1&&((n=(d=this._ftsData)==null?void 0:d.books)==null?void 0:n.length)>1&&(o+=' &mdash; <button class="fts-back-btn" id="fts-back-summary">← Back to all books</button>'),o+="</div>";let l=0;for(const p of e){const b=`fts-group-${l++}`,_=l===1;o+=`
        <div class="dict-book-group ${_?"expanded":""}" id="${b}">
          <button class="dict-book-header" data-group="${b}" aria-expanded="${_}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${p.book_name}</span>
            <span class="dict-book-count">${p.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${p.items.map(r=>{const g=r.slug||"",m=`${this.baseUrl}/${this.lang}/book/${r.book_id}/${g}#${r.para_id}`,y=r.lines||[];let $="";for(const v of y)v.matched&&($+=`
                  <div class="fts-line-row fts-line-matched">
                    <div class="fts-line-pali">${v.pali||""}</div>
                    ${v.translation?`<div class="fts-line-trans">${v.translation}</div>`:""}
                  </div>`);return`
                <a href="${m}" class="search-result-item dict-entry fts-entry" data-url="${m}">
                  <div class="fts-para-meta">Paragraph ${r.para_id}</div>
                  ${$}
                </a>`}).join("")}
          </div>
        </div>`}i>1&&(o+=`
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${t<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${t} / ${i}</span>
          <button class="fts-page-btn" id="fts-next" ${t>=i?"disabled":""}>Next →</button>
        </div>`),this.resultsPanel.innerHTML=o,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(p=>{p.addEventListener("click",()=>{const b=document.getElementById(p.dataset.group);if(!b)return;const _=b.classList.contains("expanded");b.classList.toggle("expanded",!_),p.setAttribute("aria-expanded",String(!_))})}),this.resultsPanel.querySelectorAll(".fts-entry").forEach(p=>{p.addEventListener("click",b=>{b.preventDefault(),this.onResultSelect(p.dataset.url)})}),(h=this.resultsPanel.querySelector("#fts-prev"))==null||h.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage-1)}),(f=this.resultsPanel.querySelector("#fts-next"))==null||f.addEventListener("click",()=>{this._handleFtsPage(this._ftsPage+1)}),(u=this.resultsPanel.querySelector("#fts-back-summary"))==null||u.addEventListener("click",()=>{this._renderFtsBookSummary(this._ftsData.books,this._ftsData.total,this._lastQuery)})}async _handleFtsPage(e){var d,n;const s=this._ftsExpandedBookId;if(!s)return;const t=this.resultsPanel.querySelector(".fts-book-results.expanded");if(!t)return;t.innerHTML='<div class="hd-loading">Loading…</div>';const i=new URLSearchParams({q:this._lastQuery,book_id:s,page:e,limit:30,lang:this.lang}),{pitakas:a,layers:o}=this.bookFilter.getFilterParams();a.length&&i.set("pitakas",a.join(",")),o.length&&i.set("layers",o.join(","));const l=await this._apiFetch(`${this.baseUrl}/api/fts_search?${i}`);if(l&&((d=l.results)!=null&&d.length)){this._ftsData=l,this._ftsPage=e;const h=(n=t.closest(".fts-book-card-wrap"))==null?void 0:n.querySelector(".fts-book-card"),f=(h==null?void 0:h.dataset.bookName)||s;this._renderPerBookView(l,f,t)}}async _apiFetch(e){try{return await(await fetch(e)).json()}catch{return null}}_getLayoutMode(){try{return JSON.parse(localStorage.getItem("epitaka_settings_v3")||"{}").layout==="sidebyside"?"sidebyside":"stacked"}catch{return"stacked"}}_escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}_escapeAttr(e){return e?e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}}function S(c){return c.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function F(c,e){if(!e)return c;const s=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return c.replace(new RegExp(`(${s})`,"gi"),"<mark>$1</mark>")}const B=["Mūla","Aṭṭhakathā","Ṭīkā"],H=["Vinaya","Suttanta","Sutta","Abhidhamma"];class C{constructor({baseUrl:e,lang:s,menu:t,onNavigate:i}){this.baseUrl=e,this.lang=s,this.menu=t,this.onNavigate=i,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),s=e.map((i,a)=>`
      <button class="home-tab${a===0?" active":""}"
              data-tab="${a}" type="button">${i.label}</button>
    `).join(""),t=e.map((i,a)=>`
      <div class="home-tab-panel${a===0?" active":""}" data-panel="${a}">
        ${this._buildCategoryHTML(i)}
      </div>
    `).join("");return`
      <div id="home-tabs">${s}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${t}
        <div id="home-filter-wrap"></div>
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),s=document.querySelectorAll(".home-tab-panel");e.forEach(t=>{t.addEventListener("click",()=>{var a;const i=parseInt(t.dataset.tab);e.forEach(o=>o.classList.toggle("active",o===t)),s.forEach(o=>o.classList.toggle("active",parseInt(o.dataset.panel)===i)),(a=document.getElementById("home-results-panel"))==null||a.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(t=>{t.addEventListener("click",()=>{var i;t.classList.toggle("open"),(i=t.nextElementSibling)==null||i.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(t=>{t.addEventListener("click",i=>{i.preventDefault(),this.onNavigate(t.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(s=>{s.querySelectorAll(".book-entry").forEach(t=>{var o,l;const i=((l=(o=t.querySelector(".book-name"))==null?void 0:o.textContent)==null?void 0:l.toLowerCase())||"",a=!this._filterText||i.includes(this._filterText);if(t.style.display=a?"":"none",this._filterText&&a){const d=t.querySelector(".book-name");d&&(d.innerHTML=F(d.textContent,this._filterText))}}),s.querySelectorAll(".book-nikaya").forEach(t=>{var a,o;const i=[...t.querySelectorAll(".book-entry")].some(l=>l.style.display!=="none");t.style.display=i?"":"none",this._filterText&&((a=t.querySelector(".book-nikaya-title"))==null||a.classList.add("open"),(o=t.querySelector(".book-nikaya-list"))==null||o.classList.add("open"))}),s.querySelectorAll(".book-category").forEach(t=>{const i=[...t.querySelectorAll(".book-entry")].some(a=>a.style.display!=="none");t.style.display=i?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const s=e.querySelector(".book-name");s&&(s.textContent=s.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...B.filter(t=>e.includes(t)),...e.filter(t=>!B.includes(t))].map(t=>({label:t,data:this.menu[t]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((t,i)=>{const a=o=>{const l=H.findIndex(d=>o.includes(d));return l===-1?99:l};return a(t)-a(i)}).map(t=>`
      <div class="book-category">
        <div class="book-category-title">${t}</div>
        <div class="book-category-content">
          ${this._renderNikaya(e[t])}
        </div>
      </div>
    `).join("")}_renderNikaya(e){if(!e||typeof e!="object")return"";const s=[];return e[""]&&s.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(e[""])}
          </ol>
        </div>
      `),Object.entries(e).forEach(([t,i])=>{t!==""&&s.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${t}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(i)}
          </ol>
        </div>
      `)}),s.join("")}_buildBookList(e){return Array.isArray(e)?e.map(([s,t],i)=>`
      <li>
        <a href="${this.baseUrl}/${this.lang}/book/${s}"
           class="book-entry"
           data-book-id="${s}">
          <span class="book-num">${i+1}.</span>
          <span class="book-name">${t}</span>
        </a>
      </li>
    `).join(""):""}}class D{constructor(e,s){this._key=e,this._defaults=s,this._data=this._load()}get(e){return this._data[e]}set(e,s){this._data[e]=s,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function j({triggerSelector:c,baseUrl:e,lang:s,menu:t}){var _;if(document.getElementById("home-dialog-overlay"))return;const i=document.querySelector(c);if(!i){console.warn("[HomeDialog] trigger not found:",c);return}const a=new D("homeDialog_state",{searchQuery:"",searchTypeId:((_=k[0])==null?void 0:_.id)??"",activeTabId:null}),o=O(t),l=new C({baseUrl:e,lang:s,menu:t,onNavigate:r=>{u(),window.location.href=r}}),d=new q({baseUrl:e,lang:s,hierarchy:o,initialState:{searchTypeId:a.get("searchTypeId")},onResultSelect:r=>{u(),window.location.href=r},onShowResults:()=>p(),onShowBooks:()=>b()}),n=document.createElement("div");n.id="home-dialog-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Browse books"),n.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        <div id="home-search-row">
          <div style="position:relative">
            <button id="search-type-btn" type="button" aria-haspopup="true">
              <span>${U(a.get("searchTypeId"))}</span>
              <span class="arrow">▾</span>
            </button>
            <div id="search-type-menu" role="listbox">
              ${k.map(r=>`
                <div class="search-type-option${r.id===a.get("searchTypeId")?" selected":""}"
                     data-type="${r.id}" role="option" tabindex="0">
                  <span class="opt-icon">${r.icon}</span>
                  <div>
                    <div class="opt-label">${r.label}</div>
                    <div class="opt-desc">${r.desc}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <div id="home-search-input-wrap">
            <input id="home-search-input"
                   type="search"
                   autocomplete="off"
                   spellcheck="false"
                   placeholder="Search section headings…"
                   aria-label="Search"
                   aria-autocomplete="list"
                   aria-controls="home-suggestions"
                   value="${N(a.get("searchQuery"))}">
            <div id="home-suggestions" role="listbox" aria-label="Suggestions"></div>
          </div>

          <button id="home-search-go" type="button">Go</button>
        </div>


      </div>

      <div id="home-dialog-body">
        ${l.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(n);const h=a.get("activeTabId");if(h){const r=document.querySelector(`.home-tab[data-tab="${h}"]`),g=document.querySelector(`.home-tab-panel[data-panel="${h}"]`);r&&g&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(m=>m.classList.remove("active")),r.classList.add("active"),g.classList.add("active"))}i.addEventListener("click",r=>{r.preventDefault(),f()}),document.getElementById("home-dialog-close").addEventListener("click",u),n.addEventListener("click",r=>{r.target===n&&u()}),document.addEventListener("keydown",r=>{r.key==="Escape"&&n.classList.contains("show")&&u()}),l.bindTabs(),n.addEventListener("click",r=>{const g=r.target.closest(".home-tab");g!=null&&g.dataset.tab&&a.set("activeTabId",g.dataset.tab)}),d.bind(),document.getElementById("search-type-menu").addEventListener("click",r=>{const g=r.target.closest(".search-type-option");g&&a.set("searchTypeId",g.dataset.type)}),document.getElementById("home-search-input").addEventListener("input",r=>{a.set("searchQuery",r.target.value);const g=r.target.value.trim();g?d.currentType.id==="headings"&&l.filter(g):l.clearFilter()});function f(){n.classList.add("show"),document.body.style.overflow="hidden",setTimeout(()=>{var r;return(r=document.getElementById("home-search-input"))==null?void 0:r.focus()},60)}function u(){n.classList.remove("show"),document.body.style.overflow=""}function p(){var r,g,m;document.querySelectorAll(".home-tab-panel").forEach(y=>y.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(y=>y.classList.remove("active")),(r=document.getElementById("home-tabs"))==null||r.classList.add("tabs-hidden"),(g=document.getElementById("home-filter-wrap"))==null||g.classList.add("show"),(m=document.getElementById("home-results-panel"))==null||m.classList.add("active")}function b(){var y,$,v,w,I;(y=document.getElementById("home-results-panel"))==null||y.classList.remove("active"),($=document.getElementById("home-tabs"))==null||$.classList.remove("tabs-hidden"),(v=document.getElementById("home-filter-wrap"))==null||v.classList.remove("show");const r=a.get("activeTabId"),g=r&&document.querySelector(`.home-tab[data-tab="${r}"]`),m=r&&document.querySelector(`.home-tab-panel[data-panel="${r}"]`);g&&m?(g.classList.add("active"),m.classList.add("active")):((w=document.querySelector(".home-tab-panel"))==null||w.classList.add("active"),(I=document.querySelector(".home-tab"))==null||I.classList.add("active"))}return{open:f,close:u}}function U(c){const e=k.find(s=>s.id===c);return e?`${e.icon} ${e.label}`:"☰ Search Headings"}function N(c){return String(c??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function O(c){const e={};for(const[s,t]of Object.entries(c))for(const[i,a]of Object.entries(t))for(const[,o]of Object.entries(a))if(Array.isArray(o))for(const[l]of o)e[l]={nikaya:i,category:s};return e}const{baseUrl:W,lang:Q,menu:V}=window.INDEX_CONFIG,P="epika_disclaimer_skip",L=document.getElementById("disclaimer-overlay"),G=document.getElementById("disclaimer-ok"),K=document.getElementById("disclaimer-no-show"),R=j({triggerSelector:"#open-books-btn",baseUrl:W,lang:Q,menu:V});function E(c){c&&K.checked&&localStorage.setItem(P,"1"),L.classList.add("hidden"),R.open()}localStorage.getItem(P)==="1"&&(L.classList.add("hidden"),R.open());G.addEventListener("click",()=>E(!0));L.addEventListener("click",c=>{c.target===L&&E(!1)});document.addEventListener("keydown",c=>{c.key==="Escape"&&!L.classList.contains("hidden")&&E(!1)});

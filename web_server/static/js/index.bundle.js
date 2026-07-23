import{i as M}from"./pali_typing.chunk.js";const I=[{id:"sutta",label:"Sutta",match:l=>{var e;return(e=l.nikaya)==null?void 0:e.includes("Sutta")}},{id:"vinaya",label:"Vinaya",match:l=>{var e;return(e=l.nikaya)==null?void 0:e.includes("Vinaya")}},{id:"abhidhamma",label:"Abhidhamma",match:l=>{var e;return(e=l.nikaya)==null?void 0:e.includes("Abhidhamma")}},{id:"anna",label:"Añña",match:l=>l.category==="Añña"}],w=[{id:"mula",label:"Mūla",match:l=>l.category==="Mūla"},{id:"attha",label:"Aṭṭhakathā",match:l=>l.category==="Aṭṭhakathā"},{id:"tika",label:"Ṭīkā",match:l=>l.category==="Ṭīkā"}];class R{constructor(e,{onChange:t}={}){this.hierarchy=e,this.onChange=t||(()=>{}),this._pitakas=new Set,this._layers=new Set,this._el=null}getActiveBookIds(){const e=this._pitakas.size>0,t=this._layers.size>0;if(!e&&!t)return null;const s=new Set;for(const[i,a]of Object.entries(this.hierarchy)){const n=!e||I.filter(h=>this._pitakas.has(h.id)).some(h=>h.match(a)),c=!t||w.filter(h=>this._layers.has(h.id)).some(h=>h.match(a));n&&c&&s.add(i)}return s}filterResults(e){const t=this.getActiveBookIds();return t?e.filter(s=>t.has(s.book_id)):e}getFilterParams(){return{pitakas:[...this._pitakas],layers:[...this._layers]}}mount(e){this._el=document.createElement("div"),this._el.className="book-filter",this._el.innerHTML=this._buildHTML(),e.appendChild(this._el),this._bindEvents()}unmount(){this._el&&(this._el.remove(),this._el=null)}refresh(){this._el&&(this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.classList.toggle("active",this._pitakas.has(e.dataset.id))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.classList.toggle("active",this._layers.has(e.dataset.id))}),this._updateClearBtn())}_buildHTML(){const e=I.map(s=>`<button class="bf-chip" data-group="pitaka" data-id="${s.id}">${s.label}</button>`).join(""),t=w.map(s=>`<button class="bf-chip" data-group="layer" data-id="${s.id}">${s.label}</button>`).join("");return`
      <div class="bf-row">
        <span class="bf-label">Piṭaka</span>
        <div class="bf-chips" id="bf-pitaka-chips">${e}</div>
      </div>
      <div class="bf-row">
        <span class="bf-label">Group</span>
        <div class="bf-chips" id="bf-layer-chips">${t}</div>
      </div>
      <button class="bf-clear" id="bf-clear-btn" style="display:none">✕ Clear filters</button>
    `}_bindEvents(){this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._pitakas,e))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._layers,e))}),this._el.querySelector("#bf-clear-btn").addEventListener("click",()=>{this._pitakas.clear(),this._layers.clear(),this.refresh(),this.onChange()})}_toggle(e,t){const s=t.dataset.id;e.has(s)?(e.delete(s),t.classList.remove("active")):(e.add(s),t.classList.add("active")),this._updateClearBtn(),this.onChange()}_updateClearBtn(){var s;const e=(s=this._el)==null?void 0:s.querySelector("#bf-clear-btn");if(!e)return;const t=this._pitakas.size>0||this._layers.size>0;e.style.display=t?"inline-flex":"none"}}const _=[{id:"headings",icon:"☰",label:"Search Headings",desc:"Find by section titles",placeholder:"Search section headings…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"fulltext",icon:"🔍",label:"Full Text",desc:"Search Pāli & translations",placeholder:"Type words to search…",hasAutocomplete:!0,hasFtsOptions:!0,autocompleteMode:"word"},{id:"pali-def",icon:"📖",label:"Pāli Definitions",desc:"Look up Pāli dictionary",placeholder:"Search Pāli word…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"ai",icon:"✨",label:"AI Search",desc:"Semantic meaning search",placeholder:"Ask a question…",hasAutocomplete:!1,hasFtsOptions:!1}],$=[{id:"exact",label:"Sentence"},{id:"para",label:"Paragraph"},{id:"distance",label:"Distance"}];class B{constructor({baseUrl:e,initialState:t={},hierarchy:s={},onResultSelect:i,onShowResults:a,onShowBooks:n}){this.baseUrl=e,this.hierarchy=s,this.onResultSelect=i,this.onShowResults=a,this.onShowBooks=n;const c=_.find(u=>u.id===t.searchTypeId);this.currentType=c??_[0];const h=$.find(u=>u.id===t.ftsModeId);this.ftsModeId=h?h.id:"exact";const r=Number(t.ftsDistance);this.ftsDistance=Number.isFinite(r)&&r>=1?r:2,this._acDebounce=null,this._acController=null,this._focusedIdx=-1,this._suggestions=[],this.bookFilter=new R(s,{onChange:()=>this._onFilterChange()}),this.typeBtn=null,this.typeMenu=null,this.searchInput=null,this.suggestionsEl=null,this.ftsBar=null,this.distanceWrap=null,this.distanceNum=null,this.goBtn=null,this.resultsPanel=null,this.filterWrap=null,this._lastResults=null,this._lastQuery="",this._lastType=null,this._ftsPage=1,this._ftsTotalPages=1,this._ftsWords=[],this._ftsLoading=!1}bind(){this.typeBtn=document.getElementById("search-type-btn"),this.typeMenu=document.getElementById("search-type-menu"),this.searchInput=document.getElementById("home-search-input"),this.suggestionsEl=document.getElementById("home-suggestions"),this.ftsBar=document.getElementById("fts-options-bar"),this.distanceWrap=document.getElementById("fts-distance-wrap"),this.distanceNum=document.getElementById("fts-distance-num"),this.goBtn=document.getElementById("home-search-go"),this.resultsPanel=document.getElementById("home-results-panel"),this.filterWrap=document.getElementById("home-filter-wrap"),this._bindTypeDropdown(),this._bindFtsOptions(),this._bindInput(),this._bindGoButton(),this.filterWrap&&this.bookFilter.mount(this.filterWrap),this._applyTypeUI(this.currentType),this._applyFtsModeUI(this.ftsModeId),this._applyFtsDistanceUI(this.ftsDistance)}_bindTypeDropdown(){this.typeBtn.addEventListener("click",e=>{e.stopPropagation(),this._toggleTypeMenu()}),this.typeMenu.querySelectorAll(".search-type-option").forEach(e=>{e.addEventListener("click",()=>{const t=_.find(s=>s.id===e.dataset.type);t&&this._selectType(t)})}),document.addEventListener("click",()=>this._closeTypeMenu())}_toggleTypeMenu(){this.typeMenu.classList.contains("show")?this._closeTypeMenu():this._openTypeMenu()}_openTypeMenu(){this._positionBelow(this.typeBtn,this.typeMenu),this.typeMenu.classList.add("show"),this.typeBtn.classList.add("open")}_closeTypeMenu(){this.typeMenu.classList.remove("show"),this.typeBtn.classList.remove("open")}_positionBelow(e,t){const s=e.getBoundingClientRect();t.style.top=`${s.bottom+4}px`,t.style.left=`${s.left}px`,t.style.maxWidth=`${window.innerWidth-s.left-8}px`}_selectType(e){this.currentType=e,this._lastResults=null,this._applyTypeUI(e),this._closeTypeMenu(),this._closeSuggestions(),this.searchInput.value="",this.searchInput.focus(),this.resultsPanel&&(this.resultsPanel.innerHTML="",this.resultsPanel.classList.remove("active")),this.onShowBooks()}_applyTypeUI(e){this.typeBtn.innerHTML=`<span>${e.icon} ${e.label}</span><span class="arrow">▾</span>`,this.searchInput.placeholder=e.placeholder,this.typeMenu.querySelectorAll(".search-type-option").forEach(t=>{t.classList.toggle("selected",t.dataset.type===e.id)}),this.ftsBar.classList.toggle("show",e.hasFtsOptions)}_applyFtsModeUI(e){this.ftsModeId=e,this.ftsBar.querySelectorAll(".fts-chip").forEach(t=>{t.classList.toggle("active",t.dataset.mode===e)}),this.distanceWrap.classList.toggle("show",e==="distance")}_applyFtsDistanceUI(e){this.ftsDistance=e,this.distanceNum.value=e}_onFilterChange(){if(!(!this._lastResults||!this._lastQuery)){if(this._lastType==="headings"){const e=this.bookFilter.filterResults(this._lastResults);this._renderHeadingResults(e,this._lastQuery)}else if(this._lastType==="pali-def"){const e=this.bookFilter.filterResults(this._lastResults);this._renderDictResults(e,this._lastQuery)}}}_bindFtsOptions(){this.ftsBar.querySelectorAll(".fts-chip").forEach(e=>{e.addEventListener("click",()=>{this._applyFtsModeUI(e.dataset.mode)})}),this.distanceNum.addEventListener("change",()=>{const e=Math.max(1,parseInt(this.distanceNum.value)||2);this._applyFtsDistanceUI(e)})}_bindInput(){this.searchInput.addEventListener("input",()=>this._onInput()),this.searchInput.addEventListener("keydown",e=>this._onKeydown(e)),this.searchInput.addEventListener("blur",()=>{setTimeout(()=>this._closeSuggestions(),160)}),this.removePaliHandler=M(this.searchInput,{mode:"both",onConvert:e=>{const t=e.trim();if(!t){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(t),220))}})}_onInput(){const e=this.searchInput.value.trim();if(!e){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(e),220))}async _fetchSuggestions(e){this._acController&&this._acController.abort(),this._acController=new AbortController,this._showSuggestionsLoading();try{let t;if(this.currentType.id==="headings")t=`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.id==="pali-def")t=`${this.baseUrl}/api/bold_suggest?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.autocompleteMode==="word"){const a=e.split(/\s+/).pop();if(!a){this._closeSuggestions();return}t=`${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(a)}&limit=10`}else return;const i=await(await fetch(t,{signal:this._acController.signal})).json();if(this.currentType.autocompleteMode==="word")this._renderWordSuggestions(i,e);else{const a=this.bookFilter.filterResults(i);this._renderSuggestions(a,e)}}catch(t){t.name!=="AbortError"&&this._closeSuggestions()}}_renderWordSuggestions(e,t){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(e!=null&&e.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No suggestions</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e.map(n=>({_word:n})),this._focusedIdx=-1;const s=t.split(/\s+/).pop(),i=t.slice(0,t.length-s.length),a=n=>n.replace(new RegExp(`^(${v(s)})`,"i"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((n,c)=>`<div class="suggestion-item suggestion-word" data-idx="${c}" tabindex="-1">
        <span class="sug-pali">${a(n)}</span>
      </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-word").forEach(n=>{n.addEventListener("mousedown",c=>{var r;c.preventDefault();const h=(r=this._suggestions[parseInt(n.dataset.idx)])==null?void 0:r._word;h&&(this.searchInput.value=i+h+" ",this._closeSuggestions(),this.searchInput.focus())})})}_showSuggestionsLoading(){this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,this.suggestionsEl.innerHTML='<div class="suggestion-loading">Searching…</div>',this.suggestionsEl.classList.add("show"),this._focusedIdx=-1,this._suggestions=[]}_renderSuggestions(e,t){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!(e!=null&&e.length)){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No results</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e,this._focusedIdx=-1;const s=i=>i.replace(new RegExp(`(${v(t)})`,"gi"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((i,a)=>this.currentType.id==="headings"?`<div class="suggestion-item" data-idx="${a}" tabindex="-1">
          <span class="sug-pali">${s(i.title||"")}</span>
          <span class="sug-book">${i.book_name||i.book_id||""}</span>
          <span class="sug-para">#${i.para_id||""}</span>
        </div>`:`<div class="suggestion-item" data-idx="${a}" tabindex="-1">
          <span class="sug-pali">${s(i.word||i.title||"")}</span>
          <span class="sug-book">${i.definition_short||""}</span>
        </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-item").forEach(i=>{i.addEventListener("mousedown",a=>{a.preventDefault(),this._selectSuggestion(parseInt(i.dataset.idx))})})}_selectSuggestion(e){const t=this._suggestions[e];if(t){if(t._word!==void 0){const s=this.searchInput.value,i=s.split(/\s+/).pop(),a=s.slice(0,s.length-i.length);this.searchInput.value=a+t._word+" ",this._closeSuggestions(),this.searchInput.focus();return}this._closeSuggestions(),this.currentType.id==="headings"?this.onResultSelect(`${this.baseUrl}/book/${t.book_id}?para=${t.para_id}`):this.currentType.id==="pali-def"&&this.onResultSelect(`${this.baseUrl}/book/${t.book_id}?para=${t.para_id}&line=${t.line_id}`)}}_closeSuggestions(){this.suggestionsEl.classList.remove("show"),this.suggestionsEl.innerHTML="",this._focusedIdx=-1,this._suggestions=[]}_onKeydown(e){const t=this.suggestionsEl.querySelectorAll(".suggestion-item");if(t.length&&this.suggestionsEl.classList.contains("show")){if(e.key==="ArrowDown"){e.preventDefault(),this._focusedIdx=Math.min(this._focusedIdx+1,t.length-1),this._updateFocused(t);return}if(e.key==="ArrowUp"){e.preventDefault(),this._focusedIdx=Math.max(this._focusedIdx-1,-1),this._updateFocused(t);return}if(e.key==="Enter"&&this._focusedIdx>=0){e.preventDefault(),this._selectSuggestion(this._focusedIdx);return}if(e.key==="Escape"){this._closeSuggestions();return}}e.key==="Enter"&&(e.preventDefault(),this._executeSearch())}_updateFocused(e){e.forEach((t,s)=>t.classList.toggle("focused",s===this._focusedIdx)),this._focusedIdx>=0&&e[this._focusedIdx].scrollIntoView({block:"nearest"})}_bindGoButton(){this.goBtn.addEventListener("click",()=>this._executeSearch())}async _executeSearch(){const e=this.searchInput.value.trim();if(!e)return;this._closeSuggestions();const t=this.currentType;if(t.id==="headings"){this._showResultsLoading();const s=await this._apiFetch(`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=30`);this._lastResults=s||[],this._lastQuery=e,this._lastType="headings",this._renderHeadingResults(this.bookFilter.filterResults(this._lastResults),e)}else if(t.id==="fulltext")this._ftsPage=1,await this._executeFtsSearch(e);else if(t.id==="pali-def"){this._showResultsLoading();const s=await this._apiFetch(`${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(e)}&limit=80`);this._lastResults=s||[],this._lastQuery=e,this._lastType="pali-def",this._renderDictResults(this.bookFilter.filterResults(this._lastResults),e)}else if(t.id==="ai"){const s=new URLSearchParams({q:e,mode:"ai"});this._appendFilterParams(s),window.location.href=`${this.baseUrl}/search?${s}`}}_appendFilterParams(e){const{pitakas:t,layers:s}=this.bookFilter.getFilterParams();t.length&&e.set("pitakas",t.join(",")),s.length&&e.set("layers",s.join(","))}_showResultsLoading(){this.onShowResults(),this.resultsPanel.innerHTML='<div class="hd-loading">Searching…</div>'}_renderHeadingResults(e,t){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const s=i=>i.replace(new RegExp(`(${v(t)})`,"gi"),"<mark>$1</mark>");this.resultsPanel.innerHTML=e.map(i=>`
      <a href="${this.baseUrl}/book/${i.book_id}?para=${i.para_id}"
         class="search-result-item"
         data-url="${this.baseUrl}/book/${i.book_id}?para=${i.para_id}">
        <div class="search-result-book">${i.book_name||i.book_id}</div>
        <div class="search-result-heading">${s(i.title||"")}</div>
        <div class="search-result-meta">Paragraph ${i.para_id}</div>
      </a>
    `).join(""),this.resultsPanel.querySelectorAll(".search-result-item").forEach(i=>{i.addEventListener("click",a=>{a.preventDefault(),this.onResultSelect(i.dataset.url)})})}_renderDictResults(e,t){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No definitions found.</div>';return}const s=r=>r.replace(new RegExp(`(${v(t)})`,"gi"),"<mark>$1</mark>"),i=new Map;for(const r of e)i.has(r.book_id)||i.set(r.book_id,{book_id:r.book_id,book_name:r.book_name||r.book_id,items:[]}),i.get(r.book_id).items.push(r);const a=i.size,n=e.length;let c=`<div class="dict-results-summary">${n} result${n!==1?"s":""} in ${a} book${a!==1?"s":""}</div>`,h=0;for(const[,r]of i){const u=`dict-group-${h++}`,m=h===1;c+=`
        <div class="dict-book-group ${m?"expanded":""}" id="${u}">
          <button class="dict-book-header" data-group="${u}" aria-expanded="${m}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${r.book_name}</span>
            <span class="dict-book-count">${r.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${r.items.map(g=>`
              <a href="${this.baseUrl}/book/${g.book_id}?para=${g.para_id}&line=${g.line_id}"
                 class="search-result-item dict-entry"
                 data-url="${this.baseUrl}/book/${g.book_id}?para=${g.para_id}&line=${g.line_id}">
                <div class="search-result-heading">${s(g.title||"")}</div>
                ${g.definition_pali?`<div class="search-result-meta pali">${g.definition_pali}</div>`:""}
                ${g.definition_en?`<div class="search-result-meta translation">${g.definition_en}</div>`:""}
              </a>
            `).join("")}
          </div>
        </div>`}this.resultsPanel.innerHTML=c,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(r=>{r.addEventListener("click",()=>{const u=document.getElementById(r.dataset.group);if(!u)return;const m=u.classList.contains("expanded");u.classList.toggle("expanded",!m),r.setAttribute("aria-expanded",String(!m))})}),this.resultsPanel.querySelectorAll(".search-result-item").forEach(r=>{r.addEventListener("click",u=>{u.preventDefault(),this.onResultSelect(r.dataset.url)})})}async _executeFtsSearch(e,t=null){if(this._ftsLoading)return;this._ftsLoading=!0,t!==null&&(this._ftsPage=t);const s=new URLSearchParams({q:e,page:this._ftsPage,limit:20});this.ftsModeId==="distance"?(s.set("mode","distance"),s.set("distance",this.ftsDistance)):this.ftsModeId==="para"?s.set("mode","para"):s.set("mode","exact");const{pitakas:i,layers:a}=this.bookFilter.getFilterParams();i.length&&s.set("pitakas",i.join(",")),a.length&&s.set("layers",a.join(",")),this._showResultsLoading();const n=await this._apiFetch(`${this.baseUrl}/api/fts_search?${s}`);if(this._ftsLoading=!1,!n){this.resultsPanel.innerHTML='<div class="hd-empty">Search failed. Please try again.</div>';return}this._ftsTotalPages=n.pages||1,this._ftsWords=n.words||[],this._lastResults=n.results||[],this._lastQuery=e,this._lastType="fulltext",this._renderFtsResults(n,e)}_renderFtsResults(e,t){var g,y;this.onShowResults();const s=e.results||[],i=e.words||[t];if(!s.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const a=new RegExp(`(${i.map(p=>v(p)).join("|")})`,"gi"),n=p=>(p||"").replace(a,"<mark>$1</mark>"),c=e.total||0,h=e.page||1,r=e.pages||1;let u=`<div id="home-filter-wrap"></div><div class="dict-results-summary1">${c.toLocaleString()} result${c!==1?"s":""} &mdash; page ${h} of ${r}</div>`,m=0;for(const p of s){const o=`fts-group-${m++}`,d=m===1;u+=`
        <div class="dict-book-group ${d?"expanded":""}" id="${o}">
          <button class="dict-book-header" data-group="${o}" aria-expanded="${d}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${p.book_name}</span>
            <span class="dict-book-count">${p.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${p.items.map(f=>{const b=`${this.baseUrl}/book/${f.book_id}?para=${f.para_id}`;return`
                <a href="${b}" class="search-result-item dict-entry fts-entry" data-url="${b}">
                  ${f.pali?`<div class="fts-pali">${n(f.pali)}</div>`:""}
                  ${f.english?`<div class="fts-english">${n(f.english)}</div>`:""}
                  <div class="fts-meta">para ${f.para_id}</div>
                </a>`}).join("")}
          </div>
        </div>`}r>1&&(u+=`
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${h<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${h} / ${r}</span>
          <button class="fts-page-btn" id="fts-next" ${h>=r?"disabled":""}>Next →</button>
        </div>`),this.resultsPanel.innerHTML=u,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(p=>{p.addEventListener("click",()=>{const o=document.getElementById(p.dataset.group);if(!o)return;const d=o.classList.contains("expanded");o.classList.toggle("expanded",!d),p.setAttribute("aria-expanded",String(!d))})}),this.resultsPanel.querySelectorAll(".fts-entry").forEach(p=>{p.addEventListener("click",o=>{o.preventDefault(),this.onResultSelect(p.dataset.url)})}),(g=this.resultsPanel.querySelector("#fts-prev"))==null||g.addEventListener("click",()=>{this._executeFtsSearch(this._lastQuery,this._ftsPage-1)}),(y=this.resultsPanel.querySelector("#fts-next"))==null||y.addEventListener("click",()=>{this._executeFtsSearch(this._lastQuery,this._ftsPage+1)})}async _apiFetch(e){try{return await(await fetch(e)).json()}catch{return null}}}function v(l){return l.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function P(l,e){if(!e)return l;const t=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return l.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}const T=["Mūla","Aṭṭhakathā","Ṭīkā"],F=["Vinaya","Suttanta","Sutta","Abhidhamma"];class q{constructor({baseUrl:e,menu:t,onNavigate:s}){this.baseUrl=e,this.menu=t,this.onNavigate=s,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),t=e.map((i,a)=>`
      <button class="home-tab${a===0?" active":""}"
              data-tab="${a}" type="button">${i.label}</button>
    `).join(""),s=e.map((i,a)=>`
      <div class="home-tab-panel${a===0?" active":""}" data-panel="${a}">
        ${this._buildCategoryHTML(i)}
      </div>
    `).join("");return`
      <div id="home-tabs">${t}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${s}
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),t=document.querySelectorAll(".home-tab-panel");e.forEach(s=>{s.addEventListener("click",()=>{var a;const i=parseInt(s.dataset.tab);e.forEach(n=>n.classList.toggle("active",n===s)),t.forEach(n=>n.classList.toggle("active",parseInt(n.dataset.panel)===i)),(a=document.getElementById("home-results-panel"))==null||a.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(s=>{s.addEventListener("click",()=>{var i;s.classList.toggle("open"),(i=s.nextElementSibling)==null||i.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(s=>{s.addEventListener("click",i=>{i.preventDefault(),this.onNavigate(s.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(t=>{t.querySelectorAll(".book-entry").forEach(s=>{var n,c;const i=((c=(n=s.querySelector(".book-name"))==null?void 0:n.textContent)==null?void 0:c.toLowerCase())||"",a=!this._filterText||i.includes(this._filterText);if(s.style.display=a?"":"none",this._filterText&&a){const h=s.querySelector(".book-name");h&&(h.innerHTML=P(h.textContent,this._filterText))}}),t.querySelectorAll(".book-nikaya").forEach(s=>{var a,n;const i=[...s.querySelectorAll(".book-entry")].some(c=>c.style.display!=="none");s.style.display=i?"":"none",this._filterText&&((a=s.querySelector(".book-nikaya-title"))==null||a.classList.add("open"),(n=s.querySelector(".book-nikaya-list"))==null||n.classList.add("open"))}),t.querySelectorAll(".book-category").forEach(s=>{const i=[...s.querySelectorAll(".book-entry")].some(a=>a.style.display!=="none");s.style.display=i?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const t=e.querySelector(".book-name");t&&(t.textContent=t.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...T.filter(s=>e.includes(s)),...e.filter(s=>!T.includes(s))].map(s=>({label:s,data:this.menu[s]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((s,i)=>{const a=n=>{const c=F.findIndex(h=>n.includes(h));return c===-1?99:c};return a(s)-a(i)}).map(s=>`
      <div class="book-category">
        <div class="book-category-title">${s}</div>
        <div class="book-category-content">
          ${this._renderNikaya(e[s])}
        </div>
      </div>
    `).join("")}_renderNikaya(e){if(!e||typeof e!="object")return"";const t=[];return e[""]&&t.push(`
        <div class="book-nikaya flat-group">
          <ol class="book-nikaya-list open">
            ${this._buildBookList(e[""])}
          </ol>
        </div>
      `),Object.entries(e).forEach(([s,i])=>{s!==""&&t.push(`
        <div class="book-nikaya">
          <div class="book-nikaya-title">
            ${s}
            <span class="nikaya-chevron">▶</span>
          </div>
          <ol class="book-nikaya-list">
            ${this._buildBookList(i)}
          </ol>
        </div>
      `)}),t.join("")}_buildBookList(e){return Array.isArray(e)?e.map(([t,s],i)=>`
      <li>
        <a href="${this.baseUrl}/book/${t}"
           class="book-entry"
           data-book-id="${t}">
          <span class="book-num">${i+1}.</span>
          <span class="book-name">${s}</span>
        </a>
      </li>
    `).join(""):""}}class D{constructor(e,t){this._key=e,this._defaults=t,this._data=this._load()}get(e){return this._data[e]}set(e,t){this._data[e]=t,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function C({triggerSelector:l,baseUrl:e,menu:t}){var y,p;if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(l);if(!s){console.warn("[HomeDialog] trigger not found:",l);return}const i=new D("homeDialog_state",{searchQuery:"",searchTypeId:((y=_[0])==null?void 0:y.id)??"",ftsModeId:((p=$[0])==null?void 0:p.id)??"",ftsDistance:2,activeTabId:null}),a=new q({baseUrl:e,menu:t,onNavigate:o=>{u(),window.location.href=o}}),n=new B({baseUrl:e,initialState:{searchTypeId:i.get("searchTypeId"),ftsModeId:i.get("ftsModeId"),ftsDistance:i.get("ftsDistance")},onResultSelect:o=>{u(),window.location.href=o},onShowResults:()=>m(),onShowBooks:()=>g()}),c=document.createElement("div");c.id="home-dialog-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.setAttribute("aria-label","Browse books"),c.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        <div id="home-search-row">
          <div style="position:relative">
            <button id="search-type-btn" type="button" aria-haspopup="true">
              <span>${H(i.get("searchTypeId"))}</span>
              <span class="arrow">▾</span>
            </button>
            <div id="search-type-menu" role="listbox">
              ${_.map(o=>`
                <div class="search-type-option${o.id===i.get("searchTypeId")?" selected":""}"
                     data-type="${o.id}" role="option" tabindex="0">
                  <span class="opt-icon">${o.icon}</span>
                  <div>
                    <div class="opt-label">${o.label}</div>
                    <div class="opt-desc">${o.desc}</div>
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
                   value="${U(i.get("searchQuery"))}">
            <div id="home-suggestions" role="listbox" aria-label="Suggestions"></div>
          </div>

          <button id="home-search-go" type="button">Go</button>
        </div>

        <div id="fts-options-bar">
          <span class="fts-label">Match:</span>
          ${$.map(o=>`
            <button class="fts-chip${o.id===i.get("ftsModeId")?" active":""}"
                    data-mode="${o.id}" type="button">${o.label}</button>
          `).join("")}
          <div id="fts-distance-wrap">
            <label for="fts-distance-num">words apart:</label>
            <input id="fts-distance-num" type="number" min="1" max="50"
                   value="${Number.isFinite(i.get("ftsDistance"))?i.get("ftsDistance"):2}">
          </div>
        </div>
        
      </div>

      <div id="home-dialog-body">
        ${a.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(c);const h=i.get("activeTabId");if(h){const o=document.querySelector(`.home-tab[data-tab="${h}"]`),d=document.querySelector(`.home-tab-panel[data-panel="${h}"]`);o&&d&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(f=>f.classList.remove("active")),o.classList.add("active"),d.classList.add("active"))}s.addEventListener("click",o=>{o.preventDefault(),r()}),document.getElementById("home-dialog-close").addEventListener("click",u),c.addEventListener("click",o=>{o.target===c&&u()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&c.classList.contains("show")&&u()}),a.bindTabs(),c.addEventListener("click",o=>{const d=o.target.closest(".home-tab");d!=null&&d.dataset.tab&&i.set("activeTabId",d.dataset.tab)}),n.bind(),document.getElementById("search-type-menu").addEventListener("click",o=>{const d=o.target.closest(".search-type-option");d&&i.set("searchTypeId",d.dataset.type)}),document.getElementById("fts-options-bar").addEventListener("click",o=>{const d=o.target.closest(".fts-chip");d&&i.set("ftsModeId",d.dataset.mode)}),document.getElementById("fts-distance-num").addEventListener("change",o=>{const d=parseInt(o.target.value,10);Number.isFinite(d)&&i.set("ftsDistance",d)}),document.getElementById("home-search-input").addEventListener("input",o=>{i.set("searchQuery",o.target.value);const d=o.target.value.trim();d?n.currentType.id==="headings"&&a.filter(d):a.clearFilter()});function r(){c.classList.add("show"),document.body.style.overflow="hidden",setTimeout(()=>{var o;return(o=document.getElementById("home-search-input"))==null?void 0:o.focus()},60)}function u(){c.classList.remove("show"),document.body.style.overflow=""}function m(){var o;document.querySelectorAll(".home-tab-panel").forEach(d=>d.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(d=>d.classList.remove("active")),(o=document.getElementById("home-results-panel"))==null||o.classList.add("active")}function g(){var b,L,S;(b=document.getElementById("home-results-panel"))==null||b.classList.remove("active");const o=i.get("activeTabId"),d=o&&document.querySelector(`.home-tab[data-tab="${o}"]`),f=o&&document.querySelector(`.home-tab-panel[data-panel="${o}"]`);d&&f?(d.classList.add("active"),f.classList.add("active")):((L=document.querySelector(".home-tab-panel"))==null||L.classList.add("active"),(S=document.querySelector(".home-tab"))==null||S.classList.add("active"))}return{open:r,close:u}}function H(l){const e=_.find(t=>t.id===l);return e?`${e.icon} ${e.label}`:"☰ Search Headings"}function U(l){return String(l??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const{baseUrl:j,menu:N}=window.INDEX_CONFIG,x="epika_disclaimer_skip",k=document.getElementById("disclaimer-overlay"),O=document.getElementById("disclaimer-ok"),W=document.getElementById("disclaimer-no-show"),A=C({triggerSelector:"#open-books-btn",baseUrl:j,menu:N});function E(l){l&&W.checked&&localStorage.setItem(x,"1"),k.classList.add("hidden"),A.open()}localStorage.getItem(x)==="1"&&(k.classList.add("hidden"),A.open());O.addEventListener("click",()=>E(!0));k.addEventListener("click",l=>{l.target===k&&E(!1)});document.addEventListener("keydown",l=>{l.key==="Escape"&&!k.classList.contains("hidden")&&E(!1)});

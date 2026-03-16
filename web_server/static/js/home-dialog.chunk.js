const R=[{pat:/aa/gi,rep:a=>a==="aa"?"ā":"Ā"},{pat:/ii/gi,rep:a=>a==="ii"?"ī":"Ī"},{pat:/uu/gi,rep:a=>a==="uu"?"ū":"Ū"},{pat:/\.t/gi,rep:a=>a===".t"?"ṭ":"Ṭ"},{pat:/\.d/gi,rep:a=>a===".d"?"ḍ":"Ḍ"},{pat:/\.n/gi,rep:a=>a===".n"?"ṇ":"Ṇ"},{pat:/\.m/gi,rep:a=>a===".m"?"ṃ":"Ṃ"},{pat:/\.l/gi,rep:a=>a===".l"?"ḷ":"Ḷ"},{pat:/\.s/gi,rep:a=>a===".s"?"ṣ":"Ṣ"},{pat:/~n/g,rep:"ñ"},{pat:/~N/g,rep:"Ñ"},{pat:/"n/gi,rep:a=>a==='"n'?"ṅ":"Ṅ"},{pat:/"s/gi,rep:a=>a==='"s'?"ś":"Ś"}];function A(a){let e=a;for(const{pat:t,rep:s}of R)e=e.replace(t,i=>typeof s=="function"?s(i):s);return e}function B(a){let e="",t=0;for(;t<a.length;)if(a[t]===";"&&t+1<a.length){const s=a[t+1],i=s.toLowerCase(),n=s!==i;let l=null;switch(i){case"a":l=n?"Ā":"ā";break;case"i":l=n?"Ī":"ī";break;case"u":l=n?"Ū":"ū";break;case"t":l=n?"Ṭ":"ṭ";break;case"d":l=n?"Ḍ":"ḍ";break;case"n":l=n?"Ñ":"ñ";break;case"m":l=n?"Ṃ":"ṃ";break;case"l":l=n?"Ḷ":"ḷ";break;case"s":l=n?"Ś":"ś";break;case"k":l=n?"Ṅ":"ṅ";break;case"j":l=n?"Ñ":"ñ";break}l!==null?(e+=l,t+=2):(e+=";"+s,t+=2)}else e+=a[t],t++;return e}function L(a,e="velthuis"){let t=a;return(e==="velthuis"||e==="both")&&(t=A(t)),(e==="deadkey"||e==="both")&&(t=B(t)),t}function P(a,e={}){const{mode:t="velthuis",onConvert:s=null,cursorRestoreDelta:i=0}=e;let n=!1,l=!1;const d=()=>{if(l)return;const h=a.selectionStart??a.value.length,f=a.selectionEnd??h,c=a.value;if(n){const _=c.slice(0,h),T=c.slice(h),v=L(_,t);if(v===_)return;l=!0;const x=_.length,$=v.length;a.value=v+T;const M=$-x,E=Math.min(Math.max(0,h+M+i),$);a.setSelectionRange(E,E),l=!1,s&&s(a.value);return}const o=L(c,t);if(o===c)return;l=!0;const p=c.length,g=o.length;a.value=o;let b=h;if(h===f&&h===p)b=g;else{const _=g-p;b=Math.min(Math.max(0,h+_+i),g)}a.setSelectionRange(b,b),l=!1,s&&s(o)},u=()=>{n=!0},r=()=>{n=!1,d()};return a.addEventListener("input",d),a.addEventListener("compositionstart",u),a.addEventListener("compositionend",r),()=>{a.removeEventListener("input",d),a.removeEventListener("compositionstart",u),a.removeEventListener("compositionend",r)}}function O(a){return a.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}const S=[{id:"sutta",label:"Sutta",match:a=>a.nikaya?.includes("Sutta")},{id:"vinaya",label:"Vinaya",match:a=>a.nikaya?.includes("Vinaya")},{id:"abhidhamma",label:"Abhidhamma",match:a=>a.nikaya?.includes("Abhidhamma")},{id:"anna",label:"Añña",match:a=>a.category==="Añña"}],w=[{id:"mula",label:"Mūla",match:a=>a.category==="Mūla"},{id:"attha",label:"Aṭṭhakathā",match:a=>a.category==="Aṭṭhakathā"},{id:"tika",label:"Ṭīkā",match:a=>a.category==="Ṭīkā"}];class F{constructor(e,{onChange:t}={}){this.hierarchy=e,this.onChange=t||(()=>{}),this._pitakas=new Set,this._layers=new Set,this._el=null}getActiveBookIds(){const e=this._pitakas.size>0,t=this._layers.size>0;if(!e&&!t)return null;const s=new Set;for(const[i,n]of Object.entries(this.hierarchy)){const l=!e||S.filter(u=>this._pitakas.has(u.id)).some(u=>u.match(n)),d=!t||w.filter(u=>this._layers.has(u.id)).some(u=>u.match(n));l&&d&&s.add(i)}return s}filterResults(e){const t=this.getActiveBookIds();return t?e.filter(s=>t.has(s.book_id)):e}getFilterParams(){return{pitakas:[...this._pitakas],layers:[...this._layers]}}mount(e){this._el=document.createElement("div"),this._el.className="book-filter",this._el.innerHTML=this._buildHTML(),e.appendChild(this._el),this._bindEvents()}unmount(){this._el&&(this._el.remove(),this._el=null)}refresh(){this._el&&(this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.classList.toggle("active",this._pitakas.has(e.dataset.id))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.classList.toggle("active",this._layers.has(e.dataset.id))}),this._updateClearBtn())}_buildHTML(){const e=S.map(s=>`<button class="bf-chip" data-group="pitaka" data-id="${s.id}">${s.label}</button>`).join(""),t=w.map(s=>`<button class="bf-chip" data-group="layer" data-id="${s.id}">${s.label}</button>`).join("");return`
      <div class="bf-row">
        <span class="bf-label">Piṭaka</span>
        <div class="bf-chips" id="bf-pitaka-chips">${e}</div>
      </div>
      <div class="bf-row">
        <span class="bf-label">Group</span>
        <div class="bf-chips" id="bf-layer-chips">${t}</div>
      </div>
      <button class="bf-clear" id="bf-clear-btn" style="display:none">✕ Clear filters</button>
    `}_bindEvents(){this._el.querySelectorAll('.bf-chip[data-group="pitaka"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._pitakas,e))}),this._el.querySelectorAll('.bf-chip[data-group="layer"]').forEach(e=>{e.addEventListener("click",()=>this._toggle(this._layers,e))}),this._el.querySelector("#bf-clear-btn").addEventListener("click",()=>{this._pitakas.clear(),this._layers.clear(),this.refresh(),this.onChange()})}_toggle(e,t){const s=t.dataset.id;e.has(s)?(e.delete(s),t.classList.remove("active")):(e.add(s),t.classList.add("active")),this._updateClearBtn(),this.onChange()}_updateClearBtn(){const e=this._el?.querySelector("#bf-clear-btn");if(!e)return;const t=this._pitakas.size>0||this._layers.size>0;e.style.display=t?"inline-flex":"none"}}const m=[{id:"headings",icon:"☰",label:"Search Headings",desc:"Find by section titles",placeholder:"Search section headings…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"fulltext",icon:"🔍",label:"Full Text",desc:"Search Pāli & translations",placeholder:"Type words to search…",hasAutocomplete:!0,hasFtsOptions:!0,autocompleteMode:"word"},{id:"pali-def",icon:"📖",label:"Pāli Definitions",desc:"Look up Pāli dictionary",placeholder:"Search Pāli word…",hasAutocomplete:!0,hasFtsOptions:!1},{id:"ai",icon:"✨",label:"AI Search",desc:"Semantic meaning search",placeholder:"Ask a question…",hasAutocomplete:!1,hasFtsOptions:!1}],k=[{id:"exact",label:"Sentence"},{id:"para",label:"Paragraph"},{id:"distance",label:"Distance"}];class q{constructor({baseUrl:e,initialState:t={},hierarchy:s={},onResultSelect:i,onShowResults:n,onShowBooks:l}){this.baseUrl=e,this.hierarchy=s,this.onResultSelect=i,this.onShowResults=n,this.onShowBooks=l;const d=m.find(h=>h.id===t.searchTypeId);this.currentType=d??m[0];const u=k.find(h=>h.id===t.ftsModeId);this.ftsModeId=u?u.id:"exact";const r=Number(t.ftsDistance);this.ftsDistance=Number.isFinite(r)&&r>=1?r:2,this._acDebounce=null,this._acController=null,this._focusedIdx=-1,this._suggestions=[],this.bookFilter=new F(s,{onChange:()=>this._onFilterChange()}),this.typeBtn=null,this.typeMenu=null,this.searchInput=null,this.suggestionsEl=null,this.ftsBar=null,this.distanceWrap=null,this.distanceNum=null,this.goBtn=null,this.resultsPanel=null,this.filterWrap=null,this._lastResults=null,this._lastQuery="",this._lastType=null,this._ftsPage=1,this._ftsTotalPages=1,this._ftsWords=[],this._ftsLoading=!1}bind(){this.typeBtn=document.getElementById("search-type-btn"),this.typeMenu=document.getElementById("search-type-menu"),this.searchInput=document.getElementById("home-search-input"),this.suggestionsEl=document.getElementById("home-suggestions"),this.ftsBar=document.getElementById("fts-options-bar"),this.distanceWrap=document.getElementById("fts-distance-wrap"),this.distanceNum=document.getElementById("fts-distance-num"),this.goBtn=document.getElementById("home-search-go"),this.resultsPanel=document.getElementById("home-results-panel"),this.filterWrap=document.getElementById("home-filter-wrap"),this._bindTypeDropdown(),this._bindFtsOptions(),this._bindInput(),this._bindGoButton(),this.filterWrap&&this.bookFilter.mount(this.filterWrap),this._applyTypeUI(this.currentType),this._applyFtsModeUI(this.ftsModeId),this._applyFtsDistanceUI(this.ftsDistance)}_bindTypeDropdown(){this.typeBtn.addEventListener("click",e=>{e.stopPropagation(),this._toggleTypeMenu()}),this.typeMenu.querySelectorAll(".search-type-option").forEach(e=>{e.addEventListener("click",()=>{const t=m.find(s=>s.id===e.dataset.type);t&&this._selectType(t)})}),document.addEventListener("click",()=>this._closeTypeMenu())}_toggleTypeMenu(){this.typeMenu.classList.contains("show")?this._closeTypeMenu():this._openTypeMenu()}_openTypeMenu(){this._positionBelow(this.typeBtn,this.typeMenu),this.typeMenu.classList.add("show"),this.typeBtn.classList.add("open")}_closeTypeMenu(){this.typeMenu.classList.remove("show"),this.typeBtn.classList.remove("open")}_positionBelow(e,t){const s=e.getBoundingClientRect();t.style.top=`${s.bottom+4}px`,t.style.left=`${s.left}px`,t.style.maxWidth=`${window.innerWidth-s.left-8}px`}_selectType(e){this.currentType=e,this._lastResults=null,this._applyTypeUI(e),this._closeTypeMenu(),this._closeSuggestions(),this.searchInput.value="",this.searchInput.focus(),this.resultsPanel&&(this.resultsPanel.innerHTML="",this.resultsPanel.classList.remove("active")),this.onShowBooks()}_applyTypeUI(e){this.typeBtn.innerHTML=`<span>${e.icon} ${e.label}</span><span class="arrow">▾</span>`,this.searchInput.placeholder=e.placeholder,this.typeMenu.querySelectorAll(".search-type-option").forEach(t=>{t.classList.toggle("selected",t.dataset.type===e.id)}),this.ftsBar.classList.toggle("show",e.hasFtsOptions)}_applyFtsModeUI(e){this.ftsModeId=e,this.ftsBar.querySelectorAll(".fts-chip").forEach(t=>{t.classList.toggle("active",t.dataset.mode===e)}),this.distanceWrap.classList.toggle("show",e==="distance")}_applyFtsDistanceUI(e){this.ftsDistance=e,this.distanceNum.value=e}_onFilterChange(){if(!(!this._lastResults||!this._lastQuery)){if(this._lastType==="headings"){const e=this.bookFilter.filterResults(this._lastResults);this._renderHeadingResults(e,this._lastQuery)}else if(this._lastType==="pali-def"){const e=this.bookFilter.filterResults(this._lastResults);this._renderDictResults(e,this._lastQuery)}}}_bindFtsOptions(){this.ftsBar.querySelectorAll(".fts-chip").forEach(e=>{e.addEventListener("click",()=>{this._applyFtsModeUI(e.dataset.mode)})}),this.distanceNum.addEventListener("change",()=>{const e=Math.max(1,parseInt(this.distanceNum.value)||2);this._applyFtsDistanceUI(e)})}_bindInput(){this.searchInput.addEventListener("input",()=>this._onInput()),this.searchInput.addEventListener("keydown",e=>this._onKeydown(e)),this.searchInput.addEventListener("blur",()=>{setTimeout(()=>this._closeSuggestions(),160)}),this.removePaliHandler=P(this.searchInput,{mode:"both",onConvert:e=>{const t=e.trim();if(!t){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(t),220))}})}_onInput(){const e=this.searchInput.value.trim();if(!e){this._closeSuggestions();return}this.currentType.hasAutocomplete&&(clearTimeout(this._acDebounce),this._acDebounce=setTimeout(()=>this._fetchSuggestions(e),220))}async _fetchSuggestions(e){this._acController&&this._acController.abort(),this._acController=new AbortController,this._showSuggestionsLoading();try{let t;if(this.currentType.id==="headings")t=`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.id==="pali-def")t=`${this.baseUrl}/api/bold_suggest?q=${encodeURIComponent(e)}&limit=12`;else if(this.currentType.autocompleteMode==="word"){const n=e.split(/\s+/).pop();if(!n){this._closeSuggestions();return}t=`${this.baseUrl}/api/suggest_word?q=${encodeURIComponent(n)}&limit=10`}else return;const i=await(await fetch(t,{signal:this._acController.signal})).json();if(this.currentType.autocompleteMode==="word")this._renderWordSuggestions(i,e);else{const n=this.bookFilter.filterResults(i);this._renderSuggestions(n,e)}}catch(t){t.name!=="AbortError"&&this._closeSuggestions()}}_renderWordSuggestions(e,t){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!e?.length){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No suggestions</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e.map(l=>({_word:l})),this._focusedIdx=-1;const s=t.split(/\s+/).pop(),i=t.slice(0,t.length-s.length),n=l=>l.replace(new RegExp(`^(${y(s)})`,"i"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((l,d)=>`<div class="suggestion-item suggestion-word" data-idx="${d}" tabindex="-1">
        <span class="sug-pali">${n(l)}</span>
      </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-word").forEach(l=>{l.addEventListener("mousedown",d=>{d.preventDefault();const u=this._suggestions[parseInt(l.dataset.idx)]?._word;u&&(this.searchInput.value=i+u+" ",this._closeSuggestions(),this.searchInput.focus())})})}_showSuggestionsLoading(){this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,this.suggestionsEl.innerHTML='<div class="suggestion-loading">Searching…</div>',this.suggestionsEl.classList.add("show"),this._focusedIdx=-1,this._suggestions=[]}_renderSuggestions(e,t){if(this._positionBelow(this.searchInput,this.suggestionsEl),this.suggestionsEl.style.width=`${this.searchInput.getBoundingClientRect().width}px`,!e?.length){this.suggestionsEl.innerHTML='<div class="suggestion-empty">No results</div>',this.suggestionsEl.classList.add("show"),this._suggestions=[];return}this._suggestions=e,this._focusedIdx=-1;const s=i=>i.replace(new RegExp(`(${y(t)})`,"gi"),"<mark>$1</mark>");this.suggestionsEl.innerHTML=e.map((i,n)=>this.currentType.id==="headings"?`<div class="suggestion-item" data-idx="${n}" tabindex="-1">
          <span class="sug-pali">${s(i.title||"")}</span>
          <span class="sug-book">${i.book_name||i.book_id||""}</span>
          <span class="sug-para">#${i.para_id||""}</span>
        </div>`:`<div class="suggestion-item" data-idx="${n}" tabindex="-1">
          <span class="sug-pali">${s(i.word||i.title||"")}</span>
          <span class="sug-book">${i.definition_short||""}</span>
        </div>`).join(""),this.suggestionsEl.classList.add("show"),this.suggestionsEl.querySelectorAll(".suggestion-item").forEach(i=>{i.addEventListener("mousedown",n=>{n.preventDefault(),this._selectSuggestion(parseInt(i.dataset.idx))})})}_selectSuggestion(e){const t=this._suggestions[e];if(t){if(t._word!==void 0){const s=this.searchInput.value,i=s.split(/\s+/).pop(),n=s.slice(0,s.length-i.length);this.searchInput.value=n+t._word+" ",this._closeSuggestions(),this.searchInput.focus();return}this._closeSuggestions(),this.currentType.id==="headings"?this.onResultSelect(`${this.baseUrl}/book/${t.book_id}?para=${t.para_id}`):this.currentType.id==="pali-def"&&this.onResultSelect(`${this.baseUrl}/book/${t.book_id}?para=${t.para_id}&line=${t.line_id}`)}}_closeSuggestions(){this.suggestionsEl.classList.remove("show"),this.suggestionsEl.innerHTML="",this._focusedIdx=-1,this._suggestions=[]}_onKeydown(e){const t=this.suggestionsEl.querySelectorAll(".suggestion-item");if(t.length&&this.suggestionsEl.classList.contains("show")){if(e.key==="ArrowDown"){e.preventDefault(),this._focusedIdx=Math.min(this._focusedIdx+1,t.length-1),this._updateFocused(t);return}if(e.key==="ArrowUp"){e.preventDefault(),this._focusedIdx=Math.max(this._focusedIdx-1,-1),this._updateFocused(t);return}if(e.key==="Enter"&&this._focusedIdx>=0){e.preventDefault(),this._selectSuggestion(this._focusedIdx);return}if(e.key==="Escape"){this._closeSuggestions();return}}e.key==="Enter"&&(e.preventDefault(),this._executeSearch())}_updateFocused(e){e.forEach((t,s)=>t.classList.toggle("focused",s===this._focusedIdx)),this._focusedIdx>=0&&e[this._focusedIdx].scrollIntoView({block:"nearest"})}_bindGoButton(){this.goBtn.addEventListener("click",()=>this._executeSearch())}async _executeSearch(){const e=this.searchInput.value.trim();if(!e)return;this._closeSuggestions();const t=this.currentType;if(t.id==="headings"){this._showResultsLoading();const s=await this._apiFetch(`${this.baseUrl}/api/search_headings?q=${encodeURIComponent(e)}&limit=30`);this._lastResults=s||[],this._lastQuery=e,this._lastType="headings",this._renderHeadingResults(this.bookFilter.filterResults(this._lastResults),e)}else if(t.id==="fulltext")this._ftsPage=1,await this._executeFtsSearch(e);else if(t.id==="pali-def"){this._showResultsLoading();const s=await this._apiFetch(`${this.baseUrl}/api/bold_definition?q=${encodeURIComponent(e)}&limit=80`);this._lastResults=s||[],this._lastQuery=e,this._lastType="pali-def",this._renderDictResults(this.bookFilter.filterResults(this._lastResults),e)}else if(t.id==="ai"){const s=new URLSearchParams({q:e,mode:"ai"});this._appendFilterParams(s),window.location.href=`${this.baseUrl}/search?${s}`}}_appendFilterParams(e){const{pitakas:t,layers:s}=this.bookFilter.getFilterParams();t.length&&e.set("pitakas",t.join(",")),s.length&&e.set("layers",s.join(","))}_showResultsLoading(){this.onShowResults(),this.resultsPanel.innerHTML='<div class="hd-loading">Searching…</div>'}_renderHeadingResults(e,t){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const s=i=>i.replace(new RegExp(`(${y(t)})`,"gi"),"<mark>$1</mark>");this.resultsPanel.innerHTML=e.map(i=>`
      <a href="${this.baseUrl}/book/${i.book_id}?para=${i.para_id}"
         class="search-result-item"
         data-url="${this.baseUrl}/book/${i.book_id}?para=${i.para_id}">
        <div class="search-result-book">${i.book_name||i.book_id}</div>
        <div class="search-result-heading">${s(i.title||"")}</div>
        <div class="search-result-meta">Paragraph ${i.para_id}</div>
      </a>
    `).join(""),this.resultsPanel.querySelectorAll(".search-result-item").forEach(i=>{i.addEventListener("click",n=>{n.preventDefault(),this.onResultSelect(i.dataset.url)})})}_renderDictResults(e,t){if(this.onShowResults(),!e.length){this.resultsPanel.innerHTML='<div class="hd-empty">No definitions found.</div>';return}const s=r=>r.replace(new RegExp(`(${y(t)})`,"gi"),"<mark>$1</mark>"),i=new Map;for(const r of e)i.has(r.book_id)||i.set(r.book_id,{book_id:r.book_id,book_name:r.book_name||r.book_id,items:[]}),i.get(r.book_id).items.push(r);const n=i.size,l=e.length;let d=`<div class="dict-results-summary">${l} result${l!==1?"s":""} in ${n} book${n!==1?"s":""}</div>`,u=0;for(const[,r]of i){const h=`dict-group-${u++}`,f=u===1;d+=`
        <div class="dict-book-group ${f?"expanded":""}" id="${h}">
          <button class="dict-book-header" data-group="${h}" aria-expanded="${f}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${r.book_name}</span>
            <span class="dict-book-count">${r.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${r.items.map(c=>`
              <a href="${this.baseUrl}/book/${c.book_id}?para=${c.para_id}&line=${c.line_id}"
                 class="search-result-item dict-entry"
                 data-url="${this.baseUrl}/book/${c.book_id}?para=${c.para_id}&line=${c.line_id}">
                <div class="search-result-heading">${s(c.title||"")}</div>
                ${c.definition_pali?`<div class="search-result-meta pali">${c.definition_pali}</div>`:""}
                ${c.definition_en?`<div class="search-result-meta translation">${c.definition_en}</div>`:""}
              </a>
            `).join("")}
          </div>
        </div>`}this.resultsPanel.innerHTML=d,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(r=>{r.addEventListener("click",()=>{const h=document.getElementById(r.dataset.group);if(!h)return;const f=h.classList.contains("expanded");h.classList.toggle("expanded",!f),r.setAttribute("aria-expanded",String(!f))})}),this.resultsPanel.querySelectorAll(".search-result-item").forEach(r=>{r.addEventListener("click",h=>{h.preventDefault(),this.onResultSelect(r.dataset.url)})})}async _executeFtsSearch(e,t=null){if(this._ftsLoading)return;this._ftsLoading=!0,t!==null&&(this._ftsPage=t);const s=new URLSearchParams({q:e,page:this._ftsPage,limit:20});this.ftsModeId==="distance"?(s.set("mode","distance"),s.set("distance",this.ftsDistance)):this.ftsModeId==="para"?s.set("mode","para"):s.set("mode","exact");const{pitakas:i,layers:n}=this.bookFilter.getFilterParams();i.length&&s.set("pitakas",i.join(",")),n.length&&s.set("layers",n.join(",")),this._showResultsLoading();const l=await this._apiFetch(`${this.baseUrl}/api/fts_search?${s}`);if(this._ftsLoading=!1,!l){this.resultsPanel.innerHTML='<div class="hd-empty">Search failed. Please try again.</div>';return}this._ftsTotalPages=l.pages||1,this._ftsWords=l.words||[],this._lastResults=l.results||[],this._lastQuery=e,this._lastType="fulltext",this._renderFtsResults(l,e)}_renderFtsResults(e,t){this.onShowResults();const s=e.results||[],i=e.words||[t];if(!s.length){this.resultsPanel.innerHTML='<div class="hd-empty">No results found.</div>';return}const n=new RegExp(`(${i.map(c=>y(c)).join("|")})`,"gi"),l=c=>(c||"").replace(n,"<mark>$1</mark>"),d=e.total||0,u=e.page||1,r=e.pages||1;let h=`<div class="dict-results-summary">${d.toLocaleString()} result${d!==1?"s":""} &mdash; page ${u} of ${r}</div>`,f=0;for(const c of s){const o=`fts-group-${f++}`,p=f===1;h+=`
        <div class="dict-book-group ${p?"expanded":""}" id="${o}">
          <button class="dict-book-header" data-group="${o}" aria-expanded="${p}">
            <span class="dict-book-caret">▶</span>
            <span class="dict-book-name">${c.book_name}</span>
            <span class="dict-book-count">${c.items.length}</span>
          </button>
          <div class="dict-book-body">
            ${c.items.map(g=>{const b=`${this.baseUrl}/book/${g.book_id}?para=${g.para_id}`;return`
                <a href="${b}" class="search-result-item dict-entry fts-entry" data-url="${b}">
                  ${g.pali?`<div class="fts-pali">${l(g.pali)}</div>`:""}
                  ${g.english?`<div class="fts-english">${l(g.english)}</div>`:""}
                  <div class="fts-meta">para ${g.para_id}</div>
                </a>`}).join("")}
          </div>
        </div>`}r>1&&(h+=`
        <div class="fts-pagination">
          <button class="fts-page-btn" id="fts-prev" ${u<=1?"disabled":""}>← Prev</button>
          <span class="fts-page-info">Page ${u} / ${r}</span>
          <button class="fts-page-btn" id="fts-next" ${u>=r?"disabled":""}>Next →</button>
        </div>`),this.resultsPanel.innerHTML=h,this.resultsPanel.querySelectorAll(".dict-book-header").forEach(c=>{c.addEventListener("click",()=>{const o=document.getElementById(c.dataset.group);if(!o)return;const p=o.classList.contains("expanded");o.classList.toggle("expanded",!p),c.setAttribute("aria-expanded",String(!p))})}),this.resultsPanel.querySelectorAll(".fts-entry").forEach(c=>{c.addEventListener("click",o=>{o.preventDefault(),this.onResultSelect(c.dataset.url)})}),this.resultsPanel.querySelector("#fts-prev")?.addEventListener("click",()=>{this._executeFtsSearch(this._lastQuery,this._ftsPage-1)}),this.resultsPanel.querySelector("#fts-next")?.addEventListener("click",()=>{this._executeFtsSearch(this._lastQuery,this._ftsPage+1)})}async _apiFetch(e){try{return await(await fetch(e)).json()}catch{return null}}}function y(a){return a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function C(a,e){if(!e)return a;const t=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return a.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}const I=["Mūla","Aṭṭhakathā","Ṭīkā"],D=["Vinaya","Suttanta","Sutta","Abhidhamma"];class H{constructor({baseUrl:e,menu:t,onNavigate:s}){this.baseUrl=e,this.menu=t,this.onNavigate=s,this._filterText=""}buildHTML(){const e=this._resolvedCategories(),t=e.map((i,n)=>`
      <button class="home-tab${n===0?" active":""}"
              data-tab="${n}" type="button">${i.label}</button>
    `).join(""),s=e.map((i,n)=>`
      <div class="home-tab-panel${n===0?" active":""}" data-panel="${n}">
        ${this._buildCategoryHTML(i)}
      </div>
    `).join("");return`
      <div id="home-tabs">${t}</div>
      <div id="home-tab-panels-wrap"
           style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        ${s}
        <div id="home-results-panel"></div>
      </div>
    `}bindTabs(){const e=document.querySelectorAll(".home-tab"),t=document.querySelectorAll(".home-tab-panel");e.forEach(s=>{s.addEventListener("click",()=>{const i=parseInt(s.dataset.tab);e.forEach(n=>n.classList.toggle("active",n===s)),t.forEach(n=>n.classList.toggle("active",parseInt(n.dataset.panel)===i)),document.getElementById("home-results-panel")?.classList.remove("active")})}),document.querySelectorAll(".book-nikaya-title").forEach(s=>{s.addEventListener("click",()=>{s.classList.toggle("open"),s.nextElementSibling?.classList.toggle("open")})}),document.querySelectorAll(".book-entry").forEach(s=>{s.addEventListener("click",i=>{i.preventDefault(),this.onNavigate(s.href)})})}filter(e){this._filterText=e.toLowerCase().trim(),document.querySelectorAll(".home-tab-panel").forEach(t=>{t.querySelectorAll(".book-entry").forEach(s=>{const i=s.querySelector(".book-name")?.textContent?.toLowerCase()||"",n=!this._filterText||i.includes(this._filterText);if(s.style.display=n?"":"none",this._filterText&&n){const l=s.querySelector(".book-name");l&&(l.innerHTML=C(l.textContent,this._filterText))}}),t.querySelectorAll(".book-nikaya").forEach(s=>{const i=[...s.querySelectorAll(".book-entry")].some(n=>n.style.display!=="none");s.style.display=i?"":"none",this._filterText&&(s.querySelector(".book-nikaya-title")?.classList.add("open"),s.querySelector(".book-nikaya-list")?.classList.add("open"))}),t.querySelectorAll(".book-category").forEach(s=>{const i=[...s.querySelectorAll(".book-entry")].some(n=>n.style.display!=="none");s.style.display=i?"":"none"})})}clearFilter(){this._filterText="",document.querySelectorAll(".book-entry").forEach(e=>{e.style.display="";const t=e.querySelector(".book-name");t&&(t.textContent=t.textContent)}),document.querySelectorAll(".book-nikaya, .book-category").forEach(e=>{e.style.display=""})}_resolvedCategories(){const e=Object.keys(this.menu);return[...I.filter(s=>e.includes(s)),...e.filter(s=>!I.includes(s))].map(s=>({label:s,data:this.menu[s]}))}_buildCategoryHTML({data:e}){return!e||typeof e!="object"?"":Object.keys(e).sort((s,i)=>{const n=l=>{const d=D.findIndex(u=>l.includes(u));return d===-1?99:d};return n(s)-n(i)}).map(s=>`
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
    `).join(""):""}}class U{constructor(e,t){this._key=e,this._defaults=t,this._data=this._load()}get(e){return this._data[e]}set(e,t){this._data[e]=t,this._save()}patch(e){Object.assign(this._data,e),this._save()}snapshot(){return{...this._data}}_load(){try{const e=localStorage.getItem(this._key);return e?{...this._defaults,...JSON.parse(e)}:{...this._defaults}}catch{return{...this._defaults}}}_save(){try{localStorage.setItem(this._key,JSON.stringify(this._data))}catch{}}}function W({triggerSelector:a,baseUrl:e,menu:t}){if(document.getElementById("home-dialog-overlay"))return;const s=document.querySelector(a);if(!s){console.warn("[HomeDialog] trigger not found:",a);return}const i=new U("homeDialog_state",{searchQuery:"",searchTypeId:m[0]?.id??"",ftsModeId:k[0]?.id??"",ftsDistance:2,activeTabId:null}),n=new H({baseUrl:e,menu:t,onNavigate:o=>{h(),window.location.href=o}}),l=new q({baseUrl:e,initialState:{searchTypeId:i.get("searchTypeId"),ftsModeId:i.get("ftsModeId"),ftsDistance:i.get("ftsDistance")},onResultSelect:o=>{h(),window.location.href=o},onShowResults:()=>f(),onShowBooks:()=>c()}),d=document.createElement("div");d.id="home-dialog-overlay",d.setAttribute("role","dialog"),d.setAttribute("aria-modal","true"),d.setAttribute("aria-label","Browse books"),d.innerHTML=`
    <div id="home-dialog" role="document">

      <div id="home-dialog-header">
        <div id="home-dialog-title">
          <span>E-Piṭaka</span>
          <button id="home-dialog-close" aria-label="Close">✕</button>
        </div>

        <div id="home-search-row">
          <div style="position:relative">
            <button id="search-type-btn" type="button" aria-haspopup="true">
              <span>${j(i.get("searchTypeId"))}</span>
              <span class="arrow">▾</span>
            </button>
            <div id="search-type-menu" role="listbox">
              ${m.map(o=>`
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
                   value="${N(i.get("searchQuery"))}">
            <div id="home-suggestions" role="listbox" aria-label="Suggestions"></div>
          </div>

          <button id="home-search-go" type="button">Go</button>
        </div>

        <div id="fts-options-bar">
          <span class="fts-label">Match:</span>
          ${k.map(o=>`
            <button class="fts-chip${o.id===i.get("ftsModeId")?" active":""}"
                    data-mode="${o.id}" type="button">${o.label}</button>
          `).join("")}
          <div id="fts-distance-wrap">
            <label for="fts-distance-num">words apart:</label>
            <input id="fts-distance-num" type="number" min="1" max="50"
                   value="${Number.isFinite(i.get("ftsDistance"))?i.get("ftsDistance"):2}">
          </div>
        </div>
        <div id="home-filter-wrap"></div>
      </div>

      <div id="home-dialog-body">
        ${n.buildHTML()}
      </div>

    </div>
  `,document.body.appendChild(d);const u=i.get("activeTabId");if(u){const o=document.querySelector(`.home-tab[data-tab="${u}"]`),p=document.querySelector(`.home-tab-panel[data-panel="${u}"]`);o&&p&&(document.querySelectorAll(".home-tab, .home-tab-panel").forEach(g=>g.classList.remove("active")),o.classList.add("active"),p.classList.add("active"))}s.addEventListener("click",o=>{o.preventDefault(),r()}),document.getElementById("home-dialog-close").addEventListener("click",h),d.addEventListener("click",o=>{o.target===d&&h()}),document.addEventListener("keydown",o=>{o.key==="Escape"&&d.classList.contains("show")&&h()}),n.bindTabs(),d.addEventListener("click",o=>{const p=o.target.closest(".home-tab");p?.dataset.tab&&i.set("activeTabId",p.dataset.tab)}),l.bind(),document.getElementById("search-type-menu").addEventListener("click",o=>{const p=o.target.closest(".search-type-option");p&&i.set("searchTypeId",p.dataset.type)}),document.getElementById("fts-options-bar").addEventListener("click",o=>{const p=o.target.closest(".fts-chip");p&&i.set("ftsModeId",p.dataset.mode)}),document.getElementById("fts-distance-num").addEventListener("change",o=>{const p=parseInt(o.target.value,10);Number.isFinite(p)&&i.set("ftsDistance",p)}),document.getElementById("home-search-input").addEventListener("input",o=>{i.set("searchQuery",o.target.value);const p=o.target.value.trim();p?l.currentType.id==="headings"&&n.filter(p):n.clearFilter()});function r(){d.classList.add("show"),document.body.style.overflow="hidden",setTimeout(()=>document.getElementById("home-search-input")?.focus(),60)}function h(){d.classList.remove("show"),document.body.style.overflow=""}function f(){document.querySelectorAll(".home-tab-panel").forEach(o=>o.classList.remove("active")),document.querySelectorAll(".home-tab").forEach(o=>o.classList.remove("active")),document.getElementById("home-results-panel")?.classList.add("active")}function c(){document.getElementById("home-results-panel")?.classList.remove("active");const o=i.get("activeTabId"),p=o&&document.querySelector(`.home-tab[data-tab="${o}"]`),g=o&&document.querySelector(`.home-tab-panel[data-panel="${o}"]`);p&&g?(p.classList.add("active"),g.classList.add("active")):(document.querySelector(".home-tab-panel")?.classList.add("active"),document.querySelector(".home-tab")?.classList.add("active"))}return{open:r,close:h}}function j(a){const e=m.find(t=>t.id===a);return e?`${e.icon} ${e.label}`:"☰ Search Headings"}function N(a){return String(a??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}export{W as a,P as i,O as r};

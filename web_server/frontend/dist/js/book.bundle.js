import{i as Hn,l as Dt,S as _t,T as qe,a as rs,H as Z,b as os,r as ze,c as as,d as cs,p as ls,e as Vn,f as ds,s as us,g as hs,h as Wn,j as fs}from"./cookie-consent-D4J6y3b6.chunk.js";const{bookId:kl,baseUrl:jn,bookref:Tl}=window.BOOK_CONFIG;let v,M,N,Qt=!1,Me=null,I=-1;function ps(){if(!Qt){if(Qt=!0,v=document.getElementById("dict-word-input"),M=document.getElementById("dict-suggestions"),N=document.getElementById("dict-results"),!v){console.warn("[dict] #dict-word-input not found — sidebar may not have rendered yet");return}Hn(v,{mode:"both"}),v.addEventListener("input",()=>{const t=v.value.trim();if(I=-1,!t){Y();return}ys(t)}),v.addEventListener("keydown",t=>{const e=M.querySelectorAll(".dict-suggestion-item");t.key==="ArrowDown"?(t.preventDefault(),I=Math.min(I+1,e.length-1),Zt(e)):t.key==="ArrowUp"?(t.preventDefault(),I=Math.max(I-1,-1),Zt(e)):t.key==="Enter"?(t.preventDefault(),I>=0&&e[I]?Ge(e[I].dataset.word):Ge(v.value.trim())):t.key==="Escape"&&Y()}),document.addEventListener("click",t=>{!t.target.closest(".sb-dict-header")&&t.target!==v&&Y()})}}function ms(t){t.querySelectorAll(".sentence-row .pali-text").forEach(e=>{e.hasAttribute("title")||e.setAttribute("title","Click a word to look it up in the dictionary"),e.addEventListener("click",gs)})}function gs(t){const e=window.getSelection();if(e&&e.toString().trim())return;const n=Ss(t);if(!n)return;const i=Dt();let s=n;if(i.paliScript!==_t.RO){const r=qe.convertFrom(n,i.paliScript);s=qe.convert(r,_t.RO)}s=s.trim().replace(/[.,;:!?()[\]{}'"]/g,"").toLowerCase(),s&&bs(s)}function bs(t){if(!v)return;v.value=t,Y();const e=document.querySelector('#sb-activity .sb-activity-btn[data-panel="dict"]');e&&e.click(),qn(t)}async function qn(t){if(!(!t||!N)){N.innerHTML='<div class="dict-loading">Looking up…</div>';try{const n=await(await fetch(`${jn}/api/dictionary?word=${encodeURIComponent(t)}`)).json();vs(n)}catch{N.innerHTML='<div class="dict-error">Lookup failed.</div>'}}}async function ys(t){Me&&Me.abort(),Me=new AbortController;try{const n=await(await fetch(`${jn}/api/suggest_word?q=${encodeURIComponent(t)}`,{signal:Me.signal})).json();_s(n)}catch(e){e.name!=="AbortError"&&Y()}}function _s(t){if(!(t!=null&&t.length)||!M){Y();return}M.innerHTML=t.map(e=>`
    <li class="dict-suggestion-item"
        role="option"
        data-word="${e}"
        tabindex="-1">
      <span class="suggest-word pali-text">${e}</span>
    </li>
  `).join(""),M.querySelectorAll(".dict-suggestion-item").forEach(e=>{e.addEventListener("mousedown",n=>{n.preventDefault(),Ge(e.dataset.word)})}),M.classList.add("open")}function Zt(t){var e;t.forEach((n,i)=>n.classList.toggle("active",i===I)),I>=0&&((e=t[I])==null||e.scrollIntoView({block:"nearest"}))}function Ge(t){!t||!v||(v.value=t,Y(),qn(t))}function Y(){M&&(M.innerHTML="",M.classList.remove("open")),I=-1}function vs(t){if(!(t!=null&&t.length)||!N){N&&(N.innerHTML='<p class="dict-empty">No results found.</p>');return}let e="",n=null;for(const i of t){if(i.type==="deconstruction"){e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>
        ${Is(i)}
      </div>`;continue}i.book_name!==n&&(n&&(e+="</div>"),e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>`,n=i.book_name),e+=`<div class="dict-entry">
      <div class="dict-entry-word">${i.word}</div>
      <div class="dict-entry-def">${i.definition}</div>
      ${ws(i.usages||[])}
    </div>`}n&&(e+="</div>"),N.innerHTML=e,N.querySelectorAll(".decon-part").forEach(i=>{const s=i.dataset.word;s&&i.addEventListener("click",r=>{r.stopPropagation(),Ge(s)})})}function Is(t){const e=t.components||[];if(!e.length)return"";const n=e.map((i,s)=>{const r=s===e.length-1;return`
      <span class="decon-part" data-word="${S(i)}" tabindex="0" role="button">
        <span class="decon-part-word">${S(i)}</span>
      </span>
      ${r?"":'<span class="decon-plus">+</span>'}`}).join("");return`<div class="decon-card">
    <div class="decon-formula">
      <span class="decon-original-word">${S(t.word)}</span>
      <span class="decon-arrow">→</span>
      <span class="decon-breakdown">${n}</span>
    </div>
  </div>`}function ws(t){return t.length?`<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${t.map(n=>{const i=n.word+(n.ending||""),s=Es(n.pali||"",i),r=n.translation;return`<div class="dict-usage">
      <div class="dict-usage-pali">${s}</div>
      ${r?`<div class="dict-usage-trans">${S(r)}</div>`:""}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${S(n.book_name)}</span>
        <a class="dict-usage-open" href="${S(n.reader_url)}" target="_blank" rel="noopener">↗</a>
      </div>
    </div>`}).join("")}
  </div>`:""}function Es(t,e){if(!e||!t)return S(t);const n=t.toLowerCase().indexOf(e.toLowerCase());return n===-1?S(t):S(t.slice(0,n))+`<mark>${S(t.slice(n,n+e.length))}</mark>`+S(t.slice(n+e.length))}function S(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ss(t){var a,c,l,d;if(!document.caretRangeFromPoint)return null;const e=document.caretRangeFromPoint(t.clientX,t.clientY);if(!e)return null;const n=e.startContainer,i=e.startOffset;if(n.nodeType!==Node.TEXT_NODE)return null;const s=n.textContent,r=((c=(a=n.parentElement)==null?void 0:a.closest("[lang]"))==null?void 0:c.getAttribute("lang"))||"en",o=((d=(l=n.parentElement)==null?void 0:l.closest("[data-script]"))==null?void 0:d.getAttribute("data-script"))||null;return ks(s,i,r,o)}function ks(t,e,n,i){const s=["ro","si","hi","be","as","gm","gj","te","ka","mm","tb","cy","br"];return["en","in","es","pt","hi","si","ch"].includes(n)||s.includes(i)?Ts(t,e):typeof Intl<"u"&&Intl.Segmenter?As(t,e,n):zn(t,e)}function Ts(t,e){const n=/[\s\u200b\u00a0।॥၊။,\.\!\?;:\"\'()\[\]{}<>\/\\]/,i=t[e];if(i===void 0||n.test(i))return null;let s=e,r=e;for(;s>0&&!n.test(t[s-1]);)s--;for(;r<t.length&&!n.test(t[r]);)r++;return t.slice(s,r).trim()||null}function As(t,e,n){const s={th:"th",my:"my",lo:"lo",km:"km",tt:"th",en:"en",hi:"hi",si:"si",be:"bn",as:"as",gm:"pa",gj:"gu",te:"te",ka:"kn",mm:"ml",tb:"bo",cy:"ru"}[n]||n;try{const o=[...new Intl.Segmenter(s,{granularity:"word"}).segment(t)];for(const a of o){const c=a.index,l=a.index+a.segment.length;if(e>=c&&e<=l)return a.isWordLike===!1?null:a.segment.trim()||null}}catch{}return zn(t,e)}function zn(t,e){const n=[[3584,3711],[3712,3839],[4096,4255],[6016,6143],[6688,6831]];function i(a){const c=a.codePointAt(0);return n.some(([l,d])=>c>=l&&c<=d)}const s=t[e];if(s===void 0||!i(s))return null;let r=e,o=e;for(;r>0&&i(t[r-1]);)r--;for(;o<t.length&&i(t[o]);)o++;return t.slice(r,o).trim()||null}const Cs=()=>{};var en={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn=function(t){const e=[];let n=0;for(let i=0;i<t.length;i++){let s=t.charCodeAt(i);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&i+1<t.length&&(t.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++i)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},Ls=function(t){const e=[];let n=0,i=0;for(;n<t.length;){const s=t[n++];if(s<128)e[i++]=String.fromCharCode(s);else if(s>191&&s<224){const r=t[n++];e[i++]=String.fromCharCode((s&31)<<6|r&63)}else if(s>239&&s<365){const r=t[n++],o=t[n++],a=t[n++],c=((s&7)<<18|(r&63)<<12|(o&63)<<6|a&63)-65536;e[i++]=String.fromCharCode(55296+(c>>10)),e[i++]=String.fromCharCode(56320+(c&1023))}else{const r=t[n++],o=t[n++];e[i++]=String.fromCharCode((s&15)<<12|(r&63)<<6|o&63)}}return e.join("")},Kn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<t.length;s+=3){const r=t[s],o=s+1<t.length,a=o?t[s+1]:0,c=s+2<t.length,l=c?t[s+2]:0,d=r>>2,u=(r&3)<<4|a>>4;let h=(a&15)<<2|l>>6,p=l&63;c||(p=64,o||(h=64)),i.push(n[d],n[u],n[h],n[p])}return i.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Gn(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Ls(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<t.length;){const r=n[t.charAt(s++)],a=s<t.length?n[t.charAt(s)]:0;++s;const l=s<t.length?n[t.charAt(s)]:64;++s;const u=s<t.length?n[t.charAt(s)]:64;if(++s,r==null||a==null||l==null||u==null)throw new Ps;const h=r<<2|a>>4;if(i.push(h),l!==64){const p=a<<4&240|l>>2;if(i.push(p),u!==64){const m=l<<6&192|u;i.push(m)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Ps extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Rs=function(t){const e=Gn(t);return Kn.encodeByteArray(e,!0)},Jn=function(t){return Rs(t).replace(/\./g,"")},Yn=function(t){try{return Kn.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ns(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Os=()=>Ns().__FIREBASE_DEFAULTS__,Ds=()=>{if(typeof process>"u"||typeof en>"u")return;const t=en.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Ms=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Yn(t[1]);return e&&JSON.parse(e)},Mt=()=>{try{return Cs()||Os()||Ds()||Ms()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Us=t=>{var e,n;return(n=(e=Mt())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Xn=()=>{var t;return(t=Mt())==null?void 0:t.config},Qn=t=>{var e;return(e=Mt())==null?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,i)=>{n?this.reject(n):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,i))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Bs(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(y())}function xs(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Fs(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Hs(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Vs(){const t=y();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Ws(){try{return typeof indexedDB=="object"}catch{return!1}}function js(){return new Promise((t,e)=>{try{let n=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(i),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var r;e(((r=s.error)==null?void 0:r.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs="FirebaseError";class q extends Error{constructor(e,n,i){super(n),this.code=e,this.customData=i,this.name=qs,Object.setPrototypeOf(this,q.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Te.prototype.create)}}class Te{constructor(e,n,i){this.service=e,this.serviceName=n,this.errors=i}create(e,...n){const i=n[0]||{},s=`${this.service}/${e}`,r=this.errors[e],o=r?zs(r,i):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new q(s,a,i)}}function zs(t,e){return t.replace(Gs,(n,i)=>{const s=e[i];return s!=null?String(s):`<${i}?>`})}const Gs=/\{\$([^}]+)}/g;function Ks(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function le(t,e){if(t===e)return!0;const n=Object.keys(t),i=Object.keys(e);for(const s of n){if(!i.includes(s))return!1;const r=t[s],o=e[s];if(tn(r)&&tn(o)){if(!le(r,o))return!1}else if(r!==o)return!1}for(const s of i)if(!n.includes(s))return!1;return!0}function tn(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ae(t){const e=[];for(const[n,i]of Object.entries(t))Array.isArray(i)?i.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}function Js(t,e){const n=new Ys(t,e);return n.subscribe.bind(n)}class Ys{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,i){let s;if(e===void 0&&n===void 0&&i===void 0)throw new Error("Missing Observer.");Xs(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:i},s.next===void 0&&(s.next=dt),s.error===void 0&&(s.error=dt),s.complete===void 0&&(s.complete=dt);const r=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),r}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Xs(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function dt(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(t){return t&&t._delegate?t._delegate:t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Qs(t){return(await fetch(t,{credentials:"include"})).ok}class de{constructor(e,n,i){this.name=e,this.instanceFactory=n,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const K="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zs{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const i=new $s;if(this.instancesDeferred.set(n,i),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&i.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(tr(e))try{this.getOrInitializeService({instanceIdentifier:K})}catch{}for(const[n,i]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const r=this.getOrInitializeService({instanceIdentifier:s});i.resolve(r)}catch{}}}}clearInstance(e=K){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=K){return this.instances.has(e)}getOptions(e=K){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:i,options:n});for(const[r,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(r);i===a&&o.resolve(s)}return s}onInit(e,n){const i=this.normalizeInstanceIdentifier(n),s=this.onInitCallbacks.get(i)??new Set;s.add(e),this.onInitCallbacks.set(i,s);const r=this.instances.get(i);return r&&e(r,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const i=this.onInitCallbacks.get(n);if(i)for(const s of i)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:er(e),options:n}),this.instances.set(e,i),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=K){return this.component?this.component.multipleInstances?e:K:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function er(t){return t===K?void 0:t}function tr(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Zs(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var g;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(g||(g={}));const ir={debug:g.DEBUG,verbose:g.VERBOSE,info:g.INFO,warn:g.WARN,error:g.ERROR,silent:g.SILENT},sr=g.INFO,rr={[g.DEBUG]:"log",[g.VERBOSE]:"log",[g.INFO]:"info",[g.WARN]:"warn",[g.ERROR]:"error"},or=(t,e,...n)=>{if(e<t.logLevel)return;const i=new Date().toISOString(),s=rr[e];if(s)console[s](`[${i}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Zn{constructor(e){this.name=e,this._logLevel=sr,this._logHandler=or,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in g))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ir[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,g.DEBUG,...e),this._logHandler(this,g.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,g.VERBOSE,...e),this._logHandler(this,g.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,g.INFO,...e),this._logHandler(this,g.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,g.WARN,...e),this._logHandler(this,g.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,g.ERROR,...e),this._logHandler(this,g.ERROR,...e)}}const ar=(t,e)=>e.some(n=>t instanceof n);let nn,sn;function cr(){return nn||(nn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function lr(){return sn||(sn=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ei=new WeakMap,vt=new WeakMap,ti=new WeakMap,ut=new WeakMap,$t=new WeakMap;function dr(t){const e=new Promise((n,i)=>{const s=()=>{t.removeEventListener("success",r),t.removeEventListener("error",o)},r=()=>{n(W(t.result)),s()},o=()=>{i(t.error),s()};t.addEventListener("success",r),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&ei.set(n,t)}).catch(()=>{}),$t.set(e,t),e}function ur(t){if(vt.has(t))return;const e=new Promise((n,i)=>{const s=()=>{t.removeEventListener("complete",r),t.removeEventListener("error",o),t.removeEventListener("abort",o)},r=()=>{n(),s()},o=()=>{i(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",r),t.addEventListener("error",o),t.addEventListener("abort",o)});vt.set(t,e)}let It={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return vt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||ti.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return W(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function hr(t){It=t(It)}function fr(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const i=t.call(ht(this),e,...n);return ti.set(i,e.sort?e.sort():[e]),W(i)}:lr().includes(t)?function(...e){return t.apply(ht(this),e),W(ei.get(this))}:function(...e){return W(t.apply(ht(this),e))}}function pr(t){return typeof t=="function"?fr(t):(t instanceof IDBTransaction&&ur(t),ar(t,cr())?new Proxy(t,It):t)}function W(t){if(t instanceof IDBRequest)return dr(t);if(ut.has(t))return ut.get(t);const e=pr(t);return e!==t&&(ut.set(t,e),$t.set(e,t)),e}const ht=t=>$t.get(t);function mr(t,e,{blocked:n,upgrade:i,blocking:s,terminated:r}={}){const o=indexedDB.open(t,e),a=W(o);return i&&o.addEventListener("upgradeneeded",c=>{i(W(o.result),c.oldVersion,c.newVersion,W(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{r&&c.addEventListener("close",()=>r()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const gr=["get","getKey","getAll","getAllKeys","count"],br=["put","add","delete","clear"],ft=new Map;function rn(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ft.get(e))return ft.get(e);const n=e.replace(/FromIndex$/,""),i=e!==n,s=br.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!(s||gr.includes(n)))return;const r=async function(o,...a){const c=this.transaction(o,s?"readwrite":"readonly");let l=c.store;return i&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),s&&c.done]))[0]};return ft.set(e,r),r}hr(t=>({...t,get:(e,n,i)=>rn(e,n)||t.get(e,n,i),has:(e,n)=>!!rn(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(_r(n)){const i=n.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(n=>n).join(" ")}}function _r(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const wt="@firebase/app",on="0.15.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B=new Zn("@firebase/app"),vr="@firebase/app-compat",Ir="@firebase/analytics-compat",wr="@firebase/analytics",Er="@firebase/app-check-compat",Sr="@firebase/app-check",kr="@firebase/auth",Tr="@firebase/auth-compat",Ar="@firebase/database",Cr="@firebase/data-connect",Lr="@firebase/database-compat",Pr="@firebase/functions",Rr="@firebase/functions-compat",Nr="@firebase/installations",Or="@firebase/installations-compat",Dr="@firebase/messaging",Mr="@firebase/messaging-compat",Ur="@firebase/performance",$r="@firebase/performance-compat",Br="@firebase/remote-config",xr="@firebase/remote-config-compat",Fr="@firebase/storage",Hr="@firebase/storage-compat",Vr="@firebase/firestore",Wr="@firebase/ai",jr="@firebase/firestore-compat",qr="firebase",zr="12.16.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="[DEFAULT]",Gr={[wt]:"fire-core",[vr]:"fire-core-compat",[wr]:"fire-analytics",[Ir]:"fire-analytics-compat",[Sr]:"fire-app-check",[Er]:"fire-app-check-compat",[kr]:"fire-auth",[Tr]:"fire-auth-compat",[Ar]:"fire-rtdb",[Cr]:"fire-data-connect",[Lr]:"fire-rtdb-compat",[Pr]:"fire-fn",[Rr]:"fire-fn-compat",[Nr]:"fire-iid",[Or]:"fire-iid-compat",[Dr]:"fire-fcm",[Mr]:"fire-fcm-compat",[Ur]:"fire-perf",[$r]:"fire-perf-compat",[Br]:"fire-rc",[xr]:"fire-rc-compat",[Fr]:"fire-gcs",[Hr]:"fire-gcs-compat",[Vr]:"fire-fst",[jr]:"fire-fst-compat",[Wr]:"fire-vertex","fire-js":"fire-js",[qr]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ke=new Map,Kr=new Map,St=new Map;function an(t,e){try{t.container.addComponent(e)}catch(n){B.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ie(t){const e=t.name;if(St.has(e))return B.debug(`There were multiple attempts to register component ${e}.`),!1;St.set(e,t);for(const n of Ke.values())an(n,t);for(const n of Kr.values())an(n,t);return!0}function ni(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function A(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jr={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},j=new Te("app","Firebase",Jr);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr{constructor(e,n,i){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new de("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw j.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ce=zr;function ii(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const i={name:Et,automaticDataCollectionEnabled:!0,...e},s=i.name;if(typeof s!="string"||!s)throw j.create("bad-app-name",{appName:String(s)});if(n||(n=Xn()),!n)throw j.create("no-options");const r=Ke.get(s);if(r){if(le(n,r.options)&&le(i,r.config))return r;throw j.create("duplicate-app",{appName:s})}const o=new nr(s);for(const c of St.values())o.addComponent(c);const a=new Yr(n,i,o);return Ke.set(s,a),a}function Xr(t=Et){const e=Ke.get(t);if(!e&&t===Et&&Xn())return ii();if(!e)throw j.create("no-app",{appName:t});return e}function ie(t,e,n){let i=Gr[t]??t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),r=e.match(/\s|\//);if(s||r){const o=[`Unable to register library "${i}" with version "${e}":`];s&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&r&&o.push("and"),r&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),B.warn(o.join(" "));return}Ie(new de(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qr="firebase-heartbeat-database",Zr=1,we="firebase-heartbeat-store";let pt=null;function si(){return pt||(pt=mr(Qr,Zr,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(we)}catch(n){console.warn(n)}}}}).catch(t=>{throw j.create("idb-open",{originalErrorMessage:t.message})})),pt}async function eo(t){try{const n=(await si()).transaction(we),i=await n.objectStore(we).get(ri(t));return await n.done,i}catch(e){if(e instanceof q)B.warn(e.message);else{const n=j.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});B.warn(n.message)}}}async function cn(t,e){try{const i=(await si()).transaction(we,"readwrite");await i.objectStore(we).put(e,ri(t)),await i.done}catch(n){if(n instanceof q)B.warn(n.message);else{const i=j.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});B.warn(i.message)}}}function ri(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const to=1024,no=30;class io{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new ro(n),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=ln();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(o=>o.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:s}),this._heartbeatsCache.heartbeats.length>no){const o=oo(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){B.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=ln(),{heartbeatsToSend:i,unsentEntries:s}=so(this._heartbeatsCache.heartbeats),r=Jn(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(n){return B.warn(n),""}}}function ln(){return new Date().toISOString().substring(0,10)}function so(t,e=to){const n=[];let i=t.slice();for(const s of t){const r=n.find(o=>o.agent===s.agent);if(r){if(r.dates.push(s.date),dn(n)>e){r.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),dn(n)>e){n.pop();break}i=i.slice(1)}return{heartbeatsToSend:n,unsentEntries:i}}class ro{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ws()?js().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await eo(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return cn(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return cn(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function dn(t){return Jn(JSON.stringify({version:2,heartbeats:t})).length}function oo(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let i=1;i<t.length;i++)t[i].date<n&&(n=t[i].date,e=i);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ao(t){Ie(new de("platform-logger",e=>new yr(e),"PRIVATE")),Ie(new de("heartbeat",e=>new io(e),"PRIVATE")),ie(wt,on,t),ie(wt,on,"esm2020"),ie("fire-js","")}ao("");var co="firebase",lo="12.16.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ie(co,lo,"app");function oi(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const uo=oi,ai=new Te("auth","Firebase",oi());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je=new Zn("@firebase/auth");function ho(t,...e){Je.logLevel<=g.WARN&&Je.warn(`Auth (${Ce}): ${t}`,...e)}function Fe(t,...e){Je.logLevel<=g.ERROR&&Je.error(`Auth (${Ce}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function P(t,...e){throw xt(t,...e)}function T(t,...e){return xt(t,...e)}function Bt(t,e,n){const i={...uo(),[e]:n};return new Te("auth","Firebase",i).create(e,{appName:t.name})}function X(t){return Bt(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function fo(t,e,n){const i=n;if(!(e instanceof i))throw i.name!==e.constructor.name&&P(t,"argument-error"),Bt(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function xt(t,...e){if(typeof t!="string"){const n=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=t.name),t._errorFactory.create(n,...i)}return ai.create(t,...e)}function f(t,e,...n){if(!t)throw xt(e,...n)}function U(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Fe(e),new Error(e)}function x(t,e){t||U(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function po(){return un()==="http:"||un()==="https:"}function un(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mo(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(po()||Fs()||"connection"in navigator)?navigator.onLine:!0}function go(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le{constructor(e,n){this.shortDelay=e,this.longDelay=n,x(n>e,"Short delay should be less than long delay!"),this.isMobile=Bs()||Hs()}get(){return mo()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ft(t,e){x(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{static initialize(e,n,i){this.fetchImpl=e,n&&(this.headersImpl=n),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;U("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;U("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;U("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bo={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yo=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],_o=new Le(3e4,6e4);function Ht(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function be(t,e,n,i,s={}){return li(t,s,async()=>{let r={},o={};i&&(e==="GET"?o=i:r={body:JSON.stringify(i)});const a=Ae({...o,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const l={method:e,headers:c,...r};return xs()||(l.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&Ut(t.emulatorConfig.host)&&(l.credentials="include"),ci.fetch()(await di(t,t.config.apiHost,n,a),l)})}async function li(t,e,n){t._canInitEmulator=!1;const i={...bo,...e};try{const s=new Io(t),r=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const o=await r.json();if("needConfirmation"in o)throw Ue(t,"account-exists-with-different-credential",o);if(r.ok&&!("errorMessage"in o))return o;{const a=r.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ue(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Ue(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Ue(t,"user-disabled",o);const d=i[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw Bt(t,d,l);P(t,d)}}catch(s){if(s instanceof q)throw s;P(t,"network-request-failed",{message:String(s)})}}async function vo(t,e,n,i,s={}){const r=await be(t,e,n,i,s);return"mfaPendingCredential"in r&&P(t,"multi-factor-auth-required",{_serverResponse:r}),r}async function di(t,e,n,i){const s=`${e}${n}?${i}`,r=t,o=r.config.emulator?Ft(t.config,s):`${t.config.apiScheme}://${s}`;return yo.includes(n)&&(await r._persistenceManagerAvailable,r._getPersistenceType()==="COOKIE")?r._getPersistence()._getFinalTarget(o).toString():o}class Io{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,i)=>{this.timer=setTimeout(()=>i(T(this.auth,"network-request-failed")),_o.get())})}}function Ue(t,e,n){const i={appName:t.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);const s=T(t,e,i);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wo(t,e){return be(t,"POST","/v1/accounts:delete",e)}async function Ye(t,e){return be(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Eo(t,e=!1){const n=z(t),i=await n.getIdToken(e),s=Vt(i);f(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const r=typeof s.firebase=="object"?s.firebase:void 0,o=r==null?void 0:r.sign_in_provider;return{claims:s,token:i,authTime:ve(mt(s.auth_time)),issuedAtTime:ve(mt(s.iat)),expirationTime:ve(mt(s.exp)),signInProvider:o||null,signInSecondFactor:(r==null?void 0:r.sign_in_second_factor)||null}}function mt(t){return Number(t)*1e3}function Vt(t){const[e,n,i]=t.split(".");if(e===void 0||n===void 0||i===void 0)return Fe("JWT malformed, contained fewer than 3 sections"),null;try{const s=Yn(n);return s?JSON.parse(s):(Fe("Failed to decode base64 JWT payload"),null)}catch(s){return Fe("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function hn(t){const e=Vt(t);return f(e,"internal-error"),f(typeof e.exp<"u","internal-error"),f(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ee(t,e,n=!1){if(n)return e;try{return await e}catch(i){throw i instanceof q&&So(i)&&t.auth.currentUser===t&&await t.auth.signOut(),i}}function So({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ve(this.lastLoginAt),this.creationTime=ve(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xe(t){var u;const e=t.auth,n=await t.getIdToken(),i=await Ee(t,Ye(e,{idToken:n}));f(i==null?void 0:i.users.length,e,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const r=(u=s.providerUserInfo)!=null&&u.length?ui(s.providerUserInfo):[],o=Ao(t.providerData,r),a=t.isAnonymous,c=!(t.email&&s.passwordHash)&&!(o!=null&&o.length),l=a?c:!1,d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Tt(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(t,d)}async function To(t){const e=z(t);await Xe(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Ao(t,e){return[...t.filter(i=>!e.some(s=>s.providerId===i.providerId)),...e]}function ui(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Co(t,e){const n=await li(t,{},async()=>{const i=Ae({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:r}=t.config,o=await di(t,s,"/v1/token",`key=${r}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:i};return t.emulatorConfig&&Ut(t.emulatorConfig.host)&&(c.credentials="include"),ci.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Lo(t,e){return be(t,"POST","/v2/accounts:revokeToken",Ht(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){f(e.idToken,"internal-error"),f(typeof e.idToken<"u","internal-error"),f(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):hn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){f(e.length!==0,"internal-error");const n=hn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(f(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:i,refreshToken:s,expiresIn:r}=await Co(e,n);this.updateTokensAndExpiration(i,s,Number(r))}updateTokensAndExpiration(e,n,i){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,n){const{refreshToken:i,accessToken:s,expirationTime:r}=n,o=new se;return i&&(f(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),s&&(f(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),r&&(f(typeof r=="number","internal-error",{appName:e}),o.expirationTime=r),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new se,this.toJSON())}_performRefresh(){return U("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(t,e){f(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class k{constructor({uid:e,auth:n,stsTokenManager:i,...s}){this.providerId="firebase",this.proactiveRefresh=new ko(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Tt(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Ee(this,this.stsTokenManager.getToken(this.auth,e));return f(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Eo(this,e)}reload(){return To(this)}_assign(e){this!==e&&(f(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new k({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){f(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),n&&await Xe(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(A(this.auth.app))return Promise.reject(X(this.auth));const e=await this.getIdToken();return await Ee(this,wo(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const i=n.displayName??void 0,s=n.email??void 0,r=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,c=n._redirectEventId??void 0,l=n.createdAt??void 0,d=n.lastLoginAt??void 0,{uid:u,emailVerified:h,isAnonymous:p,providerData:m,stsTokenManager:b}=n;f(u&&b,e,"internal-error");const w=se.fromJSON(this.name,b);f(typeof u=="string",e,"internal-error"),F(i,e.name),F(s,e.name),f(typeof h=="boolean",e,"internal-error"),f(typeof p=="boolean",e,"internal-error"),F(r,e.name),F(o,e.name),F(a,e.name),F(c,e.name),F(l,e.name),F(d,e.name);const E=new k({uid:u,auth:e,email:s,emailVerified:h,displayName:i,isAnonymous:p,photoURL:o,phoneNumber:r,tenantId:a,stsTokenManager:w,createdAt:l,lastLoginAt:d});return m&&Array.isArray(m)&&(E.providerData=m.map(G=>({...G}))),c&&(E._redirectEventId=c),E}static async _fromIdTokenResponse(e,n,i=!1){const s=new se;s.updateFromServerResponse(n);const r=new k({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:i});return await Xe(r),r}static async _fromGetAccountInfoResponse(e,n,i){const s=n.users[0];f(s.localId!==void 0,"internal-error");const r=s.providerUserInfo!==void 0?ui(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(r!=null&&r.length),a=new se;a.updateFromIdToken(i);const c=new k({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:r,metadata:new Tt(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(r!=null&&r.length)};return Object.assign(c,l),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn=new Map;function $(t){x(t instanceof Function,"Expected a class definition");let e=fn.get(t);return e?(x(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,fn.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}hi.type="NONE";const pn=hi;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function He(t,e,n){return`firebase:${t}:${e}:${n}`}class re{constructor(e,n,i){this.persistence=e,this.auth=n,this.userKey=i;const{config:s,name:r}=this.auth;this.fullUserKey=He(this.userKey,s.apiKey,r),this.fullPersistenceKey=He("persistence",s.apiKey,r),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Ye(this.auth,{idToken:e}).catch(()=>{});return n?k._fromGetAccountInfoResponse(this.auth,n,e):null}return k._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,i="authUser"){if(!n.length)return new re($(pn),e,i);const s=(await Promise.all(n.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let r=s[0]||$(pn);const o=He(i,e.config.apiKey,e.name);let a=null;for(const l of n)try{const d=await l._get(o);if(d){let u;if(typeof d=="string"){const h=await Ye(e,{idToken:d}).catch(()=>{});if(!h)break;u=await k._fromGetAccountInfoResponse(e,h,d)}else u=k._fromJSON(e,d);l!==r&&(a=u),r=l;break}}catch{}const c=s.filter(l=>l._shouldAllowMigration);return!r._shouldAllowMigration||!c.length?new re(r,e,i):(r=c[0],a&&await r._set(o,a.toJSON()),await Promise.all(n.map(async l=>{if(l!==r)try{await l._remove(o)}catch{}})),new re(r,e,i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mn(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(gi(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(fi(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(yi(e))return"Blackberry";if(_i(e))return"Webos";if(pi(e))return"Safari";if((e.includes("chrome/")||mi(e))&&!e.includes("edge/"))return"Chrome";if(bi(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=t.match(n);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function fi(t=y()){return/firefox\//i.test(t)}function pi(t=y()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function mi(t=y()){return/crios\//i.test(t)}function gi(t=y()){return/iemobile/i.test(t)}function bi(t=y()){return/android/i.test(t)}function yi(t=y()){return/blackberry/i.test(t)}function _i(t=y()){return/webos/i.test(t)}function Wt(t=y()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Po(t=y()){var e;return Wt(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Ro(){return Vs()&&document.documentMode===10}function vi(t=y()){return Wt(t)||bi(t)||_i(t)||yi(t)||/windows phone/i.test(t)||gi(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ii(t,e=[]){let n;switch(t){case"Browser":n=mn(y());break;case"Worker":n=`${mn(y())}-${t}`;break;default:n=t}const i=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ce}/${i}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class No{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const i=r=>new Promise((o,a)=>{try{const c=e(r);o(c)}catch(c){a(c)}});i.onAbort=n,this.queue.push(i);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const i of this.queue)await i(e),i.onAbort&&n.push(i.onAbort)}catch(i){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Oo(t,e={}){return be(t,"GET","/v2/passwordPolicy",Ht(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Do=6;class Mo{constructor(e){var i;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Do,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const i=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;i&&(n.meetsMinPasswordLength=e.length>=i),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let i;for(let s=0;s<e.length;s++)i=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,n,i,s,r){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(e,n,i,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=i,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new gn(this),this.idTokenSubscription=new gn(this),this.beforeStateQueue=new No(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ai,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(r=>this._resolvePersistenceManagerAvailable=r)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=$(n)),this._initializationPromise=this.queue(async()=>{var i,s,r;if(!this._deleted&&(this.persistenceManager=await re.create(this,e),(i=this._resolvePersistenceManagerAvailable)==null||i.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((r=this.currentUser)==null?void 0:r.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Ye(this,{idToken:e}),i=await k._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(i)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var r;if(A(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let i=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(r=this.redirectUser)==null?void 0:r._redirectEventId,a=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return f(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Xe(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=go()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(A(this.app))return Promise.reject(X(this));const n=e?z(e):null;return n&&f(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&f(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return A(this.app)?Promise.reject(X(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return A(this.app)?Promise.reject(X(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence($(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Oo(this),n=new Mo(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Te("auth","Firebase",e())}onAuthStateChanged(e,n,i){return this.registerStateListener(this.authStateSubscription,e,n,i)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,i){return this.registerStateListener(this.idTokenSubscription,e,n,i)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(i.tenantId=this.tenantId),await Lo(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const i=await this.getOrInitRedirectPersistenceManager(n);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&$(e)||this._popupRedirectResolver;f(n,this,"argument-error"),this.redirectPersistenceManager=await re.create(this,[$(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,i;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((i=this.redirectUser)==null?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,i,s){if(this._deleted)return()=>{};const r=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(f(a,this,"internal-error"),a.then(()=>{o||r(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,i,s);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return f(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ii(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){var n;if(A(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&ho(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function nt(t){return z(t)}class gn{constructor(e){this.auth=e,this.observer=null,this.addObserver=Js(n=>this.observer=n)}get next(){return f(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let jt={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function $o(t){jt=t}function Bo(t){return jt.loadJS(t)}function xo(){return jt.gapiScript}function Fo(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ho(t,e){const n=ni(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),r=n.getOptions();if(le(r,e??{}))return s;P(s,"already-initialized")}return n.initialize({options:e})}function Vo(t,e){const n=(e==null?void 0:e.persistence)||[],i=(Array.isArray(n)?n:[n]).map($);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function Wo(t,e,n){const i=nt(t);f(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const s=!1,r=wi(e),{host:o,port:a}=jo(e),c=a===null?"":`:${a}`,l={url:`${r}//${o}${c}/`},d=Object.freeze({host:o,port:a,protocol:r.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!i._canInitEmulator){f(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),f(le(l,i.config.emulator)&&le(d,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=d,i.settings.appVerificationDisabledForTesting=!0,Ut(o)?Qs(`${r}//${o}${c}`):qo()}function wi(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function jo(t){const e=wi(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const i=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(i);if(s){const r=s[1];return{host:r,port:bn(i.substr(r.length+1))}}else{const[r,o]=i.split(":");return{host:r,port:bn(o)}}}function bn(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function qo(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ei{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return U("not implemented")}_getIdTokenResponse(e){return U("not implemented")}_linkToIdToken(e,n){return U("not implemented")}_getReauthenticationResolver(e){return U("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oe(t,e){return vo(t,"POST","/v1/accounts:signInWithIdp",Ht(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo="http://localhost";class ee extends Ei{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ee(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):P("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:s,...r}=n;if(!i||!s)return null;const o=new ee(i,s);return o.idToken=r.idToken||void 0,o.accessToken=r.accessToken||void 0,o.secret=r.secret,o.nonce=r.nonce,o.pendingToken=r.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return oe(e,n)}_linkToIdToken(e,n){const i=this.buildRequest();return i.idToken=n,oe(e,i)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,oe(e,n)}buildRequest(){const e={requestUri:zo,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Ae(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe extends qt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O extends Pe{constructor(){super("facebook.com")}static credential(e){return ee._fromParams({providerId:O.PROVIDER_ID,signInMethod:O.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return O.credentialFromTaggedObject(e)}static credentialFromError(e){return O.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return O.credential(e.oauthAccessToken)}catch{return null}}}O.FACEBOOK_SIGN_IN_METHOD="facebook.com";O.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D extends Pe{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ee._fromParams({providerId:D.PROVIDER_ID,signInMethod:D.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return D.credentialFromTaggedObject(e)}static credentialFromError(e){return D.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:i}=e;if(!n&&!i)return null;try{return D.credential(n,i)}catch{return null}}}D.GOOGLE_SIGN_IN_METHOD="google.com";D.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H extends Pe{constructor(){super("github.com")}static credential(e){return ee._fromParams({providerId:H.PROVIDER_ID,signInMethod:H.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return H.credentialFromTaggedObject(e)}static credentialFromError(e){return H.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return H.credential(e.oauthAccessToken)}catch{return null}}}H.GITHUB_SIGN_IN_METHOD="github.com";H.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V extends Pe{constructor(){super("twitter.com")}static credential(e,n){return ee._fromParams({providerId:V.PROVIDER_ID,signInMethod:V.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return V.credentialFromTaggedObject(e)}static credentialFromError(e){return V.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:i}=e;if(!n||!i)return null;try{return V.credential(n,i)}catch{return null}}}V.TWITTER_SIGN_IN_METHOD="twitter.com";V.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,i,s=!1){const r=await k._fromIdTokenResponse(e,i,s),o=yn(i);return new ue({user:r,providerId:o,_tokenResponse:i,operationType:n})}static async _forOperation(e,n,i){await e._updateTokensIfNecessary(i,!0);const s=yn(i);return new ue({user:e,providerId:s,_tokenResponse:i,operationType:n})}}function yn(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe extends q{constructor(e,n,i,s){super(n.code,n.message),this.operationType=i,this.user=s,Object.setPrototypeOf(this,Qe.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,n,i,s){return new Qe(e,n,i,s)}}function Si(t,e,n,i){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(r=>{throw r.code==="auth/multi-factor-auth-required"?Qe._fromErrorAndOperation(t,r,e,i):r})}async function Go(t,e,n=!1){const i=await Ee(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ue._forOperation(t,"link",i)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ko(t,e,n=!1){const{auth:i}=t;if(A(i.app))return Promise.reject(X(i));const s="reauthenticate";try{const r=await Ee(t,Si(i,s,e,t),n);f(r.idToken,i,"internal-error");const o=Vt(r.idToken);f(o,i,"internal-error");const{sub:a}=o;return f(t.uid===a,i,"user-mismatch"),ue._forOperation(t,s,r)}catch(r){throw(r==null?void 0:r.code)==="auth/user-not-found"&&P(i,"user-mismatch"),r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jo(t,e,n=!1){if(A(t.app))return Promise.reject(X(t));const i="signIn",s=await Si(t,i,e),r=await ue._fromIdTokenResponse(t,i,s);return n||await t._updateCurrentUser(r.user),r}function Yo(t,e,n,i){return z(t).onIdTokenChanged(e,n,i)}function Xo(t,e,n){return z(t).beforeAuthStateChanged(e,n)}function Qo(t,e,n,i){return z(t).onAuthStateChanged(e,n,i)}function Zo(t){return z(t).signOut()}const Ze="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Ze,"1"),this.storage.removeItem(Ze),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ea=1e3,ta=10;class Ti extends ki{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=vi(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const i=this.storage.getItem(n),s=this.localCache[n];i!==s&&e(n,s,i)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const i=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(i);!n&&this.localCache[i]===o||this.notifyListeners(i,o)},r=this.storage.getItem(i);Ro()&&r!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,ta):s()}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:i}),!0)})},ea)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ti.type="LOCAL";const na=Ti;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai extends ki{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Ai.type="SESSION";const Ci=Ai;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ia(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const i=new it(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:i,eventType:s,data:r}=n.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:i,eventType:s});const a=Array.from(o).map(async l=>l(n.origin,r)),c=await ia(a);n.ports[0].postMessage({status:"done",eventId:i,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}it.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zt(t="",e=10){let n="";for(let i=0;i<e;i++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sa{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,i=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let r,o;return new Promise((a,c)=>{const l=zt("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},i);o={messageChannel:s,onMessage(u){const h=u;if(h.data.eventId===l)switch(h.data.status){case"ack":clearTimeout(d),r=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(r),a(h.data.response);break;default:clearTimeout(d),clearTimeout(r),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:n},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C(){return window}function ra(t){C().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Li(){return typeof C().WorkerGlobalScope<"u"&&typeof C().importScripts=="function"}async function oa(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function aa(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function ca(){return Li()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pi="firebaseLocalStorageDb",la=1,et="firebaseLocalStorage",Ri="fbase_key";class Re{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function st(t,e){return t.transaction([et],e?"readwrite":"readonly").objectStore(et)}function da(){const t=indexedDB.deleteDatabase(Pi);return new Re(t).toPromise()}function Ni(){const t=indexedDB.open(Pi,la);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const i=t.result;try{i.createObjectStore(et,{keyPath:Ri})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const i=t.result;i.objectStoreNames.contains(et)?e(i):(i.close(),await da(),e(await Ni()))})})}async function _n(t,e,n){const i=st(t,!0).put({[Ri]:e,value:n});return new Re(i).toPromise()}async function ua(t,e){const n=st(t,!1).get(e),i=await new Re(n).toPromise();return i===void 0?null:i.value}function vn(t,e){const n=st(t,!0).delete(e);return new Re(n).toPromise()}const ha=800,fa=3;class Oi{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Ni(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(n++>fa)throw i;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Li()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=it._getInstance(ca()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,i;if(this.activeServiceWorker=await oa(),!this.activeServiceWorker)return;this.sender=new sa(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(i=e[0])!=null&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||aa()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await _n(e,Ze,"1"),await vn(e,Ze)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(i=>_n(i,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(i=>ua(i,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>vn(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const r=st(s,!1).getAll();return new Re(r).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],i=new Set;if(e.length!==0)for(const{fbase_key:s,value:r}of e)i.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(r)&&(this.notifyListeners(s,r),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!i.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const s of Array.from(i))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),ha)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Oi.type="LOCAL";const pa=Oi;new Le(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Di(t,e){return e?$(e):(f(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt extends Ei{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return oe(e,this._buildIdpRequest())}_linkToIdToken(e,n){return oe(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return oe(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function ma(t){return Jo(t.auth,new Gt(t),t.bypassAuthState)}function ga(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Ko(n,new Gt(t),t.bypassAuthState)}async function ba(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Go(n,new Gt(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi{constructor(e,n,i,s,r=!1){this.auth=e,this.resolver=i,this.user=s,this.bypassAuthState=r,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:i,postBody:s,tenantId:r,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:i,tenantId:r||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return ma;case"linkViaPopup":case"linkViaRedirect":return ba;case"reauthViaPopup":case"reauthViaRedirect":return ga;default:P(this.auth,"internal-error")}}resolve(e){x(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){x(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ya=new Le(2e3,1e4);async function Ui(t,e,n){if(A(t.app))return Promise.reject(T(t,"operation-not-supported-in-this-environment"));const i=nt(t);fo(t,e,qt);const s=Di(i,n);return new J(i,"signInViaPopup",e,s).executeNotNull()}class J extends Mi{constructor(e,n,i,s,r){super(e,n,s,r),this.provider=i,this.authWindow=null,this.pollId=null,J.currentPopupAction&&J.currentPopupAction.cancel(),J.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return f(e,this.auth,"internal-error"),e}async onExecution(){x(this.filter.length===1,"Popup operations only handle one event");const e=zt();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(T(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(T(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,J.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,i;if((i=(n=this.authWindow)==null?void 0:n.window)!=null&&i.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(T(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ya.get())};e()}}J.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _a="pendingRedirect",Ve=new Map;class va extends Mi{constructor(e,n,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,i),this.eventId=null}async execute(){let e=Ve.get(this.auth._key());if(!e){try{const i=await Ia(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(n){e=()=>Promise.reject(n)}Ve.set(this.auth._key(),e)}return this.bypassAuthState||Ve.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ia(t,e){const n=Sa(e),i=Ea(t);if(!await i._isAvailable())return!1;const s=await i._get(n)==="true";return await i._remove(n),s}function wa(t,e){Ve.set(t._key(),e)}function Ea(t){return $(t._redirectPersistence)}function Sa(t){return He(_a,t.config.apiKey,t.name)}async function ka(t,e,n=!1){if(A(t.app))return Promise.reject(X(t));const i=nt(t),s=Di(i,e),o=await new va(i,s,n).execute();return o&&!n&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ta=600*1e3;class Aa{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(n=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ca(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var i;if(e.error&&!$i(e)){const s=((i=e.error.code)==null?void 0:i.split("auth/")[1])||"internal-error";n.onError(T(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const i=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ta&&this.cachedEventUids.clear(),this.cachedEventUids.has(In(e))}saveEventToCache(e){this.cachedEventUids.add(In(e)),this.lastProcessedEventTime=Date.now()}}function In(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function $i({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ca(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return $i(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function La(t,e={}){return be(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ra=/^https?/;async function Na(t){if(t.config.emulator)return;const{authorizedDomains:e}=await La(t);for(const n of e)try{if(Oa(n))return}catch{}P(t,"unauthorized-domain")}function Oa(t){const e=kt(),{protocol:n,hostname:i}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&i===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===i}if(!Ra.test(n))return!1;if(Pa.test(t))return i===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(i)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Da=new Le(3e4,6e4);function wn(){const t=C().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Ma(t){return new Promise((e,n)=>{var s,r,o;function i(){wn(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wn(),n(T(t,"network-request-failed"))},timeout:Da.get()})}if((r=(s=C().gapi)==null?void 0:s.iframes)!=null&&r.Iframe)e(gapi.iframes.getContext());else if((o=C().gapi)!=null&&o.load)i();else{const a=Fo("iframefcb");return C()[a]=()=>{gapi.load?i():n(T(t,"network-request-failed"))},Bo(`${xo()}?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw We=null,e})}let We=null;function Ua(t){return We=We||Ma(t),We}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $a=new Le(5e3,15e3),Ba="__/auth/iframe",xa="emulator/auth/iframe",Fa={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ha=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Va(t){const e=t.config;f(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ft(e,xa):`https://${t.config.authDomain}/${Ba}`,i={apiKey:e.apiKey,appName:t.name,v:Ce},s=Ha.get(t.config.apiHost);s&&(i.eid=s);const r=t._getFrameworks();return r.length&&(i.fw=r.join(",")),`${n}?${Ae(i).slice(1)}`}async function Wa(t){const e=await Ua(t),n=C().gapi;return f(n,t,"internal-error"),e.open({where:document.body,url:Va(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Fa,dontclear:!0},i=>new Promise(async(s,r)=>{await i.restyle({setHideOnLeave:!1});const o=T(t,"network-request-failed"),a=C().setTimeout(()=>{r(o)},$a.get());function c(){C().clearTimeout(a),s(i)}i.ping(c).then(c,()=>{r(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},qa=500,za=600,Ga="_blank",Ka="http://localhost";class En{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Ja(t,e,n,i=qa,s=za){const r=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let a="";const c={...ja,width:i.toString(),height:s.toString(),top:r,left:o},l=y().toLowerCase();n&&(a=mi(l)?Ga:n),fi(l)&&(e=e||Ka,c.scrollbars="yes");const d=Object.entries(c).reduce((h,[p,m])=>`${h}${p}=${m},`,"");if(Po(l)&&a!=="_self")return Ya(e||"",a),new En(null);const u=window.open(e||"",a,d);f(u,t,"popup-blocked");try{u.focus()}catch{}return new En(u)}function Ya(t,e){const n=document.createElement("a");n.href=t,n.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xa="__/auth/handler",Qa="emulator/auth/handler",Za=encodeURIComponent("fac");async function Sn(t,e,n,i,s,r){f(t.config.authDomain,t,"auth-domain-config-required"),f(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:i,v:Ce,eventId:s};if(e instanceof qt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Ks(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,u]of Object.entries({}))o[d]=u}if(e instanceof Pe){const d=e.getScopes().filter(u=>u!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const c=await t._getAppCheckToken(),l=c?`#${Za}=${encodeURIComponent(c)}`:"";return`${ec(t)}?${Ae(a).slice(1)}${l}`}function ec({config:t}){return t.emulator?Ft(t,Qa):`https://${t.authDomain}/${Xa}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gt="webStorageSupport";class tc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ci,this._completeRedirectFn=ka,this._overrideRedirectResult=wa}async _openPopup(e,n,i,s){var o;x((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const r=await Sn(e,n,i,kt(),s);return Ja(e,r,zt())}async _openRedirect(e,n,i,s){await this._originValidation(e);const r=await Sn(e,n,i,kt(),s);return ra(r),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:r}=this.eventManagers[n];return s?Promise.resolve(s):(x(r,"If manager is not set, promise should be"),r)}const i=this.initAndGetManager(e);return this.eventManagers[n]={promise:i},i.catch(()=>{delete this.eventManagers[n]}),i}async initAndGetManager(e){const n=await Wa(e),i=new Aa(e);return n.register("authEvent",s=>(f(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:i.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=n,i}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(gt,{type:gt},s=>{var o;const r=(o=s==null?void 0:s[0])==null?void 0:o[gt];r!==void 0&&n(!!r),P(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Na(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return vi()||pi()||Wt()}}const nc=tc;var kn="@firebase/auth",Tn="1.13.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){f(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sc(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function rc(t){Ie(new de("auth",(e,{options:n})=>{const i=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),r=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=i.options;f(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ii(t)},l=new Uo(i,s,r,c);return Vo(l,n),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,i)=>{e.getProvider("auth-internal").initialize()})),Ie(new de("auth-internal",e=>{const n=nt(e.getProvider("auth").getImmediate());return(i=>new ic(i))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ie(kn,Tn,sc(t)),ie(kn,Tn,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oc=300,ac=Qn("authIdTokenMaxAge")||oc;let An=null;const cc=t=>async e=>{const n=e&&await e.getIdTokenResult(),i=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(i&&i>ac)return;const s=n==null?void 0:n.token;An!==s&&(An=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function lc(t=Xr()){const e=ni(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Ho(t,{popupRedirectResolver:nc,persistence:[pa,na,Ci]}),i=Qn("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const r=new URL(i,location.origin);if(location.origin===r.origin){const o=cc(r.toString());Xo(n,o,()=>o(n.currentUser)),Yo(n,a=>o(a))}}const s=Us("auth");return s&&Wo(n,`http://${s}`),n}function dc(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}$o({loadJS(t){return new Promise((e,n)=>{const i=document.createElement("script");i.setAttribute("src",t),i.onload=e,i.onerror=s=>{const r=T("internal-error");r.customData=s,n(r)},i.type="text/javascript",i.charset="UTF-8",dc().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});rc("Browser");const uc=ii(window.FIREBASE_CONFIG),rt=lc(uc),hc=new D,fc=new O;let Q=null,he=null;const At=new Set,Se={get user(){return Q},get profile(){return he},get loggedIn(){return!!Q},onChange(t){return At.add(t),t(Q,he),()=>At.delete(t)}};function Bi(){At.forEach(t=>t(Q,he))}async function xi(){return Q?Q.getIdToken():null}async function Fi(t,e={}){const n=await xi();return fetch(t,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...n?{Authorization:`Bearer ${n}`}:{}}})}async function pc(t){if(!t)return null;try{const e=await t.getIdToken(),n=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(n.ok)return await n.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:t.uid,display_name:t.displayName||"",email:t.email||"",photo_url:t.photoURL||""}}Qo(rt,async t=>{Q=t,he=t?await pc(t):null,Bi()});async function mc(){return(await Ui(rt,hc)).user}async function gc(){return(await Ui(rt,fc)).user}async function Cn(){await Zo(rt)}async function bc({display_name:t,photo_url:e}){const n={};t!==void 0&&(n.display_name=t),e!==void 0&&(n.photo_url=e);const i=await Fi(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(n)});if(!i.ok)throw new Error(await i.text());return he=await i.json(),Bi(),he}const{baseUrl:Hi}=window.BOOK_CONFIG;function yc(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
<div id="lib-dialog" class="lib-backdrop" aria-modal="true" role="dialog" aria-label="My Library">
  <div class="lib-box">
    <div class="lib-header">
      <h2 class="lib-title">My Library</h2>
      <button class="lib-close" data-close-lib aria-label="Close">✕</button>
    </div>

    <div class="lib-tabs" role="tablist">
      <button class="lib-tab is-active" data-tab="history"   role="tab">📚 History</button>
      <button class="lib-tab"           data-tab="bookmarks" role="tab">🔖 Bookmarks</button>
      <button class="lib-tab"           data-tab="notes"     role="tab">📝 Notes</button>
      <button class="lib-tab"           data-tab="comments"  role="tab">💬 Comments</button>
    </div>

    <div class="lib-body">
      <div class="lib-loading" id="lib-loading">Loading…</div>
      <div id="lib-pane-history"   class="lib-pane"></div>
      <div id="lib-pane-bookmarks" class="lib-pane" style="display:none"></div>
      <div id="lib-pane-notes"     class="lib-pane" style="display:none"></div>
      <div id="lib-pane-comments"  class="lib-pane" style="display:none"></div>
    </div>
  </div>
</div>`)}function _c(){const t=document.getElementById("lib-dialog");t&&(t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),vc())}function Ln(){const t=document.getElementById("lib-dialog");if(!t)return;t.classList.remove("open");const e=()=>t.classList.remove("is-visible");t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function vc(){const t=document.getElementById("lib-loading");t.style.display="block",document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");try{const n=await Fi(`${Hi}/api/user/library`);if(!n.ok)throw new Error("Not authenticated");const i=await n.json();$e("history",Ic(i.history)),$e("bookmarks",wc(i.bookmarks)),$e("notes",Ec(i.notes)),$e("comments",Sc(i.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}t.style.display="none";const e=document.querySelector(".lib-tab.is-active");Vi((e==null?void 0:e.dataset.tab)||"history")}function $e(t,e){document.getElementById(`lib-pane-${t}`).innerHTML=e}function Vi(t){document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");const e=document.getElementById(`lib-pane-${t}`);e&&(e.style.display="block")}function ot(t){return t?new Date(t*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function at(t,e){return`${Hi}/book/${t}?para=${e}`}function Ic(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${te(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${te(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${ot(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function wc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${te(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${ot(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function Ec(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${te(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${te(e.text)}</div>
      <div class="lib-card-date">${ot(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function Sc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${te(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${te(e.text)}</div>
      <div class="lib-card-date">${ot(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function te(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function kc(){yc(),document.addEventListener("click",t=>{const e=t.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),Vi(e.dataset.tab);return}if(t.target.closest("[data-close-lib]")){Ln();return}if(t.target.id==="lib-dialog"){Ln();return}})}function Tc(){var t;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
      <span class="auth-avatar-inner">
        <img id="auth-avatar-img" src="" alt="" hidden>
        <span id="auth-avatar-initials" aria-hidden="true">👤</span>
      </span>`,(t=document.querySelector(".topbar-right"))==null||t.prepend(e)}document.getElementById("auth-login-dialog")||document.body.insertAdjacentHTML("beforeend",`
<div id="auth-login-dialog" class="auth-backdrop" aria-modal="true" role="dialog" aria-labelledby="auth-login-title">
  <div class="auth-dialog auth-login-box">
    <button class="auth-dialog-close" data-close="auth-login-dialog" aria-label="Close">✕</button>
    <div class="auth-brand">📖</div>
    <h2 id="auth-login-title" class="auth-dialog-title">Sign in to E-Piṭaka</h2>
    <p class="auth-dialog-sub">Add notes and study alongside the community</p>
    <div class="auth-providers">
      <button id="btn-google"   class="auth-provider-btn" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      <button id="btn-facebook" class="auth-provider-btn" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>
    </div>
    <p id="auth-login-error" class="auth-error-msg" style="display:none"></p>
    <p class="auth-legal">By continuing you agree to our <a href="#">Terms</a></p>
  </div>
</div>`),document.getElementById("auth-profile-dialog")||document.body.insertAdjacentHTML("beforeend",`
<div id="auth-profile-dialog" class="auth-backdrop" aria-modal="true" role="dialog" aria-labelledby="auth-profile-title">
  <div class="auth-dialog auth-profile-box">
    <button class="auth-dialog-close" data-close="auth-profile-dialog" aria-label="Close">✕</button>
    <h2 id="auth-profile-title" class="auth-dialog-title">My Profile</h2>

    <div class="auth-profile-hero">
      <div class="auth-profile-avatar" id="profile-avatar-wrap">
        <img id="profile-avatar-img" src="" alt="" hidden>
        <span id="profile-avatar-initials"></span>
      </div>
      <div>
        <div id="profile-hero-name"  class="auth-profile-name"></div>
        <div id="profile-hero-email" class="auth-profile-email"></div>
      </div>
    </div>

    <form id="auth-profile-form" novalidate>
      <label class="auth-label" for="profile-input-name">Display name</label>
      <input id="profile-input-name"  class="auth-input" type="text" maxlength="80" placeholder="Your name" autocomplete="off">

      <label class="auth-label" for="profile-input-photo">Avatar URL <small>(optional)</small></label>
      <input id="profile-input-photo" class="auth-input" type="url"  maxlength="512" placeholder="https://…" autocomplete="off">

      <button type="submit" class="auth-submit-btn">Save changes</button>
      <p id="profile-status" class="auth-status-msg" aria-live="polite"></p>
    </form>

    <hr class="auth-rule">
    <button id="btn-signout" class="auth-signout-btn" type="button">Sign out</button>
  </div>
</div>`),document.getElementById("auth-user-menu")||document.body.insertAdjacentHTML("beforeend",`
<div id="auth-user-menu" class="auth-user-menu" role="menu">
  <div id="auth-menu-name"  class="auth-menu-name"></div>
  <div id="auth-menu-email" class="auth-menu-email"></div>
  <hr class="auth-menu-rule">
  <button class="auth-menu-item" id="auth-menu-library-btn" role="menuitem">📚 My Library</button>
  <button class="auth-menu-item" id="auth-menu-profile-btn" role="menuitem">⚙&#xFE0E; Manage profile</button>
  <button class="auth-menu-item auth-menu-danger" id="auth-menu-signout-btn" role="menuitem">↩ Sign out</button>
</div>`)}function Wi(t){const e=document.getElementById(t);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function tt(t){const e=document.getElementById(t);if(!e)return;e.classList.remove("open");const n=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",n,{once:!0}),setTimeout(n,300)}function Ac(){ne(),Wi("auth-login-dialog")}function Pn(){tt("auth-login-dialog")}function Cc(){ne(),qi(),Wi("auth-profile-dialog")}function Lc(){tt("auth-profile-dialog")}function Pc(){const t=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!t||!e)return;const n=e.getBoundingClientRect();t.style.top=`${n.bottom+6}px`,t.style.right=`${window.innerWidth-n.right}px`,t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open")))}function ne(){const t=document.getElementById("auth-user-menu");if(!t)return;t.classList.remove("open");const e=()=>{t.classList.remove("is-visible")};t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function Rc(t){return(t||"?").trim().split(/\s+/).map(e=>{var n;return((n=e[0])==null?void 0:n.toUpperCase())||""}).join("").slice(0,2)||"?"}function ji(t,e,n){n!=null&&n.photo_url?(t.src=n.photo_url,t.hidden=!1,e.hidden=!0):(t.hidden=!0,e.hidden=!1,e.textContent=Rc(n==null?void 0:n.display_name))}function qi(){const t=Se.profile;t&&(document.getElementById("profile-hero-name").textContent=t.display_name||"",document.getElementById("profile-hero-email").textContent=t.email||"",document.getElementById("profile-input-name").value=t.display_name||"",document.getElementById("profile-input-photo").value=t.photo_url||"",ji(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),t))}function Nc(t,e){const n=document.getElementById("auth-avatar-btn"),i=document.getElementById("auth-avatar-img"),s=document.getElementById("auth-avatar-initials");if(n)if(t&&e){n.classList.add("is-signed-in"),ji(i,s,e);const r=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");r&&(r.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else n.classList.remove("is-signed-in"),i&&(i.hidden=!0),s&&(s.hidden=!1,s.textContent="👤")}function Oc(){document.addEventListener("click",async t=>{var i;const e=t.target;if(e.closest("#auth-avatar-btn")){if(t.stopPropagation(),Se.loggedIn){const s=document.getElementById("auth-user-menu");s!=null&&s.classList.contains("is-visible")?ne():Pc()}else Ac();return}const n=(i=e.closest("[data-close]"))==null?void 0:i.dataset.close;if(n){tt(n);return}if(e.classList.contains("auth-backdrop")&&e.id){tt(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&ne(),e.closest("#btn-google")){Be(!0);try{await mc(),Pn()}catch(s){console.error("Google sign-in error:",s),Rn(s.code==="auth/popup-closed-by-user"||s.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${s.message||s.code||"unknown error"}`)}finally{Be(!1)}return}if(e.closest("#btn-facebook")){Be(!0);try{await gc(),Pn()}catch(s){console.error("Facebook sign-in error:",s),Rn(s.code==="auth/popup-closed-by-user"||s.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${s.message||s.code||"unknown error"}`)}finally{Be(!1)}return}if(e.closest("#btn-signout")){await Cn(),Lc();return}if(e.closest("#auth-menu-library-btn")){ne(),_c();return}if(e.closest("#auth-menu-profile-btn")){Cc();return}if(e.closest("#auth-menu-signout-btn")){ne(),await Cn();return}}),document.addEventListener("submit",async t=>{if(!t.target.closest("#auth-profile-form"))return;t.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),n=document.getElementById("profile-input-photo").value.trim(),i=document.getElementById("profile-status");i.textContent="Saving…",i.className="auth-status-msg";try{await bc({display_name:e,photo_url:n||void 0}),i.textContent="✓ Saved",i.classList.add("success"),qi()}catch(s){console.error("Profile update error:",s),i.textContent="Failed to save.",i.classList.add("error")}})}function Be(t){["btn-google","btn-facebook"].forEach(e=>{const n=document.getElementById(e);n&&(n.disabled=t,n.classList.toggle("is-loading",t))})}function Rn(t){const e=document.getElementById("auth-login-error");e&&(e.textContent=t,e.style.display="block")}function Dc(){Tc(),Oc(),Se.onChange(Nc)}const bt={android:{name:"Google Play",detect:()=>/Android/i.test(navigator.userAgent),url:"https://play.google.com/store/apps/details?id=com.dn.epitaka"}},Nn="epitaka_app_banner_shown",zi="epitaka_app_banner_dismissed",Mc=720*60*60*1e3,Uc=9e3,$c=400;function Bc(){for(const t of Object.keys(bt))try{if(bt[t].detect())return bt[t]}catch{}return null}function xc(){try{const t=parseInt(localStorage.getItem(zi)||"0",10);return t>0&&Date.now()-t<Mc}catch{return!1}}function On(t){t.classList.remove("show"),t.classList.add("hide"),setTimeout(()=>t.remove(),$c)}function Fc(){const t=Bc();if(!t)return;let e=!1;try{e=sessionStorage.getItem(Nn)==="1"}catch{}if(e||xc())return;try{sessionStorage.setItem(Nn,"1")}catch{}const n=document.createElement("div");n.className="app-banner",n.setAttribute("role","status"),n.setAttribute("aria-label","E-Piṭaka mobile app"),n.innerHTML=`
    <div class="app-banner-icon" aria-hidden="true">📖</div>
    <div class="app-banner-body">
      <div class="app-banner-title">Read with the E-Piṭaka app</div>
      <div class="app-banner-text">Faster reading &amp; offline access on your phone.</div>
    </div>
    <a class="app-banner-btn" href="${t.url}"
       target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">▶</span> Get it on ${t.name}
    </a>
    <button class="app-banner-close" type="button" aria-label="Dismiss">✕</button>
  `,n.querySelector(".app-banner-close").addEventListener("click",()=>{try{localStorage.setItem(zi,String(Date.now()))}catch{}clearTimeout(i),On(n)}),document.body.appendChild(n),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("show")));const i=setTimeout(()=>On(n),Uc)}const Kt="epitaka_sidebar_state";function Hc(t){try{sessionStorage.setItem(Kt,JSON.stringify(t))}catch{}}function Jt(){try{const t=sessionStorage.getItem(Kt);return t?JSON.parse(t):null}catch{return null}}function ct(){try{sessionStorage.removeItem(Kt)}catch{}}const Yt="epitaka_sidebar_pin";function Gi(t){try{localStorage.setItem(Yt,JSON.stringify(t))}catch{}}function Ki(){try{const t=localStorage.getItem(Yt);return t?JSON.parse(t):null}catch{return null}}function Vc(){try{localStorage.removeItem(Yt)}catch{}}const{baseUrl:fe="",lang:Ji="en"}=window.BOOK_CONFIG||{},Yi=["library","search","toc","outline","dict"],Xi={library:"Library",search:"Search",toc:"Table of Contents",outline:"Outline",dict:"Dictionary"},Wc={library:"📚",search:"🔍",toc:"☰",outline:"📋",dict:"📖"},jc=[{panel:"library",icon:"📚",label:"Library"},{panel:"search",icon:"🔍",label:"Search"},{panel:"toc",icon:"☰",label:"Table of contents"},{panel:"outline",icon:"📋",label:"Outline of this book"},{panel:"dict",icon:"📖",label:"Dictionary"}];var xn,Fn;const Qi=((Fn=(xn=Jt())==null?void 0:xn.search)==null?void 0:Fn.typeId)||rs[0].id;let _e,R,ae,Zi,es,_,xe=null,ke="",Ct="library";function qc({bookId:t=""}={}){return _e||(ke=t,zc(),ps(),Lt(),Yc(),Xc(),Qc(),Zc(),al(),el(),Gc()),Dn}const Dn={openPanel:pe,close:L,isOpen:()=>R.classList.contains("open")};function zc(){_e=document.createElement("div"),_e.id="sb-root",_e.innerHTML=`
    <nav id="sb-activity" aria-label="Sidebar">
      ${jc.map(t=>`
        <button type="button" class="sb-activity-btn" data-panel="${t.panel}"
                aria-label="${t.label}" title="${t.label}">${t.icon}</button>
      `).join("")}
    </nav>

    <div id="sb-drawer" role="complementary" aria-labelledby="sb-panel-title">
      <div id="sb-drawer-header">
        <span id="sb-panel-title">Library</span>
        <div class="sb-header-actions">
          <button type="button" id="sb-pin" aria-label="Pin sidebar open"
                  title="Keep sidebar open" aria-pressed="false">📌</button>
          <button type="button" id="sb-close" aria-label="Close sidebar">✕</button>
        </div>
      </div>

      <div id="sb-tabs" role="tablist" aria-label="Sidebar panels">
        ${Yi.map(t=>`
          <button type="button" class="sb-tab" data-panel="${t}"
                  role="tab" aria-selected="false"
                  title="${Xi[t]}">${Wc[t]}</button>
        `).join("")}
      </div>

      <div id="sb-panel-library" class="sb-panel" role="tabpanel">
        <div class="sb-panel-scroll">
          <input id="sb-library-filter" type="search" placeholder="Filter books…"
                 autocomplete="off" aria-label="Filter books">
          <div id="sb-library-tree" class="sb-library-tree"></div>
        </div>
      </div>

      <div id="sb-panel-search" class="sb-panel" role="tabpanel">
        <div class="sb-search-wrap">
          ${os(Z,Qi)}
          <div id="home-filter-wrap"></div>
        </div>
        <div id="home-results-panel"></div>
      </div>

      <div id="sb-panel-toc" class="sb-panel" role="tabpanel">
        <div class="sb-toc-head">
          <a id="sb-toc-outline" class="sb-outline-link"
             href="${fe}/en/book/${ke}/outline">📋 Outline of this book</a>
          <input id="toc-search" type="search" placeholder="Filter headings…"
                 autocomplete="off" aria-label="Filter table of contents">
        </div>
        <ul id="toc-list" role="list"></ul>
      </div>

      <div id="sb-panel-outline" class="sb-panel" role="tabpanel">
        <div class="sb-outline-wrap">
          <a id="sb-outline-full" class="sb-outline-full" target="_blank" rel="noopener noreferrer">
            Open full outline page ↗
          </a>
          <div class="sb-outline-loading">Loading outline…</div>
          <div id="sb-outline-tree" class="sb-outline-tree"></div>
        </div>
      </div>

      <div id="sb-panel-dict" class="sb-panel" role="tabpanel">
        <div class="sb-dict-wrap">
          <div class="sb-dict-header">
            <input id="dict-word-input" type="text" autocomplete="off"
                   aria-label="Dictionary search word" placeholder="Search word…"
                   class="sb-dict-input">
            <ul id="dict-suggestions" role="listbox" aria-label="Suggestions"></ul>
          </div>
          <div id="dict-results" class="sb-dict-results"></div>
        </div>
      </div>

      <div id="sb-resize-handle" aria-label="Resize sidebar" title="Drag to resize"></div>
    </div>
  `,document.body.appendChild(_e),ae=document.createElement("div"),ae.id="sb-backdrop",document.body.appendChild(ae),R=document.getElementById("sb-drawer"),Zi=document.getElementById("sb-activity"),es=document.getElementById("sb-panel-title"),_=document.getElementById("toc-toggle-btn")}async function Gc(){var i,s;const t=await tl(),e=(t==null?void 0:t.hierarchy)||{};xe=new as({baseUrl:fe,lang:Ji,hierarchy:e,ids:Z,initialState:{searchTypeId:Qi},onResultSelect:r=>{Hc({panel:"search",search:xe.getState()}),window.location.href=r},onShowResults:()=>Kc(),onShowBooks:()=>Jc()}),xe.bind(),nl((t==null?void 0:t.menu)||{});const n=Jt();me()&&((i=n==null?void 0:n.search)!=null&&i.query?(pe("search"),xe.restore(n.search)):pe(((s=Ki())==null?void 0:s.panel)||"library")),ct()}function pe(t){Yi.includes(t)||(t="library"),Ct=t,me()&&Gi({pinned:!0,panel:t}),document.querySelectorAll("#sb-root .sb-panel").forEach(e=>e.classList.toggle("active",e.id===`sb-panel-${t}`)),document.querySelectorAll("#sb-root .sb-activity-btn").forEach(e=>e.classList.toggle("active",e.dataset.panel===t)),document.querySelectorAll("#sb-root .sb-tab").forEach(e=>{const n=e.dataset.panel===t;e.classList.toggle("active",n),e.setAttribute("aria-selected",String(n))}),es.textContent=Xi[t],R.classList.add("open"),ae.classList.add("show"),document.body.classList.add("sb-drawer-open"),_==null||_.setAttribute("aria-expanded","true"),t==="outline"&&ll(),requestAnimationFrame(()=>{if(window.innerWidth<768)return;const e=t==="search"?document.getElementById(Z.searchInput):t==="toc"?document.getElementById("toc-search"):t==="outline"?document.getElementById("sb-outline-full"):t==="dict"?document.getElementById("dict-word-input"):document.getElementById("sb-library-filter");e==null||e.focus({preventScroll:!0})})}function L(){var t;R.classList.remove("open"),ae.classList.remove("show"),document.body.classList.remove("sb-drawer-open"),_==null||_.setAttribute("aria-expanded","false"),(t=document.activeElement)!=null&&t.closest("#sb-root")&&(_==null||_.focus())}function Kc(){var t,e;(t=document.getElementById(Z.resultsPanel))==null||t.classList.add("active"),(e=document.getElementById(Z.filterWrap))==null||e.classList.add("show")}function Jc(){var t,e;(t=document.getElementById(Z.resultsPanel))==null||t.classList.remove("active"),(e=document.getElementById(Z.filterWrap))==null||e.classList.remove("show")}function Yc(){_==null||_.addEventListener("click",t=>{var n;if(t.preventDefault(),t.stopPropagation(),R.classList.contains("open")){L();return}const e=Jt();pe((n=e==null?void 0:e.search)!=null&&n.query?"search":"library")})}function Xc(){Zi.addEventListener("click",t=>{const e=t.target.closest(".sb-activity-btn");if(!e)return;const n=e.dataset.panel;n===Ct&&R.classList.contains("open")&&n!=="dict"&&!me()?L():pe(n)}),document.getElementById("sb-tabs").addEventListener("click",t=>{const e=t.target.closest(".sb-tab");e&&pe(e.dataset.panel)}),document.getElementById("sb-pin").addEventListener("click",t=>{t.stopPropagation(),me()?(Vc(),Lt(),L()):(Gi({pinned:!0,panel:Ct}),Lt())}),document.getElementById("sb-close").addEventListener("click",L)}function me(){var t;return!!((t=Ki())!=null&&t.pinned)}function Lt(){const t=document.getElementById("sb-pin"),e=me();t==null||t.classList.toggle("active",e),t==null||t.setAttribute("aria-pressed",String(e)),t==null||t.setAttribute("aria-label",e?"Unpin sidebar":"Pin sidebar open"),t==null||t.setAttribute("title",e?"Unpin sidebar":"Keep sidebar open"),document.body.classList.toggle("sb-pinned",e)}function Qc(){ae.addEventListener("click",L),document.addEventListener("click",t=>{if(!me()&&R.classList.contains("open")){const e=t.target;!e.closest("#sb-root")&&!e.closest("#toc-toggle-btn")&&!e.closest(".sentence-row .pali-text")&&L()}})}function Zc(){document.addEventListener("keydown",t=>{t.key==="Escape"&&R.classList.contains("open")&&L()})}const Mn="epitaka_sidebar_width",Un=240,$n=600;function el(){const t=document.getElementById("sb-resize-handle");if(!t)return;try{const r=parseInt(localStorage.getItem(Mn));r>=Un&&r<=$n&&document.documentElement.style.setProperty("--sb-width",r+"px")}catch{}let e,n;t.addEventListener("mousedown",r=>{r.preventDefault(),e=r.clientX,n=R.offsetWidth,document.body.classList.add("sb-resizing"),document.addEventListener("mousemove",i),document.addEventListener("mouseup",s)});function i(r){const o=r.clientX-e,a=Math.min($n,Math.max(Un,n+o));document.documentElement.style.setProperty("--sb-width",a+"px")}function s(){document.body.classList.remove("sb-resizing"),document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",s);try{const r=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sb-width"));r&&localStorage.setItem(Mn,String(r))}catch{}}}async function tl(){try{const t=await fetch(`${fe}/api/menu`);if(!t.ok)throw new Error(`HTTP ${t.status}`);return await t.json()}catch(t){return console.warn("[sidebar] failed to load menu",t),{menu:{},hierarchy:{}}}}function nl(t){const e=document.getElementById("sb-library-tree");if(!e)return;e.innerHTML="";const n=hl(Object.keys(t));for(const i of n)e.appendChild(il(i,t[i]||{}));ol(e)}function il(t,e){const n=document.createElement("div");n.className="sb-cat";const i=document.createElement("button");i.type="button",i.className="sb-cat-title",i.setAttribute("aria-expanded","true"),i.innerHTML=`<span>${ge(t)}</span><span class="sb-caret" aria-hidden="true">▾</span>`;const s=document.createElement("div");s.className="sb-cat-body open";for(const r of fl(Object.keys(e)))s.appendChild(sl(e[r]||{},r));return i.addEventListener("click",()=>ul(i,s)),n.append(i,s),n}function sl(t,e){const n=document.createElement("div");n.className="book-nikaya";const i=t[""]||[],s=Object.keys(t).filter(a=>a!=="");if(!s.length){const a=document.createElement("div");a.className="book-nikaya-title open",a.innerHTML=`${ge(e)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const c=document.createElement("ol");return c.className="book-nikaya-list open",i.forEach(l=>{const d=document.createElement("li");d.appendChild(Pt(l)),c.appendChild(d)}),n.append(a,c),a.addEventListener("click",()=>{a.classList.toggle("open"),c.classList.toggle("open")}),n}const r=document.createElement("div");r.className="book-nikaya-title open",r.innerHTML=`${ge(e)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const o=document.createElement("ol");o.className="book-nikaya-list open",i.length&&i.forEach(a=>{const c=document.createElement("li");c.appendChild(Pt(a)),o.appendChild(c)});for(const a of s){const c=document.createElement("li");c.appendChild(rl(a,t[a])),o.appendChild(c)}return r.addEventListener("click",()=>{r.classList.toggle("open"),o.classList.toggle("open")}),n.append(r,o),n}function rl(t,e){const n=document.createElement("div");n.className="sb-sub";const i=document.createElement("div");i.className="book-nikaya-title sb-sub-title open",i.innerHTML=`${ge(t)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const s=document.createElement("ol");return s.className="book-nikaya-list open",e.forEach(r=>{const o=document.createElement("li");o.appendChild(Pt(r)),s.appendChild(o)}),i.addEventListener("click",()=>{i.classList.toggle("open"),s.classList.toggle("open")}),n.append(i,s),n}function Pt([t,e]){const n=document.createElement("a");return n.className="book-entry"+(t===ke?" current":""),n.href=`${fe}/${Ji}/book/${t}`,n.dataset.bookId=t,n.innerHTML=`<span class="book-name">${ge(e)}</span>`,n.addEventListener("click",()=>ct()),n}function ol(t){const e=document.getElementById("sb-library-filter");if(!e)return;const n=[...t.querySelectorAll(".book-entry")],i=n.map(r=>ze(r.textContent||"").toLowerCase()),s=n.map(r=>r.closest("li"));e.addEventListener("input",()=>{const r=ze(e.value).toLowerCase();n.forEach((o,a)=>{const c=!r||i[a].includes(r);o.style.display=c?"":"none",s[a]&&(s[a].style.display=c?"":"none")}),t.querySelectorAll(".sb-cat, .book-nikaya, .sb-sub").forEach(o=>{var l,d;const a=[...o.querySelectorAll(".book-entry")].some(u=>u.style.display!=="none");if(o.style.display=!r||a?"":"none",!r||!a)return;const c=o.querySelector(".sb-cat-body, .book-nikaya-list");if(c){c.classList.add("open");const u=c.previousElementSibling;(l=u==null?void 0:u.classList)!=null&&l.contains("sb-cat-title")&&u.setAttribute("aria-expanded","true"),(d=u==null?void 0:u.classList)!=null&&d.contains("book-nikaya-title")&&u.classList.add("open")}}),t.querySelectorAll("li").forEach(o=>{const a=[...o.querySelectorAll(".book-entry")].some(c=>c.style.display!=="none");o.style.display=a?"":"none"})})}function al(){const t=document.getElementById("toc-list"),e=document.getElementById("toc-search");document.querySelectorAll(".section-block").forEach(r=>{var u,h;const o=r.dataset.paraId,a=r.querySelector(".section-heading-link, .section-heading-empty");if(!a||!o)return;const c=a.dataset.level||1,l=(h=(u=a.querySelector(".section-heading-text"))==null?void 0:u.textContent)==null?void 0:h.trim();if(!l)return;const d=document.createElement("li");d.innerHTML=`<div class="toc-item" role="button" tabindex="0" data-para-id="${o}" data-level="${c}"><span class="toc-item-text pali-text"></span></div>`,d.querySelector(".toc-item-text").textContent=l,t.appendChild(d)});const n=[...t.querySelectorAll(".toc-item")],i=n.map(r=>ze(r.textContent).toLowerCase());Hn(e,{mode:"both",onConvert:r=>{e.value=r,e.dispatchEvent(new Event("input"))}}),e.addEventListener("input",()=>{const r=ze(e.value).toLowerCase();n.forEach((o,a)=>{o.closest("li").style.display=!r||i[a].includes(r)?"":"none"})}),n.forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.dataset.paraId);window.innerWidth<768&&L(),ct();const a=document.querySelector(`.section-block[data-para-id="${o}"]`),c=a==null?void 0:a.querySelector(".section-heading-link");if(c!=null&&c.href){const l=new URL(c.href,window.location.href);l.hash=String(o),window.location.href=l.href}}),r.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),r.click())})});const s=new IntersectionObserver(r=>{for(const o of r){if(!o.isIntersecting)continue;const a=parseInt(o.target.dataset.paraId);cl(a)}},{rootMargin:"-52px 0px -67% 0px"});document.querySelectorAll(".section-block").forEach(r=>s.observe(r))}function cl(t){document.querySelectorAll("#toc-list .toc-item").forEach(e=>{const n=parseInt(e.dataset.paraId)===t;e.classList.toggle("active",n),n&&R.classList.contains("open")&&e.scrollIntoView({block:"nearest"})})}let Bn=!1;function ll(){const t=document.getElementById("sb-outline-tree"),e=document.getElementById("sb-outline-full"),n=document.querySelector(".sb-outline-loading");!t||Bn||(Bn=!0,e&&(e.href=`${fe}/en/book/${ke}/outline`),(async()=>{try{const i=await fetch(`${fe}/api/outline/${encodeURIComponent(ke)}`);if(!i.ok)throw new Error(`HTTP ${i.status}`);const s=await i.json();e&&s.outline_url&&(e.href=s.outline_url),dl(t,s.groups||[])}catch(i){console.warn("[sidebar] failed to load outline",i),t&&(t.innerHTML='<div class="sb-outline-empty">Outline not available.</div>')}finally{n&&(n.style.display="none")}})())}function dl(t,e){if(t.innerHTML="",!e.length){t.innerHTML='<div class="sb-outline-empty">No sections found for this book.</div>';return}for(const n of e){const i=document.createElement("div");i.className="sb-outline-vagga";const s=document.createElement("div");s.className="sb-outline-vagga-title open",s.innerHTML=`${ge(n.title||"")}<span class="sb-caret" aria-hidden="true">▾</span>`;const r=document.createElement("div");r.className="sb-outline-vagga-body open",s.addEventListener("click",()=>{const o=r.classList.toggle("open");s.classList.toggle("open",o)});for(const o of n.suttas||[]){const a=document.createElement("div");if(a.className="sb-outline-sutta",o.title){const l=document.createElement("div");l.className="sb-outline-sutta-title",l.textContent=o.title,a.appendChild(l)}const c=document.createElement("ol");c.className="sb-outline-list";for(const l of o.sections||[]){const d=document.createElement("li");d.className="sb-outline-item";const u=document.createElement("a");if(u.className="sb-outline-item-link pali-text",u.href=l.book_url||"#",u.textContent=l.title||"Section "+l.para_id,u.addEventListener("click",()=>{window.innerWidth<768&&L(),ct()}),d.appendChild(u),l.study_url){const h=document.createElement("a");h.className="sb-outline-study",h.href=l.study_url,h.target="_blank",h.rel="noopener noreferrer",h.title=l.study_title||"Study guide",h.setAttribute("aria-label","Study guide"),h.textContent="📖",d.appendChild(h)}c.appendChild(d)}a.appendChild(c),r.appendChild(a)}i.append(s,r),t.appendChild(i)}}function ul(t,e){const n=e.classList.toggle("open");t.setAttribute("aria-expanded",String(n))}function hl(t){const e=["Mūla","Aṭṭhakathā","Ṭīkā"];return[...e.filter(n=>t.includes(n)),...t.filter(n=>!e.includes(n))]}function fl(t){const e=["Vinaya","Suttanta","Sutta","Abhidhamma"];return[...e.filter(n=>t.includes(n)),...t.filter(n=>!e.includes(n))]}function ge(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const{bookId:Xt,baseUrl:Rt,lang:Nt,bookref:pl}=window.BOOK_CONFIG,yt=new WeakMap,ml=document.getElementById("settings-btn"),ce=document.getElementById("settings-modal"),gl=document.getElementById("settings-form"),bl=document.getElementById("settings-cancel");cs();qc({bookId:Xt});const Ot=window.REF_LINKS||{};console.debug("[REF_LINKS] loaded:",Object.keys(Ot).length,"keys",Ot);const je=Object.keys(Ot).map(Number).sort((t,e)=>t-e);console.debug("[REF_LINKS] sorted para_ids:",je);function yl(t){let e=0,n=je.length-1,i=-1;for(;e<=n;){const s=e+n>>>1;je[s]<=t?(i=je[s],e=s+1):n=s-1}return i}const ts=new IntersectionObserver(t=>{let e=1/0;for(const n of t){if(!n.isIntersecting)continue;const i=n.target.id,s=i&&i.match(/^p-(\d+)-l-\d+$/);if(s){const r=parseInt(s[1]);r<e&&(e=r)}}if(e<1/0){const n=yl(e);console.debug("[sentinel] visible sentence para_id:",e,"→ nearest ref:",n),n>0&&Il(n)}},{rootMargin:"0px 0px -10% 0px"});function _l(){document.querySelectorAll(".section-content.open .sentence-row").forEach(t=>ts.observe(t))}_l();function ns(t){document.querySelectorAll(".pali-text, .book-link-badge").forEach(e=>{yt.has(e)||yt.set(e,e.innerHTML);const n=yt.get(e);e.innerHTML=t===_t.RO?n:vl(n,t)})}function vl(t,e){return t.replace(/(<[^>]+>)|([^<]+)/g,(n,i,s)=>i||qe.convert(qe.convertFromMixed(s),e))}function Il(t){const e=["mula_ref","attha_ref","tika_ref"],n={mula_ref:"ref-mula",attha_ref:"ref-attha",tika_ref:"ref-tika"},s=(window.REF_LINKS||{})[t];if(s)for(const r of e){const o=s[r]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[r]}-${a+1}`);if(c){const l=o[a],d=[Nt,"book",l.book_id,l.slug].filter(Boolean).join("/");c.href=Rt+"/"+d+"#"+l.para_id}}}else for(const r of e){const o=pl[r]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[r]}-${a+1}`);c&&(c.href=`${Rt}/${Nt}/book_ref/${o[a].book_id}?ref=${Xt}&para_id=${t}`)}}}function is(){const t=document.body.getAttribute("data-flow")==="true";document.querySelectorAll(".para-group").forEach(e=>{let n=e.querySelector(".book-links-end");if(t){const i=e.querySelectorAll(".sentence-row .book-link-badge, .sentence-row .book-link-more");if(!i.length)return;n||(n=document.createElement("div"),n.className="book-links-end",e.appendChild(n)),n.innerHTML="",i.forEach(s=>n.appendChild(s.cloneNode(!0)))}else n&&n.remove()})}ml.addEventListener("click",()=>{const t=Dt();ls(t),Vn(document.getElementById("pali-script-select"),t.paliScript),ce.classList.add("show")});bl.addEventListener("click",()=>ce.classList.remove("show"));ce.addEventListener("click",t=>{t.target===ce&&ce.classList.remove("show")});gl.addEventListener("submit",t=>{t.preventDefault();const e=ds();us(e),hs(e.theme),Wn(e),ns(e.paliScript),is(),ce.classList.remove("show")});function wl(){if(!window.BOOK_CONFIG)return;const{baseUrl:t,bookId:e}=window.BOOK_CONFIG;let n=null,i=null,s=null;function r(a){i=a,Se.loggedIn&&a!==n&&(n=a,clearTimeout(s),s=setTimeout(async()=>{var p,m;const c=document.querySelector(`.section-block[data-para-id="${a}"]`),l=c==null?void 0:c.querySelector(".section-heading-text"),d=((p=l==null?void 0:l.textContent)==null?void 0:p.trim())||"",u=document.querySelector(".book-title"),h=((m=u==null?void 0:u.textContent)==null?void 0:m.trim())||"";try{const b=await xi();if(!b)return;fetch(`${t}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b}`},body:JSON.stringify({para_id:a,section_title:d,book_title:h})})}catch{}},5e3))}const o=new IntersectionObserver(a=>{for(const c of a){if(!c.isIntersecting)continue;const l=parseInt(c.target.dataset.paraId);isNaN(l)||r(l)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(a=>o.observe(a)),Se.onChange(a=>{a&&i!==null&&r(i)})}async function El(){try{const t=await fetch(`${Rt}/api/book/${Xt}/heading_translations?lang=${encodeURIComponent(Nt)}`);if(!t.ok)return;const e=await t.json();for(const[n,i]of Object.entries(e)){const s=document.querySelector(`.section-block[data-para-id="${n}"]`);if(!s)continue;let r=s.querySelector(".section-heading-translation");if(!r){const o=s.querySelector(".section-heading-link, .section-heading-empty");if(!o)continue;r=document.createElement("span"),r.className="section-heading-translation",o.appendChild(r)}r.innerHTML=i}}catch(t){console.debug("[book] failed to fetch heading translations",t)}}document.addEventListener("DOMContentLoaded",async()=>{ms(document.getElementById("main-content"));const t=Dt();Wn(t),ns(t.paliScript),Vn(document.getElementById("pali-script-select"),t.paliScript),is(),Dc(),kc(),Fc(),fs({gaId:"G-7NQWX1DCC2"}),wl(),El();function e(d){const u=document.querySelectorAll(".section-block");let h=null;for(const p of u){const m=parseInt(p.dataset.paraId);!isNaN(m)&&m<=d&&(h=p)}return h}function n(d){return[...document.querySelectorAll(".sentence-row")].find(h=>{const p=h.id.match(/^p-(\d+)-l-(\d+)$/);return p&&parseInt(p[1],10)===d})||null}function i(d,u){const h=document.getElementById(`p-${d}-l-${u}`);return(h==null?void 0:h.id)===`p-${d}-l-${u}`?h:null}function s(d){if(!d)return;const u=d.querySelector(".section-content");u&&!u.classList.contains("open")&&(u.classList.add("open"),u.setAttribute("aria-hidden","false"),u.querySelectorAll(".sentence-row").forEach(h=>ts.observe(h)))}function r(){document.querySelectorAll(".jump-target-highlight").forEach(d=>{d.classList.remove("jump-target-highlight")})}function o(d,u){var E;if(!d||!u)return;const h=u.trim();if(!h)return;const p=h.toLocaleLowerCase(),m=document.createTreeWalker(d,NodeFilter.SHOW_TEXT),b=[];let w;for(;w=m.nextNode();)(E=w.parentElement)!=null&&E.closest("script, style, mark")||w.nodeValue.toLocaleLowerCase().includes(p)&&b.push(w);b.forEach(G=>{const Ne=G.nodeValue,ss=Ne.toLocaleLowerCase(),Oe=document.createDocumentFragment();let De=0,ye;for(;(ye=ss.indexOf(p,De))!==-1;){Oe.append(Ne.slice(De,ye));const lt=document.createElement("mark");lt.className="jump-search-term",lt.textContent=Ne.slice(ye,ye+h.length),Oe.append(lt),De=ye+h.length}Oe.append(Ne.slice(De)),G.replaceWith(Oe)})}function a(d,u=""){requestAnimationFrame(()=>{r();const h=d.closest(".para-group")||d;h.classList.remove("jump-target-highlight"),h.offsetWidth,h.classList.add("jump-target-highlight"),o(h,u),d.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>h.classList.remove("jump-target-highlight"),5e3)})}document.addEventListener("click",d=>{const u=d.target.closest("a[href]");if(!u||u.target==="_blank")return;let h;try{h=new URL(u.href,window.location.href)}catch{return}if(h.origin!==window.location.origin||h.pathname!==window.location.pathname)return;const p=h.hash.replace(/^#/,"");if(!p)return;const m=p.split("-"),b=parseInt(m[0],10);if(isNaN(b))return;const w=parseInt(m[1],10);let E=isNaN(w)?n(b):i(b,w);if(!E){const G=e(b);s(G),E=isNaN(w)?n(b)||G:i(b,w)}E&&(d.preventDefault(),history.pushState(null,"",h.hash),a(E,h.searchParams.get("q")||""))});const c=window.location.hash.replace(/^#/,""),l=new URLSearchParams(window.location.search).get("q")||"";if(c){const d=c.split("-"),u=parseInt(d[0]),h=d.length>=2?parseInt(d[1]):NaN;if(!isNaN(u))if(isNaN(h)){let p=n(u);if(!p){const m=e(u);s(m),p=n(u)}if(p)a(p,l);else{const m=e(u);m&&a(m,l)}}else{let p=i(u,h);if(!p){const m=e(u);s(m),p=i(u,h)}if(p)a(p,l);else{const m=e(u);m&&a(m,l)}}}else if(window.BOOK_CONFIG.paraId){const d=e(window.BOOK_CONFIG.paraId);d&&setTimeout(()=>{d.scrollIntoView({behavior:"smooth",block:"start"})},200)}});

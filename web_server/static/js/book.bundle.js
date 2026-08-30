import{i as qn,l as Ie,S as je,T as de,a as dr,H as te,b as ur,r as ze,c as hr,d as fr,p as Wn,e as Dt,f as pr,s as mr,g as gr,h as jn,o as br,j as yr}from"./cookie-consent-LVKrRp8B.chunk.js";const{bookId:kl,baseUrl:zn,bookref:Tl}=window.BOOK_CONFIG;let v,D,R,en=!1,Me=null,I=-1;function dt(t){if(!t)return t;try{const e=de.convertFromMixed(t);return de.convert(e,je.RO).trim()||t}catch{return t}}function _r(){if(!en){if(en=!0,v=document.getElementById("dict-word-input"),D=document.getElementById("dict-suggestions"),R=document.getElementById("dict-results"),!v){console.warn("[dict] #dict-word-input not found — sidebar may not have rendered yet");return}qn(v,{mode:"both"}),v.addEventListener("input",()=>{const t=v.value.trim();if(I=-1,!t){X();return}wr(dt(t))}),v.addEventListener("keydown",t=>{const e=D.querySelectorAll(".dict-suggestion-item");t.key==="ArrowDown"?(t.preventDefault(),I=Math.min(I+1,e.length-1),tn(e)):t.key==="ArrowUp"?(t.preventDefault(),I=Math.max(I-1,-1),tn(e)):t.key==="Enter"?(t.preventDefault(),I>=0&&e[I]?Ge(dt(e[I].dataset.word)):Ge(dt(v.value.trim()))):t.key==="Escape"&&X()}),document.addEventListener("click",t=>{!t.target.closest(".sb-dict-header")&&t.target!==v&&X()})}}function vr(t){t.querySelectorAll(".sentence-row .pali-text").forEach(e=>{e.hasAttribute("title")||e.setAttribute("title","Click a word to look it up in the dictionary"),e.addEventListener("click",Ir)})}function Ir(t){const e=window.getSelection();if(e&&e.toString().trim())return;const n=Lr(t);if(!n)return;const i=Ie();let r=n;if(i.paliScript!==je.RO){const s=de.convertFrom(n,i.paliScript);r=de.convert(s,je.RO)}r=r.trim().replace(/[.,;:!?()[\]{}'"]/g,"").toLowerCase(),r&&Er(r)}function Er(t){if(!v)return;v.value=t,X();const e=document.querySelector('#sb-activity .sb-activity-btn[data-panel="dict"]');e&&e.click(),Gn(t)}async function Gn(t){if(!(!t||!R)){R.innerHTML='<div class="dict-loading">Looking up…</div>';try{const n=await(await fetch(`${zn}/api/dictionary?word=${encodeURIComponent(t)}`)).json();kr(n)}catch{R.innerHTML='<div class="dict-error">Lookup failed.</div>'}}}async function wr(t){Me&&Me.abort(),Me=new AbortController;try{const n=await(await fetch(`${zn}/api/suggest_word?q=${encodeURIComponent(t)}`,{signal:Me.signal})).json();Sr(n)}catch(e){e.name!=="AbortError"&&X()}}function Sr(t){if(!(t!=null&&t.length)||!D){X();return}D.innerHTML=t.map(e=>`
    <li class="dict-suggestion-item"
        role="option"
        data-word="${e}"
        tabindex="-1">
      <span class="suggest-word pali-text">${e}</span>
    </li>
  `).join(""),D.querySelectorAll(".dict-suggestion-item").forEach(e=>{e.addEventListener("mousedown",n=>{n.preventDefault(),Ge(e.dataset.word)})}),D.classList.add("open")}function tn(t){var e;t.forEach((n,i)=>n.classList.toggle("active",i===I)),I>=0&&((e=t[I])==null||e.scrollIntoView({block:"nearest"}))}function Ge(t){!t||!v||(v.value=t,X(),Gn(t))}function X(){D&&(D.innerHTML="",D.classList.remove("open")),I=-1}function kr(t){if(!(t!=null&&t.length)||!R){R&&(R.innerHTML='<p class="dict-empty">No results found.</p>');return}let e="",n=null;for(const i of t){if(i.type==="deconstruction"){e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>
        ${Tr(i)}
      </div>`;continue}i.book_name!==n&&(n&&(e+="</div>"),e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>`,n=i.book_name),e+=`<div class="dict-entry">
      <div class="dict-entry-word">${i.word}</div>
      <div class="dict-entry-def">${i.definition}</div>
      ${Ar(i.usages||[])}
    </div>`}n&&(e+="</div>"),R.innerHTML=e,R.querySelectorAll(".decon-part").forEach(i=>{const r=i.dataset.word;r&&i.addEventListener("click",s=>{s.stopPropagation(),Ge(r)})})}function Tr(t){const e=t.components||[];if(!e.length)return"";const n=e.map((i,r)=>{const s=r===e.length-1;return`
      <span class="decon-part" data-word="${S(i)}" tabindex="0" role="button">
        <span class="decon-part-word">${S(i)}</span>
      </span>
      ${s?"":'<span class="decon-plus">+</span>'}`}).join("");return`<div class="decon-card">
    <div class="decon-formula">
      <span class="decon-original-word">${S(t.word)}</span>
      <span class="decon-arrow">→</span>
      <span class="decon-breakdown">${n}</span>
    </div>
  </div>`}function Ar(t){return t.length?`<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${t.map(n=>{const i=n.word+(n.ending||""),r=Cr(n.pali||"",i),s=n.translation;return`<div class="dict-usage">
      <div class="dict-usage-pali">${r}</div>
      ${s?`<div class="dict-usage-trans">${S(s)}</div>`:""}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${S(n.book_name)}</span>
        <a class="dict-usage-open" href="${S(n.reader_url)}" target="_blank" rel="noopener">↗</a>
      </div>
    </div>`}).join("")}
  </div>`:""}function Cr(t,e){if(!e||!t)return S(t);const n=t.toLowerCase().indexOf(e.toLowerCase());return n===-1?S(t):S(t.slice(0,n))+`<mark>${S(t.slice(n,n+e.length))}</mark>`+S(t.slice(n+e.length))}function S(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Lr(t){var a,c,l,d;if(!document.caretRangeFromPoint)return null;const e=document.caretRangeFromPoint(t.clientX,t.clientY);if(!e)return null;const n=e.startContainer,i=e.startOffset;if(n.nodeType!==Node.TEXT_NODE)return null;const r=n.textContent,s=((c=(a=n.parentElement)==null?void 0:a.closest("[lang]"))==null?void 0:c.getAttribute("lang"))||"en",o=((d=(l=n.parentElement)==null?void 0:l.closest("[data-script]"))==null?void 0:d.getAttribute("data-script"))||null;return Pr(r,i,s,o)}function Pr(t,e,n,i){const r=["ro","si","hi","be","as","gm","gj","te","ka","mm","tb","cy","br"];return["en","in","es","pt","hi","si","ch"].includes(n)||r.includes(i)?Rr(t,e):typeof Intl<"u"&&Intl.Segmenter?Or(t,e,n):Kn(t,e)}function Rr(t,e){const n=/[\s\u200b\u00a0।॥၊။,\.\!\?;:\"\'()\[\]{}<>\/\\]/,i=t[e];if(i===void 0||n.test(i))return null;let r=e,s=e;for(;r>0&&!n.test(t[r-1]);)r--;for(;s<t.length&&!n.test(t[s]);)s++;return t.slice(r,s).trim()||null}function Or(t,e,n){const r={th:"th",my:"my",lo:"lo",km:"km",tt:"th",en:"en",hi:"hi",si:"si",be:"bn",as:"as",gm:"pa",gj:"gu",te:"te",ka:"kn",mm:"ml",tb:"bo",cy:"ru"}[n]||n;try{const o=[...new Intl.Segmenter(r,{granularity:"word"}).segment(t)];for(const a of o){const c=a.index,l=a.index+a.segment.length;if(e>=c&&e<=l)return a.isWordLike===!1?null:a.segment.trim()||null}}catch{}return Kn(t,e)}function Kn(t,e){const n=[[3584,3711],[3712,3839],[4096,4255],[6016,6143],[6688,6831]];function i(a){const c=a.codePointAt(0);return n.some(([l,d])=>c>=l&&c<=d)}const r=t[e];if(r===void 0||!i(r))return null;let s=e,o=e;for(;s>0&&i(t[s-1]);)s--;for(;o<t.length&&i(t[o]);)o++;return t.slice(s,o).trim()||null}const Nr=()=>{};var nn={};/**
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
 */const Jn=function(t){const e=[];let n=0;for(let i=0;i<t.length;i++){let r=t.charCodeAt(i);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&i+1<t.length&&(t.charCodeAt(i+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++i)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},Dr=function(t){const e=[];let n=0,i=0;for(;n<t.length;){const r=t[n++];if(r<128)e[i++]=String.fromCharCode(r);else if(r>191&&r<224){const s=t[n++];e[i++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){const s=t[n++],o=t[n++],a=t[n++],c=((r&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[i++]=String.fromCharCode(55296+(c>>10)),e[i++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[i++]=String.fromCharCode((r&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Yn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let r=0;r<t.length;r+=3){const s=t[r],o=r+1<t.length,a=o?t[r+1]:0,c=r+2<t.length,l=c?t[r+2]:0,d=s>>2,u=(s&3)<<4|a>>4;let h=(a&15)<<2|l>>6,p=l&63;c||(p=64,o||(h=64)),i.push(n[d],n[u],n[h],n[p])}return i.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Jn(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Dr(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let r=0;r<t.length;){const s=n[t.charAt(r++)],a=r<t.length?n[t.charAt(r)]:0;++r;const l=r<t.length?n[t.charAt(r)]:64;++r;const u=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||a==null||l==null||u==null)throw new Mr;const h=s<<2|a>>4;if(i.push(h),l!==64){const p=a<<4&240|l>>2;if(i.push(p),u!==64){const m=l<<6&192|u;i.push(m)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Mr extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ur=function(t){const e=Jn(t);return Yn.encodeByteArray(e,!0)},Xn=function(t){return Ur(t).replace(/\./g,"")},Qn=function(t){try{return Yn.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Br(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const xr=()=>Br().__FIREBASE_DEFAULTS__,$r=()=>{if(typeof process>"u"||typeof nn>"u")return;const t=nn.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Fr=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Qn(t[1]);return e&&JSON.parse(e)},Mt=()=>{try{return Nr()||xr()||$r()||Fr()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Hr=t=>{var e,n;return(n=(e=Mt())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Zn=()=>{var t;return(t=Mt())==null?void 0:t.config},ei=t=>{var e;return(e=Mt())==null?void 0:e[`_${t}`]};/**
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
 */class Vr{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,i)=>{n?this.reject(n):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,i))}}}/**
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
 */function y(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function qr(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(y())}function Wr(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function jr(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function zr(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Gr(){const t=y();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Kr(){try{return typeof indexedDB=="object"}catch{return!1}}function Jr(){return new Promise((t,e)=>{try{let n=!0;const i="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(i);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(i),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var s;e(((s=r.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}/**
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
 */const Yr="FirebaseError";class z extends Error{constructor(e,n,i){super(n),this.code=e,this.customData=i,this.name=Yr,Object.setPrototypeOf(this,z.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Te.prototype.create)}}class Te{constructor(e,n,i){this.service=e,this.serviceName=n,this.errors=i}create(e,...n){const i=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],o=s?Xr(s,i):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new z(r,a,i)}}function Xr(t,e){return t.replace(Qr,(n,i)=>{const r=e[i];return r!=null?String(r):`<${i}?>`})}const Qr=/\{\$([^}]+)}/g;function Zr(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ue(t,e){if(t===e)return!0;const n=Object.keys(t),i=Object.keys(e);for(const r of n){if(!i.includes(r))return!1;const s=t[r],o=e[r];if(rn(s)&&rn(o)){if(!ue(s,o))return!1}else if(s!==o)return!1}for(const r of i)if(!n.includes(r))return!1;return!0}function rn(t){return t!==null&&typeof t=="object"}/**
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
 */function Ae(t){const e=[];for(const[n,i]of Object.entries(t))Array.isArray(i)?i.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}function es(t,e){const n=new ts(t,e);return n.subscribe.bind(n)}class ts{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,i){let r;if(e===void 0&&n===void 0&&i===void 0)throw new Error("Missing Observer.");ns(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:i},r.next===void 0&&(r.next=ut),r.error===void 0&&(r.error=ut),r.complete===void 0&&(r.complete=ut);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ns(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function ut(){}/**
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
 */function G(t){return t&&t._delegate?t._delegate:t}/**
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
 */function Ut(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function is(t){return(await fetch(t,{credentials:"include"})).ok}class he{constructor(e,n,i){this.name=e,this.instanceFactory=n,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const J="[DEFAULT]";/**
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
 */class rs{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const i=new Vr;if(this.instancesDeferred.set(n,i),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&i.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(i)return null;throw r}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(os(e))try{this.getOrInitializeService({instanceIdentifier:J})}catch{}for(const[n,i]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:r});i.resolve(s)}catch{}}}}clearInstance(e=J){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=J){return this.instances.has(e)}getOptions(e=J){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:i,options:n});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);i===a&&o.resolve(r)}return r}onInit(e,n){const i=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(i)??new Set;r.add(e),this.onInitCallbacks.set(i,r);const s=this.instances.get(i);return s&&e(s,i),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){const i=this.onInitCallbacks.get(n);if(i)for(const r of i)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:ss(e),options:n}),this.instances.set(e,i),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=J){return this.component?this.component.multipleInstances?e:J:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ss(t){return t===J?void 0:t}function os(t){return t.instantiationMode==="EAGER"}/**
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
 */class as{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new rs(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var g;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(g||(g={}));const cs={debug:g.DEBUG,verbose:g.VERBOSE,info:g.INFO,warn:g.WARN,error:g.ERROR,silent:g.SILENT},ls=g.INFO,ds={[g.DEBUG]:"log",[g.VERBOSE]:"log",[g.INFO]:"info",[g.WARN]:"warn",[g.ERROR]:"error"},us=(t,e,...n)=>{if(e<t.logLevel)return;const i=new Date().toISOString(),r=ds[e];if(r)console[r](`[${i}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ti{constructor(e){this.name=e,this._logLevel=ls,this._logHandler=us,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in g))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?cs[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,g.DEBUG,...e),this._logHandler(this,g.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,g.VERBOSE,...e),this._logHandler(this,g.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,g.INFO,...e),this._logHandler(this,g.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,g.WARN,...e),this._logHandler(this,g.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,g.ERROR,...e),this._logHandler(this,g.ERROR,...e)}}const hs=(t,e)=>e.some(n=>t instanceof n);let sn,on;function fs(){return sn||(sn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ps(){return on||(on=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ni=new WeakMap,vt=new WeakMap,ii=new WeakMap,ht=new WeakMap,Bt=new WeakMap;function ms(t){const e=new Promise((n,i)=>{const r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(q(t.result)),r()},o=()=>{i(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&ni.set(n,t)}).catch(()=>{}),Bt.set(e,t),e}function gs(t){if(vt.has(t))return;const e=new Promise((n,i)=>{const r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),r()},o=()=>{i(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});vt.set(t,e)}let It={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return vt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||ii.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return q(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function bs(t){It=t(It)}function ys(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const i=t.call(ft(this),e,...n);return ii.set(i,e.sort?e.sort():[e]),q(i)}:ps().includes(t)?function(...e){return t.apply(ft(this),e),q(ni.get(this))}:function(...e){return q(t.apply(ft(this),e))}}function _s(t){return typeof t=="function"?ys(t):(t instanceof IDBTransaction&&gs(t),hs(t,fs())?new Proxy(t,It):t)}function q(t){if(t instanceof IDBRequest)return ms(t);if(ht.has(t))return ht.get(t);const e=_s(t);return e!==t&&(ht.set(t,e),Bt.set(e,t)),e}const ft=t=>Bt.get(t);function vs(t,e,{blocked:n,upgrade:i,blocking:r,terminated:s}={}){const o=indexedDB.open(t,e),a=q(o);return i&&o.addEventListener("upgradeneeded",c=>{i(q(o.result),c.oldVersion,c.newVersion,q(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{s&&c.addEventListener("close",()=>s()),r&&c.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const Is=["get","getKey","getAll","getAllKeys","count"],Es=["put","add","delete","clear"],pt=new Map;function an(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(pt.get(e))return pt.get(e);const n=e.replace(/FromIndex$/,""),i=e!==n,r=Es.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!(r||Is.includes(n)))return;const s=async function(o,...a){const c=this.transaction(o,r?"readwrite":"readonly");let l=c.store;return i&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),r&&c.done]))[0]};return pt.set(e,s),s}bs(t=>({...t,get:(e,n,i)=>an(e,n)||t.get(e,n,i),has:(e,n)=>!!an(e,n)||t.has(e,n)}));/**
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
 */class ws{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Ss(n)){const i=n.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(n=>n).join(" ")}}function Ss(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Et="@firebase/app",cn="0.15.1";/**
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
 */const x=new ti("@firebase/app"),ks="@firebase/app-compat",Ts="@firebase/analytics-compat",As="@firebase/analytics",Cs="@firebase/app-check-compat",Ls="@firebase/app-check",Ps="@firebase/auth",Rs="@firebase/auth-compat",Os="@firebase/database",Ns="@firebase/data-connect",Ds="@firebase/database-compat",Ms="@firebase/functions",Us="@firebase/functions-compat",Bs="@firebase/installations",xs="@firebase/installations-compat",$s="@firebase/messaging",Fs="@firebase/messaging-compat",Hs="@firebase/performance",Vs="@firebase/performance-compat",qs="@firebase/remote-config",Ws="@firebase/remote-config-compat",js="@firebase/storage",zs="@firebase/storage-compat",Gs="@firebase/firestore",Ks="@firebase/ai",Js="@firebase/firestore-compat",Ys="firebase",Xs="12.16.0";/**
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
 */const wt="[DEFAULT]",Qs={[Et]:"fire-core",[ks]:"fire-core-compat",[As]:"fire-analytics",[Ts]:"fire-analytics-compat",[Ls]:"fire-app-check",[Cs]:"fire-app-check-compat",[Ps]:"fire-auth",[Rs]:"fire-auth-compat",[Os]:"fire-rtdb",[Ns]:"fire-data-connect",[Ds]:"fire-rtdb-compat",[Ms]:"fire-fn",[Us]:"fire-fn-compat",[Bs]:"fire-iid",[xs]:"fire-iid-compat",[$s]:"fire-fcm",[Fs]:"fire-fcm-compat",[Hs]:"fire-perf",[Vs]:"fire-perf-compat",[qs]:"fire-rc",[Ws]:"fire-rc-compat",[js]:"fire-gcs",[zs]:"fire-gcs-compat",[Gs]:"fire-fst",[Js]:"fire-fst-compat",[Ks]:"fire-vertex","fire-js":"fire-js",[Ys]:"fire-js-all"};/**
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
 */const Ke=new Map,Zs=new Map,St=new Map;function ln(t,e){try{t.container.addComponent(e)}catch(n){x.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ee(t){const e=t.name;if(St.has(e))return x.debug(`There were multiple attempts to register component ${e}.`),!1;St.set(e,t);for(const n of Ke.values())ln(n,t);for(const n of Zs.values())ln(n,t);return!0}function ri(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function A(t){return t==null?!1:t.settings!==void 0}/**
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
 */const eo={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},W=new Te("app","Firebase",eo);/**
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
 */class to{constructor(e,n,i){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new he("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw W.create("app-deleted",{appName:this._name})}}/**
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
 */const Ce=Xs;function si(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const i={name:wt,automaticDataCollectionEnabled:!0,...e},r=i.name;if(typeof r!="string"||!r)throw W.create("bad-app-name",{appName:String(r)});if(n||(n=Zn()),!n)throw W.create("no-options");const s=Ke.get(r);if(s){if(ue(n,s.options)&&ue(i,s.config))return s;throw W.create("duplicate-app",{appName:r})}const o=new as(r);for(const c of St.values())o.addComponent(c);const a=new to(n,i,o);return Ke.set(r,a),a}function no(t=wt){const e=Ke.get(t);if(!e&&t===wt&&Zn())return si();if(!e)throw W.create("no-app",{appName:t});return e}function se(t,e,n){let i=Qs[t]??t;n&&(i+=`-${n}`);const r=i.match(/\s|\//),s=e.match(/\s|\//);if(r||s){const o=[`Unable to register library "${i}" with version "${e}":`];r&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),r&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),x.warn(o.join(" "));return}Ee(new he(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const io="firebase-heartbeat-database",ro=1,we="firebase-heartbeat-store";let mt=null;function oi(){return mt||(mt=vs(io,ro,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(we)}catch(n){console.warn(n)}}}}).catch(t=>{throw W.create("idb-open",{originalErrorMessage:t.message})})),mt}async function so(t){try{const n=(await oi()).transaction(we),i=await n.objectStore(we).get(ai(t));return await n.done,i}catch(e){if(e instanceof z)x.warn(e.message);else{const n=W.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});x.warn(n.message)}}}async function dn(t,e){try{const i=(await oi()).transaction(we,"readwrite");await i.objectStore(we).put(e,ai(t)),await i.done}catch(n){if(n instanceof z)x.warn(n.message);else{const i=W.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});x.warn(i.message)}}}function ai(t){return`${t.name}!${t.options.appId}`}/**
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
 */const oo=1024,ao=30;class co{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new uo(n),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=un();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:r}),this._heartbeatsCache.heartbeats.length>ao){const o=ho(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){x.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=un(),{heartbeatsToSend:i,unsentEntries:r}=lo(this._heartbeatsCache.heartbeats),s=Xn(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return x.warn(n),""}}}function un(){return new Date().toISOString().substring(0,10)}function lo(t,e=oo){const n=[];let i=t.slice();for(const r of t){const s=n.find(o=>o.agent===r.agent);if(s){if(s.dates.push(r.date),hn(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),hn(n)>e){n.pop();break}i=i.slice(1)}return{heartbeatsToSend:n,unsentEntries:i}}class uo{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Kr()?Jr().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await so(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return dn(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return dn(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function hn(t){return Xn(JSON.stringify({version:2,heartbeats:t})).length}function ho(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let i=1;i<t.length;i++)t[i].date<n&&(n=t[i].date,e=i);return e}/**
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
 */function fo(t){Ee(new he("platform-logger",e=>new ws(e),"PRIVATE")),Ee(new he("heartbeat",e=>new co(e),"PRIVATE")),se(Et,cn,t),se(Et,cn,"esm2020"),se("fire-js","")}fo("");var po="firebase",mo="12.16.0";/**
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
 */se(po,mo,"app");function ci(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const go=ci,li=new Te("auth","Firebase",ci());/**
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
 */const Je=new ti("@firebase/auth");function bo(t,...e){Je.logLevel<=g.WARN&&Je.warn(`Auth (${Ce}): ${t}`,...e)}function Fe(t,...e){Je.logLevel<=g.ERROR&&Je.error(`Auth (${Ce}): ${t}`,...e)}/**
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
 */function L(t,...e){throw $t(t,...e)}function T(t,...e){return $t(t,...e)}function xt(t,e,n){const i={...go(),[e]:n};return new Te("auth","Firebase",i).create(e,{appName:t.name})}function Q(t){return xt(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function yo(t,e,n){const i=n;if(!(e instanceof i))throw i.name!==e.constructor.name&&L(t,"argument-error"),xt(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function $t(t,...e){if(typeof t!="string"){const n=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=t.name),t._errorFactory.create(n,...i)}return li.create(t,...e)}function f(t,e,...n){if(!t)throw $t(e,...n)}function M(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Fe(e),new Error(e)}function $(t,e){t||M(e)}/**
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
 */function kt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function _o(){return fn()==="http:"||fn()==="https:"}function fn(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function vo(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(_o()||jr()||"connection"in navigator)?navigator.onLine:!0}function Io(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Le{constructor(e,n){this.shortDelay=e,this.longDelay=n,$(n>e,"Short delay should be less than long delay!"),this.isMobile=qr()||zr()}get(){return vo()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ft(t,e){$(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class di{static initialize(e,n,i){this.fetchImpl=e,n&&(this.headersImpl=n),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;M("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;M("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;M("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Eo={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const wo=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],So=new Le(3e4,6e4);function Ht(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function be(t,e,n,i,r={}){return ui(t,r,async()=>{let s={},o={};i&&(e==="GET"?o=i:s={body:JSON.stringify(i)});const a=Ae({...o,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const l={method:e,headers:c,...s};return Wr()||(l.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&Ut(t.emulatorConfig.host)&&(l.credentials="include"),di.fetch()(await hi(t,t.config.apiHost,n,a),l)})}async function ui(t,e,n){t._canInitEmulator=!1;const i={...Eo,...e};try{const r=new To(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Ue(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ue(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Ue(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Ue(t,"user-disabled",o);const d=i[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw xt(t,d,l);L(t,d)}}catch(r){if(r instanceof z)throw r;L(t,"network-request-failed",{message:String(r)})}}async function ko(t,e,n,i,r={}){const s=await be(t,e,n,i,r);return"mfaPendingCredential"in s&&L(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function hi(t,e,n,i){const r=`${e}${n}?${i}`,s=t,o=s.config.emulator?Ft(t.config,r):`${t.config.apiScheme}://${r}`;return wo.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class To{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,i)=>{this.timer=setTimeout(()=>i(T(this.auth,"network-request-failed")),So.get())})}}function Ue(t,e,n){const i={appName:t.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);const r=T(t,e,i);return r.customData._tokenResponse=n,r}/**
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
 */async function Ao(t,e){return be(t,"POST","/v1/accounts:delete",e)}async function Ye(t,e){return be(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function ve(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Co(t,e=!1){const n=G(t),i=await n.getIdToken(e),r=Vt(i);f(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");const s=typeof r.firebase=="object"?r.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:r,token:i,authTime:ve(gt(r.auth_time)),issuedAtTime:ve(gt(r.iat)),expirationTime:ve(gt(r.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function gt(t){return Number(t)*1e3}function Vt(t){const[e,n,i]=t.split(".");if(e===void 0||n===void 0||i===void 0)return Fe("JWT malformed, contained fewer than 3 sections"),null;try{const r=Qn(n);return r?JSON.parse(r):(Fe("Failed to decode base64 JWT payload"),null)}catch(r){return Fe("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function pn(t){const e=Vt(t);return f(e,"internal-error"),f(typeof e.exp<"u","internal-error"),f(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Se(t,e,n=!1){if(n)return e;try{return await e}catch(i){throw i instanceof z&&Lo(i)&&t.auth.currentUser===t&&await t.auth.signOut(),i}}function Lo({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Po{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */async function Xe(t){var u;const e=t.auth,n=await t.getIdToken(),i=await Se(t,Ye(e,{idToken:n}));f(i==null?void 0:i.users.length,e,"internal-error");const r=i.users[0];t._notifyReloadListener(r);const s=(u=r.providerUserInfo)!=null&&u.length?fi(r.providerUserInfo):[],o=Oo(t.providerData,s),a=t.isAnonymous,c=!(t.email&&r.passwordHash)&&!(o!=null&&o.length),l=a?c:!1,d={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new Tt(r.createdAt,r.lastLoginAt),isAnonymous:l};Object.assign(t,d)}async function Ro(t){const e=G(t);await Xe(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Oo(t,e){return[...t.filter(i=>!e.some(r=>r.providerId===i.providerId)),...e]}function fi(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function No(t,e){const n=await ui(t,{},async()=>{const i=Ae({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,o=await hi(t,r,"/v1/token",`key=${s}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:i};return t.emulatorConfig&&Ut(t.emulatorConfig.host)&&(c.credentials="include"),di.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Do(t,e){return be(t,"POST","/v2/accounts:revokeToken",Ht(t,e))}/**
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
 */class oe{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){f(e.idToken,"internal-error"),f(typeof e.idToken<"u","internal-error"),f(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):pn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){f(e.length!==0,"internal-error");const n=pn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(f(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:i,refreshToken:r,expiresIn:s}=await No(e,n);this.updateTokensAndExpiration(i,r,Number(s))}updateTokensAndExpiration(e,n,i){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,n){const{refreshToken:i,accessToken:r,expirationTime:s}=n,o=new oe;return i&&(f(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),r&&(f(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),s&&(f(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new oe,this.toJSON())}_performRefresh(){return M("not implemented")}}/**
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
 */function F(t,e){f(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class k{constructor({uid:e,auth:n,stsTokenManager:i,...r}){this.providerId="firebase",this.proactiveRefresh=new Po(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Tt(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const n=await Se(this,this.stsTokenManager.getToken(this.auth,e));return f(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Co(this,e)}reload(){return Ro(this)}_assign(e){this!==e&&(f(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new k({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){f(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),n&&await Xe(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(A(this.auth.app))return Promise.reject(Q(this.auth));const e=await this.getIdToken();return await Se(this,Ao(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const i=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,c=n._redirectEventId??void 0,l=n.createdAt??void 0,d=n.lastLoginAt??void 0,{uid:u,emailVerified:h,isAnonymous:p,providerData:m,stsTokenManager:b}=n;f(u&&b,e,"internal-error");const E=oe.fromJSON(this.name,b);f(typeof u=="string",e,"internal-error"),F(i,e.name),F(r,e.name),f(typeof h=="boolean",e,"internal-error"),f(typeof p=="boolean",e,"internal-error"),F(s,e.name),F(o,e.name),F(a,e.name),F(c,e.name),F(l,e.name),F(d,e.name);const w=new k({uid:u,auth:e,email:r,emailVerified:h,displayName:i,isAnonymous:p,photoURL:o,phoneNumber:s,tenantId:a,stsTokenManager:E,createdAt:l,lastLoginAt:d});return m&&Array.isArray(m)&&(w.providerData=m.map(K=>({...K}))),c&&(w._redirectEventId=c),w}static async _fromIdTokenResponse(e,n,i=!1){const r=new oe;r.updateFromServerResponse(n);const s=new k({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:i});return await Xe(s),s}static async _fromGetAccountInfoResponse(e,n,i){const r=n.users[0];f(r.localId!==void 0,"internal-error");const s=r.providerUserInfo!==void 0?fi(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(s!=null&&s.length),a=new oe;a.updateFromIdToken(i);const c=new k({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Tt(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,l),c}}/**
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
 */const mn=new Map;function U(t){$(t instanceof Function,"Expected a class definition");let e=mn.get(t);return e?($(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,mn.set(t,e),e)}/**
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
 */class pi{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}pi.type="NONE";const gn=pi;/**
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
 */function He(t,e,n){return`firebase:${t}:${e}:${n}`}class ae{constructor(e,n,i){this.persistence=e,this.auth=n,this.userKey=i;const{config:r,name:s}=this.auth;this.fullUserKey=He(this.userKey,r.apiKey,s),this.fullPersistenceKey=He("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Ye(this.auth,{idToken:e}).catch(()=>{});return n?k._fromGetAccountInfoResponse(this.auth,n,e):null}return k._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,i="authUser"){if(!n.length)return new ae(U(gn),e,i);const r=(await Promise.all(n.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let s=r[0]||U(gn);const o=He(i,e.config.apiKey,e.name);let a=null;for(const l of n)try{const d=await l._get(o);if(d){let u;if(typeof d=="string"){const h=await Ye(e,{idToken:d}).catch(()=>{});if(!h)break;u=await k._fromGetAccountInfoResponse(e,h,d)}else u=k._fromJSON(e,d);l!==s&&(a=u),s=l;break}}catch{}const c=r.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new ae(s,e,i):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(n.map(async l=>{if(l!==s)try{await l._remove(o)}catch{}})),new ae(s,e,i))}}/**
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
 */function bn(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(yi(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(mi(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(vi(e))return"Blackberry";if(Ii(e))return"Webos";if(gi(e))return"Safari";if((e.includes("chrome/")||bi(e))&&!e.includes("edge/"))return"Chrome";if(_i(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=t.match(n);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function mi(t=y()){return/firefox\//i.test(t)}function gi(t=y()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function bi(t=y()){return/crios\//i.test(t)}function yi(t=y()){return/iemobile/i.test(t)}function _i(t=y()){return/android/i.test(t)}function vi(t=y()){return/blackberry/i.test(t)}function Ii(t=y()){return/webos/i.test(t)}function qt(t=y()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Mo(t=y()){var e;return qt(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Uo(){return Gr()&&document.documentMode===10}function Ei(t=y()){return qt(t)||_i(t)||Ii(t)||vi(t)||/windows phone/i.test(t)||yi(t)}/**
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
 */function wi(t,e=[]){let n;switch(t){case"Browser":n=bn(y());break;case"Worker":n=`${bn(y())}-${t}`;break;default:n=t}const i=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ce}/${i}`}/**
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
 */class Bo{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const i=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});i.onAbort=n,this.queue.push(i);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const i of this.queue)await i(e),i.onAbort&&n.push(i.onAbort)}catch(i){n.reverse();for(const r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
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
 */async function xo(t,e={}){return be(t,"GET","/v2/passwordPolicy",Ht(t,e))}/**
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
 */const $o=6;class Fo{constructor(e){var i;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??$o,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const i=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;i&&(n.meetsMinPasswordLength=e.length>=i),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let i;for(let r=0;r<e.length;r++)i=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,n,i,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Ho{constructor(e,n,i,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=i,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new yn(this),this.idTokenSubscription=new yn(this),this.beforeStateQueue=new Bo(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=li,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=U(n)),this._initializationPromise=this.queue(async()=>{var i,r,s;if(!this._deleted&&(this.persistenceManager=await ae.create(this,e),(i=this._resolvePersistenceManagerAvailable)==null||i.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Ye(this,{idToken:e}),i=await k._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(i)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(A(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let i=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,a=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(i=c.user,r=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return f(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Xe(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Io()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(A(this.app))return Promise.reject(Q(this));const n=e?G(e):null;return n&&f(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&f(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return A(this.app)?Promise.reject(Q(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return A(this.app)?Promise.reject(Q(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(U(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await xo(this),n=new Fo(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Te("auth","Firebase",e())}onAuthStateChanged(e,n,i){return this.registerStateListener(this.authStateSubscription,e,n,i)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,i){return this.registerStateListener(this.idTokenSubscription,e,n,i)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(i.tenantId=this.tenantId),await Do(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const i=await this.getOrInitRedirectPersistenceManager(n);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&U(e)||this._popupRedirectResolver;f(n,this,"argument-error"),this.redirectPersistenceManager=await ae.create(this,[U(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,i;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((i=this.redirectUser)==null?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,i,r){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(f(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,i,r);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return f(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=wi(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){var n;if(A(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&bo(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function nt(t){return G(t)}class yn{constructor(e){this.auth=e,this.observer=null,this.addObserver=es(n=>this.observer=n)}get next(){return f(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Wt={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Vo(t){Wt=t}function qo(t){return Wt.loadJS(t)}function Wo(){return Wt.gapiScript}function jo(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function zo(t,e){const n=ri(t,"auth");if(n.isInitialized()){const r=n.getImmediate(),s=n.getOptions();if(ue(s,e??{}))return r;L(r,"already-initialized")}return n.initialize({options:e})}function Go(t,e){const n=(e==null?void 0:e.persistence)||[],i=(Array.isArray(n)?n:[n]).map(U);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function Ko(t,e,n){const i=nt(t);f(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const r=!1,s=Si(e),{host:o,port:a}=Jo(e),c=a===null?"":`:${a}`,l={url:`${s}//${o}${c}/`},d=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!i._canInitEmulator){f(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),f(ue(l,i.config.emulator)&&ue(d,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=d,i.settings.appVerificationDisabledForTesting=!0,Ut(o)?is(`${s}//${o}${c}`):Yo()}function Si(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Jo(t){const e=Si(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const i=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(i);if(r){const s=r[1];return{host:s,port:_n(i.substr(s.length+1))}}else{const[s,o]=i.split(":");return{host:s,port:_n(o)}}}function _n(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Yo(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class ki{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return M("not implemented")}_getIdTokenResponse(e){return M("not implemented")}_linkToIdToken(e,n){return M("not implemented")}_getReauthenticationResolver(e){return M("not implemented")}}/**
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
 */async function ce(t,e){return ko(t,"POST","/v1/accounts:signInWithIdp",Ht(t,e))}/**
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
 */const Xo="http://localhost";class ne extends ki{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ne(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):L("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:r,...s}=n;if(!i||!r)return null;const o=new ne(i,r);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return ce(e,n)}_linkToIdToken(e,n){const i=this.buildRequest();return i.idToken=n,ce(e,i)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,ce(e,n)}buildRequest(){const e={requestUri:Xo,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Ae(n)}return e}}/**
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
 */class jt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Pe extends jt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class O extends Pe{constructor(){super("facebook.com")}static credential(e){return ne._fromParams({providerId:O.PROVIDER_ID,signInMethod:O.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return O.credentialFromTaggedObject(e)}static credentialFromError(e){return O.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return O.credential(e.oauthAccessToken)}catch{return null}}}O.FACEBOOK_SIGN_IN_METHOD="facebook.com";O.PROVIDER_ID="facebook.com";/**
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
 */class N extends Pe{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ne._fromParams({providerId:N.PROVIDER_ID,signInMethod:N.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return N.credentialFromTaggedObject(e)}static credentialFromError(e){return N.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:i}=e;if(!n&&!i)return null;try{return N.credential(n,i)}catch{return null}}}N.GOOGLE_SIGN_IN_METHOD="google.com";N.PROVIDER_ID="google.com";/**
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
 */class H extends Pe{constructor(){super("github.com")}static credential(e){return ne._fromParams({providerId:H.PROVIDER_ID,signInMethod:H.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return H.credentialFromTaggedObject(e)}static credentialFromError(e){return H.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return H.credential(e.oauthAccessToken)}catch{return null}}}H.GITHUB_SIGN_IN_METHOD="github.com";H.PROVIDER_ID="github.com";/**
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
 */class V extends Pe{constructor(){super("twitter.com")}static credential(e,n){return ne._fromParams({providerId:V.PROVIDER_ID,signInMethod:V.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return V.credentialFromTaggedObject(e)}static credentialFromError(e){return V.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:i}=e;if(!n||!i)return null;try{return V.credential(n,i)}catch{return null}}}V.TWITTER_SIGN_IN_METHOD="twitter.com";V.PROVIDER_ID="twitter.com";/**
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
 */class fe{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,i,r=!1){const s=await k._fromIdTokenResponse(e,i,r),o=vn(i);return new fe({user:s,providerId:o,_tokenResponse:i,operationType:n})}static async _forOperation(e,n,i){await e._updateTokensIfNecessary(i,!0);const r=vn(i);return new fe({user:e,providerId:r,_tokenResponse:i,operationType:n})}}function vn(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class Qe extends z{constructor(e,n,i,r){super(n.code,n.message),this.operationType=i,this.user=r,Object.setPrototypeOf(this,Qe.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,n,i,r){return new Qe(e,n,i,r)}}function Ti(t,e,n,i){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Qe._fromErrorAndOperation(t,s,e,i):s})}async function Qo(t,e,n=!1){const i=await Se(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return fe._forOperation(t,"link",i)}/**
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
 */async function Zo(t,e,n=!1){const{auth:i}=t;if(A(i.app))return Promise.reject(Q(i));const r="reauthenticate";try{const s=await Se(t,Ti(i,r,e,t),n);f(s.idToken,i,"internal-error");const o=Vt(s.idToken);f(o,i,"internal-error");const{sub:a}=o;return f(t.uid===a,i,"user-mismatch"),fe._forOperation(t,r,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&L(i,"user-mismatch"),s}}/**
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
 */async function ea(t,e,n=!1){if(A(t.app))return Promise.reject(Q(t));const i="signIn",r=await Ti(t,i,e),s=await fe._fromIdTokenResponse(t,i,r);return n||await t._updateCurrentUser(s.user),s}function ta(t,e,n,i){return G(t).onIdTokenChanged(e,n,i)}function na(t,e,n){return G(t).beforeAuthStateChanged(e,n)}function ia(t,e,n,i){return G(t).onAuthStateChanged(e,n,i)}function ra(t){return G(t).signOut()}const Ze="__sak";/**
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
 */class Ai{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Ze,"1"),this.storage.removeItem(Ze),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const sa=1e3,oa=10;class Ci extends Ai{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Ei(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const i=this.storage.getItem(n),r=this.localCache[n];i!==r&&e(n,r,i)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const i=e.key;n?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(i);!n&&this.localCache[i]===o||this.notifyListeners(i,o)},s=this.storage.getItem(i);Uo()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,oa):r()}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:i}),!0)})},sa)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ci.type="LOCAL";const aa=Ci;/**
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
 */class Li extends Ai{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Li.type="SESSION";const Pi=Li;/**
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
 */function ca(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class it{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;const i=new it(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:i,eventType:r,data:s}=n.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:i,eventType:r});const a=Array.from(o).map(async l=>l(n.origin,s)),c=await ca(a);n.ports[0].postMessage({status:"done",eventId:i,eventType:r,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}it.receivers=[];/**
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
 */class la{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,i=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,o;return new Promise((a,c)=>{const l=zt("",20);r.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},i);o={messageChannel:r,onMessage(u){const h=u;if(h.data.eventId===l)switch(h.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(h.data.response);break;default:clearTimeout(d),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:n},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function C(){return window}function da(t){C().location.href=t}/**
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
 */function Ri(){return typeof C().WorkerGlobalScope<"u"&&typeof C().importScripts=="function"}async function ua(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function ha(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function fa(){return Ri()?self:null}/**
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
 */const Oi="firebaseLocalStorageDb",pa=1,et="firebaseLocalStorage",Ni="fbase_key";class Re{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function rt(t,e){return t.transaction([et],e?"readwrite":"readonly").objectStore(et)}function ma(){const t=indexedDB.deleteDatabase(Oi);return new Re(t).toPromise()}function Di(){const t=indexedDB.open(Oi,pa);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const i=t.result;try{i.createObjectStore(et,{keyPath:Ni})}catch(r){n(r)}}),t.addEventListener("success",async()=>{const i=t.result;i.objectStoreNames.contains(et)?e(i):(i.close(),await ma(),e(await Di()))})})}async function In(t,e,n){const i=rt(t,!0).put({[Ni]:e,value:n});return new Re(i).toPromise()}async function ga(t,e){const n=rt(t,!1).get(e),i=await new Re(n).toPromise();return i===void 0?null:i.value}function En(t,e){const n=rt(t,!0).delete(e);return new Re(n).toPromise()}const ba=800,ya=3;class Mi{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Di(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(n++>ya)throw i;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Ri()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=it._getInstance(fa()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,i;if(this.activeServiceWorker=await ua(),!this.activeServiceWorker)return;this.sender=new la(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(i=e[0])!=null&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||ha()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await In(e,Ze,"1"),await En(e,Ze)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(i=>In(i,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(i=>ga(i,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>En(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const s=rt(r,!1).getAll();return new Re(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],i=new Set;if(e.length!==0)for(const{fbase_key:r,value:s}of e)i.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!i.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),ba)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Mi.type="LOCAL";const _a=Mi;new Le(3e4,6e4);/**
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
 */function Ui(t,e){return e?U(e):(f(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Gt extends ki{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ce(e,this._buildIdpRequest())}_linkToIdToken(e,n){return ce(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return ce(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function va(t){return ea(t.auth,new Gt(t),t.bypassAuthState)}function Ia(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Zo(n,new Gt(t),t.bypassAuthState)}async function Ea(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Qo(n,new Gt(t),t.bypassAuthState)}/**
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
 */class Bi{constructor(e,n,i,r,s=!1){this.auth=e,this.resolver=i,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:i,postBody:r,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:i,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return va;case"linkViaPopup":case"linkViaRedirect":return Ea;case"reauthViaPopup":case"reauthViaRedirect":return Ia;default:L(this.auth,"internal-error")}}resolve(e){$(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){$(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const wa=new Le(2e3,1e4);async function xi(t,e,n){if(A(t.app))return Promise.reject(T(t,"operation-not-supported-in-this-environment"));const i=nt(t);yo(t,e,jt);const r=Ui(i,n);return new Y(i,"signInViaPopup",e,r).executeNotNull()}class Y extends Bi{constructor(e,n,i,r,s){super(e,n,r,s),this.provider=i,this.authWindow=null,this.pollId=null,Y.currentPopupAction&&Y.currentPopupAction.cancel(),Y.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return f(e,this.auth,"internal-error"),e}async onExecution(){$(this.filter.length===1,"Popup operations only handle one event");const e=zt();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(T(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(T(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Y.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,i;if((i=(n=this.authWindow)==null?void 0:n.window)!=null&&i.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(T(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,wa.get())};e()}}Y.currentPopupAction=null;/**
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
 */const Sa="pendingRedirect",Ve=new Map;class ka extends Bi{constructor(e,n,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,i),this.eventId=null}async execute(){let e=Ve.get(this.auth._key());if(!e){try{const i=await Ta(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(n){e=()=>Promise.reject(n)}Ve.set(this.auth._key(),e)}return this.bypassAuthState||Ve.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ta(t,e){const n=La(e),i=Ca(t);if(!await i._isAvailable())return!1;const r=await i._get(n)==="true";return await i._remove(n),r}function Aa(t,e){Ve.set(t._key(),e)}function Ca(t){return U(t._redirectPersistence)}function La(t){return He(Sa,t.config.apiKey,t.name)}async function Pa(t,e,n=!1){if(A(t.app))return Promise.reject(Q(t));const i=nt(t),r=Ui(i,e),o=await new ka(i,r,n).execute();return o&&!n&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
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
 */const Ra=600*1e3;class Oa{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(n=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Na(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var i;if(e.error&&!$i(e)){const r=((i=e.error.code)==null?void 0:i.split("auth/")[1])||"internal-error";n.onError(T(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const i=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ra&&this.cachedEventUids.clear(),this.cachedEventUids.has(wn(e))}saveEventToCache(e){this.cachedEventUids.add(wn(e)),this.lastProcessedEventTime=Date.now()}}function wn(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function $i({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Na(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return $i(t);default:return!1}}/**
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
 */async function Da(t,e={}){return be(t,"GET","/v1/projects",e)}/**
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
 */const Ma=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ua=/^https?/;async function Ba(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Da(t);for(const n of e)try{if(xa(n))return}catch{}L(t,"unauthorized-domain")}function xa(t){const e=kt(),{protocol:n,hostname:i}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&i===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===i}if(!Ua.test(n))return!1;if(Ma.test(t))return i===t;const r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(i)}/**
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
 */const $a=new Le(3e4,6e4);function Sn(){const t=C().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Fa(t){return new Promise((e,n)=>{var r,s,o;function i(){Sn(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Sn(),n(T(t,"network-request-failed"))},timeout:$a.get()})}if((s=(r=C().gapi)==null?void 0:r.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=C().gapi)!=null&&o.load)i();else{const a=jo("iframefcb");return C()[a]=()=>{gapi.load?i():n(T(t,"network-request-failed"))},qo(`${Wo()}?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw qe=null,e})}let qe=null;function Ha(t){return qe=qe||Fa(t),qe}/**
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
 */const Va=new Le(5e3,15e3),qa="__/auth/iframe",Wa="emulator/auth/iframe",ja={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},za=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Ga(t){const e=t.config;f(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ft(e,Wa):`https://${t.config.authDomain}/${qa}`,i={apiKey:e.apiKey,appName:t.name,v:Ce},r=za.get(t.config.apiHost);r&&(i.eid=r);const s=t._getFrameworks();return s.length&&(i.fw=s.join(",")),`${n}?${Ae(i).slice(1)}`}async function Ka(t){const e=await Ha(t),n=C().gapi;return f(n,t,"internal-error"),e.open({where:document.body,url:Ga(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:ja,dontclear:!0},i=>new Promise(async(r,s)=>{await i.restyle({setHideOnLeave:!1});const o=T(t,"network-request-failed"),a=C().setTimeout(()=>{s(o)},Va.get());function c(){C().clearTimeout(a),r(i)}i.ping(c).then(c,()=>{s(o)})}))}/**
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
 */const Ja={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ya=500,Xa=600,Qa="_blank",Za="http://localhost";class kn{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function ec(t,e,n,i=Ya,r=Xa){const s=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let a="";const c={...Ja,width:i.toString(),height:r.toString(),top:s,left:o},l=y().toLowerCase();n&&(a=bi(l)?Qa:n),mi(l)&&(e=e||Za,c.scrollbars="yes");const d=Object.entries(c).reduce((h,[p,m])=>`${h}${p}=${m},`,"");if(Mo(l)&&a!=="_self")return tc(e||"",a),new kn(null);const u=window.open(e||"",a,d);f(u,t,"popup-blocked");try{u.focus()}catch{}return new kn(u)}function tc(t,e){const n=document.createElement("a");n.href=t,n.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(i)}/**
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
 */const nc="__/auth/handler",ic="emulator/auth/handler",rc=encodeURIComponent("fac");async function Tn(t,e,n,i,r,s){f(t.config.authDomain,t,"auth-domain-config-required"),f(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:i,v:Ce,eventId:r};if(e instanceof jt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Zr(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,u]of Object.entries({}))o[d]=u}if(e instanceof Pe){const d=e.getScopes().filter(u=>u!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const c=await t._getAppCheckToken(),l=c?`#${rc}=${encodeURIComponent(c)}`:"";return`${sc(t)}?${Ae(a).slice(1)}${l}`}function sc({config:t}){return t.emulator?Ft(t,ic):`https://${t.authDomain}/${nc}`}/**
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
 */const bt="webStorageSupport";class oc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Pi,this._completeRedirectFn=Pa,this._overrideRedirectResult=Aa}async _openPopup(e,n,i,r){var o;$((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Tn(e,n,i,kt(),r);return ec(e,s,zt())}async _openRedirect(e,n,i,r){await this._originValidation(e);const s=await Tn(e,n,i,kt(),r);return da(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):($(s,"If manager is not set, promise should be"),s)}const i=this.initAndGetManager(e);return this.eventManagers[n]={promise:i},i.catch(()=>{delete this.eventManagers[n]}),i}async initAndGetManager(e){const n=await Ka(e),i=new Oa(e);return n.register("authEvent",r=>(f(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:i.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=n,i}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(bt,{type:bt},r=>{var o;const s=(o=r==null?void 0:r[0])==null?void 0:o[bt];s!==void 0&&n(!!s),L(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Ba(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Ei()||gi()||qt()}}const ac=oc;var An="@firebase/auth",Cn="1.13.3";/**
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
 */class cc{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){f(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function lc(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function dc(t){Ee(new he("auth",(e,{options:n})=>{const i=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=i.options;f(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:wi(t)},l=new Ho(i,r,s,c);return Go(l,n),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,i)=>{e.getProvider("auth-internal").initialize()})),Ee(new he("auth-internal",e=>{const n=nt(e.getProvider("auth").getImmediate());return(i=>new cc(i))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),se(An,Cn,lc(t)),se(An,Cn,"esm2020")}/**
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
 */const uc=300,hc=ei("authIdTokenMaxAge")||uc;let Ln=null;const fc=t=>async e=>{const n=e&&await e.getIdTokenResult(),i=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(i&&i>hc)return;const r=n==null?void 0:n.token;Ln!==r&&(Ln=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function pc(t=no()){const e=ri(t,"auth");if(e.isInitialized())return e.getImmediate();const n=zo(t,{popupRedirectResolver:ac,persistence:[_a,aa,Pi]}),i=ei("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(i,location.origin);if(location.origin===s.origin){const o=fc(s.toString());na(n,o,()=>o(n.currentUser)),ta(n,a=>o(a))}}const r=Hr("auth");return r&&Ko(n,`http://${r}`),n}function mc(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Vo({loadJS(t){return new Promise((e,n)=>{const i=document.createElement("script");i.setAttribute("src",t),i.onload=e,i.onerror=r=>{const s=T("internal-error");s.customData=r,n(s)},i.type="text/javascript",i.charset="UTF-8",mc().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});dc("Browser");const gc=si(window.FIREBASE_CONFIG),st=pc(gc),bc=new N,yc=new O;let Z=null,pe=null;const At=new Set,j={get user(){return Z},get profile(){return pe},get loggedIn(){return!!Z},onChange(t){return At.add(t),t(Z,pe),()=>At.delete(t)}};function Fi(){At.forEach(t=>t(Z,pe))}async function Hi(){return Z?Z.getIdToken():null}async function Vi(t,e={}){const n=await Hi();return fetch(t,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...n?{Authorization:`Bearer ${n}`}:{}}})}async function _c(t){if(!t)return null;try{const e=await t.getIdToken(),n=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(n.ok)return await n.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:t.uid,display_name:t.displayName||"",email:t.email||"",photo_url:t.photoURL||""}}ia(st,async t=>{Z=t,pe=t?await _c(t):null,Fi()});async function vc(){return(await xi(st,bc)).user}async function Ic(){return(await xi(st,yc)).user}async function Pn(){await ra(st)}async function Ec({display_name:t,photo_url:e}){const n={};t!==void 0&&(n.display_name=t),e!==void 0&&(n.photo_url=e);const i=await Vi(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(n)});if(!i.ok)throw new Error(await i.text());return pe=await i.json(),Fi(),pe}const{baseUrl:qi}=window.BOOK_CONFIG;function wc(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function Sc(){const t=document.getElementById("lib-dialog");t&&(t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),kc())}function Rn(){const t=document.getElementById("lib-dialog");if(!t)return;t.classList.remove("open");const e=()=>t.classList.remove("is-visible");t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function kc(){const t=document.getElementById("lib-loading");t.style.display="block",document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");try{const n=await Vi(`${qi}/api/user/library`);if(!n.ok)throw new Error("Not authenticated");const i=await n.json();Be("history",Tc(i.history)),Be("bookmarks",Ac(i.bookmarks)),Be("notes",Cc(i.notes)),Be("comments",Lc(i.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}t.style.display="none";const e=document.querySelector(".lib-tab.is-active");Wi((e==null?void 0:e.dataset.tab)||"history")}function Be(t,e){document.getElementById(`lib-pane-${t}`).innerHTML=e}function Wi(t){document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");const e=document.getElementById(`lib-pane-${t}`);e&&(e.style.display="block")}function ot(t){return t?new Date(t*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function at(t,e){return`${qi}/book/${t}?para=${e}`}function Tc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${ie(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${ie(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${ot(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function Ac(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${ie(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${ot(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function Cc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${ie(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${ie(e.text)}</div>
      <div class="lib-card-date">${ot(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function Lc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${at(e.book_id,e.para_id)}">
      <div class="lib-card-title">${ie(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${ie(e.text)}</div>
      <div class="lib-card-date">${ot(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function ie(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Pc(){wc(),document.addEventListener("click",t=>{const e=t.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),Wi(e.dataset.tab);return}if(t.target.closest("[data-close-lib]")){Rn();return}if(t.target.id==="lib-dialog"){Rn();return}})}function Rc(){var t;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
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
</div>`)}function ji(t){const e=document.getElementById(t);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function tt(t){const e=document.getElementById(t);if(!e)return;e.classList.remove("open");const n=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",n,{once:!0}),setTimeout(n,300)}function zi(){re(),ji("auth-login-dialog")}function On(){tt("auth-login-dialog")}function Gi(){re(),Ji(),ji("auth-profile-dialog")}function Oc(){tt("auth-profile-dialog")}function Nc(){const t=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!t||!e)return;const n=e.getBoundingClientRect();t.style.top=`${n.bottom+6}px`,t.style.right=`${window.innerWidth-n.right}px`,t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open")))}function re(){const t=document.getElementById("auth-user-menu");if(!t)return;t.classList.remove("open");const e=()=>{t.classList.remove("is-visible")};t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function Dc(t){return(t||"?").trim().split(/\s+/).map(e=>{var n;return((n=e[0])==null?void 0:n.toUpperCase())||""}).join("").slice(0,2)||"?"}function Ki(t,e,n){n!=null&&n.photo_url?(t.src=n.photo_url,t.hidden=!1,e.hidden=!0):(t.hidden=!0,e.hidden=!1,e.textContent=Dc(n==null?void 0:n.display_name))}function Ji(){const t=j.profile;t&&(document.getElementById("profile-hero-name").textContent=t.display_name||"",document.getElementById("profile-hero-email").textContent=t.email||"",document.getElementById("profile-input-name").value=t.display_name||"",document.getElementById("profile-input-photo").value=t.photo_url||"",Ki(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),t))}function Mc(t,e){const n=document.getElementById("auth-avatar-btn"),i=document.getElementById("auth-avatar-img"),r=document.getElementById("auth-avatar-initials");if(n)if(t&&e){n.classList.add("is-signed-in"),Ki(i,r,e);const s=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");s&&(s.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else n.classList.remove("is-signed-in"),i&&(i.hidden=!0),r&&(r.hidden=!1,r.textContent="👤")}function Uc(){document.addEventListener("click",async t=>{var i;const e=t.target;if(e.closest("#auth-avatar-btn")){if(t.stopPropagation(),j.loggedIn){const r=document.getElementById("auth-user-menu");r!=null&&r.classList.contains("is-visible")?re():Nc()}else zi();return}const n=(i=e.closest("[data-close]"))==null?void 0:i.dataset.close;if(n){tt(n);return}if(e.classList.contains("auth-backdrop")&&e.id){tt(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&re(),e.closest("#btn-google")){xe(!0);try{await vc(),On()}catch(r){console.error("Google sign-in error:",r),Nn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{xe(!1)}return}if(e.closest("#btn-facebook")){xe(!0);try{await Ic(),On()}catch(r){console.error("Facebook sign-in error:",r),Nn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{xe(!1)}return}if(e.closest("#btn-signout")){await Pn(),Oc();return}if(e.closest("#auth-menu-library-btn")){re(),Sc();return}if(e.closest("#auth-menu-profile-btn")){Gi();return}if(e.closest("#auth-menu-signout-btn")){re(),await Pn();return}}),document.addEventListener("submit",async t=>{if(!t.target.closest("#auth-profile-form"))return;t.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),n=document.getElementById("profile-input-photo").value.trim(),i=document.getElementById("profile-status");i.textContent="Saving…",i.className="auth-status-msg";try{await Ec({display_name:e,photo_url:n||void 0}),i.textContent="✓ Saved",i.classList.add("success"),Ji()}catch(r){console.error("Profile update error:",r),i.textContent="Failed to save.",i.classList.add("error")}})}function xe(t){["btn-google","btn-facebook"].forEach(e=>{const n=document.getElementById(e);n&&(n.disabled=t,n.classList.toggle("is-loading",t))})}function Nn(t){const e=document.getElementById("auth-login-error");e&&(e.textContent=t,e.style.display="block")}function Bc(){Rc(),Uc(),j.onChange(Mc)}const yt={android:{name:"Google Play",detect:()=>/Android/i.test(navigator.userAgent),url:"https://play.google.com/store/apps/details?id=com.dn.epitaka"}},Dn="epitaka_app_banner_shown",Yi="epitaka_app_banner_dismissed",xc=720*60*60*1e3,$c=9e3,Fc=400;function Hc(){for(const t of Object.keys(yt))try{if(yt[t].detect())return yt[t]}catch{}return null}function Vc(){try{const t=parseInt(localStorage.getItem(Yi)||"0",10);return t>0&&Date.now()-t<xc}catch{return!1}}function Mn(t){t.classList.remove("show"),t.classList.add("hide"),setTimeout(()=>t.remove(),Fc)}function qc(){const t=Hc();if(!t)return;let e=!1;try{e=sessionStorage.getItem(Dn)==="1"}catch{}if(e||Vc())return;try{sessionStorage.setItem(Dn,"1")}catch{}const n=document.createElement("div");n.className="app-banner",n.setAttribute("role","status"),n.setAttribute("aria-label","E-Piṭaka mobile app"),n.innerHTML=`
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
  `,n.querySelector(".app-banner-close").addEventListener("click",()=>{try{localStorage.setItem(Yi,String(Date.now()))}catch{}clearTimeout(i),Mn(n)}),document.body.appendChild(n),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("show")));const i=setTimeout(()=>Mn(n),$c)}const Kt="epitaka_sidebar_state";function Wc(t){try{sessionStorage.setItem(Kt,JSON.stringify(t))}catch{}}function Jt(){try{const t=sessionStorage.getItem(Kt);return t?JSON.parse(t):null}catch{return null}}function Yt(){try{sessionStorage.removeItem(Kt)}catch{}}const Xt="epitaka_sidebar_pin";function Xi(t){try{localStorage.setItem(Xt,JSON.stringify(t))}catch{}}function Qi(){try{const t=localStorage.getItem(Xt);return t?JSON.parse(t):null}catch{return null}}function jc(){try{localStorage.removeItem(Xt)}catch{}}const{baseUrl:ct="",lang:Zi="en"}=window.BOOK_CONFIG||{},zc=["Vinaya","Suttanta","Sutta","Abhidhamma"],er=["library","search","toc","dict"],tr={library:"Library",search:"Search",toc:"Table of Contents",dict:"Dictionary"},Gc={library:"📚",search:"🔍",toc:"☰",dict:"📖"},Kc=[{panel:"library",icon:"📚",label:"Library"},{panel:"search",icon:"🔍",label:"Search"},{panel:"toc",icon:"☰",label:"Table of contents"},{panel:"dict",icon:"📖",label:"Dictionary"}];var Hn,Vn;const nr=((Vn=(Hn=Jt())==null?void 0:Hn.search)==null?void 0:Vn.typeId)||dr[0].id;let _e,P,le,ir,rr,_,$e=null,Qt="",Ct="library";function Jc({bookId:t=""}={}){return _e||(Qt=t,Yc(),_r(),Lt(),el(),tl(),nl(),il(),hl(),rl(),Xc()),Un}const Un={openPanel:me,close:B,isOpen:()=>P.classList.contains("open")};function Yc(){_e=document.createElement("div"),_e.id="sb-root",_e.innerHTML=`
    <nav id="sb-activity" aria-label="Sidebar">
      ${Kc.map(t=>`
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
        ${er.map(t=>`
          <button type="button" class="sb-tab" data-panel="${t}"
                  role="tab" aria-selected="false"
                  title="${tr[t]}">${Gc[t]}</button>
        `).join("")}
      </div>

      <div id="sb-panel-library" class="sb-panel" role="tabpanel">
        <div id="sb-lib-header">
          <input id="sb-library-filter" type="search" placeholder="Filter books…"
                 autocomplete="off" aria-label="Filter books">
          <div id="sb-lib-tabs" role="tablist" aria-label="Library categories"></div>
        </div>
        <div id="sb-lib-panels"></div>
      </div>

      <div id="sb-panel-search" class="sb-panel" role="tabpanel">
        <div class="sb-search-wrap">
          ${ur(te,nr)}
          <div id="home-filter-wrap"></div>
        </div>
        <div id="home-results-panel"></div>
      </div>

      <div id="sb-panel-toc" class="sb-panel" role="tabpanel">
        <div class="sb-toc-head">
          <a id="sb-toc-outline" class="sb-outline-link"
             href="${ct}/en/book/${Qt}/outline">📋 Outline of this book</a>
          <input id="toc-search" type="search" placeholder="Filter headings…"
                 autocomplete="off" aria-label="Filter table of contents">
        </div>
        <ul id="toc-list" role="list"></ul>
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
  `,document.body.appendChild(_e),le=document.createElement("div"),le.id="sb-backdrop",document.body.appendChild(le),P=document.getElementById("sb-drawer"),ir=document.getElementById("sb-activity"),rr=document.getElementById("sb-panel-title"),_=document.getElementById("toc-toggle-btn")}async function Xc(){var i,r;const t=await sl(),e=(t==null?void 0:t.hierarchy)||{};$e=new hr({baseUrl:ct,lang:Zi,hierarchy:e,ids:te,initialState:{searchTypeId:nr},onResultSelect:s=>{Wc({panel:"search",search:$e.getState()}),window.location.href=s},onShowResults:()=>Qc(),onShowBooks:()=>Zc()}),$e.bind(),ol((t==null?void 0:t.menu)||{}),document.dispatchEvent(new CustomEvent("sidebar:library-ready"));const n=Jt();ge()&&((i=n==null?void 0:n.search)!=null&&i.query?(me("search"),$e.restore(n.search)):me(((r=Qi())==null?void 0:r.panel)||"library")),Yt()}function me(t){er.includes(t)||(t="library"),Ct=t,ge()&&Xi({pinned:!0,panel:t}),document.querySelectorAll("#sb-root .sb-panel").forEach(e=>e.classList.toggle("active",e.id===`sb-panel-${t}`)),document.querySelectorAll("#sb-root .sb-activity-btn").forEach(e=>e.classList.toggle("active",e.dataset.panel===t)),document.querySelectorAll("#sb-root .sb-tab").forEach(e=>{const n=e.dataset.panel===t;e.classList.toggle("active",n),e.setAttribute("aria-selected",String(n))}),rr.textContent=tr[t],P.classList.add("open"),le.classList.add("show"),document.body.classList.add("sb-drawer-open"),_==null||_.setAttribute("aria-expanded","true"),requestAnimationFrame(()=>{if(window.innerWidth<768)return;const e=t==="search"?document.getElementById(te.searchInput):t==="toc"?document.getElementById("toc-search"):t==="dict"?document.getElementById("dict-word-input"):document.getElementById("sb-library-filter");e==null||e.focus({preventScroll:!0})})}function B(){var t;P.classList.remove("open"),le.classList.remove("show"),document.body.classList.remove("sb-drawer-open"),_==null||_.setAttribute("aria-expanded","false"),(t=document.activeElement)!=null&&t.closest("#sb-root")&&(_==null||_.focus())}function Qc(){var t,e;(t=document.getElementById(te.resultsPanel))==null||t.classList.add("active"),(e=document.getElementById(te.filterWrap))==null||e.classList.add("show")}function Zc(){var t,e;(t=document.getElementById(te.resultsPanel))==null||t.classList.remove("active"),(e=document.getElementById(te.filterWrap))==null||e.classList.remove("show")}function el(){_==null||_.addEventListener("click",t=>{var n;if(t.preventDefault(),t.stopPropagation(),P.classList.contains("open")){B();return}const e=Jt();me((n=e==null?void 0:e.search)!=null&&n.query?"search":"library")})}function tl(){ir.addEventListener("click",t=>{const e=t.target.closest(".sb-activity-btn");if(!e)return;const n=e.dataset.panel;n===Ct&&P.classList.contains("open")&&n!=="dict"&&!ge()?B():me(n)}),document.getElementById("sb-tabs").addEventListener("click",t=>{const e=t.target.closest(".sb-tab");e&&me(e.dataset.panel)}),document.getElementById("sb-pin").addEventListener("click",t=>{t.stopPropagation(),ge()?(jc(),Lt(),B()):(Xi({pinned:!0,panel:Ct}),Lt())}),document.getElementById("sb-close").addEventListener("click",B)}function ge(){var t;return!!((t=Qi())!=null&&t.pinned)}function Lt(){const t=document.getElementById("sb-pin"),e=ge();t==null||t.classList.toggle("active",e),t==null||t.setAttribute("aria-pressed",String(e)),t==null||t.setAttribute("aria-label",e?"Unpin sidebar":"Pin sidebar open"),t==null||t.setAttribute("title",e?"Unpin sidebar":"Keep sidebar open"),document.body.classList.toggle("sb-pinned",e)}function nl(){le.addEventListener("click",B),document.addEventListener("click",t=>{if(!ge()&&P.classList.contains("open")){const e=t.target;!e.closest("#sb-root")&&!e.closest("#toc-toggle-btn")&&!e.closest(".sentence-row .pali-text")&&B()}})}function il(){document.addEventListener("keydown",t=>{t.key==="Escape"&&P.classList.contains("open")&&B()})}const Bn="epitaka_sidebar_width",xn=240,$n=600;function rl(){const t=document.getElementById("sb-resize-handle");if(!t)return;try{const s=parseInt(localStorage.getItem(Bn));s>=xn&&s<=$n&&document.documentElement.style.setProperty("--sb-width",s+"px")}catch{}let e,n;t.addEventListener("mousedown",s=>{s.preventDefault(),e=s.clientX,n=P.offsetWidth,document.body.classList.add("sb-resizing"),document.addEventListener("mousemove",i),document.addEventListener("mouseup",r)});function i(s){const o=s.clientX-e,a=Math.min($n,Math.max(xn,n+o));document.documentElement.style.setProperty("--sb-width",a+"px")}function r(){document.body.classList.remove("sb-resizing"),document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",r);try{const s=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sb-width"));s&&localStorage.setItem(Bn,String(s))}catch{}}}async function sl(){try{const t=await fetch(`${ct}/api/menu`);if(!t.ok)throw new Error(`HTTP ${t.status}`);return await t.json()}catch(t){return console.warn("[sidebar] failed to load menu",t),{menu:{},hierarchy:{}}}}function ol(t){const e=document.getElementById("sb-lib-tabs"),n=document.getElementById("sb-lib-panels");if(!e||!n)return;e.innerHTML="",n.innerHTML="",al(t).forEach((r,s)=>{const o=document.createElement("button");o.type="button",o.className="lib-tab"+(s===0?" active":""),o.dataset.tab=String(s),o.setAttribute("role","tab"),o.setAttribute("aria-selected",s===0?"true":"false"),o.textContent=r.label,e.appendChild(o);const a=document.createElement("div");a.className="lib-tab-panel"+(s===0?" active":""),a.dataset.panel=String(s),a.setAttribute("role","tabpanel"),cl(a,r.data),n.appendChild(a)}),e.addEventListener("click",r=>{const s=r.target.closest(".lib-tab");if(!s)return;const o=s.dataset.tab;e.querySelectorAll(".lib-tab").forEach(a=>{a.classList.toggle("active",a===s),a.setAttribute("aria-selected",a===s?"true":"false")}),n.querySelectorAll(".lib-tab-panel").forEach(a=>a.classList.toggle("active",a.dataset.panel===o))}),n.querySelectorAll(".book-nikaya-title").forEach(r=>{r.addEventListener("click",()=>{var s;r.classList.toggle("open"),(s=r.nextElementSibling)==null||s.classList.toggle("open")})}),ul()}function al(t){const e=Object.keys(t),n=[];for(const r of["Mūla","Aṭṭhakathā","Ṭīkā"])e.includes(r)&&n.push({label:r,data:t[r]});const i=e.filter(r=>!["Mūla","Aṭṭhakathā","Ṭīkā"].includes(r));if(i.length){const r={};for(const s of i)Object.assign(r,t[s]||{});n.push({label:"Añña",data:r})}return n}function cl(t,e){if(!e||typeof e!="object")return;const n=Object.keys(e).sort((i,r)=>{const s=o=>{const a=zc.findIndex(c=>o.includes(c));return a===-1?99:a};return s(i)-s(r)});for(const i of n){const r=document.createElement("div");r.className="lib-pitaka-group";const s=document.createElement("div");s.className="lib-pitaka-title pali-text",s.textContent=i,r.appendChild(s);const o=document.createElement("div");o.className="lib-pitaka-content",ll(o,e[i]),r.appendChild(o),t.appendChild(r)}}function ll(t,e){if(!(!e||typeof e!="object")){if(e[""]){const n=document.createElement("div");n.className="book-nikaya flat-group";const i=document.createElement("ol");i.className="book-nikaya-list open",Fn(i,e[""]),n.appendChild(i),t.appendChild(n)}for(const[n,i]of Object.entries(e)){if(n==="")continue;const r=document.createElement("div");r.className="book-nikaya";const s=document.createElement("div");s.className="book-nikaya-title pali-text",s.innerHTML=`${sr(n)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const o=document.createElement("ol");o.className="book-nikaya-list",Fn(o,i),r.append(s,o),t.appendChild(r)}}}function Fn(t,e){Array.isArray(e)&&e.forEach(([n,i])=>{const r=document.createElement("li");r.appendChild(dl([n,i])),t.appendChild(r)})}function dl([t,e]){const n=document.createElement("a");return n.className="book-entry pali-text"+(t===Qt?" current":""),n.href=`${ct}/${Zi}/book/${t}`,n.dataset.bookId=t,n.innerHTML=`<span class="book-name pali-text">${sr(e)}</span>`,n.addEventListener("click",()=>Yt()),n}function ul(){const t=document.getElementById("sb-library-filter"),e=document.getElementById("sb-lib-panels");if(!t||!e)return;const n=[...e.querySelectorAll(".book-entry")],i=n.map(s=>ze(s.textContent||"").toLowerCase()),r=n.map(s=>s.closest("li"));t.addEventListener("input",()=>{const s=ze(t.value).toLowerCase();n.forEach((a,c)=>{const l=!s||i[c].includes(s);a.style.display=l?"":"none",r[c]&&(r[c].style.display=l?"":"none")}),e.querySelectorAll(".book-nikaya").forEach(a=>{var d;const c=[...a.querySelectorAll(".book-entry")].some(u=>u.style.display!=="none");if(a.style.display=!s||c?"":"none",!s||!c)return;const l=a.querySelector(".book-nikaya-list");l&&(l.classList.add("open"),(d=l.previousElementSibling)==null||d.classList.add("open"))}),e.querySelectorAll(".lib-pitaka-group").forEach(a=>{const c=[...a.querySelectorAll(".book-entry")].some(l=>l.style.display!=="none");a.style.display=!s||c?"":"none"});const o=document.getElementById("sb-lib-tabs");e.querySelectorAll(".lib-tab-panel").forEach((a,c)=>{const l=[...a.querySelectorAll(".book-entry")].some(u=>u.style.display!=="none");a.style.display=!s||l?"":"none";const d=o==null?void 0:o.querySelector(`.lib-tab[data-tab="${c}"]`);d&&d.classList.toggle("has-match",!!s&&l)}),e.querySelectorAll("li").forEach(a=>{const c=[...a.querySelectorAll(".book-entry")].some(l=>l.style.display!=="none");a.style.display=c?"":"none"})})}function hl(){const t=document.getElementById("toc-list"),e=document.getElementById("toc-search");document.querySelectorAll(".section-block").forEach(s=>{var u,h;const o=s.dataset.paraId,a=s.querySelector(".section-heading-link, .section-heading-empty");if(!a||!o)return;const c=a.dataset.level||1,l=(h=(u=a.querySelector(".section-heading-text"))==null?void 0:u.textContent)==null?void 0:h.trim();if(!l)return;const d=document.createElement("li");d.innerHTML=`<div class="toc-item" role="button" tabindex="0" data-para-id="${o}" data-level="${c}"><span class="toc-item-text pali-text"></span></div>`,d.querySelector(".toc-item-text").textContent=l,t.appendChild(d)});const n=[...t.querySelectorAll(".toc-item")],i=n.map(s=>ze(s.textContent).toLowerCase());qn(e,{mode:"both",onConvert:s=>{e.value=s,e.dispatchEvent(new Event("input"))}}),e.addEventListener("input",()=>{const s=ze(e.value).toLowerCase();n.forEach((o,a)=>{o.closest("li").style.display=!s||i[a].includes(s)?"":"none"})}),n.forEach(s=>{s.addEventListener("click",()=>{const o=parseInt(s.dataset.paraId);window.innerWidth<768&&B(),Yt();const a=document.querySelector(`.section-block[data-para-id="${o}"]`),c=a==null?void 0:a.querySelector(".section-heading-link");if(c!=null&&c.href){const l=new URL(c.href,window.location.href);l.hash=String(o),window.location.href=l.href}}),s.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),s.click())})});const r=new IntersectionObserver(s=>{for(const o of s){if(!o.isIntersecting)continue;const a=parseInt(o.target.dataset.paraId);fl(a)}},{rootMargin:"-52px 0px -67% 0px"});document.querySelectorAll(".section-block").forEach(s=>r.observe(s))}function fl(t){document.querySelectorAll("#toc-list .toc-item").forEach(e=>{const n=parseInt(e.dataset.paraId)===t;e.classList.toggle("active",n),n&&P.classList.contains("open")&&e.scrollIntoView({block:"nearest"})})}function sr(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const{bookId:Zt,baseUrl:Pt,lang:ke,bookref:pl}=window.BOOK_CONFIG,_t=new WeakMap,Rt=document.getElementById("settings-btn"),ee=document.getElementById("settings-modal"),ml=document.getElementById("settings-form"),gl=document.getElementById("settings-cancel");fr();Jc({bookId:Zt});const Ot=window.REF_LINKS||{};console.debug("[REF_LINKS] loaded:",Object.keys(Ot).length,"keys",Ot);const We=Object.keys(Ot).map(Number).sort((t,e)=>t-e);console.debug("[REF_LINKS] sorted para_ids:",We);function bl(t){let e=0,n=We.length-1,i=-1;for(;e<=n;){const r=e+n>>>1;We[r]<=t?(i=We[r],e=r+1):n=r-1}return i}const or=new IntersectionObserver(t=>{let e=1/0;for(const n of t){if(!n.isIntersecting)continue;const i=n.target.id,r=i&&i.match(/^p-(\d+)-l-\d+$/);if(r){const s=parseInt(r[1]);s<e&&(e=s)}}if(e<1/0){const n=bl(e);console.debug("[sentinel] visible sentence para_id:",e,"→ nearest ref:",n),n>0&&vl(n)}},{rootMargin:"0px 0px -10% 0px"});function yl(){document.querySelectorAll(".section-content.open .sentence-row").forEach(t=>or.observe(t))}yl();function Nt(t){document.querySelectorAll(".pali-text, .book-link-badge").forEach(e=>{_t.has(e)||_t.set(e,e.innerHTML);const n=_t.get(e);e.innerHTML=t===je.RO?n:_l(n,t)})}function _l(t,e){return t.replace(/(<[^>]+>)|([^<]+)/g,(n,i,r)=>i||de.convert(de.convertFromMixed(r),e))}function vl(t){const e=["mula_ref","attha_ref","tika_ref"],n={mula_ref:"ref-mula",attha_ref:"ref-attha",tika_ref:"ref-tika"},r=(window.REF_LINKS||{})[t];if(r)for(const s of e){const o=r[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);if(c){const l=o[a],d=[ke,"book",l.book_id,l.slug].filter(Boolean).join("/");c.href=Pt+"/"+d+"#"+l.para_id}}}else for(const s of e){const o=pl[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);c&&(c.href=`${Pt}/${ke}/book_ref/${o[a].book_id}?ref=${Zt}&para_id=${t}`)}}cr()}function ar(){const t=document.body.getAttribute("data-flow")==="true";document.querySelectorAll(".para-group").forEach(e=>{let n=e.querySelector(".book-links-end");if(t){const i=e.querySelectorAll(".sentence-row .book-link-badge, .sentence-row .book-link-more");if(!i.length)return;n||(n=document.createElement("div"),n.className="book-links-end",e.appendChild(n)),n.innerHTML="",i.forEach(r=>n.appendChild(r.cloneNode(!0)))}else n&&n.remove()})}Rt.addEventListener("click",t=>{if(t.stopPropagation(),window.innerWidth<768){const n=document.getElementById("topbar-more-menu"),i=n==null?void 0:n.classList.contains("open");n==null||n.classList.toggle("open"),Rt.setAttribute("aria-expanded",!i)}else{const n=Ie();Wn(n),Dt(document.getElementById("pali-script-select"),n.paliScript),ee.classList.add("show")}});gl.addEventListener("click",()=>ee.classList.remove("show"));ee.addEventListener("click",t=>{t.target===ee&&ee.classList.remove("show")});ml.addEventListener("submit",t=>{t.preventDefault();const e=pr();e.scriptManuallySet=!0,mr(e),gr(e.theme),jn(e),Nt(e.paliScript),ar(),ee.classList.remove("show")});function cr(){var o;const t=document.getElementById("ref-mula-1"),e=document.getElementById("ref-attha-1"),n=document.getElementById("ref-tika-1"),i=document.getElementById("ref-mula-mobile"),r=document.getElementById("ref-attha-mobile"),s=document.getElementById("topbar-more-tika-group");t&&i&&(i.href=t.href),e&&r&&(r.href=e.href),n&&s&&!s.querySelector(".topbar-more__tika-menu")&&((o=s.querySelector(".topbar-more__ref-btn"))==null||o.setAttribute("href",n.href))}function Il(){var o,a;const t=document.getElementById("topbar-more-menu");if(!t)return;function e(){t.classList.remove("open"),Rt.setAttribute("aria-expanded","false")}(o=t.querySelector(".topbar-more__settings"))==null||o.addEventListener("click",c=>{c.stopPropagation(),e();const l=Ie();Wn(l),Dt(document.getElementById("pali-script-select"),l.paliScript),ee.classList.add("show")}),(a=t.querySelector(".topbar-more__auth"))==null||a.addEventListener("click",c=>{c.stopPropagation(),e(),j.loggedIn?Gi():zi()}),document.addEventListener("click",c=>{c.target.closest("#topbar-more")||e()}),document.addEventListener("keydown",c=>{c.key==="Escape"&&t.classList.contains("open")&&e()}),t.querySelectorAll(".topbar-more__link").forEach(c=>{c.addEventListener("click",e)});const n=document.getElementById("topbar-more-tika-group"),i=n==null?void 0:n.querySelector(".topbar-more__tika-menu"),r=n==null?void 0:n.querySelector(".topbar-more__ref-btn");r&&i&&(r.addEventListener("click",c=>{c.stopPropagation();const l=i.classList.contains("open");i.classList.toggle("open"),r.setAttribute("aria-expanded",!l)}),document.addEventListener("click",c=>{c.target.closest("#topbar-more-tika-group")||(i.classList.remove("open"),r==null||r.setAttribute("aria-expanded","false"))}));function s(c){const l=t.querySelector(".topbar-more__auth");l&&(j.loggedIn&&c?l.textContent="👤 "+(c.display_name||"Profile"):l.textContent="👤 Login")}j.onChange(s)}function El(){if(!window.BOOK_CONFIG)return;const{baseUrl:t,bookId:e}=window.BOOK_CONFIG;let n=null,i=null,r=null;function s(a){i=a,j.loggedIn&&a!==n&&(n=a,clearTimeout(r),r=setTimeout(async()=>{var p,m;const c=document.querySelector(`.section-block[data-para-id="${a}"]`),l=c==null?void 0:c.querySelector(".section-heading-text"),d=((p=l==null?void 0:l.textContent)==null?void 0:p.trim())||"",u=document.querySelector(".book-title"),h=((m=u==null?void 0:u.textContent)==null?void 0:m.trim())||"";try{const b=await Hi();if(!b)return;fetch(`${t}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b}`},body:JSON.stringify({para_id:a,section_title:d,book_title:h})})}catch{}},5e3))}const o=new IntersectionObserver(a=>{for(const c of a){if(!c.isIntersecting)continue;const l=parseInt(c.target.dataset.paraId);isNaN(l)||s(l)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(a=>o.observe(a)),j.onChange(a=>{a&&i!==null&&s(i)})}async function wl(){try{const t=await fetch(`${Pt}/api/book/${Zt}/heading_translations?lang=${encodeURIComponent(ke)}`);if(!t.ok)return;const e=await t.json();for(const[n,i]of Object.entries(e)){const r=document.querySelector(`.section-block[data-para-id="${n}"]`);if(!r)continue;let s=r.querySelector(".section-heading-translation");if(!s){const o=r.querySelector(".section-heading-link, .section-heading-empty");if(!o)continue;s=document.createElement("span"),s.className="section-heading-translation",o.appendChild(s)}s.innerHTML=i}}catch(t){console.debug("[book] failed to fetch heading translations",t)}}document.addEventListener("DOMContentLoaded",async()=>{vr(document.getElementById("main-content"));const t=Ie(ke);jn(t),Nt(t.paliScript),Dt(document.getElementById("pali-script-select"),t.paliScript),ar(),document.querySelectorAll(".lang-dropdown__menu a").forEach(d=>{d.addEventListener("click",u=>{var p;const h=(p=d.getAttribute("href"))==null?void 0:p.match(/\/([a-z]{2})\b/);h&&br(h[1])})}),Bc(),Pc(),qc(),yr({gaId:"G-7NQWX1DCC2"}),Il(),El(),wl(),cr(),document.addEventListener("sidebar:library-ready",()=>{const d=Ie(ke);Nt(d.paliScript)});function e(d){const u=document.querySelectorAll(".section-block");let h=null;for(const p of u){const m=parseInt(p.dataset.paraId);!isNaN(m)&&m<=d&&(h=p)}return h}function n(d){return[...document.querySelectorAll(".sentence-row")].find(h=>{const p=h.id.match(/^p-(\d+)-l-(\d+)$/);return p&&parseInt(p[1],10)===d})||null}function i(d,u){const h=document.getElementById(`p-${d}-l-${u}`);return(h==null?void 0:h.id)===`p-${d}-l-${u}`?h:null}function r(d){if(!d)return;const u=d.querySelector(".section-content");u&&!u.classList.contains("open")&&(u.classList.add("open"),u.setAttribute("aria-hidden","false"),u.querySelectorAll(".sentence-row").forEach(h=>or.observe(h)))}function s(){document.querySelectorAll(".jump-target-highlight").forEach(d=>{d.classList.remove("jump-target-highlight")})}function o(d,u){var w;if(!d||!u)return;const h=u.trim();if(!h)return;const p=h.toLocaleLowerCase(),m=document.createTreeWalker(d,NodeFilter.SHOW_TEXT),b=[];let E;for(;E=m.nextNode();)(w=E.parentElement)!=null&&w.closest("script, style, mark")||E.nodeValue.toLocaleLowerCase().includes(p)&&b.push(E);b.forEach(K=>{const Oe=K.nodeValue,lr=Oe.toLocaleLowerCase(),Ne=document.createDocumentFragment();let De=0,ye;for(;(ye=lr.indexOf(p,De))!==-1;){Ne.append(Oe.slice(De,ye));const lt=document.createElement("mark");lt.className="jump-search-term",lt.textContent=Oe.slice(ye,ye+h.length),Ne.append(lt),De=ye+h.length}Ne.append(Oe.slice(De)),K.replaceWith(Ne)})}function a(d,u=""){requestAnimationFrame(()=>{s();const h=d.closest(".para-group")||d;h.classList.remove("jump-target-highlight"),h.offsetWidth,h.classList.add("jump-target-highlight"),o(h,u),d.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>h.classList.remove("jump-target-highlight"),5e3)})}document.addEventListener("click",d=>{const u=d.target.closest("a[href]");if(!u||u.target==="_blank")return;let h;try{h=new URL(u.href,window.location.href)}catch{return}if(h.origin!==window.location.origin||h.pathname!==window.location.pathname)return;const p=h.hash.replace(/^#/,"");if(!p)return;const m=p.split("-"),b=parseInt(m[0],10);if(isNaN(b))return;const E=parseInt(m[1],10);let w=isNaN(E)?n(b):i(b,E);if(!w){const K=e(b);r(K),w=isNaN(E)?n(b)||K:i(b,E)}w&&(d.preventDefault(),history.pushState(null,"",h.hash),a(w,h.searchParams.get("q")||""))});const c=window.location.hash.replace(/^#/,""),l=new URLSearchParams(window.location.search).get("q")||"";if(c){const d=c.split("-"),u=parseInt(d[0]),h=d.length>=2?parseInt(d[1]):NaN;if(!isNaN(u))if(isNaN(h)){let p=n(u);if(!p){const m=e(u);r(m),p=n(u)}if(p)a(p,l);else{const m=e(u);m&&a(m,l)}}else{let p=i(u,h);if(!p){const m=e(u);r(m),p=i(u,h)}if(p)a(p,l);else{const m=e(u);m&&a(m,l)}}}else if(window.BOOK_CONFIG.paraId){const d=e(window.BOOK_CONFIG.paraId);d&&setTimeout(()=>{d.scrollIntoView({behavior:"smooth",block:"start"})},200)}});

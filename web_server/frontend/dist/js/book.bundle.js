import{a as pi,i as mi,l as Ae,p as on,b as ut,r as gi,s as _i,c as bi,d as an,e as yi,o as Ii,f as vi,S as wi,T as Tt}from"./cookie-consent-7gef3AxB.chunk.js";const Ei=()=>{};var kt={};/**
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
 */const cn=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let r=n.charCodeAt(i);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++i)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},Si=function(n){const e=[];let t=0,i=0;for(;t<n.length;){const r=n[t++];if(r<128)e[i++]=String.fromCharCode(r);else if(r>191&&r<224){const s=n[t++];e[i++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){const s=n[t++],o=n[t++],c=n[t++],a=((r&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[i++]=String.fromCharCode(55296+(a>>10)),e[i++]=String.fromCharCode(56320+(a&1023))}else{const s=n[t++],o=n[t++];e[i++]=String.fromCharCode((r&15)<<12|(s&63)<<6|o&63)}}return e.join("")},ln={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let r=0;r<n.length;r+=3){const s=n[r],o=r+1<n.length,c=o?n[r+1]:0,a=r+2<n.length,l=a?n[r+2]:0,u=s>>2,d=(s&3)<<4|c>>4;let h=(c&15)<<2|l>>6,p=l&63;a||(p=64,o||(h=64)),i.push(t[u],t[d],t[h],t[p])}return i.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(cn(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Si(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let r=0;r<n.length;){const s=t[n.charAt(r++)],c=r<n.length?t[n.charAt(r)]:0;++r;const l=r<n.length?t[n.charAt(r)]:64;++r;const d=r<n.length?t[n.charAt(r)]:64;if(++r,s==null||c==null||l==null||d==null)throw new Ti;const h=s<<2|c>>4;if(i.push(h),l!==64){const p=c<<4&240|l>>2;if(i.push(p),d!==64){const m=l<<6&192|d;i.push(m)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Ti extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ki=function(n){const e=cn(n);return ln.encodeByteArray(e,!0)},un=function(n){return ki(n).replace(/\./g,"")},dn=function(n){try{return ln.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Ai(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Ci=()=>Ai().__FIREBASE_DEFAULTS__,Pi=()=>{if(typeof process>"u"||typeof kt>"u")return;const n=kt.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Ri=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&dn(n[1]);return e&&JSON.parse(e)},dt=()=>{try{return Ei()||Ci()||Pi()||Ri()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Li=n=>{var e,t;return(t=(e=dt())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},hn=()=>{var n;return(n=dt())==null?void 0:n.config},fn=n=>{var e;return(e=dt())==null?void 0:e[`_${n}`]};/**
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
 */class Oi{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,i)=>{t?this.reject(t):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,i))}}}/**
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
 */function b(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ni(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(b())}function Di(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Mi(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Ui(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Bi(){const n=b();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function xi(){try{return typeof indexedDB=="object"}catch{return!1}}function Fi(){return new Promise((n,e)=>{try{let t=!0;const i="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(i);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(i),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var s;e(((s=r.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}/**
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
 */const $i="FirebaseError";class x extends Error{constructor(e,t,i){super(t),this.code=e,this.customData=i,this.name=$i,Object.setPrototypeOf(this,x.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ue.prototype.create)}}class ue{constructor(e,t,i){this.service=e,this.serviceName=t,this.errors=i}create(e,...t){const i=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],o=s?Hi(s,i):"Error",c=`${this.serviceName}: ${o} (${r}).`;return new x(r,c,i)}}function Hi(n,e){return n.replace(Vi,(t,i)=>{const r=e[i];return r!=null?String(r):`<${i}?>`})}const Vi=/\{\$([^}]+)}/g;function Wi(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Z(n,e){if(n===e)return!0;const t=Object.keys(n),i=Object.keys(e);for(const r of t){if(!i.includes(r))return!1;const s=n[r],o=e[r];if(At(s)&&At(o)){if(!Z(s,o))return!1}else if(s!==o)return!1}for(const r of i)if(!t.includes(r))return!1;return!0}function At(n){return n!==null&&typeof n=="object"}/**
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
 */function de(n){const e=[];for(const[t,i]of Object.entries(n))Array.isArray(i)?i.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}function ji(n,e){const t=new qi(n,e);return t.subscribe.bind(t)}class qi{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,i){let r;if(e===void 0&&t===void 0&&i===void 0)throw new Error("Missing Observer.");zi(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:i},r.next===void 0&&(r.next=We),r.error===void 0&&(r.error=We),r.complete===void 0&&(r.complete=We);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function zi(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function We(){}/**
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
 */function F(n){return n&&n._delegate?n._delegate:n}/**
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
 */function ht(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Gi(n){return(await fetch(n,{credentials:"include"})).ok}class ee{constructor(e,t,i){this.name=e,this.instanceFactory=t,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const H="[DEFAULT]";/**
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
 */class Ki{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const i=new Oi;if(this.instancesDeferred.set(t,i),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&i.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(i)return null;throw r}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Yi(e))try{this.getOrInitializeService({instanceIdentifier:H})}catch{}for(const[t,i]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:r});i.resolve(s)}catch{}}}}clearInstance(e=H){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=H){return this.instances.has(e)}getOptions(e=H){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:i,options:t});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);i===c&&o.resolve(r)}return r}onInit(e,t){const i=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(i)??new Set;r.add(e),this.onInitCallbacks.set(i,r);const s=this.instances.get(i);return s&&e(s,i),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const i=this.onInitCallbacks.get(t);if(i)for(const r of i)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:Ji(e),options:t}),this.instances.set(e,i),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=H){return this.component?this.component.multipleInstances?e:H:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ji(n){return n===H?void 0:n}function Yi(n){return n.instantiationMode==="EAGER"}/**
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
 */class Xi{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Ki(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var g;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(g||(g={}));const Qi={debug:g.DEBUG,verbose:g.VERBOSE,info:g.INFO,warn:g.WARN,error:g.ERROR,silent:g.SILENT},Zi=g.INFO,er={[g.DEBUG]:"log",[g.VERBOSE]:"log",[g.INFO]:"info",[g.WARN]:"warn",[g.ERROR]:"error"},tr=(n,e,...t)=>{if(e<n.logLevel)return;const i=new Date().toISOString(),r=er[e];if(r)console[r](`[${i}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class pn{constructor(e){this.name=e,this._logLevel=Zi,this._logHandler=tr,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in g))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Qi[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,g.DEBUG,...e),this._logHandler(this,g.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,g.VERBOSE,...e),this._logHandler(this,g.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,g.INFO,...e),this._logHandler(this,g.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,g.WARN,...e),this._logHandler(this,g.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,g.ERROR,...e),this._logHandler(this,g.ERROR,...e)}}const nr=(n,e)=>e.some(t=>n instanceof t);let Ct,Pt;function ir(){return Ct||(Ct=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function rr(){return Pt||(Pt=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const mn=new WeakMap,Qe=new WeakMap,gn=new WeakMap,je=new WeakMap,ft=new WeakMap;function sr(n){const e=new Promise((t,i)=>{const r=()=>{n.removeEventListener("success",s),n.removeEventListener("error",o)},s=()=>{t(M(n.result)),r()},o=()=>{i(n.error),r()};n.addEventListener("success",s),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&mn.set(t,n)}).catch(()=>{}),ft.set(e,n),e}function or(n){if(Qe.has(n))return;const e=new Promise((t,i)=>{const r=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",o),n.removeEventListener("abort",o)},s=()=>{t(),r()},o=()=>{i(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",s),n.addEventListener("error",o),n.addEventListener("abort",o)});Qe.set(n,e)}let Ze={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Qe.get(n);if(e==="objectStoreNames")return n.objectStoreNames||gn.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return M(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ar(n){Ze=n(Ze)}function cr(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const i=n.call(qe(this),e,...t);return gn.set(i,e.sort?e.sort():[e]),M(i)}:rr().includes(n)?function(...e){return n.apply(qe(this),e),M(mn.get(this))}:function(...e){return M(n.apply(qe(this),e))}}function lr(n){return typeof n=="function"?cr(n):(n instanceof IDBTransaction&&or(n),nr(n,ir())?new Proxy(n,Ze):n)}function M(n){if(n instanceof IDBRequest)return sr(n);if(je.has(n))return je.get(n);const e=lr(n);return e!==n&&(je.set(n,e),ft.set(e,n)),e}const qe=n=>ft.get(n);function ur(n,e,{blocked:t,upgrade:i,blocking:r,terminated:s}={}){const o=indexedDB.open(n,e),c=M(o);return i&&o.addEventListener("upgradeneeded",a=>{i(M(o.result),a.oldVersion,a.newVersion,M(o.transaction),a)}),t&&o.addEventListener("blocked",a=>t(a.oldVersion,a.newVersion,a)),c.then(a=>{s&&a.addEventListener("close",()=>s()),r&&a.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),c}const dr=["get","getKey","getAll","getAllKeys","count"],hr=["put","add","delete","clear"],ze=new Map;function Rt(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(ze.get(e))return ze.get(e);const t=e.replace(/FromIndex$/,""),i=e!==t,r=hr.includes(t);if(!(t in(i?IDBIndex:IDBObjectStore).prototype)||!(r||dr.includes(t)))return;const s=async function(o,...c){const a=this.transaction(o,r?"readwrite":"readonly");let l=a.store;return i&&(l=l.index(c.shift())),(await Promise.all([l[t](...c),r&&a.done]))[0]};return ze.set(e,s),s}ar(n=>({...n,get:(e,t,i)=>Rt(e,t)||n.get(e,t,i),has:(e,t)=>!!Rt(e,t)||n.has(e,t)}));/**
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
 */class fr{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(pr(t)){const i=t.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(t=>t).join(" ")}}function pr(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const et="@firebase/app",Lt="0.15.1";/**
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
 */const R=new pn("@firebase/app"),mr="@firebase/app-compat",gr="@firebase/analytics-compat",_r="@firebase/analytics",br="@firebase/app-check-compat",yr="@firebase/app-check",Ir="@firebase/auth",vr="@firebase/auth-compat",wr="@firebase/database",Er="@firebase/data-connect",Sr="@firebase/database-compat",Tr="@firebase/functions",kr="@firebase/functions-compat",Ar="@firebase/installations",Cr="@firebase/installations-compat",Pr="@firebase/messaging",Rr="@firebase/messaging-compat",Lr="@firebase/performance",Or="@firebase/performance-compat",Nr="@firebase/remote-config",Dr="@firebase/remote-config-compat",Mr="@firebase/storage",Ur="@firebase/storage-compat",Br="@firebase/firestore",xr="@firebase/ai",Fr="@firebase/firestore-compat",$r="firebase",Hr="12.16.0";/**
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
 */const tt="[DEFAULT]",Vr={[et]:"fire-core",[mr]:"fire-core-compat",[_r]:"fire-analytics",[gr]:"fire-analytics-compat",[yr]:"fire-app-check",[br]:"fire-app-check-compat",[Ir]:"fire-auth",[vr]:"fire-auth-compat",[wr]:"fire-rtdb",[Er]:"fire-data-connect",[Sr]:"fire-rtdb-compat",[Tr]:"fire-fn",[kr]:"fire-fn-compat",[Ar]:"fire-iid",[Cr]:"fire-iid-compat",[Pr]:"fire-fcm",[Rr]:"fire-fcm-compat",[Lr]:"fire-perf",[Or]:"fire-perf-compat",[Nr]:"fire-rc",[Dr]:"fire-rc-compat",[Mr]:"fire-gcs",[Ur]:"fire-gcs-compat",[Br]:"fire-fst",[Fr]:"fire-fst-compat",[xr]:"fire-vertex","fire-js":"fire-js",[$r]:"fire-js-all"};/**
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
 */const Ce=new Map,Wr=new Map,nt=new Map;function Ot(n,e){try{n.container.addComponent(e)}catch(t){R.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function oe(n){const e=n.name;if(nt.has(e))return R.debug(`There were multiple attempts to register component ${e}.`),!1;nt.set(e,n);for(const t of Ce.values())Ot(t,n);for(const t of Wr.values())Ot(t,n);return!0}function _n(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function E(n){return n==null?!1:n.settings!==void 0}/**
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
 */const jr={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},U=new ue("app","Firebase",jr);/**
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
 */class qr{constructor(e,t,i){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new ee("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw U.create("app-deleted",{appName:this._name})}}/**
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
 */const he=Hr;function bn(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const i={name:tt,automaticDataCollectionEnabled:!0,...e},r=i.name;if(typeof r!="string"||!r)throw U.create("bad-app-name",{appName:String(r)});if(t||(t=hn()),!t)throw U.create("no-options");const s=Ce.get(r);if(s){if(Z(t,s.options)&&Z(i,s.config))return s;throw U.create("duplicate-app",{appName:r})}const o=new Xi(r);for(const a of nt.values())o.addComponent(a);const c=new qr(t,i,o);return Ce.set(r,c),c}function zr(n=tt){const e=Ce.get(n);if(!e&&n===tt&&hn())return bn();if(!e)throw U.create("no-app",{appName:n});return e}function J(n,e,t){let i=Vr[n]??n;t&&(i+=`-${t}`);const r=i.match(/\s|\//),s=e.match(/\s|\//);if(r||s){const o=[`Unable to register library "${i}" with version "${e}":`];r&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),r&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),R.warn(o.join(" "));return}oe(new ee(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const Gr="firebase-heartbeat-database",Kr=1,ae="firebase-heartbeat-store";let Ge=null;function yn(){return Ge||(Ge=ur(Gr,Kr,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(ae)}catch(t){console.warn(t)}}}}).catch(n=>{throw U.create("idb-open",{originalErrorMessage:n.message})})),Ge}async function Jr(n){try{const t=(await yn()).transaction(ae),i=await t.objectStore(ae).get(In(n));return await t.done,i}catch(e){if(e instanceof x)R.warn(e.message);else{const t=U.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});R.warn(t.message)}}}async function Nt(n,e){try{const i=(await yn()).transaction(ae,"readwrite");await i.objectStore(ae).put(e,In(n)),await i.done}catch(t){if(t instanceof x)R.warn(t.message);else{const i=U.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});R.warn(i.message)}}}function In(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Yr=1024,Xr=30;class Qr{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new es(t),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Dt();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:r}),this._heartbeatsCache.heartbeats.length>Xr){const o=ts(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){R.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Dt(),{heartbeatsToSend:i,unsentEntries:r}=Zr(this._heartbeatsCache.heartbeats),s=un(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return R.warn(t),""}}}function Dt(){return new Date().toISOString().substring(0,10)}function Zr(n,e=Yr){const t=[];let i=n.slice();for(const r of n){const s=t.find(o=>o.agent===r.agent);if(s){if(s.dates.push(r.date),Mt(t)>e){s.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),Mt(t)>e){t.pop();break}i=i.slice(1)}return{heartbeatsToSend:t,unsentEntries:i}}class es{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return xi()?Fi().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Jr(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return Nt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return Nt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Mt(n){return un(JSON.stringify({version:2,heartbeats:n})).length}function ts(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let i=1;i<n.length;i++)n[i].date<t&&(t=n[i].date,e=i);return e}/**
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
 */function ns(n){oe(new ee("platform-logger",e=>new fr(e),"PRIVATE")),oe(new ee("heartbeat",e=>new Qr(e),"PRIVATE")),J(et,Lt,n),J(et,Lt,"esm2020"),J("fire-js","")}ns("");var is="firebase",rs="12.16.0";/**
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
 */J(is,rs,"app");function vn(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const ss=vn,wn=new ue("auth","Firebase",vn());/**
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
 */const Pe=new pn("@firebase/auth");function os(n,...e){Pe.logLevel<=g.WARN&&Pe.warn(`Auth (${he}): ${n}`,...e)}function we(n,...e){Pe.logLevel<=g.ERROR&&Pe.error(`Auth (${he}): ${n}`,...e)}/**
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
 */function T(n,...e){throw mt(n,...e)}function w(n,...e){return mt(n,...e)}function pt(n,e,t){const i={...ss(),[e]:t};return new ue("auth","Firebase",i).create(e,{appName:n.name})}function W(n){return pt(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function as(n,e,t){const i=t;if(!(e instanceof i))throw i.name!==e.constructor.name&&T(n,"argument-error"),pt(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function mt(n,...e){if(typeof n!="string"){const t=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=n.name),n._errorFactory.create(t,...i)}return wn.create(n,...e)}function f(n,e,...t){if(!n)throw mt(e,...t)}function C(n){const e="INTERNAL ASSERTION FAILED: "+n;throw we(e),new Error(e)}function L(n,e){n||C(e)}/**
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
 */function it(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function cs(){return Ut()==="http:"||Ut()==="https:"}function Ut(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function ls(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(cs()||Mi()||"connection"in navigator)?navigator.onLine:!0}function us(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class fe{constructor(e,t){this.shortDelay=e,this.longDelay=t,L(t>e,"Short delay should be less than long delay!"),this.isMobile=Ni()||Ui()}get(){return ls()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function gt(n,e){L(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class En{static initialize(e,t,i){this.fetchImpl=e,t&&(this.headersImpl=t),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;C("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;C("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;C("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const ds={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const hs=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],fs=new fe(3e4,6e4);function _t(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function ie(n,e,t,i,r={}){return Sn(n,r,async()=>{let s={},o={};i&&(e==="GET"?o=i:s={body:JSON.stringify(i)});const c=de({...o,key:n.config.apiKey}).slice(1),a=await n._getAdditionalHeaders();a["Content-Type"]="application/json",n.languageCode&&(a["X-Firebase-Locale"]=n.languageCode);const l={method:e,headers:a,...s};return Di()||(l.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&ht(n.emulatorConfig.host)&&(l.credentials="include"),En.fetch()(await Tn(n,n.config.apiHost,t,c),l)})}async function Sn(n,e,t){n._canInitEmulator=!1;const i={...ds,...e};try{const r=new ms(n),s=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw ye(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[a,l]=c.split(" : ");if(a==="FEDERATED_USER_ID_ALREADY_LINKED")throw ye(n,"credential-already-in-use",o);if(a==="EMAIL_EXISTS")throw ye(n,"email-already-in-use",o);if(a==="USER_DISABLED")throw ye(n,"user-disabled",o);const u=i[a]||a.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw pt(n,u,l);T(n,u)}}catch(r){if(r instanceof x)throw r;T(n,"network-request-failed",{message:String(r)})}}async function ps(n,e,t,i,r={}){const s=await ie(n,e,t,i,r);return"mfaPendingCredential"in s&&T(n,"multi-factor-auth-required",{_serverResponse:s}),s}async function Tn(n,e,t,i){const r=`${e}${t}?${i}`,s=n,o=s.config.emulator?gt(n.config,r):`${n.config.apiScheme}://${r}`;return hs.includes(t)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class ms{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,i)=>{this.timer=setTimeout(()=>i(w(this.auth,"network-request-failed")),fs.get())})}}function ye(n,e,t){const i={appName:n.name};t.email&&(i.email=t.email),t.phoneNumber&&(i.phoneNumber=t.phoneNumber);const r=w(n,e,i);return r.customData._tokenResponse=t,r}/**
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
 */async function gs(n,e){return ie(n,"POST","/v1/accounts:delete",e)}async function Re(n,e){return ie(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function se(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function _s(n,e=!1){const t=F(n),i=await t.getIdToken(e),r=bt(i);f(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const s=typeof r.firebase=="object"?r.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:r,token:i,authTime:se(Ke(r.auth_time)),issuedAtTime:se(Ke(r.iat)),expirationTime:se(Ke(r.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Ke(n){return Number(n)*1e3}function bt(n){const[e,t,i]=n.split(".");if(e===void 0||t===void 0||i===void 0)return we("JWT malformed, contained fewer than 3 sections"),null;try{const r=dn(t);return r?JSON.parse(r):(we("Failed to decode base64 JWT payload"),null)}catch(r){return we("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function Bt(n){const e=bt(n);return f(e,"internal-error"),f(typeof e.exp<"u","internal-error"),f(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function ce(n,e,t=!1){if(t)return e;try{return await e}catch(i){throw i instanceof x&&bs(i)&&n.auth.currentUser===n&&await n.auth.signOut(),i}}function bs({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class ys{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class rt{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=se(this.lastLoginAt),this.creationTime=se(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Le(n){var d;const e=n.auth,t=await n.getIdToken(),i=await ce(n,Re(e,{idToken:t}));f(i==null?void 0:i.users.length,e,"internal-error");const r=i.users[0];n._notifyReloadListener(r);const s=(d=r.providerUserInfo)!=null&&d.length?kn(r.providerUserInfo):[],o=vs(n.providerData,s),c=n.isAnonymous,a=!(n.email&&r.passwordHash)&&!(o!=null&&o.length),l=c?a:!1,u={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new rt(r.createdAt,r.lastLoginAt),isAnonymous:l};Object.assign(n,u)}async function Is(n){const e=F(n);await Le(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function vs(n,e){return[...n.filter(i=>!e.some(r=>r.providerId===i.providerId)),...e]}function kn(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function ws(n,e){const t=await Sn(n,{},async()=>{const i=de({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=n.config,o=await Tn(n,r,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const a={method:"POST",headers:c,body:i};return n.emulatorConfig&&ht(n.emulatorConfig.host)&&(a.credentials="include"),En.fetch()(o,a)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Es(n,e){return ie(n,"POST","/v2/accounts:revokeToken",_t(n,e))}/**
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
 */class Y{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){f(e.idToken,"internal-error"),f(typeof e.idToken<"u","internal-error"),f(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Bt(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){f(e.length!==0,"internal-error");const t=Bt(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(f(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:i,refreshToken:r,expiresIn:s}=await ws(e,t);this.updateTokensAndExpiration(i,r,Number(s))}updateTokensAndExpiration(e,t,i){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,t){const{refreshToken:i,accessToken:r,expirationTime:s}=t,o=new Y;return i&&(f(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),r&&(f(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),s&&(f(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Y,this.toJSON())}_performRefresh(){return C("not implemented")}}/**
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
 */function O(n,e){f(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class v{constructor({uid:e,auth:t,stsTokenManager:i,...r}){this.providerId="firebase",this.proactiveRefresh=new ys(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new rt(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await ce(this,this.stsTokenManager.getToken(this.auth,e));return f(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return _s(this,e)}reload(){return Is(this)}_assign(e){this!==e&&(f(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new v({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){f(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),t&&await Le(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(E(this.auth.app))return Promise.reject(W(this.auth));const e=await this.getIdToken();return await ce(this,gs(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const i=t.displayName??void 0,r=t.email??void 0,s=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,a=t._redirectEventId??void 0,l=t.createdAt??void 0,u=t.lastLoginAt??void 0,{uid:d,emailVerified:h,isAnonymous:p,providerData:m,stsTokenManager:_}=t;f(d&&_,e,"internal-error");const y=Y.fromJSON(this.name,_);f(typeof d=="string",e,"internal-error"),O(i,e.name),O(r,e.name),f(typeof h=="boolean",e,"internal-error"),f(typeof p=="boolean",e,"internal-error"),O(s,e.name),O(o,e.name),O(c,e.name),O(a,e.name),O(l,e.name),O(u,e.name);const I=new v({uid:d,auth:e,email:r,emailVerified:h,displayName:i,isAnonymous:p,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:y,createdAt:l,lastLoginAt:u});return m&&Array.isArray(m)&&(I.providerData=m.map($=>({...$}))),a&&(I._redirectEventId=a),I}static async _fromIdTokenResponse(e,t,i=!1){const r=new Y;r.updateFromServerResponse(t);const s=new v({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:i});return await Le(s),s}static async _fromGetAccountInfoResponse(e,t,i){const r=t.users[0];f(r.localId!==void 0,"internal-error");const s=r.providerUserInfo!==void 0?kn(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(s!=null&&s.length),c=new Y;c.updateFromIdToken(i);const a=new v({uid:r.localId,auth:e,stsTokenManager:c,isAnonymous:o}),l={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new rt(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(s!=null&&s.length)};return Object.assign(a,l),a}}/**
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
 */const xt=new Map;function P(n){L(n instanceof Function,"Expected a class definition");let e=xt.get(n);return e?(L(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,xt.set(n,e),e)}/**
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
 */class An{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}An.type="NONE";const Ft=An;/**
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
 */function Ee(n,e,t){return`firebase:${n}:${e}:${t}`}class X{constructor(e,t,i){this.persistence=e,this.auth=t,this.userKey=i;const{config:r,name:s}=this.auth;this.fullUserKey=Ee(this.userKey,r.apiKey,s),this.fullPersistenceKey=Ee("persistence",r.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Re(this.auth,{idToken:e}).catch(()=>{});return t?v._fromGetAccountInfoResponse(this.auth,t,e):null}return v._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,i="authUser"){if(!t.length)return new X(P(Ft),e,i);const r=(await Promise.all(t.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let s=r[0]||P(Ft);const o=Ee(i,e.config.apiKey,e.name);let c=null;for(const l of t)try{const u=await l._get(o);if(u){let d;if(typeof u=="string"){const h=await Re(e,{idToken:u}).catch(()=>{});if(!h)break;d=await v._fromGetAccountInfoResponse(e,h,u)}else d=v._fromJSON(e,u);l!==s&&(c=d),s=l;break}}catch{}const a=r.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!a.length?new X(s,e,i):(s=a[0],c&&await s._set(o,c.toJSON()),await Promise.all(t.map(async l=>{if(l!==s)try{await l._remove(o)}catch{}})),new X(s,e,i))}}/**
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
 */function $t(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ln(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Cn(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Nn(e))return"Blackberry";if(Dn(e))return"Webos";if(Pn(e))return"Safari";if((e.includes("chrome/")||Rn(e))&&!e.includes("edge/"))return"Chrome";if(On(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=n.match(t);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function Cn(n=b()){return/firefox\//i.test(n)}function Pn(n=b()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Rn(n=b()){return/crios\//i.test(n)}function Ln(n=b()){return/iemobile/i.test(n)}function On(n=b()){return/android/i.test(n)}function Nn(n=b()){return/blackberry/i.test(n)}function Dn(n=b()){return/webos/i.test(n)}function yt(n=b()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Ss(n=b()){var e;return yt(n)&&!!((e=window.navigator)!=null&&e.standalone)}function Ts(){return Bi()&&document.documentMode===10}function Mn(n=b()){return yt(n)||On(n)||Dn(n)||Nn(n)||/windows phone/i.test(n)||Ln(n)}/**
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
 */function Un(n,e=[]){let t;switch(n){case"Browser":t=$t(b());break;case"Worker":t=`${$t(b())}-${n}`;break;default:t=n}const i=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${he}/${i}`}/**
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
 */class ks{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const i=s=>new Promise((o,c)=>{try{const a=e(s);o(a)}catch(a){c(a)}});i.onAbort=t,this.queue.push(i);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const i of this.queue)await i(e),i.onAbort&&t.push(i.onAbort)}catch(i){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
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
 */async function As(n,e={}){return ie(n,"GET","/v2/passwordPolicy",_t(n,e))}/**
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
 */const Cs=6;class Ps{constructor(e){var i;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Cs,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const i=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;i&&(t.meetsMinPasswordLength=e.length>=i),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let i;for(let r=0;r<e.length;r++)i=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,t,i,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Rs{constructor(e,t,i,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=i,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ht(this),this.idTokenSubscription=new Ht(this),this.beforeStateQueue=new ks(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=wn,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=P(t)),this._initializationPromise=this.queue(async()=>{var i,r,s;if(!this._deleted&&(this.persistenceManager=await X.create(this,e),(i=this._resolvePersistenceManagerAvailable)==null||i.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Re(this,{idToken:e}),i=await v._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(i)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(E(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let i=t,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=i==null?void 0:i._redirectEventId,a=await this.tryRedirectSignIn(e);(!o||o===c)&&(a!=null&&a.user)&&(i=a.user,r=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return f(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Le(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=us()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(E(this.app))return Promise.reject(W(this));const t=e?F(e):null;return t&&f(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&f(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return E(this.app)?Promise.reject(W(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return E(this.app)?Promise.reject(W(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(P(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await As(this),t=new Ps(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ue("auth","Firebase",e())}onAuthStateChanged(e,t,i){return this.registerStateListener(this.authStateSubscription,e,t,i)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,i){return this.registerStateListener(this.idTokenSubscription,e,t,i)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(i.tenantId=this.tenantId),await Es(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const i=await this.getOrInitRedirectPersistenceManager(t);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&P(e)||this._popupRedirectResolver;f(t,this,"argument-error"),this.redirectPersistenceManager=await X.create(this,[P(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,i;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((i=this.redirectUser)==null?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,i,r){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(f(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}),typeof t=="function"){const a=e.addObserver(t,i,r);return()=>{o=!0,a()}}else{const a=e.addObserver(t);return()=>{o=!0,a()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return f(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Un(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){var t;if(E(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&os(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Ue(n){return F(n)}class Ht{constructor(e){this.auth=e,this.observer=null,this.addObserver=ji(t=>this.observer=t)}get next(){return f(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let It={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Ls(n){It=n}function Os(n){return It.loadJS(n)}function Ns(){return It.gapiScript}function Ds(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Ms(n,e){const t=_n(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),s=t.getOptions();if(Z(s,e??{}))return r;T(r,"already-initialized")}return t.initialize({options:e})}function Us(n,e){const t=(e==null?void 0:e.persistence)||[],i=(Array.isArray(t)?t:[t]).map(P);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function Bs(n,e,t){const i=Ue(n);f(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const r=!1,s=Bn(e),{host:o,port:c}=xs(e),a=c===null?"":`:${c}`,l={url:`${s}//${o}${a}/`},u=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!i._canInitEmulator){f(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),f(Z(l,i.config.emulator)&&Z(u,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=u,i.settings.appVerificationDisabledForTesting=!0,ht(o)?Gi(`${s}//${o}${a}`):Fs()}function Bn(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function xs(n){const e=Bn(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const i=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(i);if(r){const s=r[1];return{host:s,port:Vt(i.substr(s.length+1))}}else{const[s,o]=i.split(":");return{host:s,port:Vt(o)}}}function Vt(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Fs(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class xn{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return C("not implemented")}_getIdTokenResponse(e){return C("not implemented")}_linkToIdToken(e,t){return C("not implemented")}_getReauthenticationResolver(e){return C("not implemented")}}/**
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
 */async function Q(n,e){return ps(n,"POST","/v1/accounts:signInWithIdp",_t(n,e))}/**
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
 */const $s="http://localhost";class z extends xn{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new z(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):T("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:r,...s}=t;if(!i||!r)return null;const o=new z(i,r);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Q(e,t)}_linkToIdToken(e,t){const i=this.buildRequest();return i.idToken=t,Q(e,i)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Q(e,t)}buildRequest(){const e={requestUri:$s,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=de(t)}return e}}/**
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
 */class vt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class pe extends vt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class k extends pe{constructor(){super("facebook.com")}static credential(e){return z._fromParams({providerId:k.PROVIDER_ID,signInMethod:k.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return k.credentialFromTaggedObject(e)}static credentialFromError(e){return k.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return k.credential(e.oauthAccessToken)}catch{return null}}}k.FACEBOOK_SIGN_IN_METHOD="facebook.com";k.PROVIDER_ID="facebook.com";/**
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
 */class A extends pe{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return z._fromParams({providerId:A.PROVIDER_ID,signInMethod:A.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return A.credentialFromTaggedObject(e)}static credentialFromError(e){return A.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:i}=e;if(!t&&!i)return null;try{return A.credential(t,i)}catch{return null}}}A.GOOGLE_SIGN_IN_METHOD="google.com";A.PROVIDER_ID="google.com";/**
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
 */class N extends pe{constructor(){super("github.com")}static credential(e){return z._fromParams({providerId:N.PROVIDER_ID,signInMethod:N.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return N.credentialFromTaggedObject(e)}static credentialFromError(e){return N.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return N.credential(e.oauthAccessToken)}catch{return null}}}N.GITHUB_SIGN_IN_METHOD="github.com";N.PROVIDER_ID="github.com";/**
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
 */class D extends pe{constructor(){super("twitter.com")}static credential(e,t){return z._fromParams({providerId:D.PROVIDER_ID,signInMethod:D.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return D.credentialFromTaggedObject(e)}static credentialFromError(e){return D.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:i}=e;if(!t||!i)return null;try{return D.credential(t,i)}catch{return null}}}D.TWITTER_SIGN_IN_METHOD="twitter.com";D.PROVIDER_ID="twitter.com";/**
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
 */class te{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,i,r=!1){const s=await v._fromIdTokenResponse(e,i,r),o=Wt(i);return new te({user:s,providerId:o,_tokenResponse:i,operationType:t})}static async _forOperation(e,t,i){await e._updateTokensIfNecessary(i,!0);const r=Wt(i);return new te({user:e,providerId:r,_tokenResponse:i,operationType:t})}}function Wt(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Oe extends x{constructor(e,t,i,r){super(t.code,t.message),this.operationType=i,this.user=r,Object.setPrototypeOf(this,Oe.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,t,i,r){return new Oe(e,t,i,r)}}function Fn(n,e,t,i){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Oe._fromErrorAndOperation(n,s,e,i):s})}async function Hs(n,e,t=!1){const i=await ce(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return te._forOperation(n,"link",i)}/**
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
 */async function Vs(n,e,t=!1){const{auth:i}=n;if(E(i.app))return Promise.reject(W(i));const r="reauthenticate";try{const s=await ce(n,Fn(i,r,e,n),t);f(s.idToken,i,"internal-error");const o=bt(s.idToken);f(o,i,"internal-error");const{sub:c}=o;return f(n.uid===c,i,"user-mismatch"),te._forOperation(n,r,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&T(i,"user-mismatch"),s}}/**
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
 */async function Ws(n,e,t=!1){if(E(n.app))return Promise.reject(W(n));const i="signIn",r=await Fn(n,i,e),s=await te._fromIdTokenResponse(n,i,r);return t||await n._updateCurrentUser(s.user),s}function js(n,e,t,i){return F(n).onIdTokenChanged(e,t,i)}function qs(n,e,t){return F(n).beforeAuthStateChanged(e,t)}function zs(n,e,t,i){return F(n).onAuthStateChanged(e,t,i)}function Gs(n){return F(n).signOut()}const Ne="__sak";/**
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
 */class $n{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ne,"1"),this.storage.removeItem(Ne),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Ks=1e3,Js=10;class Hn extends $n{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Mn(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const i=this.storage.getItem(t),r=this.localCache[t];i!==r&&e(t,r,i)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,a)=>{this.notifyListeners(o,a)});return}const i=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(i);!t&&this.localCache[i]===o||this.notifyListeners(i,o)},s=this.storage.getItem(i);Ts()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,Js):r()}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:i}),!0)})},Ks)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Hn.type="LOCAL";const Ys=Hn;/**
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
 */class Vn extends $n{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Vn.type="SESSION";const Wn=Vn;/**
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
 */function Xs(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Be{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const i=new Be(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:i,eventType:r,data:s}=t.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:i,eventType:r});const c=Array.from(o).map(async l=>l(t.origin,s)),a=await Xs(c);t.ports[0].postMessage({status:"done",eventId:i,eventType:r,response:a})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Be.receivers=[];/**
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
 */function wt(n="",e=10){let t="";for(let i=0;i<e;i++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class Qs{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,i=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,o;return new Promise((c,a)=>{const l=wt("",20);r.port1.start();const u=setTimeout(()=>{a(new Error("unsupported_event"))},i);o={messageChannel:r,onMessage(d){const h=d;if(h.data.eventId===l)switch(h.data.status){case"ack":clearTimeout(u),s=setTimeout(()=>{a(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(h.data.response);break;default:clearTimeout(u),clearTimeout(s),a(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function S(){return window}function Zs(n){S().location.href=n}/**
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
 */function jn(){return typeof S().WorkerGlobalScope<"u"&&typeof S().importScripts=="function"}async function eo(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function to(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function no(){return jn()?self:null}/**
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
 */const qn="firebaseLocalStorageDb",io=1,De="firebaseLocalStorage",zn="fbase_key";class me{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function xe(n,e){return n.transaction([De],e?"readwrite":"readonly").objectStore(De)}function ro(){const n=indexedDB.deleteDatabase(qn);return new me(n).toPromise()}function Gn(){const n=indexedDB.open(qn,io);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const i=n.result;try{i.createObjectStore(De,{keyPath:zn})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const i=n.result;i.objectStoreNames.contains(De)?e(i):(i.close(),await ro(),e(await Gn()))})})}async function jt(n,e,t){const i=xe(n,!0).put({[zn]:e,value:t});return new me(i).toPromise()}async function so(n,e){const t=xe(n,!1).get(e),i=await new me(t).toPromise();return i===void 0?null:i.value}function qt(n,e){const t=xe(n,!0).delete(e);return new me(t).toPromise()}const oo=800,ao=3;class Kn{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Gn(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(t++>ao)throw i;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return jn()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Be._getInstance(no()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,i;if(this.activeServiceWorker=await eo(),!this.activeServiceWorker)return;this.sender=new Qs(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(i=e[0])!=null&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||to()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await jt(e,Ne,"1"),await qt(e,Ne)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(i=>jt(i,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(i=>so(i,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>qt(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const s=xe(r,!1).getAll();return new me(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],i=new Set;if(e.length!==0)for(const{fbase_key:r,value:s}of e)i.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!i.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),oo)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Kn.type="LOCAL";const co=Kn;new fe(3e4,6e4);/**
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
 */function Jn(n,e){return e?P(e):(f(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Et extends xn{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Q(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Q(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Q(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function lo(n){return Ws(n.auth,new Et(n),n.bypassAuthState)}function uo(n){const{auth:e,user:t}=n;return f(t,e,"internal-error"),Vs(t,new Et(n),n.bypassAuthState)}async function ho(n){const{auth:e,user:t}=n;return f(t,e,"internal-error"),Hs(t,new Et(n),n.bypassAuthState)}/**
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
 */class Yn{constructor(e,t,i,r,s=!1){this.auth=e,this.resolver=i,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:i,postBody:r,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const a={auth:this.auth,requestUri:t,sessionId:i,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(a))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return lo;case"linkViaPopup":case"linkViaRedirect":return ho;case"reauthViaPopup":case"reauthViaRedirect":return uo;default:T(this.auth,"internal-error")}}resolve(e){L(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){L(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const fo=new fe(2e3,1e4);async function Xn(n,e,t){if(E(n.app))return Promise.reject(w(n,"operation-not-supported-in-this-environment"));const i=Ue(n);as(n,e,vt);const r=Jn(i,t);return new V(i,"signInViaPopup",e,r).executeNotNull()}class V extends Yn{constructor(e,t,i,r,s){super(e,t,r,s),this.provider=i,this.authWindow=null,this.pollId=null,V.currentPopupAction&&V.currentPopupAction.cancel(),V.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return f(e,this.auth,"internal-error"),e}async onExecution(){L(this.filter.length===1,"Popup operations only handle one event");const e=wt();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(w(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(w(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,V.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,i;if((i=(t=this.authWindow)==null?void 0:t.window)!=null&&i.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(w(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,fo.get())};e()}}V.currentPopupAction=null;/**
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
 */const po="pendingRedirect",Se=new Map;class mo extends Yn{constructor(e,t,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,i),this.eventId=null}async execute(){let e=Se.get(this.auth._key());if(!e){try{const i=await go(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(t){e=()=>Promise.reject(t)}Se.set(this.auth._key(),e)}return this.bypassAuthState||Se.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function go(n,e){const t=yo(e),i=bo(n);if(!await i._isAvailable())return!1;const r=await i._get(t)==="true";return await i._remove(t),r}function _o(n,e){Se.set(n._key(),e)}function bo(n){return P(n._redirectPersistence)}function yo(n){return Ee(po,n.config.apiKey,n.name)}async function Io(n,e,t=!1){if(E(n.app))return Promise.reject(W(n));const i=Ue(n),r=Jn(i,e),o=await new mo(i,r,t).execute();return o&&!t&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
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
 */const vo=600*1e3;class wo{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(t=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Eo(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var i;if(e.error&&!Qn(e)){const r=((i=e.error.code)==null?void 0:i.split("auth/")[1])||"internal-error";t.onError(w(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const i=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vo&&this.cachedEventUids.clear(),this.cachedEventUids.has(zt(e))}saveEventToCache(e){this.cachedEventUids.add(zt(e)),this.lastProcessedEventTime=Date.now()}}function zt(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Qn({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Eo(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Qn(n);default:return!1}}/**
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
 */async function So(n,e={}){return ie(n,"GET","/v1/projects",e)}/**
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
 */const To=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,ko=/^https?/;async function Ao(n){if(n.config.emulator)return;const{authorizedDomains:e}=await So(n);for(const t of e)try{if(Co(t))return}catch{}T(n,"unauthorized-domain")}function Co(n){const e=it(),{protocol:t,hostname:i}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&i===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===i}if(!ko.test(t))return!1;if(To.test(n))return i===n;const r=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(i)}/**
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
 */const Po=new fe(3e4,6e4);function Gt(){const n=S().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Ro(n){return new Promise((e,t)=>{var r,s,o;function i(){Gt(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Gt(),t(w(n,"network-request-failed"))},timeout:Po.get()})}if((s=(r=S().gapi)==null?void 0:r.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=S().gapi)!=null&&o.load)i();else{const c=Ds("iframefcb");return S()[c]=()=>{gapi.load?i():t(w(n,"network-request-failed"))},Os(`${Ns()}?onload=${c}`).catch(a=>t(a))}}).catch(e=>{throw Te=null,e})}let Te=null;function Lo(n){return Te=Te||Ro(n),Te}/**
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
 */const Oo=new fe(5e3,15e3),No="__/auth/iframe",Do="emulator/auth/iframe",Mo={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Uo=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Bo(n){const e=n.config;f(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?gt(e,Do):`https://${n.config.authDomain}/${No}`,i={apiKey:e.apiKey,appName:n.name,v:he},r=Uo.get(n.config.apiHost);r&&(i.eid=r);const s=n._getFrameworks();return s.length&&(i.fw=s.join(",")),`${t}?${de(i).slice(1)}`}async function xo(n){const e=await Lo(n),t=S().gapi;return f(t,n,"internal-error"),e.open({where:document.body,url:Bo(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Mo,dontclear:!0},i=>new Promise(async(r,s)=>{await i.restyle({setHideOnLeave:!1});const o=w(n,"network-request-failed"),c=S().setTimeout(()=>{s(o)},Oo.get());function a(){S().clearTimeout(c),r(i)}i.ping(a).then(a,()=>{s(o)})}))}/**
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
 */const Fo={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},$o=500,Ho=600,Vo="_blank",Wo="http://localhost";class Kt{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function jo(n,e,t,i=$o,r=Ho){const s=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let c="";const a={...Fo,width:i.toString(),height:r.toString(),top:s,left:o},l=b().toLowerCase();t&&(c=Rn(l)?Vo:t),Cn(l)&&(e=e||Wo,a.scrollbars="yes");const u=Object.entries(a).reduce((h,[p,m])=>`${h}${p}=${m},`,"");if(Ss(l)&&c!=="_self")return qo(e||"",c),new Kt(null);const d=window.open(e||"",c,u);f(d,n,"popup-blocked");try{d.focus()}catch{}return new Kt(d)}function qo(n,e){const t=document.createElement("a");t.href=n,t.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(i)}/**
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
 */const zo="__/auth/handler",Go="emulator/auth/handler",Ko=encodeURIComponent("fac");async function Jt(n,e,t,i,r,s){f(n.config.authDomain,n,"auth-domain-config-required"),f(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:i,v:he,eventId:r};if(e instanceof vt){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Wi(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[u,d]of Object.entries({}))o[u]=d}if(e instanceof pe){const u=e.getScopes().filter(d=>d!=="");u.length>0&&(o.scopes=u.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const u of Object.keys(c))c[u]===void 0&&delete c[u];const a=await n._getAppCheckToken(),l=a?`#${Ko}=${encodeURIComponent(a)}`:"";return`${Jo(n)}?${de(c).slice(1)}${l}`}function Jo({config:n}){return n.emulator?gt(n,Go):`https://${n.authDomain}/${zo}`}/**
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
 */const Je="webStorageSupport";class Yo{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Wn,this._completeRedirectFn=Io,this._overrideRedirectResult=_o}async _openPopup(e,t,i,r){var o;L((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Jt(e,t,i,it(),r);return jo(e,s,wt())}async _openRedirect(e,t,i,r){await this._originValidation(e);const s=await Jt(e,t,i,it(),r);return Zs(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:r,promise:s}=this.eventManagers[t];return r?Promise.resolve(r):(L(s,"If manager is not set, promise should be"),s)}const i=this.initAndGetManager(e);return this.eventManagers[t]={promise:i},i.catch(()=>{delete this.eventManagers[t]}),i}async initAndGetManager(e){const t=await xo(e),i=new wo(e);return t.register("authEvent",r=>(f(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:i.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=t,i}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Je,{type:Je},r=>{var o;const s=(o=r==null?void 0:r[0])==null?void 0:o[Je];s!==void 0&&t(!!s),T(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Ao(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Mn()||Pn()||yt()}}const Xo=Yo;var Yt="@firebase/auth",Xt="1.13.3";/**
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
 */class Qo{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){f(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Zo(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function ea(n){oe(new ee("auth",(e,{options:t})=>{const i=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=i.options;f(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const a={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Un(n)},l=new Rs(i,r,s,a);return Us(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,i)=>{e.getProvider("auth-internal").initialize()})),oe(new ee("auth-internal",e=>{const t=Ue(e.getProvider("auth").getImmediate());return(i=>new Qo(i))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),J(Yt,Xt,Zo(n)),J(Yt,Xt,"esm2020")}/**
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
 */const ta=300,na=fn("authIdTokenMaxAge")||ta;let Qt=null;const ia=n=>async e=>{const t=e&&await e.getIdTokenResult(),i=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(i&&i>na)return;const r=t==null?void 0:t.token;Qt!==r&&(Qt=r,await fetch(n,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function ra(n=zr()){const e=_n(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Ms(n,{popupRedirectResolver:Xo,persistence:[co,Ys,Wn]}),i=fn("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(i,location.origin);if(location.origin===s.origin){const o=ia(s.toString());qs(t,o,()=>o(t.currentUser)),js(t,c=>o(c))}}const r=Li("auth");return r&&Bs(t,`http://${r}`),t}function sa(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Ls({loadJS(n){return new Promise((e,t)=>{const i=document.createElement("script");i.setAttribute("src",n),i.onload=e,i.onerror=r=>{const s=w("internal-error");s.customData=r,t(s)},i.type="text/javascript",i.charset="UTF-8",sa().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});ea("Browser");const oa=bn(window.FIREBASE_CONFIG),Fe=ra(oa),aa=new A,ca=new k;let j=null,ne=null;const st=new Set,B={get user(){return j},get profile(){return ne},get loggedIn(){return!!j},onChange(n){return st.add(n),n(j,ne),()=>st.delete(n)}};function Zn(){st.forEach(n=>n(j,ne))}async function ei(){return j?j.getIdToken():null}async function ti(n,e={}){const t=await ei();return fetch(n,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...t?{Authorization:`Bearer ${t}`}:{}}})}async function la(n){if(!n)return null;try{const e=await n.getIdToken(),t=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(t.ok)return await t.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:n.uid,display_name:n.displayName||"",email:n.email||"",photo_url:n.photoURL||""}}zs(Fe,async n=>{j=n,ne=n?await la(n):null,Zn()});async function ua(){return(await Xn(Fe,aa)).user}async function da(){return(await Xn(Fe,ca)).user}async function Zt(){await Gs(Fe)}async function ha({display_name:n,photo_url:e}){const t={};n!==void 0&&(t.display_name=n),e!==void 0&&(t.photo_url=e);const i=await ti(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(t)});if(!i.ok)throw new Error(await i.text());return ne=await i.json(),Zn(),ne}const{baseUrl:ni}=window.BOOK_CONFIG;function fa(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function pa(){const n=document.getElementById("lib-dialog");n&&(n.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("open"))),ma())}function en(){const n=document.getElementById("lib-dialog");if(!n)return;n.classList.remove("open");const e=()=>n.classList.remove("is-visible");n.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function ma(){const n=document.getElementById("lib-loading");n.style.display="block",document.querySelectorAll(".lib-pane").forEach(t=>t.style.display="none");try{const t=await ti(`${ni}/api/user/library`);if(!t.ok)throw new Error("Not authenticated");const i=await t.json();Ie("history",ga(i.history)),Ie("bookmarks",_a(i.bookmarks)),Ie("notes",ba(i.notes)),Ie("comments",ya(i.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}n.style.display="none";const e=document.querySelector(".lib-tab.is-active");ii((e==null?void 0:e.dataset.tab)||"history")}function Ie(n,e){document.getElementById(`lib-pane-${n}`).innerHTML=e}function ii(n){document.querySelectorAll(".lib-pane").forEach(t=>t.style.display="none");const e=document.getElementById(`lib-pane-${n}`);e&&(e.style.display="block")}function $e(n){return n?new Date(n*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function He(n,e){return`${ni}/book/${n}?para=${e}`}function ga(n){return n!=null&&n.length?n.map(e=>`
    <a class="lib-card lib-card-link" href="${He(e.book_id,e.para_id)}">
      <div class="lib-card-title">${G(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${G(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${$e(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function _a(n){return n!=null&&n.length?n.map(e=>`
    <a class="lib-card lib-card-link" href="${He(e.book_id,e.para_id)}">
      <div class="lib-card-title">${G(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${$e(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function ba(n){return n!=null&&n.length?n.map(e=>`
    <a class="lib-card lib-card-link" href="${He(e.book_id,e.para_id)}">
      <div class="lib-card-title">${G(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${G(e.text)}</div>
      <div class="lib-card-date">${$e(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function ya(n){return n!=null&&n.length?n.map(e=>`
    <a class="lib-card lib-card-link" href="${He(e.book_id,e.para_id)}">
      <div class="lib-card-title">${G(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${G(e.text)}</div>
      <div class="lib-card-date">${$e(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function G(n=""){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ia(){fa(),document.addEventListener("click",n=>{const e=n.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(t=>t.classList.remove("is-active")),e.classList.add("is-active"),ii(e.dataset.tab);return}if(n.target.closest("[data-close-lib]")){en();return}if(n.target.id==="lib-dialog"){en();return}})}function va(){var n;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
      <span class="auth-avatar-inner">
        <img id="auth-avatar-img" src="" alt="" hidden>
        <span id="auth-avatar-initials" aria-hidden="true">👤</span>
      </span>`,(n=document.querySelector(".topbar-right"))==null||n.prepend(e)}document.getElementById("auth-login-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function ri(n){const e=document.getElementById(n);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function Me(n){const e=document.getElementById(n);if(!e)return;e.classList.remove("open");const t=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",t,{once:!0}),setTimeout(t,300)}function si(){K(),ri("auth-login-dialog")}function tn(){Me("auth-login-dialog")}function oi(){K(),ci(),ri("auth-profile-dialog")}function wa(){Me("auth-profile-dialog")}function Ea(){const n=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!n||!e)return;const t=e.getBoundingClientRect();n.style.top=`${t.bottom+6}px`,n.style.right=`${window.innerWidth-t.right}px`,n.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("open")))}function K(){const n=document.getElementById("auth-user-menu");if(!n)return;n.classList.remove("open");const e=()=>{n.classList.remove("is-visible")};n.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function Sa(n){return(n||"?").trim().split(/\s+/).map(e=>{var t;return((t=e[0])==null?void 0:t.toUpperCase())||""}).join("").slice(0,2)||"?"}function ai(n,e,t){t!=null&&t.photo_url?(n.src=t.photo_url,n.hidden=!1,e.hidden=!0):(n.hidden=!0,e.hidden=!1,e.textContent=Sa(t==null?void 0:t.display_name))}function ci(){const n=B.profile;n&&(document.getElementById("profile-hero-name").textContent=n.display_name||"",document.getElementById("profile-hero-email").textContent=n.email||"",document.getElementById("profile-input-name").value=n.display_name||"",document.getElementById("profile-input-photo").value=n.photo_url||"",ai(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),n))}function Ta(n,e){const t=document.getElementById("auth-avatar-btn"),i=document.getElementById("auth-avatar-img"),r=document.getElementById("auth-avatar-initials");if(t)if(n&&e){t.classList.add("is-signed-in"),ai(i,r,e);const s=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");s&&(s.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else t.classList.remove("is-signed-in"),i&&(i.hidden=!0),r&&(r.hidden=!1,r.textContent="👤")}function ka(){document.addEventListener("click",async n=>{var i;const e=n.target;if(e.closest("#auth-avatar-btn")){if(n.stopPropagation(),B.loggedIn){const r=document.getElementById("auth-user-menu");r!=null&&r.classList.contains("is-visible")?K():Ea()}else si();return}const t=(i=e.closest("[data-close]"))==null?void 0:i.dataset.close;if(t){Me(t);return}if(e.classList.contains("auth-backdrop")&&e.id){Me(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&K(),e.closest("#btn-google")){ve(!0);try{await ua(),tn()}catch(r){console.error("Google sign-in error:",r),nn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{ve(!1)}return}if(e.closest("#btn-facebook")){ve(!0);try{await da(),tn()}catch(r){console.error("Facebook sign-in error:",r),nn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{ve(!1)}return}if(e.closest("#btn-signout")){await Zt(),wa();return}if(e.closest("#auth-menu-library-btn")){K(),pa();return}if(e.closest("#auth-menu-profile-btn")){oi();return}if(e.closest("#auth-menu-signout-btn")){K(),await Zt();return}}),document.addEventListener("submit",async n=>{if(!n.target.closest("#auth-profile-form"))return;n.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),t=document.getElementById("profile-input-photo").value.trim(),i=document.getElementById("profile-status");i.textContent="Saving…",i.className="auth-status-msg";try{await ha({display_name:e,photo_url:t||void 0}),i.textContent="✓ Saved",i.classList.add("success"),ci()}catch(r){console.error("Profile update error:",r),i.textContent="Failed to save.",i.classList.add("error")}})}function ve(n){["btn-google","btn-facebook"].forEach(e=>{const t=document.getElementById(e);t&&(t.disabled=n,t.classList.toggle("is-loading",n))})}function nn(n){const e=document.getElementById("auth-login-error");e&&(e.textContent=n,e.style.display="block")}function Aa(){va(),ka(),B.onChange(Ta)}const Ye={android:{name:"Google Play",detect:()=>/Android/i.test(navigator.userAgent),url:"https://play.google.com/store/apps/details?id=com.dn.epitaka"}},rn="epitaka_app_banner_shown",li="epitaka_app_banner_dismissed",Ca=720*60*60*1e3,Pa=9e3,Ra=400;function La(){for(const n of Object.keys(Ye))try{if(Ye[n].detect())return Ye[n]}catch{}return null}function Oa(){try{const n=parseInt(localStorage.getItem(li)||"0",10);return n>0&&Date.now()-n<Ca}catch{return!1}}function sn(n){n.classList.remove("show"),n.classList.add("hide"),setTimeout(()=>n.remove(),Ra)}function Na(){const n=La();if(!n)return;let e=!1;try{e=sessionStorage.getItem(rn)==="1"}catch{}if(e||Oa())return;try{sessionStorage.setItem(rn,"1")}catch{}const t=document.createElement("div");t.className="app-banner",t.setAttribute("role","status"),t.setAttribute("aria-label","E-Piṭaka mobile app"),t.innerHTML=`
    <div class="app-banner-icon" aria-hidden="true">📖</div>
    <div class="app-banner-body">
      <div class="app-banner-title">Read with the E-Piṭaka app</div>
      <div class="app-banner-text">Faster reading &amp; offline access on your phone.</div>
    </div>
    <a class="app-banner-btn" href="${n.url}"
       target="_blank" rel="noopener noreferrer">
      <span aria-hidden="true">▶</span> Get it on ${n.name}
    </a>
    <button class="app-banner-close" type="button" aria-label="Dismiss">✕</button>
  `,t.querySelector(".app-banner-close").addEventListener("click",()=>{try{localStorage.setItem(li,String(Date.now()))}catch{}clearTimeout(i),sn(t)}),document.body.appendChild(t),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("show")));const i=setTimeout(()=>sn(t),Pa)}const{bookId:St,baseUrl:ot,lang:le,bookref:Da}=window.BOOK_CONFIG,Xe=new WeakMap,at=document.getElementById("settings-btn"),q=document.getElementById("settings-modal"),Ma=document.getElementById("settings-form"),Ua=document.getElementById("settings-cancel");pi();mi({bookId:St});const ct=window.REF_LINKS||{};console.debug("[REF_LINKS] loaded:",Object.keys(ct).length,"keys",ct);const ke=Object.keys(ct).map(Number).sort((n,e)=>n-e);console.debug("[REF_LINKS] sorted para_ids:",ke);function Ba(n){let e=0,t=ke.length-1,i=-1;for(;e<=t;){const r=e+t>>>1;ke[r]<=n?(i=ke[r],e=r+1):t=r-1}return i}const ui=new IntersectionObserver(n=>{let e=1/0;for(const t of n){if(!t.isIntersecting)continue;const i=t.target.id,r=i&&i.match(/^p-(\d+)-l-\d+$/);if(r){const s=parseInt(r[1]);s<e&&(e=s)}}if(e<1/0){const t=Ba(e);console.debug("[sentinel] visible sentence para_id:",e,"→ nearest ref:",t),t>0&&$a(t)}},{rootMargin:"0px 0px -10% 0px"});function xa(){document.querySelectorAll(".section-content.open .sentence-row").forEach(n=>ui.observe(n))}xa();function lt(n){document.querySelectorAll(".pali-text, .book-link-badge").forEach(e=>{Xe.has(e)||Xe.set(e,e.innerHTML);const t=Xe.get(e);e.innerHTML=n===wi.RO?t:Fa(t,n)})}function Fa(n,e){return n.replace(/(<[^>]+>)|([^<]+)/g,(t,i,r)=>i||Tt.convert(Tt.convertFromMixed(r),e))}function $a(n){const e=["mula_ref","attha_ref","tika_ref"],t={mula_ref:"ref-mula",attha_ref:"ref-attha",tika_ref:"ref-tika"},r=(window.REF_LINKS||{})[n];if(r)for(const s of e){const o=r[s]||[];for(let c=0;c<o.length;c++){const a=document.getElementById(`${t[s]}-${c+1}`);if(a){const l=o[c],u=[le,"book",l.book_id,l.slug].filter(Boolean).join("/");a.href=ot+"/"+u+"#"+l.para_id}}}else for(const s of e){const o=Da[s]||[];for(let c=0;c<o.length;c++){const a=document.getElementById(`${t[s]}-${c+1}`);a&&(a.href=`${ot}/${le}/book_ref/${o[c].book_id}?ref=${St}&para_id=${n}`)}}hi()}function di(){const n=document.body.getAttribute("data-flow")==="true";document.querySelectorAll(".para-group").forEach(e=>{let t=e.querySelector(".book-links-end");if(n){const i=e.querySelectorAll(".sentence-row .book-link-badge, .sentence-row .book-link-more");if(!i.length)return;t||(t=document.createElement("div"),t.className="book-links-end",e.appendChild(t)),t.innerHTML="",i.forEach(r=>t.appendChild(r.cloneNode(!0)))}else t&&t.remove()})}at.addEventListener("click",n=>{if(n.stopPropagation(),window.innerWidth<768){const t=document.getElementById("topbar-more-menu"),i=t==null?void 0:t.classList.contains("open");t==null||t.classList.toggle("open"),at.setAttribute("aria-expanded",!i)}else{const t=Ae();on(t),ut(document.getElementById("pali-script-select"),t.paliScript),q.classList.add("show")}});Ua.addEventListener("click",()=>q.classList.remove("show"));q.addEventListener("click",n=>{n.target===q&&q.classList.remove("show")});Ma.addEventListener("submit",n=>{n.preventDefault();const e=gi();e.scriptManuallySet=!0,_i(e),bi(e.theme),an(e),lt(e.paliScript),di(),q.classList.remove("show")});function hi(){var o;const n=document.getElementById("ref-mula-1"),e=document.getElementById("ref-attha-1"),t=document.getElementById("ref-tika-1"),i=document.getElementById("ref-mula-mobile"),r=document.getElementById("ref-attha-mobile"),s=document.getElementById("topbar-more-tika-group");n&&i&&(i.href=n.href),e&&r&&(r.href=e.href),t&&s&&!s.querySelector(".topbar-more__tika-menu")&&((o=s.querySelector(".topbar-more__ref-btn"))==null||o.setAttribute("href",t.href))}function Ha(){var o,c;const n=document.getElementById("topbar-more-menu");if(!n)return;function e(){n.classList.remove("open"),at.setAttribute("aria-expanded","false")}(o=n.querySelector(".topbar-more__settings"))==null||o.addEventListener("click",a=>{a.stopPropagation(),e();const l=Ae();on(l),ut(document.getElementById("pali-script-select"),l.paliScript),q.classList.add("show")}),(c=n.querySelector(".topbar-more__auth"))==null||c.addEventListener("click",a=>{a.stopPropagation(),e(),B.loggedIn?oi():si()}),document.addEventListener("click",a=>{a.target.closest("#topbar-more")||e()}),document.addEventListener("keydown",a=>{a.key==="Escape"&&n.classList.contains("open")&&e()}),n.querySelectorAll(".topbar-more__link").forEach(a=>{a.addEventListener("click",e)});const t=document.getElementById("topbar-more-tika-group"),i=t==null?void 0:t.querySelector(".topbar-more__tika-menu"),r=t==null?void 0:t.querySelector(".topbar-more__ref-btn");r&&i&&(r.addEventListener("click",a=>{a.stopPropagation();const l=i.classList.contains("open");i.classList.toggle("open"),r.setAttribute("aria-expanded",!l)}),document.addEventListener("click",a=>{a.target.closest("#topbar-more-tika-group")||(i.classList.remove("open"),r==null||r.setAttribute("aria-expanded","false"))}));function s(a){const l=n.querySelector(".topbar-more__auth");l&&(B.loggedIn&&a?l.textContent="👤 "+(a.display_name||"Profile"):l.textContent="👤 Login")}B.onChange(s)}function Va(){if(!window.BOOK_CONFIG)return;const{baseUrl:n,bookId:e}=window.BOOK_CONFIG;let t=null,i=null,r=null;function s(c){i=c,B.loggedIn&&c!==t&&(t=c,clearTimeout(r),r=setTimeout(async()=>{var p,m;const a=document.querySelector(`.section-block[data-para-id="${c}"]`),l=a==null?void 0:a.querySelector(".section-heading-text"),u=((p=l==null?void 0:l.textContent)==null?void 0:p.trim())||"",d=document.querySelector(".book-title"),h=((m=d==null?void 0:d.textContent)==null?void 0:m.trim())||"";try{const _=await ei();if(!_)return;fetch(`${n}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${_}`},body:JSON.stringify({para_id:c,section_title:u,book_title:h})})}catch{}},5e3))}const o=new IntersectionObserver(c=>{for(const a of c){if(!a.isIntersecting)continue;const l=parseInt(a.target.dataset.paraId);isNaN(l)||s(l)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(c=>o.observe(c)),B.onChange(c=>{c&&i!==null&&s(i)})}async function Wa(){try{const n=await fetch(`${ot}/api/book/${St}/heading_translations?lang=${encodeURIComponent(le)}`);if(!n.ok)return;const e=await n.json();for(const[t,i]of Object.entries(e)){const r=document.querySelector(`.section-block[data-para-id="${t}"]`);if(!r)continue;let s=r.querySelector(".section-heading-translation");if(!s){const o=r.querySelector(".section-heading-link, .section-heading-empty");if(!o)continue;s=document.createElement("span"),s.className="section-heading-translation",o.appendChild(s)}s.innerHTML=i}}catch(n){console.debug("[book] failed to fetch heading translations",n)}}document.addEventListener("DOMContentLoaded",async()=>{yi(document.getElementById("main-content"));const n=Ae(le);an(n),lt(n.paliScript),ut(document.getElementById("pali-script-select"),n.paliScript),di(),document.querySelectorAll(".lang-dropdown__menu a").forEach(u=>{u.addEventListener("click",d=>{var p;const h=(p=u.getAttribute("href"))==null?void 0:p.match(/\/([a-z]{2})\b/);h&&Ii(h[1])})}),Aa(),Ia(),Na(),vi({gaId:"G-7NQWX1DCC2"}),Ha(),Va(),Wa(),hi(),document.addEventListener("sidebar:library-ready",()=>{const u=Ae(le);lt(u.paliScript)});function e(u){const d=document.querySelectorAll(".section-block");let h=null;for(const p of d){const m=parseInt(p.dataset.paraId);!isNaN(m)&&m<=u&&(h=p)}return h}function t(u){return[...document.querySelectorAll(".sentence-row")].find(h=>{const p=h.id.match(/^p-(\d+)-l-(\d+)$/);return p&&parseInt(p[1],10)===u})||null}function i(u,d){const h=document.getElementById(`p-${u}-l-${d}`);return(h==null?void 0:h.id)===`p-${u}-l-${d}`?h:null}function r(u){if(!u)return;const d=u.querySelector(".section-content");d&&!d.classList.contains("open")&&(d.classList.add("open"),d.setAttribute("aria-hidden","false"),d.querySelectorAll(".sentence-row").forEach(h=>ui.observe(h)))}function s(){document.querySelectorAll(".jump-target-highlight").forEach(u=>{u.classList.remove("jump-target-highlight")})}function o(u,d){var I;if(!u||!d)return;const h=d.trim();if(!h)return;const p=h.toLocaleLowerCase(),m=document.createTreeWalker(u,NodeFilter.SHOW_TEXT),_=[];let y;for(;y=m.nextNode();)(I=y.parentElement)!=null&&I.closest("script, style, mark")||y.nodeValue.toLocaleLowerCase().includes(p)&&_.push(y);_.forEach($=>{const ge=$.nodeValue,fi=ge.toLocaleLowerCase(),_e=document.createDocumentFragment();let be=0,re;for(;(re=fi.indexOf(p,be))!==-1;){_e.append(ge.slice(be,re));const Ve=document.createElement("mark");Ve.className="jump-search-term",Ve.textContent=ge.slice(re,re+h.length),_e.append(Ve),be=re+h.length}_e.append(ge.slice(be)),$.replaceWith(_e)})}function c(u,d=""){requestAnimationFrame(()=>{s();const h=u.closest(".para-group")||u;h.classList.remove("jump-target-highlight"),h.offsetWidth,h.classList.add("jump-target-highlight"),o(h,d),u.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>h.classList.remove("jump-target-highlight"),5e3)})}document.addEventListener("click",u=>{const d=u.target.closest("a[href]");if(!d||d.target==="_blank")return;let h;try{h=new URL(d.href,window.location.href)}catch{return}if(h.origin!==window.location.origin||h.pathname!==window.location.pathname)return;const p=h.hash.replace(/^#/,"");if(!p)return;const m=p.split("-"),_=parseInt(m[0],10);if(isNaN(_))return;const y=parseInt(m[1],10);let I=isNaN(y)?t(_):i(_,y);if(!I){const $=e(_);r($),I=isNaN(y)?t(_)||$:i(_,y)}I&&(u.preventDefault(),history.pushState(null,"",h.hash),c(I,h.searchParams.get("q")||""))});const a=window.location.hash.replace(/^#/,""),l=new URLSearchParams(window.location.search).get("q")||"";if(a){const u=a.split("-"),d=parseInt(u[0]),h=u.length>=2?parseInt(u[1]):NaN;if(!isNaN(d))if(isNaN(h)){let p=t(d);if(!p){const m=e(d);r(m),p=t(d)}if(p)c(p,l);else{const m=e(d);m&&c(m,l)}}else{let p=i(d,h);if(!p){const m=e(d);r(m),p=i(d,h)}if(p)c(p,l);else{const m=e(d);m&&c(m,l)}}}else if(window.BOOK_CONFIG.paraId){const u=e(window.BOOK_CONFIG.paraId);u&&setTimeout(()=>{u.scrollIntoView({behavior:"smooth",block:"start"})},200)}});

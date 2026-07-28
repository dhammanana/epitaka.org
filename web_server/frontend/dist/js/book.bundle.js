import{i as Sn,r as Ur}from"./pali_typing.chunk.js";const u=Object.freeze({SI:"si",HI:"hi",RO:"ro",THAI:"th",LAOS:"lo",MY:"my",KM:"km",BENG:"be",ASSE:"as",GURM:"gm",THAM:"tt",GUJA:"gj",TELU:"te",KANN:"ka",MALA:"mm",BRAH:"br",TIBT:"tb",CYRL:"cy"}),Tn=new Map([[u.SI,["Sinhala","සිංහල",[[3456,3583]],{f:"sl_flag.png"}]],[u.HI,["Devanagari","देवनागरी",[[2304,2431]],{f:"in_flag.png"}]],[u.RO,["Roman","Roman",[[0,383],[7680,7935]],{f:"uk_flag.png"}]],[u.THAI,["Thai","ไทย",[[3584,3711],63247,63232],{f:"th_flag.png"}]],[u.LAOS,["Laos","ລາວ",[[3712,3839]],{f:"laos_flag.png"}]],[u.MY,["Myanmar","ဗမာစာ",[[4096,4223]],{f:"my_flag.png"}]],[u.KM,["Khmer","ភាសាខ្មែរ",[[6016,6143]],{f:"kh_flag.png"}]],[u.BENG,["Bengali","বাংলা",[[2432,2559]],{f:"bangla_flag.png",g:"indian"}]],[u.ASSE,["Assamese","অসমীয়া",[],{f:"bangla_flag.png",g:"indian"}]],[u.GURM,["Gurmukhi","ਗੁਰਮੁਖੀ",[[2560,2687]],{g:"indian"}]],[u.GUJA,["Gujarati","ગુજરાતી",[[2688,2815]],{g:"indian"}]],[u.TELU,["Telugu","తెలుగు",[[3072,3199]],{g:"indian"}]],[u.KANN,["Kannada","ಕನ್ನಡ",[[3200,3327]],{g:"indian"}]],[u.MALA,["Malayalam","മലയാളം",[[3328,3455]],{g:"indian"}]],[u.THAM,["Tai Tham","Tai Tham LN",[[6688,6831]],{c:"beta-script",g:"other"}]],[u.BRAH,["Brahmi","Brāhmī",[[55300,55300],[56320,56447]],{g:"other"}]],[u.TIBT,["Tibetan","བོད་སྐད།",[[3840,4095]],{f:"tibet_flag.png",c:"larger",g:"other"}]],[u.CYRL,["Cyrillic","кириллица",[[1024,1279],[768,879]],{f:"russia_flag.png",g:"other"}]]]);function $r(t){for(let e of Tn)for(let n of e[1][2])if(Array.isArray(n)&&t>=n[0]&&t<=n[1]||Number.isInteger(n)&&t==n)return e[0];return-1}const te={[u.SI]:0,[u.HI]:1,[u.RO]:2,[u.THAI]:3,[u.LAOS]:4,[u.MY]:5,[u.KM]:6,[u.BENG]:7,[u.ASSE]:7,[u.GURM]:8,[u.THAM]:9,[u.GUJA]:10,[u.TELU]:11,[u.KANN]:12,[u.MALA]:13,[u.BRAH]:14,[u.TIBT]:15,[u.CYRL]:16},Hr=[["අ","अ","a","อ","ອ","အ","អ","অ","ਅ","ᩋ","અ","అ","ಅ","അ","𑀅","ཨ","а"],["ආ","आ","ā","อา","ອາ","အာ","អា","আ","ਆ","ᩌ","આ","ఆ","ಆ","ആ","𑀆","ཨཱ","а̄"],["ඉ","इ","i","อิ","ອິ","ဣ","ឥ","ই","ਇ","ᩍ","ઇ","ఇ","ಇ","ഇ","𑀇","ཨི","и"],["ඊ","ई","ī","อี","ອີ","ဤ","ឦ","ঈ","ਈ","ᩎ","ઈ","ఈ","ಈ","ഈ","𑀈","ཨཱི","ӣ"],["උ","उ","u","อุ","ອຸ","ဥ","ឧ","উ","ਉ","ᩏ","ઉ","ఉ","ಉ","ഉ","𑀉","ཨུ","у"],["ඌ","ऊ","ū","อู","ອູ","ဦ","ឩ","ঊ","ਊ","ᩐ","ઊ","ఊ","ಊ","ഊ","𑀊","ཨཱུ","ӯ"],["එ","ए","e","อเ","ອເ","ဧ","ឯ","এ","ਏ","ᩑ","એ","ఏ","ಏ","ഏ","𑀏","ཨེ","е"],["ඔ","ओ","o","อโ","ອໂ","ဩ","ឱ","ও","ਓ","ᩒ","ઓ","ఓ","ಓ","ഓ","𑀑","ཨོ","о"],["ං","ं","ṃ","ํ","ໍ","ံ","ំ","ং","ਂ","ᩴ","ં","ం","ಂ","ം","𑀁","ཾ","м̣"],["ඃ","ः","ḥ","ะ","ະ","း","ះ","ঃ","ਃ","ᩡ","ઃ","ః","ಃ","ഃ","𑀂","ཿ","х̣"],["්","्","","ฺ","຺","္","្","্","੍","᩠","્","్","್","്","𑁆","྄",""],["0","०","0","๐","໐","၀","០","০","੦","᪐","૦","౦","೦","൦","𑁦","༠","0"],["1","१","1","๑","໑","၁","១","১","੧","᪑","૧","౧","೧","൧","𑁧","༡","1"],["2","२","2","๒","໒","၂","២","২","੨","᪒","૨","౨","೨","൨","𑁨","༢","2"],["3","३","3","๓","໓","၃","៣","৩","੩","᪓","૩","౩","೩","൩","𑁩","༣","3"],["4","४","4","๔","໔","၄","៤","৪","੪","᪔","૪","౪","೪","൪","𑁪","༤","4"],["5","५","5","๕","໕","၅","៥","৫","੫","᪕","૫","౫","೫","൫","𑁫","༥","5"],["6","६","6","๖","໖","၆","៦","৬","੬","᪖","૬","౬","೬","൬","𑁬","༦","6"],["7","७","7","๗","໗","၇","៧","৭","੭","᪗","૭","౭","೭","൭","𑁭","༧","7"],["8","८","8","๘","໘","၈","៨","৮","੮","᪘","૮","౮","೮","൮","𑁮","༨","8"],["9","९","9","๙","໙","၉","៩","৯","੯","᪙","૯","౯","೯","൯","𑁯","༩","9"],["ඓ","ऐ","ai"],["ඖ","औ","au"],["ඍ","ऋ","ṛ"],["ඎ","ॠ","ṝ"],["ඏ","ऌ","l̥"],["ඐ","ॡ","ḹ"]],Vr=[["ක","क","k","ก","ກ","က","ក","ক","ਕ","ᨠ","ક","క","ಕ","ക","𑀓","ཀ","к"],["ඛ","ख","kh","ข","ຂ","ခ","ខ","খ","ਖ","ᨡ","ખ","ఖ","ಖ","ഖ","𑀔","ཁ","кх"],["ග","ग","g","ค","ຄ","ဂ","គ","গ","ਗ","ᨣ","ગ","గ","ಗ","ഗ","𑀕","ག","г"],["ඝ","घ","gh","ฆ","ຆ","ဃ","ឃ","ঘ","ਘ","ᨥ","ઘ","ఘ","ಘ","ഘ","𑀖","གྷ","гх"],["ඞ","ङ","ṅ","ง","ງ","င","ង","ঙ","ਙ","ᨦ","ઙ","ఙ","ಙ","ങ","𑀗","ང","н̇"],["ච","च","c","จ","ຈ","စ","ច","চ","ਚ","ᨧ","ચ","చ","ಚ","ച","𑀘","ཙ","ч"],["ඡ","छ","ch","ฉ","ຉ","ဆ","ឆ","ছ","ਛ","ᨨ","છ","ఛ","ಛ","ഛ","𑀙","ཚ","чх"],["ජ","ज","j","ช","ຊ","ဇ","ជ","জ","ਜ","ᨩ","જ","జ","ಜ","ജ","𑀚","ཛ","дж"],["ඣ","झ","jh","ฌ","ຌ","ဈ","ឈ","ঝ","ਝ","ᨫ","ઝ","ఝ","ಝ","ഝ","𑀛","ཛྷ","джх"],["ඤ","ञ","ñ","ญ","ຎ","ဉ","ញ","ঞ","ਞ","ᨬ","ઞ","ఞ","ಞ","ഞ","𑀜","ཉ","н̃"],["ට","ट","ṭ","ฏ","ຏ","ဋ","ដ","ট","ਟ","ᨭ","ટ","ట","ಟ","ട","𑀝","ཊ","т̣"],["ඨ","ठ","ṭh","ฐ","ຐ","ဌ","ឋ","ঠ","ਠ","ᨮ","ઠ","ఠ","ಠ","ഠ","𑀞","ཋ","т̣х"],["ඩ","ड","ḍ","ฑ","ຑ","ဍ","ឌ","ড","ਡ","ᨯ","ડ","డ","ಡ","ഡ","𑀟","ཌ","д̣"],["ඪ","ढ","ḍh","ฒ","ຒ","ဎ","ឍ","ঢ","ਢ","ᨰ","ઢ","ఢ","ಢ","ഢ","𑀠","ཌྷ","д̣х"],["ණ","ण","ṇ","ณ","ຓ","ဏ","ណ","ণ","ਣ","ᨱ","ણ","ణ","ಣ","ണ","𑀡","ཎ","н̣"],["ත","त","t","ต","ຕ","တ","ត","ত","ਤ","ᨲ","ત","త","ತ","ത","𑀢","ཏ","т"],["ථ","थ","th","ถ","ຖ","ထ","ថ","থ","ਥ","ᨳ","થ","థ","ಥ","ഥ","𑀣","ཐ","тх"],["ද","द","d","ท","ທ","ဒ","ទ","দ","ਦ","ᨴ","દ","ద","ದ","ദ","𑀤","ད","д"],["ධ","ध","dh","ธ","ຘ","ဓ","ធ","ধ","ਧ","ᨵ","ધ","ధ","ಧ","ധ","𑀥","དྷ","дх"],["න","न","n","น","ນ","န","ន","ন","ਨ","ᨶ","ન","న","ನ","ന","𑀦","ན","н"],["ප","प","p","ป","ປ","ပ","ប","প","ਪ","ᨸ","પ","ప","ಪ","പ","𑀧","པ","п"],["ඵ","फ","ph","ผ","ຜ","ဖ","ផ","ফ","ਫ","ᨹ","ફ","ఫ","ಫ","ഫ","𑀨","ཕ","пх"],["බ","ब","b","พ","ພ","ဗ","ព","ব","ਬ","ᨻ","બ","బ","ಬ","ബ","𑀩","བ","б"],["භ","भ","bh","ภ","ຠ","ဘ","ភ","ভ","ਭ","ᨽ","ભ","భ","ಭ","ഭ","𑀪","བྷ","бх"],["ම","म","m","ม","ມ","မ","ម","ম","ਮ","ᨾ","મ","మ","ಮ","മ","𑀫","མ","м"],["ය","य","y","ย","ຍ","ယ","យ","য","ਯ","ᨿ","ય","య","ಯ","യ","𑀬","ཡ","й"],["ර","र","r","ร","ຣ","ရ","រ","র","ਰ","ᩁ","ર","ర","ರ","ര","𑀭","ར","р"],["ල","ल","l","ล","ລ","လ","ល","ল","ਲ","ᩃ","લ","ల","ಲ","ല","𑀮","ལ","л"],["ළ","ळ","ḷ","ฬ","ຬ","ဠ","ឡ","ল়","ਲ਼","ᩊ","ળ","ళ","ಳ","ള","𑀴","ལ༹","л̣"],["ව","व","v","ว","ວ","ဝ","វ","ৰ","ਵ","ᩅ","વ","వ","ವ","വ","𑀯","ཝ","в"],["ස","स","s","ส","ສ","သ","ស","স","ਸ","ᩈ","સ","స","ಸ","സ","𑀲","ས","с"],["හ","ह","h","ห","ຫ","ဟ","ហ","হ","ਹ","ᩉ","હ","హ","ಹ","ഹ","𑀳","ཧ","х"],["ශ","श","ś"],["ෂ","ष","ş"]],xr=[["ා","ा","ā","า","າ","ာ","ា","া","ਾ","ᩣ","ા","ా","ಾ","ാ","𑀸","ཱ","а̄"],["ි","ि","i","ิ","ິ","ိ","ិ","ি","ਿ","ᩥ","િ","ి","ಿ","ി","𑀺","ི","и"],["ී","ी","ī","ี","ີ","ီ","ី","ী","ੀ","ᩦ","ી","ీ","ೀ","ീ","𑀻","ཱི","ӣ"],["ු","ु","u","ุ","ຸ","ု","ុ","ু","ੁ","ᩩ","ુ","ు","ು","ു","𑀼","ུ","у"],["ූ","ू","ū","ู","ູ","ူ","ូ","ূ","ੂ","ᩪ","ૂ","ూ","ೂ","ൂ","𑀽","ཱུ","ӯ"],["ෙ","े","e","เ","ເ","ေ","េ","ে","ੇ","ᩮ","ે","ే","ೇ","േ","𑁂","ེ","е"],["ො","ो","o","โ","ໂ","ော","ោ","ো","ੋ","ᩮᩣ","ો","ో","ೋ","ോ","𑁄","ོ","о"],["ෛ","ै","ai"],["ෞ","ौ","au"],["ෘ","ृ","ṛ"],["ෲ","ॄ","ṝ"],["ෟ","ॢ","l̥"],["ෳ","ॣ","ḹ"]];function Wr(t,e,n=""){return t.replace(/\u0DCA([\u0DBA\u0DBB])/g,"්‍$1")}function jr(t){return t=t.replace(/ඒ/g,"එ").replace(/ඕ/g,"ඔ"),t.replace(/ේ/g,"ෙ").replace(/ෝ/g,"ො")}function zr(t,e,n=""){return t=t.replace(/[,;]/g,"၊"),t=t.replace(/[\u2026\u0964\u0965]+/g,"။"),t=t.replace(/ဉ\u1039ဉ/g,"ည"),t=t.replace(/သ\u1039သ/g,"ဿ"),t=t.replace(/င္([က-ဠ])/g,"င်္$1"),t=t.replace(/္ယ/g,"ျ"),t=t.replace(/္ရ/g,"ြ"),t=t.replace(/္ဝ/g,"ွ"),t=t.replace(/္ဟ/g,"ှ"),t=t.replace(/([ခဂငဒပဝ]ေ?)\u102c/g,"$1ါ"),t=t.replace(/(က္ခ|န္ဒ|ပ္ပ|မ္ပ)(ေ?)\u102b/g,"$1$2ာ"),t.replace(/(ဒ္ဓ|ဒွ)(ေ?)\u102c/g,"$1$2ါ")}function qr(t){return t=t.replace(/\u102B/g,"ာ"),t=t.replace(/ှ/g,"္ဟ"),t=t.replace(/ွ/g,"္ဝ"),t=t.replace(/ြ/g,"္ရ"),t=t.replace(/ျ/g,"္ယ"),t=t.replace(/\u103A/g,""),t=t.replace(/ဿ/g,"သ္သ"),t=t.replace(/ည/g,"ဉ္ဉ"),t=t.replace(/သံဃ/g,"သင္ဃ"),t=t.replace(/၊/g,","),t.replace(/။/g,".")}function y(t,e,n=""){return n=="cen"?t=t.replace(/॥/g,""):n.startsWith("ga")&&(t=t.replace(/।/g,";"),t=t.replace(/॥/g,".")),t=t.replace(/॰…/g,"…"),t=t.replace(/॰/g,"·"),t=t.replace(/[।॥]/g,"."),t=t.replace(/\s([\s,!;\?\.])/g,"$1"),t}function Gr(t,e,n=""){return t=t.replace(/^((?:<w>)?\S)/g,(r,i)=>i.toUpperCase()),t=t.replace(/([\.\?]\s(?:<w>)?)(\S)/g,(r,i,s)=>`${i}${s.toUpperCase()}`),t.replace(/([\u201C‘](?:<w>)?)(\S)/g,(r,i,s)=>`${i}${s.toUpperCase()}`)}const Kr=t=>t.toLowerCase();function Ut(t,e,n=""){if(e==u.THAI)return t.replace(/([ก-ฮ])([เโ])/g,"$2$1");if(e==u.LAOS)return t.replace(/([ກ-ຮ])([ເໂ])/g,"$2$1");throw new Error(`Unsupported script ${e} for swap_e_o method.`)}function $t(t,e){if(e==u.THAI)return t.replace(/([เโ])([ก-ฮ])/g,"$2$1");if(e==u.LAOS)return t.replace(/([ເໂ])([ກ-ຮ])/g,"$2$1");throw new Error(`Unsupported script ${e} for un_swap_e_o method.`)}function Jr(t,e){return t=t.replace(/\u0E34\u0E4D/g,"ึ"),t=t.replace(/ญ/g,""),t.replace(/ฐ/g,"")}function Yr(t,e){return t=t.replace(/ฎ/g,"ฏ"),t=t.replace(/\u0E36/g,"ิํ"),t=t.replace(/\uF70F/g,"ญ"),t.replace(/\uF700/g,"ฐ")}function Xr(t,e){return t=t.replace(/\u17B9/g,"ិំ"),t.replace(/\u17D1/g,"្")}function lt(t){return t.replace(/\u200C|\u200D/g,"")}function Qr(t){return t=t.replace(/।/g,"𑁇"),t=t.replace(/॥/g,"𑁈"),t.replace(/–/g,"𑁋")}function Zr(t){return t=t.replace(/\u1A60\u1A41/g,"ᩕ"),t=t.replace(/\u1A48\u1A60\u1A48/g,"ᩔ"),t=t.replace(/।/g,"᪨"),t.replace(/॥/g,"᪩")}function ei(t){t=t.replace(/।/g,"།"),t=t.replace(/॥/g,"༎");for(let e=0;e<=39;e++)t=t.replace(new RegExp(String.fromCharCode(3972,3904+e),"g"),String.fromCharCode(3984+e));return t=t.replace(/\u0F61\u0FB1/g,"ཡྻ"),t=t.replace(/\u0F5D\u0FAD/g,"ཝྺ"),t=t.replace(/\u0F5B\u0FAC/g,"ཛ྄ཛྷ"),t=t.replace(/\u0F61\u0FB7/g,"ཡ྄ཧ"),t.replace(/\u0F5D\u0FB7/g,"ཝ྄ཧ")}function ti(t){return t}function ni(t){return t=t.replace(/ৰ/g,"ৱ"),t=t.replace(/র/g,"ৰ"),t=t.replace(/ল়/g,"ড়"),t}const ri=[],ii={[u.SI]:[Wr,y],[u.RO]:[y,Gr],[u.THAI]:[Ut,Jr,y],[u.LAOS]:[Ut,y],[u.MY]:[zr,y],[u.KM]:[y],[u.THAM]:[Zr],[u.GUJA]:[y],[u.TELU]:[y],[u.MALA]:[y],[u.BRAH]:[Qr,y],[u.TIBT]:[ei],[u.CYRL]:[y],[u.ASSE]:[ni]},si=[],oi={[u.SI]:[lt,jr],[u.HI]:[lt],[u.RO]:[Kr],[u.THAI]:[Yr,$t],[u.LAOS]:[$t],[u.KM]:[Xr],[u.MY]:[qr],[u.TIBT]:[ti]};function vt(t,e,n=!0){let r=Vr.concat(Hr,n?xr:[]),i=[[],[],[]];return r.forEach(s=>{s[t]&&i[s[t].length-1].push([s[t],s[e]])}),i.filter(s=>s.length).map(s=>[s[0][0].length,new Map(s)]).reverse()}function Et(t,e){let n=new Array,r=0;for(;r<t.length;){let i=!1;for(let[s,o]of e){const a=t.substr(r,s);if(o.has(a)){n.push(o.get(a)),i=!0,r+=s;break}}i||(n.push(t.charAt(r)),r++)}return n.join("")}function Ht(t,e){const n=e==u.CYRL?"а":"a";return t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t.replace(/([ක-ෆ])$/g,`$1${n}`)}const ai={අ:"",ආ:"ා",ඉ:"ි",ඊ:"ී",උ:"ු",ඌ:"ූ",එ:"ෙ",ඔ:"ො"};function Vt(t,e){return t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])$/g,"$1්"),t=t.replace(/([ක-ෆ])([අආඉඊඋඌඑඔ])/g,(n,r,i)=>r+ai[i]),t}const ci=t=>t.replace(/ṁ/g,"ං"),li=[ut],ui={[u.SI]:[],[u.RO]:[Ht,ut],[u.CYRL]:[Ht,ut]},di=[fi],hi={[u.SI]:[],[u.RO]:[xt,ci,Vt],[u.CYRL]:[xt,Vt]};function ut(t,e){const n=vt(te[u.SI],te[e]);return Et(t,n)}function fi(t,e){const n=vt(te[e],te[u.SI]);return Et(t,n)}function xt(t,e){const n=vt(te[e],te[u.SI],!1);return Et(t,n)}class De{static basicConvert(e,n){return(ui[n]||li).forEach(r=>e=r(e,n)),e}static basicConvertFrom(e,n){return(hi[n]||di).forEach(r=>e=r(e,n)),e}static beautify(e,n,r=""){return(ii[n]||ri).forEach(i=>e=i(e,n,r)),e}static convert(e,n){return e=this.basicConvert(e,n),this.beautify(e,n)}static convertFrom(e,n){return(oi[n]||si).forEach(r=>e=r(e,n)),this.basicConvertFrom(e,n)}static convertFromMixed(e){e=lt(e)+" ";let n=-1,r="",i="";for(let s=0;s<e.length;s++){const o=$r(e.charCodeAt(s));o!=n||s==e.length-1?(i+=this.convertFrom(r,n),n=o,r=e.charAt(s)):r+=e.charAt(s)}return i}}const kn="epitaka_settings_v3";function Wt(){return{pali:!0,translation:!0,layout:"stacked",paliScript:u.RO,paliColor:"#7c2d12",transColor:"#1e3a5f",bgColor:"#faf7f2",actionButtons:"line",fontSize:16,actionCollapse:!1,load_attha:!0}}function We(){try{return{...Wt(),...JSON.parse(localStorage.getItem(kn)||"{}")}}catch{return Wt()}}function pi(t){localStorage.setItem(kn,JSON.stringify(t))}function Cn(t){const e=document.documentElement;e.style.setProperty("--pali-color",t.paliColor),e.style.setProperty("--trans-color",t.transColor),e.style.setProperty("--bg",t.bgColor),document.body.style.backgroundColor=t.bgColor;const n=Math.min(Math.max(parseInt(t.fontSize)||16,10),32);e.style.setProperty("--reader-font-size",`${n}px`),e.style.setProperty("font-size",`${n}px`),document.querySelector("body").setAttribute("script",t.paliScript),document.body.setAttribute("data-ra-mode",t.actionButtons||"line"),document.body.setAttribute("data-ra-collapse",t.actionCollapse?"true":"false");const r=[t.pali,t.translation].filter(Boolean).length;document.body.setAttribute("data-flow",r<=1?"true":"false"),document.querySelectorAll(".pali-text").forEach(i=>i.style.display=t.pali?"":"none"),document.querySelectorAll(".translation-text").forEach(i=>i.style.display=t.translation?"":"none"),gi(t)}function gi(t){const e=t.pali&&t.translation;document.querySelectorAll(".sentence-row").forEach(n=>{t.layout==="sidebyside"&&e?n.classList.add("side-by-side"):n.classList.remove("side-by-side")})}function Ee(t,e){const n=document.getElementById(t);n&&(n.checked=!!e)}function we(t,e){const n=document.getElementById(t);return n?n.checked:e??!1}function Qe(t,e){const n=document.getElementById(t);n&&(n.value=e)}function Ze(t){const e=document.getElementById(t);return e?e.value:""}function mi(t){Ee("cb-pali",t.pali),Ee("cb-translation",t.translation);const e=document.querySelector(`input[name="layout"][value="${t.layout}"]`);e&&(e.checked=!0);const n=document.querySelector(`input[name="action-mode"][value="${t.actionButtons||"line"}"]`);n&&(n.checked=!0),Qe("color-pali",t.paliColor),Qe("color-trans",t.transColor),Qe("color-bg",t.bgColor);const r=document.getElementById("pali-script-select");r&&(r.value=t.paliScript);const i=document.getElementById("range-font-size");i&&(i.value=t.fontSize||16,_i(i.value)),Ee("cb-action-collapse",!!t.actionCollapse),Ee("cb-load-attha",t.load_attha??!0)}function bi(){var t,e,n,r;return{pali:we("cb-pali"),translation:we("cb-translation"),layout:((t=document.querySelector('input[name="layout"]:checked'))==null?void 0:t.value)||"stacked",actionButtons:((e=document.querySelector('input[name="action-mode"]:checked'))==null?void 0:e.value)||"line",paliScript:((n=document.getElementById("pali-script-select"))==null?void 0:n.value)||u.RO,paliColor:Ze("color-pali"),transColor:Ze("color-trans"),bgColor:Ze("color-bg"),fontSize:parseInt((r=document.getElementById("range-font-size"))==null?void 0:r.value)||16,actionCollapse:we("cb-action-collapse"),load_attha:we("cb-load-attha",!0)}}function _i(t){const e=document.getElementById("font-size-label");e&&(e.textContent=`${t}px`)}function Rn(t,e){t.innerHTML="";for(const[n,r]of Tn){const i=document.createElement("option");i.value=n,i.textContent=`${r[0]} — ${r[1]}`,n===e&&(i.selected=!0),t.appendChild(i)}}const{bookId:tl,baseUrl:Pn,bookref:nl}=window.BOOK_CONFIG;console.log(window.BOOK_CONFIG);const j=document.getElementById("dict-word-input"),J=document.getElementById("dict-suggestions"),ce=document.getElementById("dict-panel"),et=document.getElementById("dict-close");document.getElementById("dict-word");const le=document.getElementById("dict-results");let Ae=null,_=-1;function yi(t){t.querySelectorAll(".sentence-row .pali-text").forEach(e=>{e.addEventListener("click",Ii)})}function Ii(t){const e=window.getSelection();let n=e==null?void 0:e.toString().trim();if(n||(n=Ci(t)),!n)return;const r=We();let i=n;if(r.paliScript!==u.RO){const s=De.convertFrom(n,r.paliScript);i=De.convert(s,u.RO)}i=i.trim().replace(/[.,;:!?()[\]{}'"]/g,"").toLowerCase(),i&&vi(i)}function vi(t){j.value=t,G(),ce.classList.add("open"),Ln(t)}async function Ln(t){if(t){le.innerHTML='<div class="dict-loading">Looking up…</div>';try{const n=await(await fetch(`${Pn}/api/dictionary?word=${encodeURIComponent(t)}`)).json();Ai(n)}catch{le.innerHTML='<div class="dict-error">Lookup failed.</div>'}}}Sn(j,{mode:"both"});j.addEventListener("input",()=>{const t=j.value.trim();if(_=-1,!t){G();return}Ei(t)});j.addEventListener("keydown",t=>{const e=J.querySelectorAll(".dict-suggestion-item");t.key==="ArrowDown"?(t.preventDefault(),_=Math.min(_+1,e.length-1),jt(e)):t.key==="ArrowUp"?(t.preventDefault(),_=Math.max(_-1,-1),jt(e)):t.key==="Enter"?(t.preventDefault(),_>=0&&e[_]?Ne(e[_].dataset.word):Ne(j.value.trim())):t.key==="Escape"&&G()});document.addEventListener("click",t=>{t.target.closest("#dict-word-wrapper")||G()});async function Ei(t){Ae&&Ae.abort(),Ae=new AbortController;try{const n=await(await fetch(`${Pn}/api/suggest_word?q=${encodeURIComponent(t)}`,{signal:Ae.signal})).json();wi(n)}catch(e){e.name!=="AbortError"&&G()}}function wi(t){if(!(t!=null&&t.length)){G();return}J.innerHTML=t.map(e=>`
    <li class="dict-suggestion-item" 
        role="option" 
        data-word="${e}"
        tabindex="-1">
      <span class="suggest-word pali-text">${e}</span>
    </li>
  `).join(""),J.querySelectorAll(".dict-suggestion-item").forEach(e=>{e.addEventListener("mousedown",n=>{n.preventDefault(),Ne(e.dataset.word)})}),J.classList.add("open")}function jt(t){var e;t.forEach((n,r)=>n.classList.toggle("active",r===_)),_>=0&&((e=t[_])==null||e.scrollIntoView({block:"nearest"}))}function Ne(t){t&&(j.value=t,G(),Ln(t))}function G(){J.innerHTML="",J.classList.remove("open"),_=-1}function Ai(t){if(!(t!=null&&t.length)){le.innerHTML='<p class="dict-empty">No results found.</p>';return}let e="",n=null;for(const r of t){if(r.type==="deconstruction"){e+=`<div class="dict-book-group">
        <div class="dict-book-name">${r.book_name}</div>
        ${Si(r)}
      </div>`;continue}r.book_name!==n&&(n&&(e+="</div>"),e+=`<div class="dict-book-group">
        <div class="dict-book-name">${r.book_name}</div>`,n=r.book_name),e+=`<div class="dict-entry">
      <div class="dict-entry-word">${r.word}</div>
      <div class="dict-entry-def">${r.definition}</div>
      ${Ti(r.usages||[])}
    </div>`}n&&(e+="</div>"),le.innerHTML=e,le.querySelectorAll(".decon-part").forEach(r=>{const i=r.dataset.word;i&&r.addEventListener("click",s=>{s.stopPropagation(),Ne(i)})})}function Si(t){const e=t.deconstruction||"",n=t.components||[];if(!e||!n.length)return"";const r=n.map((i,s)=>{const o=s===n.length-1;return`
      <span class="decon-part" data-word="${I(i)}" tabindex="0" role="button">
        <span class="decon-part-word">${I(i)}</span>
        <span class="decon-part-hint">click to define</span>
      </span>
      ${o?"":'<span class="decon-plus">+</span>'}`}).join("");return`<div class="decon-card">
    <div class="decon-formula">
      <span class="decon-original-word">${I(t.word)}</span>
      <span class="decon-arrow">→</span>
      <span class="decon-breakdown">
        ${r}
      </span>
    </div>
    <div class="decon-hint">Click any component word to look up its meaning</div>
  </div>`}function Ti(t){return t.length?`<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${t.map(n=>{const r=n.word+(n.ending||""),i=ki(n.pali||"",r);We();const s=n.translation;return`<div class="dict-usage">
      <div class="dict-usage-pali">${i}</div>
      ${s?`<div class="dict-usage-trans">${I(s)}</div>`:""}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${I(n.book_name)}</span>
        <a class="dict-usage-open" href="${I(n.reader_url)}" target="_blank" rel="noopener">
          ↗
        </a>
      </div>
    </div>`}).join("")}
  </div>`:""}function ki(t,e){if(!e||!t)return I(t);const n=t.toLowerCase().indexOf(e.toLowerCase());return n===-1?I(t):I(t.slice(0,n))+`<mark>${I(t.slice(n,n+e.length))}</mark>`+I(t.slice(n+e.length))}function I(t){return String(t??"")}et==null||et.addEventListener("click",()=>ce.classList.remove("open"));document.addEventListener("click",t=>{ce.classList.contains("open")&&!ce.contains(t.target)&&!t.target.closest(".pali-text")&&ce.classList.remove("open")});function Ci(t){var a,c,l,d;if(!document.caretRangeFromPoint)return null;const e=document.caretRangeFromPoint(t.clientX,t.clientY);if(!e)return null;const n=e.startContainer,r=e.startOffset;if(n.nodeType!==Node.TEXT_NODE)return null;const i=n.textContent,s=((c=(a=n.parentElement)==null?void 0:a.closest("[lang]"))==null?void 0:c.getAttribute("lang"))||"en",o=((d=(l=n.parentElement)==null?void 0:l.closest("[data-script]"))==null?void 0:d.getAttribute("data-script"))||null;return Ri(i,r,s,o)}function Ri(t,e,n,r){const i=["ro","si","hi","be","as","gm","gj","te","ka","mm","tb","cy","br"];return["en","in","es","pt","hi","si","ch"].includes(n)||i.includes(r)?Pi(t,e):typeof Intl<"u"&&Intl.Segmenter?Li(t,e,n):On(t,e)}function Pi(t,e){const n=/[\s\u200b\u00a0।॥၊။,\.!\?;:"'()\[\]{}<>\/\\]/;let r=e,i=e;for(;r>0&&!n.test(t[r-1]);)r--;for(;i<t.length&&!n.test(t[i]);)i++;return t.slice(r,i).trim()||null}function Li(t,e,n){const i={th:"th",my:"my",lo:"lo",km:"km",tt:"th",en:"en",hi:"hi",si:"si",be:"bn",as:"as",gm:"pa",gj:"gu",te:"te",ka:"kn",mm:"ml",tb:"bo",cy:"ru"}[n]||n;try{const o=[...new Intl.Segmenter(i,{granularity:"word"}).segment(t)];for(const a of o){const c=a.index,l=a.index+a.segment.length;if(e>=c&&e<=l)return a.isWordLike===!1?null:a.segment.trim()||null}}catch{}return On(t,e)}function On(t,e){const n=[[3584,3711],[3712,3839],[4096,4255],[6016,6143],[6688,6831],[4096,4255]];function r(o){const a=o.codePointAt(0);return n.some(([c,l])=>a>=c&&a<=l)}let i=e,s=e;for(;i>0&&r(t[i-1]);)i--;for(;s<t.length&&r(t[s]);)s++;return t.slice(i,s).trim()||null}const Oi=()=>{};var zt={};/**
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
 */const Dn=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},Di=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],a=t[n++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Nn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,a=o?t[i+1]:0,c=i+2<t.length,l=c?t[i+2]:0,d=s>>2,f=(s&3)<<4|a>>4;let g=(a&15)<<2|l>>6,b=l&63;c||(b=64,o||(g=64)),r.push(n[d],n[f],n[g],n[b])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Dn(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Di(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],a=i<t.length?n[t.charAt(i)]:0;++i;const l=i<t.length?n[t.charAt(i)]:64;++i;const f=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||a==null||l==null||f==null)throw new Ni;const g=s<<2|a>>4;if(r.push(g),l!==64){const b=a<<4&240|l>>2;if(r.push(b),f!==64){const w=l<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Ni extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Mi=function(t){const e=Dn(t);return Nn.encodeByteArray(e,!0)},Mn=function(t){return Mi(t).replace(/\./g,"")},Fn=function(t){try{return Nn.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Fi(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Bi=()=>Fi().__FIREBASE_DEFAULTS__,Ui=()=>{if(typeof process>"u"||typeof zt>"u")return;const t=zt.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},$i=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Fn(t[1]);return e&&JSON.parse(e)},wt=()=>{try{return Oi()||Bi()||Ui()||$i()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Hi=t=>{var e,n;return(n=(e=wt())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Bn=()=>{var t;return(t=wt())==null?void 0:t.config},Un=t=>{var e;return(e=wt())==null?void 0:e[`_${t}`]};/**
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
 */class Vi{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function m(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function xi(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(m())}function Wi(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function ji(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function zi(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function qi(){const t=m();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Gi(){try{return typeof indexedDB=="object"}catch{return!1}}function Ki(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}/**
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
 */const Ji="FirebaseError";class U extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Ji,Object.setPrototypeOf(this,U.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,me.prototype.create)}}class me{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?Yi(s,r):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new U(i,a,r)}}function Yi(t,e){return t.replace(Xi,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Xi=/\{\$([^}]+)}/g;function Qi(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ne(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(qt(s)&&qt(o)){if(!ne(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function qt(t){return t!==null&&typeof t=="object"}/**
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
 */function be(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Zi(t,e){const n=new es(t,e);return n.subscribe.bind(n)}class es{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");ts(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=tt),i.error===void 0&&(i.error=tt),i.complete===void 0&&(i.complete=tt);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ts(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function tt(){}/**
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
 */function $(t){return t&&t._delegate?t._delegate:t}/**
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
 */function At(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function ns(t){return(await fetch(t,{credentials:"include"})).ok}class re{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class rs{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Vi;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ss(e))try{this.getOrInitializeService({instanceIdentifier:H})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=H){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=H){return this.instances.has(e)}getOptions(e=H){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);r===a&&o.resolve(i)}return i}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:is(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=H){return this.component?this.component.multipleInstances?e:H:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function is(t){return t===H?void 0:t}function ss(t){return t.instantiationMode==="EAGER"}/**
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
 */class os{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new rs(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var p;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(p||(p={}));const as={debug:p.DEBUG,verbose:p.VERBOSE,info:p.INFO,warn:p.WARN,error:p.ERROR,silent:p.SILENT},cs=p.INFO,ls={[p.DEBUG]:"log",[p.VERBOSE]:"log",[p.INFO]:"info",[p.WARN]:"warn",[p.ERROR]:"error"},us=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=ls[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class $n{constructor(e){this.name=e,this._logLevel=cs,this._logHandler=us,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in p))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?as[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,p.DEBUG,...e),this._logHandler(this,p.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,p.VERBOSE,...e),this._logHandler(this,p.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,p.INFO,...e),this._logHandler(this,p.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,p.WARN,...e),this._logHandler(this,p.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,p.ERROR,...e),this._logHandler(this,p.ERROR,...e)}}const ds=(t,e)=>e.some(n=>t instanceof n);let Gt,Kt;function hs(){return Gt||(Gt=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function fs(){return Kt||(Kt=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Hn=new WeakMap,dt=new WeakMap,Vn=new WeakMap,nt=new WeakMap,St=new WeakMap;function ps(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(F(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Hn.set(n,t)}).catch(()=>{}),St.set(e,t),e}function gs(t){if(dt.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});dt.set(t,e)}let ht={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return dt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Vn.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return F(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function ms(t){ht=t(ht)}function bs(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(rt(this),e,...n);return Vn.set(r,e.sort?e.sort():[e]),F(r)}:fs().includes(t)?function(...e){return t.apply(rt(this),e),F(Hn.get(this))}:function(...e){return F(t.apply(rt(this),e))}}function _s(t){return typeof t=="function"?bs(t):(t instanceof IDBTransaction&&gs(t),ds(t,hs())?new Proxy(t,ht):t)}function F(t){if(t instanceof IDBRequest)return ps(t);if(nt.has(t))return nt.get(t);const e=_s(t);return e!==t&&(nt.set(t,e),St.set(e,t)),e}const rt=t=>St.get(t);function ys(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),a=F(o);return r&&o.addEventListener("upgradeneeded",c=>{r(F(o.result),c.oldVersion,c.newVersion,F(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",l=>i(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const Is=["get","getKey","getAll","getAllKeys","count"],vs=["put","add","delete","clear"],it=new Map;function Jt(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(it.get(e))return it.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=vs.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Is.includes(n)))return;const s=async function(o,...a){const c=this.transaction(o,i?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),i&&c.done]))[0]};return it.set(e,s),s}ms(t=>({...t,get:(e,n,r)=>Jt(e,n)||t.get(e,n,r),has:(e,n)=>!!Jt(e,n)||t.has(e,n)}));/**
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
 */class Es{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(ws(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function ws(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ft="@firebase/app",Yt="0.15.1";/**
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
 */const L=new $n("@firebase/app"),As="@firebase/app-compat",Ss="@firebase/analytics-compat",Ts="@firebase/analytics",ks="@firebase/app-check-compat",Cs="@firebase/app-check",Rs="@firebase/auth",Ps="@firebase/auth-compat",Ls="@firebase/database",Os="@firebase/data-connect",Ds="@firebase/database-compat",Ns="@firebase/functions",Ms="@firebase/functions-compat",Fs="@firebase/installations",Bs="@firebase/installations-compat",Us="@firebase/messaging",$s="@firebase/messaging-compat",Hs="@firebase/performance",Vs="@firebase/performance-compat",xs="@firebase/remote-config",Ws="@firebase/remote-config-compat",js="@firebase/storage",zs="@firebase/storage-compat",qs="@firebase/firestore",Gs="@firebase/ai",Ks="@firebase/firestore-compat",Js="firebase",Ys="12.16.0";/**
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
 */const pt="[DEFAULT]",Xs={[ft]:"fire-core",[As]:"fire-core-compat",[Ts]:"fire-analytics",[Ss]:"fire-analytics-compat",[Cs]:"fire-app-check",[ks]:"fire-app-check-compat",[Rs]:"fire-auth",[Ps]:"fire-auth-compat",[Ls]:"fire-rtdb",[Os]:"fire-data-connect",[Ds]:"fire-rtdb-compat",[Ns]:"fire-fn",[Ms]:"fire-fn-compat",[Fs]:"fire-iid",[Bs]:"fire-iid-compat",[Us]:"fire-fcm",[$s]:"fire-fcm-compat",[Hs]:"fire-perf",[Vs]:"fire-perf-compat",[xs]:"fire-rc",[Ws]:"fire-rc-compat",[js]:"fire-gcs",[zs]:"fire-gcs-compat",[qs]:"fire-fst",[Ks]:"fire-fst-compat",[Gs]:"fire-vertex","fire-js":"fire-js",[Js]:"fire-js-all"};/**
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
 */const Me=new Map,Qs=new Map,gt=new Map;function Xt(t,e){try{t.container.addComponent(e)}catch(n){L.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function he(t){const e=t.name;if(gt.has(e))return L.debug(`There were multiple attempts to register component ${e}.`),!1;gt.set(e,t);for(const n of Me.values())Xt(n,t);for(const n of Qs.values())Xt(n,t);return!0}function xn(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function A(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Zs={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},B=new me("app","Firebase",Zs);/**
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
 */class eo{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new re("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw B.create("app-deleted",{appName:this._name})}}/**
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
 */const _e=Ys;function Wn(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:pt,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw B.create("bad-app-name",{appName:String(i)});if(n||(n=Bn()),!n)throw B.create("no-options");const s=Me.get(i);if(s){if(ne(n,s.options)&&ne(r,s.config))return s;throw B.create("duplicate-app",{appName:i})}const o=new os(i);for(const c of gt.values())o.addComponent(c);const a=new eo(n,r,o);return Me.set(i,a),a}function to(t=pt){const e=Me.get(t);if(!e&&t===pt&&Bn())return Wn();if(!e)throw B.create("no-app",{appName:t});return e}function Y(t,e,n){let r=Xs[t]??t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),L.warn(o.join(" "));return}he(new re(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const no="firebase-heartbeat-database",ro=1,fe="firebase-heartbeat-store";let st=null;function jn(){return st||(st=ys(no,ro,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(fe)}catch(n){console.warn(n)}}}}).catch(t=>{throw B.create("idb-open",{originalErrorMessage:t.message})})),st}async function io(t){try{const n=(await jn()).transaction(fe),r=await n.objectStore(fe).get(zn(t));return await n.done,r}catch(e){if(e instanceof U)L.warn(e.message);else{const n=B.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});L.warn(n.message)}}}async function Qt(t,e){try{const r=(await jn()).transaction(fe,"readwrite");await r.objectStore(fe).put(e,zn(t)),await r.done}catch(n){if(n instanceof U)L.warn(n.message);else{const r=B.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});L.warn(r.message)}}}function zn(t){return`${t.name}!${t.options.appId}`}/**
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
 */const so=1024,oo=30;class ao{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new lo(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Zt();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>oo){const o=uo(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){L.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Zt(),{heartbeatsToSend:r,unsentEntries:i}=co(this._heartbeatsCache.heartbeats),s=Mn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return L.warn(n),""}}}function Zt(){return new Date().toISOString().substring(0,10)}function co(t,e=so){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),en(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),en(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class lo{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Gi()?Ki().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await io(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Qt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Qt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function en(t){return Mn(JSON.stringify({version:2,heartbeats:t})).length}function uo(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function ho(t){he(new re("platform-logger",e=>new Es(e),"PRIVATE")),he(new re("heartbeat",e=>new ao(e),"PRIVATE")),Y(ft,Yt,t),Y(ft,Yt,"esm2020"),Y("fire-js","")}ho("");var fo="firebase",po="12.16.0";/**
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
 */Y(fo,po,"app");function qn(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const go=qn,Gn=new me("auth","Firebase",qn());/**
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
 */const Fe=new $n("@firebase/auth");function mo(t,...e){Fe.logLevel<=p.WARN&&Fe.warn(`Auth (${_e}): ${t}`,...e)}function Ce(t,...e){Fe.logLevel<=p.ERROR&&Fe.error(`Auth (${_e}): ${t}`,...e)}/**
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
 */function T(t,...e){throw kt(t,...e)}function E(t,...e){return kt(t,...e)}function Tt(t,e,n){const r={...go(),[e]:n};return new me("auth","Firebase",r).create(e,{appName:t.name})}function x(t){return Tt(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function bo(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&T(t,"argument-error"),Tt(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function kt(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Gn.create(t,...e)}function h(t,e,...n){if(!t)throw kt(e,...n)}function R(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ce(e),new Error(e)}function O(t,e){t||R(e)}/**
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
 */function mt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function _o(){return tn()==="http:"||tn()==="https:"}function tn(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function yo(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(_o()||ji()||"connection"in navigator)?navigator.onLine:!0}function Io(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class ye{constructor(e,n){this.shortDelay=e,this.longDelay=n,O(n>e,"Short delay should be less than long delay!"),this.isMobile=xi()||zi()}get(){return yo()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ct(t,e){O(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Kn{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;R("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;R("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;R("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const vo={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Eo=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],wo=new ye(3e4,6e4);function Rt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function oe(t,e,n,r,i={}){return Jn(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const a=be({...o,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const l={method:e,headers:c,...s};return Wi()||(l.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&At(t.emulatorConfig.host)&&(l.credentials="include"),Kn.fetch()(await Yn(t,t.config.apiHost,n,a),l)})}async function Jn(t,e,n){t._canInitEmulator=!1;const r={...vo,...e};try{const i=new So(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Se(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Se(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Se(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Se(t,"user-disabled",o);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw Tt(t,d,l);T(t,d)}}catch(i){if(i instanceof U)throw i;T(t,"network-request-failed",{message:String(i)})}}async function Ao(t,e,n,r,i={}){const s=await oe(t,e,n,r,i);return"mfaPendingCredential"in s&&T(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function Yn(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?Ct(t.config,i):`${t.config.apiScheme}://${i}`;return Eo.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class So{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(E(this.auth,"network-request-failed")),wo.get())})}}function Se(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=E(t,e,r);return i.customData._tokenResponse=n,i}/**
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
 */async function To(t,e){return oe(t,"POST","/v1/accounts:delete",e)}async function Be(t,e){return oe(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function ue(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ko(t,e=!1){const n=$(t),r=await n.getIdToken(e),i=Pt(r);h(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:ue(ot(i.auth_time)),issuedAtTime:ue(ot(i.iat)),expirationTime:ue(ot(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function ot(t){return Number(t)*1e3}function Pt(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Ce("JWT malformed, contained fewer than 3 sections"),null;try{const i=Fn(n);return i?JSON.parse(i):(Ce("Failed to decode base64 JWT payload"),null)}catch(i){return Ce("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function nn(t){const e=Pt(t);return h(e,"internal-error"),h(typeof e.exp<"u","internal-error"),h(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function pe(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof U&&Co(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function Co({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Ro{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class bt{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ue(this.lastLoginAt),this.creationTime=ue(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ue(t){var f;const e=t.auth,n=await t.getIdToken(),r=await pe(t,Be(e,{idToken:n}));h(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];t._notifyReloadListener(i);const s=(f=i.providerUserInfo)!=null&&f.length?Xn(i.providerUserInfo):[],o=Lo(t.providerData,s),a=t.isAnonymous,c=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),l=a?c:!1,d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new bt(i.createdAt,i.lastLoginAt),isAnonymous:l};Object.assign(t,d)}async function Po(t){const e=$(t);await Ue(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Lo(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Xn(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function Oo(t,e){const n=await Jn(t,{},async()=>{const r=be({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await Yn(t,i,"/v1/token",`key=${s}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:r};return t.emulatorConfig&&At(t.emulatorConfig.host)&&(c.credentials="include"),Kn.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Do(t,e){return oe(t,"POST","/v2/accounts:revokeToken",Rt(t,e))}/**
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
 */class X{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){h(e.idToken,"internal-error"),h(typeof e.idToken<"u","internal-error"),h(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):nn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){h(e.length!==0,"internal-error");const n=nn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(h(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await Oo(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new X;return r&&(h(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(h(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(h(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new X,this.toJSON())}_performRefresh(){return R("not implemented")}}/**
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
 */function D(t,e){h(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class v{constructor({uid:e,auth:n,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new Ro(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new bt(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await pe(this,this.stsTokenManager.getToken(this.auth,e));return h(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return ko(this,e)}reload(){return Po(this)}_assign(e){this!==e&&(h(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new v({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){h(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Ue(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(A(this.auth.app))return Promise.reject(x(this.auth));const e=await this.getIdToken();return await pe(this,To(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,i=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,c=n._redirectEventId??void 0,l=n.createdAt??void 0,d=n.lastLoginAt??void 0,{uid:f,emailVerified:g,isAnonymous:b,providerData:w,stsTokenManager:ae}=n;h(f&&ae,e,"internal-error");const Fr=X.fromJSON(this.name,ae);h(typeof f=="string",e,"internal-error"),D(r,e.name),D(i,e.name),h(typeof g=="boolean",e,"internal-error"),h(typeof b=="boolean",e,"internal-error"),D(s,e.name),D(o,e.name),D(a,e.name),D(c,e.name),D(l,e.name),D(d,e.name);const Xe=new v({uid:f,auth:e,email:i,emailVerified:g,displayName:r,isAnonymous:b,photoURL:o,phoneNumber:s,tenantId:a,stsTokenManager:Fr,createdAt:l,lastLoginAt:d});return w&&Array.isArray(w)&&(Xe.providerData=w.map(Br=>({...Br}))),c&&(Xe._redirectEventId=c),Xe}static async _fromIdTokenResponse(e,n,r=!1){const i=new X;i.updateFromServerResponse(n);const s=new v({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Ue(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];h(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Xn(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),a=new X;a.updateFromIdToken(r);const c=new v({uid:i.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new bt(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,l),c}}/**
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
 */const rn=new Map;function P(t){O(t instanceof Function,"Expected a class definition");let e=rn.get(t);return e?(O(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,rn.set(t,e),e)}/**
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
 */class Qn{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Qn.type="NONE";const sn=Qn;/**
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
 */function Re(t,e,n){return`firebase:${t}:${e}:${n}`}class Q{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Re(this.userKey,i.apiKey,s),this.fullPersistenceKey=Re("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Be(this.auth,{idToken:e}).catch(()=>{});return n?v._fromGetAccountInfoResponse(this.auth,n,e):null}return v._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Q(P(sn),e,r);const i=(await Promise.all(n.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let s=i[0]||P(sn);const o=Re(r,e.config.apiKey,e.name);let a=null;for(const l of n)try{const d=await l._get(o);if(d){let f;if(typeof d=="string"){const g=await Be(e,{idToken:d}).catch(()=>{});if(!g)break;f=await v._fromGetAccountInfoResponse(e,g,d)}else f=v._fromJSON(e,d);l!==s&&(a=f),s=l;break}}catch{}const c=i.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new Q(s,e,r):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(n.map(async l=>{if(l!==s)try{await l._remove(o)}catch{}})),new Q(s,e,r))}}/**
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
 */function on(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(nr(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Zn(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(ir(e))return"Blackberry";if(sr(e))return"Webos";if(er(e))return"Safari";if((e.includes("chrome/")||tr(e))&&!e.includes("edge/"))return"Chrome";if(rr(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Zn(t=m()){return/firefox\//i.test(t)}function er(t=m()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function tr(t=m()){return/crios\//i.test(t)}function nr(t=m()){return/iemobile/i.test(t)}function rr(t=m()){return/android/i.test(t)}function ir(t=m()){return/blackberry/i.test(t)}function sr(t=m()){return/webos/i.test(t)}function Lt(t=m()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function No(t=m()){var e;return Lt(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Mo(){return qi()&&document.documentMode===10}function or(t=m()){return Lt(t)||rr(t)||sr(t)||ir(t)||/windows phone/i.test(t)||nr(t)}/**
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
 */function ar(t,e=[]){let n;switch(t){case"Browser":n=on(m());break;case"Worker":n=`${on(m())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${_e}/${r}`}/**
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
 */class Fo{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Bo(t,e={}){return oe(t,"GET","/v2/passwordPolicy",Rt(t,e))}/**
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
 */const Uo=6;class $o{constructor(e){var r;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Uo,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Ho{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new an(this),this.idTokenSubscription=new an(this),this.beforeStateQueue=new Fo(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Gn,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=P(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Q.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Be(this,{idToken:e}),r=await v._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(A(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,a=r==null?void 0:r._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(r=c.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return h(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Ue(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Io()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(A(this.app))return Promise.reject(x(this));const n=e?$(e):null;return n&&h(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&h(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return A(this.app)?Promise.reject(x(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return A(this.app)?Promise.reject(x(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(P(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Bo(this),n=new $o(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new me("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await Do(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&P(e)||this._popupRedirectResolver;h(n,this,"argument-error"),this.redirectPersistenceManager=await Q.create(this,[P(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(h(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,i);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return h(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ar(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var n;if(A(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&mo(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function je(t){return $(t)}class an{constructor(e){this.auth=e,this.observer=null,this.addObserver=Zi(n=>this.observer=n)}get next(){return h(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Ot={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Vo(t){Ot=t}function xo(t){return Ot.loadJS(t)}function Wo(){return Ot.gapiScript}function jo(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function zo(t,e){const n=xn(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(ne(s,e??{}))return i;T(i,"already-initialized")}return n.initialize({options:e})}function qo(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(P);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Go(t,e,n){const r=je(t);h(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=cr(e),{host:o,port:a}=Ko(e),c=a===null?"":`:${a}`,l={url:`${s}//${o}${c}/`},d=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){h(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),h(ne(l,r.config.emulator)&&ne(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,At(o)?ns(`${s}//${o}${c}`):Jo()}function cr(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Ko(t){const e=cr(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:cn(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:cn(o)}}}function cn(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Jo(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class lr{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return R("not implemented")}_getIdTokenResponse(e){return R("not implemented")}_linkToIdToken(e,n){return R("not implemented")}_getReauthenticationResolver(e){return R("not implemented")}}/**
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
 */async function Z(t,e){return Ao(t,"POST","/v1/accounts:signInWithIdp",Rt(t,e))}/**
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
 */const Yo="http://localhost";class z extends lr{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new z(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):T("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=n;if(!r||!i)return null;const o=new z(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Z(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Z(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Z(e,n)}buildRequest(){const e={requestUri:Yo,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=be(n)}return e}}/**
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
 */class Dt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Ie extends Dt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class k extends Ie{constructor(){super("facebook.com")}static credential(e){return z._fromParams({providerId:k.PROVIDER_ID,signInMethod:k.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return k.credentialFromTaggedObject(e)}static credentialFromError(e){return k.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return k.credential(e.oauthAccessToken)}catch{return null}}}k.FACEBOOK_SIGN_IN_METHOD="facebook.com";k.PROVIDER_ID="facebook.com";/**
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
 */class C extends Ie{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return z._fromParams({providerId:C.PROVIDER_ID,signInMethod:C.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return C.credentialFromTaggedObject(e)}static credentialFromError(e){return C.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return C.credential(n,r)}catch{return null}}}C.GOOGLE_SIGN_IN_METHOD="google.com";C.PROVIDER_ID="google.com";/**
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
 */class N extends Ie{constructor(){super("github.com")}static credential(e){return z._fromParams({providerId:N.PROVIDER_ID,signInMethod:N.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return N.credentialFromTaggedObject(e)}static credentialFromError(e){return N.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return N.credential(e.oauthAccessToken)}catch{return null}}}N.GITHUB_SIGN_IN_METHOD="github.com";N.PROVIDER_ID="github.com";/**
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
 */class M extends Ie{constructor(){super("twitter.com")}static credential(e,n){return z._fromParams({providerId:M.PROVIDER_ID,signInMethod:M.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return M.credentialFromTaggedObject(e)}static credentialFromError(e){return M.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return M.credential(n,r)}catch{return null}}}M.TWITTER_SIGN_IN_METHOD="twitter.com";M.PROVIDER_ID="twitter.com";/**
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
 */class ie{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await v._fromIdTokenResponse(e,r,i),o=ln(r);return new ie({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=ln(r);return new ie({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function ln(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class $e extends U{constructor(e,n,r,i){super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,$e.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new $e(e,n,r,i)}}function ur(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?$e._fromErrorAndOperation(t,s,e,r):s})}async function Xo(t,e,n=!1){const r=await pe(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ie._forOperation(t,"link",r)}/**
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
 */async function Qo(t,e,n=!1){const{auth:r}=t;if(A(r.app))return Promise.reject(x(r));const i="reauthenticate";try{const s=await pe(t,ur(r,i,e,t),n);h(s.idToken,r,"internal-error");const o=Pt(s.idToken);h(o,r,"internal-error");const{sub:a}=o;return h(t.uid===a,r,"user-mismatch"),ie._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&T(r,"user-mismatch"),s}}/**
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
 */async function Zo(t,e,n=!1){if(A(t.app))return Promise.reject(x(t));const r="signIn",i=await ur(t,r,e),s=await ie._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}function ea(t,e,n,r){return $(t).onIdTokenChanged(e,n,r)}function ta(t,e,n){return $(t).beforeAuthStateChanged(e,n)}function na(t,e,n,r){return $(t).onAuthStateChanged(e,n,r)}function ra(t){return $(t).signOut()}const He="__sak";/**
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
 */class dr{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(He,"1"),this.storage.removeItem(He),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const ia=1e3,sa=10;class hr extends dr{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=or(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);Mo()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,sa):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},ia)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}hr.type="LOCAL";const oa=hr;/**
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
 */class fr extends dr{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}fr.type="SESSION";const pr=fr;/**
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
 */function aa(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class ze{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new ze(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const a=Array.from(o).map(async l=>l(n.origin,s)),c=await aa(a);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ze.receivers=[];/**
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
 */function Nt(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class ca{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((a,c)=>{const l=Nt("",20);i.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(f){const g=f;if(g.data.eventId===l)switch(g.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(g.data.response);break;default:clearTimeout(d),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function S(){return window}function la(t){S().location.href=t}/**
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
 */function gr(){return typeof S().WorkerGlobalScope<"u"&&typeof S().importScripts=="function"}async function ua(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function da(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function ha(){return gr()?self:null}/**
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
 */const mr="firebaseLocalStorageDb",fa=1,Ve="firebaseLocalStorage",br="fbase_key";class ve{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function qe(t,e){return t.transaction([Ve],e?"readwrite":"readonly").objectStore(Ve)}function pa(){const t=indexedDB.deleteDatabase(mr);return new ve(t).toPromise()}function _r(){const t=indexedDB.open(mr,fa);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Ve,{keyPath:br})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Ve)?e(r):(r.close(),await pa(),e(await _r()))})})}async function un(t,e,n){const r=qe(t,!0).put({[br]:e,value:n});return new ve(r).toPromise()}async function ga(t,e){const n=qe(t,!1).get(e),r=await new ve(n).toPromise();return r===void 0?null:r.value}function dn(t,e){const n=qe(t,!0).delete(e);return new ve(n).toPromise()}const ma=800,ba=3;class yr{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=_r(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>ba)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return gr()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ze._getInstance(ha()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,r;if(this.activeServiceWorker=await ua(),!this.activeServiceWorker)return;this.sender=new ca(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||da()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await un(e,He,"1"),await dn(e,He)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>un(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>ga(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>dn(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=qe(i,!1).getAll();return new ve(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),ma)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}yr.type="LOCAL";const _a=yr;new ye(3e4,6e4);/**
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
 */function Ir(t,e){return e?P(e):(h(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Mt extends lr{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Z(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Z(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Z(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function ya(t){return Zo(t.auth,new Mt(t),t.bypassAuthState)}function Ia(t){const{auth:e,user:n}=t;return h(n,e,"internal-error"),Qo(n,new Mt(t),t.bypassAuthState)}async function va(t){const{auth:e,user:n}=t;return h(n,e,"internal-error"),Xo(n,new Mt(t),t.bypassAuthState)}/**
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
 */class vr{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return ya;case"linkViaPopup":case"linkViaRedirect":return va;case"reauthViaPopup":case"reauthViaRedirect":return Ia;default:T(this.auth,"internal-error")}}resolve(e){O(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){O(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const Ea=new ye(2e3,1e4);async function Er(t,e,n){if(A(t.app))return Promise.reject(E(t,"operation-not-supported-in-this-environment"));const r=je(t);bo(t,e,Dt);const i=Ir(r,n);return new V(r,"signInViaPopup",e,i).executeNotNull()}class V extends vr{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,V.currentPopupAction&&V.currentPopupAction.cancel(),V.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return h(e,this.auth,"internal-error"),e}async onExecution(){O(this.filter.length===1,"Popup operations only handle one event");const e=Nt();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(E(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(E(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,V.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if((r=(n=this.authWindow)==null?void 0:n.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(E(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Ea.get())};e()}}V.currentPopupAction=null;/**
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
 */const wa="pendingRedirect",Pe=new Map;class Aa extends vr{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Pe.get(this.auth._key());if(!e){try{const r=await Sa(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Pe.set(this.auth._key(),e)}return this.bypassAuthState||Pe.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Sa(t,e){const n=Ca(e),r=ka(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function Ta(t,e){Pe.set(t._key(),e)}function ka(t){return P(t._redirectPersistence)}function Ca(t){return Re(wa,t.config.apiKey,t.name)}async function Ra(t,e,n=!1){if(A(t.app))return Promise.reject(x(t));const r=je(t),i=Ir(r,e),o=await new Aa(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const Pa=600*1e3;class La{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Oa(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!wr(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";n.onError(E(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Pa&&this.cachedEventUids.clear(),this.cachedEventUids.has(hn(e))}saveEventToCache(e){this.cachedEventUids.add(hn(e)),this.lastProcessedEventTime=Date.now()}}function hn(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function wr({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Oa(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return wr(t);default:return!1}}/**
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
 */async function Da(t,e={}){return oe(t,"GET","/v1/projects",e)}/**
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
 */const Na=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ma=/^https?/;async function Fa(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Da(t);for(const n of e)try{if(Ba(n))return}catch{}T(t,"unauthorized-domain")}function Ba(t){const e=mt(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!Ma.test(n))return!1;if(Na.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const Ua=new ye(3e4,6e4);function fn(){const t=S().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function $a(t){return new Promise((e,n)=>{var i,s,o;function r(){fn(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{fn(),n(E(t,"network-request-failed"))},timeout:Ua.get()})}if((s=(i=S().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=S().gapi)!=null&&o.load)r();else{const a=jo("iframefcb");return S()[a]=()=>{gapi.load?r():n(E(t,"network-request-failed"))},xo(`${Wo()}?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw Le=null,e})}let Le=null;function Ha(t){return Le=Le||$a(t),Le}/**
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
 */const Va=new ye(5e3,15e3),xa="__/auth/iframe",Wa="emulator/auth/iframe",ja={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},za=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function qa(t){const e=t.config;h(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Ct(e,Wa):`https://${t.config.authDomain}/${xa}`,r={apiKey:e.apiKey,appName:t.name,v:_e},i=za.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${be(r).slice(1)}`}async function Ga(t){const e=await Ha(t),n=S().gapi;return h(n,t,"internal-error"),e.open({where:document.body,url:qa(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:ja,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=E(t,"network-request-failed"),a=S().setTimeout(()=>{s(o)},Va.get());function c(){S().clearTimeout(a),i(r)}r.ping(c).then(c,()=>{s(o)})}))}/**
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
 */const Ka={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Ja=500,Ya=600,Xa="_blank",Qa="http://localhost";class pn{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Za(t,e,n,r=Ja,i=Ya){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const c={...Ka,width:r.toString(),height:i.toString(),top:s,left:o},l=m().toLowerCase();n&&(a=tr(l)?Xa:n),Zn(l)&&(e=e||Qa,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[b,w])=>`${g}${b}=${w},`,"");if(No(l)&&a!=="_self")return ec(e||"",a),new pn(null);const f=window.open(e||"",a,d);h(f,t,"popup-blocked");try{f.focus()}catch{}return new pn(f)}function ec(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const tc="__/auth/handler",nc="emulator/auth/handler",rc=encodeURIComponent("fac");async function gn(t,e,n,r,i,s){h(t.config.authDomain,t,"auth-domain-config-required"),h(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:_e,eventId:i};if(e instanceof Dt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Qi(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,f]of Object.entries({}))o[d]=f}if(e instanceof Ie){const d=e.getScopes().filter(f=>f!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const c=await t._getAppCheckToken(),l=c?`#${rc}=${encodeURIComponent(c)}`:"";return`${ic(t)}?${be(a).slice(1)}${l}`}function ic({config:t}){return t.emulator?Ct(t,nc):`https://${t.authDomain}/${tc}`}/**
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
 */const at="webStorageSupport";class sc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=pr,this._completeRedirectFn=Ra,this._overrideRedirectResult=Ta}async _openPopup(e,n,r,i){var o;O((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await gn(e,n,r,mt(),i);return Za(e,s,Nt())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await gn(e,n,r,mt(),i);return la(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(O(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Ga(e),r=new La(e);return n.register("authEvent",i=>(h(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(at,{type:at},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[at];s!==void 0&&n(!!s),T(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Fa(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return or()||er()||Lt()}}const oc=sc;var mn="@firebase/auth",bn="1.13.3";/**
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
 */class ac{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){h(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function cc(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function lc(t){he(new re("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;h(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ar(t)},l=new Ho(r,i,s,c);return qo(l,n),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),he(new re("auth-internal",e=>{const n=je(e.getProvider("auth").getImmediate());return(r=>new ac(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Y(mn,bn,cc(t)),Y(mn,bn,"esm2020")}/**
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
 */const uc=300,dc=Un("authIdTokenMaxAge")||uc;let _n=null;const hc=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>dc)return;const i=n==null?void 0:n.token;_n!==i&&(_n=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function fc(t=to()){const e=xn(t,"auth");if(e.isInitialized())return e.getImmediate();const n=zo(t,{popupRedirectResolver:oc,persistence:[_a,oa,pr]}),r=Un("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=hc(s.toString());ta(n,o,()=>o(n.currentUser)),ea(n,a=>o(a))}}const i=Hi("auth");return i&&Go(n,`http://${i}`),n}function pc(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Vo({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=E("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",pc().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});lc("Browser");const gc=Wn(window.FIREBASE_CONFIG),Ge=fc(gc),mc=new C,bc=new k;let W=null,se=null;const _t=new Set,ge={get user(){return W},get profile(){return se},get loggedIn(){return!!W},onChange(t){return _t.add(t),t(W,se),()=>_t.delete(t)}};function Ar(){_t.forEach(t=>t(W,se))}async function Sr(){return W?W.getIdToken():null}async function Tr(t,e={}){const n=await Sr();return fetch(t,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...n?{Authorization:`Bearer ${n}`}:{}}})}async function _c(t){if(!t)return null;try{const e=await t.getIdToken(),n=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(n.ok)return await n.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:t.uid,display_name:t.displayName||"",email:t.email||"",photo_url:t.photoURL||""}}na(Ge,async t=>{W=t,se=t?await _c(t):null,Ar()});async function yc(){return(await Er(Ge,mc)).user}async function Ic(){return(await Er(Ge,bc)).user}async function yn(){await ra(Ge)}async function vc({display_name:t,photo_url:e}){const n={};t!==void 0&&(n.display_name=t),e!==void 0&&(n.photo_url=e);const r=await Tr(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(n)});if(!r.ok)throw new Error(await r.text());return se=await r.json(),Ar(),se}const{baseUrl:kr}=window.BOOK_CONFIG;function Ec(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function wc(){const t=document.getElementById("lib-dialog");t&&(t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),Ac())}function In(){const t=document.getElementById("lib-dialog");if(!t)return;t.classList.remove("open");const e=()=>t.classList.remove("is-visible");t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function Ac(){const t=document.getElementById("lib-loading");t.style.display="block",document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");try{const n=await Tr(`${kr}/api/user/library`);if(!n.ok)throw new Error("Not authenticated");const r=await n.json();Te("history",Sc(r.history)),Te("bookmarks",Tc(r.bookmarks)),Te("notes",kc(r.notes)),Te("comments",Cc(r.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}t.style.display="none";const e=document.querySelector(".lib-tab.is-active");Cr((e==null?void 0:e.dataset.tab)||"history")}function Te(t,e){document.getElementById(`lib-pane-${t}`).innerHTML=e}function Cr(t){document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");const e=document.getElementById(`lib-pane-${t}`);e&&(e.style.display="block")}function Ke(t){return t?new Date(t*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function Je(t,e){return`${kr}/book/${t}?para=${e}`}function Sc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${Je(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${q(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${Ke(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function Tc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${Je(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${Ke(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function kc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${Je(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${q(e.text)}</div>
      <div class="lib-card-date">${Ke(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function Cc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${Je(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${q(e.text)}</div>
      <div class="lib-card-date">${Ke(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function q(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Rc(){Ec(),document.addEventListener("click",t=>{const e=t.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),Cr(e.dataset.tab);return}if(t.target.closest("[data-close-lib]")){In();return}if(t.target.id==="lib-dialog"){In();return}})}function Pc(){var t;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
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
</div>`)}function Rr(t){const e=document.getElementById(t);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function xe(t){const e=document.getElementById(t);if(!e)return;e.classList.remove("open");const n=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",n,{once:!0}),setTimeout(n,300)}function Lc(){K(),Rr("auth-login-dialog")}function vn(){xe("auth-login-dialog")}function Oc(){K(),Lr(),Rr("auth-profile-dialog")}function Dc(){xe("auth-profile-dialog")}function Nc(){const t=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!t||!e)return;const n=e.getBoundingClientRect();t.style.top=`${n.bottom+6}px`,t.style.right=`${window.innerWidth-n.right}px`,t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open")))}function K(){const t=document.getElementById("auth-user-menu");if(!t)return;t.classList.remove("open");const e=()=>{t.classList.remove("is-visible")};t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function Mc(t){return(t||"?").trim().split(/\s+/).map(e=>{var n;return((n=e[0])==null?void 0:n.toUpperCase())||""}).join("").slice(0,2)||"?"}function Pr(t,e,n){n!=null&&n.photo_url?(t.src=n.photo_url,t.hidden=!1,e.hidden=!0):(t.hidden=!0,e.hidden=!1,e.textContent=Mc(n==null?void 0:n.display_name))}function Lr(){const t=ge.profile;t&&(document.getElementById("profile-hero-name").textContent=t.display_name||"",document.getElementById("profile-hero-email").textContent=t.email||"",document.getElementById("profile-input-name").value=t.display_name||"",document.getElementById("profile-input-photo").value=t.photo_url||"",Pr(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),t))}function Fc(t,e){const n=document.getElementById("auth-avatar-btn"),r=document.getElementById("auth-avatar-img"),i=document.getElementById("auth-avatar-initials");if(n)if(t&&e){n.classList.add("is-signed-in"),Pr(r,i,e);const s=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");s&&(s.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else n.classList.remove("is-signed-in"),r&&(r.hidden=!0),i&&(i.hidden=!1,i.textContent="👤")}function Bc(){document.addEventListener("click",async t=>{var r;const e=t.target;if(e.closest("#auth-avatar-btn")){if(t.stopPropagation(),ge.loggedIn){const i=document.getElementById("auth-user-menu");i!=null&&i.classList.contains("is-visible")?K():Nc()}else Lc();return}const n=(r=e.closest("[data-close]"))==null?void 0:r.dataset.close;if(n){xe(n);return}if(e.classList.contains("auth-backdrop")&&e.id){xe(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&K(),e.closest("#btn-google")){ke(!0);try{await yc(),vn()}catch(i){console.error("Google sign-in error:",i),En(i.code==="auth/popup-closed-by-user"||i.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${i.message||i.code||"unknown error"}`)}finally{ke(!1)}return}if(e.closest("#btn-facebook")){ke(!0);try{await Ic(),vn()}catch(i){console.error("Facebook sign-in error:",i),En(i.code==="auth/popup-closed-by-user"||i.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${i.message||i.code||"unknown error"}`)}finally{ke(!1)}return}if(e.closest("#btn-signout")){await yn(),Dc();return}if(e.closest("#auth-menu-library-btn")){K(),wc();return}if(e.closest("#auth-menu-profile-btn")){Oc();return}if(e.closest("#auth-menu-signout-btn")){K(),await yn();return}}),document.addEventListener("submit",async t=>{if(!t.target.closest("#auth-profile-form"))return;t.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),n=document.getElementById("profile-input-photo").value.trim(),r=document.getElementById("profile-status");r.textContent="Saving…",r.className="auth-status-msg";try{await vc({display_name:e,photo_url:n||void 0}),r.textContent="✓ Saved",r.classList.add("success"),Lr()}catch(i){console.error("Profile update error:",i),r.textContent="Failed to save.",r.classList.add("error")}})}function ke(t){["btn-google","btn-facebook"].forEach(e=>{const n=document.getElementById(e);n&&(n.disabled=t,n.classList.toggle("is-loading",t))})}function En(t){const e=document.getElementById("auth-login-error");e&&(e.textContent=t,e.style.display="block")}function Uc(){Pc(),Bc(),ge.onChange(Fc)}const{bookId:$c,baseUrl:wn,lang:An,bookref:Hc}=window.BOOK_CONFIG,ct=new WeakMap,Ye=document.getElementById("toc-sidebar"),Ft=document.getElementById("toc-overlay"),Or=document.getElementById("toc-list"),Vc=document.getElementById("toc-toggle-btn"),de=document.getElementById("toc-search"),xc=document.getElementById("settings-btn"),ee=document.getElementById("settings-modal"),Wc=document.getElementById("settings-form"),jc=document.getElementById("settings-cancel");function zc(){Ye.classList.add("open"),Ft.classList.add("show")}function Bt(){Ye.classList.remove("open"),Ft.classList.remove("show")}Vc.addEventListener("click",()=>Ye.classList.contains("open")?Bt():zc());Ft.addEventListener("click",Bt);Sn(de,{mode:"both",onConvert:t=>{const e=t.trim();de.value=e,de.dispatchEvent(new Event("input"))}});function Dr(t){return t?Ur(t).toLowerCase():""}const yt=Or.querySelectorAll(".toc-item"),qc=Array.from(yt).map(t=>Dr(t.textContent));de.addEventListener("input",()=>{const t=de.value,e=Dr(t);if(!e){yt.forEach(n=>{n.closest("li").style.display=""});return}yt.forEach((n,r)=>{const i=qc[r].includes(e);n.closest("li").style.display=i?"":"none"})});Or.querySelectorAll(".toc-item").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.dataset.paraId);window.innerWidth<960&&Bt();const n=document.querySelector(`.section-block[data-para-id="${e}"]`),r=n==null?void 0:n.querySelector(".section-heading-link");r!=null&&r.href&&(window.location.href=r.href)}),t.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t.click())})});const Gc=new IntersectionObserver(t=>{for(const e of t){if(!e.isIntersecting)continue;const n=parseInt(e.target.dataset.paraId);Yc(n)}},{rootMargin:"-52px 0px -67% 0px"});document.querySelectorAll(".section-block").forEach(t=>Gc.observe(t));const It=window.REF_LINKS||{};console.debug("[REF_LINKS] loaded:",Object.keys(It).length,"keys",It);const Oe=Object.keys(It).map(Number).sort((t,e)=>t-e);console.debug("[REF_LINKS] sorted para_ids:",Oe);function Kc(t){let e=0,n=Oe.length-1,r=-1;for(;e<=n;){const i=e+n>>>1;Oe[i]<=t?(r=Oe[i],e=i+1):n=i-1}return r}const Nr=new IntersectionObserver(t=>{let e=1/0;for(const n of t){if(!n.isIntersecting)continue;const r=n.target.id,i=r&&r.match(/^p-(\d+)-l-\d+$/);if(i){const s=parseInt(i[1]);s<e&&(e=s)}}if(e<1/0){const n=Kc(e);console.debug("[sentinel] visible sentence para_id:",e,"→ nearest ref:",n),n>0&&Qc(n)}},{rootMargin:"0px 0px -10% 0px"});function Jc(){document.querySelectorAll(".section-content.open .sentence-row").forEach(t=>Nr.observe(t))}Jc();function Yc(t){document.querySelectorAll("#toc-list .toc-item").forEach(e=>{const n=parseInt(e.dataset.paraId)===t;e.classList.toggle("active",n),n&&Ye.classList.contains("open")&&e.scrollIntoView({block:"nearest"})})}function Mr(t){document.querySelectorAll(".pali-text").forEach(e=>{ct.has(e)||ct.set(e,e.innerHTML);const n=ct.get(e);e.innerHTML=t===u.RO?n:Xc(n,t)})}function Xc(t,e){return t.replace(/(<[^>]+>)|([^<]+)/g,(n,r,i)=>r||De.convert(De.convertFromMixed(i),e))}function Qc(t){const e=["mula_ref","attha_ref","tika_ref"],n={mula_ref:"ref-mula",attha_ref:"ref-attha",tika_ref:"ref-tika"},i=(window.REF_LINKS||{})[t];if(i)for(const s of e){const o=i[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);if(c){const l=o[a],d=[An,"book",l.book_id,l.slug].filter(Boolean).join("/");c.href=wn+"/"+d+"#"+l.para_id}}}else for(const s of e){const o=Hc[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);c&&(c.href=`${wn}/${An}/book_ref/${o[a].book_id}?ref=${$c}&para_id=${t}`)}}}xc.addEventListener("click",()=>{const t=We();mi(t),Rn(document.getElementById("pali-script-select"),t.paliScript),ee.classList.add("show")});jc.addEventListener("click",()=>ee.classList.remove("show"));ee.addEventListener("click",t=>{t.target===ee&&ee.classList.remove("show")});Wc.addEventListener("submit",t=>{t.preventDefault();const e=bi();pi(e),Cn(e),Mr(e.paliScript),ee.classList.remove("show")});function Zc(){if(!window.BOOK_CONFIG)return;const{baseUrl:t,bookId:e}=window.BOOK_CONFIG;let n=null,r=null,i=null;function s(a){r=a,ge.loggedIn&&a!==n&&(n=a,clearTimeout(i),i=setTimeout(async()=>{var b,w;const c=document.querySelector(`.section-block[data-para-id="${a}"]`),l=c==null?void 0:c.querySelector(".section-heading-text"),d=((b=l==null?void 0:l.textContent)==null?void 0:b.trim())||"",f=document.querySelector(".book-title"),g=((w=f==null?void 0:f.textContent)==null?void 0:w.trim())||"";try{const ae=await Sr();if(!ae)return;fetch(`${t}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ae}`},body:JSON.stringify({para_id:a,section_title:d,book_title:g})})}catch{}},5e3))}const o=new IntersectionObserver(a=>{for(const c of a){if(!c.isIntersecting)continue;const l=parseInt(c.target.dataset.paraId);isNaN(l)||s(l)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(a=>o.observe(a)),ge.onChange(a=>{a&&r!==null&&s(r)})}document.addEventListener("DOMContentLoaded",async()=>{yi(document.getElementById("main-content"));const t=We();Cn(t),Mr(t.paliScript),Rn(document.getElementById("pali-script-select"),t.paliScript),Uc(),Rc(),Zc();function e(o){const a=document.querySelectorAll(".section-block");let c=null;for(const l of a){const d=parseInt(l.dataset.paraId);!isNaN(d)&&d<=o&&(c=l)}return c}function n(o){const a=document.querySelectorAll('[id^="p-'+o+'-l-"]');for(const c of a){const l=c.id.match(/^p-(\d+)-l-(\d+)$/);if(l&&parseInt(l[1])===o)return c}return null}function r(o){if(!o)return;const a=o.querySelector(".section-content");a&&!a.classList.contains("open")&&(a.classList.add("open"),a.setAttribute("aria-hidden","false"),a.querySelectorAll(".sentence-row").forEach(c=>Nr.observe(c)))}function i(o){setTimeout(()=>{o.scrollIntoView({behavior:"smooth",block:"center"}),o.classList.add("highlight-flash")},200)}const s=window.location.hash.replace(/^#/,"");if(s){const o=s.split("-"),a=parseInt(o[0]),c=o.length>=2?parseInt(o[1]):NaN;if(!isNaN(a))if(isNaN(c)){let l=n(a);if(!l){const d=e(a);r(d),l=n(a)}if(l)i(l);else{const d=e(a);d&&i(d)}}else{const l="p-"+a+"-l-"+c;let d=document.getElementById(l);if(!d){const f=e(a);r(f),d=document.getElementById(l)}if(d)i(d);else{const f=e(a);f&&i(f)}}}else if(window.BOOK_CONFIG.paraId){const o=e(window.BOOK_CONFIG.paraId);o&&setTimeout(()=>{o.scrollIntoView({behavior:"smooth",block:"start"})},200)}});

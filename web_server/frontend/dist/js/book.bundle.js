import{i as Xn,S as _r,H as K,b as vr,r as Ge,a as Ir}from"./home-dialog-search.chunk.js";const u=Object.freeze({SI:"si",HI:"hi",RO:"ro",THAI:"th",LAOS:"lo",MY:"my",KM:"km",BENG:"be",ASSE:"as",GURM:"gm",THAM:"tt",GUJA:"gj",TELU:"te",KANN:"ka",MALA:"mm",BRAH:"br",TIBT:"tb",CYRL:"cy"}),Qn=new Map([[u.SI,["Sinhala","සිංහල",[[3456,3583]],{f:"sl_flag.png"}]],[u.HI,["Devanagari","देवनागरी",[[2304,2431]],{f:"in_flag.png"}]],[u.RO,["Roman","Roman",[[0,383],[7680,7935]],{f:"uk_flag.png"}]],[u.THAI,["Thai","ไทย",[[3584,3711],63247,63232],{f:"th_flag.png"}]],[u.LAOS,["Laos","ລາວ",[[3712,3839]],{f:"laos_flag.png"}]],[u.MY,["Myanmar","ဗမာစာ",[[4096,4223]],{f:"my_flag.png"}]],[u.KM,["Khmer","ភាសាខ្មែរ",[[6016,6143]],{f:"kh_flag.png"}]],[u.BENG,["Bengali","বাংলা",[[2432,2559]],{f:"bangla_flag.png",g:"indian"}]],[u.ASSE,["Assamese","অসমীয়া",[],{f:"bangla_flag.png",g:"indian"}]],[u.GURM,["Gurmukhi","ਗੁਰਮੁਖੀ",[[2560,2687]],{g:"indian"}]],[u.GUJA,["Gujarati","ગુજરાતી",[[2688,2815]],{g:"indian"}]],[u.TELU,["Telugu","తెలుగు",[[3072,3199]],{g:"indian"}]],[u.KANN,["Kannada","ಕನ್ನಡ",[[3200,3327]],{g:"indian"}]],[u.MALA,["Malayalam","മലയാളം",[[3328,3455]],{g:"indian"}]],[u.THAM,["Tai Tham","Tai Tham LN",[[6688,6831]],{c:"beta-script",g:"other"}]],[u.BRAH,["Brahmi","Brāhmī",[[55300,55300],[56320,56447]],{g:"other"}]],[u.TIBT,["Tibetan","བོད་སྐད།",[[3840,4095]],{f:"tibet_flag.png",c:"larger",g:"other"}]],[u.CYRL,["Cyrillic","кириллица",[[1024,1279],[768,879]],{f:"russia_flag.png",g:"other"}]]]);function Er(t){for(let e of Qn)for(let n of e[1][2])if(Array.isArray(n)&&t>=n[0]&&t<=n[1]||Number.isInteger(n)&&t==n)return e[0];return-1}const ce={[u.SI]:0,[u.HI]:1,[u.RO]:2,[u.THAI]:3,[u.LAOS]:4,[u.MY]:5,[u.KM]:6,[u.BENG]:7,[u.ASSE]:7,[u.GURM]:8,[u.THAM]:9,[u.GUJA]:10,[u.TELU]:11,[u.KANN]:12,[u.MALA]:13,[u.BRAH]:14,[u.TIBT]:15,[u.CYRL]:16},wr=[["අ","अ","a","อ","ອ","အ","អ","অ","ਅ","ᩋ","અ","అ","ಅ","അ","𑀅","ཨ","а"],["ආ","आ","ā","อา","ອາ","အာ","អា","আ","ਆ","ᩌ","આ","ఆ","ಆ","ആ","𑀆","ཨཱ","а̄"],["ඉ","इ","i","อิ","ອິ","ဣ","ឥ","ই","ਇ","ᩍ","ઇ","ఇ","ಇ","ഇ","𑀇","ཨི","и"],["ඊ","ई","ī","อี","ອີ","ဤ","ឦ","ঈ","ਈ","ᩎ","ઈ","ఈ","ಈ","ഈ","𑀈","ཨཱི","ӣ"],["උ","उ","u","อุ","ອຸ","ဥ","ឧ","উ","ਉ","ᩏ","ઉ","ఉ","ಉ","ഉ","𑀉","ཨུ","у"],["ඌ","ऊ","ū","อู","ອູ","ဦ","ឩ","ঊ","ਊ","ᩐ","ઊ","ఊ","ಊ","ഊ","𑀊","ཨཱུ","ӯ"],["එ","ए","e","อเ","ອເ","ဧ","ឯ","এ","ਏ","ᩑ","એ","ఏ","ಏ","ഏ","𑀏","ཨེ","е"],["ඔ","ओ","o","อโ","ອໂ","ဩ","ឱ","ও","ਓ","ᩒ","ઓ","ఓ","ಓ","ഓ","𑀑","ཨོ","о"],["ං","ं","ṃ","ํ","ໍ","ံ","ំ","ং","ਂ","ᩴ","ં","ం","ಂ","ം","𑀁","ཾ","м̣"],["ඃ","ः","ḥ","ะ","ະ","း","ះ","ঃ","ਃ","ᩡ","ઃ","ః","ಃ","ഃ","𑀂","ཿ","х̣"],["්","्","","ฺ","຺","္","្","্","੍","᩠","્","్","್","്","𑁆","྄",""],["0","०","0","๐","໐","၀","០","০","੦","᪐","૦","౦","೦","൦","𑁦","༠","0"],["1","१","1","๑","໑","၁","១","১","੧","᪑","૧","౧","೧","൧","𑁧","༡","1"],["2","२","2","๒","໒","၂","២","২","੨","᪒","૨","౨","೨","൨","𑁨","༢","2"],["3","३","3","๓","໓","၃","៣","৩","੩","᪓","૩","౩","೩","൩","𑁩","༣","3"],["4","४","4","๔","໔","၄","៤","৪","੪","᪔","૪","౪","೪","൪","𑁪","༤","4"],["5","५","5","๕","໕","၅","៥","৫","੫","᪕","૫","౫","೫","൫","𑁫","༥","5"],["6","६","6","๖","໖","၆","៦","৬","੬","᪖","૬","౬","೬","൬","𑁬","༦","6"],["7","७","7","๗","໗","၇","៧","৭","੭","᪗","૭","౭","೭","൭","𑁭","༧","7"],["8","८","8","๘","໘","၈","៨","৮","੮","᪘","૮","౮","೮","൮","𑁮","༨","8"],["9","९","9","๙","໙","၉","៩","৯","੯","᪙","૯","౯","೯","൯","𑁯","༩","9"],["ඓ","ऐ","ai"],["ඖ","औ","au"],["ඍ","ऋ","ṛ"],["ඎ","ॠ","ṝ"],["ඏ","ऌ","l̥"],["ඐ","ॡ","ḹ"]],Sr=[["ක","क","k","ก","ກ","က","ក","ক","ਕ","ᨠ","ક","క","ಕ","ക","𑀓","ཀ","к"],["ඛ","ख","kh","ข","ຂ","ခ","ខ","খ","ਖ","ᨡ","ખ","ఖ","ಖ","ഖ","𑀔","ཁ","кх"],["ග","ग","g","ค","ຄ","ဂ","គ","গ","ਗ","ᨣ","ગ","గ","ಗ","ഗ","𑀕","ག","г"],["ඝ","घ","gh","ฆ","ຆ","ဃ","ឃ","ঘ","ਘ","ᨥ","ઘ","ఘ","ಘ","ഘ","𑀖","གྷ","гх"],["ඞ","ङ","ṅ","ง","ງ","င","ង","ঙ","ਙ","ᨦ","ઙ","ఙ","ಙ","ങ","𑀗","ང","н̇"],["ච","च","c","จ","ຈ","စ","ច","চ","ਚ","ᨧ","ચ","చ","ಚ","ച","𑀘","ཙ","ч"],["ඡ","छ","ch","ฉ","ຉ","ဆ","ឆ","ছ","ਛ","ᨨ","છ","ఛ","ಛ","ഛ","𑀙","ཚ","чх"],["ජ","ज","j","ช","ຊ","ဇ","ជ","জ","ਜ","ᨩ","જ","జ","ಜ","ജ","𑀚","ཛ","дж"],["ඣ","झ","jh","ฌ","ຌ","ဈ","ឈ","ঝ","ਝ","ᨫ","ઝ","ఝ","ಝ","ഝ","𑀛","ཛྷ","джх"],["ඤ","ञ","ñ","ญ","ຎ","ဉ","ញ","ঞ","ਞ","ᨬ","ઞ","ఞ","ಞ","ഞ","𑀜","ཉ","н̃"],["ට","ट","ṭ","ฏ","ຏ","ဋ","ដ","ট","ਟ","ᨭ","ટ","ట","ಟ","ട","𑀝","ཊ","т̣"],["ඨ","ठ","ṭh","ฐ","ຐ","ဌ","ឋ","ঠ","ਠ","ᨮ","ઠ","ఠ","ಠ","ഠ","𑀞","ཋ","т̣х"],["ඩ","ड","ḍ","ฑ","ຑ","ဍ","ឌ","ড","ਡ","ᨯ","ડ","డ","ಡ","ഡ","𑀟","ཌ","д̣"],["ඪ","ढ","ḍh","ฒ","ຒ","ဎ","ឍ","ঢ","ਢ","ᨰ","ઢ","ఢ","ಢ","ഢ","𑀠","ཌྷ","д̣х"],["ණ","ण","ṇ","ณ","ຓ","ဏ","ណ","ণ","ਣ","ᨱ","ણ","ణ","ಣ","ണ","𑀡","ཎ","н̣"],["ත","त","t","ต","ຕ","တ","ត","ত","ਤ","ᨲ","ત","త","ತ","ത","𑀢","ཏ","т"],["ථ","थ","th","ถ","ຖ","ထ","ថ","থ","ਥ","ᨳ","થ","థ","ಥ","ഥ","𑀣","ཐ","тх"],["ද","द","d","ท","ທ","ဒ","ទ","দ","ਦ","ᨴ","દ","ద","ದ","ദ","𑀤","ད","д"],["ධ","ध","dh","ธ","ຘ","ဓ","ធ","ধ","ਧ","ᨵ","ધ","ధ","ಧ","ധ","𑀥","དྷ","дх"],["න","न","n","น","ນ","န","ន","ন","ਨ","ᨶ","ન","న","ನ","ന","𑀦","ན","н"],["ප","प","p","ป","ປ","ပ","ប","প","ਪ","ᨸ","પ","ప","ಪ","പ","𑀧","པ","п"],["ඵ","फ","ph","ผ","ຜ","ဖ","ផ","ফ","ਫ","ᨹ","ફ","ఫ","ಫ","ഫ","𑀨","ཕ","пх"],["බ","ब","b","พ","ພ","ဗ","ព","ব","ਬ","ᨻ","બ","బ","ಬ","ബ","𑀩","བ","б"],["භ","भ","bh","ภ","ຠ","ဘ","ភ","ভ","ਭ","ᨽ","ભ","భ","ಭ","ഭ","𑀪","བྷ","бх"],["ම","म","m","ม","ມ","မ","ម","ম","ਮ","ᨾ","મ","మ","ಮ","മ","𑀫","མ","м"],["ය","य","y","ย","ຍ","ယ","យ","য","ਯ","ᨿ","ય","య","ಯ","യ","𑀬","ཡ","й"],["ර","र","r","ร","ຣ","ရ","រ","র","ਰ","ᩁ","ર","ర","ರ","ര","𑀭","ར","р"],["ල","ल","l","ล","ລ","လ","ល","ল","ਲ","ᩃ","લ","ల","ಲ","ല","𑀮","ལ","л"],["ළ","ळ","ḷ","ฬ","ຬ","ဠ","ឡ","ল়","ਲ਼","ᩊ","ળ","ళ","ಳ","ള","𑀴","ལ༹","л̣"],["ව","व","v","ว","ວ","ဝ","វ","ৰ","ਵ","ᩅ","વ","వ","ವ","വ","𑀯","ཝ","в"],["ස","स","s","ส","ສ","သ","ស","স","ਸ","ᩈ","સ","స","ಸ","സ","𑀲","ས","с"],["හ","ह","h","ห","ຫ","ဟ","ហ","হ","ਹ","ᩉ","હ","హ","ಹ","ഹ","𑀳","ཧ","х"],["ශ","श","ś"],["ෂ","ष","ş"]],Ar=[["ා","ा","ā","า","າ","ာ","ា","া","ਾ","ᩣ","ા","ా","ಾ","ാ","𑀸","ཱ","а̄"],["ි","ि","i","ิ","ິ","ိ","ិ","ি","ਿ","ᩥ","િ","ి","ಿ","ി","𑀺","ི","и"],["ී","ी","ī","ี","ີ","ီ","ី","ী","ੀ","ᩦ","ી","ీ","ೀ","ീ","𑀻","ཱི","ӣ"],["ු","ु","u","ุ","ຸ","ု","ុ","ু","ੁ","ᩩ","ુ","ు","ು","ു","𑀼","ུ","у"],["ූ","ू","ū","ู","ູ","ူ","ូ","ূ","ੂ","ᩪ","ૂ","ూ","ೂ","ൂ","𑀽","ཱུ","ӯ"],["ෙ","े","e","เ","ເ","ေ","េ","ে","ੇ","ᩮ","ે","ే","ೇ","േ","𑁂","ེ","е"],["ො","ो","o","โ","ໂ","ော","ោ","ো","ੋ","ᩮᩣ","ો","ో","ೋ","ോ","𑁄","ོ","о"],["ෛ","ै","ai"],["ෞ","ौ","au"],["ෘ","ृ","ṛ"],["ෲ","ॄ","ṝ"],["ෟ","ॢ","l̥"],["ෳ","ॣ","ḹ"]];function kr(t,e,n=""){return t.replace(/\u0DCA([\u0DBA\u0DBB])/g,"්‍$1")}function Tr(t){return t=t.replace(/ඒ/g,"එ").replace(/ඕ/g,"ඔ"),t.replace(/ේ/g,"ෙ").replace(/ෝ/g,"ො")}function Cr(t,e,n=""){return t=t.replace(/[,;]/g,"၊"),t=t.replace(/[\u2026\u0964\u0965]+/g,"။"),t=t.replace(/ဉ\u1039ဉ/g,"ည"),t=t.replace(/သ\u1039သ/g,"ဿ"),t=t.replace(/င္([က-ဠ])/g,"င်္$1"),t=t.replace(/္ယ/g,"ျ"),t=t.replace(/္ရ/g,"ြ"),t=t.replace(/္ဝ/g,"ွ"),t=t.replace(/္ဟ/g,"ှ"),t=t.replace(/([ခဂငဒပဝ]ေ?)\u102c/g,"$1ါ"),t=t.replace(/(က္ခ|န္ဒ|ပ္ပ|မ္ပ)(ေ?)\u102b/g,"$1$2ာ"),t.replace(/(ဒ္ဓ|ဒွ)(ေ?)\u102c/g,"$1$2ါ")}function Lr(t){return t=t.replace(/\u102B/g,"ာ"),t=t.replace(/ှ/g,"္ဟ"),t=t.replace(/ွ/g,"္ဝ"),t=t.replace(/ြ/g,"္ရ"),t=t.replace(/ျ/g,"္ယ"),t=t.replace(/\u103A/g,""),t=t.replace(/ဿ/g,"သ္သ"),t=t.replace(/ည/g,"ဉ္ဉ"),t=t.replace(/သံဃ/g,"သင္ဃ"),t=t.replace(/၊/g,","),t.replace(/။/g,".")}function I(t,e,n=""){return n=="cen"?t=t.replace(/॥/g,""):n.startsWith("ga")&&(t=t.replace(/।/g,";"),t=t.replace(/॥/g,".")),t=t.replace(/॰…/g,"…"),t=t.replace(/॰/g,"·"),t=t.replace(/[।॥]/g,"."),t=t.replace(/\s([\s,!;\?\.])/g,"$1"),t}function Pr(t,e,n=""){return t=t.replace(/^((?:<w>)?\S)/g,(i,r)=>r.toUpperCase()),t=t.replace(/([\.\?]\s(?:<w>)?)(\S)/g,(i,r,s)=>`${r}${s.toUpperCase()}`),t.replace(/([\u201C‘](?:<w>)?)(\S)/g,(i,r,s)=>`${r}${s.toUpperCase()}`)}const Rr=t=>t.toLowerCase();function rn(t,e,n=""){if(e==u.THAI)return t.replace(/([ก-ฮ])([เโ])/g,"$2$1");if(e==u.LAOS)return t.replace(/([ກ-ຮ])([ເໂ])/g,"$2$1");throw new Error(`Unsupported script ${e} for swap_e_o method.`)}function sn(t,e){if(e==u.THAI)return t.replace(/([เโ])([ก-ฮ])/g,"$2$1");if(e==u.LAOS)return t.replace(/([ເໂ])([ກ-ຮ])/g,"$2$1");throw new Error(`Unsupported script ${e} for un_swap_e_o method.`)}function Or(t,e){return t=t.replace(/\u0E34\u0E4D/g,"ึ"),t=t.replace(/ญ/g,""),t.replace(/ฐ/g,"")}function Nr(t,e){return t=t.replace(/ฎ/g,"ฏ"),t=t.replace(/\u0E36/g,"ิํ"),t=t.replace(/\uF70F/g,"ญ"),t.replace(/\uF700/g,"ฐ")}function Dr(t,e){return t=t.replace(/\u17B9/g,"ិំ"),t.replace(/\u17D1/g,"្")}function wt(t){return t.replace(/\u200C|\u200D/g,"")}function Mr(t){return t=t.replace(/।/g,"𑁇"),t=t.replace(/॥/g,"𑁈"),t.replace(/–/g,"𑁋")}function Fr(t){return t=t.replace(/\u1A60\u1A41/g,"ᩕ"),t=t.replace(/\u1A48\u1A60\u1A48/g,"ᩔ"),t=t.replace(/।/g,"᪨"),t.replace(/॥/g,"᪩")}function Br(t){t=t.replace(/।/g,"།"),t=t.replace(/॥/g,"༎");for(let e=0;e<=39;e++)t=t.replace(new RegExp(String.fromCharCode(3972,3904+e),"g"),String.fromCharCode(3984+e));return t=t.replace(/\u0F61\u0FB1/g,"ཡྻ"),t=t.replace(/\u0F5D\u0FAD/g,"ཝྺ"),t=t.replace(/\u0F5B\u0FAC/g,"ཛ྄ཛྷ"),t=t.replace(/\u0F61\u0FB7/g,"ཡ྄ཧ"),t.replace(/\u0F5D\u0FB7/g,"ཝ྄ཧ")}function $r(t){return t}function Ur(t){return t=t.replace(/ৰ/g,"ৱ"),t=t.replace(/র/g,"ৰ"),t=t.replace(/ল়/g,"ড়"),t}const Hr=[],xr={[u.SI]:[kr,I],[u.RO]:[I,Pr],[u.THAI]:[rn,Or,I],[u.LAOS]:[rn,I],[u.MY]:[Cr,I],[u.KM]:[I],[u.THAM]:[Fr],[u.GUJA]:[I],[u.TELU]:[I],[u.MALA]:[I],[u.BRAH]:[Mr,I],[u.TIBT]:[Br],[u.CYRL]:[I],[u.ASSE]:[Ur]},Vr=[],jr={[u.SI]:[wt,Tr],[u.HI]:[wt],[u.RO]:[Rr],[u.THAI]:[Nr,sn],[u.LAOS]:[sn],[u.KM]:[Dr],[u.MY]:[Lr],[u.TIBT]:[$r]};function $t(t,e,n=!0){let i=Sr.concat(wr,n?Ar:[]),r=[[],[],[]];return i.forEach(s=>{s[t]&&r[s[t].length-1].push([s[t],s[e]])}),r.filter(s=>s.length).map(s=>[s[0][0].length,new Map(s)]).reverse()}function Ut(t,e){let n=new Array,i=0;for(;i<t.length;){let r=!1;for(let[s,o]of e){const a=t.substr(i,s);if(o.has(a)){n.push(o.get(a)),r=!0,i+=s;break}}r||(n.push(t.charAt(i)),i++)}return n.join("")}function on(t,e){const n=e==u.CYRL?"а":"a";return t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t.replace(/([ක-ෆ])$/g,`$1${n}`)}const Wr={අ:"",ආ:"ා",ඉ:"ි",ඊ:"ී",උ:"ු",ඌ:"ූ",එ:"ෙ",ඔ:"ො"};function an(t,e){return t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])$/g,"$1්"),t=t.replace(/([ක-ෆ])([අආඉඊඋඌඑඔ])/g,(n,i,r)=>i+Wr[r]),t}const qr=t=>t.replace(/ṁ/g,"ං"),zr=[St],Gr={[u.SI]:[],[u.RO]:[on,St],[u.CYRL]:[on,St]},Kr=[Yr],Jr={[u.SI]:[],[u.RO]:[cn,qr,an],[u.CYRL]:[cn,an]};function St(t,e){const n=$t(ce[u.SI],ce[e]);return Ut(t,n)}function Yr(t,e){const n=$t(ce[e],ce[u.SI]);return Ut(t,n)}function cn(t,e){const n=$t(ce[e],ce[u.SI],!1);return Ut(t,n)}class Ke{static basicConvert(e,n){return(Gr[n]||zr).forEach(i=>e=i(e,n)),e}static basicConvertFrom(e,n){return(Jr[n]||Kr).forEach(i=>e=i(e,n)),e}static beautify(e,n,i=""){return(xr[n]||Hr).forEach(r=>e=r(e,n,i)),e}static convert(e,n){return e=this.basicConvert(e,n),this.beautify(e,n)}static convertFrom(e,n){return(jr[n]||Vr).forEach(i=>e=i(e,n)),this.basicConvertFrom(e,n)}static convertFromMixed(e){e=wt(e)+" ";let n=-1,i="",r="";for(let s=0;s<e.length;s++){const o=Er(e.charCodeAt(s));o!=n||s==e.length-1?(r+=this.convertFrom(i,n),n=o,i=e.charAt(s)):i+=e.charAt(s)}return r}}const Zn="epitaka_settings_v3";function ln(){return{pali:!0,translation:!0,layout:"stacked",paliScript:u.RO,paliColor:"#7c2d12",transColor:"#1e3a5f",bgColor:"#faf7f2",actionButtons:"line",fontSize:16,actionCollapse:!1,load_attha:!0}}function rt(){try{return{...ln(),...JSON.parse(localStorage.getItem(Zn)||"{}")}}catch{return ln()}}function Xr(t){localStorage.setItem(Zn,JSON.stringify(t))}function ei(t){const e=document.documentElement;e.style.setProperty("--pali-color",t.paliColor),e.style.setProperty("--trans-color",t.transColor),e.style.setProperty("--bg",t.bgColor),document.body.style.backgroundColor=t.bgColor;const n=Math.min(Math.max(parseInt(t.fontSize)||16,10),32);e.style.setProperty("--reader-font-size",`${n}px`),e.style.setProperty("font-size",`${n}px`),document.querySelector("body").setAttribute("script",t.paliScript),document.body.setAttribute("data-ra-mode",t.actionButtons||"line"),document.body.setAttribute("data-ra-collapse",t.actionCollapse?"true":"false");const i=[t.pali,t.translation].filter(Boolean).length;document.body.setAttribute("data-flow",i<=1?"true":"false"),document.querySelectorAll(".pali-text").forEach(r=>r.style.display=t.pali?"":"none"),document.querySelectorAll(".translation-text").forEach(r=>r.style.display=t.translation?"":"none"),Qr(t)}function Qr(t){const e=t.pali&&t.translation;document.querySelectorAll(".sentence-row").forEach(n=>{t.layout==="sidebyside"&&e?n.classList.add("side-by-side"):n.classList.remove("side-by-side")})}function Me(t,e){const n=document.getElementById(t);n&&(n.checked=!!e)}function Fe(t,e){const n=document.getElementById(t);return n?n.checked:e??!1}function ht(t,e){const n=document.getElementById(t);n&&(n.value=e)}function ft(t){const e=document.getElementById(t);return e?e.value:""}function Zr(t){Me("cb-pali",t.pali),Me("cb-translation",t.translation);const e=document.querySelector(`input[name="layout"][value="${t.layout}"]`);e&&(e.checked=!0);const n=document.querySelector(`input[name="action-mode"][value="${t.actionButtons||"line"}"]`);n&&(n.checked=!0),ht("color-pali",t.paliColor),ht("color-trans",t.transColor),ht("color-bg",t.bgColor);const i=document.getElementById("pali-script-select");i&&(i.value=t.paliScript);const r=document.getElementById("range-font-size");r&&(r.value=t.fontSize||16,ts(r.value)),Me("cb-action-collapse",!!t.actionCollapse),Me("cb-load-attha",t.load_attha??!0)}function es(){var t,e,n,i;return{pali:Fe("cb-pali"),translation:Fe("cb-translation"),layout:((t=document.querySelector('input[name="layout"]:checked'))==null?void 0:t.value)||"stacked",actionButtons:((e=document.querySelector('input[name="action-mode"]:checked'))==null?void 0:e.value)||"line",paliScript:((n=document.getElementById("pali-script-select"))==null?void 0:n.value)||u.RO,paliColor:ft("color-pali"),transColor:ft("color-trans"),bgColor:ft("color-bg"),fontSize:parseInt((i=document.getElementById("range-font-size"))==null?void 0:i.value)||16,actionCollapse:Fe("cb-action-collapse"),load_attha:Fe("cb-load-attha",!0)}}function ts(t){const e=document.getElementById("font-size-label");e&&(e.textContent=`${t}px`)}function ti(t,e){t.innerHTML="";for(const[n,i]of Qn){const r=document.createElement("option");r.value=n,r.textContent=`${i[0]} — ${i[1]}`,n===e&&(r.selected=!0),t.appendChild(r)}}const{bookId:uu,baseUrl:ni,bookref:du}=window.BOOK_CONFIG;console.log(window.BOOK_CONFIG);const J=document.getElementById("dict-word-input"),te=document.getElementById("dict-suggestions"),Ee=document.getElementById("dict-panel"),un=document.getElementById("dict-close"),g=document.getElementById("dict-pin");document.getElementById("dict-word");const ve=document.getElementById("dict-results");let Be=null,v=-1;const At="epitaka_dict_pinned";function le(){try{return localStorage.getItem(At)==="1"}catch{return!1}}function ii(){const t=le();g==null||g.classList.toggle("active",t),g==null||g.setAttribute("aria-pressed",String(t)),g==null||g.setAttribute("aria-label",t?"Unpin dictionary":"Pin dictionary open"),g==null||g.setAttribute("title",t?"Unpin dictionary":"Keep dictionary open")}function Y(t){Ee&&(Ee.classList.toggle("open",t),document.body.classList.toggle("dict-pinned",t&&le()))}function ns(t){t.querySelectorAll(".sentence-row .pali-text").forEach(e=>{e.addEventListener("click",is)})}function is(t){const e=window.getSelection();if(e&&e.toString().trim())return;const n=ds(t);if(!n)return;const i=rt();let r=n;if(i.paliScript!==u.RO){const s=Ke.convertFrom(n,i.paliScript);r=Ke.convert(s,u.RO)}r=r.trim().replace(/[.,;:!?()[\]{}'"]/g,"").toLowerCase(),r&&rs(r)}function rs(t){J.value=t,Z(),Y(!0),ri(t)}async function ri(t){if(t){ve.innerHTML='<div class="dict-loading">Looking up…</div>';try{const n=await(await fetch(`${ni}/api/dictionary?word=${encodeURIComponent(t)}`)).json();as(n)}catch{ve.innerHTML='<div class="dict-error">Lookup failed.</div>'}}}Xn(J,{mode:"both"});J.addEventListener("input",()=>{const t=J.value.trim();if(v=-1,!t){Z();return}ss(t)});J.addEventListener("keydown",t=>{const e=te.querySelectorAll(".dict-suggestion-item");t.key==="ArrowDown"?(t.preventDefault(),v=Math.min(v+1,e.length-1),dn(e)):t.key==="ArrowUp"?(t.preventDefault(),v=Math.max(v-1,-1),dn(e)):t.key==="Enter"?(t.preventDefault(),v>=0&&e[v]?Je(e[v].dataset.word):Je(J.value.trim())):t.key==="Escape"&&Z()});document.addEventListener("click",t=>{t.target.closest("#dict-word-wrapper")||Z()});async function ss(t){Be&&Be.abort(),Be=new AbortController;try{const n=await(await fetch(`${ni}/api/suggest_word?q=${encodeURIComponent(t)}`,{signal:Be.signal})).json();os(n)}catch(e){e.name!=="AbortError"&&Z()}}function os(t){if(!(t!=null&&t.length)){Z();return}te.innerHTML=t.map(e=>`
    <li class="dict-suggestion-item" 
        role="option" 
        data-word="${e}"
        tabindex="-1">
      <span class="suggest-word pali-text">${e}</span>
    </li>
  `).join(""),te.querySelectorAll(".dict-suggestion-item").forEach(e=>{e.addEventListener("mousedown",n=>{n.preventDefault(),Je(e.dataset.word)})}),te.classList.add("open")}function dn(t){var e;t.forEach((n,i)=>n.classList.toggle("active",i===v)),v>=0&&((e=t[v])==null||e.scrollIntoView({block:"nearest"}))}function Je(t){t&&(J.value=t,Z(),ri(t))}function Z(){te.innerHTML="",te.classList.remove("open"),v=-1}function as(t){if(!(t!=null&&t.length)){ve.innerHTML='<p class="dict-empty">No results found.</p>';return}let e="",n=null;for(const i of t){if(i.type==="deconstruction"){e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>
        ${cs(i)}
      </div>`;continue}i.book_name!==n&&(n&&(e+="</div>"),e+=`<div class="dict-book-group">
        <div class="dict-book-name">${i.book_name}</div>`,n=i.book_name),e+=`<div class="dict-entry">
      <div class="dict-entry-word">${i.word}</div>
      <div class="dict-entry-def">${i.definition}</div>
      ${ls(i.usages||[])}
    </div>`}n&&(e+="</div>"),ve.innerHTML=e,ve.querySelectorAll(".decon-part").forEach(i=>{const r=i.dataset.word;r&&i.addEventListener("click",s=>{s.stopPropagation(),Je(r)})})}function cs(t){const e=t.deconstruction||"",n=t.components||[];if(!e||!n.length)return"";const i=n.map((r,s)=>{const o=s===n.length-1;return`
      <span class="decon-part" data-word="${E(r)}" tabindex="0" role="button">
        <span class="decon-part-word">${E(r)}</span>
        <span class="decon-part-hint">click to define</span>
      </span>
      ${o?"":'<span class="decon-plus">+</span>'}`}).join("");return`<div class="decon-card">
    <div class="decon-formula">
      <span class="decon-original-word">${E(t.word)}</span>
      <span class="decon-arrow">→</span>
      <span class="decon-breakdown">
        ${i}
      </span>
    </div>
    <div class="decon-hint">Click any component word to look up its meaning</div>
  </div>`}function ls(t){return t.length?`<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${t.map(n=>{const i=n.word+(n.ending||""),r=us(n.pali||"",i);rt();const s=n.translation;return`<div class="dict-usage">
      <div class="dict-usage-pali">${r}</div>
      ${s?`<div class="dict-usage-trans">${E(s)}</div>`:""}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${E(n.book_name)}</span>
        <a class="dict-usage-open" href="${E(n.reader_url)}" target="_blank" rel="noopener">
          ↗
        </a>
      </div>
    </div>`}).join("")}
  </div>`:""}function us(t,e){if(!e||!t)return E(t);const n=t.toLowerCase().indexOf(e.toLowerCase());return n===-1?E(t):E(t.slice(0,n))+`<mark>${E(t.slice(n,n+e.length))}</mark>`+E(t.slice(n+e.length))}function E(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}document.addEventListener("click",t=>{!le()&&Ee.classList.contains("open")&&!Ee.contains(t.target)&&!t.target.closest(".pali-text")&&!t.target.closest("#sb-activity")&&Y(!1)});g==null||g.addEventListener("click",()=>{try{le()?localStorage.removeItem(At):localStorage.setItem(At,"1")}catch{}ii(),(le()||Ee.classList.contains("open"))&&Y(!0)});ii();le()&&Y(!0);un&&un.addEventListener("click",()=>Y(!1));function ds(t){var a,c,l,d;if(!document.caretRangeFromPoint)return null;const e=document.caretRangeFromPoint(t.clientX,t.clientY);if(!e)return null;const n=e.startContainer,i=e.startOffset;if(n.nodeType!==Node.TEXT_NODE)return null;const r=n.textContent,s=((c=(a=n.parentElement)==null?void 0:a.closest("[lang]"))==null?void 0:c.getAttribute("lang"))||"en",o=((d=(l=n.parentElement)==null?void 0:l.closest("[data-script]"))==null?void 0:d.getAttribute("data-script"))||null;return hs(r,i,s,o)}function hs(t,e,n,i){const r=["ro","si","hi","be","as","gm","gj","te","ka","mm","tb","cy","br"];return["en","in","es","pt","hi","si","ch"].includes(n)||r.includes(i)?fs(t,e):typeof Intl<"u"&&Intl.Segmenter?ps(t,e,n):si(t,e)}function fs(t,e){const n=/[\s\u200b\u00a0।॥၊။,\.!\?;:"'()\[\]{}<>\/\\]/,i=t[e];if(i===void 0||n.test(i))return null;let r=e,s=e;for(;r>0&&!n.test(t[r-1]);)r--;for(;s<t.length&&!n.test(t[s]);)s++;return t.slice(r,s).trim()||null}function ps(t,e,n){const r={th:"th",my:"my",lo:"lo",km:"km",tt:"th",en:"en",hi:"hi",si:"si",be:"bn",as:"as",gm:"pa",gj:"gu",te:"te",ka:"kn",mm:"ml",tb:"bo",cy:"ru"}[n]||n;try{const o=[...new Intl.Segmenter(r,{granularity:"word"}).segment(t)];for(const a of o){const c=a.index,l=a.index+a.segment.length;if(e>=c&&e<=l)return a.isWordLike===!1?null:a.segment.trim()||null}}catch{}return si(t,e)}function si(t,e){const n=[[3584,3711],[3712,3839],[4096,4255],[6016,6143],[6688,6831],[4096,4255]];function i(a){const c=a.codePointAt(0);return n.some(([l,d])=>c>=l&&c<=d)}const r=t[e];if(r===void 0||!i(r))return null;let s=e,o=e;for(;s>0&&i(t[s-1]);)s--;for(;o<t.length&&i(t[o]);)o++;return t.slice(s,o).trim()||null}const ms=()=>{};var hn={};/**
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
 */const oi=function(t){const e=[];let n=0;for(let i=0;i<t.length;i++){let r=t.charCodeAt(i);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&i+1<t.length&&(t.charCodeAt(i+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++i)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},gs=function(t){const e=[];let n=0,i=0;for(;n<t.length;){const r=t[n++];if(r<128)e[i++]=String.fromCharCode(r);else if(r>191&&r<224){const s=t[n++];e[i++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){const s=t[n++],o=t[n++],a=t[n++],c=((r&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[i++]=String.fromCharCode(55296+(c>>10)),e[i++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[i++]=String.fromCharCode((r&15)<<12|(s&63)<<6|o&63)}}return e.join("")},ai={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let r=0;r<t.length;r+=3){const s=t[r],o=r+1<t.length,a=o?t[r+1]:0,c=r+2<t.length,l=c?t[r+2]:0,d=s>>2,h=(s&3)<<4|a>>4;let p=(a&15)<<2|l>>6,_=l&63;c||(_=64,o||(p=64)),i.push(n[d],n[h],n[p],n[_])}return i.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(oi(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):gs(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let r=0;r<t.length;){const s=n[t.charAt(r++)],a=r<t.length?n[t.charAt(r)]:0;++r;const l=r<t.length?n[t.charAt(r)]:64;++r;const h=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||a==null||l==null||h==null)throw new bs;const p=s<<2|a>>4;if(i.push(p),l!==64){const _=a<<4&240|l>>2;if(i.push(_),h!==64){const A=l<<6&192|h;i.push(A)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class bs extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ys=function(t){const e=oi(t);return ai.encodeByteArray(e,!0)},ci=function(t){return ys(t).replace(/\./g,"")},li=function(t){try{return ai.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function _s(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const vs=()=>_s().__FIREBASE_DEFAULTS__,Is=()=>{if(typeof process>"u"||typeof hn>"u")return;const t=hn.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Es=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&li(t[1]);return e&&JSON.parse(e)},Ht=()=>{try{return ms()||vs()||Is()||Es()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},ws=t=>{var e,n;return(n=(e=Ht())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},ui=()=>{var t;return(t=Ht())==null?void 0:t.config},di=t=>{var e;return(e=Ht())==null?void 0:e[`_${t}`]};/**
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
 */class Ss{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,i)=>{n?this.reject(n):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,i))}}}/**
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
 */function b(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function As(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(b())}function ks(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ts(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Cs(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ls(){const t=b();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Ps(){try{return typeof indexedDB=="object"}catch{return!1}}function Rs(){return new Promise((t,e)=>{try{let n=!0;const i="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(i);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(i),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var s;e(((s=r.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}/**
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
 */const Os="FirebaseError";class x extends Error{constructor(e,n,i){super(n),this.code=e,this.customData=i,this.name=Os,Object.setPrototypeOf(this,x.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Le.prototype.create)}}class Le{constructor(e,n,i){this.service=e,this.serviceName=n,this.errors=i}create(e,...n){const i=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],o=s?Ns(s,i):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new x(r,a,i)}}function Ns(t,e){return t.replace(Ds,(n,i)=>{const r=e[i];return r!=null?String(r):`<${i}?>`})}const Ds=/\{\$([^}]+)}/g;function Ms(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ue(t,e){if(t===e)return!0;const n=Object.keys(t),i=Object.keys(e);for(const r of n){if(!i.includes(r))return!1;const s=t[r],o=e[r];if(fn(s)&&fn(o)){if(!ue(s,o))return!1}else if(s!==o)return!1}for(const r of i)if(!n.includes(r))return!1;return!0}function fn(t){return t!==null&&typeof t=="object"}/**
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
 */function Pe(t){const e=[];for(const[n,i]of Object.entries(t))Array.isArray(i)?i.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}function Fs(t,e){const n=new Bs(t,e);return n.subscribe.bind(n)}class Bs{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,i){let r;if(e===void 0&&n===void 0&&i===void 0)throw new Error("Missing Observer.");$s(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:i},r.next===void 0&&(r.next=pt),r.error===void 0&&(r.error=pt),r.complete===void 0&&(r.complete=pt);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function $s(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function pt(){}/**
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
 */function V(t){return t&&t._delegate?t._delegate:t}/**
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
 */function xt(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Us(t){return(await fetch(t,{credentials:"include"})).ok}class de{constructor(e,n,i){this.name=e,this.instanceFactory=n,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const W="[DEFAULT]";/**
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
 */class Hs{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const i=new Ss;if(this.instancesDeferred.set(n,i),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&i.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(i)return null;throw r}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Vs(e))try{this.getOrInitializeService({instanceIdentifier:W})}catch{}for(const[n,i]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:r});i.resolve(s)}catch{}}}}clearInstance(e=W){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=W){return this.instances.has(e)}getOptions(e=W){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:i,options:n});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);i===a&&o.resolve(r)}return r}onInit(e,n){const i=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(i)??new Set;r.add(e),this.onInitCallbacks.set(i,r);const s=this.instances.get(i);return s&&e(s,i),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){const i=this.onInitCallbacks.get(n);if(i)for(const r of i)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:xs(e),options:n}),this.instances.set(e,i),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=W){return this.component?this.component.multipleInstances?e:W:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function xs(t){return t===W?void 0:t}function Vs(t){return t.instantiationMode==="EAGER"}/**
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
 */class js{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Hs(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var m;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(m||(m={}));const Ws={debug:m.DEBUG,verbose:m.VERBOSE,info:m.INFO,warn:m.WARN,error:m.ERROR,silent:m.SILENT},qs=m.INFO,zs={[m.DEBUG]:"log",[m.VERBOSE]:"log",[m.INFO]:"info",[m.WARN]:"warn",[m.ERROR]:"error"},Gs=(t,e,...n)=>{if(e<t.logLevel)return;const i=new Date().toISOString(),r=zs[e];if(r)console[r](`[${i}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class hi{constructor(e){this.name=e,this._logLevel=qs,this._logHandler=Gs,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in m))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Ws[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,m.DEBUG,...e),this._logHandler(this,m.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,m.VERBOSE,...e),this._logHandler(this,m.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,m.INFO,...e),this._logHandler(this,m.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,m.WARN,...e),this._logHandler(this,m.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,m.ERROR,...e),this._logHandler(this,m.ERROR,...e)}}const Ks=(t,e)=>e.some(n=>t instanceof n);let pn,mn;function Js(){return pn||(pn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ys(){return mn||(mn=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const fi=new WeakMap,kt=new WeakMap,pi=new WeakMap,mt=new WeakMap,Vt=new WeakMap;function Xs(t){const e=new Promise((n,i)=>{const r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(U(t.result)),r()},o=()=>{i(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&fi.set(n,t)}).catch(()=>{}),Vt.set(e,t),e}function Qs(t){if(kt.has(t))return;const e=new Promise((n,i)=>{const r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),r()},o=()=>{i(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});kt.set(t,e)}let Tt={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return kt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||pi.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return U(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Zs(t){Tt=t(Tt)}function eo(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const i=t.call(gt(this),e,...n);return pi.set(i,e.sort?e.sort():[e]),U(i)}:Ys().includes(t)?function(...e){return t.apply(gt(this),e),U(fi.get(this))}:function(...e){return U(t.apply(gt(this),e))}}function to(t){return typeof t=="function"?eo(t):(t instanceof IDBTransaction&&Qs(t),Ks(t,Js())?new Proxy(t,Tt):t)}function U(t){if(t instanceof IDBRequest)return Xs(t);if(mt.has(t))return mt.get(t);const e=to(t);return e!==t&&(mt.set(t,e),Vt.set(e,t)),e}const gt=t=>Vt.get(t);function no(t,e,{blocked:n,upgrade:i,blocking:r,terminated:s}={}){const o=indexedDB.open(t,e),a=U(o);return i&&o.addEventListener("upgradeneeded",c=>{i(U(o.result),c.oldVersion,c.newVersion,U(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{s&&c.addEventListener("close",()=>s()),r&&c.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const io=["get","getKey","getAll","getAllKeys","count"],ro=["put","add","delete","clear"],bt=new Map;function gn(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(bt.get(e))return bt.get(e);const n=e.replace(/FromIndex$/,""),i=e!==n,r=ro.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!(r||io.includes(n)))return;const s=async function(o,...a){const c=this.transaction(o,r?"readwrite":"readonly");let l=c.store;return i&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),r&&c.done]))[0]};return bt.set(e,s),s}Zs(t=>({...t,get:(e,n,i)=>gn(e,n)||t.get(e,n,i),has:(e,n)=>!!gn(e,n)||t.has(e,n)}));/**
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
 */class so{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(oo(n)){const i=n.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(n=>n).join(" ")}}function oo(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ct="@firebase/app",bn="0.15.1";/**
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
 */const D=new hi("@firebase/app"),ao="@firebase/app-compat",co="@firebase/analytics-compat",lo="@firebase/analytics",uo="@firebase/app-check-compat",ho="@firebase/app-check",fo="@firebase/auth",po="@firebase/auth-compat",mo="@firebase/database",go="@firebase/data-connect",bo="@firebase/database-compat",yo="@firebase/functions",_o="@firebase/functions-compat",vo="@firebase/installations",Io="@firebase/installations-compat",Eo="@firebase/messaging",wo="@firebase/messaging-compat",So="@firebase/performance",Ao="@firebase/performance-compat",ko="@firebase/remote-config",To="@firebase/remote-config-compat",Co="@firebase/storage",Lo="@firebase/storage-compat",Po="@firebase/firestore",Ro="@firebase/ai",Oo="@firebase/firestore-compat",No="firebase",Do="12.16.0";/**
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
 */const Lt="[DEFAULT]",Mo={[Ct]:"fire-core",[ao]:"fire-core-compat",[lo]:"fire-analytics",[co]:"fire-analytics-compat",[ho]:"fire-app-check",[uo]:"fire-app-check-compat",[fo]:"fire-auth",[po]:"fire-auth-compat",[mo]:"fire-rtdb",[go]:"fire-data-connect",[bo]:"fire-rtdb-compat",[yo]:"fire-fn",[_o]:"fire-fn-compat",[vo]:"fire-iid",[Io]:"fire-iid-compat",[Eo]:"fire-fcm",[wo]:"fire-fcm-compat",[So]:"fire-perf",[Ao]:"fire-perf-compat",[ko]:"fire-rc",[To]:"fire-rc-compat",[Co]:"fire-gcs",[Lo]:"fire-gcs-compat",[Po]:"fire-fst",[Oo]:"fire-fst-compat",[Ro]:"fire-vertex","fire-js":"fire-js",[No]:"fire-js-all"};/**
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
 */const Ye=new Map,Fo=new Map,Pt=new Map;function yn(t,e){try{t.container.addComponent(e)}catch(n){D.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function we(t){const e=t.name;if(Pt.has(e))return D.debug(`There were multiple attempts to register component ${e}.`),!1;Pt.set(e,t);for(const n of Ye.values())yn(n,t);for(const n of Fo.values())yn(n,t);return!0}function mi(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function k(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Bo={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},H=new Le("app","Firebase",Bo);/**
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
 */class $o{constructor(e,n,i){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new de("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw H.create("app-deleted",{appName:this._name})}}/**
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
 */const Re=Do;function gi(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const i={name:Lt,automaticDataCollectionEnabled:!0,...e},r=i.name;if(typeof r!="string"||!r)throw H.create("bad-app-name",{appName:String(r)});if(n||(n=ui()),!n)throw H.create("no-options");const s=Ye.get(r);if(s){if(ue(n,s.options)&&ue(i,s.config))return s;throw H.create("duplicate-app",{appName:r})}const o=new js(r);for(const c of Pt.values())o.addComponent(c);const a=new $o(n,i,o);return Ye.set(r,a),a}function Uo(t=Lt){const e=Ye.get(t);if(!e&&t===Lt&&ui())return gi();if(!e)throw H.create("no-app",{appName:t});return e}function ne(t,e,n){let i=Mo[t]??t;n&&(i+=`-${n}`);const r=i.match(/\s|\//),s=e.match(/\s|\//);if(r||s){const o=[`Unable to register library "${i}" with version "${e}":`];r&&o.push(`library name "${i}" contains illegal characters (whitespace or "/")`),r&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),D.warn(o.join(" "));return}we(new de(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const Ho="firebase-heartbeat-database",xo=1,Se="firebase-heartbeat-store";let yt=null;function bi(){return yt||(yt=no(Ho,xo,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Se)}catch(n){console.warn(n)}}}}).catch(t=>{throw H.create("idb-open",{originalErrorMessage:t.message})})),yt}async function Vo(t){try{const n=(await bi()).transaction(Se),i=await n.objectStore(Se).get(yi(t));return await n.done,i}catch(e){if(e instanceof x)D.warn(e.message);else{const n=H.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});D.warn(n.message)}}}async function _n(t,e){try{const i=(await bi()).transaction(Se,"readwrite");await i.objectStore(Se).put(e,yi(t)),await i.done}catch(n){if(n instanceof x)D.warn(n.message);else{const i=H.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});D.warn(i.message)}}}function yi(t){return`${t.name}!${t.options.appId}`}/**
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
 */const jo=1024,Wo=30;class qo{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Go(n),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=vn();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:r}),this._heartbeatsCache.heartbeats.length>Wo){const o=Ko(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){D.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=vn(),{heartbeatsToSend:i,unsentEntries:r}=zo(this._heartbeatsCache.heartbeats),s=ci(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return D.warn(n),""}}}function vn(){return new Date().toISOString().substring(0,10)}function zo(t,e=jo){const n=[];let i=t.slice();for(const r of t){const s=n.find(o=>o.agent===r.agent);if(s){if(s.dates.push(r.date),In(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),In(n)>e){n.pop();break}i=i.slice(1)}return{heartbeatsToSend:n,unsentEntries:i}}class Go{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ps()?Rs().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Vo(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return _n(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const i=await this.read();return _n(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function In(t){return ci(JSON.stringify({version:2,heartbeats:t})).length}function Ko(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let i=1;i<t.length;i++)t[i].date<n&&(n=t[i].date,e=i);return e}/**
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
 */function Jo(t){we(new de("platform-logger",e=>new so(e),"PRIVATE")),we(new de("heartbeat",e=>new qo(e),"PRIVATE")),ne(Ct,bn,t),ne(Ct,bn,"esm2020"),ne("fire-js","")}Jo("");var Yo="firebase",Xo="12.16.0";/**
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
 */ne(Yo,Xo,"app");function _i(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Qo=_i,vi=new Le("auth","Firebase",_i());/**
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
 */const Xe=new hi("@firebase/auth");function Zo(t,...e){Xe.logLevel<=m.WARN&&Xe.warn(`Auth (${Re}): ${t}`,...e)}function Ve(t,...e){Xe.logLevel<=m.ERROR&&Xe.error(`Auth (${Re}): ${t}`,...e)}/**
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
 */function L(t,...e){throw Wt(t,...e)}function S(t,...e){return Wt(t,...e)}function jt(t,e,n){const i={...Qo(),[e]:n};return new Le("auth","Firebase",i).create(e,{appName:t.name})}function z(t){return jt(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ea(t,e,n){const i=n;if(!(e instanceof i))throw i.name!==e.constructor.name&&L(t,"argument-error"),jt(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Wt(t,...e){if(typeof t!="string"){const n=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=t.name),t._errorFactory.create(n,...i)}return vi.create(t,...e)}function f(t,e,...n){if(!t)throw Wt(e,...n)}function O(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ve(e),new Error(e)}function M(t,e){t||O(e)}/**
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
 */function Rt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function ta(){return En()==="http:"||En()==="https:"}function En(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function na(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ta()||Ts()||"connection"in navigator)?navigator.onLine:!0}function ia(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Oe{constructor(e,n){this.shortDelay=e,this.longDelay=n,M(n>e,"Short delay should be less than long delay!"),this.isMobile=As()||Cs()}get(){return na()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function qt(t,e){M(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Ii{static initialize(e,n,i){this.fetchImpl=e,n&&(this.headersImpl=n),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;O("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;O("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;O("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const ra={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const sa=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],oa=new Oe(3e4,6e4);function zt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function be(t,e,n,i,r={}){return Ei(t,r,async()=>{let s={},o={};i&&(e==="GET"?o=i:s={body:JSON.stringify(i)});const a=Pe({...o,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const l={method:e,headers:c,...s};return ks()||(l.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&xt(t.emulatorConfig.host)&&(l.credentials="include"),Ii.fetch()(await wi(t,t.config.apiHost,n,a),l)})}async function Ei(t,e,n){t._canInitEmulator=!1;const i={...ra,...e};try{const r=new ca(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw $e(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw $e(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw $e(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw $e(t,"user-disabled",o);const d=i[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw jt(t,d,l);L(t,d)}}catch(r){if(r instanceof x)throw r;L(t,"network-request-failed",{message:String(r)})}}async function aa(t,e,n,i,r={}){const s=await be(t,e,n,i,r);return"mfaPendingCredential"in s&&L(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function wi(t,e,n,i){const r=`${e}${n}?${i}`,s=t,o=s.config.emulator?qt(t.config,r):`${t.config.apiScheme}://${r}`;return sa.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class ca{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,i)=>{this.timer=setTimeout(()=>i(S(this.auth,"network-request-failed")),oa.get())})}}function $e(t,e,n){const i={appName:t.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);const r=S(t,e,i);return r.customData._tokenResponse=n,r}/**
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
 */async function la(t,e){return be(t,"POST","/v1/accounts:delete",e)}async function Qe(t,e){return be(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function Ie(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function ua(t,e=!1){const n=V(t),i=await n.getIdToken(e),r=Gt(i);f(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");const s=typeof r.firebase=="object"?r.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:r,token:i,authTime:Ie(_t(r.auth_time)),issuedAtTime:Ie(_t(r.iat)),expirationTime:Ie(_t(r.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function _t(t){return Number(t)*1e3}function Gt(t){const[e,n,i]=t.split(".");if(e===void 0||n===void 0||i===void 0)return Ve("JWT malformed, contained fewer than 3 sections"),null;try{const r=li(n);return r?JSON.parse(r):(Ve("Failed to decode base64 JWT payload"),null)}catch(r){return Ve("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function wn(t){const e=Gt(t);return f(e,"internal-error"),f(typeof e.exp<"u","internal-error"),f(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Ae(t,e,n=!1){if(n)return e;try{return await e}catch(i){throw i instanceof x&&da(i)&&t.auth.currentUser===t&&await t.auth.signOut(),i}}function da({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class ha{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const i=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ot{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ie(this.lastLoginAt),this.creationTime=Ie(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ze(t){var h;const e=t.auth,n=await t.getIdToken(),i=await Ae(t,Qe(e,{idToken:n}));f(i==null?void 0:i.users.length,e,"internal-error");const r=i.users[0];t._notifyReloadListener(r);const s=(h=r.providerUserInfo)!=null&&h.length?Si(r.providerUserInfo):[],o=pa(t.providerData,s),a=t.isAnonymous,c=!(t.email&&r.passwordHash)&&!(o!=null&&o.length),l=a?c:!1,d={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new Ot(r.createdAt,r.lastLoginAt),isAnonymous:l};Object.assign(t,d)}async function fa(t){const e=V(t);await Ze(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function pa(t,e){return[...t.filter(i=>!e.some(r=>r.providerId===i.providerId)),...e]}function Si(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function ma(t,e){const n=await Ei(t,{},async()=>{const i=Pe({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,o=await wi(t,r,"/v1/token",`key=${s}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:i};return t.emulatorConfig&&xt(t.emulatorConfig.host)&&(c.credentials="include"),Ii.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function ga(t,e){return be(t,"POST","/v2/accounts:revokeToken",zt(t,e))}/**
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
 */class ie{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){f(e.idToken,"internal-error"),f(typeof e.idToken<"u","internal-error"),f(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):wn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){f(e.length!==0,"internal-error");const n=wn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(f(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:i,refreshToken:r,expiresIn:s}=await ma(e,n);this.updateTokensAndExpiration(i,r,Number(s))}updateTokensAndExpiration(e,n,i){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,n){const{refreshToken:i,accessToken:r,expirationTime:s}=n,o=new ie;return i&&(f(typeof i=="string","internal-error",{appName:e}),o.refreshToken=i),r&&(f(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),s&&(f(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ie,this.toJSON())}_performRefresh(){return O("not implemented")}}/**
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
 */function F(t,e){f(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class w{constructor({uid:e,auth:n,stsTokenManager:i,...r}){this.providerId="firebase",this.proactiveRefresh=new ha(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Ot(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const n=await Ae(this,this.stsTokenManager.getToken(this.auth,e));return f(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return ua(this,e)}reload(){return fa(this)}_assign(e){this!==e&&(f(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new w({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){f(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),n&&await Ze(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(k(this.auth.app))return Promise.reject(z(this.auth));const e=await this.getIdToken();return await Ae(this,la(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const i=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,c=n._redirectEventId??void 0,l=n.createdAt??void 0,d=n.lastLoginAt??void 0,{uid:h,emailVerified:p,isAnonymous:_,providerData:A,stsTokenManager:ye}=n;f(h&&ye,e,"internal-error");const br=ie.fromJSON(this.name,ye);f(typeof h=="string",e,"internal-error"),F(i,e.name),F(r,e.name),f(typeof p=="boolean",e,"internal-error"),f(typeof _=="boolean",e,"internal-error"),F(s,e.name),F(o,e.name),F(a,e.name),F(c,e.name),F(l,e.name),F(d,e.name);const dt=new w({uid:h,auth:e,email:r,emailVerified:p,displayName:i,isAnonymous:_,photoURL:o,phoneNumber:s,tenantId:a,stsTokenManager:br,createdAt:l,lastLoginAt:d});return A&&Array.isArray(A)&&(dt.providerData=A.map(yr=>({...yr}))),c&&(dt._redirectEventId=c),dt}static async _fromIdTokenResponse(e,n,i=!1){const r=new ie;r.updateFromServerResponse(n);const s=new w({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:i});return await Ze(s),s}static async _fromGetAccountInfoResponse(e,n,i){const r=n.users[0];f(r.localId!==void 0,"internal-error");const s=r.providerUserInfo!==void 0?Si(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(s!=null&&s.length),a=new ie;a.updateFromIdToken(i);const c=new w({uid:r.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Ot(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,l),c}}/**
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
 */const Sn=new Map;function N(t){M(t instanceof Function,"Expected a class definition");let e=Sn.get(t);return e?(M(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Sn.set(t,e),e)}/**
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
 */class Ai{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Ai.type="NONE";const An=Ai;/**
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
 */function je(t,e,n){return`firebase:${t}:${e}:${n}`}class re{constructor(e,n,i){this.persistence=e,this.auth=n,this.userKey=i;const{config:r,name:s}=this.auth;this.fullUserKey=je(this.userKey,r.apiKey,s),this.fullPersistenceKey=je("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Qe(this.auth,{idToken:e}).catch(()=>{});return n?w._fromGetAccountInfoResponse(this.auth,n,e):null}return w._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,i="authUser"){if(!n.length)return new re(N(An),e,i);const r=(await Promise.all(n.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let s=r[0]||N(An);const o=je(i,e.config.apiKey,e.name);let a=null;for(const l of n)try{const d=await l._get(o);if(d){let h;if(typeof d=="string"){const p=await Qe(e,{idToken:d}).catch(()=>{});if(!p)break;h=await w._fromGetAccountInfoResponse(e,p,d)}else h=w._fromJSON(e,d);l!==s&&(a=h),s=l;break}}catch{}const c=r.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new re(s,e,i):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(n.map(async l=>{if(l!==s)try{await l._remove(o)}catch{}})),new re(s,e,i))}}/**
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
 */function kn(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Li(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(ki(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Ri(e))return"Blackberry";if(Oi(e))return"Webos";if(Ti(e))return"Safari";if((e.includes("chrome/")||Ci(e))&&!e.includes("edge/"))return"Chrome";if(Pi(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=t.match(n);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function ki(t=b()){return/firefox\//i.test(t)}function Ti(t=b()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ci(t=b()){return/crios\//i.test(t)}function Li(t=b()){return/iemobile/i.test(t)}function Pi(t=b()){return/android/i.test(t)}function Ri(t=b()){return/blackberry/i.test(t)}function Oi(t=b()){return/webos/i.test(t)}function Kt(t=b()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function ba(t=b()){var e;return Kt(t)&&!!((e=window.navigator)!=null&&e.standalone)}function ya(){return Ls()&&document.documentMode===10}function Ni(t=b()){return Kt(t)||Pi(t)||Oi(t)||Ri(t)||/windows phone/i.test(t)||Li(t)}/**
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
 */function Di(t,e=[]){let n;switch(t){case"Browser":n=kn(b());break;case"Worker":n=`${kn(b())}-${t}`;break;default:n=t}const i=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Re}/${i}`}/**
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
 */class _a{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const i=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});i.onAbort=n,this.queue.push(i);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const i of this.queue)await i(e),i.onAbort&&n.push(i.onAbort)}catch(i){n.reverse();for(const r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
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
 */async function va(t,e={}){return be(t,"GET","/v2/passwordPolicy",zt(t,e))}/**
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
 */const Ia=6;class Ea{constructor(e){var i;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Ia,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const i=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;i&&(n.meetsMinPasswordLength=e.length>=i),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let i;for(let r=0;r<e.length;r++)i=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,n,i,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class wa{constructor(e,n,i,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=i,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Tn(this),this.idTokenSubscription=new Tn(this),this.beforeStateQueue=new _a(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=vi,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=N(n)),this._initializationPromise=this.queue(async()=>{var i,r,s;if(!this._deleted&&(this.persistenceManager=await re.create(this,e),(i=this._resolvePersistenceManagerAvailable)==null||i.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Qe(this,{idToken:e}),i=await w._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(i)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(k(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let i=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,a=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(i=c.user,r=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return f(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Ze(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ia()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(k(this.app))return Promise.reject(z(this));const n=e?V(e):null;return n&&f(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&f(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return k(this.app)?Promise.reject(z(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return k(this.app)?Promise.reject(z(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(N(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await va(this),n=new Ea(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Le("auth","Firebase",e())}onAuthStateChanged(e,n,i){return this.registerStateListener(this.authStateSubscription,e,n,i)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,i){return this.registerStateListener(this.idTokenSubscription,e,n,i)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(i.tenantId=this.tenantId),await ga(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const i=await this.getOrInitRedirectPersistenceManager(n);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&N(e)||this._popupRedirectResolver;f(n,this,"argument-error"),this.redirectPersistenceManager=await re.create(this,[N(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,i;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((i=this.redirectUser)==null?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,i,r){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(f(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,i,r);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return f(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Di(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const i=await this._getAppCheckToken();return i&&(e["X-Firebase-AppCheck"]=i),e}async _getAppCheckToken(){var n;if(k(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&Zo(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function st(t){return V(t)}class Tn{constructor(e){this.auth=e,this.observer=null,this.addObserver=Fs(n=>this.observer=n)}get next(){return f(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Jt={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Sa(t){Jt=t}function Aa(t){return Jt.loadJS(t)}function ka(){return Jt.gapiScript}function Ta(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Ca(t,e){const n=mi(t,"auth");if(n.isInitialized()){const r=n.getImmediate(),s=n.getOptions();if(ue(s,e??{}))return r;L(r,"already-initialized")}return n.initialize({options:e})}function La(t,e){const n=(e==null?void 0:e.persistence)||[],i=(Array.isArray(n)?n:[n]).map(N);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function Pa(t,e,n){const i=st(t);f(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const r=!1,s=Mi(e),{host:o,port:a}=Ra(e),c=a===null?"":`:${a}`,l={url:`${s}//${o}${c}/`},d=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!i._canInitEmulator){f(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),f(ue(l,i.config.emulator)&&ue(d,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=d,i.settings.appVerificationDisabledForTesting=!0,xt(o)?Us(`${s}//${o}${c}`):Oa()}function Mi(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Ra(t){const e=Mi(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const i=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(i);if(r){const s=r[1];return{host:s,port:Cn(i.substr(s.length+1))}}else{const[s,o]=i.split(":");return{host:s,port:Cn(o)}}}function Cn(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Oa(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Fi{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return O("not implemented")}_getIdTokenResponse(e){return O("not implemented")}_linkToIdToken(e,n){return O("not implemented")}_getReauthenticationResolver(e){return O("not implemented")}}/**
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
 */async function se(t,e){return aa(t,"POST","/v1/accounts:signInWithIdp",zt(t,e))}/**
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
 */const Na="http://localhost";class X extends Fi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new X(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):L("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:i,signInMethod:r,...s}=n;if(!i||!r)return null;const o=new X(i,r);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return se(e,n)}_linkToIdToken(e,n){const i=this.buildRequest();return i.idToken=n,se(e,i)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,se(e,n)}buildRequest(){const e={requestUri:Na,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Pe(n)}return e}}/**
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
 */class Yt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Ne extends Yt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class P extends Ne{constructor(){super("facebook.com")}static credential(e){return X._fromParams({providerId:P.PROVIDER_ID,signInMethod:P.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return P.credentialFromTaggedObject(e)}static credentialFromError(e){return P.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return P.credential(e.oauthAccessToken)}catch{return null}}}P.FACEBOOK_SIGN_IN_METHOD="facebook.com";P.PROVIDER_ID="facebook.com";/**
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
 */class R extends Ne{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return X._fromParams({providerId:R.PROVIDER_ID,signInMethod:R.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return R.credentialFromTaggedObject(e)}static credentialFromError(e){return R.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:i}=e;if(!n&&!i)return null;try{return R.credential(n,i)}catch{return null}}}R.GOOGLE_SIGN_IN_METHOD="google.com";R.PROVIDER_ID="google.com";/**
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
 */class B extends Ne{constructor(){super("github.com")}static credential(e){return X._fromParams({providerId:B.PROVIDER_ID,signInMethod:B.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return B.credentialFromTaggedObject(e)}static credentialFromError(e){return B.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return B.credential(e.oauthAccessToken)}catch{return null}}}B.GITHUB_SIGN_IN_METHOD="github.com";B.PROVIDER_ID="github.com";/**
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
 */class $ extends Ne{constructor(){super("twitter.com")}static credential(e,n){return X._fromParams({providerId:$.PROVIDER_ID,signInMethod:$.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return $.credentialFromTaggedObject(e)}static credentialFromError(e){return $.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:i}=e;if(!n||!i)return null;try{return $.credential(n,i)}catch{return null}}}$.TWITTER_SIGN_IN_METHOD="twitter.com";$.PROVIDER_ID="twitter.com";/**
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
 */class he{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,i,r=!1){const s=await w._fromIdTokenResponse(e,i,r),o=Ln(i);return new he({user:s,providerId:o,_tokenResponse:i,operationType:n})}static async _forOperation(e,n,i){await e._updateTokensIfNecessary(i,!0);const r=Ln(i);return new he({user:e,providerId:r,_tokenResponse:i,operationType:n})}}function Ln(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class et extends x{constructor(e,n,i,r){super(n.code,n.message),this.operationType=i,this.user=r,Object.setPrototypeOf(this,et.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:i}}static _fromErrorAndOperation(e,n,i,r){return new et(e,n,i,r)}}function Bi(t,e,n,i){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?et._fromErrorAndOperation(t,s,e,i):s})}async function Da(t,e,n=!1){const i=await Ae(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return he._forOperation(t,"link",i)}/**
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
 */async function Ma(t,e,n=!1){const{auth:i}=t;if(k(i.app))return Promise.reject(z(i));const r="reauthenticate";try{const s=await Ae(t,Bi(i,r,e,t),n);f(s.idToken,i,"internal-error");const o=Gt(s.idToken);f(o,i,"internal-error");const{sub:a}=o;return f(t.uid===a,i,"user-mismatch"),he._forOperation(t,r,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&L(i,"user-mismatch"),s}}/**
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
 */async function Fa(t,e,n=!1){if(k(t.app))return Promise.reject(z(t));const i="signIn",r=await Bi(t,i,e),s=await he._fromIdTokenResponse(t,i,r);return n||await t._updateCurrentUser(s.user),s}function Ba(t,e,n,i){return V(t).onIdTokenChanged(e,n,i)}function $a(t,e,n){return V(t).beforeAuthStateChanged(e,n)}function Ua(t,e,n,i){return V(t).onAuthStateChanged(e,n,i)}function Ha(t){return V(t).signOut()}const tt="__sak";/**
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
 */class $i{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(tt,"1"),this.storage.removeItem(tt),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const xa=1e3,Va=10;class Ui extends $i{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Ni(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const i=this.storage.getItem(n),r=this.localCache[n];i!==r&&e(n,r,i)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const i=e.key;n?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(i);!n&&this.localCache[i]===o||this.notifyListeners(i,o)},s=this.storage.getItem(i);ya()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,Va):r()}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,i)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:i}),!0)})},xa)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ui.type="LOCAL";const ja=Ui;/**
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
 */class Hi extends $i{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Hi.type="SESSION";const xi=Hi;/**
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
 */function Wa(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class ot{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;const i=new ot(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:i,eventType:r,data:s}=n.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:i,eventType:r});const a=Array.from(o).map(async l=>l(n.origin,s)),c=await Wa(a);n.ports[0].postMessage({status:"done",eventId:i,eventType:r,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ot.receivers=[];/**
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
 */function Xt(t="",e=10){let n="";for(let i=0;i<e;i++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class qa{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,i=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,o;return new Promise((a,c)=>{const l=Xt("",20);r.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},i);o={messageChannel:r,onMessage(h){const p=h;if(p.data.eventId===l)switch(p.data.status){case"ack":clearTimeout(d),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(p.data.response);break;default:clearTimeout(d),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:n},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function T(){return window}function za(t){T().location.href=t}/**
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
 */function Vi(){return typeof T().WorkerGlobalScope<"u"&&typeof T().importScripts=="function"}async function Ga(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Ka(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function Ja(){return Vi()?self:null}/**
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
 */const ji="firebaseLocalStorageDb",Ya=1,nt="firebaseLocalStorage",Wi="fbase_key";class De{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function at(t,e){return t.transaction([nt],e?"readwrite":"readonly").objectStore(nt)}function Xa(){const t=indexedDB.deleteDatabase(ji);return new De(t).toPromise()}function qi(){const t=indexedDB.open(ji,Ya);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const i=t.result;try{i.createObjectStore(nt,{keyPath:Wi})}catch(r){n(r)}}),t.addEventListener("success",async()=>{const i=t.result;i.objectStoreNames.contains(nt)?e(i):(i.close(),await Xa(),e(await qi()))})})}async function Pn(t,e,n){const i=at(t,!0).put({[Wi]:e,value:n});return new De(i).toPromise()}async function Qa(t,e){const n=at(t,!1).get(e),i=await new De(n).toPromise();return i===void 0?null:i.value}function Rn(t,e){const n=at(t,!0).delete(e);return new De(n).toPromise()}const Za=800,ec=3;class zi{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=qi(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(n++>ec)throw i;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Vi()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ot._getInstance(Ja()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,i;if(this.activeServiceWorker=await Ga(),!this.activeServiceWorker)return;this.sender=new qa(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(i=e[0])!=null&&i.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Ka()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Pn(e,tt,"1"),await Rn(e,tt)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(i=>Pn(i,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(i=>Qa(i,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Rn(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const s=at(r,!1).getAll();return new De(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],i=new Set;if(e.length!==0)for(const{fbase_key:r,value:s}of e)i.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!i.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Za)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}zi.type="LOCAL";const tc=zi;new Oe(3e4,6e4);/**
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
 */function Gi(t,e){return e?N(e):(f(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Qt extends Fi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return se(e,this._buildIdpRequest())}_linkToIdToken(e,n){return se(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return se(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function nc(t){return Fa(t.auth,new Qt(t),t.bypassAuthState)}function ic(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Ma(n,new Qt(t),t.bypassAuthState)}async function rc(t){const{auth:e,user:n}=t;return f(n,e,"internal-error"),Da(n,new Qt(t),t.bypassAuthState)}/**
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
 */class Ki{constructor(e,n,i,r,s=!1){this.auth=e,this.resolver=i,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(i){this.reject(i)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:i,postBody:r,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:i,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return nc;case"linkViaPopup":case"linkViaRedirect":return rc;case"reauthViaPopup":case"reauthViaRedirect":return ic;default:L(this.auth,"internal-error")}}resolve(e){M(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){M(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const sc=new Oe(2e3,1e4);async function Ji(t,e,n){if(k(t.app))return Promise.reject(S(t,"operation-not-supported-in-this-environment"));const i=st(t);ea(t,e,Yt);const r=Gi(i,n);return new q(i,"signInViaPopup",e,r).executeNotNull()}class q extends Ki{constructor(e,n,i,r,s){super(e,n,r,s),this.provider=i,this.authWindow=null,this.pollId=null,q.currentPopupAction&&q.currentPopupAction.cancel(),q.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return f(e,this.auth,"internal-error"),e}async onExecution(){M(this.filter.length===1,"Popup operations only handle one event");const e=Xt();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(S(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(S(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,q.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,i;if((i=(n=this.authWindow)==null?void 0:n.window)!=null&&i.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(S(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,sc.get())};e()}}q.currentPopupAction=null;/**
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
 */const oc="pendingRedirect",We=new Map;class ac extends Ki{constructor(e,n,i=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,i),this.eventId=null}async execute(){let e=We.get(this.auth._key());if(!e){try{const i=await cc(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(n){e=()=>Promise.reject(n)}We.set(this.auth._key(),e)}return this.bypassAuthState||We.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function cc(t,e){const n=dc(e),i=uc(t);if(!await i._isAvailable())return!1;const r=await i._get(n)==="true";return await i._remove(n),r}function lc(t,e){We.set(t._key(),e)}function uc(t){return N(t._redirectPersistence)}function dc(t){return je(oc,t.config.apiKey,t.name)}async function hc(t,e,n=!1){if(k(t.app))return Promise.reject(z(t));const i=st(t),r=Gi(i,e),o=await new ac(i,r,n).execute();return o&&!n&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,e)),o}/**
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
 */const fc=600*1e3;class pc{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(i=>{this.isEventForConsumer(e,i)&&(n=!0,this.sendToConsumer(e,i),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!mc(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var i;if(e.error&&!Yi(e)){const r=((i=e.error.code)==null?void 0:i.split("auth/")[1])||"internal-error";n.onError(S(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const i=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&i}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=fc&&this.cachedEventUids.clear(),this.cachedEventUids.has(On(e))}saveEventToCache(e){this.cachedEventUids.add(On(e)),this.lastProcessedEventTime=Date.now()}}function On(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Yi({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function mc(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Yi(t);default:return!1}}/**
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
 */async function gc(t,e={}){return be(t,"GET","/v1/projects",e)}/**
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
 */const bc=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,yc=/^https?/;async function _c(t){if(t.config.emulator)return;const{authorizedDomains:e}=await gc(t);for(const n of e)try{if(vc(n))return}catch{}L(t,"unauthorized-domain")}function vc(t){const e=Rt(),{protocol:n,hostname:i}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&i===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===i}if(!yc.test(n))return!1;if(bc.test(t))return i===t;const r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(i)}/**
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
 */const Ic=new Oe(3e4,6e4);function Nn(){const t=T().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Ec(t){return new Promise((e,n)=>{var r,s,o;function i(){Nn(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Nn(),n(S(t,"network-request-failed"))},timeout:Ic.get()})}if((s=(r=T().gapi)==null?void 0:r.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=T().gapi)!=null&&o.load)i();else{const a=Ta("iframefcb");return T()[a]=()=>{gapi.load?i():n(S(t,"network-request-failed"))},Aa(`${ka()}?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw qe=null,e})}let qe=null;function wc(t){return qe=qe||Ec(t),qe}/**
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
 */const Sc=new Oe(5e3,15e3),Ac="__/auth/iframe",kc="emulator/auth/iframe",Tc={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Cc=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Lc(t){const e=t.config;f(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?qt(e,kc):`https://${t.config.authDomain}/${Ac}`,i={apiKey:e.apiKey,appName:t.name,v:Re},r=Cc.get(t.config.apiHost);r&&(i.eid=r);const s=t._getFrameworks();return s.length&&(i.fw=s.join(",")),`${n}?${Pe(i).slice(1)}`}async function Pc(t){const e=await wc(t),n=T().gapi;return f(n,t,"internal-error"),e.open({where:document.body,url:Lc(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Tc,dontclear:!0},i=>new Promise(async(r,s)=>{await i.restyle({setHideOnLeave:!1});const o=S(t,"network-request-failed"),a=T().setTimeout(()=>{s(o)},Sc.get());function c(){T().clearTimeout(a),r(i)}i.ping(c).then(c,()=>{s(o)})}))}/**
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
 */const Rc={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Oc=500,Nc=600,Dc="_blank",Mc="http://localhost";class Dn{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Fc(t,e,n,i=Oc,r=Nc){const s=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let a="";const c={...Rc,width:i.toString(),height:r.toString(),top:s,left:o},l=b().toLowerCase();n&&(a=Ci(l)?Dc:n),ki(l)&&(e=e||Mc,c.scrollbars="yes");const d=Object.entries(c).reduce((p,[_,A])=>`${p}${_}=${A},`,"");if(ba(l)&&a!=="_self")return Bc(e||"",a),new Dn(null);const h=window.open(e||"",a,d);f(h,t,"popup-blocked");try{h.focus()}catch{}return new Dn(h)}function Bc(t,e){const n=document.createElement("a");n.href=t,n.target=e;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(i)}/**
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
 */const $c="__/auth/handler",Uc="emulator/auth/handler",Hc=encodeURIComponent("fac");async function Mn(t,e,n,i,r,s){f(t.config.authDomain,t,"auth-domain-config-required"),f(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:i,v:Re,eventId:r};if(e instanceof Yt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Ms(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,h]of Object.entries({}))o[d]=h}if(e instanceof Ne){const d=e.getScopes().filter(h=>h!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const c=await t._getAppCheckToken(),l=c?`#${Hc}=${encodeURIComponent(c)}`:"";return`${xc(t)}?${Pe(a).slice(1)}${l}`}function xc({config:t}){return t.emulator?qt(t,Uc):`https://${t.authDomain}/${$c}`}/**
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
 */const vt="webStorageSupport";class Vc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=xi,this._completeRedirectFn=hc,this._overrideRedirectResult=lc}async _openPopup(e,n,i,r){var o;M((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Mn(e,n,i,Rt(),r);return Fc(e,s,Xt())}async _openRedirect(e,n,i,r){await this._originValidation(e);const s=await Mn(e,n,i,Rt(),r);return za(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(M(s,"If manager is not set, promise should be"),s)}const i=this.initAndGetManager(e);return this.eventManagers[n]={promise:i},i.catch(()=>{delete this.eventManagers[n]}),i}async initAndGetManager(e){const n=await Pc(e),i=new pc(e);return n.register("authEvent",r=>(f(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:i.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:i},this.iframes[e._key()]=n,i}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(vt,{type:vt},r=>{var o;const s=(o=r==null?void 0:r[0])==null?void 0:o[vt];s!==void 0&&n(!!s),L(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=_c(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Ni()||Ti()||Kt()}}const jc=Vc;var Fn="@firebase/auth",Bn="1.13.3";/**
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
 */class Wc{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){f(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function qc(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function zc(t){we(new de("auth",(e,{options:n})=>{const i=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=i.options;f(o&&!o.includes(":"),"invalid-api-key",{appName:i.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Di(t)},l=new wa(i,r,s,c);return La(l,n),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,i)=>{e.getProvider("auth-internal").initialize()})),we(new de("auth-internal",e=>{const n=st(e.getProvider("auth").getImmediate());return(i=>new Wc(i))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ne(Fn,Bn,qc(t)),ne(Fn,Bn,"esm2020")}/**
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
 */const Gc=300,Kc=di("authIdTokenMaxAge")||Gc;let $n=null;const Jc=t=>async e=>{const n=e&&await e.getIdTokenResult(),i=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(i&&i>Kc)return;const r=n==null?void 0:n.token;$n!==r&&($n=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function Yc(t=Uo()){const e=mi(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Ca(t,{popupRedirectResolver:jc,persistence:[tc,ja,xi]}),i=di("authTokenSyncURL");if(i&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(i,location.origin);if(location.origin===s.origin){const o=Jc(s.toString());$a(n,o,()=>o(n.currentUser)),Ba(n,a=>o(a))}}const r=ws("auth");return r&&Pa(n,`http://${r}`),n}function Xc(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Sa({loadJS(t){return new Promise((e,n)=>{const i=document.createElement("script");i.setAttribute("src",t),i.onload=e,i.onerror=r=>{const s=S("internal-error");s.customData=r,n(s)},i.type="text/javascript",i.charset="UTF-8",Xc().appendChild(i)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});zc("Browser");const Qc=gi(window.FIREBASE_CONFIG),ct=Yc(Qc),Zc=new R,el=new P;let G=null,fe=null;const Nt=new Set,ke={get user(){return G},get profile(){return fe},get loggedIn(){return!!G},onChange(t){return Nt.add(t),t(G,fe),()=>Nt.delete(t)}};function Xi(){Nt.forEach(t=>t(G,fe))}async function Qi(){return G?G.getIdToken():null}async function Zi(t,e={}){const n=await Qi();return fetch(t,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...n?{Authorization:`Bearer ${n}`}:{}}})}async function tl(t){if(!t)return null;try{const e=await t.getIdToken(),n=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(n.ok)return await n.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:t.uid,display_name:t.displayName||"",email:t.email||"",photo_url:t.photoURL||""}}Ua(ct,async t=>{G=t,fe=t?await tl(t):null,Xi()});async function nl(){return(await Ji(ct,Zc)).user}async function il(){return(await Ji(ct,el)).user}async function Un(){await Ha(ct)}async function rl({display_name:t,photo_url:e}){const n={};t!==void 0&&(n.display_name=t),e!==void 0&&(n.photo_url=e);const i=await Zi(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(n)});if(!i.ok)throw new Error(await i.text());return fe=await i.json(),Xi(),fe}const{baseUrl:er}=window.BOOK_CONFIG;function sl(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function ol(){const t=document.getElementById("lib-dialog");t&&(t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),al())}function Hn(){const t=document.getElementById("lib-dialog");if(!t)return;t.classList.remove("open");const e=()=>t.classList.remove("is-visible");t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function al(){const t=document.getElementById("lib-loading");t.style.display="block",document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");try{const n=await Zi(`${er}/api/user/library`);if(!n.ok)throw new Error("Not authenticated");const i=await n.json();Ue("history",cl(i.history)),Ue("bookmarks",ll(i.bookmarks)),Ue("notes",ul(i.notes)),Ue("comments",dl(i.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}t.style.display="none";const e=document.querySelector(".lib-tab.is-active");tr((e==null?void 0:e.dataset.tab)||"history")}function Ue(t,e){document.getElementById(`lib-pane-${t}`).innerHTML=e}function tr(t){document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");const e=document.getElementById(`lib-pane-${t}`);e&&(e.style.display="block")}function lt(t){return t?new Date(t*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function ut(t,e){return`${er}/book/${t}?para=${e}`}function cl(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ut(e.book_id,e.para_id)}">
      <div class="lib-card-title">${Q(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${Q(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${lt(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function ll(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ut(e.book_id,e.para_id)}">
      <div class="lib-card-title">${Q(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${lt(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function ul(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ut(e.book_id,e.para_id)}">
      <div class="lib-card-title">${Q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${Q(e.text)}</div>
      <div class="lib-card-date">${lt(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function dl(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ut(e.book_id,e.para_id)}">
      <div class="lib-card-title">${Q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${Q(e.text)}</div>
      <div class="lib-card-date">${lt(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function Q(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function hl(){sl(),document.addEventListener("click",t=>{const e=t.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),tr(e.dataset.tab);return}if(t.target.closest("[data-close-lib]")){Hn();return}if(t.target.id==="lib-dialog"){Hn();return}})}function fl(){var t;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
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
</div>`)}function nr(t){const e=document.getElementById(t);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function it(t){const e=document.getElementById(t);if(!e)return;e.classList.remove("open");const n=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",n,{once:!0}),setTimeout(n,300)}function pl(){ee(),nr("auth-login-dialog")}function xn(){it("auth-login-dialog")}function ml(){ee(),rr(),nr("auth-profile-dialog")}function gl(){it("auth-profile-dialog")}function bl(){const t=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!t||!e)return;const n=e.getBoundingClientRect();t.style.top=`${n.bottom+6}px`,t.style.right=`${window.innerWidth-n.right}px`,t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open")))}function ee(){const t=document.getElementById("auth-user-menu");if(!t)return;t.classList.remove("open");const e=()=>{t.classList.remove("is-visible")};t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function yl(t){return(t||"?").trim().split(/\s+/).map(e=>{var n;return((n=e[0])==null?void 0:n.toUpperCase())||""}).join("").slice(0,2)||"?"}function ir(t,e,n){n!=null&&n.photo_url?(t.src=n.photo_url,t.hidden=!1,e.hidden=!0):(t.hidden=!0,e.hidden=!1,e.textContent=yl(n==null?void 0:n.display_name))}function rr(){const t=ke.profile;t&&(document.getElementById("profile-hero-name").textContent=t.display_name||"",document.getElementById("profile-hero-email").textContent=t.email||"",document.getElementById("profile-input-name").value=t.display_name||"",document.getElementById("profile-input-photo").value=t.photo_url||"",ir(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),t))}function _l(t,e){const n=document.getElementById("auth-avatar-btn"),i=document.getElementById("auth-avatar-img"),r=document.getElementById("auth-avatar-initials");if(n)if(t&&e){n.classList.add("is-signed-in"),ir(i,r,e);const s=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");s&&(s.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else n.classList.remove("is-signed-in"),i&&(i.hidden=!0),r&&(r.hidden=!1,r.textContent="👤")}function vl(){document.addEventListener("click",async t=>{var i;const e=t.target;if(e.closest("#auth-avatar-btn")){if(t.stopPropagation(),ke.loggedIn){const r=document.getElementById("auth-user-menu");r!=null&&r.classList.contains("is-visible")?ee():bl()}else pl();return}const n=(i=e.closest("[data-close]"))==null?void 0:i.dataset.close;if(n){it(n);return}if(e.classList.contains("auth-backdrop")&&e.id){it(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&ee(),e.closest("#btn-google")){He(!0);try{await nl(),xn()}catch(r){console.error("Google sign-in error:",r),Vn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{He(!1)}return}if(e.closest("#btn-facebook")){He(!0);try{await il(),xn()}catch(r){console.error("Facebook sign-in error:",r),Vn(r.code==="auth/popup-closed-by-user"||r.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${r.message||r.code||"unknown error"}`)}finally{He(!1)}return}if(e.closest("#btn-signout")){await Un(),gl();return}if(e.closest("#auth-menu-library-btn")){ee(),ol();return}if(e.closest("#auth-menu-profile-btn")){ml();return}if(e.closest("#auth-menu-signout-btn")){ee(),await Un();return}}),document.addEventListener("submit",async t=>{if(!t.target.closest("#auth-profile-form"))return;t.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),n=document.getElementById("profile-input-photo").value.trim(),i=document.getElementById("profile-status");i.textContent="Saving…",i.className="auth-status-msg";try{await rl({display_name:e,photo_url:n||void 0}),i.textContent="✓ Saved",i.classList.add("success"),rr()}catch(r){console.error("Profile update error:",r),i.textContent="Failed to save.",i.classList.add("error")}})}function He(t){["btn-google","btn-facebook"].forEach(e=>{const n=document.getElementById(e);n&&(n.disabled=t,n.classList.toggle("is-loading",t))})}function Vn(t){const e=document.getElementById("auth-login-error");e&&(e.textContent=t,e.style.display="block")}function Il(){fl(),vl(),ke.onChange(_l)}const It={android:{name:"Google Play",detect:()=>/Android/i.test(navigator.userAgent),url:"https://play.google.com/store/apps/details?id=com.dn.epitaka"}},jn="epitaka_app_banner_shown",sr="epitaka_app_banner_dismissed",El=720*60*60*1e3,wl=9e3,Sl=400;function Al(){for(const t of Object.keys(It))try{if(It[t].detect())return It[t]}catch{}return null}function kl(){try{const t=parseInt(localStorage.getItem(sr)||"0",10);return t>0&&Date.now()-t<El}catch{return!1}}function Wn(t){t.classList.remove("show"),t.classList.add("hide"),setTimeout(()=>t.remove(),Sl)}function Tl(){const t=Al();if(!t)return;let e=!1;try{e=sessionStorage.getItem(jn)==="1"}catch{}if(e||kl())return;try{sessionStorage.setItem(jn,"1")}catch{}const n=document.createElement("div");n.className="app-banner",n.setAttribute("role","status"),n.setAttribute("aria-label","E-Piṭaka mobile app"),n.innerHTML=`
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
  `,n.querySelector(".app-banner-close").addEventListener("click",()=>{try{localStorage.setItem(sr,String(Date.now()))}catch{}clearTimeout(i),Wn(n)}),document.body.appendChild(n),requestAnimationFrame(()=>requestAnimationFrame(()=>n.classList.add("show")));const i=setTimeout(()=>Wn(n),wl)}const Zt="epitaka_sidebar_state";function Cl(t){try{sessionStorage.setItem(Zt,JSON.stringify(t))}catch{}}function en(){try{const t=sessionStorage.getItem(Zt);return t?JSON.parse(t):null}catch{return null}}function tn(){try{sessionStorage.removeItem(Zt)}catch{}}const nn="epitaka_sidebar_pin";function or(t){try{localStorage.setItem(nn,JSON.stringify(t))}catch{}}function ar(){try{const t=localStorage.getItem(nn);return t?JSON.parse(t):null}catch{return null}}function Ll(){try{localStorage.removeItem(nn)}catch{}}const{baseUrl:pe="",lang:cr="en"}=window.BOOK_CONFIG||{},lr=["library","search","toc","outline"],ur={library:"Library",search:"Search",toc:"Table of Contents",outline:"Outline"},Pl=[{panel:"library",icon:"📚",label:"Library"},{panel:"search",icon:"🔍",label:"Search"},{panel:"toc",icon:"☰",label:"Table of contents"},{panel:"outline",icon:"📋",label:"Outline of this book"},{panel:"dict",icon:"📖",label:"Dictionary"}];var Jn,Yn;const dr=((Yn=(Jn=en())==null?void 0:Jn.search)==null?void 0:Yn.typeId)||_r[0].id;let _e,j,oe,hr,fr,y,xe=null,Te="",Dt="library";function Rl({bookId:t=""}={}){return _e||(Te=t,Ol(),Mt(),Bl(),$l(),Ul(),Hl(),Gl(),Nl()),qn}const qn={openPanel:me,close:C,isOpen:()=>j.classList.contains("open")};function Ol(){_e=document.createElement("div"),_e.id="sb-root",_e.innerHTML=`
    <nav id="sb-activity" aria-label="Sidebar">
      ${Pl.map(t=>`
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
        ${lr.map(t=>`
          <button type="button" class="sb-tab" data-panel="${t}"
                  role="tab" aria-selected="false">${ur[t]}</button>
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
          ${vr(K,dr)}
          <div id="home-filter-wrap"></div>
        </div>
        <div id="home-results-panel"></div>
      </div>

      <div id="sb-panel-toc" class="sb-panel" role="tabpanel">
        <div class="sb-toc-head">
          <a id="sb-toc-outline" class="sb-outline-link"
             href="${pe}/en/book/${Te}/outline">📋 Outline of this book</a>
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
    </div>
  `,document.body.appendChild(_e),oe=document.createElement("div"),oe.id="sb-backdrop",document.body.appendChild(oe),j=document.getElementById("sb-drawer"),hr=document.getElementById("sb-activity"),fr=document.getElementById("sb-panel-title"),y=document.getElementById("toc-toggle-btn")}async function Nl(){var i,r;const t=await xl(),e=(t==null?void 0:t.hierarchy)||{};xe=new Ir({baseUrl:pe,lang:cr,hierarchy:e,ids:K,initialState:{searchTypeId:dr},onResultSelect:s=>{Cl({panel:"search",search:xe.getState()}),window.location.href=s},onShowResults:()=>Ml(),onShowBooks:()=>Fl()}),xe.bind(),Vl((t==null?void 0:t.menu)||{});const n=en();(i=n==null?void 0:n.search)!=null&&i.query?(me("search"),xe.restore(n.search)):Ce()&&me(((r=ar())==null?void 0:r.panel)||"library")}function me(t){if(t==="dict"){Dl();return}lr.includes(t)||(t="library"),Dt=t,Ce()&&or({pinned:!0,panel:t}),document.querySelectorAll("#sb-root .sb-panel").forEach(e=>e.classList.toggle("active",e.id===`sb-panel-${t}`)),document.querySelectorAll("#sb-root .sb-activity-btn").forEach(e=>e.classList.toggle("active",e.dataset.panel===t)),document.querySelectorAll("#sb-root .sb-tab").forEach(e=>{const n=e.dataset.panel===t;e.classList.toggle("active",n),e.setAttribute("aria-selected",String(n))}),fr.textContent=ur[t],j.classList.add("open"),oe.classList.add("show"),document.body.classList.add("sb-drawer-open"),y==null||y.setAttribute("aria-expanded","true"),t==="outline"&&Jl(),requestAnimationFrame(()=>{const e=t==="search"?document.getElementById(K.searchInput):t==="toc"?document.getElementById("toc-search"):t==="outline"?document.getElementById("sb-outline-full"):document.getElementById("sb-library-filter");e==null||e.focus({preventScroll:!0})})}function C(){var t;j.classList.remove("open"),oe.classList.remove("show"),document.body.classList.remove("sb-drawer-open"),y==null||y.setAttribute("aria-expanded","false"),(t=document.activeElement)!=null&&t.closest("#sb-root")&&(y==null||y.focus())}function Dl(){const t=document.getElementById("dict-panel");if(!t)return;const e=t.classList.contains("open"),n=document.querySelector('#sb-activity .sb-activity-btn[data-panel="dict"]');e?(Y(!1),n==null||n.classList.remove("active"),n==null||n.setAttribute("aria-pressed","false")):(Y(!0),n==null||n.classList.add("active"),n==null||n.setAttribute("aria-pressed","true"),C(),requestAnimationFrame(()=>{var i;return(i=document.getElementById("dict-word-input"))==null?void 0:i.focus({preventScroll:!0})}))}function Ml(){var t,e;(t=document.getElementById(K.resultsPanel))==null||t.classList.add("active"),(e=document.getElementById(K.filterWrap))==null||e.classList.add("show")}function Fl(){var t,e;(t=document.getElementById(K.resultsPanel))==null||t.classList.remove("active"),(e=document.getElementById(K.filterWrap))==null||e.classList.remove("show")}function Bl(){y==null||y.addEventListener("click",t=>{var n;if(t.preventDefault(),t.stopPropagation(),j.classList.contains("open")){C();return}const e=en();me((n=e==null?void 0:e.search)!=null&&n.query?"search":"library")})}function $l(){hr.addEventListener("click",t=>{const e=t.target.closest(".sb-activity-btn");if(!e)return;const n=e.dataset.panel;n===Dt&&j.classList.contains("open")&&n!=="dict"&&!Ce()?C():me(n)}),document.getElementById("sb-tabs").addEventListener("click",t=>{const e=t.target.closest(".sb-tab");e&&me(e.dataset.panel)}),document.getElementById("sb-pin").addEventListener("click",t=>{t.stopPropagation(),Ce()?(Ll(),Mt(),C()):(or({pinned:!0,panel:Dt}),Mt())}),document.getElementById("sb-close").addEventListener("click",C)}function Ce(){var t;return!!((t=ar())!=null&&t.pinned)}function Mt(){const t=document.getElementById("sb-pin"),e=Ce();t==null||t.classList.toggle("active",e),t==null||t.setAttribute("aria-pressed",String(e)),t==null||t.setAttribute("aria-label",e?"Unpin sidebar":"Pin sidebar open"),t==null||t.setAttribute("title",e?"Unpin sidebar":"Keep sidebar open"),document.body.classList.toggle("sb-pinned",e)}function Ul(){oe.addEventListener("click",C)}function Hl(){document.addEventListener("keydown",t=>{t.key==="Escape"&&j.classList.contains("open")&&C()})}async function xl(){try{const t=await fetch(`${pe}/api/menu`);if(!t.ok)throw new Error(`HTTP ${t.status}`);return await t.json()}catch(t){return console.warn("[sidebar] failed to load menu",t),{menu:{},hierarchy:{}}}}function Vl(t){const e=document.getElementById("sb-library-tree");if(!e)return;e.innerHTML="";const n=Ql(Object.keys(t));for(const i of n)e.appendChild(jl(i,t[i]||{}));zl(e)}function jl(t,e){const n=document.createElement("div");n.className="sb-cat";const i=document.createElement("button");i.type="button",i.className="sb-cat-title",i.setAttribute("aria-expanded","true"),i.innerHTML=`<span>${ge(t)}</span><span class="sb-caret" aria-hidden="true">▾</span>`;const r=document.createElement("div");r.className="sb-cat-body open";for(const s of Zl(Object.keys(e)))r.appendChild(Wl(e[s]||{},s));return i.addEventListener("click",()=>Xl(i,r)),n.append(i,r),n}function Wl(t,e){const n=document.createElement("div");n.className="book-nikaya";const i=t[""]||[],r=Object.keys(t).filter(a=>a!=="");if(!r.length){const a=document.createElement("div");a.className="book-nikaya-title open",a.innerHTML=`${ge(e)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const c=document.createElement("ol");return c.className="book-nikaya-list open",i.forEach(l=>{const d=document.createElement("li");d.appendChild(Ft(l)),c.appendChild(d)}),n.append(a,c),a.addEventListener("click",()=>{a.classList.toggle("open"),c.classList.toggle("open")}),n}const s=document.createElement("div");s.className="book-nikaya-title open",s.innerHTML=`${ge(e)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const o=document.createElement("ol");o.className="book-nikaya-list open",i.length&&i.forEach(a=>{const c=document.createElement("li");c.appendChild(Ft(a)),o.appendChild(c)});for(const a of r){const c=document.createElement("li");c.appendChild(ql(a,t[a])),o.appendChild(c)}return s.addEventListener("click",()=>{s.classList.toggle("open"),o.classList.toggle("open")}),n.append(s,o),n}function ql(t,e){const n=document.createElement("div");n.className="sb-sub";const i=document.createElement("div");i.className="book-nikaya-title sb-sub-title open",i.innerHTML=`${ge(t)} <span class="nikaya-chevron" aria-hidden="true">▶</span>`;const r=document.createElement("ol");return r.className="book-nikaya-list open",e.forEach(s=>{const o=document.createElement("li");o.appendChild(Ft(s)),r.appendChild(o)}),i.addEventListener("click",()=>{i.classList.toggle("open"),r.classList.toggle("open")}),n.append(i,r),n}function Ft([t,e]){const n=document.createElement("a");return n.className="book-entry"+(t===Te?" current":""),n.href=`${pe}/${cr}/book/${t}`,n.dataset.bookId=t,n.innerHTML=`<span class="book-name">${ge(e)}</span>`,n.addEventListener("click",()=>tn()),n}function zl(t){const e=document.getElementById("sb-library-filter");if(!e)return;const n=[...t.querySelectorAll(".book-entry")],i=n.map(s=>Ge(s.textContent||"").toLowerCase()),r=n.map(s=>s.closest("li"));e.addEventListener("input",()=>{const s=Ge(e.value).toLowerCase();n.forEach((o,a)=>{const c=!s||i[a].includes(s);o.style.display=c?"":"none",r[a]&&(r[a].style.display=c?"":"none")}),t.querySelectorAll(".sb-cat, .book-nikaya, .sb-sub").forEach(o=>{var l,d;const a=[...o.querySelectorAll(".book-entry")].some(h=>h.style.display!=="none");if(o.style.display=!s||a?"":"none",!s||!a)return;const c=o.querySelector(".sb-cat-body, .book-nikaya-list");if(c){c.classList.add("open");const h=c.previousElementSibling;(l=h==null?void 0:h.classList)!=null&&l.contains("sb-cat-title")&&h.setAttribute("aria-expanded","true"),(d=h==null?void 0:h.classList)!=null&&d.contains("book-nikaya-title")&&h.classList.add("open")}}),t.querySelectorAll("li").forEach(o=>{const a=[...o.querySelectorAll(".book-entry")].some(c=>c.style.display!=="none");o.style.display=a?"":"none"})})}function Gl(){const t=document.getElementById("toc-list"),e=document.getElementById("toc-search");document.querySelectorAll(".section-block").forEach(s=>{var h,p;const o=s.dataset.paraId,a=s.querySelector(".section-heading-link, .section-heading-empty");if(!a||!o)return;const c=a.dataset.level||1,l=(p=(h=a.querySelector(".section-heading-text"))==null?void 0:h.textContent)==null?void 0:p.trim();if(!l)return;const d=document.createElement("li");d.innerHTML=`<div class="toc-item" role="button" tabindex="0" data-para-id="${o}" data-level="${c}"><span class="toc-item-text pali-text"></span></div>`,d.querySelector(".toc-item-text").textContent=l,t.appendChild(d)});const n=[...t.querySelectorAll(".toc-item")],i=n.map(s=>Ge(s.textContent).toLowerCase());Xn(e,{mode:"both",onConvert:s=>{e.value=s,e.dispatchEvent(new Event("input"))}}),e.addEventListener("input",()=>{const s=Ge(e.value).toLowerCase();n.forEach((o,a)=>{o.closest("li").style.display=!s||i[a].includes(s)?"":"none"})}),n.forEach(s=>{s.addEventListener("click",()=>{const o=parseInt(s.dataset.paraId);window.innerWidth<768&&C(),tn();const a=document.querySelector(`.section-block[data-para-id="${o}"]`),c=a==null?void 0:a.querySelector(".section-heading-link");c!=null&&c.href&&(window.location.href=c.href)}),s.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),s.click())})});const r=new IntersectionObserver(s=>{for(const o of s){if(!o.isIntersecting)continue;const a=parseInt(o.target.dataset.paraId);Kl(a)}},{rootMargin:"-52px 0px -67% 0px"});document.querySelectorAll(".section-block").forEach(s=>r.observe(s))}function Kl(t){document.querySelectorAll("#toc-list .toc-item").forEach(e=>{const n=parseInt(e.dataset.paraId)===t;e.classList.toggle("active",n),n&&j.classList.contains("open")&&e.scrollIntoView({block:"nearest"})})}let zn=!1;function Jl(){const t=document.getElementById("sb-outline-tree"),e=document.getElementById("sb-outline-full"),n=document.querySelector(".sb-outline-loading");!t||zn||(zn=!0,e&&(e.href=`${pe}/en/book/${Te}/outline`),(async()=>{try{const i=await fetch(`${pe}/api/outline/${encodeURIComponent(Te)}`);if(!i.ok)throw new Error(`HTTP ${i.status}`);const r=await i.json();e&&r.outline_url&&(e.href=r.outline_url),Yl(t,r.groups||[])}catch(i){console.warn("[sidebar] failed to load outline",i),t&&(t.innerHTML='<div class="sb-outline-empty">Outline not available.</div>')}finally{n&&(n.style.display="none")}})())}function Yl(t,e){if(t.innerHTML="",!e.length){t.innerHTML='<div class="sb-outline-empty">No sections found for this book.</div>';return}for(const n of e){const i=document.createElement("div");i.className="sb-outline-vagga";const r=document.createElement("div");r.className="sb-outline-vagga-title open",r.innerHTML=`${ge(n.title||"")}<span class="sb-caret" aria-hidden="true">▾</span>`;const s=document.createElement("div");s.className="sb-outline-vagga-body open",r.addEventListener("click",()=>{const o=s.classList.toggle("open");r.classList.toggle("open",o)});for(const o of n.suttas||[]){const a=document.createElement("div");if(a.className="sb-outline-sutta",o.title){const l=document.createElement("div");l.className="sb-outline-sutta-title",l.textContent=o.title,a.appendChild(l)}const c=document.createElement("ol");c.className="sb-outline-list";for(const l of o.sections||[]){const d=document.createElement("li");d.className="sb-outline-item";const h=document.createElement("a");if(h.className="sb-outline-item-link pali-text",h.href=l.book_url||"#",h.textContent=l.title||"Section "+l.para_id,h.addEventListener("click",()=>{window.innerWidth<768&&C(),tn()}),d.appendChild(h),l.study_url){const p=document.createElement("a");p.className="sb-outline-study",p.href=l.study_url,p.target="_blank",p.rel="noopener noreferrer",p.title=l.study_title||"Study guide",p.setAttribute("aria-label","Study guide"),p.textContent="📖",d.appendChild(p)}c.appendChild(d)}a.appendChild(c),s.appendChild(a)}i.append(r,s),t.appendChild(i)}}function Xl(t,e){const n=e.classList.toggle("open");t.setAttribute("aria-expanded",String(n))}function Ql(t){const e=["Mūla","Aṭṭhakathā","Ṭīkā"];return[...e.filter(n=>t.includes(n)),...t.filter(n=>!e.includes(n))]}function Zl(t){const e=["Vinaya","Suttanta","Sutta","Abhidhamma"];return[...e.filter(n=>t.includes(n)),...t.filter(n=>!e.includes(n))]}function ge(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const{bookId:pr,baseUrl:Gn,lang:Kn,bookref:eu}=window.BOOK_CONFIG,Et=new WeakMap,tu=document.getElementById("settings-btn"),ae=document.getElementById("settings-modal"),nu=document.getElementById("settings-form"),iu=document.getElementById("settings-cancel");Rl({bookId:pr});const Bt=window.REF_LINKS||{};console.debug("[REF_LINKS] loaded:",Object.keys(Bt).length,"keys",Bt);const ze=Object.keys(Bt).map(Number).sort((t,e)=>t-e);console.debug("[REF_LINKS] sorted para_ids:",ze);function ru(t){let e=0,n=ze.length-1,i=-1;for(;e<=n;){const r=e+n>>>1;ze[r]<=t?(i=ze[r],e=r+1):n=r-1}return i}const mr=new IntersectionObserver(t=>{let e=1/0;for(const n of t){if(!n.isIntersecting)continue;const i=n.target.id,r=i&&i.match(/^p-(\d+)-l-\d+$/);if(r){const s=parseInt(r[1]);s<e&&(e=s)}}if(e<1/0){const n=ru(e);console.debug("[sentinel] visible sentence para_id:",e,"→ nearest ref:",n),n>0&&au(n)}},{rootMargin:"0px 0px -10% 0px"});function su(){document.querySelectorAll(".section-content.open .sentence-row").forEach(t=>mr.observe(t))}su();function gr(t){document.querySelectorAll(".pali-text").forEach(e=>{Et.has(e)||Et.set(e,e.innerHTML);const n=Et.get(e);e.innerHTML=t===u.RO?n:ou(n,t)})}function ou(t,e){return t.replace(/(<[^>]+>)|([^<]+)/g,(n,i,r)=>i||Ke.convert(Ke.convertFromMixed(r),e))}function au(t){const e=["mula_ref","attha_ref","tika_ref"],n={mula_ref:"ref-mula",attha_ref:"ref-attha",tika_ref:"ref-tika"},r=(window.REF_LINKS||{})[t];if(r)for(const s of e){const o=r[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);if(c){const l=o[a],d=[Kn,"book",l.book_id,l.slug].filter(Boolean).join("/");c.href=Gn+"/"+d+"#"+l.para_id}}}else for(const s of e){const o=eu[s]||[];for(let a=0;a<o.length;a++){const c=document.getElementById(`${n[s]}-${a+1}`);c&&(c.href=`${Gn}/${Kn}/book_ref/${o[a].book_id}?ref=${pr}&para_id=${t}`)}}}tu.addEventListener("click",()=>{const t=rt();Zr(t),ti(document.getElementById("pali-script-select"),t.paliScript),ae.classList.add("show")});iu.addEventListener("click",()=>ae.classList.remove("show"));ae.addEventListener("click",t=>{t.target===ae&&ae.classList.remove("show")});nu.addEventListener("submit",t=>{t.preventDefault();const e=es();Xr(e),ei(e),gr(e.paliScript),ae.classList.remove("show")});function cu(){if(!window.BOOK_CONFIG)return;const{baseUrl:t,bookId:e}=window.BOOK_CONFIG;let n=null,i=null,r=null;function s(a){i=a,ke.loggedIn&&a!==n&&(n=a,clearTimeout(r),r=setTimeout(async()=>{var _,A;const c=document.querySelector(`.section-block[data-para-id="${a}"]`),l=c==null?void 0:c.querySelector(".section-heading-text"),d=((_=l==null?void 0:l.textContent)==null?void 0:_.trim())||"",h=document.querySelector(".book-title"),p=((A=h==null?void 0:h.textContent)==null?void 0:A.trim())||"";try{const ye=await Qi();if(!ye)return;fetch(`${t}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ye}`},body:JSON.stringify({para_id:a,section_title:d,book_title:p})})}catch{}},5e3))}const o=new IntersectionObserver(a=>{for(const c of a){if(!c.isIntersecting)continue;const l=parseInt(c.target.dataset.paraId);isNaN(l)||s(l)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(a=>o.observe(a)),ke.onChange(a=>{a&&i!==null&&s(i)})}document.addEventListener("DOMContentLoaded",async()=>{ns(document.getElementById("main-content"));const t=rt();ei(t),gr(t.paliScript),ti(document.getElementById("pali-script-select"),t.paliScript),Il(),hl(),Tl(),cu();function e(o){const a=document.querySelectorAll(".section-block");let c=null;for(const l of a){const d=parseInt(l.dataset.paraId);!isNaN(d)&&d<=o&&(c=l)}return c}function n(o){const a=document.querySelectorAll('[id^="p-'+o+'-l-"]');for(const c of a){const l=c.id.match(/^p-(\d+)-l-(\d+)$/);if(l&&parseInt(l[1])===o)return c}return null}function i(o){if(!o)return;const a=o.querySelector(".section-content");a&&!a.classList.contains("open")&&(a.classList.add("open"),a.setAttribute("aria-hidden","false"),a.querySelectorAll(".sentence-row").forEach(c=>mr.observe(c)))}function r(o){setTimeout(()=>{o.scrollIntoView({behavior:"smooth",block:"center"}),o.classList.add("highlight-flash")},200)}const s=window.location.hash.replace(/^#/,"");if(s){const o=s.split("-"),a=parseInt(o[0]),c=o.length>=2?parseInt(o[1]):NaN;if(!isNaN(a))if(isNaN(c)){let l=n(a);if(!l){const d=e(a);i(d),l=n(a)}if(l)r(l);else{const d=e(a);d&&r(d)}}else{const l="p-"+a+"-l-"+c;let d=document.getElementById(l);if(!d){const h=e(a);i(h),d=document.getElementById(l)}if(d)r(d);else{const h=e(a);h&&r(h)}}}else if(window.BOOK_CONFIG.paraId){const o=e(window.BOOK_CONFIG.paraId);o&&setTimeout(()=>{o.scrollIntoView({behavior:"smooth",block:"start"})},200)}});

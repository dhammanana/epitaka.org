import{i as _n,r as Pr}from"./pali_typing.chunk.js";const l=Object.freeze({SI:"si",HI:"hi",RO:"ro",THAI:"th",LAOS:"lo",MY:"my",KM:"km",BENG:"be",ASSE:"as",GURM:"gm",THAM:"tt",GUJA:"gj",TELU:"te",KANN:"ka",MALA:"mm",BRAH:"br",TIBT:"tb",CYRL:"cy"}),bn=new Map([[l.SI,["Sinhala","සිංහල",[[3456,3583]],{f:"sl_flag.png"}]],[l.HI,["Devanagari","देवनागरी",[[2304,2431]],{f:"in_flag.png"}]],[l.RO,["Roman","Roman",[[0,383],[7680,7935]],{f:"uk_flag.png"}]],[l.THAI,["Thai","ไทย",[[3584,3711],63247,63232],{f:"th_flag.png"}]],[l.LAOS,["Laos","ລາວ",[[3712,3839]],{f:"laos_flag.png"}]],[l.MY,["Myanmar","ဗမာစာ",[[4096,4223]],{f:"my_flag.png"}]],[l.KM,["Khmer","ភាសាខ្មែរ",[[6016,6143]],{f:"kh_flag.png"}]],[l.BENG,["Bengali","বাংলা",[[2432,2559]],{f:"bangla_flag.png",g:"indian"}]],[l.ASSE,["Assamese","অসমীয়া",[],{f:"bangla_flag.png",g:"indian"}]],[l.GURM,["Gurmukhi","ਗੁਰਮੁਖੀ",[[2560,2687]],{g:"indian"}]],[l.GUJA,["Gujarati","ગુજરાતી",[[2688,2815]],{g:"indian"}]],[l.TELU,["Telugu","తెలుగు",[[3072,3199]],{g:"indian"}]],[l.KANN,["Kannada","ಕನ್ನಡ",[[3200,3327]],{g:"indian"}]],[l.MALA,["Malayalam","മലയാളം",[[3328,3455]],{g:"indian"}]],[l.THAM,["Tai Tham","Tai Tham LN",[[6688,6831]],{c:"beta-script",g:"other"}]],[l.BRAH,["Brahmi","Brāhmī",[[55300,55300],[56320,56447]],{g:"other"}]],[l.TIBT,["Tibetan","བོད་སྐད།",[[3840,4095]],{f:"tibet_flag.png",c:"larger",g:"other"}]],[l.CYRL,["Cyrillic","кириллица",[[1024,1279],[768,879]],{f:"russia_flag.png",g:"other"}]]]);function Rr(t){for(let e of bn)for(let n of e[1][2])if(Array.isArray(n)&&t>=n[0]&&t<=n[1]||Number.isInteger(n)&&t==n)return e[0];return-1}const te={[l.SI]:0,[l.HI]:1,[l.RO]:2,[l.THAI]:3,[l.LAOS]:4,[l.MY]:5,[l.KM]:6,[l.BENG]:7,[l.ASSE]:7,[l.GURM]:8,[l.THAM]:9,[l.GUJA]:10,[l.TELU]:11,[l.KANN]:12,[l.MALA]:13,[l.BRAH]:14,[l.TIBT]:15,[l.CYRL]:16},Lr=[["අ","अ","a","อ","ອ","အ","អ","অ","ਅ","ᩋ","અ","అ","ಅ","അ","𑀅","ཨ","а"],["ආ","आ","ā","อา","ອາ","အာ","អា","আ","ਆ","ᩌ","આ","ఆ","ಆ","ആ","𑀆","ཨཱ","а̄"],["ඉ","इ","i","อิ","ອິ","ဣ","ឥ","ই","ਇ","ᩍ","ઇ","ఇ","ಇ","ഇ","𑀇","ཨི","и"],["ඊ","ई","ī","อี","ອີ","ဤ","ឦ","ঈ","ਈ","ᩎ","ઈ","ఈ","ಈ","ഈ","𑀈","ཨཱི","ӣ"],["උ","उ","u","อุ","ອຸ","ဥ","ឧ","উ","ਉ","ᩏ","ઉ","ఉ","ಉ","ഉ","𑀉","ཨུ","у"],["ඌ","ऊ","ū","อู","ອູ","ဦ","ឩ","ঊ","ਊ","ᩐ","ઊ","ఊ","ಊ","ഊ","𑀊","ཨཱུ","ӯ"],["එ","ए","e","อเ","ອເ","ဧ","ឯ","এ","ਏ","ᩑ","એ","ఏ","ಏ","ഏ","𑀏","ཨེ","е"],["ඔ","ओ","o","อโ","ອໂ","ဩ","ឱ","ও","ਓ","ᩒ","ઓ","ఓ","ಓ","ഓ","𑀑","ཨོ","о"],["ං","ं","ṃ","ํ","ໍ","ံ","ំ","ং","ਂ","ᩴ","ં","ం","ಂ","ം","𑀁","ཾ","м̣"],["ඃ","ः","ḥ","ะ","ະ","း","ះ","ঃ","ਃ","ᩡ","ઃ","ః","ಃ","ഃ","𑀂","ཿ","х̣"],["්","्","","ฺ","຺","္","្","্","੍","᩠","્","్","್","്","𑁆","྄",""],["0","०","0","๐","໐","၀","០","০","੦","᪐","૦","౦","೦","൦","𑁦","༠","0"],["1","१","1","๑","໑","၁","១","১","੧","᪑","૧","౧","೧","൧","𑁧","༡","1"],["2","२","2","๒","໒","၂","២","২","੨","᪒","૨","౨","೨","൨","𑁨","༢","2"],["3","३","3","๓","໓","၃","៣","৩","੩","᪓","૩","౩","೩","൩","𑁩","༣","3"],["4","४","4","๔","໔","၄","៤","৪","੪","᪔","૪","౪","೪","൪","𑁪","༤","4"],["5","५","5","๕","໕","၅","៥","৫","੫","᪕","૫","౫","೫","൫","𑁫","༥","5"],["6","६","6","๖","໖","၆","៦","৬","੬","᪖","૬","౬","೬","൬","𑁬","༦","6"],["7","७","7","๗","໗","၇","៧","৭","੭","᪗","૭","౭","೭","൭","𑁭","༧","7"],["8","८","8","๘","໘","၈","៨","৮","੮","᪘","૮","౮","೮","൮","𑁮","༨","8"],["9","९","9","๙","໙","၉","៩","৯","੯","᪙","૯","౯","೯","൯","𑁯","༩","9"],["ඓ","ऐ","ai"],["ඖ","औ","au"],["ඍ","ऋ","ṛ"],["ඎ","ॠ","ṝ"],["ඏ","ऌ","l̥"],["ඐ","ॡ","ḹ"]],Or=[["ක","क","k","ก","ກ","က","ក","ক","ਕ","ᨠ","ક","క","ಕ","ക","𑀓","ཀ","к"],["ඛ","ख","kh","ข","ຂ","ခ","ខ","খ","ਖ","ᨡ","ખ","ఖ","ಖ","ഖ","𑀔","ཁ","кх"],["ග","ग","g","ค","ຄ","ဂ","គ","গ","ਗ","ᨣ","ગ","గ","ಗ","ഗ","𑀕","ག","г"],["ඝ","घ","gh","ฆ","ຆ","ဃ","ឃ","ঘ","ਘ","ᨥ","ઘ","ఘ","ಘ","ഘ","𑀖","གྷ","гх"],["ඞ","ङ","ṅ","ง","ງ","င","ង","ঙ","ਙ","ᨦ","ઙ","ఙ","ಙ","ങ","𑀗","ང","н̇"],["ච","च","c","จ","ຈ","စ","ច","চ","ਚ","ᨧ","ચ","చ","ಚ","ച","𑀘","ཙ","ч"],["ඡ","छ","ch","ฉ","ຉ","ဆ","ឆ","ছ","ਛ","ᨨ","છ","ఛ","ಛ","ഛ","𑀙","ཚ","чх"],["ජ","ज","j","ช","ຊ","ဇ","ជ","জ","ਜ","ᨩ","જ","జ","ಜ","ജ","𑀚","ཛ","дж"],["ඣ","झ","jh","ฌ","ຌ","ဈ","ឈ","ঝ","ਝ","ᨫ","ઝ","ఝ","ಝ","ഝ","𑀛","ཛྷ","джх"],["ඤ","ञ","ñ","ญ","ຎ","ဉ","ញ","ঞ","ਞ","ᨬ","ઞ","ఞ","ಞ","ഞ","𑀜","ཉ","н̃"],["ට","ट","ṭ","ฏ","ຏ","ဋ","ដ","ট","ਟ","ᨭ","ટ","ట","ಟ","ട","𑀝","ཊ","т̣"],["ඨ","ठ","ṭh","ฐ","ຐ","ဌ","ឋ","ঠ","ਠ","ᨮ","ઠ","ఠ","ಠ","ഠ","𑀞","ཋ","т̣х"],["ඩ","ड","ḍ","ฑ","ຑ","ဍ","ឌ","ড","ਡ","ᨯ","ડ","డ","ಡ","ഡ","𑀟","ཌ","д̣"],["ඪ","ढ","ḍh","ฒ","ຒ","ဎ","ឍ","ঢ","ਢ","ᨰ","ઢ","ఢ","ಢ","ഢ","𑀠","ཌྷ","д̣х"],["ණ","ण","ṇ","ณ","ຓ","ဏ","ណ","ণ","ਣ","ᨱ","ણ","ణ","ಣ","ണ","𑀡","ཎ","н̣"],["ත","त","t","ต","ຕ","တ","ត","ত","ਤ","ᨲ","ત","త","ತ","ത","𑀢","ཏ","т"],["ථ","थ","th","ถ","ຖ","ထ","ថ","থ","ਥ","ᨳ","થ","థ","ಥ","ഥ","𑀣","ཐ","тх"],["ද","द","d","ท","ທ","ဒ","ទ","দ","ਦ","ᨴ","દ","ద","ದ","ദ","𑀤","ད","д"],["ධ","ध","dh","ธ","ຘ","ဓ","ធ","ধ","ਧ","ᨵ","ધ","ధ","ಧ","ധ","𑀥","དྷ","дх"],["න","न","n","น","ນ","န","ន","ন","ਨ","ᨶ","ન","న","ನ","ന","𑀦","ན","н"],["ප","प","p","ป","ປ","ပ","ប","প","ਪ","ᨸ","પ","ప","ಪ","പ","𑀧","པ","п"],["ඵ","फ","ph","ผ","ຜ","ဖ","ផ","ফ","ਫ","ᨹ","ફ","ఫ","ಫ","ഫ","𑀨","ཕ","пх"],["බ","ब","b","พ","ພ","ဗ","ព","ব","ਬ","ᨻ","બ","బ","ಬ","ബ","𑀩","བ","б"],["භ","भ","bh","ภ","ຠ","ဘ","ភ","ভ","ਭ","ᨽ","ભ","భ","ಭ","ഭ","𑀪","བྷ","бх"],["ම","म","m","ม","ມ","မ","ម","ম","ਮ","ᨾ","મ","మ","ಮ","മ","𑀫","མ","м"],["ය","य","y","ย","ຍ","ယ","យ","য","ਯ","ᨿ","ય","య","ಯ","യ","𑀬","ཡ","й"],["ර","र","r","ร","ຣ","ရ","រ","র","ਰ","ᩁ","ર","ర","ರ","ര","𑀭","ར","р"],["ල","ल","l","ล","ລ","လ","ល","ল","ਲ","ᩃ","લ","ల","ಲ","ല","𑀮","ལ","л"],["ළ","ळ","ḷ","ฬ","ຬ","ဠ","ឡ","ল়","ਲ਼","ᩊ","ળ","ళ","ಳ","ള","𑀴","ལ༹","л̣"],["ව","व","v","ว","ວ","ဝ","វ","ৰ","ਵ","ᩅ","વ","వ","ವ","വ","𑀯","ཝ","в"],["ස","स","s","ส","ສ","သ","ស","স","ਸ","ᩈ","સ","స","ಸ","സ","𑀲","ས","с"],["හ","ह","h","ห","ຫ","ဟ","ហ","হ","ਹ","ᩉ","હ","హ","ಹ","ഹ","𑀳","ཧ","х"],["ශ","श","ś"],["ෂ","ष","ş"]],Dr=[["ා","ा","ā","า","າ","ာ","ា","া","ਾ","ᩣ","ા","ా","ಾ","ാ","𑀸","ཱ","а̄"],["ි","ि","i","ิ","ິ","ိ","ិ","ি","ਿ","ᩥ","િ","ి","ಿ","ി","𑀺","ི","и"],["ී","ी","ī","ี","ີ","ီ","ី","ী","ੀ","ᩦ","ી","ీ","ೀ","ീ","𑀻","ཱི","ӣ"],["ු","ु","u","ุ","ຸ","ု","ុ","ু","ੁ","ᩩ","ુ","ు","ು","ു","𑀼","ུ","у"],["ූ","ू","ū","ู","ູ","ူ","ូ","ূ","ੂ","ᩪ","ૂ","ూ","ೂ","ൂ","𑀽","ཱུ","ӯ"],["ෙ","े","e","เ","ເ","ေ","េ","ে","ੇ","ᩮ","ે","ే","ೇ","േ","𑁂","ེ","е"],["ො","ो","o","โ","ໂ","ော","ោ","ো","ੋ","ᩮᩣ","ો","ో","ೋ","ോ","𑁄","ོ","о"],["ෛ","ै","ai"],["ෞ","ौ","au"],["ෘ","ृ","ṛ"],["ෲ","ॄ","ṝ"],["ෟ","ॢ","l̥"],["ෳ","ॣ","ḹ"]];function Nr(t,e,n=""){return t.replace(/\u0DCA([\u0DBA\u0DBB])/g,"්‍$1")}function Mr(t){return t=t.replace(/ඒ/g,"එ").replace(/ඕ/g,"ඔ"),t.replace(/ේ/g,"ෙ").replace(/ෝ/g,"ො")}function Br(t,e,n=""){return t=t.replace(/[,;]/g,"၊"),t=t.replace(/[\u2026\u0964\u0965]+/g,"။"),t=t.replace(/ဉ\u1039ဉ/g,"ည"),t=t.replace(/သ\u1039သ/g,"ဿ"),t=t.replace(/င္([က-ဠ])/g,"င်္$1"),t=t.replace(/္ယ/g,"ျ"),t=t.replace(/္ရ/g,"ြ"),t=t.replace(/္ဝ/g,"ွ"),t=t.replace(/္ဟ/g,"ှ"),t=t.replace(/([ခဂငဒပဝ]ေ?)\u102c/g,"$1ါ"),t=t.replace(/(က္ခ|န္ဒ|ပ္ပ|မ္ပ)(ေ?)\u102b/g,"$1$2ာ"),t.replace(/(ဒ္ဓ|ဒွ)(ေ?)\u102c/g,"$1$2ါ")}function Fr(t){return t=t.replace(/\u102B/g,"ာ"),t=t.replace(/ှ/g,"္ဟ"),t=t.replace(/ွ/g,"္ဝ"),t=t.replace(/ြ/g,"္ရ"),t=t.replace(/ျ/g,"္ယ"),t=t.replace(/\u103A/g,""),t=t.replace(/ဿ/g,"သ္သ"),t=t.replace(/ည/g,"ဉ္ဉ"),t=t.replace(/သံဃ/g,"သင္ဃ"),t=t.replace(/၊/g,","),t.replace(/။/g,".")}function b(t,e,n=""){return n=="cen"?t=t.replace(/॥/g,""):n.startsWith("ga")&&(t=t.replace(/।/g,";"),t=t.replace(/॥/g,".")),t=t.replace(/॰…/g,"…"),t=t.replace(/॰/g,"·"),t=t.replace(/[।॥]/g,"."),t=t.replace(/\s([\s,!;\?\.])/g,"$1"),t}function Ur(t,e,n=""){return t=t.replace(/^((?:<w>)?\S)/g,(r,i)=>i.toUpperCase()),t=t.replace(/([\.\?]\s(?:<w>)?)(\S)/g,(r,i,s)=>`${i}${s.toUpperCase()}`),t.replace(/([\u201C‘](?:<w>)?)(\S)/g,(r,i,s)=>`${i}${s.toUpperCase()}`)}const $r=t=>t.toLowerCase();function Ot(t,e,n=""){if(e==l.THAI)return t.replace(/([ก-ฮ])([เโ])/g,"$2$1");if(e==l.LAOS)return t.replace(/([ກ-ຮ])([ເໂ])/g,"$2$1");throw new Error(`Unsupported script ${e} for swap_e_o method.`)}function Dt(t,e){if(e==l.THAI)return t.replace(/([เโ])([ก-ฮ])/g,"$2$1");if(e==l.LAOS)return t.replace(/([ເໂ])([ກ-ຮ])/g,"$2$1");throw new Error(`Unsupported script ${e} for un_swap_e_o method.`)}function Hr(t,e){return t=t.replace(/\u0E34\u0E4D/g,"ึ"),t=t.replace(/ญ/g,""),t.replace(/ฐ/g,"")}function Vr(t,e){return t=t.replace(/ฎ/g,"ฏ"),t=t.replace(/\u0E36/g,"ิํ"),t=t.replace(/\uF70F/g,"ญ"),t.replace(/\uF700/g,"ฐ")}function xr(t,e){return t=t.replace(/\u17B9/g,"ិំ"),t.replace(/\u17D1/g,"្")}function rt(t){return t.replace(/\u200C|\u200D/g,"")}function Wr(t){return t=t.replace(/।/g,"𑁇"),t=t.replace(/॥/g,"𑁈"),t.replace(/–/g,"𑁋")}function jr(t){return t=t.replace(/\u1A60\u1A41/g,"ᩕ"),t=t.replace(/\u1A48\u1A60\u1A48/g,"ᩔ"),t=t.replace(/।/g,"᪨"),t.replace(/॥/g,"᪩")}function zr(t){t=t.replace(/।/g,"།"),t=t.replace(/॥/g,"༎");for(let e=0;e<=39;e++)t=t.replace(new RegExp(String.fromCharCode(3972,3904+e),"g"),String.fromCharCode(3984+e));return t=t.replace(/\u0F61\u0FB1/g,"ཡྻ"),t=t.replace(/\u0F5D\u0FAD/g,"ཝྺ"),t=t.replace(/\u0F5B\u0FAC/g,"ཛ྄ཛྷ"),t=t.replace(/\u0F61\u0FB7/g,"ཡ྄ཧ"),t.replace(/\u0F5D\u0FB7/g,"ཝ྄ཧ")}function qr(t){return t}function Gr(t){return t=t.replace(/ৰ/g,"ৱ"),t=t.replace(/র/g,"ৰ"),t=t.replace(/ল়/g,"ড়"),t}const Kr=[],Jr={[l.SI]:[Nr,b],[l.RO]:[b,Ur],[l.THAI]:[Ot,Hr,b],[l.LAOS]:[Ot,b],[l.MY]:[Br,b],[l.KM]:[b],[l.THAM]:[jr],[l.GUJA]:[b],[l.TELU]:[b],[l.MALA]:[b],[l.BRAH]:[Wr,b],[l.TIBT]:[zr],[l.CYRL]:[b],[l.ASSE]:[Gr]},Yr=[],Xr={[l.SI]:[rt,Mr],[l.HI]:[rt],[l.RO]:[$r],[l.THAI]:[Vr,Dt],[l.LAOS]:[Dt],[l.KM]:[xr],[l.MY]:[Fr],[l.TIBT]:[qr]};function gt(t,e,n=!0){let r=Or.concat(Lr,n?Dr:[]),i=[[],[],[]];return r.forEach(s=>{s[t]&&i[s[t].length-1].push([s[t],s[e]])}),i.filter(s=>s.length).map(s=>[s[0][0].length,new Map(s)]).reverse()}function mt(t,e){let n=new Array,r=0;for(;r<t.length;){let i=!1;for(let[s,o]of e){const a=t.substr(r,s);if(o.has(a)){n.push(o.get(a)),i=!0,r+=s;break}}i||(n.push(t.charAt(r)),r++)}return n.join("")}function Nt(t,e){const n=e==l.CYRL?"а":"a";return t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t=t.replace(new RegExp(`([ක-ෆ])([^ා-ෟ්${n}])`,"g"),`$1${n}$2`),t.replace(/([ක-ෆ])$/g,`$1${n}`)}const Qr={අ:"",ආ:"ා",ඉ:"ි",ඊ:"ී",උ:"ු",ඌ:"ූ",එ:"ෙ",ඔ:"ො"};function Mt(t,e){return t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g,"$1්$2"),t=t.replace(/([ක-ෆ])$/g,"$1්"),t=t.replace(/([ක-ෆ])([අආඉඊඋඌඑඔ])/g,(n,r,i)=>r+Qr[i]),t}const Zr=t=>t.replace(/ṁ/g,"ං"),ei=[it],ti={[l.SI]:[],[l.RO]:[Nt,it],[l.CYRL]:[Nt,it]},ni=[ii],ri={[l.SI]:[],[l.RO]:[Bt,Zr,Mt],[l.CYRL]:[Bt,Mt]};function it(t,e){const n=gt(te[l.SI],te[e]);return mt(t,n)}function ii(t,e){const n=gt(te[e],te[l.SI]);return mt(t,n)}function Bt(t,e){const n=gt(te[e],te[l.SI],!1);return mt(t,n)}class Pe{static basicConvert(e,n){return(ti[n]||ei).forEach(r=>e=r(e,n)),e}static basicConvertFrom(e,n){return(ri[n]||ni).forEach(r=>e=r(e,n)),e}static beautify(e,n,r=""){return(Jr[n]||Kr).forEach(i=>e=i(e,n,r)),e}static convert(e,n){return e=this.basicConvert(e,n),this.beautify(e,n)}static convertFrom(e,n){return(Xr[n]||Yr).forEach(r=>e=r(e,n)),this.basicConvertFrom(e,n)}static convertFromMixed(e){e=rt(e)+" ";let n=-1,r="",i="";for(let s=0;s<e.length;s++){const o=Rr(e.charCodeAt(s));o!=n||s==e.length-1?(i+=this.convertFrom(r,n),n=o,r=e.charAt(s)):r+=e.charAt(s)}return i}}const In="epitaka_settings_v3";function Ft(){return{pali:!0,english:!0,vietnamese:!1,layout:"stacked",paliScript:l.RO,paliColor:"#7c2d12",engColor:"#1e3a5f",vietColor:"#4a1d6b",bgColor:"#faf7f2",actionButtons:"line",fontSize:16,actionCollapse:!1,load_attha:!0}}function $e(){try{return{...Ft(),...JSON.parse(localStorage.getItem(In)||"{}")}}catch{return Ft()}}function si(t){localStorage.setItem(In,JSON.stringify(t))}function vn(t){const e=document.documentElement;e.style.setProperty("--pali-color",t.paliColor),e.style.setProperty("--eng-color",t.engColor),e.style.setProperty("--viet-color",t.vietColor),e.style.setProperty("--bg",t.bgColor),document.body.style.backgroundColor=t.bgColor;const n=Math.min(Math.max(parseInt(t.fontSize)||16,10),32);e.style.setProperty("--reader-font-size",`${n}px`),e.style.setProperty("font-size",`${n}px`),document.querySelector("body").setAttribute("script",t.paliScript),document.body.setAttribute("data-ra-mode",t.actionButtons||"line"),document.body.setAttribute("data-ra-collapse",t.actionCollapse?"true":"false");const r=[t.pali,t.english,t.vietnamese].filter(Boolean).length;document.body.setAttribute("data-flow",r===1?"true":"false"),document.querySelectorAll(".pali-text").forEach(i=>i.style.display=t.pali?"":"none"),document.querySelectorAll(".eng-text").forEach(i=>i.style.display=t.english?"":"none"),document.querySelectorAll(".viet-text").forEach(i=>i.style.display=t.vietnamese?"":"none"),oi(t)}function oi(t){const e=t.pali&&t.english&&!t.vietnamese||t.pali&&!t.english&&t.vietnamese;document.querySelectorAll(".sentence-row").forEach(n=>{t.layout==="sidebyside"&&e?n.classList.add("side-by-side"):n.classList.remove("side-by-side")})}function ai(t){document.getElementById("cb-pali").checked=t.pali,document.getElementById("cb-english").checked=t.english,document.getElementById("cb-vietnamese").checked=t.vietnamese,document.querySelector(`input[name="layout"][value="${t.layout}"]`).checked=!0,document.querySelector(`input[name="action-mode"][value="${t.actionButtons||"line"}"]`).checked=!0,document.getElementById("color-pali").value=t.paliColor,document.getElementById("color-eng").value=t.engColor,document.getElementById("color-viet").value=t.vietColor,document.getElementById("color-bg").value=t.bgColor;const e=document.getElementById("pali-script-select");e&&(e.value=t.paliScript);const n=document.getElementById("range-font-size");n&&(n.value=t.fontSize||16,li(n.value));const r=document.getElementById("cb-action-collapse");r&&(r.checked=!!t.actionCollapse);const i=document.getElementById("cb-load-attha");i&&(i.checked=t.load_attha??!0)}function ci(){var t,e,n,r,i,s;return{pali:document.getElementById("cb-pali").checked,english:document.getElementById("cb-english").checked,vietnamese:document.getElementById("cb-vietnamese").checked,layout:((t=document.querySelector('input[name="layout"]:checked'))==null?void 0:t.value)||"stacked",actionButtons:((e=document.querySelector('input[name="action-mode"]:checked'))==null?void 0:e.value)||"line",paliScript:((n=document.getElementById("pali-script-select"))==null?void 0:n.value)||l.RO,paliColor:document.getElementById("color-pali").value,engColor:document.getElementById("color-eng").value,vietColor:document.getElementById("color-viet").value,bgColor:document.getElementById("color-bg").value,fontSize:parseInt((r=document.getElementById("range-font-size"))==null?void 0:r.value)||16,actionCollapse:((i=document.getElementById("cb-action-collapse"))==null?void 0:i.checked)||!1,load_attha:((s=document.getElementById("cb-load-attha"))==null?void 0:s.checked)??!0}}function li(t){const e=document.getElementById("font-size-label");e&&(e.textContent=`${t}px`)}function En(t,e){t.innerHTML="";for(const[n,r]of bn){const i=document.createElement("option");i.value=n,i.textContent=`${r[0]} — ${r[1]}`,n===e&&(i.selected=!0),t.appendChild(i)}}const{bookId:jc,baseUrl:wn,bookref:zc}=window.BOOK_CONFIG;console.log(window.BOOK_CONFIG);const j=document.getElementById("dict-word-input"),J=document.getElementById("dict-suggestions"),ce=document.getElementById("dict-panel"),Ke=document.getElementById("dict-close");document.getElementById("dict-word");const Re=document.getElementById("dict-results");let ve=null,_=-1;function ui(t){t.querySelectorAll(".sentence-row .pali-text").forEach(e=>{e.addEventListener("click",di)})}function di(t){const e=window.getSelection();let n=e==null?void 0:e.toString().trim();if(n||(n=_i(t)),!n)return;const r=$e();let i=n;if(r.paliScript!==l.RO){const s=Pe.convertFrom(n,r.paliScript);i=Pe.convert(s,l.RO)}i=i.trim().replace(/[.,;:!?()[\]{}'"]/g,"").toLowerCase(),i&&hi(i)}function hi(t){j.value=t,G(),ce.classList.add("open"),An(t)}async function An(t){if(t){Re.innerHTML='<div class="dict-loading">Looking up…</div>';try{const n=await(await fetch(`${wn}/api/dictionary?word=${encodeURIComponent(t)}`)).json();gi(n)}catch{Re.innerHTML='<div class="dict-error">Lookup failed.</div>'}}}_n(j,{mode:"both"});j.addEventListener("input",()=>{const t=j.value.trim();if(_=-1,!t){G();return}fi(t)});j.addEventListener("keydown",t=>{const e=J.querySelectorAll(".dict-suggestion-item");t.key==="ArrowDown"?(t.preventDefault(),_=Math.min(_+1,e.length-1),Ut(e)):t.key==="ArrowUp"?(t.preventDefault(),_=Math.max(_-1,-1),Ut(e)):t.key==="Enter"?(t.preventDefault(),_>=0&&e[_]?st(e[_].dataset.word):st(j.value.trim())):t.key==="Escape"&&G()});document.addEventListener("click",t=>{t.target.closest("#dict-word-wrapper")||G()});async function fi(t){ve&&ve.abort(),ve=new AbortController;try{const n=await(await fetch(`${wn}/api/suggest_word?q=${encodeURIComponent(t)}`,{signal:ve.signal})).json();pi(n)}catch(e){e.name!=="AbortError"&&G()}}function pi(t){if(!(t!=null&&t.length)){G();return}J.innerHTML=t.map(e=>`
    <li class="dict-suggestion-item" 
        role="option" 
        data-word="${e}"
        tabindex="-1">
      <span class="suggest-word pali-text">${e}</span>
    </li>
  `).join(""),J.querySelectorAll(".dict-suggestion-item").forEach(e=>{e.addEventListener("mousedown",n=>{n.preventDefault(),st(e.dataset.word)})}),J.classList.add("open")}function Ut(t){var e;t.forEach((n,r)=>n.classList.toggle("active",r===_)),_>=0&&((e=t[_])==null||e.scrollIntoView({block:"nearest"}))}function st(t){t&&(j.value=t,G(),An(t))}function G(){J.innerHTML="",J.classList.remove("open"),_=-1}function gi(t){if(!(t!=null&&t.length)){Re.innerHTML='<p class="dict-empty">No results found.</p>';return}let e="",n=null;for(const r of t)r.book_name!==n&&(n&&(e+="</div>"),e+=`<div class="dict-book-group">
        <div class="dict-book-name">${r.book_name}</div>`,n=r.book_name),e+=`<div class="dict-entry">
      <div class="dict-entry-word">${r.word}</div>
      <div class="dict-entry-def">${r.definition}</div>
      ${mi(r.usages||[])}
    </div>`;n&&(e+="</div>"),Re.innerHTML=e}function mi(t){return t.length?`<div class="dict-usages">
    <div class="dict-usages-label">In the texts</div>
    ${t.map(n=>{const r=n.word+(n.ending||""),i=yi(n.pali||"",r),o=$e().vietnamese?n.vietnamese:n.english;return`<div class="dict-usage">
      <div class="dict-usage-pali">${i}</div>
      ${o?`<div class="dict-usage-trans">${D(o)}</div>`:""}
      <div class="dict-usage-footer">
        <span class="dict-usage-book">${D(n.book_name)}</span>
        <a class="dict-usage-open" href="${D(n.reader_url)}" target="_blank" rel="noopener">
          ↗
        </a>
      </div>
    </div>`}).join("")}
  </div>`:""}function yi(t,e){if(!e||!t)return D(t);const n=t.toLowerCase().indexOf(e.toLowerCase());return n===-1?D(t):D(t.slice(0,n))+`<mark>${D(t.slice(n,n+e.length))}</mark>`+D(t.slice(n+e.length))}function D(t){return String(t??"")}Ke==null||Ke.addEventListener("click",()=>ce.classList.remove("open"));document.addEventListener("click",t=>{ce.classList.contains("open")&&!ce.contains(t.target)&&!t.target.closest(".pali-text")&&ce.classList.remove("open")});function _i(t){var a,c,u,h;if(!document.caretRangeFromPoint)return null;const e=document.caretRangeFromPoint(t.clientX,t.clientY);if(!e)return null;const n=e.startContainer,r=e.startOffset;if(n.nodeType!==Node.TEXT_NODE)return null;const i=n.textContent,s=((c=(a=n.parentElement)==null?void 0:a.closest("[lang]"))==null?void 0:c.getAttribute("lang"))||"en",o=((h=(u=n.parentElement)==null?void 0:u.closest("[data-script]"))==null?void 0:h.getAttribute("data-script"))||null;return bi(i,r,s,o)}function bi(t,e,n,r){const i=["ro","si","hi","be","as","gm","gj","te","ka","mm","tb","cy","br"];return["en","in","es","pt","hi","si","ch"].includes(n)||i.includes(r)?Ii(t,e):typeof Intl<"u"&&Intl.Segmenter?vi(t,e,n):Sn(t,e)}function Ii(t,e){const n=/[\s\u200b\u00a0।॥၊။,\.!\?;:"'()\[\]{}<>\/\\]/;let r=e,i=e;for(;r>0&&!n.test(t[r-1]);)r--;for(;i<t.length&&!n.test(t[i]);)i++;return t.slice(r,i).trim()||null}function vi(t,e,n){const i={th:"th",my:"my",lo:"lo",km:"km",tt:"th",en:"en",hi:"hi",si:"si",be:"bn",as:"as",gm:"pa",gj:"gu",te:"te",ka:"kn",mm:"ml",tb:"bo",cy:"ru"}[n]||n;try{const o=[...new Intl.Segmenter(i,{granularity:"word"}).segment(t)];for(const a of o){const c=a.index,u=a.index+a.segment.length;if(e>=c&&e<=u)return a.isWordLike===!1?null:a.segment.trim()||null}}catch{}return Sn(t,e)}function Sn(t,e){const n=[[3584,3711],[3712,3839],[4096,4255],[6016,6143],[6688,6831],[4096,4255]];function r(o){const a=o.codePointAt(0);return n.some(([c,u])=>a>=c&&a<=u)}let i=e,s=e;for(;i>0&&r(t[i-1]);)i--;for(;s<t.length&&r(t[s]);)s++;return t.slice(i,s).trim()||null}const Ei=()=>{};var $t={};/**
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
 */const Tn=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},wi=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],a=t[n++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},kn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,a=o?t[i+1]:0,c=i+2<t.length,u=c?t[i+2]:0,h=s>>2,f=(s&3)<<4|a>>4;let g=(a&15)<<2|u>>6,y=u&63;c||(y=64,o||(g=64)),r.push(n[h],n[f],n[g],n[y])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Tn(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):wi(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],a=i<t.length?n[t.charAt(i)]:0;++i;const u=i<t.length?n[t.charAt(i)]:64;++i;const f=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||a==null||u==null||f==null)throw new Ai;const g=s<<2|a>>4;if(r.push(g),u!==64){const y=a<<4&240|u>>2;if(r.push(y),f!==64){const E=u<<6&192|f;r.push(E)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Ai extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Si=function(t){const e=Tn(t);return kn.encodeByteArray(e,!0)},Cn=function(t){return Si(t).replace(/\./g,"")},Pn=function(t){try{return kn.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Ti(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const ki=()=>Ti().__FIREBASE_DEFAULTS__,Ci=()=>{if(typeof process>"u"||typeof $t>"u")return;const t=$t.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Pi=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Pn(t[1]);return e&&JSON.parse(e)},yt=()=>{try{return Ei()||ki()||Ci()||Pi()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Ri=t=>{var e,n;return(n=(e=yt())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},Rn=()=>{var t;return(t=yt())==null?void 0:t.config},Ln=t=>{var e;return(e=yt())==null?void 0:e[`_${t}`]};/**
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
 */class Li{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function m(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Oi(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(m())}function Di(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ni(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Mi(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Bi(){const t=m();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Fi(){try{return typeof indexedDB=="object"}catch{return!1}}function Ui(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}/**
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
 */const $i="FirebaseError";class U extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=$i,Object.setPrototypeOf(this,U.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ge.prototype.create)}}class ge{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?Hi(s,r):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new U(i,a,r)}}function Hi(t,e){return t.replace(Vi,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Vi=/\{\$([^}]+)}/g;function xi(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ne(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(Ht(s)&&Ht(o)){if(!ne(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function Ht(t){return t!==null&&typeof t=="object"}/**
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
 */function me(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Wi(t,e){const n=new ji(t,e);return n.subscribe.bind(n)}class ji{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");zi(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=Je),i.error===void 0&&(i.error=Je),i.complete===void 0&&(i.complete=Je);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function zi(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Je(){}/**
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
 */function _t(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function qi(t){return(await fetch(t,{credentials:"include"})).ok}class re{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class Gi{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Li;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ji(e))try{this.getOrInitializeService({instanceIdentifier:H})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=H){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=H){return this.instances.has(e)}getOptions(e=H){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);r===a&&o.resolve(i)}return i}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Ki(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=H){return this.component?this.component.multipleInstances?e:H:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ki(t){return t===H?void 0:t}function Ji(t){return t.instantiationMode==="EAGER"}/**
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
 */class Yi{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Gi(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var p;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(p||(p={}));const Xi={debug:p.DEBUG,verbose:p.VERBOSE,info:p.INFO,warn:p.WARN,error:p.ERROR,silent:p.SILENT},Qi=p.INFO,Zi={[p.DEBUG]:"log",[p.VERBOSE]:"log",[p.INFO]:"info",[p.WARN]:"warn",[p.ERROR]:"error"},es=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=Zi[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class On{constructor(e){this.name=e,this._logLevel=Qi,this._logHandler=es,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in p))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Xi[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,p.DEBUG,...e),this._logHandler(this,p.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,p.VERBOSE,...e),this._logHandler(this,p.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,p.INFO,...e),this._logHandler(this,p.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,p.WARN,...e),this._logHandler(this,p.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,p.ERROR,...e),this._logHandler(this,p.ERROR,...e)}}const ts=(t,e)=>e.some(n=>t instanceof n);let Vt,xt;function ns(){return Vt||(Vt=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function rs(){return xt||(xt=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Dn=new WeakMap,ot=new WeakMap,Nn=new WeakMap,Ye=new WeakMap,bt=new WeakMap;function is(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(B(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Dn.set(n,t)}).catch(()=>{}),bt.set(e,t),e}function ss(t){if(ot.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});ot.set(t,e)}let at={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ot.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Nn.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return B(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function os(t){at=t(at)}function as(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Xe(this),e,...n);return Nn.set(r,e.sort?e.sort():[e]),B(r)}:rs().includes(t)?function(...e){return t.apply(Xe(this),e),B(Dn.get(this))}:function(...e){return B(t.apply(Xe(this),e))}}function cs(t){return typeof t=="function"?as(t):(t instanceof IDBTransaction&&ss(t),ts(t,ns())?new Proxy(t,at):t)}function B(t){if(t instanceof IDBRequest)return is(t);if(Ye.has(t))return Ye.get(t);const e=cs(t);return e!==t&&(Ye.set(t,e),bt.set(e,t)),e}const Xe=t=>bt.get(t);function ls(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),a=B(o);return r&&o.addEventListener("upgradeneeded",c=>{r(B(o.result),c.oldVersion,c.newVersion,B(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const us=["get","getKey","getAll","getAllKeys","count"],ds=["put","add","delete","clear"],Qe=new Map;function Wt(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Qe.get(e))return Qe.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=ds.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||us.includes(n)))return;const s=async function(o,...a){const c=this.transaction(o,i?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[n](...a),i&&c.done]))[0]};return Qe.set(e,s),s}os(t=>({...t,get:(e,n,r)=>Wt(e,n)||t.get(e,n,r),has:(e,n)=>!!Wt(e,n)||t.has(e,n)}));/**
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
 */class hs{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(fs(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function fs(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ct="@firebase/app",jt="0.15.1";/**
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
 */const R=new On("@firebase/app"),ps="@firebase/app-compat",gs="@firebase/analytics-compat",ms="@firebase/analytics",ys="@firebase/app-check-compat",_s="@firebase/app-check",bs="@firebase/auth",Is="@firebase/auth-compat",vs="@firebase/database",Es="@firebase/data-connect",ws="@firebase/database-compat",As="@firebase/functions",Ss="@firebase/functions-compat",Ts="@firebase/installations",ks="@firebase/installations-compat",Cs="@firebase/messaging",Ps="@firebase/messaging-compat",Rs="@firebase/performance",Ls="@firebase/performance-compat",Os="@firebase/remote-config",Ds="@firebase/remote-config-compat",Ns="@firebase/storage",Ms="@firebase/storage-compat",Bs="@firebase/firestore",Fs="@firebase/ai",Us="@firebase/firestore-compat",$s="firebase",Hs="12.16.0";/**
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
 */const lt="[DEFAULT]",Vs={[ct]:"fire-core",[ps]:"fire-core-compat",[ms]:"fire-analytics",[gs]:"fire-analytics-compat",[_s]:"fire-app-check",[ys]:"fire-app-check-compat",[bs]:"fire-auth",[Is]:"fire-auth-compat",[vs]:"fire-rtdb",[Es]:"fire-data-connect",[ws]:"fire-rtdb-compat",[As]:"fire-fn",[Ss]:"fire-fn-compat",[Ts]:"fire-iid",[ks]:"fire-iid-compat",[Cs]:"fire-fcm",[Ps]:"fire-fcm-compat",[Rs]:"fire-perf",[Ls]:"fire-perf-compat",[Os]:"fire-rc",[Ds]:"fire-rc-compat",[Ns]:"fire-gcs",[Ms]:"fire-gcs-compat",[Bs]:"fire-fst",[Us]:"fire-fst-compat",[Fs]:"fire-vertex","fire-js":"fire-js",[$s]:"fire-js-all"};/**
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
 */const Le=new Map,xs=new Map,ut=new Map;function zt(t,e){try{t.container.addComponent(e)}catch(n){R.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function de(t){const e=t.name;if(ut.has(e))return R.debug(`There were multiple attempts to register component ${e}.`),!1;ut.set(e,t);for(const n of Le.values())zt(n,t);for(const n of xs.values())zt(n,t);return!0}function Mn(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function w(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Ws={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},F=new ge("app","Firebase",Ws);/**
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
 */class js{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new re("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw F.create("app-deleted",{appName:this._name})}}/**
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
 */const ye=Hs;function Bn(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:lt,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw F.create("bad-app-name",{appName:String(i)});if(n||(n=Rn()),!n)throw F.create("no-options");const s=Le.get(i);if(s){if(ne(n,s.options)&&ne(r,s.config))return s;throw F.create("duplicate-app",{appName:i})}const o=new Yi(i);for(const c of ut.values())o.addComponent(c);const a=new js(n,r,o);return Le.set(i,a),a}function zs(t=lt){const e=Le.get(t);if(!e&&t===lt&&Rn())return Bn();if(!e)throw F.create("no-app",{appName:t});return e}function Y(t,e,n){let r=Vs[t]??t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),R.warn(o.join(" "));return}de(new re(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const qs="firebase-heartbeat-database",Gs=1,he="firebase-heartbeat-store";let Ze=null;function Fn(){return Ze||(Ze=ls(qs,Gs,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(he)}catch(n){console.warn(n)}}}}).catch(t=>{throw F.create("idb-open",{originalErrorMessage:t.message})})),Ze}async function Ks(t){try{const n=(await Fn()).transaction(he),r=await n.objectStore(he).get(Un(t));return await n.done,r}catch(e){if(e instanceof U)R.warn(e.message);else{const n=F.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});R.warn(n.message)}}}async function qt(t,e){try{const r=(await Fn()).transaction(he,"readwrite");await r.objectStore(he).put(e,Un(t)),await r.done}catch(n){if(n instanceof U)R.warn(n.message);else{const r=F.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});R.warn(r.message)}}}function Un(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Js=1024,Ys=30;class Xs{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Zs(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Gt();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>Ys){const o=eo(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){R.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Gt(),{heartbeatsToSend:r,unsentEntries:i}=Qs(this._heartbeatsCache.heartbeats),s=Cn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return R.warn(n),""}}}function Gt(){return new Date().toISOString().substring(0,10)}function Qs(t,e=Js){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Kt(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Kt(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Zs{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Fi()?Ui().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Ks(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return qt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return qt(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Kt(t){return Cn(JSON.stringify({version:2,heartbeats:t})).length}function eo(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function to(t){de(new re("platform-logger",e=>new hs(e),"PRIVATE")),de(new re("heartbeat",e=>new Xs(e),"PRIVATE")),Y(ct,jt,t),Y(ct,jt,"esm2020"),Y("fire-js","")}to("");var no="firebase",ro="12.16.0";/**
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
 */Y(no,ro,"app");function $n(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const io=$n,Hn=new ge("auth","Firebase",$n());/**
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
 */const Oe=new On("@firebase/auth");function so(t,...e){Oe.logLevel<=p.WARN&&Oe.warn(`Auth (${ye}): ${t}`,...e)}function Se(t,...e){Oe.logLevel<=p.ERROR&&Oe.error(`Auth (${ye}): ${t}`,...e)}/**
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
 */function S(t,...e){throw vt(t,...e)}function v(t,...e){return vt(t,...e)}function It(t,e,n){const r={...io(),[e]:n};return new ge("auth","Firebase",r).create(e,{appName:t.name})}function x(t){return It(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function oo(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&S(t,"argument-error"),It(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function vt(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Hn.create(t,...e)}function d(t,e,...n){if(!t)throw vt(e,...n)}function C(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Se(e),new Error(e)}function L(t,e){t||C(e)}/**
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
 */function dt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function ao(){return Jt()==="http:"||Jt()==="https:"}function Jt(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function co(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ao()||Ni()||"connection"in navigator)?navigator.onLine:!0}function lo(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class _e{constructor(e,n){this.shortDelay=e,this.longDelay=n,L(n>e,"Short delay should be less than long delay!"),this.isMobile=Oi()||Mi()}get(){return co()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Et(t,e){L(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Vn{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;C("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;C("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;C("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const uo={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const ho=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],fo=new _e(3e4,6e4);function wt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function oe(t,e,n,r,i={}){return xn(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const a=me({...o,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const u={method:e,headers:c,...s};return Di()||(u.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&_t(t.emulatorConfig.host)&&(u.credentials="include"),Vn.fetch()(await Wn(t,t.config.apiHost,n,a),u)})}async function xn(t,e,n){t._canInitEmulator=!1;const r={...uo,...e};try{const i=new go(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Ee(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ee(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Ee(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Ee(t,"user-disabled",o);const h=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw It(t,h,u);S(t,h)}}catch(i){if(i instanceof U)throw i;S(t,"network-request-failed",{message:String(i)})}}async function po(t,e,n,r,i={}){const s=await oe(t,e,n,r,i);return"mfaPendingCredential"in s&&S(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function Wn(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?Et(t.config,i):`${t.config.apiScheme}://${i}`;return ho.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class go{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(v(this.auth,"network-request-failed")),fo.get())})}}function Ee(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=v(t,e,r);return i.customData._tokenResponse=n,i}/**
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
 */async function mo(t,e){return oe(t,"POST","/v1/accounts:delete",e)}async function De(t,e){return oe(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function le(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function yo(t,e=!1){const n=$(t),r=await n.getIdToken(e),i=At(r);d(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:le(et(i.auth_time)),issuedAtTime:le(et(i.iat)),expirationTime:le(et(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function et(t){return Number(t)*1e3}function At(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Se("JWT malformed, contained fewer than 3 sections"),null;try{const i=Pn(n);return i?JSON.parse(i):(Se("Failed to decode base64 JWT payload"),null)}catch(i){return Se("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Yt(t){const e=At(t);return d(e,"internal-error"),d(typeof e.exp<"u","internal-error"),d(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function fe(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof U&&_o(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function _o({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class bo{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class ht{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=le(this.lastLoginAt),this.creationTime=le(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ne(t){var f;const e=t.auth,n=await t.getIdToken(),r=await fe(t,De(e,{idToken:n}));d(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];t._notifyReloadListener(i);const s=(f=i.providerUserInfo)!=null&&f.length?jn(i.providerUserInfo):[],o=vo(t.providerData,s),a=t.isAnonymous,c=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),u=a?c:!1,h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new ht(i.createdAt,i.lastLoginAt),isAnonymous:u};Object.assign(t,h)}async function Io(t){const e=$(t);await Ne(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function vo(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function jn(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
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
 */async function Eo(t,e){const n=await xn(t,{},async()=>{const r=me({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await Wn(t,i,"/v1/token",`key=${s}`),a=await t._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:r};return t.emulatorConfig&&_t(t.emulatorConfig.host)&&(c.credentials="include"),Vn.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function wo(t,e){return oe(t,"POST","/v2/accounts:revokeToken",wt(t,e))}/**
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
 */class X{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){d(e.idToken,"internal-error"),d(typeof e.idToken<"u","internal-error"),d(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Yt(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){d(e.length!==0,"internal-error");const n=Yt(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(d(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await Eo(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new X;return r&&(d(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(d(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(d(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new X,this.toJSON())}_performRefresh(){return C("not implemented")}}/**
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
 */function O(t,e){d(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class I{constructor({uid:e,auth:n,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new bo(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new ht(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await fe(this,this.stsTokenManager.getToken(this.auth,e));return d(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return yo(this,e)}reload(){return Io(this)}_assign(e){this!==e&&(d(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new I({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){d(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Ne(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(w(this.auth.app))return Promise.reject(x(this.auth));const e=await this.getIdToken();return await fe(this,mo(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,i=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,a=n.tenantId??void 0,c=n._redirectEventId??void 0,u=n.createdAt??void 0,h=n.lastLoginAt??void 0,{uid:f,emailVerified:g,isAnonymous:y,providerData:E,stsTokenManager:ae}=n;d(f&&ae,e,"internal-error");const kr=X.fromJSON(this.name,ae);d(typeof f=="string",e,"internal-error"),O(r,e.name),O(i,e.name),d(typeof g=="boolean",e,"internal-error"),d(typeof y=="boolean",e,"internal-error"),O(s,e.name),O(o,e.name),O(a,e.name),O(c,e.name),O(u,e.name),O(h,e.name);const Ge=new I({uid:f,auth:e,email:i,emailVerified:g,displayName:r,isAnonymous:y,photoURL:o,phoneNumber:s,tenantId:a,stsTokenManager:kr,createdAt:u,lastLoginAt:h});return E&&Array.isArray(E)&&(Ge.providerData=E.map(Cr=>({...Cr}))),c&&(Ge._redirectEventId=c),Ge}static async _fromIdTokenResponse(e,n,r=!1){const i=new X;i.updateFromServerResponse(n);const s=new I({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Ne(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];d(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?jn(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),a=new X;a.updateFromIdToken(r);const c=new I({uid:i.localId,auth:e,stsTokenManager:a,isAnonymous:o}),u={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new ht(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,u),c}}/**
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
 */const Xt=new Map;function P(t){L(t instanceof Function,"Expected a class definition");let e=Xt.get(t);return e?(L(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Xt.set(t,e),e)}/**
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
 */class zn{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}zn.type="NONE";const Qt=zn;/**
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
 */function Te(t,e,n){return`firebase:${t}:${e}:${n}`}class Q{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Te(this.userKey,i.apiKey,s),this.fullPersistenceKey=Te("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await De(this.auth,{idToken:e}).catch(()=>{});return n?I._fromGetAccountInfoResponse(this.auth,n,e):null}return I._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Q(P(Qt),e,r);const i=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||P(Qt);const o=Te(r,e.config.apiKey,e.name);let a=null;for(const u of n)try{const h=await u._get(o);if(h){let f;if(typeof h=="string"){const g=await De(e,{idToken:h}).catch(()=>{});if(!g)break;f=await I._fromGetAccountInfoResponse(e,g,h)}else f=I._fromJSON(e,h);u!==s&&(a=f),s=u;break}}catch{}const c=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new Q(s,e,r):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(n.map(async u=>{if(u!==s)try{await u._remove(o)}catch{}})),new Q(s,e,r))}}/**
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
 */function Zt(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Jn(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(qn(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Xn(e))return"Blackberry";if(Qn(e))return"Webos";if(Gn(e))return"Safari";if((e.includes("chrome/")||Kn(e))&&!e.includes("edge/"))return"Chrome";if(Yn(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function qn(t=m()){return/firefox\//i.test(t)}function Gn(t=m()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Kn(t=m()){return/crios\//i.test(t)}function Jn(t=m()){return/iemobile/i.test(t)}function Yn(t=m()){return/android/i.test(t)}function Xn(t=m()){return/blackberry/i.test(t)}function Qn(t=m()){return/webos/i.test(t)}function St(t=m()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Ao(t=m()){var e;return St(t)&&!!((e=window.navigator)!=null&&e.standalone)}function So(){return Bi()&&document.documentMode===10}function Zn(t=m()){return St(t)||Yn(t)||Qn(t)||Xn(t)||/windows phone/i.test(t)||Jn(t)}/**
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
 */function er(t,e=[]){let n;switch(t){case"Browser":n=Zt(m());break;case"Worker":n=`${Zt(m())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ye}/${r}`}/**
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
 */class To{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function ko(t,e={}){return oe(t,"GET","/v2/passwordPolicy",wt(t,e))}/**
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
 */const Co=6;class Po{constructor(e){var r;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??Co,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Ro{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new en(this),this.idTokenSubscription=new en(this),this.beforeStateQueue=new To(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Hn,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=P(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Q.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await De(this,{idToken:e}),r=await I._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(w(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,a=r==null?void 0:r._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(r=c.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return d(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Ne(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=lo()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(w(this.app))return Promise.reject(x(this));const n=e?$(e):null;return n&&d(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&d(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return w(this.app)?Promise.reject(x(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return w(this.app)?Promise.reject(x(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(P(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await ko(this),n=new Po(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ge("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await wo(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&P(e)||this._popupRedirectResolver;d(n,this,"argument-error"),this.redirectPersistenceManager=await Q.create(this,[P(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(d(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,i);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return d(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=er(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var n;if(w(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&so(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function He(t){return $(t)}class en{constructor(e){this.auth=e,this.observer=null,this.addObserver=Wi(n=>this.observer=n)}get next(){return d(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Tt={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Lo(t){Tt=t}function Oo(t){return Tt.loadJS(t)}function Do(){return Tt.gapiScript}function No(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Mo(t,e){const n=Mn(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(ne(s,e??{}))return i;S(i,"already-initialized")}return n.initialize({options:e})}function Bo(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(P);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Fo(t,e,n){const r=He(t);d(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=tr(e),{host:o,port:a}=Uo(e),c=a===null?"":`:${a}`,u={url:`${s}//${o}${c}/`},h=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){d(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),d(ne(u,r.config.emulator)&&ne(h,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=u,r.emulatorConfig=h,r.settings.appVerificationDisabledForTesting=!0,_t(o)?qi(`${s}//${o}${c}`):$o()}function tr(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Uo(t){const e=tr(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:tn(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:tn(o)}}}function tn(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function $o(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class nr{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return C("not implemented")}_getIdTokenResponse(e){return C("not implemented")}_linkToIdToken(e,n){return C("not implemented")}_getReauthenticationResolver(e){return C("not implemented")}}/**
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
 */async function Z(t,e){return po(t,"POST","/v1/accounts:signInWithIdp",wt(t,e))}/**
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
 */const Ho="http://localhost";class z extends nr{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new z(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):S("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=n;if(!r||!i)return null;const o=new z(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Z(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Z(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Z(e,n)}buildRequest(){const e={requestUri:Ho,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=me(n)}return e}}/**
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
 */class kt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class be extends kt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class T extends be{constructor(){super("facebook.com")}static credential(e){return z._fromParams({providerId:T.PROVIDER_ID,signInMethod:T.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return T.credentialFromTaggedObject(e)}static credentialFromError(e){return T.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return T.credential(e.oauthAccessToken)}catch{return null}}}T.FACEBOOK_SIGN_IN_METHOD="facebook.com";T.PROVIDER_ID="facebook.com";/**
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
 */class k extends be{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return z._fromParams({providerId:k.PROVIDER_ID,signInMethod:k.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return k.credentialFromTaggedObject(e)}static credentialFromError(e){return k.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return k.credential(n,r)}catch{return null}}}k.GOOGLE_SIGN_IN_METHOD="google.com";k.PROVIDER_ID="google.com";/**
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
 */class N extends be{constructor(){super("github.com")}static credential(e){return z._fromParams({providerId:N.PROVIDER_ID,signInMethod:N.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return N.credentialFromTaggedObject(e)}static credentialFromError(e){return N.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return N.credential(e.oauthAccessToken)}catch{return null}}}N.GITHUB_SIGN_IN_METHOD="github.com";N.PROVIDER_ID="github.com";/**
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
 */class M extends be{constructor(){super("twitter.com")}static credential(e,n){return z._fromParams({providerId:M.PROVIDER_ID,signInMethod:M.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return M.credentialFromTaggedObject(e)}static credentialFromError(e){return M.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return M.credential(n,r)}catch{return null}}}M.TWITTER_SIGN_IN_METHOD="twitter.com";M.PROVIDER_ID="twitter.com";/**
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
 */class ie{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await I._fromIdTokenResponse(e,r,i),o=nn(r);return new ie({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=nn(r);return new ie({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function nn(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class Me extends U{constructor(e,n,r,i){super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Me.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new Me(e,n,r,i)}}function rr(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Me._fromErrorAndOperation(t,s,e,r):s})}async function Vo(t,e,n=!1){const r=await fe(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ie._forOperation(t,"link",r)}/**
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
 */async function xo(t,e,n=!1){const{auth:r}=t;if(w(r.app))return Promise.reject(x(r));const i="reauthenticate";try{const s=await fe(t,rr(r,i,e,t),n);d(s.idToken,r,"internal-error");const o=At(s.idToken);d(o,r,"internal-error");const{sub:a}=o;return d(t.uid===a,r,"user-mismatch"),ie._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&S(r,"user-mismatch"),s}}/**
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
 */async function Wo(t,e,n=!1){if(w(t.app))return Promise.reject(x(t));const r="signIn",i=await rr(t,r,e),s=await ie._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}function jo(t,e,n,r){return $(t).onIdTokenChanged(e,n,r)}function zo(t,e,n){return $(t).beforeAuthStateChanged(e,n)}function qo(t,e,n,r){return $(t).onAuthStateChanged(e,n,r)}function Go(t){return $(t).signOut()}const Be="__sak";/**
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
 */class ir{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Be,"1"),this.storage.removeItem(Be),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Ko=1e3,Jo=10;class sr extends ir{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Zn(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);So()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Jo):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},Ko)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}sr.type="LOCAL";const Yo=sr;/**
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
 */class or extends ir{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}or.type="SESSION";const ar=or;/**
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
 */function Xo(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class Ve{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new Ve(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const a=Array.from(o).map(async u=>u(n.origin,s)),c=await Xo(a);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ve.receivers=[];/**
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
 */function Ct(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class Qo{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((a,c)=>{const u=Ct("",20);i.port1.start();const h=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(f){const g=f;if(g.data.eventId===u)switch(g.data.status){case"ack":clearTimeout(h),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(g.data.response);break;default:clearTimeout(h),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function A(){return window}function Zo(t){A().location.href=t}/**
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
 */function cr(){return typeof A().WorkerGlobalScope<"u"&&typeof A().importScripts=="function"}async function ea(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function ta(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function na(){return cr()?self:null}/**
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
 */const lr="firebaseLocalStorageDb",ra=1,Fe="firebaseLocalStorage",ur="fbase_key";class Ie{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function xe(t,e){return t.transaction([Fe],e?"readwrite":"readonly").objectStore(Fe)}function ia(){const t=indexedDB.deleteDatabase(lr);return new Ie(t).toPromise()}function dr(){const t=indexedDB.open(lr,ra);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Fe,{keyPath:ur})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Fe)?e(r):(r.close(),await ia(),e(await dr()))})})}async function rn(t,e,n){const r=xe(t,!0).put({[ur]:e,value:n});return new Ie(r).toPromise()}async function sa(t,e){const n=xe(t,!1).get(e),r=await new Ie(n).toPromise();return r===void 0?null:r.value}function sn(t,e){const n=xe(t,!0).delete(e);return new Ie(n).toPromise()}const oa=800,aa=3;class hr{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=dr(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>aa)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return cr()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ve._getInstance(na()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,r;if(this.activeServiceWorker=await ea(),!this.activeServiceWorker)return;this.sender=new Qo(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||ta()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await rn(e,Be,"1"),await sn(e,Be)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>rn(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>sa(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>sn(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=xe(i,!1).getAll();return new Ie(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),oa)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}hr.type="LOCAL";const ca=hr;new _e(3e4,6e4);/**
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
 */function fr(t,e){return e?P(e):(d(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Pt extends nr{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Z(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Z(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Z(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function la(t){return Wo(t.auth,new Pt(t),t.bypassAuthState)}function ua(t){const{auth:e,user:n}=t;return d(n,e,"internal-error"),xo(n,new Pt(t),t.bypassAuthState)}async function da(t){const{auth:e,user:n}=t;return d(n,e,"internal-error"),Vo(n,new Pt(t),t.bypassAuthState)}/**
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
 */class pr{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return la;case"linkViaPopup":case"linkViaRedirect":return da;case"reauthViaPopup":case"reauthViaRedirect":return ua;default:S(this.auth,"internal-error")}}resolve(e){L(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){L(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const ha=new _e(2e3,1e4);async function gr(t,e,n){if(w(t.app))return Promise.reject(v(t,"operation-not-supported-in-this-environment"));const r=He(t);oo(t,e,kt);const i=fr(r,n);return new V(r,"signInViaPopup",e,i).executeNotNull()}class V extends pr{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,V.currentPopupAction&&V.currentPopupAction.cancel(),V.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return d(e,this.auth,"internal-error"),e}async onExecution(){L(this.filter.length===1,"Popup operations only handle one event");const e=Ct();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(v(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(v(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,V.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if((r=(n=this.authWindow)==null?void 0:n.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(v(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ha.get())};e()}}V.currentPopupAction=null;/**
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
 */const fa="pendingRedirect",ke=new Map;class pa extends pr{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=ke.get(this.auth._key());if(!e){try{const r=await ga(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}ke.set(this.auth._key(),e)}return this.bypassAuthState||ke.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ga(t,e){const n=_a(e),r=ya(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function ma(t,e){ke.set(t._key(),e)}function ya(t){return P(t._redirectPersistence)}function _a(t){return Te(fa,t.config.apiKey,t.name)}async function ba(t,e,n=!1){if(w(t.app))return Promise.reject(x(t));const r=He(t),i=fr(r,e),o=await new pa(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const Ia=600*1e3;class va{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ea(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!mr(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";n.onError(v(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ia&&this.cachedEventUids.clear(),this.cachedEventUids.has(on(e))}saveEventToCache(e){this.cachedEventUids.add(on(e)),this.lastProcessedEventTime=Date.now()}}function on(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function mr({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ea(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return mr(t);default:return!1}}/**
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
 */async function wa(t,e={}){return oe(t,"GET","/v1/projects",e)}/**
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
 */const Aa=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Sa=/^https?/;async function Ta(t){if(t.config.emulator)return;const{authorizedDomains:e}=await wa(t);for(const n of e)try{if(ka(n))return}catch{}S(t,"unauthorized-domain")}function ka(t){const e=dt(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!Sa.test(n))return!1;if(Aa.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const Ca=new _e(3e4,6e4);function an(){const t=A().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Pa(t){return new Promise((e,n)=>{var i,s,o;function r(){an(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{an(),n(v(t,"network-request-failed"))},timeout:Ca.get()})}if((s=(i=A().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=A().gapi)!=null&&o.load)r();else{const a=No("iframefcb");return A()[a]=()=>{gapi.load?r():n(v(t,"network-request-failed"))},Oo(`${Do()}?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw Ce=null,e})}let Ce=null;function Ra(t){return Ce=Ce||Pa(t),Ce}/**
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
 */const La=new _e(5e3,15e3),Oa="__/auth/iframe",Da="emulator/auth/iframe",Na={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ma=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Ba(t){const e=t.config;d(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Et(e,Da):`https://${t.config.authDomain}/${Oa}`,r={apiKey:e.apiKey,appName:t.name,v:ye},i=Ma.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${me(r).slice(1)}`}async function Fa(t){const e=await Ra(t),n=A().gapi;return d(n,t,"internal-error"),e.open({where:document.body,url:Ba(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Na,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=v(t,"network-request-failed"),a=A().setTimeout(()=>{s(o)},La.get());function c(){A().clearTimeout(a),i(r)}r.ping(c).then(c,()=>{s(o)})}))}/**
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
 */const Ua={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},$a=500,Ha=600,Va="_blank",xa="http://localhost";class cn{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Wa(t,e,n,r=$a,i=Ha){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const c={...Ua,width:r.toString(),height:i.toString(),top:s,left:o},u=m().toLowerCase();n&&(a=Kn(u)?Va:n),qn(u)&&(e=e||xa,c.scrollbars="yes");const h=Object.entries(c).reduce((g,[y,E])=>`${g}${y}=${E},`,"");if(Ao(u)&&a!=="_self")return ja(e||"",a),new cn(null);const f=window.open(e||"",a,h);d(f,t,"popup-blocked");try{f.focus()}catch{}return new cn(f)}function ja(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const za="__/auth/handler",qa="emulator/auth/handler",Ga=encodeURIComponent("fac");async function ln(t,e,n,r,i,s){d(t.config.authDomain,t,"auth-domain-config-required"),d(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:ye,eventId:i};if(e instanceof kt){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",xi(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[h,f]of Object.entries({}))o[h]=f}if(e instanceof be){const h=e.getScopes().filter(f=>f!=="");h.length>0&&(o.scopes=h.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const h of Object.keys(a))a[h]===void 0&&delete a[h];const c=await t._getAppCheckToken(),u=c?`#${Ga}=${encodeURIComponent(c)}`:"";return`${Ka(t)}?${me(a).slice(1)}${u}`}function Ka({config:t}){return t.emulator?Et(t,qa):`https://${t.authDomain}/${za}`}/**
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
 */const tt="webStorageSupport";class Ja{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ar,this._completeRedirectFn=ba,this._overrideRedirectResult=ma}async _openPopup(e,n,r,i){var o;L((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await ln(e,n,r,dt(),i);return Wa(e,s,Ct())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await ln(e,n,r,dt(),i);return Zo(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(L(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Fa(e),r=new va(e);return n.register("authEvent",i=>(d(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(tt,{type:tt},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[tt];s!==void 0&&n(!!s),S(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Ta(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Zn()||Gn()||St()}}const Ya=Ja;var un="@firebase/auth",dn="1.13.3";/**
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
 */class Xa{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){d(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Qa(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Za(t){de(new re("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;d(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:er(t)},u=new Ro(r,i,s,c);return Bo(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),de(new re("auth-internal",e=>{const n=He(e.getProvider("auth").getImmediate());return(r=>new Xa(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Y(un,dn,Qa(t)),Y(un,dn,"esm2020")}/**
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
 */const ec=300,tc=Ln("authIdTokenMaxAge")||ec;let hn=null;const nc=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>tc)return;const i=n==null?void 0:n.token;hn!==i&&(hn=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function rc(t=zs()){const e=Mn(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Mo(t,{popupRedirectResolver:Ya,persistence:[ca,Yo,ar]}),r=Ln("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=nc(s.toString());zo(n,o,()=>o(n.currentUser)),jo(n,a=>o(a))}}const i=Ri("auth");return i&&Fo(n,`http://${i}`),n}function ic(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Lo({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=v("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",ic().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Za("Browser");const sc=Bn(window.FIREBASE_CONFIG),We=rc(sc),oc=new k,ac=new T;let W=null,se=null;const ft=new Set,pe={get user(){return W},get profile(){return se},get loggedIn(){return!!W},onChange(t){return ft.add(t),t(W,se),()=>ft.delete(t)}};function yr(){ft.forEach(t=>t(W,se))}async function _r(){return W?W.getIdToken():null}async function br(t,e={}){const n=await _r();return fetch(t,{...e,headers:{"Content-Type":"application/json",...e.headers||{},...n?{Authorization:`Bearer ${n}`}:{}}})}async function cc(t){if(!t)return null;try{const e=await t.getIdToken(),n=await fetch(`${window.BOOK_CONFIG.baseUrl}/api/auth/sync`,{method:"POST",headers:{Authorization:`Bearer ${e}`}});if(n.ok)return await n.json()}catch(e){console.warn("Auth sync failed",e)}return{uid:t.uid,display_name:t.displayName||"",email:t.email||"",photo_url:t.photoURL||""}}qo(We,async t=>{W=t,se=t?await cc(t):null,yr()});async function lc(){return(await gr(We,oc)).user}async function uc(){return(await gr(We,ac)).user}async function fn(){await Go(We)}async function dc({display_name:t,photo_url:e}){const n={};t!==void 0&&(n.display_name=t),e!==void 0&&(n.photo_url=e);const r=await br(`${window.BOOK_CONFIG.baseUrl}/api/auth/profile`,{method:"PATCH",body:JSON.stringify(n)});if(!r.ok)throw new Error(await r.text());return se=await r.json(),yr(),se}const{baseUrl:Ir}=window.BOOK_CONFIG;function hc(){document.getElementById("lib-dialog")||document.body.insertAdjacentHTML("beforeend",`
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
</div>`)}function fc(){const t=document.getElementById("lib-dialog");t&&(t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),pc())}function pn(){const t=document.getElementById("lib-dialog");if(!t)return;t.classList.remove("open");const e=()=>t.classList.remove("is-visible");t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,300)}async function pc(){const t=document.getElementById("lib-loading");t.style.display="block",document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");try{const n=await br(`${Ir}/api/user/library`);if(!n.ok)throw new Error("Not authenticated");const r=await n.json();we("history",gc(r.history)),we("bookmarks",mc(r.bookmarks)),we("notes",yc(r.notes)),we("comments",_c(r.comments))}catch{document.getElementById("lib-pane-history").innerHTML='<p class="lib-empty">Could not load library. Please sign in.</p>'}t.style.display="none";const e=document.querySelector(".lib-tab.is-active");vr((e==null?void 0:e.dataset.tab)||"history")}function we(t,e){document.getElementById(`lib-pane-${t}`).innerHTML=e}function vr(t){document.querySelectorAll(".lib-pane").forEach(n=>n.style.display="none");const e=document.getElementById(`lib-pane-${t}`);e&&(e.style.display="block")}function je(t){return t?new Date(t*1e3).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function ze(t,e){return`${Ir}/book/${t}?para=${e}`}function gc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ze(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}</div>
      <div class="lib-card-sub">
        ${e.section_title?`<span class="lib-section">${q(e.section_title)}</span>`:""}
        <span class="lib-para">¶${e.para_id}</span>
      </div>
      <div class="lib-card-date">${je(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No reading history yet.</p>'}function mc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ze(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}</div>
      <div class="lib-card-sub">
        <span class="lib-para">¶${e.para_id} · line ${e.line_id}</span>
      </div>
      <div class="lib-card-date">${je(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No bookmarks yet.</p>'}function yc(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ze(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${q(e.text)}</div>
      <div class="lib-card-date">${je(e.updated_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No personal notes yet.</p>'}function _c(t){return t!=null&&t.length?t.map(e=>`
    <a class="lib-card lib-card-link" href="${ze(e.book_id,e.para_id)}">
      <div class="lib-card-title">${q(e.book_title)}
        <span class="lib-para"> · ¶${e.para_id}</span>
      </div>
      <div class="lib-card-note">${q(e.text)}</div>
      <div class="lib-card-date">${je(e.created_at)}</div>
    </a>`).join(""):'<p class="lib-empty">No comments yet.</p>'}function q(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function bc(){hc(),document.addEventListener("click",t=>{const e=t.target.closest(".lib-tab");if(e){document.querySelectorAll(".lib-tab").forEach(n=>n.classList.remove("is-active")),e.classList.add("is-active"),vr(e.dataset.tab);return}if(t.target.closest("[data-close-lib]")){pn();return}if(t.target.id==="lib-dialog"){pn();return}})}function Ic(){var t;if(!document.getElementById("auth-avatar-btn")){const e=document.createElement("button");e.id="auth-avatar-btn",e.className="topbar-btn auth-avatar-btn",e.setAttribute("aria-label","Account"),e.innerHTML=`
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
</div>`)}function Er(t){const e=document.getElementById(t);e&&(e.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add("open"))))}function Ue(t){const e=document.getElementById(t);if(!e)return;e.classList.remove("open");const n=()=>{e.classList.remove("is-visible")};e.addEventListener("transitionend",n,{once:!0}),setTimeout(n,300)}function vc(){K(),Er("auth-login-dialog")}function gn(){Ue("auth-login-dialog")}function Ec(){K(),Ar(),Er("auth-profile-dialog")}function wc(){Ue("auth-profile-dialog")}function Ac(){const t=document.getElementById("auth-user-menu"),e=document.getElementById("auth-avatar-btn");if(!t||!e)return;const n=e.getBoundingClientRect();t.style.top=`${n.bottom+6}px`,t.style.right=`${window.innerWidth-n.right}px`,t.classList.add("is-visible"),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open")))}function K(){const t=document.getElementById("auth-user-menu");if(!t)return;t.classList.remove("open");const e=()=>{t.classList.remove("is-visible")};t.addEventListener("transitionend",e,{once:!0}),setTimeout(e,200)}function Sc(t){return(t||"?").trim().split(/\s+/).map(e=>{var n;return((n=e[0])==null?void 0:n.toUpperCase())||""}).join("").slice(0,2)||"?"}function wr(t,e,n){n!=null&&n.photo_url?(t.src=n.photo_url,t.hidden=!1,e.hidden=!0):(t.hidden=!0,e.hidden=!1,e.textContent=Sc(n==null?void 0:n.display_name))}function Ar(){const t=pe.profile;t&&(document.getElementById("profile-hero-name").textContent=t.display_name||"",document.getElementById("profile-hero-email").textContent=t.email||"",document.getElementById("profile-input-name").value=t.display_name||"",document.getElementById("profile-input-photo").value=t.photo_url||"",wr(document.getElementById("profile-avatar-img"),document.getElementById("profile-avatar-initials"),t))}function Tc(t,e){const n=document.getElementById("auth-avatar-btn"),r=document.getElementById("auth-avatar-img"),i=document.getElementById("auth-avatar-initials");if(n)if(t&&e){n.classList.add("is-signed-in"),wr(r,i,e);const s=document.getElementById("auth-menu-name"),o=document.getElementById("auth-menu-email");s&&(s.textContent=e.display_name||"User"),o&&(o.textContent=e.email||"")}else n.classList.remove("is-signed-in"),r&&(r.hidden=!0),i&&(i.hidden=!1,i.textContent="👤")}function kc(){document.addEventListener("click",async t=>{var r;const e=t.target;if(e.closest("#auth-avatar-btn")){if(t.stopPropagation(),pe.loggedIn){const i=document.getElementById("auth-user-menu");i!=null&&i.classList.contains("is-visible")?K():Ac()}else vc();return}const n=(r=e.closest("[data-close]"))==null?void 0:r.dataset.close;if(n){Ue(n);return}if(e.classList.contains("auth-backdrop")&&e.id){Ue(e.id);return}if(!e.closest("#auth-user-menu")&&!e.closest("#auth-avatar-btn")&&K(),e.closest("#btn-google")){Ae(!0);try{await lc(),gn()}catch(i){console.error("Google sign-in error:",i),mn(i.code==="auth/popup-closed-by-user"||i.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${i.message||i.code||"unknown error"}`)}finally{Ae(!1)}return}if(e.closest("#btn-facebook")){Ae(!0);try{await uc(),gn()}catch(i){console.error("Facebook sign-in error:",i),mn(i.code==="auth/popup-closed-by-user"||i.code==="auth/cancelled-popup-request"?"Sign-in cancelled.":`Sign-in failed: ${i.message||i.code||"unknown error"}`)}finally{Ae(!1)}return}if(e.closest("#btn-signout")){await fn(),wc();return}if(e.closest("#auth-menu-library-btn")){K(),fc();return}if(e.closest("#auth-menu-profile-btn")){Ec();return}if(e.closest("#auth-menu-signout-btn")){K(),await fn();return}}),document.addEventListener("submit",async t=>{if(!t.target.closest("#auth-profile-form"))return;t.preventDefault();const e=document.getElementById("profile-input-name").value.trim(),n=document.getElementById("profile-input-photo").value.trim(),r=document.getElementById("profile-status");r.textContent="Saving…",r.className="auth-status-msg";try{await dc({display_name:e,photo_url:n||void 0}),r.textContent="✓ Saved",r.classList.add("success"),Ar()}catch(i){console.error("Profile update error:",i),r.textContent="Failed to save.",r.classList.add("error")}})}function Ae(t){["btn-google","btn-facebook"].forEach(e=>{const n=document.getElementById(e);n&&(n.disabled=t,n.classList.toggle("is-loading",t))})}function mn(t){const e=document.getElementById("auth-login-error");e&&(e.textContent=t,e.style.display="block")}function Cc(){Ic(),kc(),pe.onChange(Tc)}const{bookId:Pc,baseUrl:Rc,bookref:yn}=window.BOOK_CONFIG,nt=new WeakMap,qe=document.getElementById("toc-sidebar"),Rt=document.getElementById("toc-overlay"),Sr=document.getElementById("toc-list"),Lc=document.getElementById("toc-toggle-btn"),ue=document.getElementById("toc-search"),Oc=document.getElementById("settings-btn"),ee=document.getElementById("settings-modal"),Dc=document.getElementById("settings-form"),Nc=document.getElementById("settings-cancel");function Mc(){qe.classList.add("open"),Rt.classList.add("show")}function Lt(){qe.classList.remove("open"),Rt.classList.remove("show")}Lc.addEventListener("click",()=>qe.classList.contains("open")?Lt():Mc());Rt.addEventListener("click",Lt);_n(ue,{mode:"both",onConvert:t=>{const e=t.trim();ue.value=e,ue.dispatchEvent(new Event("input"))}});function Tr(t){return t?Pr(t).toLowerCase():""}const pt=Sr.querySelectorAll(".toc-item"),Bc=Array.from(pt).map(t=>Tr(t.textContent));ue.addEventListener("input",()=>{const t=ue.value,e=Tr(t);if(!e){pt.forEach(n=>{n.closest("li").style.display=""});return}pt.forEach((n,r)=>{const i=Bc[r].includes(e);n.closest("li").style.display=i?"":"none"})});Sr.querySelectorAll(".toc-item").forEach(t=>{t.addEventListener("click",()=>{const e=parseInt(t.dataset.paraId);window.innerWidth<960&&Lt();const n=document.querySelector(`.section-block[data-para-id="${e}"]`),r=n==null?void 0:n.querySelector(".section-heading-link");r!=null&&r.href&&(window.location.href=r.href)}),t.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t.click())})});const Fc=new IntersectionObserver(t=>{for(const e of t){if(!e.isIntersecting)continue;const n=parseInt(e.target.dataset.paraId);Uc(n),Vc(n)}},{rootMargin:"-52px 0px -60% 0px"});document.querySelectorAll(".section-block").forEach(t=>Fc.observe(t));function Uc(t){document.querySelectorAll("#toc-list .toc-item").forEach(e=>{const n=parseInt(e.dataset.paraId)===t;e.classList.toggle("active",n),n&&qe.classList.contains("open")&&e.scrollIntoView({block:"nearest"})})}function $c(t){document.querySelectorAll(".pali-text").forEach(e=>{nt.has(e)||nt.set(e,e.innerHTML);const n=nt.get(e);e.innerHTML=t===l.RO?n:Hc(n,t)})}function Hc(t,e){return t.replace(/(<[^>]+>)|([^<]+)/g,(n,r,i)=>r||Pe.convert(Pe.convertFromMixed(i),e))}function Vc(t){const e={mula:"ref-mula",attha:"ref-attha",tika:"ref-tika"};for(const[n,r]of Object.entries(e)){if(!yn[n])continue;const i=document.getElementById(r);i&&(i.href=`${Rc}/book_ref/${yn[n]}?ref=${Pc}&para_id=${t}`)}}Oc.addEventListener("click",()=>{const t=$e();ai(t),En(document.getElementById("pali-script-select"),t.paliScript),ee.classList.add("show")});Nc.addEventListener("click",()=>ee.classList.remove("show"));ee.addEventListener("click",t=>{t.target===ee&&ee.classList.remove("show")});Dc.addEventListener("submit",t=>{t.preventDefault();const e=ci();si(e),vn(e),$c(e.paliScript),ee.classList.remove("show")});function xc(){if(!window.BOOK_CONFIG)return;const{baseUrl:t,bookId:e}=window.BOOK_CONFIG;let n=null,r=null,i=null;function s(a){r=a,pe.loggedIn&&a!==n&&(n=a,clearTimeout(i),i=setTimeout(async()=>{var y,E;const c=document.querySelector(`.section-block[data-para-id="${a}"]`),u=c==null?void 0:c.querySelector(".section-heading-text"),h=((y=u==null?void 0:u.textContent)==null?void 0:y.trim())||"",f=document.querySelector(".book-title"),g=((E=f==null?void 0:f.textContent)==null?void 0:E.trim())||"";try{const ae=await _r();if(!ae)return;fetch(`${t}/api/book/${e}/history`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ae}`},body:JSON.stringify({para_id:a,section_title:h,book_title:g})})}catch{}},5e3))}const o=new IntersectionObserver(a=>{for(const c of a){if(!c.isIntersecting)continue;const u=parseInt(c.target.dataset.paraId);isNaN(u)||s(u)}},{rootMargin:"-10% 0px -50% 0px"});document.querySelectorAll(".section-block").forEach(a=>o.observe(a)),pe.onChange(a=>{a&&r!==null&&s(r)})}document.addEventListener("DOMContentLoaded",async()=>{ui(document.getElementById("main-content"));const t=$e();vn(t),En(document.getElementById("pali-script-select"),t.paliScript),Cc(),bc(),xc()});

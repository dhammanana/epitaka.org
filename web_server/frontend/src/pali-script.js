/**
 * Copyright Path Nirvana 2018
 * The code and character mapping defined in this file can not be used for any commercial purposes.
 * Permission from the auther is required for all other purposes.
 * Edit 2021 - added (non pali) sanskrit consonents and vowels
 */

"use strict";

import { koreanFromSinhala, koreanToSinhala } from './pali-korean.js';
import { isTamilMarker, tamilFromSinhala, tamilToSinhala } from './pali-tamil.js';

const Script = Object.freeze({
    SI: 'si',
    HI: 'hi',
    RO: 'ro',
    THAI: 'th',
    LAOS: 'lo',
    MY: 'my',
    KM: 'km',
    BENG: 'be', ASSE: 'as', // related
    GURM: 'gm',
    THAM: 'tt',
    GUJA: 'gj',
    TELU: 'te',
    KANN: 'ka',
    MALA: 'mm',
    TAMI: 'ta',
    BRAH: 'br',
    TIBT: 'tb',
    CYRL: 'cy',
    KO: 'ko',
});

const paliScriptInfo = new Map ([
    [Script.SI, ['Sinhala', 'සිංහල', [[0x0D80, 0x0DFF]], {f: 'sl_flag.png'} ]],
    [Script.HI, ['Devanagari', 'देवनागरी', [[0x0900, 0x097F]], {f: 'in_flag.png'} ]],
    [Script.RO, ['Roman', 'Roman', [[0x0000, 0x017F], [0x1E00, 0x1EFF]], {f: 'uk_flag.png'} ]], // latin extended and latin extended additional blocks
    [Script.THAI, ['Thai', 'ไทย', [[0x0E00, 0x0E7F], 0xF70F, 0xF700], {f: 'th_flag.png'} ]], // thai special letters are outside the range 
    [Script.LAOS, ['Laos', 'ລາວ', [[0x0E80, 0x0EFF]], {f: 'laos_flag.png'} ]],
    [Script.MY, ['Myanmar', 'ဗမာစာ', [[0x1000, 0x107F]], {f: 'my_flag.png'} ]],
    [Script.KM, ['Khmer', 'ភាសាខ្មែរ', [[0x1780, 0x17FF]], {f: 'kh_flag.png'} ]],
    [Script.BENG, ['Bengali', 'বাংলা', [[0x0980, 0x09FF]], {f: 'bangla_flag.png', g: 'indian'} ]],
    [Script.ASSE, ['Assamese', 'অসমীয়া', [], {f: 'bangla_flag.png', g: 'indian'} ]], // assamese uses the same bangla unicode block and most of its letters
    [Script.GURM, ['Gurmukhi', 'ਗੁਰਮੁਖੀ', [[0x0A00, 0x0A7F]], {g: 'indian'} ]],
    [Script.GUJA, ['Gujarati', 'ગુજરાતી', [[0x0A80, 0x0AFF]], {g: 'indian'} ]],
    [Script.TELU, ['Telugu', 'తెలుగు', [[0x0C00, 0x0C7F]], {g: 'indian'} ]],
    [Script.KANN, ['Kannada', 'ಕನ್ನಡ', [[0x0C80, 0x0CFF]], {g: 'indian'} ]],
    [Script.MALA, ['Malayalam', 'മലയാളം', [[0x0D00, 0x0D7F]], {g: 'indian'} ]],
    [Script.TAMI, ['Tamil', 'தமிழ்', [[0x0B80, 0x0BFF]], {g: 'indian'} ]],
    [Script.THAM, ['Tai Tham', 'Tai Tham LN', [[0x1A20, 0x1AAF]], {c: 'beta-script', g: 'other'} ]],
    [Script.BRAH, ['Brahmi', 'Brāhmī', [[0xD804, 0xD804], [0xDC00, 0xDC7F]], {g: 'other'} ]], //charCodeAt returns two codes for each letter [[0x11000, 0x1107F]]
    [Script.TIBT, ['Tibetan', 'བོད་སྐད།', [[0x0F00, 0x0FFF]], {f: 'tibet_flag.png', c: 'larger', g: 'other'} ]],
    [Script.CYRL, ['Cyrillic', 'кириллица', [[0x0400, 0x04FF], [0x0300, 0x036F]], {f: 'russia_flag.png', g: 'other'} ]], // also adding the "Combining Diacritical Marks" block 
    [Script.KO, ['Korean', '한국어', [[0xAC00, 0xD7A3], [0x1100, 0x11FF]], {g: 'other'} ]], // Hangul syllables + jamo
]);

function getScriptForCode(charCode) {
    for (let info of paliScriptInfo) {
        for (let range of info[1][2]) {
            if (Array.isArray(range) && charCode >= range[0] && charCode <= range[1]) return info[0];
            if (Number.isInteger(range) && charCode == range) return info[0];
        }
    }
    return -1;
}

const script_index = { 
    [Script.SI]: 0, 
    [Script.HI]: 1,
    [Script.RO]: 2,
    [Script.THAI]: 3, 
    [Script.LAOS]: 4,
    [Script.MY]: 5,
    [Script.KM]: 6,
    [Script.BENG]: 7, [Script.ASSE]: 7, // use same convert func
    [Script.GURM]: 8,
    [Script.THAM]: 9,
    [Script.GUJA]: 10,
    [Script.TELU]: 11,
    [Script.KANN]: 12,
    [Script.MALA]: 13,
    [Script.BRAH]: 14,
    [Script.TIBT]: 15,
    [Script.CYRL]: 16,
};
const specials = [ 
    // independent vowels
    ['අ', 'अ', 'a', 'อ', 'ອ', 'အ', 'អ', 'অ', 'ਅ', '\u1A4B', 'અ', 'అ', 'ಅ', 'അ', '𑀅', 'ཨ', 'а'],
    ['ආ', 'आ', 'ā', 'อา', 'ອາ', 'အာ', 'អា', 'আ', 'ਆ', '\u1A4C', 'આ', 'ఆ', 'ಆ', 'ആ', '𑀆', 'ཨཱ', 'а̄'],
    ['ඉ', 'इ', 'i', 'อิ', 'ອິ', 'ဣ', 'ឥ', 'ই', 'ਇ', '\u1A4D', 'ઇ', 'ఇ', 'ಇ', 'ഇ', '𑀇', 'ཨི', 'и'],
    ['ඊ', 'ई', 'ī', 'อี', 'ອີ', 'ဤ', 'ឦ', 'ঈ', 'ਈ', '\u1A4E', 'ઈ', 'ఈ', 'ಈ', 'ഈ', '𑀈', 'ཨཱི', 'ӣ'],
    ['උ', 'उ', 'u', 'อุ', 'ອຸ', 'ဥ', 'ឧ', 'উ', 'ਉ', '\u1A4F', 'ઉ', 'ఉ', 'ಉ', 'ഉ', '𑀉', 'ཨུ', 'у'], 
    ['ඌ', 'ऊ', 'ū', 'อู', 'ອູ', 'ဦ', 'ឩ', 'ঊ', 'ਊ', '\u1A50', 'ઊ', 'ఊ', 'ಊ', 'ഊ', '𑀊', 'ཨཱུ', 'ӯ'],
    ['එ', 'ए', 'e', 'อเ', 'ອເ', 'ဧ', 'ឯ', 'এ', 'ਏ', '\u1A51', 'એ', 'ఏ', 'ಏ', 'ഏ', '𑀏', 'ཨེ', 'е'],
    ['ඔ', 'ओ', 'o', 'อโ', 'ອໂ', 'ဩ', 'ឱ', 'ও', 'ਓ', '\u1A52', 'ઓ', 'ఓ', 'ಓ', 'ഓ', '𑀑', 'ཨོ', 'о'],
    // various signs  
    ['ං', 'ं', 'ṃ', '\u0E4D', '\u0ECD', 'ံ', 'ំ', 'ং', 'ਂ', '\u1A74', 'ં', 'ం', 'ಂ', 'ം', '𑀁', '\u0F7E', 'м̣'], // niggahita - anusawara
    // visarga - not in pali but deva original text has it (thai/lao/tt - not found. using the closest equivalent per wikipedia)
    ['ඃ', 'ः', 'ḥ', 'ะ', 'ະ', 'း', 'ះ', 'ঃ', 'ਃ', '\u1A61', 'ઃ', 'ః', 'ಃ', 'ഃ', '𑀂', '\u0F7F', 'х̣'],
    // virama (al - hal). roman/cyrillic need special handling
    ['්', '्', '', '\u0E3A', '\u0EBA', '္', '្', '্', '੍', '\u1A60', '્', '్', '್', '്', '\uD804\uDC46', '\u0F84', ''], 
    // digits
    ['0', '०', '0', '๐', '໐', '၀', '០', '০', '੦', '\u1A90', '૦', '౦', '೦', '൦', '𑁦', '༠', '0'],
    ['1', '१', '1', '๑', '໑', '၁', '១', '১', '੧', '\u1A91', '૧', '౧', '೧', '൧', '𑁧', '༡', '1'],
    ['2', '२', '2', '๒', '໒', '၂', '២', '২', '੨', '\u1A92', '૨', '౨', '೨', '൨', '𑁨', '༢', '2'],
    ['3', '३', '3', '๓', '໓', '၃', '៣', '৩', '੩', '\u1A93', '૩', '౩', '೩', '൩', '𑁩', '༣', '3'],
    ['4', '४', '4', '๔', '໔', '၄', '៤', '৪', '੪', '\u1A94', '૪', '౪', '೪', '൪', '𑁪', '༤', '4'],
    ['5', '५', '5', '๕', '໕', '၅', '៥', '৫', '੫', '\u1A95', '૫', '౫', '೫', '൫', '𑁫', '༥', '5'],
    ['6', '६', '6', '๖', '໖', '၆', '៦', '৬', '੬', '\u1A96', '૬', '౬', '೬', '൬', '𑁬', '༦', '6'],
    ['7', '७', '7', '๗', '໗', '၇', '៧', '৭', '੭', '\u1A97', '૭', '౭', '೭', '൭', '𑁭', '༧', '7'],
    ['8', '८', '8', '๘', '໘', '၈', '៨', '৮', '੮', '\u1A98', '૮', '౮', '೮', '൮', '𑁮', '༨', '8'],
    ['9', '९', '9', '๙', '໙', '၉', '៩', '৯', '੯', '\u1A99', '૯', '౯', '೯', '൯', '𑁯', '༩', '9'],
    // sanskrit independent vowels - short o and short e does not occur in pali/sinskrit the long version is listed above
    ['ඓ', 'ऐ', 'ai'],
    ['ඖ', 'औ', 'au'],
    ['ඍ', 'ऋ', 'ṛ'],
    ['ඎ', 'ॠ', 'ṝ'],
    ['ඏ', 'ऌ', 'l̥'], // roman changed since otherwise conflicting with ළ් ḷ 
    ['ඐ', 'ॡ', 'ḹ'],
];

const consos = [ 
    // velar stops
    ['ක', 'क', 'k', 'ก', 'ກ', 'က', 'ក', 'ক', 'ਕ', '\u1A20', 'ક', 'క', 'ಕ', 'ക', '𑀓', 'ཀ', 'к'],
    ['ඛ', 'ख', 'kh', 'ข', 'ຂ', 'ခ', 'ខ', 'খ', 'ਖ', '\u1A21', 'ખ', 'ఖ', 'ಖ', 'ഖ', '𑀔', 'ཁ', 'кх'],
    ['ග', 'ग', 'g', 'ค', 'ຄ', 'ဂ', 'គ', 'গ', 'ਗ', '\u1A23', 'ગ', 'గ', 'ಗ', 'ഗ', '𑀕', 'ག', 'г'], 
    ['ඝ', 'घ', 'gh', 'ฆ', '\u0E86', 'ဃ', 'ឃ', 'ঘ', 'ਘ', '\u1A25', 'ઘ', 'ఘ', 'ಘ', 'ഘ', '𑀖', 'གྷ', 'гх'],
    ['ඞ', 'ङ', 'ṅ', 'ง', 'ງ', 'င', 'ង', 'ঙ', 'ਙ', '\u1A26', 'ઙ', 'ఙ', 'ಙ', 'ങ', '𑀗', 'ང', 'н̇'],
    // palatal stops
    ['ච', 'च', 'c', 'จ', 'ຈ', 'စ', 'ច', 'চ', 'ਚ', '\u1A27', 'ચ', 'చ', 'ಚ', 'ച', '𑀘', 'ཙ', 'ч'],
    ['ඡ', 'छ', 'ch', 'ฉ', '\u0E89', 'ဆ', 'ឆ', 'ছ', 'ਛ', '\u1A28', 'છ', 'ఛ', 'ಛ', 'ഛ', '𑀙', 'ཚ', 'чх'],
    ['ජ', 'ज', 'j', 'ช', 'ຊ', 'ဇ', 'ជ', 'জ', 'ਜ', '\u1A29', 'જ', 'జ', 'ಜ', 'ജ', '𑀚', 'ཛ', 'дж'],
    ['ඣ', 'झ', 'jh', 'ฌ', '\u0E8C', 'ဈ', 'ឈ', 'ঝ', 'ਝ', '\u1A2B', 'ઝ', 'ఝ', 'ಝ', 'ഝ', '𑀛', 'ཛྷ', 'джх'],
    ['ඤ', 'ञ', 'ñ', 'ญ', '\u0E8E', 'ဉ', 'ញ', 'ঞ', 'ਞ', '\u1A2C', 'ઞ', 'ఞ', 'ಞ', 'ഞ', '𑀜', 'ཉ', 'н̃'],
    // retroflex stops
    ['ට', 'ट', 'ṭ', 'ฏ', '\u0E8F', 'ဋ', 'ដ', 'ট', 'ਟ', '\u1A2D', 'ટ', 'ట', 'ಟ', 'ട', '𑀝', 'ཊ', 'т̣'],
    ['ඨ', 'ठ', 'ṭh', 'ฐ', '\u0E90', 'ဌ', 'ឋ', 'ঠ', 'ਠ', '\u1A2E', 'ઠ', 'ఠ', 'ಠ', 'ഠ', '𑀞', 'ཋ', 'т̣х'],
    ['ඩ', 'ड', 'ḍ', 'ฑ', '\u0E91', 'ဍ', 'ឌ', 'ড', 'ਡ', '\u1A2F', 'ડ', 'డ', 'ಡ', 'ഡ', '𑀟', 'ཌ', 'д̣'], 
    ['ඪ', 'ढ', 'ḍh', 'ฒ', '\u0E92', 'ဎ', 'ឍ', 'ঢ', 'ਢ', '\u1A30', 'ઢ', 'ఢ', 'ಢ', 'ഢ', '𑀠', 'ཌྷ', 'д̣х'],
    ['ණ', 'ण', 'ṇ', 'ณ', '\u0E93', 'ဏ', 'ណ', 'ণ', 'ਣ', '\u1A31', 'ણ', 'ణ', 'ಣ', 'ണ', '𑀡', 'ཎ', 'н̣'],
    // dental stops
    ['ත', 'त', 't', 'ต', 'ຕ', 'တ', 'ត', 'ত', 'ਤ', '\u1A32', 'ત', 'త', 'ತ', 'ത', '𑀢', 'ཏ', 'т'],
    ['ථ', 'थ', 'th', 'ถ', 'ຖ', 'ထ', 'ថ', 'থ', 'ਥ', '\u1A33', 'થ', 'థ', 'ಥ', 'ഥ', '𑀣', 'ཐ', 'тх'],
    ['ද', 'द', 'd', 'ท', 'ທ', 'ဒ', 'ទ', 'দ', 'ਦ', '\u1A34', 'દ', 'ద', 'ದ', 'ദ', '𑀤', 'ད', 'д'],
    ['ධ', 'ध', 'dh', 'ธ', '\u0E98', 'ဓ', 'ធ', 'ধ', 'ਧ', '\u1A35', 'ધ', 'ధ', 'ಧ', 'ധ', '𑀥', 'དྷ', 'дх'],
    ['න', 'न', 'n', 'น', 'ນ', 'န', 'ន', 'ন', 'ਨ', '\u1A36', 'ન', 'న', 'ನ', 'ന', '𑀦', 'ན', 'н'],
    // labial stops
    ['ප', 'प', 'p', 'ป', 'ປ', 'ပ', 'ប', 'প', 'ਪ', '\u1A38', 'પ', 'ప', 'ಪ', 'പ', '𑀧', 'པ', 'п'],
    ['ඵ', 'फ', 'ph', 'ผ', 'ຜ', 'ဖ', 'ផ', 'ফ', 'ਫ', '\u1A39', 'ફ', 'ఫ', 'ಫ', 'ഫ', '𑀨', 'ཕ', 'пх'],
    ['බ', 'ब', 'b', 'พ', 'ພ', 'ဗ', 'ព', 'ব', 'ਬ', '\u1A3B', 'બ', 'బ', 'ಬ', 'ബ', '𑀩', 'བ', 'б'], 
    ['භ', 'भ', 'bh', 'ภ', '\u0EA0', 'ဘ', 'ភ', 'ভ', 'ਭ', '\u1A3D', 'ભ', 'భ', 'ಭ', 'ഭ', '𑀪', 'བྷ', 'бх'],
    ['ම', 'म', 'm', 'ม', 'ມ', 'မ', 'ម', 'ম', 'ਮ', '\u1A3E', 'મ', 'మ', 'ಮ', 'മ', '𑀫', 'མ', 'м'],
    // liquids, fricatives, etc.
    ['ය', 'य', 'y', 'ย', 'ຍ', 'ယ', 'យ', 'য', 'ਯ', '\u1A3F', 'ય', 'య', 'ಯ', 'യ', '𑀬', 'ཡ', 'й'],
    ['ර', 'र', 'r', 'ร', 'ຣ', 'ရ', 'រ', 'র', 'ਰ', '\u1A41', 'ર', 'ర', 'ರ', 'ര', '𑀭', 'ར', 'р'],
    ['ල', 'ल', 'l', 'ล', 'ລ', 'လ', 'ល', 'ল', 'ਲ', '\u1A43', 'લ', 'ల', 'ಲ', 'ല', '𑀮', 'ལ', 'л'],
    ['ළ', 'ळ', 'ḷ', 'ฬ', '\u0EAC', 'ဠ', 'ឡ', 'ল়', 'ਲ਼', '\u1A4A', 'ળ', 'ళ', 'ಳ', 'ള', '𑀴', 'ལ༹', 'л̣'],
    ['ව', 'व', 'v', 'ว', 'ວ', 'ဝ', 'វ', 'ৰ', 'ਵ', '\u1A45', 'વ', 'వ', 'ವ', 'വ', '𑀯', 'ཝ', 'в'],
    ['ස', 'स', 's', 'ส', 'ສ', 'သ', 'ស', 'স', 'ਸ', '\u1A48', 'સ', 'స', 'ಸ', 'സ', '𑀲', 'ས', 'с'],
    ['හ', 'ह', 'h', 'ห', 'ຫ', 'ဟ', 'ហ', 'হ', 'ਹ', '\u1A49', 'હ', 'హ', 'ಹ', 'ഹ', '𑀳', 'ཧ', 'х'],
    // sanskrit consonants
    ['ශ', 'श', 'ś'],
    ['ෂ', 'ष', 'ş'],
];

const vowels = [
    ['ා', 'ा', 'ā', 'า', 'າ', 'ာ', 'ា', 'া', 'ਾ', '\u1A63', 'ા', 'ా', 'ಾ', 'ാ', '𑀸', '\u0F71', 'а̄'],
    ['ි', 'ि', 'i', '\u0E34', '\u0EB4', 'ိ', 'ិ', 'ি', 'ਿ', '\u1A65', 'િ', 'ి', 'ಿ', 'ി', '𑀺', '\u0F72', 'и'],
    ['ී', 'ी', 'ī', '\u0E35', '\u0EB5', 'ီ', 'ី', 'ী', 'ੀ', '\u1A66', 'ી', 'ీ', 'ೀ', 'ീ', '𑀻', '\u0F71\u0F72', 'ӣ'],
    ['ු', 'ु', 'u', '\u0E38', '\u0EB8', 'ု', 'ុ', 'ু', 'ੁ', '\u1A69', 'ુ', 'ు', 'ು', 'ു', '𑀼', '\u0F74', 'у'],
    ['ූ', 'ू', 'ū', '\u0E39', '\u0EB9', 'ူ', 'ូ', 'ূ', 'ੂ', '\u1A6A', 'ૂ', 'ూ', 'ೂ', 'ൂ', '𑀽', '\u0F71\u0F74', 'ӯ'],
    ['ෙ', 'े', 'e', 'เ', 'ເ', 'ေ', 'េ', 'ে', 'ੇ', '\u1A6E', 'ે', 'ే', 'ೇ', 'േ', '𑁂', '\u0F7A', 'е'], //for th/lo - should appear in front
    ['ො', 'ो', 'o', 'โ', 'ໂ', 'ော', 'ោ', 'ো', 'ੋ', '\u1A6E\u1A63', 'ો', 'ో', 'ೋ', 'ോ', '𑁄', '\u0F7C', 'о'], //for th/lo - should appear in front
    // sanskrit dependant vowels
    ['ෛ', 'ै', 'ai'],
    ['ෞ', 'ौ', 'au'],
    ['ෘ', 'ृ', 'ṛ'],
    ['ෲ', 'ॄ', 'ṝ'],
    ['ෟ', 'ॢ', 'l̥'], // roman changed since otherwise conflicting with ළ් ḷ 
    ['ෳ', 'ॣ', 'ḹ'],
];
const sinh_conso_range = 'ක-ෆ';
const thai_conso_range = 'ก-ฮ';
const lao_conso_range = 'ກ-ຮ';
const mymr_conso_range = 'က-ဠ';

function beautify_sinh(text, script, rendType = '') {
    // change joiners before U+0DBA Yayanna and U+0DBB Rayanna to Virama + ZWJ
    return text.replace(/\u0DCA([\u0DBA\u0DBB])/g, '\u0DCA\u200D$1');
}
function un_beautify_sinh(text) { // long vowels replaced by short vowels as sometimes people type long vowels by mistake
    text = text.replace(/ඒ/g, 'එ').replace(/ඕ/g, 'ඔ');
    return text.replace(/ේ/g, 'ෙ').replace(/ෝ/g, 'ො');
}
function beautify_mymr(text, script, rendType = '') { // new unicode 5.1 spec https://www.unicode.org/notes/tn11/UTN11_3.pdf 
    text = text.replace(/[,;]/g, '၊'); // comma/semicolon -> single line
    text = text.replace(/[\u2026\u0964\u0965]+/g, '။'); // ellipsis/danda/double danda -> double line

    text = text.replace(/ဉ\u1039ဉ/g, 'ည'); // kn + kna has a single char
    text = text.replace(/သ\u1039သ/g, 'ဿ'); // s + sa has a single char (great sa)
    text = text.replace(/င္([က-ဠ])/g, 'င\u103A္$1'); // kinzi - ඞ + al
    text = text.replace(/္ယ/g, 'ျ'); // yansaya  - yapin
    text = text.replace(/္ရ/g, 'ြ'); // rakar - yayit
    text = text.replace(/္ဝ/g, 'ွ'); // al + wa - wahswe
    text = text.replace(/္ဟ/g, 'ှ'); // al + ha - hahto
    // following code for tall aa is from https://www.facebook.com/pndaza.mlm
    text = text.replace(/([ခဂငဒပဝ]ေ?)\u102c/g, "$1\u102b"); // aa to tall aa
    text = text.replace(/(က္ခ|န္ဒ|ပ္ပ|မ္ပ)(ေ?)\u102b/g, "$1$2\u102c"); // restore back tall aa to aa for some pattern
    return text.replace(/(ဒ္ဓ|ဒွ)(ေ?)\u102c/g, "$1$2\u102b");
}
function un_beautify_mymr(text) {  // reverse of beautify above
    text = text.replace(/\u102B/g, 'ာ');
    text = text.replace(/ှ/g, '္ဟ'); // al + ha - hahto
    text = text.replace(/ွ/g, '္ဝ'); // al + wa - wahswe
    text = text.replace(/ြ/g, '္ရ'); // rakar - yayit
    text = text.replace(/ျ/g, '္ယ'); // yansaya  - yapin
    text = text.replace(/\u103A/g, ''); // kinzi
    text = text.replace(/ဿ/g, 'သ\u1039သ'); // s + sa has a single char (great sa)
    text = text.replace(/ည/g, 'ဉ\u1039ဉ'); // nnga
    text = text.replace(/သံဃ/g, 'သင္ဃ'); // nigghahita to ṅ for this word for searching - from Pn Daza

    text = text.replace(/၊/g, ','); // single line -> comma
    return text.replace(/။/g, '.'); // double line -> period
}
/**
 * Each script need additional steps when rendering on screen
 * e.g. for sinh needs converting dandas/abbrev, removing spaces, and addition ZWJ
 */
function beautify_common(text, script, rendType = '') {
    if (rendType == 'cen') {  // remove double dandas around namo tassa
        text = text.replace(/॥/g, '');
    } else if (rendType.startsWith('ga')) { // in gathas, single dandas convert to semicolon, double to period
        text = text.replace(/।/g, ';');
        text = text.replace(/॥/g, '.');
    }

    // remove Dev abbreviation sign before an ellipsis. We don't want a 4th dot after pe.
    text = text.replace(/॰…/g, '…');

    text = text.replace(/॰/g, '·'); // abbre sign changed - prevent capitalization in notes
    text = text.replace(/[।॥]/g, '.'); //all other single and double dandas converted to period

    // cleanup punctuation 1) two spaces to one
    // 2) There should be no spaces before these punctuation marks. 
    text = text.replace(/\s([\s,!;\?\.])/g, '$1');
    return text;
}
// for roman text only
function capitalize(text, script, rendType = '') {
    // the adding of <w> tags around the words before the beautification makes it harder - (?:<w>)? added
    text = text.replace(/^((?:<w>)?\S)/g, (_1, p1) => { // begining of a line
        return p1.toUpperCase();
    });
    text = text.replace(/([\.\?]\s(?:<w>)?)(\S)/g, (_1, p1, p2) => { // beginning of sentence
        return `${p1}${p2.toUpperCase()}`;
    });
    return text.replace(/([\u201C‘](?:<w>)?)(\S)/g, (_1, p1, p2) => { // starting from a quote
        return `${p1}${p2.toUpperCase()}`;
    });
}
const un_capitalize = (text) => text.toLowerCase();
// for thai text - this can also be done in the convert stage
function swap_e_o(text, script, rendType = '') { 
    if (script == Script.THAI) {
        return text.replace(/([ก-ฮ])([เโ])/g, '$2$1'); 
    } else if (script == Script.LAOS) {
        return text.replace(/([ກ-ຮ])([ເໂ])/g, '$2$1');
    }
    throw new Error(`Unsupported script ${script} for swap_e_o method.`);
}
// to be used when converting from
function un_swap_e_o(text, script) { 
    if (script == Script.THAI) {
        return text.replace(/([เโ])([ก-ฮ])/g, '$2$1'); 
    } else if (script == Script.LAOS) {
        return text.replace(/([ເໂ])([ກ-ຮ])/g, '$2$1');
    }
    throw new Error(`Unsupported script ${script} for un_swap_e_o method.`);
}
// in thai pali these two characters have special glyphs (using the encoding used in the THSarabunNew Font)
function beautify_thai(text, script) {
    text = text.replace(/\u0E34\u0E4D/g, '\u0E36'); // 'iṃ' has a single unicode in thai 
    text = text.replace(/ญ/g, '\uF70F');
    return text.replace(/ฐ/g, '\uF700');
}
function un_beautify_thai(text, script) { 
    text = text.replace(/ฎ/g, 'ฏ'); // sometimes people use ฎ instead of the correct ฏ which is used in the tipitaka
    text = text.replace(/\u0E36/g, '\u0E34\u0E4D'); // 'iṃ' has a single unicode in thai which is split into two here
    text = text.replace(/\uF70F/g, 'ญ');
    return text.replace(/\uF700/g, 'ฐ');
}
function un_beautify_khmer(text, script) {
    text = text.replace(/\u17B9/g, '\u17B7\u17C6'); // 'iṃ' has a single unicode in khmer which is split into two here
    return text.replace(/\u17D1/g, '\u17D2'); // end of word virama is different in khmer
}
/* zero-width joiners - replace both ways
['\u200C', ''], // ZWNJ (remove) not in sinh (or deva?)
['\u200D', ''], // ZWJ (remove) will be added when displaying*/
function cleanup_zwj(inputText) {
    return inputText.replace(/\u200C|\u200D/g, '');
}

function beautify_brahmi(text) { // just replace deva danda with brahmi danda
    text = text.replace(/।/g,'𑁇');
    text = text.replace(/॥/g,'𑁈');
    return text.replace(/–/g,'𑁋');
}
function beautify_tham(text) { // todo - unbeautify needed
    text = text.replace(/\u1A60\u1A41/g, '\u1A55'); // medial ra - rakar
    text = text.replace(/\u1A48\u1A60\u1A48/g,'\u1A54'); // great sa - ssa
    text = text.replace(/।/g,'\u1AA8');
    return text.replace(/॥/g,'\u1AA9');
}

function beautify_tibet(text) { // copied form csharp - consider removing subjoined as it makes it hard to read
    // not adding the intersyllabic tsheg between "syllables" (done in csharp code) since no visible change
    text = text.replace(/।/g,'།'); // tibet dandas
    text = text.replace(/॥/g,'༎');
    // Iterate over all of the consonants, looking for tibetan halant + consonant.
    // Replace with the corresponding subjoined consonant (without halant)
    for (let i = 0; i <= 39; i++) {
        text = text.replace(new RegExp(String.fromCharCode(0x0F84, 0x0F40 + i), 'g'), String.fromCharCode(0x0F90 + i));
    }
    // exceptions: yya and vva use the "fixed-form subjoined consonants as the 2nd one
    text = text.replace(/\u0F61\u0FB1/g, '\u0F61\u0FBB'); //yya
    text = text.replace(/\u0F5D\u0FAD/g, '\u0F5D\u0FBA'); //vva

    // exceptions: jjha, yha and vha use explicit (visible) halant between
    text = text.replace(/\u0F5B\u0FAC/g, '\u0F5B\u0F84\u0F5C'); //jjha
    text = text.replace(/\u0F61\u0FB7/g, '\u0F61\u0F84\u0F67'); //yha
    return text.replace(/\u0F5D\u0FB7/g, '\u0F5D\u0F84\u0F67'); //vha
}
function un_beautify_tibet(text) {
    return text; // todo undo the subjoining done above
}
function beautify_assamese(text) { 
    // can unbeautify but not useful since it is not possible to identify assamese since it uses the same unicode block as bangla
    // rules taken from sumitta.dhan@gmail.com email message 
    text = text.replace(/ৰ/g, 'ৱ');
    text = text.replace(/র/g, 'ৰ');
    text = text.replace(/ল়/g, 'ড়');
    return text;
}

const beautify_func_default = [];
const beautify_func = {
    [Script.SI]: [beautify_sinh, beautify_common],
    [Script.RO]: [beautify_common, capitalize],
    [Script.THAI]: [swap_e_o, beautify_thai, beautify_common],
    [Script.LAOS]: [swap_e_o, beautify_common],
    [Script.MY]: [beautify_mymr, beautify_common],
    [Script.KM]: [beautify_common],
    [Script.THAM]: [beautify_tham],
    [Script.GUJA]: [beautify_common],
    [Script.TELU]: [beautify_common],
    [Script.MALA]: [beautify_common],
    [Script.BRAH]: [beautify_brahmi, beautify_common],
    [Script.TIBT]: [beautify_tibet],
    [Script.CYRL]: [beautify_common],
    [Script.ASSE]: [beautify_assamese],
    [Script.TAMI]: [beautify_common],
    [Script.KO]: [beautify_common],
};
// when converting from another script, have to unbeautify before converting
const un_beautify_func_default = [];
const un_beautify_func = {
    [Script.SI] : [cleanup_zwj, un_beautify_sinh],
    [Script.HI] : [cleanup_zwj],   // original deva script (from tipitaka.org) text has zwj
    [Script.RO]: [un_capitalize],
    [Script.THAI]: [un_beautify_thai, un_swap_e_o],
    [Script.LAOS]: [un_swap_e_o],
    [Script.KM]: [un_beautify_khmer],
    [Script.MY]: [un_beautify_mymr],
    [Script.TIBT]: [un_beautify_tibet],
}

function prepareHashMaps(fromIndex, toIndex, useVowels = true) {
    let fullAr = consos.concat(specials, useVowels ? vowels : []), finalAr = [[], [], []]; //max 3
    fullAr.forEach(val => {
        if (val[fromIndex]) { // empty mapping - e.g in roman
            finalAr[val[fromIndex].length - 1].push([val[fromIndex], val[toIndex]]);
        }
    });
    return finalAr.filter(ar => ar.length).map(ar => [ar[0][0].length, new Map(ar)]).reverse(); // longest is first
}
function replaceByMaps(inputText, hashMaps) {
    let outputAr = new Array(), b = 0; 
    while (b < inputText.length) {
        let match = false;
        for (let [len, hashMap] of hashMaps) {
            const inChars = inputText.substr(b, len);
            if (hashMap.has(inChars)) {
                outputAr.push(hashMap.get(inChars)); // note: can be empty string too
                match = true;
                b += len;
                break;
            }
        }
        if (!match) { // did not match the hashmaps
            outputAr.push(inputText.charAt(b)); 
            b++;
        }
    }
    return outputAr.join('');
}

// for roman/cyrl text - insert 'a' after all consonants that are not followed by virama, dependent vowel or 'a'
// cyrillic mapping extracted from https://dhamma.ru/scripts/transdisp.js - TODO capitalize cyrl too
function insert_a(text, script) {
    const a = (script == Script.CYRL) ? '\u0430' : 'a'; // roman a or cyrl a
    text = text.replace(new RegExp(`([ක-ෆ])([^\u0DCF-\u0DDF\u0DCA${a}])`, 'g'), `$1${a}$2`);
    text = text.replace(new RegExp(`([ක-ෆ])([^\u0DCF-\u0DDF\u0DCA${a}])`, 'g'), `$1${a}$2`);
    return text.replace(/([ක-ෆ])$/g, `$1${a}`); // conso at the end of string not matched by regex above
}
const IV_TO_DV = {'අ': '', 'ආ': 'ා', 'ඉ': 'ි', 'ඊ': 'ී', 'උ': 'ු', 'ඌ': 'ූ', 'එ': 'ෙ', 'ඔ': 'ො'}; 
function remove_a(text, script) {
    text = text.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g, '$1\u0DCA$2'); // done twice to match successive hal
    text = text.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g, '$1\u0DCA$2');
    text = text.replace(/([ක-ෆ])$/g, '$1\u0DCA'); // last conso not matched by above
    text = text.replace(/([ක-ෆ])([අආඉඊඋඌඑඔ])/g, (_1, p1, p2) => p1 + IV_TO_DV[p2]);
    return text;
}
const fix_m_above = (text) => text.replace(/ṁ/g, 'ං'); // per ven anandajothi request

// Korean is not a character map of the Sinhala tables: which jamo a
// consonant takes depends on its neighbours, so it uses the syllable-aware
// transliterator in pali-korean.js.
const korean_convert_to = (text) => koreanFromSinhala(text);
const korean_convert_from = (text) => koreanToSinhala(text);

// Tamil is a character map of the Sinhala tables, but the same letter carries
// a superscript marker for the aspirated/voiced stops and e/o depend on a
// doubled consonant, so it uses the same kind of dedicated module: the rules
// (superscript moves, short e/o, dental/alveolar n) live in pali-tamil.js.
const tamil_convert_to = (text) => tamilFromSinhala(text);
const tamil_convert_from = (text) => tamilToSinhala(text);

const convert_to_func_default = [convert_to];
const convert_to_func = {
    [Script.SI] : [],
    [Script.RO] : [insert_a, convert_to],
    [Script.CYRL] : [insert_a, convert_to],
    [Script.TAMI] : [tamil_convert_to],
    [Script.KO] : [korean_convert_to],
}

const convert_from_func_default = [convert_from];
const convert_from_func = {
    [Script.SI] : [],
    [Script.RO] : [convert_from_w_v, fix_m_above, remove_a],
    [Script.CYRL] : [convert_from_w_v, remove_a],
    [Script.TAMI] : [tamil_convert_from],
    [Script.KO] : [korean_convert_from],
}

function convert_to(text, script) {
    const hashMaps = prepareHashMaps(script_index[Script.SI], script_index[script]);
    return replaceByMaps(text, hashMaps);
}
function convert_from(text, script) {
    const hashMaps = prepareHashMaps(script_index[script], script_index[Script.SI]); // TODO create maps initially and reuse them
    //console.log(hashMaps);
    return replaceByMaps(text, hashMaps);
}
function convert_from_w_v(text, script) {
    const hashMaps = prepareHashMaps(script_index[script], script_index[Script.SI], false); // without vowels for roman
    return replaceByMaps(text, hashMaps);
}

class TextProcessor {
    // convert from sinhala to another script
    static basicConvert(text, script) {
        (convert_to_func[script] || convert_to_func_default).forEach(func => text = func(text, script));
        return text;
    }
    // convert from another script to sinhala
    static basicConvertFrom(text, script) {
        (convert_from_func[script] || convert_from_func_default).forEach(func => text = func(text, script));
        return text;
    }
    // script specific beautification
    static beautify(text, script, rendType = '') {
        (beautify_func[script] || beautify_func_default).forEach(func => text = func(text, script, rendType));
        return text;
    }
    // from Sinhala to other script
    static convert(text, script) {
        text = this.basicConvert(text, script);
        return this.beautify(text, script);
    }
    // from other script to Sinhala - one script
    static convertFrom(text, script) {
        (un_beautify_func[script] || un_beautify_func_default).forEach(func => text = func(text, script));
        return this.basicConvertFrom(text, script);
    }
    // from other scripts (mixed) to Sinhala
    static convertFromMixed(mixedText) {
        mixedText = cleanup_zwj(mixedText) + ' '; // zwj messes with computing runs + hack to process last char
        let curScript = -1, run = '', output = '';
        for(let i = 0; i < mixedText.length; i++) {
            const code = mixedText.charCodeAt(i);
            // ² ³ ⁴ are Tamil's aspirate/voice markers but ² ³ sit in the Roman
            // range, so keep them inside the current non-Roman run — otherwise a
            // Tamil word splits at every marker and க² could not map back to ඛ.
            const tamilMarker = isTamilMarker(code) && curScript != -1 && curScript != Script.RO;
            const newScript = tamilMarker ? curScript : getScriptForCode(code);
            if (newScript != curScript || (i == mixedText.length - 1)) { // make sure to process the last run
                output += this.convertFrom(run, curScript);
                curScript = newScript;
                run = mixedText.charAt(i);
            } else {
                run += mixedText.charAt(i);
            }
        }
        //console.log(`convert from mixed: "${mixedText}" => "${output}"`);
        return output;
    }
}

// for es6 - browser
export {TextProcessor, Script, paliScriptInfo, getScriptForCode};

// for node
//module.exports = {TextProcessor: TextProcessor, Script: Script};

/**
 * how to use this library
 * first step - convert from source script to sinhala
 * const sinhText = TextProcessor.convertFrom(romanText, Script.RO) // convert from one specific script to sinhala
 * const sinhText = TextProcessor.convertFromMixed(mixedPaliText) // convert from any script to Sinhala
 * second step - convert to your destination script from sinhala
 * const finalText = TextProcessor.convert(sinhText, Script.MY)
 */



/*
let testDev = '॥ नमो तस्स भगवतो अरहतो सम्मासम्बुद्धस्स॥ දක්ඛිණා';
let testMaps = 'akappiyapathavīsaṅkhyā';
console.log(TextProcessor.convertFrom(testMaps, Script.RO));
let testSinh = 'ආබොග';
testSinh = TextProcessor.convert(testSinh, Script.MY);
//console.log(testSinh);
//console.log(TextProcessor.convertFrom(testSinh, Script.MY));
//const assert = require('assert');
import assert from 'assert';
function errorCheckMapping() {
    const num_scripts = Object.keys(script_index).length;
    consos.concat(specials, vowels).forEach(ar => {
        assert(ar.length == num_scripts, `${ar} length not ${num_scripts}`);
        ar.forEach((ch, i) => {
            if (ch) {
                const spt = getScriptForCode(ch.charCodeAt(0));
                // sinhala digits are in roman range - hence the isNan check
                assert(script_index[spt] == i || !isNaN(ch), `char ${ch} code ${ch.charCodeAt(0)} not within the range for script ${spt}`);
            }
        });
        const uniq = ar.filter((v, i, a) => a.indexOf(v) === i);
        if (uniq.length != ar.length && isNaN(ar[0])) console.log(`duplicates in mapping: ${ar} : ${uniq}`);
    });
}
errorCheckMapping();
*/


/*
    else if (ccode >= 0x0F00 && ccode <= 0x0FFF)
        script = Script.Tibetan;
        script = Script.Latin;

function prepareHashMap(fromIndex, toIndex) {
    let fullAr = consos.concat(specials, vowels), finalAr = [];
    fullAr.forEach(val => {
        if (val[fromIndex]) { // empty mapping
            finalAr.push([val[fromIndex], val[toIndex]]);
        }
    });
    return new Map(finalAr);
}
function replaceByMap(inputText, hashMap) {
    inputText = cleanup_zwj(inputText);
    let oldChar = '', outputAr = new Array(inputText.length);
    for (let i = 0; i < inputText.length; i++) {
        oldChar = inputText.charAt(i);
        if (hashMap.has(oldChar)) {
            outputAr[i] = hashMap.get(oldChar); // note: can be empty string too
        } else {
            outputAr[i] = oldChar;
        }
    }
    return outputAr.join('');
}

const deva_specials = [
    ['\u0D82','\u0902'], // niggahita - anusawara
    ['\u0D83','\u0903'], // visarga - not in pali but deva original text has it

    // independent vowels
    ['\u0D85','\u0905'], // a
    ['\u0D86','\u0906'], // aa
    ['\u0D89','\u0907'], // i
    ['\u0D8A','\u0908'], // ii
    ['\u0D8B','\u0909'], // u
    ['\u0D8C','\u090A'], // uu
    ['\u0D91','\u090F'], // e
    ['\u0D94','\u0913'], // o

    // various signs
    ['\u0DCA','\u094D'], // Sinhala virama -> Dev. virama (al - hal)

    // digits
    ['0', '\u0966'],
    ['1', '\u0967'],
    ['2', '\u0968'],
    ['3', '\u0969'],
    ['4', '\u096A'],
    ['5', '\u096B'],
    ['6', '\u096C'],
    ['7', '\u096D'],
    ['8', '\u096E'],
    ['9', '\u096F'],
];*/
/*const deva_conso = [
    // velar stops
    ['\u0D9A','\u0915'], // ka
    ['\u0D9B','\u0916'], // kha
    ['\u0D9C','\u0917'], // ga
    ['\u0D9D','\u0918'], // gha
    ['\u0D9E','\u0919'], // n overdot a

    // palatal stops
    ['\u0DA0','\u091A'], // ca
    ['\u0DA1','\u091B'], // cha
    ['\u0DA2','\u091C'], // ja
    ['\u0DA3','\u091D'], // jha
    ['\u0DA4','\u091E'], // �a

    // retroflex stops
    ['\u0DA7','\u091F'], // t underdot a
    ['\u0DA8','\u0920'], // t underdot ha
    ['\u0DA9','\u0921'], // d underdot a
    ['\u0DAA','\u0922'], // d underdot ha
    ['\u0DAB','\u0923'], // n underdot a

    // dental stops
    ['\u0DAD','\u0924'], // ta
    ['\u0DAE','\u0925'], // tha
    ['\u0DAF','\u0926'], // da
    ['\u0DB0','\u0927'], // dha
    ['\u0DB1','\u0928'], // na

    // labial stops
    ['\u0DB4','\u092A'], // pa
    ['\u0DB5','\u092B'], // pha
    ['\u0DB6','\u092C'], // ba
    ['\u0DB7','\u092D'], // bha
    ['\u0DB8','\u092E'], // ma

    // liquids, fricatives, etc.
    ['\u0DBA','\u092F'], // ya
    ['\u0DBB','\u0930'], // ra
    ['\u0DBD','\u0932'], // la
    ['\u0DC0','\u0935'], // va
    ['\u0DC3','\u0938'], // sa
    ['\u0DC4','\u0939'], // ha
    ['\u0DC5','\u0933'], // l underdot a
];*/
/*const deva_vowels = [
    // dependent vowel signs
    ['\u0DCF','\u093E'], // aa
    ['\u0DD2','\u093F'], // i
    ['\u0DD3','\u0940'], // ii
    ['\u0DD4','\u0941'], // u
    ['\u0DD6','\u0942'], // uu
    ['\u0DD9','\u0947'], // e
    ['\u0DDC','\u094B'], // o
];*/
/**
 * Hangul (Korean) transliteration of Pāli.
 *
 * The rules follow the Korean edition of the Tipiṭaka glossary
 * (니까야 번역 용어집 v1.1, §1.1–1.5, confirmed 2026-09-25):
 *
 *  - tenuis stops use the tense jamo so the Hangul reads close to the Pāli
 *    pronunciation: k → ㄲ, c → ㅉ, ṭ/t → ㄸ, p → ㅃ;
 *  - aspirated stops use the aspirated jamo: kh → ㅋ, ch → ㅊ, ṭh/th → ㅌ,
 *    ph → ㅍ;
 *  - voiced and voiced-aspirated stops fall together on the plain jamo:
 *    g/gh → ㄱ, j/jh → ㅈ, ḍ/ḍh → ㄷ, d/dh → ㄷ, b/bh → ㅂ;
 *  - ṅ/ṃ → ㅇ, ñ/ṇ/n → ㄴ, m → ㅁ, s → ㅅ, h → ㅎ, r/l/ḷ → ㄹ;
 *  - ñ before a/e/o carries a y-glide (냐·녜·뇨), y → 야·유·예·요,
 *    v → 와·위·우·웨·오;
 *  - vowel length is not written: a/ā ㅏ, i/ī ㅣ, u/ū ㅜ, e ㅔ, o ㅗ
 *    (Sāriputta → 사리뿟따, Ānanda → 아난다);
 *  - a geminate writes its first consonant as the batchim of the preceding
 *    syllable, using only the seven legal finals ㄱ ㄴ ㄹ ㅁ ㅂ ㅅ ㅇ
 *    (kk → ㄱ, tt/cc/jj/ss → ㅅ, pp/bb → ㅂ, nn/ṇṇ/ññ → ㄴ, mm → ㅁ,
 *    ll/ḷḷ → ㄹ): bhikkhu 빅쿠, sutta 숫따, Dhamma 담마, Puṇṇa 뿐나;
 *  - a nasal before another consonant becomes the batchim
 *    (Saṅgha 상가, Ānanda 아난다, Bimbisāra 빔비사라);
 *  - a single intervocalic l/ḷ adds a ㄹ batchim to the preceding syllable
 *    (Kosala 꼬살라, Uruvelā 우루웰라, Aṅgulimāla 앙굴리말라); a single
 *    intervocalic r does not (Uruvelā → 우루웰라, not 우룰웰라);
 *  - consonant + yā fuses into one syllable (Sakya 사꺄,
 *    Māluṅkyaputta 말룽꺄뿟따);
 *  - a consonant with no vowel takes 으 (Brahmā 브라흐마).
 *
 * Names keep their stem form because the Roman source already does, and
 * names with a fixed translation (Buddha → 부처님, Bhagavā → 세존,
 * Brahmā → 범천) or compound place names (Jetavana → 제따 숲) are handled by
 * the translator, not here.
 *
 * The reader pivots every script through Sinhala (see pali-script.js), so
 * this module converts Sinhala ⇄ Hangul; Roman input reaches it through the
 * normal Roman → Sinhala step.
 */

"use strict";

const HANGUL_BASE = 0xac00;

const VI_RAMA = "\u0DCA";

const INITIAL_INDEX = {
    'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7,
    'ㅃ': 8, 'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13, 'ㅊ': 14,
    'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18,
};

const MEDIAL_INDEX = {
    'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7,
    'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14,
    'ㅞ': 15, 'ㅟ': 16, 'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20,
};

// Only the seven legal finals are used, so every other consonant has no
// batchim entry (null) here.
const FINAL_INDEX = {
    '': 0, 'ㄱ': 1, 'ㄴ': 4, 'ㄷ': 7, 'ㄹ': 8, 'ㅁ': 16, 'ㅂ': 17, 'ㅅ': 19,
    'ㅇ': 21,
};

// Sinhala consonant → [syllable-initial jamo, batchim jamo]. The batchim is
// null when the consonant is never written as a final (y, r, v, h): such a
// half-consonant takes an inserted 으 syllable instead (Brahmā → 브라흐마).
const CONSONANTS = {
    // velar stops
    'ක': ['ㄲ', 'ㄱ'], 'ඛ': ['ㅋ', 'ㄱ'], 'ග': ['ㄱ', 'ㄱ'], 'ඝ': ['ㄱ', 'ㄱ'],
    'ඞ': ['ㅇ', 'ㅇ'],
    // palatal stops
    'ච': ['ㅉ', 'ㅅ'], 'ඡ': ['ㅊ', 'ㅅ'], 'ජ': ['ㅈ', 'ㅅ'], 'ඣ': ['ㅈ', 'ㅅ'],
    'ඤ': ['ㄴ', 'ㄴ'],
    // retroflex stops
    'ට': ['ㄸ', 'ㅅ'], 'ඨ': ['ㅌ', 'ㅅ'], 'ඩ': ['ㄷ', 'ㅅ'], 'ඪ': ['ㄷ', 'ㅅ'],
    'ණ': ['ㄴ', 'ㄴ'],
    // dental stops
    'ත': ['ㄸ', 'ㅅ'], 'ථ': ['ㅌ', 'ㅅ'], 'ද': ['ㄷ', 'ㅅ'], 'ධ': ['ㄷ', 'ㅅ'],
    'න': ['ㄴ', 'ㄴ'],
    // labial stops
    'ප': ['ㅃ', 'ㅂ'], 'ඵ': ['ㅍ', 'ㅂ'], 'බ': ['ㅂ', 'ㅂ'], 'භ': ['ㅂ', 'ㅂ'],
    'ම': ['ㅁ', 'ㅁ'],
    // liquids and fricatives
    'ය': ['ㅇ', null], 'ර': ['ㄹ', null], 'ල': ['ㄹ', 'ㄹ'], 'ළ': ['ㄹ', 'ㄹ'],
    'ව': ['ㅇ', null], 'ස': ['ㅅ', 'ㅅ'], 'හ': ['ㅎ', null],
};

// Dependent vowel signs → medial jamo ('' is the inherent a).
const VOWEL_SIGNS = {
    '': 'ㅏ', 'ා': 'ㅏ', 'ි': 'ㅣ', 'ී': 'ㅣ', 'ු': 'ㅜ', 'ූ': 'ㅜ',
    'ෙ': 'ㅔ', 'ො': 'ㅗ',
};

// Independent vowels → medial jamo, written with the silent ㅇ initial.
const INDEPENDENT_VOWELS = {
    'අ': 'ㅏ', 'ආ': 'ㅏ', 'ඉ': 'ㅣ', 'ඊ': 'ㅣ', 'උ': 'ㅜ', 'ඌ': 'ㅜ',
    'එ': 'ㅔ', 'ඔ': 'ㅗ',
};

// y-glide forms (y, and ñ before a/e/o): 야 유 예 요.
const Y_GLIDE = { 'ㅏ': 'ㅑ', 'ㅣ': 'ㅣ', 'ㅜ': 'ㅠ', 'ㅔ': 'ㅖ', 'ㅗ': 'ㅛ' };

// v → w-glide forms: 와 위 우 웨 오.
const W_GLIDE = { 'ㅏ': 'ㅘ', 'ㅣ': 'ㅟ', 'ㅜ': 'ㅜ', 'ㅔ': 'ㅞ', 'ㅗ': 'ㅗ' };

// ── Hangul → Sinhala ───────────────────────────────────────────────────
// Hangul is lossy for Pāli (ㄹ writes both r and l, the ㅅ batchim writes
// tt/dd/cc/jj/ss alike), so the reverse mapping picks the most frequent
// source: ㄹ → ර, coda ㅅ → ත, coda ㄱ → ක.
const BACK_INITIAL = [
    'ග', 'ක', 'න', 'ද', 'ත', 'ර', 'ම', 'බ', 'ප', 'ස', 'ස', 'ජ', 'ච', 'ඡ',
    'ඛ', 'ථ', 'ඵ', 'හ',
];
const IEUNG_INDEX = 11; // ㅇ has no consonant letter

const BACK_VOWEL = {
    0: '',    // ㅏ
    1: '',    // ㅐ
    4: '',    // ㅓ
    5: 'ෙ',   // ㅔ
    8: 'ො',   // ㅗ
    13: 'ු',  // ㅜ
    18: '්',  // ㅡ (inserted-vowel marker: 브 → බ්)
    19: '',   // ㅢ
    20: 'ි',  // ㅣ
};

// y-glide medials → the vowel sign that follows the palatal letter.
const BACK_Y_GLIDE = {
    2: '',    // ㅑ
    3: 'ෙ',   // ㅒ
    6: '',    // ㅕ
    7: 'ෙ',   // ㅖ
    12: 'ො',  // ㅛ
    17: 'ු',  // ㅠ
};

// w-glide medials (only ever written with a silent ㅇ initial) → ව + sign.
const BACK_W_GLIDE = { 9: 'ා', 10: 'ෑ', 15: 'ෙ', 16: 'ි' };

const BACK_FINAL = { 1: 'ක්', 4: 'න්', 8: 'ල්', 16: 'ම්', 17: 'ප්', 19: 'ත්', 21: 'ං' };

function compose(initial, medial, batchim) {
    const l = INITIAL_INDEX[initial];
    const v = MEDIAL_INDEX[medial];
    const t = FINAL_INDEX[batchim || ''];
    return String.fromCharCode(HANGUL_BASE + (l * 21 + v) * 28 + t);
}

/**
 * Convert Sinhala-script Pāli to Hangul.
 * Non-Pāli characters (spaces, punctuation, digits, Latin text) are copied
 * through unchanged.
 */
export function koreanFromSinhala(text) {
    // The Sinhala pivot carries ZWJ joiners (beautify_sinh adds one before
    // ය/ර); they would hide the virama from the cluster rules below.
    text = text.replace(/\u200C|\u200D/g, '');

    const out = [];
    let word = [];   // [{initial, medial, batchim, inserted}]
    let pendingOnset = null; // consonant whose virama is followed by ය

    const flush = () => {
        if (pendingOnset !== null) {
            word.push({ initial: CONSONANTS[pendingOnset][0], medial: 'ㅡ', batchim: null, inserted: true });
            pendingOnset = null;
        }
        for (const s of word) out.push(compose(s.initial, s.medial, s.batchim));
        word = [];
    };

    const addBatchim = (batchim, initial) => {
        const last = word[word.length - 1];
        if (batchim && last && !last.batchim && !last.inserted) {
            last.batchim = batchim;
        } else {
            word.push({ initial: initial, medial: 'ㅡ', batchim: null, inserted: true });
        }
    };

    for (let i = 0; i < text.length; i++) {
        const ch = text.charAt(i);

        if (INDEPENDENT_VOWELS[ch]) {
            flush();
            word.push({ initial: 'ㅇ', medial: INDEPENDENT_VOWELS[ch], batchim: null, inserted: false });
            continue;
        }

        const letter = CONSONANTS[ch];
        if (letter) {
            const next = i + 1 < text.length ? text.charAt(i + 1) : '';
            const afterVirama = i + 2 < text.length ? text.charAt(i + 2) : '';

            if (next === VI_RAMA) {
                if (afterVirama === 'ය') { // consonant + yā joins one syllable
                    pendingOnset = ch;
                    i += 1;
                    continue;
                }
                addBatchim(letter[1], letter[0]);
                i += 1;
                continue;
            }

            const sign = Object.prototype.hasOwnProperty.call(VOWEL_SIGNS, next) ? next : '';
            const base = VOWEL_SIGNS[sign];
            let medial = base;
            let initial = letter[0];

            if (ch === 'ය') {
                // yā after a half-consonant fuses into that consonant's syllable.
                if (pendingOnset !== null) initial = CONSONANTS[pendingOnset][0];
                medial = Y_GLIDE[base];
                pendingOnset = null;
            } else if (ch === 'ව') {
                medial = W_GLIDE[base];
            } else if (ch === 'ඤ') {
                // ñ carries the y-glide before a/e/o: 냐·녜·뇨.
                medial = Y_GLIDE[base];
            }

            // A single intervocalic l/ḷ lengthens the previous syllable with
            // a ㄹ batchim (Kosala → 꼬살라, Uruvelā → 우루웰라).
            const last = word[word.length - 1];
            if ((ch === 'ල' || ch === 'ළ') && last && !last.batchim && !last.inserted) {
                last.batchim = 'ㄹ';
            }

            word.push({ initial: initial, medial: medial, batchim: null, inserted: false });
            i += sign.length; // sign is '' or a single BMP character
            continue;
        }

        if (ch === 'ං') { // niggahīta: ㅇ batchim on the syllable it follows
            const last = word[word.length - 1];
            if (last && !last.batchim) {
                last.batchim = 'ㅇ';
            } else {
                word.push({ initial: 'ㅇ', medial: 'ㅏ', batchim: 'ㅇ', inserted: false });
            }
            pendingOnset = null;
            continue;
        }

        flush();
        out.push(ch);
    }
    flush();
    return out.join('');
}

/**
 * Convert Hangul Pāli back to Sinhala (best effort, see the notes above).
 * Characters outside the Hangul syllable block are copied through.
 */
export function koreanToSinhala(text) {
    const out = [];
    for (const ch of text) {
        const code = ch.codePointAt(0);
        const offset = code - HANGUL_BASE;
        if (offset < 0 || offset >= 11172) {
            out.push(ch);
            continue;
        }
        const initialIndex = Math.floor(offset / 588);
        const medialIndex = Math.floor((offset % 588) / 28);
        const finalIndex = offset % 28;

        const initial = initialIndex === IEUNG_INDEX
            ? ''
            : BACK_INITIAL[initialIndex - (initialIndex > IEUNG_INDEX ? 1 : 0)];

        const yVowel = BACK_Y_GLIDE[medialIndex];
        const wVowel = BACK_W_GLIDE[medialIndex];
        let body;
        if (yVowel !== undefined) {
            if (!initial) body = 'ය' + yVowel;
            else if (initial === 'න') body = 'ඤ' + yVowel;
            else body = initial + '්ය' + yVowel;
        } else if (wVowel !== undefined) {
            body = !initial ? 'ව' + wVowel : initial + (BACK_VOWEL[medialIndex] || '');
        } else {
            const sign = BACK_VOWEL[medialIndex] || '';
            // A bare 으 has no consonant to attach the virama to.
            body = (!initial && sign === '්') ? '' : initial + sign;
        }

        out.push(body);
        out.push(BACK_FINAL[finalIndex] || '');
    }
    return out.join('');
}

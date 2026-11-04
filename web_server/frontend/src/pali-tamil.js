/**
 * Tamil transliteration of Pāli.
 *
 * The rules follow the Tamil Tipiṭaka (tipitaka-xml Deva2Taml.cs), the same
 * convention the app uses (lib/core/utils/pali_script_converter.dart):
 *
 *  - aspirated and voiced consonants take a superscript marker after the
 *    letter: kha க², ga க³, gha க⁴, cha ச², jha ஜ², ṭha ட², …
 *  - the marker moves after the dependent vowel sign or virama, since Tamil
 *    writes them as one cluster with the consonant (க² + ா → கா²,
 *    க² + ் → க்²);
 *  - Pāli e/o are long, so ஏ/ஓ/ே/ோ are used — except before a doubled
 *    consonant, where the short எ/ஒ/ெ/ொ is written (heṭṭhu → ஹெட்டு²);
 *  - dental ந is written alveolar ன inside a word, but stays dental before a
 *    dental stop (ன்த → ந்த);
 *  - the anusvara is written ங், and Tamil has no inherent vowel, so a
 *    consonant without a vowel sign keeps only the virama
 *    (dhamma → த⁴ம்ம, etaṃ → ஏதங்).
 *
 * Notes:
 *  - ங் is ambiguous: it is both the anusvara (saṅgha → ஸங்க⁴) and ṅ + virama,
 *    so converting back gives saṅgha → සංඝ — the same result as the reference
 *    conversion, not a bug.
 *  - the superscripts ² ³ ⁴ are not Tamil code points (² ³ fall in the Latin-1
 *    range), so pali-script.js keeps them inside the Tamil run when mixed text
 *    is split by script.
 *
 * The reader pivots every script through Sinhala (see pali-script.js), so this
 * module converts Sinhala ⇄ Tamil; Roman input reaches it through the normal
 * Roman → Sinhala step.
 */

"use strict";

const ZWJ = /[\u200C\u200D]/g;

// Sinhala → Tamil. An aspirated/voiced consonant carries its superscript
// marker, so those values are two code points.
const SINHALA_TO_TAMIL = {
    // independent vowels
    'අ': 'அ', 'ආ': 'ஆ', 'ඉ': 'இ', 'ඊ': 'ஈ', 'උ': 'உ', 'ඌ': 'ஊ',
    'එ': 'ஏ', 'ඔ': 'ஓ',
    // signs
    'ං': 'ங்', 'ඃ': 'ஃ', '්': '்',
    // velar stops
    'ක': 'க', 'ඛ': 'க²', 'ග': 'க³', 'ඝ': 'க⁴', 'ඞ': 'ங',
    // palatal stops
    'ච': 'ச', 'ඡ': 'ச²', 'ජ': 'ஜ', 'ඣ': 'ஜ²', 'ඤ': 'ஞ',
    // retroflex stops
    'ට': 'ட', 'ඨ': 'ட²', 'ඩ': 'ட³', 'ඪ': 'ட⁴', 'ණ': 'ண',
    // dental stops
    'ත': 'த', 'ථ': 'த²', 'ද': 'த³', 'ධ': 'த⁴', 'න': 'ந',
    // labial stops
    'ප': 'ப', 'ඵ': 'ப²', 'බ': 'ப³', 'භ': 'ப⁴', 'ම': 'ம',
    // liquids and fricatives
    'ය': 'ய', 'ර': 'ர', 'ල': 'ல', 'ළ': 'ள', 'ව': 'வ', 'ස': 'ஸ', 'හ': 'ஹ',
    // dependent vowel signs
    'ා': 'ா', 'ි': 'ி', 'ී': 'ீ', 'ු': 'ு', 'ූ': 'ூ', 'ෙ': 'ே', 'ො': 'ோ',
};

// Short e/o, written before a doubled consonant (Pāli e/o are long elsewhere).
const SHORT_E_O = { 'එ': 'எ', 'ඔ': 'ஒ', 'ෙ': 'ெ', 'ො': 'ொ' };

const VOWEL_SIGNS = 'ா-ௌ'; // dependent vowel signs, U+0BBE–U+0BCC

// Tamil → Sinhala. Two-code-point letters (க², ங்) are looked up first: Tamil
// is lossy, so the plain unaspirated reading is the fallback.
const TAMIL_TO_SINHALA = new Map(
    Object.entries(SINHALA_TO_TAMIL).map(([sinhala, tamil]) => [tamil, sinhala]),
);

/** Whether ², ³ or ⁴ — the Tamil aspirate/voice markers. */
export function isTamilMarker(code) {
    return code === 0x00B2 || code === 0x00B3 || code === 0x2074;
}

/**
 * Sinhala-script Pāli → Tamil, including the display conventions (superscript
 * moves, short e/o, dental/alveolar n). Non-Pāli characters are copied through.
 */
export function tamilFromSinhala(text) {
    text = text.replace(ZWJ, '');

    // Short e/o before a doubled consonant: Sinhala e/o + consonant + virama +
    // consonant. Runs before the character map, like the app's converter.
    text = text.replace(
        /([එඔෙො])([ක-හ]්[ක-හ])/g,
        (_match, vowel, cluster) => SHORT_E_O[vowel] + cluster,
    );

    let out = '';
    for (const ch of text) {
        out += Object.prototype.hasOwnProperty.call(SINHALA_TO_TAMIL, ch)
            ? SINHALA_TO_TAMIL[ch]
            : ch;
    }

    return out
        // superscript after the vowel sign: க² + ா → கா²
        .replace(new RegExp(`([²³⁴])([${VOWEL_SIGNS}])`, 'g'), '$2$1')
        // superscript after the virama: க² + ் → க்²
        .replace(/([²³⁴])(்)/g, '$2$1')
        // dental ந → alveolar ன inside a word…
        .replace(/([\u0B82-\u0BCD²³⁴])ந/g, '$1ன')
        // …except before a dental stop (ன்த → ந்த)
        .replace(/ன்த/g, 'ந்த');
}

/**
 * Tamil Pāli → Sinhala (best effort; see the ambiguity notes above).
 * Characters outside the mapping are copied through.
 */
export function tamilToSinhala(text) {
    text = text
        // undo the superscript moves (கா² → க²ா, க்² → க²்)
        .replace(new RegExp(`([${VOWEL_SIGNS}])([²³⁴])`, 'g'), '$2$1')
        .replace(/(்)([²³⁴])/g, '$2$1')
        // alveolar ன back to dental ந (Pāli n is always dental)
        .replace(/ன/g, 'ந')
        // short e/o stand for Pāli long e/o
        .replace(/எ/g, 'ஏ')
        .replace(/ஒ/g, 'ஓ')
        .replace(/ெ/g, 'ே')
        .replace(/ொ/g, 'ோ');

    let out = '';
    let i = 0;
    while (i < text.length) {
        const pair = text.substr(i, 2);
        if (pair.length === 2 && TAMIL_TO_SINHALA.has(pair)) {
            out += TAMIL_TO_SINHALA.get(pair);
            i += 2;
            continue;
        }
        const one = text.charAt(i);
        out += TAMIL_TO_SINHALA.has(one) ? TAMIL_TO_SINHALA.get(one) : one;
        i += 1;
    }
    return out;
}

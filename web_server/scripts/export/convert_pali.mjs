#!/usr/bin/env node
/**
 * convert_pali.mjs — Node.js CLI wrapper around pali-script.js
 *
 * Usage:
 *   echo "satta bojjhaṅgā" | node convert_pali.mjs si
 *   node convert_pali.mjs si < input.txt
 *
 * Reads text from stdin (one line per paragraph), converts Roman Pāli
 * to the target script using the same mappings as the web app, and
 * writes the result to stdout.
 *
 * Supported scripts: ro, si, hi, be, th, lo, my, km, gm, tt, gj, te, ka, mm, tb, cy
 */

import { createInterface } from 'readline';
import { TextProcessor, Script } from '../../frontend/src/pali-script.js';

const scriptArg = process.argv[2];
if (!scriptArg) {
  process.stderr.write('Usage: convert_pali.mjs <script_code>\n');
  process.stderr.write('  e.g. convert_pali.mjs si\n');
  process.exit(1);
}

// Map short codes to Script constants
const scriptMap = {
  ro: Script.RO,  si: Script.SI,  hi: Script.HI,  be: Script.BENG,
  th: Script.THAI, lo: Script.LAOS, my: Script.MY, km: Script.KM,
  gm: Script.GURM, tt: Script.THAM, gj: Script.GUJA, te: Script.TELU,
  ka: Script.KANN, mm: Script.MALA, tb: Script.TIBT, cy: Script.CYRL,
  as: Script.ASSE, br: Script.BRAH,
};

const targetScript = scriptMap[scriptArg];
if (!targetScript) {
  process.stderr.write(`Unknown script: ${scriptArg}\n`);
  process.stderr.write(`Supported: ${Object.keys(scriptMap).join(', ')}\n`);
  process.exit(1);
}

// If script is Roman, pass through unchanged
if (scriptArg === 'ro') {
  const rl = createInterface({ input: process.stdin, terminal: false });
  for await (const line of rl) {
    process.stdout.write(line + '\n');
  }
  process.exit(0);
}

// For other scripts: Roman → Sinhala → target script
// The JS library assumes input is in Sinhala for convert(),
// and uses convertFrom() to go from other scripts to Sinhala.
// So: convertFrom(roman, RO) → sinhala, then convert(sinhala, target)
const rl = createInterface({ input: process.stdin, terminal: false });
for await (const line of rl) {
  try {
    const sinhText = TextProcessor.convertFrom(line, Script.RO);
    const result = TextProcessor.convert(sinhText, targetScript);
    process.stdout.write(result + '\n');
  } catch (e) {
    // On error, output original line
    process.stderr.write(`Conversion error: ${e.message}\n`);
    process.stdout.write(line + '\n');
  }
}

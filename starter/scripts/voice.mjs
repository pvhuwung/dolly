#!/usr/bin/env node
// Turns a script into a voiceover with macOS's built-in voices (`say`): no network, no API key.
//
//   npm run voice -- script.json tutorial                 # public/voice/tutorial/01.wav ... + src/voice/tutorial.ts
//   npm run voice -- script.txt intro --voice Daniel --rate 175
//
// The script is a .txt (one line per line of speech) or a .json array of lines:
//   [{"text": "Set up two-factor in a minute."}, {"text": "Open Settings.", "voice": "Samantha", "rate": 170}]
//
// It writes a WAV per line into public/voice/<name>/, and src/voice/<name>.ts, which exports the
// lines (text, file, length, and where the speech starts and ends inside the file) for <Voiceover>
// and <Captions> in src/fx/voice.tsx. Re-run it whenever the script changes. `--ts <path>` writes
// the module somewhere else. On another OS, record the lines yourself as WAVs and write the same
// module by hand: everything downstream works the same.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const voiceFlag = flag('voice');
const rateFlag = flag('rate');
const tsFlag = flag('ts');
const [input, nameArg] = args;

if (!input) {
  console.error('usage: node scripts/voice.mjs <script.txt|script.json> [name] [--voice "Ava (Premium)"] [--rate 185] [--ts src/voice/name.ts]');
  process.exit(1);
}
if (process.platform !== 'darwin') {
  console.error(
    "scripts/voice.mjs uses macOS's `say`, so it only runs on a Mac. Elsewhere, record each line as a WAV\n" +
      'into public/voice/<name>/ and write src/voice/<name>.ts by hand in the same shape: everything that\n' +
      'plays and captions it works the same.',
  );
  process.exit(1);
}

const name = (nameArg ?? path.basename(input, path.extname(input))).replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
const raw = fs.readFileSync(input, 'utf8');
const lines = input.endsWith('.json')
  ? JSON.parse(raw).map((l) => (typeof l === 'string' ? {text: l} : l))
  : raw
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({text}));
if (!lines.length) {
  console.error(`${input} has no lines.`);
  process.exit(1);
}

// The best English voice installed: the Premium and Enhanced ones sound far more natural.
const installed = spawnSync('say', ['-v', '?'], {encoding: 'utf8'})
  .stdout.split('\n')
  .map((l) => /^(.+?)\s{2,}(\w\w_\w\w)/.exec(l))
  .filter(Boolean)
  .map((m) => ({name: m[1].trim(), lang: m[2]}));
const has = (v) => installed.some((i) => i.name === v);
const pick = () =>
  ['Ava (Premium)', 'Zoe (Premium)', 'Evan (Premium)', 'Ava (Enhanced)', 'Samantha'].find(has) ??
  installed.find((i) => i.lang === 'en_US')?.name ??
  installed[0]?.name;
const defaultVoice = voiceFlag ?? pick();
if (voiceFlag && !has(voiceFlag)) {
  console.error(`No voice "${voiceFlag}". Installed English voices: ${installed.filter((i) => i.lang.startsWith('en')).map((i) => i.name).join(', ')}`);
  process.exit(1);
}

/** A 16-bit PCM WAV's length, and where the speech starts and ends in it (seconds). */
const measure = (file) => {
  const b = fs.readFileSync(file);
  let channels = 1;
  let rate = 44100;
  let bits = 16;
  let data;
  for (let o = 12; o + 8 <= b.length; ) {
    const id = b.toString('ascii', o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === 'fmt ') {
      channels = b.readUInt16LE(o + 10);
      rate = b.readUInt32LE(o + 12);
      bits = b.readUInt16LE(o + 22);
    } else if (id === 'data') {
      data = b.subarray(o + 8, o + 8 + size);
      break;
    }
    o += 8 + size + (size % 2);
  }
  if (!data || bits !== 16) throw new Error(`${file} isn't 16-bit PCM`);
  const frames = data.length / (2 * channels);
  // Loudness in 10 ms windows; speech is where it rises above 4% of full scale.
  const win = Math.round(rate / 100);
  let first = -1;
  let last = -1;
  for (let w = 0; w * win < frames; w++) {
    let peak = 0;
    for (let i = w * win; i < Math.min(frames, (w + 1) * win); i++) peak = Math.max(peak, Math.abs(data.readInt16LE(i * 2 * channels)));
    if (peak > 0.04 * 32768) {
      if (first < 0) first = w;
      last = w;
    }
  }
  const seconds = frames / rate;
  const r3 = (n) => Math.round(n * 1000) / 1000;
  return {seconds: r3(seconds), speech: first < 0 ? [0, r3(seconds)] : [r3(Math.max(0, first * 0.01 - 0.02)), r3(Math.min(seconds, (last + 1) * 0.01 + 0.02))]};
};

const outDir = path.join('public', 'voice', name);
fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

const written = lines.map((line, i) => {
  const file = `${String(i + 1).padStart(2, '0')}.wav`;
  const voice = line.voice ?? defaultVoice;
  const rate = String(line.rate ?? rateFlag ?? 185);
  const out = path.join(outDir, file);
  // `--` ends the options, so a line starting with "-" is still read as text.
  const r = spawnSync('say', ['-v', voice, '-r', rate, '--file-format=WAVE', '--data-format=LEI16@44100', '-o', out, '--', line.text], {encoding: 'utf8'});
  if (r.status !== 0) {
    console.error(`say failed on line ${i + 1}: ${r.stderr || r.stdout}`);
    process.exit(1);
  }
  const {seconds, speech} = measure(out);
  console.log(`  ${out}  ${seconds.toFixed(2)} s  ${voice}  "${line.text}"`);
  return {text: line.text, src: `voice/${name}/${file}`, seconds, speech};
});

const tsPath = tsFlag ?? path.join('src', 'voice', `${name}.ts`);
fs.mkdirSync(path.dirname(tsPath), {recursive: true});
const fxVoice = path.relative(path.dirname(tsPath), path.join('src', 'fx', 'voice')).split(path.sep).join('/');
const exportName = name.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^\d/, '_$&');
fs.writeFileSync(
  tsPath,
  `// Generated by scripts/voice.mjs from ${path.basename(input)}: re-run it after changing the script.\n` +
    `import type {VoiceLine} from '${fxVoice.startsWith('.') ? fxVoice : `./${fxVoice}`}';\n\n` +
    `export const ${exportName}: VoiceLine[] = [\n` +
    written.map((l) => `  {text: ${JSON.stringify(l.text)}, src: '${l.src}', seconds: ${l.seconds}, speech: [${l.speech.join(', ')}]},\n`).join('') +
    `];\n`,
);
const total = written.reduce((s, l) => s + l.seconds, 0);
const fromSrc = path.relative('src', tsPath).replace(/\.ts$/, '').split(path.sep).join('/');
console.log(
  `wrote ${written.length} lines (${total.toFixed(1)} s) and ${tsPath}` +
    (fromSrc.startsWith('..') ? '' : `: import {${exportName}} from './${fromSrc}' (from src/)`),
);

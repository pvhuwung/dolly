#!/usr/bin/env node
// Scans recordings so a video can be planned from them: where the screen holds still (the shots a
// video is cut from), where something happens, and where there's sound. For recordings the user
// made themselves, or long takes, before anyone has watched them.
//
//   npm run scan                                  # every recording in public/takes/
//   npm run scan -- public/takes/demo.mov         # one or more
//
// It writes, in out/scan/:
//   SCAN.md          every recording: its size, length and sound, its holds and its changes
//   <name>.json      the same as data
//   <name>.png       a sheet with one frame from every hold (and from long stretches of motion),
//                    each labelled with its time: read it to see what the recording shows
//
// It compares small grey copies of the frames, 4 a second: a hold is a second or more with almost
// no change, a change is a jump. It can't tell what's on screen; the sheets are for that.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const takesDir = path.join(root, 'public', 'takes');
const outDir = path.join(root, 'out', 'scan');
const remotion = path.join(root, 'node_modules', '.bin', 'remotion');
const VIDEO = /\.(mov|mp4|m4v|webm|mkv)$/i;

const SIDE = 120; // frames are compared at 120 × 120 grey pixels
const HOLD_BELOW = 0.8; // mean change per pixel (0-255) under which a moment counts as still
const CHANGE_ABOVE = 3; // and over which it counts as a change
const MIN_HOLD = 1; // seconds
const SAME_BELOW = 2.5; // two holds whose frames differ less than this are one hold (a spinner, a shimmer)
const MAX_CELLS = 36;

const run = (args, opts = {}) => spawnSync(remotion, args, {cwd: root, maxBuffer: 1 << 30, ...opts});
const r1 = (n) => Math.round(n * 10) / 10;
const clock = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : fs.existsSync(takesDir)
    ? fs.readdirSync(takesDir).filter((f) => VIDEO.test(f)).sort().map((f) => path.join(takesDir, f))
    : [];
if (!files.length) {
  console.error('No recordings: put them in public/takes/ (or pass their paths) and run this again.');
  process.exit(1);
}
fs.mkdirSync(outDir, {recursive: true});

/** Size, length, frame rate and whether there's an audio track. */
const probe = (file) => {
  const r = run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,avg_frame_rate:format=duration', '-of', 'json', file], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`can't read ${file}: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  if (!v) throw new Error(`${file} has no video`);
  const [n, d] = (v.avg_frame_rate || '0/1').split('/').map(Number);
  return {width: v.width, height: v.height, codec: v.codec_name, fps: d ? r1(n / d) : 0, duration: Number(j.format.duration), audio: j.streams.some((s) => s.codec_type === 'audio')};
};

/** How much each sampled frame differs from the one before: mean grey change per pixel, 0-255. */
const motion = (file, rate) => {
  const r = run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', file, '-an', '-vf', `scale=${SIDE}:${SIDE},format=gray`, '-r', String(rate), '-f', 'image2pipe', '-c:v', 'rawvideo', '-']);
  if (r.status !== 0) throw new Error(`can't decode ${file}: ${r.stderr}`);
  const px = SIDE * SIDE;
  const n = Math.floor(r.stdout.length / px);
  /** Mean grey change per pixel between sampled frames a and b. */
  const between = (a, b) => {
    let sum = 0;
    for (let k = 0; k < px; k++) sum += Math.abs(r.stdout[a * px + k] - r.stdout[b * px + k]);
    return sum / px;
  };
  const diffs = [0];
  for (let i = 1; i < n; i++) diffs.push(between(i, i - 1));
  return {diffs, between};
};

/** Stretches with sound in them, from ffmpeg's silence detector. */
const sound = (file, duration) => {
  const r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'silencedetect=n=-38dB:d=0.6', '-f', 'null', '-'], {encoding: 'utf8'});
  const quiet = [];
  let from = null;
  for (const line of (r.stderr || '').split('\n')) {
    const s = /silence_start: ([\d.]+)/.exec(line);
    const e = /silence_end: ([\d.]+)/.exec(line);
    if (s) from = Number(s[1]);
    if (e) {
      quiet.push([from ?? 0, Number(e[1])]);
      from = null;
    }
  }
  if (from !== null) quiet.push([from, duration]);
  const loud = [];
  let t = 0;
  for (const [a, b] of quiet) {
    if (a - t >= 0.3) loud.push([r1(t), r1(a)]);
    t = b;
  }
  if (duration - t >= 0.3) loud.push([r1(t), r1(duration)]);
  return loud;
};

const scan = (file) => {
  const name = path.basename(file).replace(/\.[^.]+$/, '');
  const info = probe(file);
  const rate = info.duration > 600 ? 2 : 4;
  const {diffs, between} = motion(file, rate);
  const at = (i) => r1(i / rate);

  // Holds: runs of still samples a second or longer.
  const holds = [];
  let s = null;
  for (let i = 1; i <= diffs.length; i++) {
    const still = i < diffs.length && diffs[i] < HOLD_BELOW;
    if (still && s === null) s = i - 1;
    if (!still && s !== null) {
      if ((i - 1 - s) / rate >= MIN_HOLD) holds.push({from: at(s), to: at(i - 1), a: s, b: i - 1});
      s = null;
    }
  }
  // Holds that look the same as the one before are one hold broken by a flicker: a spinner, a
  // shimmer, a blinking caret. Merge them, so the sheet shows each state once.
  for (let i = holds.length - 1; i > 0; i--) {
    const prev = holds[i - 1];
    const cur = holds[i];
    if (between(Math.round((prev.a + prev.b) / 2), Math.round((cur.a + cur.b) / 2)) < SAME_BELOW) {
      prev.to = cur.to;
      prev.b = cur.b;
      prev.flicker = true;
      holds.splice(i, 1);
    }
  }
  for (const h of holds) {
    delete h.a;
    delete h.b;
  }
  // Changes: jumps, with those half a second apart merged into one.
  const changes = [];
  diffs.forEach((d, i) => {
    if (d < CHANGE_ABOVE) return;
    const last = changes[changes.length - 1];
    if (last && at(i) - last.to <= 0.5) {
      last.to = at(i);
      last.size = Math.max(last.size, d);
    } else changes.push({at: at(i), to: at(i), size: d});
  });
  for (const c of changes) {
    c.size = Math.round(c.size);
    c.kind = c.size >= 25 ? 'new screen' : c.size >= 8 ? 'big change' : 'small change';
  }
  // Motion: the stretches between holds that last 3 s or more (scrolling, typing, playback).
  const moving = [];
  let t = 0;
  for (const h of [...holds, {from: r1(info.duration), to: r1(info.duration)}]) {
    if (h.from - t >= 3) moving.push({from: r1(t), to: h.from});
    t = h.to;
  }

  // The sheet: the middle of every hold and of every stretch of motion, the longest if too many.
  let cells = [
    ...holds.map((h) => ({t: r1((h.from + h.to) / 2), label: `${clock(h.from)}–${clock(h.to)} ${h.flicker ? 'still, flickering' : 'still'}`, weight: h.to - h.from})),
    ...moving.map((m) => ({t: r1((m.from + m.to) / 2), label: `${clock(m.from)}–${clock(m.to)} moving`, weight: (m.to - m.from) / 2})),
  ];
  if (!cells.length) cells.push({t: r1(info.duration / 2), label: `${clock(info.duration / 2)}`, weight: 1});
  if (cells.length > MAX_CELLS) cells = cells.sort((a, b) => b.weight - a.weight).slice(0, MAX_CELLS);
  cells.sort((a, b) => a.t - b.t);

  const result = {
    file: path.relative(root, file),
    ...info,
    duration: r1(info.duration),
    tall: info.height > info.width,
    holds,
    changes,
    moving,
    sound: info.audio ? sound(file, info.duration) : [],
    sheet: path.relative(root, path.join(outDir, `${name}.png`)),
    cells: cells.map(({t, label}) => ({t, label})),
  };
  fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(result, null, 2)}\n`);

  // The sheet is the Sheet composition with explicit times; it plays files in public/.
  const inPublic = path.relative(path.join(root, 'public'), file);
  if (!inPublic.startsWith('..')) {
    const props = {take: inPublic.split(path.sep).join('/'), times: result.cells.map((c) => c.t), labels: result.cells.map((c) => c.label), ...(result.tall ? {format: 'vertical'} : {})};
    const r = run(['still', 'Sheet', path.join(outDir, `${name}.png`), `--props=${JSON.stringify(props)}`], {encoding: 'utf8'});
    if (r.status !== 0) {
      result.sheet = null;
      console.error(`  couldn't render the sheet for ${name}: ${(r.stderr || r.stdout).trim().split('\n').slice(-3).join(' ')}`);
    }
  } else {
    result.sheet = null;
    console.error(`  ${name}: move it into public/takes/ for a sheet of its frames`);
  }
  return result;
};

const results = [];
for (const file of files) {
  process.stdout.write(`scanning ${path.relative(root, file)}… `);
  const r = scan(file);
  results.push(r);
  console.log(`${r.duration} s, ${r.holds.length} holds, ${r.changes.length} changes${r.audio ? `, sound in ${r.sound.length} stretches` : ', no sound'}`);
}

// SCAN.md: what an agent reads first.
const span = ([a, b]) => `${clock(a)}–${clock(b)}`;
let md = `# Scan of ${results.length} recording${results.length === 1 ? '' : 's'}

Made by \`npm run scan\`. A **hold** is a second or more where the screen barely changes: the
moments a shot is cut from. A flickering hold is one state with something small moving in it:
typing, or a wait (a spinner, a shimmer) to show sped up or cut. A **change** is a jump (a tap, a new screen, a result arriving). Times
are seconds into the recording, the values \`<Footage at={…}>\` takes. Read each sheet to see what's
on screen; for a closer look at a stretch, render
\`npx remotion still Sheet out/x.png --props='{"take":"takes/<file>","from":<s>,"seconds":<n>,"every":10}'\`.
`;
for (const r of results) {
  md += `\n## ${path.basename(r.file)}\n\n`;
  md += `- ${r.width}×${r.height} px, ${r.tall ? 'tall (a phone?)' : 'wide'}, ${r.codec}, ${r.fps} fps average, ${clock(r.duration)} long\n`;
  md += `- Sound: ${r.audio ? (r.sound.length ? r.sound.map(span).join(', ') : 'a track, but silent') : 'none'}\n`;
  md += `- Sheet: ${r.sheet ? `\`${r.sheet}\`` : 'not rendered'}\n`;
  md += `\n**Holds** (${r.holds.length}): ${r.holds.length ? r.holds.map((h) => `${clock(h.from)}–${clock(h.to)}${h.flicker ? ' (something small moving: typing, a spinner, a shimmer)' : ''}`).join(', ') : 'none: it never sits still for a second'}\n`;
  md += `\n**Changes** (${r.changes.length}): ${r.changes.length ? r.changes.map((c) => `${clock(c.at)} ${c.kind}`).join(', ') : 'none'}\n`;
  if (r.moving.length) md += `\n**Moving for 3 s or more:** ${r.moving.map((m) => `${clock(m.from)}–${clock(m.to)}`).join(', ')}\n`;
}
fs.writeFileSync(path.join(outDir, 'SCAN.md'), md);
console.log(`wrote ${path.relative(root, path.join(outDir, 'SCAN.md'))}`);

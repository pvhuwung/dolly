#!/usr/bin/env node
// Checks a rendered video before anyone sees it: the things a contact sheet can't show. Run it on
// every render you hand over, in every format.
//
//   npm run check -- out/video.mp4
//   npm run check -- out/vertical.mp4 out/square.mp4         # several
//   npm run check -- out/video-web.mp4 --upload               # also gate loudness for upload
//   npm run check -- out/loop.mp4 --loop                      # a loop: check the seam, not the hook
//
// What it checks (✗ fails, ! warns, · is for your information):
//   file     ✗ not 8-bit 4:2:0 H.264 (some players and sites won't play it); ✗ a size that isn't one of
//              the four formats; ! no sound track (fine for a muted loop)
//   sound    loudness and true peak. ! anything off the -14 LUFS / -1 dBTP that feeds play at;
//              with --upload, ✗ instead: make the upload copy with `npm run web` first
//   hook     when the picture first moves. ! after 1 s, ✗ after 2.5 s: a muted feed decides in the
//              first second (top launch videos change within 0.1 s)
//   stall    ✗ a repeated frame between moving ones: a stutter, usually a frame-rate mismatch
//   still    ! a stretch of 2 s or more where nothing moves (the end card's last 2 s excepted):
//              give it a drift, or cut it shorter
//   jumps    · every one-frame change of the whole picture, with its time: each should be a cut
//              you meant
//   loop     with --loop, ✗ when the step from the last frame back to the first is a jump
//
// It writes the numbers to out/check/<name>.json. Exit code 1 when anything fails.
//
// The thresholds come from frame-by-frame measurements of top-tier launch films.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out', 'check');
const remotion = path.join(root, 'node_modules', '.bin', 'remotion');

const FORMATS = {'1920x1080': 'landscape', '1080x1920': 'vertical', '1080x1080': 'square', '1080x1350': 'portrait'};
const WIDE = 320; // frames are compared as grey copies this wide
const MOVES = 0.3; // mean grey change per pixel (0-255) from which the picture visibly moves
const STILL = 0.02; // and under which a frame is the same as the one before (a slow drift is 0.03-0.05)
const STILL_RUN = 2; // seconds
const END_TAIL = 2; // seconds of stillness allowed at the very end (the end card holds)
const HOOK_WARN = 1;
const HOOK_FAIL = 2.5;
const LUFS = -14;
const LUFS_TOL = 1;
const TRUE_PEAK = -1;

const args = process.argv.slice(2);
const upload = args.includes('--upload');
const loop = args.includes('--loop');
const files = args.filter((a) => !a.startsWith('--')).map((f) => path.resolve(f));
if (!files.length) {
  console.error('Usage: npm run check -- out/video.mp4 [more.mp4] [--upload] [--loop]');
  process.exit(1);
}
fs.mkdirSync(outDir, {recursive: true});

const run = (a, opts = {}) => spawnSync(remotion, a, {cwd: root, maxBuffer: 1 << 30, ...opts});
const r2 = (n) => Math.round(n * 100) / 100;
const clock = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;

const probe = (file) => {
  const r = run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,pix_fmt,width,height,avg_frame_rate,sample_rate,channels:format=duration', '-of', 'json', file], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`can't read ${file}: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  if (!v) throw new Error(`${file} has no video`);
  const a = j.streams.find((s) => s.codec_type === 'audio');
  const [n, d] = (v.avg_frame_rate || '0/1').split('/').map(Number);
  return {
    width: v.width,
    height: v.height,
    codec: v.codec_name,
    pixFmt: v.pix_fmt,
    fps: d ? n / d : 0,
    duration: Number(j.format.duration),
    audio: a ? {codec: a.codec_name, rate: Number(a.sample_rate), channels: a.channels} : null,
  };
};

/** Integrated loudness and true peak, from ffmpeg's loudnorm in measuring mode. */
const loudness = (file) => {
  const r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = /\{[^{}]*"input_i"[^{}]*\}/.exec(r.stderr || '');
  if (!m) return null;
  const j = JSON.parse(m[0]);
  const i = Number(j.input_i);
  return {lufs: Number.isFinite(i) ? i : -Infinity, truePeak: Number(j.input_tp)};
};

/** How much every frame differs from the one before: mean grey change per pixel, 0-255. */
const motion = (file, width, height) => {
  const h = Math.max(2, Math.round((WIDE * height) / width / 2) * 2);
  const r = run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', file, '-an', '-vf', `scale=${WIDE}:${h},format=gray`, '-f', 'image2pipe', '-c:v', 'rawvideo', '-']);
  if (r.status !== 0) throw new Error(`can't decode ${file}: ${r.stderr}`);
  const px = WIDE * h;
  const n = Math.floor(r.stdout.length / px);
  const between = (a, b) => {
    let sum = 0;
    for (let k = 0; k < px; k++) sum += Math.abs(r.stdout[a * px + k] - r.stdout[b * px + k]);
    return sum / px;
  };
  const diffs = [0];
  for (let i = 1; i < n; i++) diffs.push(between(i, i - 1));
  return {diffs, seam: n > 1 ? between(n - 1, 0) : 0};
};

const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const check = (file) => {
  const notes = [];
  const say = (level, what, text) => notes.push({level, what, text});
  const info = probe(file);
  const fps = info.fps;
  const t = (f) => f / fps;

  // The file.
  const size = `${info.width}x${info.height}`;
  if (info.codec !== 'h264' || !['yuv420p', 'yuvj420p'].includes(info.pixFmt)) say('fail', 'file', `${info.codec} ${info.pixFmt}: render 8-bit 4:2:0 H.264 (Remotion's default) so every player and site plays it`);
  // A draft rendered with --scale keeps a format's shape at another size.
  const scaled = Object.entries(FORMATS).find(([s]) => {
    const [w, h] = s.split('x').map(Number);
    return Math.abs(w / h - info.width / info.height) < 0.01;
  });
  if (!FORMATS[size] && scaled) say('warn', 'file', `${info.width}×${info.height}: a scaled ${scaled[1]} draft; render the one you hand over at full size`);
  else if (!FORMATS[size]) say('fail', 'file', `${info.width}×${info.height} isn't one of the formats (${Object.keys(FORMATS).join(', ')})`);
  say('info', 'file', `${FORMATS[size] ?? scaled?.[1] ?? size}, ${r2(fps)} fps, ${r2(info.duration)} s, ${info.codec}${info.audio ? `, ${info.audio.codec} ${info.audio.rate / 1000} kHz ${info.audio.channels === 2 ? 'stereo' : `${info.audio.channels} ch`}` : ''}`);

  // The sound.
  let sound = null;
  if (!info.audio) say(upload ? 'fail' : 'warn', 'sound', 'no sound track (fine for a muted loop; a feed video still wants music under it)');
  else {
    sound = loudness(file);
    if (!sound) say('warn', 'sound', "couldn't measure the loudness");
    else if (sound.lufs === -Infinity) say('warn', 'sound', 'the sound track is silent');
    else {
      const off = Math.abs(sound.lufs - LUFS) > LUFS_TOL || sound.truePeak > TRUE_PEAK;
      const text = `${r2(sound.lufs)} LUFS, true peak ${r2(sound.truePeak)} dBTP`;
      if (off) say(upload ? 'fail' : 'warn', 'sound', `${text}: feeds play at ${LUFS} LUFS and ${TRUE_PEAK} dBTP. Make the upload copy with npm run web -- <file>`);
      else say('info', 'sound', `${text}: ready for upload`);
    }
  }

  // The picture.
  const {diffs, seam} = motion(file, info.width, info.height);
  const n = diffs.length;

  if (!loop) {
    const first = diffs.findIndex((d) => d >= MOVES);
    const at = first < 0 ? Infinity : t(first);
    if (at > HOOK_FAIL) say('fail', 'hook', `nothing moves until ${first < 0 ? 'the end' : clock(at)}: open on motion, a muted feed decides in the first second`);
    else if (at > HOOK_WARN) say('warn', 'hook', `the picture first moves at ${clock(at)}: top launch videos change within 0.1 s`);
    else say('info', 'hook', `first motion at ${clock(at)}`);
  }

  const stalls = [];
  for (let f = 2; f < n - 1; f++) if (diffs[f] < STILL && diffs[f - 1] > 0.8 && diffs[f + 1] > 0.8) stalls.push(f);
  if (stalls.length) say('fail', 'stall', `a repeated frame mid-move at ${stalls.slice(0, 8).map((f) => clock(t(f))).join(', ')}${stalls.length > 8 ? ` and ${stalls.length - 8} more` : ''}: a stutter (a take's frame rate, or a frame the scene doesn't animate)`);

  // Runs of still frames, joined across a blip of a frame or two (a blinking caret).
  const runs = [];
  let from = null;
  for (let f = 1; f <= n; f++) {
    const still = f < n && diffs[f] < STILL;
    if (still && from === null) from = f;
    if (!still && from !== null) {
      const last = runs[runs.length - 1];
      if (last && from - last.end <= 2 && Math.max(...diffs.slice(last.end, from)) < 1) last.end = f;
      else runs.push({from, end: f});
      from = null;
    }
  }
  const stills = [];
  for (const r of runs) {
    const atEnd = r.end >= n;
    // The very end may hold: the end card sits while the sound decays.
    if (t(r.end - r.from) >= (atEnd ? STILL_RUN + END_TAIL : STILL_RUN)) stills.push({from: t(r.from), to: t(r.end), atEnd});
  }
  if (stills.length) say('warn', 'still', `nothing moves ${stills.map((s) => `${clock(s.from)}–${clock(s.to)}${s.atEnd ? ' (the end)' : ''}`).join(', ')}: give it a drift or cut it shorter (top videos hold still once, for 1–1.6 s)`);

  // One-frame changes of the whole picture: cuts, or pops if nobody meant them.
  const jumps = [];
  for (let f = 1; f < n; f++) {
    const around = median([diffs[f - 2], diffs[f - 1], diffs[f + 1], diffs[f + 2]].filter((d) => d !== undefined));
    if (diffs[f] > 12 && diffs[f] > 4 * around + 2) jumps.push(f);
  }
  if (jumps.length) say('info', 'jumps', `one-frame changes at ${jumps.map((f) => clock(t(f))).join(', ')}: each should be a cut you meant`);

  if (loop) {
    const steps = [...diffs.slice(1, 9), ...diffs.slice(-8)];
    const limit = Math.max(0.4, 1.5 * median(steps));
    if (seam > limit) say('fail', 'loop', `the step from the last frame to the first is ${r2(seam)}, against ${r2(median(steps))} around it: the loop jumps`);
    else say('info', 'loop', `the seam is ${r2(seam)}, like the steps around it`);
  }

  const near = diffs.slice(1).filter((d) => d < 0.5).length / Math.max(1, n - 1);
  say('info', 'motion', `median change ${r2(median(diffs.slice(1)))}, ${Math.round(near * 100)}% of frames near still (top videos: 1.4 and 27%; calm ones 0.4 and over 50%)`);

  const report = {file: path.relative(root, file), ...info, fps: r2(fps), duration: r2(info.duration), sound, notes, diffs: diffs.map(r2)};
  fs.writeFileSync(path.join(outDir, `${path.basename(file).replace(/\.[^.]+$/, '')}.json`), `${JSON.stringify(report)}\n`);
  return notes;
};

const MARK = {fail: '✗', warn: '!', info: '·'};
let failed = false;
for (const file of files) {
  console.log(`\n${path.relative(root, file)}`);
  let notes;
  try {
    notes = check(file);
  } catch (e) {
    console.log(`  ✗ ${e.message}`);
    failed = true;
    continue;
  }
  for (const n of notes) console.log(`  ${MARK[n.level]} ${n.what.padEnd(6)} ${n.text}`);
  if (notes.some((n) => n.level === 'fail')) failed = true;
}
console.log(failed ? '\nFailed: fix the ✗ lines and render again.' : '\nNo failures. Read the ! lines and decide.');
process.exit(failed ? 1 : 0);

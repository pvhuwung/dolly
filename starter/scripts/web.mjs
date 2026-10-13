#!/usr/bin/env node
// Makes the copy you upload: sound normalised to the -14 LUFS feeds play at, the index at the front
// so it starts playing at once, the picture untouched.
//
//   npm run web -- out/video.mp4            # writes out/video-web.mp4
//
// Two passes: the first measures the sound, the second applies one gain to reach -14 LUFS with
// the true peak under -1.5 dBTP. One pass guesses as it goes and lands short on a sparse mix of
// effects (a -21 LUFS render came out at -17). Then run `npm run check -- <file> --upload`.

import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const remotion = path.join(root, 'node_modules', '.bin', 'remotion');
const TARGET = 'I=-14:TP=-1.5:LRA=11';

const input = process.argv[2];
if (!input) {
  console.error('Usage: npm run web -- out/video.mp4');
  process.exit(1);
}
const file = path.resolve(input);
const output = file.replace(/\.[^.]+$/, '-web.mp4');
const run = (args) => spawnSync(remotion, args, {cwd: root, encoding: 'utf8', maxBuffer: 1 << 30});

const measure = run(['ffmpeg', '-hide_banner', '-nostats', '-i', file, '-vn', '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-']);
const m = /\{[^{}]*"input_i"[^{}]*\}/.exec(measure.stderr || '');
if (!m) {
  console.error(`Couldn't measure the sound of ${input}: does it have a sound track?`);
  process.exit(1);
}
const j = JSON.parse(m[0]);
const filter = `loudnorm=${TARGET}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
const r = run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', file, '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', output]);
if (r.status !== 0) {
  console.error(r.stderr);
  process.exit(1);
}
console.log(`${path.relative(process.cwd(), output)}: sound from ${j.input_i} LUFS to -14. Check it: npm run check -- ${path.relative(root, output)} --upload`);

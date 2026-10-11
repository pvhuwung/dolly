// A two-note notification chime ("ting ting") for the moments an agent needs you. Synthesized:
// two bell strikes (G6 then C7), each a fundamental plus inharmonic bell partials with a fast
// exponential decay. Deterministic, so every render gets the same sound.
//
//   node scripts/ting.mjs public/ting.wav
import {writeFileSync} from 'node:fs';

const SR = 44100;
const LENGTH = 1.1;
const N = Math.round(SR * LENGTH);
const out = new Float32Array(N);

const strike = (t0, f, gain) => {
  const partials = [
    [1, 1, 0.55],
    [2.76, 0.32, 0.22],
    [5.4, 0.12, 0.09],
    [8.93, 0.05, 0.05],
  ];
  const start = Math.round(t0 * SR);
  for (let j = 0; start + j < N; j++) {
    const t = j / SR;
    const attack = Math.min(1, t / 0.002);
    let v = 0;
    for (const [mult, amp, decay] of partials) v += amp * Math.sin(2 * Math.PI * f * mult * t) * Math.exp(-t / decay);
    out[start + j] += v * attack * gain;
  }
};

strike(0, 1567.98, 0.9);
strike(0.14, 2093.0, 0.8);

let peak = 0;
for (const v of out) peak = Math.max(peak, Math.abs(v));
const gain = 0.85 / peak;

const data = Buffer.alloc(44 + N * 2);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 2, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * gain)) * 32767), 44 + i * 2);
writeFileSync(process.argv[2] ?? 'ting.wav', data);
console.log(`wrote ${process.argv[2] ?? 'ting.wav'}`);

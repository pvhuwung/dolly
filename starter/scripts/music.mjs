// Generates a soundtrack: original music, synthesized from scratch (no samples), so it's free to
// use anywhere. Good for drafts and for videos without a licensed track. 120 BPM: a beat is 0.5 s.
//
//   npm run music -- <length s> [second hit s] [outro start s]     (writes public/music.wav)
//   e.g. npm run music -- 41 25 35
//
// Sections (seconds): 0-8 cold open (pad swells, a ticking clock) with a riser into a hit at 8
// (put the logo there) · 8-14 calm · groove · a lift into the second hit (the big reveal) · full ·
// the outro (drums stop, the pad resolves, it fades). Then in Video.tsx:
//   <Audio src={staticFile('music.wav')} volume={0.5} />
import { writeFileSync } from 'node:fs';

const SR = 44100;
const LENGTH = Number(process.argv[3] ?? 45);
const HIT2 = Number(process.argv[4] ?? Math.round(LENGTH * 0.55));
const OUTRO = Number(process.argv[5] ?? LENGTH - 8);
const N = SR * LENGTH;
const BEAT = 0.5;
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const ramp = (t, a, b) => smooth((t - a) / (b - a));

// A minor: Am · F · C · G, two bars each (a 16 s cycle).
const CHORDS = [
  { pad: [57, 60, 64, 69], bass: 45, arp: [69, 72, 76, 81] },
  { pad: [53, 57, 60, 65], bass: 41, arp: [65, 69, 72, 77] },
  { pad: [55, 60, 64, 67], bass: 48, arp: [67, 72, 76, 79] },
  { pad: [55, 59, 62, 67], bass: 43, arp: [67, 71, 74, 79] },
];
const chordAt = (t) => CHORDS[Math.floor(t / 4) % CHORDS.length];

const section = (t) =>
  t < 8 ? 'intro' : t < 14 ? 'calm' : t < HIT2 - 12 ? 'groove' : t < HIT2 ? 'lift' : t < OUTRO ? 'full' : 'outro';

// Deterministic noise, so every render of the video gets the same track.
let seed = 0x2f6b1c3d;
const noise = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

// ── Pad: additive saw-ish voices, one per chord tone, crossfaded at chord changes ──────────────
const padBus = new Float32Array(N);
const padBusR = new Float32Array(N);
{
  const phases = new Map();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const s = section(t);
    const cutoff = s === 'intro' ? 500 + 900 * ramp(t, 0, 8) : s === 'calm' ? 1300 : s === 'groove' ? 1700 : s === 'lift' ? 2300 : s === 'full' ? 2600 : 1500;
    // Crossfade the last 0.6 s of each chord into the next.
    const pos = t % 4;
    const fade = ramp(pos, 3.4, 4.0);
    const voices = [
      [chordAt(t), 1 - fade],
      [chordAt(t + 4), fade],
    ];
    let l = 0, r = 0;
    for (const [chord, w] of voices) {
      if (w <= 0) continue;
      for (const m of chord.pad) {
        for (let n = 1; n <= 6; n++) {
          const f = hz(m) * n;
          const amp = (w / n ** 1.6) / (1 + (f / cutoff) ** 2);
          for (const [side, cents] of [[0, -4], [1, 4]]) {
            const key = `${m}:${n}:${side}`;
            const ph = (phases.get(key) ?? noise() * Math.PI) + (2 * Math.PI * f * 2 ** (cents / 1200)) / SR;
            phases.set(key, ph);
            const v = amp * Math.sin(ph);
            if (side === 0) l += v; else r += v;
          }
        }
      }
    }
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.11 * t);
    padBus[i] = l * 0.06 * lfo;
    padBusR[i] = r * 0.06 * lfo;
  }
}

// ── Drums, bass, arpeggio ───────────────────────────────────────────────────────────────────────
const add = (buf, i, v) => { if (i >= 0 && i < N) buf[i] += v; };
const kickTimes = [];

function kick(t0, gain) {
  kickTimes.push(t0);
  const start = Math.round(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    ph += (2 * Math.PI * (44 + 90 * Math.exp(-t / 0.035))) / SR;
    const v = Math.tanh(1.6 * Math.sin(ph)) * Math.exp(-t / 0.22) * gain;
    add(L, start + j, v); add(R, start + j, v);
  }
}

function snare(t0, gain) {
  const start = Math.round(t0 * SR);
  let lp = 0, ph = 0;
  for (let j = 0; j < SR * 0.3; j++) {
    const t = j / SR;
    const n = noise();
    lp += 0.25 * (n - lp);
    ph += (2 * Math.PI * 190) / SR;
    const v = ((n - lp) * Math.exp(-t / 0.11) * 0.8 + Math.sin(ph) * Math.exp(-t / 0.06) * 0.5) * gain;
    add(L, start + j, v * 0.9); add(R, start + j, v);
  }
}

function hat(t0, gain, pan) {
  const start = Math.round(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * 0.08; j++) {
    const n = noise();
    lp += 0.5 * (n - lp);
    const v = (n - lp) * Math.exp(-(j / SR) / 0.022) * gain;
    add(L, start + j, v * (1 - pan)); add(R, start + j, v * (1 + pan));
  }
}

function bass(t0, midi, gain) {
  const start = Math.round(t0 * SR);
  const f = hz(midi);
  for (let j = 0; j < SR * 0.48; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.3);
    const v = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * gain;
    add(L, start + j, v); add(R, start + j, v);
  }
}

const arpL = new Float32Array(N);
const arpR = new Float32Array(N);
function pluck(t0, midi, gain, pan) {
  const start = Math.round(t0 * SR);
  const f = hz(midi);
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.16);
    const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t / 0.05)) * env * gain;
    if (start + j < N) { arpL[start + j] += v * (1 - pan); arpR[start + j] += v * (1 + pan); }
  }
}

function riser(t0, t1, gain) {
  let lp = 0;
  for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) {
    const p = (i / SR - t0) / (t1 - t0);
    lp += (0.02 + 0.5 * p * p) * (noise() - lp);
    const v = lp * p * p * gain;
    add(L, i, v * 0.9); add(R, i, v);
  }
}

function impact(t0, gain) {
  kick(t0, gain);
  const start = Math.round(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * 2.5; j++) {
    const t = j / SR;
    lp += 0.08 * (noise() - lp);
    const v = (Math.sin(2 * Math.PI * 41 * t) * Math.exp(-t / 0.9) * 0.6 + lp * Math.exp(-t / 0.7) * 1.2) * gain;
    add(L, start + j, v); add(R, start + j, v);
  }
}

// Intro: a soft clock tick on every beat from 2 s, getting a touch louder.
for (let t = 2; t < 7.9; t += BEAT) hat(t, 0.05 + 0.05 * ramp(t, 2, 8), 0.2);
riser(6.2, 8, 0.6);
impact(8, 0.9);
riser(HIT2 - 1.8, HIT2, 0.55);
impact(HIT2, 0.85);

for (let bar = 0; bar < LENGTH / 2; bar++) {
  const t = bar * 2;
  const s = section(t);
  if (s === 'intro' || s === 'calm' || s === 'outro') continue;
  const full = s === 'full';
  for (let b = 0; b < 4; b++) {
    const tb = t + b * BEAT;
    if (b === 0 || (full && b === 2) || (!full && b === 2 && bar % 2 === 1)) kick(tb, full ? 0.7 : 0.55);
    if (b === 2 && (s === 'lift' || full)) snare(tb, 0.32);
    bass(tb, chordAt(tb).bass, full ? 0.28 : 0.22);
    hat(tb + BEAT / 2, full ? 0.11 : 0.08, b % 2 ? 0.3 : -0.3);
    if (full) hat(tb, 0.05, 0);
  }
  if (s === 'lift' || full) {
    const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
    for (let k = 0; k < 16; k++) {
      const tk = t + k * (BEAT / 4);
      const chord = chordAt(tk);
      const up = t >= HIT2 + 28 ? 12 : 0;
      pluck(tk, chord.arp[pattern[k % 8]] + up, s === 'lift' ? 0.05 + 0.05 * ramp(t, HIT2 - 12, HIT2 - 2) : 0.09, k % 2 ? 0.35 : -0.35);
    }
  }
}

// Sidechain: the pad ducks under each kick so the groove breathes.
kickTimes.sort((a, b) => a - b);
{
  let k = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    while (k + 1 < kickTimes.length && kickTimes[k + 1] <= t) k++;
    const since = kickTimes.length && kickTimes[k] <= t ? t - kickTimes[k] : 10;
    const duck = 1 - 0.4 * Math.exp(-since / 0.14);
    padBus[i] *= duck;
    padBusR[i] *= duck;
  }
}

// Ping-pong delay on the arpeggio (a dotted eighth), then a small Schroeder reverb on pad + arp.
{
  const d = Math.round(SR * BEAT * 0.75);
  for (let i = d; i < N; i++) {
    arpL[i] += arpR[i - d] * 0.38;
    arpR[i] += arpL[i - d] * 0.38;
  }
}
function reverb(input) {
  const out = new Float32Array(N);
  for (const [len, fb] of [[1557, 0.83], [1617, 0.82], [1491, 0.84], [1422, 0.83]]) {
    const buf = new Float32Array(len);
    let p = 0, lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[p];
      lp = y * 0.6 + lp * 0.4;
      buf[p] = input[i] + lp * fb;
      out[i] += y * 0.25;
      p = (p + 1) % len;
    }
  }
  for (const len of [225, 556]) {
    const buf = new Float32Array(len);
    let p = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[p];
      const y = -out[i] + b;
      buf[p] = out[i] + b * 0.5;
      out[i] = y;
      p = (p + 1) % len;
    }
  }
  return out;
}
const wetL = reverb(padBus.map((v, i) => v + arpL[i]));
const wetR = reverb(padBusR.map((v, i) => v + arpR[i]));

// ── Mix, master, write ──────────────────────────────────────────────────────────────────────────
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = ramp(t, 0, 0.6) * (1 - ramp(t, LENGTH - 7, LENGTH - 0.2));
  L[i] = Math.tanh((L[i] + padBus[i] + arpL[i] + wetL[i] * 0.35) * 1.1) * fade;
  R[i] = Math.tanh((R[i] + padBusR[i] + arpR[i] + wetR[i] * 0.35) * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.89 / peak; // -1 dBFS

const data = Buffer.alloc(44 + N * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync(process.argv[2] ?? 'public/music.wav', data);
console.log(`wrote ${process.argv[2] ?? 'public/music.wav'} (${LENGTH}s, hit ${HIT2}s, outro ${OUTRO}s)`);

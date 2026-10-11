// Generates the sound effects into public/sfx/: synthesized, deterministic, and ours to share, so
// every project gets them on `npm install` (it runs as postinstall).
//
//   ting.wav    a two-note chime, for the moment the story turns ("an agent needs you")
//   whoosh.wav  an airy swell, under a fast camera move; start it 3-5 frames before the move
//   click.wav   a soft tick, on a Tap or a click
//
//   node scripts/sfx.mjs [outdir]
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const SR = 44100;
const dir = process.argv[2] ?? 'public/sfx';
mkdirSync(dir, {recursive: true});

const save = (name, out) => {
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  const gain = 0.85 / (peak || 1);
  const data = Buffer.alloc(44 + out.length * 2);
  data.write('RIFF', 0); data.writeUInt32LE(36 + out.length * 2, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(out.length * 2, 40);
  for (let i = 0; i < out.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * gain)) * 32767), 44 + i * 2);
  writeFileSync(join(dir, name), data);
};

// Deterministic noise, so every install makes the same sounds.
let seed = 0x1f2e3d4c;
const noise = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
};

// ting: two bell strikes (G6, C7), each a fundamental plus inharmonic partials with fast decay.
{
  const out = new Float32Array(Math.round(SR * 1.1));
  const strike = (t0, f, gain) => {
    const partials = [[1, 1, 0.55], [2.76, 0.32, 0.22], [5.4, 0.12, 0.09], [8.93, 0.05, 0.05]];
    const start = Math.round(t0 * SR);
    for (let j = 0; start + j < out.length; j++) {
      const t = j / SR;
      let v = 0;
      for (const [mult, amp, decay] of partials) v += amp * Math.sin(2 * Math.PI * f * mult * t) * Math.exp(-t / decay);
      out[start + j] += v * Math.min(1, t / 0.002) * gain;
    }
  };
  strike(0, 1567.98, 0.9);
  strike(0.14, 2093.0, 0.8);
  save('ting.wav', out);
}

// whoosh: noise through a resonant band-pass that sweeps up as it swells, then falls away.
{
  const length = 0.9;
  const out = new Float32Array(Math.round(SR * length));
  let low = 0, band = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const p = t / length;
    const env = p < 0.6 ? Math.pow(p / 0.6, 2) : Math.pow(1 - (p - 0.6) / 0.4, 2);
    const f = 250 + 2600 * Math.sin((Math.PI / 2) * Math.min(1, p / 0.7));
    const k = 2 * Math.sin((Math.PI * f) / SR);
    const q = 0.35;
    low += k * band;
    const high = noise() - low - q * band;
    band += k * high;
    out[i] = band * env;
  }
  save('whoosh.wav', out);
}

// click: a short, soft tick: a damped 1.8 kHz ping plus a few milliseconds of noise.
{
  const out = new Float32Array(Math.round(SR * 0.08));
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = 0.8 * Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t / 0.008) + 0.35 * noise() * Math.exp(-t / 0.002);
  }
  save('click.wav', out);
}

console.log(`wrote ting.wav, whoosh.wav, click.wav to ${dir}`);

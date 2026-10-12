import React from 'react';
import {random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {createSmoothSvgPath, useAudioData, visualizeAudio, visualizeAudioWaveform} from '@remotion/media-utils';
import {alpha, useLook} from '../../../look';
import {type VoiceLine, voiceTiming} from '../voiceover/voiceover';

// ---------------------------------------------------------------------------------------------
// Waveform

/** Levels for `n` bands at this frame: 0 to 1 for a spectrum, -1 to 1 for a wave. */
type Levels = (n: number) => number[];

const nextPow2 = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(2, n)));

/** Reads an audio file in public/ and gives its spectrum and its wave at this frame. */
const FromAudio: React.FC<{src: string; start: number; children: (spectrum: Levels, wave: Levels) => React.ReactNode}> = ({src, start, children}) => {
  const frame = useCurrentFrame() - start;
  const {fps} = useVideoConfig();
  const audioData = useAudioData(staticFile(src));
  const spectrum: Levels = (n) => {
    if (!audioData || frame < 0) return new Array(n).fill(0);
    const bins = visualizeAudio({audioData, frame, fps, numberOfSamples: nextPow2(n * 4)});
    // Speech lives in the lowest bins: spread those over the bars, on a loudness curve.
    return new Array(n).fill(0).map((_, i) => Math.min(1, Math.pow(bins[Math.floor((i / n) * bins.length * 0.4)] * 14, 0.6)));
  };
  const wave: Levels = (n) => {
    if (!audioData || frame < 0) return new Array(n).fill(0);
    return visualizeAudioWaveform({audioData, frame, fps, windowInSeconds: 0.35, numberOfSamples: n, normalize: false}).map((v) => Math.max(-1, Math.min(1, v * 2.5)));
  };
  return <>{children(spectrum, wave)}</>;
};

/** Silence: a voiceover between its lines. */
const Silent: React.FC<{children: (spectrum: Levels, wave: Levels) => React.ReactNode}> = ({children}) => {
  const zero: Levels = (n) => new Array(n).fill(0);
  return <>{children(zero, zero)}</>;
};

/** Made-up levels that move like speech: syllables inside phrases, with breaths between. */
const Synthetic: React.FC<{seed: number; children: (spectrum: Levels, wave: Levels) => React.ReactNode}> = ({seed, children}) => {
  const f = useCurrentFrame();
  // Phrases swell and ease (never quite silent); syllables beat about four times a second in them.
  const phrase = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f * 0.06 + seed)) * (0.75 + 0.25 * Math.sin(f * 0.17 + seed * 2));
  const syllable = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.42 + Math.sin(f * 0.09 + seed) * 2));
  const energy = Math.min(1, phrase * syllable * 1.25);
  const spectrum: Levels = (n) =>
    new Array(n).fill(0).map((_, i) => {
      const band = Math.exp(-(((i / n) * 2.4) ** 2) * 0.7);
      const jitter = 0.65 + 0.35 * random(`${seed}-${i}-${Math.floor(f / 2)}`);
      return Math.min(1, energy * band * jitter * 1.1 + 0.04);
    });
  const wave: Levels = (n) =>
    new Array(n).fill(0).map((_, i) => energy * Math.sin(i * 0.9 + f * 0.8) * Math.sin(i * 0.23 + f * 0.31) * (0.6 + 0.4 * random(`${seed}-w${i}-${f}`)));
  return <>{children(spectrum, wave)}</>;
};

/**
 * A waveform that moves with a voice: `bars` (a centred spectrum, the podcast look), `line` (the
 * wave itself) or `circle` (bars around a ring, with `children` inside: a face, a cover). Give it a
 * voiceover's `lines` (with the Voiceover's `start` and `gap`), or one audio `src` and the frame it
 * `start`s playing on; with neither, it makes up motion that looks like speech.
 *
 *   <Waveform lines={tutorial} start={15} variant="circle">{face}</Waveform>
 *
 * With two voices, give each person's waveform `only` their lines (indices into `lines`): it moves
 * while they speak and lies flat while the other one does.
 */
export const Waveform: React.FC<{
  /** A voiceover's lines to follow; give it the Voiceover's start and gap. */
  lines?: VoiceLine[];
  /** The indices of the lines this waveform follows; the others leave it flat. Default: all. */
  only?: number[];
  /** Seconds between the voiceover's lines, as given to Voiceover (default 0.3). */
  gap?: number;
  /** One audio file in public/ to follow, playing from `start`. */
  src?: string;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** bars (a centred spectrum), line (the wave) or circle (bars round a ring, with children inside); default bars. */
  variant?: 'bars' | 'line' | 'circle';
  /** Its width in px, for bars and line (default 720). */
  width?: number;
  /** Its height in px, for bars and line (default 160). */
  height?: number;
  /** The circle's diameter in px (default 360). */
  size?: number;
  /** How many bars (default 48, or 72 round a circle). */
  bars?: number;
  /** Its colour; the style's accent if not set. */
  color?: string;
  /** Seed for the made-up motion it shows with no voice to follow (default 3). */
  seed?: number;
  /** What sits inside the circle: a face, a cover. */
  children?: React.ReactNode;
}> = ({lines, only, gap = 0.3, src, start = 0, variant = 'bars', width = 720, height = 160, size = 360, bars, color, seed = 3, children}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = color ?? look.accent;
  const draw = (spectrum: Levels, wave: Levels) => {
    if (variant === 'line') {
      const n = 64;
      const pts = wave(n).map((v, i) => ({x: (i / (n - 1)) * width, y: height / 2 + v * height * 0.45}));
      return (
        <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
          <line x1={0} x2={width} y1={height / 2} y2={height / 2} stroke={alpha(c, 0.25)} strokeWidth={2} />
          <path d={createSmoothSvgPath({points: pts})} fill="none" stroke={c} strokeWidth={Math.max(4, height * 0.035)} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (variant === 'circle') {
      const n = bars ?? 72;
      // Mirrored left and right, so the ring is symmetric like a face.
      const half = spectrum(Math.ceil(n / 2));
      const levels = new Array(n).fill(0).map((_, i) => half[Math.min(half.length - 1, i < n / 2 ? i : n - 1 - i)]);
      const r = size / 2;
      const outer = r * 0.42;
      const box = size + outer * 2;
      return (
        <div style={{position: 'relative', width: box, height: box}}>
          <svg width={box} height={box} style={{position: 'absolute', inset: 0}}>
            {levels.map((v, i) => {
              const a = (i / n) * Math.PI * 2 - Math.PI / 2;
              const from = r + 10;
              const to = from + 6 + v * outer;
              return (
                <line
                  key={i}
                  x1={box / 2 + Math.cos(a) * from}
                  y1={box / 2 + Math.sin(a) * from}
                  x2={box / 2 + Math.cos(a) * to}
                  y2={box / 2 + Math.sin(a) * to}
                  stroke={c}
                  strokeOpacity={0.45 + 0.55 * v}
                  strokeWidth={Math.max(4, (Math.PI * 2 * r) / n / 2.2)}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div style={{position: 'absolute', left: outer, top: outer, width: size, height: size, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {children}
          </div>
        </div>
      );
    }
    const n = bars ?? 48;
    const half = spectrum(Math.ceil(n / 2));
    // Low bands in the middle, high ones at the ends: the shape people read as a voice.
    const levels = new Array(n).fill(0).map((_, i) => half[Math.min(half.length - 1, Math.abs(Math.floor(n / 2) - i))]);
    const slot = width / n;
    const w = Math.max(3, slot * 0.55);
    return (
      <svg width={width} height={height} style={{display: 'block'}}>
        {levels.map((v, i) => {
          const h = Math.max(w, v * height);
          return <rect key={i} x={i * slot + (slot - w) / 2} y={(height - h) / 2} width={w} height={h} rx={w / 2} fill={c} opacity={0.55 + 0.45 * v} />;
        })}
      </svg>
    );
  };
  if (lines) {
    // The line playing now, read from its own file; flat between lines.
    const timing = voiceTiming(lines, {start, gap, fps});
    const i = timing.findIndex((t, k) => frame >= t.start && frame < t.end && (!only || only.includes(k)));
    return i < 0 ? <Silent>{draw}</Silent> : <FromAudio key={i} src={lines[i].src} start={timing[i].start}>{draw}</FromAudio>;
  }
  return src ? <FromAudio src={src} start={start}>{draw}</FromAudio> : <Synthetic seed={seed}>{draw}</Synthetic>;
};

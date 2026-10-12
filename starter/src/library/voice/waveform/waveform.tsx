import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {createSmoothSvgPath, useAudioData, visualizeAudio, visualizeAudioWaveform} from '@remotion/media-utils';
import {alpha, type Look, useLook} from '../../../look';
import type {Demo} from '../../types';
import {centre} from '../_shared';
import {Captions} from '../captions/captions';
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
  lines?: VoiceLine[];
  /** The indices of the lines this waveform follows; the others leave it flat. Default: all. */
  only?: number[];
  gap?: number;
  src?: string;
  start?: number;
  variant?: 'bars' | 'line' | 'circle';
  width?: number;
  height?: number;
  /** The circle's diameter. */
  size?: number;
  bars?: number;
  color?: string;
  seed?: number;
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery: made-up timing, so they need no audio file. For a real voice, see
// voiceover.tsx.

/** A podcast cover: a tile with the episode, for the waveform samples. */
const Cover: React.FC<{look: Look; size: number}> = ({look, size}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.min(look.radius, size * 0.12),
      background: look.accent,
      color: look.onAccent,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: size * 0.1,
      boxShadow: look.shadow,
      fontFamily: look.fonts.headline,
      fontWeight: 700,
      fontSize: size * 0.16,
      lineHeight: 1,
    }}
  >
    <div style={{fontFamily: look.fonts.mono, fontSize: size * 0.07, opacity: 0.8, marginBottom: size * 0.04}}>EP. 42</div>
    The Build Log
  </div>
);

const BarsDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, flexDirection: 'column', gap: 48, marginTop: -80}}>
      <Cover look={look} size={look.tall ? 420 : 300} />
      <Waveform variant="bars" width={look.tall ? 760 : 900} height={look.tall ? 180 : 150} />
    </AbsoluteFill>
  );
};

const LineDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, marginTop: -80}}>
      <Waveform variant="line" width={look.tall ? 800 : 1200} height={look.tall ? 260 : 240} seed={7} />
    </AbsoluteFill>
  );
};

/** A speaker's initials in a tinted disc: a stand-in for a face. */
const Face: React.FC<{look: Look}> = ({look}) => (
  <div style={{width: '100%', height: '100%', background: look.accentSoft, color: look.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.fonts.headline, fontWeight: 700, fontSize: 110}}>
    MR
  </div>
);

const CircleDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, marginTop: -80}}>
      <Waveform variant="circle" size={look.tall ? 380 : 320}>
        <Face look={look} />
      </Waveform>
    </AbsoluteFill>
  );
};

/** Everything together: a podcast clip, the speaker ringed by her voice, captions under her. */
const ClipDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: look.tall ? look.safe.top + 20 : 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <Waveform variant="circle" size={look.tall ? 340 : 230} seed={11}>
          <Face look={look} />
        </Waveform>
        <div style={{fontFamily: look.fonts.body, fontSize: look.tall ? 34 : 28, fontWeight: 700, color: look.ink}}>Maya Ruiz · The Build Log</div>
      </div>
      <Captions text="We shipped it on a Friday. Never again." seconds={3} start={10} variant="pop" />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Voice: waveform, bars', code: '<Waveform src={voice[0].src} start={15} variant="bars" />', seconds: 3, hero: 40, Component: BarsDemo},
  {name: 'Voice: waveform, line', code: '<Waveform src={voice[0].src} variant="line" />', seconds: 3, hero: 40, Component: LineDemo},
  {name: 'Voice: waveform, circle', code: '<Waveform variant="circle">{face}</Waveform>', seconds: 3, hero: 40, Component: CircleDemo},
  {name: 'Voice: podcast clip', code: '<Waveform variant="circle" /> + <Captions variant="pop" />', seconds: 4, hero: 62, Component: ClipDemo},
];

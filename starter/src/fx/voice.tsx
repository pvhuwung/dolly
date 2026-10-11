import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {createSmoothSvgPath, useAudioData, visualizeAudio, visualizeAudioWaveform} from '@remotion/media-utils';
import {alpha, type Look, useLook} from '../look';
import type {Demo} from './demo';

// Voice: a voiceover made with scripts/voice.mjs, captions timed to it, and a waveform that moves
// with it. For narrated tutorials and explainers, podcast clips, anything with someone speaking.
//
//   npm run voice -- script.txt tutorial        # public/voice/tutorial/*.wav and src/voice/tutorial.ts
//
//   import {tutorial} from './voice/tutorial';
//   <Voiceover lines={tutorial} start={15} />
//   <Captions lines={tutorial} start={15} />
//
// Times are frames from the start of the scene they're in. Give Voiceover and Captions the same
// `start` and `gap` so the words land with the voice; voiceTiming() says when each line plays, so
// a scene can cut on a line or be as long as its voiceover.

/** One line of a voiceover: what scripts/voice.mjs writes into src/voice/<name>.ts. */
export type VoiceLine = {
  text: string;
  /** The WAV, in public/. */
  src: string;
  seconds: number;
  /** Where the speech starts and ends inside the file, in seconds (the rest is breath). */
  speech?: [number, number];
};

/** A word with its time on screen, in frames. */
export type Word = {text: string; start: number; end: number};

type Timing = {start?: number; gap?: number; fps?: number};

/** When each line plays, in frames: one after another from `start`, `gap` seconds apart. */
export const voiceTiming = (lines: VoiceLine[], {start = 0, gap = 0.3, fps = 30}: Timing = {}) => {
  const out: {start: number; end: number}[] = [];
  let t = start;
  for (const line of lines) {
    const from = Math.round(t);
    out.push({start: from, end: from + Math.round(line.seconds * fps)});
    t = from + Math.round(line.seconds * fps) + gap * fps;
  }
  return out;
};

/** The frame the last line ends on: make the scene at least this long. */
export const voiceEnd = (lines: VoiceLine[], options: Timing = {}) => {
  const t = voiceTiming(lines, options);
  return t.length ? t[t.length - 1].end : (options.start ?? 0);
};

/**
 * Plays a voiceover's lines one after another from `start`, `gap` seconds apart.
 *
 *   <Voiceover lines={tutorial} start={15} />
 */
export const Voiceover: React.FC<{lines: VoiceLine[]; start?: number; gap?: number; volume?: number}> = ({lines, start = 0, gap = 0.3, volume = 1}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {voiceTiming(lines, {start, gap, fps}).map((t, i) => (
        <Sequence key={i} from={t.start} durationInFrames={t.end - t.start} layout="none">
          <Audio src={staticFile(lines[i].src)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Word timing: spread over the speech by word length, with a beat after punctuation. Close enough
// to read as in sync, without forced alignment.

const spread = (text: string, from: number, to: number): Word[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w, i) => {
    const letters = w.replace(/[^\p{L}\p{N}]/gu, '').length;
    const pause = i === words.length - 1 ? 0 : /[.!?]$/.test(w) ? 5 : /[,;:—]$/.test(w) ? 3 : 0;
    return letters + 2 + pause;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let t = from;
  return words.map((w, i) => {
    const s = t;
    t += ((to - from) * weights[i]) / total;
    return {text: w, start: Math.round(s), end: Math.round(t)};
  });
};

/** The words of a voiceover, line by line, timed in frames: what Captions shows. */
export const voiceWords = (lines: VoiceLine[], options: Timing = {}): Word[][] => {
  const fps = options.fps ?? 30;
  return voiceTiming(lines, options).map((t, i) => {
    const [a, b] = lines[i].speech ?? [0, lines[i].seconds];
    return spread(lines[i].text, t.start + a * fps, t.start + b * fps);
  });
};

/**
 * Words in groups of up to `max` words and `chars` letters. A group never runs past the end of a
 * sentence, a clause or a line, and a long clause splits into even groups ("We shipped it" / "on a
 * Friday."), never a long one and a stray word.
 */
const chunk = (lines: Word[][], max: number, chars: number): Word[][] => {
  const out: Word[][] = [];
  const width = (ws: Word[]) => ws.reduce((s, w) => s + w.text.length + 1, -1);
  for (const words of lines) {
    // Clauses: end at . ! ? always, and at , ; : — when the clause already has two words.
    const clauses: Word[][] = [];
    let cur: Word[] = [];
    for (const w of words) {
      cur.push(w);
      if (/[.!?]["”’)]*$/.test(w.text) || (/[,;:—]$/.test(w.text) && cur.length >= 2)) {
        clauses.push(cur);
        cur = [];
      }
    }
    if (cur.length) clauses.push(cur);
    for (const clause of clauses) {
      const n = Math.max(Math.ceil(clause.length / max), Math.ceil(width(clause) / chars));
      for (let k = 0; k < n; k++) {
        const part = clause.slice(Math.round((k * clause.length) / n), Math.round(((k + 1) * clause.length) / n));
        if (part.length) out.push(part);
      }
    }
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// Captions

/**
 * Captions for someone speaking, the way Reels and TikTok set them: a few words at a time, big and
 * bold, the word being said marked. Give it a voiceover (`lines`, with the Voiceover's `start` and
 * `gap`), or `text` spoken over `seconds` from `start`, or exact `words` in frames.
 *
 * `variant`: `karaoke` (a box in the accent jumps to the word being said), `pop` (each word pops
 * in on its beat), `line` (a plain subtitle). On light styles they sit on a plate in the ink
 * colour; on dark ones they're white with an outline, to read over any footage. They sit low in
 * the format's safe area (above the platform's caption band in 9:16), or in the `middle`.
 *
 *   <Captions lines={tutorial} start={15} variant="karaoke" />
 */
export const Captions: React.FC<{
  lines?: VoiceLine[];
  text?: string;
  seconds?: number;
  words?: Word[];
  start?: number;
  gap?: number;
  variant?: 'karaoke' | 'pop' | 'line';
  /** The most words on screen at once. */
  max?: number;
  position?: 'bottom' | 'middle';
  size?: number;
  /** A plate behind the words: the default on light styles. */
  plate?: boolean;
}> = ({lines, text, seconds = 3, words, start = 0, gap = 0.3, variant = 'karaoke', max, position = 'bottom', size, plate}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fontSize = size ?? Math.round(look.size * (look.tall ? 0.92 : 1.05));
  const inner = look.width - look.safe.left - look.safe.right;
  const chunks = useMemo(() => {
    const timed = words ? [words] : lines ? voiceWords(lines, {start, gap, fps}) : [spread(text ?? '', start, start + Math.round(seconds * fps))];
    return chunk(timed, max ?? (look.tall ? 3 : 5), Math.min(32, Math.floor(inner / (fontSize * 0.62))));
  }, [words, lines, text, seconds, start, gap, fps, max, look.tall, inner, fontSize]);

  // The group on screen: from its first word until the next group starts (or a beat after it ends).
  const i = chunks.findIndex((c, k) => frame >= c[0].start && frame < Math.min(chunks[k + 1]?.[0].start ?? Infinity, c[c.length - 1].end + 14));
  if (i < 0) return null;
  const group = chunks[i];
  const enter = spring({frame: frame - group[0].start, fps, config: {damping: 200}, durationInFrames: 8});
  const onPlate = plate ?? !look.dark;
  const ink = onPlate ? look.ink : '#ffffff';
  const marked = look.accentText !== look.ink ? look.accentText : '#ffd84d';
  const outline: React.CSSProperties = onPlate
    ? {}
    : {WebkitTextStroke: `${Math.max(3, Math.round(fontSize * 0.1))}px rgba(0, 0, 0, 0.82)`, paintOrder: 'stroke fill', textShadow: '0 6px 24px rgba(0, 0, 0, 0.45)'};

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          right: look.safe.right,
          display: 'flex',
          justifyContent: 'center',
          ...(position === 'middle'
            ? {top: 0, bottom: 0, alignItems: 'center'}
            : {bottom: look.tall ? look.safe.bottom + 24 : look.safe.bottom + Math.round(look.height * 0.08)}),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.12em',
            rowGap: '0.08em',
            maxWidth: inner,
            padding: onPlate ? '0.22em 0.5em' : 0,
            borderRadius: onPlate ? Math.min(look.radius + 6, fontSize * 0.45) : 0,
            background: onPlate ? alpha(look.surface, 0.94) : 'transparent',
            boxShadow: onPlate ? look.shadow : 'none',
            fontFamily: look.fonts.body,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.18,
            letterSpacing: '-0.01em',
            color: ink,
            // Groups follow each other with no gap, so a new one starts part-visible: no blank frame.
            opacity: 0.35 + 0.65 * enter,
            transform: `translateY(${(1 - enter) * 14}px) scale(${0.96 + 0.04 * enter})`,
          }}
        >
          {group.map((w, k) => {
            const now = frame >= w.start && (frame < w.end || k === group.length - 1);
            const said = frame >= w.start;
            const hit = spring({frame: frame - w.start, fps, config: look.spring, durationInFrames: 10});
            const box = variant === 'karaoke' && now;
            return (
              <span
                key={k}
                style={{
                  padding: '0 0.16em',
                  borderRadius: Math.min(look.radius, fontSize * 0.22),
                  background: box ? look.accent : 'transparent',
                  color: box ? look.onAccent : variant === 'pop' && now ? marked : ink,
                  ...(box ? {} : outline),
                  // Popping words take their place as they're said, so the plate grows with the line.
                  display: variant === 'pop' && !said ? 'none' : 'inline-block',
                  transform: variant === 'pop' ? `scale(${said ? 0.7 + 0.3 * hit : 0.7})` : box ? `scale(${0.92 + 0.08 * hit})` : undefined,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

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
 */
export const Waveform: React.FC<{
  lines?: VoiceLine[];
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
}> = ({lines, gap = 0.3, src, start = 0, variant = 'bars', width = 720, height = 160, size = 360, bars, color, seed = 3, children}) => {
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
    const i = timing.findIndex((t) => frame >= t.start && frame < t.end);
    return i < 0 ? <Silent>{draw}</Silent> : <FromAudio key={i} src={lines[i].src} start={timing[i].start}>{draw}</FromAudio>;
  }
  return src ? <FromAudio src={src} start={start}>{draw}</FromAudio> : <Synthetic seed={seed}>{draw}</Synthetic>;
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery: made-up timing, so they need no audio file. For a real voice, see the
// top of this file.

const centre: React.CSSProperties = {alignItems: 'center', justifyContent: 'center'};

/** A stand-in for footage behind captions: a card of grey lines. */
const Shot: React.FC<{look: Look}> = ({look}) => (
  <div
    style={{
      width: look.tall ? 760 : 1100,
      height: look.tall ? 760 : 520,
      borderRadius: look.radius,
      background: look.surface,
      boxShadow: look.shadow,
      padding: 48,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      marginTop: look.tall ? -240 : -60,
    }}
  >
    {[0.5, 0.8, 0.65, 0.9, 0.4].map((w, i) => (
      <div key={i} style={{width: `${w * 100}%`, height: i === 0 ? 34 : 20, borderRadius: 10, background: alpha(look.ink, i === 0 ? 0.6 : 0.12)}} />
    ))}
  </div>
);

const LINE = 'Captions land word by word, right on the voice.';

const CaptionDemo: React.FC<{variant: 'karaoke' | 'pop' | 'line'}> = ({variant}) => {
  const look = useLook();
  return (
    <AbsoluteFill style={centre}>
      <Shot look={look} />
      <Captions text={LINE} seconds={3.4} start={8} variant={variant} position="middle" />
    </AbsoluteFill>
  );
};

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
  {name: 'Voice: captions, karaoke', code: '<Captions lines={voice} start={15} variant="karaoke" />', seconds: 4, hero: 62, Component: () => <CaptionDemo variant="karaoke" />},
  {name: 'Voice: captions, pop', code: '<Captions lines={voice} start={15} variant="pop" />', seconds: 4, hero: 92, Component: () => <CaptionDemo variant="pop" />},
  {name: 'Voice: captions, line', code: '<Captions lines={voice} start={15} variant="line" />', seconds: 4, hero: 62, Component: () => <CaptionDemo variant="line" />},
  {name: 'Voice: waveform, bars', code: '<Waveform src={voice[0].src} start={15} variant="bars" />', seconds: 3, hero: 40, Component: BarsDemo},
  {name: 'Voice: waveform, line', code: '<Waveform src={voice[0].src} variant="line" />', seconds: 3, hero: 40, Component: LineDemo},
  {name: 'Voice: waveform, circle', code: '<Waveform variant="circle">{face}</Waveform>', seconds: 3, hero: 40, Component: CircleDemo},
  {name: 'Voice: podcast clip', code: '<Waveform variant="circle" /> + <Captions variant="pop" />', seconds: 4, hero: 62, Component: ClipDemo},
];

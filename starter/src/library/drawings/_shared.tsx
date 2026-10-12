import React, {createContext, useContext, useId} from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, type Ease} from '../../kit';
import {mix, useBrand, useLook} from '../../look';
import {Paper} from './paper/paper';

// Drawings made with code: watercolour flowers, stamped patterns, a hexagon heat field, a
// butterfly, a growing plant, embroidery, washes, doodles, constellations, contour lines, ink
// ripples and scribbles. Each is generated from a `seed` (same seed, same drawing), drawn in from a
// `start` frame, and painted in an earthy palette made from the brand's accent (`palette` overrides
// any of its colours). Put them on a `Paper` card, behind a headline, or straight on the page.
//
// They're 2D SVG: put them over a Stage or inside a Screen, never on a Layer's wrapper.
//
// Pieces the drawings share, and their gallery layout. Not an item: it's copied with any drawing.

export type Pt = {x: number; y: number};

// ---------------------------------------------------------------------------------------------
// Palette, ink and time

/** The drawings' colours: the brand accent and earthy cousins of it, so they sit together. */
export type Palette = {ink: string; paper: string; accent: string; deep: string; warm: string; sun: string; rose: string; leaf: string; sky: string};

export const usePalette = (over?: Partial<Palette>): Palette => {
  const {accent} = useBrand();
  // Pigment colours, each with a touch of the accent so they belong to the brand without going muddy.
  const tint = (pigment: string, k = 0.12) => mix(pigment, accent, k);
  return {
    ink: '#2b2630',
    paper: '#f6f1e5',
    accent,
    deep: tint('#3a2652', 0.14),
    warm: tint('#d4603a'),
    sun: tint('#e6a93f', 0.08),
    rose: tint('#de7f8c', 0.08),
    leaf: tint('#6a8c4b', 0.14),
    sky: tint('#6f9fc0', 0.16),
    ...over,
  };
};

/** True inside a Paper card: ink is dark there whatever the page. */
export const OnPaper = createContext(false);

/** The colour line drawings default to: dark on paper and light pages, light on dark pages. */
export const useInk = (palette: Palette) => {
  const onPaper = useContext(OnPaper);
  const look = useLook();
  return onPaper || !look.dark ? palette.ink : look.ink;
};

export const useClock = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const len = (n: number) => Math.max(1, Math.round(n * look.pace));
  return {
    frame,
    len,
    /** 0 to 1 over `frames` from `at`, eased. */
    ramp: (at: number, frames: number, easing: Ease = ease.inOut) =>
      interpolate(frame, [at, at + len(frames)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing}),
    /** 0 to 1 from `at`, settling without bounce. */
    glide: (at: number, frames = 24) => spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: len(frames)}),
    /** 0 to 1 from `at`, with the style's bounce. */
    pop: (at: number, frames = 20) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: len(frames)}),
  };
};

/** An id usable in url(#...): React's ids contain colons. */
export const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

// ---------------------------------------------------------------------------------------------
// Geometry

export const n1 = (v: number) => Math.round(v * 10) / 10;

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
export const smooth = (pts: Pt[], closed = false): string => {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${n1(pts[0].x)},${n1(pts[0].y)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d +=
      ` C${n1(p1.x + (p2.x - p0.x) / 6)},${n1(p1.y + (p2.y - p0.y) / 6)}` +
      ` ${n1(p2.x - (p3.x - p1.x) / 6)},${n1(p2.y - (p3.y - p1.y) / 6)} ${n1(p2.x)},${n1(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
};

const fade = (t: number) => t * t * (3 - 2 * t);
const lattice = (seed: string | number, x: number, y: number) => random(`${seed}|${x}|${y}`);

/**
 * Smooth value noise, 0 to 1, the same for the same seed and point. Steps of 1 in x or y are one
 * "wave": scale coordinates down (x * 0.01) for broad shapes.
 */
export const noise = (seed: string | number, x: number, y = 0) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const a = lattice(seed, x0, y0);
  const b = lattice(seed, x0 + 1, y0);
  const c = lattice(seed, x0, y0 + 1);
  const d = lattice(seed, x0 + 1, y0 + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};

/** Noise with finer detail layered in. */
export const fbm = (seed: string | number, x: number, y: number, octaves = 3) => {
  let v = 0;
  let amp = 0.5;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    v += amp * noise(`${seed}-${o}`, x * 2 ** o, y * 2 ** o);
    total += amp;
    amp *= 0.5;
  }
  return v / total;
};

/** A path that draws itself on: `t` 0 to 1. Hidden at 0 so its round cap doesn't leave a dot. */
export const DrawOn: React.FC<{d: string; t: number; color: string; width: number; opacity?: number; filter?: string}> = ({d, t, color, width, opacity = 1, filter}) =>
  t <= 0.002 ? null : (
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - t}
      filter={filter}
      style={{fill: 'none', stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', opacity}}
    />
  );

/** An SVG filter that wobbles edges like paint on paper. `scale` is how far, in px. */
export const Wobble: React.FC<{id: string; seed: number; scale?: number; frequency?: number}> = ({id, seed, scale = 8, frequency = 0.04}) => (
  <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** A leaf or petal outline from base (0, 0) to tip (0, -length): `round` tips for petals. */
export const bladePoints = (length: number, width: number, seed: string, round: boolean): Pt[] => {
  const N = 8;
  const half = (s: number, k: number) => {
    const body = round ? Math.sin(Math.PI * s ** 0.85) ** 0.55 * Math.min(1, s / 0.28) ** 0.5 : Math.sin(Math.PI * s);
    return width * 0.5 * body * (1 + (random(`${seed}-${k}`) - 0.5) * 0.28);
  };
  const pts: Pt[] = [{x: 0, y: 0}];
  for (let k = 1; k < N; k++) pts.push({x: -half(k / N, k), y: -(k / N) * length});
  pts.push({x: 0, y: -length});
  for (let k = N - 1; k >= 1; k--) pts.push({x: half(k / N, k + 20), y: -(k / N) * length});
  return pts;
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** The area a sample can use: the safe area, above the gallery's label. */
export const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = Math.max(look.safe.bottom, 190);
  return {look, x: look.safe.left, y: top, w: look.width - look.safe.left - look.safe.right, h: look.height - top - bottom};
};

/** Centres its child in the sample area. */
export const InArea: React.FC<{children: React.ReactNode}> = ({children}) => {
  const a = useArea();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </AbsoluteFill>
  );
};

/** A paper card filling most of the area at `aspect` (width / height), with the drawing's size. */
export const CardSample: React.FC<{aspect: number; rotate?: number; children: (w: number, h: number) => React.ReactNode}> = ({aspect, rotate = -1.5, children}) => {
  const a = useArea();
  const w = Math.min(a.w * 0.92, a.h * 0.96 * aspect, 1100);
  const h = w / aspect;
  return (
    <InArea>
      <Paper width={Math.round(w)} height={Math.round(h)} rotate={rotate}>
        {children(w, h)}
      </Paper>
    </InArea>
  );
};

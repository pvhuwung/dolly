import React, {createContext, useContext, useId, useMemo} from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, type Ease} from '../kit';
import {alpha, mix, useBrand, useLook} from '../look';
import type {Demo} from './demo';

// Drawings made with code: watercolour flowers, stamped patterns, a hexagon heat field, a
// butterfly, a growing plant, embroidery, washes, doodles, constellations, contour lines, ink
// ripples and scribbles. Each is generated from a `seed` (same seed, same drawing), drawn in from a
// `start` frame, and painted in an earthy palette made from the brand's accent (`palette` overrides
// any of its colours). Put them on a `Paper` card, behind a headline, or straight on the page.
//
// They're 2D SVG: put them over a Stage or inside a Screen, never on a Layer's wrapper.

type Pt = {x: number; y: number};

// ---------------------------------------------------------------------------------------------
// Palette, ink and time

/** The drawings' colours: the brand accent and earthy cousins of it, so they sit together. */
export type Palette = {ink: string; paper: string; accent: string; deep: string; warm: string; sun: string; rose: string; leaf: string; sky: string};

const usePalette = (over?: Partial<Palette>): Palette => {
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
const OnPaper = createContext(false);

/** The colour line drawings default to: dark on paper and light pages, light on dark pages. */
const useInk = (palette: Palette) => {
  const onPaper = useContext(OnPaper);
  const look = useLook();
  return onPaper || !look.dark ? palette.ink : look.ink;
};

const useClock = () => {
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
const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

// ---------------------------------------------------------------------------------------------
// Geometry

const n1 = (v: number) => Math.round(v * 10) / 10;

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
const smooth = (pts: Pt[], closed = false): string => {
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
const fbm = (seed: string | number, x: number, y: number, octaves = 3) => {
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
const DrawOn: React.FC<{d: string; t: number; color: string; width: number; opacity?: number; filter?: string}> = ({d, t, color, width, opacity = 1, filter}) =>
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
const Wobble: React.FC<{id: string; seed: number; scale?: number; frequency?: number}> = ({id, seed, scale = 8, frequency = 0.04}) => (
  <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** A leaf or petal outline from base (0, 0) to tip (0, -length): `round` tips for petals. */
const bladePoints = (length: number, width: number, seed: string, round: boolean): Pt[] => {
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
// Paper

/**
 * A card of warm paper with a faint grain and fibres, a slightly uneven edge and a soft shadow,
 * holding drawings (or anything) centred inside. It slides in from `start`; `rotate` tilts it a few
 * degrees, like cards laid on a table. Line drawings inside use dark ink whatever the page.
 *
 *   <Paper width={560} height={700} rotate={-3}><Flower /></Paper>
 */
export const Paper: React.FC<{
  width: number;
  height: number;
  rotate?: number;
  start?: number;
  color?: string;
  seed?: number;
  padding?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({width, height, rotate = 0, start = 0, color = '#f6f1e5', seed = 1, padding = 0, style, children}) => {
  const {glide} = useClock();
  const uid = useUid();
  const t = glide(start, 26);
  const edge = useMemo(() => {
    const pts: string[] = [];
    const step = 34;
    let i = 0;
    const j = () => (random(`paper-${seed}-${i++}`) - 0.5) * 2.2;
    for (let x = 0; x < width; x += step) pts.push(`${n1(x + j())}px ${n1(1 + j())}px`);
    for (let y = 0; y < height; y += step) pts.push(`${n1(width - 1 + j())}px ${n1(y + j())}px`);
    for (let x = width; x > 0; x -= step) pts.push(`${n1(x + j())}px ${n1(height - 1 + j())}px`);
    for (let y = height; y > 0; y -= step) pts.push(`${n1(1 + j())}px ${n1(y + j())}px`);
    return `polygon(${pts.join(', ')})`;
  }, [width, height, seed]);
  if (t <= 0) return <div style={{width, height, ...style}} />;
  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        opacity: Math.min(1, t * 1.6),
        transform: `translateY(${(1 - t) * 40}px) rotate(${rotate + (1 - t) * 5}deg)`,
        filter: 'drop-shadow(0 18px 24px rgba(42, 32, 60, 0.15)) drop-shadow(0 2px 3px rgba(42, 32, 60, 0.1))',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width,
          height,
          clipPath: edge,
          background: color,
          backgroundImage: 'radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(120, 92, 52, 0.08) 100%)',
        }}
      >
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          <filter id={`${uid}g`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.34  0 0 0 0 0.26  0 0 0 0.32 -0.1" />
          </filter>
          <filter id={`${uid}f`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.22" numOctaves={2} seed={seed + 7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.42 -0.25" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${uid}g)`} />
          <rect width="100%" height="100%" filter={`url(#${uid}f)`} />
        </svg>
        <OnPaper.Provider value>
          <div style={{position: 'absolute', inset: padding, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
        </OnPaper.Provider>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Flower

/**
 * A watercolour flower: translucent petals layered over each other with pooled edges, a cluster
 * of stamens, a stem and two leaves. The stem draws up from `start`, the leaves unfurl, then the
 * petals open from a bud. `size` is its width; it's 1.5 times as tall with a stem.
 *
 *   <Flower size={320} petals={6} start={10} />
 */
export const Flower: React.FC<{
  size?: number;
  petals?: number;
  start?: number;
  frames?: number;
  seed?: number;
  color?: string;
  stem?: boolean;
  palette?: Partial<Palette>;
}> = ({size = 320, petals = 6, start = 0, frames = 80, seed = 1, color, stem = true, palette}) => {
  const p = usePalette(palette);
  const {ramp, len} = useClock();
  const uid = useUid();
  const petal = color ?? p.rose;
  const W = 400;
  const H = stem ? 600 : 380;
  const cx = 200;
  const cy = stem ? 175 : 190;
  const shapes = useMemo(
    () =>
      Array.from({length: petals}, (_, i) => {
        const r = (k: number) => random(`flower-${seed}-${i}-${k}`);
        const L = 112 + r(0) * 34;
        return {
          d: smooth(bladePoints(L, 98 + r(1) * 30, `fp-${seed}-${i}`, true), true),
          angle: (i * 360) / petals + (r(2) - 0.5) * 16,
          L,
          tone: r(3),
        };
      }),
    [petals, seed],
  );
  const stamens = useMemo(
    () =>
      Array.from({length: 16}, (_, i) => {
        const a = random(`st-${seed}-${i}`) * Math.PI * 2;
        const d = Math.sqrt(random(`sd-${seed}-${i}`)) * 17;
        return {x: Math.cos(a) * d, y: Math.sin(a) * d, r: 2.4 + random(`sr-${seed}-${i}`) * 2.6, dark: random(`sk-${seed}-${i}`) > 0.55};
      }),
    [seed],
  );
  const lean = (random(`lean-${seed}`) - 0.5) * 40;
  const stemD = `M${cx + lean},${H - 8} Q${cx - lean * 0.6},${(H + cy) / 2} ${cx},${cy + 24}`;
  const leaves = [
    {at: 0.62, side: -1, angle: -58, L: 118},
    {at: 0.46, side: 1, angle: 52, L: 96},
  ];
  // Where on the stem's curve the leaves sit (a quadratic: B(s) = (1-s)²P0 + 2s(1-s)P1 + s²P2).
  const onStem = (s: number) => ({
    x: (1 - s) ** 2 * (cx + lean) + 2 * s * (1 - s) * (cx - lean * 0.6) + s * s * cx,
    y: (1 - s) ** 2 * (H - 8) + 2 * s * (1 - s) * ((H + cy) / 2) + s * s * (cy + 24),
  });
  const tStem = stem ? ramp(start, frames * 0.38, ease.out) : 1;
  const stemInk = mix(p.leaf, p.ink, 0.3);
  return (
    <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible', display: 'block'}}>
      <Wobble id={`${uid}w`} seed={seed} scale={9} />
      <Wobble id={`${uid}s`} seed={seed + 3} scale={4} frequency={0.06} />
      {stem ? (
        <g>
          <DrawOn d={stemD} t={tStem} color={stemInk} width={6} filter={`url(#${uid}s)`} />
          {leaves.map((l, i) => {
            const o = ramp(start + len(frames * 0.22) + i * 6, frames * 0.32, ease.out);
            if (o <= 0) return null;
            const at = onStem(1 - l.at);
            const d = smooth(bladePoints(l.L, 40, `leaf-${seed}-${i}`, false), true);
            return (
              <g key={i} transform={`translate(${at.x} ${at.y}) rotate(${l.angle * (0.4 + 0.6 * o)}) scale(${o})`} filter={`url(#${uid}w)`}>
                <path d={d} style={{fill: alpha(p.leaf, 0.55)}} />
                <path d={d} transform="scale(0.72 0.86)" style={{fill: alpha(mix(p.leaf, p.sun, 0.3), 0.35)}} />
                <path d={d} style={{fill: 'none', stroke: alpha(stemInk, 0.45), strokeWidth: 2}} />
                <path d={`M0,-4 L0,${-l.L * 0.86}`} style={{fill: 'none', stroke: alpha(stemInk, 0.35), strokeWidth: 1.6}} />
              </g>
            );
          })}
        </g>
      ) : null}
      <g transform={`translate(${cx} ${cy})`} filter={`url(#${uid}w)`}>
        {shapes.map((s, i) => {
          const o = ramp(start + len(frames * 0.36) + i * 3, frames * 0.52, ease.out);
          if (o <= 0) return null;
          const tint = mix(petal, s.tone > 0.5 ? p.sun : p.deep, 0.06 + s.tone * 0.1);
          return (
            <g key={i} transform={`rotate(${s.angle * o}) scale(${0.45 + 0.55 * o} ${0.3 + 0.7 * o})`} opacity={Math.min(1, o * 2.4)}>
              <path d={s.d} style={{fill: alpha(tint, 0.5)}} />
              <path d={s.d} transform="scale(0.72 0.78)" style={{fill: alpha(mix(tint, p.deep, 0.12), 0.34)}} />
              <path d={s.d} style={{fill: 'none', stroke: alpha(mix(tint, p.deep, 0.35), 0.55), strokeWidth: 2.2}} />
              <path d={`M0,-8 Q4,${-s.L * 0.45} 0,${-s.L * 0.78}`} style={{fill: 'none', stroke: alpha(p.deep, 0.16), strokeWidth: 1.6}} />
            </g>
          );
        })}
        {stamens.map((m, i) => {
          const o = ramp(start + len(frames * 0.66) + i, 14, ease.out);
          return o <= 0 ? null : <circle key={i} cx={m.x} cy={m.y} r={m.r * o} style={{fill: m.dark ? alpha(p.deep, 0.8) : alpha(p.sun, 0.9)}} />;
        })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Stamps

type Motif = 'flower' | 'star' | 'leaf' | 'dot' | 'sprig';

/** One motif at (0, 0), `s` across, in ink `c` with details in `c2`. */
const motif = (kind: Motif, s: number, c: string, c2: string, paper: string): React.ReactNode => {
  if (kind === 'flower') {
    return (
      <g>
        {Array.from({length: 7}, (_, k) => (
          <g key={k} transform={`rotate(${(k * 360) / 7})`}>
            <ellipse cx={0} cy={-s * 0.27} rx={s * 0.13} ry={s * 0.23} style={{fill: c}} />
            <line x1={0} y1={-s * 0.12} x2={0} y2={-s * 0.4} style={{stroke: paper, strokeWidth: s * 0.022, strokeLinecap: 'round'}} />
          </g>
        ))}
        <circle r={s * 0.11} style={{fill: c2}} />
        <circle r={s * 0.045} style={{fill: paper}} />
      </g>
    );
  }
  if (kind === 'star') {
    const pts = Array.from({length: 10}, (_, k) => {
      const r = k % 2 ? s * 0.2 : s * 0.48;
      const a = (k * Math.PI) / 5 - Math.PI / 2;
      return `${n1(Math.cos(a) * r)},${n1(Math.sin(a) * r)}`;
    }).join(' ');
    return <polygon points={pts} style={{fill: c, stroke: c, strokeWidth: s * 0.04, strokeLinejoin: 'round'}} />;
  }
  if (kind === 'leaf') {
    const d = smooth(bladePoints(s * 0.9, s * 0.42, 'stamp-leaf', false), true);
    return (
      <g transform={`translate(0 ${s * 0.45})`}>
        <path d={d} style={{fill: c}} />
        <path d={`M0,-2 L0,${-s * 0.78}`} style={{stroke: paper, strokeWidth: s * 0.03, strokeLinecap: 'round'}} />
      </g>
    );
  }
  if (kind === 'dot') {
    return (
      <g>
        <circle r={s * 0.42} style={{fill: c}} />
        <circle r={s * 0.27} style={{fill: 'none', stroke: paper, strokeWidth: s * 0.035}} />
        <circle r={s * 0.1} style={{fill: c2}} />
      </g>
    );
  }
  return (
    <g>
      <path d={`M0,${s * 0.46} Q${s * 0.06},0 0,${-s * 0.46}`} style={{fill: 'none', stroke: c, strokeWidth: s * 0.05, strokeLinecap: 'round'}} />
      {[-0.22, 0.02, 0.24].map((y, k) => (
        <ellipse key={k} cx={(k % 2 ? 1 : -1) * s * 0.13} cy={y * s} rx={s * 0.15} ry={s * 0.07} transform={`rotate(${k % 2 ? -32 : 32} ${(k % 2 ? 1 : -1) * s * 0.13} ${y * s})`} style={{fill: c}} />
      ))}
    </g>
  );
};

/**
 * A field of stamped motifs scattered over a box, each landing with a thunk of ink, one after
 * another. The ink is speckled where the stamp didn't take. `motif`: flower, star, leaf, dot, sprig.
 *
 *   <Stamps width={700} height={500} motif="flower" start={6} />
 */
export const Stamps: React.FC<{
  width: number;
  height: number;
  count?: number;
  motif?: Motif;
  start?: number;
  stagger?: number;
  seed?: number;
  colors?: string[];
  palette?: Partial<Palette>;
}> = ({width, height, count = 18, motif: kind = 'flower', start = 0, stagger = 3, seed = 1, colors, palette}) => {
  const p = usePalette(palette);
  const {ramp, len} = useClock();
  const uid = useUid();
  const inks = colors ?? [mix(p.accent, p.sky, 0.35), mix(p.accent, p.deep, 0.35)];
  const stamps = useMemo(() => {
    const cols = Math.max(1, Math.round(Math.sqrt((count * width) / height)));
    const rows = Math.ceil(count / cols);
    const cw = width / cols;
    const ch = height / rows;
    const out: {x: number; y: number; s: number; rot: number; ink: number; order: number}[] = [];
    for (let i = 0; i < cols * rows && out.length < count; i++) {
      const r = (k: number) => random(`stamp-${seed}-${i}-${k}`);
      const col = i % cols;
      const row = Math.floor(i / cols);
      out.push({
        x: (col + 0.5 + (r(0) - 0.5) * 0.5 + (row % 2 ? 0.25 : -0.1)) * cw,
        y: (row + 0.5 + (r(1) - 0.5) * 0.5) * ch,
        s: Math.min(cw, ch) * (0.56 + r(2) * 0.22),
        rot: r(3) * 360,
        ink: Math.floor(r(4) * 2),
        order: r(5),
      });
    }
    return out.map((s) => ({...s, rank: out.filter((o) => o.order < s.order).length}));
  }, [width, height, count, seed]);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <filter id={`${uid}i`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency={0.7} numOctaves={1} seed={seed} result="t" />
        <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 1.75" result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" result="speckled" />
        <feTurbulence type="fractalNoise" baseFrequency={0.08} numOctaves={2} seed={seed + 1} result="w" />
        <feDisplacementMap in="speckled" in2="w" scale={3} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <g filter={`url(#${uid}i)`}>
        {stamps.map((s, i) => {
          const t = ramp(start + s.rank * len(stagger), 7, ease.out);
          if (t <= 0) return null;
          return (
            <g key={i} transform={`translate(${n1(s.x)} ${n1(s.y)}) rotate(${n1(s.rot)}) scale(${1.25 - 0.25 * t})`} opacity={Math.min(1, t * 1.4) * 0.92}>
              {motif(kind, s.s, inks[s.ink % inks.length], mix(inks[s.ink % inks.length], p.deep, 0.35), p.paper)}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// HexField

/**
 * A board of hexagons coloured by a heat field: pale cells at the edges, warming to deep ones
 * around a hot spot (`origin`, 0 to 1 of the box). The colour spreads out from the hot spot in a
 * wave from `start`. For a heat map, a spread, a "where it happens" moment.
 *
 *   <HexField width={700} height={520} origin={{x: 0.6, y: 0.55}} start={8} />
 */
export const HexField: React.FC<{
  width: number;
  height: number;
  radius?: number;
  origin?: Pt;
  start?: number;
  frames?: number;
  seed?: number;
  palette?: Partial<Palette>;
}> = ({width, height, radius = 30, origin = {x: 0.62, y: 0.55}, start = 0, frames = 60, seed = 1, palette}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const ramps = [mix(p.paper, '#ffffff', 0.4), mix(p.sun, '#fff8e6', 0.55), mix(p.sun, '#fff8e6', 0.15), mix(p.sun, p.warm, 0.5), p.warm, mix(p.warm, p.deep, 0.45), mix(p.deep, p.rose, 0.18), p.deep];
  const cells = useMemo(() => {
    const w = Math.sqrt(3) * radius;
    const h = 1.5 * radius;
    const ox = origin.x * width;
    const oy = origin.y * height;
    const far = Math.hypot(Math.max(ox, width - ox), Math.max(oy, height - oy));
    const out = [];
    for (let row = -1; row * h < height + radius; row++) {
      for (let col = -1; col * w < width + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0);
        const y = row * h;
        const dist = Math.hypot(x - ox, y - oy) / far;
        const heat = 0.62 * (1 - dist) ** 1.4 + 0.5 * (fbm(`hex-${seed}`, x * 0.006, y * 0.006) - 0.5) + 0.12;
        const bin = Math.max(0, Math.min(ramps.length - 1, Math.floor(heat * ramps.length * 1.25)));
        const pts = Array.from({length: 6}, (_, k) => {
          const a = (Math.PI / 3) * k - Math.PI / 6;
          return `${n1(x + Math.cos(a) * (radius - 1.5))},${n1(y + Math.sin(a) * (radius - 1.5))}`;
        }).join(' ');
        out.push({pts, dist, bin, x, y});
      }
    }
    return out;
    // ramps are derived from the palette; the geometry depends only on these.
  }, [width, height, radius, origin.x, origin.y, seed]);
  const wave = ramp(start, frames, ease.out) * 1.25;
  return (
    <svg width={width} height={height} style={{display: 'block'}}>
      {cells.map((c, i) => {
        const t = Math.max(0, Math.min(1, (wave - c.dist) / 0.18));
        if (t <= 0) return null;
        const fill = ramps[c.bin];
        return (
          <polygon
            key={i}
            points={c.pts}
            transform={`translate(${n1(c.x * (1 - (0.55 + 0.45 * t)))} ${n1(c.y * (1 - (0.55 + 0.45 * t)))}) scale(${0.55 + 0.45 * t})`}
            style={{fill, stroke: c.bin === 0 ? alpha(p.ink, 0.18) : alpha(mix(fill, p.deep, 0.35), 0.5), strokeWidth: 1.2, opacity: Math.min(1, t * 1.5)}}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Butterfly

const FOREWING = 'M6,-8 C30,-70 110,-128 168,-116 C186,-110 184,-84 170,-64 C150,-36 104,-10 8,2 Z';
const HINDWING = 'M8,6 C70,0 128,18 134,58 C138,92 110,124 74,122 C44,120 18,92 8,24 Z';
const FORE_VEINS = [
  [150, -106],
  [173, -84],
  [160, -58],
  [128, -30],
  [88, -12],
];
const HIND_VEINS = [
  [128, 48],
  [128, 82],
  [106, 112],
  [72, 118],
  [40, 98],
];
const FORE_DOTS = [
  [158, -110],
  [170, -101],
  [177, -88],
  [174, -74],
  [163, -60],
  [148, -45],
];
const HIND_DOTS = [
  [128, 34],
  [132, 54],
  [132, 74],
  [126, 92],
  [114, 108],
  [98, 118],
  [80, 121],
];

/**
 * A butterfly that flutters in along a short curve from `start` and hovers, wings beating every
 * `flap` frames: veined wings with a dark border of pale dots, in the warm colours of the palette.
 * For something lifting off, a transformation, a light touch on an end card.
 *
 *   <Butterfly size={300} start={6} />
 */
export const Butterfly: React.FC<{size?: number; start?: number; flap?: number; seed?: number; color?: string; arrive?: boolean; palette?: Partial<Palette>}> = ({
  size = 300,
  start = 0,
  flap = 24,
  seed = 1,
  color,
  arrive = true,
  palette,
}) => {
  const p = usePalette(palette);
  const {frame, glide} = useClock();
  const uid = useUid();
  const t = glide(start, 50);
  if (t <= 0) return <div style={{width: size, height: size * 0.82}} />;
  const wing = color ?? p.warm;
  const local = frame - start;
  const beat = (lag: number) => 0.38 + 0.62 * (0.5 + 0.5 * Math.cos(((local - lag) / flap) * Math.PI * 2));
  const fore = beat(0);
  const hind = beat(1.5);
  const bob = Math.sin((local / flap) * Math.PI) * 6;
  const fly = arrive ? 1 - t : 0;
  const tilt = -8 + (random(`bfl-${seed}`) - 0.5) * 6 - fly * 18;
  const ink = p.ink;
  const half = (side: 1 | -1) => (
    <g>
      <g transform={`scale(${side * hind} 1)`}>
        <path d={HINDWING} style={{fill: `url(#${uid}h)`, stroke: ink, strokeWidth: 9, strokeLinejoin: 'round'}} />
        {HIND_VEINS.map(([x, y], k) => (
          <path key={k} d={`M10,10 Q${n1(x * 0.5)},${n1(y * 0.42 + 10)} ${x},${y}`} style={{fill: 'none', stroke: ink, strokeWidth: 2.4, opacity: 0.85}} />
        ))}
        {HIND_DOTS.map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={k % 2 ? 2.4 : 3.2} style={{fill: p.paper}} />
        ))}
      </g>
      <g transform={`scale(${side * fore} 1)`}>
        <path d={FOREWING} style={{fill: `url(#${uid}f)`, stroke: ink, strokeWidth: 9, strokeLinejoin: 'round'}} />
        {FORE_VEINS.map(([x, y], k) => (
          <path key={k} d={`M10,-4 Q${n1(x * 0.52)},${n1(y * 0.36 - 6)} ${x},${y}`} style={{fill: 'none', stroke: ink, strokeWidth: 2.4, opacity: 0.85}} />
        ))}
        <path d="M14,-14 C50,-60 104,-98 150,-104" style={{fill: 'none', stroke: ink, strokeWidth: 3.2}} />
        {FORE_DOTS.map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r={k % 2 ? 2.6 : 3.4} style={{fill: p.paper}} />
        ))}
        <circle cx={150} cy={-86} r={6} style={{fill: alpha(p.paper, 0.85)}} />
        <circle cx={140} cy={-72} r={4} style={{fill: alpha(p.paper, 0.75)}} />
      </g>
    </g>
  );
  return (
    <svg width={size} height={size * 0.82} viewBox="-200 -170 400 330" style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <radialGradient id={`${uid}f`} cx="0.05" cy="0.6" r="1.05">
          <stop offset="0" style={{stopColor: mix(wing, p.sun, 0.55)}} />
          <stop offset="0.75" style={{stopColor: wing}} />
          <stop offset="1" style={{stopColor: mix(wing, p.deep, 0.25)}} />
        </radialGradient>
        <radialGradient id={`${uid}h`} cx="0.05" cy="0.1" r="1">
          <stop offset="0" style={{stopColor: mix(wing, p.sun, 0.5)}} />
          <stop offset="1" style={{stopColor: mix(wing, p.deep, 0.15)}} />
        </radialGradient>
        <Wobble id={`${uid}w`} seed={seed} scale={2.5} frequency={0.05} />
      </defs>
      <g opacity={Math.min(1, t * 2)} transform={`translate(${n1(-fly * 260)} ${n1(fly * 150 + bob)}) rotate(${n1(tilt)}) scale(${0.7 + 0.3 * t})`} filter={`url(#${uid}w)`}>
        {half(1)}
        {half(-1)}
        <ellipse cx={0} cy={10} rx={6} ry={36} style={{fill: ink}} />
        <circle cx={0} cy={-30} r={7.5} style={{fill: ink}} />
        <path d="M-3,-34 Q-14,-66 -28,-84" style={{fill: 'none', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round'}} />
        <path d="M3,-34 Q14,-66 28,-84" style={{fill: 'none', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round'}} />
        <circle cx={-28} cy={-85} r={3.4} style={{fill: ink}} />
        <circle cx={28} cy={-85} r={3.4} style={{fill: ink}} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Plant

type Branch = {d: string; t0: number; t1: number; width: number; depth: number; tip: Pt; tipAngle: number; leaves: {x: number; y: number; angle: number; t: number; size: number}[]; bloom: boolean};

const growPlant = (seed: number, W: number, H: number, depth: number): Branch[] => {
  const out: Branch[] = [];
  const L0 = H * 0.27;
  const rec = (x: number, y: number, angle: number, length: number, width: number, d: number, t0: number, id: string) => {
    const r = (k: number) => random(`plant-${seed}-${id}-${k}`);
    const bend = (r(0) - 0.5) * 0.55;
    const end = angle + bend;
    const ex = x + Math.cos(end) * length;
    const ey = y + Math.sin(end) * length;
    const cx = x + Math.cos(angle) * length * 0.55;
    const cy = y + Math.sin(angle) * length * 0.55;
    const t1 = t0 + (length / L0) * 0.25;
    const kids = d < depth ? (r(1) < 0.3 ? 3 : 2) : 0;
    const leaves = [];
    if (d >= 1) {
      const n = r(2) < 0.5 ? 1 : 2;
      for (let k = 0; k < n; k++) {
        const s = 0.45 + k * 0.3 + r(3 + k) * 0.1;
        // A point on the quadratic, and the side it sprouts to.
        const qx = (1 - s) ** 2 * x + 2 * s * (1 - s) * cx + s * s * ex;
        const qy = (1 - s) ** 2 * y + 2 * s * (1 - s) * cy + s * s * ey;
        const side = (k + d) % 2 ? 1 : -1;
        leaves.push({x: qx, y: qy, angle: ((end * 180) / Math.PI + 90 + side * (48 + r(6 + k) * 20)) % 360, t: t0 + (t1 - t0) * s, size: 0.55 + r(9 + k) * 0.35});
      }
    }
    out.push({d: `M${n1(x)},${n1(y)} Q${n1(cx)},${n1(cy)} ${n1(ex)},${n1(ey)}`, t0, t1, width, depth: d, tip: {x: ex, y: ey}, tipAngle: end, leaves, bloom: kids === 0 && r(12) < 0.55});
    for (let k = 0; k < kids; k++) {
      const spread = 0.38 + r(20 + k) * 0.22;
      const a = end + (k - (kids - 1) / 2) * spread * 1.4 + (r(30 + k) - 0.5) * 0.25;
      rec(ex, ey, a, length * (0.66 + r(40 + k) * 0.14), width * 0.66, d + 1, t1, `${id}${k}`);
    }
  };
  rec(W / 2, H - 6, -Math.PI / 2, L0, 7, 0, 0, 'r');
  const last = Math.max(...out.map((b) => b.t1));
  return out.map((b) => ({...b, t0: b.t0 / last, t1: b.t1 / last, leaves: b.leaves.map((l) => ({...l, t: l.t / last}))}));
};

/**
 * A plant growing from the bottom of its box: the stem draws up, branches fork off it, leaves
 * unfurl along them and some tips bloom. Each `seed` grows a different plant. For growth, for
 * something taking root, for a calm background on a card.
 *
 *   <Plant width={420} height={560} start={4} />
 */
export const Plant: React.FC<{
  width?: number;
  height?: number;
  start?: number;
  frames?: number;
  depth?: number;
  seed?: number;
  blooms?: boolean;
  palette?: Partial<Palette>;
}> = ({width = 420, height = 560, start = 0, frames = 100, depth = 4, seed = 2, blooms = true, palette}) => {
  const p = usePalette(palette);
  const {frame, len} = useClock();
  const uid = useUid();
  const branches = useMemo(() => growPlant(seed, width, height, depth), [seed, width, height, depth]);
  const T = len(frames);
  const now = (frame - start) / T;
  const stemInk = mix(p.leaf, p.ink, 0.38);
  const leafShape = useMemo(() => smooth(bladePoints(46, 20, `pl-${seed}`, false), true), [seed]);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <Wobble id={`${uid}w`} seed={seed} scale={5} frequency={0.05} />
      <g filter={`url(#${uid}w)`}>
        {branches.map((b, i) => {
          const t = Math.max(0, Math.min(1, (now - b.t0) / (b.t1 - b.t0)));
          return <DrawOn key={i} d={b.d} t={ease.out(t)} color={stemInk} width={Math.max(1.6, b.width)} />;
        })}
        {branches.flatMap((b, i) =>
          b.leaves.map((l, k) => {
            const o = Math.max(0, Math.min(1, (now - l.t) / 0.09));
            if (o <= 0) return null;
            const g = ease.out(o);
            const tone = (i + k) % 3 === 0 ? mix(p.leaf, p.sun, 0.3) : p.leaf;
            return (
              <g key={`${i}-${k}`} transform={`translate(${n1(l.x)} ${n1(l.y)}) rotate(${n1(l.angle)}) scale(${n1(l.size * g * 100) / 100})`}>
                <path d={leafShape} style={{fill: alpha(tone, 0.6)}} />
                <path d={leafShape} style={{fill: 'none', stroke: alpha(stemInk, 0.45), strokeWidth: 1.6}} />
                <path d="M0,-3 L0,-38" style={{stroke: alpha(stemInk, 0.4), strokeWidth: 1.2}} />
              </g>
            );
          }),
        )}
        {blooms
          ? branches.map((b, i) => {
              if (!b.bloom) return null;
              const o = Math.max(0, Math.min(1, (now - b.t1) / 0.12));
              if (o <= 0) return null;
              const g = ease.out(o);
              const c = i % 2 ? p.warm : mix(p.accent, p.sun, 0.35);
              return (
                <g key={`f${i}`} transform={`translate(${n1(b.tip.x)} ${n1(b.tip.y)}) scale(${g})`}>
                  {Array.from({length: 5}, (_, k) => (
                    <ellipse key={k} cx={0} cy={-7} rx={5.5} ry={8.5} transform={`rotate(${k * 72 + i * 11})`} style={{fill: alpha(c, 0.7)}} />
                  ))}
                  <circle r={3.4} style={{fill: p.deep}} />
                </g>
              );
            })
          : null}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Stitch

type Stitchline = {x1: number; y1: number; x2: number; y2: number; color: string; t: number};

/** Whether (x, y), in a box of -1 to 1, is inside the shape. */
const insideShape = (shape: 'circle' | 'heart' | 'leaf', x: number, y: number) => {
  if (shape === 'circle') return x * x + y * y <= 1;
  if (shape === 'heart') {
    const X = x * 1.2;
    const Y = -y * 1.2 + 0.25;
    return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0;
  }
  // A leaf: two arcs meeting at points, top and bottom.
  return Math.abs(x) <= 0.62 * Math.cos((Math.PI / 2) * y) * (1 - 0.15 * y) && Math.abs(y) <= 1;
};

/**
 * Embroidery: a shape filled with satin stitches that appear row by row as if being sewn, each
 * thread with a sheen, the colours shading across it. `shape="sun"` stitches out from the middle
 * in rings, with running-stitch rays; `circle`, `heart` and `leaf` are filled in slanted rows.
 *
 *   <Stitch size={380} shape="sun" start={6} />
 */
export const Stitch: React.FC<{
  size?: number;
  shape?: 'sun' | 'circle' | 'heart' | 'leaf';
  start?: number;
  frames?: number;
  seed?: number;
  colors?: string[];
  palette?: Partial<Palette>;
}> = ({size = 380, shape = 'sun', start = 0, frames = 80, seed = 1, colors, palette}) => {
  const p = usePalette(palette);
  const {frame, len} = useClock();
  const threads = colors ?? (shape === 'leaf' ? [mix(p.leaf, p.sun, 0.25), p.leaf, mix(p.leaf, p.deep, 0.3)] : [mix(p.sun, '#fff5d6', 0.35), p.sun, mix(p.sun, p.warm, 0.5), p.warm]);
  const R = size / 2;
  const sun = shape === 'sun';
  const body = sun ? R * 0.6 : R * 0.95;
  const stitches = useMemo(() => {
    const out: Stitchline[] = [];
    const jitter = (k: string) => (random(`stitch-${seed}-${k}`) - 0.5);
    if (sun) {
      // Rings of radial satin stitches, from the middle out, each sewn round in a sweep.
      const rings = threads.length;
      for (let k = 0; k < rings; k++) {
        const r0 = body * (0.06 + (k / rings) * 0.94);
        const r1 = body * (0.06 + ((k + 1) / rings) * 0.94);
        const n = Math.round((2 * Math.PI * ((r0 + r1) / 2)) / 5.2);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + jitter(`a${k}-${i}`) * 0.02;
          const twist = 0.07 + k * 0.02;
          out.push({
            x1: Math.cos(a) * r0,
            y1: Math.sin(a) * r0,
            x2: Math.cos(a + twist) * r1,
            y2: Math.sin(a + twist) * r1,
            color: threads[k],
            t: (k + i / n) / rings,
          });
        }
      }
    } else {
      // Slanted rows, top to bottom, of stitches between the shape's edges.
      const rows = Math.round(body / 7.5);
      const rowH = (2 * body) / rows;
      for (let row = 0; row < rows; row++) {
        const y0 = -body + row * rowH;
        for (let x = -body; x < body; x += 5) {
          const xa = x + jitter(`x${row}-${x}`) * 1.2;
          const xb = xa + rowH * 0.55;
          if (!insideShape(shape as 'circle', xa / body, y0 / body) || !insideShape(shape as 'circle', xb / body, (y0 + rowH) / body)) continue;
          const shade = Math.min(threads.length - 1, Math.floor(((row / rows) * 0.8 + (x / body + 1) * 0.12 + jitter(`c${row}-${x}`) * 0.2) * threads.length));
          out.push({x1: xa, y1: y0, x2: xb, y2: y0 + rowH * 1.05, color: threads[Math.max(0, shade)], t: row / rows});
        }
      }
    }
    return out;
    // threads come from the palette; the geometry depends on these.
  }, [shape, size, seed, threads.length]);
  const T = len(frames);
  const now = (frame - start) / (sun ? T * 0.72 : T);
  const rayT = (frame - start - T * 0.66) / (T * 0.34);
  const rays = 16;
  return (
    <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`} style={{overflow: 'visible', display: 'block'}}>
      {sun && rayT > 0
        ? Array.from({length: rays}, (_, i) => {
            const a = (i / rays) * Math.PI * 2;
            const r0 = body * 1.12;
            const r1 = R * (i % 2 ? 0.88 : 0.98);
            const t = Math.max(0, Math.min(1, rayT * 1.6 - (i / rays) * 0.6));
            const d = `M${n1(Math.cos(a) * r0)},${n1(Math.sin(a) * r0)} L${n1(Math.cos(a) * (r0 + (r1 - r0) * t))},${n1(Math.sin(a) * (r0 + (r1 - r0) * t))}`;
            return t <= 0 ? null : <path key={i} d={d} style={{stroke: threads[threads.length - 1], strokeWidth: 4, strokeLinecap: 'round', strokeDasharray: '11 8', fill: 'none'}} />;
          })
        : null}
      {stitches.map((s, i) =>
        s.t > now ? null : (
          <g key={i}>
            <line x1={n1(s.x1)} y1={n1(s.y1 + 1.2)} x2={n1(s.x2)} y2={n1(s.y2 + 1.2)} style={{stroke: 'rgba(40, 28, 20, 0.22)', strokeWidth: 3.6, strokeLinecap: 'round'}} />
            <line x1={n1(s.x1)} y1={n1(s.y1)} x2={n1(s.x2)} y2={n1(s.y2)} style={{stroke: s.color, strokeWidth: 3.4, strokeLinecap: 'round'}} />
            <line x1={n1(s.x1 + 0.6)} y1={n1(s.y1 - 0.6)} x2={n1(s.x2 + 0.6)} y2={n1(s.y2 - 0.6)} style={{stroke: 'rgba(255, 255, 255, 0.28)', strokeWidth: 1, strokeLinecap: 'round'}} />
          </g>
        ),
      )}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Watercolor

/**
 * A wash of watercolour behind content: a brushstroke painted left to right (`kind="stroke"`),
 * or a round pool bleeding out from the middle (`kind="pool"`), with ragged edges where the paint
 * pooled. Children sit on top, centred: a headline, a number, a logo.
 *
 *   <Watercolor width={760} height={170} start={4}><h1>Drawn with code.</h1></Watercolor>
 */
export const Watercolor: React.FC<{
  width: number;
  height: number;
  kind?: 'stroke' | 'pool';
  color?: string;
  start?: number;
  frames?: number;
  seed?: number;
  palette?: Partial<Palette>;
  children?: React.ReactNode;
}> = ({width, height, kind = 'stroke', color, start = 0, frames = 28, seed = 1, palette, children}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const uid = useUid();
  const paint = color ?? mix(p.accent, p.sun, 0.2);
  const shape = useMemo(() => {
    if (kind === 'pool') {
      const pts = Array.from({length: 14}, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        const r = 0.42 + (noise(`pool-${seed}`, k * 0.9) - 0.5) * 0.16;
        return {x: width / 2 + Math.cos(a) * r * width, y: height / 2 + Math.sin(a) * r * height};
      });
      return smooth(pts, true);
    }
    const N = 12;
    const top: Pt[] = [];
    const bottom: Pt[] = [];
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const taper = Math.min(1, s / 0.08, (1 - s) / 0.1) ** 0.7;
      const mid = height / 2 + (noise(`wm-${seed}`, s * 3) - 0.5) * height * 0.14;
      const half = height * 0.36 * (0.35 + 0.65 * taper) * (0.85 + noise(`wh-${seed}`, s * 5) * 0.3);
      top.push({x: s * width, y: mid - half});
      bottom.push({x: s * width, y: mid + half * (0.9 + noise(`wb-${seed}`, s * 4) * 0.2)});
    }
    return smooth([...top, ...bottom.reverse()], true);
  }, [kind, width, height, seed]);
  const t = ramp(start, frames, ease.out);
  const reveal =
    kind === 'pool' ? (
      <circle cx={width / 2} cy={height / 2} r={t * Math.hypot(width, height) * 0.6} style={{fill: '#fff'}} />
    ) : (
      <rect x={-20} y={-20} width={(width + 60) * t} height={height + 40} style={{fill: '#fff'}} />
    );
  return (
    <div style={{position: 'relative', width, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Wobble id={`${uid}w`} seed={seed} scale={16} frequency={0.03} />
          <Wobble id={`${uid}m`} seed={seed + 4} scale={30} frequency={0.05} />
          <mask id={`${uid}k`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={width + 120} height={height + 120}>
            <g filter={`url(#${uid}m)`}>{reveal}</g>
          </mask>
        </defs>
        {t > 0 ? (
          <g mask={`url(#${uid}k)`} filter={`url(#${uid}w)`}>
            <path d={shape} style={{fill: alpha(paint, 0.42)}} />
            <path d={shape} transform={`translate(${width * 0.03} ${height * 0.06}) scale(0.94)`} style={{fill: alpha(paint, 0.24)}} />
            <path d={shape} style={{fill: 'none', stroke: alpha(mix(paint, p.deep, 0.2), 0.42), strokeWidth: 3}} />
          </g>
        ) : null}
      </svg>
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Doodles

export type DoodleKind = 'underline' | 'circle' | 'squiggle' | 'arrow' | 'loop' | 'spiral' | 'star' | 'sparkle' | 'heart' | 'burst' | 'check';

/** A doodle's strokes in a unit box, before wobble: each a list of points. */
const doodleStrokes = (kind: DoodleKind): Pt[][] => {
  const range = (n: number, f: (s: number) => Pt) => Array.from({length: n + 1}, (_, k) => f(k / n));
  switch (kind) {
    case 'underline':
      return [range(14, (s) => ({x: 0.02 + s * 0.94, y: 0.62 - Math.sin(s * Math.PI) * 0.12 + (s > 0.9 ? (s - 0.9) * -2.4 : 0)}))];
    case 'circle':
      return [range(40, (s) => ({x: 0.5 + Math.cos(-2 + s * Math.PI * 2.15) * (0.46 - s * 0.03), y: 0.5 + Math.sin(-2 + s * Math.PI * 2.15) * (0.38 + s * 0.04)}))];
    case 'squiggle':
      return [range(48, (s) => ({x: 0.03 + s * 0.94, y: 0.5 + Math.sin(s * Math.PI * 6) * 0.22 * (0.6 + s * 0.5)}))];
    case 'arrow':
      return [
        range(20, (s) => ({x: 0.06 + s * 0.84, y: 0.86 - s * 0.62 - Math.sin(s * Math.PI) * 0.2})),
        [
          {x: 0.77, y: 0.12},
          {x: 0.9, y: 0.24},
          {x: 0.76, y: 0.33},
        ],
      ];
    case 'loop':
      return [range(70, (s) => ({x: 0.06 + s * 0.88 + Math.cos(s * Math.PI * 8) * -0.06, y: 0.55 + Math.sin(s * Math.PI * 8) * 0.24}))];
    case 'spiral':
      return [range(80, (s) => ({x: 0.5 + Math.cos(s * Math.PI * 6) * s * 0.46, y: 0.5 + Math.sin(s * Math.PI * 6) * s * 0.46}))];
    case 'star':
      return [
        range(10, (s) => {
          const k = Math.round(s * 10);
          // Every other point of a pentagon: the five-pointed star you draw without lifting the pen.
          const a = (k * 4 * Math.PI) / 5 - Math.PI / 2;
          return {x: 0.5 + Math.cos(a) * 0.48, y: 0.55 + Math.sin(a) * 0.48};
        }),
      ];
    case 'sparkle':
      return [
        range(32, (s) => {
          // An astroid: four points joined by curves bowing inwards.
          const a = s * Math.PI * 2;
          return {x: 0.5 + 0.48 * Math.cos(a) ** 3, y: 0.5 + 0.48 * Math.sin(a) ** 3};
        }),
      ];
    case 'heart':
      return [
        range(40, (s) => {
          const a = Math.PI + s * Math.PI * 2;
          return {x: 0.5 + 0.028 * 16 * Math.sin(a) ** 3, y: 0.46 - 0.028 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))};
        }),
      ];
    case 'burst':
      return Array.from({length: 9}, (_, k) => {
        const a = (k / 9) * Math.PI * 2 - Math.PI / 2;
        return [
          {x: 0.5 + Math.cos(a) * 0.2, y: 0.5 + Math.sin(a) * 0.2},
          {x: 0.5 + Math.cos(a) * (k % 2 ? 0.36 : 0.47), y: 0.5 + Math.sin(a) * (k % 2 ? 0.36 : 0.47)},
        ];
      });
    case 'check':
      return [
        [
          {x: 0.08, y: 0.52},
          {x: 0.36, y: 0.82},
          {x: 0.92, y: 0.14},
        ],
      ];
  }
};

/**
 * A hand-drawn mark in a wobbly line, drawn on from `start` like a pen stroke, with a fainter
 * second pass beside it. `kind`: underline, circle, squiggle, arrow, loop, spiral, star, sparkle,
 * heart, burst, check. For pointing, emphasis and a little play around a headline.
 *
 *   <Doodles kind="circle" width={300} height={140} start={20} />
 */
export const Doodles: React.FC<{
  kind: DoodleKind;
  width?: number;
  height?: number;
  start?: number;
  frames?: number;
  color?: string;
  strokeWidth?: number;
  seed?: number;
  palette?: Partial<Palette>;
}> = ({kind, width = 200, height = 200, start = 0, frames = 24, color, strokeWidth = 5, seed = 1, palette}) => {
  const p = usePalette(palette);
  const ink = useInk(p);
  const {ramp} = useClock();
  const c = color ?? ink;
  const paths = useMemo(() => {
    // Corners stay corners on these; the rest are smoothed through their points.
    const sharp = kind === 'star' || kind === 'check' || kind === 'burst' || kind === 'sparkle' || kind === 'arrow';
    const line = (pts: Pt[]) => (sharp ? pts.map((q, k) => `${k ? 'L' : 'M'}${n1(q.x)},${n1(q.y)}`).join(' ') : smooth(pts));
    const wob = (pass: number) =>
      doodleStrokes(kind).map((stroke, si) =>
        line(
          stroke.map((pt, k) => ({
            x: pt.x * width + (noise(`dx-${seed}-${pass}-${si}`, k * 0.7) - 0.5) * Math.min(width, height) * 0.035,
            y: pt.y * height + (noise(`dy-${seed}-${pass}-${si}`, k * 0.7) - 0.5) * Math.min(width, height) * 0.035,
          })),
        ),
      );
    return {main: wob(0), ghost: wob(1)};
  }, [kind, width, height, seed]);
  const n = paths.main.length;
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      {paths.main.map((d, i) => {
        // Strokes follow one another; a burst's rays share the time.
        const slot = n === 1 ? [0, 1] : kind === 'arrow' ? (i === 0 ? [0, 0.72] : [0.72, 1]) : [(i / n) * 0.6, (i / n) * 0.6 + 0.4];
        const t = ramp(start + frames * slot[0], Math.max(4, frames * (slot[1] - slot[0])), ease.inOut);
        return (
          <g key={i}>
            <DrawOn d={paths.ghost[i]} t={t} color={c} width={strokeWidth * 0.55} opacity={0.35} />
            <DrawOn d={d} t={t} color={c} width={strokeWidth} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Constellation

/**
 * Stars appearing one by one across a box and joining up with fine lines, nearest first, into a
 * constellation. For connections, a network, a team, an idea forming.
 *
 *   <Constellation width={800} height={460} count={14} start={4} />
 */
export const Constellation: React.FC<{
  width: number;
  height: number;
  count?: number;
  start?: number;
  stagger?: number;
  seed?: number;
  color?: string;
  palette?: Partial<Palette>;
}> = ({width, height, count = 14, start = 0, stagger = 5, seed = 1, color, palette}) => {
  const p = usePalette(palette);
  const ink = useInk(p);
  const {ramp, len} = useClock();
  const c = color ?? ink;
  const {stars, links} = useMemo(() => {
    // Best-candidate sampling: each star is the farthest of a few tries from the ones before.
    const pts: Pt[] = [];
    for (let i = 0; i < count; i++) {
      let best: Pt = {x: 0, y: 0};
      let bestD = -1;
      for (let k = 0; k < 12; k++) {
        const cand = {x: (0.06 + random(`cx-${seed}-${i}-${k}`) * 0.88) * width, y: (0.08 + random(`cy-${seed}-${i}-${k}`) * 0.84) * height};
        const d = pts.length ? Math.min(...pts.map((q) => Math.hypot(q.x - cand.x, q.y - cand.y))) : 1;
        if (d > bestD) {
          bestD = d;
          best = cand;
        }
      }
      pts.push(best);
    }
    // Visit them nearest-first from the leftmost: the order they appear and join.
    const order = [pts.reduce((a, b, i) => (b.x < pts[a].x ? i : a), 0)];
    while (order.length < pts.length) {
      const last = pts[order[order.length - 1]];
      let next = -1;
      let nd = Infinity;
      pts.forEach((q, i) => {
        if (order.includes(i)) return;
        const d = Math.hypot(q.x - last.x, q.y - last.y);
        if (d < nd) {
          nd = d;
          next = i;
        }
      });
      order.push(next);
    }
    const s = order.map((i) => pts[i]);
    const l: [number, number][] = s.slice(1).map((_, i) => [i, i + 1]);
    // A few cross links, to make it a figure rather than a line.
    for (let i = 3; i < s.length; i += 3) l.push([i, i - 3]);
    return {stars: s, links: l};
  }, [width, height, count, seed]);
  const at = (i: number) => start + i * len(stagger);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      {links.map(([a, b], i) => {
        const t = ramp(at(b) - 2, stagger * 1.6, ease.out);
        return <DrawOn key={i} d={`M${n1(stars[a].x)},${n1(stars[a].y)} L${n1(stars[b].x)},${n1(stars[b].y)}`} t={t} color={c} width={1.6} opacity={0.55} />;
      })}
      {stars.map((s, i) => {
        const t = ramp(at(i), 10, ease.out);
        if (t <= 0) return null;
        const big = i % 4 === 0;
        return (
          <g key={i} transform={`translate(${n1(s.x)} ${n1(s.y)})`}>
            <circle r={(big ? 18 : 12) * t} style={{fill: alpha(p.accent, 0.18 * (1.4 - t))}} />
            <circle r={(big ? 6 : 4.2) * Math.min(1, t * 1.4)} style={{fill: c}} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Contours

/** Contour lines of a field at `level`, joined into polylines (marching squares). */
const isolines = (grid: number[][], step: number, level: number): Pt[][] => {
  const segs: [Pt, Pt][] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const lerp = (a: number, b: number) => (level - a) / (b - a);
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = grid[j][i];
      const b = grid[j][i + 1];
      const c = grid[j + 1][i + 1];
      const d = grid[j + 1][i];
      const x = i * step;
      const y = j * step;
      const top = {x: x + lerp(a, b) * step, y};
      const right = {x: x + step, y: y + lerp(b, c) * step};
      const bottom = {x: x + lerp(d, c) * step, y: y + step};
      const left = {x, y: y + lerp(a, d) * step};
      const code = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      const pairs: Record<number, [Pt, Pt][]> = {
        1: [[left, bottom]],
        2: [[bottom, right]],
        3: [[left, right]],
        4: [[top, right]],
        5: [
          [left, top],
          [bottom, right],
        ],
        6: [[top, bottom]],
        7: [[left, top]],
        8: [[left, top]],
        9: [[top, bottom]],
        10: [
          [left, bottom],
          [top, right],
        ],
        11: [[top, right]],
        12: [[left, right]],
        13: [[bottom, right]],
        14: [[left, bottom]],
      };
      for (const s of pairs[code] ?? []) segs.push(s);
    }
  }
  // Join segments that share an end into polylines.
  const key = (q: Pt) => `${Math.round(q.x * 10)},${Math.round(q.y * 10)}`;
  const ends = new Map<string, number[]>();
  segs.forEach(([a, b], i) => {
    for (const q of [a, b]) ends.set(key(q), [...(ends.get(key(q)) ?? []), i]);
  });
  const used = new Set<number>();
  const lines: Pt[][] = [];
  for (let i = 0; i < segs.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, -1]) {
      for (;;) {
        const tip = dir === 1 ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) ?? []).find((k) => !used.has(k));
        if (next === undefined) break;
        used.add(next);
        const [a, b] = segs[next];
        const far = key(a) === key(tip) ? b : a;
        if (dir === 1) line.push(far);
        else line.unshift(far);
      }
    }
    if (line.length > 3) lines.push(line);
  }
  return lines;
};

/**
 * Topographic contour lines of a made-up landscape, drawing on level by level from the lowest,
 * every fourth one heavier. For terrain, depth, a calm technical texture behind a stat.
 *
 *   <Contours width={800} height={520} levels={10} start={4} />
 */
export const Contours: React.FC<{
  width: number;
  height: number;
  levels?: number;
  start?: number;
  frames?: number;
  seed?: number;
  color?: string;
  palette?: Partial<Palette>;
}> = ({width, height, levels = 10, start = 0, frames = 70, seed = 1, color, palette}) => {
  const p = usePalette(palette);
  const ink = useInk(p);
  const {ramp, len} = useClock();
  const lines = useMemo(() => {
    const step = 12;
    const cols = Math.ceil(width / step) + 1;
    const rows = Math.ceil(height / step) + 1;
    const peak = {x: (0.35 + random(`cpx-${seed}`) * 0.3) * width, y: (0.35 + random(`cpy-${seed}`) * 0.3) * height};
    const grid = Array.from({length: rows}, (_, j) =>
      Array.from({length: cols}, (_, i) => {
        const x = i * step;
        const y = j * step;
        const hill = Math.exp(-((x - peak.x) ** 2 + (y - peak.y) ** 2) / (2 * (Math.min(width, height) * 0.32) ** 2));
        return 0.55 * hill + 0.45 * fbm(`contour-${seed}`, x * 0.007, y * 0.007, 3);
      }),
    );
    const flat = grid.flat();
    const lo = Math.min(...flat);
    const hi = Math.max(...flat);
    return Array.from({length: levels}, (_, k) => ({k, paths: isolines(grid, step, lo + ((k + 0.6) / (levels + 0.4)) * (hi - lo)).map((l) => smooth(l))}));
  }, [width, height, levels, seed]);
  const each = frames / (levels + 3);
  return (
    <svg width={width} height={height} style={{display: 'block'}}>
      {lines.map(({k, paths}) => {
        const t = ramp(start + len(k * each), each * 4, ease.inOut);
        const heavy = k % 4 === 3;
        const c = color ?? mix(ink, p.warm, 0.25 + (k / levels) * 0.35);
        return paths.map((d, i) => <DrawOn key={`${k}-${i}`} d={d} t={t} color={c} width={heavy ? 2.6 : 1.3} opacity={heavy ? 0.85 : 0.6} />);
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Ripple

/**
 * Drops of ink landing one after another and rippling out in wobbly rings, each leaving its blot.
 * For rain on paper, a signal going out, notifications landing.
 *
 *   <Ripple width={700} height={460} drops={6} start={4} />
 */
export const Ripple: React.FC<{width: number; height: number; drops?: number; start?: number; every?: number; seed?: number; color?: string; palette?: Partial<Palette>}> = ({
  width,
  height,
  drops = 6,
  start = 0,
  every = 9,
  seed = 1,
  color,
  palette,
}) => {
  const p = usePalette(palette);
  const ink = useInk(p);
  const {ramp, len} = useClock();
  const uid = useUid();
  const c = color ?? mix(ink, p.sky, 0.55);
  const spots = useMemo(
    () =>
      Array.from({length: drops}, (_, i) => ({
        x: (0.14 + random(`rx-${seed}-${i}`) * 0.72) * width,
        y: (0.16 + random(`ry-${seed}-${i}`) * 0.68) * height,
        r: Math.min(width, height) * (0.16 + random(`rr-${seed}-${i}`) * 0.12),
      })),
    [drops, width, height, seed],
  );
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <Wobble id={`${uid}w`} seed={seed} scale={5} frequency={0.06} />
      <g filter={`url(#${uid}w)`}>
        {spots.map((s, i) => {
          const at = start + i * len(every) + Math.round(random(`rj-${seed}-${i}`) * 4);
          const blot = ramp(at, 6, ease.out);
          if (blot <= 0) return null;
          return (
            <g key={i}>
              {[0, 1, 2].map((k) => {
                const t = ramp(at + k * 5, 42, ease.out);
                return t <= 0 || t >= 1 ? null : (
                  <circle key={k} cx={s.x} cy={s.y} r={s.r * t * (1 - k * 0.2)} style={{fill: 'none', stroke: c, strokeWidth: 4.5 * (1 - t) + 1, opacity: Math.min(1, (1 - t) * 1.3)}} />
                );
              })}
              <circle cx={s.x} cy={s.y} r={(6 + (i % 3) * 3) * blot} style={{fill: c}} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Scribble

/**
 * A marker scribbling back and forth until a shape is filled, in one continuous stroke drawn on
 * from `start`. Behind a word, a number or a price, it says "this one".
 *
 *   <Scribble width={320} height={140} start={10} />
 */
export const Scribble: React.FC<{
  width: number;
  height: number;
  shape?: 'blob' | 'circle';
  density?: number;
  start?: number;
  frames?: number;
  color?: string;
  strokeWidth?: number;
  seed?: number;
  palette?: Partial<Palette>;
}> = ({width, height, shape = 'blob', density = 11, start = 0, frames = 30, color, strokeWidth = 14, seed = 1, palette}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const c = color ?? alpha(p.sun, 0.7);
  const d = useMemo(() => {
    // Zig-zag across slanted lines, each turn landing on the shape's edge.
    const pts: Pt[] = [];
    const slant = 0.35;
    for (let k = 0; k <= density; k++) {
      const s = k / density;
      const y = 0.08 + s * 0.84;
      const span = shape === 'circle' ? Math.sqrt(Math.max(0, 1 - (2 * y - 1) ** 2)) * 0.48 : 0.46 * (0.75 + 0.25 * Math.sin(s * Math.PI)) * (0.85 + noise(`sb-${seed}`, k * 0.8) * 0.3);
      const left = {x: 0.5 - span, y: y + slant * 0.12};
      const right = {x: 0.5 + span, y: y - slant * 0.12};
      const [a, b] = k % 2 ? [right, left] : [left, right];
      pts.push(a, b);
    }
    return smooth(pts.map((q, k) => ({x: q.x * width + (random(`sj-${seed}-${k}`) - 0.5) * 8, y: q.y * height + (random(`sk-${seed}-${k}`) - 0.5) * 6})));
  }, [width, height, shape, density, seed]);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <DrawOn d={d} t={ramp(start, frames, ease.inOut)} color={c} width={strokeWidth} />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** The area a sample can use: the safe area, above the gallery's label. */
const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = Math.max(look.safe.bottom, 190);
  return {look, x: look.safe.left, y: top, w: look.width - look.safe.left - look.safe.right, h: look.height - top - bottom};
};

/** Centres its child in the sample area. */
const InArea: React.FC<{children: React.ReactNode}> = ({children}) => {
  const a = useArea();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </AbsoluteFill>
  );
};

/** A paper card filling most of the area at `aspect` (width / height), with the drawing's size. */
const CardSample: React.FC<{aspect: number; rotate?: number; children: (w: number, h: number) => React.ReactNode}> = ({aspect, rotate = -1.5, children}) => {
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

const PaperDemo: React.FC = () => {
  const a = useArea();
  // Three cards, overlapping more where the frame is narrow.
  const overlap = a.look.tall ? 0.2 : 0.08;
  const w = Math.min(a.w / (3 - 2 * overlap), a.w * 0.3 + (a.look.tall ? a.w : 0), 470);
  const h = Math.min(w * 1.3, a.h * 0.92);
  const gap = -w * overlap;
  return (
    <InArea>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={-6} start={0} style={{marginRight: gap, zIndex: 1}}>
          <Stamps width={w * 0.84} height={h * 0.86} count={14} start={14} stagger={2} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={2} start={6} style={{zIndex: 2, marginTop: -h * 0.06}} seed={3}>
          <Flower size={w * 0.62} start={18} frames={60} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={7} start={12} style={{marginLeft: gap, zIndex: 1}} seed={5}>
          <HexField width={w * 0.86} height={h * 0.86} radius={w / 17} start={22} frames={40} />
        </Paper>
      </div>
    </InArea>
  );
};

const WatercolorDemo: React.FC = () => {
  const a = useArea();
  const look = a.look;
  const w = Math.min(a.w * 0.95, 1180);
  return (
    <InArea>
      <Watercolor width={Math.round(w)} height={Math.round(look.size * (look.tall ? 4 : 3))} start={4} frames={30}>
        <div style={{...look.headline, fontSize: Math.round(look.size * 1.2), textAlign: 'center', padding: '0 0.4em', color: look.dark ? '#f6f1e5' : look.ink}}>
          {/* The accent phrase keeps its weight or slant but not its colour, which is the wash's. */}
          Drawn <span style={{...look.emphasis, color: 'inherit', textShadow: 'none'}}>with code.</span>
        </div>
      </Watercolor>
    </InArea>
  );
};

const DOODLES: DoodleKind[] = ['circle', 'underline', 'arrow', 'star', 'sparkle', 'heart', 'squiggle', 'spiral', 'burst'];

const DoodlesDemo: React.FC = () => (
  <CardSample aspect={1.2}>
    {(w) => {
      const cell = (w * 0.8) / 3;
      return (
        <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${cell}px)`, gap: cell * 0.04}}>
          {DOODLES.map((k, i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: cell * 0.78}}>
              <Doodles kind={k} width={cell * 0.62} height={cell * 0.56} start={6 + i * 7} frames={20} seed={i + 1} strokeWidth={Math.max(3, cell / 48)} />
            </div>
          ))}
        </div>
      );
    }}
  </CardSample>
);

const ScribbleDemo: React.FC = () => {
  const {look} = useArea();
  const size = Math.round(look.size * 1.3);
  return (
    <InArea>
      <div style={{...look.headline, fontSize: size, display: 'flex', justifyContent: 'center', alignItems: 'center', columnGap: '0.26em'}}>
        <span>Pick</span>
        <span style={{position: 'relative', display: 'inline-flex', justifyContent: 'center', width: size * 1.75}}>
          <span style={{position: 'absolute', left: -size * 0.2, top: -size * 0.1}}>
            <Scribble width={size * 2.15} height={size * 1.25} start={10} frames={26} />
          </span>
          <span style={{position: 'relative'}}>this</span>
        </span>
        <span>one.</span>
      </div>
    </InArea>
  );
};

const ConstellationDemo: React.FC = () => {
  const a = useArea();
  return (
    <InArea>
      <Constellation width={Math.round(Math.min(a.w * 0.9, 1100))} height={Math.round(Math.min(a.h * 0.85, a.look.tall ? 800 : 560))} count={16} start={4} stagger={4} />
    </InArea>
  );
};

export const demos: Demo[] = [
  {name: 'Paper cards', code: '<Paper width={420} height={540} rotate={-6}>{drawing}</Paper>', seconds: 3.5, hero: 96, Component: PaperDemo},
  {
    name: 'Watercolour flower',
    code: '<Flower size={320} petals={6} start={6} />',
    seconds: 3.5,
    hero: 100,
    Component: () => <CardSample aspect={0.8}>{(w, h) => <Flower size={Math.min(w * 0.62, (h * 0.86) / 1.5)} start={6} frames={80} />}</CardSample>,
  },
  {
    name: 'Stamps',
    code: '<Stamps width={700} height={500} motif="flower" />',
    seconds: 3,
    hero: 85,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Stamps width={w * 0.86} height={h * 0.84} count={20} start={6} />}</CardSample>,
  },
  {
    name: 'Hex field',
    code: '<HexField width={700} height={520} origin={{x: 0.6, y: 0.55}} />',
    seconds: 3,
    hero: 80,
    Component: () => <CardSample aspect={1.25}>{(w, h) => <HexField width={w * 0.88} height={h * 0.86} radius={w / 26} start={6} />}</CardSample>,
  },
  {
    name: 'Butterfly',
    code: '<Butterfly size={300} start={6} />',
    seconds: 3,
    hero: 78,
    Component: () => <CardSample aspect={1.15}>{(w) => <Butterfly size={w * 0.72} start={6} />}</CardSample>,
  },
  {
    name: 'Growing plant',
    code: '<Plant width={420} height={560} seed={2} />',
    seconds: 4,
    hero: 115,
    Component: () => <CardSample aspect={0.8}>{(w, h) => <Plant width={w * 0.84} height={h * 0.86} start={4} frames={100} />}</CardSample>,
  },
  {
    name: 'Embroidery',
    code: '<Stitch size={380} shape="sun" />',
    seconds: 3.5,
    hero: 100,
    Component: () => <CardSample aspect={1}>{(w) => <Stitch size={w * 0.72} start={4} frames={84} />}</CardSample>,
  },
  {
    name: 'Stitched heart',
    code: '<Stitch size={340} shape="heart" />',
    seconds: 3,
    hero: 85,
    Component: () => <CardSample aspect={1}>{(w) => <Stitch size={w * 0.62} shape="heart" start={4} frames={70} palette={{sun: '#e88a7a', warm: '#c4473f'}} />}</CardSample>,
  },
  {name: 'Watercolour wash', code: '<Watercolor width={760} height={170}>{headline}</Watercolor>', seconds: 2.5, hero: 50, Component: WatercolorDemo},
  {name: 'Doodles', code: '<Doodles kind="circle" width={300} height={140} />', seconds: 3.5, hero: 100, Component: DoodlesDemo},
  {name: 'Constellation', code: '<Constellation width={800} height={460} count={16} />', seconds: 3, hero: 85, Component: ConstellationDemo},
  {
    name: 'Contour lines',
    code: '<Contours width={800} height={520} levels={10} />',
    seconds: 3.5,
    hero: 95,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Contours width={Math.round(w * 0.9)} height={Math.round(h * 0.88)} start={4} frames={70} />}</CardSample>,
  },
  {
    name: 'Ink ripples',
    code: '<Ripple width={700} height={460} drops={6} />',
    seconds: 3,
    hero: 66,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Ripple width={w * 0.86} height={h * 0.84} drops={7} start={4} />}</CardSample>,
  },
  {name: 'Scribble', code: '<Scribble width={320} height={140} />', seconds: 2.5, hero: 60, Component: ScribbleDemo},
];

import React, {useId} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Caveat';
import {useLook} from '../../look';

// Juniper & Rye's drawings, made the same way as fx/drawings.tsx: ink lines that draw themselves
// on with a slight wobble, and watercolour fills that bleed in after them. A loaf, a bun, a rye
// batard, a cup with steam, and a street map with a pin.

export const {fontFamily: hand} = loadFont('normal', {weights: ['500', '700'], subsets: ['latin']});

export const INK = '#2e2a24';
export const CRUST = '#c9853f';
export const CRUST_DARK = '#9c5a2a';
export const CRUMB = '#f3dcaa';
export const RYE = '#8d5f3b';
export const BERRY = '#4c5c8e';
export const LEAF = '#5f8a5c';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const uid = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '');

type Fill = {d: string; color: string; opacity?: number};
type Line = {d: string; color?: string; width?: number};

/**
 * A drawing in a `w` x `h` box drawn `size` px wide: its lines draw on one after another from
 * `start`, then its fills bleed in from the middle with watercolour edges.
 */
export const Sketch: React.FC<{w: number; h: number; size: number; start?: number; frames?: number; seed?: number; fills?: Fill[]; lines?: Line[]; children?: React.ReactNode}> = ({
  w,
  h,
  size,
  start = 0,
  frames = 36,
  seed = 1,
  fills = [],
  lines = [],
  children,
}) => {
  const frame = useCurrentFrame();
  const {pace} = useLook();
  const id = uid(useId());
  const len = frames * pace;
  const paint = interpolate(frame, [start + len * 0.3, start + len], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
  const each = (len * 0.7) / Math.max(1, lines.length);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={size} height={(size * h) / w} style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <filter id={`${id}p`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={0.035} numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}l`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={0.05} numOctaves={1} seed={seed + 3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-w * 0.2} y={-h * 0.2} width={w * 1.4} height={h * 1.4}>
          <circle cx={w / 2} cy={h * 0.55} r={paint * Math.hypot(w, h) * 0.62} fill="#fff" filter={`url(#${id}p)`} />
        </mask>
      </defs>
      {paint > 0 ? (
        <g mask={`url(#${id}m)`} filter={`url(#${id}p)`}>
          {fills.map((f, i) => (
            <path key={i} d={f.d} fill={f.color} opacity={f.opacity ?? 0.85} />
          ))}
        </g>
      ) : null}
      <g filter={`url(#${id}l)`}>
        {lines.map((l, i) => {
          const t = interpolate(frame, [start + i * each, start + (i + 1) * each + 4], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 2});
          return t <= 0.002 ? null : (
            <path
              key={i}
              d={l.d}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - t}
              fill="none"
              stroke={l.color ?? INK}
              strokeWidth={l.width ?? 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
      {children}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// The bakes

const BOULE = 'M 22 112 C 18 56, 66 22, 112 22 C 160 22, 204 56, 200 112 C 198 128, 176 134, 112 134 C 46 134, 24 128, 22 112 Z';

/** A round sourdough loaf with its scores. */
export const Loaf: React.FC<{size: number; start?: number; seed?: number}> = ({size, start, seed = 2}) => (
  <Sketch
    w={222}
    h={150}
    size={size}
    start={start}
    seed={seed}
    fills={[
      {d: BOULE, color: CRUST},
      {d: 'M 36 98 C 40 58, 80 34, 112 34 C 146 34, 182 58, 188 98 C 150 82, 74 82, 36 98 Z', color: CRUST_DARK, opacity: 0.5},
      {d: 'M 30 124 C 60 132, 160 132, 194 122 C 190 136, 40 138, 30 124 Z', color: '#7a4a24', opacity: 0.35},
    ]}
    lines={[
      {d: BOULE},
      {d: 'M 70 62 C 86 50, 102 48, 116 52', color: CRUMB, width: 7},
      {d: 'M 96 84 C 116 70, 136 68, 154 74', color: CRUMB, width: 7},
      {d: 'M 58 100 C 80 90, 102 88, 122 92', color: CRUMB, width: 7},
    ]}
  />
);

const KNOT = 'M 100 22 C 150 20, 180 56, 176 96 C 172 134, 132 148, 96 146 C 56 143, 26 116, 28 80 C 31 44, 60 23, 100 22 Z';

/** A cardamom bun: a knot, glazed and sugared. */
export const Bun: React.FC<{size: number; start?: number; seed?: number}> = ({size, start, seed = 5}) => (
  <Sketch
    w={200}
    h={166}
    size={size}
    start={start}
    seed={seed}
    fills={[
      {d: KNOT, color: '#d69b4c'},
      {d: 'M 60 60 C 80 40, 130 38, 150 66 C 128 58, 84 60, 60 60 Z', color: CRUST_DARK, opacity: 0.45},
      ...[
        [70, 70],
        [128, 58],
        [140, 104],
        [84, 118],
        [108, 92],
        [62, 98],
        [118, 128],
      ].map(([x, y]) => ({d: `M ${x} ${y} m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0`, color: '#fbf1d8', opacity: 1})),
    ]}
    lines={[
      {d: KNOT},
      {d: 'M 100 86 C 112 80, 118 96, 104 103 C 88 110, 78 90, 88 76 C 100 60, 128 66, 132 88 C 136 112, 112 128, 90 124 C 62 119, 52 92, 62 70', width: 3.2},
    ]}
  />
);

const BATARD = 'M 18 72 C 18 36, 70 22, 122 22 C 174 22, 224 36, 224 72 C 224 98, 174 108, 122 108 C 70 108, 18 98, 18 72 Z';

/** A rye and fig batard, darker, scored on the slant. */
export const Batard: React.FC<{size: number; start?: number; seed?: number}> = ({size, start, seed = 8}) => (
  <Sketch
    w={242}
    h={128}
    size={size}
    start={start}
    seed={seed}
    fills={[
      {d: BATARD, color: RYE},
      {d: 'M 30 60 C 40 36, 90 30, 122 30 C 160 30, 206 36, 214 60 C 170 50, 70 50, 30 60 Z', color: '#5d3b22', opacity: 0.5},
    ]}
    lines={[
      {d: BATARD},
      {d: 'M 62 44 C 70 58, 78 70, 86 82', color: CRUMB, width: 6},
      {d: 'M 104 40 C 112 54, 120 66, 128 80', color: CRUMB, width: 6},
      {d: 'M 146 42 C 154 56, 162 68, 170 80', color: CRUMB, width: 6},
    ]}
  />
);

const CUP = 'M 46 70 L 154 70 C 152 110, 134 134, 100 134 C 66 134, 48 110, 46 70 Z';
const SAUCER = 'M 22 142 C 22 128, 178 128, 178 142 C 178 156, 22 156, 22 142 Z';

/** A flat white on its saucer, a heart in the foam. */
export const Cup: React.FC<{size: number; start?: number; seed?: number}> = ({size, start, seed = 11}) => (
  <Sketch
    w={200}
    h={164}
    size={size}
    start={start}
    seed={seed}
    fills={[
      {d: SAUCER, color: '#e9dfcd'},
      {d: CUP, color: '#f1e9da'},
      {d: 'M 46 70 C 46 60, 154 60, 154 70 C 154 80, 46 80, 46 70 Z', color: '#a06a3a'},
      {d: 'M 100 80 C 92 72, 82 74, 86 66 C 89 61, 96 62, 100 67 C 104 62, 111 61, 114 66 C 118 74, 108 72, 100 80 Z', color: '#f5e8d0', opacity: 1},
    ]}
    lines={[
      {d: SAUCER},
      {d: CUP},
      {d: 'M 46 70 C 46 60, 154 60, 154 70 C 154 80, 46 80, 46 70 Z', width: 3},
      {d: 'M 153 84 C 180 82, 182 114, 148 114'},
    ]}
  />
);

/** Steam curling up from (x, y), each wisp drawing on, rising and fading, over and over. */
export const Steam: React.FC<{x: number; y: number; start?: number; wisps?: number; spread?: number; height?: number}> = ({x, y, start = 0, wisps = 3, spread = 36, height = 120}) => {
  const frame = useCurrentFrame();
  const id = uid(useId());
  return (
    <svg style={{position: 'absolute', left: x - spread * 2, top: y - height, overflow: 'visible'}} width={spread * 4} height={height}>
      <filter id={`${id}s`} x="-50%" y="-20%" width="200%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency={0.06} numOctaves={1} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {Array.from({length: wisps}, (_, i) => {
        const period = 54;
        const local = frame - start - i * 16;
        if (local < 0) return null;
        const t = (local % period) / period;
        const draw = Math.min(1, t * 2.2);
        const cx = spread * 2 + (i - (wisps - 1) / 2) * spread;
        const d = `M ${cx} ${height} C ${cx - 14} ${height * 0.72}, ${cx + 14} ${height * 0.5}, ${cx} ${height * 0.28} S ${cx - 10} ${height * 0.06}, ${cx + 2} 0`;
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
            fill="none"
            stroke={INK}
            strokeWidth={4.5}
            strokeLinecap="round"
            opacity={Math.sin(Math.PI * t) * 0.8}
            transform={`translate(0 ${-t * 26})`}
            filter={`url(#${id}s)`}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// The map

/**
 * A hand-drawn street map, `w` x `h`: the streets ink in, the park washes in, the houses appear,
 * then the pin drops on 14 Elm Street at `pinAt` with rings rippling out.
 */
export const StreetMap: React.FC<{w: number; h: number; start?: number; pinAt: number}> = ({w, h, start = 0, pinAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sx = (v: number) => (v / 100) * w;
  const sy = (v: number) => (v / 100) * h;
  const streets: Line[] = [
    {d: `M ${sx(-4)} ${sy(46)} C ${sx(30)} ${sy(44)}, ${sx(62)} ${sy(49)}, ${sx(104)} ${sy(45)}`, width: 16, color: '#ffffff'},
    {d: `M ${sx(38)} ${sy(-4)} C ${sx(40)} ${sy(30)}, ${sx(36)} ${sy(70)}, ${sx(39)} ${sy(104)}`, width: 14, color: '#ffffff'},
    {d: `M ${sx(70)} ${sy(104)} C ${sx(76)} ${sy(76)}, ${sx(86)} ${sy(58)}, ${sx(104)} ${sy(30)}`, width: 12, color: '#ffffff'},
  ];
  // Each street is an ink stroke with a paler road down its middle, drawn on together.
  const kerbs: Line[] = streets.map((s) => ({d: s.d, width: (s.width ?? 12) + 7, color: INK}));
  const roads: Line[] = streets.map((s, i) => ({d: s.d, width: s.width, color: i === 0 ? '#fbf3e3' : '#f7efe0'}));
  const houses = [
    [8, 20, 12, 12],
    [22, 24, 9, 10],
    [8, 58, 11, 14],
    [22, 60, 10, 10],
    [46, 56, 12, 12],
    [60, 58, 10, 13],
    [48, 18, 10, 12],
    [62, 22, 8, 9],
    [10, 80, 12, 10],
    [48, 78, 11, 10],
  ];
  const housesIn = interpolate(frame, [start + 26, start + 50], [0, 1], clamp);
  const pin = {x: sx(56), y: sy(45)};
  const drop = spring({frame: frame - pinAt, fps, config: {damping: 10, stiffness: 140}});
  const label = interpolate(frame, [pinAt + 10, pinAt + 24], [0, 1], clamp);
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <Sketch
        w={w}
        h={h}
        size={w}
        start={start}
        frames={44}
        seed={21}
        fills={[{d: `M ${sx(70)} ${sy(6)} C ${sx(84)} ${sy(2)}, ${sx(98)} ${sy(8)}, ${sx(97)} ${sy(20)} C ${sx(96)} ${sy(30)}, ${sx(84)} ${sy(34)}, ${sx(74)} ${sy(30)} C ${sx(64)} ${sy(26)}, ${sx(60)} ${sy(12)}, ${sx(70)} ${sy(6)} Z`, color: LEAF, opacity: 0.55}]}
        lines={kerbs}
      />
      <div style={{position: 'absolute', inset: 0}}>
        <Sketch w={w} h={h} size={w} start={start + 2} frames={44} seed={21} lines={roads} />
      </div>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {houses.map(([x, y, hw, hh], i) => {
          const t = Math.max(0, Math.min(1, housesIn * houses.length - i));
          return (
            <g key={i} opacity={t} transform={`translate(${sx(x + hw / 2)} ${sy(y + hh / 2)}) scale(${0.6 + 0.4 * t}) translate(${-sx(hw / 2)} ${-sy(hh / 2)})`}>
              <rect width={sx(hw)} height={sy(hh)} rx={4} fill={i % 3 === 0 ? '#e7cfa8' : '#efe4cf'} stroke={INK} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* Trees in the park. */}
        {[
          [78, 12],
          [88, 18],
          [74, 22],
        ].map(([x, y], i) => (
          <circle key={i} cx={sx(x)} cy={sy(y)} r={10 * housesIn} fill={LEAF} opacity={0.8} stroke={INK} strokeWidth={2} />
        ))}
        {drop > 0.02
          ? [0, 1].map((k) => {
              const r = interpolate(frame, [pinAt + 6 + k * 10, pinAt + 40 + k * 10], [0, 1], clamp);
              return r > 0 && r < 1 ? <circle key={k} cx={pin.x} cy={pin.y} r={20 + r * 70} fill="none" stroke={CRUST_DARK} strokeWidth={3} opacity={1 - r} /> : null;
            })
          : null}
        {drop > 0.02 ? (
          <g transform={`translate(${pin.x} ${pin.y - (1 - Math.min(1, drop)) * 140}) scale(${0.8 + 0.2 * Math.min(1.2, drop)})`}>
            <ellipse cx={0} cy={4} rx={14} ry={5} fill="rgba(46, 42, 36, 0.25)" />
            <path d="M 0 0 C -6 -14, -26 -26, -26 -46 C -26 -62, -13 -72, 0 -72 C 13 -72, 26 -62, 26 -46 C 26 -26, 6 -14, 0 0 Z" fill={CRUST_DARK} stroke={INK} strokeWidth={3} />
            <circle cx={0} cy={-46} r={9} fill="#fbf1d8" />
          </g>
        ) : null}
      </svg>
      {/* Street names and the address, in the hand. */}
      {[
        {text: 'Elm St', x: 6, y: 36, rot: -2},
        {text: 'Oak Ave', x: 40.5, y: 86, rot: -88},
        {text: 'Mill Rd', x: 86, y: 72, rot: -56},
        {text: 'Linden Park', x: 68, y: 33, rot: 0},
      ].map((l, i) => (
        <div
          key={l.text}
          style={{
            position: 'absolute',
            left: sx(l.x),
            top: sy(l.y),
            transform: `rotate(${l.rot}deg)`,
            transformOrigin: '0 0',
            fontFamily: hand,
            fontSize: 34,
            fontWeight: 600,
            color: INK,
            opacity: interpolate(frame, [start + 30 + i * 5, start + 42 + i * 5], [0, 0.85], clamp),
            whiteSpace: 'nowrap',
          }}
        >
          {l.text}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: pin.x + 12,
          top: pin.y + 16,
          padding: '6px 16px',
          borderRadius: 10,
          background: '#fbf6ea',
          border: `2.5px solid ${INK}`,
          fontFamily: hand,
          fontSize: 40,
          fontWeight: 700,
          color: INK,
          whiteSpace: 'nowrap',
          opacity: label,
          transform: `translateY(${(1 - label) * 10}px) rotate(-3deg)`,
        }}
      >
        14 Elm St
      </div>
    </div>
  );
};

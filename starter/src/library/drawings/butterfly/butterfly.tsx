import React from 'react';
import {random} from 'remotion';
import {alpha, mix} from '../../../look';
import {Wobble, n1, useClock, usePalette, useUid, type Palette} from '../_shared';

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
export const Butterfly: React.FC<{
  /** Its size in px (default 300). */
  size?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames for one wingbeat (default 24). */
  flap?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** Its wing colour; the palette's warm colour if not set. */
  color?: string;
  /** Flies in along a curve from below left; false to start in place, hovering (default true). */
  arrive?: boolean;
  /** Overrides some of the drawing's colours. */
  palette?: Partial<Palette>;
}> = ({
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

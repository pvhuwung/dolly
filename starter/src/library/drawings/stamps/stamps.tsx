import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {mix} from '../../../look';
import type {Demo} from '../../types';
import {CardSample, bladePoints, n1, smooth, useClock, usePalette, useUid, type Palette} from '../_shared';

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

export const demos: Demo[] = [
  {
    name: 'Stamps',
    code: '<Stamps width={700} height={500} motif="flower" />',
    seconds: 3,
    hero: 85,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Stamps width={w * 0.86} height={h * 0.84} count={20} start={6} />}</CardSample>,
  },
];

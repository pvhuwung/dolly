import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {alpha, mix} from '../../../look';
import type {Demo} from '../../types';
import {CardSample, DrawOn, Wobble, bladePoints, smooth, useClock, usePalette, useUid, type Palette} from '../_shared';

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

export const demos: Demo[] = [
  {
    name: 'Watercolour flower',
    code: '<Flower size={320} petals={6} start={6} />',
    seconds: 3.5,
    hero: 100,
    Component: () => <CardSample aspect={0.8}>{(w, h) => <Flower size={Math.min(w * 0.62, (h * 0.86) / 1.5)} start={6} frames={80} />}</CardSample>,
  },
];

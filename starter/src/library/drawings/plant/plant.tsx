import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {alpha, mix} from '../../../look';
import {DrawOn, Wobble, bladePoints, n1, smooth, useClock, usePalette, useUid, type Palette, type Pt} from '../_shared';

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
  /** Its width in px (default 420). */
  width?: number;
  /** Its height in px (default 560). */
  height?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames it takes to grow (default 100). */
  frames?: number;
  /** How many times the branches fork (default 4). */
  depth?: number;
  /** Grows a different plant; the same seed always grows the same one (default 2). */
  seed?: number;
  /** Some branch tips flower (default true). */
  blooms?: boolean;
  /** Overrides some of the drawing's colours. */
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

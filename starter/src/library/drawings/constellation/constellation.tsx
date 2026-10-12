import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {DrawOn, InArea, n1, useArea, useClock, useInk, usePalette, type Palette, type Pt} from '../_shared';

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

const ConstellationDemo: React.FC = () => {
  const a = useArea();
  return (
    <InArea>
      <Constellation width={Math.round(Math.min(a.w * 0.9, 1100))} height={Math.round(Math.min(a.h * 0.85, a.look.tall ? 800 : 560))} count={16} start={4} stagger={4} />
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Constellation', code: '<Constellation width={800} height={460} count={16} />', seconds: 3, hero: 85, Component: ConstellationDemo}];

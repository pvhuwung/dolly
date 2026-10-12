import React, {useMemo} from 'react';
import {random} from 'remotion';
import {mix} from '../../../look';
import type {Demo} from '../../types';
import {CardSample, n1, useClock, usePalette, type Palette} from '../_shared';

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

export const demos: Demo[] = [
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
];

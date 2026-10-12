import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {mix} from '../../../look';
import {DrawOn, fbm, smooth, useClock, useInk, usePalette, type Palette, type Pt} from '../_shared';

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
  /** Its width in px. */
  width: number;
  /** Its height in px. */
  height: number;
  /** How many contour lines (default 10). */
  levels?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames it takes to draw (default 70). */
  frames?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** The colour of every line; ink warming towards the palette's warm colour, level by level, if not set. */
  color?: string;
  /** Overrides some of the drawing's colours. */
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

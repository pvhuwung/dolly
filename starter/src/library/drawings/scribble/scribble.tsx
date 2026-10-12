import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import {DrawOn, noise, smooth, useClock, usePalette, type Palette, type Pt} from '../_shared';

/**
 * A marker scribbling back and forth until a shape is filled, in one continuous stroke drawn on
 * from `start`. Behind a word, a number or a price, it says "this one".
 *
 *   <Scribble width={320} height={140} start={10} />
 */
export const Scribble: React.FC<{
  /** Its width in px. */
  width: number;
  /** Its height in px. */
  height: number;
  /** The outline it fills: a loose blob or a circle (default blob). */
  shape?: 'blob' | 'circle';
  /** How many back-and-forth passes (default 11). */
  density?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames it takes to draw (default 30). */
  frames?: number;
  /** Its colour; the palette's sun, see-through, if not set. */
  color?: string;
  /** Line width in px (default 14). */
  strokeWidth?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** Overrides some of the drawing's colours. */
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

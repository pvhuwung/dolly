import React, {useMemo} from 'react';
import {ease} from '../../../kit';
import {DrawOn, n1, noise, smooth, useClock, useInk, usePalette, type Palette, type Pt} from '../_shared';

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
  /** Which mark: underline, circle, squiggle, arrow, loop, spiral, star, sparkle, heart, burst or check. */
  kind: DoodleKind;
  /** Its width in px (default 200). */
  width?: number;
  /** Its height in px (default 200). */
  height?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames it takes to draw (default 24). */
  frames?: number;
  /** Its colour; the ink colour (dark on paper and light pages, light on dark ones) if not set. */
  color?: string;
  /** Line width in px (default 5). */
  strokeWidth?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** Overrides some of the drawing's colours. */
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

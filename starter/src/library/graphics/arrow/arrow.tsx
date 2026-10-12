import React from 'react';
import {ease} from '../../../kit';
import {type Pt, useTempo} from '../_shared';

/**
 * A curved, hand-drawn arrow from `from` to `to` that draws itself on, its head landing last. For
 * pointing at something in a shot. `bend` curves it (0 straight, + bows to the left of travel).
 *
 *   <Arrow from={{x: 620, y: 360}} to={{x: 1180, y: 560}} start={10} />
 */
export const Arrow: React.FC<{
  /** Where it starts, in px of its parent. */
  from: Pt;
  /** Where the head lands, in px of its parent. */
  to: Pt;
  /** How much it curves: 0 is straight, more bows it to the left of travel, less to the right (default 0.25). */
  bend?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the line takes to draw (default 28). */
  frames?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** Its colour; the style's accent if not set. */
  color?: string;
  /** Line width in px (default 6). */
  strokeWidth?: number;
  /** Length of the head's two strokes in px (default 26). */
  head?: number;
}> = ({from, to, bend = 0.25, start = 0, frames = 28, exit, color, strokeWidth = 6, head = 26}) => {
  const {look, ramp} = useTempo();
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = dy / length;
  const ny = -dx / length;
  // Two control points bowed by different amounts read as a hand's stroke, not a compass arc.
  const c1 = {x: from.x + dx * 0.25 + nx * length * bend, y: from.y + dy * 0.25 + ny * length * bend};
  const c2 = {x: from.x + dx * 0.78 + nx * length * bend * 0.55, y: from.y + dy * 0.78 + ny * length * bend * 0.55};
  const angle = Math.atan2(to.y - c2.y, to.x - c2.x);
  const wing = (side: number) => ({x: to.x - head * Math.cos(angle + side * 0.5), y: to.y - head * Math.sin(angle + side * 0.5)});
  const [l, r] = [wing(1), wing(-1)];
  const t = ramp(start, frames);
  const h = ramp(start + frames * 0.78, 9, ease.out);
  const out = exit === undefined ? 0 : ramp(exit, 14, ease.in);
  const stroke = {fill: 'none', stroke: color ?? look.accent, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: '1 1'};
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - out}}>
      <path d={`M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`} {...stroke} strokeDashoffset={1 - t} opacity={t > 0.002 ? 1 : 0} />
      <path d={`M ${l.x} ${l.y} L ${to.x} ${to.y} L ${r.x} ${r.y}`} {...stroke} strokeDashoffset={1 - h} opacity={h > 0.002 ? 1 : 0} />
    </svg>
  );
};

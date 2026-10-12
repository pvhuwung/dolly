import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease} from '../../../kit';
import type {Demo} from '../../types';
import {type Pt, accentWord, card, useArea, useTempo} from '../_shared';

/**
 * A curved, hand-drawn arrow from `from` to `to` that draws itself on, its head landing last. For
 * pointing at something in a shot. `bend` curves it (0 straight, + bows to the left of travel).
 *
 *   <Arrow from={{x: 620, y: 360}} to={{x: 1180, y: 560}} start={10} />
 */
export const Arrow: React.FC<{
  from: Pt;
  to: Pt;
  bend?: number;
  start?: number;
  frames?: number;
  exit?: number;
  color?: string;
  strokeWidth?: number;
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const ArrowDemo: React.FC = () => {
  const {look, cx, cy, w} = useArea();
  const button = (look.format !== 'landscape') ? {x: cx + 40, y: cy + 170} : {x: cx + 270, y: cy + 70};
  const label = (look.format !== 'landscape') ? {x: cx - 170, y: cy - 230} : {x: cx - 420, y: cy - 150};
  const size = Math.min(48, w / 16);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: label.x, top: label.y, transform: 'translate(-50%, -50%)', ...look.headline, fontSize: size * 1.3, whiteSpace: 'nowrap'}}>
        Start <span style={accentWord(look)}>here</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: button.x,
          top: button.y,
          transform: 'translate(-50%, -50%)',
          padding: `${size * 0.5}px ${size * 0.9}px`,
          ...card(look),
          border: `1px solid ${look.line}`,
          fontFamily: look.fonts.body,
          fontWeight: 700,
          fontSize: size * 0.8,
          color: look.ink,
          whiteSpace: 'nowrap',
        }}
      >
        Deploy to production
      </div>
      <Arrow
        from={{x: label.x + ((look.format !== 'landscape') ? 20 : size * 3.7), y: label.y + size * ((look.format !== 'landscape') ? 1.1 : 0.25)}}
        to={{x: button.x - ((look.format !== 'landscape') ? 60 : size * 3.4), y: button.y - size * ((look.format !== 'landscape') ? 1.4 : 1.4)}}
        bend={(look.format !== 'landscape') ? -0.3 : 0.3}
        start={10}
      />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Point with an arrow', code: '<Arrow from={label} to={button} start={10} />', seconds: 2.5, hero: 50, Component: ArrowDemo},
];

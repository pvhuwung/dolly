import React from 'react';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import {type Pt, useTempo} from '../_shared';

export type CursorPoint = {x: number; y: number; at: number; click?: boolean};

/** The macOS pointer, its tip at (1, 1) in a 20 x 30 box. */
const POINTER = 'M1 1 L1 23.6 L6.6 18.3 L10.6 27.4 L14.4 25.8 L10.5 16.9 L18 16.9 Z';

/**
 * A pointer gliding through `points`, arriving at each one at its frame `at`, with a press and a
 * ripple on the ones marked `click`. For showing input over footage that was recorded without a
 * visible pointer, or over a mock. Positions are px in the parent.
 *
 *   <Cursor points={[{x: 1300, y: 760, at: 0}, {x: 900, y: 430, at: 30, click: true}]} />
 */
export const Cursor: React.FC<{
  /** Where it goes: each point's `x` and `y` in px of its parent, the frame `at` it arrives there, and `click` to press there. */
  points: CursorPoint[];
  /** Frames it takes to move from one point to the next (default 22). */
  travel?: number;
  /** Its size in px (default 40). */
  size?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** A white pointer with a dark edge, for dark footage; a black one if not set. */
  light?: boolean;
}> = ({
  points,
  travel = 22,
  size = 40,
  exit,
  light,
}) => {
  const {look, frame, glide, gone} = useTempo();
  const move = Math.round(travel * look.pace);
  let pos: Pt = points[0];
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const depart = Math.max(a.at + (a.click ? 8 : 0), b.at - move);
    if (frame >= b.at) {
      pos = b;
      continue;
    }
    if (frame > depart) {
      const u = ease.inOut((frame - depart) / (b.at - depart));
      // A hand moves in a slight arc, not a ruled line.
      const bow = Math.hypot(b.x - a.x, b.y - a.y) * 0.1 * Math.sin(Math.PI * u);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      pos = {x: a.x + (b.x - a.x) * u + ((b.y - a.y) / len) * bow, y: a.y + (b.y - a.y) * u - ((b.x - a.x) / len) * bow};
    } else pos = a;
    break;
  }
  const clicks = points.filter((p) => p.click);
  const press = clicks.reduce((s, c) => (frame >= c.at && frame <= c.at + 8 ? 1 - 0.16 * Math.sin((Math.PI * (frame - c.at)) / 8) : s), 1);
  const shown = glide(points[0].at - 10, 12) - gone(exit, 10);
  const k = size / 28;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none'}}>
      {clicks.map((c) => {
        const t = (frame - c.at) / (22 * look.pace);
        if (t < 0 || t > 1) return null;
        const r = 10 + 46 * ease.out(t);
        return (
          <div
            key={c.at}
            style={{
              position: 'absolute',
              left: c.x - r,
              top: c.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: alpha(look.accent, 0.22 * (1 - t)),
              border: `3px solid ${alpha(look.accent, 0.9 * (1 - t))}`,
            }}
          />
        );
      })}
      <svg
        width={20 * k}
        height={30 * k}
        viewBox="0 0 20 30"
        style={{
          position: 'absolute',
          left: pos.x - k,
          top: pos.y - k,
          overflow: 'visible',
          opacity: shown,
          transform: `scale(${press})`,
          transformOrigin: `${k}px ${k}px`,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))',
        }}
      >
        <path d={POINTER} fill={light ? '#ffffff' : '#0b0b0c'} stroke={light ? '#0b0b0c' : '#ffffff'} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

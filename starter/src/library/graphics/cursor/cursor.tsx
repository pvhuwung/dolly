import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GitPullRequest} from 'lucide-react';
import {ease} from '../../../kit';
import {alpha, useLook} from '../../../look';
import type {Demo} from '../../types';
import {type Pt, card, useArea, useTempo} from '../_shared';

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
export const Cursor: React.FC<{points: CursorPoint[]; travel?: number; size?: number; exit?: number; light?: boolean}> = ({
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** A small app window for samples to point at: a few rows and a button. */
const MockWindow: React.FC<{width: number; pressed?: number; selected?: number}> = ({width, pressed = -1, selected = -1}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const s = width / 760;
  const rows = ['Fix flaky login test', 'Add dark mode tokens', 'Cache build artifacts'];
  const down = frame >= pressed && frame < pressed + 8;
  return (
    <div style={{width, ...card(look), border: `1px solid ${look.line}`, overflow: 'hidden', fontFamily: look.fonts.body}}>
      <div style={{display: 'flex', gap: 9 * s, padding: `${16 * s}px ${20 * s}px`, borderBottom: `1px solid ${look.line}`}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((col) => (
          <div key={col} style={{width: 13 * s, height: 13 * s, borderRadius: '50%', background: col}} />
        ))}
      </div>
      <div style={{padding: `${14 * s}px ${20 * s}px ${22 * s}px`, display: 'flex', flexDirection: 'column', gap: 10 * s}}>
        {rows.map((r, i) => (
          <div
            key={r}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14 * s,
              padding: `${14 * s}px ${16 * s}px`,
              borderRadius: Math.min(look.radius, 12) * s,
              background: frame >= selected && i === 1 ? alpha(look.accent, 0.12) : 'transparent',
              fontSize: 26 * s,
              fontWeight: 500,
              color: look.ink,
            }}
          >
            <GitPullRequest size={26 * s} color={look.accent} />
            {r}
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 8 * s}}>
          <div
            style={{
              padding: `${14 * s}px ${30 * s}px`,
              borderRadius: look.radius === 0 ? 0 : 10 * s,
              background: look.accent,
              color: look.onAccent,
              fontSize: 25 * s,
              fontWeight: 700,
              transform: `scale(${down ? 0.95 : 1})`,
            }}
          >
            Merge
          </div>
        </div>
      </div>
    </div>
  );
};

const CursorDemo: React.FC = () => {
  const {cx, cy, w} = useArea();
  const width = Math.min(940, w * 0.95);
  const s = width / 760;
  // The window's height is about 400 * s; its top-left is at (cx - width / 2, cy - 200 * s).
  const x0 = cx - width / 2;
  const y0 = cy - 200 * s;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x0, top: y0}}>
        <MockWindow width={width} selected={36} pressed={72} />
      </div>
      <Cursor
        points={[
          {x: x0 + width * 0.92, y: y0 + 470 * s, at: 4},
          {x: x0 + 300 * s, y: y0 + 168 * s, at: 34, click: true},
          {x: x0 + width - 80 * s, y: y0 + 335 * s, at: 70, click: true},
        ]}
      />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Cursor and clicks', code: '<Cursor points={[..., {x, y, at: 34, click: true}]} />', seconds: 3.5, hero: 74, Component: CursorDemo},
];

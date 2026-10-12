import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GitPullRequest} from 'lucide-react';
import {alpha, useLook} from '../../../look';
import type {Demo} from '../../types';
import {card, useArea} from '../_demo';
import {Cursor} from './cursor';

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

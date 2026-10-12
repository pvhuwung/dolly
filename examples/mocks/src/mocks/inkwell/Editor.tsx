import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Flower} from '../../fx/drawings';
import {alpha, useLook} from '../../look';
import {Tap} from '../../parts';

// The Inkwell editor, built in HTML: code on top, the canvas it draws on below, stacked for a
// 4:5 frame. Everything sits on an absolute grid so the camera can aim at exact rects.

export const WIN = {width: 960, height: 900};
const BAR = 56;
const CODE_H = 330;
/** The code's lines, for the push-in while it's typed. */
export const CODE = {x: 0, y: BAR, width: 640, height: CODE_H};
/** The flower on the canvas, for the push-in while it draws. */
export const CANVAS = {x: 230, y: BAR + CODE_H + 14, width: 500, height: 486};

/** Scene frames of the editor's beats. */
export const BEAT = {type: 20, run: 100, draw: 112, select: 212, edit: 222, redraw: 226};

const COLORS = {kw: '#31508f', fn: '#b5523b', str: '#5b7a4c', num: '#8a4f7d', key: '#1d1b24', p: '#55505f'};
type Seg = [string, keyof typeof COLORS];

const LINES: Seg[][] = [
  [['import', 'kw'], [' { ', 'p'], ['flower', 'fn'], [' } ', 'p'], ['from', 'kw'], [" 'inkwell'", 'str']],
  [],
  [['const', 'kw'], [' bloom = ', 'p'], ['flower', 'fn'], ['({', 'p']],
  [['  petals', 'key'], [': ', 'p'], ['6', 'num'], [',', 'p']],
  [['  wash', 'key'], [': ', 'p'], ['0.4', 'num'], [',', 'p']],
  [['  ink', 'key'], [': ', 'p'], ["'rose'", 'str'], [',', 'p']],
  [['})', 'p']],
  [['sketch', 'p'], ['.', 'p'], ['draw', 'fn'], ['(bloom)', 'p']],
];
const PER_FRAME = 1.6;
const lengths = LINES.map((l) => l.reduce((n, [t]) => n + t.length, 0) + 1);
const TOTAL = lengths.reduce((a, b) => a + b, 0);

export const Editor: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const mono = look.fonts.mono;

  // Typing: characters so far, spread over the lines in order (a line's newline counts as one).
  const typed = Math.max(0, Math.min(TOTAL, Math.floor((frame - BEAT.type) * PER_FRAME)));
  let left = typed;
  const shown = lengths.map((n) => {
    const k = Math.max(0, Math.min(n, left));
    left -= k;
    return k;
  });
  const caretLine = shown.findIndex((k, i) => k < lengths[i]);
  const done = typed >= TOTAL;
  const blink = Math.floor(frame / 15) % 2 === 0;

  const ran = frame >= BEAT.run + 4;
  const edited = frame >= BEAT.edit;
  const selected = frame >= BEAT.select && frame < BEAT.edit;
  const flash = interpolate(frame, [BEAT.edit, BEAT.edit + 30], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const first = interpolate(frame, [BEAT.redraw, BEAT.redraw + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const line = (segs: Seg[], i: number) => {
    let budget = shown[i];
    return (
      <div key={i} style={{display: 'flex', height: 36, alignItems: 'center', whiteSpace: 'pre'}}>
        <span style={{width: 44, color: '#aaa4b6', textAlign: 'right', marginRight: 26}}>{i + 1}</span>
        {segs.map(([text, c], j) => {
          const t = text.slice(0, Math.max(0, budget));
          budget -= text.length;
          const isPetals = i === 3 && c === 'num';
          if (isPetals && (selected || edited)) {
            return (
              <span key={j} style={{color: COLORS[c], background: selected ? alpha(COLORS.kw, 0.22) : alpha(COLORS.num, 0.2 * flash), borderRadius: 4}}>
                {edited ? '9' : t}
              </span>
            );
          }
          return (
            <span key={j} style={{color: COLORS[c]}}>
              {t}
            </span>
          );
        })}
        {(i === caretLine && !done) || (done && i === LINES.length - 1 && frame < BEAT.run) ? (
          <span style={{width: 3, height: 26, marginLeft: 1, background: COLORS.kw, opacity: blink || !done ? 1 : 0}} />
        ) : null}
      </div>
    );
  };

  return (
    <div style={{position: 'relative', width: WIN.width, height: WIN.height, background: '#fbf9f4', fontFamily: look.fonts.body}}>
      {/* The window's bar: traffic lights, the file, Run. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR, display: 'flex', alignItems: 'center', padding: '0 22px', borderBottom: `1px solid ${look.line}`}}>
        <div style={{display: 'flex', gap: 8}}>
          {['#e0b4a6', '#e6d29c', '#b4cfa8'].map((c) => (
            <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: mono, fontSize: 17, color: look.dim}}>sketch.js — Inkwell</div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: 999,
            background: ran ? alpha('#5b7a4c', 0.14) : look.accent,
            color: ran ? '#4a6a3c' : look.onAccent,
            fontFamily: mono,
            fontSize: 17,
            fontWeight: 600,
            transform: `scale(${frame >= BEAT.run && frame < BEAT.run + 6 ? 0.94 : 1})`,
          }}
        >
          {ran ? '● live' : 'Run ▸'}
        </div>
        <Tap x={WIN.width - 70} y={BAR / 2} at={BEAT.run} />
      </div>

      {/* The code. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: BAR, height: CODE_H, padding: '20px 0', boxSizing: 'border-box', fontFamily: mono, fontSize: 23}}>
        {LINES.map(line)}
      </div>

      {/* The canvas: warm paper with a faint dot grid, the drawing in the middle. */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          right: 14,
          top: BAR + CODE_H,
          bottom: 14,
          borderRadius: 8,
          background: '#f4eee1',
          backgroundImage: `radial-gradient(${alpha('#1d1b24', 0.12)} 1.4px, transparent 1.6px)`,
          backgroundSize: '28px 28px',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 18, top: 14, fontFamily: mono, fontSize: 16, color: look.dim}}>canvas · 900 × 500</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {frame < BEAT.redraw + 10 ? (
            <div style={{position: 'absolute', opacity: first}}>
              <Flower size={250} petals={6} start={BEAT.draw} frames={60} seed={3} />
            </div>
          ) : null}
          {frame >= BEAT.redraw ? (
            <div style={{position: 'absolute'}}>
              <Flower size={250} petals={9} start={BEAT.redraw} frames={44} seed={3} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

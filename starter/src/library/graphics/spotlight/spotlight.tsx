import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {card, useArea, useTempo} from '../_shared';

/**
 * Dims the whole frame except `rect`, the hole tightening onto it from `at`. For making one part of
 * a busy shot the subject. Put it in the shot's AbsoluteFill, over the Stage; `rect` is in px of
 * the frame.
 *
 *   <Spotlight rect={{x: 700, y: 300, width: 520, height: 260}} at={15} />
 */
export const Spotlight: React.FC<{
  rect: {x: number; y: number; width: number; height: number};
  at?: number;
  frames?: number;
  exit?: number;
  dim?: number;
  pad?: number;
  radius?: number;
  ring?: boolean;
}> = ({rect, at = 0, frames = 26, exit, dim = 0.62, pad = 14, radius, ring = true}) => {
  const {look, glide, gone} = useTempo();
  const t = glide(at, frames) - gone(exit, 16);
  const g = pad + (1 - t) * pad * 5;
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: rect.x - g,
          top: rect.y - g,
          width: rect.width + g * 2,
          height: rect.height + g * 2,
          borderRadius: (radius ?? look.radius) + g * 0.4,
          boxShadow: `0 0 0 6000px rgba(0, 0, 0, ${dim * t})`,
          outline: ring ? `3px solid ${alpha(look.accent, 0.9 * t)}` : undefined,
          outlineOffset: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const SpotlightDemo: React.FC = () => {
  const {look, cx, cy, w, h} = useArea();
  const cols = (look.format !== 'landscape') ? 2 : 3;
  const gap = 24;
  const tileW = Math.min(360, (Math.min(w, 1200) - gap * (cols - 1)) / cols);
  const tileH = tileW * 0.62;
  const rows = 6 / cols;
  const x0 = cx - (cols * tileW + (cols - 1) * gap) / 2;
  const y0 = cy - (rows * tileH + (rows - 1) * gap) / 2;
  const pick = (look.format !== 'landscape') ? 3 : 4;
  const at = (i: number) => ({x: x0 + (i % cols) * (tileW + gap), y: y0 + Math.floor(i / cols) * (tileH + gap)});
  const LABELS = ['Deploys', 'Latency', 'Errors', 'Agents', 'Spend', 'Uptime'];
  return (
    <AbsoluteFill>
      {LABELS.map((label, i) => (
        <div
          key={label}
          style={{
            position: 'absolute',
            left: at(i).x,
            top: at(i).y,
            width: tileW,
            height: Math.min(tileH, h / rows - gap),
            boxSizing: 'border-box',
            padding: 24,
            ...card(look),
            border: `1px solid ${look.line}`,
            fontFamily: look.fonts.body,
          }}
        >
          <div style={{fontSize: 22, fontWeight: 600, color: look.dim}}>{label}</div>
          <div style={{fontSize: tileW * 0.16, fontWeight: 700, color: look.ink, marginTop: 8}}>{['128', '42 ms', '0.02%', '6 live', '$311', '99.98%'][i]}</div>
        </div>
      ))}
      <Spotlight rect={{...at(pick), width: tileW, height: Math.min(tileH, h / rows - gap)}} at={16} />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Spotlight', code: '<Spotlight rect={tile} at={16} />', seconds: 2.5, hero: 55, Component: SpotlightDemo},
];

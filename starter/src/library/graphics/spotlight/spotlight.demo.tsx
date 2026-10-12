import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Demo} from '../../types';
import {card, useArea} from '../_demo';
import {Spotlight} from './spotlight';

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
      <Spotlight rect={{...at(pick), width: tileW, height: Math.min(tileH, h / rows - gap)}} start={16} />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Spotlight', code: '<Spotlight rect={tile} start={16} />', seconds: 2.5, hero: 55, Component: SpotlightDemo},
];

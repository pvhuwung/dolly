import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';
import {Hairlines} from '../_shared';

/** Ribbons of light in the accent and its cousins, swaying over a faint hairline grid. */
export const backdrop: React.FC<BackdropProps> = ({look, t}) => {
  const s = look.dark ? 0.3 : 0.17;
  const ribbons = [
    {y: 0.18, c: look.accent, angle: -12, phase: 0},
    {y: 0.3, c: `color-mix(in oklch, ${look.accent}, #5ee7ff 45%)`, angle: -4, phase: 2},
    {y: 0.1, c: `color-mix(in oklch, ${look.accent}, #a78bfa 45%)`, angle: 8, phase: 4},
  ];
  return (
    <AbsoluteFill>
      {ribbons.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -look.width * 0.3,
            width: look.width * 1.6,
            top: (r.y + 0.04 * Math.sin(t * 0.3 + r.phase)) * look.height - look.height * 0.3,
            height: look.height * 0.6,
            background: `radial-gradient(ellipse 50% 50% at ${50 + 14 * Math.sin(t * 0.21 + r.phase)}% 50%, ${alpha(r.c, s)} 0%, ${alpha(r.c, s * 0.35)} 45%, transparent 75%)`,
            transform: `rotate(${r.angle + 4 * Math.sin(t * 0.15 + r.phase)}deg) scaleY(${0.85 + 0.2 * Math.sin(t * 0.4 + r.phase)})`,
          }}
        />
      ))}
      <Hairlines look={look} step={96} strength={look.dark ? 0.03 : 0.035} />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';
import {backdropDemos} from '../_shared';

/** Pastel cousins of the accent, drifting and changing shape: a tint the content sits on. */
export const backdrop: React.FC<BackdropProps> = ({look, tone, t}) => {
  const big = Math.max(look.width, look.height);
  // Faint: a tint the content sits on, not a gradient mesh to look at.
  const s = {night: 0.12, mid: 0.16, day: 0.17}[tone];
  // Pastel cousins of the accent: mixed in oklch, so the hue travels instead of going grey.
  const cousins = [look.accent, `color-mix(in oklch, ${look.accent}, #ff9fb2 55%)`, `color-mix(in oklch, ${look.accent}, #a99bff 55%)`, `color-mix(in oklch, ${look.accent}, #ffd98a 55%)`];
  const blobs = [
    {x: 0.14, y: 0.2, size: 0.62, c: 0, phase: 0},
    {x: 0.88, y: 0.24, size: 0.5, c: 1, phase: 1.7},
    {x: 0.8, y: 0.86, size: 0.66, c: 2, phase: 3.1},
    {x: 0.22, y: 0.9, size: 0.46, c: 3, phase: 4.4},
  ];
  return (
    <AbsoluteFill>
      {blobs.map((b, i) => {
        const size = big * b.size;
        const w = (a: number) => 42 + 12 * Math.sin(t * 0.35 + b.phase + a);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (b.x + 0.04 * Math.sin(t * 0.2 + b.phase)) * look.width - size / 2,
              top: (b.y + 0.04 * Math.cos(t * 0.17 + b.phase)) * look.height - size / 2,
              width: size,
              height: size,
              borderRadius: `${w(0)}% ${100 - w(0)}% ${w(2)}% ${100 - w(2)}% / ${w(1)}% ${w(3)}% ${100 - w(3)}% ${100 - w(1)}%`,
              background: alpha(cousins[b.c], s),
              transform: `rotate(${t * 6 + b.phase * 40}deg)`,
              filter: `blur(${Math.round(size * 0.09)}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const demos = backdropDemos('blobs');

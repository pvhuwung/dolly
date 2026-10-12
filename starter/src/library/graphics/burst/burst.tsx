import React from 'react';
import {random} from 'remotion';
import {mix} from '../../../look';
import {useTempo} from '../_shared';

/**
 * Confetti bursting from (x, y) at frame `start`, falling away under gravity in about a second and a
 * half. For a success moment: a merge, a payment, a launch.
 *
 *   <Burst x={960} y={500} start={14} />
 */
export const Burst: React.FC<{
  /** Where it bursts from, in px of its parent. */
  x: number;
  /** Where it bursts from, in px of its parent. */
  y: number;
  /** Frame it bursts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** How many pieces of confetti (default 80). */
  count?: number;
  /** How big and far it bursts; 1 is normal (default 1). */
  power?: number;
  /** Changes the pattern, so two bursts don't match (default 'burst'). */
  seed?: string;
  /** Colours of the confetti; the accent, the alert colour, a light accent and the ink if not set. */
  colors?: string[];
}> = ({x, y, start: startProp, at, count = 80, power = 1, seed = 'burst', colors}) => {
  const start = startProp ?? at ?? 0;
  const {look, frame, fps} = useTempo();
  const t = (frame - start) / fps;
  const life = 1.7 * look.pace;
  if (t < 0 || t > life) return null;
  const palette = colors ?? [look.accent, look.alert, mix(look.accent, '#ffffff', 0.45), look.ink];
  const drag = 2.6;
  const gravity = 1500 * power;
  const flight = (1 - Math.exp(-drag * t)) / drag;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      <div
        style={{
          position: 'absolute',
          left: -180 * power * Math.min(1, t * 5),
          top: -180 * power * Math.min(1, t * 5),
          width: 360 * power * Math.min(1, t * 5),
          height: 360 * power * Math.min(1, t * 5),
          borderRadius: '50%',
          border: `3px solid ${palette[0]}`,
          opacity: Math.max(0, 0.7 - t * 2.4),
        }}
      />
      {Array.from({length: count}, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const angle = r('a') * Math.PI * 2;
        const speed = (700 + r('s') * 1500) * power;
        const px = Math.cos(angle) * speed * flight;
        const py = (Math.sin(angle) * speed - 500 * power) * flight + (gravity / drag) * (t - flight);
        const shape = r('k');
        const w = (shape < 0.6 ? 18 + r('w') * 12 : shape < 0.85 ? 15 : 7) * Math.sqrt(power);
        const h = (shape < 0.6 ? 10 + r('h') * 6 : shape < 0.85 ? 15 : 30) * Math.sqrt(power);
        const spin = (r('r') - 0.5) * 1400 * t + r('o') * 360;
        const flutter = Math.cos(t * (8 + r('f') * 10) + r('p') * 6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - w / 2,
              top: py - h / 2,
              width: w,
              height: h,
              borderRadius: shape >= 0.6 && shape < 0.85 ? '50%' : 2,
              background: palette[i % palette.length],
              transform: `rotate(${spin}deg) scaleY(${flutter})`,
              opacity: t > life * 0.65 ? 1 - (t - life * 0.65) / (life * 0.35) : 1,
            }}
          />
        );
      })}
    </div>
  );
};

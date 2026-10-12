import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Check} from 'lucide-react';
import {mix} from '../../../look';
import type {Demo} from '../../types';
import {useArea, useTempo} from '../_shared';
import {Icon} from '../icon/icon';

/**
 * Confetti bursting from (x, y) at frame `at`, falling away under gravity in about a second and a
 * half. For a success moment: a merge, a payment, a launch.
 *
 *   <Burst x={960} y={500} at={14} />
 */
export const Burst: React.FC<{
  x: number;
  y: number;
  at: number;
  count?: number;
  power?: number;
  seed?: string;
  colors?: string[];
}> = ({x, y, at, count = 80, power = 1, seed = 'burst', colors}) => {
  const {look, frame, fps} = useTempo();
  const t = (frame - at) / fps;
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const BurstDemo: React.FC = () => {
  const {look, cx, cy} = useArea();
  return (
    <AbsoluteFill>
      <Burst x={cx} y={cy} at={12} power={(look.format !== 'landscape') ? 0.8 : 1} />
      <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Icon icon={Check} size={150} at={6} tone="accent" />
        <div style={{...look.headline, fontSize: look.size * 0.9, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 14) / 10))}}>Merged.</div>
      </div>
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Confetti', code: '<Burst x={cx} y={cy} at={12} />', seconds: 2.5, hero: 24, Component: BurstDemo},
];

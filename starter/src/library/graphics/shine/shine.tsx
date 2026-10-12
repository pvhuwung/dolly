import React from 'react';
import {interpolate} from 'remotion';
import {Rocket} from 'lucide-react';
import {ease} from '../../../kit';
import type {Demo} from '../../types';
import {Area, useArea, useTempo} from '../_shared';

/**
 * Sweeps a glint of light across its children at `at`, and again every `every` frames if given.
 * For a button you want pressed, a logo, a price. `radius` should match the children's corners.
 *
 *   <Shine at={20} every={50}><Button /></Shine>
 */
export const Shine: React.FC<{at?: number; frames?: number; every?: number; radius?: number; color?: string; children: React.ReactNode}> = ({
  at = 0,
  frames = 30,
  every,
  radius,
  color = 'rgba(255, 255, 255, 0.75)',
  children,
}) => {
  const {look, frame} = useTempo();
  const length = Math.round(frames * look.pace);
  const since = frame - at;
  const local = every && since > 0 ? since % every : since;
  const p = interpolate(local, [0, length], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
  return (
    <div style={{position: 'relative', display: 'inline-block', overflow: 'hidden', borderRadius: radius ?? look.radius, verticalAlign: 'top'}}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          width: '45%',
          left: `${-60 + p * 175}%`,
          transform: 'skewX(-20deg)',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          mixBlendMode: 'overlay',
          opacity: p > 0 && p < 1 ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const ShineDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(52, w / 14);
  return (
    <Area>
      <Shine at={16} every={50} radius={look.radius === 0 ? 0 : 999}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: size * 0.4,
            padding: `${size * 0.6}px ${size * 1.2}px`,
            borderRadius: look.radius === 0 ? 0 : 999,
            background: look.accent,
            color: look.onAccent,
            fontFamily: look.fonts.body,
            fontWeight: 700,
            fontSize: size,
          }}
        >
          <Rocket size={size * 1.1} strokeWidth={2.2} />
          Get early access
        </div>
      </Shine>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Shine', code: '<Shine at={16} every={50}>{button}</Shine>', seconds: 2.5, hero: 30, Component: ShineDemo},
];

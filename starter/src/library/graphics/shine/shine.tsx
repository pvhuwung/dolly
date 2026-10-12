import React from 'react';
import {interpolate} from 'remotion';
import {ease} from '../../../kit';
import {useTempo} from '../_shared';

/**
 * Sweeps a glint of light across its children at `start`, and again every `every` frames if given.
 * For a button you want pressed, a logo, a price. `radius` should match the children's corners.
 *
 *   <Shine start={20} every={50}><Button /></Shine>
 */
export const Shine: React.FC<{
  /** Frame the first glint starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frames one sweep takes (default 30). */
  frames?: number;
  /** Sweep again every this many frames; just once if not set. */
  every?: number;
  /** Corner radius of what it shines on, in px; the style's if not set. */
  radius?: number;
  /** Colour of the glint (default a soft white). */
  color?: string;
  /** What it shines across: a button, a logo, a price. */
  children: React.ReactNode;
}> = ({
  start: startProp,
  at,
  frames = 30,
  every,
  radius,
  color = 'rgba(255, 255, 255, 0.75)',
  children,
}) => {
  const start = startProp ?? at ?? 0;
  const {look, frame} = useTempo();
  const length = Math.round(frames * look.pace);
  const since = frame - start;
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

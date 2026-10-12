import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import {useTempo} from '../_shared';

/**
 * Dims the whole frame except `rect`, the hole tightening onto it from `start`. For making one part of
 * a busy shot the subject. Put it in the shot's AbsoluteFill, over the Stage; `rect` is in px of
 * the frame.
 *
 *   <Spotlight rect={{x: 700, y: 300, width: 520, height: 260}} start={15} />
 */
export const Spotlight: React.FC<{
  /** The part to light, in px of the frame: `x`, `y`, `width`, `height`. */
  rect: {x: number; y: number; width: number; height: number};
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frames the light takes to close in (default 26). */
  frames?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** How dark the rest of the frame gets, 0 to 1 (default 0.62). */
  dim?: number;
  /** Space left around `rect` in px (default 14). */
  pad?: number;
  /** Corner radius of the hole in px; the style's if not set. */
  radius?: number;
  /** Draw an accent outline round the hole (default true). */
  ring?: boolean;
}> = ({rect, start: startProp, at, frames = 26, exit, dim = 0.62, pad = 14, radius, ring = true}) => {
  const start = startProp ?? at ?? 0;
  const {look, glide, gone} = useTempo();
  const t = glide(start, frames) - gone(exit, 16);
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

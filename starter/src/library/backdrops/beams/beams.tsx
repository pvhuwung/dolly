import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha, mix} from '../../../look';
import type {BackdropProps} from '../../types';
import {Vignette} from '../_shared';

/** Light falling from a point far above the frame, in beams that sway slowly. */
export const backdrop: React.FC<BackdropProps> = ({look, tone, t}) => {
  const light = {night: mix('#ffffff', look.accent, 0.3), mid: '#ffffff', day: look.accent}[tone];
  const a = {night: 0.12, mid: 0.14, day: 0.08}[tone];
  // Wedges of a conic gradient from a point far above the frame, so they fall nearly parallel, swaying slowly.
  const beams = [-21, -12, -5, 3, 10, 19].map((c, i) => ({c: 180 + c + 1.2 * Math.sin(t * 0.35 + i * 1.3), w: 2.6 + 1.3 * ((i * 7) % 3), a: a * (0.55 + 0.45 * Math.abs(Math.sin(t * 0.5 + i)))}));
  const stops = beams.map((b) => `transparent ${b.c - b.w}deg, ${alpha(light, b.a)} ${b.c}deg, transparent ${b.c + b.w}deg`).join(', ');
  const mask = 'linear-gradient(to bottom, black 0%, transparent 88%)';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `conic-gradient(from 0deg at 50% -75%, transparent 0deg, ${stops}, transparent 360deg)`, maskImage: mask, WebkitMaskImage: mask}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 28% at 50% 0%, ${alpha(light, {night: 0.22, mid: 0.2, day: 0.12}[tone])}, transparent 75%)`}} />
      <Vignette look={look} tone={tone} strength={{night: 0.5, mid: 0.2, day: 0.08}} />
    </AbsoluteFill>
  );
};

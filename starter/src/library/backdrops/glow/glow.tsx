import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mix} from '../../../look';
import type {BackdropProps} from '../../types';
import {Hairlines, Orb} from '../_shared';

/** Soft lights in the accent drifting over faint hairlines. */
export const backdrop: React.FC<BackdropProps> = ({look, t}) => {
  const big = Math.max(look.width, look.height);
  const s = look.dark ? 0.34 : 0.17;
  const bright = mix(look.accent, '#ffffff', 0.35);
  return (
    <AbsoluteFill>
      <Orb look={look} x={0.2 + 0.06 * Math.sin(t * 0.22)} y={0.16 + 0.05 * Math.cos(t * 0.18)} size={big * 0.9} color={look.accent} strength={s} />
      <Orb look={look} x={0.84 + 0.05 * Math.sin(t * 0.17 + 2)} y={0.78 + 0.06 * Math.cos(t * 0.21 + 1)} size={big * 0.8} color={bright} strength={s * 0.7} />
      <Orb look={look} x={0.55 + 0.08 * Math.sin(t * 0.13 + 4)} y={0.45 + 0.05 * Math.sin(t * 0.19)} size={big * 0.55} color={look.accent} strength={s * 0.35} />
      <Hairlines look={look} step={72} strength={look.dark ? 0.045 : 0.05} drift={t * 4} />
    </AbsoluteFill>
  );
};

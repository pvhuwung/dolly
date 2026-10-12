import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';
import {Vignette} from '../_shared';

/** A CRT: scanlines, a slow rolling band and dark corners. */
export const backdrop: React.FC<BackdropProps> = ({look, tone, t}) => {
  const roll = ((t / 7) % 1) * 1.4 - 0.4;
  const line = alpha(tone === 'day' ? look.ink : '#000000', {night: 0.32, mid: 0.09, day: 0.05}[tone]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${alpha(look.accent, look.dark ? 0.08 : 0.06)}, transparent 75%)`}} />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${line} 0px, ${line} 1px, transparent 1px, transparent 4px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: roll * look.height,
          height: look.height * 0.3,
          background: `linear-gradient(transparent, ${alpha(look.ink, look.dark ? 0.035 : 0.025)}, transparent)`,
        }}
      />
      <Vignette look={look} tone={tone} strength={{night: 0.6, mid: 0.25, day: 0.1}} />
    </AbsoluteFill>
  );
};

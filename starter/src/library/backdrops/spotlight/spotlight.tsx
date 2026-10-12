import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha, mix} from '../../../look';
import type {BackdropProps} from '../../types';
import {Vignette, backdropDemos} from '../_shared';

/** One soft light from above that breathes slowly, the corners in shadow. */
export const backdrop: React.FC<BackdropProps> = ({look, tone, t}) => {
  const breathe = 1 + 0.08 * Math.sin(t * 0.6);
  const light = tone === 'night' ? mix(look.ink, look.accent, 0.15) : '#ffffff';
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse ${55 * breathe}% ${62 * breathe}% at 50% 30%, ${alpha(light, {night: 0.15, mid: 0.22, day: 0.85}[tone])} 0%, transparent 70%)`}}
      />
      <Vignette look={look} tone={tone} strength={{night: 0.75, mid: 0.3, day: 0.14}} />
    </AbsoluteFill>
  );
};

export const demos = backdropDemos('spotlight');

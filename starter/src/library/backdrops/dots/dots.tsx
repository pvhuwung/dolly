import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';

/** A dot grid that drifts slowly and fades out towards the edges. */
export const backdrop: React.FC<BackdropProps> = ({look, t, id}) => {
  const step = 32;
  const mask = 'radial-gradient(ellipse 72% 68% at 50% 45%, black 10%, transparent 85%)';
  return (
    <AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask}}>
      <svg width={look.width} height={look.height}>
        <defs>
          <pattern id={id} x={(t * 5) % step} y={(t * 3) % step} width={step} height={step} patternUnits="userSpaceOnUse">
            <circle cx={step / 2} cy={step / 2} r={2} fill={alpha(look.ink, look.dark ? 0.3 : 0.26)} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

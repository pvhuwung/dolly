import React, {useId} from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {TransitionDef} from '../../types';
import {bump, inOut, linear, presentation, type PresentationProps} from '../_shared';

const FRAMES = 10;

/** A very fast push with a horizontal motion smear at its peak. */
const Whip: React.FC<PresentationProps<{width: number}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const id = `whip${useId().replace(/:/g, '')}`;
  const e = inOut(p);
  const x = presentationDirection === 'exiting' ? -e * passedProps.width : (1 - e) * passedProps.width;
  const smear = bump(p) ** 2 * 70 * (passedProps.width / 1920);
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${smear} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{transform: `translateX(${x}px) skewX(${-7 * bump(p)}deg)`, filter: smear > 0.5 ? `url(#${id})` : undefined}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A very fast push sideways with a motion smear at its peak. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: (look) => linear(FRAMES, presentation(Whip, {width: look.width}), Easing.linear),
};

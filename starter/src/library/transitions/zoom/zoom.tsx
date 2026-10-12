import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {TransitionDef} from '../../types';
import {clamp01, inOut, linear, presentation, type PresentationProps} from '../_shared';

const FRAMES = 14;

/**
 * Forward through the cut: the leaving scene rushes past the camera and blurs, and the arriving one
 * comes in already close and settles back to rest, so the motion never reverses.
 */
const Zoom: React.FC<PresentationProps<{scale: number}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const e = inOut(p);
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{transform: `scale(${1 + 0.35 * passedProps.scale * e})`, filter: `blur(${14 * e}px)`}}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{opacity: clamp01(p / 0.55), transform: `scale(${1 + 0.14 * passedProps.scale * (1 - e)})`, filter: `blur(${10 * (1 - e)}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/** Forward through the cut: this scene rushes past the camera and blurs, the next settles in. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: () => linear(FRAMES, presentation(Zoom, {scale: 1})),
};

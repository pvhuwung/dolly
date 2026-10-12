import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {TransitionDef} from '../../types';
import {clamp01, linear, presentation, type PresentationProps} from '../_shared';

const FRAMES = 20;

/** Fades the leaving scene to a colour, then the arriving one in from it. */
const Dip: React.FC<PresentationProps<{color: string}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const entering = presentationDirection === 'entering';
  const opacity = entering ? clamp01((p - 0.5) * 2) : clamp01(1 - p * 2);
  return (
    <AbsoluteFill style={{background: passedProps.color, opacity: entering && p < 0.5 ? 0 : 1}}>
      <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The scene fades to the page colour, then the next one fades in from it. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(FRAMES, presentation(Dip, {color: look.background}), Easing.linear),
};

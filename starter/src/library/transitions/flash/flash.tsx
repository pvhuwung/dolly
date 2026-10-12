import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {mix} from '../../../look';
import type {TransitionDef} from '../../types';
import {linear, presentation, type PresentationProps} from '../_shared';

const FRAMES = 10;

/** A cut hidden in a bright flash, with a little punch-in on the arriving scene. */
const Flash: React.FC<PresentationProps<{color: string}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{opacity: p < 0.5 ? 1 : 0, transform: `scale(${1 + 0.03 * p})`}}>{children}</AbsoluteFill>;
  }
  const flash = (1 - Math.abs(p * 2 - 1)) ** 1.6;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1, transform: `scale(${1 + 0.05 * (1 - p)})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: passedProps.color, opacity: flash}} />
    </AbsoluteFill>
  );
};

/** A cut hidden in a bright flash, with a little punch-in on the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(FRAMES, presentation(Flash, {color: look.dark ? mix('#ffffff', look.accent, 0.12) : '#ffffff'}), Easing.linear),
};

import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {mix} from '../../../look';
import type {TransitionDef} from '../../types';
import {clamp01, inOut, linear, presentation, type PresentationProps} from '../_shared';

const FRAMES = 22;

/** Bars of the accent sweep in from the right, covering the leaving scene, then uncover the arriving one. */
const Bars: React.FC<PresentationProps<{colors: string[]}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  if (presentationDirection === 'exiting') return <AbsoluteFill style={{opacity: p < 0.5 ? 1 : 0}}>{children}</AbsoluteFill>;
  const n = passedProps.colors.length;
  const stagger = 0.035;
  const span = 0.5 - (n - 1) * stagger;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{flexDirection: 'column'}}>
        {passedProps.colors.map((color, i) => {
          const cover = inOut(clamp01((p - i * stagger) / span));
          const uncover = inOut(clamp01((p - 0.5 - i * stagger) / span));
          const covering = p < 0.5;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                // Overlap the rows by a pixel so no seam shows between them.
                marginBottom: -1,
                background: color,
                transformOrigin: covering ? '100% 50%' : '0 50%',
                transform: `scaleX(${covering ? cover : 1 - uncover})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bars of the accent sweep in, cover the scene, then uncover the next one. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(
      FRAMES,
      presentation(Bars, {colors: [look.accent, mix(look.accent, '#000000', 0.22), mix(look.accent, '#ffffff', 0.25), look.accent, mix(look.accent, '#000000', 0.12)]}),
      Easing.linear,
    ),
};

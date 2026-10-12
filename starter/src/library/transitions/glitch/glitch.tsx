import React, {useId} from 'react';
import {AbsoluteFill, Easing, random} from 'remotion';
import type {TransitionDef} from '../../types';
import {bump, linear, presentation, type PresentationProps, transitionDemos} from '../_shared';

const FRAMES = 9;

/**
 * A few frames of digital breakup: horizontal slices torn sideways and the colour channels split.
 * One SVG filter does it (stepped noise displaces the scene in x, then red and cyan are offset).
 */
const Glitch: React.FC<PresentationProps<{width: number}>> = ({children, presentationDirection, presentationProgress: p, presentationDurationInFrames, passedProps}) => {
  const id = `glitch${useId().replace(/:/g, '')}`;
  const f = Math.round(p * presentationDurationInFrames);
  const k = passedProps.width / 1920;
  const entering = presentationDirection === 'entering';
  // Flicker across the cut: a frame of the other scene shows through near the middle.
  const flicker = p > 0.3 && p < 0.7 && random(`glitch-flicker-${f}`) > 0.6;
  const visible = entering ? p >= 0.5 !== flicker : p < 0.5 !== flicker;
  const amount = bump(p) * (0.5 + random(`glitch-amount-${f}`));
  const displace = 140 * k * amount;
  const split = 16 * k * amount;
  const jump = (random(`glitch-jump-${f}`) - 0.5) * 30 * k * amount;
  return (
    <AbsoluteFill style={{opacity: visible ? 1 : 0}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-5%" y="0" width="110%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={`0.00001 ${0.012 + 0.03 * random(`glitch-freq-${f}`)}`} numOctaves={1} seed={f + 1} result="noise" />
          <feComponentTransfer in="noise" result="steps">
            <feFuncR type="discrete" tableValues="0.5 0.5 0.2 0.5 0.5 0.85 0.5 0.35 0.5 0.5 0.7 0.5" />
            <feFuncG type="table" tableValues="0.5 0.5" />
          </feComponentTransfer>
          <feDisplacementMap in="SourceGraphic" in2="steps" scale={displace} xChannelSelector="R" yChannelSelector="G" result="torn" />
          <feColorMatrix in="torn" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx={split} result="redShifted" />
          <feColorMatrix in="torn" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
          <feOffset in="cyan" dx={-split} result="cyanShifted" />
          <feBlend in="redShifted" in2="cyanShifted" mode="screen" />
        </filter>
      </svg>
      {/* Overscan while torn, so the slices pulled sideways never bare the frame's edges. */}
      <AbsoluteFill style={{transform: `translateX(${jump}px) scale(${amount > 0.05 ? 1.08 : 1})`, filter: amount > 0.05 ? `url(#${id})` : undefined}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A few frames of digital breakup: torn slices and split colour channels. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(FRAMES, presentation(Glitch, {width: look.width}), Easing.linear),
};

export const demos = transitionDemos('glitch', transition);

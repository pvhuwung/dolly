import type React from 'react';
import {Easing} from 'remotion';
import {linearTiming} from '@remotion/transitions';
import type {TransitionPresentationComponentProps} from '@remotion/transitions';
import type {AnyPresentation} from '../types';

// Pieces the transitions share. Not an item: it's copied with any transition.
//
// A custom presentation is rendered twice during a transition: once around the scene that's leaving
// ('exiting'), and once around the one arriving ('entering'), which is drawn on top.

export type PresentationProps<P extends Record<string, unknown>> = TransitionPresentationComponentProps<P>;

/** A custom presentation component with its props, as @remotion/transitions takes it. */
export const presentation = <P extends Record<string, unknown>>(component: React.FC<PresentationProps<P>>, props: P) =>
  ({component, props}) as unknown as AnyPresentation;

/** One of @remotion/transitions' own presentations, typed loosely so every item has one shape. */
export const as = (p: unknown) => p as AnyPresentation;

export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 at the ends of the transition, 1 in the middle. */
export const bump = (p: number) => Math.sin(Math.PI * clamp01(p));

/** A presentation played over `frames` frames at a steady pace (eased in and out unless told). */
export const linear = (frames: number, p: AnyPresentation, easing: (t: number) => number = inOut) => ({
  presentation: p,
  timing: linearTiming({durationInFrames: frames, easing}),
});

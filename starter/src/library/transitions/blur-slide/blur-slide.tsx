import {blurSlide} from '@remotion/transitions/blur-slide';
import type {TransitionDef} from '../../types';
import {as, linear, transitionDemos} from '../_shared';

const FRAMES = 18;

/** A slide with a motion blur. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(blurSlide({direction: 'from-right'}))),
};

export const demos = transitionDemos('blurSlide', transition);

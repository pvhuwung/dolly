import {linearBlur} from '@remotion/transitions/linear-blur';
import type {TransitionDef} from '../../types';
import {as, linear, transitionDemos} from '../_shared';

const FRAMES = 20;

/** A directional blur carries one scene into the next. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(linearBlur({}))),
};

export const demos = transitionDemos('linearBlur', transition);

import type {TransitionDef} from '../../types';
import {transitionDemos} from '../_shared';

/** A hard cut: the next scene replaces this one with no overlap. */
export const transition: TransitionDef = {
  frames: 0,
  make: () => null,
};

export const demos = transitionDemos('cut', transition);

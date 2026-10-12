import {swap} from '@remotion/transitions/swap';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 26;

/** The two scenes swap places in perspective. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: () => linear(FRAMES, as(swap({}))),
};

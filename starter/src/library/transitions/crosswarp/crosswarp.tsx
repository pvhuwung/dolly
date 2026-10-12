import {crosswarp} from '@remotion/transitions/crosswarp';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 24;

/** The scenes warp sideways into each other. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: () => linear(FRAMES, as(crosswarp({}))),
};

import {Easing} from 'remotion';
import {pushCut} from '@remotion/transitions/push-cut';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 14;

/** A push cut with a flash in the accent at the join. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: (look) => linear(FRAMES, as(pushCut({flashColor: look.dark ? '#ffffff' : look.accent})), Easing.linear),
};

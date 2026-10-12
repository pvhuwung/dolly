import {ripple} from '@remotion/transitions/ripple';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 30;

/** A water ripple spreads from the middle into the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(ripple({}))),
};

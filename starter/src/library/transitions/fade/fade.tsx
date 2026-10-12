import {Easing} from 'remotion';
import {fade} from '@remotion/transitions/fade';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 12;

/** A cross-fade between the two scenes. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(fade()), Easing.linear),
};

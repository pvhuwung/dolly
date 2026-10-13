import {flip} from '@remotion/transitions/flip';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 22;

/** The frame turns over like a card in 3D to show the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: () => linear(FRAMES, as(flip({direction: 'from-right', perspective: 2000}))),
};

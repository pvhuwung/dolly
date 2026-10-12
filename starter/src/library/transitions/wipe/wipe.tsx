import {wipe} from '@remotion/transitions/wipe';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 16;

/** A hard edge sweeps across from the right, revealing the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(wipe({direction: 'from-right'}))),
};

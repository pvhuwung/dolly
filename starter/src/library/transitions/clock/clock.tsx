import {clockWipe} from '@remotion/transitions/clock-wipe';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 20;

/** A hand sweeps round like a clock, revealing the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(FRAMES, as(clockWipe({width: look.width, height: look.height}))),
};

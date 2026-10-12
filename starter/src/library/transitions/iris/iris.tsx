import {iris} from '@remotion/transitions/iris';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 20;

/** A circle opens from the middle onto the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: (look) => linear(FRAMES, as(iris({width: look.width, height: look.height}))),
};

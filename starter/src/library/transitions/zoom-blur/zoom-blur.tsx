import {zoomBlur} from '@remotion/transitions/zoom-blur';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 20;

/** A radial zoom blur through the cut. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(zoomBlur({}))),
};

import {crossZoom} from '@remotion/transitions/cross-zoom';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 24;

/** Both scenes zoom and blur into each other. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(crossZoom({}))),
};

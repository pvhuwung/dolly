import {dreamyZoom} from '@remotion/transitions/dreamy-zoom';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 26;

/** A slow, rotating dreamy zoom into the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(dreamyZoom({}))),
};

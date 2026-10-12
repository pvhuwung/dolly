import {filmBurn} from '@remotion/transitions/film-burn';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 30;

/** A warm film burn flares across the cut. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(filmBurn({}))),
};

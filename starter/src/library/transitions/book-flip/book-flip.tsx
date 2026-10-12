import {bookFlip} from '@remotion/transitions/book-flip';
import type {TransitionDef} from '../../types';
import {as, linear} from '../_shared';

const FRAMES = 26;

/** A page turns like a book onto the next scene. */
export const transition: TransitionDef = {
  frames: FRAMES,
  make: () => linear(FRAMES, as(bookFlip({direction: 'from-right'}))),
};

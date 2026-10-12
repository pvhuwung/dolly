import type {TransitionDef} from '../../types';

/** A hard cut: the next scene replaces this one with no overlap. */
export const transition: TransitionDef = {
  frames: 0,
  make: () => null,
};

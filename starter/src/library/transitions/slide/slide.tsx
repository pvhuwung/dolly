import {springTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import type {TransitionDef} from '../../types';
import {as} from '../_shared';

const FRAMES = 16;

/** The next scene slides in from the right on a spring, pushing this one out. */
export const transition: TransitionDef = {
  frames: FRAMES,
  travels: true,
  make: () => ({presentation: as(slide({direction: 'from-right'})), timing: springTiming({config: {damping: 200}, durationInFrames: FRAMES})}),
};

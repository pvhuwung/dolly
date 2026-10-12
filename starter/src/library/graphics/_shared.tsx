import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, type Ease} from '../../kit';
import {useLook} from '../../look';

// Motion graphics: the pieces laid over or between shots. Charts, a cursor, notifications, chat,
// badges, keys, confetti. Each reads the style with useLook(), so it takes the video's colours,
// type, corners and bounce. Each comes in at a frame (`start`) and, given `exit`, goes out.
//
// They're 2D: put them over a Stage (in the same AbsoluteFill), or inside a Screen, never on a
// Layer's wrapper. Positions (`x`, `y`, `from`, `rect`...) are px in the parent.
//
// Pieces the graphics share. Not an item: it's copied with any graphic.

export type Pt = {x: number; y: number};

// ---------------------------------------------------------------------------------------------
// Tempo: springs and ramps in the style's bounce and pace

export const useTempo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const len = (n: number) => Math.max(1, Math.round(n * look.pace));
  return {
    frame,
    fps,
    look,
    /** 0 to 1 from `at`, with the style's bounce. */
    pop: (at: number, frames = 22) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: len(frames)}),
    /** 0 to 1 from `at`, settling without bounce. */
    glide: (at: number, frames = 22) => spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: len(frames)}),
    /** 0 to 1 over `frames` from `at`, eased. */
    ramp: (at: number, frames: number, easing: Ease = ease.inOut) =>
      interpolate(frame, [at, at + len(frames)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing}),
    /** 0 before `exit`, 1 once gone. */
    gone: (exit?: number, frames = 12) =>
      exit === undefined ? 0 : spring({frame: frame - exit, fps, config: {damping: 200}, durationInFrames: len(frames)}),
  };
};

export const numberFormat = (decimals: number) => new Intl.NumberFormat('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, type Ease} from '../../kit';
import {type Look, useLook} from '../../look';

// Motion graphics: the pieces laid over or between shots. Charts, a cursor, notifications, chat,
// badges, keys, confetti. Each reads the style with useLook(), so it takes the video's colours,
// type, corners and bounce. Each comes in at a frame (`start` or `at`) and, given `exit`, goes out.
//
// They're 2D: put them over a Stage (in the same AbsoluteFill), or inside a Screen, never on a
// Layer's wrapper. Positions (`x`, `y`, `from`, `rect`...) are px in the parent.
//
// Pieces the graphics share, and their gallery samples' layout. Not an item: it's copied with any graphic.

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

export const card = (look: Look): React.CSSProperties => ({
  background: look.surface,
  borderRadius: look.radius,
  boxShadow: look.shadow,
});

export const numberFormat = (decimals: number) => new Intl.NumberFormat('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** An accent word in plain text. (The style's `emphasis` may expect a mark behind it, as in bold.) */
export const accentWord = (look: Look): React.CSSProperties => ({...look.emphasis, color: look.accentText});

/** The part of the frame a sample can use: inside the safe area, above the gallery's label. */
export const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = look.height - look.safe.bottom - 170;
  const left = look.safe.left;
  const right = look.width - look.safe.right;
  return {look, top, bottom, left, right, w: right - left, h: bottom - top, cx: (left + right) / 2, cy: (top + bottom) / 2};
};

export const Area: React.FC<{children: React.ReactNode; gap?: number; row?: boolean}> = ({children, gap = 0, row}) => {
  const a = useArea();
  return (
    <div
      style={{
        position: 'absolute',
        left: a.left,
        top: a.top,
        width: a.w,
        height: a.h,
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        flexWrap: row ? 'wrap' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap,
      }}
    >
      {children}
    </div>
  );
};

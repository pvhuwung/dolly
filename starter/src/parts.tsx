import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Kinetic} from './fx/text';
import {alpha, useLook} from './look';

// The 2D pieces laid over the shots, in the look's style and inside the format's safe area.

/**
 * The headline of a shot: a small eyebrow, then a title with an optional accent phrase set the
 * style's way ("Approve it *from your phone.*"). Top left, in the caption band (`look.band`):
 * frame the shot below it with `focusOn({..., ...look.aim})`. Text comes in with the style's
 * effect unless `effect` says otherwise.
 */
export const Caption: React.FC<{
  eyebrow?: string;
  title: string;
  accent?: string;
  start?: number;
  exit?: number;
  size?: number;
  effect?: React.ComponentProps<typeof Kinetic>['effect'];
}> = ({eyebrow, title, accent, start = 8, exit, size, effect}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eIn = spring({frame: frame - start + 4, fps, config: {damping: 200}, durationInFrames: 18});
  const eOut = exit === undefined ? 0 : spring({frame: frame - exit, fps, config: {damping: 200}, durationInFrames: 12});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: look.safe.top,
          left: look.safe.left,
          width: look.width - look.safe.left - look.safe.right,
          display: 'flex',
          flexDirection: 'column',
          gap: Math.round(look.size * 0.2),
        }}
      >
        {eyebrow ? (
          <div style={{...look.eyebrow, fontSize: Math.round(look.size * 0.32), opacity: eIn - eOut, transform: `translateY(${(1 - eIn) * 10}px)`}}>
            {look.eyebrowPrefix}
            {eyebrow}
          </div>
        ) : null}
        <Kinetic text={title} accent={accent} start={start} exit={exit} effect={effect} style={size ? {fontSize: size} : undefined} />
      </div>
    </AbsoluteFill>
  );
};

/** A soft dot that blooms where something was tapped or clicked, in the clip's coordinates. */
export const Tap: React.FC<{x: number; y: number; at: number; color?: string}> = ({x, y, at, color}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at || frame > at + 24) return null;
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 22});
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 26,
        top: y - 26,
        width: 52,
        height: 52,
        borderRadius: 26,
        background: alpha(color ?? look.accent, 0.33),
        transform: `scale(${0.5 + 0.7 * t})`,
        opacity: 1 - t,
      }}
    />
  );
};

/** An outline that draws itself around part of a clip, to point at something. */
export const Callout: React.FC<{x: number; y: number; width: number; height: number; at: number; until?: number; color?: string}> = ({
  x,
  y,
  width,
  height,
  at,
  until,
  color,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 20});
  const out = until === undefined ? 0 : spring({frame: frame - until, fps, config: {damping: 200}, durationInFrames: 12});
  if (t - out <= 0) return null;
  const c = color ?? look.accent;
  const grow = (1 - t) * 18;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - grow,
        top: y - grow,
        width: width + grow * 2,
        height: height + grow * 2,
        borderRadius: Math.max(4, Math.min(look.radius, 16)),
        border: `2px solid ${alpha(c, 0.8)}`,
        boxShadow: `0 0 0 5px ${alpha(c, 0.12)}, 0 0 24px ${alpha(c, 0.15)}`,
        opacity: t - out,
      }}
    />
  );
};

/** A small "4× speed" chip at the top right, so sped-up footage reads as sped up. */
export const Speed: React.FC<{label: string}> = ({label}) => {
  const look = useLook();
  return (
    <div
      style={{
        position: 'absolute',
        top: look.safe.top + 8,
        right: look.safe.right,
        padding: '8px 16px',
        borderRadius: 999,
        fontFamily: look.fonts.body,
        fontSize: 22,
        fontWeight: 600,
        color: look.dim,
        background: look.surface,
        boxShadow: `0 0 0 1px ${look.line}, 0 4px 14px rgba(0, 0, 0, 0.06)`,
      }}
    >
      {label}
    </div>
  );
};

/** Fades and lifts its children in at frame `at`. */
export const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 22});
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * 18}px)`, ...style}}>{children}</div>;
};

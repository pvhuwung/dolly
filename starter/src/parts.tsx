import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily, serifFamily} from './brand';
import {Words} from './kit';

// The 2D pieces laid over the shots, in the brand's look.

/** The top of the frame kept for captions. Shots frame their subject below it. */
export const SAFE_TOP = 230;

/**
 * The headline of a shot: a small uppercase eyebrow, a serif title, and an optional italic accent
 * phrase in the brand colour ("Approve it *from your phone.*"). Top left, in the caption band.
 */
export const Caption: React.FC<{
  eyebrow?: string;
  title: string;
  accent?: string;
  start?: number;
  exit?: number;
  size?: number;
}> = ({eyebrow, title, accent, start = 8, exit, size = 62}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eIn = spring({frame: frame - start + 4, fps, config: {damping: 200}, durationInFrames: 18});
  const eOut = exit === undefined ? 0 : spring({frame: frame - exit, fps, config: {damping: 200}, durationInFrames: 12});
  const heading: React.CSSProperties = {fontFamily: serifFamily, fontSize: size, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.1, color: brand.ink};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 64, left: 110, display: 'flex', flexDirection: 'column', gap: 12}}>
        {eyebrow ? (
          <div
            style={{
              fontFamily,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 2.6,
              textTransform: 'uppercase',
              color: brand.accentDeep,
              opacity: eIn - eOut,
              transform: `translateY(${(1 - eIn) * 10}px)`,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div style={{display: 'flex', gap: Math.round(size * 0.28)}}>
          <Words text={title} start={start} exit={exit} style={heading} />
          {accent ? (
            <Words
              text={accent}
              start={start + title.split(' ').length * 6}
              exit={exit}
              style={heading}
              wordStyle={{fontStyle: 'italic', color: brand.accent}}
            />
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** A soft dot that blooms where something was tapped or clicked, in the clip's coordinates. */
export const Tap: React.FC<{x: number; y: number; at: number; color?: string}> = ({x, y, at, color = brand.accent}) => {
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
        background: `${color}55`,
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
  color = brand.accent,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 20});
  const out = until === undefined ? 0 : spring({frame: frame - until, fps, config: {damping: 200}, durationInFrames: 12});
  if (t - out <= 0) return null;
  const grow = (1 - t) * 18;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - grow,
        top: y - grow,
        width: width + grow * 2,
        height: height + grow * 2,
        borderRadius: 16,
        border: `2px solid ${color}cc`,
        boxShadow: `0 0 0 5px ${color}1f, 0 0 24px ${color}26`,
        opacity: t - out,
      }}
    />
  );
};

/** A small "4× speed" chip, so sped-up footage reads as sped up. */
export const Speed: React.FC<{label: string}> = ({label}) => (
  <div
    style={{
      position: 'absolute',
      top: 72,
      right: 110,
      padding: '8px 16px',
      borderRadius: 999,
      fontFamily,
      fontSize: 22,
      fontWeight: 600,
      color: brand.dim,
      background: brand.card,
      boxShadow: '0 4px 14px rgba(20,19,16,0.06)',
    }}
  >
    {label}
  </div>
);

/** Fades and lifts its children in at frame `at`. */
export const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 22});
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * 18}px)`, ...style}}>{children}</div>;
};

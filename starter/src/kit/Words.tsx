import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {preserve3d} from './Stage';

/**
 * Kinetic type: each word swings up out of the page, one after another. Put it inside a Layer to
 * give it a place in the world, or use it on its own (it brings its own perspective).
 *
 * `start` is the frame the first word starts, `stagger` the frames between words. Keep a line to
 * 2-6 words: the stagger makes long lines slow to read.
 */
export const Words: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  style?: React.CSSProperties;
  /** Frame the words start leaving, or undefined to stay. */
  exit?: number;
}> = ({text, start = 0, stagger = 4, style, exit}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', gap: '0.28em', perspective: 900, ...preserve3d, ...style}}>
      {words.map((word, i) => {
        const inT = spring({frame: frame - start - i * stagger, fps, config: {damping: 200}, durationInFrames: 24});
        const outT =
          exit === undefined
            ? 0
            : spring({frame: frame - exit - i * Math.ceil(stagger / 2), fps, config: {damping: 200}, durationInFrames: 14});
        const t = inT - outT;
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: 'inline-block',
              transformOrigin: '50% 100%',
              transform: `translateY(${(1 - inT) * 0.35 + outT * -0.2}em) rotateX(${(1 - inT) * -80 + outT * 60}deg)`,
              opacity: Math.max(0, t),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {useLook} from '../../../look';
import {knocksOut} from '../_shared';

/**
 * One slot whose word changes every `every` frames: the old word slides up and out, the new one
 * slides up in, and the slot's width eases between them so the rest of the line moves smoothly.
 * Set in the accent's emphasis. Put it after a Kinetic line in a baseline-aligned row:
 *
 *   <div style={{display: 'flex', alignItems: 'baseline', columnGap: '0.28em'}}>
 *     <Kinetic text="Videos that feel" /> <Cycle words={['fast.', 'polished.', 'yours.']} start={30} />
 *   </div>
 */
export const Cycle: React.FC<{
  /** The words it cycles through, in order; it loops. */
  words: string[];
  /** Frames each word holds before the next comes in; 45 times the style's pace if not set. */
  every?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** CSS merged over the headline and accent style: font size, colour. */
  style?: React.CSSProperties;
}> = ({words, every, start = 0, style}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const period = every ?? Math.round(45 * look.pace);
  const swap = Math.round(16 * look.pace);
  const emphasis = knocksOut(look) ? {...look.emphasis, color: look.headline.color} : look.emphasis;
  const k = Math.max(0, Math.floor((frame - start) / period));
  const local = interpolate(frame - start - k * period, [0, swap], [0, 1], {easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const now = words[k % words.length];
  const before = k > 0 ? words[(k - 1) % words.length] : null;
  // Two invisible spacers, sized with calc-size() to a share of each word's own width: together they
  // make the slot's width ease from one word to the next.
  const spacer = (word: string, share: number) => (
    <span style={{display: 'inline-block', overflow: 'hidden', visibility: 'hidden', whiteSpace: 'nowrap', width: `calc-size(max-content, size * ${share})`}}>
      {word}
    </span>
  );
  const word = (w: string, y: number, opacity: number) => (
    <span style={{position: 'absolute', left: 0, top: '0.12em', whiteSpace: 'nowrap', transform: `translateY(${y}%)`, opacity}}>{w}</span>
  );
  return (
    <span
      style={{
        ...look.headline,
        fontSize: look.size,
        ...emphasis,
        ...style,
        position: 'relative',
        display: 'inline-flex',
        overflowY: 'clip',
        padding: '0.12em 0 0.18em',
        margin: '-0.12em 0 -0.18em',
      }}
    >
      {before ? spacer(before, 1 - local) : null}
      {spacer(now, before ? local : 1)}
      {before ? word(before, -local * 110, 1 - local) : null}
      {word(now, (1 - local) * 110, frame < start ? 0 : before ? local : 1)}
    </span>
  );
};

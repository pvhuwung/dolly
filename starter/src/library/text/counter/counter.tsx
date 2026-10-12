import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {useLook} from '../../../look';

const outEase = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A number counting up (or down) from `from` to `to` over `frames`, easing out, with thousands
 * separators and tabular figures. Its width is the final number's, so nothing around it moves.
 *
 *   <Counter to={12480} suffix="+" start={20} />
 */
export const Counter: React.FC<{
  /** The number it counts to. */
  to: number;
  /** The number it counts from (default 0). */
  from?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the count takes; 50 times the style's pace if not set. */
  frames?: number;
  /** Digits after the decimal point (default 0). */
  decimals?: number;
  /** Text before the number, like $. */
  prefix?: string;
  /** Text after the number, like + or %. */
  suffix?: string;
  /** CSS merged over the headline style: font size, colour. */
  style?: React.CSSProperties;
}> = ({to, from = 0, start = 0, frames, decimals = 0, prefix = '', suffix = '', style}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const length = frames ?? Math.round(50 * look.pace);
  const p = interpolate(frame, [start, start + length], [0, 1], {easing: outEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fmt = (v: number) => v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  const widest = [fmt(from), fmt(to)].sort((a, b) => b.length - a.length)[0];
  return (
    <span style={{...look.headline, fontSize: look.size, ...style, display: 'inline-flex', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
      <span style={{whiteSpace: 'pre'}}>{prefix}</span>
      <span style={{display: 'inline-grid'}}>
        <span style={{gridArea: '1 / 1', visibility: 'hidden'}}>{widest}</span>
        <span style={{gridArea: '1 / 1', textAlign: 'right'}}>{fmt(from + (to - from) * p)}</span>
      </span>
      <span style={{whiteSpace: 'pre'}}>{suffix}</span>
    </span>
  );
};

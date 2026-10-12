import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {Center} from '../_shared';
import {Kinetic} from '../kinetic/kinetic';

const outEase = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A number counting up (or down) from `from` to `to` over `frames`, easing out, with thousands
 * separators and tabular figures. Its width is the final number's, so nothing around it moves.
 *
 *   <Counter to={12480} suffix="+" start={20} />
 */
export const Counter: React.FC<{
  to: number;
  from?: number;
  start?: number;
  frames?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const CounterDemo: React.FC = () => {
  const look = useLook();
  return (
    <Center>
      <Counter to={12480} suffix="+" start={6} style={{fontSize: Math.round(look.size * 2.6), lineHeight: 1}} />
      <Kinetic text="videos rendered this week" effect="fade" start={14} align="center" style={{fontFamily: look.fonts.body, fontSize: Math.max(44, Math.round(look.size * 0.6)), fontWeight: 500, letterSpacing: 0, color: look.dim}} />
    </Center>
  );
};

export const demos: Demo[] = [
  {name: 'Counter', code: '<Counter to={12480} suffix="+" />', seconds: 3, hero: 80, Component: CounterDemo},
];

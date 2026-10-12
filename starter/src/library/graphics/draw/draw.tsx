import React from 'react';
import {ease} from '../../../kit';
import type {Demo} from '../../types';
import {Area, accentWord, useArea, useTempo} from '../_shared';

/**
 * An SVG path that draws itself on from `start` over `frames`, and off again from `exit`. `d` is in
 * a `width` x `height` box. A hand-drawn underline, a scribble, a route on a map. `stretch` lets the
 * box take any CSS size through `style` (for an underline as wide as its word).
 *
 *   <Draw d="M6 26 C 110 10, 250 8, 414 20" width={420} height={40} start={10} />
 */
export const Draw: React.FC<{
  d: string;
  width: number;
  height: number;
  start?: number;
  frames?: number;
  exit?: number;
  color?: string;
  strokeWidth?: number;
  stretch?: boolean;
  style?: React.CSSProperties;
}> = ({d, width, height, start = 0, frames = 36, exit, color, strokeWidth = 6, stretch, style}) => {
  const {look, ramp} = useTempo();
  const t = ramp(start, frames);
  const out = exit === undefined ? 0 : ramp(exit, 18, ease.in);
  // A round cap on a zero-length dash still paints a dot, so hide the path until it has length.
  const shown = t > 0.002 && out < 0.998;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={stretch ? 'none' : undefined}
      style={{overflow: 'visible', display: 'block', ...style}}
    >
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color ?? look.accent}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - t - out}
        opacity={shown ? 1 : 0}
      />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const UNDERLINE = 'M6 24 C 110 9, 250 6, 414 17 M60 36 C 160 27, 270 25, 370 30';

const DrawDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(look.size * 1.6, w / 5.2);
  return (
    <Area>
      <div style={{...look.headline, fontSize: size, display: 'flex', gap: '0.28em', flexWrap: 'wrap', justifyContent: 'center'}}>
        <span>Ship it</span>
        <span style={{position: 'relative', ...accentWord(look)}}>
          today.
          <Draw d={UNDERLINE} width={420} height={40} start={12} frames={26} stretch strokeWidth={7} style={{position: 'absolute', left: '-4%', top: '96%', width: '108%', height: size * 0.32}} />
        </span>
      </div>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Draw a line', code: '<Draw d={UNDERLINE} width={420} height={40} start={12} />', seconds: 2.5, hero: 50, Component: DrawDemo},
];

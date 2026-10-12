import React from 'react';
import {ease} from '../../../kit';
import {useTempo} from '../_shared';

/**
 * An SVG path that draws itself on from `start` over `frames`, and off again from `exit`. `d` is in
 * a `width` x `height` box. A hand-drawn underline, a scribble, a route on a map. `stretch` lets the
 * box take any CSS size through `style` (for an underline as wide as its word).
 *
 *   <Draw d="M6 26 C 110 10, 250 8, 414 20" width={420} height={40} start={10} />
 */
export const Draw: React.FC<{
  /** The SVG path to draw, in a `width` × `height` box. */
  d: string;
  /** Its width in px: the box `d` is drawn in. */
  width: number;
  /** Its height in px: the box `d` is drawn in. */
  height: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the line takes to draw (default 36). */
  frames?: number;
  /** Frame it starts to undraw; it stays to the end if not set. */
  exit?: number;
  /** Its colour; the style's accent if not set. */
  color?: string;
  /** Line width in px (default 6). */
  strokeWidth?: number;
  /** Let `style` size the box to any width and height, stretching the path: for an underline as wide as its word. */
  stretch?: boolean;
  /** CSS for the SVG, to place or size it. */
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

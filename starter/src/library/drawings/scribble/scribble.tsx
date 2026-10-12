import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {DrawOn, InArea, noise, smooth, useArea, useClock, usePalette, type Palette, type Pt} from '../_shared';

/**
 * A marker scribbling back and forth until a shape is filled, in one continuous stroke drawn on
 * from `start`. Behind a word, a number or a price, it says "this one".
 *
 *   <Scribble width={320} height={140} start={10} />
 */
export const Scribble: React.FC<{
  width: number;
  height: number;
  shape?: 'blob' | 'circle';
  density?: number;
  start?: number;
  frames?: number;
  color?: string;
  strokeWidth?: number;
  seed?: number;
  palette?: Partial<Palette>;
}> = ({width, height, shape = 'blob', density = 11, start = 0, frames = 30, color, strokeWidth = 14, seed = 1, palette}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const c = color ?? alpha(p.sun, 0.7);
  const d = useMemo(() => {
    // Zig-zag across slanted lines, each turn landing on the shape's edge.
    const pts: Pt[] = [];
    const slant = 0.35;
    for (let k = 0; k <= density; k++) {
      const s = k / density;
      const y = 0.08 + s * 0.84;
      const span = shape === 'circle' ? Math.sqrt(Math.max(0, 1 - (2 * y - 1) ** 2)) * 0.48 : 0.46 * (0.75 + 0.25 * Math.sin(s * Math.PI)) * (0.85 + noise(`sb-${seed}`, k * 0.8) * 0.3);
      const left = {x: 0.5 - span, y: y + slant * 0.12};
      const right = {x: 0.5 + span, y: y - slant * 0.12};
      const [a, b] = k % 2 ? [right, left] : [left, right];
      pts.push(a, b);
    }
    return smooth(pts.map((q, k) => ({x: q.x * width + (random(`sj-${seed}-${k}`) - 0.5) * 8, y: q.y * height + (random(`sk-${seed}-${k}`) - 0.5) * 6})));
  }, [width, height, shape, density, seed]);
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <DrawOn d={d} t={ramp(start, frames, ease.inOut)} color={c} width={strokeWidth} />
    </svg>
  );
};

const ScribbleDemo: React.FC = () => {
  const {look} = useArea();
  const size = Math.round(look.size * 1.3);
  return (
    <InArea>
      <div style={{...look.headline, fontSize: size, display: 'flex', justifyContent: 'center', alignItems: 'center', columnGap: '0.26em'}}>
        <span>Pick</span>
        <span style={{position: 'relative', display: 'inline-flex', justifyContent: 'center', width: size * 1.75}}>
          <span style={{position: 'absolute', left: -size * 0.2, top: -size * 0.1}}>
            <Scribble width={size * 2.15} height={size * 1.25} start={10} frames={26} />
          </span>
          <span style={{position: 'relative'}}>this</span>
        </span>
        <span>one.</span>
      </div>
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Scribble', code: '<Scribble width={320} height={140} />', seconds: 2.5, hero: 60, Component: ScribbleDemo}];

import React from 'react';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {Area, useArea, useTempo} from '../_shared';

/**
 * A bar filling to `value` percent, its label and percentage above it. For an upload, an index, a
 * deploy: "something is working".
 *
 *   <Progress value={72} label="Indexing repository" start={6} />
 */
export const Progress: React.FC<{
  value: number;
  label?: string;
  width?: number;
  thickness?: number;
  start?: number;
  frames?: number;
  exit?: number;
}> = ({value, label, width = 760, thickness = 16, start = 0, frames = 50, exit}) => {
  const {look, frame, ramp, glide, gone} = useTempo();
  const t = ramp(start + 4, frames, ease.inOut);
  const shown = glide(start, 16);
  const out = gone(exit);
  const done = value >= 100 && t >= 1;
  const r = look.radius === 0 ? 0 : 999;
  const size = Math.max(22, Math.min(38, width * 0.04));
  return (
    <div style={{width, opacity: shown - out, transform: `translateY(${(1 - shown) * 14}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, fontFamily: look.fonts.body, fontSize: size}}>
        <span style={{fontWeight: 600, color: look.ink}}>{label}</span>
        <span style={{fontWeight: 600, color: done ? look.accentText : look.dim, fontVariantNumeric: 'tabular-nums'}}>
          {done ? 'Done' : `${Math.round(value * t)}%`}
        </span>
      </div>
      <div style={{position: 'relative', height: thickness, borderRadius: r, background: alpha(look.ink, look.dark ? 0.14 : 0.09), overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${value * t}%`,
            borderRadius: r,
            background: look.accent,
            // Stripes that keep moving while it works.
            backgroundImage: done ? undefined : `repeating-linear-gradient(-45deg, ${alpha('#ffffff', 0.18)} 0 10px, transparent 10px 20px)`,
            backgroundPosition: `${frame * 1.2}px 0`,
          }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const ProgressDemo: React.FC = () => {
  const {w, look} = useArea();
  const width = Math.min(1000, w * 0.95);
  return (
    <Area gap={look.size * 0.85}>
      <Progress label="Install" value={100} start={4} frames={24} width={width} />
      <Progress label="Build" value={100} start={22} frames={30} width={width} />
      <Progress label="Deploy" value={64} start={44} frames={40} width={width} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Progress bars', code: '<Progress value={64} label="Deploy" />', seconds: 4, hero: 110, Component: ProgressDemo},
];

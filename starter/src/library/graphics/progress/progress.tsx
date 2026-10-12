import React from 'react';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import {useTempo} from '../_shared';

/**
 * A bar filling to `value` percent, its label and percentage above it. For an upload, an index, a
 * deploy: "something is working".
 *
 *   <Progress value={72} label="Indexing repository" start={6} />
 */
export const Progress: React.FC<{
  /** The percentage it fills to; at 100 it says Done. */
  value: number;
  /** Words above the bar, on the left. */
  label?: string;
  /** Its width in px (default 760). */
  width?: number;
  /** Height of the bar in px (default 16). */
  thickness?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the bar takes to fill (default 50). */
  frames?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
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

import React from 'react';
import {ease} from '../../../kit';
import {alpha} from '../../../look';
import {useTempo} from '../_shared';

/**
 * A ring that fills to `value` percent, the number counting up in its middle. For a score, a
 * coverage figure, a quota.
 *
 *   <Ring value={87} label="tests passing" start={8} />
 */
export const Ring: React.FC<{
  /** The percentage it fills to, 0 to 100. */
  value: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the ring takes to fill (default 60). */
  frames?: number;
  /** Its width and height in px (default 320). */
  size?: number;
  /** Width of the ring in px; 7.5% of `size` if not set. */
  thickness?: number;
  /** Words under the number. */
  label?: string;
  /** After the number (default '%'). */
  suffix?: string;
  /** Its colour; the style's accent if not set. */
  color?: string;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({value, start = 0, frames = 60, size = 320, thickness, label, suffix = '%', color, exit}) => {
  const {look, pop, ramp, gone} = useTempo();
  const p = pop(start, 22);
  const t = ramp(start + 4, frames, ease.out);
  const out = gone(exit);
  const w = thickness ?? Math.round(size * 0.075);
  const r = (size - w) / 2;
  const c = 2 * Math.PI * r;
  const arc = (c * Math.min(100, value) * t) / 100;
  return (
    <div style={{position: 'relative', width: size, height: size, opacity: Math.min(1, p * 1.4) - out, transform: `scale(${0.82 + 0.18 * p - 0.06 * out})`}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(look.ink, 0.1)} strokeWidth={w} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? look.accent}
          strokeWidth={w}
          strokeLinecap={look.radius === 0 ? 'butt' : 'round'}
          strokeDasharray={`${arc} ${c}`}
          opacity={arc > 0.5 ? 1 : 0}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.02}}>
        <div style={{...look.headline, fontSize: size * 0.27, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          {Math.round(value * t)}
          <span style={{fontSize: size * 0.13, marginLeft: size * 0.01}}>{suffix}</span>
        </div>
        {label ? (
          <div style={{fontFamily: look.fonts.body, fontSize: Math.max(18, size * 0.065), fontWeight: 500, color: look.dim, textAlign: 'center', maxWidth: size * 0.62}}>
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
};

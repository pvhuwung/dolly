import React from 'react';
import {ease} from '../../../kit';
import {numberFormat, useTempo} from '../_shared';

/**
 * A big number counting up to `value`, its label under it. For the one figure a scene is about.
 * `delta` adds a small chip ("+38%") once the count lands.
 *
 *   <Stat value={12400} label="teams shipping" start={6} />
 */
export const Stat: React.FC<{
  /** The number it counts up to. */
  value: number;
  /** Words under the number. */
  label?: string;
  /** Before the number, like '$'. */
  prefix?: string;
  /** After the number, like '%' or 'k'. */
  suffix?: string;
  /** Decimal places shown (default 0). */
  decimals?: number;
  /** A small chip beside the number once the count lands, like '+38%'. */
  delta?: string;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames the count takes (default 50). */
  frames?: number;
  /** Size of the number in px; twice the style's headline size if not set. */
  size?: number;
  /** 'center' puts the label under the middle of the number, 'left' lines both up on the left (default 'center'). */
  align?: 'left' | 'center';
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({value, label, prefix = '', suffix = '', decimals = 0, delta, start = 0, frames = 50, size, align = 'center', exit}) => {
  const {look, ramp, glide, pop, gone} = useTempo();
  const s = size ?? Math.round(look.size * 2);
  const t = ramp(start, frames, ease.out);
  const label_ = glide(start + 8, 20);
  const chip = pop(start + frames * look.pace - 4, 18);
  const out = gone(exit);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: s * 0.1, opacity: 1 - out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: s * 0.16}}>
        <div style={{...look.headline, fontSize: s, lineHeight: 1, fontVariantNumeric: 'tabular-nums', opacity: Math.min(1, glide(start, 10) * 1.5)}}>
          {prefix}
          {numberFormat(decimals).format(value * t)}
          {suffix}
        </div>
        {delta ? (
          <div
            style={{
              padding: `${s * 0.05}px ${s * 0.12}px`,
              borderRadius: look.radius === 0 ? 0 : 999,
              background: look.accentSoft,
              color: look.accentText,
              fontFamily: look.fonts.body,
              fontWeight: 700,
              fontSize: s * 0.2,
              transform: `scale(${chip})`,
              opacity: Math.min(1, chip * 2),
            }}
          >
            {delta}
          </div>
        ) : null}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: look.fonts.body,
            fontWeight: 500,
            fontSize: Math.max(22, s * 0.22),
            color: look.dim,
            opacity: label_,
            transform: `translateY(${(1 - label_) * 12}px)`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

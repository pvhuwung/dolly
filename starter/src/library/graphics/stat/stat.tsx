import React from 'react';
import {ease} from '../../../kit';
import type {Demo} from '../../types';
import {Area, numberFormat, useArea, useTempo} from '../_shared';

/**
 * A big number counting up to `value`, its label under it. For the one figure a scene is about.
 * `delta` adds a small chip ("+38%") once the count lands.
 *
 *   <Stat value={12400} label="teams shipping" start={6} />
 */
export const Stat: React.FC<{
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: string;
  start?: number;
  frames?: number;
  size?: number;
  align?: 'left' | 'center';
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const StatDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = (look.format !== 'landscape') ? Math.min(look.size * 1.7, w / 4.2) : Math.min(look.size * 2, w / 8);
  return (
    <Area row={!(look.format !== 'landscape')} gap={(look.format !== 'landscape') ? size * 0.6 : size * 1.2}>
      <Stat value={3.2} decimals={1} suffix="×" label="faster builds" start={6} size={size} />
      <Stat value={12400} label="teams shipping" start={12} size={size} />
      <Stat value={99.99} decimals={2} suffix="%" label="uptime" start={18} size={size} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Big number', code: '<Stat value={12400} label="teams shipping" />', seconds: 3.5, hero: 95, Component: StatDemo},
];

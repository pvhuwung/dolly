import React from 'react';
import {alpha} from '../../../look';
import {numberFormat, useTempo} from '../_shared';

/**
 * A bar chart: bars grow in one after another, their values counting up, the `highlight` bar in
 * the accent. For a before and after, growth by month, us against them. `across` lays the bars on
 * their side with the labels on the left: for named categories (where the money goes, who's
 * fastest), and for many bars in a tall frame.
 *
 *   <Bars data={[{label: 'Jan', value: 12}, ...]} highlight={4} start={6} />
 *   <Bars across data={[{label: 'Beans', value: 45}, ...]} highlight={0} width={900} height={560} />
 */
export const Bars: React.FC<{
  /** The bars, in order: a label and a value each. */
  data: {label: string; value: number}[];
  /** Index of the bar drawn in the accent. */
  highlight?: number;
  /** Lay the bars on their side with the labels on the left: for named categories, and for many bars in a tall frame. */
  across?: boolean;
  /** Its width in px (default 900). */
  width?: number;
  /** Its height in px (default 480). */
  height?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames between one bar starting to grow and the next (default 5). */
  stagger?: number;
  /** The value a full bar stands for; the largest value if not set. */
  max?: number;
  /** How a value is written (default a whole number with thousands separators). */
  format?: (n: number) => string;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({data, highlight, across, width = 900, height = 480, start = 0, stagger = 5, max, format = (n) => numberFormat(0).format(n), exit}) => {
  const {look, pop, glide, gone} = useTempo();
  const out = gone(exit);
  const top = Math.max(...data.map((d) => d.value), max ?? 0);
  if (across) {
    const n = data.length;
    const row = height / n;
    const thick = row * 0.62;
    const font = Math.max(26, Math.min(row * 0.42, look.size * 0.55));
    const labelW = Math.round(width * 0.3);
    const valueW = Math.round(font * 3.4);
    const track = width - labelW - valueW;
    return (
      <div style={{position: 'relative', width, height, opacity: 1 - out}}>
        {data.map((d, i) => {
          const g = pop(start + i * stagger, 30);
          const count = glide(start + i * stagger, 34);
          const lit = i === highlight;
          const w = (track * d.value) / top;
          return (
            <div key={d.label} style={{position: 'absolute', left: 0, top: i * row + (row - thick) / 2, width, height: thick, display: 'flex', alignItems: 'center'}}>
              <div style={{width: labelW, paddingRight: 18, textAlign: 'right', fontFamily: look.fonts.body, fontWeight: 600, fontSize: font * 0.82, color: lit ? look.ink : look.dim, opacity: Math.min(1, g * 2), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {d.label}
              </div>
              <div
                style={{
                  width: Math.max(0, w * g),
                  height: thick,
                  borderRadius: Math.min(look.radius, thick * 0.3),
                  background: lit ? look.accent : alpha(look.ink, look.dark ? 0.2 : 0.12),
                  boxShadow: lit && look.dark ? `0 0 40px ${alpha(look.accent, 0.4)}` : undefined,
                }}
              />
              <div style={{paddingLeft: 16, fontFamily: look.fonts.headline, fontWeight: 700, fontSize: font, fontVariantNumeric: 'tabular-nums', color: lit ? look.accentText : look.ink, opacity: Math.min(1, count * 2)}}>
                {format(d.value * count)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  const n = data.length;
  const bar = width / (n + 0.4 * (n - 1));
  const gap = bar * 0.4;
  const labelRow = Math.round(Math.max(22, bar * 0.2) * 1.9);
  const valueRow = Math.round(Math.max(24, bar * 0.24) * 1.6);
  const plot = height - labelRow - valueRow;
  const font = Math.max(22, Math.min(34, bar * 0.24));
  return (
    <div style={{position: 'relative', width, height, opacity: 1 - out}}>
      {data.map((d, i) => {
        const g = pop(start + i * stagger, 30);
        const count = glide(start + i * stagger, 34);
        const h = (plot * d.value) / top;
        const lit = i === highlight;
        const x = i * (bar + gap);
        return (
          <React.Fragment key={d.label}>
            <div
              style={{
                position: 'absolute',
                left: x,
                bottom: labelRow,
                width: bar,
                height: Math.max(0, h * g),
                borderRadius: `${Math.min(look.radius, bar * 0.18)}px ${Math.min(look.radius, bar * 0.18)}px 3px 3px`,
                background: lit ? look.accent : alpha(look.ink, look.dark ? 0.2 : 0.12),
                boxShadow: lit && look.dark ? `0 0 50px ${alpha(look.accent, 0.45)}` : undefined,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - 20,
                width: bar + 40,
                bottom: labelRow + h * g + 10,
                textAlign: 'center',
                fontFamily: look.fonts.headline,
                fontWeight: 700,
                fontSize: font * 1.05,
                fontVariantNumeric: 'tabular-nums',
                color: lit ? look.accentText : look.ink,
                opacity: Math.min(1, count * 2),
              }}
            >
              {format(d.value * count)}
            </div>
            <div
              style={{
                position: 'absolute',
                left: x - 20,
                width: bar + 40,
                bottom: 0,
                height: labelRow - 12,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                fontFamily: look.fonts.body,
                fontWeight: 500,
                fontSize: font * 0.8,
                color: look.dim,
                opacity: Math.min(1, g * 2),
              }}
            >
              {d.label}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: -12, right: -12, bottom: labelRow, height: 2, background: look.line, transformOrigin: '0 50%', transform: `scaleX(${glide(start - 4, 20)})`}} />
    </div>
  );
};

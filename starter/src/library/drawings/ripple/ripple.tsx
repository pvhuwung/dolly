import React, {useMemo} from 'react';
import {random} from 'remotion';
import {ease} from '../../../kit';
import {mix} from '../../../look';
import {Wobble, useClock, useInk, usePalette, useUid, type Palette} from '../_shared';

/**
 * Drops of ink landing one after another and rippling out in wobbly rings, each leaving its blot.
 * For rain on paper, a signal going out, notifications landing.
 *
 *   <Ripple width={700} height={460} drops={6} start={4} />
 */
export const Ripple: React.FC<{
  /** Its width in px. */
  width: number;
  /** Its height in px. */
  height: number;
  /** How many drops land (default 6). */
  drops?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames between one drop and the next (default 9). */
  every?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** Its colour; ink mixed with the palette's sky if not set. */
  color?: string;
  /** Overrides some of the drawing's colours. */
  palette?: Partial<Palette>;
}> = ({
  width,
  height,
  drops = 6,
  start = 0,
  every = 9,
  seed = 1,
  color,
  palette,
}) => {
  const p = usePalette(palette);
  const ink = useInk(p);
  const {ramp, len} = useClock();
  const uid = useUid();
  const c = color ?? mix(ink, p.sky, 0.55);
  const spots = useMemo(
    () =>
      Array.from({length: drops}, (_, i) => ({
        x: (0.14 + random(`rx-${seed}-${i}`) * 0.72) * width,
        y: (0.16 + random(`ry-${seed}-${i}`) * 0.68) * height,
        r: Math.min(width, height) * (0.16 + random(`rr-${seed}-${i}`) * 0.12),
      })),
    [drops, width, height, seed],
  );
  return (
    <svg width={width} height={height} style={{overflow: 'visible', display: 'block'}}>
      <Wobble id={`${uid}w`} seed={seed} scale={5} frequency={0.06} />
      <g filter={`url(#${uid}w)`}>
        {spots.map((s, i) => {
          const at = start + i * len(every) + Math.round(random(`rj-${seed}-${i}`) * 4);
          const blot = ramp(at, 6, ease.out);
          if (blot <= 0) return null;
          return (
            <g key={i}>
              {[0, 1, 2].map((k) => {
                const t = ramp(at + k * 5, 42, ease.out);
                return t <= 0 || t >= 1 ? null : (
                  <circle key={k} cx={s.x} cy={s.y} r={s.r * t * (1 - k * 0.2)} style={{fill: 'none', stroke: c, strokeWidth: 4.5 * (1 - t) + 1, opacity: Math.min(1, (1 - t) * 1.3)}} />
                );
              })}
              <circle cx={s.x} cy={s.y} r={(6 + (i % 3) * 3) * blot} style={{fill: c}} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

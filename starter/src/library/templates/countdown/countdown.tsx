import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, inner, Heading, useStagger} from '../_shared';

/**
 * A countdown to a date: days, hours, minutes and seconds ticking down for real while the scene
 * plays, each digit rolling as it changes. For a launch, an event, a sale ending.
 *
 *   <Countdown title="Doors open" accent="soon." to="Oct 24 · 9:00 AM" from={{days: 12, hours: 4, minutes: 32, seconds: 9}} />
 */
export const Countdown: React.FC<{eyebrow?: string; title?: string; accent?: string; to: string; from: {days: number; hours: number; minutes: number; seconds: number}}> = ({
  eyebrow,
  title,
  accent,
  to,
  from,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = useStagger();
  const total = from.days * 86400 + from.hours * 3600 + from.minutes * 60 + from.seconds;
  const split = (sec: number) => {
    const s = Math.max(0, sec);
    return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  };
  const tick = Math.floor(frame / fps);
  const now = split(total - tick);
  const before = split(total - tick + 1);
  // Each change rolls in over the first frames of its second.
  const roll = interpolate(frame % fps, [0, 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
  // One row of four where the frame is wide enough (16:9, 1:1), two by two in tall ones.
  const grid = look.tall ? 2 : 4;
  const gap = look.format === 'landscape' ? 28 : 22;
  const tw = Math.floor(Math.min((Math.min(inner(look), 1400) - gap * (grid - 1)) / grid, grid === 4 ? 300 : 400));
  const th = Math.round(tw * (grid === 4 ? 1.05 : 0.8));
  const digits = Math.round(th * 0.56);
  const labels = ['Days', 'Hours', 'Min', 'Sec'];
  const toIn = pop(46, 22);
  return (
    <Page gap={Math.round(look.size * 0.55)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap, width: grid === 2 ? tw * 2 + gap : undefined}}>
        {now.map((v, i) => {
          const t = pop(16 + i * Math.round(5 * look.pace), 24);
          const changed = tick > 0 && v !== before[i];
          const show = (n: number) => String(n).padStart(2, '0');
          // Two digits fill a tile; more (214 days) shrink to fit it.
          const fit = 2 / Math.max(2, show(Math.max(v, before[i])).length);
          const digit: React.CSSProperties = {
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            top: '50%',
            lineHeight: 1,
            fontFamily: look.fonts.headline,
            fontSize: Math.round(digits * fit),
            fontWeight: look.headline.fontWeight,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: i === 3 ? look.accentText : look.ink,
          };
          return (
            <div
              key={labels[i]}
              style={{
                width: tw,
                height: th,
                position: 'relative',
                borderRadius: look.radius,
                background: look.surface,
                boxShadow: look.shadow,
                overflow: 'hidden',
                opacity: t,
                transform: `translateY(${(1 - t) * 30}px)`,
              }}
            >
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: th * 0.2, overflow: 'hidden'}}>
                {changed ? <div style={{...digit, transform: `translateY(${-50 - roll * 110}%)`, opacity: 1 - roll}}>{show(before[i])}</div> : null}
                <div style={{...digit, transform: `translateY(${-50 + (changed ? (1 - roll) * 110 : 0)}%)`, opacity: changed ? roll : 1}}>{show(v)}</div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: th * 0.08,
                  textAlign: 'center',
                  fontFamily: look.fonts.body,
                  fontSize: Math.round(Math.max(26, th * 0.1)),
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: look.dim,
                }}
              >
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 34, color: look.dim, opacity: toIn, transform: `translateY(${(1 - toIn) * 12}px)`}}>{to}</div>
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Countdown', code: '<Countdown title="Doors open" to="Oct 24 · 9:00 AM" from={{days, hours, minutes, seconds}} />', seconds: 4, hero: 96, backdrop: false, Component: () => <Countdown title="Doors open" accent="soon." to="Oct 24 · 9:00 AM" from={{days: 12, hours: 4, minutes: 32, seconds: 9}} />},
];

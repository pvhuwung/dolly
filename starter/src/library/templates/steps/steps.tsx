import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useLook} from '../../../look';
import {Page, inner} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** Numbered steps joined by a line that draws from one to the next: how it works. */
export const Steps: React.FC<{
  /** The headline, before its accent phrase. */
  title?: string;
  /** The phrase set in the style's accent way, after the title. */
  accent?: string;
  /** The steps in order, one short line each. */
  steps: string[];
}> = ({title, accent, steps}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const row = look.format === 'landscape';
  const every = Math.round(22 * look.pace);
  const first = 20;
  const dot = 84;
  const progress = interpolate(frame, [first, first + every * (steps.length - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Labels are centred under their dots, so leave half a label of room at each end.
  const span = row ? Math.min(inner(look) - 400, 1400) : Math.min(look.height - look.band - look.safe.bottom, 160 * steps.length);
  return (
    <Page gap={Math.round(look.size * 0.8)}>
      {title ? <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} /> : null}
      <div style={{position: 'relative', display: 'flex', flexDirection: row ? 'row' : 'column', justifyContent: 'space-between', [row ? 'width' : 'height']: span, alignSelf: 'center', minWidth: row ? undefined : Math.min(inner(look), 760)}}>
        {/* The line behind the dots, and its drawn part. */}
        <div style={{position: 'absolute', background: look.line, ...(row ? {left: dot / 2, right: dot / 2, top: dot / 2 - 2, height: 4} : {top: dot / 2, bottom: dot / 2, left: dot / 2 - 2, width: 4})}} />
        <div
          style={{
            position: 'absolute',
            background: look.accent,
            ...(row
              ? {left: dot / 2, width: `calc((100% - ${dot}px) * ${progress})`, top: dot / 2 - 2, height: 4}
              : {top: dot / 2, height: `calc((100% - ${dot}px) * ${progress})`, left: dot / 2 - 2, width: 4}),
          }}
        />
        {steps.map((s, i) => {
          const t = spring({frame: frame - first - i * every, fps, config: look.spring, durationInFrames: 22});
          return (
            <div key={s} style={{position: 'relative', display: 'flex', flexDirection: row ? 'column' : 'row', alignItems: row ? 'center' : 'center', gap: 22, width: row ? dot : undefined}}>
              <div
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  flexShrink: 0,
                  background: t > 0.5 ? look.accent : look.surface,
                  color: t > 0.5 ? look.onAccent : look.dim,
                  boxShadow: `0 0 0 ${t > 0.5 ? 8 : 2}px ${t > 0.5 ? alpha(look.accent, 0.18) : look.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: look.fonts.body,
                  fontSize: 38,
                  fontWeight: 700,
                  transform: `scale(${0.7 + 0.3 * t})`,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  ...(row ? {position: 'absolute', top: dot + 24, left: dot / 2 - 200, width: 400, textAlign: 'center'} : {}),
                  fontFamily: look.fonts.body,
                  fontSize: 44,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: look.ink,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 14}px)`,
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

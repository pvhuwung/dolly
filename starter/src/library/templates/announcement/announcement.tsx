import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useLook} from '../../../look';
import {Page, Eyebrow, inner, useStagger} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/**
 * Big news: the headline lands, a glint runs across it and a stroke draws under it, then a line of
 * detail. For funding, a milestone, a launch date, a partnership.
 *
 *   <Announcement eyebrow="Big news" text="We raised $18M" accent="to build what's next." detail="Series A" />
 */
export const Announcement: React.FC<{
  /** A small label above the headline. */
  eyebrow?: string;
  /** The news, before its accent phrase. */
  text: string;
  /** The phrase set in the style's accent way, after the text. */
  accent?: string;
  /** A line of detail under it. */
  detail?: string;
  /** The headline's font size in px; sized to the frame if not set. */
  size?: number;
}> = ({eyebrow, text, accent, detail, size}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const pop = useStagger();
  const words = `${text} ${accent ?? ''}`.trim().split(/\s+/).length;
  const landed = 10 + words * Math.round(5 * look.pace) + 16;
  const punch = interpolate(frame, [landed, landed + 6, landed + 16], [1, 1.035, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glint = interpolate(frame, [landed + 2, landed + 30], [-0.4, 1.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const underline = interpolate(frame, [landed + 4, landed + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
  const detailIn = pop(landed + 18, 22);
  const maxWidth = look.tall ? inner(look) : 1500;
  return (
    <Page gap={Math.round(look.size * 0.45)}>
      <Eyebrow text={eyebrow} />
      <div style={{position: 'relative', display: 'inline-block', maxWidth, transform: `scale(${punch})`}}>
        <Kinetic text={text} accent={accent} start={6} align="center" style={{fontSize: size ?? Math.round(look.size * (look.tall ? 1.2 : 1.5))}} />
        {/* The glint: a soft band of light crossing the words, clipped to their box. */}
        <div style={{position: 'absolute', inset: '-10% 0', overflow: 'hidden', pointerEvents: 'none'}}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '28%',
              left: `${glint * 100 - 14}%`,
              transform: 'skewX(-18deg)',
              background: `linear-gradient(90deg, transparent, ${look.dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.65)'}, transparent)`,
              opacity: glint > -0.4 && glint < 1.4 ? 1 : 0,
            }}
          />
        </div>
        {/* A stroke under the headline, narrower than it: a flourish, whatever the line breaks. */}
        <svg width="56%" height={36} viewBox="0 0 1000 36" preserveAspectRatio="none" style={{display: 'block', overflow: 'visible', margin: '14px auto 0'}}>
          <path
            d="M 8 24 C 240 10, 520 32, 760 16 S 960 18, 992 14"
            pathLength={1}
            fill="none"
            stroke={look.accent}
            strokeWidth={7}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="1"
            strokeDashoffset={1 - underline}
            opacity={underline > 0.002 ? 1 : 0}
          />
        </svg>
      </div>
      {detail ? (
        <div
          style={{
            fontFamily: look.fonts.body,
            fontSize: Math.round(look.size * 0.6),
            color: look.dim,
            textAlign: 'center',
            maxWidth,
            opacity: detailIn,
            transform: `translateY(${(1 - detailIn) * 16}px)`,
          }}
        >
          {detail}
        </div>
      ) : null}
    </Page>
  );
};

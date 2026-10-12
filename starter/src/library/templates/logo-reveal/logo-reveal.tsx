import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useBrand, useLook} from '../../../look';
import {useIn, Page} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** The logo arriving, then the name and a line under it. `kind` picks the entrance. */
export const LogoReveal: React.FC<{
  /** How the logo arrives: `pop`, `iris`, `slide` or `focus`; `pop` if not set. */
  kind?: 'pop' | 'iris' | 'slide' | 'focus';
  /** A line under the name, before its accent phrase. */
  tagline?: string;
  /** The phrase set in the style's accent way, after the tagline. */
  accent?: string;
  /** An image in public/; the brand's logo if not set. */
  logo?: string;
  /** The name under the logo; the brand's name if not set. */
  name?: string;
}> = ({
  kind = 'pop',
  tagline,
  accent,
  logo,
  name,
}) => {
  const look = useLook();
  const b = useBrand();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = look.tall ? 240 : 220;
  const t = spring({frame, fps, config: kind === 'pop' ? {damping: 12, stiffness: 120, mass: 0.9} : look.spring, durationInFrames: kind === 'pop' ? undefined : 34});
  const nameIn = useIn(kind === 'slide' ? 14 : 18);
  const logoStyle: React.CSSProperties =
    kind === 'pop'
      ? {transform: `scale(${0.4 + 0.6 * t})`, opacity: Math.min(1, t * 2)}
      : kind === 'iris'
        ? {clipPath: `circle(${t * 75}% at 50% 50%)`}
        : kind === 'focus'
          ? {filter: `blur(${(1 - t) * 30}px)`, transform: `scale(${1.25 - 0.25 * t})`, opacity: t}
          : {transform: `translateX(${(1 - t) * -80}px)`, opacity: t};
  const ring = kind === 'focus' ? interpolate(frame, [10, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <Page gap={30}>
      <div style={{position: 'relative', width: size, height: size}}>
        {ring > 0 && ring < 1 ? (
          <div style={{position: 'absolute', inset: -size * 0.4 * ring, borderRadius: '50%', border: `3px solid ${alpha(look.accent, 1 - ring)}`}} />
        ) : null}
        <Img src={staticFile(logo ?? b.logo)} style={{width: size, height: size, filter: 'drop-shadow(0 26px 40px rgba(0, 0, 0, 0.18))', ...logoStyle}} />
      </div>
      <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 112, opacity: nameIn, transform: `translateY(${(1 - nameIn) * 30}px)`}}>
        {name ?? b.name}
      </div>
      {tagline ? <Kinetic text={tagline} accent={accent} start={34} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.72), color: look.dim, maxWidth: 1300}} /> : null}
    </Page>
  );
};

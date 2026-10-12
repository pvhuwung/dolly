import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ArrowRight} from 'lucide-react';
import {alpha, useBrand, useLook} from '../../../look';
import {useIn, Page} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** The ask, big and held: the name, one line, a button and where to go. */
export const EndCard: React.FC<{
  /** One line under the name, before its accent phrase. */
  line?: string;
  /** The phrase set in the style's accent way, after the line. */
  accent?: string;
  /** The button's words; `Get started` if not set. */
  button?: string;
  /** Where to go, under the button; the brand's URL if not set. */
  url?: string;
}> = ({line, accent, button = 'Get started', url}) => {
  const look = useLook();
  const b = useBrand();
  const frame = useCurrentFrame();
  const logo = useIn(0, 30);
  const press = useIn(56);
  const urlIn = useIn(70);
  // A glint across the button once it's in.
  const glint = interpolate(frame, [80, 110], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Page gap={34}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`}}>
        <Img src={staticFile(b.logo)} style={{width: 110, height: 110}} />
        <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 96}}>{b.name}</div>
      </div>
      {line ? (
        <div style={{width: '100%', maxWidth: 1500}}>
          <Kinetic text={line} accent={accent} start={16} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.9)}} />
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 10,
          padding: '22px 40px',
          borderRadius: look.radius > 12 ? 999 : look.radius,
          background: look.accent,
          color: look.onAccent,
          fontFamily: look.fonts.body,
          fontSize: 46,
          fontWeight: 700,
          opacity: press,
          transform: `translateY(${(1 - press) * 24}px) scale(${0.9 + 0.1 * press})`,
          boxShadow: `0 18px 40px ${alpha(look.accent, 0.35)}`,
        }}
      >
        {button}
        <ArrowRight size={36} strokeWidth={2.6} />
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${glint}%`, width: '30%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)'}} />
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 38, color: look.dim, opacity: urlIn}}>{url ?? b.url}</div>
    </Page>
  );
};

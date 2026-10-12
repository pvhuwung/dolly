import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Kinetic} from '../fx/text';
import {useBrand, useLook} from '../look';
import {Pop} from '../parts';
import {Wordmark} from './Logo';

// END: the ask, big and held. The button names the App Store in words; for Apple's own "Download on
// the App Store" badge, use the artwork from Apple's marketing site as supplied, not a redrawing.
export const End: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  const inner = look.width - look.safe.left - look.safe.right;
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, padding: `0 ${look.safe.right}px 0 ${look.safe.left}px`}}>
        <Wordmark width={Math.min(680, inner)} land={0} />
        <Kinetic text="Design it with your client," accent="right there." start={18} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.9), maxWidth: 1500}} />
        <Pop
          at={60}
          style={{
            marginTop: 16,
            padding: '24px 44px',
            borderRadius: look.radius > 12 ? 999 : Math.max(look.radius, 6),
            background: look.ink,
            color: look.background,
            fontFamily: look.fonts.body,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          Download on the App Store
        </Pop>
        <Pop at={74} style={{fontFamily: look.fonts.mono, fontSize: 36, color: look.dim}}>
          {brand.url}
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

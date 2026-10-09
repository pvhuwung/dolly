import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {brand, fontFamily, logoSvg} from '../brand';
import {Words} from '../kit';
import {Logo3D} from '../three/Logo3D';

// Recipe: 3D END CARD. A real extruded logo (three.js) over the same CSS background, with the name
// and the call to action in flat type underneath, where it stays crisp and readable.
export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(28% 32% at 50% 40%, ${brand.accent}55 0%, transparent 70%)`,
        }}
      />
      <Logo3D svg={logoSvg} accent={brand.accent} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170, gap: 18}}>
        <Words text={brand.name} start={34} style={{fontFamily, fontSize: 92, fontWeight: 800, color: brand.ink, letterSpacing: -2}} />
        <Words text={brand.tagline} start={48} stagger={3} style={{fontFamily, fontSize: 38, fontWeight: 400, color: brand.dim}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

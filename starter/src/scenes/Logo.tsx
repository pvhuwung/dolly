import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {accentStyle, brand, fontFamily, serifFamily} from '../brand';
import {Words} from '../kit';

/** The app icon, landing with the only bounce in the video. */
export const Icon: React.FC<{size: number; land: number}> = ({size, land}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - land, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${0.6 + 0.4 * t}) translateY(${(1 - t) * 40}px)`,
        opacity: Math.min(1, t * 2),
        filter: 'drop-shadow(0 26px 40px rgba(20,19,16,0.16))',
      }}
    >
      <Img src={staticFile(brand.logo)} style={{width: size, height: size}} />
    </div>
  );
};

// LOGO: the answer to the hook, on the beat.
export const Logo: React.FC = () => (
  <AbsoluteFill style={{background: brand.background, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
    <Icon size={220} land={0} />
    <Words text={brand.name} start={16} style={{fontFamily, fontSize: 112, fontWeight: 700, color: brand.ink, letterSpacing: -3.5}} />
    <div style={{display: 'flex', gap: 13}}>
      <Words text="Run agents in parallel." start={30} stagger={4} style={{fontFamily: serifFamily, fontSize: 44, fontWeight: 500, color: brand.dim}} />
      <Words
        text="Manage them all in one place."
        start={50}
        stagger={3}
        style={{fontFamily: serifFamily, fontSize: 44, fontWeight: 500}}
        wordStyle={accentStyle}
      />
    </div>
  </AbsoluteFill>
);

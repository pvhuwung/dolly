import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {Extrude, Layer, Stage, Words} from '../kit';

// END CARD. The logo swings in with real thickness and keeps turning gently, so light keeps moving
// across it. The name and the call to action sit flat underneath, where they read clearly.
export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const swing = spring({frame, fps, config: {damping: 14}, durationInFrames: 50}); // a little bounce: logos only
  const ry = (1 - swing) * -75 + Math.sin(frame / 22) * 18;
  const rx = (1 - swing) * 20 + Math.sin(frame / 31) * 6;

  return (
    <Stage camera={{dolly: (frame / durationInFrames) * 120, pitch: 3}} background={brand.background} font={fontFamily}>
      <Layer z={-300} y={-120}>
        <div style={{width: 1400, height: 1000, background: `radial-gradient(closest-side, ${brand.accent}44, transparent)`}} />
      </Layer>
      <Layer y={-120} rx={rx} ry={ry}>
        <Extrude src={brand.logo} size={400} depth={40} shine={ry / 30} />
      </Layer>
      <Layer y={190}>
        <Words text={brand.name} start={30} style={{fontSize: 92, fontWeight: 800, color: brand.ink, letterSpacing: -2}} />
      </Layer>
      <Layer y={285}>
        <Words text={brand.tagline} start={44} stagger={3} style={{fontSize: 38, color: brand.dim}} />
      </Layer>
    </Stage>
  );
};

import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Kinetic} from '../fx/text';
import {useLook} from '../look';

/** Spacejot's own wordmark (the mark and the letters, 1200 x 211), landing with the video's only bounce. */
export const Wordmark: React.FC<{width: number; land: number}> = ({width, land}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - land, fps, config: {damping: 16, stiffness: 120, mass: 0.9}});
  return (
    <div style={{width, opacity: Math.min(1, t * 2), transform: `scale(${0.82 + 0.18 * t}) translateY(${(1 - t) * 30}px)`}}>
      <Img src={staticFile('spacejot-wordmark.png')} style={{width, display: 'block'}} />
    </div>
  );
};

// LOGO: the product, on the beat after the hook lands.
export const Logo: React.FC = () => {
  const look = useLook();
  const width = Math.min(860, look.width - look.safe.left - look.safe.right);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44}}>
        <Wordmark width={width} land={2} />
        <Kinetic text="Now on" accent="iPhone." start={20} align="center" style={{fontSize: Math.round(look.size * 1.05)}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

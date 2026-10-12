import React from 'react';
import {AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../backdrop';
import {Kinetic} from '../library';
import {useBrand, useLook} from '../look';

/** The app icon, landing with the only bounce in the video. */
export const Icon: React.FC<{size: number; land: number}> = ({size, land}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - land, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const brand = useBrand();
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        transform: `scale(${0.6 + 0.4 * t}) translateY(${(1 - t) * 40}px)`,
        opacity: Math.min(1, t * 2),
        filter: 'drop-shadow(0 26px 40px rgba(0, 0, 0, 0.18))',
      }}
    >
      <Img src={staticFile(brand.logo)} style={{width: size, height: size}} />
    </div>
  );
};

/** The product's name as a wordmark, in the look's UI face. */
export const wordmark = (look: ReturnType<typeof useLook>, fontSize: number): React.CSSProperties => ({
  ...look.headline,
  fontFamily: look.fonts.body,
  fontWeight: 700,
  fontStyle: 'normal',
  letterSpacing: '-0.03em',
  fontSize,
});

// LOGO: the answer to the hook, on the beat.
export const Logo: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, padding: `0 ${look.safe.right}px 0 ${look.safe.left}px`}}>
        <Icon size={220} land={0} />
        <Kinetic text={brand.name} start={16} effect="rise" style={wordmark(look, 112)} />
        <Kinetic
          text="Run agents in parallel."
          accent="Manage them all in one place."
          start={30}
          stagger={4}
          align="center"
          style={{fontSize: Math.round(look.size * 0.72), color: look.dim, maxWidth: 1300}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

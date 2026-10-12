import React from 'react';
import {Contours} from '../../fx/drawings';
import {alpha, useLook} from '../../look';

/** The Build Log's cover: a dark tile, a contour-map texture in the accent, the title set big. */
export const Cover: React.FC<{size: number; start?: number}> = ({size, start = -200}) => {
  const look = useLook();
  const k = size / 600;
  return (
    <div style={{position: 'relative', width: size, height: size, background: '#15110e', overflow: 'hidden', borderRadius: 18 * k, boxShadow: look.shadow}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.55}}>
        <Contours width={size} height={size} levels={12} start={start} seed={42} color={alpha(look.accent, 0.7)} />
      </div>
      <div style={{position: 'absolute', left: 44 * k, top: 46 * k, fontFamily: look.fonts.mono, fontSize: 26 * k, letterSpacing: '0.12em', color: alpha('#f4ece2', 0.75)}}>A PODCAST ABOUT SHIPPING</div>
      <div
        style={{
          position: 'absolute',
          left: 40 * k,
          bottom: 120 * k,
          fontFamily: look.fonts.headline,
          fontWeight: 700,
          fontSize: 118 * k,
          lineHeight: 0.92,
          letterSpacing: '-0.045em',
          color: '#f4ece2',
        }}
      >
        The
        <br />
        Build Log
      </div>
      <div
        style={{
          position: 'absolute',
          left: 44 * k,
          bottom: 44 * k,
          padding: `${8 * k}px ${16 * k}px`,
          background: look.accent,
          color: look.onAccent,
          fontFamily: look.fonts.mono,
          fontWeight: 600,
          fontSize: 28 * k,
        }}
      >
        EP. 42 · SHIP IT BORING
      </div>
    </div>
  );
};

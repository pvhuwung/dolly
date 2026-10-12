import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';
import {Vignette, backdropDemos} from '../_shared';

// A 256 px tile of grey noise, drawn once by the browser and then only moved around.
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

/** Film grain that dances every frame, under a soft light and a vignette. */
export const backdrop: React.FC<BackdropProps> = ({look, tone, frame}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${alpha('#ffffff', {night: 0.05, mid: 0.08, day: 0.5}[tone])}, transparent 70%)`}} />
    <AbsoluteFill
      style={{
        backgroundImage: NOISE,
        backgroundSize: '256px 256px',
        // A new arrangement of the same grain every frame: it dances like film.
        backgroundPosition: `${Math.floor(random(`grain-x-${frame}`) * 256)}px ${Math.floor(random(`grain-y-${frame}`) * 256)}px`,
        opacity: {night: 0.1, mid: 0.09, day: 0.07}[tone],
      }}
    />
    <Vignette look={look} tone={tone} strength={{night: 0.7, mid: 0.3, day: 0.12}} />
  </AbsoluteFill>
);

export const demos = backdropDemos('grain');

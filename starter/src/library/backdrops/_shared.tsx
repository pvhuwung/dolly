import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Look, alpha} from '../../look';
import type {Tone} from '../types';

// Pieces the backdrops share. Not an item: it's copied with any backdrop.

type ByTone = Record<Tone, number>;

/** Soft corners, so whatever sits in the middle reads first. */
export const Vignette: React.FC<{look: Look; tone: Tone; strength: ByTone}> = ({look, tone, strength}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, ${alpha(tone === 'day' ? look.ink : '#000000', strength[tone])} 100%)`,
    }}
  />
);

/** A grid of hairlines, every `step` px, fading out from the middle. */
export const Hairlines: React.FC<{look: Look; step: number; strength: number; drift?: number}> = ({look, step, strength, drift = 0}) => {
  const c = alpha(look.ink, strength);
  const mask = 'radial-gradient(ellipse 70% 65% at 50% 45%, black 0%, transparent 80%)';
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        backgroundSize: `${step}px ${step}px`,
        backgroundPosition: `${look.width / 2}px ${look.height / 2 - drift}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};

/** A soft round light, `size` px across, centred at (x, y) in fractions of the frame. */
export const Orb: React.FC<{look: Look; x: number; y: number; size: number; color: string; strength: number}> = ({look, x, y, size, color, strength}) => (
  <div
    style={{
      position: 'absolute',
      left: x * look.width - size / 2,
      top: y * look.height - size / 2,
      width: size,
      height: size,
      background: `radial-gradient(circle, ${alpha(color, strength)} 0%, ${alpha(color, strength * 0.45)} 32%, transparent 68%)`,
    }}
  />
);

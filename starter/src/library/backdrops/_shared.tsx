import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../../backdrop';
import {Look, alpha, useLook} from '../../look';
import type {Demo, Tone} from '../types';

// Pieces the backdrops share, and their gallery sample. Not an item: it's copied with any backdrop.

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

/** A plain card with a few skeleton lines, to show how a backdrop sits behind content. */
const SampleCard: React.FC = () => {
  const look = useLook();
  const w = look.tall ? look.width * 0.72 : look.format === 'square' ? look.width * 0.66 : look.width * 0.42;
  const h = w * 0.6;
  const bar = (width: number, color: string, height = h * 0.07) => (
    <div style={{width: `${width * 100}%`, height, borderRadius: Math.min(look.radius, height / 2), background: color}} />
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
      <div
        style={{
          width: w,
          height: h,
          boxSizing: 'border-box',
          padding: w * 0.07,
          display: 'flex',
          flexDirection: 'column',
          gap: h * 0.075,
          borderRadius: look.radius,
          background: look.surface,
          boxShadow: look.shadow,
        }}
      >
        {bar(0.18, look.accent, h * 0.05)}
        {bar(0.72, alpha(look.ink, 0.85), h * 0.1)}
        {bar(0.9, alpha(look.ink, 0.12))}
        {bar(0.8, alpha(look.ink, 0.12))}
        {bar(0.55, alpha(look.ink, 0.12))}
      </div>
    </AbsoluteFill>
  );
};

/** The gallery sample for a backdrop: the backdrop with a card on it. */
export const backdropDemos = (kind: Parameters<typeof Backdrop>[0]['kind'] & string): Demo[] => [
  {
    name: `Backdrop: ${kind}`,
    code: `<Backdrop kind="${kind}" />`,
    seconds: 3,
    hero: 45,
    Component: () => (
      <AbsoluteFill>
        <Backdrop kind={kind} />
        <SampleCard />
      </AbsoluteFill>
    ),
  },
];

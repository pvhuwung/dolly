import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop} from '../../backdrop';
import {alpha, useLook} from '../../look';
import type {Demo} from '../types';

// The backdrops' gallery sample. Not an item, and not needed to use one: only the samples import it.

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

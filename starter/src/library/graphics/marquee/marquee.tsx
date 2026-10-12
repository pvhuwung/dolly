import React from 'react';
import type {Demo} from '../../types';
import {useArea, useTempo} from '../_shared';

/**
 * A row of words (or logos) sliding past for ever, one full loop every `loop` seconds, its ends
 * fading out. For "works with", customer logos, a list of features at a glance. Strings are set
 * in the headline face; pass elements for logos.
 *
 *   <Marquee items={['Fast', 'Private', 'Native', 'Open source']} />
 */
export const Marquee: React.FC<{
  items: React.ReactNode[];
  loop?: number;
  gap?: number;
  reverse?: boolean;
  size?: number;
  color?: string;
  start?: number;
  separator?: boolean;
  width?: number | string;
}> = ({items, loop = 9, gap, reverse, size, color, start = 0, separator = true, width = '100%'}) => {
  const {look, frame, fps, glide} = useTempo();
  const s = size ?? Math.round(look.size * 1.1);
  const g = gap ?? s * 0.7;
  const p = (((frame / fps) / loop) % 1 + 1) % 1;
  const shown = glide(start, 20);
  const row = (copy: number) =>
    items.map((item, i) => (
      <div key={`${copy}-${i}`} style={{display: 'flex', alignItems: 'center', gap: g, paddingRight: g, flexShrink: 0}}>
        {typeof item === 'string' ? <span style={{...look.headline, fontSize: s, lineHeight: 1.2, color: color ?? look.ink, whiteSpace: 'nowrap'}}>{item}</span> : item}
        {separator ? <div style={{width: s * 0.18, height: s * 0.18, borderRadius: look.radius === 0 ? 0 : '50%', background: look.accent, flexShrink: 0}} /> : null}
      </div>
    ));
  return (
    <div
      style={{
        width,
        overflow: 'hidden',
        opacity: shown,
        maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div style={{display: 'flex', width: 'max-content', transform: `translateX(${-(reverse ? 1 - p : p) * 50}%)`}}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const MarqueeDemo: React.FC = () => {
  const {look, cy} = useArea();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: cy, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: look.size * 0.5}}>
      <Marquee items={['Native', 'Private', 'Keyboard-first', 'Open source', 'Fast']} />
      <Marquee items={['Claude Code', 'Codex', 'Gemini', 'Aider', 'Cursor']} reverse color={look.dim} size={look.size * 0.75} loop={12} />
    </div>
  );
};

export const demos: Demo[] = [
  {name: 'Marquee', code: "<Marquee items={['Native', 'Private', ...]} />", seconds: 3, hero: 45, Component: MarqueeDemo},
];

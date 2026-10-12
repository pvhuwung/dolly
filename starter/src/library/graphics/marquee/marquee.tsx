import React from 'react';
import {useTempo} from '../_shared';

/**
 * A row of words (or logos) sliding past for ever, one full loop every `loop` seconds, its ends
 * fading out. For "works with", customer logos, a list of features at a glance. Strings are set
 * in the headline face; pass elements for logos.
 *
 *   <Marquee items={['Fast', 'Private', 'Native', 'Open source']} />
 */
export const Marquee: React.FC<{
  /** What slides past: strings are set in the headline face; pass elements for logos. */
  items: React.ReactNode[];
  /** Seconds one full loop takes (default 9). */
  loop?: number;
  /** Space between items in px; 70% of `size` if not set. */
  gap?: number;
  /** Slide the other way. */
  reverse?: boolean;
  /** Size of the words in px; 1.1 times the style's headline size if not set. */
  size?: number;
  /** Colour of the words; the style's ink if not set. */
  color?: string;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Put an accent dot between items (default true). */
  separator?: boolean;
  /** Its width, in px or any CSS width (default '100%'). */
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

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix} from '../../../look';
import type {Demo} from '../../types';
import {Area, accentWord, useArea, useTempo} from '../_shared';

/**
 * Keyboard keys that pop in and press down one after another, held, then let go. For a shortcut
 * the product is built around.
 *
 *   <Keys keys={['⌘', 'K']} at={6} />
 */
export const Keys: React.FC<{keys: string[]; at?: number; stagger?: number; hold?: number; size?: number; exit?: number}> = ({
  keys,
  at = 0,
  stagger = 8,
  hold = 30,
  size = 140,
  exit,
}) => {
  const {look, pop, glide, gone} = useTempo();
  const out = gone(exit);
  const first = at + 18;
  const release = first + (keys.length - 1) * stagger + hold;
  const edge = mix(look.surface, '#000000', look.dark ? 0.55 : 0.16);
  return (
    <div style={{display: 'flex', gap: size * 0.16, opacity: 1 - out}}>
      {keys.map((key, i) => {
        const shown = pop(at + i * 4, 18);
        const down = glide(first + i * stagger, 5) - glide(release, 8);
        const lift = size * 0.07;
        return (
          <div
            key={`${key}-${i}`}
            style={{
              minWidth: size,
              height: size,
              padding: `0 ${size * 0.26}px`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: look.radius === 0 ? 4 : Math.min(look.radius, size * 0.2),
              background: down > 0.5 ? mix(look.surface, look.accent, 0.08) : look.surface,
              border: `1.5px solid ${look.line}`,
              boxShadow: `0 ${lift * (1 - down) + 2}px 0 ${edge}, 0 ${18 - 10 * down}px ${34 - 14 * down}px rgba(0, 0, 0, ${look.dark ? 0.45 : 0.14})`,
              transform: `translateY(${lift * down}px) scale(${shown})`,
              fontFamily: look.fonts.body,
              fontWeight: 600,
              fontSize: size * (key.length > 1 ? 0.3 : 0.42),
              color: down > 0.5 ? look.accent : look.ink,
            }}
          >
            {key}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const KeysDemo: React.FC = () => {
  const {look, w} = useArea();
  return (
    <Area gap={look.size * 0.7}>
      <Keys keys={['⌘', 'K']} at={4} size={Math.min(170, w / 5)} />
      <div style={{...look.headline, fontSize: look.size * 0.8, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 26) / 10))}}>
        Open <span style={accentWord(look)}>anything.</span>
      </div>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Shortcut keys', code: "<Keys keys={['⌘', 'K']} />", seconds: 2.5, hero: 40, Component: KeysDemo},
];

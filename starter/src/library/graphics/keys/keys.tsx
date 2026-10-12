import React from 'react';
import {mix} from '../../../look';
import {useTempo} from '../_shared';

/**
 * Keyboard keys that pop in and press down one after another, held, then let go. For a shortcut
 * the product is built around.
 *
 *   <Keys keys={['⌘', 'K']} start={6} />
 */
export const Keys: React.FC<{
  /** The keys, in the order they go down: '⌘', 'Shift', 'K'. */
  keys: string[];
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frames between one key going down and the next (default 8). */
  stagger?: number;
  /** Frames the keys stay down before they let go (default 30). */
  hold?: number;
  /** Height of a key in px (default 140). */
  size?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({
  keys,
  start: startProp,
  at,
  stagger = 8,
  hold = 30,
  size = 140,
  exit,
}) => {
  const start = startProp ?? at ?? 0;
  const {look, pop, glide, gone} = useTempo();
  const out = gone(exit);
  const first = start + 18;
  const release = first + (keys.length - 1) * stagger + hold;
  const edge = mix(look.surface, '#000000', look.dark ? 0.55 : 0.16);
  return (
    <div style={{display: 'flex', gap: size * 0.16, opacity: 1 - out}}>
      {keys.map((key, i) => {
        const shown = pop(start + i * 4, 18);
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

import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {alpha} from '../../../look';
import {useTempo} from '../_shared';

/**
 * A lucide icon (lucide.dev) in a tinted tile that pops in. For feature grids: one per feature, its
 * name under it.
 *
 *   import {Zap} from 'lucide-react';
 *   <Icon icon={Zap} start={8} />
 */
export const Icon: React.FC<{
  /** The lucide icon (lucide.dev): `import {Zap} from 'lucide-react'`. */
  icon: LucideIcon;
  /** Size of the tile in px (default 112). */
  size?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** The tile's fill: 'soft', 'accent' or 'card' (default 'soft'). */
  tone?: 'soft' | 'accent' | 'card';
}> = ({
  icon: Glyph,
  size = 112,
  start: startProp,
  at,
  exit,
  tone = 'soft',
}) => {
  const start = startProp ?? at ?? 0;
  const {look, pop, gone} = useTempo();
  const p = pop(start, 20);
  const out = gone(exit);
  const fill = {soft: look.accentSoft, accent: look.accent, card: look.surface}[tone];
  const ink = {soft: look.accentText, accent: look.onAccent, card: look.accent}[tone];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: look.radius === 0 ? 0 : Math.min(look.radius * 1.2, size * 0.3),
        background: fill,
        border: tone === 'soft' ? `1px solid ${alpha(look.accentText, 0.18)}` : undefined,
        boxShadow: tone === 'soft' ? undefined : look.shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${p * (1 - out * 0.2)}) translateY(${(1 - p) * 20}px)`,
        opacity: Math.min(1, p * 2) - out,
      }}
    >
      <Glyph size={size * 0.48} color={ink} strokeWidth={2} />
    </div>
  );
};

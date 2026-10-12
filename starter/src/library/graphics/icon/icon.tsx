import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {LucideIcon} from 'lucide-react';
import {Bell, GitPullRequest, ShieldCheck, Zap} from 'lucide-react';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {Area, useArea, useTempo} from '../_shared';

/**
 * A lucide icon (lucide.dev) in a tinted tile that pops in. For feature grids: one per feature, its
 * name under it.
 *
 *   import {Zap} from 'lucide-react';
 *   <Icon icon={Zap} at={8} />
 */
export const Icon: React.FC<{icon: LucideIcon; size?: number; at?: number; exit?: number; tone?: 'soft' | 'accent' | 'card'}> = ({
  icon: Glyph,
  size = 112,
  at = 0,
  exit,
  tone = 'soft',
}) => {
  const {look, pop, gone} = useTempo();
  const p = pop(at, 20);
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

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const FEATURES: [LucideIcon, string][] = [
  [Zap, 'Instant'],
  [ShieldCheck, 'Private'],
  [GitPullRequest, 'Reviewed'],
  [Bell, 'Notified'],
];

const IconDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(170, w / 5.5);
  return (
    <Area row gap={(look.format !== 'landscape') ? 56 : 80}>
      {FEATURES.map(([glyph, label], i) => (
        <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: (look.format !== 'landscape') ? w * 0.38 : undefined}}>
          <Icon icon={glyph} size={size} at={4 + i * 6} />
          <div style={{fontFamily: look.fonts.body, fontWeight: 700, fontSize: size * 0.24, color: look.ink, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 12 - i * 6) / 10))}}>
            {label}
          </div>
        </div>
      ))}
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Feature icons', code: '<Icon icon={Zap} at={4} />', seconds: 2.5, hero: 50, Component: IconDemo},
];

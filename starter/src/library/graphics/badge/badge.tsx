import React from 'react';
import type {LucideIcon} from 'lucide-react';
import {alpha} from '../../../look';
import {useTempo} from '../_shared';

/**
 * A pill label that pops in: an icon and a few words. `tone` is how loud it is. `pulse` adds a live
 * dot. For "New", "Beta", "SOC 2", "Live".
 *
 *   <Badge icon={Sparkles} text="New in 2.0" start={10} />
 */
export const Badge: React.FC<{
  /** The words on it. */
  text: string;
  /** A lucide icon before the words. */
  icon?: LucideIcon;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** How loud it is: 'soft', 'accent', 'card' or 'alert' (default 'soft'). */
  tone?: 'accent' | 'soft' | 'card' | 'alert';
  /** Size of the text in px; scaled to the format's headline if not set. */
  size?: number;
  /** Add a live dot that pulses. */
  pulse?: boolean;
}> = ({text, icon: Glyph, start: startProp, at, exit, tone = 'soft', size: sizeProp, pulse}) => {
  const start = startProp ?? at ?? 0;
  const {look, frame, pop, gone} = useTempo();
  // Scales with the format's headline: 30 px in 16:9, 40 in 9:16.
  const size = sizeProp ?? Math.round(look.size * 0.48);
  const p = pop(start, 20);
  const out = gone(exit);
  const colors = {
    accent: {background: look.accent, color: look.onAccent, border: 'none'},
    soft: {background: look.accentSoft, color: look.accentText, border: `1px solid ${alpha(look.accentText, 0.25)}`},
    card: {background: look.surface, color: look.ink, border: `1px solid ${look.line}`},
    alert: {background: look.alert, color: '#ffffff', border: 'none'},
  }[tone];
  const beat = ((frame - start) % 40) / 40;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.35,
        padding: `${size * 0.36}px ${size * 0.66}px`,
        borderRadius: look.radius === 0 ? 0 : 999,
        ...colors,
        boxShadow: tone === 'card' ? look.shadow : undefined,
        fontFamily: look.fonts.body,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transform: `scale(${p * (1 - out * 0.2)}) rotate(${(1 - p) * -8}deg)`,
        opacity: Math.min(1, p * 2) - out,
      }}
    >
      {pulse ? (
        <div style={{position: 'relative', width: size * 0.42, height: size * 0.42}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'currentColor'}} />
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'currentColor', transform: `scale(${1 + beat * 1.6})`, opacity: (1 - beat) * 0.5}} />
        </div>
      ) : Glyph ? (
        <Glyph size={size * 1.05} strokeWidth={2.4} />
      ) : null}
      {text}
    </div>
  );
};

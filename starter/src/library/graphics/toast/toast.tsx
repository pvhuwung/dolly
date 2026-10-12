import React from 'react';
import {Img, staticFile} from 'remotion';
import type {LucideIcon} from 'lucide-react';
import {alpha, useBrand} from '../../../look';
import {useTempo} from '../_shared';

/**
 * A notification sliding in, like macOS or iOS: the app's icon (the brand logo unless `icon` is
 * given), its name and the time, a title and a line of body. For the moment the product tells you
 * something.
 *
 *   <Toast title="Build passed" body="All 214 checks green on main" start={8} />
 */
export const Toast: React.FC<{
  /** The notification's title. */
  title: string;
  /** A line under the title. */
  body?: string;
  /** The app's name; the brand's if not set. */
  app?: string;
  /** The time beside the app's name (default 'now'). */
  time?: string;
  /** A lucide icon on an accent tile, in place of the logo. */
  icon?: LucideIcon;
  /** An image in public/ for the app's icon; the brand logo if not set. */
  logo?: string;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** Its width in px (default 560). */
  width?: number;
  /** Where it slides in from: 'top' or 'right' (default 'top'). */
  from?: 'top' | 'right';
}> = ({title, body, app: appName, time = 'now', icon: IconGlyph, logo: logoFile, start: startProp, at, exit, width = 560, from = 'top'}) => {
  const start = startProp ?? at ?? 0;
  const {look, pop, gone} = useTempo();
  const brand = useBrand();
  const app = appName ?? brand.name;
  const logo = logoFile ?? brand.logo;
  const p = pop(start, 26);
  const out = gone(exit, 14);
  const r = look.radius === 0 ? 0 : Math.max(20, look.radius);
  const s = width / 560;
  const tile = 58 * s;
  const move = from === 'top' ? `translateY(${(1 - p) * -160 - out * 60}px)` : `translateX(${(1 - p) * (width + 120) + out * 80}px)`;
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        display: 'flex',
        gap: 18 * s,
        padding: `${18 * s}px ${22 * s}px`,
        borderRadius: r,
        background: alpha(look.surface, 0.94),
        backdropFilter: 'blur(24px) saturate(1.4)',
        border: `1px solid ${look.line}`,
        boxShadow: look.shadow,
        transform: `${move} scale(${0.94 + 0.06 * p})`,
        opacity: Math.min(1, p * 1.6) - out,
      }}
    >
      {IconGlyph ? (
        <div style={{width: tile, height: tile, flexShrink: 0, borderRadius: r === 0 ? 0 : tile * 0.24, background: look.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <IconGlyph size={tile * 0.55} color={look.onAccent} strokeWidth={2.2} />
        </div>
      ) : (
        <Img src={staticFile(logo)} style={{width: tile, height: tile, flexShrink: 0, borderRadius: r === 0 ? 0 : tile * 0.24, objectFit: 'cover'}} />
      )}
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 * s, fontFamily: look.fonts.body}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17 * s, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: look.dim}}>
          <span>{app}</span>
          <span style={{textTransform: 'none', letterSpacing: 0, fontWeight: 500}}>{time}</span>
        </div>
        <div style={{fontSize: 25 * s, fontWeight: 700, color: look.ink, lineHeight: 1.2}}>{title}</div>
        {body ? <div style={{fontSize: 22 * s, fontWeight: 400, color: look.dim, lineHeight: 1.3}}>{body}</div> : null}
      </div>
    </div>
  );
};

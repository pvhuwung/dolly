import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {Look, MarkKind, alpha, useLook} from '../../look';

// Pieces the text items share: the marks. Not an item: it's copied with any text item.

/** The space between words, in em. Marks reach across it so a phrase reads as one stroke. */
export const GAP = 0.28;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const drawEase = Easing.bezier(0.45, 0, 0.2, 1);

/** The headline's line height as a number, for placing lines and marks against the baseline. */
export const lineHeightOf = (s: React.CSSProperties) => (typeof s.lineHeight === 'number' ? s.lineHeight : 1.1);

/**
 * True when the style sets the accent phrase in the page's own colour (bold: knocked out of a
 * block). Without that block, the phrase falls back to the headline's colour so it stays visible.
 */
export const knocksOut = (look: Look) => look.emphasis.color === look.background;

// ---------------------------------------------------------------------------------------------
// Marks

/**
 * One mark at progress `p` (0 to 1), absolutely placed over its parent (a word or a phrase, which
 * must be `position: relative`). `join` stretches it across the gap to the next word. `children` is
 * the text again, for `block`, which knocks it out of the fill.
 */
export const MarkLayer: React.FC<{kind: MarkKind; p: number; color?: string; join?: boolean; lh: number; children?: React.ReactNode}> = ({
  kind,
  p,
  color,
  join = false,
  lh,
  children,
}) => {
  const look = useLook();
  if (kind === 'none' || p <= 0) return null;
  const c = color ?? look.accent;
  const reach = (pad: number) => `${-(pad + (join ? GAP : 0))}em`;
  // Roughly where the baseline sits in a line box of this line height, in em from its top.
  const baseline = lh / 2 + 0.3;
  const base: React.CSSProperties = {position: 'absolute', pointerEvents: 'none'};
  switch (kind) {
    case 'marker':
      return (
        <span
          style={{
            ...base,
            left: '-0.06em',
            right: reach(0.06),
            top: `${baseline - 0.56}em`,
            height: '0.7em',
            zIndex: -1,
            borderRadius: '0.12em 0.04em 0.16em 0.06em',
            background: knocksOut(look) ? 'rgba(0, 0, 0, 0.22)' : alpha(c, look.dark ? 0.55 : 0.38),
            transformOrigin: '0 50%',
            transform: `skewX(-8deg) scaleX(${p})`,
          }}
        />
      );
    case 'block':
      return (
        <span
          style={{
            ...base,
            left: '-0.12em',
            right: reach(0.12),
            top: '-0.06em',
            bottom: '-0.08em',
            padding: '0.06em 0 0 0.12em',
            zIndex: 1,
            whiteSpace: 'nowrap',
            borderRadius: '0.06em',
            background: c,
            color: look.onAccent,
            textShadow: 'none',
            clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          }}
        >
          {children}
        </span>
      );
    case 'underline':
    case 'strike':
      return (
        <span
          style={{
            ...base,
            left: kind === 'strike' ? '-0.04em' : 0,
            right: reach(kind === 'strike' ? 0.04 : 0),
            top: `${kind === 'strike' ? baseline - 0.3 : baseline + 0.1}em`,
            height: kind === 'strike' ? '0.075em' : '0.07em',
            zIndex: 1,
            borderRadius: '0.04em',
            background: kind === 'strike' ? (color ?? look.alert) : c,
            transformOrigin: '0 50%',
            transform: `scaleX(${p})`,
          }}
        />
      );
    case 'pill':
      return (
        <span
          style={{
            ...base,
            left: '-0.32em',
            right: '-0.32em',
            top: '-0.02em',
            bottom: '-0.04em',
            zIndex: -1,
            borderRadius: 999,
            background: color ? alpha(color, 0.2) : look.accentSoft,
            opacity: clamp01(p * 1.6),
            transform: `scale(${0.85 + 0.15 * p})`,
          }}
        />
      );
    case 'circle': {
      // A loose, slightly tilted ring, swept on clockwise from the upper left.
      const mask = `conic-gradient(from -70deg, #000 ${p * 360}deg, transparent ${p * 360}deg)`;
      return (
        <span
          style={{
            ...base,
            left: '-0.3em',
            right: '-0.3em',
            top: '-0.16em',
            bottom: '-0.2em',
            zIndex: 1,
            border: `0.055em solid ${c}`,
            borderRadius: '48% 52% 46% 54% / 56% 46% 54% 44%',
            transform: 'rotate(-2.5deg)',
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      );
    }
    case 'box': {
      // Four sides drawn one after another, clockwise from the top left.
      const side = (k: number) => clamp01(p * 4 - k);
      const t = '0.05em';
      return (
        <span style={{...base, left: '-0.22em', right: '-0.22em', top: '-0.1em', bottom: '-0.12em', zIndex: 1}}>
          <span style={{...base, left: 0, top: 0, width: '100%', height: t, background: c, transformOrigin: '0 50%', transform: `scaleX(${side(0)})`}} />
          <span style={{...base, right: 0, top: 0, width: t, height: '100%', background: c, transformOrigin: '50% 0', transform: `scaleY(${side(1)})`}} />
          <span style={{...base, right: 0, bottom: 0, width: '100%', height: t, background: c, transformOrigin: '100% 50%', transform: `scaleX(${side(2)})`}} />
          <span style={{...base, left: 0, bottom: 0, width: t, height: '100%', background: c, transformOrigin: '50% 100%', transform: `scaleY(${side(3)})`}} />
        </span>
      );
    }
    default:
      return null;
  }
};

/** Marks that draw around a whole phrase rather than word by word. */
export const WHOLE: MarkKind[] = ['pill', 'circle', 'box'];

/** How far along a mark is `frames` after it starts: springy for the pill, an even draw for the rest. */
export const markProgress = (kind: MarkKind, frame: number, at: number, frames: number, fps: number, look: Look) =>
  kind === 'pill'
    ? spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames)})
    : interpolate(frame, [at, at + frames * (kind === 'circle' ? 1.4 : 1)], [0, 1], {easing: drawEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

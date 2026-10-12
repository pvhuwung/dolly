import React, {useMemo} from 'react';
import {random} from 'remotion';
import {OnPaper, n1, useClock, useUid} from '../_shared';

// The drawings' shared palette and value noise, public from here.
export {noise, type Palette} from '../_shared';

/**
 * A card of warm paper with a faint grain and fibres, a slightly uneven edge and a soft shadow,
 * holding drawings (or anything) centred inside. It slides in from `start`; `rotate` tilts it a few
 * degrees, like cards laid on a table. Line drawings inside use dark ink whatever the page.
 *
 *   <Paper width={560} height={700} rotate={-3}><Flower /></Paper>
 */
export const Paper: React.FC<{
  /** Its width in px. */
  width: number;
  /** Its height in px. */
  height: number;
  /** Tilt in degrees (default 0). */
  rotate?: number;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** The paper's colour (default a warm off-white, #f6f1e5). */
  color?: string;
  /** Changes the grain and the edge; the same seed always draws the same. */
  seed?: number;
  /** Space between the card's edge and what's on it, in px (default 0). */
  padding?: number;
  /** Styles for the card's outer box, to place it. */
  style?: React.CSSProperties;
  /** What sits on the card, centred. */
  children?: React.ReactNode;
}> = ({width, height, rotate = 0, start = 0, color = '#f6f1e5', seed = 1, padding = 0, style, children}) => {
  const {glide} = useClock();
  const uid = useUid();
  const t = glide(start, 26);
  const edge = useMemo(() => {
    const pts: string[] = [];
    const step = 34;
    let i = 0;
    const j = () => (random(`paper-${seed}-${i++}`) - 0.5) * 2.2;
    for (let x = 0; x < width; x += step) pts.push(`${n1(x + j())}px ${n1(1 + j())}px`);
    for (let y = 0; y < height; y += step) pts.push(`${n1(width - 1 + j())}px ${n1(y + j())}px`);
    for (let x = width; x > 0; x -= step) pts.push(`${n1(x + j())}px ${n1(height - 1 + j())}px`);
    for (let y = height; y > 0; y -= step) pts.push(`${n1(1 + j())}px ${n1(y + j())}px`);
    return `polygon(${pts.join(', ')})`;
  }, [width, height, seed]);
  if (t <= 0) return <div style={{width, height, ...style}} />;
  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        opacity: Math.min(1, t * 1.6),
        transform: `translateY(${(1 - t) * 40}px) rotate(${rotate + (1 - t) * 5}deg)`,
        filter: 'drop-shadow(0 18px 24px rgba(42, 32, 60, 0.15)) drop-shadow(0 2px 3px rgba(42, 32, 60, 0.1))',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width,
          height,
          clipPath: edge,
          background: color,
          backgroundImage: 'radial-gradient(ellipse at 50% 42%, transparent 58%, rgba(120, 92, 52, 0.08) 100%)',
        }}
      >
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          <filter id={`${uid}g`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.34  0 0 0 0 0.26  0 0 0 0.32 -0.1" />
          </filter>
          <filter id={`${uid}f`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.22" numOctaves={2} seed={seed + 7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.42 -0.25" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${uid}g)`} />
          <rect width="100%" height="100%" filter={`url(#${uid}f)`} />
        </svg>
        <OnPaper.Provider value>
          <div style={{position: 'absolute', inset: padding, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
        </OnPaper.Provider>
      </div>
    </div>
  );
};

import React, {useMemo} from 'react';
import {random} from 'remotion';
import type {Demo} from '../../types';
import {InArea, OnPaper, n1, useArea, useClock, useUid} from '../_shared';
import {Flower} from '../flower/flower';
import {HexField} from '../hex-field/hex-field';
import {Stamps} from '../stamps/stamps';

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
  width: number;
  height: number;
  rotate?: number;
  start?: number;
  color?: string;
  seed?: number;
  padding?: number;
  style?: React.CSSProperties;
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

const PaperDemo: React.FC = () => {
  const a = useArea();
  // Three cards, overlapping more where the frame is narrow.
  const overlap = a.look.tall ? 0.2 : 0.08;
  const w = Math.min(a.w / (3 - 2 * overlap), a.w * 0.3 + (a.look.tall ? a.w : 0), 470);
  const h = Math.min(w * 1.3, a.h * 0.92);
  const gap = -w * overlap;
  return (
    <InArea>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={-6} start={0} style={{marginRight: gap, zIndex: 1}}>
          <Stamps width={w * 0.84} height={h * 0.86} count={14} start={14} stagger={2} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={2} start={6} style={{zIndex: 2, marginTop: -h * 0.06}} seed={3}>
          <Flower size={w * 0.62} start={18} frames={60} />
        </Paper>
        <Paper width={Math.round(w)} height={Math.round(h)} rotate={7} start={12} style={{marginLeft: gap, zIndex: 1}} seed={5}>
          <HexField width={w * 0.86} height={h * 0.86} radius={w / 17} start={22} frames={40} />
        </Paper>
      </div>
    </InArea>
  );
};

export const demos: Demo[] = [
  {name: 'Paper cards', code: '<Paper width={420} height={540} rotate={-6}>{drawing}</Paper>', seconds: 3.5, hero: 96, Component: PaperDemo},
];

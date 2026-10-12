import React, {useMemo} from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, mix, useLook} from '../../look';

// The hook's drawing: a planet made of farm fields, a dashed orbit around it, and a satellite
// crossing in front, scanning the ground with a cone of light. Drawn in a 1000 x 1000 box around
// the centre; `size` scales it.

const R = 300;
const ORBIT = {rx: 440, ry: 128, tilt: -16};
const FIELDS = ['#6f9452', '#8aa65b', '#a9b866', '#c8b56c', '#b88f55', '#5d8048', '#9bb071'];

const rotate = (x: number, y: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return {x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a)};
};
const orbitAt = (theta: number) => rotate(ORBIT.rx * Math.cos(theta), ORBIT.ry * Math.sin(theta), ORBIT.tilt);

/** Half the orbit as a path: the far side (behind the planet) or the near side. */
const orbitPath = (far: boolean) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const th = (far ? Math.PI : 0) + (i / 60) * Math.PI;
    const p = orbitAt(th);
    pts.push(`${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  return pts.join(' ');
};

export const Planet: React.FC<{size: number; start?: number}> = ({size, start = 0}) => {
  const look = useLook();
  const frame = useCurrentFrame() - start;
  const {fps} = useVideoConfig();
  const grow = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  const orbitIn = interpolate(frame, [8, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // The satellite sweeps across the near side, right to left, scanning as it goes.
  const theta = 0.25 + Math.max(0, frame) * 0.021;
  const sat = orbitAt(theta);
  const near = Math.sin(theta) > 0;
  const satIn = interpolate(frame, [12, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Where the scan lands: on the face of the planet, below the satellite.
  const dist = Math.hypot(sat.x, sat.y) || 1;
  const spot = {x: (sat.x / dist) * Math.min(dist * 0.62, R * 0.72), y: (sat.y / dist) * Math.min(dist * 0.62, R * 0.72) + 18};
  const perp = {x: -(spot.y - sat.y), y: spot.x - sat.x};
  const pl = Math.hypot(perp.x, perp.y) || 1;
  const w = 52;
  const beam = `${sat.x},${sat.y} ${spot.x + (perp.x / pl) * w},${spot.y + (perp.y / pl) * w} ${spot.x - (perp.x / pl) * w},${spot.y - (perp.y / pl) * w}`;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.25);

  // A patchwork of fields, tilted like crop rows seen from above.
  const patches = useMemo(() => {
    const out: {d: string; fill: string}[] = [];
    let n = 0;
    for (let gy = -6; gy <= 6; gy++) {
      for (let gx = -7; gx <= 7; gx++) {
        const cw = 92;
        const ch = 64;
        const j = (k: number) => (random(`orbit-${n}-${k}`) - 0.5) * 18;
        const corners = [
          [gx * cw + j(1), gy * ch + j(2)],
          [(gx + 1) * cw + j(3), gy * ch + j(4)],
          [(gx + 1) * cw + j(5), (gy + 1) * ch + j(6)],
          [gx * cw + j(7), (gy + 1) * ch + j(8)],
        ].map(([x, y]) => rotate(x, y, 24));
        out.push({d: `M ${corners.map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' L ')} Z`, fill: FIELDS[Math.floor(random(`orbit-c-${n}`) * FIELDS.length)]});
        n++;
      }
    }
    return out;
  }, []);

  return (
    <svg viewBox="-500 -500 1000 1000" width={size} height={size} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="orbit-planet">
          <circle r={R} />
        </clipPath>
        <radialGradient id="orbit-light" cx="0.32" cy="0.28" r="0.8">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#1e2814" stopOpacity={0.42} />
        </radialGradient>
        <pattern id="orbit-rows" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
          <line x1={0} y1={0} x2={0} y2={7} stroke="rgba(30, 40, 20, 0.12)" strokeWidth={2.4} />
        </pattern>
      </defs>
      <path d={orbitPath(true)} fill="none" stroke={alpha(look.ink, 0.3)} strokeWidth={3} strokeDasharray="10 12" opacity={orbitIn} />
      {!near ? <Satellite x={sat.x} y={sat.y} opacity={satIn} /> : null}
      <g transform={`scale(${0.86 + 0.14 * grow})`} opacity={grow}>
        <circle r={R + 16} fill={alpha(look.accent, 0.12)} />
        <g clipPath="url(#orbit-planet)">
          <circle r={R} fill="#9fb26a" />
          {patches.map((p, i) => (
            <path key={i} d={p.d} fill={p.fill} stroke="#efe6cf" strokeWidth={3} strokeLinejoin="round" />
          ))}
          <circle r={R} fill="url(#orbit-rows)" />
          <path d="M -320 120 C -160 60, -40 170, 80 90 S 260 40, 340 70" fill="none" stroke="#7fa7c9" strokeWidth={14} strokeLinecap="round" />
          <circle r={R} fill="url(#orbit-light)" />
        </g>
        <circle r={R} fill="none" stroke={alpha(look.ink, 0.15)} strokeWidth={2} />
      </g>
      {near ? (
        <g opacity={satIn}>
          <polygon points={beam} fill={alpha(look.accent, 0.22)} />
          <ellipse cx={spot.x} cy={spot.y} rx={w} ry={w * 0.45} fill="none" stroke={look.accent} strokeWidth={3} opacity={0.5 + 0.4 * pulse} />
        </g>
      ) : null}
      <path d={orbitPath(false)} fill="none" stroke={alpha(look.ink, 0.42)} strokeWidth={3} strokeDasharray="10 12" opacity={orbitIn} />
      {near ? <Satellite x={sat.x} y={sat.y} opacity={satIn} /> : null}
    </svg>
  );
};

/** A small satellite: a body, two solar panels, an antenna. */
const Satellite: React.FC<{x: number; y: number; opacity: number}> = ({x, y, opacity}) => {
  const look = useLook();
  const panel = mix('#2f4a73', look.accent, 0.15);
  return (
    <g transform={`translate(${x} ${y}) rotate(-16)`} opacity={opacity}>
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s < 0 ? -62 : 18} y={-11} width={44} height={22} fill={panel} stroke="#f6f1e5" strokeWidth={2} />
          <line x1={s < 0 ? -40 : 40} y1={-11} x2={s < 0 ? -40 : 40} y2={11} stroke="#f6f1e5" strokeWidth={1.5} />
          <line x1={s < 0 ? -18 : 18} y1={0} x2={s < 0 ? -12 : 12} y2={0} stroke={look.ink} strokeWidth={3} />
        </g>
      ))}
      <rect x={-13} y={-15} width={26} height={30} rx={4} fill={look.ink} />
      <rect x={-7} y={-9} width={14} height={8} rx={2} fill={look.accent} />
      <line x1={0} y1={15} x2={0} y2={28} stroke={look.ink} strokeWidth={3} />
      <circle cx={0} cy={30} r={4} fill={look.ink} />
    </g>
  );
};

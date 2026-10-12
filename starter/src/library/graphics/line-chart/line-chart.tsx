import React, {useId} from 'react';
import {interpolate} from 'remotion';
import {alpha} from '../../../look';
import type {Demo} from '../../types';
import {Area, type Pt, numberFormat, useArea, useTempo} from '../_shared';

/** Catmull-Rom through the points, as cubic Béziers: a smooth line that passes through every value. */
const smoothPath = (pts: Pt[]) => {
  const segs: [Pt, Pt, Pt, Pt][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    segs.push([p1, {x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6}, {x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6}, p2]);
  }
  const d = `M ${pts[0].x} ${pts[0].y} ` + segs.map(([, a, b, p]) => `C ${a.x} ${a.y}, ${b.x} ${b.y}, ${p.x} ${p.y}`).join(' ');
  const at = (s: [Pt, Pt, Pt, Pt], u: number) => {
    const v = 1 - u;
    const k = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
    return {x: s.reduce((sum, p, i) => sum + p.x * k[i], 0), y: s.reduce((sum, p, i) => sum + p.y * k[i], 0)};
  };
  const dense = [...segs.flatMap((s) => Array.from({length: 24}, (_, k) => at(s, k / 24))), pts[pts.length - 1]];
  /** The line's height at `x`. */
  const yAt = (x: number) => {
    const i = Math.max(0, dense.findIndex((p) => p.x >= x) - 1);
    const [a, b] = [dense[i], dense[Math.min(i + 1, dense.length - 1)]];
    return b.x === a.x ? a.y : a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  };
  return {d, yAt};
};

/**
 * A line chart that draws across from `start`, its area filling in under it and a dot riding the
 * head with the current value. For growth, usage, speed over time.
 *
 *   <LineChart values={[12, 18, 15, 26, 31, 29, 44, 58]} start={6} />
 */
export const LineChart: React.FC<{
  values: number[];
  labels?: string[];
  width?: number;
  height?: number;
  start?: number;
  frames?: number;
  min?: number;
  max?: number;
  color?: string;
  format?: (n: number) => string;
  exit?: number;
}> = ({values, labels, width = 960, height = 440, start = 0, frames = 70, min = 0, max, color, format = (n) => numberFormat(0).format(n), exit}) => {
  const {look, ramp, glide, pop, gone} = useTempo();
  const id = useId().replace(/:/g, '');
  const out = gone(exit);
  const stroke = color ?? look.accent;
  const labelRow = labels ? 48 : 0;
  const plot = height - labelRow;
  const top = max ?? Math.max(...values) * 1.12;
  const pts = values.map((v, i) => ({x: (i / (values.length - 1)) * width, y: plot - ((v - min) / (top - min)) * plot}));
  const {d, yAt} = smoothPath(pts);
  const t = ramp(start, frames);
  const headX = t * width;
  const headY = yAt(headX);
  const value = interpolate(headX, pts.map((p) => p.x), values);
  const dot = pop(start, 14);
  const fontSize = Math.max(22, Math.min(30, width * 0.03), Math.round(look.size * 0.42));
  // The value pill sits centred over the head, and slides to one side near the ends so it never
  // hangs past the chart.
  const anchor = interpolate(headX / width, [0, 0.12, 0.88, 1], [-8, -50, -50, -92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', width, height, opacity: 1 - out}}>
      <svg width={width} height={plot} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id={`reveal-${id}`}>
            <rect x={-20} y={-40} width={headX + 20} height={plot + 80} />
          </clipPath>
          <linearGradient id={`area-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={look.dark ? 0.35 : 0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <line key={k} x1={0} x2={width} y1={plot * k} y2={plot * k} stroke={look.line} strokeWidth={k === 1 ? 2 : 1.5} opacity={glide(start - 6, 20)} />
        ))}
        <g clipPath={`url(#reveal-${id})`}>
          <path d={`${d} L ${width} ${plot} L 0 ${plot} Z`} fill={`url(#area-${id})`} />
          <path d={d} fill="none" stroke={stroke} strokeWidth={Math.max(5, width * 0.006)} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle cx={headX} cy={headY} r={20 * dot} fill={alpha(stroke, 0.2)} />
        <circle cx={headX} cy={headY} r={9 * dot} fill={stroke} stroke={look.background} strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: headX,
          top: headY - 26,
          transform: `translate(${anchor}%, -100%) scale(${dot})`,
          padding: '6px 14px',
          borderRadius: look.radius === 0 ? 0 : 999,
          background: look.accent,
          color: look.onAccent,
          fontFamily: look.fonts.body,
          fontWeight: 700,
          fontSize,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {format(value)}
      </div>
      {labels
        ? labels.map((l, i) => (
            <div
              key={l}
              style={{
                position: 'absolute',
                left: (i / (labels.length - 1)) * width,
                bottom: 0,
                transform: 'translateX(-50%)',
                fontFamily: look.fonts.body,
                fontSize: fontSize * 0.8,
                fontWeight: 500,
                color: look.dim,
                opacity: glide(start - 6, 20),
              }}
            >
              {l}
            </div>
          ))
        : null}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const LineDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <LineChart
        values={[12, 18, 15, 26, 31, 29, 44, 58]}
        labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']}
        start={8}
        width={Math.min(1080, w * 0.9)}
        height={Math.min(480, h * 0.72)}
        format={(n) => `${Math.round(n)}k`}
      />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Line chart', code: '<LineChart values={[12, 18, 15, 26, 31, 29, 44, 58]} />', seconds: 4, hero: 104, Component: LineDemo},
];

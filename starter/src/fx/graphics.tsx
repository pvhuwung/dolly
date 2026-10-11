import React, {useId} from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {LucideIcon} from 'lucide-react';
import {Bell, Check, GitPullRequest, Rocket, ShieldCheck, Sparkles, Zap} from 'lucide-react';
import {brand} from '../brand';
import {ease, type Ease} from '../kit';
import {alpha, mix, useLook, type Look} from '../look';
import type {Demo} from './demo';

// Motion graphics: the pieces laid over or between shots. Charts, a cursor, notifications, chat,
// badges, keys, confetti. Each reads the style with useLook(), so it takes the video's colours,
// type, corners and bounce. Each comes in at a frame (`start` or `at`) and, given `exit`, goes out.
//
// They're 2D: put them over a Stage (in the same AbsoluteFill), or inside a Screen, never on a
// Layer's wrapper. Positions (`x`, `y`, `from`, `rect`...) are px in the parent.

type Pt = {x: number; y: number};

// ---------------------------------------------------------------------------------------------
// Tempo: springs and ramps in the style's bounce and pace

const useTempo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const len = (n: number) => Math.max(1, Math.round(n * look.pace));
  return {
    frame,
    fps,
    look,
    /** 0 to 1 from `at`, with the style's bounce. */
    pop: (at: number, frames = 22) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: len(frames)}),
    /** 0 to 1 from `at`, settling without bounce. */
    glide: (at: number, frames = 22) => spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: len(frames)}),
    /** 0 to 1 over `frames` from `at`, eased. */
    ramp: (at: number, frames: number, easing: Ease = ease.inOut) =>
      interpolate(frame, [at, at + len(frames)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing}),
    /** 0 before `exit`, 1 once gone. */
    gone: (exit?: number, frames = 12) =>
      exit === undefined ? 0 : spring({frame: frame - exit, fps, config: {damping: 200}, durationInFrames: len(frames)}),
  };
};

const card = (look: Look): React.CSSProperties => ({
  background: look.surface,
  borderRadius: look.radius,
  boxShadow: look.shadow,
});

const numberFormat = (decimals: number) => new Intl.NumberFormat('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

// ---------------------------------------------------------------------------------------------
// Lines

/**
 * An SVG path that draws itself on from `start` over `frames`, and off again from `exit`. `d` is in
 * a `width` x `height` box. A hand-drawn underline, a scribble, a route on a map. `stretch` lets the
 * box take any CSS size through `style` (for an underline as wide as its word).
 *
 *   <Draw d="M6 26 C 110 10, 250 8, 414 20" width={420} height={40} start={10} />
 */
export const Draw: React.FC<{
  d: string;
  width: number;
  height: number;
  start?: number;
  frames?: number;
  exit?: number;
  color?: string;
  strokeWidth?: number;
  stretch?: boolean;
  style?: React.CSSProperties;
}> = ({d, width, height, start = 0, frames = 36, exit, color, strokeWidth = 6, stretch, style}) => {
  const {look, ramp} = useTempo();
  const t = ramp(start, frames);
  const out = exit === undefined ? 0 : ramp(exit, 18, ease.in);
  // A round cap on a zero-length dash still paints a dot, so hide the path until it has length.
  const shown = t > 0.002 && out < 0.998;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={stretch ? 'none' : undefined}
      style={{overflow: 'visible', display: 'block', ...style}}
    >
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color ?? look.accent}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - t - out}
        opacity={shown ? 1 : 0}
      />
    </svg>
  );
};

/**
 * A curved, hand-drawn arrow from `from` to `to` that draws itself on, its head landing last. For
 * pointing at something in a shot. `bend` curves it (0 straight, + bows to the left of travel).
 *
 *   <Arrow from={{x: 620, y: 360}} to={{x: 1180, y: 560}} start={10} />
 */
export const Arrow: React.FC<{
  from: Pt;
  to: Pt;
  bend?: number;
  start?: number;
  frames?: number;
  exit?: number;
  color?: string;
  strokeWidth?: number;
  head?: number;
}> = ({from, to, bend = 0.25, start = 0, frames = 28, exit, color, strokeWidth = 6, head = 26}) => {
  const {look, ramp} = useTempo();
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = dy / length;
  const ny = -dx / length;
  // Two control points bowed by different amounts read as a hand's stroke, not a compass arc.
  const c1 = {x: from.x + dx * 0.25 + nx * length * bend, y: from.y + dy * 0.25 + ny * length * bend};
  const c2 = {x: from.x + dx * 0.78 + nx * length * bend * 0.55, y: from.y + dy * 0.78 + ny * length * bend * 0.55};
  const angle = Math.atan2(to.y - c2.y, to.x - c2.x);
  const wing = (side: number) => ({x: to.x - head * Math.cos(angle + side * 0.5), y: to.y - head * Math.sin(angle + side * 0.5)});
  const [l, r] = [wing(1), wing(-1)];
  const t = ramp(start, frames);
  const h = ramp(start + frames * 0.78, 9, ease.out);
  const out = exit === undefined ? 0 : ramp(exit, 14, ease.in);
  const stroke = {fill: 'none', stroke: color ?? look.accent, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: '1 1'};
  return (
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - out}}>
      <path d={`M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`} {...stroke} strokeDashoffset={1 - t} opacity={t > 0.002 ? 1 : 0} />
      <path d={`M ${l.x} ${l.y} L ${to.x} ${to.y} L ${r.x} ${r.y}`} {...stroke} strokeDashoffset={1 - h} opacity={h > 0.002 ? 1 : 0} />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// Numbers and charts

/**
 * A ring that fills to `value` percent, the number counting up in its middle. For a score, a
 * coverage figure, a quota.
 *
 *   <Ring value={87} label="tests passing" start={8} />
 */
export const Ring: React.FC<{
  value: number;
  start?: number;
  frames?: number;
  size?: number;
  thickness?: number;
  label?: string;
  suffix?: string;
  color?: string;
  exit?: number;
}> = ({value, start = 0, frames = 60, size = 320, thickness, label, suffix = '%', color, exit}) => {
  const {look, pop, ramp, gone} = useTempo();
  const p = pop(start, 22);
  const t = ramp(start + 4, frames, ease.out);
  const out = gone(exit);
  const w = thickness ?? Math.round(size * 0.075);
  const r = (size - w) / 2;
  const c = 2 * Math.PI * r;
  const arc = (c * Math.min(100, value) * t) / 100;
  return (
    <div style={{position: 'relative', width: size, height: size, opacity: Math.min(1, p * 1.4) - out, transform: `scale(${0.82 + 0.18 * p - 0.06 * out})`}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(look.ink, 0.1)} strokeWidth={w} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? look.accent}
          strokeWidth={w}
          strokeLinecap={look.radius === 0 ? 'butt' : 'round'}
          strokeDasharray={`${arc} ${c}`}
          opacity={arc > 0.5 ? 1 : 0}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.02}}>
        <div style={{...look.headline, fontSize: size * 0.27, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
          {Math.round(value * t)}
          <span style={{fontSize: size * 0.13, marginLeft: size * 0.01}}>{suffix}</span>
        </div>
        {label ? (
          <div style={{fontFamily: look.fonts.body, fontSize: Math.max(18, size * 0.065), fontWeight: 500, color: look.dim, textAlign: 'center', maxWidth: size * 0.62}}>
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * A bar chart: bars grow in one after another, their values counting up, the `highlight` bar in
 * the accent. For a before and after, growth by month, us against them.
 *
 *   <Bars data={[{label: 'Jan', value: 12}, ...]} highlight={4} start={6} />
 */
export const Bars: React.FC<{
  data: {label: string; value: number}[];
  highlight?: number;
  width?: number;
  height?: number;
  start?: number;
  stagger?: number;
  max?: number;
  format?: (n: number) => string;
  exit?: number;
}> = ({data, highlight, width = 900, height = 480, start = 0, stagger = 5, max, format = (n) => numberFormat(0).format(n), exit}) => {
  const {look, pop, glide, gone} = useTempo();
  const out = gone(exit);
  const top = Math.max(...data.map((d) => d.value), max ?? 0);
  const n = data.length;
  const bar = width / (n + 0.4 * (n - 1));
  const gap = bar * 0.4;
  const labelRow = Math.round(Math.max(22, bar * 0.2) * 1.9);
  const valueRow = Math.round(Math.max(24, bar * 0.24) * 1.6);
  const plot = height - labelRow - valueRow;
  const font = Math.max(22, Math.min(34, bar * 0.24));
  return (
    <div style={{position: 'relative', width, height, opacity: 1 - out}}>
      {data.map((d, i) => {
        const g = pop(start + i * stagger, 30);
        const count = glide(start + i * stagger, 34);
        const h = (plot * d.value) / top;
        const lit = i === highlight;
        const x = i * (bar + gap);
        return (
          <React.Fragment key={d.label}>
            <div
              style={{
                position: 'absolute',
                left: x,
                bottom: labelRow,
                width: bar,
                height: Math.max(0, h * g),
                borderRadius: `${Math.min(look.radius, bar * 0.18)}px ${Math.min(look.radius, bar * 0.18)}px 3px 3px`,
                background: lit ? look.accent : alpha(look.ink, look.dark ? 0.2 : 0.12),
                boxShadow: lit && look.dark ? `0 0 50px ${alpha(look.accent, 0.45)}` : undefined,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - 20,
                width: bar + 40,
                bottom: labelRow + h * g + 10,
                textAlign: 'center',
                fontFamily: look.fonts.headline,
                fontWeight: 700,
                fontSize: font * 1.05,
                fontVariantNumeric: 'tabular-nums',
                color: lit ? look.accentText : look.ink,
                opacity: Math.min(1, count * 2),
              }}
            >
              {format(d.value * count)}
            </div>
            <div
              style={{
                position: 'absolute',
                left: x - 20,
                width: bar + 40,
                bottom: 0,
                height: labelRow - 12,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                fontFamily: look.fonts.body,
                fontWeight: 500,
                fontSize: font * 0.8,
                color: look.dim,
                opacity: Math.min(1, g * 2),
              }}
            >
              {d.label}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: -12, right: -12, bottom: labelRow, height: 2, background: look.line, transformOrigin: '0 50%', transform: `scaleX(${glide(start - 4, 20)})`}} />
    </div>
  );
};

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
  const fontSize = Math.max(22, Math.min(30, width * 0.03));
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
          transform: `translate(-50%, -100%) scale(${dot})`,
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

/**
 * A big number counting up to `value`, its label under it. For the one figure a scene is about.
 * `delta` adds a small chip ("+38%") once the count lands.
 *
 *   <Stat value={12400} label="teams shipping" start={6} />
 */
export const Stat: React.FC<{
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: string;
  start?: number;
  frames?: number;
  size?: number;
  align?: 'left' | 'center';
  exit?: number;
}> = ({value, label, prefix = '', suffix = '', decimals = 0, delta, start = 0, frames = 50, size, align = 'center', exit}) => {
  const {look, ramp, glide, pop, gone} = useTempo();
  const s = size ?? Math.round(look.size * 2);
  const t = ramp(start, frames, ease.out);
  const label_ = glide(start + 8, 20);
  const chip = pop(start + frames * look.pace - 4, 18);
  const out = gone(exit);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: s * 0.1, opacity: 1 - out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: s * 0.16}}>
        <div style={{...look.headline, fontSize: s, lineHeight: 1, fontVariantNumeric: 'tabular-nums', opacity: Math.min(1, glide(start, 10) * 1.5)}}>
          {prefix}
          {numberFormat(decimals).format(value * t)}
          {suffix}
        </div>
        {delta ? (
          <div
            style={{
              padding: `${s * 0.05}px ${s * 0.12}px`,
              borderRadius: look.radius === 0 ? 0 : 999,
              background: look.accentSoft,
              color: look.accentText,
              fontFamily: look.fonts.body,
              fontWeight: 700,
              fontSize: s * 0.2,
              transform: `scale(${chip})`,
              opacity: Math.min(1, chip * 2),
            }}
          >
            {delta}
          </div>
        ) : null}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: look.fonts.body,
            fontWeight: 500,
            fontSize: Math.max(22, s * 0.22),
            color: look.dim,
            opacity: label_,
            transform: `translateY(${(1 - label_) * 12}px)`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/**
 * A bar filling to `value` percent, its label and percentage above it. For an upload, an index, a
 * deploy: "something is working".
 *
 *   <Progress value={72} label="Indexing repository" start={6} />
 */
export const Progress: React.FC<{
  value: number;
  label?: string;
  width?: number;
  thickness?: number;
  start?: number;
  frames?: number;
  exit?: number;
}> = ({value, label, width = 760, thickness = 16, start = 0, frames = 50, exit}) => {
  const {look, frame, ramp, glide, gone} = useTempo();
  const t = ramp(start + 4, frames, ease.inOut);
  const shown = glide(start, 16);
  const out = gone(exit);
  const done = value >= 100 && t >= 1;
  const r = look.radius === 0 ? 0 : 999;
  const size = Math.max(22, Math.min(38, width * 0.04));
  return (
    <div style={{width, opacity: shown - out, transform: `translateY(${(1 - shown) * 14}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, fontFamily: look.fonts.body, fontSize: size}}>
        <span style={{fontWeight: 600, color: look.ink}}>{label}</span>
        <span style={{fontWeight: 600, color: done ? look.accentText : look.dim, fontVariantNumeric: 'tabular-nums'}}>
          {done ? 'Done' : `${Math.round(value * t)}%`}
        </span>
      </div>
      <div style={{position: 'relative', height: thickness, borderRadius: r, background: alpha(look.ink, look.dark ? 0.14 : 0.09), overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${value * t}%`,
            borderRadius: r,
            background: look.accent,
            // Stripes that keep moving while it works.
            backgroundImage: done ? undefined : `repeating-linear-gradient(-45deg, ${alpha('#ffffff', 0.18)} 0 10px, transparent 10px 20px)`,
            backgroundPosition: `${frame * 1.2}px 0`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Items ticking off one by one: each box fills and its check draws in. For what's included, what
 * the agent did, a launch list.
 *
 *   <Checklist items={['Tests pass', 'Preview deployed', 'Ready to merge']} start={6} />
 */
export const Checklist: React.FC<{
  items: string[];
  start?: number;
  stagger?: number;
  size?: number;
  exit?: number;
}> = ({items, start = 0, stagger = 16, size = 34, exit}) => {
  const {look, pop, glide, ramp, gone} = useTempo();
  const out = gone(exit);
  const box = Math.round(size * 1.15);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: size * 0.75, opacity: 1 - out}}>
      {items.map((item, i) => {
        const shown = glide(start + i * 4, 18);
        const at = start + 16 + i * stagger;
        const fill = pop(at, 16);
        const tick = ramp(at + 3, 10, ease.out);
        return (
          <div key={item} style={{display: 'flex', alignItems: 'center', gap: size * 0.6, opacity: shown, transform: `translateX(${(1 - shown) * -24}px)`}}>
            <div style={{position: 'relative', width: box, height: box, flexShrink: 0}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: look.radius === 0 ? 0 : box * 0.28, border: `3px solid ${look.line}`}} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: look.radius === 0 ? 0 : box * 0.28,
                  background: look.accent,
                  transform: `scale(${fill})`,
                  opacity: Math.min(1, fill * 3),
                }}
              />
              <svg viewBox="0 0 24 24" width={box} height={box} style={{position: 'absolute', inset: 0}}>
                <path
                  d="M6 12.5 L10.2 16.5 L18 8"
                  fill="none"
                  stroke={look.onAccent}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - tick}
                  opacity={tick > 0.002 ? 1 : 0}
                />
              </svg>
            </div>
            <div style={{fontFamily: look.fonts.body, fontWeight: 600, fontSize: size, color: look.ink, opacity: 0.55 + 0.45 * Math.min(1, fill)}}>{item}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Moments

/**
 * Confetti bursting from (x, y) at frame `at`, falling away under gravity in about a second and a
 * half. For a success moment: a merge, a payment, a launch.
 *
 *   <Burst x={960} y={500} at={14} />
 */
export const Burst: React.FC<{
  x: number;
  y: number;
  at: number;
  count?: number;
  power?: number;
  seed?: string;
  colors?: string[];
}> = ({x, y, at, count = 80, power = 1, seed = 'burst', colors}) => {
  const {look, frame, fps} = useTempo();
  const t = (frame - at) / fps;
  const life = 1.7 * look.pace;
  if (t < 0 || t > life) return null;
  const palette = colors ?? [look.accent, look.alert, mix(look.accent, '#ffffff', 0.45), look.ink];
  const drag = 2.6;
  const gravity = 1500 * power;
  const flight = (1 - Math.exp(-drag * t)) / drag;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      <div
        style={{
          position: 'absolute',
          left: -180 * power * Math.min(1, t * 5),
          top: -180 * power * Math.min(1, t * 5),
          width: 360 * power * Math.min(1, t * 5),
          height: 360 * power * Math.min(1, t * 5),
          borderRadius: '50%',
          border: `3px solid ${palette[0]}`,
          opacity: Math.max(0, 0.7 - t * 2.4),
        }}
      />
      {Array.from({length: count}, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const angle = r('a') * Math.PI * 2;
        const speed = (700 + r('s') * 1500) * power;
        const px = Math.cos(angle) * speed * flight;
        const py = (Math.sin(angle) * speed - 500 * power) * flight + (gravity / drag) * (t - flight);
        const shape = r('k');
        const w = (shape < 0.6 ? 18 + r('w') * 12 : shape < 0.85 ? 15 : 7) * Math.sqrt(power);
        const h = (shape < 0.6 ? 10 + r('h') * 6 : shape < 0.85 ? 15 : 30) * Math.sqrt(power);
        const spin = (r('r') - 0.5) * 1400 * t + r('o') * 360;
        const flutter = Math.cos(t * (8 + r('f') * 10) + r('p') * 6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - w / 2,
              top: py - h / 2,
              width: w,
              height: h,
              borderRadius: shape >= 0.6 && shape < 0.85 ? '50%' : 2,
              background: palette[i % palette.length],
              transform: `rotate(${spin}deg) scaleY(${flutter})`,
              opacity: t > life * 0.65 ? 1 - (t - life * 0.65) / (life * 0.35) : 1,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Sweeps a glint of light across its children at `at`, and again every `every` frames if given.
 * For a button you want pressed, a logo, a price. `radius` should match the children's corners.
 *
 *   <Shine at={20} every={50}><Button /></Shine>
 */
export const Shine: React.FC<{at?: number; frames?: number; every?: number; radius?: number; color?: string; children: React.ReactNode}> = ({
  at = 0,
  frames = 30,
  every,
  radius,
  color = 'rgba(255, 255, 255, 0.75)',
  children,
}) => {
  const {look, frame} = useTempo();
  const length = Math.round(frames * look.pace);
  const since = frame - at;
  const local = every && since > 0 ? since % every : since;
  const p = interpolate(local, [0, length], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
  return (
    <div style={{position: 'relative', display: 'inline-block', overflow: 'hidden', borderRadius: radius ?? look.radius, verticalAlign: 'top'}}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          width: '45%',
          left: `${-60 + p * 175}%`,
          transform: 'skewX(-20deg)',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          mixBlendMode: 'overlay',
          opacity: p > 0 && p < 1 ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Input

export type CursorPoint = {x: number; y: number; at: number; click?: boolean};

/** The macOS pointer, its tip at (1, 1) in a 20 x 30 box. */
const POINTER = 'M1 1 L1 23.6 L6.6 18.3 L10.6 27.4 L14.4 25.8 L10.5 16.9 L18 16.9 Z';

/**
 * A pointer gliding through `points`, arriving at each one at its frame `at`, with a press and a
 * ripple on the ones marked `click`. For showing input over footage that was recorded without a
 * visible pointer, or over a mock. Positions are px in the parent.
 *
 *   <Cursor points={[{x: 1300, y: 760, at: 0}, {x: 900, y: 430, at: 30, click: true}]} />
 */
export const Cursor: React.FC<{points: CursorPoint[]; travel?: number; size?: number; exit?: number; light?: boolean}> = ({
  points,
  travel = 22,
  size = 40,
  exit,
  light,
}) => {
  const {look, frame, glide, gone} = useTempo();
  const move = Math.round(travel * look.pace);
  let pos: Pt = points[0];
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    const depart = Math.max(a.at + (a.click ? 8 : 0), b.at - move);
    if (frame >= b.at) {
      pos = b;
      continue;
    }
    if (frame > depart) {
      const u = ease.inOut((frame - depart) / (b.at - depart));
      // A hand moves in a slight arc, not a ruled line.
      const bow = Math.hypot(b.x - a.x, b.y - a.y) * 0.1 * Math.sin(Math.PI * u);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      pos = {x: a.x + (b.x - a.x) * u + ((b.y - a.y) / len) * bow, y: a.y + (b.y - a.y) * u - ((b.x - a.x) / len) * bow};
    } else pos = a;
    break;
  }
  const clicks = points.filter((p) => p.click);
  const press = clicks.reduce((s, c) => (frame >= c.at && frame <= c.at + 8 ? 1 - 0.16 * Math.sin((Math.PI * (frame - c.at)) / 8) : s), 1);
  const shown = glide(points[0].at - 10, 12) - gone(exit, 10);
  const k = size / 28;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none'}}>
      {clicks.map((c) => {
        const t = (frame - c.at) / (22 * look.pace);
        if (t < 0 || t > 1) return null;
        const r = 10 + 46 * ease.out(t);
        return (
          <div
            key={c.at}
            style={{
              position: 'absolute',
              left: c.x - r,
              top: c.y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: alpha(look.accent, 0.22 * (1 - t)),
              border: `3px solid ${alpha(look.accent, 0.9 * (1 - t))}`,
            }}
          />
        );
      })}
      <svg
        width={20 * k}
        height={30 * k}
        viewBox="0 0 20 30"
        style={{
          position: 'absolute',
          left: pos.x - k,
          top: pos.y - k,
          overflow: 'visible',
          opacity: shown,
          transform: `scale(${press})`,
          transformOrigin: `${k}px ${k}px`,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))',
        }}
      >
        <path d={POINTER} fill={light ? '#ffffff' : '#0b0b0c'} stroke={light ? '#0b0b0c' : '#ffffff'} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/**
 * Keyboard keys that pop in and press down one after another, held, then let go. For a shortcut
 * the product is built around.
 *
 *   <Keys keys={['⌘', 'K']} at={6} />
 */
export const Keys: React.FC<{keys: string[]; at?: number; stagger?: number; hold?: number; size?: number; exit?: number}> = ({
  keys,
  at = 0,
  stagger = 8,
  hold = 30,
  size = 140,
  exit,
}) => {
  const {look, pop, glide, gone} = useTempo();
  const out = gone(exit);
  const first = at + 18;
  const release = first + (keys.length - 1) * stagger + hold;
  const edge = mix(look.surface, '#000000', look.dark ? 0.55 : 0.16);
  return (
    <div style={{display: 'flex', gap: size * 0.16, opacity: 1 - out}}>
      {keys.map((key, i) => {
        const shown = pop(at + i * 4, 18);
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

/**
 * Dims the whole frame except `rect`, the hole tightening onto it from `at`. For making one part of
 * a busy shot the subject. Put it in the shot's AbsoluteFill, over the Stage; `rect` is in px of
 * the frame.
 *
 *   <Spotlight rect={{x: 700, y: 300, width: 520, height: 260}} at={15} />
 */
export const Spotlight: React.FC<{
  rect: {x: number; y: number; width: number; height: number};
  at?: number;
  frames?: number;
  exit?: number;
  dim?: number;
  pad?: number;
  radius?: number;
  ring?: boolean;
}> = ({rect, at = 0, frames = 26, exit, dim = 0.62, pad = 14, radius, ring = true}) => {
  const {look, glide, gone} = useTempo();
  const t = glide(at, frames) - gone(exit, 16);
  const g = pad + (1 - t) * pad * 5;
  return (
    <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: rect.x - g,
          top: rect.y - g,
          width: rect.width + g * 2,
          height: rect.height + g * 2,
          borderRadius: (radius ?? look.radius) + g * 0.4,
          boxShadow: `0 0 0 6000px rgba(0, 0, 0, ${dim * t})`,
          outline: ring ? `3px solid ${alpha(look.accent, 0.9 * t)}` : undefined,
          outlineOffset: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// UI

/**
 * A notification sliding in, like macOS or iOS: the app's icon (the brand logo unless `icon` is
 * given), its name and the time, a title and a line of body. For the moment the product tells you
 * something.
 *
 *   <Toast title="Build passed" body="All 214 checks green on main" at={8} />
 */
export const Toast: React.FC<{
  title: string;
  body?: string;
  app?: string;
  time?: string;
  icon?: LucideIcon;
  logo?: string;
  at?: number;
  exit?: number;
  width?: number;
  from?: 'top' | 'right';
}> = ({title, body, app = brand.name, time = 'now', icon: IconGlyph, logo = brand.logo, at = 0, exit, width = 560, from = 'top'}) => {
  const {look, pop, gone} = useTempo();
  const p = pop(at, 26);
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

export type ChatMessage = {from: 'me' | 'them'; text: string; at: number};

const TypingDots: React.FC<{size: number; color: string}> = ({size, color}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: size * 0.28, padding: `${size * 0.2}px 0`}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: '50%',
            background: color,
            transform: `translateY(${-size * 0.16 * Math.max(0, Math.sin(frame * 0.32 - i * 0.9))}px)`,
            opacity: 0.55 + 0.45 * Math.max(0, Math.sin(frame * 0.32 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

/**
 * A conversation: bubbles arriving one by one, each of theirs preceded by `typing` frames of typing
 * dots, earlier ones pushed up as new ones land. Mine in the accent on the right, theirs on cards on
 * the left. For an assistant, support, a team thread.
 *
 *   <Chat messages={[{from: 'them', text: 'Can you ship it tonight?', at: 20}, {from: 'me', text: 'Already merged.', at: 46}]} />
 */
export const Chat: React.FC<{messages: ChatMessage[]; width?: number; size?: number; typing?: number; exit?: number}> = ({
  messages,
  width = 640,
  size = 28,
  typing = 22,
  exit,
}) => {
  const {look, frame, glide, pop, gone} = useTempo();
  const out = gone(exit);
  const r = look.radius === 0 ? 0 : Math.max(18, Math.min(30, look.radius + 8));
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', opacity: 1 - out}}>
      {messages.map((m, i) => {
        const mine = m.from === 'me';
        const wait = mine ? 0 : typing;
        const appear = m.at - wait;
        // A grid row from 0fr to 1fr grows to exactly its content's height, pushing the others up.
        const grow = Math.min(1, glide(appear, 12));
        const landed = frame >= m.at;
        const p = pop(landed ? m.at : appear, 16);
        if (frame < appear) return null;
        return (
          <div key={i} style={{display: 'grid', gridTemplateRows: `${grow}fr`}}>
            <div style={{minHeight: 0, overflow: 'hidden', padding: `0 6px`}}>
              <div style={{display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', paddingTop: i === 0 ? 0 : size * 0.5, paddingBottom: 4}}>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: `${size * 0.45}px ${size * 0.7}px`,
                    borderRadius: r,
                    [mine ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: r === 0 ? 0 : 6,
                    background: mine ? look.accent : look.dark ? look.surface : mix(look.background, look.ink, 0.07),
                    border: mine || !look.dark ? undefined : `1px solid ${look.line}`,
                    color: mine ? look.onAccent : look.ink,
                    fontFamily: look.fonts.body,
                    fontSize: size,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    transform: `scale(${0.6 + 0.4 * p})`,
                    transformOrigin: mine ? '100% 100%' : '0% 100%',
                    opacity: Math.min(1, p * 2),
                  }}
                >
                  {landed ? m.text : <TypingDots size={size} color={look.dim} />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * A pill label that pops in: an icon and a few words. `tone` is how loud it is. `pulse` adds a live
 * dot. For "New", "Beta", "SOC 2", "Live".
 *
 *   <Badge icon={Sparkles} text="New in 2.0" at={10} />
 */
export const Badge: React.FC<{
  text: string;
  icon?: LucideIcon;
  at?: number;
  exit?: number;
  tone?: 'accent' | 'soft' | 'card' | 'alert';
  size?: number;
  pulse?: boolean;
}> = ({text, icon: Glyph, at = 0, exit, tone = 'soft', size = 30, pulse}) => {
  const {look, frame, pop, gone} = useTempo();
  const p = pop(at, 20);
  const out = gone(exit);
  const colors = {
    accent: {background: look.accent, color: look.onAccent, border: 'none'},
    soft: {background: look.accentSoft, color: look.accentText, border: `1px solid ${alpha(look.accentText, 0.25)}`},
    card: {background: look.surface, color: look.ink, border: `1px solid ${look.line}`},
    alert: {background: look.alert, color: '#ffffff', border: 'none'},
  }[tone];
  const beat = ((frame - at) % 40) / 40;
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

/**
 * A row of words (or logos) sliding past for ever, one full loop every `loop` seconds, its ends
 * fading out. For "works with", customer logos, a list of features at a glance. Strings are set
 * in the headline face; pass elements for logos.
 *
 *   <Marquee items={['Fast', 'Private', 'Native', 'Open source']} />
 */
export const Marquee: React.FC<{
  items: React.ReactNode[];
  loop?: number;
  gap?: number;
  reverse?: boolean;
  size?: number;
  color?: string;
  start?: number;
  separator?: boolean;
  width?: number | string;
}> = ({items, loop = 9, gap, reverse, size, color, start = 0, separator = true, width = '100%'}) => {
  const {look, frame, fps, glide} = useTempo();
  const s = size ?? Math.round(look.size * 1.1);
  const g = gap ?? s * 0.7;
  const p = (((frame / fps) / loop) % 1 + 1) % 1;
  const shown = glide(start, 20);
  const row = (copy: number) =>
    items.map((item, i) => (
      <div key={`${copy}-${i}`} style={{display: 'flex', alignItems: 'center', gap: g, paddingRight: g, flexShrink: 0}}>
        {typeof item === 'string' ? <span style={{...look.headline, fontSize: s, lineHeight: 1.2, color: color ?? look.ink, whiteSpace: 'nowrap'}}>{item}</span> : item}
        {separator ? <div style={{width: s * 0.18, height: s * 0.18, borderRadius: look.radius === 0 ? 0 : '50%', background: look.accent, flexShrink: 0}} /> : null}
      </div>
    ));
  return (
    <div
      style={{
        width,
        overflow: 'hidden',
        opacity: shown,
        maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
      }}
    >
      <div style={{display: 'flex', width: 'max-content', transform: `translateX(${-(reverse ? 1 - p : p) * 50}%)`}}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** An accent word in plain text. (The style's `emphasis` may expect a mark behind it, as in bold.) */
const accentWord = (look: Look): React.CSSProperties => ({...look.emphasis, color: look.accentText});

/** The part of the frame a sample can use: inside the safe area, above the gallery's label. */
const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = look.height - look.safe.bottom - 170;
  const left = look.safe.left;
  const right = look.width - look.safe.right;
  return {look, top, bottom, left, right, w: right - left, h: bottom - top, cx: (left + right) / 2, cy: (top + bottom) / 2};
};

const Area: React.FC<{children: React.ReactNode; gap?: number; row?: boolean}> = ({children, gap = 0, row}) => {
  const a = useArea();
  return (
    <div
      style={{
        position: 'absolute',
        left: a.left,
        top: a.top,
        width: a.w,
        height: a.h,
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        flexWrap: row ? 'wrap' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap,
      }}
    >
      {children}
    </div>
  );
};

const UNDERLINE = 'M6 24 C 110 9, 250 6, 414 17 M60 36 C 160 27, 270 25, 370 30';

const DrawDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(look.size * 1.6, w / 5.2);
  return (
    <Area>
      <div style={{...look.headline, fontSize: size, display: 'flex', gap: '0.28em', flexWrap: 'wrap', justifyContent: 'center'}}>
        <span>Ship it</span>
        <span style={{position: 'relative', ...accentWord(look)}}>
          today.
          <Draw d={UNDERLINE} width={420} height={40} start={12} frames={26} stretch strokeWidth={7} style={{position: 'absolute', left: '-4%', top: '96%', width: '108%', height: size * 0.32}} />
        </span>
      </div>
    </Area>
  );
};

const ArrowDemo: React.FC = () => {
  const {look, cx, cy, w} = useArea();
  const button = (look.format !== 'landscape') ? {x: cx + 40, y: cy + 170} : {x: cx + 270, y: cy + 70};
  const label = (look.format !== 'landscape') ? {x: cx - 170, y: cy - 230} : {x: cx - 420, y: cy - 150};
  const size = Math.min(48, w / 16);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: label.x, top: label.y, transform: 'translate(-50%, -50%)', ...look.headline, fontSize: size * 1.3, whiteSpace: 'nowrap'}}>
        Start <span style={accentWord(look)}>here</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: button.x,
          top: button.y,
          transform: 'translate(-50%, -50%)',
          padding: `${size * 0.5}px ${size * 0.9}px`,
          ...card(look),
          border: `1px solid ${look.line}`,
          fontFamily: look.fonts.body,
          fontWeight: 700,
          fontSize: size * 0.8,
          color: look.ink,
          whiteSpace: 'nowrap',
        }}
      >
        Deploy to production
      </div>
      <Arrow
        from={{x: label.x + ((look.format !== 'landscape') ? 20 : size * 3.7), y: label.y + size * ((look.format !== 'landscape') ? 1.1 : 0.25)}}
        to={{x: button.x - ((look.format !== 'landscape') ? 60 : size * 3.4), y: button.y - size * ((look.format !== 'landscape') ? 1.4 : 1.4)}}
        bend={(look.format !== 'landscape') ? -0.3 : 0.3}
        start={10}
      />
    </AbsoluteFill>
  );
};

const RingDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <Ring value={87} label="tests passing" start={6} size={Math.min(440, w * 0.75, h * 0.85)} />
    </Area>
  );
};

const MONTHS = [
  {label: 'May', value: 1200},
  {label: 'Jun', value: 1900},
  {label: 'Jul', value: 2600},
  {label: 'Aug', value: 4100},
  {label: 'Sep', value: 6800},
];

const BarsDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <Bars data={MONTHS} highlight={4} start={6} width={Math.min(980, w * 0.92)} height={Math.min(520, h * 0.8)} />
    </Area>
  );
};

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

const BurstDemo: React.FC = () => {
  const {look, cx, cy} = useArea();
  return (
    <AbsoluteFill>
      <Burst x={cx} y={cy} at={12} power={(look.format !== 'landscape') ? 0.8 : 1} />
      <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Icon icon={Check} size={150} at={6} tone="accent" />
        <div style={{...look.headline, fontSize: look.size * 0.9, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 14) / 10))}}>Merged.</div>
      </div>
    </AbsoluteFill>
  );
};

const ShineDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(52, w / 14);
  return (
    <Area>
      <Shine at={16} every={50} radius={look.radius === 0 ? 0 : 999}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: size * 0.4,
            padding: `${size * 0.6}px ${size * 1.2}px`,
            borderRadius: look.radius === 0 ? 0 : 999,
            background: look.accent,
            color: look.onAccent,
            fontFamily: look.fonts.body,
            fontWeight: 700,
            fontSize: size,
          }}
        >
          <Rocket size={size * 1.1} strokeWidth={2.2} />
          Get early access
        </div>
      </Shine>
    </Area>
  );
};

/** A small app window for samples to point at: a few rows and a button. */
const MockWindow: React.FC<{width: number; pressed?: number; selected?: number}> = ({width, pressed = -1, selected = -1}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const s = width / 760;
  const rows = ['Fix flaky login test', 'Add dark mode tokens', 'Cache build artifacts'];
  const down = frame >= pressed && frame < pressed + 8;
  return (
    <div style={{width, ...card(look), border: `1px solid ${look.line}`, overflow: 'hidden', fontFamily: look.fonts.body}}>
      <div style={{display: 'flex', gap: 9 * s, padding: `${16 * s}px ${20 * s}px`, borderBottom: `1px solid ${look.line}`}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((col) => (
          <div key={col} style={{width: 13 * s, height: 13 * s, borderRadius: '50%', background: col}} />
        ))}
      </div>
      <div style={{padding: `${14 * s}px ${20 * s}px ${22 * s}px`, display: 'flex', flexDirection: 'column', gap: 10 * s}}>
        {rows.map((r, i) => (
          <div
            key={r}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14 * s,
              padding: `${14 * s}px ${16 * s}px`,
              borderRadius: Math.min(look.radius, 12) * s,
              background: frame >= selected && i === 1 ? alpha(look.accent, 0.12) : 'transparent',
              fontSize: 26 * s,
              fontWeight: 500,
              color: look.ink,
            }}
          >
            <GitPullRequest size={26 * s} color={look.accent} />
            {r}
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 8 * s}}>
          <div
            style={{
              padding: `${14 * s}px ${30 * s}px`,
              borderRadius: look.radius === 0 ? 0 : 10 * s,
              background: look.accent,
              color: look.onAccent,
              fontSize: 25 * s,
              fontWeight: 700,
              transform: `scale(${down ? 0.95 : 1})`,
            }}
          >
            Merge
          </div>
        </div>
      </div>
    </div>
  );
};

const CursorDemo: React.FC = () => {
  const {cx, cy, w} = useArea();
  const width = Math.min(940, w * 0.95);
  const s = width / 760;
  // The window's height is about 400 * s; its top-left is at (cx - width / 2, cy - 200 * s).
  const x0 = cx - width / 2;
  const y0 = cy - 200 * s;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x0, top: y0}}>
        <MockWindow width={width} selected={36} pressed={72} />
      </div>
      <Cursor
        points={[
          {x: x0 + width * 0.92, y: y0 + 470 * s, at: 4},
          {x: x0 + 300 * s, y: y0 + 168 * s, at: 34, click: true},
          {x: x0 + width - 80 * s, y: y0 + 335 * s, at: 70, click: true},
        ]}
      />
    </AbsoluteFill>
  );
};

const ToastDemo: React.FC = () => {
  const {w} = useArea();
  const width = Math.min(760, w * 0.95);
  return (
    <Area gap={22}>
      <Toast title="Build passed" body="All 214 checks green on main · 2m 14s" at={6} width={width} />
      <Toast title="Review requested" body="Ana wants you to look at #482" icon={Bell} time="1m ago" at={30} width={width} />
    </Area>
  );
};

const ChatDemo: React.FC = () => {
  const {look, w} = useArea();
  return (
    <Area>
      <Chat
        width={Math.min(860, w * 0.95)}
        size={(look.format !== 'landscape') ? 38 : 36}
        messages={[
          {from: 'them', text: 'Can you ship the fix tonight?', at: 22},
          {from: 'me', text: 'Already merged. Deploying now.', at: 48},
          {from: 'them', text: 'You’re a legend.', at: 92},
        ]}
      />
    </Area>
  );
};

const BadgeDemo: React.FC = () => {
  const {look} = useArea();
  return (
    <Area gap={(look.format !== 'landscape') ? 28 : 24} row={!(look.format !== 'landscape')}>
      <Badge text="Live" tone="accent" pulse at={4} size={44} />
      <Badge text="New in 2.0" icon={Sparkles} at={12} size={44} />
      <Badge text="SOC 2 Type II" icon={ShieldCheck} tone="card" at={20} size={44} />
    </Area>
  );
};

const MarqueeDemo: React.FC = () => {
  const {look, cy} = useArea();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: cy, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: look.size * 0.5}}>
      <Marquee items={['Native', 'Private', 'Keyboard-first', 'Open source', 'Fast']} />
      <Marquee items={['Claude Code', 'Codex', 'Gemini', 'Aider', 'Cursor']} reverse color={look.dim} size={look.size * 0.75} loop={12} />
    </div>
  );
};

const KeysDemo: React.FC = () => {
  const {look, w} = useArea();
  return (
    <Area gap={look.size * 0.7}>
      <Keys keys={['⌘', 'K']} at={4} size={Math.min(170, w / 5)} />
      <div style={{...look.headline, fontSize: look.size * 0.8, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 26) / 10))}}>
        Open <span style={accentWord(look)}>anything.</span>
      </div>
    </Area>
  );
};

const SpotlightDemo: React.FC = () => {
  const {look, cx, cy, w, h} = useArea();
  const cols = (look.format !== 'landscape') ? 2 : 3;
  const gap = 24;
  const tileW = Math.min(360, (Math.min(w, 1200) - gap * (cols - 1)) / cols);
  const tileH = tileW * 0.62;
  const rows = 6 / cols;
  const x0 = cx - (cols * tileW + (cols - 1) * gap) / 2;
  const y0 = cy - (rows * tileH + (rows - 1) * gap) / 2;
  const pick = (look.format !== 'landscape') ? 3 : 4;
  const at = (i: number) => ({x: x0 + (i % cols) * (tileW + gap), y: y0 + Math.floor(i / cols) * (tileH + gap)});
  const LABELS = ['Deploys', 'Latency', 'Errors', 'Agents', 'Spend', 'Uptime'];
  return (
    <AbsoluteFill>
      {LABELS.map((label, i) => (
        <div
          key={label}
          style={{
            position: 'absolute',
            left: at(i).x,
            top: at(i).y,
            width: tileW,
            height: Math.min(tileH, h / rows - gap),
            boxSizing: 'border-box',
            padding: 24,
            ...card(look),
            border: `1px solid ${look.line}`,
            fontFamily: look.fonts.body,
          }}
        >
          <div style={{fontSize: 22, fontWeight: 600, color: look.dim}}>{label}</div>
          <div style={{fontSize: tileW * 0.16, fontWeight: 700, color: look.ink, marginTop: 8}}>{['128', '42 ms', '0.02%', '6 live', '$311', '99.98%'][i]}</div>
        </div>
      ))}
      <Spotlight rect={{...at(pick), width: tileW, height: Math.min(tileH, h / rows - gap)}} at={16} />
    </AbsoluteFill>
  );
};

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

const StatDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = (look.format !== 'landscape') ? Math.min(look.size * 1.7, w / 4.2) : Math.min(look.size * 2, w / 8);
  return (
    <Area row={!(look.format !== 'landscape')} gap={(look.format !== 'landscape') ? size * 0.6 : size * 1.2}>
      <Stat value={3.2} decimals={1} suffix="×" label="faster builds" start={6} size={size} />
      <Stat value={12400} label="teams shipping" start={12} size={size} />
      <Stat value={99.99} decimals={2} suffix="%" label="uptime" start={18} size={size} />
    </Area>
  );
};

const ProgressDemo: React.FC = () => {
  const {w, look} = useArea();
  const width = Math.min(1000, w * 0.95);
  return (
    <Area gap={look.size * 0.85}>
      <Progress label="Install" value={100} start={4} frames={24} width={width} />
      <Progress label="Build" value={100} start={22} frames={30} width={width} />
      <Progress label="Deploy" value={64} start={44} frames={40} width={width} />
    </Area>
  );
};

const ChecklistDemo: React.FC = () => {
  const {look} = useArea();
  return (
    <Area>
      <Checklist items={['Tests pass', 'Preview deployed', 'Docs updated', 'Ready to merge']} start={4} size={(look.format !== 'landscape') ? 52 : 50} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Draw a line', code: '<Draw d={UNDERLINE} width={420} height={40} start={12} />', seconds: 2.5, hero: 50, Component: DrawDemo},
  {name: 'Point with an arrow', code: '<Arrow from={label} to={button} start={10} />', seconds: 2.5, hero: 50, Component: ArrowDemo},
  {name: 'Progress ring', code: '<Ring value={87} label="tests passing" />', seconds: 3.5, hero: 92, Component: RingDemo},
  {name: 'Bar chart', code: '<Bars data={MONTHS} highlight={4} />', seconds: 3, hero: 75, Component: BarsDemo},
  {name: 'Line chart', code: '<LineChart values={[12, 18, 15, 26, 31, 29, 44, 58]} />', seconds: 4, hero: 104, Component: LineDemo},
  {name: 'Big number', code: '<Stat value={12400} label="teams shipping" />', seconds: 3.5, hero: 95, Component: StatDemo},
  {name: 'Progress bars', code: '<Progress value={64} label="Deploy" />', seconds: 4, hero: 110, Component: ProgressDemo},
  {name: 'Checklist', code: "<Checklist items={['Tests pass', ...]} />", seconds: 3.5, hero: 90, Component: ChecklistDemo},
  {name: 'Confetti', code: '<Burst x={cx} y={cy} at={12} />', seconds: 2.5, hero: 24, Component: BurstDemo},
  {name: 'Shine', code: '<Shine at={16} every={50}>{button}</Shine>', seconds: 2.5, hero: 30, Component: ShineDemo},
  {name: 'Cursor and clicks', code: '<Cursor points={[..., {x, y, at: 34, click: true}]} />', seconds: 3.5, hero: 74, Component: CursorDemo},
  {name: 'Shortcut keys', code: "<Keys keys={['⌘', 'K']} />", seconds: 2.5, hero: 40, Component: KeysDemo},
  {name: 'Spotlight', code: '<Spotlight rect={tile} at={16} />', seconds: 2.5, hero: 55, Component: SpotlightDemo},
  {name: 'Notification', code: '<Toast title="Build passed" body="..." />', seconds: 3, hero: 70, Component: ToastDemo},
  {name: 'Chat', code: "<Chat messages={[{from: 'them', text, at: 22}, ...]} />", seconds: 4, hero: 112, Component: ChatDemo},
  {name: 'Badges', code: '<Badge icon={Sparkles} text="New in 2.0" />', seconds: 2.5, hero: 50, Component: BadgeDemo},
  {name: 'Feature icons', code: '<Icon icon={Zap} at={4} />', seconds: 2.5, hero: 50, Component: IconDemo},
  {name: 'Marquee', code: "<Marquee items={['Native', 'Private', ...]} />", seconds: 3, hero: 45, Component: MarqueeDemo},
];

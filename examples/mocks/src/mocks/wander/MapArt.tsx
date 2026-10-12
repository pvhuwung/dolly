import React, {useMemo} from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Caveat';
import {Contours, Flower, Paper, Watercolor} from '../../fx/drawings';
import {ease} from '../../kit';
import {alpha, useLook} from '../../look';

// The journal's map of one trip, drawn by hand: the coast and the sea, contour lines over the
// land, a route drawing itself from stop to stop, a postmark landing on each, and a card from that
// day pinned beside it. Everything is in the map's own px (MAP), timed from `start`.

/** Handwriting, for the journal's notes. */
export const {fontFamily: hand} = loadFont('normal', {weights: ['500', '700'], subsets: ['latin']});

export const MAP = {width: 1260, height: 840};
const INK = '#2b2630';
const SEA = '#9fbfd0';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Pt = {x: number; y: number};
const p = (x: number, y: number): Pt => ({x, y});

// The west coast running south, turning east along the south coast.
const COAST = [
  p(334, -10), p(322, 58), p(340, 128), p(356, 192), p(338, 254), p(318, 322), p(302, 382), p(282, 428), p(304, 466), p(328, 498),
  p(312, 560), p(300, 622), p(318, 690), p(298, 742), p(334, 764), p(420, 772), p(520, 764), p(622, 774), p(722, 762), p(822, 772),
  p(926, 762), p(1040, 772), p(1270, 762),
];

export const STOPS = [
  {name: 'Porto', day: 1, ...p(392, 128)},
  {name: 'Lisbon', day: 3, ...p(358, 470)},
  {name: 'Évora', day: 5, ...p(640, 520)},
  {name: 'Lagos', day: 8, ...p(474, 726)},
];
const ROUTE = [STOPS[0], p(414, 232), p(388, 336), STOPS[1], p(470, 514), STOPS[2], p(606, 616), p(544, 690), STOPS[3]];
const STOP_INDEX = [0, 3, 5, 8];

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
const smooth = (pts: Pt[]) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[i];
    const c = pts[i + 1];
    const e = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${b.x + (c.x - a.x) / 6} ${b.y + (c.y - a.y) / 6}, ${c.x - (e.x - b.x) / 6} ${c.y - (e.y - b.y) / 6}, ${c.x} ${c.y}`;
  }
  return d;
};
const lines = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'} ${q.x} ${q.y}`).join(' ');

/** How far along the route (0 to 1) each stop is, by the polyline's length. */
const STOP_AT = (() => {
  const seg = ROUTE.slice(1).map((q, i) => Math.hypot(q.x - ROUTE[i].x, q.y - ROUTE[i].y));
  const total = seg.reduce((s, l) => s + l, 0);
  return STOP_INDEX.map((k) => seg.slice(0, k).reduce((s, l) => s + l, 0) / total);
})();

/** The frame the route reaches stop `i`, for a route drawn from `at` over `frames`. */
export const stopFrame = (i: number, at: number, frames: number) => Math.round(at + STOP_AT[i] * frames);

/** A postmark landing on a stop, with its name and day beside it. */
const Postmark: React.FC<{stop: (typeof STOPS)[number]; at: number; left?: boolean}> = ({stop, at, left}) => {
  const look = useLook();
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = interpolate(f, [at, at + 9], [0, 1], {...clamp, easing: ease.out});
  const tilt = (random(`stamp-${stop.name}`) - 0.5) * 26;
  const ring = look.accent;
  return (
    <>
      <svg width={84} height={84} viewBox="-42 -42 84 84" style={{position: 'absolute', left: stop.x - 42, top: stop.y - 42, overflow: 'visible', opacity: 0.9 * t, transform: `scale(${1.7 - 0.7 * t}) rotate(${tilt}deg)`}}>
        <defs>
          <filter id={`ink-${stop.day}`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={1} seed={stop.day} />
            <feDisplacementMap in="SourceGraphic" scale={2.5} />
          </filter>
        </defs>
        <g filter={`url(#ink-${stop.day})`} fill="none" stroke={ring}>
          <circle r={31} strokeWidth={3.5} />
          <circle r={23} strokeWidth={1.6} strokeDasharray="3 4" />
          <circle r={9} fill={ring} stroke="none" />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          top: stop.y - 27,
          ...(left ? {right: MAP.width - stop.x + 50, textAlign: 'right'} : {left: stop.x + 50}),
          opacity: interpolate(f, [at + 4, at + 14], [0, 1], clamp),
          fontFamily: look.fonts.mono,
          lineHeight: 1.2,
        }}
      >
        <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.08em', color: INK, textTransform: 'uppercase'}}>{stop.name}</div>
        <div style={{fontSize: 16, color: alpha(INK, 0.6)}}>DAY {stop.day}</div>
      </div>
    </>
  );
};

/** A note from the journal, in handwriting. */
const Note: React.FC<{title: string; body: string; size?: number}> = ({title, body, size = 34}) => (
  <div style={{fontFamily: hand, color: INK, lineHeight: 1.08, padding: '0 26px'}}>
    <div style={{fontSize: size, fontWeight: 700}}>{title}</div>
    <div style={{fontSize: size * 0.88, fontWeight: 500, color: alpha(INK, 0.82)}}>{body}</div>
  </div>
);

export const MapArt: React.FC<{start: number; routeAt: number; routeFrames: number; cards?: boolean}> = ({start, routeAt, routeFrames, cards = true}) => {
  const look = useLook();
  const f = useCurrentFrame();
  const coast = interpolate(f, [start, start + 30], [0, 1], {...clamp, easing: ease.inOut});
  const sea = interpolate(f, [start + 8, start + 34], [0, 1], clamp);
  const route = interpolate(f, [routeAt, routeAt + routeFrames], [0, 1], clamp);
  const coastD = useMemo(() => smooth(COAST), []);
  const land = `${lines(COAST)} L 1270 -10 Z`;
  const seaD = `${lines(COAST)} L 1270 860 L -10 860 L -10 -10 Z`;
  const at = (i: number) => stopFrame(i, routeAt, routeFrames);
  const waves = [p(150, 120), p(90, 300), p(190, 520), p(120, 690), p(560, 815), p(860, 812)];
  return (
    <div style={{position: 'relative', width: MAP.width, height: MAP.height, overflow: 'hidden'}}>
      {/* Contours over the land only. */}
      <div style={{position: 'absolute', inset: 0, clipPath: `path('${land}')`, opacity: 0.5}}>
        <Contours width={MAP.width} height={MAP.height} levels={12} start={start + 6} frames={70} seed={7} />
      </div>
      <svg width={MAP.width} height={MAP.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={seaD} fill={alpha(SEA, 0.34 * sea)} />
        {waves.map((w, i) => (
          <path
            key={i}
            d={`M ${w.x} ${w.y} q 14 -10 28 0 t 28 0 t 28 0`}
            fill="none"
            stroke={alpha('#5f88a0', 0.55 * sea)}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
        {coast > 0 ? (
          <path d={coastD} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - coast} />
        ) : null}
        {route > 0 ? (
          <>
            <path d={smooth(ROUTE)} fill="none" stroke={alpha(look.accent, 0.22)} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - route} />
            <path d={smooth(ROUTE)} fill="none" stroke={look.accent} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - route} />
          </>
        ) : null}
      </svg>
      {STOPS.map((s, i) => (
        <Postmark key={s.name} stop={s} at={at(i)} left={i === 3} />
      ))}
      {cards ? (
        <>
          <div style={{position: 'absolute', left: 560, top: 46}}>
            <Paper width={360} height={186} rotate={3} start={at(0) + 8} seed={3}>
              <Note title="Day 1 · Porto" body="Tiles everywhere. Best custard of my life." />
            </Paper>
          </div>
          <div style={{position: 'absolute', left: 790, top: 250}}>
            <Paper width={300} height={360} rotate={-4} start={at(2) - 4} seed={5}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
                <Flower size={120} petals={5} start={at(2) + 4} frames={50} seed={4} />
                <Note title="Day 5 · Évora" body="Picked one for the book." size={30} />
              </div>
            </Paper>
          </div>
          <div style={{position: 'absolute', left: 640, top: 606}}>
            <Paper width={400} height={186} rotate={2} start={at(3) + 6} seed={8}>
              <Watercolor width={360} height={150} kind="stroke" color="#8fb6c9" start={at(3) + 10}>
                <Note title="Day 8 · Lagos" body="Swam before breakfast." />
              </Watercolor>
            </Paper>
          </div>
        </>
      ) : null}
    </div>
  );
};

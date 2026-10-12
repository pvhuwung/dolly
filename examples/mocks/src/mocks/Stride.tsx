import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Share2} from 'lucide-react';
import {Contours} from '../fx/drawings';
import {Badge, Burst, Draw, Ring, Shine} from '../fx/graphics';
import {Counter, Kinetic} from '../fx/text';
import {alpha, useLook} from '../look';
import {Backdrop} from '../fx/backdrops';
import type {Mock} from './mock';

// STRIDE: a year in review for an invented running app: one runner's 2026 in numbers, for Stories
// and Reels. Bold style on a volt-lime page, vertical, about 24 s. The year → the distance → the
// best month → the goal → the milestones → the favourite route → a card to share.

const VOLT = '#c6f432';
const PINK = '#ff3d7f';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useSp = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 24, config: {damping?: number; stiffness?: number; mass?: number} = look.spring) =>
    spring({frame: frame - at, fps, config, durationInFrames: frames});
};

/** The safe area as an absolutely placed column (inset a div, not an AbsoluteFill). */
const Column: React.FC<{children: React.ReactNode; justify?: 'center' | 'flex-start'; gap?: number}> = ({children, justify = 'center', gap = 30}) => {
  const look = useLook();
  return (
    <div
      style={{
        position: 'absolute',
        left: look.safe.left,
        right: look.safe.right,
        top: look.safe.top,
        bottom: look.safe.bottom,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justify,
        alignItems: 'flex-start',
        gap,
      }}
    >
      {children}
    </div>
  );
};

/** A headline at the top of the safe area. */
const Head: React.FC<{text: string; accent?: string; start?: number}> = ({text, accent, start = 2}) => {
  const look = useLook();
  return (
    <div style={{position: 'absolute', left: look.safe.left, right: look.safe.right, top: look.safe.top}}>
      <Kinetic text={text} accent={accent} start={start} />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// HOOK: the year, big, with speed lines streaking past behind it.

const Streaks: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const lanes = [
    {y: 0.2, w: 520, speed: 34, off: 0},
    {y: 0.31, w: 300, speed: 46, off: 600},
    {y: 0.47, w: 680, speed: 28, off: 300},
    {y: 0.62, w: 420, speed: 40, off: 900},
    {y: 0.74, w: 560, speed: 32, off: 150},
    {y: 0.86, w: 340, speed: 44, off: 700},
  ];
  const span = look.width + 900;
  return (
    <AbsoluteFill>
      {lanes.map((l, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: l.y * look.height,
            left: look.width - ((frame * l.speed + l.off) % span),
            width: l.w,
            height: 26,
            borderRadius: 13,
            background: alpha(look.ink, 0.08),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const look = useLook();
  const sp = useSp();
  const tag = sp(0, 16);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Streaks />
      <Column gap={10}>
        <div style={{...look.eyebrow, fontSize: 36, opacity: tag, transform: `translateY(${(1 - tag) * 12}px)`}}>Stride · Year in running</div>
        <Kinetic text="2026" effect="letters" start={4} style={{fontSize: 330, lineHeight: 0.92, letterSpacing: '-0.05em'}} />
        <div style={{marginTop: 18}}>
          <Kinetic text="Your year" accent="in running." start={30} />
        </div>
      </Column>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// DISTANCE: how far, and what that compares to.

const COUNT = 8;
const COUNTED = COUNT + 44;

const Distance: React.FC = () => {
  const look = useLook();
  const sp = useSp();
  const note = sp(COUNTED + 6, 20, {damping: 200});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Column gap={8}>
        <Kinetic text="You ran" start={0} />
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
          <Counter to={1284} start={COUNT} frames={44} style={{...look.headline, fontSize: 250, lineHeight: 1, letterSpacing: '-0.05em'}} />
          <span style={{...look.headline, fontSize: 110, opacity: sp(COUNT + 6, 16)}}>km</span>
        </div>
        <div
          style={{
            marginTop: 24,
            padding: '16px 28px',
            borderRadius: 999,
            background: look.ink,
            color: VOLT,
            fontFamily: look.fonts.body,
            fontSize: 44,
            fontWeight: 700,
            opacity: note,
            transform: `translateY(${(1 - note) * 20}px) rotate(${-2 * note}deg)`,
          }}
        >
          Further than London to Berlin
        </div>
      </Column>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// MONTHS: kilometres by month as horizontal bars (12 upright bars are too thin to read in 9:16).

const MONTHS = [
  ['Jan', 62],
  ['Feb', 71],
  ['Mar', 88],
  ['Apr', 95],
  ['May', 120],
  ['Jun', 104],
  ['Jul', 98],
  ['Aug', 126],
  ['Sep', 168],
  ['Oct', 141],
  ['Nov', 117],
  ['Dec', 94],
] as const;
const BEST = 8;

const Months: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSp();
  const top = 540;
  const row = 60;
  const max = 168;
  const barMax = 540;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Head text="Best month:" accent="September." />
      <div style={{position: 'absolute', left: look.safe.left, right: look.safe.right, top}}>
        {MONTHS.map(([label, km], i) => {
          const best = i === BEST;
          const g = sp(18 + i * 4, 26, {damping: 200});
          const v = Math.round(km * interpolate(frame, [18 + i * 4, 18 + i * 4 + 26], [0, 1], clamp));
          return (
            <div key={label} style={{position: 'absolute', top: i * row, left: 0, right: 0, height: row, display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{width: 90, fontFamily: look.fonts.body, fontSize: 36, fontWeight: best ? 800 : 600, color: best ? look.ink : look.dim}}>{label}</div>
              <div style={{width: barMax * (km / max) * g, height: best ? 40 : 30, borderRadius: 20, background: best ? look.ink : alpha(look.ink, 0.2)}} />
              <div style={{...look.headline, fontSize: best ? 44 : 34, fontWeight: 800, color: best ? look.ink : look.dim, fontVariantNumeric: 'tabular-nums', opacity: Math.min(1, g * 2)}}>
                {v}
              </div>
              {best ? (
                <div
                  style={{
                    padding: '4px 14px',
                    borderRadius: 999,
                    background: PINK,
                    color: '#ffffff',
                    fontFamily: look.fonts.body,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    transform: `scale(${sp(72, 18)})`,
                  }}
                >
                  BEST
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// GOAL: the ring fills, the goal is beaten, confetti.

const FILLED = 62;

const Goal: React.FC = () => {
  const look = useLook();
  const size = 600;
  const top = 600;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Head text="Goal" accent="smashed." />
      <div style={{position: 'absolute', top, left: (look.width - size) / 2}}>
        <Ring value={100} start={6} frames={54} size={size} thickness={46} label="of your 1,000 km goal" />
      </div>
      <div style={{position: 'absolute', top: top + size + 34, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Badge text="+284 km over" tone="card" at={FILLED + 4} size={46} />
      </div>
      <Burst x={look.width / 2} y={top + size / 2} at={FILLED} count={120} power={1.2} colors={['#0b0b0c', '#ffffff', PINK]} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// ROUTE: the favourite run, drawn on a contour map.

const ROUTE = 'M 150 470 C 110 330, 230 170, 400 170 S 700 230, 700 380 S 560 560, 410 520 S 220 500, 150 470';

const Route: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSp();
  const card = sp(0, 22);
  const w = look.width - look.safe.left - look.safe.right;
  const h = 560;
  const top = 540;
  const done = 18 + 54;
  const pulse = (frame / 20) % 1;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Head text="Your favourite" accent="run." />
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          top,
          width: w,
          height: h,
          borderRadius: look.radius,
          overflow: 'hidden',
          background: look.surface,
          boxShadow: look.shadow,
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px) rotate(${(1 - card) * 3}deg)`,
        }}
      >
        <Contours width={w} height={h} levels={9} start={4} seed={7} color={alpha(look.ink, 0.35)} />
        <div style={{position: 'absolute', inset: 0}}>
          <Draw d={ROUTE} width={w} height={h} start={18} frames={54} color={look.ink} strokeWidth={12} />
        </div>
        <div style={{position: 'absolute', left: 150 - 16, top: 470 - 16, width: 32, height: 32, borderRadius: 16, background: PINK, border: '5px solid #ffffff', opacity: sp(16, 12)}} />
        {frame > done ? (
          <div style={{position: 'absolute', left: 150 - 16 - pulse * 30, top: 470 - 16 - pulse * 30, width: 32 + pulse * 60, height: 32 + pulse * 60, borderRadius: '50%', border: `4px solid ${alpha(PINK, 1 - pulse)}`}} />
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: 470,
            top: 120,
            padding: '8px 18px',
            borderRadius: 999,
            background: look.ink,
            color: VOLT,
            fontFamily: look.fonts.body,
            fontSize: 30,
            fontWeight: 800,
            transform: `scale(${sp(done, 18)})`,
          }}
        >
          Riverside loop
        </div>
      </div>
      <div style={{position: 'absolute', left: look.safe.left, right: look.safe.right, top: top + h + 36, display: 'flex', justifyContent: 'space-between'}}>
        {[
          ['8.4 km', 'each lap'],
          ['41', 'times run'],
          ['4:51', 'best /km'],
        ].map(([v, l], i) => {
          const t = sp(done + 4 + i * 6, 20);
          return (
            <div key={l} style={{opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
              <div style={{...look.headline, fontSize: 64, lineHeight: 1}}>{v}</div>
              <div style={{fontFamily: look.fonts.body, fontSize: 30, fontWeight: 600, color: look.dim}}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// SHARE: the year on one card, ready for a story, and the button to share it.

const Share: React.FC = () => {
  const look = useLook();
  const sp = useSp();
  const land = sp(4, 30, {damping: 13, stiffness: 120});
  const w = 640;
  const h = 760;
  const top = look.safe.top + 10;
  const button = sp(40, 22);
  const stats = [
    ['1,284', 'km'],
    ['162', 'runs'],
    ['4:58', 'avg /km'],
    ['38', 'day streak'],
  ];
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          left: (look.width - w) / 2,
          top,
          width: w,
          height: h,
          borderRadius: 40,
          background: '#0b0b0c',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.3)',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${(1 - land) * 300}px) rotate(${10 - 13 * land}deg) scale(${0.8 + 0.2 * land})`,
          opacity: Math.min(1, land * 2),
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Img src={staticFile('mocks/stride.svg')} style={{width: 60, height: 60}} />
          <div style={{fontFamily: look.fonts.body, fontSize: 36, fontWeight: 800, color: '#ffffff'}}>Stride</div>
        </div>
        <div style={{...look.headline, color: VOLT, fontSize: 210, lineHeight: 1, marginTop: 24, letterSpacing: '-0.05em'}}>2026</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 34, columnGap: 24, marginTop: 40}}>
          {stats.map(([v, l], i) => {
            const t = sp(18 + i * 5, 18);
            return (
              <div key={l} style={{opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
                <div style={{...look.headline, color: '#ffffff', fontSize: 70, lineHeight: 1}}>{v}</div>
                <div style={{fontFamily: look.fonts.body, fontSize: 30, fontWeight: 700, color: alpha(VOLT, 0.8)}}>{l}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', top: top + h + 50, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{transform: `scale(${0.8 + 0.2 * button})`, opacity: button}}>
          <Shine at={56} every={50} radius={999}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '22px 44px',
                borderRadius: 999,
                background: look.ink,
                color: VOLT,
                fontFamily: look.fonts.body,
                fontSize: 46,
                fontWeight: 800,
              }}
            >
              <Share2 size={40} strokeWidth={2.6} />
              Share your year
            </div>
          </Shine>
        </div>
        <div style={{fontFamily: look.fonts.mono, fontSize: 34, color: look.dim, opacity: sp(52, 16)}}>stride.run</div>
      </div>
      <Burst x={look.width / 2} y={top + h * 0.4} at={14} count={90} power={1} colors={['#0b0b0c', '#ffffff', PINK]} />
    </AbsoluteFill>
  );
};

// MILESTONES: the year's firsts, down a line that draws from one to the next.

const FIRSTS = [
  {when: 'Mar 9', what: 'First 10K'},
  {when: 'Jun 22', what: '30-day streak'},
  {when: 'Aug 3', what: 'Sub-25 5K'},
  {when: 'Oct 12', what: 'First half marathon'},
];

const Milestones: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSp();
  const top = 560;
  const row = 170;
  const every = 16;
  const first = 14;
  const line = interpolate(frame, [first, first + every * (FIRSTS.length - 1)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Head text="Your" accent="milestones." />
      <div style={{position: 'absolute', left: look.safe.left + 22, top: top + 30, width: 8, height: row * (FIRSTS.length - 1), borderRadius: 4, background: alpha(look.ink, 0.15)}} />
      <div style={{position: 'absolute', left: look.safe.left + 22, top: top + 30, width: 8, height: row * (FIRSTS.length - 1) * line, borderRadius: 4, background: look.ink}} />
      {FIRSTS.map((m, i) => {
        const t = sp(first + i * every, 20);
        const last = i === FIRSTS.length - 1;
        return (
          <div key={m.when} style={{position: 'absolute', left: look.safe.left, right: look.safe.right, top: top + i * row, display: 'flex', alignItems: 'flex-start', gap: 34}}>
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                marginTop: 4,
                borderRadius: 26,
                background: last ? PINK : look.ink,
                border: `6px solid ${VOLT}`,
                boxShadow: `0 0 0 4px ${last ? PINK : look.ink}`,
                transform: `scale(${t})`,
              }}
            />
            <div style={{opacity: Math.min(1, t * 1.5), transform: `translateX(${(1 - t) * 30}px)`}}>
              <div style={{display: 'inline-block', padding: '4px 16px', borderRadius: 999, background: look.ink, color: VOLT, fontFamily: look.fonts.body, fontSize: 30, fontWeight: 800}}>{m.when}</div>
              <div style={{...look.headline, fontSize: last ? 70 : 60, lineHeight: 1.05, marginTop: 10}}>{m.what}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const stride: Mock = {
  id: 'Stride',
  title: 'one runner’s 2026, for a running app',
  agenda: 'year in review',
  style: 'bold',
  format: 'vertical',
  brand: {name: 'Stride', url: 'stride.run', logo: 'mocks/stride.svg', accent: VOLT, alert: PINK},
  music: 'mocks/stride-music.wav',
  poster: 660,
  tings: [
    ['Distance', COUNTED],
    ['Goal', FILLED],
    ['Share', 14],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.4, component: Hook},
    {name: 'Distance', seconds: 3.2, component: Distance},
    {name: 'Months', seconds: 4.2, component: Months},
    {name: 'Goal', seconds: 3.4, component: Goal},
    {name: 'Milestones', seconds: 4.4, component: Milestones},
    {name: 'Route', seconds: 4.2, component: Route},
    {name: 'Share', seconds: 4, component: Share},
  ],
};

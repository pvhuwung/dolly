import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camera, Check, Flame, Timer, UtensilsCrossed} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Badge, Burst, Icon} from '../fx/graphics';
import {Cycle, Kinetic} from '../fx/text';
import {Layer, Rect, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {alpha, useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, LogoReveal} from '../templates';
import type {Mock} from './mock';
import {Dot, FOUND} from './pantrio/art';
import {CARDS, PhoneUI, T} from './pantrio/phone';

// PANTRIO, a recipe app: dinner in 15 minutes from what's already in your fridge.
// For Reels and TikTok: bold, vertical, about 22 s. The hook is the question everyone asks at 6pm;
// the proof is the app scanning a fridge and turning it into three recipes; the payoff is a
// 15-minute countdown to "Dinner's ready."

const TOMATO = '#e5432d';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// HOOK: the question, then the answers we all fall back on, cycling in a knocked-out block.
const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const block = spring({frame: frame - 28, fps, config: look.spring, durationInFrames: 22});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom}px ${look.safe.left}px`,
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: look.size * 0.45,
        }}
      >
        <Kinetic text="What’s for dinner?" start={-6} style={{fontSize: Math.round(look.size * 1.3)}} />
        <div
          style={{
            display: 'inline-flex',
            padding: '0.02em 0.3em 0.06em',
            borderRadius: 22,
            background: look.accent,
            transform: `rotate(-3deg) scale(${block})`,
            transformOrigin: '10% 50%',
            opacity: Math.min(1, block * 2),
          }}
        >
          <Cycle words={['Pasta?', 'Tacos?', 'Curry?', 'Cereal again?']} every={15} start={30} style={{color: look.onAccent, fontSize: Math.round(look.size * 1.1)}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// DEMO: the phone, in 3D. The camera arrives on the scan; every find pops out beside the phone as a
// sticker, then the stickers drop into the app, the recipes slide in, the camera pushes in to them,
// and the first one is tapped.

const PHONE = {width: 416, height: 876};
const LENS = 1600;
const BEZEL = 12;
const VIEW_TOP = 48;
/** Frame subjects between the caption (two lines) and the bottom of the screen. */
const AIM = {top: 560, bottom: 250};

/** A find, popped out of the phone at the height it sits in the fridge, then pulled back in. */
const Sticker: React.FC<{i: number}> = ({i}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = FOUND[i];
  const side = i % 2 === 0 ? -1 : 1;
  const pop = spring({frame: frame - T.found(i), fps, config: {damping: 11, stiffness: 150}});
  const home = interpolate(frame, [80 + i * 2, 94 + i * 2], [0, 1], {...clamp, easing: ease.in});
  if (pop <= 0.01 || home >= 1) return null;
  const y = -PHONE.height / 2 + BEZEL + VIEW_TOP + f.box.y + f.box.height / 2;
  return (
    <Layer x={side * 228 * (1 - home)} y={y} z={130 - home * 130} rz={side * -5 * (1 - home)} scale={1 - home * 0.7}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px 12px 14px',
          borderRadius: 22,
          background: '#ffffff',
          boxShadow: '0 18px 40px rgba(60, 10, 0, 0.35)',
          fontFamily: look.fonts.body,
          fontSize: 30,
          fontWeight: 800,
          color: '#1b1412',
          whiteSpace: 'nowrap',
          opacity: Math.min(1, pop * 1.6) * (1 - home * 0.6),
          transform: `scale(${0.4 + 0.6 * pop})`,
        }}
      >
        <Dot color={f.color} size={26} />
        {f.name}
        {f.count ? <span style={{color: TOMATO}}>{f.count}</span> : null}
      </div>
    </Layer>
  );
};

const Demo: React.FC = () => {
  const video = useVideoConfig();
  const look = useLook();
  // Rects of the phone, from its top-left: the whole of it; the recipe list, header to last card,
  // held low enough that the phone's top stays under the caption; then, once the caption has gone,
  // the cards and the "Start cooking" bar under them.
  const frameOn = (rect: Rect, fill: number, top = AIM.top) => focusOn({rect, size: PHONE, video, lens: LENS, fill, ...AIM, top});
  const wide = frameOn(whole(PHONE), 0.94);
  const cards = frameOn({x: BEZEL + CARDS.x, y: BEZEL + 56, width: CARDS.width, height: CARDS.y + CARDS.height - 56}, 0.92, 620);
  const cook = frameOn({x: BEZEL + CARDS.x, y: BEZEL + CARDS.y, width: CARDS.width, height: 852 - CARDS.y}, 0.9);
  const camera = useShot(
    [
      ...moves.tiltIn(wide, {frames: 44, yaw: -24, pitch: 12, back: 700}),
      ...moves.zoomIn(wide, cards, {start: 106, hold: 6, frames: 40}),
      [T.cook, cards],
      [T.cook + 26, cook, ease.inOut],
    ],
    {dolly: 24, yaw: 2},
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0.5} background="#0d0d0f">
            <PhoneUI />
          </Screen>
        </Layer>
        {FOUND.map((f, i) => (
          <Sticker key={f.name} i={i} />
        ))}
      </Stage>
      <Caption title="Snap your" accent="fridge." start={6} exit={98} />
      <Caption title="Pick one." accent="Ready in 15." start={112} exit={T.cook - 4} />
      <Sequence from={T.tap} durationInFrames={20}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};

// COOK: fifteen minutes in two seconds, the steps ticking by, then dinner's ready.
const DONE = 78;

const Cook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = 600;
  const stroke = 30;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const appear = spring({frame: frame - 2, fps, config: look.spring, durationInFrames: 20});
  const t = interpolate(frame, [12, DONE], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1)});
  const secs = Math.round(900 * (1 - t));
  const done = spring({frame: frame - DONE, fps, config: {damping: 11, stiffness: 170}});
  const steps = ['Sauté the garlic', 'Add the tomatoes', 'Crack in the eggs'];
  const step = steps[Math.min(steps.length - 1, Math.max(0, Math.floor((frame - 12) / 22)))];
  const stepIn = spring({frame: (frame - 12) % 22, fps, config: {damping: 200}, durationInFrames: 10});
  const ringTop = look.safe.top + 120;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', top: look.safe.top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Badge text="Shakshuka · 400× speed" icon={Flame} at={4} tone="card" size={40} />
      </div>
      <div style={{position: 'absolute', top: ringTop, left: (look.width - size) / 2, width: size, height: size, transform: `scale(${0.8 + 0.2 * appear})`, opacity: appear}}>
        <svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(look.ink, 0.18)} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={look.ink} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * (1 - t)} ${c}`} opacity={t < 0.995 ? 1 : 0} />
        </svg>
        {done > 0 ? (
          <div style={{position: 'absolute', inset: stroke, borderRadius: '50%', background: look.ink, transform: `scale(${done})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Check size={230} strokeWidth={3.2} color={look.onAccent} style={{transform: `scale(${0.5 + 0.5 * done})`}} />
          </div>
        ) : (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            <div style={{...look.headline, fontSize: 168, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
              {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
            </div>
            <div style={{fontFamily: look.fonts.body, fontSize: 40, fontWeight: 700, color: look.dim, opacity: stepIn, transform: `translateY(${(1 - stepIn) * 14}px)`}}>
              {step}
            </div>
          </div>
        )}
      </div>
      <div style={{position: 'absolute', top: ringTop + size + 40, left: look.safe.left, right: look.safe.right}}>
        <Kinetic text="Dinner’s" accent="ready." start={DONE + 4} align="center" style={{fontSize: Math.round(look.size * 1.1)}} />
      </div>
      <Burst x={look.width / 2} y={ringTop + size / 2} at={DONE + 1} count={110} power={1.15} colors={['#ffffff', '#ffb627', '#5cbc68', '#2b1a17']} />
    </AbsoluteFill>
  );
};

// RECAP: how it works, as three beats.
const Recap: React.FC = () => {
  const look = useLook();
  const rows = [
    {icon: Camera, word: 'Snap.'},
    {icon: UtensilsCrossed, word: 'Pick.'},
    {icon: Timer, word: 'Cook.'},
  ];
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom}px ${look.safe.left + 40}px`,
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 34,
        }}
      >
        {rows.map((r, i) => (
          <div key={r.word} style={{display: 'flex', alignItems: 'center', gap: 40}}>
            <Icon icon={r.icon} size={190} at={4 + i * 12} tone={i === rows.length - 1 ? 'accent' : 'card'} />
            <Kinetic text={r.word} start={6 + i * 12} effect="pop" style={{fontSize: Math.round(look.size * 1.55)}} />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SCENES: Mock['scenes'] = [
  {name: 'Hook', seconds: 3.4, component: Hook},
  {name: 'Logo', seconds: 2.6, component: () => <LogoReveal kind="pop" tagline="Dinner from" accent="your fridge." />},
  {name: 'Demo', seconds: 8.6, component: Demo},
  {name: 'Cook', seconds: 4, component: Cook},
  {name: 'Recap', seconds: 2.8, component: Recap},
  {name: 'End', seconds: 3.4, component: () => <EndCard line="Dinner, sorted." accent="Every night." button="Get Pantrio" />},
];

export const pantrio: Mock = {
  id: 'Pantrio',
  title: 'a recipe app: dinner from what’s in your fridge',
  agenda: 'launch',
  style: 'bold',
  format: 'vertical',
  brand: {name: 'Pantrio', url: 'pantrio.app', logo: 'mocks/pantrio.svg', accent: TOMATO, alert: '#ffb627'},
  poster: 226,
  scenes: SCENES,
  tings: [
    ['Logo', 4],
    ['Demo', T.sheet],
    ['Cook', DONE],
  ],
  music: 'mocks/pantrio-music.wav',
};

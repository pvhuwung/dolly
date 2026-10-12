import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Doodles, Paper, Stitch, Watercolor} from '../fx/drawings';
import {Kinetic} from '../fx/text';
import {useLook} from '../look';
import {Caption} from '../parts';
import {Countdown, EndCard} from '../templates';
import type {Mock} from './mock';
import {BERRY, Batard, Bun, CRUST_DARK, Cup, INK, Loaf, Steam, StreetMap, hand} from './juniper/art';

// JUNIPER & RYE: an invented neighbourhood bakery and café announcing its grand opening. Not
// software: a Reel for the neighbourhood. Paper style, 9:16, ~22 s. The pull (fresh bread on your
// street), who they are, what's on the counter, when they're open, where to find them, how long
// until the doors open, and the reason to come on day one.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const inner = (look: ReturnType<typeof useLook>) => look.width - look.safe.left - look.safe.right;

/** A handwritten note in the margin, with a drawn arrow, appearing at `at`. */
const Note: React.FC<{text: string; at: number; x: number; y: number; rotate?: number; arrow?: 'left' | 'down' | 'none'}> = ({text, at, x, y, rotate = -5, arrow = 'left'}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 12], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rotate}deg)`, display: 'flex', alignItems: 'center', gap: 6, flexDirection: arrow === 'down' ? 'column' : 'row'}}>
      {arrow === 'left' ? (
        <div style={{transform: 'scaleX(-1)'}}>
          <Doodles kind="arrow" width={110} height={60} start={at} frames={16} color={CRUST_DARK} />
        </div>
      ) : null}
      <div style={{fontFamily: hand, fontSize: 50, fontWeight: 700, color: CRUST_DARK, opacity: t, whiteSpace: 'nowrap'}}>{text}</div>
      {arrow === 'down' ? (
        <div style={{transform: 'rotate(90deg)'}}>
          <Doodles kind="arrow" width={90} height={50} start={at} frames={16} color={CRUST_DARK} />
        </div>
      ) : null}
    </div>
  );
};

/** A centred paper card at `top`, creeping closer over the scene. */
const Card: React.FC<{top: number; width: number; height: number; rotate?: number; start?: number; padding?: number; children: React.ReactNode}> = ({
  top,
  width,
  height,
  rotate,
  start = 6,
  padding = 0,
  children,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 160], [1, 1.035]);
  return (
    <div style={{position: 'absolute', left: (look.width - width) / 2, top, transform: `scale(${push})`, transformOrigin: '50% 30%'}}>
      <Paper width={width} height={height} rotate={rotate} start={start} padding={padding}>
        {children}
      </Paper>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------

const Hook: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: look.safe.left, top: look.safe.top, width: inner(look)}}>
        <Kinetic text="Fresh bread," accent="on Elm Street." start={2} style={{fontSize: Math.round(look.size * 1.12)}} />
      </div>
      <Card top={650} width={780} height={600} rotate={-2.5} start={8}>
        <div style={{position: 'relative', width: 520, height: 352, marginTop: 70}}>
          <Loaf size={520} start={18} />
          <Steam x={260} y={30} start={52} wisps={3} spread={44} height={150} />
        </div>
      </Card>
      <Note text="still warm" at={66} x={640} y={1268} rotate={-5} arrow="none" />
    </AbsoluteFill>
  );
};

const Name: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 110}});
  const pill = interpolate(frame, [34, 46], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: look.safe.top + 10, gap: 26}}>
        <Watercolor width={500} height={480} kind="pool" start={0} frames={30}>
          <Img src={staticFile('mocks/juniper.svg')} style={{width: 290, height: 290, transform: `scale(${0.5 + 0.5 * logo})`, opacity: Math.min(1, logo * 2)}} />
        </Watercolor>
        <Kinetic text="Juniper & Rye" start={16} effect="rise" align="center" style={{fontSize: Math.round(look.size * 1.3), fontWeight: 400}} />
        <div style={{...look.eyebrow, fontSize: 36, opacity: pill, transform: `translateY(${(1 - pill) * 10}px)`}}>bakery · café</div>
        <div style={{width: inner(look), marginTop: 10}}>
          <Kinetic text="Opening this" accent="Saturday." start={44} align="center" style={{fontSize: Math.round(look.size * 0.82)}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MENU: {Art: React.FC<{size: number; start?: number}>; label: string; detail: string; price: string; size: number}[] = [
  {Art: Loaf, label: 'Country sourdough', detail: 'the house loaf', price: '$9', size: 128},
  {Art: Bun, label: 'Cardamom bun', detail: 'warm from 7am', price: '$4.50', size: 108},
  {Art: Batard, label: 'Rye & fig', detail: 'dark, a little sweet', price: '$10', size: 132},
  {Art: Cup, label: 'Flat white', detail: 'oat or whole', price: '$4.25', size: 104},
];

const Menu: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Caption title="Baked at 5am," accent="every morning." start={4} />
      <Card top={590} width={860} height={700} rotate={1.2} start={6} padding={44}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, width: '100%'}}>
          {MENU.map((m, i) => {
            const at = 20 + i * 14;
            const t = interpolate(frame, [at, at + 14], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
            const leader = interpolate(frame, [at + 6, at + 22], [0, 1], clamp);
            return (
              <div key={m.label} style={{display: 'flex', alignItems: 'center', gap: 22, height: 134, opacity: t, transform: `translateX(${(1 - t) * -24}px)`}}>
                <div style={{width: 140, display: 'flex', justifyContent: 'center', flexShrink: 0}}>
                  <m.Art size={m.size} start={at} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0}}>
                  <div style={{fontFamily: look.fonts.headline, fontSize: 46, fontWeight: 700, color: INK, lineHeight: 1.1}}>{m.label}</div>
                  <div style={{fontFamily: hand, fontSize: 38, fontWeight: 500, color: '#6b5d4f', lineHeight: 1.1}}>{m.detail}</div>
                </div>
                <div style={{flex: 1, alignSelf: 'center', marginTop: 18, borderBottom: `4px dotted rgba(46, 42, 36, 0.3)`, transformOrigin: '0 50%', transform: `scaleX(${leader})`}} />
                <div style={{position: 'relative', fontFamily: look.fonts.headline, fontSize: 48, fontWeight: 700, color: look.accentText, fontVariantNumeric: 'tabular-nums', opacity: leader}}>
                  {m.price}
                  {i === 1 ? (
                    <div style={{position: 'absolute', left: -34, top: -26, pointerEvents: 'none'}}>
                      <Doodles kind="circle" width={190} height={110} start={92} frames={18} color={CRUST_DARK} strokeWidth={4} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Note text="the buns sell out by 10" at={104} x={300} y={1300} rotate={-3} arrow="none" />
    </AbsoluteFill>
  );
};

const HOURS = [
  ['Mon – Fri', '7am – 4pm'],
  ['Sat – Sun', '8am – 3pm'],
];

const Hours: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Caption title="Open early," accent="every day." start={4} />
      <Card top={600} width={780} height={600} rotate={-1.5} start={6} padding={50}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, width: '100%'}}>
          <Stitch size={200} shape="sun" start={12} frames={40} />
          {HOURS.map(([days, time], i) => {
            const t = interpolate(frame, [30 + i * 10, 44 + i * 10], [0, 1], clamp);
            return (
              <div key={days} style={{display: 'flex', alignItems: 'baseline', gap: 18, width: '100%', opacity: t, transform: `translateY(${(1 - t) * 14}px)`}}>
                <div style={{fontFamily: look.fonts.headline, fontSize: 54, fontWeight: 400, color: INK}}>{days}</div>
                <div style={{flex: 1, borderBottom: `4px dotted rgba(46, 42, 36, 0.3)`}} />
                <div style={{fontFamily: look.fonts.headline, fontSize: 54, fontWeight: 700, color: INK, fontVariantNumeric: 'tabular-nums'}}>{time}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Note text="coffee from 7 sharp" at={56} x={330} y={1240} rotate={-3} arrow="none" />
    </AbsoluteFill>
  );
};

const Where: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Caption title="Find us at" accent="14 Elm Street." start={4} />
    <Card top={580} width={860} height={760} rotate={1} start={6}>
      <StreetMap w={800} h={700} start={12} pinAt={62} />
    </Card>
  </AbsoluteFill>
);

export const juniper: Mock = {
  id: 'Juniper',
  title: 'a neighbourhood bakery and café opens its doors',
  agenda: 'shop opening',
  style: 'paper',
  format: 'vertical',
  brand: {name: 'Juniper & Rye', url: 'juniperandrye.cafe', logo: 'mocks/juniper.svg', accent: '#3e6a4f', alert: BERRY},
  music: 'mocks/juniper-music.wav',
  poster: 310,
  tings: [
    ['Name', 8],
    ['Map', 62],
    ['End', 56],
  ],
  // Fades, not the paper style's flip: the flip turns each scene over a black frame.
  scenes: [
    {name: 'Hook', seconds: 3.4, component: Hook},
    {name: 'Name', seconds: 3.6, transition: 'fade', component: Name},
    {name: 'Menu', seconds: 4.8, transition: 'fade', component: Menu},
    {name: 'Hours', seconds: 3.2, transition: 'fade', component: Hours},
    {name: 'Map', seconds: 4, transition: 'fade', component: Where},
    {
      name: 'Countdown',
      seconds: 3.6,
      transition: 'fade',
      component: () => <Countdown eyebrow="grand opening" title="Doors open" accent="Saturday." to="Sat · 8:00 AM · 14 Elm St" from={{days: 2, hours: 14, minutes: 6, seconds: 41}} />,
    },
    {name: 'End', seconds: 3.4, transition: 'fade', component: () => <EndCard line="First coffee's" accent="on us." button="See you Saturday" />},
  ],
};

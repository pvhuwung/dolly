import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Butterfly, Constellation, Doodles, Flower, Paper, Stamps} from '../fx/drawings';
import {Badge} from '../fx/graphics';
import {Kinetic} from '../fx/text';
import {Layer, Screen, Stage, ease, focusOn, useShot, whole} from '../kit';
import {alpha, mix, useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, LogoReveal} from '../templates';
import type {Mock} from './mock';
import {MAP, MapArt, hand, stopFrame} from './wander/MapArt';

// WANDER, an invented travel journal that turns a trip into a hand-drawn map and a book. Paper
// style, 16:9. The pain (a trip lost in 2,000 photos), the product, the proof (the map drawing
// itself stop by stop, with each day's page pinned to it), every trip together, the printed book,
// the ask.

const LENS = 1800;
const ACCENT = '#c8552b';
const INK = '#2b2630';
const PAPER_BG = '#f6f1e5';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------------------------------------
// Hook: a camera roll's worth of grey placeholders, and the line on a card over them.

const Hook: React.FC = () => {
  const look = useLook();
  const f = useCurrentFrame();
  const cols = 15;
  const rows = 8;
  const size = 112;
  const gap = 14;
  const x0 = (look.width - cols * (size + gap) + gap) / 2;
  const y0 = (look.height - rows * (size + gap) + gap) / 2;
  const push = interpolate(f, [0, 110], [1, 1.07]);
  const dim = interpolate(f, [16, 34], [0, 0.42], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        {Array.from({length: cols * rows}, (_, i) => {
          const r = random(`tile-${i}`);
          // A quarter of them are already there on the first frame.
          const at = -6 + r * 26;
          const t = interpolate(f, [at, at + 6], [0, 1], {...clamp, easing: ease.out});
          if (t <= 0) return null;
          const tone = mix('#bdb8cc', '#8c879d', random(`tone-${i}`));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x0 + (i % cols) * (size + gap) + (random(`dx-${i}`) - 0.5) * 12,
                top: y0 + Math.floor(i / cols) * (size + gap) + (random(`dy-${i}`) - 0.5) * 12,
                width: size,
                height: size,
                borderRadius: 8,
                background: `linear-gradient(170deg, ${mix(tone, '#ffffff', 0.25)}, ${tone})`,
                transform: `rotate(${(random(`r-${i}`) - 0.5) * 7}deg) scale(${0.7 + 0.3 * t})`,
                opacity: t,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{background: look.background, opacity: dim}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Paper width={1080} height={300} rotate={-2} start={16} seed={2}>
          <Kinetic text="Your trip," accent="in 2,000 photos." start={26} align="center" style={{fontSize: 92, color: INK}} />
        </Paper>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The journal app: trips on the left, this trip's map drawing itself on the right.

const WIN = {width: 1560, height: 880};
const BAR = 40;
const SIDE = WIN.width - MAP.width;
const ROUTE_AT = 70;
const ROUTE_FRAMES = 170;

const TRIPS = [
  {name: 'Portugal', meta: 'Oct 2026 · 9 days', color: ACCENT},
  {name: 'Kyoto', meta: 'Apr 2026 · 12 days', color: '#d98c95'},
  {name: 'Patagonia', meta: 'Jan 2026 · 16 days', color: '#6f8f55'},
  {name: 'Iceland', meta: 'Aug 2025 · 7 days', color: '#6f9fc0'},
  {name: 'Morocco', meta: 'Mar 2025 · 10 days', color: '#d9a443'},
];

const Sidebar: React.FC = () => {
  const look = useLook();
  return (
    <div style={{width: SIDE, height: MAP.height, background: '#efe8da', borderRight: `1px solid ${alpha(INK, 0.1)}`, padding: '26px 18px', display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px 18px'}}>
        <Img src={staticFile('mocks/wander.svg')} style={{width: 36, height: 36}} />
        <div style={{fontFamily: look.fonts.body, fontSize: 24, fontWeight: 700, color: INK}}>Wander</div>
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 15, letterSpacing: '0.1em', color: alpha(INK, 0.5), padding: '0 10px 8px'}}>TRIPS</div>
      {TRIPS.map((t, i) => (
        <div
          key={t.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 12px',
            borderRadius: 10,
            background: i === 0 ? '#fbf8f1' : 'transparent',
            boxShadow: i === 0 ? `0 1px 3px ${alpha(INK, 0.1)}` : undefined,
          }}
        >
          <div style={{width: 12, height: 12, borderRadius: 6, background: t.color}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <div style={{fontFamily: look.fonts.body, fontSize: 21, fontWeight: 600, color: INK}}>{t.name}</div>
            <div style={{fontFamily: look.fonts.body, fontSize: 16, color: alpha(INK, 0.55)}}>{t.meta}</div>
          </div>
        </div>
      ))}
      <div style={{marginTop: 'auto', padding: '0 12px', fontFamily: look.fonts.body, fontSize: 20, fontWeight: 600, color: ACCENT}}>+ New trip</div>
    </div>
  );
};

const App: React.FC = () => {
  const look = useLook();
  return (
    <Screen frame="window" title="Wander — Portugal" width={WIN.width} height={WIN.height} background={PAPER_BG} glare={0.25}>
      <div style={{position: 'absolute', inset: 0, display: 'flex'}}>
        <Sidebar />
        <div style={{position: 'relative', width: MAP.width, height: MAP.height}}>
          <MapArt start={4} routeAt={ROUTE_AT} routeFrames={ROUTE_FRAMES} />
          <div style={{position: 'absolute', right: 26, top: 26, padding: '10px 20px', borderRadius: 999, background: ACCENT, color: '#fbf5ea', fontFamily: look.fonts.body, fontSize: 19, fontWeight: 600}}>
            Print as a book
          </div>
        </div>
      </div>
    </Screen>
  );
};

/** A rect of the map, in the window's px. */
const onMap = (x: number, y: number, width: number, height: number) => ({x: SIDE + x, y: BAR + y, width, height});

const Journal: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const framed = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: WIN, video, lens: LENS, fill, ...look.aim});
  const wide = framed(whole(WIN), 0.92);
  const north = framed(onMap(280, 20, 1000, 460), 0.94);
  const south = framed(onMap(280, 320, 1000, 520), 0.94);
  const lisbon = stopFrame(1, ROUTE_AT, ROUTE_FRAMES);
  const lagos = stopFrame(3, ROUTE_AT, ROUTE_FRAMES);
  const camera = useShot(
    [
      [0, {...wide, dolly: wide.dolly - 260, yaw: -8, pitch: 4}],
      [44, wide, ease.out],
      [82, north, ease.inOut],
      // Pan south as the route nears Lisbon, so it lands mid-move rather than at the frame's edge.
      [lisbon - 14, north],
      [lisbon + 40, south, ease.inOut],
      [lagos + 22, south],
      [lagos + 66, wide, ease.inOut],
    ],
    {dolly: 26},
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <App />
        </Layer>
      </Stage>
      <Caption eyebrow="Portugal · 9 days" title="Every stop," accent="on the map." start={8} exit={lisbon + 14} scrim />
      <Caption title="Every day," accent="a page." start={lisbon + 26} scrim />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Every trip, as one constellation.

const Trips: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: 0, right: 0, top: look.band + 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <Paper width={1240} height={560} rotate={-1.5} start={4} seed={11}>
          <Constellation width={1140} height={480} count={16} start={14} stagger={4} seed={6} color={INK} />
        </Paper>
        <div style={{display: 'flex', gap: 18}}>
          <Badge text="14 trips" tone="card" at={64} />
          <Badge text="9 countries" tone="card" at={70} />
          <Badge text="212 days away" tone="card" at={76} />
        </div>
      </div>
      <Caption eyebrow="Since 2019" title="Every trip," accent="in one sky." start={6} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The printed book: the cover swings open on the trip's map and a page from the journal.

const PAGE = {width: 600, height: 780};

const Cover: React.FC = () => (
  <Paper width={PAGE.width} height={PAGE.height} color={ACCENT} seed={21}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: '#fbf5ea'}}>
      <Doodles kind="squiggle" width={220} height={60} start={-999} color={alpha('#fbf5ea', 0.6)} strokeWidth={4} />
      <div style={{fontFamily: 'inherit', fontSize: 108, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1}}>Portugal</div>
      <div style={{fontSize: 22, letterSpacing: '0.2em', opacity: 0.85}}>OCTOBER 2026</div>
    </div>
  </Paper>
);

const MapPage: React.FC = () => (
  <Paper width={PAGE.width} height={PAGE.height} seed={22}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      <div style={{width: MAP.width * 0.43, height: MAP.height * 0.43, overflow: 'hidden', borderRadius: 4}}>
        <div style={{transform: 'scale(0.43)', transformOrigin: '0 0'}}>
          <MapArt start={-999} routeAt={-999} routeFrames={1} cards={false} />
        </div>
      </div>
      <div style={{fontFamily: hand, color: INK, textAlign: 'center', lineHeight: 1.05}}>
        <div style={{fontSize: 56, fontWeight: 700}}>Portugal</div>
        <div style={{fontSize: 34, fontWeight: 500, color: alpha(INK, 0.75)}}>9 days · 4 stops · 1,240 km</div>
      </div>
    </div>
  </Paper>
);

const JournalPage: React.FC = () => (
  <Paper width={PAGE.width} height={PAGE.height} seed={23}>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: hand, color: INK, textAlign: 'center'}}>
      <div style={{fontSize: 50, fontWeight: 700}}>Day 5 · Évora</div>
      <Flower size={170} petals={6} start={-999} seed={4} />
      <div style={{fontSize: 34, lineHeight: 1.15, color: alpha(INK, 0.82), padding: '0 50px'}}>
        Cork trees all the way from Lisbon. Dinner at ten, like everyone else.
      </div>
      <div style={{width: 260, height: 70}}>
        <Stamps width={260} height={70} count={5} motif="sprig" start={-999} seed={9} />
      </div>
    </div>
  </Paper>
);

const Book: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const f = useCurrentFrame();
  const open = interpolate(f, [22, 76], [0, 1], {...clamp, easing: ease.inOut});
  const size = {width: PAGE.width * 2, height: PAGE.height};
  const framed = focusOn({rect: whole(size), size, video, lens: LENS, fill: 0.9, top: look.band, bottom: 110});
  const camera = useShot(
    [
      [0, {...framed, yaw: -14, pitch: 9, dolly: framed.dolly - 220}],
      [80, {...framed, yaw: -3, pitch: 3}, ease.out],
    ],
    {dolly: 30, yaw: 2},
  );
  const face: React.CSSProperties = {position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'};
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.headline}>
        <Layer x={PAGE.width / 2}>
          <JournalPage />
        </Layer>
        {/* The cover, hinged at the spine: its front closes over the right page, its back is the map page. */}
        <Layer z={2} ry={-180 * open}>
          <div style={{position: 'relative', width: PAGE.width * 2, height: PAGE.height, transformStyle: 'preserve-3d'}}>
            <div style={{position: 'absolute', left: PAGE.width, top: 0, width: PAGE.width, height: PAGE.height, transformStyle: 'preserve-3d'}}>
              <div style={face}>
                <Cover />
              </div>
              <div style={{...face, transform: 'rotateY(180deg)'}}>
                <MapPage />
              </div>
            </div>
          </div>
        </Layer>
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: look.safe.bottom + 4, display: 'flex', justifyContent: 'center'}}>
        <Badge text="Hardcover · 64 pages · from $39" tone="accent" at={92} />
      </div>
      <Caption title="Share it as" accent="a printed book." start={8} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------

const End: React.FC = () => (
  <AbsoluteFill>
    <EndCard line="Every trip deserves" accent="a map." button="Start your first map" />
    <div style={{position: 'absolute', left: 1360, top: 170}}>
      <Butterfly size={210} start={26} seed={3} />
    </div>
  </AbsoluteFill>
);

export const wander: Mock = {
  id: 'Wander',
  title: 'a travel journal that draws your trips',
  agenda: 'launch',
  style: 'paper',
  format: 'landscape',
  brand: {name: 'Wander', url: 'wander.travel', logo: 'mocks/wander.svg', accent: ACCENT, alert: '#2f5d8a'},
  poster: 436,
  music: 'mocks/wander-music.wav',
  tings: [
    ['Logo', 6],
    ['Book', 70],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.4, component: Hook},
    {name: 'Logo', seconds: 3, transition: 'fade', component: () => <LogoReveal kind="pop" tagline="Your trips," accent="drawn by hand." />},
    {name: 'Journal', seconds: 10.5, transition: 'fade', component: Journal},
    {name: 'Trips', seconds: 3.8, transition: 'fade', component: Trips},
    {name: 'Book', seconds: 4.8, transition: 'fade', component: Book},
    {name: 'End', seconds: 4, transition: 'fade', component: End},
  ],
};

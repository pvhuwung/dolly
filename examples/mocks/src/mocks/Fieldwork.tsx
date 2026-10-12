import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Kinetic} from '../fx/text';
import {useBrand, useLook} from '../look';
import {Agenda, Countdown, EndCard, Lineup} from '../templates';
import type {Mock} from './mock';

// FIELDWORK: an announcement for an invented two-day conference where every talk is built live.
// Swiss, 16:9 for LinkedIn and X, ~24 s. The hook is the promise (no slides), then the poster
// (dates, city, numbers on the grid), who's speaking, day one with the talk to see, the countdown
// to the doors, and the ask: get your ticket. People, companies and the venue are made up.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

/** Slides its children up from behind a line at frame `at`: the swiss reveal, for any block. */
const Rise: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(24 * look.pace)});
  return (
    <div style={{overflow: 'hidden', ...style}}>
      <div style={{transform: `translateY(${(1 - t) * 108}%)`}}>{children}</div>
    </div>
  );
};

// HOOK: the promise, set as a poster. Huge type on the grid, one orange disc.
const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const disc = spring({frame: frame - 2, fps, config: {damping: 200}, durationInFrames: 34});
  const note = interpolate(frame, [44, 60], [0, 1], clamp);
  const big = {fontSize: 230, lineHeight: 0.98};
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          left: 1330,
          top: 230,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: look.accent,
          transform: `scale(${disc}) translateX(${interpolate(frame, [0, 110], [0, -24])}px)`,
        }}
      />
      <div style={{position: 'absolute', left: look.safe.left, top: 190, width: 1250}}>
        <Kinetic text="Two days." start={3} style={big} />
        <Kinetic text="No slides." start={12} style={{...big, color: look.accentText}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          top: 820,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: look.fonts.mono,
          fontSize: 34,
          color: look.ink,
          opacity: note,
          transform: `translateY(${(1 - note) * 12}px)`,
        }}
      >
        <div style={{width: 18, height: 18, background: look.accent}} />
        Every talk is built live, on stage.
      </div>
    </AbsoluteFill>
  );
};

// POSTER: the dates set huge on the left, the name and the city on the right, an orange rule
// drawing down between them, and the numbers in a row on the grid.
const Poster: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [16, 50], [0, 1], {...clamp, easing: out});
  const drift = interpolate(frame, [0, 140], [0, -16]);
  const date: React.CSSProperties = {...look.headline, fontWeight: 800, fontSize: 360, lineHeight: 0.84, letterSpacing: '-0.06em', display: 'block'};
  const label: React.CSSProperties = {fontFamily: look.fonts.mono, fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase', color: look.dim};
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: look.safe.left + drift, top: 150}}>
        <div style={{display: 'flex'}}>
          <Rise at={4}>
            <span style={date}>14</span>
          </Rise>
          <Rise at={9}>
            <span style={{...date, color: look.accentText}}>–</span>
          </Rise>
          <Rise at={14}>
            <span style={date}>15</span>
          </Rise>
        </div>
        <Rise at={24} style={{marginTop: 22}}>
          <div style={{fontFamily: look.fonts.mono, fontSize: 52, letterSpacing: '0.24em', color: look.ink}}>MAY 2027</div>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: look.safe.left, top: 760, display: 'flex', gap: 60}}>
        {[
          ['2', 'days'],
          ['24', 'live builds'],
          ['600', 'seats'],
        ].map(([n, l], i) => (
          <Rise key={l} at={60 + i * 6}>
            <div style={{width: 280, borderTop: `3px solid ${look.ink}`, paddingTop: 14}}>
              <div style={{...look.headline, fontSize: 96, lineHeight: 1}}>{n}</div>
              <div style={{...label, marginTop: 8}}>{l}</div>
            </div>
          </Rise>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1160, top: 150, width: 12, height: 790 * rule, background: look.accent}} />
      <div style={{position: 'absolute', left: 1222, top: 150, width: 590}}>
        <Rise at={28}>
          <Img src={staticFile(brand.logo)} style={{width: 120, height: 120, display: 'block'}} />
        </Rise>
        <Rise at={34} style={{marginTop: 34}}>
          <div style={{...look.headline, fontSize: 118, lineHeight: 1.02}}>Fieldwork</div>
        </Rise>
        <Rise at={40} style={{marginTop: 10}}>
          <div style={{...look.eyebrow, fontSize: 28}}>
            {look.eyebrowPrefix}A conference for builders
          </div>
        </Rise>
        <Rise at={50} style={{marginTop: 110}}>
          <div style={{fontFamily: look.fonts.body, fontSize: 60, fontWeight: 700, letterSpacing: '-0.02em', color: look.ink}}>Lisbon</div>
        </Rise>
        <Rise at={56} style={{marginTop: 4}}>
          <div style={{fontFamily: look.fonts.body, fontSize: 36, color: look.dim}}>Armazém 7, Marvila</div>
        </Rise>
        <Rise at={74} style={{marginTop: 96}}>
          <div style={{fontFamily: look.fonts.mono, fontSize: 30, color: look.ink}}>{brand.url}</div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const SPEAKERS = [
  {name: 'Inês Carvalho', role: 'Design engineer, Tidewater'},
  {name: 'Marcus Oyelaran', role: 'Staff engineer, Quarry Labs'},
  {name: 'Hana Sato', role: 'Type designer, Kōji Type'},
  {name: 'Theo Lindqvist', role: 'Founder, Northbeam'},
  {name: 'Priya Raman', role: 'Product designer, Slate & Co'},
  {name: 'Diego Ferraz', role: 'Creative technologist, Atlas'},
  {name: 'Amara Diallo', role: 'Research lead, Common Room'},
  {name: 'Jonas Weber', role: 'Engineer, Fold'},
];

const DAY_ONE = [
  {time: '09:00', title: 'Doors and coffee'},
  {time: '09:30', title: 'A type system, live', who: 'Hana Sato'},
  {time: '11:00', title: 'Ship a feature in 40 minutes', who: 'Marcus Oyelaran'},
  {time: '13:30', title: 'Prototypes with real data', who: 'Priya Raman'},
  {time: '16:00', title: 'The city as an interface', who: 'Diego Ferraz'},
];

export const fieldwork: Mock = {
  id: 'Fieldwork',
  title: 'a two-day conference where every talk is built live',
  agenda: 'event',
  style: 'swiss',
  format: 'landscape',
  brand: {name: 'Fieldwork', url: 'fieldwork.events', logo: 'mocks/fieldwork.svg', accent: '#ff4b14', alert: '#1f47d6'},
  music: 'mocks/fieldwork-music.wav',
  poster: 200,
  tings: [
    ['Poster', 6],
    ['Agenda', 96],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.6, component: Hook},
    {name: 'Poster', seconds: 4.6, component: Poster},
    {name: 'Lineup', seconds: 5, component: () => <Lineup eyebrow="Speakers" title="Who's" accent="building live." people={SPEAKERS} />},
    {name: 'Agenda', seconds: 5.4, component: () => <Agenda eyebrow="Day one" title="Thursday," accent="14 May." date="Armazém 7 · Lisbon" items={DAY_ONE} highlight={2} />},
    {
      name: 'Countdown',
      seconds: 4.2,
      component: () => <Countdown eyebrow="Tickets" title="Early-bird price" accent="ends in" to="Until 1 December · €290, then €390" from={{days: 12, hours: 6, minutes: 41, seconds: 12}} />,
    },
    {name: 'End', seconds: 4, component: () => <EndCard line="Two days of" accent="building live." button="Get your ticket" />},
  ],
};

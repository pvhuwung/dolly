import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Layer, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, Lineup, List, Metric} from '../templates';
import type {Mock} from './mock';
import {BEAT, DETAIL, FieldMap, WIN} from './orbit/FieldMap';
import {Planet} from './orbit/Planet';

// ORBIT: a hiring video for an invented 20-person climate-tech startup that turns satellite images
// into what a farmer should do today. Editorial, 4:5 for LinkedIn and Instagram, ~25 s. The hook
// is the mission, then what the product does in one shot, the open roles, a few of the team, the
// scale, and the ask: see open roles. People, places and numbers are made up.

const LENS = 1800;

// HOOK: the mission, over a planet of fields with a satellite scanning it.
const Hook: React.FC = () => {
  const look = useLook();
  const size = 980;
  const top = look.band + (look.height - look.band - look.aim.bottom - size) / 2 + 20;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: (look.width - size) / 2, top}}>
        <Planet size={size} start={2} />
      </div>
      <Caption eyebrow="We're hiring" title="Help farmers see" accent="from space." start={4} size={84} />
    </AbsoluteFill>
  );
};

// PRODUCT: the field map arrives, a satellite pass colours the fields, one is flagged dry, and the
// camera moves in on it and on what to do.
const Product: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  const wide = focusOn({rect: whole(WIN), size: WIN, video, lens: LENS, fill: 0.94, ...look.aim});
  const detail = focusOn({rect: DETAIL, size: WIN, video, lens: LENS, fill: 0.9, ...look.aim});
  const camera = useShot([...moves.tiltIn(wide, {frames: 48, yaw: -18, pitch: 12, back: 600}), [BEAT.flag + 2, wide], [BEAT.flag + 40, detail, ease.inOut]], {dolly: 26});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="none" width={WIN.width} height={WIN.height} radius={14} background="#f7f4ec" glare={0.3}>
            <FieldMap />
          </Screen>
        </Layer>
      </Stage>
      {frame < BEAT.flag ? (
        <Caption eyebrow="What we do" title="Satellite images," accent="made useful." start={6} exit={BEAT.flag - 10} />
      ) : (
        <Caption eyebrow="Every morning" title="Water here." accent="Not everywhere." start={BEAT.flag + 14} scrim />
      )}
    </AbsoluteFill>
  );
};

const ROLES = [
  {label: 'Remote sensing engineer', detail: 'Python, satellite imagery', value: 'Remote'},
  {label: 'Product designer', detail: 'Field tools farmers trust', value: 'Lisbon'},
  {label: 'Agronomist', detail: 'Turn data into advice', value: 'Nairobi'},
  {label: 'Frontend engineer', detail: 'Maps, React, WebGL', value: 'Remote'},
];

const TEAM = [
  {name: 'Amara Njoroge', role: 'Agronomy lead'},
  {name: 'Lukas Brandt', role: 'CTO'},
  {name: 'Sofia Mendes', role: 'Design'},
  {name: 'Kenji Arai', role: 'Data science'},
];

export const orbit: Mock = {
  id: 'Orbit',
  title: 'a climate-tech startup that turns satellite images into farm advice',
  agenda: 'hiring',
  style: 'editorial',
  format: 'portrait',
  brand: {name: 'Orbit', url: 'orbit.earth/careers', logo: 'mocks/orbit.svg', accent: '#2f6f4e', alert: '#c8642b'},
  music: 'mocks/orbit-music.wav',
  poster: 262,
  tings: [
    ['Product', BEAT.flag],
    ['End', 56],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.8, component: Hook},
    {name: 'Product', seconds: 5.8, component: Product},
    {name: 'Roles', seconds: 4.8, component: () => <List eyebrow="Open roles" title="Come build" accent="with us." items={ROLES} />},
    {name: 'Team', seconds: 4.2, component: () => <Lineup eyebrow="20 people, 9 countries" title="Who you'd" accent="work with." people={TEAM} />},
    {name: 'Scale', seconds: 3.4, component: () => <Metric value={1.2} decimals={1} suffix="M" label="hectares watched every day" note="From six satellites, over nine countries" />},
    {name: 'End', seconds: 3.6, component: () => <EndCard line="Help farmers see" accent="from space." button="See open roles" />},
  ],
};

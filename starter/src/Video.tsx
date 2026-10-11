import React from 'react';
import {Audio, Sequence, Series, staticFile} from 'remotion';
import {Approve} from './scenes/Approve';
import {End} from './scenes/End';
import {Hook} from './scenes/Hook';
import {Logo} from './scenes/Logo';
import {NeedsYou} from './scenes/NeedsYou';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// The video, in order: the pain, the product, the proof, the ask. Lengths are in seconds; at 120
// BPM a beat is 0.5 s, so these cuts land on it when you add music.
export const SCENES = [
  {name: 'Hook', seconds: 8, component: Hook},
  {name: 'Logo', seconds: 5, component: Logo},
  {name: 'NeedsYou', seconds: 12, component: NeedsYou},
  {name: 'Approve', seconds: 10, component: Approve},
  {name: 'End', seconds: 6, component: End},
];

export const frames = (seconds: number) => Math.round(seconds * FPS);
export const TOTAL = SCENES.reduce((sum, s) => sum + frames(s.seconds), 0);
const startOf = (name: string) => frames(SCENES.slice(0, SCENES.findIndex((s) => s.name === name)).reduce((sum, s) => sum + s.seconds, 0));

/** A sound on every moment the story turns on, [scene, frame in that scene]. */
const TINGS: [string, number][] = [
  ['Hook', 150],
  ['NeedsYou', 105],
  ['NeedsYou', 217],
  ['Approve', 20],
];

export const Video: React.FC = () => (
  <>
    <Series>
      {SCENES.map((s) => (
        <Series.Sequence key={s.name} name={s.name} durationInFrames={frames(s.seconds)}>
          <s.component />
        </Series.Sequence>
      ))}
    </Series>
    {TINGS.map(([scene, at]) => (
      <Sequence key={`${scene}-${at}`} from={startOf(scene) + at} durationInFrames={40}>
        <Audio src={staticFile('sfx/ting.wav')} volume={0.4} />
      </Sequence>
    ))}
  </>
);

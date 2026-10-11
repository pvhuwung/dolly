import React from 'react';
import {Series} from 'remotion';
import {End} from './scenes/End';
import {Focus} from './scenes/Focus';
import {Hero} from './scenes/Hero';
import {Orbit} from './scenes/Orbit';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// The video, in order. Lengths are in seconds; at 120 BPM a beat is 0.5 s, so these cuts land on it.
export const SCENES = [
  {name: 'Hero', seconds: 6, component: Hero},
  {name: 'Orbit', seconds: 4, component: Orbit},
  {name: 'Focus', seconds: 6, component: Focus},
  {name: 'End', seconds: 6, component: End},
];

export const frames = (seconds: number) => Math.round(seconds * FPS);
export const TOTAL = SCENES.reduce((sum, s) => sum + frames(s.seconds), 0);

export const Video: React.FC = () => (
  <Series>
    {SCENES.map((s) => (
      <Series.Sequence key={s.name} name={s.name} durationInFrames={frames(s.seconds)}>
        <s.component />
      </Series.Sequence>
    ))}
  </Series>
);

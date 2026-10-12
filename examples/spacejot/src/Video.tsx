import React from 'react';
import {Audio, CalculateMetadataFunction, Sequence, staticFile} from 'remotion';
import {brand} from './brand';
import {Scene, Scenes, sceneStarts, scenesLength} from './fx/transitions';
import {LookProvider, StyleName, makeLook} from './look';
import {Edit} from './scenes/Edit';
import {End} from './scenes/End';
import {Hook} from './scenes/Hook';
import {Logo} from './scenes/Logo';
import {Board, Explore, Plans} from './scenes/More';
import {Reply, Restyle} from './scenes/Restyle';

// THE BRIEF. Spacejot for iPhone, launching the week of 12 October 2026: X, LinkedIn and spacejot.ai
// in 16:9 (this), with a 9:16 cut for Reels, TikTok and Shorts. Swiss style, Geist, Spacejot's blue.
// The one sentence: hand a client the room, not the drawing, from your phone. The proof: a real line
// drawing and a real laminate sent from the iPhone, and the room that came back, live (take B),
// then everything a designer does next: reply, edit, explore, plans, a board for the client.
// The ask: download it on the App Store, spacejot.ai.
//
// Every picture on screen was made by Spacejot on the live server while the takes were recorded.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// The video, in order: the pain, the product, the proof, the ask. Lengths are in seconds. Scenes
// change with the style's transition (swiss: a hard wipe); give a scene its own with
// `transition: 'iris'` (the one INTO that scene).
export const SCENES: Scene[] = [
  {name: 'Hook', seconds: 5, component: Hook},
  {name: 'Logo', seconds: 2.5, component: Logo},
  {name: 'Restyle', seconds: 11.5, component: Restyle},
  {name: 'Reply', seconds: 8.5, component: Reply},
  {name: 'Edit', seconds: 9.5, component: Edit},
  {name: 'Explore', seconds: 8, component: Explore},
  {name: 'Plans', seconds: 5.5, component: Plans},
  {name: 'Board', seconds: 6, component: Board},
  {name: 'End', seconds: 5, component: End},
];

/**
 * The short cut, for Reels, TikTok, Shorts and the square and 4:5 feeds (15-35 s): the hook, the
 * product, the one real moment, the board, the ask. Tall frames show the phone alone and larger.
 */
export const SHORT: Scene[] = [
  {name: 'Hook', seconds: 5, component: Hook},
  {name: 'Logo', seconds: 2.5, component: Logo},
  {name: 'Restyle', seconds: 11.5, component: Restyle},
  {name: 'Board', seconds: 6, component: Board},
  {name: 'End', seconds: 5, component: End},
];

export type Cut = 'full' | 'short';
export const scenesFor = (cut: Cut = 'full') => (cut === 'short' ? SHORT : SCENES);

/** A sound on every moment the story turns on, [scene, frame in that scene]. */
const TINGS: [string, number][] = [
  ['Hook', 112],
  ['Restyle', 279],
  ['Reply', 207],
  ['Edit', 134],
  ['Explore', 138],
];

/** A click under every tap on the phone, [scene, frame in that scene]. */
const CLICKS: [string, number][] = [
  ['Restyle', 39],
  ['Restyle', 86],
  ['Restyle', 110],
  ['Restyle', 208],
  ['Reply', 120],
  ['Edit', 36],
  ['Edit', 66],
  ['Edit', 172],
  ['Edit', 184],
  ['Edit', 219],
  ['Explore', 9],
  ['Board', 51],
];

export type VideoProps = {style?: StyleName; cut?: Cut};

export const frames = (seconds: number) => Math.round(seconds * FPS);
/** The video's length in frames: transitions overlap scenes, so it depends on the style. */
export const lengthOf = (style: StyleName = brand.style, cut: Cut = 'full') => scenesLength(scenesFor(cut), style);

export const videoMetadata: CalculateMetadataFunction<VideoProps> = ({props}) => ({durationInFrames: lengthOf(props.style, props.cut)});

export const Video: React.FC<VideoProps> = ({style = brand.style, cut = 'full'}) => {
  const scenes = scenesFor(cut);
  const starts = sceneStarts(scenes, style);
  const startOf = (name: string) => starts[scenes.findIndex((s) => s.name === name)];
  const here = ([scene]: [string, number]) => scenes.some((s) => s.name === scene);
  const transition = makeLook(style, WIDTH, HEIGHT).transition;
  return (
    <LookProvider style={style}>
      <Scenes scenes={scenes} />
      {TINGS.filter(here).map(([scene, at]) => (
        <Sequence key={`ting-${scene}-${at}`} from={startOf(scene) + at} durationInFrames={40}>
          <Audio src={staticFile('sfx/ting.wav')} volume={0.4} />
        </Sequence>
      ))}
      {CLICKS.filter(here).map(([scene, at]) => (
        <Sequence key={`click-${scene}-${at}`} from={startOf(scene) + at} durationInFrames={12}>
          <Audio src={staticFile('sfx/click.wav')} volume={0.35} />
        </Sequence>
      ))}
      {/* A whoosh under every transition that isn't a cut. */}
      {scenes.slice(1).map((s, i) =>
        (s.transition ?? transition) === 'cut' ? null : (
          <Sequence key={s.name} from={starts[i + 1]} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
          </Sequence>
        ),
      )}
    </LookProvider>
  );
};

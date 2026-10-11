import React from 'react';
import {Audio, CalculateMetadataFunction, Sequence, staticFile} from 'remotion';
import {brand} from './brand';
import {Scene, Scenes, sceneStarts, scenesLength} from './fx/transitions';
import {LookProvider, StyleName, makeLook} from './look';
import {Approve} from './scenes/Approve';
import {End} from './scenes/End';
import {Hook} from './scenes/Hook';
import {Logo} from './scenes/Logo';
import {NeedsYou} from './scenes/NeedsYou';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// The video, in order: the pain, the product, the proof, the ask. Lengths are in seconds; at 120
// BPM a beat is 0.5 s, so these cuts land on it when you add music. Scenes change with the style's
// transition; give a scene its own with `transition: 'iris'` (the one INTO that scene).
export const SCENES: Scene[] = [
  {name: 'Hook', seconds: 8, component: Hook},
  {name: 'Logo', seconds: 5, component: Logo},
  {name: 'NeedsYou', seconds: 12, component: NeedsYou},
  {name: 'Approve', seconds: 10, component: Approve},
  {name: 'End', seconds: 6, component: End},
];

/** A sound on every moment the story turns on, [scene, frame in that scene]. */
const TINGS: [string, number][] = [
  ['Hook', 150],
  ['NeedsYou', 105],
  ['NeedsYou', 217],
  ['Approve', 20],
];

export type VideoProps = {style?: StyleName};

export const frames = (seconds: number) => Math.round(seconds * FPS);
/** The video's length in frames: transitions overlap scenes, so it depends on the style. */
export const lengthOf = (style: StyleName = brand.style) => scenesLength(SCENES, style);

export const videoMetadata: CalculateMetadataFunction<VideoProps> = ({props}) => ({durationInFrames: lengthOf(props.style)});

export const Video: React.FC<VideoProps> = ({style = brand.style}) => {
  const starts = sceneStarts(SCENES, style);
  const startOf = (name: string) => starts[SCENES.findIndex((s) => s.name === name)];
  const transition = makeLook(style, WIDTH, HEIGHT).transition;
  return (
    <LookProvider style={style}>
      <Scenes scenes={SCENES} />
      {TINGS.map(([scene, at]) => (
        <Sequence key={`${scene}-${at}`} from={startOf(scene) + at} durationInFrames={40}>
          <Audio src={staticFile('sfx/ting.wav')} volume={0.4} />
        </Sequence>
      ))}
      {/* A whoosh under every transition that isn't a cut. */}
      {SCENES.slice(1).map((s, i) =>
        (s.transition ?? transition) === 'cut' ? null : (
          <Sequence key={s.name} from={starts[i + 1]} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
          </Sequence>
        ),
      )}
    </LookProvider>
  );
};

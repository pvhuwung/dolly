import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {TRANSITIONS} from './library';
import type {TransitionDef} from './library/types';
import {Look, StyleName, TransitionName, makeLook, useLook} from './look';

// How one scene gives way to the next. The video is a list of scenes; `Scenes` plays them in order
// and overlaps each pair by its transition, so the video is shorter than the sum of its scenes:
// get its length from `scenesLength`, and a scene's first frame from `sceneStarts`.
//
//   const SCENES: Scene[] = [
//     {name: 'Hook', seconds: 8, component: Hook},
//     {name: 'Logo', seconds: 5, component: Logo, transition: 'flash'},   // into Logo
//     {name: 'Demo', seconds: 12, component: Demo},                         // the style's own
//   ];
//   <Scenes scenes={SCENES} />
//
// A scene loses its last frames to the transition out of it, so keep anything that must be read
// clear of its final half second.

// The transitions are items in library/transitions/: one folder each, found by name. One that isn't
// in this project plays as a cut.

export type Scene = {
  name: string;
  seconds: number;
  component: React.FC;
  /** The transition INTO this scene. The style's own (look.transition) if not set. */
  transition?: TransitionName;
};

/** Scene lengths are in seconds at this frame rate; transitions are in its frames. */
const FPS = 30;
const framesOf = (seconds: number) => Math.round(seconds * FPS);

const itemOf = (name: TransitionName): TransitionDef | undefined => (TRANSITIONS as Partial<Record<TransitionName, TransitionDef>>)[name];

/** The frames a transition overlaps its two scenes by (0 for a cut). */
export const transitionFrames = (name: TransitionName) => itemOf(name)?.frames ?? 0;

/**
 * The presentation and timing for a transition, in the look's colours, for a
 * <TransitionSeries.Transition>. Null for a cut.
 */
export const transitionFor = (name: TransitionName, look: Look) => itemOf(name)?.make(look) ?? null;

/** The transition into each scene: its own, else the style's. None into the first. */
const transitionsOf = (scenes: Scene[], fallback: TransitionName): TransitionName[] =>
  scenes.map((s, i) => (i === 0 ? 'cut' : (s.transition ?? fallback)));

/** Each scene's first frame in the video, after transitions overlap them. */
export const sceneStarts = (scenes: Scene[], style: StyleName): number[] => {
  const names = transitionsOf(scenes, makeLook(style, 1920, 1080).transition);
  const out: number[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    t -= transitionFrames(names[i]);
    out.push(t);
    t += framesOf(s.seconds);
  });
  return out;
};

/**
 * The frames a whoosh starts on: the transitions that move the whole frame (a slide, a whip, a zoom),
 * never a fade, a wipe or a cut, and at least 8 s apart. Top launch videos use about two whooshes a
 * film and carry the other cuts with the music, so a style whose transition doesn't travel gets none.
 */
export const whooshStarts = (scenes: Scene[], style: StyleName): number[] => {
  const names = transitionsOf(scenes, makeLook(style, 1920, 1080).transition);
  const starts = sceneStarts(scenes, style);
  const out: number[] = [];
  names.forEach((name, i) => {
    if (i > 0 && itemOf(name)?.travels && (!out.length || starts[i] - out[out.length - 1] >= framesOf(8))) out.push(starts[i]);
  });
  return out;
};

/** The video's length in frames, after transitions overlap the scenes. */
export const scenesLength = (scenes: Scene[], style: StyleName) => {
  const starts = sceneStarts(scenes, style);
  return starts[starts.length - 1] + framesOf(scenes[scenes.length - 1].seconds);
};

/**
 * Plays the scenes in order, each overlapping the one before by the transition into it (its own
 * `transition`, else the style's). Wrap it in the LookProvider whose style you pass to
 * `scenesLength` and `sceneStarts`, so the lengths match what plays.
 */
export const Scenes: React.FC<{scenes: Scene[]}> = ({scenes}) => {
  const look = useLook();
  const names = transitionsOf(scenes, look.transition);
  // The page behind the scenes: what a flip or a slide shows while a scene is turned away.
  return (
    <AbsoluteFill style={{background: look.background}}>
      <TransitionSeries>
        {scenes.map((s, i) => {
          const t = transitionFor(names[i], look);
          return (
            <React.Fragment key={s.name}>
              {t ? <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} /> : null}
              <TransitionSeries.Sequence name={s.name} durationInFrames={framesOf(s.seconds)}>
                <s.component />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

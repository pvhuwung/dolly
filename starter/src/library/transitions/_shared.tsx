import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import type {TransitionPresentationComponentProps} from '@remotion/transitions';
import {Backdrop} from '../../backdrop';
import {alpha, useLook} from '../../look';
import type {AnyPresentation, Demo, TransitionDef} from '../types';

// Pieces the transitions share, and their gallery sample. Not an item: it's copied with any transition.
//
// A custom presentation is rendered twice during a transition: once around the scene that's leaving
// ('exiting'), and once around the one arriving ('entering'), which is drawn on top.

export type PresentationProps<P extends Record<string, unknown>> = TransitionPresentationComponentProps<P>;

/** A custom presentation component with its props, as @remotion/transitions takes it. */
export const presentation = <P extends Record<string, unknown>>(component: React.FC<PresentationProps<P>>, props: P) =>
  ({component, props}) as unknown as AnyPresentation;

/** One of @remotion/transitions' own presentations, typed loosely so every item has one shape. */
export const as = (p: unknown) => p as AnyPresentation;

export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 at the ends of the transition, 1 in the middle. */
export const bump = (p: number) => Math.sin(Math.PI * clamp01(p));

/** A presentation played over `frames` frames at a steady pace (eased in and out unless told). */
export const linear = (frames: number, p: AnyPresentation, easing: (t: number) => number = inOut) => ({
  presentation: p,
  timing: linearTiming({durationInFrames: frames, easing}),
});

// The gallery sample: a page with a card, then a full-bleed accent page.

const FPS = 30;
const HOLD = 24;

const PanelA: React.FC = () => {
  const look = useLook();
  const w = look.tall ? look.width * 0.7 : look.format === 'square' ? look.width * 0.62 : look.width * 0.36;
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
        <div
          style={{
            width: w,
            height: w * 0.62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: look.radius,
            background: look.surface,
            boxShadow: look.shadow,
            ...look.headline,
            color: look.ink,
            fontSize: look.size * 1.1,
          }}
        >
          Scene A
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PanelB: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{background: look.accent, alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${alpha(look.onAccent, 0.18)} 1.6px, transparent 1.6px)`,
          backgroundSize: '30px 30px',
        }}
      />
      <div style={{...look.headline, color: look.onAccent, fontSize: look.size * 1.9}}>Scene B</div>
    </AbsoluteFill>
  );
};

const TransitionDemo: React.FC<{def: TransitionDef}> = ({def}) => {
  const look = useLook();
  const t = def.make(look);
  const d = def.frames;
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={HOLD + d}>
        <PanelA />
      </TransitionSeries.Sequence>
      {t ? <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} /> : null}
      <TransitionSeries.Sequence durationInFrames={HOLD + d}>
        <PanelB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

/** The gallery sample for a transition: scene A gives way to scene B. */
export const transitionDemos = (name: string, def: TransitionDef): Demo[] => [
  {
    name: `Transition: ${name} (${def.frames} frames)`,
    code: `{..., transition: '${name}'}`,
    seconds: (HOLD * 2 + def.frames) / FPS,
    // 40% in: far enough to show the effect, before a flip turns edge-on.
    hero: HOLD + Math.round(def.frames * 0.4),
    Component: () => <TransitionDemo def={def} />,
  },
];

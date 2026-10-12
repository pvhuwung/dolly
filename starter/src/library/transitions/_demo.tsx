import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {Backdrop} from '../../backdrop';
import {alpha, useLook} from '../../look';
import type {Demo, TransitionDef} from '../types';

// The transitions' gallery sample. Not an item, and not needed to use one: only the samples import it.

// A page with a card, then a full-bleed accent page.

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

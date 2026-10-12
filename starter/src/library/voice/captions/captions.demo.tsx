import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha, type Look, useLook} from '../../../look';
import type {Demo} from '../../types';
import {centre} from '../_demo';
import {Captions} from './captions';

// Made-up timing, so the samples need no audio file. For a real voice, see voiceover.tsx.

/** A stand-in for footage behind captions: a card of grey lines. */
const Shot: React.FC<{look: Look}> = ({look}) => (
  <div
    style={{
      width: look.tall ? 760 : 1100,
      height: look.tall ? 760 : 520,
      borderRadius: look.radius,
      background: look.surface,
      boxShadow: look.shadow,
      padding: 48,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      marginTop: look.tall ? -240 : -60,
    }}
  >
    {[0.5, 0.8, 0.65, 0.9, 0.4].map((w, i) => (
      <div key={i} style={{width: `${w * 100}%`, height: i === 0 ? 34 : 20, borderRadius: 10, background: alpha(look.ink, i === 0 ? 0.6 : 0.12)}} />
    ))}
  </div>
);

const LINE = 'Captions land word by word, right on the voice.';

const CaptionDemo: React.FC<{variant: 'karaoke' | 'pop' | 'line'}> = ({variant}) => {
  const look = useLook();
  return (
    <AbsoluteFill style={centre}>
      <Shot look={look} />
      <Captions text={LINE} seconds={3.4} start={8} variant={variant} position="middle" />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Voice: captions, karaoke', code: '<Captions lines={voice} start={15} variant="karaoke" />', seconds: 4, hero: 62, Component: () => <CaptionDemo variant="karaoke" />},
  {name: 'Voice: captions, pop', code: '<Captions lines={voice} start={15} variant="pop" />', seconds: 4, hero: 92, Component: () => <CaptionDemo variant="pop" />},
  {name: 'Voice: captions, line', code: '<Captions lines={voice} start={15} variant="line" />', seconds: 4, hero: 62, Component: () => <CaptionDemo variant="line" />},
];

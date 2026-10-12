import React from 'react';
import {AbsoluteFill} from 'remotion';
import {type Look, useLook} from '../../../look';
import type {Demo} from '../../types';
import {centre} from '../_demo';
import {Captions} from '../captions/captions';
import {Waveform} from './waveform';

// Made-up timing, so the samples need no audio file. For a real voice, see voiceover.tsx.

/** A podcast cover: a tile with the episode, for the waveform samples. */
const Cover: React.FC<{look: Look; size: number}> = ({look, size}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.min(look.radius, size * 0.12),
      background: look.accent,
      color: look.onAccent,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: size * 0.1,
      boxShadow: look.shadow,
      fontFamily: look.fonts.headline,
      fontWeight: 700,
      fontSize: size * 0.16,
      lineHeight: 1,
    }}
  >
    <div style={{fontFamily: look.fonts.mono, fontSize: size * 0.07, opacity: 0.8, marginBottom: size * 0.04}}>EP. 42</div>
    The Build Log
  </div>
);

const BarsDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, flexDirection: 'column', gap: 48, marginTop: -80}}>
      <Cover look={look} size={look.tall ? 420 : 300} />
      <Waveform variant="bars" width={look.tall ? 760 : 900} height={look.tall ? 180 : 150} />
    </AbsoluteFill>
  );
};

const LineDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, marginTop: -80}}>
      <Waveform variant="line" width={look.tall ? 800 : 1200} height={look.tall ? 260 : 240} seed={7} />
    </AbsoluteFill>
  );
};

/** A speaker's initials in a tinted disc: a stand-in for a face. */
const Face: React.FC<{look: Look}> = ({look}) => (
  <div style={{width: '100%', height: '100%', background: look.accentSoft, color: look.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.fonts.headline, fontWeight: 700, fontSize: 110}}>
    MR
  </div>
);

const CircleDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{...centre, marginTop: -80}}>
      <Waveform variant="circle" size={look.tall ? 380 : 320}>
        <Face look={look} />
      </Waveform>
    </AbsoluteFill>
  );
};

/** Everything together: a podcast clip, the speaker ringed by her voice, captions under her. */
const ClipDemo: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: look.tall ? look.safe.top + 20 : 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <Waveform variant="circle" size={look.tall ? 340 : 230} seed={11}>
          <Face look={look} />
        </Waveform>
        <div style={{fontFamily: look.fonts.body, fontSize: look.tall ? 34 : 28, fontWeight: 700, color: look.ink}}>Maya Ruiz · The Build Log</div>
      </div>
      <Captions text="We shipped it on a Friday. Never again." seconds={3} start={10} variant="pop" />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Voice: waveform, bars', code: '<Waveform src={voice[0].src} start={15} variant="bars" />', seconds: 3, hero: 40, Component: BarsDemo},
  {name: 'Voice: waveform, line', code: '<Waveform src={voice[0].src} variant="line" />', seconds: 3, hero: 40, Component: LineDemo},
  {name: 'Voice: waveform, circle', code: '<Waveform variant="circle">{face}</Waveform>', seconds: 3, hero: 40, Component: CircleDemo},
  {name: 'Voice: podcast clip', code: '<Waveform variant="circle" /> + <Captions variant="pop" />', seconds: 4, hero: 62, Component: ClipDemo},
];

import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headphones} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Badge} from '../fx/graphics';
import {Kinetic} from '../fx/text';
import {Captions, Voiceover, Waveform, voiceTiming} from '../fx/voice';
import {alpha, useLook} from '../look';
import {buildlog as VOICE} from '../voice/buildlog';
import {Cover} from './buildLog/Cover';
import type {Mock} from './mock';

// THE BUILD LOG: a 20-second clip from an invented podcast, cut for Reels and Shorts. Two voices
// (src/mocks/buildLog/script.json, made with `npm run voice -- src/mocks/buildLog/script.json
// buildlog`): the host asks, the guest answers. Whoever's talking is ringed by their own voice;
// captions follow the words; a bar shows where we are in the clip.

const START = 12;
const GAP = 0.35;
const PEOPLE = [
  {name: 'Sam Okafor', role: 'Host', initials: 'SO', tint: '#3a2618', ink: '#ffb380'},
  {name: 'Priya Raman', role: 'Guest', initials: 'PR', tint: '#2a2433', ink: '#f2d7b0'},
];
/** Who says each line: the host asks, the guest answers. */
const SPEAKER = [0, 1, 0, 1];

/** A speaker: their initials in a disc, ringed by their voice while they talk. */
const Speaker: React.FC<{who: number; size: number}> = ({who, size}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timing = voiceTiming(VOICE, {start: START, gap: GAP, fps});
  const now = timing.findIndex((t) => frame >= t.start && frame < t.end);
  // The speaker of the line playing, or of the last one said, holds the floor between lines.
  const last = timing.reduce((k, t, i) => (frame >= t.start ? i : k), -1);
  const floor = SPEAKER[Math.max(0, last)];
  const talking = now >= 0 && SPEAKER[now] === who;
  const on = spring({frame: frame - (last >= 0 ? timing[last].start : 0) + 4, fps, config: {damping: 200}, durationInFrames: 14});
  const active = floor === who ? on : 1 - on;
  const p = PEOPLE[who];
  const mine = VOICE.findIndex((_, i) => SPEAKER[i] === who);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.45 + 0.55 * active, transform: `scale(${0.84 + 0.16 * active})`}}>
      <Waveform
        variant="circle"
        size={size}
        bars={64}
        color={talking ? look.accent : alpha('#f4ece2', 0.35)}
        src={talking ? VOICE[now].src : VOICE[mine].src}
        start={talking ? timing[now].start : 1e9}
      >
        <div style={{width: '100%', height: '100%', background: p.tint, color: p.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.fonts.headline, fontWeight: 700, fontSize: size * 0.34, letterSpacing: '-0.03em'}}>
          {p.initials}
        </div>
      </Waveform>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: talking ? look.accent : alpha('#ffffff', 0.08), color: talking ? look.onAccent : look.ink, fontFamily: look.fonts.body, fontSize: 32, fontWeight: 600, whiteSpace: 'nowrap'}}>
        {p.name}
        <span style={{opacity: 0.7, fontWeight: 500}}>· {p.role}</span>
      </div>
    </div>
  );
};

const Clip: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const enter = spring({frame: frame - 2, fps, config: {damping: 200}, durationInFrames: 16});
  const progress = interpolate(frame, [START, durationInFrames - 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Where the clip sits in the episode: it starts at 12:41.
  const secs = 12 * 60 + 41 + Math.floor(Math.max(0, frame - START) / fps);
  const stamp = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const inner = look.width - look.safe.left - look.safe.right;
  return (
    <AbsoluteFill>
      <Backdrop />
      {/* The show, at the top. */}
      <div style={{position: 'absolute', left: look.safe.left, top: look.safe.top, width: inner, display: 'flex', alignItems: 'center', gap: 22, opacity: enter, transform: `translateY(${(1 - enter) * 16}px)`}}>
        <Cover size={124} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{fontFamily: look.fonts.mono, fontSize: 24, color: look.accentText, letterSpacing: '0.06em'}}>THE BUILD LOG · EP. 42</div>
          <div style={{fontFamily: look.fonts.headline, fontSize: 44, fontWeight: 600, color: look.ink, letterSpacing: '-0.03em'}}>Ship it boring</div>
        </div>
      </div>
      {/* The two of them. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 0}}>
        <Speaker who={0} size={300} />
        <Speaker who={1} size={300} />
      </div>
      {/* Where we are in the clip. */}
      <div style={{position: 'absolute', left: look.safe.left, width: inner, top: look.height - look.safe.bottom + 12, display: 'flex', alignItems: 'center', gap: 18, fontFamily: look.fonts.mono, fontSize: 24, color: look.dim}}>
        {stamp}
        <div style={{flex: 1, height: 6, borderRadius: 3, background: alpha('#ffffff', 0.12)}}>
          <div style={{width: `${progress * 100}%`, height: '100%', borderRadius: 3, background: look.accent}} />
        </div>
        48:20
      </div>
      <Voiceover lines={VOICE} start={START} gap={GAP} />
      <Captions lines={VOICE} start={START} gap={GAP} variant="karaoke" />
    </AbsoluteFill>
  );
};

/** The ask: the cover, big, and where to listen. */
const Listen: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - 4, fps, config: {damping: 200}, durationInFrames: 24});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: look.safe.top + 10, gap: 44}}>
        <div style={{opacity: t, transform: `translateY(${(1 - t) * 40}px) scale(${0.94 + 0.06 * t})`}}>
          <Cover size={520} />
        </div>
        <Kinetic text="Listen to" accent="the full episode." start={18} align="center" style={{fontSize: 76}} />
        <Badge text="Wherever you get podcasts · buildlog.fm" icon={Headphones} at={46} tone="accent" size={34} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const buildLog: Mock = {
  id: 'BuildLog',
  title: 'a clip from The Build Log, ep. 42',
  agenda: 'podcast clip',
  style: 'midnight',
  format: 'vertical',
  brand: {name: 'The Build Log', url: 'buildlog.fm', logo: 'mocks/buildlog.svg', accent: '#ff8a3d', alert: '#ffd166'},
  poster: 290,
  scenes: [
    {name: 'Clip', seconds: 18.6, component: Clip},
    {name: 'Listen', seconds: 4.2, component: Listen},
  ],
};

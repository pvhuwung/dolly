import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bell, Check, HardDrive, Mic, MousePointer2, Wifi, WifiOff} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Kinetic} from '../fx/text';
import {Layer, Screen, Stage, focusOn, moves, useShot, whole} from '../kit';
import {alpha, useLook} from '../look';
import {Caption} from '../parts';
import {Changelog, EndCard} from '../templates';
import type {Mock} from './mock';

// QUILLO 2.4: the changelog for the invented notes app from the Quillo launch mock, same brand.
// Soft style, square for X and LinkedIn feeds, about 21 s. The version rolls over, the list of
// what's new lands, then one camera pans across the three headline features as cards (a voice
// note writing itself, a shared stack, writing offline), and the ask: update.

const LENS = 1800;
const INK = '#22202c';
const DIM = '#8a8494';
const PAPER = '#fdfbf8';
const CORAL = '#ef6f4c';
const BLUE = '#3d8bd9';
const GREEN = '#3aa776';
const AMBER = '#d6950f';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** A spring from `at`, in the look's (bouncy) motion unless a config is given. */
const useSp = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 24, config: {damping?: number; stiffness?: number; mass?: number} = look.spring) =>
    spring({frame: frame - at, fps, config, durationInFrames: frames});
};

// ---------------------------------------------------------------------------------------------
// HOOK: the version rolls over from 2.3 to 2.4.

const ROLL = 24;

const Hook: React.FC = () => {
  const look = useLook();
  const sp = useSp();
  const logo = sp(0, 20);
  const roll = sp(ROLL, 26, {damping: 15, stiffness: 150});
  const punch = sp(ROLL + 4, 16, {damping: 10, stiffness: 200});
  const size = 300;
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, padding: `0 ${look.safe.right}px`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: logo, transform: `translateY(${(1 - logo) * 16}px)`}}>
          <Img src={staticFile('mocks/quillo.svg')} style={{width: 64, height: 64}} />
          <div style={{...look.eyebrow, fontSize: 28}}>What’s new in Quillo</div>
        </div>
        <div
          style={{
            ...look.headline,
            color: look.accentText,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            display: 'flex',
            fontVariantNumeric: 'tabular-nums',
            transform: `scale(${0.6 + 0.4 * logo + 0.06 * Math.sin(Math.PI * Math.min(1, punch))})`,
          }}
        >
          <span>2.</span>
          {/* The last digit rolls up like an odometer. */}
          <span style={{position: 'relative', display: 'inline-block', width: '0.6em', height: size, overflow: 'hidden'}}>
            <span style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${-roll * 100}%)`}}>3</span>
            <span style={{position: 'absolute', left: 0, top: '100%', transform: `translateY(${-roll * 100}%)`}}>4</span>
          </span>
        </div>
        <div style={{width: '100%', marginTop: 10}}>
          <Kinetic text="Five things worth" accent="updating for." start={ROLL + 12} align="center" style={{fontSize: look.size}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// TOUR: three feature cards in a row; the camera tilts in on the first and pans to the next two.

const CARD = {width: 520, height: 640};
const GAP = 740;
const PAN1 = 150;
const PAN2 = 262;
const PAN = 26;

const cardText: React.CSSProperties = {fontFamily: 'inherit', color: INK};

/** A small rounded chip: a tag, a status. */
const Chip: React.FC<{color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({color, children, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 16px',
      borderRadius: 999,
      background: alpha(color, 0.14),
      color,
      fontSize: 21,
      fontWeight: 800,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Card one: a voice note records, then writes itself out and tags itself. */
const REC = {start: 8, stop: 50};
const SAID = 'Remind me to send Dana the pricing deck before Friday’s launch sync.'.split(' ');
const WORDS = 56;
const TAGS = 100;

const VoiceCard: React.FC = () => {
  const frame = useCurrentFrame();
  const sp = useSp();
  const recording = frame >= REC.start && frame < REC.stop;
  const secs = Math.floor(interpolate(frame, [REC.start, REC.stop], [0, 7], clamp));
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  const typing = frame >= REC.stop && frame < WORDS + 4;
  return (
    <AbsoluteFill style={{background: PAPER, ...cardText, padding: 30}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{position: 'relative', width: 56, height: 56, borderRadius: 28, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {recording ? <div style={{position: 'absolute', inset: -8 - pulse * 6, borderRadius: '50%', border: `3px solid ${alpha(CORAL, 0.35 - pulse * 0.2)}`}} /> : null}
          <Mic size={28} color="#ffffff" strokeWidth={2.6} />
        </div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 28, fontWeight: 900, letterSpacing: '-0.01em'}}>Voice note</div>
          <div style={{fontSize: 20, fontWeight: 600, color: DIM}}>Tuesday · 9:41</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: recording ? alpha(CORAL, 0.12) : '#f1ece6', fontSize: 21, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: recording ? CORAL : DIM}}>
          {recording ? <span style={{width: 10, height: 10, borderRadius: 5, background: CORAL, opacity: 0.4 + 0.6 * pulse}} /> : null}
          0:{String(secs).padStart(2, '0')}
        </div>
      </div>
      {/* The waveform: live while recording, then it settles into the note's grey scrubber. */}
      <div style={{height: 120, marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
        {Array.from({length: 34}, (_, i) => {
          const live = Math.abs(Math.sin(i * 0.71 + frame * 0.37) * Math.sin(i * 0.23 + frame * 0.13 + random(`b${i}`) * 3));
          const kept = Math.abs(Math.sin(i * 0.71 + REC.stop * 0.37) * Math.sin(i * 0.23 + REC.stop * 0.13 + random(`b${i}`) * 3));
          const t = frame < REC.start ? 0.08 : recording ? live : kept * 0.7;
          return <div key={i} style={{width: 8, height: 10 + 100 * t, borderRadius: 4, background: recording ? CORAL : alpha(INK, 0.18)}} />;
        })}
      </div>
      <div style={{marginTop: 22, minHeight: 210}}>
        {typing ? <div style={{fontSize: 22, fontWeight: 700, color: DIM}}>Writing it up{'.'.repeat(1 + (Math.floor(frame / 5) % 3))}</div> : null}
        <div style={{fontSize: 33, fontWeight: 800, lineHeight: 1.32, letterSpacing: '-0.01em'}}>
          {SAID.map((w, i) => {
            const t = interpolate(frame, [WORDS + i * 3, WORDS + i * 3 + 8], [0, 1], clamp);
            return (
              <span key={i} style={{opacity: t, display: 'inline-block', transform: `translateY(${(1 - t) * 6}px)`, marginRight: '0.26em'}}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, bottom: 30}}>
        <div style={{fontSize: 19, fontWeight: 800, color: DIM, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, opacity: sp(TAGS - 4, 14)}}>Filed automatically</div>
        <div style={{display: 'flex', gap: 10}}>
          {[
            {label: 'Launch', color: CORAL},
            {label: 'To-do', color: BLUE},
            {label: 'Fri 9:00', color: AMBER, icon: true},
          ].map((tag, i) => {
            const t = sp(TAGS + i * 6, 20);
            return (
              <Chip key={tag.label} color={tag.color} style={{transform: `scale(${t})`, opacity: Math.min(1, t * 2)}}>
                {tag.icon ? <Bell size={18} strokeWidth={2.8} /> : <span style={{width: 10, height: 10, borderRadius: 5, background: tag.color}} />}
                {tag.label}
              </Chip>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Card two: a shared stack. Teammates' avatars join, one of them points at a note and comments. */
const S = PAN1 + 22;
const PEOPLE = [
  {initials: 'DA', color: CORAL},
  {initials: 'MK', color: BLUE},
  {initials: 'JS', color: GREEN},
];
const ROWS = ['Ship on the 14th', 'Onboarding copy v2', 'Pricing deck, final', 'Launch post draft'];

const StackCard: React.FC = () => {
  const frame = useCurrentFrame();
  const sp = useSp();
  const glide = interpolate(frame, [S + 18, S + 44], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
  const cursor = {x: 440 - glide * 150, y: 600 - glide * 236};
  const lit = sp(S + 42, 16, {damping: 200});
  const comment = sp(S + 50, 22);
  return (
    <AbsoluteFill style={{background: PAPER, ...cardText, padding: 30}}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 14}}>
        <span style={{width: 16, height: 16, borderRadius: 8, background: CORAL, marginTop: 14}} />
        <div style={{flex: 1}}>
          <div style={{fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em'}}>Launch</div>
          <div style={{fontSize: 20, fontWeight: 700, color: DIM}}>Shared stack · 3 people</div>
        </div>
        <div style={{display: 'flex'}}>
          {PEOPLE.map((p, i) => {
            const t = sp(S + i * 6, 20);
            return (
              <div
                key={p.initials}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginLeft: i ? -12 : 0,
                  background: p.color,
                  border: `3px solid ${PAPER}`,
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${t})`,
                }}
              >
                {p.initials}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14}}>
        {ROWS.map((row, i) => {
          const hot = i === 2;
          return (
            <div
              key={row}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 20px',
                borderRadius: 18,
                background: '#ffffff',
                boxShadow: hot ? `0 0 0 ${3 * lit}px ${CORAL}, 0 8px 20px rgba(60, 40, 30, 0.08)` : '0 4px 14px rgba(60, 40, 30, 0.06), 0 0 0 1px rgba(60, 40, 30, 0.05)',
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              <span style={{width: 26, height: 26, borderRadius: 13, border: `3px solid ${alpha(INK, 0.2)}`}} />
              {row}
            </div>
          );
        })}
      </div>
      {/* A teammate's comment, attached to the note they pointed at. */}
      <div style={{position: 'absolute', left: 30, right: 30, top: 548, display: 'flex', gap: 12, alignItems: 'flex-start', opacity: Math.min(1, comment * 2), transform: `translateY(${(1 - comment) * 16}px) scale(${0.9 + 0.1 * comment})`, transformOrigin: '0 0'}}>
        <div style={{width: 42, height: 42, borderRadius: 21, background: CORAL, color: '#ffffff', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>DA</div>
        <div style={{padding: '14px 20px', borderRadius: '6px 20px 20px 20px', background: alpha(CORAL, 0.12), fontSize: 25, fontWeight: 800}}>Looks good. Ship it.</div>
      </div>
      {/* Dana's cursor, live in the stack. */}
      <div style={{position: 'absolute', left: cursor.x, top: cursor.y, opacity: interpolate(frame, [S + 14, S + 20], [0, 1], clamp)}}>
        <MousePointer2 size={34} color={BLUE} fill={BLUE} strokeWidth={1.5} />
        <div style={{marginLeft: 26, marginTop: -6, padding: '4px 12px', borderRadius: 999, background: BLUE, color: '#ffffff', fontSize: 18, fontWeight: 900}}>Dana</div>
      </div>
    </AbsoluteFill>
  );
};

/** Card three: writing with no signal, then everything syncs when it's back. */
const O = PAN2 + 18;
const LINES = ['Hike on day two', 'Cook together, no caterer', 'Demo night, 5 min each', 'Bring the good speaker'];
const ONLINE = O + 44;

const OfflineCard: React.FC = () => {
  const frame = useCurrentFrame();
  const sp = useSp();
  const online = sp(ONLINE, 16, {damping: 200});
  const toast = sp(ONLINE + 6, 22);
  return (
    <AbsoluteFill style={{background: PAPER, ...cardText, padding: 30}}>
      <div style={{position: 'relative', height: 44}}>
        <Chip color={DIM} style={{position: 'absolute', opacity: 1 - online, background: '#f1ece6', color: INK}}>
          <WifiOff size={20} strokeWidth={2.6} /> Offline
        </Chip>
        <Chip color={GREEN} style={{position: 'absolute', opacity: online, transform: `scale(${0.85 + 0.15 * online})`}}>
          <Wifi size={20} strokeWidth={2.6} /> Back online
        </Chip>
      </div>
      <div style={{marginTop: 26, fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em'}}>Offsite ideas</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700, color: DIM, marginTop: 4}}>
        <HardDrive size={18} strokeWidth={2.4} />
        {frame < ONLINE ? 'Saved on this device' : 'Synced just now'}
      </div>
      <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 20}}>
        {LINES.map((line, i) => {
          const chars = Math.floor(interpolate(frame, [O + 4 + i * 10, O + 4 + i * 10 + line.length * 0.45], [0, line.length], clamp));
          const caret = chars > 0 && chars < line.length;
          return (
            <div key={line} style={{display: 'flex', gap: 12, fontSize: 30, fontWeight: 800, opacity: chars > 0 ? 1 : 0}}>
              <span style={{color: CORAL}}>•</span>
              <span>
                {line.slice(0, chars)}
                {caret ? <span style={{display: 'inline-block', width: 3, height: 30, marginLeft: 2, background: CORAL, verticalAlign: 'middle'}} /> : null}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 30,
          right: 30,
          bottom: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 22px',
          borderRadius: 20,
          background: '#ffffff',
          boxShadow: '0 12px 30px rgba(60, 40, 30, 0.14), 0 0 0 1px rgba(60, 40, 30, 0.05)',
          opacity: Math.min(1, toast * 2),
          transform: `translateY(${(1 - toast) * 40}px)`,
        }}
      >
        <span style={{width: 40, height: 40, borderRadius: 20, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Check size={24} color="#ffffff" strokeWidth={3.2} />
        </span>
        <div>
          <div style={{fontSize: 24, fontWeight: 900}}>Synced</div>
          <div style={{fontSize: 19, fontWeight: 700, color: DIM}}>4 notes · just now</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Tour: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  // The captions here are one line, so the cards can come up closer under them than look.aim allows.
  const aim = {top: Math.round(look.safe.top + look.size * 2.2), bottom: 30};
  const at = (i: number) => focusOn({rect: whole(CARD), size: CARD, video, lens: LENS, fill: 0.95, layer: {x: (i - 1) * GAP}, ...aim});
  const [a, b, c] = [at(0), at(1), at(2)];
  const camera = useShot(
    [...moves.tiltIn(a, {frames: 34, yaw: -16, pitch: 8, back: 500}), ...moves.pan(a, b, {start: PAN1, frames: PAN}), ...moves.pan(b, c, {start: PAN2, frames: PAN})],
    {dolly: 30},
  );
  const card = (i: number, body: React.ReactNode) => (
    <Layer x={(i - 1) * GAP}>
      <Screen frame="none" width={CARD.width} height={CARD.height} radius={look.radius} background={PAPER} glare={0.3} shadow={0.85}>
        {body}
      </Screen>
    </Layer>
  );
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        {card(0, <VoiceCard />)}
        {card(1, <StackCard />)}
        {card(2, <OfflineCard />)}
      </Stage>
      {frame < PAN1 ? (
        <Caption eyebrow="New · Voice notes" title="Talk." accent="It writes itself." start={6} exit={PAN1 - 8} />
      ) : frame < PAN2 ? (
        <Caption eyebrow="New · Shared stacks" title="Share a stack." accent="Plan together." start={PAN1 + 18} exit={PAN2 - 8} />
      ) : (
        <Caption eyebrow="New · Offline" title="No signal?" accent="Keep writing." start={PAN2 + 18} />
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------

const WhatsNew: React.FC = () => (
  <Changelog
    version="v2.4"
    title="What’s"
    accent="new."
    items={[
      {tag: 'New', text: 'Voice notes that write themselves'},
      {tag: 'New', text: 'Shared stacks for your team'},
      {tag: 'New', text: 'Write offline, sync later'},
      {tag: 'Improved', text: 'Search is 3× faster'},
      {tag: 'Fixed', text: 'Widgets on the lock screen'},
    ]}
  />
);

const End: React.FC = () => <EndCard line="Update to" accent="Quillo 2.4." button="Update now" />;

export const quilloNew: Mock = {
  id: 'QuilloNew',
  title: 'what’s new in the notes app, version 2.4',
  agenda: 'changelog',
  style: 'soft',
  format: 'square',
  brand: {name: 'Quillo', url: 'quillo.app', logo: 'mocks/quillo.svg', accent: CORAL, alert: '#d97a1e'},
  music: 'mocks/quilloNew-music.wav',
  poster: 336,
  tings: [
    ['Hook', ROLL + 4],
    ['Tour', TAGS],
    ['Tour', ONLINE + 6],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.4, component: Hook},
    {name: 'Changelog', seconds: 4.8, component: WhatsNew},
    {name: 'Tour', seconds: 13, component: Tour},
    {name: 'End', seconds: 3.6, component: End},
  ],
};

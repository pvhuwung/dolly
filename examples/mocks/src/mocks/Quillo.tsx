import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowUp, ChevronLeft, FileText, MessageCircleQuestion, Mic, Search, Sparkles} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Chat} from '../fx/graphics';
import {Kinetic} from '../fx/text';
import {Layer, Rect, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {alpha, useLook} from '../look';
import {Caption, Tap} from '../parts';
import {EndCard, Features, LogoReveal, Metric} from '../templates';
import type {Mock} from './mock';

// QUILLO: an AI notes app that sorts itself. Soft style, vertical, for Reels and TikTok.
// The one sentence: drop notes in anywhere, Quillo files them and answers questions about them.
// The pain (a mess of notes) → the product (logo) → the proof (notes sorting themselves on the
// phone, then an answer with its sources) → what else it does → a number → the ask.

const LENS = 1800;
const PHONE = {width: 416, height: 876};
/** Inside the phone's 12 px bezel: the app's own coordinates. */
const APP = {width: 392, height: 852};

// The scene's timeline, in frames.
const SORT = 82; // notes start flying into stacks
const ASK = 182; // the ask bar is tapped
const SWAP = 186; // the chat view slides in
const QUESTION = 206;
const ANSWER = 244;
const SOURCES = 264;

const GROUPS = [
  {name: 'Launch', color: '#ef6f4c'},
  {name: 'Meetings', color: '#3d8bd9'},
  {name: 'Ideas', color: '#d6950f'},
  {name: 'Personal', color: '#3aa776'},
];

type Note = {title: string; sub?: string; group: number; paper: string; mess: {x: number; y: number; w: number; rot: number}};
const NOTES: Note[] = [
  {title: 'launch date??', sub: 'ask in sync', group: 0, paper: '#fff1a8', mess: {x: 14, y: 150, w: 206, rot: -6}},
  {title: 'Pricing call w/ Dana', sub: 'tiers + annual plan', group: 1, paper: '#ffffff', mess: {x: 168, y: 214, w: 212, rot: 5}},
  {title: 'idea: widget dark mode', group: 2, paper: '#d9ecff', mess: {x: 26, y: 312, w: 232, rot: 3}},
  {title: 'oat milk, lemons, rice', group: 3, paper: '#ffdcd3', mess: {x: 150, y: 394, w: 224, rot: -4}},
  {title: 'Mar 3 sync: ship on the 14th', sub: 'with new onboarding', group: 0, paper: '#ffffff', mess: {x: 16, y: 474, w: 262, rot: -2}},
  {title: 'onboarding copy v2', sub: 'shorter!', group: 0, paper: '#fff1a8', mess: {x: 178, y: 572, w: 196, rot: 7}},
  {title: 'book flights: offsite', group: 3, paper: '#e3f5dc', mess: {x: 36, y: 652, w: 214, rot: -5}},
];

/** Where each note and each stack header sits once sorted: stacks in order, rows under each. */
const NEAT = (() => {
  const rows: Record<number, number> = {};
  const headers: number[] = [];
  let y = 136;
  GROUPS.forEach((_, g) => {
    headers.push(y);
    y += 36;
    NOTES.forEach((n, i) => {
      if (n.group !== g) return;
      rows[i] = y;
      y += 58;
    });
    y += 12;
  });
  return {rows, headers};
})();

const ui = (look: ReturnType<typeof useLook>) => ({fontFamily: look.fonts.body, color: '#22202c'});

/** A spring from `at`, in the look's (bouncy) motion. */
const useSpring = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 26, config = look.spring) => spring({frame: frame - at, fps, config, durationInFrames: frames});
};

const StatusBar: React.FC = () => (
  <div style={{position: 'absolute', top: 14, left: 26, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 700}}>
    <span>9:41</span>
    <span style={{display: 'flex', gap: 3, alignItems: 'flex-end'}}>
      {[5, 8, 11, 14].map((h) => (
        <span key={h} style={{width: 3, height: h, borderRadius: 1, background: '#22202c'}} />
      ))}
      <span style={{marginLeft: 6, width: 24, height: 11, borderRadius: 3, border: '1.5px solid #22202c', padding: 1.5, display: 'inline-flex'}}>
        <span style={{flex: 1, borderRadius: 1, background: '#22202c'}} />
      </span>
    </span>
  </div>
);

const AskBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 18,
      right: 18,
      top: 766,
      height: 52,
      borderRadius: 26,
      background: '#ffffff',
      boxShadow: '0 6px 20px rgba(60, 40, 30, 0.12), 0 0 0 1px rgba(60, 40, 30, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 8px 0 18px',
      fontSize: 16,
      fontWeight: 600,
      color: '#8a8494',
    }}
  >
    <Sparkles size={18} strokeWidth={2.4} color="#ef6f4c" />
    <span style={{flex: 1}}>Ask your notes…</span>
    <span style={{width: 38, height: 38, borderRadius: 19, background: '#f1ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22202c'}}>
      <Mic size={18} strokeWidth={2.4} />
    </span>
  </div>
);

/** The notes list: a mess at first, then each note flies into its stack and turns into a tidy row. */
const NotesView: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSpring();
  const sorted = sp(SORT + NOTES.length * 6 + 10, 20, {damping: 200});
  return (
    <AbsoluteFill style={{background: '#fdfbf8', ...ui(look)}}>
      <StatusBar />
      <div style={{position: 'absolute', top: 56, left: 22, right: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em'}}>Notes</div>
        <div style={{width: 40, height: 40, borderRadius: 20, background: '#f1ece6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Search size={20} strokeWidth={2.4} />
        </div>
      </div>
      {/* What Quillo is doing: sorting, then done. */}
      <div style={{position: 'absolute', top: 100, left: 22, display: 'flex', gap: 8, alignItems: 'center', fontSize: 16, fontWeight: 800, color: look.accentText}}>
        <Sparkles size={15} strokeWidth={2.6} />
        {frame < SORT ? '7 new notes' : sorted < 0.5 ? 'Sorting…' : '4 stacks · sorted for you'}
      </div>
      {GROUPS.map((g, gi) => {
        const first = NOTES.findIndex((n) => n.group === gi);
        const t = sp(SORT + first * 6 + 8, 18);
        return (
          <div
            key={g.name}
            style={{
              position: 'absolute',
              left: 22,
              top: NEAT.headers[gi],
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 12px 3px 9px',
              borderRadius: 999,
              background: alpha(g.color, 0.14),
              color: g.color,
              fontSize: 15,
              fontWeight: 800,
              opacity: t,
              transform: `scale(${0.6 + 0.4 * t})`,
              transformOrigin: '0 50%',
            }}
          >
            <span style={{width: 8, height: 8, borderRadius: 4, background: g.color}} />
            {g.name}
          </div>
        );
      })}
      {NOTES.map((n, i) => {
        const p = sp(SORT + i * 6, 30);
        const q = Math.min(1, p);
        // Before sorting, the mess drifts a little, so it never sits dead.
        const drift = (1 - q) * Math.sin(frame / 22 + i * 1.7) * 3;
        const x = interpolate(p, [0, 1], [n.mess.x, 22]);
        const y = interpolate(p, [0, 1], [n.mess.y, NEAT.rows[i]]) + drift;
        const w = interpolate(q, [0, 1], [n.mess.w, APP.width - 44]);
        const rot = interpolate(p, [0, 1], [n.mess.rot, 0]);
        const fade = Math.max(0, 1 - p * 1.6);
        return (
          <div
            key={n.title}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              minHeight: 46,
              padding: '11px 14px',
              borderRadius: interpolate(q, [0, 1], [6, 14]),
              background: interpolateColors(q, [0, 1], [n.paper, '#ffffff']),
              boxShadow: `0 ${6 - 3 * q}px ${16 - 6 * q}px rgba(60, 40, 30, ${0.14 - 0.06 * q})`,
              transform: `rotate(${rot}deg)`,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * q,
            }}
          >
            <span style={{width: 8 * q, height: 8, borderRadius: 4, background: GROUPS[n.group].color, flexShrink: 0}} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0}}>
              <div style={{fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.title}</div>
              {n.sub && fade > 0 ? <div style={{fontSize: 14, color: '#8a8494', opacity: fade, height: 17 * fade}}>{n.sub}</div> : null}
            </div>
          </div>
        );
      })}
      <AskBar />
      <Tap x={196} y={792} at={ASK} color={look.accent} />
    </AbsoluteFill>
  );
};

/** Ask Quillo: the question, the answer, and the notes it came from. */
const ChatView: React.FC = () => {
  const look = useLook();
  const sp = useSpring();
  const chips = ['Mar 3 sync', 'onboarding copy v2'];
  return (
    <AbsoluteFill style={{background: '#fdfbf8', ...ui(look)}}>
      <StatusBar />
      <div style={{position: 'absolute', top: 54, left: 12, right: 22, display: 'flex', alignItems: 'center', gap: 6}}>
        <ChevronLeft size={28} strokeWidth={2.4} />
        <div style={{fontSize: 24, fontWeight: 900, letterSpacing: '-0.01em'}}>Ask Quillo</div>
      </div>
      <div style={{position: 'absolute', top: 120, left: 10}}>
        <Chat
          width={372}
          size={20}
          typing={24}
          messages={[
            {from: 'me', text: 'What did we decide about the launch?', at: QUESTION},
            {from: 'them', text: 'Ship on the 14th, with the new onboarding copy.', at: ANSWER},
          ]}
        />
        <div style={{display: 'flex', gap: 8, padding: '12px 6px 0', flexWrap: 'wrap'}}>
          {chips.map((c, i) => {
            const t = sp(SOURCES + i * 6, 20);
            return (
              <div
                key={c}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 11px',
                  borderRadius: 999,
                  background: alpha(look.accent, 0.12),
                  color: look.accentText,
                  fontSize: 15,
                  fontWeight: 800,
                  opacity: Math.min(1, t * 1.5),
                  transform: `scale(${0.6 + 0.4 * t})`,
                  transformOrigin: '0 50%',
                }}
              >
                <FileText size={16} strokeWidth={2.6} />
                {c}
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          top: 766,
          height: 52,
          borderRadius: 26,
          background: '#ffffff',
          boxShadow: '0 6px 20px rgba(60, 40, 30, 0.12), 0 0 0 1px rgba(60, 40, 30, 0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px 0 18px',
          fontSize: 16,
          fontWeight: 600,
          color: '#b3adbb',
        }}
      >
        <span style={{flex: 1}}>Ask a follow-up…</span>
        <span style={{width: 38, height: 38, borderRadius: 19, background: look.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
          <ArrowUp size={20} strokeWidth={2.8} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** The app: the notes list, with the chat sliding over it after the ask bar is tapped. */
const App: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - SWAP, fps, config: {damping: 200}, durationInFrames: 18});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${-t * 30}%)`, opacity: 1 - t * 0.4}}>
        <NotesView />
      </AbsoluteFill>
      {frame >= SWAP ? (
        <AbsoluteFill style={{transform: `translateX(${(1 - t) * 100}%)`, boxShadow: '-12px 0 30px rgba(0,0,0,0.08)'}}>
          <ChatView />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Scenes

/** THE PAIN: a heap of scrappy notes under the headline. */
const SCRAPS = [
  {text: 'call mom??', paper: '#fff1a8', x: 0.02, y: 0.0, rot: -9},
  {text: 'Q3 ideas', paper: '#d9ecff', x: 0.5, y: 0.02, rot: 7},
  {text: 'pricing v2 !!', paper: '#ffffff', x: 0.22, y: 0.12, rot: 3},
  {text: 'wifi password', paper: '#ffdcd3', x: 0.54, y: 0.2, rot: -6},
  {text: 'launch date?', paper: '#fff1a8', x: -0.02, y: 0.29, rot: 6},
  {text: 'standup notes', paper: '#e3f5dc', x: 0.4, y: 0.37, rot: -8},
  {text: 'gift for Sam', paper: '#ffffff', x: 0.62, y: 0.47, rot: 10},
  {text: 'oat milk', paper: '#ffffff', x: 0.08, y: 0.5, rot: -4},
  {text: 'book flights', paper: '#d9ecff', x: 0.42, y: 0.6, rot: 9},
  {text: 'renew passport', paper: '#fff1a8', x: 0.0, y: 0.7, rot: 5},
  {text: 'that podcast?', paper: '#ffdcd3', x: 0.5, y: 0.8, rot: -7},
  {text: 'ideas???', paper: '#e3f5dc', x: 0.12, y: 0.88, rot: 3},
];

const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSpring();
  const inner = look.width - look.safe.left - look.safe.right;
  const top = look.safe.top + look.size * 2.7;
  const field = {x: look.safe.left, y: top, width: inner, height: look.height - look.aim.bottom - top - 40};
  // The pile creeps toward the viewer the whole time, so it never sits still.
  const push = 1 + (frame / 96) * 0.05;
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
      {SCRAPS.map((s, i) => {
        const t = sp(6 + i * 3, 24);
        const bob = Math.sin(frame / 18 + i) * 4;
        return (
          <div
            key={s.text}
            style={{
              position: 'absolute',
              left: field.x + s.x * field.width,
              top: field.y + s.y * field.height + bob,
              padding: '26px 32px',
              minWidth: 260,
              background: s.paper,
              borderRadius: 8,
              boxShadow: '0 14px 30px rgba(70, 40, 30, 0.16), 0 2px 6px rgba(70, 40, 30, 0.08)',
              fontFamily: look.fonts.body,
              fontSize: 46,
              fontWeight: 800,
              color: '#2b2633',
              transform: `rotate(${s.rot + (1 - t) * 20}deg) scale(${t})`,
              opacity: Math.min(1, t * 1.5),
            }}
          >
            {s.text}
          </div>
        );
      })}
      </AbsoluteFill>
      <div style={{position: 'absolute', left: look.safe.left, top: look.safe.top, width: inner}}>
        <Kinetic text="Your notes" accent="are a mess." start={2} style={{fontSize: Math.round(look.size * 1.12)}} />
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => <LogoReveal kind="pop" tagline="Notes that" accent="sort themselves." />;

/** THE PROOF: the phone tilts in on the mess, the notes sort themselves, then ask, and get an answer. */
const Phone: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  // Smaller two-line captions, and the phone may run into the bottom band (it's picture, not text):
  // the app is what this scene is about, so it gets the rest of the frame.
  const cap = Math.round(look.size * 0.78);
  const aim = {top: Math.round(look.safe.top + cap * 3.3), bottom: Math.round(look.aim.bottom * 0.6)};
  // Square to the phone: focusOn gives no yaw or pitch, and tiltIn's landing key must name them to
  // bring the camera back square. Push-ins frame from the phone's top, so it never rises into the caption.
  const at = (rect: Rect, fill: number) => ({...focusOn({rect, size: PHONE, video, lens: LENS, fill, ...aim}), yaw: 0, pitch: 0});
  const all = at(whole(PHONE), 0.95);
  const list = at({x: 0, y: 0, width: PHONE.width, height: 742}, 0.97);
  const chat = at({x: 0, y: 0, width: PHONE.width, height: 500}, 0.97);
  const camera = useShot(
    [
      ...moves.tiltIn(all, {frames: 54, yaw: -24, pitch: 12, back: 700}),
      [SORT - 14, all],
      [SORT + 30, list, ease.inOut],
      [ASK - 6, list],
      [SWAP + 34, chat, ease.inOut],
    ],
    {dolly: 26, yaw: 2},
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0.35} shadow={0.8}>
            <App />
          </Screen>
        </Layer>
      </Stage>
      {frame < ASK ? (
        <Caption eyebrow="Auto-sort" title="Drop it in." accent="Quillo files it." start={8} exit={ASK - 10} size={cap} />
      ) : (
        <Caption eyebrow="Ask" title="Ask your notes." accent="Get answers." start={ASK + 4} size={cap} />
      )}
    </AbsoluteFill>
  );
};

const More: React.FC = () => (
  <Features
    title="Made to"
    accent="think with you."
    items={[
      {icon: Sparkles, title: 'Sorts itself', text: 'Tags and stacks as you write'},
      {icon: MessageCircleQuestion, title: 'Ask anything', text: 'Answers that cite your notes'},
      {icon: Mic, title: 'Capture anywhere', text: 'Voice, links and screenshots'},
    ]}
  />
);

const Saved: React.FC = () => <Metric value={6} suffix={"\u00a0hrs"} label="back every week" note="on average, in our beta" />;

const End: React.FC = () => <EndCard line="Your notes," accent="finally in order." button="Download free" />;

export const quillo: Mock = {
  id: 'Quillo',
  title: 'an AI notes app that sorts itself',
  agenda: 'launch',
  style: 'soft',
  format: 'vertical',
  brand: {name: 'Quillo', url: 'quillo.app', logo: 'mocks/quillo.svg', accent: '#ef6f4c', alert: '#d97a1e'},
  music: 'mocks/quillo-music.wav',
  poster: 290,
  tings: [
    ['Logo', 6],
    ['Phone', SORT + NOTES.length * 6 + 16],
    ['Phone', ANSWER],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.2, component: Hook},
    {name: 'Logo', seconds: 2.6, component: Logo},
    {name: 'Phone', seconds: 11, component: Phone},
    {name: 'Features', seconds: 4, component: More},
    {name: 'Metric', seconds: 3, component: Saved},
    {name: 'End', seconds: 3.6, component: End},
  ],
};

import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {Check, Droplet, Droplets, Sprout, Sun} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Butterfly, Flower, Plant, Ripple, Watercolor} from '../fx/drawings';
import {Toast} from '../fx/graphics';
import {Counter, Kinetic} from '../fx/text';
import {Layer, Rect, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {alpha, mix, useLook} from '../look';
import {Caption, Tap} from '../parts';
import {EndCard, Features, LogoReveal} from '../templates';
import type {Mock} from './mock';

// FERN: an invented plant-care app that tells you which plant needs water, and when. Soft style,
// vertical, for Reels and TikTok, with a soft serif for the brand and the plants drawn in code.
// The one sentence: never forget to water again.
// The pain (a plant drooping, its soil drying out) → the product (logo) → the proof (the phone:
// a reminder lands, one tap waters the hibiscus, it perks up and blooms, a butterfly arrives) →
// a number → what else it does → the ask.

const {fontFamily: fraunces} = loadFraunces('normal', {weights: ['600', '900'], subsets: ['latin']});

const TERRACOTTA = '#c9623f';
const WATER = '#4a8fc2';
const LEAF = '#4e7a45';
const LENS = 1800;
const PHONE = {width: 416, height: 876};
/** Inside the phone's 12 px bezel: the app's own coordinates. */
const APP = {width: 392, height: 852};

// The phone scene's timeline, in frames.
const NOTIFY = 46; // the reminder lands
const TAP = 150; // "Watered" is tapped
const DETAIL = 186; // the plant's page slides in
const BLOOM = 196; // the hibiscus starts to open
const FLUTTER = 236; // the butterfly arrives

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** A spring from `at`, in the look's (bouncy) motion, or calm with `{damping: 200}`. */
const useSpring = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 26, config = look.spring) => spring({frame: frame - at, fps, config, durationInFrames: frames});
};

/** A terracotta pot, `width` wide (and 0.72 of that tall), with dark soil at the rim. */
const Pot: React.FC<{width: number; dry?: number}> = ({width, dry = 0}) => (
  <svg width={width} height={width * 0.72} viewBox="0 0 200 144" style={{display: 'block'}}>
    <path d="M24 34 L176 34 L158 140 Q157 144 152 144 L48 144 Q43 144 42 140 Z" fill="#b65a37" />
    <path d="M24 34 L62 34 L56 144 L48 144 Q43 144 42 140 Z" fill="#c76a45" opacity={0.6} />
    <path d="M150 34 L176 34 L158 140 Q157 144 152 144 L146 144 Z" fill="#9c4b2d" opacity={0.55} />
    <rect x={10} y={8} width={180} height={32} rx={7} fill={TERRACOTTA} />
    <rect x={10} y={30} width={180} height={10} fill="#a8532f" opacity={0.35} />
    <ellipse cx={100} cy={12} rx={82} ry={6} fill={interpolateColors(dry, [0, 1], ['#4a3022', '#8a6a4f'])} />
  </svg>
);

/** A plant in its pot. `droop` 0 to 1 wilts it: it leans, sags and fades toward straw. */
const PottedPlant: React.FC<{width: number; seed: number; start: number; frames?: number; droop?: number; blooms?: boolean}> = ({
  width,
  seed,
  start,
  frames = 46,
  droop = 0,
  blooms = true,
}) => {
  const plantH = width * 1.25;
  return (
    <div style={{position: 'relative', width, height: plantH + width * 0.62, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          width,
          height: plantH,
          marginBottom: -width * 0.06,
          transform: `rotate(${droop * 9}deg) skewX(${droop * -10}deg) scaleY(${1 - droop * 0.1})`,
          transformOrigin: '50% 100%',
          filter: `saturate(${1 - droop * 0.55}) sepia(${droop * 0.35})`,
        }}
      >
        <Plant width={width} height={plantH} seed={seed} start={start} frames={frames} depth={4} blooms={blooms} palette={{leaf: LEAF}} />
      </div>
      <div style={{width: width * 0.62}}>
        <Pot width={width * 0.62} dry={droop} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// The app

type Row = {name: string; due: string; moisture: number; seed: number};
const PLANTS: Row[] = [
  {name: 'Hibiscus', due: 'Water today', moisture: 0.12, seed: 3},
  {name: 'Monstera', due: 'In 2 days', moisture: 0.58, seed: 7},
  {name: 'Pothos', due: 'In 4 days', moisture: 0.71, seed: 11},
  {name: 'Snake plant', due: 'In 9 days', moisture: 0.86, seed: 5},
];
const ROW_TOP = 196;
const ROW_H = 132;
const ink = '#1f2a22';

const StatusBar: React.FC = () => (
  <div style={{position: 'absolute', top: 14, left: 26, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 700}}>
    <span>9:41</span>
    <span style={{display: 'flex', gap: 3, alignItems: 'flex-end'}}>
      {[5, 8, 11, 14].map((h) => (
        <span key={h} style={{width: 3, height: h, borderRadius: 1, background: ink}} />
      ))}
      <span style={{marginLeft: 6, width: 24, height: 11, borderRadius: 3, border: `1.5px solid ${ink}`, padding: 1.5, display: 'inline-flex'}}>
        <span style={{flex: 1, borderRadius: 1, background: ink}} />
      </span>
    </span>
  </div>
);

/** How wet the soil is: a bar that fills from `from` to `to` after `at`. */
const Moisture: React.FC<{from: number; to?: number; at?: number; width: number}> = ({from, to = from, at = 0, width}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + 30], [from, to], {...clamp, easing: ease.inOut});
  const dry = v < 0.25;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Droplet size={14} strokeWidth={2.6} color={dry ? '#c0603c' : WATER} fill={dry ? 'none' : alpha(WATER, 0.25)} />
      <div style={{width, height: 8, borderRadius: 4, background: '#ece6dc', overflow: 'hidden'}}>
        <div style={{width: `${v * 100}%`, height: '100%', borderRadius: 4, background: dry ? '#d88560' : WATER}} />
      </div>
      <span style={{fontSize: 13, fontWeight: 800, color: dry ? '#c0603c' : '#5d6b62', fontVariantNumeric: 'tabular-nums', width: 34}}>{Math.round(v * 100)}%</span>
    </div>
  );
};

/** The list: four plants with their next watering, the hibiscus dry and asking. */
const ListView: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const sp = useSpring();
  const press = sp(TAP, 16, {damping: 200});
  const perk = interpolate(frame, [TAP + 6, TAP + 34], [1, 0], {...clamp, easing: ease.out});
  const done = frame >= TAP + 4;
  return (
    <AbsoluteFill style={{background: '#fbf8f2', fontFamily: look.fonts.body, color: ink}}>
      <StatusBar />
      <div style={{position: 'absolute', top: 58, left: 24, right: 24}}>
        <div style={{fontSize: 15, fontWeight: 700, color: '#7c857e'}}>Good morning</div>
        <div style={{fontFamily: fraunces, fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1}}>My plants</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 146,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 12px 5px 9px',
          borderRadius: 999,
          background: done ? alpha(LEAF, 0.14) : alpha(TERRACOTTA, 0.13),
          color: done ? LEAF : '#b2552f',
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        {done ? <Check size={15} strokeWidth={3} /> : <Droplet size={14} strokeWidth={2.8} />}
        {done ? 'All watered' : '1 needs water today'}
      </div>
      {PLANTS.map((p, i) => {
        const first = i === 0;
        const t = sp(10 + i * 5, 22, {damping: 200});
        return (
          <div
            key={p.name}
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              top: ROW_TOP + i * ROW_H,
              height: ROW_H - 12,
              borderRadius: 22,
              background: '#ffffff',
              boxShadow: first && !done ? `0 0 0 2px ${alpha(TERRACOTTA, 0.5)}, 0 10px 24px rgba(80, 50, 30, 0.1)` : '0 6px 18px rgba(60, 50, 30, 0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 14px 0 8px',
              opacity: t,
              transform: `translateY(${(1 - t) * 24}px)`,
            }}
          >
            <div style={{width: 96, height: 112, flexShrink: 0, borderRadius: 16, background: '#f3efe6', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', paddingBottom: 4}}>
              <PottedPlant width={66} seed={p.seed} start={-400} droop={first ? perk * 0.85 : 0} blooms={!first || frame > TAP + 20} />
            </div>
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6}}>
              <div style={{fontSize: 20, fontWeight: 900, letterSpacing: '-0.01em'}}>{p.name}</div>
              <div style={{fontSize: 14, fontWeight: 700, color: first && !done ? '#b2552f' : '#7c857e'}}>{first && done ? 'Watered just now' : p.due}</div>
              <Moisture from={p.moisture} to={first ? 0.84 : p.moisture} at={TAP + 6} width={first ? 92 : 150} />
            </div>
            {first ? (
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 14px',
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 900,
                  background: interpolateColors(press, [0, 1], ['rgba(74, 143, 194, 0.14)', LEAF]),
                  color: press > 0.5 ? '#ffffff' : '#2f6f9e',
                  transform: `scale(${1 - 0.08 * Math.sin(Math.min(1, press * 2) * Math.PI)})`,
                }}
              >
                {press > 0.5 ? <Check size={16} strokeWidth={3} /> : <Droplets size={16} strokeWidth={2.6} />}
                {press > 0.5 ? 'Done' : 'Watered'}
              </div>
            ) : null}
          </div>
        );
      })}
      {/* Water landing on the hibiscus's tile. */}
      {frame > TAP ? (
        <div style={{position: 'absolute', left: 16, top: ROW_TOP - 6, opacity: interpolate(frame, [TAP + 30, TAP + 44], [1, 0], clamp)}}>
          <Ripple width={110} height={130} drops={3} start={TAP + 2} every={5} seed={4} color={WATER} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0}}>
        <div style={{position: 'absolute', left: 14, top: 44}}>
          <Toast title="Hibiscus needs water" body="Soil is down to 12%" time="now" at={NOTIFY} exit={TAP - 18} width={364} />
        </div>
      </div>
      <Tap x={318} y={ROW_TOP + (ROW_H - 12) / 2} at={TAP} color={LEAF} />
    </AbsoluteFill>
  );
};

/** The hibiscus's page: it opens into flower once watered. */
const DetailView: React.FC = () => {
  const look = useLook();
  const sp = useSpring();
  const badge = sp(BLOOM + 56, 20);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <AbsoluteFill style={{background: '#fbf8f2', fontFamily: look.fonts.body, color: ink}}>
      <StatusBar />
      <div style={{position: 'absolute', top: 66, left: 0, right: 0, height: 430, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', background: 'linear-gradient(#fbf8f2, #f1ebdf)'}}>
        <div style={{transform: 'translateY(8px)'}}>
          <Flower size={250} petals={5} start={BLOOM} frames={78} seed={6} color="#e0705a" />
        </div>
      </div>
      <div style={{position: 'absolute', top: 470, left: 24, right: 24}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: fraunces, fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em'}}>Hibiscus</div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: alpha('#e0705a', 0.14),
              color: '#b84a35',
              fontSize: 14,
              fontWeight: 900,
              opacity: badge,
              transform: `scale(${0.6 + 0.4 * badge})`,
            }}
          >
            Blooming
          </div>
        </div>
        <div style={{fontSize: 16, fontWeight: 700, color: '#7c857e', marginTop: 4}}>Watered just now · next in 3 days</div>
        <div style={{marginTop: 26, padding: '16px 18px', borderRadius: 22, background: '#ffffff', boxShadow: '0 6px 18px rgba(60, 50, 30, 0.07)'}}>
          <div style={{fontSize: 14, fontWeight: 800, color: '#7c857e', marginBottom: 12}}>This week</div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {days.map((d, i) => {
              const watered = i === 2 || i === 5;
              const today = i === 2;
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: today ? WATER : watered ? alpha(WATER, 0.14) : '#f3efe6',
                      color: today ? '#fff' : WATER,
                    }}
                  >
                    {watered ? <Droplet size={17} strokeWidth={2.6} fill={today ? '#fff' : 'none'} /> : null}
                  </div>
                  <span style={{fontSize: 13, fontWeight: 800, color: today ? ink : '#9aa29c'}}>{d}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 14}}>
          {[
            {icon: Sun, label: 'Bright, indirect'},
            {icon: Sprout, label: 'Repot in spring'},
          ].map(({icon: I, label}) => (
            <div key={label} style={{flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px', borderRadius: 18, background: '#ffffff', boxShadow: '0 6px 18px rgba(60, 50, 30, 0.07)', fontSize: 14, fontWeight: 800}}>
              <I size={18} strokeWidth={2.4} color={TERRACOTTA} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The app: the list, with the plant's page sliding over it after the tap. */
const App: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - DETAIL, fps, config: {damping: 200}, durationInFrames: 20});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${-t * 30}%)`, opacity: 1 - t * 0.4}}>
        <ListView />
      </AbsoluteFill>
      {frame >= DETAIL ? (
        <AbsoluteFill style={{transform: `translateX(${(1 - t) * 100}%)`, boxShadow: '-12px 0 30px rgba(0,0,0,0.08)'}}>
          <DetailView />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Scenes

/** A leaf that falls, turning, from (x, y) at `at`. */
const FallingLeaf: React.FC<{x: number; y: number; at: number; seed: number}> = ({x, y, at, seed}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0) return null;
  const sway = Math.sin(t / 9 + seed) * 26;
  const fall = t * t * 0.045 + t * 1.6;
  const spin = (random(`leaf-${seed}`) - 0.5) * 40 + t * 3.2 * (seed % 2 ? 1 : -1);
  return (
    <svg
      width={40}
      height={22}
      viewBox="-20 -11 40 22"
      style={{position: 'absolute', left: x + sway, top: y + fall, transform: `rotate(${spin}deg)`, opacity: interpolate(t, [0, 6, 50, 64], [0, 1, 1, 0], clamp)}}
    >
      <path d="M-18 0 Q -6 -10 16 -1 Q 4 9 -18 0 Z" fill={mix('#9a8a4a', '#6a8c4b', 0.3)} />
      <path d="M-16 0 L 14 -1" stroke="#6b5a2e" strokeWidth={1.4} />
    </svg>
  );
};

/** THE PAIN: a plant grows, then wilts as its soil dries out. */
const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const droop = interpolate(frame, [52, 92], [0, 1], {...clamp, easing: ease.inOut});
  const moisture = interpolate(frame, [40, 92], [0.46, 0.08], {...clamp, easing: ease.inOut});
  const chip = spring({frame: frame - 34, fps: 30, config: look.spring, durationInFrames: 22});
  const inner = look.width - look.safe.left - look.safe.right;
  const plantW = 600;
  const plantTop = 540;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: (look.width - plantW) / 2, top: plantTop, transform: `scale(${1 + frame * 0.0004})`, transformOrigin: '50% 100%'}}>
        <PottedPlant width={plantW} seed={9} start={4} frames={44} droop={droop} />
      </div>
      <FallingLeaf x={440} y={860} at={70} seed={1} />
      <FallingLeaf x={600} y={790} at={80} seed={2} />
      <FallingLeaf x={500} y={930} at={92} seed={3} />
      {/* The soil, drying out: a chip beside the plant. */}
      <div
        style={{
          position: 'absolute',
          right: look.safe.right,
          top: 740,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '20px 24px',
          borderRadius: 26,
          background: '#ffffff',
          boxShadow: look.shadow,
          fontFamily: look.fonts.body,
          opacity: chip,
          transform: `translateY(${(1 - chip) * 30}px) scale(${0.85 + 0.15 * chip})`,
          transformOrigin: '100% 50%',
        }}
      >
        <div style={{fontSize: 26, fontWeight: 800, color: '#7c857e'}}>Soil moisture</div>
        <div style={{fontSize: 64, fontWeight: 900, lineHeight: 1, color: moisture < 0.2 ? '#c0603c' : WATER, fontVariantNumeric: 'tabular-nums'}}>{Math.round(moisture * 100)}%</div>
        <div style={{width: 200, height: 12, borderRadius: 6, background: '#ece6dc', overflow: 'hidden'}}>
          <div style={{width: `${moisture * 100}%`, height: '100%', borderRadius: 6, background: moisture < 0.2 ? '#d88560' : WATER}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: look.safe.left, top: look.safe.top, width: inner}}>
        <Kinetic text="Your plants" accent="are thirsty." start={2} style={{fontSize: Math.round(look.size * 1.12)}} />
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => <LogoReveal kind="pop" tagline="Never forget" accent="to water again." />;

/** THE PROOF: the reminder lands, one tap waters the hibiscus, it opens into flower. */
const Phone: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  // Smaller two-line captions, and the phone may run into the bottom band (it's picture, not text).
  const cap = Math.round(look.size * 0.78);
  const aim = {top: Math.round(look.safe.top + cap * 3.3), bottom: Math.round(look.aim.bottom * 0.6)};
  const at = (rect: Rect, fill: number) => ({...focusOn({rect, size: PHONE, video, lens: LENS, fill, ...aim}), yaw: 0, pitch: 0});
  const all = at(whole(PHONE), 0.95);
  const card = at({x: 0, y: 30, width: PHONE.width, height: 360}, 0.95);
  const flower = at({x: 0, y: 0, width: PHONE.width, height: 640}, 0.96);
  const camera = useShot(
    [
      ...moves.tiltIn(all, {frames: 54, yaw: -22, pitch: 10, back: 700}),
      [NOTIFY + 44, all],
      [NOTIFY + 84, card, ease.inOut],
      [TAP + 22, card],
      [DETAIL + 36, flower, ease.inOut],
    ],
    {dolly: 24, yaw: 2},
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
        {/* In front of the phone, by its top corner: the butterfly comes for the flower. */}
        <Layer x={150} y={-250} z={160}>
          <Butterfly size={170} start={FLUTTER} flap={18} seed={2} />
        </Layer>
      </Stage>
      {frame < TAP - 6 ? (
        <Caption eyebrow="Reminders" title="Fern knows" accent="who’s thirsty." start={8} exit={TAP - 16} size={cap} />
      ) : (
        <Caption eyebrow="One tap" title="Water it." accent="Watch it thrive." start={TAP} size={cap} />
      )}
    </AbsoluteFill>
  );
};

/** A number on a wash of watercolour, and three plants growing up under it. */
const Thriving: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const note = spring({frame: frame - 40, fps: 30, config: {damping: 200}, durationInFrames: 20});
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          right: look.safe.right,
          top: look.safe.top + 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <Watercolor width={760} height={360} kind="pool" start={0} frames={36} seed={5} color={TERRACOTTA}>
          <Counter to={1.2} decimals={1} suffix="M" start={8} frames={40} style={{...look.headline, fontSize: Math.round(look.size * 2.9), lineHeight: 1, color: '#ffffff'}} />
        </Watercolor>
        <Kinetic text="plants watered" accent="on time." start={20} align="center" style={{fontSize: Math.round(look.size * 0.9)}} />
        <div style={{fontFamily: look.fonts.body, fontSize: 34, fontWeight: 700, color: look.dim, opacity: note}}>last month, by Fern gardeners</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 24}}>
        <PottedPlant width={230} seed={7} start={10} frames={34} />
        <PottedPlant width={280} seed={3} start={16} frames={34} />
        <PottedPlant width={230} seed={11} start={22} frames={34} />
      </div>
    </AbsoluteFill>
  );
};

const More: React.FC = () => (
  <Features
    title="Care,"
    accent="made simple."
    items={[
      {icon: Droplets, title: 'Watering, timed', text: 'Tuned to each plant and season'},
      {icon: Sun, title: 'Light check', text: 'Find the right spot with your camera'},
      {icon: Sprout, title: 'Repot alerts', text: 'Know when it’s outgrown its pot'},
    ]}
  />
);

/** The ask, with two plants growing up from the bottom of the frame. */
const End: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <EndCard line="Never forget" accent="to water again." button="Get Fern free" />
      <div style={{position: 'absolute', left: -40, bottom: -30}}>
        <Plant width={380} height={560} seed={5} start={6} frames={70} palette={{leaf: LEAF}} />
      </div>
      <div style={{position: 'absolute', right: -30, bottom: -40, transform: 'scaleX(-1)'}}>
        <Plant width={340} height={500} seed={12} start={16} frames={70} palette={{leaf: LEAF}} />
      </div>
      <div style={{position: 'absolute', left: look.width * 0.66, top: look.safe.top + 40}}>
        <Butterfly size={150} start={40} flap={20} seed={4} />
      </div>
    </AbsoluteFill>
  );
};

export const fern: Mock = {
  id: 'Fern',
  title: 'a plant-care app that knows who’s thirsty',
  agenda: 'launch',
  style: 'soft',
  format: 'vertical',
  brand: {name: 'Fern', url: 'fern.garden', logo: 'mocks/fern.svg', accent: TERRACOTTA, alert: WATER, fonts: {headline: fraunces}},
  music: 'mocks/fern-music.wav',
  poster: 430,
  tings: [
    ['Logo', 6],
    ['Phone', NOTIFY + 4],
    ['Phone', TAP + 2],
    ['Phone', BLOOM + 40],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.6, component: Hook},
    {name: 'Logo', seconds: 2.6, component: Logo},
    {name: 'Phone', seconds: 11, component: Phone},
    {name: 'Thriving', seconds: 3, component: Thriving},
    {name: 'Features', seconds: 4, component: More},
    {name: 'End', seconds: 3.8, component: End},
  ],
};

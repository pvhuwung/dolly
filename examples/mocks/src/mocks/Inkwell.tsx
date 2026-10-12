import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FileCode2, Image as ImageIcon, Repeat} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Butterfly, Doodles, DoodleKind, HexField, Paper, Plant, Stamps, Stitch} from '../fx/drawings';
import {Badge} from '../fx/graphics';
import {Layer, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, LogoReveal} from '../templates';
import type {Mock} from './mock';
import {BEAT, CANVAS, CODE, Editor, WIN} from './inkwell/Editor';

// INKWELL: an invented sketchbook that runs code. Paper style, 4:5 for the Instagram and LinkedIn
// feeds, ~24 s. The one sentence: draw with code. The pain is a question (what if your sketchbook
// ran code?), the proof is a few typed lines drawing a flower, and a change of one number
// redrawing it. Then what it makes, how it exports, and the ask: inkwell.studio.

const LENS = 1800;

/** The middle of the space under the caption band, in px from the frame's top. */
const middle = (look: ReturnType<typeof useLook>) => (look.aim.top + look.height - look.aim.bottom) / 2;

// HOOK: doodles on a sketchbook page, each one "called" by a line of code typed just before it.
const SKETCHES: {kind: DoodleKind; call: string}[] = [
  {kind: 'spiral', call: 'spiral()'},
  {kind: 'star', call: 'star()'},
  {kind: 'sparkle', call: 'sparkle()'},
  {kind: 'squiggle', call: 'squiggle()'},
  {kind: 'heart', call: 'heart()'},
  {kind: 'loop', call: 'loop()'},
];

const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const card = {width: 820, height: 760};
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: (look.width - card.width) / 2, top: middle(look) - card.height / 2 + 10}}>
        <Paper width={card.width} height={card.height} rotate={-1.5} start={0} seed={4}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 230px)', gridTemplateRows: 'repeat(2, 300px)', columnGap: 20, rowGap: 30}}>
            {SKETCHES.map((s, i) => {
              const at = 12 + i * 11;
              const chars = Math.max(0, Math.min(s.call.length, Math.floor((frame - at) * 1.5)));
              return (
                <div key={s.kind} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
                  <Doodles kind={s.kind} width={200} height={190} start={at + 8} frames={22} strokeWidth={6} seed={i + 2} />
                  <div style={{height: 30, fontFamily: look.fonts.mono, fontSize: 24, color: '#5f5a6b'}}>{s.call.slice(0, chars)}</div>
                </div>
              );
            })}
          </div>
        </Paper>
      </div>
      <Caption title="What if your sketchbook" accent="ran code?" start={0} />
    </AbsoluteFill>
  );
};

// EDITOR: the product moment, one camera path. The window arrives; the camera moves in on the code
// as it's typed, then down to the canvas as Run draws the flower, then back out for the edit: one
// number changes and the flower redraws.
const EditorShot: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  const aim = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: WIN, video, lens: LENS, fill, ...look.aim});
  const wide = aim(whole(WIN), 0.92);
  const code = aim(CODE, 0.92);
  const canvas = aim(CANVAS, 0.9);
  const camera = useShot(
    [
      ...moves.tiltIn(wide, {frames: 42, yaw: -14, pitch: 8, back: 520}),
      [46, wide],
      [86, code, ease.inOut],
      [104, code],
      [146, canvas, ease.inOut],
      [182, canvas],
      [216, wide, ease.inOut],
    ],
    {dolly: 24},
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="none" width={WIN.width} height={WIN.height} radius={12} background="#fbf9f4" glare={0.25}>
            <Editor />
          </Screen>
        </Layer>
      </Stage>
      {frame < 118 ? (
        <Caption eyebrow="sketch.js" title="Type a few" accent="lines." start={8} exit={100} />
      ) : frame < 186 ? (
        <Caption title="Watch it" accent="draw itself." start={128} exit={170} scrim />
      ) : (
        <Caption title="Change a number." accent="It redraws." start={BEAT.select + 4} />
      )}
    </AbsoluteFill>
  );
};

// CARDS: what it makes, in any language: four paper cards landing on the table.
const CARDS: {label: string; rotate: number; draw: React.ReactNode}[] = [
  {label: 'JavaScript', rotate: -4, draw: <Stamps width={300} height={340} count={14} motif="flower" start={16} stagger={3} seed={5} />},
  {label: 'Python', rotate: 3, draw: <Butterfly size={250} start={22} seed={2} />},
  {label: 'HTML', rotate: 2.5, draw: <HexField width={300} height={340} radius={22} start={30} frames={50} seed={3} />},
  {label: 'TypeScript', rotate: -3, draw: <Plant width={290} height={360} start={18} frames={70} seed={6} />},
];

const Cards: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const card = {width: 380, height: 430};
  const gap = 34;
  // Flat, not in a Stage: the drawings' filters and clip paths don't survive a 3D context. A slow
  // push on the whole table keeps it moving.
  const push = interpolate(frame, [0, 140], [0.97, 1.03]);
  const grid = {width: card.width * 2 + gap, height: card.height * 2 + gap};
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          left: (look.width - grid.width) / 2,
          top: middle(look) - grid.height / 2,
          width: grid.width,
          height: grid.height,
          transform: `scale(${push})`,
        }}
      >
        {CARDS.map((c, i) => (
          <div key={c.label} style={{position: 'absolute', left: (i % 2) * (card.width + gap), top: Math.floor(i / 2) * (card.height + gap)}}>
            <Paper width={card.width} height={card.height} rotate={c.rotate} start={4 + i * 7} seed={i + 7}>
              {c.draw}
            </Paper>
            <Pill text={c.label} at={12 + i * 7} rotate={c.rotate} />
          </div>
        ))}
      </div>
      <Caption title="One sketchbook." accent="Any language." start={6} />
    </AbsoluteFill>
  );
};

/** A mono label on a white pill, pinned over a card's top edge. */
const Pill: React.FC<{text: string; at: number; rotate: number}> = ({text, at, rotate}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out});
  return (
    <div
      style={{
        position: 'absolute',
        left: 26,
        top: -20,
        padding: '8px 18px',
        borderRadius: 999,
        background: '#fdfcf9',
        boxShadow: '0 2px 6px rgba(45, 38, 70, 0.14)',
        fontFamily: look.fonts.mono,
        fontSize: 24,
        fontWeight: 500,
        color: look.ink,
        opacity: t,
        transform: `rotate(${rotate}deg) translateY(${(1 - t) * 12}px)`,
      }}
    >
      {text}
    </div>
  );
};

// EXPORT: one more drawing, sewn, and the formats it goes out as.
const Export: React.FC = () => {
  const look = useLook();
  const card = 560;
  const top = middle(look) - (card + 40 + 84) / 2;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: (look.width - card) / 2, top}}>
        <Paper width={card} height={card} rotate={1.5} start={0} seed={11}>
          <Stitch size={400} shape="sun" start={6} frames={70} seed={4} />
        </Paper>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: top + card + 40, display: 'flex', justifyContent: 'center', gap: 18}}>
        <Badge text="SVG" icon={FileCode2} tone="card" at={44} size={34} />
        <Badge text="PNG" icon={ImageIcon} tone="card" at={50} size={34} />
        <Badge text="A loop" icon={Repeat} tone="accent" at={56} size={34} />
      </div>
      <Caption title="Export it" accent="anywhere." start={6} />
    </AbsoluteFill>
  );
};

// END: the ask, with a butterfly landing by the name.
const End: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <EndCard line="Draw with" accent="code." button="Start sketching" />
      <div style={{position: 'absolute', left: look.width * 0.64, top: middle(look) - 520}}>
        <Butterfly size={150} start={30} seed={9} />
      </div>
    </AbsoluteFill>
  );
};

export const inkwell: Mock = {
  id: 'Inkwell',
  title: 'a sketchbook that draws with code',
  agenda: 'launch',
  style: 'paper',
  format: 'portrait',
  brand: {name: 'Inkwell', url: 'inkwell.studio', logo: 'mocks/inkwell.svg', accent: '#31508f', alert: '#b5523b'},
  music: 'mocks/inkwell-music.wav',
  poster: 570,
  tings: [
    ['Logo', 4],
    ['Editor', BEAT.run],
    ['Editor', BEAT.edit],
  ],
  // Fades, not the paper style's bookFlip: the shader transitions (HTML in canvas) dropped the page
  // or the cards from frames well after the flip had finished.
  scenes: [
    {name: 'Hook', seconds: 3.4, component: Hook},
    {name: 'Logo', seconds: 3.2, transition: 'fade', component: () => <LogoReveal kind="pop" tagline="Draw with" accent="code." />},
    {name: 'Editor', seconds: 10.6, transition: 'fade', component: EditorShot},
    {name: 'Cards', seconds: 4.2, transition: 'fade', component: Cards},
    {name: 'Export', seconds: 3.2, transition: 'fade', component: Export},
    {name: 'End', seconds: 3.4, transition: 'fade', component: End},
  ],
};

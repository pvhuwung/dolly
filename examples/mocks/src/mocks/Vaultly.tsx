import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {Checklist, Cursor} from '../fx/graphics';
import {Kinetic} from '../fx/text';
import {Captions, Voiceover} from '../fx/voice';
import {Layer, Screen, Stage, animate, ease, focusOn, moves, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Callout, Caption} from '../parts';
import {EndCard} from '../templates';
import {vaultly as VOICE} from '../voice/vaultly';
import type {Mock} from './mock';
import {Authenticator, SPOT, VaultApp, WINDOW, ramp, useSpring} from './vaultly/App';

// VAULTLY: a narrated tutorial for an invented password manager, "Turn on two-step sign-in in a
// minute". Swiss, 16:9 for YouTube. The voice (src/mocks/vaultly/script.json, made with
// `npm run voice -- src/mocks/vaultly/script.json vaultly`) sets the pace: every click lands on
// the line that names it, and captions follow the words.

const LENS = 1800;

/** One line of the voiceover at frame `at`, with its captions. */
const Say: React.FC<{line: number; at: number}> = ({line, at}) => (
  <>
    <Voiceover lines={[VOICE[line]]} start={at} />
    <Captions lines={[VOICE[line]]} start={at} variant="karaoke" />
  </>
);

/** A click sound on each frame given. */
const Clicks: React.FC<{at: number[]}> = ({at}) => (
  <>
    {at.map((f) => (
      <Sequence key={f} from={f} durationInFrames={10}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.5} />
      </Sequence>
    ))}
  </>
);

// ---------------------------------------------------------------------------------------------

const STEPS = ['Open Security', 'Turn it on', 'Scan the code', 'Verify'];

const Intro: React.FC = () => {
  const look = useLook();
  const pop = useSpring();
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: look.safe.left, top: 300, width: 1200, display: 'flex', flexDirection: 'column', gap: 26}}>
        <div style={{...look.eyebrow, fontSize: 24, opacity: pop(4)}}>{look.eyebrowPrefix}Vaultly tutorial · 1 minute</div>
        <Kinetic text="Turn on two-step sign-in" accent="in a minute." start={8} style={{fontSize: 96}} />
      </div>
      <div style={{position: 'absolute', left: look.safe.left, top: 640, display: 'flex', gap: 0}}>
        {STEPS.map((s, i) => {
          const t = pop(56 + i * 8);
          return (
            <div key={s} style={{width: 330, borderTop: `3px solid ${i === 0 ? look.accent : '#0a0a0a'}`, paddingTop: 18, opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
              <div style={{fontFamily: look.fonts.mono, fontSize: 22, color: look.dim}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{fontFamily: look.fonts.body, fontSize: 34, fontWeight: 600, color: '#0a0a0a', marginTop: 6}}>{s}</div>
            </div>
          );
        })}
      </div>
      <Say line={0} at={14} />
    </AbsoluteFill>
  );
};

// The walk-through, one camera path over the app: frames of this scene.
const AT = {
  settings: 60,
  security: 94,
  turnOn: 184,
  phoneIn: 212,
  firstBox: 344,
  verify: 412,
  phoneOut: 420,
};
const LINES = {settings: 22, turnOn: 124, scan: 216, code: 322};

const Walkthrough: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  const pop = useSpring();

  const at = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: WINDOW, video, lens: LENS, fill, ...look.aim});
  const wide = at(whole(WINDOW), 0.9);
  const rows = at({x: 240, y: 110, width: 1040, height: 400}, 0.86);
  // The dialog and the phone beside it: a rect in the world, which focusOn takes with no card size.
  const scan = focusOn({rect: {x: -310, y: -350, width: 1150, height: 760}, size: {width: 0, height: 0}, video, lens: LENS, fill: 0.92, ...look.aim});
  const code = at({x: 350, y: 440, width: 600, height: 260}, 0.72);
  const camera = useShot(
    [
      ...moves.tiltIn(wide, {frames: 46, yaw: -16, pitch: 8, back: 500}),
      [LINES.turnOn, wide],
      [LINES.turnOn + 34, rows, ease.inOut],
      [AT.turnOn + 10, rows],
      [AT.phoneIn + 34, scan, ease.inOut],
      [LINES.code - 4, scan],
      [AT.firstBox - 4, code, ease.inOut],
      [AT.verify + 26, code],
      [AT.verify + 70, wide, ease.inOut],
    ],
    {dolly: 24},
  );

  const typed = Math.max(0, Math.min(6, Math.floor((frame - (AT.firstBox + 8)) / 7) + 1));
  const state = {
    page: frame >= AT.settings ? 1 : 0,
    security: pop(AT.security + 2, 16),
    // The dialog opens on the click, and closes once verified to show the row turned on.
    modal: frame >= AT.turnOn + 6 ? pop(AT.turnOn + 6, 16) - pop(AT.verify + 58, 14) : 0,
    typed: frame >= AT.firstBox + 8 ? typed : 0,
    verified: pop(AT.verify + 6, 16),
  };
  // The phone rises in for the scan and drops away once the code's in.
  const {rise} = animate(frame, [
    [AT.phoneIn, {rise: 1}],
    [AT.phoneIn + 30, {rise: 0}, ease.out],
    [AT.phoneOut, {rise: 0}],
    [AT.phoneOut + 30, {rise: 1}, ease.in],
  ]);
  const scanned = ramp(frame, LINES.scan + 26, LINES.scan + 70);
  const added = pop(LINES.scan + 82, 18);

  const centre = (r: {x: number; y: number; width: number; height: number}) => ({x: r.x + r.width / 2, y: r.y + r.height / 2});
  const box0 = {x: SPOT.codeBoxes.x + 29, y: SPOT.codeBoxes.y + 32};
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="none" width={WINDOW.width} height={WINDOW.height} radius={0} background="#ffffff" glare={0.25}>
            <VaultApp state={state}>
              <Callout {...SPOT.twoStepRow} at={LINES.turnOn + 30} until={AT.turnOn + 4} />
              <Cursor
                points={[
                  {x: 760, y: 620, at: 26},
                  {...centre(SPOT.settings), at: AT.settings, click: true},
                  {...centre(SPOT.securityTab), at: AT.security, click: true},
                  {...centre(SPOT.turnOn), at: AT.turnOn, click: true},
                  {x: 980, y: 740, at: AT.turnOn + 40},
                  {...box0, at: AT.firstBox, click: true},
                  {...centre(SPOT.verify), at: AT.verify, click: true},
                  {x: 1000, y: 760, at: AT.verify + 40},
                ]}
              />
            </VaultApp>
          </Screen>
        </Layer>
        {frame >= AT.phoneIn - 2 && frame < AT.phoneOut + 32 ? (
          <Layer x={640} y={30 + rise * 1100} z={240} scale={0.82}>
            <Screen frame="phone" width={416} height={876} glare={0.4}>
              <Authenticator scan={scanned} added={added} frame={frame} />
            </Screen>
          </Layer>
        ) : null}
      </Stage>
      <Clicks at={[AT.settings, AT.security, AT.turnOn, AT.firstBox, AT.verify]} />
      {/* The step, in the band: it changes with the voice. */}
      {frame < LINES.turnOn - 6 ? (
        <Caption eyebrow="Step 1 of 4" title="Open Settings," accent="then Security." start={6} exit={LINES.turnOn - 16} />
      ) : frame < LINES.scan - 6 ? (
        <Caption eyebrow="Step 2 of 4" title="Two-step sign-in:" accent="Turn on." start={LINES.turnOn} exit={LINES.scan - 16} scrim />
      ) : frame < LINES.code - 6 ? (
        <Caption eyebrow="Step 3 of 4" title="Scan the code" accent="with your phone." start={LINES.scan} exit={LINES.code - 16} scrim />
      ) : (
        <Caption eyebrow="Step 4 of 4" title="Enter the code." accent="Verify." start={LINES.code} scrim />
      )}
      <Say line={1} at={LINES.settings} />
      <Say line={2} at={LINES.turnOn} />
      <Say line={3} at={LINES.scan} />
      <Say line={4} at={LINES.code} />
    </AbsoluteFill>
  );
};

const Done: React.FC = () => {
  const look = useLook();
  const pop = useSpring();
  const t = pop(6, 20);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: look.safe.left, top: 250, width: 900, display: 'flex', flexDirection: 'column', gap: 34}}>
        <div style={{width: 120, height: 120, background: look.accent, color: look.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t})`}}>
          <Check size={76} strokeWidth={3} />
        </div>
        <Kinetic text="Your vault now asks" accent="for your phone, too." start={14} style={{fontSize: 84}} />
      </div>
      <div style={{position: 'absolute', left: 1120, top: 330}}>
        <Checklist items={['Opened Security', 'Turned it on', 'Scanned the code', 'Verified']} start={30} size={54} />
      </div>
      <Say line={5} at={10} />
    </AbsoluteFill>
  );
};

export const vaultly: Mock = {
  id: 'Vaultly',
  title: 'turn on two-step sign-in in a minute',
  agenda: 'narrated tutorial',
  style: 'swiss',
  format: 'landscape',
  brand: {name: 'Vaultly', url: 'vaultly.app', logo: 'mocks/vaultly.svg', accent: '#4b3fe0', alert: '#e5484d'},
  poster: 586,
  tings: [['Walkthrough', 420]],
  scenes: [
    {name: 'Intro', seconds: 6.4, component: Intro},
    {name: 'Walkthrough', seconds: 16.8, component: Walkthrough},
    {name: 'Done', seconds: 5.2, component: Done},
    {name: 'End', seconds: 4, component: () => <EndCard line="Two steps." accent="One minute." button="Get Vaultly" />},
  ],
};

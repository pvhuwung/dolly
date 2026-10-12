import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Badge, Checklist, Shine} from '../fx/graphics';
import {Layer, Screen, Stage, focusOn, moves, useShot, whole} from '../kit';
import {alpha, useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, LogoReveal, Statement} from '../templates';
import type {Mock} from './mock';

// BRISK, an invented deploy CLI: "from git push to live in 30 seconds". Terminal style, 16:9 for X,
// LinkedIn and YouTube. The pain (slow deploys), the product, the proof (one command, live; a race
// against the old pipeline), what's built in, the ask (the install command).

const LENS = 1800;
const TERM_BG = '#141816';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------------------------------------
// The terminal: `brisk deploy` typed, then the deploy streaming in, line by line.

const WIN = {width: 1400, height: 700};
const BAR = 40; // the window's title bar
const PAD = 44;
const LINE = 56;
const lineY = (i: number) => BAR + PAD + i * LINE;

const TYPE_AT = 30;
const COMMAND = 'brisk deploy';
const ENTER = TYPE_AT + COMMAND.length * 2 + 4;
const UPLOAD = [112, 146] as const;
const LIVE = 154;
const DONE = 164;

/** The simulated deploy clock, in seconds, shown at the top right of the terminal. */
const elapsed = (f: number) => interpolate(f, [ENTER, DONE], [0, 28.4], clamp);

const Row: React.FC<{at: number; f: number; children: React.ReactNode; time?: string}> = ({at, f, children, time}) => {
  const look = useLook();
  if (f < at) return null;
  const t = interpolate(f, [at, at + 4], [0, 1], clamp);
  return (
    <div style={{display: 'flex', alignItems: 'baseline', height: LINE, opacity: t, transform: `translateY(${(1 - t) * 6}px)`}}>
      <div style={{flex: 1, display: 'flex', alignItems: 'baseline', gap: 16, whiteSpace: 'pre'}}>{children}</div>
      {time ? <div style={{color: look.dim}}>{time}</div> : null}
    </div>
  );
};

const Terminal: React.FC = () => {
  const look = useLook();
  const f = useCurrentFrame();
  const typed = COMMAND.slice(0, Math.max(0, Math.floor((f - TYPE_AT) / 2)));
  const caret = Math.floor(f / 15) % 2 === 0;
  const ok = <span style={{color: look.accentText}}>✓</span>;
  const up = interpolate(f, UPLOAD, [0, 1], clamp);
  const cells = 22;
  const spin = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[Math.floor(f / 2) % 10];
  const prompt = <span style={{color: look.dim}}>~/acme-web</span>;
  const clock = elapsed(f);
  return (
    <div style={{position: 'absolute', inset: 0, padding: PAD, fontFamily: look.fonts.mono, fontSize: 30, color: look.ink, background: TERM_BG}}>
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          padding: '4px 14px',
          borderRadius: 8,
          background: alpha(look.accent, f >= DONE ? 0.16 : 0.08),
          color: f >= DONE ? look.accentText : look.dim,
          fontSize: 22,
          opacity: f >= ENTER ? 1 : 0,
        }}
      >
        {`00:${clock.toFixed(1).padStart(4, '0')}`}
      </div>
      <Row at={0} f={f}>
        {prompt}
        <span>
          <span style={{color: look.accentText}}>$</span> {typed}
          {f < ENTER && caret ? <span style={{background: look.ink}}> </span> : null}
        </span>
      </Row>
      <Row at={ENTER + 4} f={f}>
        <span style={{color: look.dim}}>brisk 2.4.0 · acme-web · main · a1f3c9e</span>
      </Row>
      <Row at={ENTER + 16} f={f} time="3.1s">
        {ok} Installed 412 packages
      </Row>
      <Row at={ENTER + 28} f={f} time="9.4s">
        {ok} Built 38 routes
      </Row>
      <Row at={ENTER + 40} f={f} time="6.2s">
        {ok} 126 tests passed
      </Row>
      <Row at={UPLOAD[0]} f={f} time={f >= UPLOAD[1] ? '1.6s' : undefined}>
        {f >= UPLOAD[1] ? (
          <>
            {ok} Uploaded 4.1 MB to 3 regions
          </>
        ) : (
          <>
            <span style={{color: look.accentText}}>{spin}</span> Uploading{' '}
            <span style={{color: look.accentText}}>{'█'.repeat(Math.round(up * cells))}</span>
            <span style={{color: alpha(look.ink, 0.25)}}>{'░'.repeat(cells - Math.round(up * cells))}</span> {Math.round(up * 100)}%
          </>
        )}
      </Row>
      <Row at={LIVE} f={f}>
        <span style={{color: look.accentText}}>●</span> Live
        <Shine at={LIVE + 6} radius={8}>
          <span style={{color: look.accentText, textDecoration: 'underline', textUnderlineOffset: 6, padding: '0 4px'}}>https://acme-web.brisk.sh</span>
        </Shine>
      </Row>
      <Row at={DONE} f={f}>
        <span style={{color: look.dim}}>Deployed in 28.4s. Previous deploy kept for rollback.</span>
      </Row>
      <Row at={DONE + 8} f={f}>
        {prompt}
        <span>
          <span style={{color: look.accentText}}>$</span> {caret ? <span style={{background: look.ink}}> </span> : null}
        </span>
      </Row>
    </div>
  );
};

/** The live region at the bottom of the output: what the camera pushes in to. */
const LIVE_RECT = {x: 0, y: lineY(5) - 20, width: 1080, height: LINE * 3 + 40};

const Deploy: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const framed = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: WIN, video, lens: LENS, fill, ...look.aim});
  // focusOn gives no yaw or pitch; name them, or tiltIn's tilt has no key to return to.
  const wide = {...framed(whole(WIN), 0.9), yaw: 0, pitch: 0};
  const live = {...framed(LIVE_RECT, 0.8), yaw: 0, pitch: 0};
  const camera = useShot([...moves.tiltIn(wide, {frames: 56, yaw: -24, pitch: 12, back: 800}), ...moves.zoomIn(wide, live, {start: 112, hold: 8, frames: 44})], {dolly: 30});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.mono}>
        {/* A warm pool of light behind the window, so it stands off the near-black page. */}
        <Layer z={-260}>
          <div style={{width: 2200, height: 1300, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${alpha(look.accent, 0.16)}, transparent 70%)`}} />
        </Layer>
        <Layer>
          <Screen frame="window" title="acme-web — zsh" width={WIN.width} height={WIN.height} background={TERM_BG} glare={0.5}>
            <Terminal />
          </Screen>
        </Layer>
      </Stage>
      {/* The push-in brings the output up under the band, so the caption leaves first. */}
      <Caption eyebrow="brisk deploy" title="One command." accent="Live in 30 seconds." start={6} exit={106} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The race: the old pipeline and Brisk start together; Brisk is live before the other has begun.

const RACE_CLOCK = [22, 128] as const; // frames over which the clock runs from 0 to 95 s
const raceSeconds = (f: number) => interpolate(f, RACE_CLOCK, [0, 95], clamp);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const Lane: React.FC<{label: string; done: number; seconds: number; win?: boolean; start: number}> = ({label, done, seconds, win, start}) => {
  const look = useLook();
  const f = useCurrentFrame();
  const t = interpolate(f, [start, start + 10], [0, 1], clamp);
  const p = Math.min(1, seconds / done);
  const finished = p >= 1;
  const colour = win ? look.accent : alpha(look.ink, 0.35);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 32, opacity: t, transform: `translateX(${(1 - t) * -24}px)`, fontFamily: look.fonts.mono}}>
      <div style={{width: 250, fontSize: 46, color: win ? look.accentText : look.dim, fontWeight: 600}}>{label}</div>
      <div style={{flex: 1, height: 44, borderRadius: 10, background: alpha(look.ink, 0.07), overflow: 'hidden', position: 'relative'}}>
        <div style={{position: 'absolute', inset: 0, width: `${p * 100}%`, background: colour, boxShadow: win ? `0 0 30px ${alpha(look.accent, 0.5)}` : undefined}} />
      </div>
      <div style={{width: 140, fontSize: 46, color: look.ink, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{mmss(Math.min(seconds, done))}</div>
      <div style={{width: 330, fontSize: 36, color: finished ? look.accentText : look.dim}}>{finished ? '✓ live' : win ? 'deploying…' : `building… ${Math.floor(p * 100)}%`}</div>
    </div>
  );
};

const Race: React.FC = () => {
  const look = useLook();
  const f = useCurrentFrame();
  const s = raceSeconds(f);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          top: look.band,
          bottom: look.safe.bottom,
          left: look.safe.left,
          right: look.safe.right,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 64,
        }}
      >
        <Lane label="your CI" done={18 * 60} seconds={s} start={10} />
        <Lane label="brisk" done={28.4} seconds={s} win start={16} />
        <div style={{display: 'flex', justifyContent: 'flex-end', height: 80}}>
          <Badge text="38× faster" tone="accent" at={RACE_CLOCK[0] + 40} size={40} />
        </div>
      </div>
      <Caption eyebrow="deploy time" title="18 minutes," accent="or 28 seconds." start={4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------

const Builtin: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', top: look.band, left: look.safe.left + 4, right: look.safe.right, bottom: look.safe.bottom, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Checklist items={['A preview URL for every branch', 'Rollback in one command', 'Zero config. No YAML.']} start={22} stagger={18} size={60} />
      </div>
      <Caption eyebrow="brisk --help" title="Everything" accent="built in." start={4} />
    </AbsoluteFill>
  );
};

export const brisk: Mock = {
  id: 'Brisk',
  title: 'a deploy CLI: git push to live in 30 seconds',
  agenda: 'launch',
  style: 'terminal',
  format: 'landscape',
  brand: {name: 'Brisk', url: 'brisk.sh', logo: 'mocks/brisk.svg', accent: '#ffb224', alert: '#ff6b5a'},
  poster: 372,
  music: 'mocks/brisk-music.wav',
  tings: [
    ['Deploy', LIVE],
    ['Race', Math.round(RACE_CLOCK[0] + ((RACE_CLOCK[1] - RACE_CLOCK[0]) * 28.4) / 95)],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.5, component: () => <Statement text="Deploys shouldn’t take" accent="all afternoon." />},
    {name: 'Logo', seconds: 3, component: () => <LogoReveal kind="focus" tagline="From git push" accent="to live." />},
    {name: 'Deploy', seconds: 7.5, component: Deploy},
    {name: 'Race', seconds: 5, component: Race},
    {name: 'Builtin', seconds: 4.5, component: Builtin},
    {name: 'End', seconds: 4.5, component: () => <EndCard line="Ship before" accent="lunch." button="npm i -g brisk" url="brisk.sh" />},
  ],
};

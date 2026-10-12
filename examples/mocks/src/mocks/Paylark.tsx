import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Toast} from '../fx/graphics';
import {Counter} from '../fx/text';
import {Layer, Screen, Stage, ease, focusOn, moves, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Caption} from '../parts';
import {Compare, EndCard, LogoReveal, Metric} from '../templates';
import type {Mock} from './mock';
import {BEAT, DETAIL, Invoice, WIN} from './paylark/Invoice';

// PAYLARK: invoicing for freelancers. Swiss, 4:5 for the Instagram and LinkedIn feeds, ~25 s.
// The one sentence: invoices that get paid. The pain: a list of overdue invoices, days still
// counting. The proof: one invoice written, sent in a click, paid before you follow up. The ask:
// start free at paylark.app. An invented product: names, clients and numbers are made up.

const LENS = 1800;

/** One unpaid invoice in the hook's list, its overdue days still counting up. */
const Unpaid: React.FC<{client: string; id: string; amount: string; days: number; at: number; y: number}> = ({client, id, amount, days, at, y}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: look.spring, durationInFrames: 20});
  const tag = spring({frame: frame - at - 22, fps, config: {damping: 16, stiffness: 200}, durationInFrames: 16});
  const inner = look.width - look.safe.left - look.safe.right;
  return (
    <div
      style={{
        position: 'absolute',
        left: look.safe.left,
        top: y,
        width: inner,
        height: 124,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 32px',
        background: look.surface,
        boxShadow: look.shadow,
        clipPath: `inset(-40px ${(1 - t) * 100}% -40px -40px)`,
        opacity: t > 0.01 ? 1 : 0,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 6, flex: 1}}>
        <div style={{fontFamily: look.fonts.body, fontSize: 32, fontWeight: 600, color: look.ink, letterSpacing: '-0.01em'}}>{client}</div>
        <div style={{fontFamily: look.fonts.mono, fontSize: 19, color: look.dim, letterSpacing: '0.04em'}}>{id}</div>
      </div>
      <div style={{fontFamily: look.fonts.body, fontSize: 34, fontWeight: 700, color: look.ink, fontVariantNumeric: 'tabular-nums'}}>{amount}</div>
      <div
        style={{
          width: 270,
          padding: '10px 0',
          textAlign: 'center',
          background: look.alert,
          color: '#ffffff',
          fontFamily: look.fonts.mono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.05em',
          opacity: tag,
          transform: `scale(${1.3 - 0.3 * tag})`,
        }}
      >
        OVERDUE <Counter to={days} start={at + 22} frames={60} suffix={"\u00a0DAYS"} style={{fontFamily: look.fonts.mono, fontSize: 22, fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em'}} />
      </div>
    </div>
  );
};

// HOOK: the pain. Overdue invoices piling up, the days still counting.
const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const top = look.aim.top + (look.height - look.aim.top - look.aim.bottom - (3 * 124 + 2 * 18)) / 2;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', left: look.safe.left, top: top - 46, fontFamily: look.fonts.mono, fontSize: 20, letterSpacing: '0.08em', color: look.dim, opacity: Math.min(1, Math.max(0, (frame - 4) / 10))}}>
        UNPAID · 3
      </div>
      <Unpaid client="Fern & Oak" id="INV-0128" amount="$2,400" days={14} at={6} y={top} />
      <Unpaid client="North Atelier" id="INV-0121" amount="$1,150" days={32} at={13} y={top + 142} />
      <Unpaid client="Studio Mira" id="INV-0117" amount="$3,600" days={51} at={20} y={top + 284} />
      <Caption title="Still chasing" accent="that invoice?" start={0} />
    </AbsoluteFill>
  );
};

// INVOICE: the product moment, one camera path. The window arrives, the rows are typed and the
// total counts up, the camera moves in on the total for the click, then pulls back as it's paid.
const InvoiceShot: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  // Name yaw and pitch: tiltIn keys them on its first key only, so a framing without them keeps the tilt.
  const square = {yaw: 0, pitch: 0};
  const wide = {...focusOn({rect: whole(WIN), size: WIN, video, lens: LENS, fill: 0.9, ...look.aim}), ...square};
  const detail = {...focusOn({rect: DETAIL, size: WIN, video, lens: LENS, fill: 0.78, ...look.aim}), ...square};
  const camera = useShot(
    [
      ...moves.tiltIn(wide, {frames: 54, yaw: -20, pitch: 10, back: 650}),
      [132, wide],
      [176, detail, ease.inOut],
      [BEAT.click + 16, detail],
      [BEAT.click + 54, wide, ease.inOut],
    ],
    {dolly: 30},
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer>
          <Screen frame="none" width={WIN.width} height={WIN.height} radius={6} background="#ffffff" glare={0.3}>
            <Invoice />
          </Screen>
        </Layer>
      </Stage>
      <div style={{position: 'absolute', left: (look.width - 640) / 2, top: look.aim.top - 6}}>
        <Toast title="Paid · $4,800.00" body="Juniper Studio paid invoice 0142" time="now" at={BEAT.paid} exit={BEAT.paid + 64} width={640} from="right" />
      </div>
      {/* The caption steps aside while the camera is close on the total, so they never overlap. */}
      {frame < 140 ? (
        <Caption eyebrow="New invoice" title="Write it once." accent="Send it in a click." start={8} exit={124} />
      ) : frame >= BEAT.click + 44 ? (
        <Caption eyebrow="Two days later" title="Paid before" accent="you ask." start={BEAT.click + 46} />
      ) : null}
    </AbsoluteFill>
  );
};

export const paylark: Mock = {
  id: 'Paylark',
  title: 'invoicing for freelancers',
  agenda: 'launch',
  style: 'swiss',
  format: 'portrait',
  brand: {name: 'Paylark', url: 'paylark.app', logo: 'mocks/paylark.svg', accent: '#1f47d6', alert: '#e63312'},
  music: 'mocks/paylark-music.wav',
  poster: 455,
  tings: [
    ['Invoice', BEAT.click],
    ['Invoice', BEAT.paid],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.6, component: Hook},
    {name: 'Logo', seconds: 3, component: () => <LogoReveal kind="slide" tagline="Invoicing for" accent="freelancers." />},
    {name: 'Invoice', seconds: 10.6, component: InvoiceShot},
    {
      name: 'Compare',
      seconds: 4.6,
      component: () => (
        <Compare
          title="Stop"
          accent="chasing."
          before={{title: 'Before', items: ['Invoices in a spreadsheet', 'Reminders by hand', 'Paid in 30+ days']}}
          after={{title: 'With Paylark', items: ['An invoice in a minute', 'Reminders sent for you', 'Paid by card or bank']}}
        />
      ),
    },
    {name: 'Metric', seconds: 3, component: () => <Metric value={2.3} decimals={1} label="days to get paid, on average" />},
    {name: 'End', seconds: 3.6, component: () => <EndCard line="Invoices that" accent="get paid." button="Start free" />},
  ],
};

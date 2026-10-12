import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BellRing, FileText, LineChart as LineChartIcon, Plug} from 'lucide-react';
import {Backdrop} from '../fx/backdrops';
import {LineChart, Toast} from '../fx/graphics';
import {Counter, Kinetic} from '../fx/text';
import {Layer, Screen, Stage, focusOn, moves, useShot, whole} from '../kit';
import {alpha, useLook} from '../look';
import {Caption} from '../parts';
import {EndCard, Features, LogoReveal} from '../templates';
import type {Mock} from './mock';
import {Dashboard, TABLE, WIN} from './ledgerly/Dashboard';

// LEDGERLY: spend analytics for startups. Brief: a founder's month-end panic → every dollar in one
// view → the spike caught before it hurts → runway, forecast → what's in it → start free. Square,
// for feeds; midnight, the look of a finance tool for engineers.

const LENS = 1800;

// HOOK: money leaving, line by line, under the question, the month's total counting up in red.
const SPEND: [string, string][] = [
  ['Contractors', '12,800'],
  ['Cloud hosting', '4,200'],
  ['Ads', '6,150'],
  ['Design tools', '1,140'],
  ['Payroll platform', '28,900'],
  ['Data warehouse', '3,980'],
  ['Team offsite', '9,300'],
  ['Office snacks', '640'],
];
const ROW_H = 62;
const VISIBLE = 4;

const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const first = 10;
  const step = 7;
  const ins = SPEND.map((_, i) => spring({frame: frame - first - i * step, fps, config: {damping: 200}, durationInFrames: 14}));
  const shown = ins.reduce((a, b) => a + b, 0);
  const scroll = Math.max(0, shown - VISIBLE) * ROW_H;
  const card = spring({frame: frame - 4, fps, config: {damping: 200}, durationInFrames: 20});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom}px ${look.safe.left}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 52,
        }}
      >
        <div style={{width: '100%'}}>
          <Kinetic text="Where did" accent="the money go?" start={0} align="center" style={{fontSize: Math.round(look.size * 1.35)}} />
        </div>
        <div
          style={{
            width: 760,
            borderRadius: 18,
            background: alpha(look.surface, 0.9),
            border: `1px solid ${look.line}`,
            boxShadow: look.shadow,
            padding: '10px 30px 0',
            opacity: card,
            transform: `translateY(${(1 - card) * 30}px)`,
          }}
        >
          <div style={{height: VISIBLE * ROW_H, overflow: 'hidden', maskImage: 'linear-gradient(transparent, black 30%)', WebkitMaskImage: 'linear-gradient(transparent, black 30%)'}}>
            <div style={{transform: `translateY(${-scroll}px)`}}>
              {SPEND.map(([name, amount], i) => (
                <div
                  key={name}
                  style={{
                    height: ROW_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${look.line}`,
                    opacity: ins[i],
                    transform: `translateY(${(1 - ins[i]) * 24}px)`,
                  }}
                >
                  <span style={{fontFamily: look.fonts.body, fontSize: 30, fontWeight: 500, color: look.ink}}>{name}</span>
                  <span style={{fontFamily: look.fonts.mono, fontSize: 28, color: look.dim}}>−${amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{height: 92, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span style={{fontFamily: look.fonts.body, fontSize: 26, fontWeight: 600, color: look.dim, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              This month
            </span>
            <Counter
              to={184300}
              prefix="−$"
              start={first}
              frames={SPEND.length * step + 8}
              style={{fontFamily: look.fonts.headline, fontSize: 52, fontWeight: 600, letterSpacing: '-0.03em', color: look.alert}}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// OVERVIEW: the dashboard arrives and fills in, then the camera goes to the vendor that spiked as
// the alert lands.
const ALERT = 150;

const Overview: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  // yaw and pitch named, so tiltIn's turn has something to settle back to.
  const wide = {...focusOn({rect: whole(WIN), size: WIN, video, lens: LENS, fill: 0.95, ...look.aim}), yaw: 0, pitch: 0};
  const spike = focusOn({rect: TABLE, size: WIN, video, lens: LENS, fill: 0.92, ...look.aim});
  const camera = useShot([...moves.tiltIn(wide, {frames: 50, back: 700, yaw: -22, pitch: 12}), ...moves.zoomIn(wide, spike, {start: 118, hold: 0, frames: 38})], {
    dolly: 30,
  });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        {/* A pool of the accent behind the window, so a dark window stands off a dark page. */}
        <Layer z={-80}>
          <div style={{width: 1700, height: 1200, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${alpha(look.accent, 0.2)}, transparent 70%)`}} />
        </Layer>
        <Layer>
          <Screen frame="window" title="Ledgerly — Overview" width={WIN.width} height={WIN.height} background="#0b0d11" glare={0.5}>
            <Dashboard alertAt={ALERT} />
          </Screen>
        </Layer>
      </Stage>
      {/* Close in, the window runs up under the caption: fade the page back in behind the words. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${look.background} ${look.band * 0.8}px, ${alpha(look.background, 0)} ${look.band + 40}px)`,
          opacity: interpolate(frame, [118, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      />
      {frame < 116 ? (
        <Caption title="Every dollar," accent="as it moves." start={10} exit={108} />
      ) : (
        <Caption title="Catch the spike" accent="before it hurts." start={120} />
      )}
      <div style={{position: 'absolute', left: (look.width - 600) / 2, bottom: look.safe.bottom}}>
        <Toast title="Cloud hosting up 42%" body="$12.1k over plan this week" time="now" from="right" at={ALERT} width={600} />
      </div>
    </AbsoluteFill>
  );
};

// RUNWAY: how long the money lasts, and the forecast to the month it runs out.
const Runway: React.FC = () => {
  const look = useLook();
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const chart = spring({frame: frame - 26, fps, config: {damping: 200}, durationInFrames: 20});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom}px ${look.safe.left}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
          <Counter to={18} start={4} frames={40} style={{...look.headline, color: look.accentText, fontSize: 200, lineHeight: 0.9}} />
          <Kinetic text="months" start={14} effect="blur" style={{fontSize: 92}} />
        </div>
        <Kinetic text="of runway, at today’s burn." start={22} align="center" style={{fontSize: 44, color: look.dim, fontWeight: 500}} />
        <div
          style={{
            marginTop: 40,
            padding: '26px 70px 22px 34px',
            borderRadius: 18,
            background: alpha(look.surface, 0.85),
            border: `1px solid ${look.line}`,
            opacity: chart,
            transform: `translateY(${(1 - chart) * 24}px)`,
          }}
        >
          <div style={{fontFamily: look.fonts.body, fontSize: 22, fontWeight: 500, color: look.dim, marginBottom: 52}}>Cash forecast</div>
          <LineChart
            values={[3.3, 2.9, 2.45, 2.0, 1.5, 0.95, 0.4]}
            labels={['Nov', 'Feb', 'May', 'Aug', 'Nov', 'Feb', 'Apr']}
            width={700}
            height={250}
            min={0}
            max={3.6}
            start={34}
            frames={60}
            format={(n) => `$${n.toFixed(1)}M`}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ledgerly: Mock = {
  id: 'Ledgerly',
  title: 'spend analytics for startups',
  agenda: 'launch',
  style: 'midnight',
  format: 'square',
  brand: {name: 'Ledgerly', url: 'ledgerly.io', logo: 'mocks/ledgerly.svg', accent: '#2bd47d', alert: '#ff7a45'},
  music: 'mocks/ledgerly-music.wav',
  poster: 347,
  tings: [
    ['Logo', 4],
    ['Overview', ALERT],
  ],
  scenes: [
    {name: 'Hook', seconds: 3.5, component: Hook},
    {name: 'Logo', seconds: 3, component: () => <LogoReveal kind="focus" tagline="Spend analytics" accent="for startups." />},
    {name: 'Overview', seconds: 7.5, component: Overview},
    {name: 'Runway', seconds: 4, component: Runway},
    {
      name: 'Features',
      seconds: 4.5,
      component: () => (
        <Features
          title="Built for"
          accent="founders."
          items={[
            {icon: Plug, title: 'Live in minutes', text: 'Bank, cards and payroll'},
            {icon: BellRing, title: 'Spike alerts', text: 'Before the invoice lands'},
            {icon: LineChartIcon, title: 'Runway forecast', text: 'Updated every night'},
            {icon: FileText, title: 'Board reports', text: 'One click, every month'},
          ]}
        />
      ),
    },
    {name: 'End', seconds: 3.5, component: () => <EndCard line="Know your runway" accent="before investors ask." button="Start free" />},
  ],
};

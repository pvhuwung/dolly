import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Counter, Kinetic} from '../fx/text';
import {alpha, byShape, useLook} from '../look';
import {Announcement, EndCard, List, Timeline} from '../templates';
import type {Mock} from './mock';

// HALCYON: funding news from an invented battery-recycling company. Brief: say the news first,
// plainly (the round, the amount, who led it), then why it matters (spent batteries become new
// ones), how they got here and what the money is for, and who they're hiring. Editorial, 16:9 for
// X and LinkedIn: calm and credible, like a newsroom, with hard cuts.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const draw = Easing.bezier(0.45, 0, 0.25, 1);

const STEPS = ['Collect', 'Shred', 'Recover', 'Rebuild'];

/** The loop a battery goes round: an arc drawing clockwise, each step popping as it passes. */
const Loop: React.FC<{size: number; start: number}> = ({size, start}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = size / 2;
  const r = size * 0.36;
  const p = interpolate(frame, [start, start + 66], [0, 1], {...clamp, easing: draw});
  const label: React.CSSProperties = {position: 'absolute', fontFamily: look.fonts.body, fontSize: 34, fontWeight: 600, color: look.ink, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={look.line} strokeWidth={3} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={look.accent}
          strokeWidth={6}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - p}
          transform={`rotate(-90 ${c} ${c})`}
          opacity={p > 0.002 ? 1 : 0}
        />
        {/* A chevron halfway between steps, pointing the way round, once the arc has passed it. */}
        {[0.125, 0.375, 0.625, 0.875].map((f) => {
          const a = f * Math.PI * 2 - Math.PI / 2;
          const shown = interpolate(p, [f, f + 0.04], [0, 1], clamp);
          const x = c + r * Math.cos(a);
          const y = c + r * Math.sin(a);
          const deg = (a * 180) / Math.PI + 90;
          return (
            <path
              key={f}
              d="M -9 -10 L 5 0 L -9 10"
              transform={`translate(${x} ${y}) rotate(${deg}) scale(${shown})`}
              fill="none"
              stroke={look.accent}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      {STEPS.map((s, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const x = c + r * Math.cos(a);
        const y = c + r * Math.sin(a);
        const t = spring({frame: frame - start - (i / 4) * 66 + 2, fps, config: {damping: 14, stiffness: 160}, durationInFrames: 22});
        const lit = i === 0 || p >= i / 4;
        const out = r + 46;
        const lx = c + out * Math.cos(a);
        const ly = c + out * Math.sin(a);
        const anchor: React.CSSProperties =
          i === 0
            ? {left: lx, top: ly, transform: 'translate(-50%, -100%)'}
            : i === 1
              ? {left: lx, top: ly, transform: 'translate(0, -50%)'}
              : i === 2
                ? {left: lx, top: ly, transform: 'translate(-50%, 0)'}
                : {left: lx, top: ly, transform: 'translate(-100%, -50%)'};
        return (
          <React.Fragment key={s}>
            <div
              style={{
                position: 'absolute',
                left: x - 17,
                top: y - 17,
                width: 34,
                height: 34,
                borderRadius: 17,
                background: look.surface,
                boxShadow: `0 0 0 5px ${lit ? look.accent : look.line}, 0 6px 16px rgba(20, 19, 16, 0.12)`,
                transform: `scale(${t})`,
              }}
            />
            <div style={{...label, ...anchor, opacity: Math.min(1, t * 1.5)}}>
              <span style={{color: look.accentText, fontFamily: look.fonts.mono, fontSize: 24, marginRight: 10}}>0{i + 1}</span>
              {s}
            </div>
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: interpolate(frame, [start + 24, start + 36], [0, 1], clamp),
        }}
      >
        <Counter to={4200} suffix=" t" start={start + 30} frames={56} style={{...look.headline, fontSize: Math.round(size * 0.17), lineHeight: 1}} />
        <div
          style={{
            fontFamily: look.fonts.body,
            fontSize: 30,
            color: look.dim,
            textAlign: 'center',
            lineHeight: 1.3,
            opacity: interpolate(frame, [start + 40, start + 60], [0, 1], clamp),
          }}
        >
          of battery metals
          <br />
          recovered so far
        </div>
      </div>
    </div>
  );
};

/** Why it matters: a spent battery goes round the loop and comes back as a new one. */
const Why: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const body = interpolate(frame, [44, 64], [0, 1], clamp);
  const size = byShape(look, {wide: 640, tall: 620});
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: 'absolute',
          ...byShape(look, {
            wide: {left: look.safe.left, top: 300, width: 780},
            tall: {left: look.safe.left, top: look.safe.top, width: look.width - look.safe.left - look.safe.right},
          }),
          display: 'flex',
          flexDirection: 'column',
          gap: 34,
        }}
      >
        <Kinetic text="Every battery has" accent="a second life." start={6} style={{fontSize: Math.round(look.size * 1.25)}} />
        <div
          style={{
            fontFamily: look.fonts.body,
            fontSize: 36,
            lineHeight: 1.4,
            color: look.dim,
            maxWidth: 700,
            opacity: body,
            transform: `translateY(${(1 - body) * 14}px)`,
          }}
        >
          We take back spent cells, recover their lithium, nickel and cobalt, and sell them to the people who make new ones.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          ...byShape(look, {
            wide: {left: 1410 - size / 2, top: 560 - size / 2},
            tall: {left: (look.width - size) / 2, top: look.height - look.safe.bottom - size},
          }),
        }}
      >
        <Loop size={size} start={16} />
      </div>
    </AbsoluteFill>
  );
};

export const halcyon: Mock = {
  id: 'Halcyon',
  title: 'an invented battery-recycling company raises its Series A',
  agenda: 'funding news',
  style: 'editorial',
  format: 'landscape',
  brand: {name: 'Halcyon', url: 'halcyon.energy', logo: 'mocks/halcyon.svg', accent: '#b8572e', alert: '#2e6f95'},
  music: 'mocks/halcyon-music.wav',
  poster: 105,
  tings: [
    ['News', 52],
    ['Why', 84],
  ],
  scenes: [
    {
      name: 'News',
      seconds: 4.6,
      component: () => <Announcement eyebrow="Halcyon · October 2026" text="We raised" accent="$18 million." detail="Our Series A, led by Northpeak Ventures" />,
    },
    {name: 'Why', seconds: 5.6, component: Why},
    {
      name: 'Story',
      seconds: 5.4,
      component: () => (
        <Timeline
          eyebrow="Where the money goes"
          title="From a shed"
          accent="to three plants."
          items={[
            {when: '2022', what: 'Two founders, one shed'},
            {when: '2024', what: 'Our first plant opens'},
            {when: '2026', what: '4,200 tonnes recovered'},
            {when: '2028', what: 'Three plants, ten times the capacity'},
          ]}
        />
      ),
    },
    {
      name: 'Hiring',
      seconds: 4.8,
      component: () => (
        <List
          eyebrow="We're hiring"
          title="Come build"
          accent="with us."
          items={[
            {label: 'Process engineering', detail: 'Reno, Nevada', value: '6 roles'},
            {label: 'Plant operations', detail: 'Reno, Nevada', value: '9 roles'},
            {label: 'Software and data', detail: 'Remote, US time zones', value: '4 roles'},
          ]}
        />
      ),
    },
    {name: 'End', seconds: 4, component: () => <EndCard line="Thank you to everyone" accent="who got us here." button="See open roles" />},
  ],
};

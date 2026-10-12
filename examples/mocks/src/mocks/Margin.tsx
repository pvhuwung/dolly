import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {LineChart} from '../fx/graphics';
import {Kinetic} from '../fx/text';
import {alpha, useLook} from '../look';
import {EndCard, Metric} from '../templates';
import type {Mock} from './mock';

// MARGIN: a data story from an invented economics newsletter, The Margin: "Why your coffee costs
// more." Brief: ask the question, show the beans getting dearer, then the turn: beans are the
// small part of a $5 latte; rent and wages are most of it. One takeaway, then subscribe. Cinema,
// 1:1 for feeds: black, a big quiet serif, grain, fades through black. Every figure is invented and
// says so on screen.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const draw = Easing.bezier(0.45, 0, 0.25, 1);

/** A small grey line at the foot of a chart, saying where the numbers come from. */
const Source: React.FC<{text: string; at: number}> = ({text, at}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: look.safe.left,
        right: look.safe.right,
        bottom: look.safe.bottom,
        fontFamily: look.fonts.body,
        fontSize: 26,
        letterSpacing: '0.04em',
        color: look.dim,
        opacity: interpolate(frame, [at, at + 20], [0, 0.9], clamp),
      }}
    >
      {text}
    </div>
  );
};

/** The headline of a chart scene, top left. */
const Title: React.FC<{text: string; accent: string; start?: number}> = ({text, accent, start = 4}) => {
  const look = useLook();
  return (
    <div style={{position: 'absolute', left: look.safe.left, right: look.safe.right, top: look.safe.top + 6}}>
      <Kinetic text={text} accent={accent} start={start} style={{fontSize: Math.round(look.size * 1.05)}} />
    </div>
  );
};

// HOOK: a cup drawn in a few lines, steam rising, under the question.
const Cup: React.FC<{size: number}> = ({size}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const body = interpolate(frame, [2, 34], [0, 1], {...clamp, easing: draw});
  const rest = interpolate(frame, [18, 44], [0, 1], {...clamp, easing: draw});
  const line = {fill: 'none', stroke: look.ink, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1, strokeDasharray: '1'} as const;
  return (
    <svg viewBox="0 0 300 300" width={size} height={size} style={{overflow: 'visible'}}>
      <path d="M 62 124 L 238 124 L 221 248 Q 217 268 195 268 L 105 268 Q 83 268 79 248 Z" {...line} strokeDashoffset={1 - body} />
      <path d="M 237 150 C 292 148, 292 222, 228 222" {...line} strokeDashoffset={1 - rest} />
      <path d="M 26 284 Q 150 304 274 284" {...line} strokeDashoffset={1 - rest} />
      {/* Steam: three wisps drawing up, then drifting. */}
      {[0, 1, 2].map((i) => {
        const t = interpolate(frame, [30 + i * 8, 70 + i * 8], [0, 1], {...clamp, easing: draw});
        const drift = Math.sin((frame + i * 20) / 18) * 4;
        const x = 112 + i * 38;
        return (
          <path
            key={i}
            d={`M ${x} 104 C ${x - 16} 84, ${x + 16} 66, ${x} 44 S ${x - 10} 16, ${x + 2} 4`}
            {...line}
            stroke={alpha(look.ink, 0.55)}
            strokeWidth={4}
            strokeDashoffset={1 - t}
            transform={`translate(${drift} ${-4 * t})`}
          />
        );
      })}
    </svg>
  );
};

const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46, padding: `0 ${look.safe.right}px 0 ${look.safe.left}px`}}>
        <div style={{...look.eyebrow, fontSize: 26, opacity: interpolate(frame, [0, 16], [0, 1], clamp)}}>The Margin · Issue 112</div>
        <Cup size={300} />
        <Kinetic text="Why does your coffee" accent="cost more?" start={14} align="center" style={{fontSize: Math.round(look.size * 1.15)}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// BEANS: wholesale prices over six years, drawing across.
const PRICES = [1.12, 1.48, 2.25, 1.81, 2.64, 3.38, 3.12];
const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

const Beans: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const width = look.width - look.safe.left - look.safe.right - 60;
  const years = interpolate(frame, [16, 36], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Title text="Coffee beans:" accent="nearly three times dearer." />
      <div style={{position: 'absolute', left: look.safe.left + 20, top: 330}}>
        <LineChart values={PRICES} width={width} height={500} start={22} frames={90} min={0} max={3.6} format={(n) => `$${n.toFixed(2)}`} />
        {/* The years, in type big enough for a phone (the chart's own labels are small). */}
        {YEARS.map((y, i) => (
          <div
            key={y}
            style={{
              position: 'absolute',
              top: 522,
              left: (i / (YEARS.length - 1)) * width,
              transform: 'translateX(-50%)',
              fontFamily: look.fonts.body,
              fontSize: 28,
              color: look.dim,
              opacity: years,
            }}
          >
            {i === 0 || i === YEARS.length - 1 ? y : `’${y.slice(2)}`}
          </div>
        ))}
      </div>
      <Source text="Wholesale arabica, $ per lb · Illustrative figures" at={30} />
    </AbsoluteFill>
  );
};

// LATTE: where the money in a $5 latte goes, biggest first. The beans are the small part.
const SPLIT: {label: string; value: number}[] = [
  {label: 'Wages', value: 1.6},
  {label: 'Rent', value: 1.15},
  {label: 'Other costs', value: 0.7},
  {label: 'Milk', value: 0.55},
  {label: 'Beans', value: 0.45},
  {label: 'Profit', value: 0.35},
  {label: 'Cup and lid', value: 0.2},
];
const BEANS = 4;

const Breakdown: React.FC<{start: number}> = ({start}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const width = look.width - look.safe.left - look.safe.right;
  const labelW = 270;
  const valueW = 130;
  const track = width - labelW - valueW - 40;
  const top = SPLIT[0].value;
  const lit = interpolate(frame, [start + 70, start + 86], [0, 1], clamp);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 26, width}}>
      {SPLIT.map((d, i) => {
        const t = spring({frame: frame - start - i * 6, fps, config: {damping: 200}, durationInFrames: 34});
        const beans = i === BEANS;
        // Every bar starts in the ink; once they're all in, everything dims but the beans.
        const ink = beans ? look.accent : alpha(look.ink, 0.85 - 0.55 * lit);
        return (
          <div key={d.label} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: Math.min(1, t * 1.6)}}>
            <div
              style={{
                width: labelW,
                fontFamily: look.fonts.body,
                fontSize: 38,
                fontWeight: beans ? 700 : 500,
                color: beans ? look.accentText : alpha(look.ink, 1 - 0.45 * lit),
                textAlign: 'right',
              }}
            >
              {d.label}
            </div>
            <div style={{width: track, height: 44, position: 'relative'}}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: (track * d.value * t) / top,
                  borderRadius: 4,
                  background: ink,
                  boxShadow: beans ? `0 0 ${30 * lit}px ${alpha(look.accent, 0.5)}` : undefined,
                }}
              />
            </div>
            <div
              style={{
                width: valueW,
                fontFamily: look.fonts.body,
                fontSize: 38,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: beans ? look.accentText : alpha(look.ink, 1 - 0.45 * lit),
              }}
            >
              ${(d.value * t).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Latte: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Title text="Where your $5 goes." accent="The beans: 45¢." />
      <div style={{position: 'absolute', left: look.safe.left, top: 330}}>
        <Breakdown start={20} />
      </div>
      <Source text="A $5 latte at a city café · Illustrative figures" at={30} />
    </AbsoluteFill>
  );
};

export const margin: Mock = {
  id: 'Margin',
  title: 'why your coffee costs more, from an invented newsletter',
  agenda: 'data story',
  style: 'cinema',
  format: 'square',
  brand: {name: 'The Margin', url: 'themargin.news', logo: 'mocks/margin.svg', accent: '#d2553b', alert: '#e8a33d'},
  music: 'mocks/margin-music.wav',
  poster: 395,
  tings: [
    ['Latte', 92],
    ['Takeaway', 30],
  ],
  scenes: [
    {name: 'Hook', seconds: 4.4, component: Hook},
    {name: 'Beans', seconds: 6.2, component: Beans},
    {name: 'Latte', seconds: 6.6, component: Latte},
    {
      name: 'Takeaway',
      seconds: 4.6,
      component: () => <Metric value={9} suffix="%" label="of your latte is the coffee." note="Most of the rest is wages and rent." />,
    },
    {name: 'End', seconds: 4.2, component: () => <EndCard line="Read the full story" accent="in The Margin." button="Subscribe free" />},
  ],
};

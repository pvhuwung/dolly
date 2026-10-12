import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Counter, Kinetic} from '../fx/text';
import {alpha, byShape, mix, useLook} from '../look';
import {EndCard, LogoReveal} from '../templates';
import type {Mock} from './mock';

// AURELO: a teaser for an invented smart lamp whose light follows the time of day: cool and bright
// in the morning, warm and low at night. Cinema style, 16:9: slow fades through black, grain, a big
// quiet serif. Mornings, then evenings, then the idea, the name and the date, the waitlist.

const COOL = '#dfe8ff';
const WARM = '#ffad55';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const slow = Easing.bezier(0.45, 0, 0.2, 1);

/** The lamp, drawn: an arc stem, a dome shade, and its light (`glow` 0 to 1, `warmth` 0 cool to 1 warm). */
const Lamp: React.FC<{glow: number; warmth: number; height: number}> = ({glow, warmth, height}) => {
  const light = mix(COOL, WARM, warmth);
  const id = `lamp-${Math.round(warmth * 100)}`;
  return (
    <svg viewBox="0 0 600 900" style={{height, width: (height * 600) / 900, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0%" stopColor={light} stopOpacity={0.55 * glow} />
          <stop offset="100%" stopColor={light} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} stopOpacity={0.32 * glow} />
          <stop offset="100%" stopColor={light} stopOpacity={0.02 * glow} />
        </linearGradient>
        <radialGradient id={`${id}-pool`}>
          <stop offset="0%" stopColor={light} stopOpacity={0.5 * glow} />
          <stop offset="100%" stopColor={light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={420} cy={250} r={260} fill={`url(#${id}-halo)`} />
      <polygon points="352,256 488,256 610,842 160,842" fill={`url(#${id}-cone)`} />
      <ellipse cx={385} cy={846} rx={250} ry={38} fill={`url(#${id}-pool)`} />
      <ellipse cx={150} cy={862} rx={74} ry={12} fill="#2b2620" />
      <path d="M150 858 C 146 520, 210 248, 402 236" stroke="#3b342c" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 336 258 Q 420 138 504 258 Z" fill="#2d2823" />
      <path d="M 336 258 L 504 258" stroke={alpha(light, 0.5 + 0.5 * glow)} strokeWidth={3} />
      <ellipse cx={420} cy={262} rx={22} ry={9} fill={light} opacity={0.25 + 0.75 * glow} />
    </svg>
  );
};

/** Words on one side, the lamp on the other (stacked in a tall frame), creeping in. */
const LampShot: React.FC<{text: string; accent: string; glow: [number, number]; warmth: [number, number]}> = ({text, accent, glow, warmth}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const g = interpolate(frame, [6, 70], glow, {...clamp, easing: slow});
  const w = interpolate(frame, [10, 95], warmth, {...clamp, easing: slow});
  const push = interpolate(frame, [0, 110], [1, 1.05]);
  return (
    <AbsoluteFill>
      <Backdrop />
      {/* The room takes the lamp's colour. */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 60% at ${look.tall ? '50% 70%' : '68% 40%'}, ${alpha(mix(COOL, WARM, w), 0.16 * g)}, transparent 70%)`}} />
      <div
        style={{
          position: 'absolute',
          ...byShape(look, {
            wide: {left: look.width * 0.5, top: 70},
            tall: {left: look.width * 0.12, top: look.height * 0.36},
          }),
          transform: `scale(${push})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Lamp glow={g} warmth={w} height={byShape(look, {wide: 940, tall: 1000})} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          ...byShape(look, {wide: {top: 380, width: 820}, tall: {top: look.safe.top, width: look.width - look.safe.left - look.safe.right}}),
        }}
      >
        <Kinetic text={text} accent={accent} start={20} style={{fontSize: look.size * 1.25}} />
      </div>
    </AbsoluteFill>
  );
};

/** The day as an arc, sunrise to night: the light's colour and temperature follow the dot. */
const Day: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const t = interpolate(frame, [16, 112], [0, 1], {...clamp, easing: slow});
  const w = byShape(look, {wide: 980, tall: 820});
  const r = w / 2;
  const angle = Math.PI * (1 - t);
  const dot = {x: r + r * Math.cos(angle), y: r - r * Math.sin(angle)};
  const colour = mix(COOL, WARM, t);
  const drawn = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: slow});
  const label: React.CSSProperties = {fontFamily: look.fonts.body, fontSize: 30, letterSpacing: '0.2em', color: look.dim};
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% 62%, ${alpha(colour, 0.14)}, transparent 70%)`}} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: look.safe.top + (look.tall ? 40 : 10)}}>
        <Kinetic text="Light that follows" accent="your day." start={8} align="center" style={{fontSize: look.size * 1.15}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: (look.width - w) / 2, top: byShape(look, {wide: 470, tall: 820}), width: w, height: r + 90}}>
        <svg width={w} height={r + 20} style={{overflow: 'visible'}}>
          <path d={`M 0 ${r} A ${r} ${r} 0 0 1 ${w} ${r}`} fill="none" stroke={look.line} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - drawn} />
          <path d={`M 0 ${r} A ${r} ${r} 0 0 1 ${dot.x} ${dot.y}`} fill="none" stroke={alpha(colour, 0.8)} strokeWidth={3} />
          <circle cx={dot.x} cy={dot.y} r={34} fill={alpha(colour, 0.25)} />
          <circle cx={dot.x} cy={dot.y} r={14} fill={colour} />
        </svg>
        <div style={{position: 'absolute', left: 0, top: r + 26, ...label}}>7:00</div>
        <div style={{position: 'absolute', right: 0, top: r + 26, ...label}}>22:00</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: r * 0.42, display: 'flex', justifyContent: 'center'}}>
          <Counter from={5000} to={2700} start={16} frames={96} suffix=" K" style={{fontFamily: look.fonts.headline, fontSize: 120, color: colour, letterSpacing: '-0.02em'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const aurelo: Mock = {
  id: 'Aurelo',
  title: 'a lamp that follows your day',
  agenda: 'teaser',
  style: 'cinema',
  format: 'landscape',
  brand: {name: 'Aurelo', url: 'aurelo.co', logo: 'mocks/aurelo.svg', accent: '#e9a54e', alert: '#e9a54e'},
  poster: 290,
  music: 'mocks/aurelo-music.wav',
  tings: [['Name', 12]],
  scenes: [
    {name: 'Morning', seconds: 4, component: () => <LampShot text="Mornings arrive" accent="gently." glow={[0, 0.8]} warmth={[0, 0.08]} />},
    {name: 'Evening', seconds: 4, component: () => <LampShot text="Evenings" accent="wind down." glow={[0.8, 0.55]} warmth={[0.15, 1]} />},
    {name: 'Day', seconds: 4.5, component: Day},
    {name: 'Name', seconds: 3.5, component: () => <LogoReveal kind="focus" tagline="Coming" accent="October 24." />},
    {name: 'Waitlist', seconds: 3.5, component: () => <EndCard line="Be the first to see it." button="Join the waitlist" />},
  ],
};

import React, {useId} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {BackdropKind, Look, alpha, mix, useLook} from '../look';
import type {Demo} from './demo';

// The page behind the shots. Every kind moves slowly with the frame, so a held shot never looks
// frozen, and stays faint enough never to compete with the product. With no `kind` it draws the
// style's own (look.backdrop). Put it first in a scene, under a Stage that has no background:
//
//   <AbsoluteFill>
//     <Backdrop />
//     <Stage camera={camera} lens={1800}>...</Stage>
//   </AbsoluteFill>

/**
 * How dark the page is, which sets how strong shading and light can be: `night` (near-black),
 * `mid` (a coloured page, like bold's accent) or `day`.
 */
type Tone = 'night' | 'mid' | 'day';
const toneOf = (look: Look): Tone => {
  const hex = /^#([0-9a-f]{6})$/i.exec(look.background)?.[1];
  if (!hex) return look.dark ? 'night' : 'day';
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l < 0.06 ? 'night' : l < 0.45 ? 'mid' : 'day';
};
type ByTone = Record<Tone, number>;

type Props = {look: Look; tone: Tone; t: number; frame: number};

/** Soft corners, so whatever sits in the middle reads first. */
const Vignette: React.FC<{look: Look; tone: Tone; strength: ByTone}> = ({look, tone, strength}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, ${alpha(tone === 'day' ? look.ink : '#000000', strength[tone])} 100%)`,
    }}
  />
);

/** A grid of hairlines, every `step` px, fading out from the middle. */
const Hairlines: React.FC<{look: Look; step: number; strength: number; drift?: number}> = ({look, step, strength, drift = 0}) => {
  const c = alpha(look.ink, strength);
  const mask = 'radial-gradient(ellipse 70% 65% at 50% 45%, black 0%, transparent 80%)';
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        backgroundSize: `${step}px ${step}px`,
        backgroundPosition: `${look.width / 2}px ${look.height / 2 - drift}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};

/** A soft round light, `size` px across, centred at (x, y) in fractions of the frame. */
const Orb: React.FC<{look: Look; x: number; y: number; size: number; color: string; strength: number}> = ({look, x, y, size, color, strength}) => (
  <div
    style={{
      position: 'absolute',
      left: x * look.width - size / 2,
      top: y * look.height - size / 2,
      width: size,
      height: size,
      background: `radial-gradient(circle, ${alpha(color, strength)} 0%, ${alpha(color, strength * 0.45)} 32%, transparent 68%)`,
    }}
  />
);

const Glow: React.FC<Props> = ({look, t}) => {
  const big = Math.max(look.width, look.height);
  const s = look.dark ? 0.34 : 0.17;
  const bright = mix(look.accent, '#ffffff', 0.35);
  return (
    <AbsoluteFill>
      <Orb look={look} x={0.2 + 0.06 * Math.sin(t * 0.22)} y={0.16 + 0.05 * Math.cos(t * 0.18)} size={big * 0.9} color={look.accent} strength={s} />
      <Orb look={look} x={0.84 + 0.05 * Math.sin(t * 0.17 + 2)} y={0.78 + 0.06 * Math.cos(t * 0.21 + 1)} size={big * 0.8} color={bright} strength={s * 0.7} />
      <Orb look={look} x={0.55 + 0.08 * Math.sin(t * 0.13 + 4)} y={0.45 + 0.05 * Math.sin(t * 0.19)} size={big * 0.55} color={look.accent} strength={s * 0.35} />
      <Hairlines look={look} step={72} strength={look.dark ? 0.045 : 0.05} drift={t * 4} />
    </AbsoluteFill>
  );
};

const Grid: React.FC<Props & {id: string}> = ({look, t, id}) => {
  // Twelve columns inside the safe margins, square modules, a + at every other crossing.
  const left = look.safe.left;
  const col = (look.width - look.safe.left - look.safe.right) / 12;
  const line = alpha(look.ink, look.dark ? 0.08 : 0.075);
  const mark = alpha(look.ink, look.dark ? 0.3 : 0.28);
  const dy = (t * 6) % col;
  return (
    <AbsoluteFill>
      <svg width={look.width} height={look.height} style={{position: 'absolute'}}>
        <defs>
          <pattern id={`${id}c`} x={left} y={-dy} width={col} height={col} patternUnits="userSpaceOnUse">
            <path d={`M 0.5 0 V ${col} M 0 0.5 H ${col}`} stroke={line} strokeWidth={1} fill="none" />
          </pattern>
          <pattern id={`${id}m`} x={left - 6} y={-dy - 6} width={col * 2} height={col * 2} patternUnits="userSpaceOnUse">
            <path d="M 0 6.5 H 13 M 6.5 0 V 13" stroke={mark} strokeWidth={1.2} fill="none" />
          </pattern>
        </defs>
        <rect x={left} width={col * 12 + 1} height={look.height} fill={`url(#${id}c)`} />
        <rect x={left - 6} width={col * 12 + 13} height={look.height} fill={`url(#${id}m)`} />
      </svg>
    </AbsoluteFill>
  );
};

const Dots: React.FC<Props & {id: string}> = ({look, t, id}) => {
  const step = 32;
  const mask = 'radial-gradient(ellipse 72% 68% at 50% 45%, black 10%, transparent 85%)';
  return (
    <AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask}}>
      <svg width={look.width} height={look.height}>
        <defs>
          <pattern id={id} x={(t * 5) % step} y={(t * 3) % step} width={step} height={step} patternUnits="userSpaceOnUse">
            <circle cx={step / 2} cy={step / 2} r={2} fill={alpha(look.ink, look.dark ? 0.3 : 0.26)} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Blobs: React.FC<Props> = ({look, tone, t}) => {
  const big = Math.max(look.width, look.height);
  // Faint: a tint the content sits on, not a gradient mesh to look at.
  const s = {night: 0.12, mid: 0.16, day: 0.17}[tone];
  // Pastel cousins of the accent: mixed in oklch, so the hue travels instead of going grey.
  const cousins = [look.accent, `color-mix(in oklch, ${look.accent}, #ff9fb2 55%)`, `color-mix(in oklch, ${look.accent}, #a99bff 55%)`, `color-mix(in oklch, ${look.accent}, #ffd98a 55%)`];
  const blobs = [
    {x: 0.14, y: 0.2, size: 0.62, c: 0, phase: 0},
    {x: 0.88, y: 0.24, size: 0.5, c: 1, phase: 1.7},
    {x: 0.8, y: 0.86, size: 0.66, c: 2, phase: 3.1},
    {x: 0.22, y: 0.9, size: 0.46, c: 3, phase: 4.4},
  ];
  return (
    <AbsoluteFill>
      {blobs.map((b, i) => {
        const size = big * b.size;
        const w = (a: number) => 42 + 12 * Math.sin(t * 0.35 + b.phase + a);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (b.x + 0.04 * Math.sin(t * 0.2 + b.phase)) * look.width - size / 2,
              top: (b.y + 0.04 * Math.cos(t * 0.17 + b.phase)) * look.height - size / 2,
              width: size,
              height: size,
              borderRadius: `${w(0)}% ${100 - w(0)}% ${w(2)}% ${100 - w(2)}% / ${w(1)}% ${w(3)}% ${100 - w(3)}% ${100 - w(1)}%`,
              background: alpha(cousins[b.c], s),
              transform: `rotate(${t * 6 + b.phase * 40}deg)`,
              filter: `blur(${Math.round(size * 0.09)}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Scanlines: React.FC<Props> = ({look, tone, t}) => {
  const roll = ((t / 7) % 1) * 1.4 - 0.4;
  const line = alpha(tone === 'day' ? look.ink : '#000000', {night: 0.32, mid: 0.09, day: 0.05}[tone]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at 50% 45%, ${alpha(look.accent, look.dark ? 0.08 : 0.06)}, transparent 75%)`}} />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${line} 0px, ${line} 1px, transparent 1px, transparent 4px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: roll * look.height,
          height: look.height * 0.3,
          background: `linear-gradient(transparent, ${alpha(look.ink, look.dark ? 0.035 : 0.025)}, transparent)`,
        }}
      />
      <Vignette look={look} tone={tone} strength={{night: 0.6, mid: 0.25, day: 0.1}} />
    </AbsoluteFill>
  );
};

// A 256 px tile of grey noise, drawn once by the browser and then only moved around.
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

const Grain: React.FC<Props> = ({look, tone, frame}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${alpha('#ffffff', {night: 0.05, mid: 0.08, day: 0.5}[tone])}, transparent 70%)`}} />
    <AbsoluteFill
      style={{
        backgroundImage: NOISE,
        backgroundSize: '256px 256px',
        // A new arrangement of the same grain every frame: it dances like film.
        backgroundPosition: `${Math.floor(random(`grain-x-${frame}`) * 256)}px ${Math.floor(random(`grain-y-${frame}`) * 256)}px`,
        opacity: {night: 0.1, mid: 0.09, day: 0.07}[tone],
      }}
    />
    <Vignette look={look} tone={tone} strength={{night: 0.7, mid: 0.3, day: 0.12}} />
  </AbsoluteFill>
);

const Aurora: React.FC<Props> = ({look, t}) => {
  const s = look.dark ? 0.3 : 0.17;
  const ribbons = [
    {y: 0.18, c: look.accent, angle: -12, phase: 0},
    {y: 0.3, c: `color-mix(in oklch, ${look.accent}, #5ee7ff 45%)`, angle: -4, phase: 2},
    {y: 0.1, c: `color-mix(in oklch, ${look.accent}, #a78bfa 45%)`, angle: 8, phase: 4},
  ];
  return (
    <AbsoluteFill>
      {ribbons.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -look.width * 0.3,
            width: look.width * 1.6,
            top: (r.y + 0.04 * Math.sin(t * 0.3 + r.phase)) * look.height - look.height * 0.3,
            height: look.height * 0.6,
            background: `radial-gradient(ellipse 50% 50% at ${50 + 14 * Math.sin(t * 0.21 + r.phase)}% 50%, ${alpha(r.c, s)} 0%, ${alpha(r.c, s * 0.35)} 45%, transparent 75%)`,
            transform: `rotate(${r.angle + 4 * Math.sin(t * 0.15 + r.phase)}deg) scaleY(${0.85 + 0.2 * Math.sin(t * 0.4 + r.phase)})`,
          }}
        />
      ))}
      <Hairlines look={look} step={96} strength={look.dark ? 0.03 : 0.035} />
    </AbsoluteFill>
  );
};

const Beams: React.FC<Props> = ({look, tone, t}) => {
  const light = {night: mix('#ffffff', look.accent, 0.3), mid: '#ffffff', day: look.accent}[tone];
  const a = {night: 0.12, mid: 0.14, day: 0.08}[tone];
  // Wedges of a conic gradient from a point far above the frame, so they fall nearly parallel, swaying slowly.
  const beams = [-21, -12, -5, 3, 10, 19].map((c, i) => ({c: 180 + c + 1.2 * Math.sin(t * 0.35 + i * 1.3), w: 2.6 + 1.3 * ((i * 7) % 3), a: a * (0.55 + 0.45 * Math.abs(Math.sin(t * 0.5 + i)))}));
  const stops = beams.map((b) => `transparent ${b.c - b.w}deg, ${alpha(light, b.a)} ${b.c}deg, transparent ${b.c + b.w}deg`).join(', ');
  const mask = 'linear-gradient(to bottom, black 0%, transparent 88%)';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `conic-gradient(from 0deg at 50% -75%, transparent 0deg, ${stops}, transparent 360deg)`, maskImage: mask, WebkitMaskImage: mask}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 28% at 50% 0%, ${alpha(light, {night: 0.22, mid: 0.2, day: 0.12}[tone])}, transparent 75%)`}} />
      <Vignette look={look} tone={tone} strength={{night: 0.5, mid: 0.2, day: 0.08}} />
    </AbsoluteFill>
  );
};

const Spotlight: React.FC<Props> = ({look, tone, t}) => {
  const breathe = 1 + 0.08 * Math.sin(t * 0.6);
  const light = tone === 'night' ? mix(look.ink, look.accent, 0.15) : '#ffffff';
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse ${55 * breathe}% ${62 * breathe}% at 50% 30%, ${alpha(light, {night: 0.15, mid: 0.22, day: 0.85}[tone])} 0%, transparent 70%)`}}
      />
      <Vignette look={look} tone={tone} strength={{night: 0.75, mid: 0.3, day: 0.14}} />
    </AbsoluteFill>
  );
};

/**
 * The page behind the shots, in the look's colours. `kind` defaults to the style's backdrop:
 * plain, glow (soft accent lights), grid (a swiss column grid), dots, blobs (drifting pastels),
 * scanlines (a CRT), grain (film), aurora (ribbons of light), beams (light from above), spotlight.
 */
export const Backdrop: React.FC<{kind?: BackdropKind}> = ({kind}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = `bd${useId().replace(/:/g, '')}`;
  const props: Props = {look, tone: toneOf(look), t: frame / fps, frame};
  const k = kind ?? look.backdrop;
  return (
    <AbsoluteFill style={{background: look.background, overflow: 'hidden'}}>
      {k === 'glow' ? <Glow {...props} /> : null}
      {k === 'grid' ? <Grid {...props} id={id} /> : null}
      {k === 'dots' ? <Dots {...props} id={id} /> : null}
      {k === 'blobs' ? <Blobs {...props} /> : null}
      {k === 'scanlines' ? <Scanlines {...props} /> : null}
      {k === 'grain' ? <Grain {...props} /> : null}
      {k === 'aurora' ? <Aurora {...props} /> : null}
      {k === 'beams' ? <Beams {...props} /> : null}
      {k === 'spotlight' ? <Spotlight {...props} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** A plain card with a few skeleton lines, to show how a backdrop sits behind content. */
const SampleCard: React.FC = () => {
  const look = useLook();
  const w = look.tall ? look.width * 0.72 : look.format === 'square' ? look.width * 0.66 : look.width * 0.42;
  const h = w * 0.6;
  const bar = (width: number, color: string, height = h * 0.07) => (
    <div style={{width: `${width * 100}%`, height, borderRadius: Math.min(look.radius, height / 2), background: color}} />
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
      <div
        style={{
          width: w,
          height: h,
          boxSizing: 'border-box',
          padding: w * 0.07,
          display: 'flex',
          flexDirection: 'column',
          gap: h * 0.075,
          borderRadius: look.radius,
          background: look.surface,
          boxShadow: look.shadow,
        }}
      >
        {bar(0.18, look.accent, h * 0.05)}
        {bar(0.72, alpha(look.ink, 0.85), h * 0.1)}
        {bar(0.9, alpha(look.ink, 0.12))}
        {bar(0.8, alpha(look.ink, 0.12))}
        {bar(0.55, alpha(look.ink, 0.12))}
      </div>
    </AbsoluteFill>
  );
};

const KINDS: BackdropKind[] = ['plain', 'glow', 'grid', 'dots', 'blobs', 'scanlines', 'grain', 'aurora', 'beams', 'spotlight'];

export const demos: Demo[] = KINDS.map((kind) => ({
  name: `Backdrop: ${kind}`,
  code: `<Backdrop kind="${kind}" />`,
  seconds: 3,
  hero: 45,
  Component: () => (
    <AbsoluteFill>
      <Backdrop kind={kind} />
      <SampleCard />
    </AbsoluteFill>
  ),
}));

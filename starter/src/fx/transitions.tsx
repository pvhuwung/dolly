import React, {useId} from 'react';
import {AbsoluteFill, Easing, random} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import type {TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming} from '@remotion/transitions';
import {blurSlide} from '@remotion/transitions/blur-slide';
import {bookFlip} from '@remotion/transitions/book-flip';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {crossZoom} from '@remotion/transitions/cross-zoom';
import {crosswarp} from '@remotion/transitions/crosswarp';
import {dreamyZoom} from '@remotion/transitions/dreamy-zoom';
import {fade} from '@remotion/transitions/fade';
import {filmBurn} from '@remotion/transitions/film-burn';
import {flip} from '@remotion/transitions/flip';
import {iris} from '@remotion/transitions/iris';
import {linearBlur} from '@remotion/transitions/linear-blur';
import {pushCut} from '@remotion/transitions/push-cut';
import {ripple} from '@remotion/transitions/ripple';
import {slide} from '@remotion/transitions/slide';
import {swap} from '@remotion/transitions/swap';
import {wipe} from '@remotion/transitions/wipe';
import {zoomBlur} from '@remotion/transitions/zoom-blur';
import {Look, StyleName, TransitionName, alpha, makeLook, mix, useLook} from '../look';
import {Backdrop} from './backdrops';
import type {Demo} from './demo';

// How one scene gives way to the next. The video is a list of scenes; `Scenes` plays them in order
// and overlaps each pair by its transition, so the video is shorter than the sum of its scenes:
// get its length from `scenesLength`, and a scene's first frame from `sceneStarts`.
//
//   const SCENES: Scene[] = [
//     {name: 'Hook', seconds: 8, component: Hook},
//     {name: 'Logo', seconds: 5, component: Logo, transition: 'flash'},   // into Logo
//     {name: 'Demo', seconds: 12, component: Demo},                         // the style's own
//   ];
//   <Scenes scenes={SCENES} />
//
// A scene loses its last frames to the transition out of it, so keep anything that must be read
// clear of its final half second.

export type Scene = {
  name: string;
  seconds: number;
  component: React.FC;
  /** The transition INTO this scene. The style's own (look.transition) if not set. */
  transition?: TransitionName;
};

/** Scene lengths are in seconds at this frame rate; transitions are in its frames. */
const FPS = 30;
const framesOf = (seconds: number) => Math.round(seconds * FPS);

/** How many frames each transition overlaps its two scenes. Fixed, so lengths can be computed. */
const FRAMES: Record<TransitionName, number> = {
  cut: 0,
  fade: 12,
  dip: 20,
  slide: 16,
  wipe: 16,
  iris: 20,
  clock: 20,
  flip: 22,
  zoom: 14,
  whip: 10,
  bars: 22,
  flash: 10,
  glitch: 9,
  zoomBlur: 20,
  crossZoom: 24,
  dreamyZoom: 26,
  filmBurn: 30,
  crosswarp: 24,
  ripple: 30,
  swap: 26,
  bookFlip: 26,
  blurSlide: 18,
  linearBlur: 20,
  pushCut: 14,
};

/** The frames a transition overlaps its two scenes by (0 for a cut). */
export const transitionFrames = (name: TransitionName) => FRAMES[name];

// ---------------------------------------------------------------------------------------------
// Custom presentations. Each is rendered twice during a transition: once around the scene that's
// leaving ('exiting'), and once around the one arriving ('entering'), which is drawn on top.

type AnyPresentation = TransitionPresentation<Record<string, unknown>>;
type PresentationProps<P extends Record<string, unknown>> = TransitionPresentationComponentProps<P>;
const presentation = <P extends Record<string, unknown>>(component: React.FC<PresentationProps<P>>, props: P) =>
  ({component, props}) as unknown as AnyPresentation;

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 at the ends of the transition, 1 in the middle. */
const bump = (p: number) => Math.sin(Math.PI * clamp01(p));

/** Fades the leaving scene to a colour, then the arriving one in from it. */
const Dip: React.FC<PresentationProps<{color: string}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const entering = presentationDirection === 'entering';
  const opacity = entering ? clamp01((p - 0.5) * 2) : clamp01(1 - p * 2);
  return (
    <AbsoluteFill style={{background: passedProps.color, opacity: entering && p < 0.5 ? 0 : 1}}>
      <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Forward through the cut: the leaving scene rushes past the camera and blurs, and the arriving one
 * comes in already close and settles back to rest, so the motion never reverses.
 */
const Zoom: React.FC<PresentationProps<{scale: number}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const e = inOut(p);
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{transform: `scale(${1 + 0.35 * passedProps.scale * e})`, filter: `blur(${14 * e}px)`}}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{opacity: clamp01(p / 0.55), transform: `scale(${1 + 0.14 * passedProps.scale * (1 - e)})`, filter: `blur(${10 * (1 - e)}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/** A very fast push with a horizontal motion smear at its peak. */
const Whip: React.FC<PresentationProps<{width: number}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  const id = `whip${useId().replace(/:/g, '')}`;
  const e = inOut(p);
  const x = presentationDirection === 'exiting' ? -e * passedProps.width : (1 - e) * passedProps.width;
  const smear = bump(p) ** 2 * 70 * (passedProps.width / 1920);
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="0" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${smear} 0`} />
        </filter>
      </svg>
      <AbsoluteFill style={{transform: `translateX(${x}px) skewX(${-7 * bump(p)}deg)`, filter: smear > 0.5 ? `url(#${id})` : undefined}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bars of the accent sweep in from the right, covering the leaving scene, then uncover the arriving one. */
const Bars: React.FC<PresentationProps<{colors: string[]}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  if (presentationDirection === 'exiting') return <AbsoluteFill style={{opacity: p < 0.5 ? 1 : 0}}>{children}</AbsoluteFill>;
  const n = passedProps.colors.length;
  const stagger = 0.035;
  const span = 0.5 - (n - 1) * stagger;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{flexDirection: 'column'}}>
        {passedProps.colors.map((color, i) => {
          const cover = inOut(clamp01((p - i * stagger) / span));
          const uncover = inOut(clamp01((p - 0.5 - i * stagger) / span));
          const covering = p < 0.5;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                // Overlap the rows by a pixel so no seam shows between them.
                marginBottom: -1,
                background: color,
                transformOrigin: covering ? '100% 50%' : '0 50%',
                transform: `scaleX(${covering ? cover : 1 - uncover})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A cut hidden in a bright flash, with a little punch-in on the arriving scene. */
const Flash: React.FC<PresentationProps<{color: string}>> = ({children, presentationDirection, presentationProgress: p, passedProps}) => {
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{opacity: p < 0.5 ? 1 : 0, transform: `scale(${1 + 0.03 * p})`}}>{children}</AbsoluteFill>;
  }
  const flash = (1 - Math.abs(p * 2 - 1)) ** 1.6;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1, transform: `scale(${1 + 0.05 * (1 - p)})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: passedProps.color, opacity: flash}} />
    </AbsoluteFill>
  );
};

/**
 * A few frames of digital breakup: horizontal slices torn sideways and the colour channels split.
 * One SVG filter does it (stepped noise displaces the scene in x, then red and cyan are offset).
 */
const Glitch: React.FC<PresentationProps<{width: number}>> = ({children, presentationDirection, presentationProgress: p, presentationDurationInFrames, passedProps}) => {
  const id = `glitch${useId().replace(/:/g, '')}`;
  const f = Math.round(p * presentationDurationInFrames);
  const k = passedProps.width / 1920;
  const entering = presentationDirection === 'entering';
  // Flicker across the cut: a frame of the other scene shows through near the middle.
  const flicker = p > 0.3 && p < 0.7 && random(`glitch-flicker-${f}`) > 0.6;
  const visible = entering ? p >= 0.5 !== flicker : p < 0.5 !== flicker;
  const amount = bump(p) * (0.5 + random(`glitch-amount-${f}`));
  const displace = 140 * k * amount;
  const split = 16 * k * amount;
  const jump = (random(`glitch-jump-${f}`) - 0.5) * 30 * k * amount;
  return (
    <AbsoluteFill style={{opacity: visible ? 1 : 0}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-5%" y="0" width="110%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={`0.00001 ${0.012 + 0.03 * random(`glitch-freq-${f}`)}`} numOctaves={1} seed={f + 1} result="noise" />
          <feComponentTransfer in="noise" result="steps">
            <feFuncR type="discrete" tableValues="0.5 0.5 0.2 0.5 0.5 0.85 0.5 0.35 0.5 0.5 0.7 0.5" />
            <feFuncG type="table" tableValues="0.5 0.5" />
          </feComponentTransfer>
          <feDisplacementMap in="SourceGraphic" in2="steps" scale={displace} xChannelSelector="R" yChannelSelector="G" result="torn" />
          <feColorMatrix in="torn" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx={split} result="redShifted" />
          <feColorMatrix in="torn" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
          <feOffset in="cyan" dx={-split} result="cyanShifted" />
          <feBlend in="redShifted" in2="cyanShifted" mode="screen" />
        </filter>
      </svg>
      {/* Overscan while torn, so the slices pulled sideways never bare the frame's edges. */}
      <AbsoluteFill style={{transform: `translateX(${jump}px) scale(${amount > 0.05 ? 1.08 : 1})`, filter: amount > 0.05 ? `url(#${id})` : undefined}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Every transition, by name

const timing = (name: TransitionName, easing: (t: number) => number = inOut): TransitionTiming =>
  linearTiming({durationInFrames: FRAMES[name], easing});

/**
 * The presentation and timing for a transition, in the look's colours, for a
 * <TransitionSeries.Transition>. Null for a cut.
 */
export const transitionFor = (name: TransitionName, look: Look): {presentation: AnyPresentation; timing: TransitionTiming} | null => {
  const {width, height} = look;
  const linear = (p: AnyPresentation, easing?: (t: number) => number) => ({presentation: p, timing: timing(name, easing)});
  const as = (p: unknown) => p as AnyPresentation;
  switch (name) {
    case 'cut':
      return null;
    case 'fade':
      return linear(as(fade()), Easing.linear);
    case 'dip':
      return linear(presentation(Dip, {color: look.background}), Easing.linear);
    case 'slide':
      return {presentation: as(slide({direction: 'from-right'})), timing: springTiming({config: {damping: 200}, durationInFrames: FRAMES.slide})};
    case 'wipe':
      return linear(as(wipe({direction: 'from-right'})));
    case 'iris':
      return linear(as(iris({width, height})));
    case 'clock':
      return linear(as(clockWipe({width, height})));
    case 'flip':
      return linear(as(flip({direction: 'from-right', perspective: 2000})));
    case 'zoom':
      return linear(presentation(Zoom, {scale: 1}));
    case 'whip':
      return linear(presentation(Whip, {width}), Easing.linear);
    case 'bars':
      return linear(
        presentation(Bars, {colors: [look.accent, mix(look.accent, '#000000', 0.22), mix(look.accent, '#ffffff', 0.25), look.accent, mix(look.accent, '#000000', 0.12)]}),
        Easing.linear,
      );
    case 'flash':
      return linear(presentation(Flash, {color: look.dark ? mix('#ffffff', look.accent, 0.12) : '#ffffff'}), Easing.linear);
    case 'glitch':
      return linear(presentation(Glitch, {width}), Easing.linear);
    case 'zoomBlur':
      return linear(as(zoomBlur({})));
    case 'crossZoom':
      return linear(as(crossZoom({})));
    case 'dreamyZoom':
      return linear(as(dreamyZoom({})));
    case 'filmBurn':
      return linear(as(filmBurn({})));
    case 'crosswarp':
      return linear(as(crosswarp({})));
    case 'ripple':
      return linear(as(ripple({})));
    case 'swap':
      return linear(as(swap({})));
    case 'bookFlip':
      return linear(as(bookFlip({direction: 'from-right'})));
    case 'blurSlide':
      return linear(as(blurSlide({direction: 'from-right'})));
    case 'linearBlur':
      return linear(as(linearBlur({})));
    case 'pushCut':
      return linear(as(pushCut({flashColor: look.dark ? '#ffffff' : look.accent})), Easing.linear);
  }
};

/** The transition into each scene: its own, else the style's. None into the first. */
const transitionsOf = (scenes: Scene[], fallback: TransitionName): TransitionName[] =>
  scenes.map((s, i) => (i === 0 ? 'cut' : (s.transition ?? fallback)));

/** Each scene's first frame in the video, after transitions overlap them. */
export const sceneStarts = (scenes: Scene[], style: StyleName): number[] => {
  const names = transitionsOf(scenes, makeLook(style, 1920, 1080).transition);
  const out: number[] = [];
  let t = 0;
  scenes.forEach((s, i) => {
    t -= FRAMES[names[i]];
    out.push(t);
    t += framesOf(s.seconds);
  });
  return out;
};

/** The video's length in frames, after transitions overlap the scenes. */
export const scenesLength = (scenes: Scene[], style: StyleName) => {
  const starts = sceneStarts(scenes, style);
  return starts[starts.length - 1] + framesOf(scenes[scenes.length - 1].seconds);
};

/**
 * Plays the scenes in order, each overlapping the one before by the transition into it (its own
 * `transition`, else the style's). Wrap it in the LookProvider whose style you pass to
 * `scenesLength` and `sceneStarts`, so the lengths match what plays.
 */
export const Scenes: React.FC<{scenes: Scene[]}> = ({scenes}) => {
  const look = useLook();
  const names = transitionsOf(scenes, look.transition);
  return (
    <TransitionSeries>
      {scenes.map((s, i) => {
        const t = transitionFor(names[i], look);
        return (
          <React.Fragment key={s.name}>
            {t ? <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} /> : null}
            <TransitionSeries.Sequence name={s.name} durationInFrames={framesOf(s.seconds)}>
              <s.component />
            </TransitionSeries.Sequence>
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery: a page with a card, then a full-bleed accent page

const PanelA: React.FC = () => {
  const look = useLook();
  const w = look.tall ? look.width * 0.7 : look.format === 'square' ? look.width * 0.62 : look.width * 0.36;
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
        <div
          style={{
            width: w,
            height: w * 0.62,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: look.radius,
            background: look.surface,
            boxShadow: look.shadow,
            ...look.headline,
            color: look.ink,
            fontSize: look.size * 1.1,
          }}
        >
          Scene A
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PanelB: React.FC = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{background: look.accent, alignItems: 'center', justifyContent: 'center', paddingBottom: look.height * 0.08}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${alpha(look.onAccent, 0.18)} 1.6px, transparent 1.6px)`,
          backgroundSize: '30px 30px',
        }}
      />
      <div style={{...look.headline, color: look.onAccent, fontSize: look.size * 1.9}}>Scene B</div>
    </AbsoluteFill>
  );
};

const HOLD = 24;

const TransitionDemo: React.FC<{name: TransitionName}> = ({name}) => {
  const look = useLook();
  const t = transitionFor(name, look);
  const d = FRAMES[name];
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={HOLD + d}>
        <PanelA />
      </TransitionSeries.Sequence>
      {t ? <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} /> : null}
      <TransitionSeries.Sequence durationInFrames={HOLD + d}>
        <PanelB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export const demos: Demo[] = (Object.keys(FRAMES) as TransitionName[]).map((name) => ({
  name: `Transition: ${name} (${FRAMES[name]} frames)`,
  code: `{..., transition: '${name}'}`,
  seconds: (HOLD * 2 + FRAMES[name]) / FPS,
  // 40% in: far enough to show the effect, before a flip turns edge-on.
  hero: HOLD + Math.round(FRAMES[name] * 0.4),
  Component: () => <TransitionDemo name={name} />,
}));

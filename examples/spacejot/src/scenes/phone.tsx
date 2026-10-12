import React from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Footage, Layer, Rect, Screen, Stage, ease, useShot} from '../kit';
import {useLook} from '../look';
import {Tap} from '../parts';
import {PHONE, px} from './takes';

// The pieces every phone scene is made of: the phone playing cuts of a take, the real pictures as
// square cards beside it, and where they sit in each format.

/** From scene frame `from`, play the take from `at` seconds, `speed` times as fast. */
export type Cut = {from: number; at: number; speed?: number};

/** A take as a run of cuts, each lasting until the next one starts. */
export const Feed: React.FC<{src: string; cuts: Cut[]; crop?: Rect}> = ({src, cuts, crop}) => {
  const {durationInFrames} = useVideoConfig();
  return (
    <>
      {cuts.map((c, i) => (
        <Sequence key={c.from} from={c.from} durationInFrames={(cuts[i + 1]?.from ?? durationInFrames) - c.from}>
          <Footage src={src} at={c.at} speed={c.speed} crop={crop ? px(crop) : undefined} />
        </Sequence>
      ))}
    </>
  );
};

/** The phone, playing `cuts` of a take, with a Tap at each `taps` point. */
export const Phone: React.FC<{src: string; cuts: Cut[]; taps?: {x: number; y: number; at: number}[]}> = ({src, cuts, taps = []}) => (
  <Screen frame="phone" width={PHONE.width + 24} height={PHONE.height + 24} background="#ffffff" glare={0.35}>
    <Feed src={src} cuts={cuts} />
    {taps.map((t) => (
      <Tap key={t.at} {...t} />
    ))}
  </Screen>
);

/** A real picture (or a crop of a take) as a square card, lifting in at `at` and out at `until`. */
export const Card: React.FC<{
  width: number;
  height: number;
  at?: number;
  until?: number;
  children: React.ReactNode;
  label?: string;
}> = ({width, height, at = 0, until, children, label}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 24});
  const out = until === undefined ? 0 : spring({frame: frame - until, fps, config: {damping: 200}, durationInFrames: 14});
  const v = t - out;
  if (v <= 0) return null;
  return (
    <div style={{width, height, opacity: v, transform: `translateY(${(1 - t) * 40}px)`}}>
      <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: look.radius, boxShadow: look.shadow, background: look.surface}}>
        {children}
        {label ? <Pill style={{left: 18, bottom: 18}}>{label}</Pill> : null}
      </div>
    </div>
  );
};

/** A small label on a picture, the way the app labels Before and After. */
export const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dark?: boolean}> = ({children, style, dark = true}) => {
  const look = useLook();
  return (
    <div
      style={{
        position: 'absolute',
        padding: '8px 16px',
        borderRadius: 999,
        background: dark ? 'rgba(20, 20, 22, 0.62)' : 'rgba(255, 255, 255, 0.86)',
        color: dark ? '#fff' : '#111',
        fontFamily: look.fonts.body,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pictures cross-fading in one card: each from its `at` frame. */
export const Swap: React.FC<{items: {at: number; node: React.ReactNode}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        const t = i === 0 ? 1 : spring({frame: frame - it.at, fps, config: {damping: 200}, durationInFrames: 16});
        return t <= 0 ? null : (
          <AbsoluteFill key={it.at} style={{opacity: t}}>
            {it.node}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/**
 * A shot of the phone with a card beside it: the camera arrives with a short push and keeps
 * drifting closer. Tall frames show the phone alone unless `tallCard` asks for the card above it.
 */
export const TwoUp: React.FC<{
  phone: React.ReactNode;
  card?: React.ReactNode;
  tallCard?: boolean;
  /** Open on the phone alone, centred, and pan to both at this frame (when the card has something to show). */
  reveal?: number;
  children?: React.ReactNode;
}> = ({phone, card, tallCard, reveal, children}) => {
  const look = useLook();
  const layout = useTwoUp();
  const pan = reveal === undefined || layout.tall ? [] : ([[0, {x: layout.phone.x}], [reveal, {x: layout.phone.x}], [reveal + 32, {x: 0}, ease.inOut]] as const);
  const camera = useShot([[0, {dolly: -140}], [34, {dolly: 0}, ease.out], ...pan], {dolly: 40});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={2200} font={look.fonts.body}>
        {card && (!layout.tall || tallCard) ? <Layer {...layout.card}>{card}</Layer> : null}
        <Layer {...layout.phone}>{phone}</Layer>
      </Stage>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Where the phone and the card go. Wide frames: the card on the left, the phone on the right, both
 * under the caption band. Tall frames: the phone alone, larger, centred; the card goes above it as
 * a strip only where a scene asks for it.
 */
export const useTwoUp = () => {
  const look = useLook();
  const tall = look.tall;
  const top = look.band;
  // Tall frames let the phone run into the platform's bottom band a little: it is a picture, not text.
  const bottom = tall ? look.height - look.aim.bottom * 0.5 : look.height - look.safe.bottom;
  const mid = (top + bottom) / 2 - look.height / 2;
  const phoneScale = tall ? Math.min(1.3, (bottom - top - 30) / (PHONE.height + 24)) : Math.min(0.86, (bottom - top + 30) / (PHONE.height + 24));
  const phone = tall ? {x: 0, y: mid + 20, z: 0, scale: phoneScale} : {x: 500, y: mid + 14, z: 0, scale: phoneScale};
  const cardWidth = tall ? look.width - look.safe.left - look.safe.right : 980;
  const card = tall ? {x: 0, y: mid, z: 60} : {x: -300, y: mid + 14, z: 0};
  return {tall, phone, card, cardWidth};
};

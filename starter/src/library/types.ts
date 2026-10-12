import type React from 'react';
import type {TransitionPresentation, TransitionTiming} from '@remotion/transitions';
import type {Look} from '../look';

// The shapes every library item is built on. An item is a folder in library/<category>/ holding one
// .tsx file of the same name and an item.json; scripts/library.mjs reads them all and writes
// library/index.ts and the catalog.

/**
 * One sample in the gallery (Gallery.tsx): an item on its own, a few seconds long, labelled with
 * the code that makes it. Every item exports its samples as `demos`.
 */
export type Demo = {
  /** A few words, shown on the label. */
  name: string;
  /** The line of code that makes it, shown on the label. */
  code: string;
  seconds: number;
  /** The frame of the sample that shows the effect best: the gallery sheet's still. */
  hero: number;
  /** False when the sample draws its own backdrop (a whole scene, like the templates). */
  backdrop?: false;
  /** Renders the sample over the style's backdrop, filling the frame, in any format. */
  Component: React.FC;
};

/**
 * How dark the page is, which sets how strong shading and light can be: `night` (near-black),
 * `mid` (a coloured page, like bold's accent) or `day`.
 */
export type Tone = 'night' | 'mid' | 'day';

/** What <Backdrop> hands every backdrop item: the look, its tone, the time and a unique id for SVG defs. */
export type BackdropProps = {look: Look; tone: Tone; t: number; frame: number; id: string};

export type AnyPresentation = TransitionPresentation<Record<string, unknown>>;

/** A transition item: how long it overlaps its two scenes, and how it draws in a look. */
export type TransitionDef = {
  /** Frames it overlaps the two scenes by. Fixed, so a video's length can be computed. */
  frames: number;
  /** Its presentation and timing in the look's colours, for a <TransitionSeries.Transition>. Null for a cut. */
  make: (look: Look) => {presentation: AnyPresentation; timing: TransitionTiming} | null;
};

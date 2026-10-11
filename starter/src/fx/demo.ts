import type React from 'react';

/**
 * One sample in the gallery (Gallery.tsx): an effect on its own, a few seconds long, labelled with
 * the code that makes it. Every fx file exports its samples as `demos`.
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

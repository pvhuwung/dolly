import {loadFont} from '@remotion/google-fonts/Inter';

// Everything a video needs to look like it belongs to your product. Change these first.

export const {fontFamily} = loadFont('normal', {weights: ['400', '600', '800'], subsets: ['latin']});

export const brand = {
  name: 'Your Product',
  tagline: 'Ship faster with agents',
  accent: '#7c5cff',
  ink: '#f5f5f7',
  dim: 'rgba(245, 245, 247, 0.6)',
  /** Deep, slightly coloured black: pure #000 looks like a dead projector on stage. */
  background: 'radial-gradient(120% 90% at 50% 35%, #1b1530 0%, #0b0a12 55%, #050507 100%)',
};

/** A placeholder mark: a ring and a play triangle. Paste your own logo's SVG here (filled paths, no strokes). */
export const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="#7c5cff" fill-rule="evenodd" d="M50 5 A45 45 0 1 1 49.99 5 Z M50 19 A31 31 0 1 0 50.01 19 Z"/>
  <path fill="#f5f5f7" d="M42 35 L67 50 L42 65 Z"/>
</svg>`;

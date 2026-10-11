import {loadFont} from '@remotion/google-fonts/Inter';

// Everything that makes the video look like your product. Change these first. Your logo goes in
// public/logo.svg (any SVG or PNG works; update `logo` if the name differs).

export const {fontFamily} = loadFont('normal', {weights: ['400', '600', '800'], subsets: ['latin']});

export const brand = {
  name: 'Your Product',
  tagline: 'Ship faster with agents',
  logo: 'logo.svg',
  accent: '#7c5cff',
  ink: '#f5f5f7',
  dim: 'rgba(245, 245, 247, 0.6)',
  /** A deep, slightly coloured black: pure #000 looks like a dead projector. */
  background: 'radial-gradient(120% 90% at 50% 35%, #1b1530 0%, #0b0a12 55%, #050507 100%)',
};

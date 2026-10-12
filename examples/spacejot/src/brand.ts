import {loadFont} from '@remotion/google-fonts/Geist';
import type {Fonts, StyleName} from './look';

// Geist: spacejot.ai's and the app's heading face.
const {fontFamily: geist} = loadFont('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});

// The product: change these first. The style (look.tsx) turns them into the video's look.
//
// `accent` and `alert` come from the product's website. `fonts` is only for a product with its own
// type: load it from @remotion/google-fonts here and name it, and every style uses it in place of
// its own. For example:
//
//   import {loadFont} from '@remotion/google-fonts/FunnelDisplay';
//   const {fontFamily: funnel} = loadFont('normal', {weights: ['600'], subsets: ['latin']});
//   ...  fonts: {headline: funnel},
//
// This starter is cut from Termary's launch video: the editorial style is termary.com's look.
export type Brand = {
  name: string;
  url: string;
  /** In public/. */
  logo: string;
  /** The brand colour, as #rrggbb. */
  accent: string;
  /** The colour of the moment the story turns on (here: an agent waiting for you), as #rrggbb. */
  alert: string;
  /** editorial, midnight, bold, swiss, soft, terminal, cinema or paper: see STYLES in look.tsx. */
  style: StyleName;
  fonts: Partial<Fonts>;
};

export const brand: Brand = {
  name: 'Spacejot',
  url: 'spacejot.ai',
  logo: 'spacejot-mark.png',
  accent: '#0070f3',
  alert: '#e11d48',
  style: 'swiss',
  fonts: {headline: geist, body: geist},
};

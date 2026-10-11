import type React from 'react';
import {loadFont as loadSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadSerif} from '@remotion/google-fonts/SourceSerif4';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

// The product's own look, taken from its website: change these first. This starter is cut from
// Termary's launch video, so it uses termary.com's palette and type: a sans for UI, a serif for
// headlines (with an italic accent phrase), a mono for code, and solid colours only.
export const {fontFamily} = loadSans('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
export const {fontFamily: serifFamily} = loadSerif('normal', {weights: ['500', '600'], subsets: ['latin']});
loadSerif('italic', {weights: ['500', '600'], subsets: ['latin']});
export const {fontFamily: monoFamily} = loadMono('normal', {weights: ['400', '600'], subsets: ['latin']});
/** The headline face, used by Caption. */
export const headlineFamily = serifFamily;

export const brand = {
  name: 'Termary',
  url: 'termary.com',
  logo: 'logo.png',
  accent: '#0f9e7f',
  accentDeep: '#0c7d64',
  accentSoft: 'rgba(15, 158, 127, 0.12)',
  /** The colour of the moment the story turns on (here: an agent waiting for you). */
  alert: '#d97706',
  alertSoft: 'rgba(217, 119, 6, 0.12)',
  ink: '#141310',
  dim: '#484641',
  border: 'rgba(20, 19, 16, 0.07)',
  background: '#fbfbf9',
  card: '#ffffff',
};

/** How a headline's accent phrase differs from the rest. termary.com sets it in italic green. */
export const accentStyle: React.CSSProperties = {fontStyle: 'italic', color: brand.accent};

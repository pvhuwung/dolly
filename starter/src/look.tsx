import React, {createContext, useContext, useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadDMSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadGeist} from '@remotion/google-fonts/Geist';
import {loadFont as loadGeistMono} from '@remotion/google-fonts/GeistMono';
import {loadFont as loadIBMPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {loadFont as loadInstrumentSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadNunito} from '@remotion/google-fonts/Nunito';
import {loadFont as loadSourceSerif} from '@remotion/google-fonts/SourceSerif4';
import {brand} from './brand';

// How the video looks and moves (its STYLE), and the frame it's made for (its FORMAT).
//
// A style takes the brand's accent (and its fonts, if brand.ts names them) and decides the rest:
// the page colour, the headline type, how the accent phrase is set, the backdrop, how text comes in
// and how one scene gives way to the next. Every part reads it with useLook(), so `brand.style`
// restyles the whole video, and `--props='{"style":"midnight"}'` renders it in another one.
//
// A format is the frame: its size, and the parts a platform covers with its own buttons. The look
// knows which format it's in from the composition's size, so one scene renders in all of them.

export type StyleName = 'editorial' | 'midnight' | 'bold' | 'swiss' | 'soft' | 'terminal' | 'cinema';
export type FormatName = 'landscape' | 'vertical' | 'square' | 'portrait';

/** How words come in. Implemented by `Kinetic` (fx/text.tsx). */
export type TextEffect = 'rise' | 'reveal' | 'blur' | 'pop' | 'type' | 'letters' | 'slide' | 'scramble' | 'fade';
/** What's drawn behind the accent phrase. Implemented by `Kinetic` and `Mark` (fx/text.tsx). */
export type MarkKind = 'none' | 'marker' | 'block' | 'pill' | 'underline' | 'circle' | 'strike' | 'box';
/** The page behind the shots. Implemented by `Backdrop` (fx/backdrops.tsx). */
export type BackdropKind = 'plain' | 'glow' | 'grid' | 'dots' | 'blobs' | 'scanlines' | 'grain' | 'aurora' | 'beams' | 'spotlight';
/** How one scene gives way to the next. Implemented by `Scenes` (fx/transitions.tsx). */
export type TransitionName =
  | 'cut'
  | 'fade'
  | 'dip'
  | 'slide'
  | 'wipe'
  | 'iris'
  | 'clock'
  | 'flip'
  | 'zoom'
  | 'whip'
  | 'bars'
  | 'flash'
  | 'glitch'
  | 'pushCut'
  // Shaders from @remotion/transitions. They render in `remotion render`; the Studio preview needs
  // Chrome 148+ with chrome://flags/#canvas-draw-element on.
  | 'zoomBlur'
  | 'crossZoom'
  | 'dreamyZoom'
  | 'filmBurn'
  | 'crosswarp'
  | 'ripple'
  | 'swap'
  | 'bookFlip'
  | 'blurSlide'
  | 'linearBlur';

export type Fonts = {headline: string; body: string; mono: string};

export type Look = {
  style: StyleName;
  dark: boolean;

  /** The page. */
  background: string;
  /** Cards and chips on the page. `ink` reads on it in every style. */
  surface: string;
  ink: string;
  dim: string;
  /** Hairlines and borders. */
  line: string;
  /** The brand colour, for fills. */
  accent: string;
  /** The accent, readable as text on the background. */
  accentText: string;
  /** A tint of the accent, for fills behind text. */
  accentSoft: string;
  /** Text on an accent fill. */
  onAccent: string;
  /** The colour of the moment the story turns on (something waiting, failing, urgent). */
  alert: string;

  fonts: Fonts;
  /** The headline face, weight, tracking and colour. Size comes from `size`. */
  headline: React.CSSProperties;
  /** How the accent phrase differs from the rest of a headline. Readable on the page on its own. */
  emphasis: React.CSSProperties;
  /** What's drawn behind the accent phrase as it lands. */
  mark: MarkKind;
  eyebrow: React.CSSProperties;
  /** Put before every eyebrow ("$ " in terminal). */
  eyebrowPrefix: string;

  radius: number;
  /** The box-shadow of a card on the page. */
  shadow: string;
  backdrop: BackdropKind;

  /** How headlines come in. */
  text: TextEffect;
  /** Between scenes. */
  transition: TransitionName;
  /** Remotion spring config: bouncy styles have a low damping. */
  spring: {damping?: number; stiffness?: number; mass?: number};
  /** Multiplies how long things take: below 1 snappy, above 1 slow. */
  pace: number;

  format: FormatName;
  width: number;
  height: number;
  /** Taller than wide. */
  tall: boolean;
  /** Keep text and key UI inside these insets: platforms put their own buttons outside them. */
  safe: {top: number; right: number; bottom: number; left: number};
  /** Px at the top of the frame kept for the caption. Frame subjects below it. */
  band: number;
  /** The headline size in px, for this format and style. */
  size: number;
  /** Pass to focusOn so the subject sits between the caption band and the platform's bottom band. */
  aim: {top: number; bottom: number};
};

// ---------------------------------------------------------------------------------------------
// Formats

export const FORMATS: Record<
  FormatName,
  {width: number; height: number; for: string; safe: Look['safe']; band: number; size: number; aimBottom: number}
> = {
  landscape: {width: 1920, height: 1080, for: 'YouTube, X, LinkedIn, a website', safe: {top: 64, right: 110, bottom: 64, left: 110}, band: 230, size: 62, aimBottom: 0},
  // Reels, TikTok and Shorts lay their own UI over the video: the account and search at the top,
  // the caption and sound at the bottom, and like/comment/share up the right edge from about
  // halfway down. Text inside x 120-960, y 288-1248 is clear of all three. Footage may run under
  // the bottom band (`aimBottom`), but nothing that has to be read.
  vertical: {width: 1080, height: 1920, for: 'Reels, TikTok, YouTube Shorts, Stories', safe: {top: 288, right: 120, bottom: 672, left: 120}, band: 660, size: 84, aimBottom: 500},
  square: {width: 1080, height: 1080, for: 'feeds on X, LinkedIn and Instagram', safe: {top: 64, right: 72, bottom: 72, left: 72}, band: 285, size: 58, aimBottom: 40},
  // The Instagram profile grid shows the middle 3:4 of a 4:5 post: keep the subject central.
  portrait: {width: 1080, height: 1350, for: 'Instagram and LinkedIn feeds (4:5)', safe: {top: 72, right: 72, bottom: 96, left: 72}, band: 330, size: 66, aimBottom: 60},
};

/** The format nearest a frame's aspect ratio. */
export const formatOf = (width: number, height: number): FormatName => {
  const aspect = width / height;
  let best: FormatName = 'landscape';
  for (const name of Object.keys(FORMATS) as FormatName[]) {
    const f = FORMATS[name];
    if (Math.abs(Math.log(f.width / f.height / aspect)) < Math.abs(Math.log(FORMATS[best].width / FORMATS[best].height / aspect))) best = name;
  }
  return best;
};

// ---------------------------------------------------------------------------------------------
// Colour helpers, for any CSS colour

/** `color` at opacity `a` (0 to 1). */
export const alpha = (color: string, a: number) => `color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent)`;
/** `a` mixed with `b`, `t` (0 to 1) of the way to `b`. */
export const mix = (a: string, b: string, t: number) => `color-mix(in srgb, ${a}, ${b} ${Math.round(t * 100)}%)`;

/** Relative luminance of a #rgb or #rrggbb colour, 0 (black) to 1 (white). */
const luminance = (hex: string) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** White or near-black, whichever reads on `hex`. Saturated mid colours get white. */
const textOn = (hex: string) => (luminance(hex) > 0.4 ? '#0b0b0c' : '#ffffff');
/** The accent, nudged until it reads as text on a light or dark page. */
const readable = (accent: string, dark: boolean) => {
  const l = luminance(accent);
  if (dark) return l < 0.12 ? mix(accent, '#ffffff', 0.45) : l < 0.2 ? mix(accent, '#ffffff', 0.2) : accent;
  return l > 0.45 ? mix(accent, '#000000', 0.45) : l > 0.3 ? mix(accent, '#000000', 0.25) : accent;
};

// ---------------------------------------------------------------------------------------------
// Fonts: loaded the first time a style is used, so a video only fetches the ones it shows

const once = <T,>(load: () => T) => {
  let v: T | undefined;
  return () => (v ??= load());
};
const subsets = ['latin' as const];
const FONT = {
  dmSans: once(() => loadDMSans('normal', {weights: ['400', '500', '600', '700'], subsets}).fontFamily),
  sourceSerif: once(() => {
    loadSourceSerif('italic', {weights: ['500', '600'], subsets});
    return loadSourceSerif('normal', {weights: ['500', '600'], subsets}).fontFamily;
  }),
  jetbrains: once(() => loadJetBrainsMono('normal', {weights: ['400', '600', '700'], subsets}).fontFamily),
  geist: once(() => loadGeist('normal', {weights: ['400', '500', '600', '700'], subsets}).fontFamily),
  geistMono: once(() => loadGeistMono('normal', {weights: ['400', '500', '600'], subsets}).fontFamily),
  bricolage: once(() => loadBricolage('normal', {weights: ['500', '700', '800'], subsets}).fontFamily),
  interTight: once(() => loadInterTight('normal', {weights: ['400', '500', '600', '700', '800'], subsets}).fontFamily),
  plexMono: once(() => loadIBMPlexMono('normal', {weights: ['400', '500', '600'], subsets}).fontFamily),
  nunito: once(() => loadNunito('normal', {weights: ['500', '700', '800', '900'], subsets}).fontFamily),
  instrument: once(() => {
    loadInstrumentSerif('italic', {weights: ['400'], subsets});
    return loadInstrumentSerif('normal', {weights: ['400'], subsets}).fontFamily;
  }),
};

// ---------------------------------------------------------------------------------------------
// Styles

type StyleDef = Omit<Look, 'style' | 'format' | 'width' | 'height' | 'tall' | 'safe' | 'band' | 'size' | 'aim'> & {
  /** Multiplies the format's headline size. */
  scale: number;
};

/** The styles, each made from the brand's accent and alert colours and its fonts. */
export const STYLES: Record<StyleName, {about: string; make: (b: {accent: string; alert: string; fonts: Partial<Fonts>}) => StyleDef}> = {
  editorial: {
    about: 'Light paper, a serif headline with an italic accent phrase, hard cuts. Calm and expensive: the Termary video.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.sourceSerif(), body: FONT.dmSans(), mono: FONT.jetbrains(), ...fonts};
      const accentText = readable(accent, false);
      return {
        dark: false,
        background: '#fbfbf9',
        surface: '#ffffff',
        ink: '#141310',
        dim: '#5b5953',
        line: 'rgba(20, 19, 16, 0.08)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.12),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#141310'},
        emphasis: {fontStyle: 'italic', color: accentText},
        mark: 'none',
        eyebrow: {fontFamily: f.body, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: mix(accentText, '#000000', 0.2)},
        eyebrowPrefix: '',
        radius: 16,
        shadow: '0 26px 60px rgba(20, 19, 16, 0.16), 0 6px 18px rgba(20, 19, 16, 0.06)',
        backdrop: 'plain',
        text: 'rise',
        transition: 'cut',
        spring: {damping: 200},
        pace: 1,
        scale: 1,
      };
    },
  },
  midnight: {
    about: 'Near-black with the accent glowing behind the product, a tight sans, words blurring into focus. Developer tools and AI.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.geist(), body: FONT.geist(), mono: FONT.geistMono(), ...fonts};
      const accentText = readable(accent, true);
      return {
        dark: true,
        background: '#07080b',
        surface: '#111318',
        ink: '#f5f6f8',
        dim: '#9097a3',
        line: 'rgba(255, 255, 255, 0.09)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.18),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#f5f6f8'},
        emphasis: {color: accentText, textShadow: `0 0 32px ${alpha(accent, 0.6)}`},
        mark: 'none',
        eyebrow: {fontFamily: f.mono, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: accentText},
        eyebrowPrefix: '',
        radius: 18,
        shadow: `0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 120px ${alpha(accent, 0.18)}`,
        backdrop: 'glow',
        text: 'blur',
        transition: 'zoom',
        spring: {damping: 200},
        pace: 1,
        scale: 1,
      };
    },
  },
  bold: {
    about: 'The accent as the page, huge heavy type, the accent phrase knocked out of a block, springy pops. Social feeds and Reels.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.bricolage(), body: FONT.bricolage(), mono: FONT.jetbrains(), ...fonts};
      const ink = textOn(accent);
      return {
        dark: ink === '#ffffff',
        background: accent,
        // Cards are a deeper (or, on a light accent, paler) shade of the page, so the ink reads on both.
        surface: ink === '#ffffff' ? mix(accent, '#000000', 0.24) : mix(accent, '#ffffff', 0.5),
        ink,
        dim: alpha(ink, 0.72),
        line: alpha(ink, 0.18),
        // The page is the brand colour, so fills and accent text use the ink, and the accent phrase is
        // knocked out of an ink block in the brand colour.
        accent: ink,
        accentText: ink,
        accentSoft: alpha(ink, 0.14),
        onAccent: accent,
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98, color: ink},
        // Readable alone; Kinetic's block mark turns it into the brand colour on an ink block.
        emphasis: {color: ink},
        mark: 'block',
        eyebrow: {fontFamily: f.body, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: ink},
        eyebrowPrefix: '',
        radius: 24,
        shadow: '0 30px 70px rgba(0, 0, 0, 0.28), 0 8px 20px rgba(0, 0, 0, 0.12)',
        backdrop: 'plain',
        text: 'pop',
        transition: 'slide',
        spring: {damping: 13, stiffness: 160},
        pace: 0.85,
        scale: 1.2,
      };
    },
  },
  swiss: {
    about: 'White, black type on a column grid, the accent used sparingly, square cards, hard wipes. Clean and precise.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.interTight(), body: FONT.interTight(), mono: FONT.plexMono(), ...fonts};
      const accentText = readable(accent, false);
      return {
        dark: false,
        background: '#fbfbfa',
        surface: '#ffffff',
        ink: '#0a0a0a',
        dim: '#6b6b6b',
        line: 'rgba(0, 0, 0, 0.12)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.1),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1, color: '#0a0a0a'},
        emphasis: {color: accentText},
        mark: 'none',
        eyebrow: {fontFamily: f.mono, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0a0a0a'},
        eyebrowPrefix: '■ ',
        radius: 0,
        shadow: '0 0 0 1px rgba(0, 0, 0, 0.14), 0 24px 48px rgba(0, 0, 0, 0.08)',
        backdrop: 'grid',
        text: 'reveal',
        transition: 'wipe',
        spring: {damping: 200, stiffness: 140},
        pace: 0.9,
        scale: 1.05,
      };
    },
  },
  soft: {
    about: 'A pastel tint of the accent, rounded type, the accent phrase on a soft pill, bouncy pops and round reveals. Friendly consumer apps.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.nunito(), body: FONT.nunito(), mono: FONT.jetbrains(), ...fonts};
      const accentText = readable(accent, false);
      return {
        dark: false,
        background: mix('#fffdf9', accent, 0.1),
        surface: '#ffffff',
        ink: '#1f1d2b',
        dim: '#6e6a7c',
        line: 'rgba(31, 29, 43, 0.08)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.2),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.08, color: '#1f1d2b'},
        emphasis: {color: mix(accentText, '#000000', 0.15)},
        mark: 'pill',
        eyebrow: {fontFamily: f.body, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentText},
        eyebrowPrefix: '',
        radius: 30,
        shadow: `0 24px 60px ${alpha(accent, 0.22)}, 0 6px 16px rgba(31, 29, 43, 0.06)`,
        backdrop: 'blobs',
        text: 'pop',
        transition: 'iris',
        spring: {damping: 11, stiffness: 120},
        pace: 1,
        scale: 1.05,
      };
    },
  },
  terminal: {
    about: 'A dark terminal: everything in mono, headlines typed out with a cursor, scanlines, glitch cuts. Developer tools and CLIs.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.jetbrains(), body: FONT.jetbrains(), mono: FONT.jetbrains(), ...fonts};
      const accentText = readable(accent, true);
      return {
        dark: true,
        background: '#0a0c0b',
        surface: '#121614',
        ink: '#e8efe9',
        dim: '#8a968e',
        line: 'rgba(232, 239, 233, 0.1)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.16),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#e8efe9'},
        emphasis: {color: accentText},
        mark: 'none',
        eyebrow: {fontFamily: f.mono, fontWeight: 400, letterSpacing: '0.02em', color: '#8a968e'},
        eyebrowPrefix: '$ ',
        radius: 10,
        shadow: '0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(232, 239, 233, 0.08)',
        backdrop: 'scanlines',
        text: 'type',
        transition: 'glitch',
        spring: {damping: 200, stiffness: 200},
        pace: 0.9,
        scale: 0.85,
      };
    },
  },
  cinema: {
    about: 'A trailer: black, a big quiet serif, film grain, slow fades through black. Teasers and launch announcements.',
    make: ({accent, alert, fonts}) => {
      const f = {headline: FONT.instrument(), body: FONT.interTight(), mono: FONT.jetbrains(), ...fonts};
      const accentText = readable(accent, true);
      return {
        dark: true,
        background: '#070706',
        surface: '#121210',
        ink: '#f2efe8',
        dim: '#8d8a83',
        line: 'rgba(242, 239, 232, 0.1)',
        accent,
        accentText,
        accentSoft: alpha(accent, 0.16),
        onAccent: textOn(accent),
        alert,
        fonts: f,
        headline: {fontFamily: f.headline, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.02, color: '#f2efe8'},
        emphasis: {fontStyle: 'italic', color: accentText},
        mark: 'none',
        eyebrow: {fontFamily: f.body, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8d8a83'},
        eyebrowPrefix: '',
        radius: 6,
        shadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
        backdrop: 'grain',
        text: 'blur',
        transition: 'dip',
        spring: {damping: 200, stiffness: 60},
        pace: 1.35,
        scale: 1.25,
      };
    },
  },
};

export const STYLE_NAMES = Object.keys(STYLES) as StyleName[];

// ---------------------------------------------------------------------------------------------
// The look of the frame being rendered

/** Builds the look for a style at a frame size. Most code wants useLook() instead. */
export const makeLook = (style: StyleName, width: number, height: number): Look => {
  const {scale, ...def} = STYLES[style].make({accent: brand.accent, alert: brand.alert, fonts: brand.fonts});
  const format = formatOf(width, height);
  const f = FORMATS[format];
  // Formats are designed at their own size; scale them to the frame (a 4K landscape, say).
  const k = width / f.width;
  const safe = {top: f.safe.top * k, right: f.safe.right * k, bottom: f.safe.bottom * k, left: f.safe.left * k};
  const size = Math.round(f.size * k * scale);
  const band = Math.round(f.band * k * Math.max(1, scale * 0.95));
  return {...def, style, format, width, height, tall: height > width * 1.1, safe, band, size, aim: {top: band, bottom: f.aimBottom * k}};
};

const StyleContext = createContext<StyleName | null>(null);

/** Sets the style for everything inside it. The default is `brand.style`. */
export const LookProvider: React.FC<{style?: StyleName; children: React.ReactNode}> = ({style, children}) => (
  <StyleContext.Provider value={style ?? null}>{children}</StyleContext.Provider>
);

/** The look of the frame being rendered: its style's colours, type and motion, and its format. */
export const useLook = (): Look => {
  const style = useContext(StyleContext) ?? brand.style;
  const {width, height} = useVideoConfig();
  return useMemo(() => makeLook(style, width, height), [style, width, height]);
};

/** Picks a value by the frame's shape: `tall` for vertical and 4:5, `square`, else `wide`. */
export const byShape = <T,>(look: Look, v: {wide: T; tall: T; square?: T}): T =>
  look.format === 'square' ? (v.square ?? v.tall) : look.format === 'landscape' ? v.wide : v.tall;

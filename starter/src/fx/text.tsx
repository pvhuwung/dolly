import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Look, MarkKind, TextEffect, alpha, useLook} from '../look';
import type {Demo} from './demo';

// Kinetic type: headlines that come in word by word (or letter by letter) the style's way, with the
// accent phrase marked as it lands. Colours, type and springiness come from useLook(), so the same
// line changes with the style. Everything is a function of the frame.

/** The space between words, in em. Marks reach across it so a phrase reads as one stroke. */
const GAP = 0.28;

/** Default timing per effect, in frames at pace 1. `stagger` is between words, or between characters for `char` effects. */
const TIMING: Record<TextEffect, {stagger: number; dur: number; unit: 'word' | 'char'}> = {
  rise: {stagger: 6, dur: 32, unit: 'word'},
  reveal: {stagger: 5, dur: 26, unit: 'word'},
  blur: {stagger: 6, dur: 30, unit: 'word'},
  pop: {stagger: 5, dur: 30, unit: 'word'},
  type: {stagger: 1.6, dur: 0, unit: 'char'},
  letters: {stagger: 1.5, dur: 22, unit: 'char'},
  slide: {stagger: 5, dur: 26, unit: 'word'},
  scramble: {stagger: 1.2, dur: 12, unit: 'char'},
  fade: {stagger: 5, dur: 20, unit: 'word'},
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const drawEase = Easing.bezier(0.45, 0, 0.2, 1);
const outEase = Easing.bezier(0.16, 1, 0.3, 1);

/** The headline's line height as a number, for placing lines and marks against the baseline. */
const lineHeightOf = (s: React.CSSProperties) => (typeof s.lineHeight === 'number' ? s.lineHeight : 1.1);

/**
 * True when the style sets the accent phrase in the page's own colour (bold: knocked out of a
 * block). Without that block, the phrase falls back to the headline's colour so it stays visible.
 */
const knocksOut = (look: Look) => look.emphasis.color === look.background;

// ---------------------------------------------------------------------------------------------
// Marks

/**
 * One mark at progress `p` (0 to 1), absolutely placed over its parent (a word or a phrase, which
 * must be `position: relative`). `join` stretches it across the gap to the next word. `children` is
 * the text again, for `block`, which knocks it out of the fill.
 */
const MarkLayer: React.FC<{kind: MarkKind; p: number; color?: string; join?: boolean; lh: number; children?: React.ReactNode}> = ({
  kind,
  p,
  color,
  join = false,
  lh,
  children,
}) => {
  const look = useLook();
  if (kind === 'none' || p <= 0) return null;
  const c = color ?? look.accent;
  const reach = (pad: number) => `${-(pad + (join ? GAP : 0))}em`;
  // Roughly where the baseline sits in a line box of this line height, in em from its top.
  const baseline = lh / 2 + 0.3;
  const base: React.CSSProperties = {position: 'absolute', pointerEvents: 'none'};
  switch (kind) {
    case 'marker':
      return (
        <span
          style={{
            ...base,
            left: '-0.06em',
            right: reach(0.06),
            top: `${baseline - 0.56}em`,
            height: '0.7em',
            zIndex: -1,
            borderRadius: '0.12em 0.04em 0.16em 0.06em',
            background: knocksOut(look) ? 'rgba(0, 0, 0, 0.22)' : alpha(c, look.dark ? 0.55 : 0.38),
            transformOrigin: '0 50%',
            transform: `skewX(-8deg) scaleX(${p})`,
          }}
        />
      );
    case 'block':
      return (
        <span
          style={{
            ...base,
            left: '-0.12em',
            right: reach(0.12),
            top: '-0.06em',
            bottom: '-0.08em',
            padding: '0.06em 0 0 0.12em',
            zIndex: 1,
            whiteSpace: 'nowrap',
            borderRadius: '0.06em',
            background: c,
            color: look.onAccent,
            textShadow: 'none',
            clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          }}
        >
          {children}
        </span>
      );
    case 'underline':
    case 'strike':
      return (
        <span
          style={{
            ...base,
            left: kind === 'strike' ? '-0.04em' : 0,
            right: reach(kind === 'strike' ? 0.04 : 0),
            top: `${kind === 'strike' ? baseline - 0.3 : baseline + 0.1}em`,
            height: kind === 'strike' ? '0.075em' : '0.07em',
            zIndex: 1,
            borderRadius: '0.04em',
            background: kind === 'strike' ? (color ?? look.alert) : c,
            transformOrigin: '0 50%',
            transform: `scaleX(${p})`,
          }}
        />
      );
    case 'pill':
      return (
        <span
          style={{
            ...base,
            left: '-0.32em',
            right: '-0.32em',
            top: '-0.02em',
            bottom: '-0.04em',
            zIndex: -1,
            borderRadius: 999,
            background: color ? alpha(color, 0.2) : look.accentSoft,
            opacity: clamp01(p * 1.6),
            transform: `scale(${0.85 + 0.15 * p})`,
          }}
        />
      );
    case 'circle': {
      // A loose, slightly tilted ring, swept on clockwise from the upper left.
      const mask = `conic-gradient(from -70deg, #000 ${p * 360}deg, transparent ${p * 360}deg)`;
      return (
        <span
          style={{
            ...base,
            left: '-0.3em',
            right: '-0.3em',
            top: '-0.16em',
            bottom: '-0.2em',
            zIndex: 1,
            border: `0.055em solid ${c}`,
            borderRadius: '48% 52% 46% 54% / 56% 46% 54% 44%',
            transform: 'rotate(-2.5deg)',
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      );
    }
    case 'box': {
      // Four sides drawn one after another, clockwise from the top left.
      const side = (k: number) => clamp01(p * 4 - k);
      const t = '0.05em';
      return (
        <span style={{...base, left: '-0.22em', right: '-0.22em', top: '-0.1em', bottom: '-0.12em', zIndex: 1}}>
          <span style={{...base, left: 0, top: 0, width: '100%', height: t, background: c, transformOrigin: '0 50%', transform: `scaleX(${side(0)})`}} />
          <span style={{...base, right: 0, top: 0, width: t, height: '100%', background: c, transformOrigin: '50% 0', transform: `scaleY(${side(1)})`}} />
          <span style={{...base, right: 0, bottom: 0, width: '100%', height: t, background: c, transformOrigin: '100% 50%', transform: `scaleX(${side(2)})`}} />
          <span style={{...base, left: 0, bottom: 0, width: t, height: '100%', background: c, transformOrigin: '50% 100%', transform: `scaleY(${side(3)})`}} />
        </span>
      );
    }
    default:
      return null;
  }
};

/** Marks that draw around a whole phrase rather than word by word. */
const WHOLE: MarkKind[] = ['pill', 'circle', 'box'];

/** How far along a mark is `frames` after it starts: springy for the pill, an even draw for the rest. */
const markProgress = (kind: MarkKind, frame: number, at: number, frames: number, fps: number, look: Look) =>
  kind === 'pill'
    ? spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames)})
    : interpolate(frame, [at, at + frames * (kind === 'circle' ? 1.4 : 1)], [0, 1], {easing: drawEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/**
 * Draws a mark on any inline content at frame `at`: a highlighter `marker`, a knocked-out `block`,
 * a soft `pill`, an `underline`, a hand-drawn `circle`, a `strike` or a `box`. Kinetic marks its
 * accent phrase the same way; use this for words it doesn't set (a label, a number, a name).
 *
 *   <Mark kind="circle" at={40}>3×</Mark>
 */
export const Mark: React.FC<{kind: MarkKind; at: number; color?: string; children: React.ReactNode}> = ({kind, at, color, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const p = markProgress(kind, frame, at, 18 * look.pace, fps, look);
  return (
    <span style={{position: 'relative', display: 'inline-block', isolation: 'isolate', whiteSpace: 'nowrap'}}>
      <MarkLayer kind={kind} p={p} color={color} lh={lineHeightOf(look.headline)}>
        {children}
      </MarkLayer>
      {children}
    </span>
  );
};

// ---------------------------------------------------------------------------------------------
// Kinetic

type Word = {text: string; accent: boolean; index: number; first: number};

/** The words of the line and the accent phrase, with each word's first character's index (spaces count). */
const wordsOf = (text: string, accent?: string) => {
  const out: Word[] = [];
  let chars = 0;
  for (const [phrase, isAccent] of [
    [text, false],
    [accent ?? '', true],
  ] as const) {
    for (const w of phrase.split(' ').filter(Boolean)) {
      out.push({text: w, accent: isAccent, index: out.length, first: chars});
      chars += w.length + 1;
    }
  }
  return {words: out, chars: Math.max(0, chars - 1)};
};

/** A zero-width caret after the last character typed: a bar, or a block in the terminal style. */
const Caret: React.FC<{visible: boolean; block: boolean; color: string}> = ({visible, block, color}) => (
  <span style={{display: 'inline-block', position: 'relative', width: 0, height: 0}}>
    <span
      style={{
        position: 'absolute',
        left: '0.05em',
        bottom: '-0.16em',
        width: block ? '0.55em' : '0.07em',
        height: '0.95em',
        background: color,
        opacity: visible ? (block ? 0.85 : 1) : 0,
      }}
    />
  </span>
);

// Glyphs a scrambling letter flickers through: no very wide or very narrow ones.
const UPPER = 'ABCDEFGHKNOPRSUVXYZ0123456789#+=?';
const LOWER = 'abcdeghknopqsuvxyz0123456789#+=?';

/**
 * A headline that comes in the style's way (`look.text`), word by word or letter by letter, with an
 * optional accent phrase after it, set the style's way (`look.emphasis`) and marked as it lands
 * (`look.mark`). `effect` and `mark` override the style.
 *
 *   <Kinetic text="Approve it" accent="from your phone." start={10} exit={80} />
 *
 * Effects: `rise` (swings up out of the baseline), `reveal` (slides up from behind a line), `blur`
 * (comes into focus), `pop` (springs up; bouncy in bouncy styles), `type` (typed, with a caret),
 * `letters` (letter by letter), `slide` (glides in from the left), `scramble` (decodes from random
 * glyphs), `fade`. `stagger` is frames between words, or between characters for type, letters and
 * scramble. `exit` is the frame it starts to leave. Keep a line to 2-7 words: it wraps to fit.
 */
export const Kinetic: React.FC<{
  text: string;
  accent?: string;
  effect?: TextEffect;
  start?: number;
  stagger?: number;
  exit?: number;
  mark?: MarkKind;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({text, accent, effect, start = 0, stagger, exit, mark, align = 'left', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const fx = effect ?? look.text;
  const kind = mark ?? look.mark;
  const timing = TIMING[fx];
  const step = (stagger ?? timing.stagger) * look.pace;
  const dur = timing.dur * look.pace;
  const base: React.CSSProperties = {...look.headline, fontSize: look.size, ...style};
  const lh = lineHeightOf(base);
  const {words, chars} = wordsOf(text, accent);
  const accents = words.filter((w) => w.accent);
  const charEffect = timing.unit === 'char';

  // The accent phrase in the style's emphasis. A highlighter or block mark keeps the headline's
  // colour under it (the block knocks it out in onAccent), and so does a knocked-out emphasis
  // that has no block to sit on.
  const keepInk = kind === 'marker' || kind === 'block' || knocksOut(look);
  const emphasis: React.CSSProperties = keepInk ? {...look.emphasis, color: base.color, textShadow: undefined} : look.emphasis;

  const ramp = (at: number, frames: number) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.max(1, Math.round(frames))});
  const exitStep = charEffect ? 2 : Math.ceil(step / 2);
  const out = (order: number) =>
    exit === undefined ? 0 : spring({frame: frame - exit - order * exitStep, fps, config: {damping: 200}, durationInFrames: Math.round(14 * look.pace)});

  // Typing: how many characters (spaces included) are out, and when the last one lands.
  const typed = fx === 'type' ? (frame < start ? 0 : Math.min(chars, Math.floor((frame - start) / step) + 1)) : chars;
  const doneTyping = start + chars * step;
  const scrambleSeed = text.length * 31 + (accent?.length ?? 0);

  // When everything has landed: the accent's mark draws from there.
  const lastWord = words[words.length - 1];
  const landed =
    fx === 'type'
      ? doneTyping + 2
      : fx === 'scramble'
        ? start + dur + (chars - 1) * step
        : charEffect
          ? start + (chars - 1) * step + dur * 0.7
          : start + (lastWord?.index ?? 0) * step + dur * 0.7;
  const accentChars = accents.reduce((sum, w) => sum + w.text.length, 0);
  const markFrames = Math.min(30, Math.max(12, (10 + accentChars * 0.5) * look.pace));
  const drawn = interpolate(frame, [landed, landed + markFrames], [0, 1], {easing: drawEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Word marks sweep across the phrase one word after another, each for its share of the letters.
  const totalSpan = accents.reduce((sum, w, i) => sum + w.text.length + (i < accents.length - 1 ? 1 : 0), 0);
  const segment = (w: Word) => {
    let before = 0;
    for (const a of accents) {
      if (a === w) break;
      before += a.text.length + 1;
    }
    const own = w.text.length + (w === accents[accents.length - 1] ? 0 : 1);
    return clamp01((drawn * totalSpan - before) / own);
  };

  const caretColor = knocksOut(look) ? (base.color as string) : look.accentText;
  const clipBox: React.CSSProperties = {
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'top',
    padding: '0.12em 0.08em 0.18em 0.08em',
    margin: '-0.12em -0.08em -0.18em -0.08em',
  };

  const renderWord = (w: Word) => {
    const o = out(w.index);
    const t = charEffect ? 1 : ramp(start + w.index * step, dur);
    const tc = clamp01(t);
    const outer: React.CSSProperties = {position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...(w.accent ? emphasis : {})};
    let inner: React.CSSProperties | null = null;
    let content: React.ReactNode = w.text;

    switch (fx) {
      case 'rise':
        outer.transformOrigin = '50% 100%';
        outer.transform = `translateY(${(1 - t) * 0.35 - o * 0.2}em) rotateX(${(t - 1) * 80 + o * 60}deg)`;
        outer.opacity = clamp01(t - o);
        break;
      case 'reveal':
        inner = {display: 'inline-block', transform: `translateY(${(1 - tc) * 130 - o * 130}%)`};
        outer.opacity = 1 - o;
        break;
      case 'slide':
        outer.transform = `translateX(${(tc - 1) * 0.7 + o * 0.5}em)`;
        outer.opacity = clamp01(tc * 1.4) * (1 - o);
        break;
      case 'blur':
        outer.filter = `blur(${(1 - tc) * 16 + o * 10}px)`;
        outer.transform = `translateY(${-o * 0.15}em) scale(${1 + 0.18 * (1 - tc)})`;
        outer.opacity = tc * (1 - o);
        break;
      case 'pop':
        outer.transformOrigin = '50% 70%';
        outer.transform = `translateY(${(1 - t) * 0.15 - o * 0.15}em) scale(${(0.4 + 0.6 * t) * (1 - 0.3 * o)})`;
        outer.opacity = clamp01(t * 2) * (1 - o);
        break;
      case 'fade':
        outer.transform = `translateY(${-o * 0.2}em)`;
        outer.opacity = tc * (1 - o);
        break;
      case 'letters':
        outer.transform = `translateY(${-o * 0.25}em)`;
        outer.opacity = 1 - o;
        content = [...w.text].map((ch, k) => {
          const tl = clamp01(ramp(start + (w.first + k) * step, dur));
          return (
            <span key={k} style={{display: 'inline-block', transform: `translateY(${(1 - tl) * 0.5}em)`, opacity: tl}}>
              {ch}
            </span>
          );
        });
        break;
      case 'scramble':
        outer.transform = `translateY(${-o * 0.25}em)`;
        outer.opacity = 1 - o;
        // Once its last letter settles, the word is plain text again (and kerned).
        if (frame < start + dur + (w.first + w.text.length - 1) * step) {
          content = [...w.text].map((ch, k) => {
            const j = w.first + k;
            const appears = start + j * step * 0.35;
            const settles = start + dur + j * step;
            if (frame >= settles) return <span key={k}>{ch}</span>;
            const set = ch === ch.toLowerCase() ? LOWER : UPPER;
            const glyph = set[Math.floor(random(`scramble-${scrambleSeed}-${j}-${Math.floor(frame / 2)}`) * set.length)];
            // The real letter holds its place; a smaller mono glyph flickers over it.
            return (
              <span key={k} style={{position: 'relative'}}>
                <span style={{opacity: 0}}>{ch}</span>
                {frame >= appears ? (
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      transform: 'translateX(-50%)',
                      fontFamily: look.fonts.mono,
                      fontStyle: 'normal',
                      fontWeight: 500,
                      fontSize: '0.78em',
                      letterSpacing: 0,
                      opacity: 0.55,
                    }}
                  >
                    {glyph}
                  </span>
                ) : null}
              </span>
            );
          });
        }
        break;
      case 'type': {
        // A block caret is wider than the gap between words: keep room for it after the last one.
        if (look.style === 'terminal' && w === lastWord) outer.marginRight = '0.62em';
        outer.transform = `translateY(${-o * 0.25}em)`;
        outer.opacity = 1 - o;
        const shown = Math.max(0, Math.min(w.text.length, typed - w.first));
        // The caret sits in the word being typed (or the last one, once done).
        const caretHere = typed >= w.first && typed <= w.first + w.text.length;
        // It blinks before typing starts, holds while typing, then blinks twice and goes, so it never
        // sits on whatever comes next.
        const typing = frame >= start && typed < chars;
        const caretOn =
          o === 0 && (typing || (typed < chars ? Math.floor(frame / 16) % 2 === 0 : frame < doneTyping + 48 && Math.floor((frame - doneTyping) / 16) % 2 === 0));
        content = (
          <>
            {w.text.slice(0, shown)}
            {caretHere ? <Caret visible={caretOn} block={look.style === 'terminal'} color={caretColor} /> : null}
            <span style={{visibility: 'hidden'}}>{w.text.slice(shown)}</span>
          </>
        );
        break;
      }
    }

    const wordMark = w.accent && !WHOLE.includes(kind) ? kind : 'none';
    const join = w !== accents[accents.length - 1];
    if (w.accent && kind === 'strike') outer.opacity = (outer.opacity === undefined ? 1 : Number(outer.opacity)) * (1 - 0.4 * drawn);
    const body = inner ? (
      <span style={clipBox}>
        <span style={inner}>{content}</span>
      </span>
    ) : (
      content
    );
    return (
      <span key={w.index} style={outer}>
        {wordMark === 'marker' ? <MarkLayer kind="marker" p={segment(w)} join={join} lh={lh} /> : null}
        {body}
        {wordMark !== 'none' && wordMark !== 'marker' ? (
          <MarkLayer kind={wordMark} p={segment(w)} join={join} lh={lh}>
            {w.text}
          </MarkLayer>
        ) : null}
      </span>
    );
  };

  const justify = align === 'center' ? 'center' : 'flex-start';
  // Blocks and pills reach above and below their line: open the lines up a little for them.
  const rowGap = kind === 'block' || kind === 'pill' ? '0.12em' : 0;
  const row: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', columnGap: `${GAP}em`, rowGap, justifyContent: justify};
  const firstAccentOut = accents.length ? out(accents[0].index) : 0;
  return (
    <div style={{...base, ...row, position: 'relative', isolation: 'isolate', perspective: 900, textAlign: align}}>
      {words.filter((w) => !w.accent).map(renderWord)}
      {accents.length ? (
        <span
          style={{
            ...row,
            position: 'relative',
            // A pill, ring or box reaches out past the phrase: give it room from its neighbours.
            ...(WHOLE.includes(kind) ? {opacity: 1 - firstAccentOut, marginInline: '0.24em'} : {}),
          }}
        >
          {WHOLE.includes(kind) ? <MarkLayer kind={kind} p={markProgress(kind, frame, landed, markFrames, fps, look)} lh={lh} /> : null}
          {accents.map(renderWord)}
        </span>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Cycle and Counter

/**
 * One slot whose word changes every `every` frames: the old word slides up and out, the new one
 * slides up in, and the slot's width eases between them so the rest of the line moves smoothly.
 * Set in the accent's emphasis. Put it after a Kinetic line in a baseline-aligned row:
 *
 *   <div style={{display: 'flex', alignItems: 'baseline', columnGap: '0.28em'}}>
 *     <Kinetic text="Videos that feel" /> <Cycle words={['fast.', 'polished.', 'yours.']} start={30} />
 *   </div>
 */
export const Cycle: React.FC<{words: string[]; every?: number; start?: number; style?: React.CSSProperties}> = ({words, every, start = 0, style}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const period = every ?? Math.round(45 * look.pace);
  const swap = Math.round(16 * look.pace);
  const emphasis = knocksOut(look) ? {...look.emphasis, color: look.headline.color} : look.emphasis;
  const k = Math.max(0, Math.floor((frame - start) / period));
  const local = interpolate(frame - start - k * period, [0, swap], [0, 1], {easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const now = words[k % words.length];
  const before = k > 0 ? words[(k - 1) % words.length] : null;
  // Two invisible spacers, sized with calc-size() to a share of each word's own width: together they
  // make the slot's width ease from one word to the next.
  const spacer = (word: string, share: number) => (
    <span style={{display: 'inline-block', overflow: 'hidden', visibility: 'hidden', whiteSpace: 'nowrap', width: `calc-size(max-content, size * ${share})`}}>
      {word}
    </span>
  );
  const word = (w: string, y: number, opacity: number) => (
    <span style={{position: 'absolute', left: 0, top: '0.12em', whiteSpace: 'nowrap', transform: `translateY(${y}%)`, opacity}}>{w}</span>
  );
  return (
    <span
      style={{
        ...look.headline,
        fontSize: look.size,
        ...emphasis,
        ...style,
        position: 'relative',
        display: 'inline-flex',
        overflowY: 'clip',
        padding: '0.12em 0 0.18em',
        margin: '-0.12em 0 -0.18em',
      }}
    >
      {before ? spacer(before, 1 - local) : null}
      {spacer(now, before ? local : 1)}
      {before ? word(before, -local * 110, 1 - local) : null}
      {word(now, (1 - local) * 110, frame < start ? 0 : before ? local : 1)}
    </span>
  );
};

/**
 * A number counting up (or down) from `from` to `to` over `frames`, easing out, with thousands
 * separators and tabular figures. Its width is the final number's, so nothing around it moves.
 *
 *   <Counter to={12480} suffix="+" start={20} />
 */
export const Counter: React.FC<{
  to: number;
  from?: number;
  start?: number;
  frames?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({to, from = 0, start = 0, frames, decimals = 0, prefix = '', suffix = '', style}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const length = frames ?? Math.round(50 * look.pace);
  const p = interpolate(frame, [start, start + length], [0, 1], {easing: outEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fmt = (v: number) => v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  const widest = [fmt(from), fmt(to)].sort((a, b) => b.length - a.length)[0];
  return (
    <span style={{...look.headline, fontSize: look.size, ...style, display: 'inline-flex', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
      <span style={{whiteSpace: 'pre'}}>{prefix}</span>
      <span style={{display: 'inline-grid'}}>
        <span style={{gridArea: '1 / 1', visibility: 'hidden'}}>{widest}</span>
        <span style={{gridArea: '1 / 1', textAlign: 'right'}}>{fmt(from + (to - from) * p)}</span>
      </span>
      <span style={{whiteSpace: 'pre'}}>{suffix}</span>
    </span>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

/** Centres a sample in the safe area, clear of the gallery's label at the bottom. */
const Center: React.FC<{children: React.ReactNode}> = ({children}) => {
  const look = useLook();
  return (
    <AbsoluteFill
      style={{
        padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom + 170}px ${look.safe.left}px`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** The demos' headline size and measure: big, and narrow enough to break into two lines on a wide frame. */
const useDemoType = () => {
  const look = useLook();
  return {fontSize: Math.round(look.size * (look.format === 'landscape' ? 1.7 : 1.35)), maxWidth: look.tall ? undefined : look.width * 0.72};
};

const Headline: React.FC<{text: string; accent: string; effect?: TextEffect; mark?: MarkKind; exit: number}> = ({text, accent, effect, mark, exit}) => (
  <Center>
    <Kinetic text={text} accent={accent} effect={effect} mark={mark} start={6} exit={exit} align="center" style={useDemoType()} />
  </Center>
);

const EFFECTS: [TextEffect, string, string, number][] = [
  ['rise', 'Ship the video', 'in an afternoon.', 92],
  ['reveal', 'Every pixel', 'in its place.', 92],
  ['blur', 'Out of the noise,', 'into focus.', 92],
  ['pop', 'Big news.', "It's live.", 92],
  ['type', 'Write the video', 'as code.', 30],
  ['letters', 'Made frame', 'by frame.', 92],
  ['slide', 'From idea', 'to launch.', 92],
  ['scramble', 'Decode', 'the signal.', 24],
  ['fade', 'Quiet,', 'and confident.', 92],
];

const MARKS: [MarkKind, string, string][] = [
  ['marker', 'The one thing', 'worth remembering.'],
  ['block', 'Make it', 'unmissable.'],
  ['pill', 'Friendly by', 'default.'],
  ['underline', 'Say it once,', 'clearly.'],
  ['circle', 'Find the', 'one detail.'],
  ['strike', 'No more', 'manual edits.'],
  ['box', 'Point at', 'what matters.'],
];

const CycleDemo: React.FC = () => {
  const type = useDemoType();
  return (
    <Center>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: '0.28em', fontSize: type.fontSize}}>
        <Kinetic text="Videos that feel" start={6} style={{fontSize: type.fontSize}} />
        <Cycle words={['fast.', 'polished.', 'yours.']} start={20} every={36} style={{fontSize: type.fontSize}} />
      </div>
    </Center>
  );
};

const CounterDemo: React.FC = () => {
  const look = useLook();
  return (
    <Center>
      <Counter to={12480} suffix="+" start={6} style={{fontSize: Math.round(look.size * 2.6), lineHeight: 1}} />
      <Kinetic text="videos rendered this week" effect="fade" start={14} align="center" style={{fontFamily: look.fonts.body, fontSize: Math.max(44, Math.round(look.size * 0.6)), fontWeight: 500, letterSpacing: 0, color: look.dim}} />
    </Center>
  );
};

export const demos: Demo[] = [
  ...EFFECTS.map(([effect, text, accent, hero]) => ({
    name: `Text: ${effect}`,
    code: `<Kinetic text="…" accent="…" effect="${effect}" />`,
    seconds: 4,
    hero,
    Component: () => <Headline text={text} accent={accent} effect={effect} exit={106} />,
  })),
  ...MARKS.map(([mark, text, accent]) => ({
    name: `Mark: ${mark}`,
    code: `<Kinetic text="…" accent="…" mark="${mark}" />`,
    seconds: 4.5,
    hero: 110,
    Component: () => <Headline text={text} accent={accent} mark={mark} exit={120} />,
  })),
  {name: 'Cycle', code: `<Cycle words={['fast.', 'polished.', 'yours.']} />`, seconds: 4.5, hero: 75, Component: CycleDemo},
  {name: 'Counter', code: '<Counter to={12480} suffix="+" />', seconds: 3, hero: 80, Component: CounterDemo},
];

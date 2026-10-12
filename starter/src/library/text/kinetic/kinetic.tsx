import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MarkKind, TextEffect, useLook} from '../../../look';
import {GAP, MarkLayer, WHOLE, clamp01, drawEase, knocksOut, lineHeightOf, markProgress} from '../_shared';

// Kinetic type: headlines that come in word by word (or letter by letter) the style's way, with the
// accent phrase marked as it lands. Colours, type and springiness come from useLook(), so the same
// line changes with the style. Everything is a function of the frame.

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
  /** The words, before the accent phrase. */
  text: string;
  /** The phrase set in the style's accent way. */
  accent?: string;
  /** How the words come in; the style's own if not set. */
  effect?: TextEffect;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames between one word (or letter) starting and the next; the effect's own if not set. */
  stagger?: number;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
  /** What's drawn behind the accent phrase; the style's own if not set. */
  mark?: MarkKind;
  /** Left-aligned or centred (default left). */
  align?: 'left' | 'center';
  /** CSS merged over the headline style: font size, colour, max width. */
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

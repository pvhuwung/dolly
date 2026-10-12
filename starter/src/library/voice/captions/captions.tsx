import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {alpha, useLook} from '../../../look';
import {spread} from '../_shared';
import {type VoiceLine, type Word, voiceWords} from '../voiceover/voiceover';

/**
 * Words in groups of up to `max` words and `chars` letters. A group never runs past the end of a
 * sentence, a clause or a line, and a long clause splits into even groups ("We shipped it" / "on a
 * Friday."), never a long one and a stray word.
 */
const chunk = (lines: Word[][], max: number, chars: number): Word[][] => {
  const out: Word[][] = [];
  const width = (ws: Word[]) => ws.reduce((s, w) => s + w.text.length + 1, -1);
  for (const words of lines) {
    // Clauses: end at . ! ? always, and at , ; : — when the clause already has two words.
    const clauses: Word[][] = [];
    let cur: Word[] = [];
    for (const w of words) {
      cur.push(w);
      if (/[.!?]["”’)]*$/.test(w.text) || (/[,;:—]$/.test(w.text) && cur.length >= 2)) {
        clauses.push(cur);
        cur = [];
      }
    }
    if (cur.length) clauses.push(cur);
    for (const clause of clauses) {
      const n = Math.max(Math.ceil(clause.length / max), Math.ceil(width(clause) / chars));
      for (let k = 0; k < n; k++) {
        const part = clause.slice(Math.round((k * clause.length) / n), Math.round(((k + 1) * clause.length) / n));
        if (part.length) out.push(part);
      }
    }
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// Captions

/**
 * Captions for someone speaking, the way Reels and TikTok set them: a few words at a time, big and
 * bold, the word being said marked. Give it a voiceover (`lines`, with the Voiceover's `start` and
 * `gap`), or `text` spoken over `seconds` from `start`, or exact `words` in frames.
 *
 * `variant`: `karaoke` (a box in the accent jumps to the word being said), `pop` (each word pops
 * in on its beat), `line` (a plain subtitle). On light styles they sit on a plate in the ink
 * colour; on dark ones they're white with an outline, to read over any footage. They sit low in
 * the format's safe area (above the platform's caption band in 9:16), or in the `middle`.
 *
 *   <Captions lines={tutorial} start={15} variant="karaoke" />
 */
export const Captions: React.FC<{
  /** A voiceover's lines to caption; give it the Voiceover's start and gap. */
  lines?: VoiceLine[];
  /** Not used by Captions, which shows every line; Waveform takes the same prop. */
  only?: number[];
  /** Words to caption without a voiceover, spoken over `seconds` from `start`. */
  text?: string;
  /** Seconds `text` is spoken over (default 3). */
  seconds?: number;
  /** Exact words with their start and end frames, instead of lines or text. */
  words?: Word[];
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Seconds between the voiceover's lines, as given to Voiceover (default 0.3). */
  gap?: number;
  /** karaoke (a box jumps to the word being said), pop (words pop in on their beat) or line (a plain subtitle); default karaoke. */
  variant?: 'karaoke' | 'pop' | 'line';
  /** The most words on screen at once (default 3 in tall frames, 5 in wide ones). */
  max?: number;
  /** Low in the safe area (bottom, the default) or in the middle. */
  position?: 'bottom' | 'middle';
  /** Its font size in px; sized to the frame if not set. */
  size?: number;
  /** A plate behind the words: the default on light styles. */
  plate?: boolean;
}> = ({lines, text, seconds = 3, words, start = 0, gap = 0.3, variant = 'karaoke', max, position = 'bottom', size, plate}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fontSize = size ?? Math.round(look.size * (look.tall ? 0.92 : 1.05));
  const inner = look.width - look.safe.left - look.safe.right;
  const chunks = useMemo(() => {
    const timed = words ? [words] : lines ? voiceWords(lines, {start, gap, fps}) : [spread(text ?? '', start, start + Math.round(seconds * fps))];
    return chunk(timed, max ?? (look.tall ? 3 : 5), Math.min(32, Math.floor(inner / (fontSize * 0.62))));
  }, [words, lines, text, seconds, start, gap, fps, max, look.tall, inner, fontSize]);

  // The group on screen: from its first word until the next group starts (or a beat after it ends).
  const i = chunks.findIndex((c, k) => frame >= c[0].start && frame < Math.min(chunks[k + 1]?.[0].start ?? Infinity, c[c.length - 1].end + 14));
  if (i < 0) return null;
  const group = chunks[i];
  const enter = spring({frame: frame - group[0].start, fps, config: {damping: 200}, durationInFrames: 8});
  const onPlate = plate ?? !look.dark;
  const ink = onPlate ? look.ink : '#ffffff';
  const marked = look.accentText !== look.ink ? look.accentText : '#ffd84d';
  const outline: React.CSSProperties = onPlate
    ? {}
    : {WebkitTextStroke: `${Math.max(3, Math.round(fontSize * 0.1))}px rgba(0, 0, 0, 0.82)`, paintOrder: 'stroke fill', textShadow: '0 6px 24px rgba(0, 0, 0, 0.45)'};

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: look.safe.left,
          right: look.safe.right,
          display: 'flex',
          justifyContent: 'center',
          ...(position === 'middle'
            ? {top: 0, bottom: 0, alignItems: 'center'}
            : {bottom: look.tall ? look.safe.bottom + 24 : look.safe.bottom + Math.round(look.height * 0.08)}),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.12em',
            rowGap: '0.08em',
            maxWidth: inner,
            padding: onPlate ? '0.22em 0.5em' : 0,
            borderRadius: onPlate ? Math.min(look.radius + 6, fontSize * 0.45) : 0,
            background: onPlate ? alpha(look.surface, 0.94) : 'transparent',
            boxShadow: onPlate ? look.shadow : 'none',
            fontFamily: look.fonts.body,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.18,
            letterSpacing: '-0.01em',
            color: ink,
            // Groups follow each other with no gap, so a new one starts part-visible: no blank frame.
            opacity: 0.35 + 0.65 * enter,
            transform: `translateY(${(1 - enter) * 14}px) scale(${0.96 + 0.04 * enter})`,
          }}
        >
          {group.map((w, k) => {
            const now = frame >= w.start && (frame < w.end || k === group.length - 1);
            const said = frame >= w.start;
            const hit = spring({frame: frame - w.start, fps, config: look.spring, durationInFrames: 10});
            const box = variant === 'karaoke' && now;
            return (
              <span
                key={k}
                style={{
                  padding: '0 0.16em',
                  borderRadius: Math.min(look.radius, fontSize * 0.22),
                  background: box ? look.accent : 'transparent',
                  color: box ? look.onAccent : variant === 'pop' && now ? marked : ink,
                  ...(box ? {} : outline),
                  // Popping words take their place as they're said, so the plate grows with the line.
                  display: variant === 'pop' && !said ? 'none' : 'inline-block',
                  transform: variant === 'pop' ? `scale(${said ? 0.7 + 0.3 * hit : 0.7})` : box ? `scale(${0.92 + 0.08 * hit})` : undefined,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

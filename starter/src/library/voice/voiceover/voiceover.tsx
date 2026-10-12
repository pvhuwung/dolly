import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {spread} from '../_shared';

// Voice: a voiceover made with scripts/voice.mjs, captions timed to it, and a waveform that moves
// with it. For narrated tutorials and explainers, podcast clips, anything with someone speaking.
//
//   npm run voice -- script.txt tutorial        # public/voice/tutorial/*.wav and src/voice/tutorial.ts
//
//   import {tutorial} from './voice/tutorial';
//   <Voiceover lines={tutorial} start={15} />
//   <Captions lines={tutorial} start={15} />
//
// Times are frames from the start of the scene they're in. Give Voiceover and Captions the same
// `start` and `gap` so the words land with the voice; voiceTiming() says when each line plays, so
// a scene can cut on a line or be as long as its voiceover.

/** One line of a voiceover: what scripts/voice.mjs writes into src/voice/<name>.ts. */
export type VoiceLine = {
  text: string;
  /** The WAV, in public/. */
  src: string;
  seconds: number;
  /** Where the speech starts and ends inside the file, in seconds (the rest is breath). */
  speech?: [number, number];
};

/** A word with its time on screen, in frames. */
export type Word = {text: string; start: number; end: number};

type Timing = {start?: number; gap?: number; fps?: number};

/** When each line plays, in frames: one after another from `start`, `gap` seconds apart. */
export const voiceTiming = (lines: VoiceLine[], {start = 0, gap = 0.3, fps = 30}: Timing = {}) => {
  const out: {start: number; end: number}[] = [];
  let t = start;
  for (const line of lines) {
    const from = Math.round(t);
    out.push({start: from, end: from + Math.round(line.seconds * fps)});
    t = from + Math.round(line.seconds * fps) + gap * fps;
  }
  return out;
};

/** The frame the last line ends on: make the scene at least this long. */
export const voiceEnd = (lines: VoiceLine[], options: Timing = {}) => {
  const t = voiceTiming(lines, options);
  return t.length ? t[t.length - 1].end : (options.start ?? 0);
};

/**
 * Plays a voiceover's lines one after another from `start`, `gap` seconds apart.
 *
 *   <Voiceover lines={tutorial} start={15} />
 */
export const Voiceover: React.FC<{
  /** The voiceover's lines, from src/voice/<name>.ts (written by npm run voice). */
  lines: VoiceLine[];
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Seconds of silence between lines (default 0.3). */
  gap?: number;
  /** Its volume, 0 to 1 (default 1). */
  volume?: number;
}> = ({lines, start = 0, gap = 0.3, volume = 1}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {voiceTiming(lines, {start, gap, fps}).map((t, i) => (
        <Sequence key={i} from={t.start} durationInFrames={t.end - t.start} layout="none">
          <Audio src={staticFile(lines[i].src)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
};

/** The words of a voiceover, line by line, timed in frames: what Captions shows. */
export const voiceWords = (lines: VoiceLine[], options: Timing = {}): Word[][] => {
  const fps = options.fps ?? 30;
  return voiceTiming(lines, options).map((t, i) => {
    const [a, b] = lines[i].speech ?? [0, lines[i].seconds];
    return spread(lines[i].text, t.start + a * fps, t.start + b * fps);
  });
};

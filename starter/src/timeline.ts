// The one place scene lengths live. Lengths are in BARS of the music, so every cut lands on a
// beat: at 120 BPM a bar is exactly 2 s. Change BPM to your track's and everything follows.

export const FPS = 30;
export const BPM = 120;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const BAR_SECONDS = (60 / BPM) * 4;

/** Frames in `n` bars (halves and quarters are fine). */
export const bars = (n: number) => Math.round(n * BAR_SECONDS * FPS);

export const SCENES = [
  {id: 'Hero', bars: 3},
  {id: 'Orbit', bars: 2},
  {id: 'Focus', bars: 3},
  {id: 'Fan', bars: 2},
  {id: 'End', bars: 3},
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

export const sceneFrames = (id: SceneId) => bars(SCENES.find((s) => s.id === id)?.bars ?? 0);

/** The frame a scene starts at in the full video: handy for syncing sound effects to cuts. */
export const sceneStart = (id: SceneId) => {
  let at = 0;
  for (const s of SCENES) {
    if (s.id === id) return at;
    at += bars(s.bars);
  }
  return at;
};

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + bars(s.bars), 0);

import type React from 'react';
import type {Word} from './voiceover/voiceover';

// Pieces the voice items share. Not an item: it's copied with any voice item.

// ---------------------------------------------------------------------------------------------
// Word timing: spread over the speech by word length, with a beat after punctuation. Close enough
// to read as in sync, without forced alignment.

export const spread = (text: string, from: number, to: number): Word[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w, i) => {
    const letters = w.replace(/[^\p{L}\p{N}]/gu, '').length;
    const pause = i === words.length - 1 ? 0 : /[.!?]$/.test(w) ? 5 : /[,;:—]$/.test(w) ? 3 : 0;
    return letters + 2 + pause;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let t = from;
  return words.map((w, i) => {
    const s = t;
    t += ((to - from) * weights[i]) / total;
    return {text: w, start: Math.round(s), end: Math.round(t)};
  });
};

// Samples for the gallery.

export const centre: React.CSSProperties = {alignItems: 'center', justifyContent: 'center'};

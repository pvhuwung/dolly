import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence} from 'remotion';
import {Footage} from './kit';
import {FPS, HEIGHT, SCENES, TOTAL, Video, WIDTH, frames} from './Video';

// Many frames on one PNG: how you review motion without watching it.
//
//   npx remotion still Sheet out/sheet.png                                        # the video, 1 frame/s
//   npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6}'  # one scene, 5 frames/s
//   npx remotion still Sheet out/A.png --props='{"take":"takes/A-mac.mov","seconds":42}'  # a raw take
//
// Labels give the frame of the Video (for `remotion still Video --frame=N`), or for a take the
// second to pass to <Footage at={...}>.

export type SheetProps = {scene?: string; every?: number; take?: string; seconds?: number};

const COLUMNS = 6;
const CELL_W = 480;
const CELL_H = (CELL_W * HEIGHT) / WIDTH;
const LABEL = 28;
const GAP = 8;

const spans = SCENES.map((s, i) => {
  const start = SCENES.slice(0, i).reduce((sum, p) => sum + frames(p.seconds), 0);
  return {name: s.name, start, end: start + frames(s.seconds)};
});

const lengthOf = ({take, seconds = 60}: SheetProps) => (take ? frames(seconds) : TOTAL);

const sampled = (props: SheetProps) => {
  const span = spans.find((s) => s.name === props.scene) ?? {start: 0, end: lengthOf(props)};
  const every = Math.max(1, props.every ?? FPS);
  const out: number[] = [];
  for (let f = span.start; f < span.end; f += every) out.push(f);
  if (out[out.length - 1] !== span.end - 1) out.push(span.end - 1);
  return out;
};

const label = (props: SheetProps, f: number) =>
  props.take
    ? `at ${(f / FPS).toFixed(1)}s`
    : `${spans.find((s) => f >= s.start && f < s.end)?.name} · frame ${f} · ${(f / FPS).toFixed(2)}s`;

export const sheetMetadata: CalculateMetadataFunction<SheetProps> = ({props}) => ({
  width: COLUMNS * (CELL_W + GAP) + GAP,
  height: Math.ceil(sampled(props).length / COLUMNS) * (CELL_H + LABEL + GAP) + GAP,
  // Remotion clamps frozen frames to the composition's length, so it must cover every sample.
  durationInFrames: lengthOf(props),
});

export const Sheet: React.FC<SheetProps> = (props) => (
  <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}>
    {sampled(props).map((f) => (
      <div key={f} style={{width: CELL_W}}>
        <div style={{width: CELL_W, height: CELL_H, overflow: 'hidden', position: 'relative', background: '#000'}}>
          <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transform: `scale(${CELL_W / WIDTH})`, transformOrigin: '0 0'}}>
            {/* The Sequence gives the video back its own size for useVideoConfig(). */}
            <Sequence width={WIDTH} height={HEIGHT} layout="none">
              <Freeze frame={f}>{props.take ? <Footage src={props.take} fit="contain" /> : <Video />}</Freeze>
            </Sequence>
          </div>
        </div>
        <div style={{height: LABEL, lineHeight: `${LABEL}px`, font: '15px system-ui, sans-serif', color: '#9a9aa5'}}>{label(props, f)}</div>
      </div>
    ))}
  </AbsoluteFill>
);

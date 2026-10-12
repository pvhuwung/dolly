import React from 'react';
import {AbsoluteFill, Audio, CalculateMetadataFunction, Freeze, Sequence, staticFile} from 'remotion';
import type {Brand} from '../brand';
import {Scene, Scenes, sceneStarts, scenesLength} from '../fx/transitions';
import {FORMATS, FormatName, LookProvider, StyleName, makeLook} from '../look';

// A mock video for an invented product: its brand, style and format, its scenes, and its sound.
// Each one is a file next to this; index.ts lists them and Root.tsx makes a composition of each.

export type Mock = {
  /** The composition's id. */
  id: string;
  /** What the product is, in a few words. */
  title: string;
  /** What the video is for: a launch, an event, hiring, a changelog… */
  agenda?: string;
  style: StyleName;
  format: FormatName;
  /** Merged over brand.ts: name, url, logo (in public/), accent, alert, fonts. */
  brand: Partial<Brand>;
  scenes: Scene[];
  /** A chime on each moment the story turns on: [scene name, frame in that scene]. */
  tings?: [string, number][];
  /** A music file in public/, under everything. */
  music?: string;
  /** The frame that sums the video up: its thumbnail. */
  poster: number;
};

export const FPS = 30;
export const lengthOf = (m: Mock) => scenesLength(m.scenes, m.style);

export const mockMetadata = (m: Mock): CalculateMetadataFunction<Record<string, unknown>> => () => ({
  width: FORMATS[m.format].width,
  height: FORMATS[m.format].height,
  durationInFrames: lengthOf(m),
});

export const MockVideo: React.FC<{mock: Mock}> = ({mock}) => {
  const starts = sceneStarts(mock.scenes, mock.style);
  const startOf = (name: string) => starts[mock.scenes.findIndex((s) => s.name === name)];
  const transition = makeLook(mock.style, 1920, 1080).transition;
  return (
    <LookProvider style={mock.style} brand={mock.brand}>
      <Scenes scenes={mock.scenes} />
      {(mock.tings ?? []).map(([scene, at]) => (
        <Sequence key={`${scene}-${at}`} from={startOf(scene) + at} durationInFrames={40}>
          <Audio src={staticFile('sfx/ting.wav')} volume={0.4} />
        </Sequence>
      ))}
      {mock.scenes.slice(1).map((s, i) =>
        (s.transition ?? transition) === 'cut' ? null : (
          <Sequence key={s.name} from={starts[i + 1]} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
          </Sequence>
        ),
      )}
      {mock.music ? <Audio src={staticFile(mock.music)} volume={(f) => Math.min(0.45, f / 20) * Math.min(1, (lengthOf(mock) - f) / 30)} /> : null}
    </LookProvider>
  );
};

// ---------------------------------------------------------------------------------------------
// Review: one mock's frames on one image, or every mock's poster.
//
//   npx remotion still MockSheet out/quillo.png --props='{"mock":"Quillo"}'             # 1 frame/s
//   npx remotion still MockSheet out/q.png --props='{"mock":"Quillo","every":6,"scene":"Demo"}'
//   npx remotion still Posters out/posters.png

const GAP = 8;
const LABEL = 28;
const cellWidth = (format: FormatName) => (format === 'landscape' ? 480 : format === 'vertical' ? 270 : 340);
const columnsOf = (format: FormatName) => (format === 'landscape' ? 6 : format === 'vertical' ? 9 : 7);

/** The mock frozen on a frame, `width` px wide. */
export const Still: React.FC<{mock: Mock; frame: number; width: number}> = ({mock, frame, width}) => {
  const f = FORMATS[mock.format];
  return (
    <div style={{width, height: Math.round((width * f.height) / f.width), overflow: 'hidden', position: 'relative', background: '#000'}}>
      <div style={{position: 'absolute', width: f.width, height: f.height, transform: `scale(${width / f.width})`, transformOrigin: '0 0'}}>
        <Sequence width={f.width} height={f.height} layout="none">
          <Freeze frame={Math.min(frame, lengthOf(mock) - 1)}>
            <MockVideo mock={mock} />
          </Freeze>
        </Sequence>
      </div>
    </div>
  );
};

export type SheetProps = {mock?: string; every?: number; scene?: string};

const span = (m: Mock, scene?: string) => {
  const starts = sceneStarts(m.scenes, m.style);
  const i = m.scenes.findIndex((s) => s.name === scene);
  return i < 0 ? {start: 0, end: lengthOf(m)} : {start: starts[i], end: starts[i] + Math.round(m.scenes[i].seconds * FPS)};
};
const samples = (m: Mock, props: SheetProps) => {
  const {start, end} = span(m, props.scene);
  const out: number[] = [];
  for (let f = start; f < end; f += Math.max(1, props.every ?? FPS)) out.push(f);
  if (out[out.length - 1] !== end - 1) out.push(end - 1);
  return out;
};
const sceneAt = (m: Mock, f: number) => {
  const starts = sceneStarts(m.scenes, m.style);
  let name = m.scenes[0].name;
  starts.forEach((s, i) => {
    if (f >= s) name = m.scenes[i].name;
  });
  return name;
};

export const sheetMetadata =
  (mocks: Mock[]): CalculateMetadataFunction<SheetProps> =>
  ({props}) => {
    const m = mocks.find((x) => x.id === props.mock) ?? mocks[0];
    const w = cellWidth(m.format);
    const h = Math.round((w * FORMATS[m.format].height) / FORMATS[m.format].width);
    const cols = columnsOf(m.format);
    return {
      width: cols * (w + GAP) + GAP,
      height: Math.ceil(samples(m, props).length / cols) * (h + LABEL + GAP) + GAP,
      durationInFrames: lengthOf(m),
    };
  };

export const makeSheet =
  (mocks: Mock[]): React.FC<SheetProps> =>
  (props) => {
    const m = mocks.find((x) => x.id === props.mock) ?? mocks[0];
    return (
      <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}>
        {samples(m, props).map((f) => (
          <div key={f}>
            <Still mock={m} frame={f} width={cellWidth(m.format)} />
            <div style={{height: LABEL, lineHeight: `${LABEL}px`, font: '14px system-ui, sans-serif', color: '#9a9aa5', whiteSpace: 'nowrap', overflow: 'hidden', width: cellWidth(m.format)}}>
              {sceneAt(m, f)} · {f} · {(f / FPS).toFixed(1)}s
            </div>
          </div>
        ))}
      </AbsoluteFill>
    );
  };

/** Every mock's poster, all the same height, with what it is under it. */
const ROW = 560;
const posterWidth = (m: Mock) => Math.round((ROW * FORMATS[m.format].width) / FORMATS[m.format].height);

const SHEET = 2400;
/** How many rows the posters wrap into, laid out left to right like the flex row below. */
const rowsOf = (mocks: Mock[]) => {
  let rows = 1;
  let x = 16;
  for (const m of mocks) {
    if (x + posterWidth(m) + 16 > SHEET) {
      rows++;
      x = 16;
    }
    x += posterWidth(m) + 16;
  }
  return rows;
};

export const postersMetadata =
  (mocks: Mock[]): CalculateMetadataFunction<Record<string, unknown>> =>
  () => ({
    width: SHEET,
    height: rowsOf(mocks) * (ROW + 70 + 16) + 16,
    durationInFrames: Math.max(...mocks.map(lengthOf)),
  });

export const makePosters =
  (mocks: Mock[]): React.FC =>
  () => (
    <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'center', gap: 16, padding: 16}}>
      {mocks.map((m) => (
        <div key={m.id} style={{width: posterWidth(m)}}>
          <div style={{borderRadius: 10, overflow: 'hidden'}}>
            <Still mock={m} frame={m.poster} width={posterWidth(m)} />
          </div>
          <div style={{height: 70, paddingTop: 10, font: '15px system-ui, sans-serif', color: '#9a9aa5', lineHeight: 1.4}}>
            <span style={{color: '#f2f2f5', fontWeight: 600, fontSize: 18}}>{m.brand.name}</span> · {m.agenda ? `${m.agenda}: ` : ''}{m.title}
            <br />
            {m.style} · {m.format} · {Math.round(lengthOf(m) / FPS)} s
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );

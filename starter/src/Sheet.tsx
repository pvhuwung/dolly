import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence} from 'remotion';
import {brand} from './brand';
import {sceneStarts} from './fx/transitions';
import {Footage} from './kit';
import {FORMATS, FormatName, StyleName, makeLook} from './look';
import {FPS, SCENES, Video, frames, lengthOf} from './Video';

// Many frames on one PNG: how you review motion without watching it.
//
//   npx remotion still Sheet out/sheet.png                                        # the video, 1 frame/s
//   npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6}'  # one scene, 5 frames/s
//   npx remotion still Sheet out/v.png --props='{"format":"vertical","guides":true}'  # another format, with its safe area
//   npx remotion still Sheet out/A.png --props='{"take":"takes/A-mac.mov","seconds":42}'  # a raw take
//   npx remotion still Sheet out/B.png --props='{"take":"takes/B-phone.mov","from":60,"seconds":30,"every":10,"format":"vertical"}'  # 60-90 s of one, 3 frames/s, tall cells
//
// Labels give the frame of the Video (for `remotion still Video --frame=N`), or for a take the
// second to pass to <Footage at={...}>. Guides draw the format's safe area (dashed: keep text
// inside) and the caption band and aim lines (dotted: shots frame their subject between them).

export type SheetProps = {
  scene?: string;
  every?: number;
  take?: string;
  /** For a take: the second to start at (default 0), and how many seconds to show from there. */
  from?: number;
  seconds?: number;
  style?: StyleName;
  format?: FormatName;
  guides?: boolean;
};

const LABEL = 28;
const GAP = 8;
const sizeOf = ({format = 'landscape'}: SheetProps) => {
  const f = FORMATS[format];
  const columns = format === 'landscape' ? 6 : format === 'vertical' ? 8 : 7;
  const cellW = format === 'landscape' ? 480 : 300;
  return {f, columns, cellW, cellH: Math.round((cellW * f.height) / f.width)};
};

const spansOf = (style: StyleName) => {
  const starts = sceneStarts(SCENES, style);
  return SCENES.map((s, i) => ({name: s.name, start: starts[i], end: starts[i] + frames(s.seconds)}));
};

const lengthOfSheet = (props: SheetProps) => (props.take ? frames((props.from ?? 0) + (props.seconds ?? 60)) : lengthOf(props.style));

const sampled = (props: SheetProps) => {
  const span = spansOf(props.style ?? brand.style).find((s) => s.name === props.scene) ?? {start: props.take ? frames(props.from ?? 0) : 0, end: lengthOfSheet(props)};
  const every = Math.max(1, props.every ?? FPS);
  const out: number[] = [];
  for (let f = span.start; f < span.end; f += every) out.push(f);
  if (out[out.length - 1] !== span.end - 1) out.push(span.end - 1);
  return out;
};

const label = (props: SheetProps, f: number) => {
  if (props.take) return `at ${(f / FPS).toFixed(1)}s`;
  // During a transition two scenes overlap: name the one coming in.
  const here = spansOf(props.style ?? brand.style).filter((s) => f >= s.start && f < s.end);
  return `${here[here.length - 1]?.name} · ${f} · ${(f / FPS).toFixed(1)}s`;
};

export const sheetMetadata: CalculateMetadataFunction<SheetProps> = ({props}) => {
  const {columns, cellW, cellH} = sizeOf(props);
  return {
    width: columns * (cellW + GAP) + GAP,
    height: Math.ceil(sampled(props).length / columns) * (cellH + LABEL + GAP) + GAP,
    // Remotion clamps frozen frames to the composition's length, so it must cover every sample.
    durationInFrames: lengthOfSheet(props),
  };
};

const Guides: React.FC<{props: SheetProps}> = ({props}) => {
  const {f} = sizeOf(props);
  const look = makeLook(props.style ?? brand.style, f.width, f.height);
  const {safe} = look;
  const line = (top: number, color: string): React.CSSProperties => ({position: 'absolute', left: 0, right: 0, top, borderTop: `3px dotted ${color}`});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: safe.left, top: safe.top, right: safe.right, bottom: safe.bottom, border: '4px dashed rgba(255, 60, 60, 0.85)'}} />
      <div style={line(look.aim.top, 'rgba(40, 120, 255, 0.9)')} />
      <div style={line(f.height - look.aim.bottom, 'rgba(40, 120, 255, 0.9)')} />
    </AbsoluteFill>
  );
};

export const Sheet: React.FC<SheetProps> = (props) => {
  const {f, cellW, cellH} = sizeOf(props);
  return (
    <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}>
      {sampled(props).map((n) => (
        <div key={n} style={{width: cellW}}>
          <div style={{width: cellW, height: cellH, overflow: 'hidden', position: 'relative', background: '#000'}}>
            <div style={{position: 'absolute', width: f.width, height: f.height, transform: `scale(${cellW / f.width})`, transformOrigin: '0 0'}}>
              {/* The Sequence gives the video back its own size for useVideoConfig(). */}
              <Sequence width={f.width} height={f.height} layout="none">
                <Freeze frame={n}>{props.take ? <Footage src={props.take} fit="contain" /> : <Video style={props.style} />}</Freeze>
              </Sequence>
              {props.guides ? <Guides props={props} /> : null}
            </div>
          </div>
          <div style={{height: LABEL, lineHeight: `${LABEL}px`, font: '15px system-ui, sans-serif', color: '#9a9aa5', whiteSpace: 'nowrap', overflow: 'hidden'}}>
            {label(props, n)}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence, Series} from 'remotion';
import {demos as backdrops} from './fx/backdrops';
import type {Demo} from './fx/demo';
import {demos as graphics} from './fx/graphics';
import {demos as text} from './fx/text';
import {demos as templates} from './templates';
import {demos as transitions} from './fx/transitions';
import {FORMATS, FormatName, LookProvider, StyleName, useLook} from './look';
import {Backdrop} from './fx/backdrops';

// Every effect in fx/, a few seconds each over the style's backdrop, labelled with the code that
// makes it. The sheet puts each one's best frame on one image:
//
//   npx remotion render Gallery out/gallery.mp4 --props='{"style":"bold"}'
//   npx remotion still GallerySheet out/gallery.png --props='{"only":"text","format":"vertical"}'

const GROUPS = {templates, text, graphics, backdrops, transitions};
export type GalleryProps = {style?: StyleName; only?: keyof typeof GROUPS; format?: FormatName};

const FPS = 30;
const pick = ({only}: GalleryProps): Demo[] => (only ? GROUPS[only] : Object.values(GROUPS).flat());

/** The demo's name and code, in a chip at the bottom left. */
const Label: React.FC<{demo: Demo}> = ({demo}) => {
  const look = useLook();
  return (
    <div
      style={{
        position: 'absolute',
        left: look.safe.left,
        bottom: 48,
        maxWidth: look.width - look.safe.left - look.safe.right,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '12px 18px',
        borderRadius: Math.min(look.radius, 14),
        background: look.surface,
        boxShadow: `0 0 0 1px ${look.line}, 0 8px 30px rgba(0, 0, 0, 0.12)`,
      }}
    >
      <div style={{fontFamily: look.fonts.body, fontSize: 18, fontWeight: 600, color: look.dim}}>
        {demo.name}
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 26, fontWeight: 600, color: look.ink}}>
        {demo.code}
      </div>
    </div>
  );
};

const Sample: React.FC<{demo: Demo}> = ({demo}) => (
  <AbsoluteFill>
    {demo.backdrop === false ? null : <Backdrop />}
    <demo.Component />
    <Label demo={demo} />
  </AbsoluteFill>
);

export const galleryMetadata: CalculateMetadataFunction<GalleryProps> = ({props}) => {
  const f = FORMATS[props.format ?? 'landscape'];
  return {
    width: f.width,
    height: f.height,
    durationInFrames: Math.max(1, pick(props).reduce((sum, d) => sum + Math.round(d.seconds * FPS), 0)),
  };
};

export const Gallery: React.FC<GalleryProps> = (props) => (
  <LookProvider style={props.style}>
    <Series>
      {pick(props).map((d) => (
        <Series.Sequence key={d.name} name={d.name} durationInFrames={Math.round(d.seconds * FPS)}>
          <Sample demo={d} />
        </Series.Sequence>
      ))}
    </Series>
  </LookProvider>
);

// The sheet: each demo frozen on its hero frame.
const COLUMNS = 4;
const CELL = 560;
const GAP = 10;
const cellHeight = (format: FormatName) => Math.round((CELL * FORMATS[format].height) / FORMATS[format].width);

export const gallerySheetMetadata: CalculateMetadataFunction<GalleryProps> = ({props}) => {
  const rows = Math.ceil(pick(props).length / COLUMNS);
  return {
    width: COLUMNS * (CELL + GAP) + GAP,
    height: Math.max(1, rows) * (cellHeight(props.format ?? 'landscape') + GAP) + GAP,
    durationInFrames: Math.max(1, ...pick(props).map((d) => Math.round(d.seconds * FPS))),
  };
};

export const GallerySheet: React.FC<GalleryProps> = (props) => {
  const f = FORMATS[props.format ?? 'landscape'];
  return (
    <LookProvider style={props.style}>
      <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}>
        {pick(props).map((d) => (
          <div key={d.name} style={{width: CELL, height: cellHeight(props.format ?? 'landscape'), overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', width: f.width, height: f.height, transform: `scale(${CELL / f.width})`, transformOrigin: '0 0'}}>
              {/* The Sequence gives the demo the format's size for useVideoConfig(). */}
              <Sequence width={f.width} height={f.height} durationInFrames={Math.round(d.seconds * FPS)} layout="none">
                <Freeze frame={d.hero}>
                  <Sample demo={d} />
                </Freeze>
              </Sequence>
            </div>
          </div>
        ))}
      </AbsoluteFill>
    </LookProvider>
  );
};

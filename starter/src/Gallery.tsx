import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence, Series} from 'remotion';
import {Backdrop} from './backdrop';
import {DEMOS, ITEM_DEMOS} from './library';
import type {Demo} from './library/types';
import {FORMATS, FormatName, LookProvider, StyleName, useLook} from './look';

// Every item in the library, a few seconds each over the style's backdrop, labelled with the code that
// makes it. The sheet puts each one's best frame on one image:
//
//   npx remotion render Gallery out/gallery.mp4 --props='{"style":"bold"}'
//   npx remotion still GallerySheet out/gallery.png --props='{"only":"text","format":"vertical"}'

const GROUPS = DEMOS;
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

const Sample: React.FC<{demo: Demo; label?: boolean}> = ({demo, label = true}) => (
  <AbsoluteFill>
    {demo.backdrop === false ? null : <Backdrop />}
    <demo.Component />
    {label ? <Label demo={demo} /> : null}
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

// One item's sample on its own, without its label: what the showreel's library page plays.
//
//   npx remotion render Item out/stat.mp4 --props='{"id":"graphics/stat"}'
//   npm run samples          # every item's samples, as clips and posters (scripts/samples.mjs)

export type ItemProps = {id: string; index?: number; style?: StyleName; format?: FormatName; label?: boolean};

const demoOf = ({id, index = 0}: ItemProps): Demo => {
  const demo = ITEM_DEMOS[id]?.[index];
  if (!demo) throw new Error(`No sample ${index} for library item "${id}"`);
  return demo;
};

export const itemMetadata: CalculateMetadataFunction<ItemProps> = ({props}) => {
  const f = FORMATS[props.format ?? 'landscape'];
  return {width: f.width, height: f.height, durationInFrames: Math.round(demoOf(props).seconds * FPS)};
};

export const Item: React.FC<ItemProps> = (props) => (
  <LookProvider style={props.style}>
    <Sample demo={demoOf(props)} label={props.label ?? false} />
  </LookProvider>
);

// Every item's samples as a list (name, code, length, best frame), for scripts/samples.mjs: it
// reads them from this composition's props instead of running the library itself.
export type ItemListProps = {items?: {id: string; index: number; name: string; code: string; seconds: number; hero: number}[]};

export const itemListMetadata: CalculateMetadataFunction<ItemListProps> = () => ({
  durationInFrames: 1,
  props: {
    items: Object.entries(ITEM_DEMOS).flatMap(([id, demos]) =>
      demos.map((d, index) => ({id, index, name: d.name, code: d.code, seconds: d.seconds, hero: d.hero})),
    ),
  },
});

export const ItemList: React.FC<ItemListProps> = () => null;

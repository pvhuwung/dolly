import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence} from 'remotion';
import {brand} from './brand';
import {FORMATS, FormatName, STYLES, STYLE_NAMES, StyleName} from './look';
import {Video, lengthOf} from './Video';

// One frame of the video in every style, or in every format, on one image: how you and the user
// pick a look before rendering anything long.
//
//   npx remotion still Styles out/styles.png --props='{"frame":420}'
//   npx remotion still Styles out/styles-v.png --props='{"frame":420,"format":"vertical"}'
//   npx remotion still Formats out/formats.png --props='{"frame":420,"style":"bold"}'

export type ShowcaseProps = {frame?: number; style?: StyleName; format?: FormatName};

const GAP = 16;
const LABEL = 64;
const FRAME = 420;
const maxLength = Math.max(...STYLE_NAMES.map((s) => lengthOf(s)));

/** The video frozen on `frame`, in a style and a format, drawn `width` px wide. */
const Still: React.FC<{frame: number; style: StyleName; format: FormatName; width: number}> = ({frame, style, format, width}) => {
  const f = FORMATS[format];
  return (
    <div style={{width, height: Math.round((width * f.height) / f.width), overflow: 'hidden', position: 'relative', borderRadius: 6}}>
      <div style={{position: 'absolute', width: f.width, height: f.height, transform: `scale(${width / f.width})`, transformOrigin: '0 0'}}>
        <Sequence width={f.width} height={f.height} layout="none">
          <Freeze frame={Math.min(frame, lengthOf(style) - 1)}>
            <Video style={style} />
          </Freeze>
        </Sequence>
      </div>
    </div>
  );
};

const Label: React.FC<{title: string; note: string; width: number}> = ({title, note, width}) => (
  <div style={{width, height: LABEL, paddingTop: 10, font: '15px system-ui, sans-serif', color: '#9a9aa5', lineHeight: 1.35}}>
    <span style={{color: '#f2f2f5', fontWeight: 600, fontSize: 18}}>{title}</span> · {note}
  </div>
);

// Styles: a 4-column grid, one cell per style.
const COLUMNS = 4;
const cellWidth = (format: FormatName) => (format === 'landscape' ? 600 : format === 'vertical' ? 300 : 400);

export const stylesMetadata: CalculateMetadataFunction<ShowcaseProps> = ({props}) => {
  const format = props.format ?? 'landscape';
  const w = cellWidth(format);
  const h = Math.round((w * FORMATS[format].height) / FORMATS[format].width);
  const rows = Math.ceil(STYLE_NAMES.length / COLUMNS);
  return {width: COLUMNS * (w + GAP) + GAP, height: rows * (h + LABEL + GAP) + GAP, durationInFrames: maxLength};
};

export const Styles: React.FC<ShowcaseProps> = ({frame = FRAME, format = 'landscape'}) => (
  <AbsoluteFill style={{background: '#101014', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}>
    {STYLE_NAMES.map((s) => (
      <div key={s}>
        <Still frame={frame} style={s} format={format} width={cellWidth(format)} />
        <Label title={s} note={STYLES[s].about} width={cellWidth(format)} />
      </div>
    ))}
  </AbsoluteFill>
);

// Formats: one row, every frame the same height.
const ROW = 720;
const FORMAT_NAMES = Object.keys(FORMATS) as FormatName[];
const widthAt = (format: FormatName) => Math.round((ROW * FORMATS[format].width) / FORMATS[format].height);

export const formatsMetadata: CalculateMetadataFunction<ShowcaseProps> = () => ({
  width: FORMAT_NAMES.reduce((sum, f) => sum + widthAt(f) + GAP, GAP),
  height: ROW + LABEL + GAP * 2,
  durationInFrames: maxLength,
});

export const Formats: React.FC<ShowcaseProps> = ({frame = FRAME, style = brand.style}) => (
  <AbsoluteFill style={{background: '#101014', flexDirection: 'row', gap: GAP, padding: GAP}}>
    {FORMAT_NAMES.map((f) => (
      <div key={f}>
        <Still frame={frame} style={style} format={f} width={widthAt(f)} />
        <Label title={`${f} ${FORMATS[f].width}×${FORMATS[f].height}`} note={FORMATS[f].for} width={widthAt(f)} />
      </div>
    ))}
  </AbsoluteFill>
);

import React from 'react';
import {Composition} from 'remotion';
import {Gallery, GallerySheet, galleryMetadata, gallerySheetMetadata} from './Gallery';
import {FORMATS} from './look';
import {Moves, MOVES_FRAMES} from './Moves';
import {Promo, promoMetadata} from './Promo';
import {Formats, Styles, formatsMetadata, stylesMetadata} from './Showcase';
import {Sheet, sheetMetadata} from './Sheet';
import {FPS, HEIGHT, Video, WIDTH, lengthOf, videoMetadata} from './Video';

// The same video in every format: render the ones the user's platforms need. Each takes
// --props='{"style":"bold"}' to render in another style.
const VIDEOS = [
  {id: 'Video', format: FORMATS.landscape},
  {id: 'Vertical', format: FORMATS.vertical},
  {id: 'Square', format: FORMATS.square},
  {id: 'Portrait', format: FORMATS.portrait},
];

// Compositions that size themselves from their props start at any size; calculateMetadata sets it.
const sized = {durationInFrames: 1, fps: FPS, width: WIDTH, height: HEIGHT, defaultProps: {}};

export const Root: React.FC = () => (
  <>
    {VIDEOS.map(({id, format}) => (
      <Composition
        key={id}
        id={id}
        component={Video}
        defaultProps={{}}
        calculateMetadata={videoMetadata}
        durationInFrames={lengthOf()}
        fps={FPS}
        width={format.width}
        height={format.height}
      />
    ))}
    <Composition id="Promo" component={Promo} calculateMetadata={promoMetadata} {...sized} />
    <Composition id="Moves" component={Moves} durationInFrames={MOVES_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Gallery" component={Gallery} calculateMetadata={galleryMetadata} {...sized} />
    <Composition id="GallerySheet" component={GallerySheet} calculateMetadata={gallerySheetMetadata} {...sized} />
    <Composition id="Styles" component={Styles} calculateMetadata={stylesMetadata} {...sized} />
    <Composition id="Formats" component={Formats} calculateMetadata={formatsMetadata} {...sized} />
    <Composition id="Sheet" component={Sheet} calculateMetadata={sheetMetadata} {...sized} defaultProps={{every: FPS}} />
  </>
);

import React from 'react';
import {Composition} from 'remotion';
import {Gallery, GallerySheet, galleryMetadata, gallerySheetMetadata} from './Gallery';
import {MOCKS} from './mocks';
import {FPS, MockVideo, lengthOf, makePosters, makeSheet, mockMetadata, postersMetadata, sheetMetadata} from './mocks/mock';

// Mock videos for invented products, one composition each, plus their review sheets and the
// gallery of every effect.
const MockSheet = makeSheet(MOCKS);
const Posters = makePosters(MOCKS);
const sized = {durationInFrames: 1, fps: FPS, width: 1920, height: 1080, defaultProps: {}};

export const Root: React.FC = () => (
  <>
    {MOCKS.map((m) => (
      <Composition
        key={m.id}
        id={m.id}
        component={() => <MockVideo mock={m} />}
        calculateMetadata={mockMetadata(m)}
        {...sized}
        durationInFrames={lengthOf(m)}
      />
    ))}
    <Composition id="MockSheet" component={MockSheet} calculateMetadata={sheetMetadata(MOCKS)} {...sized} />
    <Composition id="Posters" component={Posters} calculateMetadata={postersMetadata(MOCKS)} {...sized} />
    <Composition id="Gallery" component={Gallery} calculateMetadata={galleryMetadata} {...sized} />
    <Composition id="GallerySheet" component={GallerySheet} calculateMetadata={gallerySheetMetadata} {...sized} />
  </>
);

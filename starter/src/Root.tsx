import React from 'react';
import {Composition} from 'remotion';
import {Sheet, sheetMetadata} from './Sheet';
import {FPS, HEIGHT, TOTAL, Video, WIDTH} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition
      id="Sheet"
      component={Sheet}
      defaultProps={{every: FPS}}
      calculateMetadata={sheetMetadata}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);

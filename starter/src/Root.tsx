import React from 'react';
import {Composition} from 'remotion';
import {ContactSheet, sheetMetadata} from './ContactSheet';
import {SCENE_COMPONENTS, Showcase} from './Showcase';
import {FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH, bars} from './timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Showcase" component={Showcase} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Each scene on its own too, so you can scrub and render one shot while you work on it. */}
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={`Scene-${s.id}`}
        component={SCENE_COMPONENTS[s.id]}
        durationInFrames={bars(s.bars)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
    <Composition
      id="Sheet"
      component={ContactSheet}
      defaultProps={{scene: 'all', every: FPS, columns: 6}}
      calculateMetadata={sheetMetadata}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);

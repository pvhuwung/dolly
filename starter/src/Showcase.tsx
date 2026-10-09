import React from 'react';
import {Series} from 'remotion';
import {End} from './scenes/End';
import {Fan} from './scenes/Fan';
import {Focus} from './scenes/Focus';
import {Hero} from './scenes/Hero';
import {Orbit} from './scenes/Orbit';
import {SceneId, SCENES, bars} from './timeline';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {Hero, Orbit, Focus, Fan, End};

/** The whole video: every scene back to back, each cut on a bar line. */
export const Showcase: React.FC = () => (
  <Series>
    {SCENES.map((s) => {
      const Scene = SCENE_COMPONENTS[s.id];
      return (
        <Series.Sequence key={s.id} durationInFrames={bars(s.bars)} name={s.id}>
          <Scene />
        </Series.Sequence>
      );
    })}
  </Series>
);

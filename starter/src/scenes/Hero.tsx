import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {Floor, Layer, Screen, Stage, Words, animate, ease} from '../kit';
import {APP_SIZE, DemoApp} from './DemoApp';

// TILT-IN. The product arrives from depth at an angle and settles nearly square to the camera, then
// keeps drifting so the shot never freezes.
export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const arrive = animate(frame, [
    [0, {yaw: -34, pitch: 18, dolly: -1100, y: 60}],
    [75, {yaw: -6, pitch: 6, dolly: 0, y: 0}, ease.out],
  ]);
  // The drift is added on top of the keyed move, so the camera never stops and restarts.
  const p = frame / durationInFrames;
  const camera = {...arrive, yaw: arrive.yaw + 8 * p, dolly: arrive.dolly + 90 * p};

  return (
    <Stage camera={camera} lens={1600} background={brand.background} font={fontFamily}>
      <Floor y={440} />
      <Layer y={-405} z={40}>
        <Words text={brand.tagline} start={28} style={{fontSize: 68, fontWeight: 800, color: brand.ink, letterSpacing: -1.5}} />
      </Layer>
      <Layer y={70} scale={0.85}>
        <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={brand.name}>
          <DemoApp accent={brand.accent} />
        </Screen>
      </Layer>
    </Stage>
  );
};

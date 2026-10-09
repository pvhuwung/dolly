import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {APP_SIZE, Camera, Floor, Layer, PlaceholderApp, Screen, Stage, Words, animate, ease, restCamera} from '../kit';

// Recipe: TILT-IN. The product arrives from depth at an angle and settles nearly square to the
// camera, then the shot keeps drifting so it never freezes.
export const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const arrive = animate(frame, restCamera, [
    [0, {yaw: -34, pitch: 18, dolly: -1100, y: 60}],
    [75, {yaw: -6, pitch: 6, dolly: 0, y: 0}, ease.out],
  ]);
  // Drift is ADDED to the keyed move rather than keyed after it, so the speed never drops to zero
  // and then jumps: the arrival eases into a slow, constant push.
  const p = frame / durationInFrames;
  const camera = {...arrive, yaw: arrive.yaw + 8 * p, dolly: arrive.dolly + 90 * p};

  return (
    <Stage lens={1600} background={brand.background} font={fontFamily}>
      <Camera pose={camera}>
        <Floor y={440} />
        <Layer y={-405} z={40}>
          <Words
            text={brand.tagline}
            start={28}
            style={{fontFamily, fontSize: 68, fontWeight: 800, color: brand.ink, letterSpacing: -1.5}}
          />
        </Layer>
        <Layer y={70} scale={0.85}>
          <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={brand.name}>
            <PlaceholderApp accent={brand.accent} />
          </Screen>
        </Layer>
      </Camera>
    </Stage>
  );
};

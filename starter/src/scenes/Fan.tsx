import React from 'react';
import {useCurrentFrame} from 'remotion';
import {brand, fontFamily} from '../brand';
import {APP_SIZE, Camera, Layer, MotionBlur, PlaceholderApp, Screen, Stage, animate, ease, restCamera} from '../kit';

const ACCENTS = ['#7c5cff', '#2dd4bf', '#f59e0b', '#f472b6'];
const GAP = 560;

// Recipe: FLY-PAST. A row of screens receding in depth; the camera trucks along it fast. This is
// the one shot that earns motion blur: anything that crosses the frame in under half a second
// strobes without it.
export const Fan: React.FC = () => (
  <MotionBlur samples={10} shutterAngle={180}>
    <FanShot />
  </MotionBlur>
);

const FanShot: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = animate(frame, restCamera, [
    [0, {x: -GAP * 0.4, z: 0, yaw: -14, pitch: 6, dolly: 120}],
    [104, {x: GAP * 3, z: -GAP * 2.1, yaw: -26, pitch: 3, dolly: 260}, ease.inOut],
  ]);

  return (
    <Stage lens={1500} background={brand.background} font={fontFamily}>
      <Camera pose={camera}>
        {ACCENTS.map((accent, i) => (
          <Layer key={accent} x={i * GAP} z={-i * GAP * 0.7} ry={24} scale={0.62}>
            <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={`agent ${i + 1}`}>
              <PlaceholderApp accent={accent} />
            </Screen>
          </Layer>
        ))}
      </Camera>
    </Stage>
  );
};

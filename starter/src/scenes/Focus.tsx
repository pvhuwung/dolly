import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {APP_HIGHLIGHT, APP_SIZE, Camera, Floor, Layer, PlaceholderApp, Screen, Stage, animate, ease, focusOn, restCamera} from '../kit';

const LENS = 1800;

// Recipe: PUSH-IN TO DETAIL, then PUSH-THROUGH. Settle square to the window, push in until the
// one thing that matters fills the frame, hold long enough to read it, then dolly through it to
// cut to the next scene on the beat.
export const Focus: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames: d} = useVideoConfig();
  const detail = focusOn({rect: APP_HIGHLIGHT, layer: {}, size: APP_SIZE, frame: {width, height}, lens: LENS, fill: 0.62});

  const camera = animate(frame, restCamera, [
    [0, {yaw: 12, pitch: 5, dolly: -380}],
    [32, {yaw: 0, pitch: 0, dolly: 0}, ease.out],
    [44, {x: 0, y: 0, dolly: 0}],
    [92, {...detail}, ease.inOut],
    // Hold: ~2 s on the detail, with a slight creep so it isn't a freeze-frame.
    [d - 22, {dolly: detail.dolly + 60, x: detail.x, y: detail.y}, ease.linear],
    [d, {dolly: LENS * 0.97}, ease.in],
  ]);

  return (
    <Stage lens={LENS} background={brand.background} font={fontFamily}>
      <Camera pose={camera}>
        <Floor y={470} />
        <Layer>
          <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={brand.name}>
            <PlaceholderApp accent={brand.accent} />
          </Screen>
        </Layer>
      </Camera>
    </Stage>
  );
};

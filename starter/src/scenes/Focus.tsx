import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {Floor, Layer, Screen, Stage, animate, ease, focusOn} from '../kit';
import {APP_HIGHLIGHT, APP_SIZE, DemoApp} from './DemoApp';

const LENS = 1800;

// PUSH-IN ON A DETAIL, then PUSH-THROUGH. Settle square to the window, push in until the one thing
// that matters fills the frame, hold long enough to read it, then dolly through to the next scene.
export const Focus: React.FC = () => {
  const frame = useCurrentFrame();
  const video = useVideoConfig();
  const d = video.durationInFrames;
  const detail = focusOn({rect: APP_HIGHLIGHT, screen: APP_SIZE, video, lens: LENS, fill: 0.62});

  const camera = animate(frame, [
    [0, {yaw: 12, pitch: 5, dolly: -380, x: 0, y: 0}],
    [32, {yaw: 0, pitch: 0, dolly: 0}, ease.out],
    [44, {x: 0, y: 0, dolly: 0}],
    [92, detail, ease.inOut],
    // Hold about 2 s on the detail, creeping in slightly so it isn't a freeze-frame.
    [d - 22, {x: detail.x, y: detail.y, dolly: detail.dolly + 60}, ease.linear],
    [d, {dolly: LENS * 0.97}, ease.in],
  ]);

  return (
    <Stage camera={camera} lens={LENS} background={brand.background} font={fontFamily}>
      <Floor y={470} />
      <Layer>
        <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={brand.name}>
          <DemoApp accent={brand.accent} />
        </Screen>
      </Layer>
    </Stage>
  );
};

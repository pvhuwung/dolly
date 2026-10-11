import React from 'react';
import {AbsoluteFill, Series, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, fontFamily} from '../brand';
import {Footage, Layer, Screen, Stage, animate, ease, focusOn, useShot, whole} from '../kit';
import {Caption, SAFE_TOP, Tap} from '../parts';
import {MAC, PHONE, PUSH} from './takes';

export const LENS = 1800;

/** The app window from the Mac take, on the stage at the world's origin. */
export const Window: React.FC<{at: number; speed?: number}> = ({at, speed}) => (
  <Screen frame="none" width={MAC.width} height={MAC.height} glare={0.4}>
    <Footage src={MAC.src} at={at} speed={speed} />
  </Screen>
);

/** The whole window, framed under the caption, square to the camera, creeping in. */
const Wide: React.FC = () => {
  const video = useVideoConfig();
  const framed = focusOn({rect: whole(MAC), size: MAC, video, lens: LENS, fill: 0.94, top: SAFE_TOP});
  const camera = useShot([[0, framed]], {dolly: 40});
  return (
    <Stage camera={camera} lens={LENS} background={brand.background} font={fontFamily}>
      <Layer>
        <Window at={25.5} />
      </Layer>
    </Stage>
  );
};

/** The real push notification on the phone: close on the banner while it's read, then the tap. */
const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const {scale} = animate(frame, [[0, {scale: 1.75}], [67, {scale: 1.8}, ease.linear], [99, {scale: 0.88}, ease.inOut], [150, {scale: 0.9}, ease.linear]]);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 200}}>
      <div style={{transform: `scale(${scale})`, transformOrigin: '50% 0%'}}>
        <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0}>
          <Footage src={PUSH.src} at={0.5} />
          <Tap x={196} y={70} at={78} />
        </Screen>
      </div>
    </AbsoluteFill>
  );
};

// NEEDS YOU: one agent stops and asks; its pane lights up, then the phone pings.
export const NeedsYou: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <Series>
        <Series.Sequence durationInFrames={210}>
          <Wide />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <Phone />
        </Series.Sequence>
      </Series>
      {frame < 210 ? (
        <Caption eyebrow="Needs you" title="One stops and asks." accent="Its pane lights up." start={6} exit={200} />
      ) : (
        <Caption eyebrow="Needs you" title="Your iPhone" accent="pings you." start={212} />
      )}
    </AbsoluteFill>
  );
};

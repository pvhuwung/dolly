import React from 'react';
import {AbsoluteFill, Series, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Footage, Layer, Screen, Stage, animate, ease, focusOn, moves, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Caption, Tap} from '../parts';
import {MAC, PANE, PHONE, PUSH} from './takes';

export const LENS = 1800;

/** The app window from the Mac take, on the stage at the world's origin. */
export const Window: React.FC<{at: number; speed?: number}> = ({at, speed}) => (
  <Screen frame="none" width={MAC.width} height={MAC.height} glare={0.4}>
    <Footage src={MAC.src} at={at} speed={speed} />
  </Screen>
);

/**
 * The whole window, framed under the caption, square to the camera, creeping in. A tall frame
 * can't read a whole window, so there the camera pushes in to the pane that lights up.
 */
const Wide: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: MAC, video, lens: LENS, fill, ...look.aim});
  const wide = frame(whole(MAC), 0.94);
  const camera = useShot(look.format === 'landscape' ? [[0, wide]] : moves.zoomIn(wide, frame(PANE.leftTop, 0.88), {hold: 40, frames: 50}), {dolly: 40});
  return (
    <Stage camera={camera} lens={LENS} font={look.fonts.body}>
      <Layer>
        <Window at={25.5} />
      </Layer>
    </Stage>
  );
};

/** The real push notification on the phone: close on the banner while it's read, then the tap. */
const Phone: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {scale} = animate(frame, [[0, {scale: 1.75}], [67, {scale: 1.8}, ease.linear], [99, {scale: 0.88}, ease.inOut], [150, {scale: 0.9}, ease.linear]]);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: look.band - 30}}>
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
    <AbsoluteFill>
      <Backdrop />
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

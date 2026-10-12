import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../backdrop';
import {Footage, Layer, Screen, Stage, ease, focusOn, useShot, whole} from '../kit';
import {useLook} from '../look';
import {Caption, Tap} from '../parts';
import {LENS, Window} from './NeedsYou';
import {MAC, PANE, PHONE} from './takes';

// APPROVE: the Mac and the phone, nearly flat to the camera. The camera moves up to the phone for
// the tap, then away as the agent on the Mac carries on. Both takes were recorded together, so one
// `at` keeps them in sync.
//
// Wide frames put the Mac on the left and the phone on the right, and pull back to both after the
// tap. Tall frames put the phone in front of the Mac, and after the tap rise to the Mac's browser
// pane, where the work carries on, as the phone drops away below.

const TAP = 200; // the frame of the tap, in this scene
const SPEED = 1.15;
const AT = 57.6 - (TAP / 30) * SPEED; // the tap is at 57.6 s of the take

const WIDE_LAYOUT = {mac: {x: -260, y: 60, z: 0, scale: 0.7}, phone: {x: 620, y: 90, z: 160, scale: 0.88}};
const TALL_LAYOUT = {mac: {x: 0, y: 40, z: -450, scale: 1}, phone: {x: 0, y: 120, z: 120, scale: 0.82}};

export const Approve: React.FC = () => {
  const look = useLook();
  const video = useVideoConfig();
  const frame = useCurrentFrame();
  const tall = look.format !== 'landscape';
  const layout = tall ? TALL_LAYOUT : WIDE_LAYOUT;

  // Wide: framed by eye. Tall: aimed with focusOn at the phone, its lower half, and the browser pane.
  const phone = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) =>
    focusOn({rect, size: PHONE, video, lens: LENS, fill, layer: layout.phone, ...look.aim});
  const wide = tall ? {...phone(whole(PHONE), 0.92), yaw: -3} : {yaw: -2, pitch: 1, dolly: -190, x: 180, y: 45, z: 0};
  const close = tall ? phone({x: 0, y: PHONE.height / 2, width: PHONE.width, height: PHONE.height / 2}, 0.9) : {yaw: -4, pitch: 0, dolly: 880, x: 620, y: 255, z: 160};
  const after = tall ? focusOn({rect: PANE.browser, size: MAC, video, lens: LENS, fill: 0.92, layer: layout.mac, ...look.aim}) : wide;

  const camera = useShot([
    [0, {...wide, dolly: wide.dolly - 300, yaw: -4}],
    [70, wide, ease.out],
    [140, close, ease.inOut],
    [TAP + 18, {...close, dolly: close.dolly + 30}, ease.linear],
    [TAP + 64, after, ease.inOut],
  ]);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={LENS} font={look.fonts.body}>
        <Layer {...layout.mac}>
          <Window at={AT} speed={SPEED} />
        </Layer>
        <Layer {...layout.phone} ry={tall ? 0 : -4}>
          <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0.4}>
            <Footage src={PHONE.src} at={AT} speed={SPEED} />
            <Tap x={315} y={701} start={TAP} />
          </Screen>
        </Layer>
      </Stage>
      {frame < TAP ? (
        <Caption eyebrow="iPhone" title="Approve it" accent="from your phone." start={6} exit={62} />
      ) : (
        <Caption title="The agent" accent="keeps going." start={TAP + 48} />
      )}
    </AbsoluteFill>
  );
};

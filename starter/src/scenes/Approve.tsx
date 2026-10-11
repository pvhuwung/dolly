import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand, fontFamily} from '../brand';
import {Footage, Layer, Screen, Stage, ease, useShot} from '../kit';
import {Caption, Tap} from '../parts';
import {LENS, Window} from './NeedsYou';
import {PHONE} from './takes';

// APPROVE: the Mac on the left, the phone on the right, nearly flat to the camera. The camera moves
// up to the phone for the tap, then pulls back as the agent on the Mac carries on. Both takes were
// recorded together, so one `at` keeps them in sync.

const TAP = 200; // the frame of the tap, in this scene
const SPEED = 1.15;
const AT = 57.6 - (TAP / 30) * SPEED; // the tap is at 57.6 s of the take

/** The camera square to the phone's lower half (the prompt and the keys), about 2x. */
const PHONE_CLOSE = {yaw: -4, pitch: 0, dolly: 880, x: 620, y: 255, z: 160};
const WIDE = {yaw: -2, pitch: 1, dolly: -190, x: 180, y: 45, z: 0};

export const Approve: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useShot([
    [0, {...WIDE, dolly: -300, yaw: -4}],
    [70, WIDE, ease.out],
    [140, PHONE_CLOSE, ease.inOut],
    [TAP + 18, {...PHONE_CLOSE, dolly: PHONE_CLOSE.dolly + 30}, ease.linear],
    [TAP + 64, WIDE, ease.inOut],
  ]);
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <Stage camera={camera} lens={LENS} background={brand.background} font={fontFamily}>
        <Layer x={-260} y={60} scale={0.7}>
          <Window at={AT} speed={SPEED} />
        </Layer>
        <Layer x={620} y={90} z={160} ry={-4} scale={0.88}>
          <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0.4}>
            <Footage src={PHONE.src} at={AT} speed={SPEED} />
            <Tap x={315} y={701} at={TAP} />
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

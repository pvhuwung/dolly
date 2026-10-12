import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../fx/backdrops';
import {Layer, Stage, ease, useShot} from '../kit';
import {useLook} from '../look';
import {Caption} from '../parts';
import {Pill} from './phone';
import {RENDER, STILL} from './takes';

/**
 * Before and after in one picture, the way the app's Compare shows them: the drawing on the left of
 * the line, the render on the right. `split` is where the line is, 0 to 1 across. Both pictures fill
 * the same frame (the app stretches the drawing to the render's shape too), so the walls line up.
 */
export const Wipe: React.FC<{width: number; height: number; split: number; handle?: number}> = ({width, height, split, handle = 1}) => {
  const look = useLook();
  const x = split * width;
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: look.radius, boxShadow: look.shadow, background: '#fff'}}>
      <Img src={staticFile(STILL.day)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill'}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: x, overflow: 'hidden'}}>
        <Img src={staticFile(STILL.drawing)} style={{position: 'absolute', left: 0, top: 0, width, height, objectFit: 'fill', maxWidth: 'none'}} />
      </div>
      <Pill style={{left: 22, top: 22, opacity: interpolate(split, [0.08, 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} dark={false}>
        Before
      </Pill>
      <Pill style={{right: 22, top: 22, opacity: interpolate(split, [0.8, 0.92], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>After</Pill>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: x - 2, width: 4, background: '#fff', opacity: handle, boxShadow: '0 0 18px rgba(0,0,0,0.25)'}} />
      <div
        style={{
          position: 'absolute',
          left: x - 32,
          top: height / 2 - 32,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: '#fff',
          opacity: handle,
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: look.fonts.body,
          fontSize: 30,
          fontWeight: 700,
          color: '#111',
        }}
      >
        ↔
      </div>
    </div>
  );
};

// HOOK: the pain, then the product's answer, before any logo. A client can't read a line drawing;
// the same drawing, sent from the phone, came back as the room. The line sweeps across the real
// result from take B, and the walls, windows and sofa stay where they were drawn.
export const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const video = useVideoConfig();
  const inner = look.width - look.safe.left - look.safe.right;
  // The space between the caption band and the bottom: the platform's band in tall frames, the safe edge in wide ones.
  const room = look.height - look.band - (look.tall ? look.aim.bottom : look.safe.bottom);
  const width = Math.min(inner, (room * RENDER.width) / RENDER.height);
  const height = (width * RENDER.height) / RENDER.width;
  const y = look.band + room / 2 - video.height / 2;
  // The line rests at the right edge (all drawing), then sweeps left to reveal the room.
  const split = interpolate(frame, [52, 112], [1, 0], {easing: ease.inOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const handle = interpolate(frame, [44, 54, 108, 118], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const camera = useShot([[0, {dolly: -60}], [40, {dolly: 0}, ease.out]], {dolly: 50});
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage camera={camera} lens={2400} font={look.fonts.body}>
        <Layer y={y}>
          <Wipe width={width} height={height} split={split} handle={handle} />
        </Layer>
      </Stage>
      <Caption eyebrow="Interior design" title="Clients can’t read" accent="a line drawing." start={6} exit={56} />
      <Caption title="So show them" accent="the room." start={92} />
    </AbsoluteFill>
  );
};

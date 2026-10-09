import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

/**
 * Camera motion blur: renders the shot `samples` times across the shutter and averages them.
 *
 * Each sample is laid over the ones before it at opacity 1/(i+1), which leaves the exact mean.
 * (Summing samples at 1/samples each, as @remotion/motion-blur does, rounds every sample to 8 bits
 * first: near-black colours drift in hue and dark gradients band into rings.) The price of the
 * averaging is that the children must paint an OPAQUE full frame, background included.
 *
 * The shutter is centred on the current frame, so a blurred frame sits where the sharp one would.
 * Render time multiplies by `samples`: wrap only the fast shot, never the whole video.
 */
export const MotionBlur: React.FC<{samples?: number; shutterAngle?: number; children: React.ReactNode}> = ({
  samples = 10,
  shutterAngle = 180,
  children,
}) => {
  const frame = useCurrentFrame();
  const shutter = shutterAngle / 360;
  const n = Math.max(1, Math.round(samples));
  return (
    <AbsoluteFill>
      {Array.from({length: n}, (_, i) => (
        <AbsoluteFill key={i} style={{opacity: 1 / (i + 1)}}>
          <Freeze frame={n === 1 ? frame : frame + (i / (n - 1) - 0.5) * shutter}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

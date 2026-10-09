import React from 'react';
import {useCurrentFrame} from 'remotion';
import {brand, fontFamily} from '../brand';
import {APP_SIZE, Camera, Floor, Layer, PlaceholderApp, Screen, Stage, animate, ease, restCamera} from '../kit';

// Recipe: ORBIT WITH PARALLAX. Two surfaces at different depths; the camera swings around them.
// Nothing moves except the camera, yet the phone slides across the laptop, because it's nearer.
export const Orbit: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = animate(frame, restCamera, [
    [0, {yaw: -16, pitch: 9, dolly: 0, x: 60}],
    [120, {yaw: 20, pitch: 4, dolly: 90, x: 120}, ease.inOut],
  ]);

  return (
    <Stage lens={1700} background={brand.background} font={fontFamily}>
      <Camera pose={camera}>
        <Floor y={420} />
        <Layer x={-170} scale={0.8}>
          <Screen width={APP_SIZE.width} height={APP_SIZE.height} title={brand.name}>
            <PlaceholderApp accent={brand.accent} />
          </Screen>
        </Layer>
        <Layer x={560} y={30} z={260} ry={-14}>
          <Screen width={340} height={700} frame="phone">
            <PhoneApp />
          </Screen>
        </Layer>
      </Camera>
    </Stage>
  );
};

const PhoneApp: React.FC = () => (
  <div style={{fontFamily, color: brand.ink, padding: '70px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12}}>
    <div style={{fontSize: 28, fontWeight: 800}}>Agents</div>
    {['claude-1 · working', 'codex · needs you', 'claude-2 · done'].map((row, i) => (
      <div
        key={row}
        style={{
          padding: 16,
          borderRadius: 16,
          fontSize: 17,
          background: i === 1 ? 'rgba(124, 92, 255, 0.22)' : 'rgba(255,255,255,0.06)',
          border: i === 1 ? `1px solid ${brand.accent}` : '1px solid transparent',
        }}
      >
        {row}
      </div>
    ))}
  </div>
);

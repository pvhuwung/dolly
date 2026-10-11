import React from 'react';
import {AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {brand, fontFamily, monoFamily} from './brand';
import {Footage, Layer, Screen, Stage, focusOn, moves, useShot, whole} from './kit';
import {MAC, PANE, PHONE} from './scenes/takes';

// The sample reel: every move in `moves` (kit.tsx), a few seconds each, on the starter's window,
// labelled with the line that makes it. Render it to see them all:
//
//   npx remotion render Moves out/moves.mp4

const LENS = 1800;
type Framing = ReturnType<typeof focusOn>;
type Framings = {wide: Framing; left: Framing; right: Framing};

const MOVES: {code: string; seconds: number; phone?: boolean; keys: (f: Framings) => ReturnType<typeof moves.pan>}[] = [
  {code: 'moves.tiltIn(wide)', seconds: 4, keys: (f) => moves.tiltIn(f.wide)},
  {code: 'moves.zoomIn(wide, pane)', seconds: 4, keys: (f) => moves.zoomIn(f.wide, f.left)},
  {code: 'moves.zoomOut(pane, wide)', seconds: 4, keys: (f) => moves.zoomOut(f.right, f.wide)},
  {code: 'moves.focus(wide, pane)', seconds: 5, keys: (f) => moves.focus(f.wide, f.left, {start: 10, hold: 50})},
  {code: 'moves.pan(left, right)', seconds: 4, keys: (f) => moves.pan(f.left, f.right, {start: 15, frames: 80})},
  {code: 'moves.orbit(wide, {degrees: 36})', seconds: 4, phone: true, keys: (f) => moves.orbit(f.wide, {degrees: 36})},
  {code: 'moves.pushThrough(wide, LENS, {start: 80})', seconds: 4, keys: (f) => moves.pushThrough(f.wide, LENS, {start: 80})},
];

export const MOVES_FRAMES = MOVES.reduce((sum, m) => sum + m.seconds * 30, 0);

const Demo: React.FC<{move: (typeof MOVES)[number]}> = ({move}) => {
  const video = useVideoConfig();
  const frame = (rect: Parameters<typeof focusOn>[0]['rect'], fill: number) => focusOn({rect, size: MAC, video, lens: LENS, fill});
  const f = {wide: frame(whole(MAC), 0.8), left: frame(PANE.leftTop, 0.5), right: frame(PANE.browser, 0.5)};
  const camera = useShot(move.keys(f), {dolly: 30});
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <Stage camera={camera} lens={LENS} background={brand.background} font={fontFamily}>
        <Layer>
          <Screen frame="none" width={MAC.width} height={MAC.height} glare={0.4}>
            <Footage src={MAC.src} at={20} />
          </Screen>
        </Layer>
        {move.phone ? (
          <Layer x={620} y={60} z={320} ry={-6} scale={0.7}>
            <Screen frame="phone" width={PHONE.width} height={PHONE.height} glare={0.4}>
              <Footage src={PHONE.src} at={20} />
            </Screen>
          </Layer>
        ) : null}
      </Stage>
      <div
        style={{
          position: 'absolute',
          left: 60,
          bottom: 56,
          padding: '14px 22px',
          borderRadius: 14,
          background: brand.card,
          boxShadow: '0 8px 30px rgba(20,19,16,0.12)',
          fontFamily: monoFamily,
          fontSize: 30,
          fontWeight: 600,
          color: brand.ink,
        }}
      >
        {move.code}
      </div>
    </AbsoluteFill>
  );
};

export const Moves: React.FC = () => (
  <Series>
    {MOVES.map((m) => (
      <Series.Sequence key={m.code} name={m.code} durationInFrames={m.seconds * 30}>
        <Demo move={m} />
      </Series.Sequence>
    ))}
  </Series>
);

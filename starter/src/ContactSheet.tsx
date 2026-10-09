import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Freeze, Sequence} from 'remotion';
import {SCENE_COMPONENTS, Showcase} from './Showcase';
import {FPS, HEIGHT, SCENES, SceneId, TOTAL_FRAMES, WIDTH, sceneFrames, sceneStart} from './timeline';

// One PNG that shows the video every `every` frames: the fastest way to review motion without
// watching it. Each cell is the real scene frozen at that frame, so what you see is what renders.
//
//   npx remotion still Sheet out/sheet.png                                       # whole video, 1 per second
//   npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6}' # one scene, 5 per second

export type SheetProps = {scene: SceneId | 'all'; every: number; columns: number};

const CELL_W = 480;
const CELL_H = Math.round((CELL_W * HEIGHT) / WIDTH);
const LABEL = 28;
const GAP = 8;

const lengthOf = (scene: SheetProps['scene']) => (scene === 'all' ? TOTAL_FRAMES : sceneFrames(scene));

const framesFor = ({scene, every}: SheetProps) => {
  const length = lengthOf(scene);
  const frames: number[] = [];
  for (let f = 0; f < length; f += Math.max(1, every)) frames.push(f);
  if (frames[frames.length - 1] !== length - 1) frames.push(length - 1);
  return frames;
};

const sceneAt = (frame: number) => {
  let id: SceneId = SCENES[0].id;
  for (const s of SCENES) if (frame >= sceneStart(s.id)) id = s.id;
  return id;
};

export const sheetMetadata: CalculateMetadataFunction<SheetProps> = ({props}) => {
  const rows = Math.ceil(framesFor(props).length / props.columns);
  return {
    width: props.columns * (CELL_W + GAP) + GAP,
    height: rows * (CELL_H + LABEL + GAP) + GAP,
    // Remotion clamps every frame, frozen ones included, to the composition's own length, so the
    // sheet must be as long as what it samples. Rendering a still uses its frame 0 regardless.
    durationInFrames: lengthOf(props.scene),
  };
};

export const ContactSheet: React.FC<SheetProps> = (props) => {
  const Scene = props.scene === 'all' ? Showcase : SCENE_COMPONENTS[props.scene];
  return (
    <AbsoluteFill
      style={{background: '#101014', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: GAP, padding: GAP}}
    >
      {framesFor(props).map((f) => {
        const label = props.scene === 'all' ? `${sceneAt(f)} · ` : '';
        return (
          <div key={f} style={{width: CELL_W}}>
            <div style={{width: CELL_W, height: CELL_H, overflow: 'hidden', position: 'relative'}}>
              <div
                style={{position: 'absolute', width: WIDTH, height: HEIGHT, transform: `scale(${CELL_W / WIDTH})`, transformOrigin: '0 0'}}
              >
                {/* The Sequence restores the scene's own size and length for useVideoConfig(). */}
                <Sequence width={WIDTH} height={HEIGHT} durationInFrames={lengthOf(props.scene)} layout="none">
                  <Freeze frame={f}>
                    <Scene />
                  </Freeze>
                </Sequence>
              </div>
            </div>
            <div style={{height: LABEL, lineHeight: `${LABEL}px`, font: '15px system-ui, sans-serif', color: '#9a9aa5'}}>
              {label}
              {`frame ${f} · ${(f / FPS).toFixed(2)}s`}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';

// CSS 3D, set up like a film set: a Stage (the lens), one Camera that moves, and Layers placed in
// the world. Move the camera, not the objects: everything at a different depth then gets parallax
// for free, and one camera path reads as one shot.
//
// Axes are CSS's: x right, y DOWN, z toward the viewer. Units are px of the composition.

export type CameraPose = {
  /** The point the camera looks at and orbits around. */
  x: number;
  y: number;
  z: number;
  /** Degrees. Positive swings the camera right around the target, so you see more of its right side. */
  yaw: number;
  /** Degrees. Positive raises the camera so it looks down on the target (and the floor shows). */
  pitch: number;
  /** Degrees. Dutch angle. Use sparingly. */
  roll: number;
  /** Px toward the target. 0 is the rest distance (the lens); lens * 0.5 makes the target 2x bigger. */
  dolly: number;
};

export const restCamera: CameraPose = {x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, dolly: 0};

const CameraContext = createContext<CameraPose>(restCamera);

/** The current camera, for things that react to it (glare that slides as the camera turns). */
export const useCamera = () => useContext(CameraContext);

export const preserve3d: React.CSSProperties = {transformStyle: 'preserve-3d'};

/**
 * The lens. `lens` is the CSS perspective distance in px: ~1000 is wide and dramatic (strong
 * convergence), ~1800 is a natural product shot, 3000+ is a flat telephoto.
 */
export const Stage: React.FC<{
  lens?: number;
  background?: string;
  /** Inherited by everything in the shot, so mock UI never falls back to Times. */
  font?: string;
  children: React.ReactNode;
}> = ({lens = 1800, background, font = 'system-ui, -apple-system, "Segoe UI", sans-serif', children}) => (
  <AbsoluteFill style={{perspective: lens, perspectiveOrigin: '50% 50%', background, fontFamily: font, overflow: 'hidden'}}>
    {children}
  </AbsoluteFill>
);

/** The world, seen from `pose`. Put every Layer of the shot inside one Camera. */
export const Camera: React.FC<{pose?: Partial<CameraPose>; children: React.ReactNode}> = ({pose, children}) => {
  const p = {...restCamera, ...pose};
  // Read right to left: centre the target, orbit around it, then move toward it.
  const transform =
    `translateZ(${p.dolly}px) rotateZ(${-p.roll}deg) rotateX(${-p.pitch}deg) rotateY(${-p.yaw}deg) ` +
    `translate3d(${-p.x}px, ${-p.y}px, ${-p.z}px)`;
  return (
    <CameraContext.Provider value={p}>
      <AbsoluteFill style={{...preserve3d, transform}}>{children}</AbsoluteFill>
    </CameraContext.Provider>
  );
};

export type Place = {x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number};

export const restPlace: Place = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1};

/**
 * Puts its child's CENTRE at (x, y, z) in the world. `ry` > 0 turns it to face right, `rx` > 0
 * leans it back to face up (a floor is rx: 90). Layers nest: a child Layer is placed relative to
 * its parent, so a group of things can be moved as one.
 *
 * Never put opacity < 1, filter, overflow: hidden, clip-path or mask on a Layer: CSS flattens any
 * element with those into a 2D picture, and its children lose their depth. Put them on the leaf
 * content inside instead.
 */
export const Layer: React.FC<
  Partial<Place> & {children: React.ReactNode; style?: React.CSSProperties}
> = ({children, style, ...place}) => {
  const p = {...restPlace, ...place};
  const transform =
    `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) ` +
    `rotateZ(${p.rz}deg) scale(${p.scale})`;
  return (
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, ...preserve3d, transform}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 'max-content',
          ...preserve3d,
          transform: 'translate(-50%, -50%)',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

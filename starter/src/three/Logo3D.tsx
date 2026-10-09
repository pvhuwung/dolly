import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';

// Real 3D for the one thing CSS can't fake: a solid object with thickness, bevels and reflections.
// An SVG logo is extruded, lit by a generated studio environment (no HDR file to ship), and flown
// in. Everything moves from useCurrentFrame(), never from r3f's useFrame: Remotion renders frames
// out of order and in parallel, so anything driven by a clock or by state renders wrong.

/** Gives metals and clearcoat something to reflect. Without it, shiny materials look flat grey. */
const StudioLight: React.FC = () => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

/** Each SVG path becomes one extruded mesh in that path's fill colour, centred on the origin. */
const ExtrudedSvg: React.FC<{svg: string; depth: number}> = ({svg, depth}) => {
  const parts = useMemo(() => {
    const {paths} = new SVGLoader().parse(svg);
    return paths.map((path) => ({
      color: path.color,
      geometry: new THREE.ExtrudeGeometry(path.toShapes(), {
        depth,
        bevelEnabled: true,
        bevelThickness: 2.5,
        bevelSize: 1.5,
        bevelSegments: 8,
        curveSegments: 64,
      }),
    }));
  }, [svg, depth]);

  const center = useMemo(() => {
    const box = new THREE.Box3();
    for (const p of parts) {
      p.geometry.computeBoundingBox();
      if (p.geometry.boundingBox) box.union(p.geometry.boundingBox);
    }
    return box.getCenter(new THREE.Vector3());
  }, [parts]);

  useLayoutEffect(() => () => parts.forEach((p) => p.geometry.dispose()), [parts]);

  // SVG's y points down and three's points up, hence the -1.
  return (
    <group scale={[1, -1, 1]}>
      <group position={[-center.x, -center.y, -center.z]}>
        {parts.map((p, i) => (
          <mesh key={i} geometry={p.geometry}>
            <meshPhysicalMaterial color={p.color} metalness={0.35} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const FlyIn: React.FC<{svg: string; start: number}> = ({svg, start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - start, fps, config: {damping: 18, mass: 0.9, stiffness: 70}});
  // Arrives spinning from behind the camera's left, settles, then keeps a slow idle turn so the
  // highlights keep sliding across the bevels.
  const idle = Math.sin((frame - start) / 38) * 0.18;
  return (
    <group
      position={[0, 12, (1 - t) * -260]}
      rotation={[(1 - t) * 0.6, (1 - t) * -Math.PI * 1.1 + idle, (1 - t) * 0.25]}
      scale={0.6 + 0.4 * t}
    >
      <ExtrudedSvg svg={svg} depth={14} />
    </group>
  );
};

/** A transparent canvas: put it over any CSS background. */
export const Logo3D: React.FC<{svg: string; start?: number; accent?: string}> = ({svg, start = 0, accent = '#7c5cff'}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} camera={{fov: 30, position: [0, 0, 340], near: 1, far: 3000}}>
      <StudioLight />
      <ambientLight intensity={0.25} />
      <directionalLight position={[120, 160, 220]} intensity={2.2} />
      <directionalLight position={[-180, 60, -200]} intensity={3} color={accent} />
      <FlyIn svg={svg} start={start} />
    </ThreeCanvas>
  );
};

# Real 3D with three.js

CSS 3D (the kit) handles flat things in space: screens, cards, type. Use three.js when the thing
itself has thickness or a material: a logo with bevels and reflections, a device model, a product,
particles, an abstract environment. Don't put UI on a three.js plane when a CSS `Screen` would do.
CSS text is sharper and much easier to lay out.

`starter/src/three/Logo3D.tsx` is the worked example: an SVG logo extruded, lit by a generated studio
environment, flown in.

## Rules

- **Drive everything from `useCurrentFrame()`.** Never use r3f's `useFrame`, clocks, physics steps
  or state that accumulates. Remotion renders frames out of order and in parallel; `ThreeCanvas`
  renders exactly once per Remotion frame.
- **`<ThreeCanvas width height>`** from `@remotion/three`, sized from `useVideoConfig()`. It's
  transparent by default, so it sits on top of any CSS background, and DOM type can go above it.
- **WebGL needs a GPU renderer in headless Chrome.** The starter's `remotion.config.ts` sets
  `Config.setChromiumOpenGlRenderer('angle')`. If a render shows an empty canvas while the Studio
  looks fine, this is why. On a Linux server without a GPU, `swangle` (software) works but is slow.
- **Loading is handled.** `ThreeCanvas` holds the render while anything suspends, so
  `useLoader(GLTFLoader, staticFile('model.glb'))` from `@react-three/fiber` is safe. For loaders
  outside Suspense, wrap the load in `delayRender()` / `continueRender()`.
- **Each `ThreeCanvas` is a WebGL context.** Browsers allow about 16. Keep one canvas per scene, and
  note that the contact sheet renders one per cell for 3D scenes, so use a larger `every` for them.
- **Don't wrap a `ThreeCanvas` in `MotionBlur`.** It renders its children once per sample, and
  that means one canvas per sample. Fake blur in 3D with a faster ease instead.
- Keep `three`, `@react-three/fiber` (v8 for React 18) and `@types/three` pinned together.

## Your logo in 3D

`brand.ts` → `logoSvg`. The SVG needs **filled paths**:
- strokes don't extrude: outline them first (Figma: Outline Stroke; Illustrator: Outline Stroke);
- text doesn't extrude: convert it to outlines;
- holes work through `fill-rule="evenodd"` or opposite winding;
- each path keeps its own fill colour, so a two-colour logo becomes two materials.

Tune `depth` (thickness, in SVG units) and the bevel in `ExtrudedSvg`. Thin logos want a deeper
extrusion. Check a still at the end of the fly-in and one mid-spin: the mid-spin frame is where a
missing bevel or inverted faces show.

## Materials and light

- `meshPhysicalMaterial` with `metalness` 0.2–0.5, `roughness` 0.15–0.35 and `clearcoat` 1 reads
  as premium plastic or anodised metal. Pure `metalness: 1` needs an interesting environment to
  reflect or it goes black.
- `StudioLight` (in `Logo3D.tsx`) generates a soft room reflection from three's `RoomEnvironment`,
  so you don't need to ship an HDR file. Add a key light from the top right and a coloured rim light
  from behind in the brand accent; the rim is what separates the logo from a dark background.
- Motion makes materials. A slow idle rotation keeps highlights sliding across the bevels. A
  perfectly still 3D logo looks like a 2D render.

## Footage on a 3D surface

Video on a three.js mesh needs a different hook in the Studio and in the render:

```tsx
import {useOffthreadVideoTexture, useVideoTexture} from '@remotion/three';
import {Video, staticFile, useRemotionEnvironment} from 'remotion';

const RenderTexture: React.FC<{src: string}> = ({src}) => {
  const texture = useOffthreadVideoTexture({src}); // only allowed while rendering
  return texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : null;
};
const PreviewTexture: React.FC<{video: React.RefObject<HTMLVideoElement | null>}> = ({video}) => {
  const texture = useVideoTexture(video);
  return texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : null;
};
// In the scene: const {isRendering} = useRemotionEnvironment();
// isRendering ? <RenderTexture src={staticFile('clip.mp4')} />
//             : <PreviewTexture video={ref} />, with <Video ref={ref} src={...} style={{display: 'none'}} />
//               rendered OUTSIDE the ThreeCanvas.
```

Most of the time a CSS `Screen` with `Footage`, placed in front of a three.js background, looks the
same and is far simpler. Reach for this only when the screen must be part of a 3D model (a laptop
whose lid opens, a phone that rotates past 90°).

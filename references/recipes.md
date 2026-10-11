# Shot recipes

More moves for the kit in `starter/src/kit.tsx`, each rendered and checked. Frames assume 30 fps.
Coordinates are px; y points down, z toward the viewer. `content` stands for whatever goes in the
screen: `<Footage ... />` or the starter's `<DemoApp />`.

The starter's own scenes cover the core moves: `Hero` (tilt-in with drift), `Orbit` (two screens
with parallax), `Focus` (push-in on a detail, then push through), `End` (3D logo card).

## From 3D to full-frame footage

Push in until the screen exactly fills the frame, then cut to the same take, full frame and flat.
The cut is invisible, and the video goes from a 3D world to plain, sharp footage.

```tsx
const video = useVideoConfig();
const full = focusOn({rect: {x: 0, y: 0, width: 1600, height: 900}, screen: {width: 1600, height: 900}, video, lens: 1800, fill: 1});
const camera = animate(frame, [[0, {yaw: -10, dolly: -300, x: 0, y: 0}], [45, {...full, yaw: 0}, ease.inOut]]);
<Stage camera={camera}>
  <Layer><Screen frame="none" width={1600} height={900}>{content}</Screen></Layer>
</Stage>
// The next scene: <Footage src="takes/A-mac.mov" at={sameMoment} crop={WINDOW} /> in an AbsoluteFill.
```

The screen's aspect ratio must match the video's (16:9) for `fill: 1` to cover it edge to edge.

## Fly-past with motion blur

Screens in a row, receding; the camera trucks along them fast. Anything that crosses the frame in
under half a second strobes without motion blur, so this shot gets it. Wrap the scene's content
(background included: the blur needs an opaque frame) in `MotionBlur`:

```tsx
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

// Renders the shot `samples` times across the shutter and averages them. Each sample goes over the
// ones before at opacity 1/(i+1), which leaves an exact mean (@remotion/motion-blur bands dark
// gradients instead). Render time multiplies by `samples`: wrap only the fast shot.
const MotionBlur: React.FC<{samples?: number; children: React.ReactNode}> = ({samples = 10, children}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({length: samples}, (_, i) => (
        <AbsoluteFill key={i} style={{opacity: 1 / (i + 1)}}>
          <Freeze frame={frame + (i / (samples - 1) - 0.5) * 0.5}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

const FlyPast: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = animate(frame, [
    [0, {x: -220, z: 0, yaw: -14, pitch: 6, dolly: 120}],
    [104, {x: 1680, z: -1180, yaw: -26, pitch: 3, dolly: 260}, ease.inOut],
  ]);
  return (
    <Stage camera={camera} lens={1500} background={brand.background}>
      {[0, 1, 2, 3].map((i) => (
        <Layer key={i} x={i * 560} z={-i * 390} ry={24} scale={0.62}>
          <Screen width={1280} height={800}>{content}</Screen>
        </Layer>
      ))}
    </Stage>
  );
};
// In the scene list: <MotionBlur><FlyPast /></MotionBlur>
```

## Dolly zoom

The subject keeps its size while the world behind it stretches: a "something just changed" move,
once per video at most. In CSS 3D it's just the lens: anything at z = 0 keeps its size.

```tsx
const {lens} = animate(frame, [[0, {lens: 3200}], [90, {lens: 900}, ease.inOut]]);
<Stage lens={lens}>
  <Floor y={300} />
  <Layer z={-1500} y={-300}>
    <div style={{fontSize: 320, fontWeight: 800, color: 'rgba(255,255,255,0.12)'}}>EVERYTHING ELSE</div>
  </Layer>
  <Layer scale={0.55}><Screen width={1280} height={800}>{content}</Screen></Layer>
</Stage>
```

The background must be far back and much wider than the subject: as the lens widens it shrinks
toward the centre, and anything that ends up behind the subject is hidden.

## Text behind the product

Big type sits deep behind the product, so as the camera moves, the product slides across it.

```tsx
<Layer z={-600} y={-40}>
  <div style={{fontSize: 260, fontWeight: 800, color: 'rgba(255,255,255,0.08)'}}>AGENTS</div>
</Layer>
<Layer z={150} x={380}><Screen frame="phone" width={340} height={700}>{content}</Screen></Layer>
```

Keep it low-contrast: it's texture, not copy. Anything people must read goes in front.

## Reflection

A flipped copy under the screen, fading out. The fade goes on an inner div, never on the Layer, or
the Layer flattens.

```tsx
const H = 800;
<Layer y={H + 12}>
  <div style={{transform: 'scaleY(-1)', opacity: 0.25,
               maskImage: 'linear-gradient(to top, black, transparent 40%)',
               WebkitMaskImage: 'linear-gradient(to top, black, transparent 40%)'}}>
    <Screen width={1280} height={H} shadow={0} glare={0}>{content}</Screen>
  </div>
</Layer>
<Layer><Screen width={1280} height={H}>{content}</Screen></Layer>
```

The copy sits at the screen's `y + height × scale + gap`, with the same `x`, `z` and `scale`, and
shows the same footage at the same `at`, so the two play in sync. It only reads on bright content:
a dark UI's reflection disappears into a dark background. Drop the `Floor` with it.

## Turn-around reveal

A card spins half a turn to show its back: before and after, the old way and the new way.

```tsx
const {turn} = animate(frame, [[20, {turn: 0}], [50, {turn: 180}, ease.inOut]]);
<Layer ry={turn}>
  <div style={{position: 'relative', transformStyle: 'preserve-3d'}}>
    <div style={{backfaceVisibility: 'hidden'}}><Screen width={1280} height={800}>{before}</Screen></div>
    <div style={{position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}}>
      <Screen width={1280} height={800}>{after}</Screen>
    </div>
  </div>
</Layer>
```

At exactly 90° the card is edge-on and invisible for a frame, which is expected. Push the camera in a
little (dolly +60) during the turn, or it looks like a slideshow transition.

## Push-through transition

End scene A by dollying into a surface until it fills the frame (`dolly` to `lens * 0.97` with
`ease.in` over the last 15–25 frames, as `Focus` does). Start scene B already moving the same way,
arriving from `dolly: -300` with `ease.out`. If the surface's colour matches B's background, the two
read as one move.

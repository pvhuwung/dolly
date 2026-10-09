# Shot recipes

Each recipe is a camera idea plus the code for it, using the kit in `starter/src/kit`. Frame numbers
assume 30 fps; scale them for 60. Coordinates are px, y points down, z points at the viewer.

The five recipes the starter already shows, with the file to copy from:

| Recipe | File | Use it for |
|---|---|---|
| Tilt-in + drift | `scenes/Hero.tsx` | Opening on the product |
| Orbit with parallax | `scenes/Orbit.tsx` | Two surfaces that work together (desktop + phone) |
| Push-in, hold, push-through | `scenes/Focus.tsx` | Making one detail of the UI the subject |
| Fly-past with motion blur | `scenes/Fan.tsx` | "Many of these": parallel runs, a list of features |
| 3D logo end card | `scenes/End.tsx` | Name and call to action |

## Keyframes in one paragraph

`animate(frame, restCamera, keys)` returns a full pose. A key is `[frame, {fields}, easeIntoThisKey]`
and pins only the fields it names, so different fields can have different timing in one list. The
ease on a key shapes the segment that ends there. Before the first key a field holds its first
value, after the last key its last value. For a slow constant drift on top, add it after:
`{...pose, yaw: pose.yaw + 6 * (frame / durationInFrames)}`.

## Screen to full frame (3D into flat footage)

Push in until the screen's content exactly fills the frame, then cut to the same footage full frame.
The cut is invisible and the video switches from a 3D world to plain, sharp footage.

```tsx
const full = focusOn({
  rect: {x: 0, y: 40, width: APP_SIZE.width, height: APP_SIZE.height - 40}, // skip the title bar
  layer: {}, size: APP_SIZE, frame: {width, height}, lens: LENS, fill: 1,
});
const camera = animate(frame, restCamera, [[0, {yaw: -8, dolly: -200}], [40, {...full, yaw: 0}, ease.inOut]]);
// ...and the next scene is <Footage src="same.mov" from={sameFrame} /> in an AbsoluteFill.
```

The content's aspect ratio must match the frame (16:9) for `fill: 1` to cover it edge to edge.

## Dolly zoom (vertigo)

The subject stays the same size while the world behind it stretches. In CSS 3D this is just the lens:
anything at z = 0 keeps its size whatever the perspective, and everything else changes.

```tsx
const lens = track(frame, [[0, 3200], [90, 900, ease.inOut]]);
<Stage lens={lens}>
  <Camera pose={{pitch: 8}}>
    <Floor />                                    {/* stretches */}
    <Layer z={-900} y={-420}><Words text="Everything else" /></Layer>  {/* rushes away */}
    <Layer><Screen ... /></Layer>                {/* z = 0: holds its size */}
  </Camera>
</Stage>
```

Far things must sit outside the subject's silhouette (here, above it), or the subject hides the
effect. Use once per video at most. It's a "something just changed" move.

## Text behind the product (split depth)

Big type sits deeper than the product, so as the camera moves the product slides across it.

```tsx
<Layer z={-600} y={-40}>
  <div style={{fontSize: 260, fontWeight: 800, color: 'rgba(255,255,255,0.08)'}}>AGENTS</div>
</Layer>
<Layer z={150} x={380}><Screen frame="phone" width={340} height={700}>...</Screen></Layer>
```

Keep the background type low-contrast: it's texture, not copy. Anything people must read goes in
front.

## Reflection on a glossy floor

A flipped copy under the screen, fading out. The fade (a mask) goes on an inner div, never on the
Layer, or the Layer flattens.

```tsx
const H = APP_SIZE.height;
<Layer y={H + 12}>
  <div style={{transform: 'scaleY(-1)', opacity: 0.25,
               maskImage: 'linear-gradient(to top, black, transparent 40%)',
               WebkitMaskImage: 'linear-gradient(to top, black, transparent 40%)'}}>
    <Screen width={APP_SIZE.width} height={H} shadow={0} glare={0}><Footage src="clip.mov" /></Screen>
  </div>
</Layer>
```

The real screen sits at y = 0 here; in general put the copy at `screenY + H * scale + gap`, with
the same x, z and scale as the real screen, and render the same `Footage` (same `from`)
so the reflection plays in sync. Drop the Floor grid when you use reflections: pick one ground.

## Turn-around reveal

A card spins half a turn to reveal its back: before/after, the old way/the new way.

```tsx
const turn = track(frame, [[20, 0], [50, 180, ease.inOut]]);
<Layer ry={turn}>
  <div style={{position: 'relative', transformStyle: 'preserve-3d'}}>
    <div style={{backfaceVisibility: 'hidden'}}><Screen ...>{before}</Screen></div>
    <div style={{position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}}>
      <Screen ...>{after}</Screen>
    </div>
  </div>
</Layer>
```

At exactly 90° the card is edge-on and invisible for a frame; that's expected. Push the camera in
slightly (dolly +60) during the turn, or the spin looks like a slideshow transition.

## Rack focus (depth of field)

Blur what's not the subject, and shift the focus when the subject changes. The blur goes on a div
around the Screen, inside the Layer.

```tsx
const focusZ = track(frame, [[0, 0], [45, 260, ease.inOut]]); // from the window to the phone
const blur = (z: number) => Math.min(8, Math.abs(z - focusZ) / 40);
<Layer z={0}><div style={{filter: `blur(${blur(0)}px)`}}><Screen ... /></div></Layer>
<Layer z={260} x={520}><div style={{filter: `blur(${blur(260)}px)`}}><Screen frame="phone" ... /></div></Layer>
```

Blur is expensive to render. Use it on a shot or two, not everywhere.

## Click highlight on footage

Show where the user clicked: a ring that pops at the click and fades. Position it in the Screen's
content coordinates, as a child next to the footage.

```tsx
const Click: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 18});
  if (frame < at || frame > at + 24) return null;
  return <div style={{position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56,
    borderRadius: 28, border: '3px solid white', transform: `scale(${0.4 + t})`, opacity: 1 - t}} />;
};
```

Captures with `screencapture -k` already draw clicks; don't add a second ring on top.

## Device pair

Desktop and phone together tell "it follows you". Put the phone nearer (z 200–300) and to one side,
turned slightly toward the centre (`ry` -10 to -15 when it sits on the right), and orbit. See
`scenes/Orbit.tsx`.

## Stack / cascade

Many cards along a line in depth, the camera travelling along them: `scenes/Fan.tsx`. To make it a
vertical stack instead, change x to y and turn `ry` into `rx`. Stagger their content (each card's
footage starts later) so the cards don't move in lockstep.

## Kinetic title beats

- One line, `Words`, centred, 64–96 px at 1080p. Swing in, hold, then leave with `exit`.
- For a statement that lands on a music hit, set `start` so the LAST word lands on the beat.
- Don't stack more than two lines of kinetic type; past that, use a plain fade.

## Push-through as a transition

End scene A by dollying into a surface until it fills the frame (`dolly` → `lens * 0.97`, ease.in,
the last 15–25 frames). Start scene B already moving the same way: arriving from `dolly: -300` with
ease.out. Cut on the bar line. If the surface's colour matches B's background, it reads as one move.

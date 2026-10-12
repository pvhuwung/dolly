# Shots from takes: the 3D kit and camera moves

Read this when a scene is built from a recording: a window, a pane or a phone floating in 3D, with
the camera moving over it. The camera moves; the things stay put.

```tsx
const look = useLook();
const video = useVideoConfig();
const wide = focusOn({rect: whole(MAC), size: MAC, video, lens: 1800, fill: 0.94, ...look.aim});
const camera = useShot([[0, wide]], {dolly: 40});   // hold the framing, drift 40 px closer
<AbsoluteFill>
  <Backdrop />
  <Stage camera={camera} lens={1800} font={look.fonts.body}>
    <Layer>
      <Clip src="takes/A-mac.mov" at={25.5} region={WINDOW} />
    </Layer>
  </Stage>
  <Caption eyebrow="Needs you" title="One stops and asks." accent="Its pane lights up." />
</AbsoluteFill>
```

`Clip` cuts a region (in screen points, measured on a frame of the take) out of a take and floats
it; its children are placed in the region's own points, so `within(REGION, BUTTON)` places a
`Callout` or `Tap` on it. A phone take goes in `<Screen frame="phone" width={416} height={876}>`
with a `Footage`. `focusOn` gives the camera values that frame a rect; `look.aim` keeps the subject
between the caption band and the platform's buttons. On `Clip` and `Footage`, `at` is seconds into
the recording (where `npm run scan` puts its holds); everywhere else, `start` is a frame.

| Piece | What it does |
|---|---|
| `Stage camera lens` | One shot. Camera: `x y z` is the target, `yaw` + swings right, `pitch` + looks down, `dolly` + moves closer. `lens`: 1000 dramatic, 1800 natural, 3000 flat |
| `Layer x y z rx ry rz scale` | Puts its child's centre at a point in the world. `ry` + faces right; `rx` 90 lies flat |
| `Screen` | `frame="window"`, `"phone"` or `"none"`, with a shadow and a glare that follows the camera |
| `Clip`, `Footage` | A region of a take as a card; a take or image filling its parent (`at`, `speed`, `crop`) |
| `Floor` | A grid floor: it makes big camera moves read as moving through space |
| `animate(frame, keys)` | Keyframes `[frame, {values}, ease]`; a key sets only the values it names |
| `useShot(keys, drift)` | A shot's camera: `animate` plus a slow drift added over the whole shot |
| `focusOn({rect, size, ...})` | The camera values that frame `rect` of a card of `size`; `layer` if the card isn't at the origin |

**Camera moves** turn framings into keyframes, and chain with `start` (`npm run moves` renders a
reel of them): `moves.tiltIn(at)` to open, `zoomIn(wide, detail)` to make a detail the subject,
`zoomOut(detail, wide)` to reveal where it lives, `focus(wide, detail)` in and back out, `pan(from,
to)` along a wide screen, `orbit(at)` for parallax, `pushThrough(at, lens)` to fly into the screen
as the scene ends. `recipes.md` has bigger ones: a fly-past with motion blur, a dolly zoom, text
behind the product, a reflection, a turn-around reveal.

**Every format.** Re-aim shots for tall frames, never crop the 16:9 one: push in to the one pane
that matters, stack what sat side by side, bring the phone forward. `Hook` and `Approve` in the
starter show both layouts.

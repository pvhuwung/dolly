# Gotchas

Read this when something renders wrong, or before writing a new component.

- `opacity`, `filter`, `overflow: hidden`, `mask` or `clip-path` on an element flattens its
  children. Put them on content inside a `Screen`, never on a `Layer`.
- Everything must be a function of `useCurrentFrame()`: no `Math.random()` (use `random(seed)`),
  no CSS animations or transitions, no state. Remotion renders frames out of order.
- Footage can't be pushed past its own pixels: keep the zoom at or below the take's pixels per
  point (2 for a Retina take). Lower `fill` if a close-up looks soft.
- `AbsoluteFill` is 100% wide and tall, so `left`/`right` insets on it move it rather than shrink
  it: inset a plain `position: absolute` div instead.
- `alpha()` and `mix()` return CSS `color-mix()` strings: fine in styles, but Remotion's
  `interpolateColors` rejects them. Interpolate between plain hex or rgba colours there.
- Remotion's bundled ffmpeg is minimal: no `fps`, `hstack`, `tile` or `volumedetect` filters and no
  `rawvideo` muxer. For a frame strip use `-r 1` output (its first cells can repeat frame 0; check
  those with `-ss`); for raw frames, `-f image2pipe -c:v rawvideo`.
- `focusOn`'s `size` is only a size. A region's own `x`/`y` are page coordinates, not where the
  card is on the stage: pass `size: {width, height}` and, if it moved, `layer`.
- The shader transitions (`zoomBlur`, `filmBurn`, `bookFlip`, …) show an error in the Studio unless
  Chrome has `chrome://flags/#canvas-draw-element` on, and in heavy scenes they can drop a layer
  from frames, even after the transition. Use one only as an accent, and check every frame of the
  final render around it; the styles' defaults are all plain DOM transitions.
- A take outside `public/` can't be played: `staticFile` only reaches files in `public/`.

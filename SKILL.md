---
name: dolly
description: Make polished product, launch and demo videos with 3D motion, written as code in Remotion — camera moves through space, floating screens, parallax, push-ins on UI, kinetic type, a 3D logo — from screen recordings you take yourself. Use when asked to make, edit or improve a video, trailer, launch/demo/promo/explainer/social clip, motion graphics, an animated logo or title card, or to turn screen recordings into a video.
---

# dolly: 3D motion videos in code

The video is a Remotion project: React components rendered frame by frame. `starter/` next to
this file is a working 22-second video; you turn it into theirs. The pipeline:

**plan → record takes → build shots → review the frames → render**

You can't watch video, so you review it by rendering contact sheets and reading the PNGs. Do that
after every change: most bad motion is visible in a sheet.

## 1. Start

```sh
cp -R <this skill's folder>/starter ./my-video && cd my-video && npm install
npx remotion studio            # optional: the user can scrub it at localhost:3000
```

| File | What's in it |
|---|---|
| `src/brand.ts` | Name, tagline, colours, font. The logo is `public/logo.svg` |
| `src/Video.tsx` | The scenes, in order, with their lengths in seconds |
| `src/scenes/` | One file per shot. `DemoApp` is a stand-in until you have real takes |
| `src/kit.tsx` | The 3D kit (section 4). For an existing Remotion 4.0.320+ project, copy just this file |
| `scripts/take.sh` | Records takes |

Remotion is free for individuals and companies of up to 3 people; bigger companies need a
company license (remotion.pro). Tell the user once if that applies.

## 2. Plan

Settle these with the user, asking only what you can't infer:
- **Where it plays and how long.** Social 15–45 s (plays muted: words on screen, hook in 2 s).
  Launch 45–90 s. Stage demo up to 2 min.
- **The one sentence** the viewer should remember, and the real moment in the product that proves it.
- **The ask** for the end card: a URL, a download, a waitlist.

Then write the scenes in `src/Video.tsx`: a hook (the outcome, not the logo), one scene per
capability, the end card. At most 7 words on screen at once, held 1 s + 0.3 s per word.

## 3. Record takes

Real footage beats any mock. A take is a recording of the whole screen (plus the iOS Simulator,
when one is booted) while the product does one thing. Shots later cut windows out of it.

```sh
scripts/take.sh start A 40     # records 40 s of the MacBook's screen, and returns at once
# ...now drive the app...
scripts/take.sh wait           # until it's saved: public/takes/A-mac.mov (+ A-phone.mov)
npx remotion still Sheet out/A.png --props='{"take":"takes/A-mac.mov","seconds":40}'   # look at it
```

**Drive the app with observee** (the computer-use MCP server, github.com/gettermary/observee)
if it's connected: `open` the app, `read_ui` for refs, then `click`, `type_text`, `press_key`,
`wait_for`. Re-read refs after anything changes the window. Without observee, ask the user to
perform the take while it records.

- **Before recording:** a clean state with believable dummy data, no private data, notifications
  off, big fonts. Put the app on the built-in Retina screen: `take.sh` records that one (2× pixels
  keep push-ins sharp). Keep the window in one place for the whole video.
- **A take is fixed-length** (screencapture only saves when its time is up). Give it more seconds
  than you need; slow actions are fine, because `speed` and `at` fix the pacing later.
- **Read the take's sheet** and note the seconds where things happen: those are your `at` values.
- **Phone:** the Simulator recording only stores frames when its screen changes, and starts a
  moment off from the Mac one. Line them up on an event visible in both (a tap, a notification).
  `xcrun simctl status_bar booted override --time 9:41` first, for a clean status bar.

Use a take in a shot:

```tsx
// observee's list_windows gives the window in screen points; a Retina take is points x 2.
const WINDOW = {x: 1024, y: 404, width: 460, height: 816};
<Screen frame="none" width={WINDOW.width} height={WINDOW.height}>
  <Footage src="takes/A-mac.mov" at={12.5} speed={1.5} crop={WINDOW} />
</Screen>
```

The window in the take has its own title bar, so use `frame="none"`. `width`/`height` set its size
in the world; use the crop's size or anything with the same aspect ratio. The phone take goes in
`<Screen frame="phone" width={392} height={852}>` with no crop.

## 4. Shots

```tsx
const camera = animate(frame, [
  [0, {yaw: -34, pitch: 18, dolly: -1100}],         // far back, high, turned
  [75, {yaw: -6, pitch: 6, dolly: 0}, ease.out],    // arrive and settle
]);
<Stage camera={camera} background={brand.background} font={fontFamily}>
  <Floor />
  <Layer y={70} scale={0.85}>
    <Screen frame="none" width={WINDOW.width} height={WINDOW.height}>
      <Footage src="takes/A-mac.mov" at={3} crop={WINDOW} />
    </Screen>
  </Layer>
</Stage>
```

| Piece | What it does |
|---|---|
| `Stage camera lens` | One shot. Camera: `x y z` is the target, `yaw` + swings right, `pitch` + looks down, `dolly` + moves closer. `lens`: 1000 dramatic, 1800 natural, 3000 flat |
| `Layer x y z rx ry rz scale` | Puts its child's centre at a point in the world. `ry` + faces right; `rx` 90 lies flat |
| `Screen` | `frame="window"`, `"phone"` or `"none"`, with a shadow and a glare that follows the camera |
| `Footage` | A take or an image from `public/`: `at` (seconds in), `speed`, `crop` |
| `Words` | Kinetic type, word by word: `start`, `stagger`, `exit` |
| `Extrude` | A logo with real thickness that catches the light as it turns |
| `Floor` | A grid floor: it makes camera moves read as moving through space |
| `animate(frame, keys)` | Keyframes `[frame, {values}, ease]`; a key sets only the values it names |
| `focusOn(...)` | The camera values that push in until a rect of a screen fills the frame |

The starter scenes are the core moves: `Hero` (tilt-in), `Orbit` (parallax), `Focus` (push-in on
a detail, then push through), `End` (3D logo). `references/recipes.md` has more: a fly-past with
motion blur, a dolly zoom, text behind the product, a reflection, a turn-around reveal, cutting
from 3D to full-frame footage.

**Rules of motion.** Check every shot against them.
1. **Move the camera, not the objects.** One camera path per shot; depth gives the parallax.
2. **One move per shot**, with a reason: reveal, follow, or push toward what matters.
3. **Tilt to arrive, flat to read.** While there's text to read: yaw within ±20°, pitch within
   ±12°, and nearly still.
4. **Ease everything.** `ease.out` to arrive, `ease.in` to leave (faster), `ease.inOut` between
   holds. Bounce only on logos.
5. **Never stop dead.** Add a slow drift on top of the keyed move, as `Hero` does.
6. **Hold long enough to read**, then cut. When in doubt, hold longer and shorten the next scene.
7. **Cut on the beat** (0.5 s at 120 BPM), and keep the direction of motion across the cut.
8. **Restraint.** The product is the star: one showy move per 10 s at most.

**CSS 3D gotchas.**
- `opacity`, `filter`, `overflow: hidden`, `mask` or `clip-path` on an element flattens its
  children. Put them on content inside a `Screen`, never on a `Layer`.
- Everything must be a function of `useCurrentFrame()`: no `Math.random()` (use `random(seed)`),
  no CSS animations or transitions, no state. Remotion renders frames out of order.
- Footage can't be pushed past its own pixels. Takes from the Retina screen give you 2×.

## 5. Review

```sh
npx remotion still Sheet out/sheet.png                                          # the video, 1 frame/s
npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6}'   # one scene, 5 frames/s
npx remotion still Video out/f140.png --frame=140                               # one frame, full size
```

Read every PNG. Check that:
- the first 2 s make sense with no sound and no context;
- anything readable is square to the camera and held (several near-identical cells in a row);
- nothing important is cropped by the frame edge or hidden behind a nearer layer;
- no frame is blank or mirrored (the camera inside or behind something);
- neighbouring cells change smoothly (a jump at 1 frame/s is a jerk: recheck that span at 5/s);
- no private data shows anywhere in any take.

Stills can't show speed. Render a draft (`npx remotion render Video out/draft.mp4 --scale=0.5`)
and ask the user specific questions ("is the push-in at 0:12 too fast?").

## 6. Render

```sh
npx remotion render Video out/video.mp4 --crf=16                  # 1080p
npx remotion render Video out/video-4k.mp4 --crf=16 --scale=2     # 4K: needs 2x takes
npx remotion still Video out/poster.png --frame=150               # thumbnail
```

- **Music** only if the user has the rights to it: `<Audio src={staticFile('music.mp3')} />`
  inside `Video` in `src/Video.tsx`, and set the scene lengths to its beat.
- **Loudness** for the web, with the ffmpeg Remotion ships:
  `npx remotion ffmpeg -i out/video.mp4 -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 out/video-web.mp4`
- **Vertical or square:** a second composition at 1080×1920 with the shots re-aimed, never a crop
  of the 16:9 one.

Finish by telling the user where the file is, how long it runs, and the command to re-render.

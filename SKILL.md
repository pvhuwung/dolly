---
name: dolly
description: Make polished product, launch and demo videos with 3D motion, written as code in Remotion — real screen recordings cut into floating windows, push-ins on UI, a Mac and phone in sync, kinetic headlines, sound cues — from takes you record yourself. Use when asked to make, edit or improve a video, trailer, launch/demo/promo/explainer/social clip, motion graphics, an animated logo or title card, or to turn screen recordings or a website into a video.
---

# dolly: 3D motion videos in code

The video is a Remotion project: React components rendered frame by frame. `starter/` next to
this file is a working 41-second video, cut from Termary's launch video with its real takes: a
hook, the logo, an agent that needs you, approving it from the phone, the end card. You turn it
into theirs, keeping what makes it work (section 4). The pipeline:

**plan → record takes → build shots → review the frames → render**

You can't watch video, so you review it by rendering contact sheets and reading the PNGs. Do that
after every change: most bad motion is visible in a sheet.

## 1. Start

```sh
<this skill's folder>/new.sh my-video     # checks Node, copies the starter, installs everything
cd my-video && npx remotion studio         # optional: the user can scrub it at localhost:3000
```

`new.sh` installs Node with Homebrew if it's missing, runs `npm install` (which also generates the
sound effects), downloads the headless Chrome that Remotion renders with, and says whether
observee is installed. For an existing Remotion 4.0.320+ project, copy `starter/src/kit.tsx` only.

| File | What's in it |
|---|---|
| `src/brand.ts` | The product's look: name, URL, colours, fonts, `headlineFamily`, `accentStyle`. Logo in `public/` |
| `src/Video.tsx` | The scenes in order with their lengths in seconds, and the sound cues |
| `src/scenes/` | One file per scene. `takes.ts` says where things are in the takes |
| `src/parts.tsx` | The 2D layer in the brand's look: `Caption`, `Tap`, `Callout`, `Speed`, `Pop` |
| `src/kit.tsx` | The 3D kit and the camera moves (section 5) |
| `src/Moves.tsx` | A sample reel of every camera move: `npm run moves` |
| `public/takes/` | The recordings. Replace them with the user's own |
| `scripts/` | `take.sh` records a take; `sfx.mjs` and `music.mjs` generate sound |

Remotion is free for individuals and companies of up to 3 people; bigger companies need a
company license (remotion.pro). Tell the user once if that applies.

## 2. Plan

Settle these with the user, asking only what you can't infer (read their website first):
- **Where it plays and how long.** Social 15–45 s (plays muted: words on screen, hook in 2 s).
  Launch 45–90 s. Stage demo up to 2 min.
- **The one sentence** the viewer should remember, and the real moment in the product that proves it.
- **The ask** for the end card: a URL, a download, a waitlist.

Then write the scenes in `src/Video.tsx` in the starter's order: **the pain** (the hook, never the
logo), **the product** (the logo on a beat), **the proof** (the real moment, in one or two scenes),
**the ask** (the end card). At most 7 words on screen at once, held 1 s + 0.3 s per word. Put the
brief in a comment at the top of `Video.tsx`.

## 3. Record takes

Real footage beats any mock. A take is a recording of the whole screen (plus the iOS Simulator,
when one is booted) while the product does one thing. Shots later cut regions out of it.

```sh
scripts/take.sh start A 40     # records 40 s of the MacBook's screen, and returns at once
# ...now drive the app...
scripts/take.sh wait           # until it's saved: public/takes/A-mac.mov (+ A-phone.mov)
npx remotion still Sheet out/A.png --props='{"take":"takes/A-mac.mov","seconds":40}'   # look at it
```

**Drive the app with observee** (the computer-use MCP server, github.com/gettermary/observee;
its CLI `observee <tool> key=value` works too): `open` the app, `read_ui` for refs, then
`click`, `type_text`, `press_key`, `scroll`, `wait_for`. Re-read refs after anything changes the
window. Without observee, ask the user to perform the take while it records.

- **Set up first:** a clean state with believable dummy data, no private data, notifications off,
  big fonts, cookie banners dismissed. Put the window on the built-in Retina screen: `take.sh`
  records that one (2× pixels keep push-ins sharp). Keep it in one place for the whole video.
- **Hold, then act.** Hold each state 4–5 s before and after an action: holds are what shots use.
  Actions run slower than a person would; `speed` and `at` fix the pacing later.
- **Park the pointer** outside what you'll show (`observee move_mouse`), and scroll at an edge of
  the window: scrolling moves the pointer to where you scroll.
- **Address windows exactly.** When the app has other windows open (the user's own browser
  windows!), find yours by its URL or title, never as "front window", before any key press or
  navigation. Restore anything you touched by mistake.
- **A take is fixed-length** (screencapture only saves when its time is up). Give it more seconds
  than you need. A take with nothing on the Simulator gives an empty phone file: delete it.
- **Read the take's sheet** and note the seconds where things happen: those are your `at` values.
  Then pull full frames to measure regions: `npx remotion ffmpeg -ss 16 -i public/takes/A-mac.mov
  -frames:v 1 -vf scale=1512:-2 out/A16.png` gives a frame in screen points.
- **Phone:** the Simulator recording only stores frames when its screen changes, and starts a
  moment off from the Mac one. Line them up on an event visible in both (a tap, a notification).
  `xcrun simctl status_bar booted override --time 9:41` first, for a clean status bar.

**A website** is a take too: open it in a new browser window on the built-in screen, sized to
the screen, and record while observee scrolls from section to section (nav links scroll smoothly
to anchors; a URL with `#section` jumps straight there). The page area below the toolbar is your
region. A sign-in-only product with no account: film its public site and say so to the user.

Use a take in a shot: `Clip` cuts a region (in screen points) out of a take and floats it.

```tsx
// Regions are in screen points, measured on a frame of the take (a Retina take is 2 px a point).
const CARDS = {x: 60, y: 495, width: 1376, height: 192};
const CAPTURE_CARD = {x: 75, y: 506, width: 325, height: 166};
<Clip src="takes/A-mac.mov" at={15} region={CARDS}>
  <Callout {...within(CARDS, CAPTURE_CARD)} at={70} />
</Clip>
```

Children of a `Clip` are placed in the region's own points.

A window in a take has its own title bar, so a `Clip` has none; `frame="window"` adds one for a
web page cut from below the browser's toolbar. A phone take goes in
`<Screen frame="phone" width={416} height={876}>` with a `Footage` and no crop.

## 4. The look

What made the Termary video look expensive. Keep all of it when you rebrand:

- **The product's own look.** Colours, fonts and logo from its website (its CSS and its branding
  page), in `brand.ts`: `headlineFamily` and `accentStyle` (italic? coloured?) set how captions
  look. Solid colours, no gradients. A light page colour if the site is light.
- **A headline on every shot.** `Caption` in the band at the top: an eyebrow, a title, and an
  accent phrase ("Approve it *from your phone.*"). The footage is framed below the band:
  `focusOn({..., top: SAFE_TOP})`.
- **Real takes, cut close.** Whole windows, single panes as floating cards, the phone beside the
  Mac. A scene is often two or three cuts (`<Series>` inside the scene), and the caption changes
  with the cut. Crop tight around what a push-in goes to, so the card stays below the caption band
  as it grows.
- **A nearly flat camera.** Push-ins and a slow drift, not tilts. 3D is for depth (the phone in
  front of the Mac) and for moving in on what matters, square to the screen.
- **Show the input.** `Tap` where something is tapped, `Callout` around what matters, a
  `Speed` chip ("7× speed") whenever footage is sped up.
- **Sound on every turn.** `public/sfx/ting.wav` on each moment the story turns on, `whoosh.wav`
  under a fast move, `click.wav` on a tap, listed in `Video.tsx`. Music under it: the user's
  licensed track, or `npm run music -- <seconds>` for an original generated one.

## 5. Shots

A shot from the starter: the window framed under its caption, creeping in.

```tsx
const video = useVideoConfig();
const framed = focusOn({rect: whole(MAC), size: MAC, video, lens: 1800, fill: 0.94, top: SAFE_TOP});
const camera = useShot([[0, framed]], {dolly: 40});   // hold the framing, drift 40px closer
<AbsoluteFill style={{background: brand.background}}>
  <Stage camera={camera} lens={1800} background={brand.background} font={fontFamily}>
    <Layer>
      <Screen frame="none" width={MAC.width} height={MAC.height}>
        <Footage src={MAC.src} at={25.5} />
      </Screen>
    </Layer>
  </Stage>
  <Caption eyebrow="Needs you" title="One stops and asks." accent="Its pane lights up." />
</AbsoluteFill>
```

**Camera moves.** `moves` in `kit.tsx` turns framings from `focusOn` into keyframes for
`useShot`. Each takes a `start` frame, so they chain in one shot. `npm run moves` renders a sample
reel of all of them on the starter's footage.

| Move | Use it for |
|---|---|
| `moves.tiltIn(at)` | Opening on the product: arrives turned and from far back, settles square |
| `moves.zoomIn(wide, detail)` | Making one detail the subject |
| `moves.zoomOut(detail, wide)` | Revealing where a detail lives |
| `moves.focus(wide, detail)` | In, hold long enough to read, back out |
| `moves.pan(from, to)` | Following along a wide screen (agents on the left, the app on the right) |
| `moves.orbit(at)` | Parallax between things at different depths (the phone in front of the Mac) |
| `moves.pushThrough(at, lens)` | Ending a scene by flying into the screen; cut on the beat |

```tsx
const wide = focusOn({rect: whole(CARDS), size: CARDS, video, lens: 1800, top: SAFE_TOP});
const card = focusOn({rect: within(CARDS, CAPTURE_CARD), size: CARDS, video, lens: 1800, fill: 0.38, top: SAFE_TOP});
const camera = useShot(moves.zoomIn(wide, card, {hold: 30}), {dolly: 40});
```

| Piece | What it does |
|---|---|
| `Stage camera lens` | One shot. Camera: `x y z` is the target, `yaw` + swings right, `pitch` + looks down, `dolly` + moves closer. `lens`: 1000 dramatic, 1800 natural, 3000 flat |
| `Layer x y z rx ry rz scale` | Puts its child's centre at a point in the world. `ry` + faces right; `rx` 90 lies flat |
| `Screen` | `frame="window"`, `"phone"` or `"none"`, with a shadow and a glare that follows the camera |
| `Clip` | A region of a take (in screen points) as a floating card |
| `Footage` | A take or an image from `public/`: `at` (seconds in), `speed`, `crop` (in the take's pixels) |
| `Words` | Kinetic type, word by word: `start`, `stagger`, `exit`, `wordStyle` |
| `Floor` | A grid floor: it makes big camera moves read as moving through space |
| `animate(frame, keys)` | Keyframes `[frame, {values}, ease]`; a key sets only the values it names |
| `useShot(keys, drift)` | A shot's camera: `animate` plus a slow drift added over the whole shot |
| `focusOn({rect, size, ...})` | The camera values that frame `rect` of a card of `size`; `layer` if the card isn't at the origin, `top` for the caption band |
| `whole(size)`, `within(region, rect)` | The whole card as a rect; a rect measured inside a region |

`references/recipes.md` has bigger moves: a fly-past with motion blur, a dolly zoom, text behind
the product, a reflection, a turn-around reveal.

**Rules of motion.** Check every shot against them.
1. **Move the camera, not the objects.** One camera path per shot; depth gives the parallax.
2. **One move per shot**, with a reason: reveal, follow, or push toward what matters.
3. **Flat to read.** While there's text to read, the screen faces the camera (yaw and pitch
   within a few degrees) and moves slowly. Bigger angles only while arriving.
4. **Ease everything.** `ease.out` to arrive, `ease.in` to leave (faster), `ease.inOut` between
   holds. Bounce only on logos.
5. **Never stop dead.** Give every shot a slow drift (`useShot`'s second argument).
6. **Hold long enough to read**, then cut. When in doubt, hold longer and shorten the next scene.
7. **Cut on the beat** (0.5 s at 120 BPM), and keep the direction of motion across the cut.
8. **Restraint.** The product is the star: one showy move per 10 s at most.

**Gotchas.**
- `opacity`, `filter`, `overflow: hidden`, `mask` or `clip-path` on an element flattens its
  children. Put them on content inside a `Screen`, never on a `Layer`.
- Everything must be a function of `useCurrentFrame()`: no `Math.random()` (use `random(seed)`),
  no CSS animations or transitions, no state. Remotion renders frames out of order.
- Footage can't be pushed past its own pixels: keep the zoom at or below the take's pixels per
  point (2 for a Retina take). Lower `fill` if a close-up looks soft.
- `focusOn`'s `size` is only a size. A region's own `x`/`y` are page coordinates, not where the
  card is on the stage: pass `size: {width, height}` and, if it moved, `layer`.

## 6. Review

```sh
npx remotion still Sheet out/sheet.png                                          # the video, 1 frame/s
npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6}'   # one scene, 5 frames/s
npx remotion still Video out/f140.png --frame=140                               # one frame, full size
```

Read every PNG. Check that:
- the first 2 s make sense with no sound and no context;
- anything readable is square to the camera and held (several near-identical cells in a row);
- nothing important is cropped by the frame edge, hidden behind a nearer layer, or under a caption;
- no frame is blank or mirrored (the camera inside or behind something);
- neighbouring cells change smoothly (a jump at 1 frame/s is a jerk: recheck that span at 5/s);
- close-ups are sharp, and no stray pointer, banner or private data shows in any take.

Stills can't show speed. Render a draft (`npx remotion render Video out/draft.mp4 --scale=0.5`)
and ask the user specific questions ("is the push-in at 0:12 too fast?").

## 7. Render

```sh
npx remotion render Video out/video.mp4 --crf=16                  # 1080p
npx remotion render Video out/video-4k.mp4 --crf=16 --scale=2     # 4K: needs 2x takes
npx remotion still Video out/poster.png --frame=150               # thumbnail
```

- **Music** only if the user has the rights to it, or the generated one (`npm run music -- 45`):
  `<Audio src={staticFile('music.wav')} volume={0.5} />` inside `Video`, scenes cut on its beat.
- **Loudness** for the web, with the ffmpeg Remotion ships:
  `npx remotion ffmpeg -i out/video.mp4 -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 out/video-web.mp4`
- **Vertical or square:** a second composition at 1080×1920 with the shots re-aimed, never a crop
  of the 16:9 one.

Finish by telling the user where the file is, how long it runs, and the command to re-render.
Close any window you opened for recording.

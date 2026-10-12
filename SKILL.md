---
name: dolly
description: Make polished product, launch, demo and social videos and motion graphics, written as code in Remotion — real screen recordings cut into floating windows with 3D camera moves, kinetic type, charts, transitions and ready-made scenes, in 8 styles and every format (16:9, 9:16 Reels/TikTok/Shorts, 1:1, 4:5). Use when asked to make, edit or improve a video, trailer, launch/demo/promo/explainer/social clip, Reel or Short, motion graphics, an animated logo or title card, or to turn screen recordings or a website into a video.
---

# dolly: product videos and motion graphics in code

The video is a Remotion project: React components rendered frame by frame. `starter/` next to
this file holds two working videos: `Video`, a 41-second cut of Termary's launch video made from
real recordings, and `Promo`, a 25-second motion-graphics cut made only of templates. Both render
in any of 8 styles and 4 formats. You turn them into the user's, keeping what makes them work. The
pipeline:

**plan → record takes (if the product has a UI) → build scenes → review the frames → render**

You can't watch video, so you review it by rendering contact sheets and reading the PNGs. Do that
after every change: most bad motion is visible in a sheet.

## 1. Start

```sh
<this skill's folder>/new.sh my-video     # checks Node, copies the starter, installs everything
cd my-video && npx remotion studio         # optional: the user can scrub it at localhost:3000
```

`new.sh` installs Node with Homebrew if it's missing, runs `npm install` (which also generates the
sound effects), downloads the headless Chrome that Remotion renders with, and says whether
observee is installed. On Windows, run it in Git Bash, after `winget install OpenJS.NodeJS.LTS`.
For an existing Remotion 4.0.320+ project, copy `src/kit.tsx`, `src/look.tsx` and `src/fx/`.

| File | What's in it |
|---|---|
| `src/brand.ts` | The product: name, URL, logo (in `public/`), accent and alert colours, its style, its fonts if it has its own |
| `src/look.tsx` | The 8 styles and 4 formats, and `useLook()`, which every part reads them through |
| `src/Video.tsx` | The take-based video: its scenes in order with their lengths, and the sound cues |
| `src/Promo.tsx` | The template-only video, the same way |
| `src/scenes/` | The take-based scenes. `takes.ts` says where things are in the takes |
| `src/templates.tsx` | Ready-made scenes: `Statement`, `Metric`, `Features`, `Quote`, `Compare`, `Steps`, `LogoReveal`, `EndCard`, and for other agendas `Announcement`, `Lineup`, `Agenda`, `Countdown`, `Changelog`, `Timeline`, `List` |
| `src/fx/` | Effects: `text.tsx` (kinetic type), `graphics.tsx` (charts, cursors, toasts…), `drawings.tsx` (illustrations drawn with code), `backdrops.tsx`, `transitions.tsx` |
| `src/parts.tsx` | What goes over a shot: `Caption`, `Tap`, `Callout`, `Speed`, `Pop` |
| `src/kit.tsx` | The 3D kit and the camera moves (section 4) |
| `public/takes/` | The recordings. Replace them with the user's own |
| `scripts/` | `take.sh` records a take; `sfx.mjs` and `music.mjs` generate sound; `voice.mjs` turns a script into a voiceover |

`examples/` in this skill's folder holds finished videos' code: `spacejot/` cuts a phone app's
real takes into phone-and-picture scenes in two cuts (16:9 and 9:16), and `mocks/` has 18
template-only videos across every style, format and agenda. Read the closest one before you build.

Remotion is free for individuals and companies of up to 3 people; bigger companies need a
company license (remotion.pro). Tell the user once if that applies.

## 2. Plan

Read the product's website first, then settle these with the user, asking only what you can't infer:

- **Where it plays**, which sets the formats and the length. Render every format they need; design
  for the main one and check the rest.

  | Format | Composition | Size | For | Length |
  |---|---|---|---|---|
  | landscape | `Video` | 1920×1080 | YouTube, X, LinkedIn, a website, a talk | launch 45–90 s |
  | vertical | `Vertical` | 1080×1920 | Reels, TikTok, YouTube Shorts, Stories | 15–35 s |
  | square | `Square` | 1080×1080 | feeds on X, LinkedIn, Instagram | 15–45 s |
  | portrait | `Portrait` | 1080×1350 | Instagram and LinkedIn feeds (4:5) | 15–45 s |

  Feeds play muted: the words carry the story, and the first 2 s must hook on their own.
- **The style.** Render one frame in every style (`npm run styles`, add
  `--props='{"frame":420,"format":"vertical"}'` for another frame or format), show the user, and
  set `brand.style`. Suggest one from the brand: a dark developer tool → midnight or terminal, a
  consumer app → soft or bold, a premium or calm product → editorial or swiss, a teaser → cinema, a
  creative or crafty product → paper.

  | Style | The look |
  |---|---|
  | `editorial` | Light paper, a serif headline with an italic accent phrase, hard cuts. Calm and expensive: the Termary video |
  | `midnight` | Near-black with the accent glowing, a tight sans, words blurring into focus, zoom transitions |
  | `bold` | The accent as the page, huge heavy type, the accent phrase knocked out of a block, springy pops, slides |
  | `swiss` | Off-white, black type on a column grid, the accent used sparingly, square cards, hard wipes |
  | `soft` | A pastel tint of the accent, rounded type, the accent phrase on a pill, bouncy pops, round reveals |
  | `terminal` | Mono everything, headlines typed out with a cursor, scanlines, glitch cuts |
  | `cinema` | A trailer: near-black, a big quiet serif, film grain, slow fades through black |
  | `paper` | Drawing with code: paper cards on a soft lavender page, a light serif with a bold accent, card flips |

- **The one sentence** the viewer should remember, the real moment in the product that proves it,
  and **the ask** for the end card (a URL, a download, a waitlist).
- **Takes or templates.** A product with a UI gets takes: real footage beats any mock. With no
  access to the product, or for a teaser or an explainer, build it from templates and effects.

Then write the scenes in order: **the pain** (the hook, never the logo), **the product** (the logo
on a beat), **the proof** (the real moment, or features, a metric, a before/after), **the ask** (the
end card). Other agendas keep the shape, hook → subject → proof → ask, with their own middle:

| Agenda | The middle |
|---|---|
| Event | `Lineup` of speakers, `Agenda`, `Countdown` to the day |
| Hiring | What the team does, a `List` of roles, the people (`Lineup`) |
| Changelog | `Changelog`, then the one or two changes worth showing in the UI |
| Funding news | `Announcement`, why it matters, a `Timeline`, what's next |
| Year in review | `Metric`s, `Bars` by month, a `Timeline` of milestones, a share card |
| Tutorial | The steps on the real UI with a `Cursor`, a voiceover and `Captions` |
| Podcast clip | The cover with a `Waveform`, the best 20 seconds of voice, `Captions` |
| Data story | A question, one chart, the surprising number, the source |
| A shop or venue | The place, drawn; a `List` menu, hours, a map, a `Countdown` to opening | At most 7 words on screen at once, held 1 s + 0.3 s per word. Put the brief in a comment
at the top of `Video.tsx`.

## 3. Record takes

A take is a recording of the whole screen (plus the iOS Simulator, when one is booted) while the
product does one thing. Shots later cut regions out of it.

```sh
scripts/take.sh start A 40     # records 40 s of the MacBook's screen, and returns at once
# ...now drive the app...
scripts/take.sh wait           # until it's saved: public/takes/A-mac.mov (+ A-phone.mov)
npx remotion still Sheet out/A.png --props='{"take":"takes/A-mac.mov","seconds":40}'   # look at it
```

**Drive the app with observee** (the computer-use MCP server, github.com/gettermary/observee;
its CLI `observee <tool> key=value` works too): `open` the app, `read_ui` for refs, then
`click`, `type_text`, `press_key`, `scroll`, `wait_for`. Re-read refs after anything changes the
window. Without observee, or on Windows, the user performs the take while it records (below).

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
  `xcrun simctl status_bar booted override --time 9:41` first, for a clean status bar. With
  several simulators booted, `TAKE_SIM=<udid> scripts/take.sh start A 60` records the right one.
- **Device Hub** (Xcode 27 has no Simulator.app) ignores synthetic clicks: press controls through
  observee by ref or text, and reach gestures and toolbars with the app's debug launch arguments
  (`xcrun simctl launch <udid> <bundle id> -someFlag`). To type, turn on its Capture Keyboard and
  `press_key` plain keys. **Never send it Delete or ⌘ shortcuts**: ⌘A then Delete selects every
  simulator and asks to remove them. Autocorrect rewrites unusual words: type dictionary ones.
- **Film the real product.** A demo or preview mode shows canned results: record against the live
  service, signed in, or tell the user the pictures are staged.
- **For vertical,** the phone is the star and a whole Mac window is too small to read: plan takes
  where the action happens in one pane or on the phone.

**A website** is a take too: open it in a new browser window on the built-in screen, sized to
the screen, and record while observee scrolls from section to section (nav links scroll smoothly
to anchors; a URL with `#section` jumps straight there). The page area below the toolbar is your
region. A sign-in-only product with no account: film its public site and say so to the user.

**The user records** a moment that needs a real device (the camera, AR, a notification), an
account or payment you shouldn't touch, or an app you can't drive, and everything on Windows.
Write them a shot list: one take per moment; for each, the screen to start on, every step, and
"hold 5 s" before and after it; slow taps; Do Not Disturb on, a demo account. On a Mac `take.sh`
records while they drive; on Windows it records the desktop with ffmpeg (`winget install
Gyan.FFmpeg`), or one window with `TAKE_WINDOW="<title>"`. A real iPhone records itself (Control
Center, Screen Recording); Android with `adb shell screenrecord --time-limit 60 /sdcard/A.mp4` and
`adb pull`, and you can drive that yourself (`adb shell input tap x y`; `adb shell uiautomator
dump` lists the screen's elements).

**Recordings the user already has** work on any OS. Put them in `public/takes/`, one per moment.
- Check each: `npx remotion ffprobe -v error -show_entries stream=codec_name,width,height:format=duration
  public/takes/A-phone.mp4`. Phone HEVC and uneven frame rates play fine. Points are pixels over
  the screen's scale: 3 on most iPhones, 2 on a Retina Mac, the display scaling (1–1.5) on a PC.
- Sheet a stretch of a long one: `--props='{"take":"takes/A-phone.mp4","from":120,"seconds":30,"every":10,"format":"vertical"}'`
  is 120–150 s at 3 frames/s, in tall cells for a phone.
- Takes play muted. To keep narration, pull it out (`npx remotion ffmpeg -i public/takes/A.mov -vn
  public/A.wav`) and play it with `<Audio>`: it stays in sync only where shots don't cut or speed up.
- Ask for the raw files: zooms, cursor effects and backgrounds baked in by Screen Studio or Loom
  fight the camera. A real phone's status bar shows the real time and a recording dot: `crop` it.
- A rushed moment can be held (`<Freeze>`, or `speed` below 1). A missing one can't be made: fill
  it with a template, or ask for a retake.

## 4. Build scenes

A scene is a component that fills the frame. `SCENES` in `Video.tsx` (or `Promo.tsx`) lists them
with their lengths; the style's transition joins them, and a scene can name its own
(`transition: 'iris'`, the one into it). A whoosh plays under every transition that isn't a cut.

**Templates** are whole scenes that take words as props. They read the style and lay themselves out
for the format:

```tsx
{name: 'Features', seconds: 4.5, component: () => (
  <Features title="Everything in" accent="one window." items={[{icon: Columns3, title: 'Split panes', text: '…'}]} />
)},
```

| Template | For |
|---|---|
| `Statement` | One big line: a hook, a punchline, a turn |
| `Metric` | A number counting up and what it counts. Real numbers only |
| `Features` | Three to six features as cards with icons ([lucide](https://lucide.dev) names) |
| `Quote` | A testimonial. Real quotes only, with permission |
| `Compare` | Before and after: the old way struck, the product's way ticked |
| `Steps` | How it works, numbered, joined by a line that draws |
| `LogoReveal` | The logo arriving: `kind` `pop`, `iris`, `slide`, `focus` |
| `EndCard` | The ask: name, line, button, URL |
| `Announcement` | Big news, with a punch and a drawn stroke: funding, a milestone, a launch date |
| `Lineup` | People as cards: speakers, a team, hosts |
| `Agenda` | A schedule, row by row, one row highlighted |
| `Countdown` | Days, hours, minutes and seconds ticking down to a date |
| `Changelog` | A version and what's new, improved and fixed |
| `Timeline` | Milestones on a line that draws: company history, a year in review |
| `List` | Labels with dotted leaders to values: a menu, open roles, prices |

**Shots from takes** are built with the 3D kit: the camera moves, the things stay put.

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
between the caption band and the platform's buttons.

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
as the scene ends. `references/recipes.md` has bigger ones: a fly-past with motion blur, a dolly
zoom, text behind the product, a reflection, a turn-around reveal.

**Effects** go over any scene. `npm run gallery` renders every one, labelled with its code
(`--props='{"only":"text","style":"bold","format":"vertical"}'` narrows it), and
`references/effects.md` lists their props.

- **Text** (`fx/text.tsx`): `Kinetic` sets a line with an effect (`rise`, `reveal`, `blur`, `pop`,
  `type`, `letters`, `slide`, `scramble`, `fade`; the style picks one) and marks its accent phrase
  (`marker`, `block`, `pill`, `underline`, `circle`, `strike`, `box`). `Mark` marks any words,
  `Cycle` rotates one word, `Counter` counts.
- **Graphics** (`fx/graphics.tsx`): numbers and charts (`Stat`, `Ring`, `Bars`, `LineChart`,
  `Progress`, `Checklist`); pointing (`Arrow`, `Draw`, `Spotlight`); input (`Cursor`, `Keys`);
  product UI (`Toast`, `Chat`, `Badge`, `Icon`, `Marquee`); moments (`Burst` of confetti, `Shine`).
- **Drawings** (`fx/drawings.tsx`): illustrations drawn with code that animate as they're drawn:
  `Paper` cards to hold them, `Flower` (watercolour, blooming), `Stamps`, `HexField`, `Butterfly`,
  `Plant` (growing), `Stitch` (embroidery), `Watercolor` (a wash behind a headline), `Doodles`
  (hand-drawn marks), `Constellation`, `Contours` (a topographic map), `Ripple`, `Scribble`. They
  tint themselves toward the brand colour; for a crafty, human feel, and in the `paper` style.
- **Voice** (`fx/voice.tsx`): `npm run voice -- script.txt name` speaks a script with the Mac's or
  Windows' built-in voices (or use recorded WAVs) into `public/voice/name/` and
  `src/voice/name.ts`. `Voiceover` plays it, `voiceTiming`/`voiceEnd` time scenes to it,
  `Captions` show the words in sync (`karaoke`, `pop`, `line`), and `Waveform` moves with the
  voice (`bars`, `line`, a `circle` round a face). Feeds play muted: a narrated video still needs
  its captions. Built-in voices are for drafts; for a published video, record a person or use a
  voice the user has the rights to.
- **Backdrops** (`fx/backdrops.tsx`): `Backdrop` draws the style's page: `plain`, `glow`, `grid`,
  `dots`, `blobs`, `scanlines`, `grain`, `aurora`, `beams`, `spotlight`.
- **Transitions** (`fx/transitions.tsx`): `cut`, `fade`, `dip` (through the page colour), `slide`,
  `wipe`, `iris`, `clock`, `flip`, `zoom` (forward through), `whip` (a fast smear), `bars`,
  `flash`, `glitch`, `pushCut`, and WebGL shaders: `zoomBlur`, `crossZoom`, `dreamyZoom`,
  `filmBurn`, `crosswarp`, `ripple`, `swap`, `bookFlip`, `blurSlide`, `linearBlur`.

**Several brands in one project** (variants for clients, or one video per product):
`<LookProvider style="soft" brand={{name, url, logo, accent}}>` sets them for everything inside,
and `useBrand()` reads the brand.

**Every format.** Scenes read the frame from `useLook()`: `look.safe` (insets platforms cover
with their own buttons: keep text inside), `look.band` (the caption band at the top), `look.aim`
(pass to `focusOn`), `look.size` (the headline size), `look.tall`, and `byShape(look, {wide, tall,
square})` to pick a layout. Re-aim shots for tall frames, never crop the 16:9 one: push in to the
one pane that matters, stack what sat side by side, bring the phone forward. `Hook` and `Approve`
in the starter show both layouts.

## 5. Taste

What makes it look expensive, in any style:
- **The product's own look.** Its accent, its fonts (`brand.fonts`), its logo, a style that fits it.
- **A headline on every shot,** in the band at the top, the accent phrase set the style's way.
- **Real things, cut close.** Whole windows, single panes as floating cards, the phone beside the
  Mac. A scene is often two or three cuts, and the caption changes with the cut. Crop tight
  around what a push-in goes to.
- **Show the input.** `Tap` where something is tapped, `Callout` or `Spotlight` around what
  matters, a `Cursor` over a template, a `Speed` chip whenever footage is sped up.
- **Sound on every turn.** `public/sfx/ting.wav` on each moment the story turns on, `whoosh.wav`
  under transitions and fast moves, `click.wav` on a tap. Music under it: the user's licensed
  track, or `npm run music -- <seconds>` for an original generated one.
- **Avoid the tells of generated design:** gradient text, purple-to-blue gradients, cyan on dark,
  every card the same, an effect on every word, five transitions in one video. One effect per
  idea, one transition style per video (plus one accent), the style's defaults first.

**Rules of motion.** Check every shot against them.
1. **Move the camera, not the objects.** One camera path per shot; depth gives the parallax.
2. **One move per shot**, with a reason: reveal, follow, or push toward what matters.
3. **Flat to read.** While there's text to read, it faces the camera and moves slowly.
4. **Ease everything.** Arrive with `ease.out`, leave with `ease.in` (faster), `ease.inOut`
   between holds. Bounce only where the style is bouncy, or on a logo.
5. **Never stop dead.** Give every shot a slow drift (`useShot`'s second argument).
6. **Hold long enough to read**, then cut. When in doubt, hold longer and shorten the next scene.
7. **Cut on the beat** (0.5 s at 120 BPM), and keep the direction of motion across the cut: a
   scene leaves the way the next one arrives.
8. **Restraint.** The product is the star: one showy move or effect per 10 s at most.

**Gotchas.**
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
- Remotion's bundled ffmpeg is minimal (no `fps`, `hstack`, `tile` or `volumedetect` filters): for a
  frame strip use `-r 1` output, and its first cells can repeat frame 0; check those with `-ss`.
- `focusOn`'s `size` is only a size. A region's own `x`/`y` are page coordinates, not where the
  card is on the stage: pass `size: {width, height}` and, if it moved, `layer`.
- The shader transitions (`zoomBlur`, `filmBurn`, `bookFlip`, …) show an error in the Studio unless
  Chrome has `chrome://flags/#canvas-draw-element` on, and in heavy scenes they can drop a layer
  from frames, even after the transition. Use one only as an accent, and check every frame of the
  final render around it; the styles' defaults are all plain DOM transitions.

## 6. Review

```sh
npx remotion still Sheet out/sheet.png                                          # the video, 1 frame/s
npx remotion still Sheet out/focus.png --props='{"scene":"NeedsYou","every":6}' # one scene, 5 frames/s
npx remotion still Sheet out/v.png --props='{"format":"vertical","guides":true}' # another format, safe area drawn
npx remotion still Vertical out/f140.png --frame=140                            # one frame, full size
npm run styles && npm run formats                                               # one frame in every style / format
```

Read every PNG. Check that:
- the first 2 s make sense with no sound and no context;
- anything readable is square to the camera and held (several near-identical cells in a row);
- text sits inside the dashed safe area in every format, and the subject between the dotted lines;
- nothing important is cropped by the frame edge, hidden behind a nearer layer, or under a caption;
- no frame is blank or mirrored (the camera inside or behind something);
- neighbouring cells change smoothly (a jump at 1 frame/s is a jerk: recheck that span at 5/s);
- close-ups are sharp, and no stray pointer, banner or private data shows in any take.

Stills can't show speed. Render a draft (`npx remotion render Video out/draft.mp4 --scale=0.5`)
and ask the user specific questions ("is the push-in at 0:12 too fast?").

## 7. Render

```sh
npm run render                     # out/video.mp4, 1920×1080
npm run render:vertical            # out/vertical.mp4, 1080×1920; also render:square, render:portrait
npx remotion render Vertical out/v-bold.mp4 --props='{"style":"bold"}'   # in another style
npx remotion render Video out/video-4k.mp4 --scale=2                     # 4K: needs 2x takes
npx remotion still Video out/poster.png --frame=150                      # thumbnail, per format
```

- **Music** only if the user has the rights to it, or the generated one (`npm run music -- 45`):
  `<Audio src={staticFile('music.wav')} volume={0.5} />` inside `Video`, scenes cut on its beat.
- **For upload,** normalise loudness and put the index at the front so it starts playing at once:
  `npx remotion ffmpeg -i out/video.mp4 -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 -movflags +faststart out/video-web.mp4`

Finish by telling the user where the files are, how long they run, and the commands to re-render.
Close any window you opened for recording.

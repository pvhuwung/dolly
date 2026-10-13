---
name: dolly
description: Make polished product, launch, demo and social videos and motion graphics, written as code in Remotion — real screen recordings cut into floating windows with 3D camera moves, kinetic type, charts, transitions and ready-made scenes, in 8 styles and every format (16:9, 9:16 Reels/TikTok/Shorts, 1:1, 4:5). Use when asked to make, edit or improve a video, trailer, launch/demo/promo/explainer/social clip, Reel or Short, motion graphics, an animated logo or title card, or to turn screen recordings or a website into a video.
---

# dolly: product videos and motion graphics in code

The video is a Remotion project: React components rendered frame by frame. `starter/` next to
this file holds two working videos: `Video`, a 41-second cut of Termary's launch video made from
real recordings, and `Promo`, a 25-second motion-graphics cut made only of templates. Both render
in any of 8 styles and 4 formats. You turn them into the user's, keeping what makes them work.

**plan → footage (record it, or scan the user's) → build scenes → review the frames → render**

You can't watch video, so you review it by rendering contact sheets and reading the PNGs. Do that
after every change: most bad motion is visible in a sheet.

**Read only what the job needs.** Paths are from this skill's folder:

| When | Read |
|---|---|
| You record the product on a Mac (observee drives it): an app, a website, the iOS Simulator | `references/record-mac.md` |
| The user has to record: Windows, a real phone, a device or account you can't drive | `references/record-elsewhere.md` |
| The user gives you recordings they made | `references/your-footage.md` |
| A scene built from a recording: the 3D kit and camera moves | `references/camera.md` |
| A video that isn't a product launch: an event, hiring, a changelog, a data story… | `references/agendas.md` |
| Picking components: templates, text, graphics, drawings, backdrops, transitions | `starter/src/library/CATALOG.md` |
| Something renders wrong, or you're writing a new component | `references/gotchas.md` |

## 1. Start

```sh
<this skill's folder>/new.sh my-video     # checks Node, copies the starter, installs everything
cd my-video && npx remotion studio         # optional: the user can scrub it at localhost:3000
```

`new.sh` installs Node with Homebrew if it's missing, runs `npm install` (which also generates the
sound effects), downloads the headless Chrome that Remotion renders with, and says whether
observee is installed. On Windows, run it in Git Bash, after `winget install OpenJS.NodeJS.LTS`.
For an existing Remotion 4.0.320+ project, copy `src/kit.tsx`, `src/look.tsx`, `src/parts.tsx`,
`src/sequence.tsx`, `src/backdrop.tsx` and `src/library/`.

| File | What's in it |
|---|---|
| `src/brand.ts` | The product: name, URL, logo (in `public/`), accent and alert colours, its style, its fonts if it has its own |
| `src/look.tsx` | The 8 styles and 4 formats, and `useLook()`, which every part reads them through |
| `src/Video.tsx`, `src/Promo.tsx` | A video: its scenes in order with their lengths, and the sound cues |
| `src/scenes/` | The take-based scenes. `takes.ts` says where things are in the takes |
| `src/library/` | The component library, one folder per item; `CATALOG.md` lists them with their props |
| `src/sequence.tsx`, `src/backdrop.tsx` | `Scenes` joins the scenes with transitions; `Backdrop` draws the style's page |
| `src/parts.tsx` | What goes over a shot: `Caption`, `Tap`, `Callout`, `Speed`, `Pop` |
| `src/kit.tsx` | The 3D kit and the camera moves (`references/camera.md`) |
| `public/takes/` | The recordings. Replace them with the user's own |
| `scripts/` | `take.sh` records a take, `scan.mjs` (`npm run scan`) reads recordings, `sfx.mjs` and `music.mjs` make sound, `voice.mjs` a voiceover, `library.mjs` rebuilds the catalog, `check.mjs` (`npm run check`) measures a render, `web.mjs` (`npm run web`) makes the upload copy |

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
- **Where the footage comes from.** A product with a UI gets real footage, which beats any mock:
  you record it, the user records it, or the user already has it (the table above says what to
  read). With no access to the product, or for a teaser or an explainer, build it from the library.

Then write the scenes in order: **the pain** (the hook, never the logo), **the product** (the logo
on a beat), **the proof** (the real moment, or features, a metric, a before/after), **the ask** (the
end card). Other agendas keep the shape with their own middle (`references/agendas.md`). At most 7
words on screen at once, held 1 s + 0.3 s per word. Put the brief in a comment at the top of
`Video.tsx`.

## 3. Footage

Whichever way it comes, the same things make it usable: **holds** (4–5 s of a state before and
after each action: shots are cut from them), the **real product** (never a demo mode's canned
results, never private data), and **times you've read off it**. `npm run scan` reads any recording:
its holds, its changes and its sound, with a sheet of its frames, so you can plan from footage
nobody has described to you. Those times are the `at` values shots play from.

## 4. Build scenes

A scene is a component that fills the frame. `SCENES` in `Video.tsx` (or `Promo.tsx`) lists them
with their lengths; the style's transition joins them, and a scene can name its own
(`transition: 'iris'`, the one into it). A whoosh plays under each transition that moves the
whole frame (a slide, a whip, a zoom).

**The library** (`src/library/`) holds every ready-made piece, one folder each: templates (whole
scenes), text effects, graphics, drawings, voice parts, backdrops and transitions. **Read
`src/library/CATALOG.md` before you build**: each item's summary, a usage line that works as
written, and its props. Import from the library (`import {Stat, Statement} from './library'`). Every
item reads the style through `useLook()`, takes `start` (the frame it begins, from the start of its
scene) and, where it can leave, `exit`. `npm run gallery` renders every item's sample, labelled with
its code (`--props='{"only":"graphics","style":"bold","format":"vertical"}'` narrows it).

A template is a whole scene, so it goes straight into `SCENES`:

```tsx
{name: 'Features', seconds: 4.5, component: () => (
  <Features title="Everything in" accent="one window." items={[{icon: Columns3, title: 'Split panes', text: '…'}]} />
)},
```

A scene from a recording floats the window, pane or phone in 3D under a `Caption`, with the camera
moving over it: `references/camera.md`.

**Using the library well.**
- `Metric`, `Stat` and `Quote` take real numbers and real quotes only, with permission.
- Drawings tint themselves toward the brand colour: for a crafty, human feel, and in `paper`.
- **Voice:** `npm run voice -- script.txt name` speaks a script with the Mac's or Windows' built-in
  voices (or use recorded WAVs) into `public/voice/name/` and `src/voice/name.ts`. `Voiceover` plays
  it, `voiceTiming`/`voiceEnd` time scenes to it, and `Captions` and `Waveform` follow it. Feeds play
  muted: a narrated video still needs its captions. Built-in voices are for drafts; for a published
  video, record a person or use a voice the user has the rights to.
- Transitions the catalog calls a WebGL shader are accents only: check every frame of the final
  render around one.
- **Give back what a video invents.** A layout, a chip or a move another video could use becomes an
  item in the project's library (a folder with the component, its sample in `<name>.demo.tsx` and
  `item.json`, then `npm run library`), and offer the user to add it to dolly's own library too.

**Several brands in one project** (variants for clients, or one video per product):
`<LookProvider style="soft" brand={{name, url, logo, accent}}>` sets them for everything inside,
and `useBrand()` reads the brand.

**Every format.** Scenes read the frame from `useLook()`: `look.safe` (insets platforms cover
with their own buttons: keep text inside), `look.band` (the caption band at the top), `look.aim`
(pass to `focusOn`), `look.size` (the headline size), `look.tall`, and `byShape(look, {wide, tall,
square})` to pick a layout.

## 5. Taste

What makes it look expensive, in any style:
- **The product's own look.** Its accent, its fonts (`brand.fonts`), its logo, a style that fits it.
- **A headline on every shot,** in the band at the top, the accent phrase set the style's way.
- **Real things, cut close.** Whole windows, single panes as floating cards, the phone beside the
  Mac. A scene is often two or three cuts, and the caption changes with the cut. Crop tight
  around what a push-in goes to.
- **Show the input.** `Tap` where something is tapped, `Callout` or `Spotlight` around what
  matters, a `Cursor` over a template, a `Speed` chip whenever footage is sped up.
- **Sound on every turn, and little else.** `public/sfx/ting.wav` on each moment the story turns
  on, on the frame it becomes readable (not the bar line after); `click.wav` on a tap; `whoosh.wav`
  only under moves of the whole frame (the video plays one under a transition that travels:
  slide, whip, zoom, flip, at most one every 8 s), about two a video. Keep effects to about 5
  per 10 s and let the music carry the other cuts: the user's licensed track, or
  `npm run music -- <seconds>`.
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

**The numbers top launch videos hit** (measured frame by frame): the
picture moves within 0.1 s and the first word reads by 0.4 s; the product is on screen by a
quarter of the way in; something changes about every 0.7 s, even inside a long shot; text being
read moves under about 3 px a frame; one designed hold of 1–1.6 s on the key claim, no other
stillness over 0.8 s; the biggest moment at about 80% of the running time, then a calm end card of
about 2 s.

`references/gotchas.md` has the traps: what flattens 3D, what breaks frame-by-frame rendering, the
limits of the bundled ffmpeg.

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
and run `npm run check -- out/draft.mp4`: it times the hook, finds stutters (a repeated frame
mid-move) and dead stretches, and lists every one-frame jump, each of which should be a cut you
meant. Fix every ✗, look at every ! on a sheet, then ask the user specific questions ("is the
push-in at 0:12 too fast?").

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
  `npm run web -- out/video.mp4` writes `out/video-web.mp4` at -14 LUFS; then
  `npm run check -- out/video-web.mp4 --upload` gates the size, codec and loudness.
- **A GIF** for a README or a site: `npm run gif -- --frames=0-149` (5 s, 15 fps, half size).

Finish by telling the user where the files are, how long they run, and the commands to re-render.
Close any window you opened for recording.

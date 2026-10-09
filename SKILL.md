---
name: dolly
description: Make polished product, launch and demo videos with 3D motion, written as code in Remotion — camera moves through space, tilted floating screens, parallax, push-ins on UI, kinetic type, extruded 3D logos — then render and review them frame by frame. Use when asked to make, edit or improve a video, trailer, launch/demo/promo/explainer/social clip, motion graphics, an animated logo or title card, or to turn screen recordings or screenshots into a video.
---

# dolly: 3D motion videos in code

You are the director, the editor and the motion designer. The video is a Remotion project (React
components rendered frame by frame by headless Chrome), so every shot is code you can reason about,
diff and re-render. Next to this file:

- `starter/` is a working project: a 3D kit (`src/kit/`), a three.js logo (`src/three/`), five
  example scenes that each show one recipe, a timeline measured in music bars and a contact-sheet
  renderer.
- `references/` has the depth: `recipes.md` (shot code), `capture.md` (getting good footage),
  `three.md` (real 3D), `delivery.md` (sound, render settings, formats).

You can't watch video. You review it by rendering contact sheets and stills and looking at them.
That loop (step 6) is not optional: most bad motion is visible in a sheet before anyone presses play.

## 1. Set up

**New video:** copy the starter, install, and open the studio.

```sh
cp -R <this skill's folder>/starter ./my-video && cd my-video
npm install                      # pinned versions; all @remotion/* must stay on ONE exact version
npx remotion studio              # scrub every scene at localhost:3000
```

**Existing Remotion project:** copy `starter/src/kit/` (and `src/three/` if you need real 3D) into
it. The kit needs Remotion 4.0.320 or later (it uses `trimBefore`). Don't upgrade their Remotion
unasked, and don't mix @remotion/* versions.

Then edit `src/brand.ts` (name, tagline, accent, font, logo SVG) and render a sheet (step 6) to see
the starter in their colours before you change any shots.

Remotion is free for individuals, non-profits and companies of up to 3 employees; bigger companies
need a company license (remotion.pro). If the user is making this for a larger company, tell them
once.

## 2. Brief: five answers before any code

1. **Where does it play?** Stage projector (big type, no fine detail, sound on), social feed (muted
   autoplay: captions, hook in the first 2 s, square or vertical cut too), website hero (loop, no
   text that must be read), app store preview (strict lengths and sizes: check the store's current spec).
2. **How long?** Social 15–45 s. Launch 45–90 s. Demo day 90–120 s. Shorter is almost always better.
3. **The one thing.** One sentence the viewer should repeat afterwards. Every scene serves it.
4. **The proof.** Which real moment in the product shows that sentence is true? That's the hero shot.
5. **The ask.** URL, download, waitlist. It goes on the end card, big, held for 3 s or more.

Ask the user only what you can't infer. Write the answers at the top of `src/timeline.ts`.

## 3. Beat sheet

Scenes live in `src/timeline.ts` as lengths in **bars** of the music (120 BPM: 1 bar = 2 s), so
every cut lands on a beat. One idea per scene.

- **Hook (0–5 s):** the outcome or the pain, shown, not the logo. A logo first is a skip button.
- **Show (most of it):** the product doing the thing, in real UI, one capability per scene.
- **Payoff (last 5–8 s):** the result, then name + call to action on the end card.

Write every on-screen word now: no more than 7 words per card. A card holds for at least
`1 s + 0.3 s per word`. If a scene needs a paragraph, it needs a voice-over or a cut.

## 4. Footage

Real UI beats mocks every time. `PlaceholderApp` exists only so the starter renders. Capture with
`references/capture.md`: big window fonts, clean state, no private data, 2× resolution, one short
clip per beat. Put files in `public/` and show them with `<Footage src="clip.mov" from={frames} />`
inside a `<Screen>`.

## 5. Shots: the 3D grammar

The kit in `starter/src/kit/`:

| Piece | What it does |
|---|---|
| `Stage lens` | The viewport. `lens` = CSS perspective px: 1000 wide/dramatic, 1800 natural, 3000 flat |
| `Camera pose` | Orbits a target: `x y z` (target), `yaw` (+ = swing right), `pitch` (+ = look down), `roll`, `dolly` (+ = closer) |
| `Layer x y z rx ry rz scale` | Places its child's centre in the world. `ry` + = faces right, `rx` + = leans back (floor = 90) |
| `Screen` | Window / phone / bare card with shadow and camera-reactive glare |
| `Footage` | Image or video from `public/`, `from` trims the start |
| `Floor` | Fading grid that makes camera motion read as motion through space |
| `MotionBlur` | Averages sub-frame samples of a fast shot; its children must paint an opaque frame |
| `Words` | Kinetic type: words swing up out of the page, staggered |
| `focusOn` | Camera pose that pushes in until a rect of a layer fills the frame |
| `animate / track / ease` | Keyframes: `[frame, {fields}, easeIntoThisKey]`; a key pins only the fields it names |
| `three/Logo3D` | Extruded SVG logo, studio-lit, flies in (real WebGL) |

The five starter scenes are the recipes: `Hero` (tilt-in + drift), `Orbit` (parallax),
`Focus` (push-in, hold, push-through), `Fan` (fly-past with motion blur), `End` (3D logo card).
More in `references/recipes.md`: dolly zoom, split-depth title, reflections, screen-to-fullframe,
device pair, stack, turn-around reveal.

### The rules of motion

These separate "expensive" from "PowerPoint". Check every shot against them.

1. **Move the camera, not the objects.** One camera path per shot; objects at different depths then
   parallax on their own. Moving each object separately looks like a slideshow.
2. **One move per shot, and it has a reason:** reveal, follow attention, or push toward what matters.
   Animate at most two camera fields at once (say yaw + dolly).
3. **Tilt to arrive, flat to read.** Angles sell depth during a move. When the viewer must read UI,
   the screen is square to camera (`yaw`, `pitch` near 0) and nearly still.
4. **Small angles.** While text is on screen: yaw within ±20°, pitch within ±12°. Bigger angles only
   while arriving or leaving. Never spin UI.
5. **Ease everything.** `ease.out` for arrivals, `ease.in` for exits (and make exits faster),
   `ease.inOut` between two holds, `linear` only for drift. UI springs use `damping: 200` (no
   bounce). Bounce belongs to logos and nothing else.
6. **Never stop dead.** Add a slow drift (a few degrees, ~5% dolly over the shot) on top of the keyed
   move, the way `Hero` does. A frozen frame in a 3D video reads as a bug.
7. **Hold long enough.** Readable things hold for their reading time (step 3) plus the move. When in
   doubt, hold longer and cut the next scene shorter.
8. **Depth cues sell it.** Floor grid, shadows, glare that slides as the camera turns, nearer things
   bigger and faster, a background that is not flat black.
9. **Cut on the beat and keep the direction.** If shot A drifts right, shot B starts moving right.
   A push-through (dolly into a screen until it fills the frame) is the best transition in the kit.
10. **Motion blur only on fast moves.** Anything crossing the frame in under ~0.5 s strobes without
   it. Wrap that one scene in the kit's `MotionBlur` with `samples={10}` (fewer shows stepped
   ghosts), and keep the background inside it. Not `@remotion/motion-blur`: it rounds each sample
   to 8 bits, which bands dark gradients and turns near-black green. Render time multiplies by
   `samples`, so never wrap the whole video.
11. **60 fps for camera-heavy videos** if render time allows (`FPS` in `timeline.ts`); 30 fps is
   fine for drafts and for mostly-held shots.
12. **Restraint.** No idle wobble on text, no transitions between every scene, no more than one
   showy move per 10 s. The product is the star.

### CSS 3D gotchas (each cost a bug)

- An element with `opacity < 1`, `filter`, `overflow: hidden`, `clip-path` or `mask` **flattens**:
  its children lose depth. Put those on leaf content (inside `Screen`), never on a `Layer`.
- Everything must be a pure function of `useCurrentFrame()`. No `Math.random()` (use Remotion's
  `random(seed)`), no `Date`, no CSS transitions or animations, no state that accumulates. Remotion
  renders frames out of order, in parallel tabs.
- DOM text stays sharp at any push-in (Chrome re-rasterizes every frame), but footage can't go past
  its pixels: push in on a 1× capture and it goes soft. Capture at 2×.
- `useVideoConfig()` inside a scene in a `<Series>` returns the scene's own length, not the video's.

## 6. Review: look at it, then look again

Render sheets and stills, then **Read the PNG** and actually look. After every round of changes:

```sh
npx remotion still Sheet out/sheet.png                                         # whole video, 1 frame/s
npx remotion still Sheet out/focus.png --props='{"scene":"Focus","every":6,"columns":6}'   # one scene, 5/s
npx remotion still Scene-Focus out/f140.png --frame=140                          # one full-size frame
npx remotion render Showcase out/draft.mp4 --scale=0.5                           # quick draft for the user
```

Check every sheet for:
- the hook frame (frame 0–60) makes sense with no sound and no context;
- every readable card is square to camera and held (several identical cells in a row);
- nothing important is cropped by the frame edge or hidden behind a nearer layer;
- no frame where the camera is inside or behind something (blank, mirrored, or huge blurred UI);
- consecutive cells change smoothly: a big jump between two cells is a jerk at 1/s, so recheck that
  span at 5/s;
- text contrast against what's behind it, at the size it will play (phone feed vs projector).

Stills can't show feel: speed, rhythm, whether a move is nauseating. Render a draft and ask the
user to watch it, with specific questions ("is the push-in at 0:12 too fast?").

## 7. Sound, render, deliver

Read `references/delivery.md`. In short: music sets the pace and the BPM in `timeline.ts` matches
it; only use music the user has the rights to, or generate one; render with
`npx remotion render Showcase out/final.mp4 --codec=h264 --crf=16`; make the vertical and square
cuts as their own compositions, never by cropping the 16:9 one; export a poster still.

Finally, tell the user where the files are, how long it runs, and the exact command to re-render.

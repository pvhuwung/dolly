# Videos from the user's own recordings

Read this when the user hands you recordings: screen recordings, phone recordings, a long demo.
Scan them, work out the story they can tell, propose it, then build.

## 1. Scan

Put the files in `public/takes/` (any names; phone HEVC and uneven frame rates are fine), then:

```sh
npm run scan
```

For each recording it finds the **holds** (a second or more where the screen barely changes: the
moments shots are cut from), the **changes** (a tap, a new screen, a result arriving) and the
stretches with **sound**, and writes `out/scan/SCAN.md` plus a sheet per recording
(`out/scan/<name>.png`): one frame from every hold and every long stretch of motion, labelled with
its time. A hold marked "something small moving" is one state with typing, a spinner or a shimmer
in it: often a wait.

**Read SCAN.md, then every sheet.** Note what each hold shows: the screen, what's on it, what just
changed. That's the raw material. Look closer where you need to:
`npx remotion still Sheet out/x.png --props='{"take":"takes/demo.mov","from":60,"seconds":20,"every":6}'`
(5 frames a second of 60–80 s), or one full frame with
`npx remotion ffmpeg -ss 64 -i public/takes/demo.mov -frames:v 1 out/f64.png`.

## 2. Find the story, and propose it

From the holds, work out what the product is and the moment that proves it (a result arriving, a
task done in one step), then lay out the video (SKILL.md, section 2): **the pain** (the hook),
**the product**, **the proof** (the real moments, in order), **the ask**. For each scene write the
recording and the seconds it comes from (`at`), how fast it plays (a wait at 4–8× with a `Speed`
chip, or cut), and its caption. Fill what the footage can't show with library items (a `Statement`
hook, a `Metric`, the `EndCard`).

Show the user the plan in a few lines (scenes, lengths, captions, the ask) with what you couldn't
find: a missing moment can't be made, only filled with a template or re-recorded. Then build.

## 3. Build from them

- **Size:** points are pixels over the screen's scale: 3 on most iPhones, 2 on a Retina Mac, the
  display scaling (1–1.5) on a PC. A phone recording goes in `<Screen frame="phone">` at its
  points (a 1179×2556 recording is 393×852).
- **Sound:** takes play muted. To keep narration, pull it out (`npx remotion ffmpeg -i
  public/takes/demo.mov -vn public/narration.wav`) and play it with `<Audio>`: it stays in sync
  only where shots don't cut or speed up.
- **Ask for the raw files:** zooms, cursor effects and backgrounds baked in by Screen Studio or
  Loom fight the camera. A real phone's status bar shows the real time and a recording dot:
  `crop` it off.
- **A rushed moment** can be held (`<Freeze>`, or `speed` below 1).

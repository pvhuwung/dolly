# Sound, render, deliver

## Music

Music sets the pace more than any shot does. Pick it (or make it) before you fine-tune timing.

- **Rights first.** Only use music the user owns or has licensed for this use, or music generated
  for the video. Never a commercial track "just for the draft": drafts get posted.
- **Match the BPM.** Set `BPM` in `timeline.ts` to the track's tempo. Scene lengths in bars then
  land every cut on a downbeat. If you can't get the tempo, cut by ear on the draft and convert the
  cut times to frames.
- **Generating music in code** is a real option for a short product video: a small Node script
  that synthesizes a WAV (pads, bass, a simple drum pattern, risers into the section changes) from
  a seeded random generator, so every render gets the same track. Keep the section times in the
  script and in `timeline.ts` in step.
- **Structure:** quiet open (the hook needs room), build through the show, a lift or a hit at the
  payoff, and a clean ending that resolves on the end card. Don't cut the music mid-phrase.

```tsx
import {Audio, interpolate, staticFile} from 'remotion';
// In Showcase, beside the <Series>:
<Audio
  src={staticFile('music.wav')}
  volume={(f) => interpolate(f, [0, 20, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 0.9, 0.9, 0], {extrapolateRight: 'clamp'})}
/>
```

## Sound effects

A soft whoosh under each big camera move and a low hit on the logo add more than they cost. Place
each one with a `<Sequence from={sceneStart('Focus') + 70}>` around an `<Audio>`, and start whooshes
3–5 frames BEFORE the move, because sound that lags picture feels wrong. Keep them quiet, about 10 dB
under the music.

## Voice-over and captions

- A voice-over turns a 60 s video into a 60 s explanation. Use one only if the user wants that:
  most launch videos are music plus on-screen words.
- If there's speech, there are captions, burned in: muted autoplay is the default on every feed.
  Keep them to two lines at most, 40+ px at 1080p, with a dark scrim behind, kept clear of the UI the
  viewer is meant to look at.

## Render

```sh
# Final, 16:9 1080p
npx remotion render Showcase out/final.mp4 --codec=h264 --crf=16
# 4K from the same 1080p composition: DOM text and the kit's shapes stay sharp
npx remotion render Showcase out/final-4k.mp4 --codec=h264 --crf=16 --scale=2
# Master for an editor (Premiere / Final Cut / Resolve)
npx remotion render Showcase out/master.mov --codec=prores --prores-profile=hq
# Poster / thumbnail: the most telling frame, usually mid-hero
npx remotion still Showcase out/poster.png --frame=150
# GIF for a README or docs (small and choppy by nature: keep it short)
npx remotion render Showcase out/preview.gif --codec=gif --every-nth-frame=2 --scale=0.4
```

- `--scale=2` from footage captured at 1× gives 4K with soft footage. Only render 4K if the
  footage was captured at 2×.
- Render time scales with frames × scene complexity. Motion blur multiplies its scene by `samples`.
  `--concurrency` tunes the number of parallel tabs if the machine has cores to spare.

## Loudness

Web platforms normalise to around -14 LUFS. Normalise once at the end, with the ffmpeg that ships
with Remotion (no install needed):

```sh
npx remotion ffmpeg -i out/final.mp4 -c:v copy -c:a aac -b:a 192k \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 out/final-loud.mp4
```

Remotion's bundled ffmpeg is a minimal build: it has `loudnorm`, `scale`, `crop`, `trim` and the
common encoders, but not filters like `fps`, `tile` or `select`. Use the `Sheet` composition for
contact sheets instead of ffmpeg.

## Other aspect ratios

Never crop the 16:9 render into a vertical video: the camera was framed for 16:9. Make a sibling
composition at 1080×1920 (or 1080×1080) that reuses the scenes, and re-aim the shots: closer
`dolly`, the phone as the main subject, type stacked rather than in a long line. Keep everything
important inside the middle 80% of a vertical frame; feeds draw their own buttons over the edges.

## Before you hand it over

- [ ] Full contact sheet reviewed after the last change, and a final full-size still of each scene.
- [ ] The first 2 s make sense muted, with no context.
- [ ] Every on-screen word spelled right, and the URL on the end card typed out and checked.
- [ ] No private data in any frame of any footage.
- [ ] Music licensed or generated, and its fade ends exactly at the last frame.
- [ ] Rendered file plays in QuickTime and in a browser. Report its length, resolution and size.
- [ ] The user has the re-render command and knows which file controls what (`timeline.ts`,
      `brand.ts`, `scenes/`).

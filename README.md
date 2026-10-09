# dolly

**3D motion videos, made by your coding agent.**

dolly is an agent skill for making product, launch and demo videos with real camera moves: screens
that tilt in from depth, orbits with parallax, push-ins on the one detail that matters, fly-pasts
with motion blur, an extruded 3D logo on the end card. The agent writes the video as code in
[Remotion](https://www.remotion.dev), renders it, and reviews its own work frame by frame before
you see it.

![Four frames from the starter: a tilt-in, an orbit with a phone, a fly-past, a 3D logo](docs/preview.jpg)

## Install

dolly is a folder with a `SKILL.md`, so any agent that reads Agent Skills can load it. For
Claude Code:

```sh
git clone https://github.com/gettermary/dolly ~/.claude/skills/dolly
```

Then ask for a video:

> Make a 45-second launch video for my app. The screen recordings are in ./footage, the logo is
> logo.svg, and it's for X and LinkedIn.

or invoke it directly with `/dolly`.

You need Node 18 or newer. Remotion downloads its own headless Chrome the first time it renders.

## What the agent gets

| | |
|---|---|
| `SKILL.md` | The workflow (brief → beat sheet → footage → shots → review → delivery) and twelve rules of motion that separate "expensive" from "slideshow" |
| `starter/` | A working Remotion project: a CSS 3D kit (camera, layers, screens, kinetic type, push-in helper, motion blur), a three.js logo, five example scenes, a timeline measured in music bars and a contact-sheet renderer |
| `references/recipes.md` | Shot recipes with code: dolly zoom, split depth, reflections, turn-around reveal, rack focus, push-through transitions and more |
| `references/capture.md` | Recording footage that survives a 3D treatment, on macOS, iOS, Android, the web and the terminal |
| `references/three.md` | When and how to use real 3D (three.js via `@remotion/three`) |
| `references/delivery.md` | Music, sound effects, captions, render settings, loudness, vertical cuts and a hand-over checklist |

The starter and every shot recipe were rendered and checked frame by frame against the pinned
versions in `starter/package.json`. The audio and three.js video-texture snippets are type-checked.

## The kit in one shot

```tsx
const camera = animate(frame, restCamera, [
  [0, {yaw: -34, pitch: 18, dolly: -1100}],          // start far back, high and turned
  [75, {yaw: -6, pitch: 6, dolly: 0}, ease.out],     // arrive and settle
]);

<Stage lens={1600} background={brand.background}>
  <Camera pose={camera}>
    <Floor />
    <Layer y={70} scale={0.85}>
      <Screen width={1280} height={800} title="My App">
        <Footage src="clip.mov" from={45} />
      </Screen>
    </Layer>
  </Camera>
</Stage>
```

## Without an agent

The starter is a normal Remotion project:

```sh
cp -R starter ~/my-video && cd ~/my-video && npm install
npx remotion studio                                   # preview and scrub
npx remotion still Sheet out/sheet.png                # contact sheet: the whole video, 1 frame/s
npx remotion render Showcase out/showcase.mp4         # 1080p render (about 30 s on an M-series Mac)
```

## License

dolly is MIT licensed (see [LICENSE](LICENSE)).

The starter depends on Remotion, which has its own license: it's free for individuals, non-profits
and companies with up to 3 employees, and larger companies need a
[company license](https://www.remotion.pro). three.js is MIT.

Made by the team behind [Termary](https://termary.com). Contributions are welcome; see
[CONTRIBUTING.md](CONTRIBUTING.md).

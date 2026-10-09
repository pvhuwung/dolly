# dolly starter

A Remotion project set up for 3D motion. See `../SKILL.md` for the full workflow.

```sh
npm install
npx remotion studio                                   # preview at localhost:3000
npx remotion still Sheet out/sheet.png                # contact sheet, 1 frame per second
npx remotion render Showcase out/showcase.mp4         # render the video
```

| File | What to change there |
|---|---|
| `src/brand.ts` | Name, tagline, colours, font, logo SVG |
| `src/timeline.ts` | Frame rate, music tempo, scene order and lengths (in bars) |
| `src/scenes/` | One file per shot |
| `src/kit/` | The 3D building blocks: `Stage`, `Camera`, `Layer`, `Screen`, `Footage`, `Floor`, `Words`, `focusOn`, keyframes |
| `src/three/` | Real 3D (three.js): the extruded logo |
| `public/` | Your footage, music and images; reference them with `staticFile()` or `<Footage src="...">` |

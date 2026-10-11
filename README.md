# dolly

**Ask your coding agent for a launch video. It records your app and edits it in 3D.**

dolly is an agent skill for product, launch and demo videos with real camera moves: screens that
tilt in from depth, orbits with parallax, push-ins on the one detail that matters, a 3D logo on the
end card. The agent records takes of your app, writes the video as code in
[Remotion](https://www.remotion.dev), and checks its own frames before you see anything.

![Four frames from the starter video: a tilt-in, an orbit with a phone, a push-in, the logo card](docs/preview.jpg)

## How a video gets made

1. **Plan.** The agent asks where the video will play, the one thing viewers should remember,
   and the call to action.
2. **Record.** `scripts/take.sh` records your Mac's screen, and the iOS Simulator if it's
   running. With [observee](https://github.com/gettermary/observee) installed, the agent drives
   your app itself while it records.
3. **Build shots.** Windows are cut out of the takes and placed in 3D, then the camera moves
   through them.
4. **Review.** The agent renders contact sheets (many frames on one image) and reads them.
5. **Render.** 1080p or 4K MP4, plus a poster frame.

## Install

dolly is a folder with a `SKILL.md`, so any agent that reads Agent Skills can use it. For
Claude Code:

```sh
git clone https://github.com/gettermary/dolly ~/.claude/skills/dolly
```

For the agent to record your app by itself, add observee too. It needs Rust:

```sh
git clone https://github.com/gettermary/observee && cd observee && ./install.sh
```

Then ask:

> Make a 45-second launch video of my app for X and LinkedIn. The logo is logo.svg.

You need macOS for recording (the editing works anywhere) and Node 18 or newer. Your terminal app
needs Screen Recording permission, plus Accessibility for observee.

## What's inside

| | |
|---|---|
| `SKILL.md` | The pipeline the agent follows, and the rules of motion |
| `starter/` | A working 22-second Remotion video to start from |
| `starter/src/kit.tsx` | The 3D kit, in one file: `Stage` (camera and lens), `Layer`, `Screen`, `Footage`, `Words`, `Extrude`, `Floor`, `animate`, `focusOn` |
| `starter/scripts/take.sh` | Records a take: screen and Simulator at once |
| `references/recipes.md` | More moves: fly-past with motion blur, dolly zoom, reflection, turn-around reveal |

Every scene and recipe is rendered and checked against the versions pinned in
`starter/package.json`.

## Without an agent

The starter is a normal Remotion project:

```sh
cp -R starter ~/my-video && cd ~/my-video && npm install
npx remotion studio                                  # preview and scrub
scripts/take.sh start A 30 && scripts/take.sh wait   # record a 30 s take
npx remotion still Sheet out/sheet.png               # the whole video on one image
npx remotion render Video out/video.mp4              # render it
```

## License

dolly is MIT licensed (see [LICENSE](LICENSE)). It builds on Remotion, which has its own license:
free for individuals and companies of up to 3 people, while larger companies need a
[company license](https://www.remotion.pro).

Made by the team behind [Termary](https://termary.com). Contributions are welcome; see
[CONTRIBUTING.md](CONTRIBUTING.md).

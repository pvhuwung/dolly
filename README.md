# dolly

**Ask your coding agent for a launch video. It records your app and edits it in 3D.**

dolly is an agent skill for product, launch and demo videos made from real screen recordings:
windows and panes cut from your takes, headlines in your brand's type, the camera pushing in on
the moment that matters, your Mac and phone in sync. The agent records the takes, writes the video
as code in [Remotion](https://www.remotion.dev), and checks its own frames before you see anything.

It's how we made [Termary](https://termary.com)'s launch video. The starter is a 41-second cut of it:

![Four frames from the starter: the hook, a captioned window, approving from the phone, the end card](docs/preview.jpg)

## How a video gets made

1. **Plan.** The agent asks where the video will play, the one thing viewers should remember,
   and the call to action.
2. **Record.** `scripts/take.sh` records your Mac's screen, and the iOS Simulator if it's
   running. With [observee](https://github.com/gettermary/observee) installed, the agent drives
   your app itself while it records.
3. **Build shots.** Windows and panes are cut out of the takes and placed in 3D under a headline,
   and the camera pushes in on what matters.
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

> Make a 45-second launch video for yourapp.com, for X and LinkedIn.

The agent starts every video with `new.sh`, which installs what's missing: Node (with Homebrew),
the project's packages, the sound effects, and the headless Chrome that renders the frames.
Recording needs macOS, and your terminal app needs Screen Recording permission (plus
Accessibility for observee). The editing works anywhere.

## Camera moves

Ready-made moves for any shot: `tiltIn`, `zoomIn`, `zoomOut`, `focus`, `pan`, `orbit` and
`pushThrough`. Each turns two framings into keyframes, and they chain. `npm run moves` renders a
sample reel of every one:

![Six moves from the sample reel, each labelled with the line that makes it](docs/moves.jpg)

```tsx
const wide = focusOn({rect: whole(PAGE), size: PAGE, video, lens: 1800, top: SAFE_TOP});
const card = focusOn({rect: PRICING_CARD, size: PAGE, video, lens: 1800, fill: 0.4, top: SAFE_TOP});
const camera = useShot(moves.zoomIn(wide, card), {dolly: 40});
```

## What's inside

| | |
|---|---|
| `SKILL.md` | The pipeline the agent follows, the look, and the rules of motion |
| `new.sh` | Sets up a new video project with everything installed |
| `starter/` | A working 41-second Remotion video to start from, with its takes |
| `starter/src/kit.tsx` | The 3D kit, in one file: `Stage` (camera and lens), `Layer`, `Screen`, `Clip`, `Footage`, `Words`, `Floor`, `animate`, `useShot`, `focusOn`, `moves` |
| `starter/src/parts.tsx` | Headlines (`Caption`), tap dots, callouts and speed chips, in the brand's look |
| `starter/scripts/` | `take.sh` records a take (screen and Simulator at once); `sfx.mjs` generates a chime, a whoosh and a click; `music.mjs` generates an original soundtrack of any length |
| `references/recipes.md` | Bigger moves: fly-past with motion blur, dolly zoom, reflection, turn-around reveal |

Every scene, move and recipe is rendered and checked against the versions pinned in
`starter/package.json`. The sounds and the music are synthesized by the scripts, so they're
free to use anywhere.

## Without an agent

The starter is a normal Remotion project:

```sh
~/.claude/skills/dolly/new.sh ~/my-video && cd ~/my-video
npx remotion studio                                  # preview and scrub
scripts/take.sh start A 30 && scripts/take.sh wait   # record a 30 s take
npx remotion still Sheet out/sheet.png               # the whole video on one image
npm run render                                       # out/video.mp4
npm run moves                                        # out/moves.mp4, the camera moves
npm run music -- 45                                  # public/music.wav, 45 s of original music
```

## License

dolly's code and docs are MIT licensed (see [LICENSE](LICENSE)). The example recordings and the
logo in `starter/public/` are Termary's, included so the starter renders a real result: replace
them with your own, and don't reuse them.

dolly builds on Remotion, which has its own license: free for individuals and companies of up to 3
people, while larger companies need a [company license](https://www.remotion.pro).

Made by the team behind [Termary](https://termary.com). Contributions are welcome; see
[CONTRIBUTING.md](CONTRIBUTING.md).

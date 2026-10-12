# Record takes on a Mac

Read this when you record the product yourself: a Mac app, a website, or an iOS app in the
Simulator, driven with observee.

A take is a recording of the whole screen (plus the iOS Simulator, when one is booted) while the
product does one thing. Shots later cut regions out of it.

```sh
scripts/take.sh start A 40     # records 40 s of the MacBook's screen, and returns at once
# ...now drive the app...
scripts/take.sh wait           # until it's saved: public/takes/A-mac.mov (+ A-phone.mov)
npm run scan -- public/takes/A-mac.mov   # its holds and changes, and a sheet of its frames
```

**Drive the app with observee** (the computer-use MCP server, github.com/gettermary/observee;
its CLI `observee <tool> key=value` works too): `open` the app, `read_ui` for refs, then
`click`, `type_text`, `press_key`, `scroll`, `wait_for`. Re-read refs after anything changes the
window. Without observee, the user performs the take while it records (`record-elsewhere.md`).

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
- **Read the take** with `npm run scan` (`your-footage.md` explains its output): the times of its
  holds and changes are your `at` values. Then pull full frames to measure regions:
  `npx remotion ffmpeg -ss 16 -i public/takes/A-mac.mov -frames:v 1 -vf scale=1512:-2 out/A16.png`
  gives a frame in screen points.
- **Film the real product.** A demo or preview mode shows canned results: record against the live
  service, signed in, or tell the user the pictures are staged.
- **For vertical,** the phone is the star and a whole Mac window is too small to read: plan takes
  where the action happens in one pane or on the phone.

## The iOS Simulator

- The Simulator recording only stores frames when its screen changes, and starts a moment off from
  the Mac one. Line them up on an event visible in both (a tap, a notification).
- `xcrun simctl status_bar booted override --time 9:41` first, for a clean status bar. With several
  simulators booted, `TAKE_SIM=<udid> scripts/take.sh start A 60` records the right one.
- **Device Hub** (Xcode 27 has no Simulator.app) ignores synthetic clicks: press controls through
  observee by ref or text, and reach gestures and toolbars with the app's debug launch arguments
  (`xcrun simctl launch <udid> <bundle id> -someFlag`). To type, turn on its Capture Keyboard and
  `press_key` plain keys. **Never send it Delete or ⌘ shortcuts**: ⌘A then Delete selects every
  simulator and asks to remove them. Autocorrect rewrites unusual words: type dictionary ones.

## A website

A website is a take too: open it in a new browser window on the built-in screen, sized to the
screen, and record while observee scrolls from section to section (nav links scroll smoothly to
anchors; a URL with `#section` jumps straight there). The page area below the toolbar is your
region. A sign-in-only product with no account: film its public site and say so to the user.

# Capturing footage

The video is only as good as the footage. A 3D camera can't save a cluttered, tiny, private screen.

## Before you record

- **Plan clips, not a session.** One clip per beat, each showing one action. Leave about 2 s of
  stillness before and after the action: those are your handles for trimming with `from`.
- **Big text.** Footage is shown smaller than life (a tilted window is ~70% of the frame). Raise
  the app's font size, use 125–150% zoom in browsers, 18–22 pt in terminals and editors.
- **Clean state.** Dummy data, a fresh project with a believable name, no real emails, tokens,
  API keys, customer names or file paths with a username in them. Hide desktop icons, turn on Do
  Not Disturb, quit apps that pop notifications, close unrelated tabs.
- **A fixed window size.** Pick one size for every desktop clip so shots match: 1440×900 points
  (16:10) or 1600×900 (16:9). On macOS:
  `osascript -e 'tell application "System Events" to tell process "Safari" to set size of window 1 to {1440, 900}'`
  (needs Accessibility permission for the terminal).
- **2× pixels.** Record on a Retina display or at 2× zoom, so push-ins stay sharp. A 1× capture
  can't be pushed in past about 1.1× before it softens.
- **Slow, deliberate input.** Move the cursor in straight lines, pause before clicking, type at a
  readable pace (or speed up the clip later with `speed`).

## macOS

- **A window or region:** ⌘⇧5, choose "Record Selected Portion", and save to `public/`.
- **Scripted:** `screencapture -v -k -R x,y,w,h -V 20 public/clip.mov` records that rectangle (in
  points) for 20 s, drawing clicks (`-k`). It needs Screen Recording permission for the terminal.
- QuickTime and `screencapture` write HEVC `.mov`; `Footage` plays it directly, no conversion
  needed. To shrink a huge capture:
  `avconvert --preset PresetHEVC1920x1080 --source in.mov --output public/clip.mov`.

## iOS Simulator

```sh
xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100 \
  --cellularBars 4 --wifiBars 3
xcrun simctl io booted recordVideo --codec=h264 public/phone.mp4   # Ctrl-C to stop
xcrun simctl status_bar booted clear
```

Show it in `<Screen frame="phone" width={340} height={700}>`. A 9:41 status bar with full battery
is the convention; a real clock reading 01:13 looks like an accident.

## A real phone

iPhone: Control Center → Screen Recording, then AirDrop it over. Turn on Do Not Disturb first and
pick a neutral wallpaper. Android: the Screen recorder tile, or `adb shell screenrecord /sdcard/x.mp4`.

## Web pages

- Record the browser window like any other app, or skip video entirely: take a tall full-page
  screenshot (Chrome DevTools → ⌘⇧P → "Capture full size screenshot") and scroll it in code with a
  `translateY` driven by `track()`. It's perfectly sharp and the scroll is perfectly smooth.
- For a page you control, render it at the exact size you need with a headless browser.

## Terminals and CLIs

Recorded terminals are the hardest footage to read. Two good options:

1. Record with a big font, a minimal prompt (`PS1='$ '`), a clean scrollback, and a theme that
   matches the video's background.
2. Rebuild it in code: a `Screen` with a monospace `div` whose lines appear frame by frame. Every
   character is crisp at any push-in, and you control the timing exactly. Use it for the hero
   moment; record the rest.

## Using the footage

```tsx
<Screen width={1280} height={800} title="My App">
  <Footage src="clip.mov" from={45} speed={1.5} />
</Screen>
```

- `from` skips frames of the source clip (it isn't affected by `speed`).
- `speed` plays faster or slower: use 2–4× to get through waits instead of cutting them.
- The same clip can feed several shots with different `from` values.
- Check every frame you use for private data. A contact sheet (`npx remotion still Sheet ...`) shows
  the whole video at once and makes a leaked token easy to spot.

# The user records

Read this when the user has to perform the takes: a moment that needs a real device (the camera,
AR, a notification), an account or payment you shouldn't touch, an app you can't drive, and
everything on Windows. Once the files exist, `your-footage.md` takes over.

**Write them a shot list:** one take per moment; for each, the screen to start on, every step, and
"hold 5 s" before and after it; slow taps; Do Not Disturb on, a demo account, no private data.
Start recording 3 s early and stop 3 s late.

- **On a Mac,** `scripts/take.sh start A 60` records while they drive (`record-mac.md`).
- **On Windows** (Git Bash), `take.sh` records the desktop with ffmpeg (`winget install
  Gyan.FFmpeg`), or one window with `TAKE_WINDOW="<title>"`. observee and the iOS Simulator are
  Mac-only, so the user drives.
- **A real iPhone** records itself: Control Center, Screen Recording, then AirDrop the file over.
- **Android:** `adb shell screenrecord --time-limit 60 /sdcard/A.mp4`, then `adb pull
  /sdcard/A.mp4 public/takes/`. You can drive it yourself: `adb shell input tap x y`, and
  `adb shell uiautomator dump` lists the screen's elements.

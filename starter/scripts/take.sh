#!/usr/bin/env bash
# Records a take on macOS: a whole screen for a fixed time, plus the iOS Simulator if one is
# booted. Drive the app while it records (with observee, or by hand).
#
#   scripts/take.sh start A 40   # record 40 s (default 60); returns at once
#   scripts/take.sh wait         # waits until the take is saved, then says how to review it
#
# Spare seconds at the end cost nothing: shots pick their start with <Footage at={...}>. It records
# the built-in Retina screen when there is one (2x pixels keep push-ins sharp); TAKE_DISPLAY=1
# records the main display instead. The app running this needs Screen Recording permission.
set -euo pipefail
cd "$(dirname "$0")/.."
dir=public/takes
state=.take

# screencapture -D counts screens in NSScreen order, from 1.
builtin_display() {
  osascript -l JavaScript -e 'ObjC.import("AppKit"); const s = $.NSScreen.screens; let n = 1;
    for (let i = 0; i < s.count; i++) if (s.objectAtIndex(i).localizedName.js.includes("Built-in")) { n = i + 1; break; } n'
}

case "${1:-}" in
start)
  name=${2:?usage: scripts/take.sh start <name> [seconds]}
  seconds=${3:-60}
  [ -e "$state" ] && { echo "A take is already recording. Run: scripts/take.sh wait" >&2; exit 1; }
  mkdir -p "$dir"
  display=${TAKE_DISPLAY:-$(builtin_display)}
  files="$dir/$name-mac.mov"
  phone=""
  if xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
    xcrun simctl io booted recordVideo --codec=h264 --force "$dir/$name-phone.mov" </dev/null >/dev/null 2>&1 &
    phone=$!
    files="$files $dir/$name-phone.mov"
  fi
  # screencapture only saves when its time is up (a signal discards the recording), so it gets
  # a fixed length, and the Simulator recording is stopped when it ends.
  (
    screencapture -x -v -V "$seconds" -D "$display" "$dir/$name-mac.mov" </dev/null >/dev/null 2>&1
    if [ -n "$phone" ]; then kill -INT "$phone" 2>/dev/null || true; fi
  ) &
  printf '%s\n%s\n' "$! $phone" "$files" >"$state"
  echo "Recording take $name for $seconds s: display $display${phone:+ and the Simulator}. Then: scripts/take.sh wait"
  ;;
wait)
  [ -e "$state" ] || { echo "No take is recording." >&2; exit 1; }
  pids=$(sed -n 1p "$state")
  files=$(sed -n 2p "$state")
  for pid in $pids; do while kill -0 "$pid" 2>/dev/null; do sleep 0.5; done; done
  rm "$state"
  for file in $files; do
    read -r w h secs <<<"$(npx --no-install remotion ffprobe -v error -select_streams v:0 \
      -show_entries stream=width,height:format=duration -of default=nw=1:nk=1 "$file" | tr '\n' ' ')"
    secs=$(printf '%.0f' "$secs")
    echo "Saved $file: $secs s, ${w}x${h} px."
    echo "  Review: npx remotion still Sheet out/$(basename "$file" .mov).png --props='{\"take\":\"${file#public/}\",\"seconds\":$secs}'"
  done
  ;;
*)
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
  ;;
esac

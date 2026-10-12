#!/usr/bin/env bash
# Records a take: a whole screen for a fixed time, plus the iOS Simulator if one is booted (on a
# Mac). Drive the app while it records (with observee, or by hand).
#
#   scripts/take.sh start A 40   # record 40 s (default 60); returns at once
#   scripts/take.sh wait         # waits until the take is saved, then says how to review it
#
# Spare seconds at the end cost nothing: shots pick their start with <Footage at={...}>.
# macOS: records the built-in Retina screen when there is one (2x pixels keep push-ins sharp);
# TAKE_DISPLAY=1 records the main display instead, and TAKE_SIM=<udid> picks the simulator when
# more than one is booted. The app running this needs Screen Recording permission.
# Windows (in Git Bash): records the desktop with ffmpeg (winget install Gyan.FFmpeg), or one
# window with TAKE_WINDOW="<its title>".
set -euo pipefail
cd "$(dirname "$0")/.."
dir=public/takes
state=.take
log=.take-log

# screencapture -D counts screens in NSScreen order, from 1.
builtin_display() {
  osascript -l JavaScript -e 'ObjC.import("AppKit"); const s = $.NSScreen.screens; let n = 1;
    for (let i = 0; i < s.count; i++) if (s.objectAtIndex(i).localizedName.js.includes("Built-in")) { n = i + 1; break; } n'
}

case "$(uname -s)" in
Darwin) os=mac ;;
MINGW* | MSYS* | CYGWIN*) os=windows ;;
*) os=other ;;
esac

case "${1:-}" in
start)
  name=${2:?usage: scripts/take.sh start <name> [seconds]}
  seconds=${3:-60}
  [ -e "$state" ] && { echo "A take is already recording. Run: scripts/take.sh wait" >&2; exit 1; }
  mkdir -p "$dir"
  rm -f "$log"
  phone=""
  if [ "$os" = mac ]; then
    display=${TAKE_DISPLAY:-$(builtin_display)}
    files="$dir/$name-mac.mov"
    sim=${TAKE_SIM:-booted}
    if [ -n "${TAKE_SIM:-}" ] || xcrun simctl list devices booted 2>/dev/null | grep -q Booted; then
      xcrun simctl io "$sim" recordVideo --codec=h264 --force "$dir/$name-phone.mov" </dev/null >/dev/null 2>&1 &
      phone=$!
      files="$files $dir/$name-phone.mov"
    fi
    # screencapture only saves when its time is up (a signal discards the recording), so it gets
    # a fixed length, and the Simulator recording is stopped when it ends.
    (
      screencapture -x -v -V "$seconds" -D "$display" "$dir/$name-mac.mov" </dev/null >/dev/null 2>"$log"
      if [ -n "$phone" ]; then kill -INT "$phone" 2>/dev/null || true; fi
    ) &
    what="display $display${phone:+ and the Simulator}"
  elif [ "$os" = windows ]; then
    command -v ffmpeg >/dev/null 2>&1 || { echo "Recording on Windows needs ffmpeg: winget install Gyan.FFmpeg, then open a new terminal." >&2; exit 1; }
    files="$dir/$name-pc.mp4"
    input=desktop
    [ -n "${TAKE_WINDOW:-}" ] && input="title=$TAKE_WINDOW"
    # x264 needs even sides, and a window can have odd ones.
    ffmpeg -hide_banner -loglevel error -y -f gdigrab -framerate 30 -i "$input" -t "$seconds" \
      -vf 'crop=trunc(iw/2)*2:trunc(ih/2)*2' -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p \
      "$dir/$name-pc.mp4" </dev/null >/dev/null 2>"$log" &
    what=${TAKE_WINDOW:+"the window \"$TAKE_WINDOW\""}
    what=${what:-the desktop}
  else
    echo "take.sh records on macOS and Windows. Here, record with any screen recorder and put the files in $dir/." >&2
    exit 1
  fi
  printf '%s\n%s\n' "$! $phone" "$files" >"$state"
  echo "Recording take $name for $seconds s: $what. Then: scripts/take.sh wait"
  ;;
wait)
  [ -e "$state" ] || { echo "No take is recording." >&2; exit 1; }
  pids=$(sed -n 1p "$state")
  files=$(sed -n 2p "$state")
  for pid in $pids; do while kill -0 "$pid" 2>/dev/null; do sleep 0.5; done; done
  rm "$state"
  for file in $files; do
    if [ -e "$file" ] && [ ! -s "$file" ]; then
      echo "$file is empty (nothing changed on the Simulator?): delete it."
      continue
    elif [ ! -e "$file" ]; then
      echo "Nothing was saved at $file."
      [ -s "$log" ] && sed 's/^/  /' "$log"
      continue
    fi
    read -r w h secs <<<"$(npx --no-install remotion ffprobe -v error -select_streams v:0 \
      -show_entries stream=width,height:format=duration -of default=nw=1:nk=1 "$file" | tr '\n' ' ')"
    secs=$(printf '%.0f' "$secs")
    [ "$secs" -eq 0 ] && { echo "$file has no length (nothing changed on the Simulator?): delete it."; continue; }
    base=$(basename "$file")
    tall=""
    [ "$h" -gt "$w" ] && tall=',"format":"vertical"'
    echo "Saved $file: $secs s, ${w}x${h} px."
    echo "  Review: npx remotion still Sheet out/${base%.*}.png --props='{\"take\":\"${file#public/}\",\"seconds\":$secs$tall}'"
  done
  rm -f "$log"
  ;;
*)
  awk 'NR > 1 && /^#/ {sub(/^# ?/, ""); print; next} NR > 1 {exit}' "$0"
  exit 1
  ;;
esac

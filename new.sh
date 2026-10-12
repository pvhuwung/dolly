#!/usr/bin/env bash
# Sets up a new dolly video project, with everything it needs installed:
#
#   ~/.claude/skills/dolly/new.sh my-video
#
# It checks Node (and installs it with Homebrew if it's missing), copies the starter, installs its
# packages (which also generates the sound effects), downloads the headless browser Remotion
# renders with, and checks the tools for recording takes.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
dest="${1:-}"
if [ -z "$dest" ]; then
  echo "usage: $0 <new project folder>" >&2
  exit 1
fi
if [ -e "$dest" ]; then
  echo "$dest already exists. Pick a new folder name." >&2
  exit 1
fi

step() { printf '\n\033[1m%s\033[0m\n' "$1"; }

step "Node"
node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$node_major" -lt 18 ]; then
  if command -v brew >/dev/null 2>&1; then
    echo "Node 18 or newer is needed; installing it with Homebrew."
    brew install node
  else
    echo "Node 18 or newer is needed. Install it from https://nodejs.org (or: brew install node on a Mac, winget install OpenJS.NodeJS.LTS on Windows), then run this again." >&2
    exit 1
  fi
fi
echo "node $(node -v)"

step "Project"
cp -R "$here/starter" "$dest"
rm -rf "$dest/node_modules" "$dest/out" "$dest/.take" "$dest/.take-log"
cd "$dest"
npm install --no-audit --no-fund
echo "created $(pwd)"

step "Renderer"
# Remotion renders with its own headless Chrome. Fetch it now instead of on the first render.
npx --no-install remotion browser ensure

step "Recording"
case "$(uname -s)" in
Darwin)
  echo "scripts/take.sh records the screen. Your terminal app needs Screen Recording permission"
  echo "(System Settings > Privacy & Security > Screen & System Audio Recording)."
  if command -v observee >/dev/null 2>&1 || (command -v claude >/dev/null 2>&1 && claude mcp list 2>/dev/null | grep -q observee); then
    echo "observee is installed: the agent can drive your app while it records."
  else
    echo "Optional: install observee so the agent can drive your app while it records:"
    echo "  git clone https://github.com/gettermary/observee && cd observee && ./install.sh"
  fi
  ;;
MINGW* | MSYS* | CYGWIN*)
  echo "scripts/take.sh records the screen with ffmpeg while you drive the app. The agent can't drive it here."
  if command -v ffmpeg >/dev/null 2>&1; then echo "ffmpeg is installed."; else echo "Install ffmpeg first: winget install Gyan.FFmpeg"; fi
  echo "Recordings you already have work too: put them in public/takes/."
  ;;
*)
  echo "scripts/take.sh records on macOS and Windows. Everything else works here: bring recordings in public/takes/."
  ;;
esac

step "Ready"
cat <<EOF
  cd $dest
  npx remotion studio       # preview and scrub
  npm run styles            # out/styles.png: one frame in every style, to pick a look
  npm run gallery           # out/gallery.png: every template and effect, labelled with its code
  npm run sheet             # out/sheet.png: the whole video on one image
  npm run render            # out/video.mp4 (16:9); render:vertical, render:square, render:portrait
  npm run promo             # out/promo.mp4: a motion-graphics cut, no recordings needed
EOF

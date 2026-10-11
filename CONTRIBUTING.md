# Contributing to dolly

New recipes, better defaults, fixes and clearer docs are all welcome. For anything bigger than a
small fix, open an issue first so we can agree on the approach.

## Test a change

Work in a copy of the starter, so `node_modules` never lands in the skill folder:

```sh
./new.sh /tmp/dolly-test && cd /tmp/dolly-test
npx tsc --noEmit
npx remotion still Sheet out/sheet.png                  # look at it
npx remotion render Video out/video.mp4 --scale=0.5     # and watch it
npm run moves                                           # if you touched the camera or moves
npm run styles && npm run formats                       # if you touched a style, a format or a scene
npx remotion still GallerySheet out/g.png --props='{"only":"text","format":"vertical"}'   # an effect, in another format
```

A new effect or template goes in `src/fx/` or `src/templates.tsx` with a `demos` entry, reads
everything from `useLook()`, and must look right in every style and format.

Copy the files you changed back into `starter/` when you're done.

## The one rule

**Every snippet is rendered before it's merged.** Agents copy the code in `SKILL.md`,
`references/` and `starter/` verbatim, so a snippet that only looks right ends up wrong in every
video made from it. Render it with the pinned versions, look at the start, middle and end of the
move, and say in the pull request what you rendered.

## Pull requests

- One change per pull request, with a title that says what it does.
- Keep `SKILL.md` short: it's loaded into the agent's context on every run.
- Frame-driven animation only, no new dependencies without a reason, versions pinned exactly.
  Upgrading Remotion means bumping every `@remotion/*` package together.

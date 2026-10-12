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

Copy the files you changed back into `starter/` when you're done.

## Add to the library

Every template, text effect, graphic, drawing, voice part, backdrop and transition is an item: a
folder in `starter/src/library/<category>/<name>/` holding `<name>.tsx`, `<name>.demo.tsx` and
`item.json`. A video that invents something reusable (a layout, a chip, a way in) gives it back as
an item.

1. **The component**, in `<name>.tsx`. It reads everything from `useLook()` (never a colour or a
   font of its own), takes `start` for the frame it begins and `exit` for the frame it leaves, has
   a one-line doc comment on every prop (the catalog shows them), and lays itself out for every
   format. Core imports are `../../../look`, `../../../kit`, `../../../backdrop`; another item is
   `../../<category>/<name>/<name>`; helpers several items in a category share go in that
   category's `_shared.tsx`. A backdrop exports `backdrop` and a transition exports `transition`
   (see the others); everything else exports its component by name.
2. **Its sample**, in `<name>.demo.tsx`, exported as `demos: Demo[]`: a few seconds of it on its
   own, labelled with the line of code that makes it, for `npm run gallery`. Keep everything only
   the sample uses in that file (or the category's `_demo.tsx`), so copying the item doesn't drag
   in what its sample shows off with.
3. **`item.json`**: its `name` (the export), a one-sentence `summary`, a `usage` line that works as
   written, a few `tags`, and its `order` in the gallery.
4. **`npm run library`** rewrites `src/library/index.ts` and the catalogs (the index in
   `CATALOG.md`, each category's own `CATALOG.md`, `catalog.json`) from the folders, with the props
   read from the TypeScript types. `npm run library -- --previews` also re-renders each category's
   `preview.jpg`, then run `npm run library` once more. Commit them all.
5. **Render it** in every style and in a tall format: `npx remotion still GallerySheet out/g.png
   --props='{"only":"graphics","format":"vertical"}'`, and on its own with `npx remotion render Item
   out/it.mp4 --props='{"id":"graphics/stat"}'`. `npm run samples` renders every item's clip and
   poster for the showreel's library page (`scripts/build-library.mjs` in the site brings them in).

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

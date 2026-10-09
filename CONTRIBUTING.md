# Contributing to dolly

Thanks for helping. New recipes, better defaults, fixes and clearer docs are all welcome.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree on the approach.
- `SKILL.md` is loaded into an agent's context every time the skill runs. Keep it short: detail
  belongs in `references/`, code belongs in `starter/`.

## Test a change

Work in a copy of the starter, so `node_modules` never lands in the skill folder:

```sh
cp -R starter /tmp/dolly-test && cd /tmp/dolly-test && npm install
npx tsc --noEmit
npx remotion still Sheet out/sheet.png                     # look at it
npx remotion render Showcase out/showcase.mp4 --scale=0.5  # and watch it
```

Copy your changed files back into `starter/` when you're done.

## The one rule

**Every snippet must be rendered before it's merged.** If a pull request adds or changes code in
`SKILL.md`, `references/` or `starter/`, render it with the pinned versions and look at the frames:
the start, the middle and the end of the move. Say in the pull request what you rendered. Agents
copy these snippets verbatim, so a snippet that only looks right will be wrong in every video made
from it.

## Pull requests

- Keep each pull request to one change, with a title that says what it does.
- Match the surrounding code: frame-driven animation only, no new dependencies without a reason,
  and versions pinned exactly.
- Upgrading Remotion means bumping every `@remotion/*` package together, then rendering the full
  showcase and the contact sheet.

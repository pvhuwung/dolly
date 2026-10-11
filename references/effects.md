# Effects and templates

Everything in `starter/src/fx/` and `starter/src/templates.tsx`, one line each. The JSDoc on each
export has its full props. Every one reads the style and the format from `useLook()`, so it never
takes colours or fonts. Times are frames from the start of the scene it's in.

See them all: `npm run gallery` (one still each), or `npx remotion render Gallery out/gallery.mp4`
(each playing, labelled with its code). Narrow either with
`--props='{"only":"text","style":"bold","format":"vertical"}'`; `only` is `templates`, `text`,
`graphics`, `drawings`, `backdrops` or `transitions`.

## Templates: whole scenes (`templates.tsx`)

| | |
|---|---|
| `<Statement eyebrow? text accent? effect? />` | One big line, centred: a hook, a punchline |
| `<Metric value label prefix? suffix? decimals? note? />` | A number counting up and what it counts. Real numbers only |
| `<Features eyebrow? title? accent? items={[{icon, title, text?}]} />` | 3–6 cards with lucide icons: 3 across wide, stacked tall |
| `<Quote quote accent? name role? />` | A testimonial with initials. Real quotes only, with permission |
| `<Compare title? accent? before={{title, items}} after={{title, items}} />` | The old way struck, the product's way ticked |
| `<Steps title? accent? steps={[...]} />` | Numbered steps joined by a line that draws |
| `<LogoReveal kind? tagline? accent? />` | The logo arriving: `pop`, `iris`, `slide`, `focus` |
| `<EndCard line? accent? button? url? />` | Name, one line, a button with a glint, the URL |

Icons are [lucide](https://lucide.dev/icons) components: `import {Columns3} from 'lucide-react'`.

## Text (`fx/text.tsx`)

| | |
|---|---|
| `<Kinetic text accent? effect? start? stagger? exit? mark? align? style? />` | A line that comes in word by word (or letter by letter) and wraps to its box |
| `<Mark kind at color?>words</Mark>` | Marks any inline content: a number, a name, a label |
| `<Cycle words every? start? style? />` | One word that keeps changing: "Videos that feel *fast / polished / yours*" |
| `<Counter to from? start? frames? decimals? prefix? suffix? style? />` | A number counting, its width fixed so nothing moves |

`effect`: `rise` (swings up), `reveal` (slides up from behind a line), `blur` (into focus), `pop`
(springs up), `type` (typed, with a caret), `letters`, `slide` (from the left), `scramble`
(decodes), `fade`. Unset, the style picks.

`mark` (on the accent phrase): `marker` (highlighter), `block` (knocked out of a solid block),
`pill`, `underline`, `circle` (hand-drawn), `strike`, `box`, `none`. Unset, the style picks.

## Graphics (`fx/graphics.tsx`)

Positions are px in the parent; most come in at `start` or `at` and leave at `exit`.

| | |
|---|---|
| `<Stat value label prefix? suffix? delta? />` | A big number with its label, and a "+38%" chip once it lands |
| `<Ring value label? />` | A ring filling to a percent, the number counting in the middle |
| `<Bars data={[{label, value}]} highlight? />` | Bars growing one after another, values counting |
| `<LineChart values labels? />` | A line drawing across, area filling under it, a dot riding the head |
| `<Progress value label? />` | A bar filling to a percent |
| `<Checklist items />` | Items ticking off one by one |
| `<Arrow from to bend? />` | A hand-drawn arrow drawing itself toward something |
| `<Draw d width height />` | Any SVG path drawing itself on: an underline, a scribble, a route |
| `<Spotlight rect at />` | Dims the frame except one rect: put it over a shot |
| `<Cursor points={[{x, y, at, click?}]} />` | A pointer gliding between points, rippling on clicks |
| `<Keys keys={['⌘', 'K']} />` | Keyboard keys pressing in sequence |
| `<Toast title body? icon? from? />` | A notification sliding in, with the app's logo |
| `<Chat messages={[{from: 'me' \| 'them', text, at}]} />` | Chat bubbles, with typing dots before each reply |
| `<Badge text icon? tone? />` | A pill label: `accent`, `soft`, `card`, `alert` |
| `<Icon icon tone? />` | A lucide icon in a tinted tile |
| `<Marquee items loop? reverse? />` | An endless ticker of words or logos |
| `<Burst x y at />` | Confetti for a success moment |
| `<Shine at every?>children</Shine>` | A glint across a button, a logo, a price |

## Drawings (`fx/drawings.tsx`)

Illustrations drawn with code, each animating as it's drawn from `start`, deterministic per `seed`
(another seed, another plant). Their pigments (rose, ochre, terracotta, plum, sage, dusty blue) are
tinted toward the brand colour; `palette` overrides them.

| | |
|---|---|
| `<Paper width height rotate?>children</Paper>` | A card of warm paper with grain and an uneven edge: the frame for a drawing |
| `<Flower size? petals? />` | A watercolour flower: the stem draws up, leaves unfurl, the bud opens |
| `<Stamps width height motif? count? />` | Stamped motifs (`flower`, `star`, `leaf`, `dot`, `sprig`) landing one by one |
| `<HexField width height origin? />` | A hexagon heat map spreading from a hot spot |
| `<Butterfly size? arrive? />` | A veined butterfly fluttering in and hovering |
| `<Plant width? height? seed? />` | A branching plant growing, leaves and blooms |
| `<Stitch size? shape? />` | Embroidery sewn in: `sun`, `circle`, `heart`, `leaf` |
| `<Watercolor width height kind?>headline</Watercolor>` | A brushstroke or pool painted in behind words |
| `<Doodles kind />` | Pen marks drawn on: `underline`, `circle`, `squiggle`, `arrow`, `loop`, `spiral`, `star`, `sparkle`, `heart`, `burst`, `check` |
| `<Constellation width height count? />` | Stars appearing and joining with fine lines |
| `<Contours width height levels? />` | Topographic lines drawing on, level by level: a map |
| `<Ripple width height drops? />` | Ink drops landing and rippling out |
| `<Scribble width height />` | A marker scribble filling in behind a word |

## Backdrops (`fx/backdrops.tsx`)

`<Backdrop kind? />` fills the frame with the page: the style's own unless `kind` says otherwise.
Put it first in a scene, under the Stage (a Stage has no background of its own).

`plain`, `glow` (soft accent lights), `grid` (a column grid), `dots`, `blobs` (drifting pastels),
`scanlines`, `grain` (film), `aurora` (ribbons of light), `beams` (light from above), `spotlight`.

## Transitions (`fx/transitions.tsx`)

`<Scenes scenes={SCENES} />` plays a scene list, joining scenes with the style's transition unless a
scene names its own (`transition: 'iris'`, the one into it). Transitions overlap the scenes they
join, so a video's length depends on them: `scenesLength(SCENES, style)` and
`sceneStarts(SCENES, style)` give the numbers, for the composition and for sound cues.

| Transition | Frames | |
|---|---|---|
| `cut` | 0 | The default for editorial: nothing beats a cut on the beat |
| `glitch` | 9 | RGB split and slice offsets: terminal |
| `whip`, `flash` | 10 | A fast smear sideways; a bright flash with a punch-in |
| `fade` | 12 | A crossfade |
| `zoom`, `pushCut` | 14 | Forward through the old scene: midnight; a push with a hard cut |
| `slide`, `wipe` | 16 | The new scene pushes the old one out: bold; a hard-edged wipe: swiss |
| `dip`, `iris`, `clock` | 20 | Through the page colour: cinema; a circle: soft; a clock hand |
| `flip`, `bars` | 22 | A card flip; accent bars sweeping across |
| `zoomBlur`, `linearBlur`, `blurSlide` | 18–20 | Shaders: radial and directional blurs |
| `crossZoom`, `crosswarp` | 24 | Shaders: zoom and warp through |
| `dreamyZoom`, `swap`, `bookFlip` | 26 | Shaders. `dreamyZoom` washes light pages out |
| `filmBurn`, `ripple` | 30 | Shaders: a film burn, a water ripple |

Directional transitions move right to left, so motion carries one way through the video.
Shaders need WebGL2: the starter's `remotion.config.ts` sets the ANGLE renderer for that, and the
Studio previews them only in Chrome 148+ with `chrome://flags/#canvas-draw-element` on. A sheet
with more than about a dozen shader transitions shows some of them blank (Chrome's limit on live
WebGL contexts); each renders fine on its own.

## Assets

The starter bundles only what an MIT repo can: its own synthesized sounds (`scripts/sfx.mjs`,
`scripts/music.mjs`), Google Fonts loaded at render time, and lucide icons (ISC). For more:

- **Sound:** [Kenney](https://kenney.nl/assets/category:Audio) and [Freesound](https://freesound.org)
  filtered to CC0 can be bundled. Mixkit and Pixabay allow use in a video, not redistribution:
  download into the user's project, never into a repo.
- **Icons:** lucide (installed), [Phosphor](https://phosphoricons.com) and
  [Tabler](https://tabler.io/icons) (MIT).
- **Lottie:** [@remotion/lottie](https://www.remotion.dev/docs/lottie) plays LottieFiles
  animations; their license allows use in a video, not collecting them in a repo.
- **Device frames:** keep them generic. `Screen` draws its own; Apple's marketing guidelines
  forbid 3D renders that simulate its hardware.
- **Remotion's own rules** for agents: `npx skills add remotion-dev/skills` adds Remotion's API
  rules (captions, audio, Lottie, 3D, charts) next to dolly's.

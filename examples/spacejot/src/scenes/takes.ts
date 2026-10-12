import type {Rect} from '../kit';

// The takes the scenes are cut from (public/takes/), and where things are in them. Every take is the
// iPhone 18 Pro simulator, recorded with scripts/take.sh while observee drove the real app, signed in
// to a real account on the live server: every picture in them was made by Spacejot, live.
//
//   A  the demo tour (-tour YES): not used, its pictures are the demo's canned ones
//   B  New design → a line drawing + Abruzzo Oak → "Warm calm living room in oak and linen" → the
//      render → Compare → Continue in chat (reply) → "Evening with the lamps on" → the evening render
//   C  that evening render in the editor: Empty room, then Bradford Beige on the walls
//   D  Library → select four → Make a client board → a title
//   E  the Plans tour (-planTour YES): a plan in 2D, then 3D, turned and zoomed
//   F  Explore → Japandi → Explore concepts → four concepts → the prompt library

/** The phone's screen in points. The takes are 1206 x 2622 px: 3 px per point. */
export const PHONE = {width: 402, height: 874};
export const PX = 3;

export const TAKE = {
  restyle: 'takes/B-phone.mov',
  edit: 'takes/C-phone.mov',
  board: 'takes/D-phone.mov',
  plans: 'takes/E-phone.mov',
  explore: 'takes/F-phone.mov',
};

/** The real pictures from those takes, full size from the account's Library, and the drawing sent. */
export const STILL = {
  drawing: 'stills/drawing.jpg', // 1400 x 737, the 3D model's line render that was sent
  day: 'stills/day.jpg', // 1376 x 768, its render
  evening: 'stills/evening.jpg', // the reply: "Evening with the lamps on"
  empty: 'stills/empty.jpg', // the editor's Empty room
  beige: 'stills/beige.jpg', // then Bradford Beige (Nippon Paint) on the walls
  japandi: ['stills/japandi-1.jpg', 'stills/japandi-2.jpg', 'stills/japandi-3.jpg', 'stills/japandi-4.jpg'], // 1200 x 896
};
export const RENDER = {width: 1376, height: 768};

/** Where things are on the phone's screen, in points (for Tap). */
export const SPOT = {
  photoTile: {x: 190, y: 539},
  abruzzo: {x: 328, y: 366},
  addMaterial: {x: 200, y: 804},
  send: {x: 366, y: 807},
  continueInChat: {x: 261, y: 239},
  emptyRoom: {x: 327, y: 664},
  emptyButton: {x: 200, y: 750},
  walls: {x: 111, y: 610},
  bradford: {x: 191, y: 667},
  japandi: {x: 94, y: 334},
  exploreConcepts: {x: 200, y: 787},
  makeBoard: {x: 200, y: 698},
};

/** Regions of the phone's screen, in points. */
export const REGION = {
  // The plan in 3D, in the middle of the Plans screen.
  plan3d: {x: 0, y: 250, width: 402, height: 330},
  // The client board's live preview.
  board: {x: 30, y: 136, width: 342, height: 420},
};

/** A region in points as the take's pixels, for <Footage crop>. */
export const px = (r: Rect): Rect => ({x: r.x * PX, y: r.y * PX, width: r.width * PX, height: r.height * PX});

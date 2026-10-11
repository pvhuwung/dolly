import type {Rect} from '../kit';

// The takes the scenes are cut from (public/takes/), and where things are in them. These come from
// Termary's launch video: one take of the Mac (scripts/take.sh), with the Simulator recorded at the
// same time, cropped to the app's window.

/** The Termary window. Its clip is 1842x1078 px: 1.25 px per point of the window. */
export const MAC = {src: 'takes/mac.mp4', width: 1473, height: 862};
const PX = 1842 / 1473;

/** The phone, recorded beside the Mac and already lined up with it: same `at`, same moment. */
export const PHONE = {src: 'takes/phone.mp4', width: 416, height: 876};

/** The push notification arriving on the phone's home screen. */
export const PUSH = {src: 'takes/push.mp4'};

/** Regions of the window, in points. Pass them through `crop()` for <Footage crop>. */
export const PANE = {
  leftTop: {x: 8, y: 49, width: 577, height: 370},
  leftBottom: {x: 8, y: 432, width: 577, height: 370},
  browser: {x: 596, y: 49, width: 872, height: 560},
};

export const crop = (r: Rect): Rect => ({x: r.x * PX, y: r.y * PX, width: r.width * PX, height: r.height * PX});

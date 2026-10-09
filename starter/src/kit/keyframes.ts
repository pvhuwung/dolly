import {Easing, interpolate} from 'remotion';

export type Ease = (t: number) => number;

// The curves almost every shot needs. Arrivals decelerate, exits accelerate, and a move between two
// holds does both. `linear` is only for slow drift, never for something that starts or stops.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  linear: Easing.linear,
};

// [frame, value, ease into this key]. The ease shapes the segment that ENDS at this key.
export type Key = readonly [frame: number, value: number, easeIn?: Ease];

/** One number over time. Holds the first value before the first key and the last value after it. */
export const track = (frame: number, keys: readonly Key[], fallback: Ease = ease.inOut): number => {
  if (keys.length === 0) return 0;
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1, easeIn] = keys[i];
    if (frame > f1) continue;
    if (f1 <= f0) return v1;
    return interpolate(frame, [f0, f1], [v0, v1], {
      easing: easeIn ?? fallback,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  return keys[keys.length - 1][1];
};

export type PoseKey<T> = readonly [frame: number, pose: Partial<T>, easeIn?: Ease];

/**
 * A whole pose over time (a camera, a layer). A key pins only the fields it names, so
 * `[60, {yaw: 0}]` leaves dolly moving between whichever keys do name it.
 */
export const animate = <T extends Record<string, number>>(
  frame: number,
  base: T,
  keys: readonly PoseKey<T>[],
  fallback: Ease = ease.inOut,
): T => {
  const out = {...base};
  for (const field of Object.keys(base) as (keyof T)[]) {
    const fieldKeys: Key[] = [];
    for (const [f, pose, easeIn] of keys) {
      const v = pose[field];
      if (v !== undefined) fieldKeys.push([f, v as number, easeIn]);
    }
    if (fieldKeys.length > 0) out[field] = track(frame, fieldKeys, fallback) as T[keyof T];
  }
  return out;
};

import type {CameraPose, Place} from './Stage';

export type Rect = {x: number; y: number; width: number; height: number};

/**
 * The camera pose that pushes in on part of a layer: `rect` (px from the layer's outer top-left)
 * ends up centred and filling `fill` of the frame. Exact only while the layer and the camera are
 * square to each other, which is the rule anyway: arrive tilted if you like, but be flat by the
 * time people need to read.
 *
 * Don't push past the footage's own resolution. A 1440px-wide capture shown 1280px wide can only
 * go ~1.1x before it softens; capture at 2x if a shot needs a close-up.
 */
export const focusOn = ({
  rect,
  layer,
  size,
  frame,
  lens,
  fill = 0.8,
}: {
  rect: Rect;
  layer: Partial<Pick<Place, 'x' | 'y' | 'z'>>;
  size: {width: number; height: number};
  frame: {width: number; height: number};
  lens: number;
  fill?: number;
}): Pick<CameraPose, 'x' | 'y' | 'z' | 'dolly'> => {
  const scale = Math.min((fill * frame.width) / rect.width, (fill * frame.height) / rect.height);
  return {
    x: (layer.x ?? 0) - size.width / 2 + rect.x + rect.width / 2,
    y: (layer.y ?? 0) - size.height / 2 + rect.y + rect.height / 2,
    z: layer.z ?? 0,
    // A point at depth d appears lens / (lens - d) times bigger, so solve that for `scale`.
    dolly: lens * (1 - 1 / scale),
  };
};

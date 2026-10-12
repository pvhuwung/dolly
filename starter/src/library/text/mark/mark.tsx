import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MarkKind, useLook} from '../../../look';
import {MarkLayer, lineHeightOf, markProgress} from '../_shared';

/**
 * Draws a mark on any inline content at frame `start`: a highlighter `marker`, a knocked-out `block`,
 * a soft `pill`, an `underline`, a hand-drawn `circle`, a `strike` or a `box`. Kinetic marks its
 * accent phrase the same way; use this for words it doesn't set (a label, a number, a name).
 *
 *   <Mark kind="circle" start={40}>3×</Mark>
 */
export const Mark: React.FC<{
  /** Which mark: marker, block, pill, underline, circle, strike or box. */
  kind: MarkKind;
  /** Frame its mark starts to draw, counted from the start of its scene (default 0). */
  start?: number;
  /** @deprecated Use start. */
  at?: number;
  /** Its colour; the style's accent if not set (the alert colour for a strike). */
  color?: string;
  /** The words, number or name to mark. */
  children: React.ReactNode;
}> = ({kind, start, at, color, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const p = markProgress(kind, frame, start ?? at ?? 0, 18 * look.pace, fps, look);
  return (
    <span style={{position: 'relative', display: 'inline-block', isolation: 'isolate', whiteSpace: 'nowrap'}}>
      <MarkLayer kind={kind} p={p} color={color} lh={lineHeightOf(look.headline)}>
        {children}
      </MarkLayer>
      {children}
    </span>
  );
};

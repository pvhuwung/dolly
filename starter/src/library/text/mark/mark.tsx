import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MarkKind, useLook} from '../../../look';
import type {Demo} from '../../types';
import {MarkLayer, lineHeightOf, markProgress} from '../_shared';

/**
 * Draws a mark on any inline content at frame `at`: a highlighter `marker`, a knocked-out `block`,
 * a soft `pill`, an `underline`, a hand-drawn `circle`, a `strike` or a `box`. Kinetic marks its
 * accent phrase the same way; use this for words it doesn't set (a label, a number, a name).
 *
 *   <Mark kind="circle" at={40}>3×</Mark>
 */
export const Mark: React.FC<{kind: MarkKind; at: number; color?: string; children: React.ReactNode}> = ({kind, at, color, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const look = useLook();
  const p = markProgress(kind, frame, at, 18 * look.pace, fps, look);
  return (
    <span style={{position: 'relative', display: 'inline-block', isolation: 'isolate', whiteSpace: 'nowrap'}}>
      <MarkLayer kind={kind} p={p} color={color} lh={lineHeightOf(look.headline)}>
        {children}
      </MarkLayer>
      {children}
    </span>
  );
};

export const demos: Demo[] = [];

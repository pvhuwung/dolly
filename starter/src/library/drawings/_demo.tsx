import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useLook} from '../../look';
import {Paper} from './paper/paper';

// The drawings' gallery layout. Not an item, and not needed to use one: only the samples import it.

/** The area a sample can use: the safe area, above the gallery's label. */
export const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = Math.max(look.safe.bottom, 190);
  return {look, x: look.safe.left, y: top, w: look.width - look.safe.left - look.safe.right, h: look.height - top - bottom};
};

/** Centres its child in the sample area. */
export const InArea: React.FC<{children: React.ReactNode}> = ({children}) => {
  const a = useArea();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </AbsoluteFill>
  );
};

/** A paper card filling most of the area at `aspect` (width / height), with the drawing's size. */
export const CardSample: React.FC<{aspect: number; rotate?: number; children: (w: number, h: number) => React.ReactNode}> = ({aspect, rotate = -1.5, children}) => {
  const a = useArea();
  const w = Math.min(a.w * 0.92, a.h * 0.96 * aspect, 1100);
  const h = w / aspect;
  return (
    <InArea>
      <Paper width={Math.round(w)} height={Math.round(h)} rotate={rotate}>
        {children(w, h)}
      </Paper>
    </InArea>
  );
};

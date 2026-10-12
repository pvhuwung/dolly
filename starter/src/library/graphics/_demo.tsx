import React from 'react';
import {type Look, useLook} from '../../look';

// The layout the graphics' gallery samples share. Not an item, and not needed to use one: only the
// samples import it.

/** A card in the style's surface, corners and shadow. */
export const card = (look: Look): React.CSSProperties => ({
  background: look.surface,
  borderRadius: look.radius,
  boxShadow: look.shadow,
});

/** An accent word in plain text. (The style's `emphasis` may expect a mark behind it, as in bold.) */
export const accentWord = (look: Look): React.CSSProperties => ({...look.emphasis, color: look.accentText});

/** The part of the frame a sample can use: inside the safe area, above the gallery's label. */
export const useArea = () => {
  const look = useLook();
  const top = look.safe.top;
  const bottom = look.height - look.safe.bottom - 170;
  const left = look.safe.left;
  const right = look.width - look.safe.right;
  return {look, top, bottom, left, right, w: right - left, h: bottom - top, cx: (left + right) / 2, cy: (top + bottom) / 2};
};

export const Area: React.FC<{children: React.ReactNode; gap?: number; row?: boolean}> = ({children, gap = 0, row}) => {
  const a = useArea();
  return (
    <div
      style={{
        position: 'absolute',
        left: a.left,
        top: a.top,
        width: a.w,
        height: a.h,
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        flexWrap: row ? 'wrap' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap,
      }}
    >
      {children}
    </div>
  );
};

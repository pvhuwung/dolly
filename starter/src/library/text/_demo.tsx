import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useLook} from '../../look';

// The text items' gallery layout. Not an item, and not needed to use one: only the samples import it.

/** Centres a sample in the safe area, clear of the gallery's label at the bottom. */
export const Center: React.FC<{children: React.ReactNode}> = ({children}) => {
  const look = useLook();
  return (
    <AbsoluteFill
      style={{
        padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom + 170}px ${look.safe.left}px`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** The demos' headline size and measure: big, and narrow enough to break into two lines on a wide frame. */
export const useDemoType = () => {
  const look = useLook();
  return {fontSize: Math.round(look.size * (look.format === 'landscape' ? 1.7 : 1.35)), maxWidth: look.tall ? undefined : look.width * 0.72};
};

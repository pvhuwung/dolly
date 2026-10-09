import React from 'react';
import {useCamera} from './Stage';

export type ScreenFrame = 'window' | 'phone' | 'none';

const TITLE_BAR = 40;
const PHONE_BEZEL = 14;

/**
 * A surface that shows footage or UI: a desktop window, a phone, or a bare rounded card. `width`
 * and `height` are the OUTER size. Coordinates you hand to `focusOn` are measured from the outer
 * top-left too, so add the title bar (40px) or the bezel (14px) when you aim at the content.
 *
 * The glare slides as the camera yaws, which is most of what sells a flat card as a lit object.
 */
export const Screen: React.FC<{
  width: number;
  height: number;
  frame?: ScreenFrame;
  title?: string;
  radius?: number;
  /** 0 hides the glare, 1 is the default sheen. */
  glare?: number;
  /** 0 is no shadow, 1 is a soft shadow for a card floating just above a dark background. */
  shadow?: number;
  background?: string;
  children?: React.ReactNode;
}> = ({width, height, frame = 'window', title, radius, glare = 1, shadow = 1, background = '#0d1117', children}) => {
  const camera = useCamera();
  const outerRadius = radius ?? (frame === 'phone' ? 64 : frame === 'window' ? 14 : 18);
  const inset = frame === 'phone' ? PHONE_BEZEL : 0;
  const top = frame === 'window' ? TITLE_BAR : inset;

  const sheen = 50 - camera.yaw * 2.5 - camera.pitch;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: outerRadius,
        background: frame === 'phone' ? '#050505' : background,
        boxShadow: [
          `0 ${50 * shadow}px ${140 * shadow}px rgba(0, 0, 0, ${0.55 * shadow})`,
          `0 ${12 * shadow}px ${30 * shadow}px rgba(0, 0, 0, ${0.35 * shadow})`,
          'inset 0 0 0 1px rgba(255, 255, 255, 0.10)',
        ].join(', '),
        overflow: 'hidden',
      }}
    >
      {frame === 'window' ? <TitleBar title={title} /> : null}
      <div
        style={{
          position: 'absolute',
          left: inset,
          right: inset,
          top,
          bottom: inset,
          overflow: 'hidden',
          borderRadius: frame === 'phone' ? outerRadius - PHONE_BEZEL : 0,
          background,
        }}
      >
        {children}
      </div>
      {frame === 'phone' ? (
        <div
          style={{
            position: 'absolute',
            top: PHONE_BEZEL + 14,
            left: '50%',
            width: 120,
            height: 34,
            marginLeft: -60,
            borderRadius: 17,
            background: '#000',
          }}
        />
      ) : null}
      {glare > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: glare,
            backgroundImage:
              'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.10) 47%, rgba(255,255,255,0.03) 53%, transparent 62%)',
            backgroundSize: '300% 100%',
            backgroundPosition: `${sheen}% 0`,
          }}
        />
      ) : null}
    </div>
  );
};

const TitleBar: React.FC<{title?: string}> = ({title}) => (
  <div
    style={{
      height: TITLE_BAR,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      background: 'rgba(255, 255, 255, 0.04)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      position: 'relative',
    }}
  >
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
    ))}
    {title ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.55)',
        }}
      >
        {title}
      </div>
    ) : null}
  </div>
);

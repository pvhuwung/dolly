import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../backdrop';
import {Kinetic} from '../library';
import {Footage, Rect} from '../kit';
import {alpha, byShape, useLook} from '../look';
import {MAC, PANE, crop} from './takes';

/** One pane of the take, as a floating card `width` px wide that lifts in at `appear`. */
const PaneCard: React.FC<{pane: Rect; at: number; appear: number; x: number; y: number; width: number}> = ({pane, at, appear, x, y, width}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - appear, fps, config: {damping: 200}, durationInFrames: 26});
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: t, transform: `translateY(${(1 - t) * 50}px) scale(${0.94 + 0.06 * t})`}}>
      <div style={{transform: `scale(${width / pane.width})`, transformOrigin: '0 0'}}>
        <div style={{width: pane.width, height: pane.height, borderRadius: Math.min(look.radius, 14), overflow: 'hidden', boxShadow: look.shadow}}>
          <Footage src={MAC.src} at={at} crop={crop(pane)} />
        </div>
      </div>
    </div>
  );
};

// HOOK: the pain, not the logo. Agents running everywhere, and one of them quietly waiting on you.
// Wide frames put the words on the left and the panes on the right; tall ones stack them.
export const Hook: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const waited = Math.floor(interpolate(frame, [168, 236], [0, 1399], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const clock = `${String(Math.floor(waited / 60)).padStart(2, '0')}:${String(waited % 60).padStart(2, '0')}`;

  const inner = look.width - look.safe.left - look.safe.right;
  const words = byShape(look, {
    wide: {left: look.safe.left, top: 410, width: 680},
    tall: {left: look.safe.left, top: look.safe.top, width: inner},
  });
  // The four panes, 2 x 2, each cut at about 1.56:1. Tall frames centre the grid under the words.
  const width = byShape(look, {wide: 1000, tall: inner, square: inner * 0.8});
  const gap = Math.round(width * 0.03);
  const card = (width - gap) / 2;
  const height = (card / 1.56) * 2 + gap;
  const below = look.safe.top + look.size * 2.6 + 100;
  const grid = byShape(look, {
    wide: {x: 860, y: 170},
    tall: {x: look.safe.left + (inner - width) / 2, y: below + Math.max(0, (look.height - look.safe.bottom - below - height) / 2)},
  });
  const cell = (col: number, row: number) => ({x: grid.x + col * (card + gap), y: grid.y + row * (card / 1.56 + gap), width: card});
  const line = {fontSize: look.size * 1.03};

  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{position: 'absolute', ...words}}>
        <Kinetic text="Multiple projects. Multiple agents." start={4} exit={70} style={line} />
      </div>
      <div style={{position: 'absolute', ...words}}>
        <Kinetic text="Hard to tell what’s finished." start={80} exit={142} style={line} />
      </div>
      <div style={{position: 'absolute', ...words, display: 'flex', flexDirection: 'column', gap: 4}}>
        <Kinetic text="One needs you." start={150} style={line} />
        <Kinetic text="Which one?" start={168} mark="none" style={{...line, ...look.emphasis, color: look.alert, textShadow: 'none'}} />
      </div>
      <PaneCard pane={PANE.leftTop} at={24} appear={18} {...cell(0, 0)} />
      <PaneCard pane={PANE.browser} at={6} appear={28} {...cell(1, 0)} />
      <PaneCard pane={PANE.leftBottom} at={2} appear={38} {...cell(0, 1)} />
      <PaneCard pane={PANE.leftTop} at={10} appear={48} {...cell(1, 1)} />
      {frame > 160 ? (
        <div
          style={{
            position: 'absolute',
            left: grid.x + 20,
            top: grid.y - 58,
            padding: '8px 18px',
            borderRadius: 999,
            background: alpha(look.alert, 0.14),
            color: look.alert,
            fontFamily: look.fonts.mono,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          waiting {clock}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

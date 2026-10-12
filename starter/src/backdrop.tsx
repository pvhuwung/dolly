import React, {useId} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BACKDROPS} from './library';
import type {BackdropProps, Tone} from './library/types';
import {BackdropKind, Look, useLook} from './look';

// The page behind the shots. Every kind moves slowly with the frame, so a held shot never looks
// frozen, and stays faint enough never to compete with the product. With no `kind` it draws the
// style's own (look.backdrop). Put it first in a scene, under a Stage that has no background:
//
//   <AbsoluteFill>
//     <Backdrop />
//     <Stage camera={camera} lens={1800}>...</Stage>
//   </AbsoluteFill>
//
// The kinds are items in library/backdrops/: one folder each, found by name.

const toneOf = (look: Look): Tone => {
  const hex = /^#([0-9a-f]{6})$/i.exec(look.background)?.[1];
  if (!hex) return look.dark ? 'night' : 'day';
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l < 0.06 ? 'night' : l < 0.45 ? 'mid' : 'day';
};

/** The page behind the shots, in the look's colours. `kind` defaults to the style's backdrop. */
export const Backdrop: React.FC<{kind?: BackdropKind}> = ({kind}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = `bd${useId().replace(/:/g, '')}`;
  const Kind = (BACKDROPS as Partial<Record<BackdropKind, React.FC<BackdropProps>>>)[kind ?? look.backdrop];
  return (
    <AbsoluteFill style={{background: look.background, overflow: 'hidden'}}>
      {Kind ? <Kind look={look} tone={toneOf(look)} t={frame / fps} frame={frame} id={id} /> : null}
    </AbsoluteFill>
  );
};

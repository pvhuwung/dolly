import React from 'react';
import {AbsoluteFill} from 'remotion';
import {alpha} from '../../../look';
import type {BackdropProps} from '../../types';

/** A swiss column grid: twelve columns inside the safe margins, square modules, a + at every other crossing. */
export const backdrop: React.FC<BackdropProps> = ({look, t, id}) => {
  const left = look.safe.left;
  const col = (look.width - look.safe.left - look.safe.right) / 12;
  const line = alpha(look.ink, look.dark ? 0.08 : 0.075);
  const mark = alpha(look.ink, look.dark ? 0.3 : 0.28);
  const dy = (t * 6) % col;
  return (
    <AbsoluteFill>
      <svg width={look.width} height={look.height} style={{position: 'absolute'}}>
        <defs>
          <pattern id={`${id}c`} x={left} y={-dy} width={col} height={col} patternUnits="userSpaceOnUse">
            <path d={`M 0.5 0 V ${col} M 0 0.5 H ${col}`} stroke={line} strokeWidth={1} fill="none" />
          </pattern>
          <pattern id={`${id}m`} x={left - 6} y={-dy - 6} width={col * 2} height={col * 2} patternUnits="userSpaceOnUse">
            <path d="M 0 6.5 H 13 M 6.5 0 V 13" stroke={mark} strokeWidth={1.2} fill="none" />
          </pattern>
        </defs>
        <rect x={left} width={col * 12 + 1} height={look.height} fill={`url(#${id}c)`} />
        <rect x={left - 6} width={col * 12 + 13} height={look.height} fill={`url(#${id}m)`} />
      </svg>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Demo} from '../../types';
import {accentWord, card, useArea} from '../_demo';
import {Arrow} from './arrow';

const ArrowDemo: React.FC = () => {
  const {look, cx, cy, w} = useArea();
  const button = (look.format !== 'landscape') ? {x: cx + 40, y: cy + 170} : {x: cx + 270, y: cy + 70};
  const label = (look.format !== 'landscape') ? {x: cx - 170, y: cy - 230} : {x: cx - 420, y: cy - 150};
  const size = Math.min(48, w / 16);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: label.x, top: label.y, transform: 'translate(-50%, -50%)', ...look.headline, fontSize: size * 1.3, whiteSpace: 'nowrap'}}>
        Start <span style={accentWord(look)}>here</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: button.x,
          top: button.y,
          transform: 'translate(-50%, -50%)',
          padding: `${size * 0.5}px ${size * 0.9}px`,
          ...card(look),
          border: `1px solid ${look.line}`,
          fontFamily: look.fonts.body,
          fontWeight: 700,
          fontSize: size * 0.8,
          color: look.ink,
          whiteSpace: 'nowrap',
        }}
      >
        Deploy to production
      </div>
      <Arrow
        from={{x: label.x + ((look.format !== 'landscape') ? 20 : size * 3.7), y: label.y + size * ((look.format !== 'landscape') ? 1.1 : 0.25)}}
        to={{x: button.x - ((look.format !== 'landscape') ? 60 : size * 3.4), y: button.y - size * ((look.format !== 'landscape') ? 1.4 : 1.4)}}
        bend={(look.format !== 'landscape') ? -0.3 : 0.3}
        start={10}
      />
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Point with an arrow', code: '<Arrow from={label} to={button} start={10} />', seconds: 2.5, hero: 50, Component: ArrowDemo},
];

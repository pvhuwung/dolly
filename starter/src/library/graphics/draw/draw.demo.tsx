import React from 'react';
import type {Demo} from '../../types';
import {Area, accentWord, useArea} from '../_demo';
import {Draw} from './draw';

const UNDERLINE = 'M6 24 C 110 9, 250 6, 414 17 M60 36 C 160 27, 270 25, 370 30';

const DrawDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(look.size * 1.6, w / 5.2);
  return (
    <Area>
      <div style={{...look.headline, fontSize: size, display: 'flex', gap: '0.28em', flexWrap: 'wrap', justifyContent: 'center'}}>
        <span>Ship it</span>
        <span style={{position: 'relative', ...accentWord(look)}}>
          today.
          <Draw d={UNDERLINE} width={420} height={40} start={12} frames={26} stretch strokeWidth={7} style={{position: 'absolute', left: '-4%', top: '96%', width: '108%', height: size * 0.32}} />
        </span>
      </div>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Draw a line', code: '<Draw d={UNDERLINE} width={420} height={40} start={12} />', seconds: 2.5, hero: 50, Component: DrawDemo},
];

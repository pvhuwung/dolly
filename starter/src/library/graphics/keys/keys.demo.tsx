import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Demo} from '../../types';
import {Area, accentWord, useArea} from '../_demo';
import {Keys} from './keys';

const KeysDemo: React.FC = () => {
  const {look, w} = useArea();
  return (
    <Area gap={look.size * 0.7}>
      <Keys keys={['⌘', 'K']} start={4} size={Math.min(170, w / 5)} />
      <div style={{...look.headline, fontSize: look.size * 0.8, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 26) / 10))}}>
        Open <span style={accentWord(look)}>anything.</span>
      </div>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Shortcut keys', code: "<Keys keys={['⌘', 'K']} />", seconds: 2.5, hero: 40, Component: KeysDemo},
];

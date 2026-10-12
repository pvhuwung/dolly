import React from 'react';
import type {Demo} from '../../types';
import {useArea} from '../_demo';
import {Marquee} from './marquee';

const MarqueeDemo: React.FC = () => {
  const {look, cy} = useArea();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: cy, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: look.size * 0.5}}>
      <Marquee items={['Native', 'Private', 'Keyboard-first', 'Open source', 'Fast']} />
      <Marquee items={['Claude Code', 'Codex', 'Gemini', 'Aider', 'Cursor']} reverse color={look.dim} size={look.size * 0.75} loop={12} />
    </div>
  );
};

export const demos: Demo[] = [
  {name: 'Marquee', code: "<Marquee items={['Native', 'Private', ...]} />", seconds: 3, hero: 45, Component: MarqueeDemo},
];

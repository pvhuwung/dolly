import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Check} from 'lucide-react';
import type {Demo} from '../../types';
import {useArea} from '../_demo';
import {Icon} from '../icon/icon';
import {Burst} from './burst';

const BurstDemo: React.FC = () => {
  const {look, cx, cy} = useArea();
  return (
    <AbsoluteFill>
      <Burst x={cx} y={cy} start={12} power={(look.format !== 'landscape') ? 0.8 : 1} />
      <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <Icon icon={Check} size={150} start={6} tone="accent" />
        <div style={{...look.headline, fontSize: look.size * 0.9, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 14) / 10))}}>Merged.</div>
      </div>
    </AbsoluteFill>
  );
};

export const demos: Demo[] = [
  {name: 'Confetti', code: '<Burst x={cx} y={cy} start={12} />', seconds: 2.5, hero: 24, Component: BurstDemo},
];

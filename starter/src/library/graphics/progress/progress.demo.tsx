import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Progress} from './progress';

const ProgressDemo: React.FC = () => {
  const {w, look} = useArea();
  const width = Math.min(1000, w * 0.95);
  return (
    <Area gap={look.size * 0.85}>
      <Progress label="Install" value={100} start={4} frames={24} width={width} />
      <Progress label="Build" value={100} start={22} frames={30} width={width} />
      <Progress label="Deploy" value={64} start={44} frames={40} width={width} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Progress bars', code: '<Progress value={64} label="Deploy" />', seconds: 4, hero: 110, Component: ProgressDemo},
];

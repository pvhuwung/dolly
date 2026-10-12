import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Ring} from './ring';

const RingDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <Ring value={87} label="tests passing" start={6} size={Math.min(440, w * 0.75, h * 0.85)} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Progress ring', code: '<Ring value={87} label="tests passing" />', seconds: 3.5, hero: 92, Component: RingDemo},
];

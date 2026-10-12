import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Stat} from './stat';

const StatDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = (look.format !== 'landscape') ? Math.min(look.size * 1.7, w / 4.2) : Math.min(look.size * 2, w / 8);
  return (
    <Area row={!(look.format !== 'landscape')} gap={(look.format !== 'landscape') ? size * 0.6 : size * 1.2}>
      <Stat value={3.2} decimals={1} suffix="×" label="faster builds" start={6} size={size} />
      <Stat value={12400} label="teams shipping" start={12} size={size} />
      <Stat value={99.99} decimals={2} suffix="%" label="uptime" start={18} size={size} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Big number', code: '<Stat value={12400} label="teams shipping" />', seconds: 3.5, hero: 95, Component: StatDemo},
];

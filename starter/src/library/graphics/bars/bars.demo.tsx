import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Bars} from './bars';

const MONTHS = [
  {label: 'May', value: 1200},
  {label: 'Jun', value: 1900},
  {label: 'Jul', value: 2600},
  {label: 'Aug', value: 4100},
  {label: 'Sep', value: 6800},
];

const BarsDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <Bars data={MONTHS} highlight={4} start={6} width={Math.min(980, w * 0.92)} height={Math.min(520, h * 0.8)} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Bar chart', code: '<Bars data={MONTHS} highlight={4} />', seconds: 3, hero: 75, Component: BarsDemo},
];

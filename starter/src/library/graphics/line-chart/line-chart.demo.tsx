import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {LineChart} from './line-chart';

const LineDemo: React.FC = () => {
  const {w, h} = useArea();
  return (
    <Area>
      <LineChart
        values={[12, 18, 15, 26, 31, 29, 44, 58]}
        labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']}
        start={8}
        width={Math.min(1080, w * 0.9)}
        height={Math.min(480, h * 0.72)}
        format={(n) => `${Math.round(n)}k`}
      />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Line chart', code: '<LineChart values={[12, 18, 15, 26, 31, 29, 44, 58]} />', seconds: 4, hero: 104, Component: LineDemo},
];

import React from 'react';
import type {Demo} from '../../types';
import {InArea, useArea} from '../_demo';
import {Constellation} from './constellation';

const ConstellationDemo: React.FC = () => {
  const a = useArea();
  return (
    <InArea>
      <Constellation width={Math.round(Math.min(a.w * 0.9, 1100))} height={Math.round(Math.min(a.h * 0.85, a.look.tall ? 800 : 560))} count={16} start={4} stagger={4} />
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Constellation', code: '<Constellation width={800} height={460} count={16} />', seconds: 3, hero: 85, Component: ConstellationDemo}];

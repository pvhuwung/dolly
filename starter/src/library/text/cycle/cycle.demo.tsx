import React from 'react';
import type {Demo} from '../../types';
import {Center, useDemoType} from '../_demo';
import {Kinetic} from '../kinetic/kinetic';
import {Cycle} from './cycle';

const CycleDemo: React.FC = () => {
  const type = useDemoType();
  return (
    <Center>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: '0.28em', fontSize: type.fontSize}}>
        <Kinetic text="Videos that feel" start={6} style={{fontSize: type.fontSize}} />
        <Cycle words={['fast.', 'polished.', 'yours.']} start={20} every={36} style={{fontSize: type.fontSize}} />
      </div>
    </Center>
  );
};

export const demos: Demo[] = [
  {name: 'Cycle', code: `<Cycle words={['fast.', 'polished.', 'yours.']} />`, seconds: 4.5, hero: 75, Component: CycleDemo},
];

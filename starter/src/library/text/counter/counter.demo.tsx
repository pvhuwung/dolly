import React from 'react';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {Center} from '../_demo';
import {Kinetic} from '../kinetic/kinetic';
import {Counter} from './counter';

const CounterDemo: React.FC = () => {
  const look = useLook();
  return (
    <Center>
      <Counter to={12480} suffix="+" start={6} style={{fontSize: Math.round(look.size * 2.6), lineHeight: 1}} />
      <Kinetic text="videos rendered this week" effect="fade" start={14} align="center" style={{fontFamily: look.fonts.body, fontSize: Math.max(44, Math.round(look.size * 0.6)), fontWeight: 500, letterSpacing: 0, color: look.dim}} />
    </Center>
  );
};

export const demos: Demo[] = [
  {name: 'Counter', code: '<Counter to={12480} suffix="+" />', seconds: 3, hero: 80, Component: CounterDemo},
];

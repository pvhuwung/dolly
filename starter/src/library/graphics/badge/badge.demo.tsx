import React from 'react';
import {ShieldCheck, Sparkles} from 'lucide-react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Badge} from './badge';

const BadgeDemo: React.FC = () => {
  const {look} = useArea();
  return (
    <Area gap={(look.format !== 'landscape') ? 28 : 24} row={!(look.format !== 'landscape')}>
      <Badge text="Live" tone="accent" pulse start={4} size={44} />
      <Badge text="New in 2.0" icon={Sparkles} start={12} size={44} />
      <Badge text="SOC 2 Type II" icon={ShieldCheck} tone="card" start={20} size={44} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Badges', code: '<Badge icon={Sparkles} text="New in 2.0" />', seconds: 2.5, hero: 50, Component: BadgeDemo},
];

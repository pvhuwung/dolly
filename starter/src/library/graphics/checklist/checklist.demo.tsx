import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Checklist} from './checklist';

const ChecklistDemo: React.FC = () => {
  const {look} = useArea();
  return (
    <Area>
      <Checklist items={['Tests pass', 'Preview deployed', 'Docs updated', 'Ready to merge']} start={4} size={(look.format !== 'landscape') ? 52 : 50} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Checklist', code: "<Checklist items={['Tests pass', ...]} />", seconds: 3.5, hero: 90, Component: ChecklistDemo},
];

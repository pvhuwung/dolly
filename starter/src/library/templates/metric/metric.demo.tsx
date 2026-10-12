import React from 'react';
import type {Demo} from '../../types';
import {Metric} from './metric';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Metric', code: '<Metric value={12} label="agents in one window" />', seconds: 3.5, hero: 80, backdrop: false, Component: () => <Metric value={12} label="agents in one window" />},
];

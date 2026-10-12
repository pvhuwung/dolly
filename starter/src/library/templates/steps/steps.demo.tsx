import React from 'react';
import type {Demo} from '../../types';
import {Steps} from './steps';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Steps', code: '<Steps title="How it works" steps={[...]} />', seconds: 4, hero: 95, backdrop: false, Component: () => <Steps title="How it" accent="works." steps={['Open a group', 'Start your agents', 'Get pinged when one asks']} />},
];

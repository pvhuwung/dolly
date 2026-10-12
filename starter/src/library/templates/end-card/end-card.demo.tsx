import React from 'react';
import type {Demo} from '../../types';
import {EndCard} from './end-card';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'EndCard', code: '<EndCard line="…" accent="…" button="Download free" />', seconds: 4, hero: 100, backdrop: false, Component: () => <EndCard line="Your agents keep working." accent="Even when you walk away." button="Download free" />},
];

import React from 'react';
import type {Demo} from '../../types';
import {Statement} from './statement';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Statement', code: '<Statement text="Five agents running." accent="One needs you." />', seconds: 3.5, hero: 70, backdrop: false, Component: () => <Statement eyebrow="Agents everywhere" text="Five agents running." accent="One needs you." />},
];

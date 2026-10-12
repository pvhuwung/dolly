import React from 'react';
import type {Demo} from '../../types';
import {Quote} from './quote';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Quote', code: '<Quote quote="…" accent="…" name="…" role="…" />', seconds: 4.5, hero: 110, backdrop: false, Component: () => <Quote quote="I stopped tabbing through terminals." accent="Now they come to me." name="Your Customer" role="Their role, their company" />},
];

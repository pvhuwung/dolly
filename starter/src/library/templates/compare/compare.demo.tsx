import React from 'react';
import type {Demo} from '../../types';
import {Compare} from './compare';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Compare', code: '<Compare before={{title, items}} after={{title, items}} />', seconds: 5, hero: 130, backdrop: false, Component: () => <Compare title="Stop checking" accent="every tab." before={{title: 'Before', items: ['Tab through every terminal', 'Miss the prompt that waits']}} after={{title: 'With Termary', items: ['Every agent in one view', 'The waiting one lights up']}} />},
];

import React from 'react';
import type {Demo} from '../../types';
import {List} from './list';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'List', code: '<List title="Today\'s" accent="menu." items={[{label, detail, value}, ...]} />', seconds: 4, hero: 100, backdrop: false, Component: () => <List title="Today’s" accent="menu." items={[{label: 'Flat white', detail: 'Double shot, oat or whole milk', value: '$4.50'}, {label: 'Cardamom bun', detail: 'Baked this morning', value: '$3.80'}, {label: 'Cold brew', detail: 'Steeped for 18 hours', value: '$5.00'}, {label: 'Sourdough toast', detail: 'Butter and sea salt', value: '$6.00'}]} />},
];

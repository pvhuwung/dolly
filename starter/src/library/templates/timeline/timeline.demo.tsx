import React from 'react';
import type {Demo} from '../../types';
import {Timeline} from './timeline';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Timeline', code: '<Timeline title="How we" accent="got here." items={[{when, what}, ...]} />', seconds: 4.5, hero: 120, backdrop: false, Component: () => <Timeline title="How we" accent="got here." items={[{when: '2023', what: 'Two people, one idea'}, {when: '2024', what: 'First 1,000 users'}, {when: '2025', what: 'Seed round'}, {when: '2026', what: 'Series A'}]} />},
];

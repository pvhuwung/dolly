import React from 'react';
import type {Demo} from '../../types';
import {Countdown} from './countdown';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Countdown', code: '<Countdown title="Doors open" to="Oct 24 · 9:00 AM" from={{days, hours, minutes, seconds}} />', seconds: 4, hero: 96, backdrop: false, Component: () => <Countdown title="Doors open" accent="soon." to="Oct 24 · 9:00 AM" from={{days: 12, hours: 4, minutes: 32, seconds: 9}} />},
];

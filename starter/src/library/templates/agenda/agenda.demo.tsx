import React from 'react';
import type {Demo} from '../../types';
import {Agenda} from './agenda';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Agenda', code: '<Agenda title="Day one" date="Thu · Oct 24" items={[{time, title, who}, ...]} highlight={1} />', seconds: 5, hero: 140, backdrop: false, Component: () => <Agenda title="Day one" accent="agenda." date="Thu · Oct 24" highlight={1} items={[{time: '09:00', title: 'Doors open'}, {time: '09:30', title: 'Keynote', who: 'Ravi Menon'}, {time: '11:00', title: 'Workshops', who: 'Three rooms'}, {time: '13:00', title: 'Lunch on the terrace'}, {time: '15:00', title: 'Demos and drinks'}]} />},
];

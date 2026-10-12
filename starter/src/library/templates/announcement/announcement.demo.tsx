import React from 'react';
import type {Demo} from '../../types';
import {Announcement} from './announcement';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Announcement', code: '<Announcement eyebrow="Big news" text="We raised $18M" accent="…" detail="…" />', seconds: 4, hero: 100, backdrop: false, Component: () => <Announcement eyebrow="Big news" text="We raised $18M" accent="to build what’s next." detail="Series A, with thanks to our customers and team" />},
];

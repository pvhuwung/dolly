import React from 'react';
import type {Demo} from '../../types';
import {Lineup} from './lineup';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Lineup', code: '<Lineup title="Meet the" accent="speakers." people={[{name, role}, ...]} />', seconds: 4, hero: 100, backdrop: false, Component: () => <Lineup eyebrow="Fieldwork 2027" title="Meet the" accent="speakers." people={[{name: 'Ada Okafor', role: 'Design lead'}, {name: 'Ravi Menon', role: 'Founder'}, {name: 'Lena Varga', role: 'Staff engineer'}, {name: 'Tom Iwasaki', role: 'Product'}]} />},
];

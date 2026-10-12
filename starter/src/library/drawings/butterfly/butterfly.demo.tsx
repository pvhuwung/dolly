import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Butterfly} from './butterfly';

export const demos: Demo[] = [
  {
    name: 'Butterfly',
    code: '<Butterfly size={300} start={6} />',
    seconds: 3,
    hero: 78,
    Component: () => <CardSample aspect={1.15}>{(w) => <Butterfly size={w * 0.72} start={6} />}</CardSample>,
  },
];

import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Stamps} from './stamps';

export const demos: Demo[] = [
  {
    name: 'Stamps',
    code: '<Stamps width={700} height={500} motif="flower" />',
    seconds: 3,
    hero: 85,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Stamps width={w * 0.86} height={h * 0.84} count={20} start={6} />}</CardSample>,
  },
];

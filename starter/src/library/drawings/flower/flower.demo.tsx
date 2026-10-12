import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Flower} from './flower';

export const demos: Demo[] = [
  {
    name: 'Watercolour flower',
    code: '<Flower size={320} petals={6} start={6} />',
    seconds: 3.5,
    hero: 100,
    Component: () => <CardSample aspect={0.8}>{(w, h) => <Flower size={Math.min(w * 0.62, (h * 0.86) / 1.5)} start={6} frames={80} />}</CardSample>,
  },
];

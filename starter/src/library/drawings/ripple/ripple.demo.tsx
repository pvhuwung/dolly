import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Ripple} from './ripple';

export const demos: Demo[] = [
  {
    name: 'Ink ripples',
    code: '<Ripple width={700} height={460} drops={6} />',
    seconds: 3,
    hero: 66,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Ripple width={w * 0.86} height={h * 0.84} drops={7} start={4} />}</CardSample>,
  },
];

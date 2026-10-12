import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Plant} from './plant';

export const demos: Demo[] = [
  {
    name: 'Growing plant',
    code: '<Plant width={420} height={560} seed={2} />',
    seconds: 4,
    hero: 115,
    Component: () => <CardSample aspect={0.8}>{(w, h) => <Plant width={w * 0.84} height={h * 0.86} start={4} frames={100} />}</CardSample>,
  },
];

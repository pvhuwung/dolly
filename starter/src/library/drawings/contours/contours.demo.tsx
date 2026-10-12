import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Contours} from './contours';

export const demos: Demo[] = [
  {
    name: 'Contour lines',
    code: '<Contours width={800} height={520} levels={10} />',
    seconds: 3.5,
    hero: 95,
    Component: () => <CardSample aspect={1.3}>{(w, h) => <Contours width={Math.round(w * 0.9)} height={Math.round(h * 0.88)} start={4} frames={70} />}</CardSample>,
  },
];

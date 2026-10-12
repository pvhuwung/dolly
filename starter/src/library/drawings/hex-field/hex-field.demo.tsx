import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {HexField} from './hex-field';

export const demos: Demo[] = [
  {
    name: 'Hex field',
    code: '<HexField width={700} height={520} origin={{x: 0.6, y: 0.55}} />',
    seconds: 3,
    hero: 80,
    Component: () => <CardSample aspect={1.25}>{(w, h) => <HexField width={w * 0.88} height={h * 0.86} radius={w / 26} start={6} />}</CardSample>,
  },
];

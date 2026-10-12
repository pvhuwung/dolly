import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {Stitch} from './stitch';

export const demos: Demo[] = [
  {
    name: 'Embroidery',
    code: '<Stitch size={380} shape="sun" />',
    seconds: 3.5,
    hero: 100,
    Component: () => <CardSample aspect={1}>{(w) => <Stitch size={w * 0.72} start={4} frames={84} />}</CardSample>,
  },
  {
    name: 'Stitched heart',
    code: '<Stitch size={340} shape="heart" />',
    seconds: 3,
    hero: 85,
    Component: () => <CardSample aspect={1}>{(w) => <Stitch size={w * 0.62} shape="heart" start={4} frames={70} palette={{sun: '#e88a7a', warm: '#c4473f'}} />}</CardSample>,
  },
];

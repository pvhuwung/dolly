import type React from 'react';
import type {BackdropProps} from '../../types';
import {backdropDemos} from '../_shared';

/** Nothing over the page: just the style's background colour. */
export const backdrop: React.FC<BackdropProps> = () => null;

export const demos = backdropDemos('plain');

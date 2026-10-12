import React from 'react';
import type {Demo} from '../../types';
import {Changelog} from './changelog';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Changelog', code: '<Changelog version="v2.4" title="What\'s" accent="new." items={[{tag: \'New\', text}, ...]} />', seconds: 4.5, hero: 110, backdrop: false, Component: () => <Changelog version="v2.4" title="What’s" accent="new." items={[{tag: 'New', text: 'Offline mode for every note'}, {tag: 'Improved', text: 'Search is three times faster'}, {tag: 'New', text: 'Share a stack with one link'}, {tag: 'Fixed', text: 'Sync on flaky connections'}]} />},
];

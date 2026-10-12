import React from 'react';
import {BellRing, Columns3, Smartphone} from 'lucide-react';
import type {Demo} from '../../types';
import {Features} from './features';

// Samples for the gallery. The copy is placeholder: write the product's own.

const FEATURES = [
  {icon: Columns3, title: 'Every agent, side by side', text: 'Split panes, grouped by project'},
  {icon: BellRing, title: 'Knows who’s waiting', text: 'A pane lights up when an agent asks'},
  {icon: Smartphone, title: 'Approve from your phone', text: 'Answer prompts away from your desk'},
];

export const demos: Demo[] = [
  {name: 'Features', code: '<Features title="Everything in" accent="one window." items={[...]} />', seconds: 4, hero: 90, backdrop: false, Component: () => <Features title="Everything in" accent="one window." items={FEATURES} />},
];

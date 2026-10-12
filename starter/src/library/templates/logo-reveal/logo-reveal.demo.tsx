import React from 'react';
import type {Demo} from '../../types';
import {LogoReveal} from './logo-reveal';

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'LogoReveal pop', code: '<LogoReveal kind="pop" tagline="…" />', seconds: 3, hero: 86, backdrop: false, Component: () => <LogoReveal kind="pop" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal iris', code: '<LogoReveal kind="iris" />', seconds: 3, hero: 86, backdrop: false, Component: () => <LogoReveal kind="iris" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal focus', code: '<LogoReveal kind="focus" />', seconds: 3, hero: 60, backdrop: false, Component: () => <LogoReveal kind="focus" />},
];

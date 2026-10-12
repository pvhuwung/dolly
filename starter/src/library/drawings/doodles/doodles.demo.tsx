import React from 'react';
import type {Demo} from '../../types';
import {CardSample} from '../_demo';
import {type DoodleKind, Doodles} from './doodles';

const DOODLES: DoodleKind[] = ['circle', 'underline', 'arrow', 'star', 'sparkle', 'heart', 'squiggle', 'spiral', 'burst'];

const DoodlesDemo: React.FC = () => (
  <CardSample aspect={1.2}>
    {(w) => {
      const cell = (w * 0.8) / 3;
      return (
        <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${cell}px)`, gap: cell * 0.04}}>
          {DOODLES.map((k, i) => (
            <div key={k} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: cell * 0.78}}>
              <Doodles kind={k} width={cell * 0.62} height={cell * 0.56} start={6 + i * 7} frames={20} seed={i + 1} strokeWidth={Math.max(3, cell / 48)} />
            </div>
          ))}
        </div>
      );
    }}
  </CardSample>
);

export const demos: Demo[] = [{name: 'Doodles', code: '<Doodles kind="circle" width={300} height={140} />', seconds: 3.5, hero: 100, Component: DoodlesDemo}];

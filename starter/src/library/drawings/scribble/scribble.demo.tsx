import React from 'react';
import type {Demo} from '../../types';
import {InArea, useArea} from '../_demo';
import {Scribble} from './scribble';

const ScribbleDemo: React.FC = () => {
  const {look} = useArea();
  const size = Math.round(look.size * 1.3);
  return (
    <InArea>
      <div style={{...look.headline, fontSize: size, display: 'flex', justifyContent: 'center', alignItems: 'center', columnGap: '0.26em'}}>
        <span>Pick</span>
        <span style={{position: 'relative', display: 'inline-flex', justifyContent: 'center', width: size * 1.75}}>
          <span style={{position: 'absolute', left: -size * 0.2, top: -size * 0.1}}>
            <Scribble width={size * 2.15} height={size * 1.25} start={10} frames={26} />
          </span>
          <span style={{position: 'relative'}}>this</span>
        </span>
        <span>one.</span>
      </div>
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Scribble', code: '<Scribble width={320} height={140} />', seconds: 2.5, hero: 60, Component: ScribbleDemo}];

import React from 'react';
import type {Demo} from '../../types';
import {InArea, useArea} from '../_demo';
import {Watercolor} from './watercolor';

const WatercolorDemo: React.FC = () => {
  const a = useArea();
  const look = a.look;
  const w = Math.min(a.w * 0.95, 1180);
  return (
    <InArea>
      <Watercolor width={Math.round(w)} height={Math.round(look.size * (look.tall ? 4 : 3))} start={4} frames={30}>
        <div style={{...look.headline, fontSize: Math.round(look.size * 1.2), textAlign: 'center', padding: '0 0.4em', color: look.dark ? '#f6f1e5' : look.ink}}>
          {/* The accent phrase keeps its weight or slant but not its colour, which is the wash's. */}
          Drawn <span style={{...look.emphasis, color: 'inherit', textShadow: 'none'}}>with code.</span>
        </div>
      </Watercolor>
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Watercolour wash', code: '<Watercolor width={760} height={170}>{headline}</Watercolor>', seconds: 2.5, hero: 50, Component: WatercolorDemo}];

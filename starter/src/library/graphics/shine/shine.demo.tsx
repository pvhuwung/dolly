import React from 'react';
import {Rocket} from 'lucide-react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Shine} from './shine';

const ShineDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(52, w / 14);
  return (
    <Area>
      <Shine start={16} every={50} radius={look.radius === 0 ? 0 : 999}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: size * 0.4,
            padding: `${size * 0.6}px ${size * 1.2}px`,
            borderRadius: look.radius === 0 ? 0 : 999,
            background: look.accent,
            color: look.onAccent,
            fontFamily: look.fonts.body,
            fontWeight: 700,
            fontSize: size,
          }}
        >
          <Rocket size={size * 1.1} strokeWidth={2.2} />
          Get early access
        </div>
      </Shine>
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Shine', code: '<Shine start={16} every={50}>{button}</Shine>', seconds: 2.5, hero: 30, Component: ShineDemo},
];

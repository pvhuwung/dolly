import React from 'react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Chat} from './chat';

const ChatDemo: React.FC = () => {
  const {look, w} = useArea();
  return (
    <Area>
      <Chat
        width={Math.min(860, w * 0.95)}
        size={(look.format !== 'landscape') ? 38 : 36}
        messages={[
          {from: 'them', text: 'Can you ship the fix tonight?', at: 22},
          {from: 'me', text: 'Already merged. Deploying now.', at: 48},
          {from: 'them', text: 'You’re a legend.', at: 92},
        ]}
      />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Chat', code: "<Chat messages={[{from: 'them', text, at: 22}, ...]} />", seconds: 4, hero: 112, Component: ChatDemo},
];

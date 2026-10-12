import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {LucideIcon} from 'lucide-react';
import {Bell, GitPullRequest, ShieldCheck, Zap} from 'lucide-react';
import type {Demo} from '../../types';
import {Area, useArea} from '../_demo';
import {Icon} from './icon';

const FEATURES: [LucideIcon, string][] = [
  [Zap, 'Instant'],
  [ShieldCheck, 'Private'],
  [GitPullRequest, 'Reviewed'],
  [Bell, 'Notified'],
];

const IconDemo: React.FC = () => {
  const {look, w} = useArea();
  const size = Math.min(170, w / 5.5);
  return (
    <Area row gap={(look.format !== 'landscape') ? 56 : 80}>
      {FEATURES.map(([glyph, label], i) => (
        <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: (look.format !== 'landscape') ? w * 0.38 : undefined}}>
          <Icon icon={glyph} size={size} start={4 + i * 6} />
          <div style={{fontFamily: look.fonts.body, fontWeight: 700, fontSize: size * 0.24, color: look.ink, opacity: Math.min(1, Math.max(0, (useCurrentFrame() - 12 - i * 6) / 10))}}>
            {label}
          </div>
        </div>
      ))}
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Feature icons', code: '<Icon icon={Zap} start={4} />', seconds: 2.5, hero: 50, Component: IconDemo},
];

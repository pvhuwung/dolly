import React from 'react';
import {ease} from '../../../kit';
import type {Demo} from '../../types';
import {Area, useArea, useTempo} from '../_shared';

/**
 * Items ticking off one by one: each box fills and its check draws in. For what's included, what
 * the agent did, a launch list.
 *
 *   <Checklist items={['Tests pass', 'Preview deployed', 'Ready to merge']} start={6} />
 */
export const Checklist: React.FC<{
  items: string[];
  start?: number;
  stagger?: number;
  size?: number;
  exit?: number;
}> = ({items, start = 0, stagger = 16, size = 34, exit}) => {
  const {look, pop, glide, ramp, gone} = useTempo();
  const out = gone(exit);
  const box = Math.round(size * 1.15);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: size * 0.75, opacity: 1 - out}}>
      {items.map((item, i) => {
        const shown = glide(start + i * 4, 18);
        const at = start + 16 + i * stagger;
        const fill = pop(at, 16);
        const tick = ramp(at + 3, 10, ease.out);
        return (
          <div key={item} style={{display: 'flex', alignItems: 'center', gap: size * 0.6, opacity: shown, transform: `translateX(${(1 - shown) * -24}px)`}}>
            <div style={{position: 'relative', width: box, height: box, flexShrink: 0}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: look.radius === 0 ? 0 : box * 0.28, border: `3px solid ${look.line}`}} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: look.radius === 0 ? 0 : box * 0.28,
                  background: look.accent,
                  transform: `scale(${fill})`,
                  opacity: Math.min(1, fill * 3),
                }}
              />
              <svg viewBox="0 0 24 24" width={box} height={box} style={{position: 'absolute', inset: 0}}>
                <path
                  d="M6 12.5 L10.2 16.5 L18 8"
                  fill="none"
                  stroke={look.onAccent}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - tick}
                  opacity={tick > 0.002 ? 1 : 0}
                />
              </svg>
            </div>
            <div style={{fontFamily: look.fonts.body, fontWeight: 600, fontSize: size, color: look.ink, opacity: 0.55 + 0.45 * Math.min(1, fill)}}>{item}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery

const ChecklistDemo: React.FC = () => {
  const {look} = useArea();
  return (
    <Area>
      <Checklist items={['Tests pass', 'Preview deployed', 'Docs updated', 'Ready to merge']} start={4} size={(look.format !== 'landscape') ? 52 : 50} />
    </Area>
  );
};

export const demos: Demo[] = [
  {name: 'Checklist', code: "<Checklist items={['Tests pass', ...]} />", seconds: 3.5, hero: 90, Component: ChecklistDemo},
];

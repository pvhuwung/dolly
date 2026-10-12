import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, X} from 'lucide-react';
import {alpha, useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, inner} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** Before and after: the old way struck through, the product's way ticked. */
export const Compare: React.FC<{title?: string; accent?: string; before: {title: string; items: string[]}; after: {title: string; items: string[]}}> = ({
  title,
  accent,
  before,
  after,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const side = look.format === 'landscape';
  const gap = 32;
  const width = side ? (Math.min(inner(look), 1500) - gap) / 2 : inner(look);
  const column = (c: {title: string; items: string[]}, good: boolean, at: number) => {
    const t = spring({frame: frame - at, fps, config: look.spring, durationInFrames: 26});
    const Mark = good ? Check : X;
    return (
      <div
        style={{
          width,
          padding: side ? '36px 40px' : '26px 32px',
          borderRadius: look.radius,
          background: good ? look.surface : alpha(look.surface, 0.55),
          boxShadow: good ? `${look.shadow}, 0 0 0 3px ${alpha(look.accent, 0.55)}` : `0 0 0 1px ${look.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: side ? 22 : 16,
          opacity: t,
          transform: `translateY(${(1 - t) * 30}px)`,
        }}
      >
        <div style={{fontFamily: look.fonts.body, fontSize: 32, fontWeight: 700, color: good ? look.accentText : look.dim, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          {c.title}
        </div>
        {c.items.map((item, i) => {
          const it = spring({frame: frame - at - 14 - i * Math.round(8 * look.pace), fps, config: look.spring, durationInFrames: 22});
          return (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: it, transform: `translateX(${(1 - it) * -20}px)`}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 24,
                  background: good ? look.accent : alpha(look.dim, 0.18),
                  color: good ? look.onAccent : look.dim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mark size={28} strokeWidth={3} />
              </div>
              <div style={{fontFamily: look.fonts.body, fontSize: 42, color: good ? look.ink : look.dim, textDecoration: good ? 'none' : 'line-through', textDecorationColor: alpha(look.dim, 0.6)}}>
                {item}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      {title ? <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} /> : null}
      <div style={{display: 'flex', flexDirection: side ? 'row' : 'column', gap}}>
        {column(before, false, 18)}
        {column(after, true, 18 + before.items.length * 8 + 16)}
      </div>
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Compare', code: '<Compare before={{title, items}} after={{title, items}} />', seconds: 5, hero: 130, backdrop: false, Component: () => <Compare title="Stop checking" accent="every tab." before={{title: 'Before', items: ['Tab through every terminal', 'Miss the prompt that waits']}} after={{title: 'With Termary', items: ['Every agent in one view', 'The waiting one lights up']}} />},
];

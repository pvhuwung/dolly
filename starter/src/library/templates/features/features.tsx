import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BellRing, Columns3, Smartphone, type LucideIcon} from 'lucide-react';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, Eyebrow, inner} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** A tile tinted with the accent, holding an icon: the mark of a feature. */
const IconTile: React.FC<{icon: LucideIcon; size?: number}> = ({icon: Icon, size = 64}) => {
  const look = useLook();
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: Math.min(look.radius, size * 0.3),
        background: look.accentSoft,
        color: look.accentText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.52} strokeWidth={2.2} />
    </div>
  );
};

/** Three to six features as cards, coming in one after another: what the product does. */
export const Features: React.FC<{eyebrow?: string; title?: string; accent?: string; items: {icon: LucideIcon; title: string; text?: string}[]}> = ({
  eyebrow,
  title,
  accent,
  items,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const columns = look.format === 'landscape' ? Math.min(3, items.length) : look.format === 'vertical' ? 1 : 2;
  const gap = 28;
  const width = (Math.min(inner(look), 1600) - gap * (columns - 1)) / columns;
  const compact = look.format === 'vertical';
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      {title ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%'}}>
          <Eyebrow text={eyebrow} />
          <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} />
        </div>
      ) : null}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap, width: '100%'}}>
        {items.map((item, i) => {
          const t = spring({frame: frame - 24 - i * Math.round(7 * look.pace), fps, config: look.spring, durationInFrames: 26});
          return (
            <div
              key={item.title}
              style={{
                width,
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: compact ? 'center' : 'flex-start',
                gap: compact ? 24 : 18,
                padding: compact ? '26px 30px' : '36px 38px',
                borderRadius: look.radius,
                background: look.surface,
                boxShadow: look.shadow,
                opacity: Math.min(1, t * 1.4),
                transform: `translateY(${(1 - t) * 40}px) scale(${0.96 + 0.04 * t})`,
              }}
            >
              <IconTile icon={item.icon} size={compact ? 76 : 84} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <div style={{fontFamily: look.fonts.body, fontSize: 42, fontWeight: 700, color: look.ink, letterSpacing: '-0.01em', lineHeight: 1.15}}>{item.title}</div>
                {item.text ? <div style={{fontFamily: look.fonts.body, fontSize: 32, lineHeight: 1.3, color: look.dim}}>{item.text}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

// Samples for the gallery. The copy is placeholder: write the product's own.

const FEATURES = [
  {icon: Columns3, title: 'Every agent, side by side', text: 'Split panes, grouped by project'},
  {icon: BellRing, title: 'Knows who’s waiting', text: 'A pane lights up when an agent asks'},
  {icon: Smartphone, title: 'Approve from your phone', text: 'Answer prompts away from your desk'},
];

export const demos: Demo[] = [
  {name: 'Features', code: '<Features title="Everything in" accent="one window." items={[...]} />', seconds: 4, hero: 90, backdrop: false, Component: () => <Features title="Everything in" accent="one window." items={FEATURES} />},
];

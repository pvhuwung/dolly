import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {alpha, useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, inner, Heading, headingHeight, useStagger} from '../_shared';

/**
 * Milestones on a line that draws from one to the next, each dot popping as the line reaches it,
 * the last one marked. Across in a wide frame, down in a tall one. For funding news, a company's
 * story, a year in review.
 *
 *   <Timeline title="How we" accent="got here." items={[{when: '2023', what: 'Two people, one idea'}, ...]} />
 */
export const Timeline: React.FC<{eyebrow?: string; title?: string; accent?: string; items: {when: string; what: string}[]}> = ({eyebrow, title, accent, items}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const pop = useStagger();
  const across = look.format === 'landscape';
  const n = items.length;
  const every = Math.round(18 * look.pace);
  const first = 22;
  const progress = interpolate(frame, [first, first + every * (n - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = interpolate(frame, [first + every * (n - 1) + 6, first + every * (n - 1) + 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dot = (i: number) => (i === n - 1 ? 38 : 24);

  if (across) {
    const span = Math.min(inner(look), 1640);
    const col = span / n;
    const lineY = 120;
    return (
      <Page gap={Math.round(look.size * 0.9)}>
        <Heading eyebrow={eyebrow} title={title} accent={accent} />
        <div style={{position: 'relative', width: span, height: lineY + 200}}>
          <div style={{position: 'absolute', left: col / 2, width: span - col, top: lineY - 2, height: 4, background: look.line}} />
          <div style={{position: 'absolute', left: col / 2, width: (span - col) * progress, top: lineY - 2, height: 4, background: look.accent}} />
          {items.map((item, i) => {
            const t = pop(first + i * every, 18);
            const last = i === n - 1;
            const cx = col * (i + 0.5);
            return (
              <React.Fragment key={item.when}>
                {last && pulse > 0 && pulse < 1 ? (
                  <div style={{position: 'absolute', left: cx - 30, top: lineY - 30, width: 60, height: 60, borderRadius: 30, border: `3px solid ${alpha(look.accent, 1 - pulse)}`, transform: `scale(${1 + pulse * 1.4})`}} />
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: cx - dot(i) / 2,
                    top: lineY - dot(i) / 2,
                    width: dot(i),
                    height: dot(i),
                    borderRadius: '50%',
                    background: last ? look.accent : look.surface,
                    boxShadow: `0 0 0 ${last ? 8 : 4}px ${last ? alpha(look.accent, 0.22) : look.accent}`,
                    transform: `scale(${t})`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: cx - col / 2 + 10,
                    width: col - 20,
                    top: lineY - 34,
                    textAlign: 'center',
                    fontFamily: look.fonts.headline,
                    fontSize: Math.round(Math.max(1, look.size / 62) * (last ? 54 : 44)),
                    fontWeight: look.headline.fontWeight,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    color: last ? look.accentText : look.ink,
                    opacity: t,
                    transform: `translateY(calc(-100% + ${(1 - t) * 14}px))`,
                  }}
                >
                  {item.when}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: cx - col / 2 + 10,
                    width: col - 20,
                    top: lineY + 42,
                    textAlign: 'center',
                    fontFamily: look.fonts.body,
                    fontSize: Math.round(Math.max(1, look.size / 62) * (last ? 38 : 34)),
                    fontWeight: last ? 700 : 500,
                    lineHeight: 1.25,
                    color: last ? look.ink : look.dim,
                    opacity: t,
                    transform: `translateY(${(1 - t) * -10}px)`,
                  }}
                >
                  {item.what}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Page>
    );
  }

  const availH = look.height - look.safe.top - look.safe.bottom - headingHeight(look, title, eyebrow);
  const rowH = Math.min(availH / n, 170);
  const width = Math.min(inner(look), 820);
  const x = 30;
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{position: 'relative', width, height: rowH * n}}>
        <div style={{position: 'absolute', left: x - 2, top: rowH / 2, height: rowH * (n - 1), width: 4, background: look.line}} />
        <div style={{position: 'absolute', left: x - 2, top: rowH / 2, height: rowH * (n - 1) * progress, width: 4, background: look.accent}} />
        {items.map((item, i) => {
          const t = pop(first + i * every, 18);
          const last = i === n - 1;
          const cy = rowH * (i + 0.5);
          return (
            <React.Fragment key={item.when}>
              {last && pulse > 0 && pulse < 1 ? (
                <div style={{position: 'absolute', left: x - 30, top: cy - 30, width: 60, height: 60, borderRadius: 30, border: `3px solid ${alpha(look.accent, 1 - pulse)}`, transform: `scale(${1 + pulse * 1.4})`}} />
              ) : null}
              <div
                style={{
                  position: 'absolute',
                  left: x - dot(i) / 2,
                  top: cy - dot(i) / 2,
                  width: dot(i),
                  height: dot(i),
                  borderRadius: '50%',
                  background: last ? look.accent : look.surface,
                  boxShadow: `0 0 0 ${last ? 8 : 4}px ${last ? alpha(look.accent, 0.22) : look.accent}`,
                  transform: `scale(${t})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: x + 54,
                  right: 0,
                  top: cy,
                  transform: `translateY(-50%) translateX(${(1 - t) * 24}px)`,
                  opacity: t,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{fontFamily: look.fonts.headline, fontSize: last ? 50 : 42, fontWeight: look.headline.fontWeight, letterSpacing: '-0.02em', color: last ? look.accentText : look.ink, lineHeight: 1.1}}>
                  {item.when}
                </div>
                <div style={{fontFamily: look.fonts.body, fontSize: last ? 38 : 34, fontWeight: last ? 700 : 500, color: last ? look.ink : look.dim, lineHeight: 1.25}}>{item.what}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Timeline', code: '<Timeline title="How we" accent="got here." items={[{when, what}, ...]} />', seconds: 4.5, hero: 120, backdrop: false, Component: () => <Timeline title="How we" accent="got here." items={[{when: '2023', what: 'Two people, one idea'}, {when: '2024', what: 'First 1,000 users'}, {when: '2025', what: 'Seed round'}, {when: '2026', what: 'Series A'}]} />},
];

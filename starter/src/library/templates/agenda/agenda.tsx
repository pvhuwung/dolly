import React from 'react';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, inner, Heading, useStagger} from '../_shared';

/**
 * A schedule: times and what happens, row by row, then a highlight slides to the featured row
 * (`highlight`, an index). For an event, a launch day, a workshop. Keep titles to one short line.
 *
 *   <Agenda title="Day one" date="Thu · Oct 24" items={[{time: '09:30', title: 'Keynote', who: 'Ravi Menon'}, ...]} highlight={1} />
 */
export const Agenda: React.FC<{eyebrow?: string; title?: string; accent?: string; date?: string; items: {time: string; title: string; who?: string}[]; highlight?: number}> = ({
  eyebrow,
  title,
  accent,
  date,
  items,
  highlight,
}) => {
  const look = useLook();
  const pop = useStagger();
  const wide = look.format === 'landscape';
  const width = wide ? Math.min(inner(look), 1300) : inner(look);
  const anyWho = items.some((i) => i.who);
  const pad = wide ? 20 : 16;
  const rowH = Math.round(wide ? 40 * 1.25 + pad * 2 : 40 * 1.25 + (anyWho ? 32 * 1.3 + 4 : 0) + pad * 2);
  const every = Math.round(8 * look.pace);
  const first = 22;
  const landed = first + every * items.length + 16;
  const dateIn = pop(14, 20);
  // The highlight arrives on the first row, then slides down to the featured one.
  const showH = highlight === undefined ? 0 : pop(landed, 20);
  const slide = highlight === undefined ? 0 : pop(landed + 14, 26) * highlight;
  return (
    <Page gap={Math.round(look.size * 0.5)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      {date ? (
        <div
          style={{
            fontFamily: look.fonts.mono,
            fontSize: 30,
            color: look.ink,
            padding: '8px 22px',
            borderRadius: 999,
            background: look.surface,
            boxShadow: `0 0 0 1px ${look.line}`,
            opacity: dateIn,
            transform: `translateY(${(1 - dateIn) * 12}px)`,
          }}
        >
          {date}
        </div>
      ) : null}
      <div style={{position: 'relative', width}}>
        {highlight !== undefined ? (
          <div
            style={{
              position: 'absolute',
              left: -12,
              right: -12,
              top: slide * rowH,
              height: rowH,
              borderRadius: Math.min(look.radius, 16),
              background: look.accentSoft,
              boxShadow: `inset 6px 0 0 ${look.accent}`,
              opacity: showH,
            }}
          />
        ) : null}
        {items.map((item, i) => {
          const t = pop(first + i * every, 22);
          const on = highlight === i ? pop(landed + 30, 16) : 0;
          return (
            <div
              key={item.time + item.title}
              style={{
                position: 'relative',
                height: rowH,
                display: 'flex',
                alignItems: 'center',
                gap: wide ? 40 : 26,
                padding: `0 ${wide ? 24 : 16}px`,
                borderBottom: i < items.length - 1 ? `1px solid ${look.line}` : 'none',
                opacity: t,
                transform: `translateX(${(1 - t) * 30}px)`,
              }}
            >
              <div style={{fontFamily: look.fonts.mono, fontSize: 34, fontWeight: 600, color: look.accentText, width: wide ? 150 : 128, flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
                {item.time}
              </div>
              <div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'baseline' : 'flex-start', justifyContent: 'space-between', gap: wide ? 24 : 4, flex: 1, minWidth: 0}}>
                <div
                  style={{
                    fontFamily: look.fonts.body,
                    fontSize: 40,
                    fontWeight: 600 + Math.round(on) * 100,
                    color: look.ink,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.title}
                </div>
                {item.who ? <div style={{fontFamily: look.fonts.body, fontSize: 32, color: look.dim, whiteSpace: 'nowrap', flexShrink: 0}}>{item.who}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Agenda', code: '<Agenda title="Day one" date="Thu · Oct 24" items={[{time, title, who}, ...]} highlight={1} />', seconds: 5, hero: 140, backdrop: false, Component: () => <Agenda title="Day one" accent="agenda." date="Thu · Oct 24" highlight={1} items={[{time: '09:00', title: 'Doors open'}, {time: '09:30', title: 'Keynote', who: 'Ravi Menon'}, {time: '11:00', title: 'Workshops', who: 'Three rooms'}, {time: '13:00', title: 'Lunch on the terrace'}, {time: '15:00', title: 'Demos and drinks'}]} />},
];

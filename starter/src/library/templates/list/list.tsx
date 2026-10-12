import React from 'react';
import {alpha, useLook} from '../../../look';
import {Page, inner, Heading, useStagger} from '../_shared';

/**
 * A list with values: each label runs a dotted leader to its value on the right, and an optional
 * detail sits under it. A menu with prices, open roles with locations, plans with prices.
 *
 *   <List title="Today's" accent="menu." items={[{label: 'Flat white', detail: 'Oat or whole', value: '$4.50'}, ...]} />
 */
export const List: React.FC<{
  /** A small label above the headline. */
  eyebrow?: string;
  /** The headline, before its accent phrase. */
  title?: string;
  /** The phrase set in the style's accent way, after the title. */
  accent?: string;
  /** The rows. */
  items: {
    /** The row's name, on the left. */
    label: string;
    /** A smaller line under the label. */
    detail?: string;
    /** What it costs or where it is, on the right after a dotted leader. */
    value?: string;
  }[];
}> = ({
  eyebrow,
  title,
  accent,
  items,
}) => {
  const look = useLook();
  const pop = useStagger();
  const wide = look.format === 'landscape';
  const width = wide ? Math.min(inner(look), 1150) : inner(look);
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{display: 'flex', flexDirection: 'column', gap: wide ? 26 : 30, width}}>
        {items.map((item, i) => {
          const t = pop(22 + i * Math.round(8 * look.pace), 22);
          const leader = pop(30 + i * Math.round(8 * look.pace), 26);
          return (
            <div key={item.label} style={{display: 'flex', flexDirection: 'column', gap: 4, opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
                <div style={{fontFamily: look.fonts.body, fontSize: 42, fontWeight: 600, color: look.ink, lineHeight: 1.2}}>{item.label}</div>
                {item.value ? (
                  <>
                    <div style={{flex: 1, alignSelf: 'flex-end', marginBottom: 12, height: 0, borderBottom: `4px dotted ${alpha(look.ink, 0.28)}`, transformOrigin: '0 50%', transform: `scaleX(${leader})`}} />
                    <div style={{fontFamily: look.fonts.body, fontSize: 42, fontWeight: 700, color: look.accentText, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{item.value}</div>
                  </>
                ) : null}
              </div>
              {item.detail ? <div style={{fontFamily: look.fonts.body, fontSize: 32, color: look.dim, lineHeight: 1.3}}>{item.detail}</div> : null}
            </div>
          );
        })}
      </div>
    </Page>
  );
};

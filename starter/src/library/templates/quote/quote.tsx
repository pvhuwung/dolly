import React from 'react';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {useIn, Page} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** What a user said, with who said it. Real quotes only, with permission. */
export const Quote: React.FC<{quote: string; accent?: string; name: string; role?: string}> = ({quote, accent, name, role}) => {
  const look = useLook();
  const mark = useIn(0, 20);
  const who = useIn(Math.round((quote.split(' ').length + (accent?.split(' ').length ?? 0)) * 4 + 20));
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <Page gap={Math.round(look.size * 0.5)}>
      <div style={{...look.headline, color: look.accentText, fontSize: look.size * 2.4, lineHeight: 0.6, height: look.size * 0.9, opacity: mark, transform: `scale(${0.6 + 0.4 * mark})`}}>“</div>
      <div style={{width: '100%', maxWidth: 1400}}>
        <Kinetic text={quote} accent={accent} start={8} stagger={Math.round(4 * look.pace)} align="center" style={{fontSize: Math.round(look.size * (look.tall ? 0.9 : 1))}} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: who, transform: `translateY(${(1 - who) * 16}px)`}}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            background: look.accent,
            color: look.onAccent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: look.fonts.body,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <div style={{fontFamily: look.fonts.body, fontSize: 40, fontWeight: 700, color: look.ink}}>{name}</div>
          {role ? <div style={{fontFamily: look.fonts.body, fontSize: 32, color: look.dim}}>{role}</div> : null}
        </div>
      </div>
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Quote', code: '<Quote quote="…" accent="…" name="…" role="…" />', seconds: 4.5, hero: 110, backdrop: false, Component: () => <Quote quote="I stopped tabbing through terminals." accent="Now they come to me." name="Your Customer" role="Their role, their company" />},
];

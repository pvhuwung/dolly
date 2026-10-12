import React from 'react';
import {useLook} from '../../../look';
import type {Demo} from '../../types';
import {useIn, Page, inner} from '../_shared';
import {Counter} from '../../text/counter/counter';
import {Kinetic} from '../../text/kinetic/kinetic';

/** A number that counts up, with what it counts: "12 agents in one window". */
export const Metric: React.FC<{value: number; label: string; prefix?: string; suffix?: string; decimals?: number; note?: string}> = ({
  value,
  label,
  prefix,
  suffix,
  decimals,
  note,
}) => {
  const look = useLook();
  const noteIn = useIn(50);
  // As big as the frame allows: a long number ("1,284 km") shrinks to fit the safe width.
  const chars = `${prefix ?? ''}${value.toLocaleString('en-US', {maximumFractionDigits: decimals ?? 0})}${suffix ?? ''}`.length;
  const fontSize = Math.round(Math.min(look.size * (look.tall ? 3 : 3.6), inner(look) / (chars * 0.62)));
  return (
    <Page gap={Math.round(look.size * 0.3)}>
      <Counter
        to={value}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        start={4}
        frames={Math.round(42 * look.pace)}
        style={{...look.headline, color: look.accentText, fontSize, lineHeight: 1}}
      />
      <Kinetic text={label} start={16} align="center" style={{fontSize: Math.round(look.size * 0.9)}} />
      {note ? (
        <div style={{fontFamily: look.fonts.body, fontSize: Math.round(look.size * 0.42), color: look.dim, opacity: noteIn, textAlign: 'center'}}>{note}</div>
      ) : null}
    </Page>
  );
};

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Metric', code: '<Metric value={12} label="agents in one window" />', seconds: 3.5, hero: 80, backdrop: false, Component: () => <Metric value={12} label="agents in one window" />},
];

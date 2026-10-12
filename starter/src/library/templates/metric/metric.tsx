import React from 'react';
import {useLook} from '../../../look';
import {useIn, Page, inner} from '../_shared';
import {Counter} from '../../text/counter/counter';
import {Kinetic} from '../../text/kinetic/kinetic';

/** A number that counts up, with what it counts: "12 agents in one window". */
export const Metric: React.FC<{
  /** The number it counts up to. */
  value: number;
  /** What the number counts, under it. */
  label: string;
  /** Text before the number, such as `$`. */
  prefix?: string;
  /** Text after the number, such as `%` or `k`. */
  suffix?: string;
  /** Decimal places to show; 0 if not set. */
  decimals?: number;
  /** A small line under the label, such as a source or a date. */
  note?: string;
}> = ({
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

import React from 'react';
import {TextEffect, useLook} from '../../../look';
import {Page, Eyebrow} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** One big line, filling the frame: a hook, a punchline, a turn in the story. */
export const Statement: React.FC<{
  /** A small label above the headline. */
  eyebrow?: string;
  /** The line, before its accent phrase. */
  text: string;
  /** The phrase set in the style's accent way, after the text. */
  accent?: string;
  /** How the words come in; the style's own if not set. */
  effect?: TextEffect;
  /** Frame it starts to leave; it stays to the end if not set. */
  exit?: number;
}> = ({
  eyebrow,
  text,
  accent,
  effect,
  exit,
}) => {
  const look = useLook();
  return (
    <Page gap={Math.round(look.size * 0.4)}>
      <Eyebrow text={eyebrow} />
      <div style={{width: '100%', maxWidth: look.tall ? undefined : 1500}}>
        <Kinetic text={text} accent={accent} effect={effect} start={6} exit={exit} align="center" style={{fontSize: Math.round(look.size * (look.tall ? 1.25 : 1.6))}} />
      </div>
    </Page>
  );
};

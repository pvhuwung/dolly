import React from 'react';
import {TextEffect, useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, Eyebrow} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/** One big line, filling the frame: a hook, a punchline, a turn in the story. */
export const Statement: React.FC<{eyebrow?: string; text: string; accent?: string; effect?: TextEffect; exit?: number}> = ({
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

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Statement', code: '<Statement text="Five agents running." accent="One needs you." />', seconds: 3.5, hero: 70, backdrop: false, Component: () => <Statement eyebrow="Agents everywhere" text="Five agents running." accent="One needs you." />},
];

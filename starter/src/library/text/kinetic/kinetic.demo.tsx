import React from 'react';
import type {MarkKind, TextEffect} from '../../../look';
import type {Demo} from '../../types';
import {Center, useDemoType} from '../_demo';
import {Kinetic} from './kinetic';

const Headline: React.FC<{text: string; accent: string; effect?: TextEffect; mark?: MarkKind; exit: number}> = ({text, accent, effect, mark, exit}) => (
  <Center>
    <Kinetic text={text} accent={accent} effect={effect} mark={mark} start={6} exit={exit} align="center" style={useDemoType()} />
  </Center>
);

const EFFECTS: [TextEffect, string, string, number][] = [
  ['rise', 'Ship the video', 'in an afternoon.', 92],
  ['reveal', 'Every pixel', 'in its place.', 92],
  ['blur', 'Out of the noise,', 'into focus.', 92],
  ['pop', 'Big news.', "It's live.", 92],
  ['type', 'Write the video', 'as code.', 30],
  ['letters', 'Made frame', 'by frame.', 92],
  ['slide', 'From idea', 'to launch.', 92],
  ['scramble', 'Decode', 'the signal.', 24],
  ['fade', 'Quiet,', 'and confident.', 92],
];

const MARKS: [MarkKind, string, string][] = [
  ['marker', 'The one thing', 'worth remembering.'],
  ['block', 'Make it', 'unmissable.'],
  ['pill', 'Friendly by', 'default.'],
  ['underline', 'Say it once,', 'clearly.'],
  ['circle', 'Find the', 'one detail.'],
  ['strike', 'No more', 'manual edits.'],
  ['box', 'Point at', 'what matters.'],
];

export const demos: Demo[] = [
  ...EFFECTS.map(([effect, text, accent, hero]) => ({
    name: `Text: ${effect}`,
    code: `<Kinetic text="…" accent="…" effect="${effect}" />`,
    seconds: 4,
    hero,
    Component: () => <Headline text={text} accent={accent} effect={effect} exit={106} />,
  })),
  ...MARKS.map(([mark, text, accent]) => ({
    name: `Mark: ${mark}`,
    code: `<Kinetic text="…" accent="…" mark="${mark}" />`,
    seconds: 4.5,
    hero: 110,
    Component: () => <Headline text={text} accent={accent} mark={mark} exit={120} />,
  })),
];

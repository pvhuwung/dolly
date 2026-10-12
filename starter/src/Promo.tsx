import React from 'react';
import {Audio, CalculateMetadataFunction, Sequence, staticFile} from 'remotion';
import {BellRing, Columns3, Smartphone} from 'lucide-react';
import {brand} from './brand';
import {Scene, Scenes, sceneStarts, scenesLength} from './sequence';
import {FORMATS, FormatName, LookProvider, StyleName, makeLook} from './look';
import {Compare, EndCard, Features, LogoReveal, Statement, Steps} from './library';

// A second sample: a motion-graphics cut made only of templates, with no takes. It's the shape of
// a teaser for social: a hook, the product, what it does, why it's better, how it works, the ask.
// Render it in any style and format:
//
//   npx remotion render Promo out/promo.mp4 --props='{"style":"bold","format":"vertical"}'

const PROMO: Scene[] = [
  {name: 'Hook', seconds: 3.5, component: () => <Statement eyebrow="Agents everywhere" text="Five agents running." accent="One needs you." />},
  {name: 'Logo', seconds: 3.5, component: () => <LogoReveal kind="pop" tagline="Run agents in parallel." accent="All in one place." />},
  {
    name: 'Features',
    seconds: 4.5,
    component: () => (
      <Features
        title="Everything in"
        accent="one window."
        items={[
          {icon: Columns3, title: 'Every agent, side by side', text: 'Split panes, grouped by project'},
          {icon: BellRing, title: 'Knows who’s waiting', text: 'A pane lights up when an agent asks'},
          {icon: Smartphone, title: 'Approve from your phone', text: 'Answer prompts away from your desk'},
        ]}
      />
    ),
  },
  {
    name: 'Compare',
    seconds: 5,
    component: () => (
      <Compare
        title="Stop checking"
        accent="every tab."
        before={{title: 'Before', items: ['Tab through every terminal', 'Miss the prompt that waits']}}
        after={{title: `With ${brand.name}`, items: ['Every agent in one view', 'The waiting one lights up']}}
      />
    ),
  },
  {name: 'Steps', seconds: 4, component: () => <Steps title="How it" accent="works." steps={['Open a group', 'Start your agents', 'Get pinged when one asks']} />},
  {name: 'End', seconds: 4, component: () => <EndCard line="Your agents keep working." accent="Even when you walk away." button="Download free" />},
];

export type PromoProps = {style?: StyleName; format?: FormatName};

export const promoMetadata: CalculateMetadataFunction<PromoProps> = ({props}) => {
  const f = FORMATS[props.format ?? 'landscape'];
  return {width: f.width, height: f.height, durationInFrames: scenesLength(PROMO, props.style ?? brand.style)};
};

export const Promo: React.FC<PromoProps> = ({style = brand.style}) => {
  const starts = sceneStarts(PROMO, style);
  const transition = makeLook(style, 1920, 1080).transition;
  return (
    <LookProvider style={style}>
      <Scenes scenes={PROMO} />
      {PROMO.slice(1).map((s, i) =>
        (s.transition ?? transition) === 'cut' ? null : (
          <Sequence key={s.name} from={starts[i + 1]} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
          </Sequence>
        ),
      )}
      <Sequence from={starts[1] + 2} durationInFrames={40}>
        <Audio src={staticFile('sfx/ting.wav')} volume={0.4} />
      </Sequence>
    </LookProvider>
  );
};

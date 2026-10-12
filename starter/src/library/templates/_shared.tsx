import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../../backdrop';
import {Look, useLook} from '../../look';
import {Kinetic} from '../text/kinetic/kinetic';

// Ready-made scenes for motion graphics, no takes needed: a statement, a metric, features, a quote,
// a before/after, steps, a logo reveal and an end card; and for other agendas, a lineup of people,
// an agenda, a countdown, a changelog, a timeline, a priced list and an announcement. Each fills the frame in any format and
// style and takes its words as props, so a scene list can be all templates, all takes, or both:
//
//   {name: 'Metric', seconds: 4, component: () => <Metric value={12} label="agents in one window" />},
//
// Times are frames from the scene's start. Keep the words few: a template holds one idea.

// Pieces the templates share. Not an item: it's copied with any template.

/** A spring from frame `at`, in the look's motion. */
export const useIn = (at: number, frames = 26) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames * look.pace)});
};

/** The page: the backdrop, and the safe area as a padded flex column. */
export const Page: React.FC<{children: React.ReactNode; center?: boolean; gap?: number}> = ({children, center = true, gap = 40}) => {
  const look = useLook();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          padding: `${look.safe.top}px ${look.safe.right}px ${look.safe.bottom}px ${look.safe.left}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: center ? 'center' : 'flex-start',
          alignItems: center ? 'center' : 'stretch',
          gap,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Eyebrow: React.FC<{text?: string; at?: number}> = ({text, at = 0}) => {
  const look = useLook();
  const t = useIn(at, 18);
  if (!text) return null;
  return (
    <div style={{...look.eyebrow, fontSize: Math.round(look.size * 0.34), opacity: t, transform: `translateY(${(1 - t) * 12}px)`}}>
      {look.eyebrowPrefix}
      {text}
    </div>
  );
};

export const inner = (look: Look) => look.width - look.safe.left - look.safe.right;

// ---------------------------------------------------------------------------------------------
// Use cases beyond a launch: an event, a team, a release, funding news, a menu.

/** An eyebrow and a title, centred: the head of most templates. */
export const Heading: React.FC<{eyebrow?: string; title?: string; accent?: string; scale?: number}> = ({eyebrow, title, accent, scale = 0.95}) => {
  const look = useLook();
  if (!title && !eyebrow) return null;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%'}}>
      <Eyebrow text={eyebrow} />
      {title ? <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * scale)}} /> : null}
    </div>
  );
};

/** About how tall a Heading is, to share the rest of the safe area between rows. */
export const headingHeight = (look: Look, title?: string, eyebrow?: string) =>
  (title ? look.size * 0.95 * 1.15 * (look.tall ? 2 : 1) : 0) + (eyebrow ? look.size * 0.34 * 1.4 + 14 : 0) + (title || eyebrow ? look.size * 0.6 : 0);

/** Springs for items coming in one after another, from `first`, `every` frames apart. */
export const useStagger = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 24) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames * look.pace)});
};

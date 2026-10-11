import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowRight, BellRing, Check, Columns3, Smartphone, X, type LucideIcon} from 'lucide-react';
import {brand} from './brand';
import {Backdrop} from './fx/backdrops';
import type {Demo} from './fx/demo';
import {Counter, Kinetic} from './fx/text';
import {Look, TextEffect, alpha, useLook} from './look';

// Ready-made scenes for motion graphics, no takes needed: a statement, a metric, features, a quote,
// a before/after, steps, a logo reveal and an end card. Each fills the frame in any format and
// style and takes its words as props, so a scene list can be all templates, all takes, or both:
//
//   {name: 'Metric', seconds: 4, component: () => <Metric value={12} label="agents in one window" />},
//
// Times are frames from the scene's start. Keep the words few: a template holds one idea.

/** A spring from frame `at`, in the look's motion. */
const useIn = (at: number, frames = 26) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames * look.pace)});
};

/** The page: the backdrop, and the safe area as a padded flex column. */
const Page: React.FC<{children: React.ReactNode; center?: boolean; gap?: number}> = ({children, center = true, gap = 40}) => {
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

const Eyebrow: React.FC<{text?: string; at?: number}> = ({text, at = 0}) => {
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

const inner = (look: Look) => look.width - look.safe.left - look.safe.right;

// ---------------------------------------------------------------------------------------------

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
  return (
    <Page gap={Math.round(look.size * 0.3)}>
      <Counter
        to={value}
        prefix={prefix}
        suffix={suffix}
        decimals={decimals}
        start={4}
        frames={Math.round(42 * look.pace)}
        style={{...look.headline, color: look.accentText, fontSize: Math.round(look.size * (look.tall ? 3 : 3.6)), lineHeight: 1}}
      />
      <Kinetic text={label} start={16} align="center" style={{fontSize: Math.round(look.size * 0.9)}} />
      {note ? (
        <div style={{fontFamily: look.fonts.body, fontSize: Math.round(look.size * 0.42), color: look.dim, opacity: noteIn, textAlign: 'center'}}>{note}</div>
      ) : null}
    </Page>
  );
};

/** A tile tinted with the accent, holding an icon: the mark of a feature. */
const IconTile: React.FC<{icon: LucideIcon; size?: number}> = ({icon: Icon, size = 64}) => {
  const look = useLook();
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: Math.min(look.radius, size * 0.3),
        background: look.accentSoft,
        color: look.accentText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.52} strokeWidth={2.2} />
    </div>
  );
};

/** Three to six features as cards, coming in one after another: what the product does. */
export const Features: React.FC<{eyebrow?: string; title?: string; accent?: string; items: {icon: LucideIcon; title: string; text?: string}[]}> = ({
  eyebrow,
  title,
  accent,
  items,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const columns = look.format === 'landscape' ? Math.min(3, items.length) : look.format === 'vertical' ? 1 : 2;
  const gap = 28;
  const width = (Math.min(inner(look), 1600) - gap * (columns - 1)) / columns;
  const compact = look.format === 'vertical';
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      {title ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%'}}>
          <Eyebrow text={eyebrow} />
          <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} />
        </div>
      ) : null}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap, width: '100%'}}>
        {items.map((item, i) => {
          const t = spring({frame: frame - 24 - i * Math.round(7 * look.pace), fps, config: look.spring, durationInFrames: 26});
          return (
            <div
              key={item.title}
              style={{
                width,
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: compact ? 'center' : 'flex-start',
                gap: compact ? 24 : 18,
                padding: compact ? '26px 30px' : '36px 38px',
                borderRadius: look.radius,
                background: look.surface,
                boxShadow: look.shadow,
                opacity: Math.min(1, t * 1.4),
                transform: `translateY(${(1 - t) * 40}px) scale(${0.96 + 0.04 * t})`,
              }}
            >
              <IconTile icon={item.icon} size={compact ? 76 : 84} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                <div style={{fontFamily: look.fonts.body, fontSize: 42, fontWeight: 700, color: look.ink, letterSpacing: '-0.01em', lineHeight: 1.15}}>{item.title}</div>
                {item.text ? <div style={{fontFamily: look.fonts.body, fontSize: 32, lineHeight: 1.3, color: look.dim}}>{item.text}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

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

/** Before and after: the old way struck through, the product's way ticked. */
export const Compare: React.FC<{title?: string; accent?: string; before: {title: string; items: string[]}; after: {title: string; items: string[]}}> = ({
  title,
  accent,
  before,
  after,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const side = look.format === 'landscape';
  const gap = 32;
  const width = side ? (Math.min(inner(look), 1500) - gap) / 2 : inner(look);
  const column = (c: {title: string; items: string[]}, good: boolean, at: number) => {
    const t = spring({frame: frame - at, fps, config: look.spring, durationInFrames: 26});
    const Mark = good ? Check : X;
    return (
      <div
        style={{
          width,
          padding: side ? '36px 40px' : '26px 32px',
          borderRadius: look.radius,
          background: good ? look.surface : alpha(look.surface, 0.55),
          boxShadow: good ? `${look.shadow}, 0 0 0 3px ${alpha(look.accent, 0.55)}` : `0 0 0 1px ${look.line}`,
          display: 'flex',
          flexDirection: 'column',
          gap: side ? 22 : 16,
          opacity: t,
          transform: `translateY(${(1 - t) * 30}px)`,
        }}
      >
        <div style={{fontFamily: look.fonts.body, fontSize: 32, fontWeight: 700, color: good ? look.accentText : look.dim, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          {c.title}
        </div>
        {c.items.map((item, i) => {
          const it = spring({frame: frame - at - 14 - i * Math.round(8 * look.pace), fps, config: look.spring, durationInFrames: 22});
          return (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: it, transform: `translateX(${(1 - it) * -20}px)`}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 24,
                  background: good ? look.accent : alpha(look.dim, 0.18),
                  color: good ? look.onAccent : look.dim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mark size={28} strokeWidth={3} />
              </div>
              <div style={{fontFamily: look.fonts.body, fontSize: 42, color: good ? look.ink : look.dim, textDecoration: good ? 'none' : 'line-through', textDecorationColor: alpha(look.dim, 0.6)}}>
                {item}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      {title ? <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} /> : null}
      <div style={{display: 'flex', flexDirection: side ? 'row' : 'column', gap}}>
        {column(before, false, 18)}
        {column(after, true, 18 + before.items.length * 8 + 16)}
      </div>
    </Page>
  );
};

/** Numbered steps joined by a line that draws from one to the next: how it works. */
export const Steps: React.FC<{title?: string; accent?: string; steps: string[]}> = ({title, accent, steps}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const row = look.format === 'landscape';
  const every = Math.round(22 * look.pace);
  const first = 20;
  const dot = 84;
  const progress = interpolate(frame, [first, first + every * (steps.length - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Labels are centred under their dots, so leave half a label of room at each end.
  const span = row ? Math.min(inner(look) - 400, 1400) : Math.min(look.height - look.band - look.safe.bottom, 160 * steps.length);
  return (
    <Page gap={Math.round(look.size * 0.8)}>
      {title ? <Kinetic text={title} accent={accent} start={4} align="center" style={{fontSize: Math.round(look.size * 0.95)}} /> : null}
      <div style={{position: 'relative', display: 'flex', flexDirection: row ? 'row' : 'column', justifyContent: 'space-between', [row ? 'width' : 'height']: span, alignSelf: row ? 'center' : 'stretch'}}>
        {/* The line behind the dots, and its drawn part. */}
        <div style={{position: 'absolute', background: look.line, ...(row ? {left: dot / 2, right: dot / 2, top: dot / 2 - 2, height: 4} : {top: dot / 2, bottom: dot / 2, left: dot / 2 - 2, width: 4})}} />
        <div
          style={{
            position: 'absolute',
            background: look.accent,
            ...(row
              ? {left: dot / 2, width: `calc((100% - ${dot}px) * ${progress})`, top: dot / 2 - 2, height: 4}
              : {top: dot / 2, height: `calc((100% - ${dot}px) * ${progress})`, left: dot / 2 - 2, width: 4}),
          }}
        />
        {steps.map((s, i) => {
          const t = spring({frame: frame - first - i * every, fps, config: look.spring, durationInFrames: 22});
          return (
            <div key={s} style={{position: 'relative', display: 'flex', flexDirection: row ? 'column' : 'row', alignItems: row ? 'center' : 'center', gap: 22, width: row ? dot : undefined}}>
              <div
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  flexShrink: 0,
                  background: t > 0.5 ? look.accent : look.surface,
                  color: t > 0.5 ? look.onAccent : look.dim,
                  boxShadow: `0 0 0 ${t > 0.5 ? 8 : 2}px ${t > 0.5 ? alpha(look.accent, 0.18) : look.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: look.fonts.body,
                  fontSize: 38,
                  fontWeight: 700,
                  transform: `scale(${0.7 + 0.3 * t})`,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  ...(row ? {position: 'absolute', top: dot + 24, left: dot / 2 - 200, width: 400, textAlign: 'center'} : {}),
                  fontFamily: look.fonts.body,
                  fontSize: 44,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: look.ink,
                  opacity: t,
                  transform: `translateY(${(1 - t) * 14}px)`,
                }}
              >
                {s}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/** The logo arriving, then the name and a line under it. `kind` picks the entrance. */
export const LogoReveal: React.FC<{kind?: 'pop' | 'iris' | 'slide' | 'focus'; tagline?: string; accent?: string; logo?: string; name?: string}> = ({
  kind = 'pop',
  tagline,
  accent,
  logo = brand.logo,
  name = brand.name,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = look.tall ? 240 : 220;
  const t = spring({frame, fps, config: kind === 'pop' ? {damping: 12, stiffness: 120, mass: 0.9} : look.spring, durationInFrames: kind === 'pop' ? undefined : 34});
  const nameIn = useIn(kind === 'slide' ? 14 : 18);
  const logoStyle: React.CSSProperties =
    kind === 'pop'
      ? {transform: `scale(${0.4 + 0.6 * t})`, opacity: Math.min(1, t * 2)}
      : kind === 'iris'
        ? {clipPath: `circle(${t * 75}% at 50% 50%)`}
        : kind === 'focus'
          ? {filter: `blur(${(1 - t) * 30}px)`, transform: `scale(${1.25 - 0.25 * t})`, opacity: t}
          : {transform: `translateX(${(1 - t) * -80}px)`, opacity: t};
  const ring = kind === 'focus' ? interpolate(frame, [10, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <Page gap={30}>
      <div style={{position: 'relative', width: size, height: size}}>
        {ring > 0 && ring < 1 ? (
          <div style={{position: 'absolute', inset: -size * 0.4 * ring, borderRadius: '50%', border: `3px solid ${alpha(look.accent, 1 - ring)}`}} />
        ) : null}
        <Img src={staticFile(logo)} style={{width: size, height: size, filter: 'drop-shadow(0 26px 40px rgba(0, 0, 0, 0.18))', ...logoStyle}} />
      </div>
      <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 112, opacity: nameIn, transform: `translateY(${(1 - nameIn) * 30}px)`}}>
        {name}
      </div>
      {tagline ? <Kinetic text={tagline} accent={accent} start={34} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.72), color: look.dim, maxWidth: 1300}} /> : null}
    </Page>
  );
};

/** The ask, big and held: the name, one line, a button and where to go. */
export const EndCard: React.FC<{line?: string; accent?: string; button?: string; url?: string}> = ({line, accent, button = 'Get started', url = brand.url}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const logo = useIn(0, 30);
  const press = useIn(56);
  const urlIn = useIn(70);
  // A glint across the button once it's in.
  const glint = interpolate(frame, [80, 110], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Page gap={34}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`}}>
        <Img src={staticFile(brand.logo)} style={{width: 110, height: 110}} />
        <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 96}}>{brand.name}</div>
      </div>
      {line ? (
        <div style={{width: '100%', maxWidth: 1500}}>
          <Kinetic text={line} accent={accent} start={16} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.9)}} />
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 10,
          padding: '22px 40px',
          borderRadius: look.radius > 12 ? 999 : look.radius,
          background: look.accent,
          color: look.onAccent,
          fontFamily: look.fonts.body,
          fontSize: 46,
          fontWeight: 700,
          opacity: press,
          transform: `translateY(${(1 - press) * 24}px) scale(${0.9 + 0.1 * press})`,
          boxShadow: `0 18px 40px ${alpha(look.accent, 0.35)}`,
        }}
      >
        {button}
        <ArrowRight size={36} strokeWidth={2.6} />
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${glint}%`, width: '30%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)'}} />
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 38, color: look.dim, opacity: urlIn}}>{url}</div>
    </Page>
  );
};

// ---------------------------------------------------------------------------------------------
// Samples for the gallery. The copy is placeholder: write the product's own.

const FEATURES = [
  {icon: Columns3, title: 'Every agent, side by side', text: 'Split panes, grouped by project'},
  {icon: BellRing, title: 'Knows who’s waiting', text: 'A pane lights up when an agent asks'},
  {icon: Smartphone, title: 'Approve from your phone', text: 'Answer prompts away from your desk'},
];

export const demos: Demo[] = [
  {name: 'Statement', code: '<Statement text="Five agents running." accent="One needs you." />', seconds: 3.5, hero: 70, backdrop: false, Component: () => <Statement eyebrow="Agents everywhere" text="Five agents running." accent="One needs you." />},
  {name: 'Metric', code: '<Metric value={12} label="agents in one window" />', seconds: 3.5, hero: 80, backdrop: false, Component: () => <Metric value={12} label="agents in one window" />},
  {name: 'Features', code: '<Features title="Everything in" accent="one window." items={[...]} />', seconds: 4, hero: 90, backdrop: false, Component: () => <Features title="Everything in" accent="one window." items={FEATURES} />},
  {name: 'Quote', code: '<Quote quote="…" accent="…" name="…" role="…" />', seconds: 4.5, hero: 110, backdrop: false, Component: () => <Quote quote="I stopped tabbing through terminals." accent="Now they come to me." name="Your Customer" role="Their role, their company" />},
  {name: 'Compare', code: '<Compare before={{title, items}} after={{title, items}} />', seconds: 5, hero: 130, backdrop: false, Component: () => <Compare title="Stop checking" accent="every tab." before={{title: 'Before', items: ['Tab through every terminal', 'Miss the prompt that waits']}} after={{title: 'With Termary', items: ['Every agent in one view', 'The waiting one lights up']}} />},
  {name: 'Steps', code: '<Steps title="How it works" steps={[...]} />', seconds: 4, hero: 95, backdrop: false, Component: () => <Steps title="How it" accent="works." steps={['Open a group', 'Start your agents', 'Get pinged when one asks']} />},
  {name: 'LogoReveal pop', code: '<LogoReveal kind="pop" tagline="…" />', seconds: 3, hero: 70, backdrop: false, Component: () => <LogoReveal kind="pop" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal iris', code: '<LogoReveal kind="iris" />', seconds: 3, hero: 86, backdrop: false, Component: () => <LogoReveal kind="iris" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal focus', code: '<LogoReveal kind="focus" />', seconds: 3, hero: 60, backdrop: false, Component: () => <LogoReveal kind="focus" />},
  {name: 'EndCard', code: '<EndCard line="…" accent="…" button="Download free" />', seconds: 4, hero: 100, backdrop: false, Component: () => <EndCard line="Your agents keep working." accent="Even when you walk away." button="Download free" />},
];

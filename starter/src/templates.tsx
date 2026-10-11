import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowRight, BellRing, Check, Columns3, Smartphone, X, type LucideIcon} from 'lucide-react';
import {Backdrop} from './fx/backdrops';
import type {Demo} from './fx/demo';
import {Counter, Kinetic} from './fx/text';
import {Look, TextEffect, alpha, useBrand, useLook} from './look';

// Ready-made scenes for motion graphics, no takes needed: a statement, a metric, features, a quote,
// a before/after, steps, a logo reveal and an end card; and for other agendas, a lineup of people,
// an agenda, a countdown, a changelog, a timeline, a priced list and an announcement. Each fills the frame in any format and
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
      <div style={{position: 'relative', display: 'flex', flexDirection: row ? 'row' : 'column', justifyContent: 'space-between', [row ? 'width' : 'height']: span, alignSelf: 'center', minWidth: row ? undefined : Math.min(inner(look), 760)}}>
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
  logo,
  name,
}) => {
  const look = useLook();
  const b = useBrand();
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
        <Img src={staticFile(logo ?? b.logo)} style={{width: size, height: size, filter: 'drop-shadow(0 26px 40px rgba(0, 0, 0, 0.18))', ...logoStyle}} />
      </div>
      <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 112, opacity: nameIn, transform: `translateY(${(1 - nameIn) * 30}px)`}}>
        {name ?? b.name}
      </div>
      {tagline ? <Kinetic text={tagline} accent={accent} start={34} stagger={4} align="center" style={{fontSize: Math.round(look.size * 0.72), color: look.dim, maxWidth: 1300}} /> : null}
    </Page>
  );
};

/** The ask, big and held: the name, one line, a button and where to go. */
export const EndCard: React.FC<{line?: string; accent?: string; button?: string; url?: string}> = ({line, accent, button = 'Get started', url}) => {
  const look = useLook();
  const b = useBrand();
  const frame = useCurrentFrame();
  const logo = useIn(0, 30);
  const press = useIn(56);
  const urlIn = useIn(70);
  // A glint across the button once it's in.
  const glint = interpolate(frame, [80, 110], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Page gap={34}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, opacity: logo, transform: `scale(${0.85 + 0.15 * logo})`}}>
        <Img src={staticFile(b.logo)} style={{width: 110, height: 110}} />
        <div style={{...look.headline, fontFamily: look.fonts.body, fontWeight: 700, fontStyle: 'normal', letterSpacing: '-0.03em', fontSize: 96}}>{b.name}</div>
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
      <div style={{fontFamily: look.fonts.mono, fontSize: 38, color: look.dim, opacity: urlIn}}>{url ?? b.url}</div>
    </Page>
  );
};

// ---------------------------------------------------------------------------------------------
// Use cases beyond a launch: an event, a team, a release, funding news, a menu.

/** An eyebrow and a title, centred: the head of most templates. */
const Heading: React.FC<{eyebrow?: string; title?: string; accent?: string; scale?: number}> = ({eyebrow, title, accent, scale = 0.95}) => {
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
const headingHeight = (look: Look, title?: string, eyebrow?: string) =>
  (title ? look.size * 0.95 * 1.15 * (look.tall ? 2 : 1) : 0) + (eyebrow ? look.size * 0.34 * 1.4 + 14 : 0) + (title || eyebrow ? look.size * 0.6 : 0);

/** Springs for items coming in one after another, from `first`, `every` frames apart. */
const useStagger = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 24) => spring({frame: frame - at, fps, config: look.spring, durationInFrames: Math.round(frames * look.pace)});
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * People: speakers at an event, the team, the hosts. Portrait cards with an initials avatar (or an
 * `image` from public/), coming in one after another. 2 to 8 people; tall frames with more than 4
 * list them in rows instead.
 *
 *   <Lineup title="Meet the" accent="speakers." people={[{name: 'Ada Okafor', role: 'Design lead'}, ...]} />
 */
export const Lineup: React.FC<{eyebrow?: string; title?: string; accent?: string; people: {name: string; role?: string; initials?: string; image?: string}[]}> = ({
  eyebrow,
  title,
  accent,
  people,
}) => {
  const look = useLook();
  const pop = useStagger();
  const n = people.length;
  const rows = look.format === 'vertical' && n > 4;
  const cols = rows ? (n > 6 ? 2 : 1) : look.format === 'landscape' ? (n > 4 ? Math.ceil(n / 2) : n) : look.format === 'vertical' ? 2 : n > 4 ? 3 : 2;
  const lines = Math.ceil(n / cols);
  const gap = look.format === 'landscape' ? 28 : 22;
  const cw = Math.min((Math.min(inner(look), 1640) - gap * (cols - 1)) / cols, rows ? 9999 : 400);
  const availH = look.height - look.safe.top - look.safe.bottom - headingHeight(look, title, eyebrow);
  const ch = (availH - gap * (lines - 1)) / lines;
  const nameSize = rows ? 38 : 40;
  const roleSize = rows ? 30 : 32;
  const pad = rows ? 18 : 26;
  const text = nameSize * 1.25 + roleSize * 1.3 + 14;
  const avatar = Math.round(rows ? Math.min(ch - pad * 2, 96) : Math.max(72, Math.min(cw * 0.62, ch - text - pad * 2, look.format === 'landscape' ? 200 : 160)));
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap, width: Math.min(inner(look), cols * cw + gap * (cols - 1))}}>
        {people.map((p, i) => {
          const t = pop(22 + i * Math.round(6 * look.pace), 26);
          return (
            <div
              key={p.name}
              style={{
                width: cw,
                display: 'flex',
                flexDirection: rows ? 'row' : 'column',
                alignItems: 'center',
                gap: rows ? 22 : 16,
                padding: rows ? `${pad}px 24px` : `${pad + 4}px ${pad}px ${pad}px`,
                borderRadius: look.radius,
                background: look.surface,
                boxShadow: look.shadow,
                opacity: Math.min(1, t * 1.4),
                transform: `translateY(${(1 - t) * 36}px) scale(${0.95 + 0.05 * t})`,
              }}
            >
              <div
                style={{
                  width: avatar,
                  height: avatar,
                  flexShrink: 0,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: look.accentSoft,
                  color: look.accentText,
                  boxShadow: `0 0 0 ${Math.max(3, avatar * 0.03)}px ${alpha(look.accent, 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: look.fonts.body,
                  fontSize: Math.round(avatar * 0.36),
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {p.image ? <Img src={staticFile(p.image)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : (p.initials ?? initialsOf(p.name))}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: rows ? 'flex-start' : 'center', gap: 4, textAlign: rows ? 'left' : 'center', minWidth: 0}}>
                <div style={{fontFamily: look.fonts.body, fontSize: nameSize, fontWeight: 700, color: look.ink, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{p.name}</div>
                {p.role ? <div style={{fontFamily: look.fonts.body, fontSize: roleSize, color: look.dim, lineHeight: 1.25}}>{p.role}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/**
 * A schedule: times and what happens, row by row, then a highlight slides to the featured row
 * (`highlight`, an index). For an event, a launch day, a workshop. Keep titles to one short line.
 *
 *   <Agenda title="Day one" date="Thu · Oct 24" items={[{time: '09:30', title: 'Keynote', who: 'Ravi Menon'}, ...]} highlight={1} />
 */
export const Agenda: React.FC<{eyebrow?: string; title?: string; accent?: string; date?: string; items: {time: string; title: string; who?: string}[]; highlight?: number}> = ({
  eyebrow,
  title,
  accent,
  date,
  items,
  highlight,
}) => {
  const look = useLook();
  const pop = useStagger();
  const wide = look.format === 'landscape';
  const width = wide ? Math.min(inner(look), 1300) : inner(look);
  const anyWho = items.some((i) => i.who);
  const pad = wide ? 20 : 16;
  const rowH = Math.round(wide ? 40 * 1.25 + pad * 2 : 40 * 1.25 + (anyWho ? 32 * 1.3 + 4 : 0) + pad * 2);
  const every = Math.round(8 * look.pace);
  const first = 22;
  const landed = first + every * items.length + 16;
  const dateIn = pop(14, 20);
  // The highlight arrives on the first row, then slides down to the featured one.
  const showH = highlight === undefined ? 0 : pop(landed, 20);
  const slide = highlight === undefined ? 0 : pop(landed + 14, 26) * highlight;
  return (
    <Page gap={Math.round(look.size * 0.5)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      {date ? (
        <div
          style={{
            fontFamily: look.fonts.mono,
            fontSize: 30,
            color: look.ink,
            padding: '8px 22px',
            borderRadius: 999,
            background: look.surface,
            boxShadow: `0 0 0 1px ${look.line}`,
            opacity: dateIn,
            transform: `translateY(${(1 - dateIn) * 12}px)`,
          }}
        >
          {date}
        </div>
      ) : null}
      <div style={{position: 'relative', width}}>
        {highlight !== undefined ? (
          <div
            style={{
              position: 'absolute',
              left: -12,
              right: -12,
              top: slide * rowH,
              height: rowH,
              borderRadius: Math.min(look.radius, 16),
              background: look.accentSoft,
              boxShadow: `inset 6px 0 0 ${look.accent}`,
              opacity: showH,
            }}
          />
        ) : null}
        {items.map((item, i) => {
          const t = pop(first + i * every, 22);
          const on = highlight === i ? pop(landed + 30, 16) : 0;
          return (
            <div
              key={item.time + item.title}
              style={{
                position: 'relative',
                height: rowH,
                display: 'flex',
                alignItems: 'center',
                gap: wide ? 40 : 26,
                padding: `0 ${wide ? 24 : 16}px`,
                borderBottom: i < items.length - 1 ? `1px solid ${look.line}` : 'none',
                opacity: t,
                transform: `translateX(${(1 - t) * 30}px)`,
              }}
            >
              <div style={{fontFamily: look.fonts.mono, fontSize: 34, fontWeight: 600, color: look.accentText, width: wide ? 150 : 128, flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
                {item.time}
              </div>
              <div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'baseline' : 'flex-start', justifyContent: 'space-between', gap: wide ? 24 : 4, flex: 1, minWidth: 0}}>
                <div
                  style={{
                    fontFamily: look.fonts.body,
                    fontSize: 40,
                    fontWeight: 600 + Math.round(on) * 100,
                    color: look.ink,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.title}
                </div>
                {item.who ? <div style={{fontFamily: look.fonts.body, fontSize: 32, color: look.dim, whiteSpace: 'nowrap', flexShrink: 0}}>{item.who}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/**
 * A countdown to a date: days, hours, minutes and seconds ticking down for real while the scene
 * plays, each digit rolling as it changes. For a launch, an event, a sale ending.
 *
 *   <Countdown title="Doors open" accent="soon." to="Oct 24 · 9:00 AM" from={{days: 12, hours: 4, minutes: 32, seconds: 9}} />
 */
export const Countdown: React.FC<{eyebrow?: string; title?: string; accent?: string; to: string; from: {days: number; hours: number; minutes: number; seconds: number}}> = ({
  eyebrow,
  title,
  accent,
  to,
  from,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = useStagger();
  const total = from.days * 86400 + from.hours * 3600 + from.minutes * 60 + from.seconds;
  const split = (sec: number) => {
    const s = Math.max(0, sec);
    return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  };
  const tick = Math.floor(frame / fps);
  const now = split(total - tick);
  const before = split(total - tick + 1);
  // Each change rolls in over the first frames of its second.
  const roll = interpolate(frame % fps, [0, 9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
  // One row of four where the frame is wide enough (16:9, 1:1), two by two in tall ones.
  const grid = look.tall ? 2 : 4;
  const gap = look.format === 'landscape' ? 28 : 22;
  const tw = Math.floor(Math.min((Math.min(inner(look), 1400) - gap * (grid - 1)) / grid, grid === 4 ? 300 : 400));
  const th = Math.round(tw * (grid === 4 ? 1.05 : 0.8));
  const digits = Math.round(th * 0.56);
  const labels = ['Days', 'Hours', 'Min', 'Sec'];
  const toIn = pop(46, 22);
  return (
    <Page gap={Math.round(look.size * 0.55)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap, width: grid === 2 ? tw * 2 + gap : undefined}}>
        {now.map((v, i) => {
          const t = pop(16 + i * Math.round(5 * look.pace), 24);
          const changed = tick > 0 && v !== before[i];
          const show = (n: number) => String(n).padStart(2, '0');
          // Two digits fill a tile; more (214 days) shrink to fit it.
          const fit = 2 / Math.max(2, show(Math.max(v, before[i])).length);
          const digit: React.CSSProperties = {
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            top: '50%',
            lineHeight: 1,
            fontFamily: look.fonts.headline,
            fontSize: Math.round(digits * fit),
            fontWeight: look.headline.fontWeight,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: i === 3 ? look.accentText : look.ink,
          };
          return (
            <div
              key={labels[i]}
              style={{
                width: tw,
                height: th,
                position: 'relative',
                borderRadius: look.radius,
                background: look.surface,
                boxShadow: look.shadow,
                overflow: 'hidden',
                opacity: t,
                transform: `translateY(${(1 - t) * 30}px)`,
              }}
            >
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: th * 0.2, overflow: 'hidden'}}>
                {changed ? <div style={{...digit, transform: `translateY(${-50 - roll * 110}%)`, opacity: 1 - roll}}>{show(before[i])}</div> : null}
                <div style={{...digit, transform: `translateY(${-50 + (changed ? (1 - roll) * 110 : 0)}%)`, opacity: changed ? roll : 1}}>{show(v)}</div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: th * 0.08,
                  textAlign: 'center',
                  fontFamily: look.fonts.body,
                  fontSize: Math.round(Math.max(26, th * 0.1)),
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: look.dim,
                }}
              >
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: look.fonts.mono, fontSize: 34, color: look.dim, opacity: toIn, transform: `translateY(${(1 - toIn) * 12}px)`}}>{to}</div>
    </Page>
  );
};

/**
 * What's new in a release: a version badge, then the changes landing one by one, tagged New,
 * Improved or Fixed. For a changelog post, a product update, release notes.
 *
 *   <Changelog version="v2.4" title="What's" accent="new." items={[{tag: 'New', text: 'Offline mode'}, ...]} />
 */
export const Changelog: React.FC<{version: string; title?: string; accent?: string; items: {tag: 'New' | 'Improved' | 'Fixed'; text: string}[]}> = ({
  version,
  title,
  accent,
  items,
}) => {
  const look = useLook();
  const pop = useStagger();
  const wide = look.format === 'landscape';
  const width = wide ? Math.min(inner(look), 1250) : inner(look);
  const badge = pop(0, 18);
  const tags = {
    New: {background: look.accent, color: look.onAccent},
    Improved: {background: alpha(look.ink, 0.09), color: look.ink},
    // On the surface rather than a tint, so the alert colour reads on any page (bold's is the brand colour).
    Fixed: {background: look.surface, color: look.alert, boxShadow: `inset 0 0 0 2px ${alpha(look.alert, 0.45)}`},
  };
  return (
    <Page gap={Math.round(look.size * 0.45)}>
      <div
        style={{
          fontFamily: look.fonts.mono,
          fontSize: 36,
          fontWeight: 600,
          padding: '8px 24px',
          borderRadius: 999,
          background: look.accent,
          color: look.onAccent,
          transform: `scale(${0.6 + 0.4 * badge})`,
          opacity: badge,
        }}
      >
        {version}
      </div>
      {title ? <Kinetic text={title} accent={accent} start={6} align="center" style={{fontSize: Math.round(look.size * 0.95)}} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', width, marginTop: 8}}>
        {items.map((item, i) => {
          const t = pop(24 + i * Math.round(9 * look.pace), 22);
          const tag = pop(30 + i * Math.round(9 * look.pace), 16);
          return (
            <div
              key={item.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: wide ? 30 : 22,
                padding: `${wide ? 22 : 20}px 4px`,
                borderBottom: i < items.length - 1 ? `1px solid ${look.line}` : 'none',
                opacity: t,
                transform: `translateX(${(1 - t) * 40}px)`,
              }}
            >
              <div
                style={{
                  ...tags[item.tag],
                  width: wide ? 180 : 168,
                  flexShrink: 0,
                  textAlign: 'center',
                  padding: '7px 0',
                  borderRadius: look.radius === 0 ? 0 : 999,
                  fontFamily: look.fonts.body,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transform: `scale(${0.7 + 0.3 * tag})`,
                }}
              >
                {item.tag}
              </div>
              <div style={{fontFamily: look.fonts.body, fontSize: 40, fontWeight: 500, color: look.ink, lineHeight: 1.25}}>{item.text}</div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/**
 * Milestones on a line that draws from one to the next, each dot popping as the line reaches it,
 * the last one marked. Across in a wide frame, down in a tall one. For funding news, a company's
 * story, a year in review.
 *
 *   <Timeline title="How we" accent="got here." items={[{when: '2023', what: 'Two people, one idea'}, ...]} />
 */
export const Timeline: React.FC<{eyebrow?: string; title?: string; accent?: string; items: {when: string; what: string}[]}> = ({eyebrow, title, accent, items}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const pop = useStagger();
  const across = look.format === 'landscape';
  const n = items.length;
  const every = Math.round(18 * look.pace);
  const first = 22;
  const progress = interpolate(frame, [first, first + every * (n - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = interpolate(frame, [first + every * (n - 1) + 6, first + every * (n - 1) + 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dot = (i: number) => (i === n - 1 ? 38 : 24);

  if (across) {
    const span = Math.min(inner(look), 1640);
    const col = span / n;
    const lineY = 120;
    return (
      <Page gap={Math.round(look.size * 0.9)}>
        <Heading eyebrow={eyebrow} title={title} accent={accent} />
        <div style={{position: 'relative', width: span, height: lineY + 200}}>
          <div style={{position: 'absolute', left: col / 2, width: span - col, top: lineY - 2, height: 4, background: look.line}} />
          <div style={{position: 'absolute', left: col / 2, width: (span - col) * progress, top: lineY - 2, height: 4, background: look.accent}} />
          {items.map((item, i) => {
            const t = pop(first + i * every, 18);
            const last = i === n - 1;
            const cx = col * (i + 0.5);
            return (
              <React.Fragment key={item.when}>
                {last && pulse > 0 && pulse < 1 ? (
                  <div style={{position: 'absolute', left: cx - 30, top: lineY - 30, width: 60, height: 60, borderRadius: 30, border: `3px solid ${alpha(look.accent, 1 - pulse)}`, transform: `scale(${1 + pulse * 1.4})`}} />
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: cx - dot(i) / 2,
                    top: lineY - dot(i) / 2,
                    width: dot(i),
                    height: dot(i),
                    borderRadius: '50%',
                    background: last ? look.accent : look.surface,
                    boxShadow: `0 0 0 ${last ? 8 : 4}px ${last ? alpha(look.accent, 0.22) : look.accent}`,
                    transform: `scale(${t})`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: cx - col / 2 + 10,
                    width: col - 20,
                    top: lineY - 34,
                    textAlign: 'center',
                    fontFamily: look.fonts.headline,
                    fontSize: Math.round(Math.max(1, look.size / 62) * (last ? 54 : 44)),
                    fontWeight: look.headline.fontWeight,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    color: last ? look.accentText : look.ink,
                    opacity: t,
                    transform: `translateY(calc(-100% + ${(1 - t) * 14}px))`,
                  }}
                >
                  {item.when}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: cx - col / 2 + 10,
                    width: col - 20,
                    top: lineY + 42,
                    textAlign: 'center',
                    fontFamily: look.fonts.body,
                    fontSize: Math.round(Math.max(1, look.size / 62) * (last ? 38 : 34)),
                    fontWeight: last ? 700 : 500,
                    lineHeight: 1.25,
                    color: last ? look.ink : look.dim,
                    opacity: t,
                    transform: `translateY(${(1 - t) * -10}px)`,
                  }}
                >
                  {item.what}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Page>
    );
  }

  const availH = look.height - look.safe.top - look.safe.bottom - headingHeight(look, title, eyebrow);
  const rowH = Math.min(availH / n, 170);
  const width = Math.min(inner(look), 820);
  const x = 30;
  return (
    <Page gap={Math.round(look.size * 0.6)}>
      <Heading eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{position: 'relative', width, height: rowH * n}}>
        <div style={{position: 'absolute', left: x - 2, top: rowH / 2, height: rowH * (n - 1), width: 4, background: look.line}} />
        <div style={{position: 'absolute', left: x - 2, top: rowH / 2, height: rowH * (n - 1) * progress, width: 4, background: look.accent}} />
        {items.map((item, i) => {
          const t = pop(first + i * every, 18);
          const last = i === n - 1;
          const cy = rowH * (i + 0.5);
          return (
            <React.Fragment key={item.when}>
              {last && pulse > 0 && pulse < 1 ? (
                <div style={{position: 'absolute', left: x - 30, top: cy - 30, width: 60, height: 60, borderRadius: 30, border: `3px solid ${alpha(look.accent, 1 - pulse)}`, transform: `scale(${1 + pulse * 1.4})`}} />
              ) : null}
              <div
                style={{
                  position: 'absolute',
                  left: x - dot(i) / 2,
                  top: cy - dot(i) / 2,
                  width: dot(i),
                  height: dot(i),
                  borderRadius: '50%',
                  background: last ? look.accent : look.surface,
                  boxShadow: `0 0 0 ${last ? 8 : 4}px ${last ? alpha(look.accent, 0.22) : look.accent}`,
                  transform: `scale(${t})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: x + 54,
                  right: 0,
                  top: cy,
                  transform: `translateY(-50%) translateX(${(1 - t) * 24}px)`,
                  opacity: t,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{fontFamily: look.fonts.headline, fontSize: last ? 50 : 42, fontWeight: look.headline.fontWeight, letterSpacing: '-0.02em', color: last ? look.accentText : look.ink, lineHeight: 1.1}}>
                  {item.when}
                </div>
                <div style={{fontFamily: look.fonts.body, fontSize: last ? 38 : 34, fontWeight: last ? 700 : 500, color: last ? look.ink : look.dim, lineHeight: 1.25}}>{item.what}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Page>
  );
};

/**
 * A list with values: each label runs a dotted leader to its value on the right, and an optional
 * detail sits under it. A menu with prices, open roles with locations, plans with prices.
 *
 *   <List title="Today's" accent="menu." items={[{label: 'Flat white', detail: 'Oat or whole', value: '$4.50'}, ...]} />
 */
export const List: React.FC<{eyebrow?: string; title?: string; accent?: string; items: {label: string; detail?: string; value?: string}[]}> = ({
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

/**
 * Big news: the headline lands, a glint runs across it and a stroke draws under it, then a line of
 * detail. For funding, a milestone, a launch date, a partnership.
 *
 *   <Announcement eyebrow="Big news" text="We raised $18M" accent="to build what's next." detail="Series A" />
 */
export const Announcement: React.FC<{eyebrow?: string; text: string; accent?: string; detail?: string; size?: number}> = ({eyebrow, text, accent, detail, size}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const pop = useStagger();
  const words = `${text} ${accent ?? ''}`.trim().split(/\s+/).length;
  const landed = 10 + words * Math.round(5 * look.pace) + 16;
  const punch = interpolate(frame, [landed, landed + 6, landed + 16], [1, 1.035, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glint = interpolate(frame, [landed + 2, landed + 30], [-0.4, 1.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const underline = interpolate(frame, [landed + 4, landed + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
  const detailIn = pop(landed + 18, 22);
  const maxWidth = look.tall ? inner(look) : 1500;
  return (
    <Page gap={Math.round(look.size * 0.45)}>
      <Eyebrow text={eyebrow} />
      <div style={{position: 'relative', display: 'inline-block', maxWidth, transform: `scale(${punch})`}}>
        <Kinetic text={text} accent={accent} start={6} align="center" style={{fontSize: size ?? Math.round(look.size * (look.tall ? 1.2 : 1.5))}} />
        {/* The glint: a soft band of light crossing the words, clipped to their box. */}
        <div style={{position: 'absolute', inset: '-10% 0', overflow: 'hidden', pointerEvents: 'none'}}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '28%',
              left: `${glint * 100 - 14}%`,
              transform: 'skewX(-18deg)',
              background: `linear-gradient(90deg, transparent, ${look.dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.65)'}, transparent)`,
              opacity: glint > -0.4 && glint < 1.4 ? 1 : 0,
            }}
          />
        </div>
        {/* A stroke under the headline, narrower than it: a flourish, whatever the line breaks. */}
        <svg width="56%" height={36} viewBox="0 0 1000 36" preserveAspectRatio="none" style={{display: 'block', overflow: 'visible', margin: '14px auto 0'}}>
          <path
            d="M 8 24 C 240 10, 520 32, 760 16 S 960 18, 992 14"
            pathLength={1}
            fill="none"
            stroke={look.accent}
            strokeWidth={7}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="1"
            strokeDashoffset={1 - underline}
            opacity={underline > 0.002 ? 1 : 0}
          />
        </svg>
      </div>
      {detail ? (
        <div
          style={{
            fontFamily: look.fonts.body,
            fontSize: Math.round(look.size * 0.6),
            color: look.dim,
            textAlign: 'center',
            maxWidth,
            opacity: detailIn,
            transform: `translateY(${(1 - detailIn) * 16}px)`,
          }}
        >
          {detail}
        </div>
      ) : null}
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
  {name: 'LogoReveal pop', code: '<LogoReveal kind="pop" tagline="…" />', seconds: 3, hero: 86, backdrop: false, Component: () => <LogoReveal kind="pop" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal iris', code: '<LogoReveal kind="iris" />', seconds: 3, hero: 86, backdrop: false, Component: () => <LogoReveal kind="iris" tagline="Run agents in parallel." accent="All in one place." />},
  {name: 'LogoReveal focus', code: '<LogoReveal kind="focus" />', seconds: 3, hero: 60, backdrop: false, Component: () => <LogoReveal kind="focus" />},
  {name: 'EndCard', code: '<EndCard line="…" accent="…" button="Download free" />', seconds: 4, hero: 100, backdrop: false, Component: () => <EndCard line="Your agents keep working." accent="Even when you walk away." button="Download free" />},
  {name: 'Lineup', code: '<Lineup title="Meet the" accent="speakers." people={[{name, role}, ...]} />', seconds: 4, hero: 100, backdrop: false, Component: () => <Lineup eyebrow="Fieldwork 2027" title="Meet the" accent="speakers." people={[{name: 'Ada Okafor', role: 'Design lead'}, {name: 'Ravi Menon', role: 'Founder'}, {name: 'Lena Varga', role: 'Staff engineer'}, {name: 'Tom Iwasaki', role: 'Product'}]} />},
  {name: 'Agenda', code: '<Agenda title="Day one" date="Thu · Oct 24" items={[{time, title, who}, ...]} highlight={1} />', seconds: 5, hero: 140, backdrop: false, Component: () => <Agenda title="Day one" accent="agenda." date="Thu · Oct 24" highlight={1} items={[{time: '09:00', title: 'Doors open'}, {time: '09:30', title: 'Keynote', who: 'Ravi Menon'}, {time: '11:00', title: 'Workshops', who: 'Three rooms'}, {time: '13:00', title: 'Lunch on the terrace'}, {time: '15:00', title: 'Demos and drinks'}]} />},
  {name: 'Countdown', code: '<Countdown title="Doors open" to="Oct 24 · 9:00 AM" from={{days, hours, minutes, seconds}} />', seconds: 4, hero: 96, backdrop: false, Component: () => <Countdown title="Doors open" accent="soon." to="Oct 24 · 9:00 AM" from={{days: 12, hours: 4, minutes: 32, seconds: 9}} />},
  {name: 'Changelog', code: '<Changelog version="v2.4" title="What\'s" accent="new." items={[{tag: \'New\', text}, ...]} />', seconds: 4.5, hero: 110, backdrop: false, Component: () => <Changelog version="v2.4" title="What’s" accent="new." items={[{tag: 'New', text: 'Offline mode for every note'}, {tag: 'Improved', text: 'Search is three times faster'}, {tag: 'New', text: 'Share a stack with one link'}, {tag: 'Fixed', text: 'Sync on flaky connections'}]} />},
  {name: 'Timeline', code: '<Timeline title="How we" accent="got here." items={[{when, what}, ...]} />', seconds: 4.5, hero: 120, backdrop: false, Component: () => <Timeline title="How we" accent="got here." items={[{when: '2023', what: 'Two people, one idea'}, {when: '2024', what: 'First 1,000 users'}, {when: '2025', what: 'Seed round'}, {when: '2026', what: 'Series A'}]} />},
  {name: 'List', code: '<List title="Today\'s" accent="menu." items={[{label, detail, value}, ...]} />', seconds: 4, hero: 100, backdrop: false, Component: () => <List title="Today’s" accent="menu." items={[{label: 'Flat white', detail: 'Double shot, oat or whole milk', value: '$4.50'}, {label: 'Cardamom bun', detail: 'Baked this morning', value: '$3.80'}, {label: 'Cold brew', detail: 'Steeped for 18 hours', value: '$5.00'}, {label: 'Sourdough toast', detail: 'Butter and sea salt', value: '$6.00'}]} />},
  {name: 'Announcement', code: '<Announcement eyebrow="Big news" text="We raised $18M" accent="…" detail="…" />', seconds: 4, hero: 100, backdrop: false, Component: () => <Announcement eyebrow="Big news" text="We raised $18M" accent="to build what’s next." detail="Series A, with thanks to our customers and team" />},
];

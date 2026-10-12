import React from 'react';
import {alpha, useLook} from '../../../look';
import {Page, inner, useStagger} from '../_shared';
import {Kinetic} from '../../text/kinetic/kinetic';

/**
 * What's new in a release: a version badge, then the changes landing one by one, tagged New,
 * Improved or Fixed. For a changelog post, a product update, release notes.
 *
 *   <Changelog version="v2.4" title="What's" accent="new." items={[{tag: 'New', text: 'Offline mode'}, ...]} />
 */
export const Changelog: React.FC<{
  /** The release, in the badge, such as `v2.4`. */
  version: string;
  /** The headline, before its accent phrase. */
  title?: string;
  /** The phrase set in the style's accent way, after the title. */
  accent?: string;
  /** The changes, one row each. */
  items: {
    /** `New`, `Improved` or `Fixed`. */
    tag: 'New' | 'Improved' | 'Fixed';
    /** The change, one short line. */
    text: string;
  }[];
}> = ({
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

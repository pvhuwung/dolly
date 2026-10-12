import React from 'react';
import {Img, staticFile} from 'remotion';
import {alpha, useLook} from '../../../look';
import type {Demo} from '../../types';
import {Page, inner, Heading, headingHeight, useStagger} from '../_shared';

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

// The gallery sample. The copy is placeholder: write the product's own.
export const demos: Demo[] = [
  {name: 'Lineup', code: '<Lineup title="Meet the" accent="speakers." people={[{name, role}, ...]} />', seconds: 4, hero: 100, backdrop: false, Component: () => <Lineup eyebrow="Fieldwork 2027" title="Meet the" accent="speakers." people={[{name: 'Ada Okafor', role: 'Design lead'}, {name: 'Ravi Menon', role: 'Founder'}, {name: 'Lena Varga', role: 'Staff engineer'}, {name: 'Tom Iwasaki', role: 'Product'}]} />},
];

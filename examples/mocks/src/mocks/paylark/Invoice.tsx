import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, CreditCard, Landmark} from 'lucide-react';
import {Cursor} from '../../fx/graphics';
import {ease} from '../../kit';
import {alpha, useBrand, useLook} from '../../look';

// The Paylark invoice editor, built in HTML: the product moment. Everything is laid out on an
// absolute grid so the camera and the pointer can aim at exact rects.

export const WIN = {width: 960, height: 812};
/** The totals and the Send button: what the camera pushes in to. */
export const DETAIL = {x: 500, y: 588, width: 424, height: 210};
const BUTTON = {x: 640, y: 722, width: 276, height: 66};

/** Scene frames of the invoice's beats. */
export const BEAT = {rows: [58, 82, 106], click: 200, paid: 252};

const ROWS = [
  {item: 'Brand identity', qty: 1, rate: 3200},
  {item: 'Website design', qty: 1, rate: 1400},
  {item: 'Illustrations', qty: 4, rate: 50},
];

const money = (n: number) => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const Invoice: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ink = look.ink;
  const mono: React.CSSProperties = {fontFamily: look.fonts.mono, fontSize: 17, letterSpacing: '0.06em', textTransform: 'uppercase', color: look.dim};
  const sans = look.fonts.body;

  // A row is typed in, then its numbers land and the total counts up to include it.
  const typed = (i: number) => Math.max(0, Math.floor((frame - BEAT.rows[i]) * 1.4));
  const landed = (i: number) => interpolate(frame, [BEAT.rows[i] + 12, BEAT.rows[i] + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out});
  const total = ROWS.reduce((sum, r, i) => sum + r.qty * r.rate * landed(i), 0);

  const sent = frame >= BEAT.click + 4;
  const paid = frame >= BEAT.paid + 10;
  const press = frame >= BEAT.click && frame < BEAT.click + 8 ? 0.96 : 1;
  const stamp = spring({frame: frame - BEAT.paid - 10, fps, config: {damping: 14, stiffness: 180}, durationInFrames: 20});
  const status = paid ? {text: 'Paid', bg: look.accent, fg: look.onAccent} : sent ? {text: 'Sent', bg: ink, fg: '#ffffff'} : {text: 'Draft', bg: alpha(ink, 0.08), fg: look.dim};

  const row = (top: number, children: React.ReactNode, key?: string) => (
    <div key={key} style={{position: 'absolute', left: 44, right: 44, top, height: 64, display: 'grid', gridTemplateColumns: '1fr 64px 150px 160px', alignItems: 'center', borderBottom: `1px solid ${look.line}`}}>
      {children}
    </div>
  );
  const cell = (text: React.ReactNode, right = false, style?: React.CSSProperties) => (
    <div style={{textAlign: right ? 'right' : 'left', fontFamily: sans, fontSize: 26, color: ink, fontVariantNumeric: 'tabular-nums', ...style}}>{text}</div>
  );

  return (
    <div style={{position: 'relative', width: WIN.width, height: WIN.height, background: '#ffffff', fontFamily: sans}}>
      {/* The window's own bar. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 56, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderBottom: `1px solid ${look.line}`}}>
        <div style={{display: 'flex', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 11, height: 11, borderRadius: 6, background: '#d6d6d3'}} />
          ))}
        </div>
        <Img src={staticFile(brand.logo)} style={{width: 26, height: 26, marginLeft: 8}} />
        <div style={{fontSize: 20, fontWeight: 700, color: ink, letterSpacing: '-0.01em'}}>{brand.name}</div>
        <div style={{fontFamily: look.fonts.mono, fontSize: 18, color: look.dim}}>/ Invoices / #0142</div>
        <div style={{marginLeft: 'auto', padding: '6px 16px', fontFamily: look.fonts.mono, fontSize: 17, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', background: status.bg, color: status.fg}}>
          {status.text}
        </div>
      </div>

      {/* Header and client. */}
      <div style={{position: 'absolute', left: 42, top: 78, fontSize: 64, fontWeight: 700, letterSpacing: '-0.045em', color: ink, lineHeight: 1}}>Invoice</div>
      <div style={{position: 'absolute', left: 46, top: 152, ...mono, fontSize: 18}}>No. 0142</div>
      <div style={{position: 'absolute', right: 44, top: 84, textAlign: 'right', ...mono, lineHeight: 1.9}}>
        Issued 12 Oct 2026
        <br />
        Due 26 Oct 2026
      </div>
      <div style={{position: 'absolute', left: 44, top: 204, ...mono}}>Bill to</div>
      <div style={{position: 'absolute', left: 44, top: 230, fontSize: 32, fontWeight: 600, color: ink, letterSpacing: '-0.015em'}}>Juniper Studio</div>
      <div style={{position: 'absolute', left: 44, top: 272, fontSize: 22, color: look.dim}}>Lisbon, Portugal</div>

      {/* Line items: a heavy rule, the column heads, then the rows as they're typed. */}
      <div style={{position: 'absolute', left: 44, right: 44, top: 324, height: 3, background: ink}} />
      {row(327, ['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => <div key={h} style={{...mono, textAlign: i ? 'right' : 'left'}}>{h}</div>), 'head')}
      {ROWS.map((r, i) => {
        const t = landed(i);
        const caret = typed(i) > 0 && typed(i) <= r.item.length + 6 && Math.floor(frame / 8) % 2 === 0;
        return row(
          391 + i * 64,
          <>
            {cell(
              <>
                {r.item.slice(0, typed(i))}
                {caret ? <span style={{display: 'inline-block', width: 3, height: 28, marginLeft: 2, background: look.accent, verticalAlign: 'middle'}} /> : null}
              </>,
            )}
            {cell(r.qty, true, {opacity: t})}
            {cell(money(r.rate), true, {opacity: t, color: look.dim})}
            {cell(money(r.qty * r.rate * t), true, {opacity: t, fontWeight: 600})}
          </>,
          r.item,
        );
      })}

      {/* Totals. */}
      <div style={{position: 'absolute', left: DETAIL.x + 40, right: 44, top: 600, display: 'flex', flexDirection: 'column', gap: 8}}>
        {[
          ['Subtotal', money(total)],
          ['Tax (0%)', money(0)],
        ].map(([k, v]) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: look.dim, fontVariantNumeric: 'tabular-nums'}}>
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{height: 3, background: ink, marginTop: 4}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <span style={{fontSize: 24, fontWeight: 700, color: ink}}>Total</span>
          <span style={{fontSize: 44, fontWeight: 700, color: ink, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>{money(total)}</span>
        </div>
      </div>

      {/* How the client can pay, and the button. */}
      <div style={{position: 'absolute', left: 44, top: BUTTON.y + 18, display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: look.dim}}>
        <CreditCard size={28} strokeWidth={2} />
        <Landmark size={28} strokeWidth={2} />
        <span>Card or bank transfer</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: BUTTON.x,
          top: BUTTON.y,
          width: BUTTON.width,
          height: BUTTON.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: sent ? ink : look.accent,
          color: sent ? '#ffffff' : look.onAccent,
          fontSize: 26,
          fontWeight: 700,
          transform: `scale(${press})`,
        }}
      >
        {sent ? (
          <>
            <Check size={28} strokeWidth={3} /> Sent
          </>
        ) : (
          'Send invoice'
        )}
      </div>

      {/* The stamp once it's paid. */}
      {stamp > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: 96,
            top: 600,
            padding: '6px 22px',
            border: `5px solid ${look.accent}`,
            color: look.accent,
            fontFamily: look.fonts.mono,
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: '0.12em',
            transform: `rotate(-9deg) scale(${1.5 - 0.5 * stamp})`,
            opacity: Math.min(1, stamp * 1.5),
          }}
        >
          PAID
        </div>
      ) : null}

      <Cursor
        points={[
          {x: 400, y: 790, at: 146},
          {x: BUTTON.x + 150, y: BUTTON.y + 34, at: BEAT.click, click: true},
          {x: BUTTON.x + 240, y: BUTTON.y + 82, at: BEAT.click + 40},
        ]}
        exit={BEAT.click + 44}
      />
    </div>
  );
};

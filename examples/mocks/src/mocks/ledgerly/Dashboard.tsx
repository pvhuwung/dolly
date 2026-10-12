import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BarChart3, Cloud, Download, LayoutDashboard, Palette, Receipt, Settings, Users, Wallet, type LucideIcon} from 'lucide-react';
import {LineChart, Ring} from '../../fx/graphics';
import {Counter} from '../../fx/text';
import {alpha, useLook} from '../../look';
import {Callout} from '../../parts';

// Ledgerly's overview screen, built in HTML for the mock: a rail, three stat cards, burn by month,
// budget used, and this week's top vendors with one spiking. Times are frames of the scene.

/** The window, title bar included. */
export const WIN = {width: 1000, height: 720};
const BAR = 40;
const RAIL = 64;
const PAD = 24;
const MAIN = WIN.width - RAIL - PAD * 2;
// Rows of the main column, in the content area's px (below the title bar).
const HEAD = {y: PAD, h: 52};
const STATS = {y: 88, h: 120};
const MID = {y: 224, h: 250};
const TABLE_Y = 490;
const TABLE_H = 680 - PAD - TABLE_Y;
const ROW = 42;
const TABLE_HEAD = 34;

/** The vendor table's name, amount and change columns, in window px: where the camera pushes in. */
export const TABLE = {x: RAIL + PAD, y: BAR + TABLE_Y, width: 600, height: TABLE_H};
/** The spiking row, in content px (for the Callout inside the Screen). */
const SPIKE = {x: RAIL + PAD + 6, y: TABLE_Y + TABLE_HEAD + 2, width: 588, height: ROW - 4};

const useIn = (at: number, frames = 18) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: frames});
};

const Card: React.FC<{style: React.CSSProperties; at: number; children: React.ReactNode}> = ({style, at, children}) => {
  const look = useLook();
  const t = useIn(at, 22);
  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        borderRadius: 14,
        background: look.surface,
        border: `1px solid ${look.line}`,
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Delta: React.FC<{text: string; bad?: boolean; at: number; size?: number}> = ({text, bad, at, size = 15}) => {
  const look = useLook();
  const t = useIn(at, 14);
  const color = bad ? look.alert : look.accentText;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        borderRadius: 999,
        background: alpha(color, 0.14),
        color,
        fontFamily: look.fonts.body,
        fontSize: size,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        transform: `scale(${0.6 + 0.4 * t})`,
        opacity: t,
      }}
    >
      {text}
    </span>
  );
};

const StatCard: React.FC<{i: number; label: string; to: number; prefix?: string; suffix?: string; delta: string; bad?: boolean; at: number}> = ({
  i,
  label,
  to,
  prefix,
  suffix,
  delta,
  bad,
  at,
}) => {
  const look = useLook();
  const w = (MAIN - 32) / 3;
  return (
    <Card at={at} style={{left: RAIL + PAD + i * (w + 16), top: STATS.y, width: w, height: STATS.h, padding: '18px 20px'}}>
      <div style={{fontFamily: look.fonts.body, fontSize: 17, fontWeight: 500, color: look.dim}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 10}}>
        <Counter
          to={to}
          prefix={prefix}
          suffix={suffix}
          start={at + 4}
          frames={44}
          style={{fontFamily: look.fonts.headline, fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', color: look.ink}}
        />
        <Delta text={delta} bad={bad} at={at + 44} />
      </div>
    </Card>
  );
};

const VENDORS: {name: string; icon: LucideIcon; amount: string; delta: string; bad?: boolean; spark: number[]}[] = [
  {name: 'Cloud hosting', icon: Cloud, amount: '$41,200', delta: '+42%', bad: true, spark: [4, 4.2, 4.1, 4.4, 4.3, 5.1, 6.2]},
  {name: 'Payroll platform', icon: Users, amount: '$28,900', delta: '+1%', spark: [5, 5, 5.1, 5, 5.1, 5.1, 5.1]},
  {name: 'Design tools', icon: Palette, amount: '$6,450', delta: '−3%', spark: [3.2, 3.3, 3.1, 3.2, 3, 3.1, 3]},
];

const Spark: React.FC<{values: number[]; color: string; at: number}> = ({values, color, at}) => {
  const t = useIn(at, 26);
  const w = 90;
  const h = 26;
  const lo = Math.min(...values) - 0.2;
  const hi = Math.max(...values) + 0.2;
  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${(i / (values.length - 1)) * w} ${h - ((v - lo) / (hi - lo)) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
    </svg>
  );
};

export const Dashboard: React.FC<{alertAt: number}> = ({alertAt}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const rail = [LayoutDashboard, Wallet, Receipt, BarChart3, Settings];
  // The spiking row glows once the alert lands.
  const glow = alertAt < frame ? 0.5 + 0.5 * Math.sin((frame - alertAt) / 6) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0b0d11', fontFamily: look.fonts.body}}>
      {/* The rail. */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: RAIL, borderRight: `1px solid ${look.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18, gap: 22}}>
        <div style={{width: 30, height: 30, borderRadius: 9, background: look.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8}}>
          <div style={{width: 12, height: 12, borderLeft: '4px solid #06130c', borderBottom: '4px solid #06130c'}} />
        </div>
        {rail.map((Icon, i) => (
          <Icon key={i} size={22} color={i === 0 ? look.accentText : look.dim} strokeWidth={2} />
        ))}
      </div>

      {/* The header. */}
      <div style={{position: 'absolute', left: RAIL + PAD, top: HEAD.y, width: MAIN, height: HEAD.h, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: look.ink}}>Overview</div>
        <div style={{padding: '4px 12px', borderRadius: 999, border: `1px solid ${look.line}`, fontSize: 15, color: look.dim}}>October 2026</div>
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: alpha(look.ink, 0.06), fontSize: 15, fontWeight: 600, color: look.ink}}>
          <Download size={16} /> Board report
        </div>
      </div>

      <StatCard i={0} label="Monthly burn" to={184300} prefix="$" delta="+12%" bad at={4} />
      <StatCard i={1} label="Runway" to={18} suffix=" mo" delta="on track" at={8} />
      <StatCard i={2} label="MRR" to={96400} prefix="$" delta="+8%" at={12} />

      {/* Burn by month. */}
      <Card at={16} style={{left: RAIL + PAD, top: MID.y, width: MAIN - 16 - 250, height: MID.h, padding: '18px 24px'}}>
        <div style={{fontSize: 17, fontWeight: 500, color: look.dim, marginBottom: 46}}>Spend by month</div>
        <LineChart
          values={[128, 133, 142, 150, 163, 184]}
          labels={['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
          width={MAIN - 16 - 250 - 48 - 44}
          height={150}
          min={110}
          max={196}
          start={30}
          frames={70}
          format={(n) => `$${Math.round(n)}k`}
        />
      </Card>

      {/* Budget used. */}
      <Card at={20} style={{left: RAIL + PAD + MAIN - 250, top: MID.y, width: 250, height: MID.h, padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{alignSelf: 'flex-start', fontSize: 17, fontWeight: 500, color: look.dim}}>Budget used</div>
        <div style={{marginTop: 10}}>
          <Ring value={72} size={170} label="of Q4" start={34} frames={60} />
        </div>
      </Card>

      {/* This week's top vendors. */}
      <Card at={24} style={{left: RAIL + PAD, top: TABLE_Y, width: MAIN, height: TABLE_H, padding: '0 14px'}}>
        <div style={{height: TABLE_HEAD, display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: 600, color: look.dim, letterSpacing: '0.02em'}}>
          <span style={{width: 250}}>Top vendors this week</span>
          <span style={{width: 110, textAlign: 'right'}}>Spend</span>
          <span style={{width: 120, textAlign: 'right'}}>vs last week</span>
        </div>
        {VENDORS.map((v, i) => {
          const t = spring({frame: frame - 34 - i * 6, fps: 30, config: {damping: 200}, durationInFrames: 18});
          return (
            <div
              key={v.name}
              style={{
                height: ROW,
                display: 'flex',
                alignItems: 'center',
                borderTop: `1px solid ${look.line}`,
                opacity: t,
                transform: `translateX(${(1 - t) * -16}px)`,
                background: v.bad ? alpha(look.alert, 0.06 + 0.06 * glow) : undefined,
                margin: '0 -14px',
                padding: '0 14px',
              }}
            >
              <span style={{width: 250, display: 'flex', alignItems: 'center', gap: 12, fontSize: 19, fontWeight: 600, color: look.ink}}>
                <span style={{width: 28, height: 28, borderRadius: 8, background: alpha(look.ink, 0.07), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <v.icon size={16} color={look.dim} />
                </span>
                {v.name}
              </span>
              <span style={{width: 110, textAlign: 'right', fontSize: 19, fontWeight: 600, color: look.ink, fontVariantNumeric: 'tabular-nums'}}>{v.amount}</span>
              <span style={{width: 120, textAlign: 'right'}}>
                <Delta text={v.delta} bad={v.bad} at={44 + i * 6} />
              </span>
              <span style={{width: 106, display: 'flex', justifyContent: 'flex-end'}}>
                <Spark values={v.spark} color={v.bad ? look.alert : look.dim} at={46 + i * 6} />
              </span>
              <span style={{flex: 1}} />
              <span style={{fontSize: 15, fontWeight: 600, color: v.bad ? look.alert : look.dim, opacity: v.bad ? 1 : 0.6}}>{v.bad ? 'Review' : 'OK'}</span>
            </div>
          );
        })}
      </Card>

      <Callout {...SPIKE} at={alertAt} color={look.alert} />
    </div>
  );
};

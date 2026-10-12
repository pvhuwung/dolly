import React from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, CreditCard, FileText, KeyRound, Lock, Search, Settings, ShieldCheck, Smartphone, Star, X} from 'lucide-react';
import {alpha, mix, useLook} from '../../look';

// Vaultly's desktop app and the phone's authenticator, drawn in HTML. Sizes are the window's own
// points: the window is 1280 x 800, its title bar 44 tall, its sidebar 240 wide.

export const WINDOW = {width: 1280, height: 800};
export const CODE = '482913';

/** Where things are in the window, for the camera, the cursor and the callouts. */
export const SPOT = {
  settings: {x: 24, y: 722, width: 192, height: 40},
  securityTab: {x: 384, y: 132, width: 88, height: 40},
  twoStepRow: {x: 264, y: 284, width: 992, height: 96},
  turnOn: {x: 1128, y: 310, width: 128, height: 44},
  modal: {x: 340, y: 150, width: 600, height: 560},
  codeBoxes: {x: 380, y: 520, width: 404, height: 64},
  verify: {x: 796, y: 620, width: 120, height: 52},
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** A QR-like code: 25 x 25 modules with the three finder squares, fixed by `seed`. */
export const QR: React.FC<{size: number; seed?: string; ink?: string}> = ({size, seed = 'vaultly', ink = '#111'}) => {
  const n = 25;
  const cell = size / n;
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      if (inBox(ox, oy)) {
        const dx = x - ox;
        const dy = y - oy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      const on = f === -1 ? random(`${seed}-${x}-${y}`) > 0.52 : f === 1;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.4} height={cell + 0.4} fill={ink} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {cells}
    </svg>
  );
};

const ITEMS = [
  {name: 'Work email', user: 'ana@northwind.work', tint: '#4b3fe0'},
  {name: 'Bank', user: 'ana.costa', tint: '#0f8a5f'},
  {name: 'Home Wi-Fi', user: 'Costa-5G', tint: '#d97706'},
  {name: 'Streaming', user: 'ana.costa', tint: '#e5484d'},
  {name: 'Design tools', user: 'ana@northwind.work', tint: '#0ea5b7'},
  {name: 'Pharmacy', user: 'acosta', tint: '#7c5c3b'},
];

export type AppState = {
  /** 0: the item list, 1: settings. */
  page: number;
  /** 0 to 1: the Security tab sliding in. */
  security: number;
  /** 0 to 1: the setup dialog. */
  modal: number;
  /** Digits typed into the code boxes. */
  typed: number;
  /** 0 to 1: verified. */
  verified: number;
};

const Row: React.FC<{title: string; detail: string; action: React.ReactNode; first?: boolean}> = ({title, detail, action, first}) => {
  const look = useLook();
  return (
    <div style={{height: 96, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: first ? 'none' : `1px solid ${look.line}`, padding: '0 8px'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{fontSize: 22, fontWeight: 600, color: '#0a0a0a'}}>{title}</div>
        <div style={{fontSize: 17, color: '#6b6b6b'}}>{detail}</div>
      </div>
      {action}
    </div>
  );
};

const Button: React.FC<{children: React.ReactNode; primary?: boolean; width?: number}> = ({children, primary, width = 128}) => {
  const look = useLook();
  return (
    <div
      style={{
        width,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: primary ? look.accent : '#ffffff',
        color: primary ? look.onAccent : '#0a0a0a',
        border: primary ? 'none' : '1px solid rgba(0,0,0,0.16)',
        fontSize: 18,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
};

/** The setup dialog: the code to scan, the six boxes, Verify; then the done state. */
const Modal: React.FC<{state: AppState}> = ({state}) => {
  const look = useLook();
  const {modal, typed, verified} = state;
  const m = SPOT.modal;
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(10,10,10,${0.28 * modal})`}}>
      <div
        style={{
          position: 'absolute',
          left: m.x,
          top: m.y,
          width: m.width,
          height: m.height,
          background: '#ffffff',
          boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.12)',
          opacity: modal,
          transform: `translateY(${(1 - modal) * 30}px) scale(${0.96 + 0.04 * modal})`,
          padding: '32px 40px',
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 26, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em'}}>Set up two-step sign-in</div>
          <X size={24} color="#6b6b6b" />
        </div>
        <div style={{opacity: 1 - verified}}>
          <div style={{display: 'flex', gap: 28, marginTop: 26, alignItems: 'center'}}>
            <div style={{padding: 10, border: '1px solid rgba(0,0,0,0.12)'}}>
              <QR size={200} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <div style={{fontFamily: look.fonts.mono, fontSize: 15, color: look.accentText}}>STEP 1</div>
              <div style={{fontSize: 20, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.3}}>Scan this code with your authenticator app.</div>
              <div style={{fontSize: 16, color: '#6b6b6b'}}>Can't scan? Enter the key by hand.</div>
            </div>
          </div>
          <div style={{fontFamily: look.fonts.mono, fontSize: 15, color: look.accentText, marginTop: 26}}>STEP 2 · ENTER THE 6-DIGIT CODE</div>
          <div style={{display: 'flex', gap: 12, marginTop: 12}}>
            {[...CODE].map((d, i) => (
              <div
                key={i}
                style={{
                  width: 58,
                  height: 64,
                  border: `2px solid ${i === typed && typed < 6 ? look.accent : 'rgba(0,0,0,0.18)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: look.fonts.mono,
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#0a0a0a',
                }}
              >
                {i < typed ? d : ''}
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: SPOT.verify.x - m.x, top: SPOT.verify.y - m.y}}>
            <Button primary width={SPOT.verify.width}>
              Verify
            </Button>
          </div>
        </div>
        {verified > 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              opacity: verified,
              transform: `scale(${0.94 + 0.06 * verified})`,
            }}
          >
            <div style={{width: 120, height: 120, borderRadius: 60, background: look.accent, color: look.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Check size={68} strokeWidth={3} />
            </div>
            <div style={{fontSize: 30, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em'}}>Two-step sign-in is on</div>
            <div style={{fontSize: 19, color: '#6b6b6b'}}>New devices will ask for a code from your phone.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** The Vaultly window in a given state. */
export const VaultApp: React.FC<{state: AppState; children?: React.ReactNode}> = ({state, children}) => {
  const look = useLook();
  const nav = [
    {icon: Lock, label: 'All items'},
    {icon: Star, label: 'Favourites'},
    {icon: KeyRound, label: 'Passwords'},
    {icon: CreditCard, label: 'Cards'},
    {icon: FileText, label: 'Notes'},
  ];
  const on = state.verified > 0.5;
  return (
    <div style={{position: 'relative', width: WINDOW.width, height: WINDOW.height, background: '#ffffff', fontFamily: look.fonts.body, overflow: 'hidden'}}>
      {/* Title bar. */}
      <div style={{height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#f6f6f4'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
        ))}
        <div style={{flex: 1, textAlign: 'center', fontSize: 14, color: 'rgba(0,0,0,0.5)', marginRight: 60}}>Vaultly</div>
      </div>
      {/* Sidebar. */}
      <div style={{position: 'absolute', left: 0, top: 44, bottom: 0, width: 240, background: '#f6f6f4', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '22px 16px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 700, color: '#0a0a0a', marginBottom: 26}}>
          <div style={{width: 30, height: 30, background: look.accent, color: look.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <ShieldCheck size={20} />
          </div>
          Vaultly
        </div>
        {nav.map(({icon: Icon, label}, i) => (
          <div
            key={label}
            style={{
              height: 44,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 12px',
              fontSize: 18,
              color: '#0a0a0a',
              background: state.page < 0.5 && i === 0 ? 'rgba(0,0,0,0.06)' : 'transparent',
            }}
          >
            <Icon size={20} color="#6b6b6b" />
            {label}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: SPOT.settings.x,
            top: SPOT.settings.y - 44,
            width: SPOT.settings.width,
            height: SPOT.settings.height,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 12px',
            fontSize: 18,
            color: '#0a0a0a',
            background: state.page >= 0.5 ? 'rgba(0,0,0,0.06)' : 'transparent',
          }}
        >
          <Settings size={20} color="#6b6b6b" />
          Settings
        </div>
      </div>
      {/* Main: the item list, or settings. */}
      <div style={{position: 'absolute', left: 240, top: 44, right: 0, bottom: 0, padding: '28px 24px 0'}}>
        {state.page < 0.5 ? (
          <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 32, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em'}}>All items</div>
              <div style={{width: 360, height: 44, border: '1px solid rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', color: '#8a8a8a', fontSize: 17}}>
                <Search size={18} /> Search your vault
              </div>
            </div>
            <div style={{marginTop: 22}}>
              {ITEMS.map((it, i) => (
                <div key={it.name} style={{height: 72, display: 'flex', alignItems: 'center', gap: 16, borderTop: i ? '1px solid rgba(0,0,0,0.08)' : 'none'}}>
                  <div style={{width: 44, height: 44, background: mix(it.tint, '#ffffff', 0.82), color: it.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20}}>
                    {it.name[0]}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 19, fontWeight: 600, color: '#0a0a0a'}}>{it.name}</div>
                    <div style={{fontSize: 16, color: '#6b6b6b'}}>{it.user}</div>
                  </div>
                  <div style={{fontFamily: look.fonts.mono, color: '#9a9a9a', fontSize: 18, letterSpacing: 2}}>••••••••••</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize: 32, fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.03em'}}>Settings</div>
            <div style={{position: 'relative', display: 'flex', gap: 32, marginTop: 20, height: 48, borderBottom: '1px solid rgba(0,0,0,0.12)', fontSize: 18}}>
              {['General', 'Security', 'Sharing', 'Billing'].map((t, i) => (
                <div key={t} style={{width: 88, paddingTop: 10, color: (i === 1 ? state.security : 1 - state.security) > 0.5 && i < 2 ? '#0a0a0a' : '#6b6b6b', fontWeight: 600}}>
                  {t}
                </div>
              ))}
              <div style={{position: 'absolute', bottom: -1, left: interpolate(state.security, [0, 1], [0, 120]), width: 88, height: 3, background: look.accent}} />
            </div>
            <div style={{marginTop: 10, opacity: state.security, transform: `translateX(${(1 - state.security) * 30}px)`}}>
              <Row first title="Master password" detail="Last changed 3 months ago" action={<Button>Change</Button>} />
              <Row
                title="Two-step sign-in"
                detail={on ? 'On · codes from your phone' : 'Off · adds a code from your phone at sign-in'}
                action={
                  on ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: alpha(look.accent, 0.12), color: look.accentText, fontWeight: 700, fontSize: 18}}>
                      <Check size={20} strokeWidth={3} /> On
                    </div>
                  ) : (
                    <Button primary>Turn on</Button>
                  )
                }
              />
              <Row title="Trusted devices" detail="2 devices: this Mac, iPhone" action={<Button>Manage</Button>} />
              <Row title="Auto-lock" detail="After 5 minutes idle" action={<Button>Change</Button>} />
            </div>
          </>
        )}
      </div>
      {state.modal > 0 ? <Modal state={state} /> : null}
      {children}
    </div>
  );
};

/** The phone's authenticator: a viewfinder finding the code (`scan` 0 to 1), then the account's code. */
export const Authenticator: React.FC<{scan: number; added: number; frame: number}> = ({scan, added, frame}) => {
  const look = useLook();
  const sweep = (frame % 40) / 40;
  const remaining = 30 - ((Math.floor(frame / 30) + 12) % 30);
  return (
    <div style={{position: 'relative', width: '100%', height: '100%', background: '#0e0f12', fontFamily: look.fonts.body, color: '#fff', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center', fontSize: 20, fontWeight: 600}}>{added > 0.5 ? 'Authenticator' : 'Scan a code'}</div>
      {/* The viewfinder. */}
      <div style={{position: 'absolute', left: 58, top: 200, width: 300, height: 300, opacity: 1 - added}}>
        <div style={{position: 'absolute', inset: 0, background: '#2a2c31'}} />
        <div style={{position: 'absolute', left: 50, top: 50, opacity: 0.35 + 0.65 * scan, transform: `scale(${0.9 + 0.1 * scan})`}}>
          <div style={{background: '#f4f4f0', padding: 8}}>
            <QR size={184} />
          </div>
        </div>
        {[0, 1, 2, 3].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              width: 46,
              height: 46,
              borderColor: scan > 0.9 ? '#4ade80' : '#ffffff',
              borderStyle: 'solid',
              borderWidth: 0,
              ...(k === 0 ? {left: 0, top: 0, borderLeftWidth: 5, borderTopWidth: 5} : {}),
              ...(k === 1 ? {right: 0, top: 0, borderRightWidth: 5, borderTopWidth: 5} : {}),
              ...(k === 2 ? {left: 0, bottom: 0, borderLeftWidth: 5, borderBottomWidth: 5} : {}),
              ...(k === 3 ? {right: 0, bottom: 0, borderRightWidth: 5, borderBottomWidth: 5} : {}),
            }}
          />
        ))}
        {scan < 0.95 ? <div style={{position: 'absolute', left: 10, right: 10, top: 20 + sweep * 260, height: 3, background: '#4ade80', boxShadow: '0 0 16px #4ade80'}} /> : null}
      </div>
      <div style={{position: 'absolute', top: 540, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: 'rgba(255,255,255,0.7)', opacity: 1 - added}}>
        {scan > 0.9 ? 'Code found' : 'Point at the code'}
      </div>
      {/* The account, once added. */}
      <div style={{position: 'absolute', left: 24, right: 24, top: 130, opacity: added, transform: `translateY(${(1 - added) * 24}px)`}}>
        {[
          {name: 'Vaultly', user: 'ana@northwind.work', code: CODE, mine: true},
          {name: 'Work SSO', user: 'ana.costa', code: '115 270'},
          {name: 'Cloud console', user: 'ana', code: '903 448'},
        ].map((a) => (
          <div key={a.name} style={{padding: '18px 4px', borderBottom: '1px solid rgba(255,255,255,0.12)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: 18, fontWeight: 600}}>{a.name}</div>
                <div style={{fontSize: 15, color: 'rgba(255,255,255,0.6)'}}>{a.user}</div>
              </div>
              <svg width={34} height={34} viewBox="0 0 34 34">
                <circle cx={17} cy={17} r={14} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
                <circle cx={17} cy={17} r={14} fill="none" stroke={a.mine ? '#4ade80' : 'rgba(255,255,255,0.6)'} strokeWidth={4} strokeDasharray={`${(remaining / 30) * 88} 88`} transform="rotate(-90 17 17)" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: look.fonts.mono,
                fontSize: a.mine ? 46 : 30,
                fontWeight: 600,
                letterSpacing: 4,
                marginTop: 6,
                color: a.mine ? '#4ade80' : 'rgba(255,255,255,0.85)',
              }}
            >
              {a.mine ? `${CODE.slice(0, 3)} ${CODE.slice(3)}` : a.code}
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.6}}>
        <Smartphone size={22} />
      </div>
    </div>
  );
};

/** A spring from frame `at`, eased like the style. */
export const useSpring = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, frames = 18) => spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: frames});
};

export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, ChevronRight, Clock, Flame, X, Zap} from 'lucide-react';
import {ease} from '../../kit';
import {useLook} from '../../look';
import {Tap} from '../../parts';
import {Dot, FOUND, Fridge, Omelette, Pasta, Shakshuka} from './art';

// The app on the phone, 392 x 852 (the screen inside a 416 x 876 phone). One timeline, in frames of
// the Demo scene: the camera scans the fridge, the finds are boxed one by one, a sheet counts them,
// the recipes slide in, and the first one is tapped.

export const T = {
  scan: 22, // the scan line starts down the fridge
  found: (i: number) => 30 + i * 8, // each find is boxed
  sheet: 86, // the "6 ingredients" sheet slides up
  recipes: 104, // the recipe list slides in over the camera
  card: (i: number) => 118 + i * 8,
  tap: 196, // the first recipe is tapped
  cook: 212, // "Start cooking" slides up
};

const W = 392;
const H = 852;
const VIEW_TOP = 48; // the viewfinder sits under the status bar

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const StatusBar: React.FC<{color: string}> = ({color}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', color, fontSize: 17, fontWeight: 700}}>
    <span>9:41</span>
    <span style={{display: 'flex', gap: 5, alignItems: 'flex-end'}}>
      {[6, 9, 12, 15].map((h) => (
        <span key={h} style={{width: 4, height: h, borderRadius: 1, background: color}} />
      ))}
      <span style={{marginLeft: 6, width: 26, height: 13, borderRadius: 4, border: `2px solid ${color}`, position: 'relative'}}>
        <span style={{position: 'absolute', left: 2, top: 2, bottom: 2, width: 15, borderRadius: 1, background: color}} />
      </span>
    </span>
  </div>
);

/** The camera view of the fridge, with the scan line and the boxes round what it finds. */
const ScanView: React.FC<{frame: number}> = ({frame}) => {
  const look = useLook();
  const {fps} = useVideoConfig();
  const line = interpolate(frame, [T.scan, T.scan + 52], [0, 652], {...clamp, easing: ease.inOut});
  const scanning = frame >= T.scan && frame < T.scan + 56;
  const done = frame >= T.found(FOUND.length - 1) + 6;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0d0d0f'}}>
      <div style={{position: 'absolute', left: 0, top: VIEW_TOP, width: W, height: 652, overflow: 'hidden'}}>
        <Fridge />
        {/* The part already scanned is a touch brighter; the line itself glows. */}
        {scanning ? (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: line, background: 'rgba(255,255,255,0.10)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: line - 2, height: 4, background: '#ffffff', boxShadow: `0 0 24px 6px ${look.accent}, 0 0 4px #ffffff`}} />
          </>
        ) : null}
        {FOUND.map((f, i) => {
          const t = spring({frame: frame - T.found(i), fps, config: {damping: 13, stiffness: 170}});
          if (t <= 0.01) return null;
          return (
            <div
              key={f.name}
              style={{
                position: 'absolute',
                left: f.box.x,
                top: f.box.y,
                width: f.box.width,
                height: f.box.height,
                border: '3px solid #ffffff',
                borderRadius: 14,
                boxShadow: '0 0 0 2px rgba(0,0,0,0.12)',
                transform: `scale(${1.25 - 0.25 * t})`,
                opacity: Math.min(1, t * 1.5),
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: -3,
                  top: -32,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px 4px 7px',
                  borderRadius: 999,
                  background: '#ffffff',
                  color: '#1b1412',
                  fontSize: 16,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <Check size={15} strokeWidth={3.4} color="#e5432d" />
                {f.name}
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: 'rgba(15,12,12,0.62)', color: '#ffffff', fontSize: 16, fontWeight: 700}}>
            <span style={{width: 9, height: 9, borderRadius: 5, background: done ? '#5cd27a' : '#e5432d', opacity: done ? 1 : 0.5 + 0.5 * Math.abs(Math.sin(frame / 5))}} />
            {done ? `${FOUND.length} found` : 'Scanning…'}
          </div>
        </div>
      </div>
      <StatusBar color="#ffffff" />
      {/* The camera's controls. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: VIEW_TOP + 652, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 34px 18px'}}>
        <X size={28} color="#ffffff" strokeWidth={2.4} />
        <div style={{width: 72, height: 72, borderRadius: 36, border: '5px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: '#e5432d'}} />
        </div>
        <Zap size={28} color="#ffffff" strokeWidth={2.4} />
      </div>
    </div>
  );
};

/** The sheet that counts the finds, sliding up over the camera's controls. */
const Sheet: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - T.sheet, fps, config: {damping: 16, stiffness: 140}});
  if (t <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 300,
        transform: `translateY(${(1 - t) * 320}px)`,
        background: '#fff8f1',
        borderRadius: '30px 30px 0 0',
        padding: '24px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{width: 44, height: 5, borderRadius: 3, background: '#e7d8cc', alignSelf: 'center', marginTop: -10}} />
      <div style={{fontSize: 26, fontWeight: 800, color: '#1b1412', letterSpacing: '-0.02em'}}>6 ingredients found</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
        {FOUND.map((f) => (
          <div key={f.name} style={{display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 7px', borderRadius: 999, background: '#ffffff', border: '1.5px solid #f0e2d6', fontSize: 16, fontWeight: 700, color: '#3b2a24'}}>
            <Dot color={f.color} size={14} />
            {f.name}
          </div>
        ))}
      </div>
      <div style={{marginTop: 4, height: 56, borderRadius: 18, background: '#e5432d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 20, fontWeight: 800}}>
        See 4 recipes <ChevronRight size={22} strokeWidth={3} />
      </div>
    </div>
  );
};

const RECIPES = [
  {name: 'Shakshuka', time: '15 min', uses: 'Uses 5 of 6', Art: Shakshuka},
  {name: 'Spinach & feta pasta', time: '12 min', uses: 'Uses 4 of 6', Art: Pasta},
  {name: 'Lemon omelette', time: '8 min', uses: 'Uses 4 of 6', Art: Omelette},
];

/** Where the recipe cards are on the screen, for framing the push-in on them. */
export const CARDS = {x: 16, y: 196, width: 360, height: 3 * 150 + 2 * 16};

/** The recipes the finds make, sliding in over the camera, the first one tapped. */
const RecipesView: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const press = interpolate(frame, [T.tap, T.tap + 5, T.tap + 12], [1, 0.965, 1], clamp);
  const chosen = frame >= T.tap + 4;
  const cook = spring({frame: frame - T.cook, fps, config: {damping: 15, stiffness: 150}});
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff8f1'}}>
      <StatusBar color="#1b1412" />
      <div style={{position: 'absolute', left: 24, right: 24, top: 66, display: 'flex', flexDirection: 'column', gap: 6}}>
        <div style={{fontSize: 15, fontWeight: 800, color: '#e5432d', letterSpacing: '0.08em', textTransform: 'uppercase'}}>Tonight</div>
        <div style={{fontSize: 34, fontWeight: 800, color: '#1b1412', letterSpacing: '-0.03em'}}>4 recipes</div>
        <div style={{display: 'flex', gap: 8, marginTop: 6}}>
          <div style={{padding: '7px 14px', borderRadius: 999, background: '#1b1412', color: '#ffffff', fontSize: 15, fontWeight: 700}}>Under 15 min</div>
          <div style={{padding: '7px 14px', borderRadius: 999, border: '1.5px solid #ead9cc', color: '#5b4740', fontSize: 15, fontWeight: 700}}>Vegetarian</div>
        </div>
      </div>
      {RECIPES.map((r, i) => {
        const t = spring({frame: frame - T.card(i), fps, config: {damping: 15, stiffness: 150}});
        const first = i === 0;
        return (
          <div
            key={r.name}
            style={{
              position: 'absolute',
              left: CARDS.x,
              top: CARDS.y + i * 166,
              width: CARDS.width,
              height: 150,
              borderRadius: 24,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 14,
              boxSizing: 'border-box',
              boxShadow: first && chosen ? '0 0 0 3px #e5432d, 0 14px 30px rgba(229,67,45,0.25)' : '0 6px 18px rgba(60,30,20,0.08)',
              opacity: Math.min(1, t * 1.4),
              transform: `translateX(${(1 - t) * 160}px) scale(${first ? press : 1})`,
            }}
          >
            <r.Art size={122} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0}}>
              <div style={{fontSize: 22, fontWeight: 800, color: '#1b1412', letterSpacing: '-0.02em', lineHeight: 1.1}}>{r.name}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700, color: '#5b4740'}}>
                <Clock size={16} strokeWidth={2.6} /> {r.time}
              </div>
              <div style={{alignSelf: 'flex-start', padding: '3px 9px', borderRadius: 999, background: '#e8f5ea', color: '#2f7d3c', fontSize: 14, fontWeight: 700}}>{r.uses}</div>
            </div>
          </div>
        );
      })}
      <Tap x={CARDS.x + CARDS.width / 2} y={CARDS.y + 75} at={T.tap} color="#e5432d" />
      {cook > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 26,
            height: 68,
            borderRadius: 22,
            background: '#e5432d',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 22,
            fontWeight: 800,
            transform: `translateY(${(1 - cook) * 120}px)`,
            boxShadow: '0 12px 30px rgba(229,67,45,0.35)',
          }}
        >
          <Flame size={24} strokeWidth={2.6} /> Start cooking · 15:00
        </div>
      ) : null}
    </div>
  );
};

/** Everything on the phone's screen, for the Demo scene's frame. */
export const PhoneUI: React.FC = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  // The recipe list slides in from the right over the camera view, which slides a little left.
  const swap = interpolate(frame, [T.recipes, T.recipes + 16], [0, 1], {...clamp, easing: ease.inOut});
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: look.fonts.body, width: W, height: H}}>
      {swap < 1 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${-swap * 120}px)`, filter: swap > 0 ? `brightness(${1 - swap * 0.5})` : undefined}}>
          <ScanView frame={frame} />
          <Sheet frame={frame} />
        </div>
      ) : null}
      {swap > 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - swap) * W}px)`, boxShadow: '-12px 0 30px rgba(0,0,0,0.2)'}}>
          <RecipesView frame={frame} />
        </div>
      ) : null}
    </div>
  );
};

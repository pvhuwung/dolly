import React from 'react';

// A stand-in app so the starter renders with no footage. Swap it for <Footage src="..."> (your
// real screen recording) as soon as you have one: real UI always beats a mock.

export const APP_SIZE = {width: 1280, height: 800};

/** Where the highlighted card sits, from the window's OUTER top-left (title bar included). */
export const APP_HIGHLIGHT = {x: 884, y: 80, width: 360, height: 230};

const line = (w: number, c = 'rgba(255,255,255,0.16)') => (
  <div style={{height: 10, width: w, borderRadius: 5, background: c}} />
);

export const PlaceholderApp: React.FC<{accent?: string}> = ({accent = '#7c5cff'}) => (
  <div style={{display: 'flex', width: '100%', height: '100%', fontSize: 15, color: '#e6edf3'}}>
    <div
      style={{
        width: 240,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: 'rgba(255,255,255,0.025)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {[120, 150, 96, 170, 132, 110, 150].map((w, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <div style={{width: 14, height: 14, borderRadius: 4, background: i === 1 ? accent : 'rgba(255,255,255,0.14)'}} />
          {line(w, i === 1 ? 'rgba(255,255,255,0.5)' : undefined)}
        </div>
      ))}
    </div>
    <div style={{flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16}}>
      {[420, 360, 520, 300, 460, 380, 250, 480, 330, 410, 290, 440, 360].map((w, i) => (
        <div key={i} style={{display: 'flex', gap: 14, alignItems: 'center'}}>
          <div style={{width: 22, textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.25)'}}>{i + 1}</div>
          {line(w * 0.35, i % 4 === 0 ? accent : 'rgba(255,255,255,0.2)')}
          {line(w * 0.5)}
        </div>
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        left: APP_HIGHLIGHT.x,
        top: APP_HIGHLIGHT.y - 40,
        width: APP_HIGHLIGHT.width,
        height: APP_HIGHLIGHT.height,
        boxSizing: 'border-box',
        borderRadius: 14,
        padding: 22,
        background: 'rgba(124, 92, 255, 0.12)',
        border: `1px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{fontSize: 13, letterSpacing: 1.2, color: accent, fontWeight: 700}}>NEEDS YOU</div>
      <div style={{fontSize: 22, fontWeight: 600, lineHeight: 1.25}}>Allow running the test suite?</div>
      <div style={{display: 'flex', gap: 10, marginTop: 'auto'}}>
        <div style={{padding: '8px 18px', borderRadius: 8, background: accent, fontWeight: 600}}>Allow</div>
        <div style={{padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.08)'}}>Deny</div>
      </div>
    </div>
  </div>
);

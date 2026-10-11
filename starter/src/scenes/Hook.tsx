import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, monoFamily, serifFamily} from '../brand';
import {Footage, Rect, Words} from '../kit';
import {MAC, PANE, crop} from './takes';

const line: React.CSSProperties = {fontFamily: serifFamily, fontSize: 64, fontWeight: 600, letterSpacing: -1.4, color: brand.ink, lineHeight: 1.12};

/** One pane of the take, as a floating card that lifts in at `appear`. */
const PaneCard: React.FC<{pane: Rect; at: number; appear: number; x: number; y: number; scale: number}> = ({pane, at, appear, x, y, scale}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: frame - appear, fps, config: {damping: 200}, durationInFrames: 26});
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: t, transform: `translateY(${(1 - t) * 50}px) scale(${0.94 + 0.06 * t})`}}>
      <div style={{transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <div style={{width: pane.width, height: pane.height, borderRadius: 12, overflow: 'hidden', boxShadow: '0 26px 60px rgba(20,19,16,0.18)'}}>
          <Footage src={MAC.src} at={at} crop={crop(pane)} />
        </div>
      </div>
    </div>
  );
};

// HOOK: the pain, not the logo. Agents running everywhere, and one of them quietly waiting on you.
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const waited = Math.floor(interpolate(frame, [168, 236], [0, 1399], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const clock = `${String(Math.floor(waited / 60)).padStart(2, '0')}:${String(waited % 60).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <div style={{position: 'absolute', left: 110, top: 410, width: 680}}>
        <Words text="Multiple projects. Multiple agents." start={4} exit={70} style={{...line, flexWrap: 'wrap'}} />
      </div>
      <div style={{position: 'absolute', left: 110, top: 410, width: 680}}>
        <Words text="Hard to tell what’s finished." start={80} exit={142} style={{...line, flexWrap: 'wrap'}} />
      </div>
      <div style={{position: 'absolute', left: 110, top: 410, width: 680, display: 'flex', flexDirection: 'column', gap: 4}}>
        <Words text="One needs you." start={150} style={line} />
        <Words text="Which one?" start={168} style={line} wordStyle={{fontStyle: 'italic', color: brand.alert}} />
      </div>
      <PaneCard pane={PANE.leftTop} at={24} appear={18} x={860} y={170} scale={0.84} />
      <PaneCard pane={PANE.browser} at={6} appear={28} x={1375} y={170} scale={0.556} />
      <PaneCard pane={PANE.leftBottom} at={2} appear={38} x={860} y={520} scale={0.84} />
      <PaneCard pane={PANE.leftTop} at={10} appear={48} x={1375} y={520} scale={0.84} />
      {frame > 160 ? (
        <div
          style={{
            position: 'absolute',
            left: 880,
            top: 112,
            padding: '8px 18px',
            borderRadius: 999,
            background: brand.alertSoft,
            color: brand.alert,
            fontFamily: monoFamily,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          waiting {clock}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

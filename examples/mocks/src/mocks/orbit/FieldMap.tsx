import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Droplets} from 'lucide-react';
import {Contours} from '../../fx/drawings';
import {alpha, mix, useBrand, useLook} from '../../look';

// The product: Orbit's field map, as a light app window. A satellite pass sweeps across the farm,
// colouring each field by crop health; then one field is flagged dry, with a card saying what to do.

export const WIN = {width: 1000, height: 720};
const BAR = 56;
/** The flagged field and its card, in window coordinates: what the camera pushes in to. */
export const DETAIL = {x: 262, y: 250, width: 580, height: 236};

/** Frames within the product scene. */
export const BEAT = {scan: 30, scanEnd: 92, flag: 100, card: 110};

type Field = {pts: [number, number][]; health: number; rows: number};
// Field boundaries in map coordinates (the map sits under the 56 px bar). Health 0 dry to 1 lush.
const FIELDS: Field[] = [
  {pts: [[40, 40], [260, 30], [280, 196], [50, 212]], health: 0.86, rows: 30},
  {pts: [[284, 28], [466, 40], [452, 190], [292, 196]], health: 0.7, rows: -20},
  {pts: [[492, 40], [702, 30], [712, 180], [484, 190]], health: 0.92, rows: 30},
  {pts: [[722, 30], [960, 45], [950, 208], [730, 186]], health: 0.6, rows: 70},
  {pts: [[50, 232], [270, 218], [262, 412], [60, 424]], health: 0.76, rows: -20},
  {pts: [[288, 214], [452, 208], [468, 398], [282, 412]], health: 0.12, rows: 30},
  {pts: [[486, 204], [710, 198], [702, 388], [492, 400]], health: 0.82, rows: 70},
  {pts: [[730, 204], [950, 226], [942, 418], [722, 404]], health: 0.55, rows: -20},
  {pts: [[62, 452], [300, 440], [310, 620], [70, 630]], health: 0.66, rows: 70},
  {pts: [[322, 436], [602, 424], [610, 624], [330, 632]], health: 0.9, rows: 30},
  {pts: [[622, 424], [940, 442], [930, 630], [630, 624]], health: 0.42, rows: -20},
];
const FLAGGED = 5;

const healthColour = (h: number) => (h < 0.5 ? mix('#c8642b', '#d9b65a', h / 0.5) : mix('#d9b65a', '#5f8f4e', (h - 0.5) / 0.5));
const centre = (f: Field) => ({x: f.pts.reduce((s, p) => s + p[0], 0) / 4, y: f.pts.reduce((s, p) => s + p[1], 0) / 4});

export const FieldMap: React.FC = () => {
  const look = useLook();
  const brand = useBrand();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mapH = WIN.height - BAR;
  // The satellite pass: a band of light sweeping left to right; fields colour in as it crosses them.
  const scanX = interpolate(frame, [BEAT.scan, BEAT.scanEnd], [-60, WIN.width + 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scanning = frame >= BEAT.scan && frame <= BEAT.scanEnd + 4;
  const flag = spring({frame: frame - BEAT.flag, fps, config: {damping: 200}, durationInFrames: 16});
  const pulse = frame >= BEAT.flag ? 0.5 + 0.5 * Math.sin((frame - BEAT.flag) * 0.22) : 0;
  const card = spring({frame: frame - BEAT.card, fps, config: {damping: 200}, durationInFrames: 22});
  const moisture = interpolate(frame, [BEAT.card + 6, BEAT.card + 30], [0, 14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f7f4ec', fontFamily: look.fonts.body, color: '#1d1b16'}}>
      {/* The app bar. */}
      <div style={{height: BAR, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderBottom: '1px solid rgba(29, 27, 22, 0.1)'}}>
        <div style={{display: 'flex', gap: 8}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
          ))}
        </div>
        <Img src={staticFile(brand.logo)} style={{width: 28, height: 28, marginLeft: 10}} />
        <div style={{fontSize: 19, fontWeight: 700}}>Valley Farm</div>
        <div style={{fontSize: 17, color: '#6b675c'}}>· 11 fields · 186 ha</div>
        <div style={{flex: 1}} />
        <div style={{fontFamily: look.fonts.mono, fontSize: 15, color: '#4d493f', padding: '6px 12px', borderRadius: 999, background: 'rgba(29, 27, 22, 0.06)'}}>
          Pass #2184 · today 06:42
        </div>
      </div>
      {/* The map. */}
      <div style={{position: 'absolute', left: 0, top: BAR, width: WIN.width, height: mapH, overflow: 'hidden', background: '#e9e3cf'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 0.55}}>
          <Contours width={WIN.width} height={mapH} levels={9} start={0} frames={1} seed={4} color="#b9ad8a" />
        </div>
        <svg width={WIN.width} height={mapH} style={{position: 'absolute', inset: 0}}>
          <defs>
            {[30, -20, 70].map((r) => (
              <pattern key={r} id={`rows${r}`} width={9} height={9} patternUnits="userSpaceOnUse" patternTransform={`rotate(${r})`}>
                <line x1={0} y1={0} x2={0} y2={9} stroke="rgba(30, 40, 20, 0.13)" strokeWidth={3} />
              </pattern>
            ))}
          </defs>
          {FIELDS.map((f, i) => {
            const c = centre(f);
            const lit = interpolate(scanX, [c.x - 40, c.x + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const d = `M ${f.pts.map((p) => p.join(' ')).join(' L ')} Z`;
            return (
              <g key={i}>
                <path d={d} fill="#ddd5bb" stroke="#f7f1e1" strokeWidth={5} strokeLinejoin="round" />
                <path d={d} fill={healthColour(f.health)} opacity={lit * 0.92} />
                <path d={d} fill={`url(#rows${f.rows})`} />
                {i === FLAGGED && frame >= BEAT.flag ? (
                  <path d={d} fill="none" stroke={look.alert} strokeWidth={5 + 3 * pulse} strokeLinejoin="round" opacity={flag} />
                ) : null}
              </g>
            );
          })}
          {/* A river and a farm track. */}
          <path d="M 0 428 C 180 444, 380 410, 620 424 S 880 446, 1000 430" fill="none" stroke="#86acc9" strokeWidth={9} strokeLinecap="round" />
          <path d="M 476 0 L 474 664" stroke="#f7f1e1" strokeWidth={7} />
          {scanning ? (
            <g>
              <rect x={scanX - 70} y={0} width={70} height={mapH} fill={alpha(look.accent, 0.12)} />
              <line x1={scanX} y1={0} x2={scanX} y2={mapH} stroke={look.accent} strokeWidth={3} />
            </g>
          ) : null}
        </svg>
        {/* The legend. */}
        <div style={{position: 'absolute', left: 20, bottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(247, 244, 236, 0.94)', boxShadow: '0 4px 14px rgba(29, 27, 22, 0.1)'}}>
          <div style={{fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b675c'}}>Crop health</div>
          <div style={{marginTop: 8, width: 200, height: 10, borderRadius: 5, background: `linear-gradient(90deg, #c8642b, #d9b65a, #5f8f4e)`}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b675c', marginTop: 4}}>
            <span>Dry</span>
            <span>Thriving</span>
          </div>
        </div>
      </div>
      {/* The card for the flagged field. */}
      <div
        style={{
          position: 'absolute',
          left: 498,
          top: 268,
          width: 330,
          padding: '18px 20px',
          borderRadius: 14,
          background: '#ffffff',
          boxShadow: '0 18px 40px rgba(29, 27, 22, 0.2), 0 0 0 1px rgba(29, 27, 22, 0.06)',
          opacity: card,
          transform: `translateY(${(1 - card) * 16}px) scale(${0.96 + 0.04 * card})`,
          transformOrigin: '0% 50%',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: look.alert, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          <div style={{width: 9, height: 9, borderRadius: 5, background: look.alert}} />
          Dry patch
        </div>
        <div style={{fontSize: 24, fontWeight: 700, marginTop: 6}}>Field 6 · Wheat</div>
        <div style={{fontSize: 16, color: '#6b675c', marginTop: 2}}>3.1 ha at the north edge</div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 14, color: '#4d493f'}}>
          <span>Soil moisture</span>
          <span style={{fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{Math.round(moisture)}%</span>
        </div>
        <div style={{marginTop: 6, height: 8, borderRadius: 4, background: 'rgba(29, 27, 22, 0.08)'}}>
          <div style={{width: `${moisture * 2.5}%`, height: 8, borderRadius: 4, background: look.alert}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '9px 12px', borderRadius: 10, background: alpha(look.accent, 0.12), color: look.accentText, fontSize: 17, fontWeight: 700}}>
          <Droplets size={18} strokeWidth={2.4} />
          Water within 2 days
        </div>
      </div>
    </div>
  );
};

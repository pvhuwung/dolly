import React, {useMemo} from 'react';
import {ease} from '../../../kit';
import {alpha, mix} from '../../../look';
import type {Demo} from '../../types';
import {InArea, Wobble, noise, smooth, useArea, useClock, usePalette, useUid, type Palette, type Pt} from '../_shared';

/**
 * A wash of watercolour behind content: a brushstroke painted left to right (`kind="stroke"`),
 * or a round pool bleeding out from the middle (`kind="pool"`), with ragged edges where the paint
 * pooled. Children sit on top, centred: a headline, a number, a logo.
 *
 *   <Watercolor width={760} height={170} start={4}><h1>Drawn with code.</h1></Watercolor>
 */
export const Watercolor: React.FC<{
  width: number;
  height: number;
  kind?: 'stroke' | 'pool';
  color?: string;
  start?: number;
  frames?: number;
  seed?: number;
  palette?: Partial<Palette>;
  children?: React.ReactNode;
}> = ({width, height, kind = 'stroke', color, start = 0, frames = 28, seed = 1, palette, children}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const uid = useUid();
  const paint = color ?? mix(p.accent, p.sun, 0.2);
  const shape = useMemo(() => {
    if (kind === 'pool') {
      const pts = Array.from({length: 14}, (_, k) => {
        const a = (k / 14) * Math.PI * 2;
        const r = 0.42 + (noise(`pool-${seed}`, k * 0.9) - 0.5) * 0.16;
        return {x: width / 2 + Math.cos(a) * r * width, y: height / 2 + Math.sin(a) * r * height};
      });
      return smooth(pts, true);
    }
    const N = 12;
    const top: Pt[] = [];
    const bottom: Pt[] = [];
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const taper = Math.min(1, s / 0.08, (1 - s) / 0.1) ** 0.7;
      const mid = height / 2 + (noise(`wm-${seed}`, s * 3) - 0.5) * height * 0.14;
      const half = height * 0.36 * (0.35 + 0.65 * taper) * (0.85 + noise(`wh-${seed}`, s * 5) * 0.3);
      top.push({x: s * width, y: mid - half});
      bottom.push({x: s * width, y: mid + half * (0.9 + noise(`wb-${seed}`, s * 4) * 0.2)});
    }
    return smooth([...top, ...bottom.reverse()], true);
  }, [kind, width, height, seed]);
  const t = ramp(start, frames, ease.out);
  const reveal =
    kind === 'pool' ? (
      <circle cx={width / 2} cy={height / 2} r={t * Math.hypot(width, height) * 0.6} style={{fill: '#fff'}} />
    ) : (
      <rect x={-20} y={-20} width={(width + 60) * t} height={height + 40} style={{fill: '#fff'}} />
    );
  return (
    <div style={{position: 'relative', width, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Wobble id={`${uid}w`} seed={seed} scale={16} frequency={0.03} />
          <Wobble id={`${uid}m`} seed={seed + 4} scale={30} frequency={0.05} />
          <mask id={`${uid}k`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={width + 120} height={height + 120}>
            <g filter={`url(#${uid}m)`}>{reveal}</g>
          </mask>
        </defs>
        {t > 0 ? (
          <g mask={`url(#${uid}k)`} filter={`url(#${uid}w)`}>
            <path d={shape} style={{fill: alpha(paint, 0.42)}} />
            <path d={shape} transform={`translate(${width * 0.03} ${height * 0.06}) scale(0.94)`} style={{fill: alpha(paint, 0.24)}} />
            <path d={shape} style={{fill: 'none', stroke: alpha(mix(paint, p.deep, 0.2), 0.42), strokeWidth: 3}} />
          </g>
        ) : null}
      </svg>
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

const WatercolorDemo: React.FC = () => {
  const a = useArea();
  const look = a.look;
  const w = Math.min(a.w * 0.95, 1180);
  return (
    <InArea>
      <Watercolor width={Math.round(w)} height={Math.round(look.size * (look.tall ? 4 : 3))} start={4} frames={30}>
        <div style={{...look.headline, fontSize: Math.round(look.size * 1.2), textAlign: 'center', padding: '0 0.4em', color: look.dark ? '#f6f1e5' : look.ink}}>
          {/* The accent phrase keeps its weight or slant but not its colour, which is the wash's. */}
          Drawn <span style={{...look.emphasis, color: 'inherit', textShadow: 'none'}}>with code.</span>
        </div>
      </Watercolor>
    </InArea>
  );
};

export const demos: Demo[] = [{name: 'Watercolour wash', code: '<Watercolor width={760} height={170}>{headline}</Watercolor>', seconds: 2.5, hero: 50, Component: WatercolorDemo}];

import React, {useMemo} from 'react';
import {ease} from '../../../kit';
import {alpha, mix} from '../../../look';
import {fbm, n1, useClock, usePalette, type Palette, type Pt} from '../_shared';

/**
 * A board of hexagons coloured by a heat field: pale cells at the edges, warming to deep ones
 * around a hot spot (`origin`, 0 to 1 of the box). The colour spreads out from the hot spot in a
 * wave from `start`. For a heat map, a spread, a "where it happens" moment.
 *
 *   <HexField width={700} height={520} origin={{x: 0.6, y: 0.55}} start={8} />
 */
export const HexField: React.FC<{
  /** Its width in px. */
  width: number;
  /** Its height in px. */
  height: number;
  /** Size of each hexagon, centre to corner, in px (default 30). */
  radius?: number;
  /** The hot spot the colour spreads from, in fractions of the box (default {x: 0.62, y: 0.55}). */
  origin?: Pt;
  /** Frame it starts on, counted from the start of its scene (default 0). */
  start?: number;
  /** Frames it takes to draw (default 60). */
  frames?: number;
  /** Changes the random layout; the same seed always draws the same. */
  seed?: number;
  /** Overrides some of the drawing's colours. */
  palette?: Partial<Palette>;
}> = ({width, height, radius = 30, origin = {x: 0.62, y: 0.55}, start = 0, frames = 60, seed = 1, palette}) => {
  const p = usePalette(palette);
  const {ramp} = useClock();
  const ramps = [mix(p.paper, '#ffffff', 0.4), mix(p.sun, '#fff8e6', 0.55), mix(p.sun, '#fff8e6', 0.15), mix(p.sun, p.warm, 0.5), p.warm, mix(p.warm, p.deep, 0.45), mix(p.deep, p.rose, 0.18), p.deep];
  const cells = useMemo(() => {
    const w = Math.sqrt(3) * radius;
    const h = 1.5 * radius;
    const ox = origin.x * width;
    const oy = origin.y * height;
    const far = Math.hypot(Math.max(ox, width - ox), Math.max(oy, height - oy));
    const out = [];
    for (let row = -1; row * h < height + radius; row++) {
      for (let col = -1; col * w < width + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0);
        const y = row * h;
        const dist = Math.hypot(x - ox, y - oy) / far;
        const heat = 0.62 * (1 - dist) ** 1.4 + 0.5 * (fbm(`hex-${seed}`, x * 0.006, y * 0.006) - 0.5) + 0.12;
        const bin = Math.max(0, Math.min(ramps.length - 1, Math.floor(heat * ramps.length * 1.25)));
        const pts = Array.from({length: 6}, (_, k) => {
          const a = (Math.PI / 3) * k - Math.PI / 6;
          return `${n1(x + Math.cos(a) * (radius - 1.5))},${n1(y + Math.sin(a) * (radius - 1.5))}`;
        }).join(' ');
        out.push({pts, dist, bin, x, y});
      }
    }
    return out;
    // ramps are derived from the palette; the geometry depends only on these.
  }, [width, height, radius, origin.x, origin.y, seed]);
  const wave = ramp(start, frames, ease.out) * 1.25;
  return (
    <svg width={width} height={height} style={{display: 'block'}}>
      {cells.map((c, i) => {
        const t = Math.max(0, Math.min(1, (wave - c.dist) / 0.18));
        if (t <= 0) return null;
        const fill = ramps[c.bin];
        return (
          <polygon
            key={i}
            points={c.pts}
            transform={`translate(${n1(c.x * (1 - (0.55 + 0.45 * t)))} ${n1(c.y * (1 - (0.55 + 0.45 * t)))}) scale(${0.55 + 0.45 * t})`}
            style={{fill, stroke: c.bin === 0 ? alpha(p.ink, 0.18) : alpha(mix(fill, p.deep, 0.35), 0.5), strokeWidth: 1.2, opacity: Math.min(1, t * 1.5)}}
          />
        );
      })}
    </svg>
  );
};

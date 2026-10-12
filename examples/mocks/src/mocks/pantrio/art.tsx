import React from 'react';

// Pantrio's drawings, all flat SVG: the inside of a fridge as the camera sees it, and the dishes.

/** What the scanner finds: where each item sits in the viewfinder, and how it's labelled. */
export const FOUND = [
  {name: 'Milk', count: '', color: '#3b6fd8', box: {x: 32, y: 34, width: 82, height: 172}},
  {name: 'Eggs', count: '×4', color: '#f2d7a6', box: {x: 132, y: 124, width: 206, height: 84}},
  {name: 'Tomatoes', count: '×3', color: '#e23b2a', box: {x: 40, y: 332, width: 192, height: 74}},
  {name: 'Feta', count: '', color: '#2f6fb5', box: {x: 226, y: 310, width: 134, height: 96}},
  {name: 'Spinach', count: '', color: '#2f8f46', box: {x: 28, y: 460, width: 162, height: 136}},
  {name: 'Lemon', count: '', color: '#f2c618', box: {x: 192, y: 524, width: 88, height: 70}},
];

const Shelf: React.FC<{y: number}> = ({y}) => (
  <g>
    <rect x={18} y={y + 10} width={356} height={16} fill="rgba(40, 60, 70, 0.10)" />
    <rect x={14} y={y} width={364} height={10} rx={2} fill="#eef5f7" />
    <rect x={14} y={y + 8} width={364} height={3} fill="#9fb3bb" />
  </g>
);

const Tomato: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#e23b2a" />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.35} rx={r * 0.32} ry={r * 0.2} fill="#ff8a76" opacity={0.6} />
    <path
      d={`M${x} ${y - r * 0.95} l${r * 0.28} ${-r * 0.12} l${-r * 0.12} ${r * 0.22} l${r * 0.3} ${r * 0.06} l${-r * 0.34} ${r * 0.08} l${-r * 0.12} ${r * 0.2} l${-r * 0.1} ${-r * 0.24} l${-r * 0.32} ${-r * 0.02} l${r * 0.28} ${-r * 0.14} z`}
      fill="#3f9b4a"
    />
  </g>
);

/** The fridge, 392 x 652: three glass shelves of food under a cool light. */
export const Fridge: React.FC = () => (
  <svg width={392} height={652} viewBox="0 0 392 652" style={{display: 'block'}}>
    <defs>
      <linearGradient id="pantrio-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f8f9" />
        <stop offset="1" stopColor="#c9d4d9" />
      </linearGradient>
      <radialGradient id="pantrio-light" cx="0.5" cy="0" r="0.9">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={392} height={652} fill="url(#pantrio-wall)" />
    <polygon points="0,0 22,16 22,640 0,652" fill="#b3c0c6" />
    <polygon points="392,0 370,16 370,640 392,652" fill="#b3c0c6" />
    <rect width={392} height={300} fill="url(#pantrio-light)" />

    {/* Top shelf: milk and eggs. */}
    <rect x={44} y={58} width={62} height={142} rx={14} fill="#ffffff" stroke="#dfe6e9" strokeWidth={2} />
    <rect x={58} y={40} width={34} height={24} rx={6} fill="#3b6fd8" />
    <rect x={44} y={118} width={62} height={34} fill="#3b6fd8" opacity={0.92} />
    <rect x={140} y={164} width={190} height={36} rx={6} fill="#d8c19f" />
    {[168, 214, 260, 306].map((cx) => (
      <ellipse key={cx} cx={cx} cy={158} rx={20} ry={25} fill="#fff6e6" stroke="#e7d6bb" strokeWidth={2} />
    ))}
    <Shelf y={200} />

    {/* Middle shelf: tomatoes and feta. */}
    <Tomato x={80} y={372} r={30} />
    <Tomato x={140} y={377} r={25} />
    <Tomato x={196} y={373} r={29} />
    <path d="M236 340 L350 340 L342 400 L244 400 Z" fill="#2f6fb5" />
    <rect x={246} y={322} width={94} height={24} rx={5} fill="#fbfaf4" />
    <rect x={236} y={336} width={114} height={8} fill="#24568d" />
    <Shelf y={400} />

    {/* Bottom shelf: spinach, a lemon, a jar. */}
    <rect x={36} y={472} width={146} height={118} rx={18} fill="#2f8f46" />
    {[
      [70, 510],
      [112, 498],
      [150, 520],
      [92, 548],
      [136, 556],
    ].map(([cx, cy]) => (
      <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={22} ry={13} fill="#5cbc68" transform={`rotate(-24 ${cx} ${cy})`} />
    ))}
    <rect x={72} y={576} width={74} height={10} rx={3} fill="#ffffff" opacity={0.85} />
    <ellipse cx={236} cy={562} rx={36} ry={27} fill="#f2c618" />
    <ellipse cx={224} cy={552} rx={12} ry={7} fill="#fff3a8" opacity={0.7} />
    <rect x={302} y={512} width={52} height={78} rx={8} fill="#c4682a" />
    <rect x={298} y={502} width={60} height={16} rx={4} fill="#3a3530" />
    <Shelf y={590} />
  </svg>
);

/** Shakshuka from above: eggs in a red sauce, in a black pan. */
export const Shakshuka: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect width={120} height={120} rx={18} fill="#f6e5d6" />
    <circle cx={60} cy={60} r={46} fill="#2b1a17" />
    <circle cx={60} cy={60} r={39} fill="#d63c25" />
    <circle cx={46} cy={50} r={12} fill="#fff8ef" />
    <circle cx={47} cy={51} r={5.5} fill="#ffb627" />
    <circle cx={72} cy={70} r={11} fill="#fff8ef" />
    <circle cx={71} cy={70} r={5} fill="#ffb627" />
    {[
      [70, 44],
      [44, 74],
      [82, 54],
      [58, 84],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={2.6} fill="#4fa35a" />
    ))}
  </svg>
);

/** Spinach and feta pasta in a white bowl. */
export const Pasta: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect width={120} height={120} rx={18} fill="#e9eedf" />
    <circle cx={60} cy={60} r={46} fill="#ffffff" />
    <circle cx={60} cy={60} r={36} fill="#f3df9d" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${34 + i * 3} ${44 + i * 7} q 26 -14 52 2`} fill="none" stroke="#e7c86c" strokeWidth={4} strokeLinecap="round" />
    ))}
    <ellipse cx={48} cy={52} rx={9} ry={5} fill="#3f9b4a" transform="rotate(-30 48 52)" />
    <ellipse cx={72} cy={66} rx={9} ry={5} fill="#3f9b4a" transform="rotate(20 72 66)" />
    <rect x={62} y={46} width={8} height={8} rx={1.5} fill="#fbfaf4" />
    <rect x={50} y={68} width={7} height={7} rx={1.5} fill="#fbfaf4" />
  </svg>
);

/** A folded omelette with a lemon wedge. */
export const Omelette: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect width={120} height={120} rx={18} fill="#fbeedc" />
    <circle cx={60} cy={60} r={46} fill="#ffffff" />
    <path d="M24 66 A 36 30 0 0 1 96 66 Z" fill="#f6c94c" />
    <path d="M30 66 A 30 22 0 0 1 90 66" fill="none" stroke="#e8b234" strokeWidth={3} />
    <circle cx={50} cy={56} r={2.5} fill="#4fa35a" />
    <circle cx={68} cy={52} r={2.5} fill="#4fa35a" />
    <path d="M70 84 L92 76 A 12 12 0 0 1 84 96 Z" fill="#f2c618" />
  </svg>
);

/** A coloured dot standing for an ingredient, on the stickers and chips. */
export const Dot: React.FC<{color: string; size: number}> = ({color, size}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: color, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)', flexShrink: 0}} />
);

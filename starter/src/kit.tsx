import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// dolly's 3D kit, in one file so it can be copied into any Remotion project.
//
// It's CSS 3D set up like a film set: a Stage holds the camera, Layers place things in the world,
// and you move the camera, not the things. Axes are CSS's: x right, y DOWN, z toward the viewer,
// in px of the video.

// ---------------------------------------------------------------------------------------------
// Keyframes

export type Ease = (t: number) => number;

/** Arrivals decelerate (`out`), exits accelerate (`in`), moves between two holds do both. */
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  linear: Easing.linear,
};

/**
 * Values over time. Each key is `[frame, {values}, ease]`, and its ease shapes the move INTO it.
 * A key sets only the values it names: `[60, {yaw: 0}]` leaves `dolly` to the keys that name it.
 * Before its first key a value holds its first setting, after its last key its last.
 *
 *   const camera = animate(frame, [[0, {yaw: -30, dolly: -900}], [75, {yaw: 0, dolly: 0}, ease.out]]);
 */
export const animate = <K extends string>(
  frame: number,
  keys: readonly (readonly [frame: number, values: Partial<Record<K, number>>, ease?: Ease])[],
): Record<K, number> => {
  const out = {} as Record<K, number>;
  const names = new Set(keys.flatMap(([, values]) => Object.keys(values) as K[]));
  for (const name of names) {
    const track = keys.filter(([, values]) => values[name] !== undefined);
    let value = track[0][1][name] as number;
    for (let i = 1; i < track.length; i++) {
      const [f0, a] = track[i - 1];
      const [f1, b, easing = ease.inOut] = track[i];
      if (frame >= f1) {
        value = b[name] as number;
        continue;
      }
      if (frame > f0) value = interpolate(frame, [f0, f1], [a[name] as number, b[name] as number], {easing});
      break;
    }
    out[name] = value;
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// Stage and camera

export type Camera = {
  /** The point the camera looks at and orbits around. */
  x: number;
  y: number;
  z: number;
  /** Degrees. + swings the camera right around the target, so you see more of its right side. */
  yaw: number;
  /** Degrees. + raises the camera so it looks down on the target. */
  pitch: number;
  /** Px toward the target. 0 is the rest distance; lens / 2 makes the target twice as big. */
  dolly: number;
};

const REST: Camera = {x: 0, y: 0, z: 0, yaw: 0, pitch: 0, dolly: 0};
const CameraContext = createContext<Camera>(REST);
const preserve3d: React.CSSProperties = {transformStyle: 'preserve-3d'};

/**
 * One shot: a lens, a camera, and the world inside it. `lens` is the CSS perspective in px: ~1000 is
 * wide and dramatic, ~1800 a natural product shot, 3000+ flat telephoto.
 */
export const Stage: React.FC<{
  camera?: Partial<Camera>;
  lens?: number;
  background?: string;
  font?: string;
  children: React.ReactNode;
}> = ({camera, lens = 1800, background, font = 'system-ui, sans-serif', children}) => {
  const c = {...REST, ...camera};
  // Read right to left: bring the target to the centre, orbit around it, then move toward it.
  const transform =
    `translateZ(${c.dolly}px) rotateX(${-c.pitch}deg) rotateY(${-c.yaw}deg) ` +
    `translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`;
  return (
    <AbsoluteFill style={{perspective: lens, background, fontFamily: font, overflow: 'hidden'}}>
      <CameraContext.Provider value={c}>
        <AbsoluteFill style={{...preserve3d, transform}}>{children}</AbsoluteFill>
      </CameraContext.Provider>
    </AbsoluteFill>
  );
};

/**
 * Puts its child's CENTRE at (x, y, z). `ry` + turns it to face right, `rx` + leans it back
 * (90 lies flat, like a floor). Layers nest: a Layer inside a Layer moves with it.
 *
 * Never put opacity, filter, overflow: hidden, mask or clip-path on a Layer or its wrapper: CSS
 * flattens those into a 2D picture and the children lose their depth. Put them on content inside.
 */
export const Layer: React.FC<{
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  children: React.ReactNode;
}> = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, children}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      ...preserve3d,
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
    }}
  >
    <div style={{position: 'absolute', width: 'max-content', ...preserve3d, transform: 'translate(-50%, -50%)'}}>
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------
// Things to put in the world

/**
 * A desktop window, a phone, or a bare card, with a soft shadow and a glare that slides as the
 * camera turns. `width` and `height` are the OUTER size; the window's title bar is 40px tall and
 * the phone's bezel 14px. A recording of a real window already has its own title bar: show it in
 * `frame="none"`.
 */
export const Screen: React.FC<{
  width: number;
  height: number;
  frame?: 'window' | 'phone' | 'none';
  title?: string;
  radius?: number;
  background?: string;
  /** 0 to 1. */
  shadow?: number;
  /** 0 to 1. */
  glare?: number;
  children?: React.ReactNode;
}> = ({width, height, frame = 'window', title, radius = frame === 'phone' ? 64 : 14, background = '#0d1117', shadow = 1, glare = 1, children}) => {
  const camera = useContext(CameraContext);
  const bezel = frame === 'phone' ? 14 : 0;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: frame === 'phone' ? '#050505' : background,
        boxShadow:
          `0 ${50 * shadow}px ${140 * shadow}px rgba(0,0,0,${0.55 * shadow}), ` +
          `0 ${12 * shadow}px ${30 * shadow}px rgba(0,0,0,${0.35 * shadow}), inset 0 0 0 1px rgba(255,255,255,0.1)`,
      }}
    >
      {frame === 'window' ? (
        <div
          style={{
            position: 'relative',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 16px',
            background: 'rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.55)'}}>
            {title}
          </div>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: bezel,
          right: bezel,
          bottom: bezel,
          top: frame === 'window' ? 40 : bezel,
          overflow: 'hidden',
          borderRadius: bezel ? radius - bezel : 0,
          background,
        }}
      >
        {children}
      </div>
      {frame === 'phone' ? (
        <div style={{position: 'absolute', top: 28, left: '50%', width: 120, height: 34, marginLeft: -60, borderRadius: 17, background: '#000'}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: glare,
          backgroundImage:
            'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.1) 47%, rgba(255,255,255,0.03) 53%, transparent 62%)',
          backgroundSize: '300% 100%',
          backgroundPosition: `${50 - camera.yaw * 2.5 - camera.pitch}% 0`,
        }}
      />
    </div>
  );
};

/**
 * A recording or an image from public/, filling its parent (usually a Screen). `at` is where to
 * start in the recording, in seconds; `speed` 2 plays it at double speed, to get through waits.
 * `crop` shows only part of it, in the recording's own pixels: one window out of a screen take.
 */
export const Footage: React.FC<{src: string; at?: number; speed?: number; crop?: Rect; fit?: 'cover' | 'contain'}> = ({
  src,
  at = 0,
  speed = 1,
  crop,
  fit = 'cover',
}) => {
  const {fps} = useVideoConfig();
  const style = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    display: 'block',
    objectViewBox: crop ? `xywh(${crop.x}px ${crop.y}px ${crop.width}px ${crop.height}px)` : undefined,
  } as React.CSSProperties;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(src) ? (
    <Img src={staticFile(src)} style={style} />
  ) : (
    <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(at * fps)} playbackRate={speed} muted style={style} />
  );
};

/**
 * An image from public/ (a logo, an icon) with real thickness: `depth` copies stacked 1px apart,
 * the back ones darker, so its sides show as it turns. `shine` (-1 to 1) slides a highlight
 * across the front: tie it to the turn, like `shine={ry / 30}`.
 */
export const Extrude: React.FC<{src: string; size: number; depth?: number; side?: number; shine?: number}> = ({
  src,
  size,
  depth = 30,
  side = 0.6,
  shine = 0,
}) => {
  const mask = `url("${staticFile(src)}") center / contain no-repeat`;
  return (
    <div style={{position: 'relative', width: size, height: size, ...preserve3d}}>
      {Array.from({length: depth}, (_, i) => (
        <Img
          key={i}
          src={staticFile(src)}
          style={{
            position: 'absolute',
            inset: 0,
            width: size,
            height: size,
            transform: `translateZ(${i - depth + 1}px)`,
            // The sides get darker toward the back, which reads as light falling on a solid.
            filter: i === depth - 1 ? undefined : `brightness(${side * (0.6 + (0.4 * i) / depth)})`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          mask,
          WebkitMask: mask,
          backgroundImage: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)',
          backgroundSize: '300% 100%',
          backgroundPosition: `${50 - shine * 50}% 0`,
          mixBlendMode: 'soft-light',
        }}
      />
    </div>
  );
};

/** A grid floor that fades with distance. When the camera moves, it's what makes the move read as 3D. */
export const Floor: React.FC<{y?: number; color?: string}> = ({y = 460, color = 'rgba(255,255,255,0.07)'}) => (
  <Layer y={y} rx={90}>
    <div
      style={{
        width: 5000,
        height: 5000,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(circle, black 0%, transparent 45%)',
        WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 45%)',
      }}
    />
  </Layer>
);

/**
 * Kinetic type: each word swings up out of the page, `stagger` frames apart, starting at `start`.
 * `exit` is the frame they start to leave. Keep a line to 2-6 words.
 */
export const Words: React.FC<{text: string; start?: number; stagger?: number; exit?: number; style?: React.CSSProperties}> = ({
  text,
  start = 0,
  stagger = 4,
  exit,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: '0.28em', perspective: 900, ...style}}>
      {text.split(' ').map((word, i) => {
        const t = spring({frame: frame - start - i * stagger, fps, config: {damping: 200}, durationInFrames: 24});
        const out = exit === undefined ? 0 : spring({frame: frame - exit - i * 2, fps, config: {damping: 200}, durationInFrames: 14});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transformOrigin: '50% 100%',
              transform: `translateY(${(1 - t) * 0.35 - out * 0.2}em) rotateX(${(t - 1) * 80 + out * 60}deg)`,
              opacity: Math.max(0, t - out),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Aiming

export type Rect = {x: number; y: number; width: number; height: number};

/**
 * The camera values that push in on `rect` (px from the screen's outer top-left, title bar
 * included) until it fills `fill` of the video. `screen` is the screen's size plus its Layer's
 * x, y, z and scale. Exact while the camera faces the screen square, which is the rule for
 * reading anyway. Footage softens past its own pixels: capture at 2x for close-ups.
 */
export const focusOn = ({
  rect,
  screen,
  video,
  lens,
  fill = 0.8,
}: {
  rect: Rect;
  screen: {width: number; height: number; x?: number; y?: number; z?: number; scale?: number};
  video: {width: number; height: number};
  lens: number;
  fill?: number;
}) => {
  const s = screen.scale ?? 1;
  const zoom = Math.min((fill * video.width) / (rect.width * s), (fill * video.height) / (rect.height * s));
  return {
    x: (screen.x ?? 0) + (rect.x + rect.width / 2 - screen.width / 2) * s,
    y: (screen.y ?? 0) + (rect.y + rect.height / 2 - screen.height / 2) * s,
    z: screen.z ?? 0,
    // Something at the target's depth looks lens / (lens - dolly) times bigger: solve for zoom.
    dolly: lens * (1 - 1 / zoom),
  };
};

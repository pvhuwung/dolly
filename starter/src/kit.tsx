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

/**
 * A shot's camera: keyed moves plus a slow drift ADDED on top over the whole shot, so the camera
 * never stops dead and never stops and restarts.
 *
 *   const camera = useShot([[0, {dolly: -300}], [60, {dolly: 0}, ease.out]], {dolly: 60, yaw: 3});
 */
export const useShot = (
  keys: readonly (readonly [frame: number, values: Partial<Camera>, ease?: Ease])[],
  drift: Partial<Camera> = {},
): Camera => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const keyed = {...REST, ...animate(frame, keys)};
  const p = frame / durationInFrames;
  const out = {...keyed};
  for (const k of Object.keys(drift) as (keyof Camera)[]) out[k] = keyed[k] + (drift[k] ?? 0) * p;
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
 * the phone's bezel 12px. A recording of a real window already has its own title bar, so show it in
 * `frame="none"`; a Simulator recording already has its Dynamic Island.
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
}> = ({width, height, frame = 'window', title, radius = frame === 'phone' ? 66 : 14, background = '#0d1117', shadow = 1, glare = 1, children}) => {
  const camera = useContext(CameraContext);
  const bezel = frame === 'phone' ? 12 : 0;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: frame === 'phone' ? '#1c1c1e' : background,
        boxShadow:
          `0 ${30 * shadow}px ${80 * shadow}px rgba(20,19,16,${0.18 * shadow}), ` +
          `0 ${8 * shadow}px ${22 * shadow}px rgba(20,19,16,${0.08 * shadow}), inset 0 0 0 1.5px rgba(255,255,255,0.12)`,
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
 * A region of a take as a floating card. `region` is in the take's points (what observee and the
 * screen report); `scale` is the take's pixels per point: 2 for a Retina screen take. Children are
 * laid over the card in the region's own points (a Callout, a Tap). `frame="window"` adds a title
 * bar, for a web page cut from a browser.
 */
export const Clip: React.FC<{
  src: string;
  at?: number;
  speed?: number;
  region: Rect;
  scale?: number;
  frame?: 'none' | 'window';
  title?: string;
  radius?: number;
  children?: React.ReactNode;
}> = ({src, at, speed, region, scale = 2, frame = 'none', title, radius = 16, children}) => (
  <Screen frame={frame} title={title} width={region.width} height={region.height + (frame === 'window' ? 40 : 0)} radius={radius} glare={0.35}>
    <Footage
      src={src}
      at={at}
      speed={speed}
      crop={{x: region.x * scale, y: region.y * scale, width: region.width * scale, height: region.height * scale}}
    />
    {children}
  </Screen>
);

/** A grid floor that fades with distance. When the camera moves, it's what makes the move read as 3D. */
export const Floor: React.FC<{y?: number; color?: string}> = ({y = 460, color = 'rgba(128,128,128,0.2)'}) => (
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
 * `exit` is the frame they start to leave. `wordStyle` applies to each word (an italic accent).
 * Keep a line to 2-6 words.
 */
export const Words: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  exit?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}> = ({text, start = 0, stagger = 6, exit, style, wordStyle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: '0.28em', perspective: 900, ...style}}>
      {text.split(' ').map((word, i) => {
        const t = spring({frame: frame - start - i * stagger, fps, config: {damping: 200}, durationInFrames: 32});
        const out =
          exit === undefined ? 0 : spring({frame: frame - exit - i * Math.ceil(stagger / 2), fps, config: {damping: 200}, durationInFrames: 14});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transformOrigin: '50% 100%',
              transform: `translateY(${(1 - t) * 0.35 - out * 0.2}em) rotateX(${(t - 1) * 80 + out * 60}deg)`,
              opacity: Math.max(0, t - out),
              ...wordStyle,
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
 * The camera values that frame `rect` until it fills `fill` of the video. `rect` is measured from
 * the top-left of a card of `size` (a Screen or a Clip); `layer` is where that card sits on the
 * stage, if not at the origin. `top` keeps that many px at the top of the frame free (for a
 * caption) and centres the rect in the space below. Exact while the camera faces the card square.
 *
 * Don't zoom past the footage's own pixels: a 2x take softens beyond about 2x its points.
 */
export const focusOn = ({
  rect,
  size,
  video,
  lens,
  fill = 0.8,
  top = 0,
  layer = {},
}: {
  rect: Rect;
  size: {width: number; height: number};
  video: {width: number; height: number};
  lens: number;
  fill?: number;
  top?: number;
  layer?: {x?: number; y?: number; z?: number; scale?: number};
}) => {
  const s = layer.scale ?? 1;
  const zoom = Math.min((fill * video.width) / (rect.width * s), (fill * (video.height - top)) / (rect.height * s));
  return {
    x: (layer.x ?? 0) + (rect.x + rect.width / 2 - size.width / 2) * s,
    // Aim above the rect's centre by half the band, so the rect sits in the middle of what's left.
    y: (layer.y ?? 0) + (rect.y + rect.height / 2 - size.height / 2) * s - top / 2 / zoom,
    z: layer.z ?? 0,
    // Something at the target's depth looks lens / (lens - dolly) times bigger: solve for zoom.
    dolly: lens * (1 - 1 / zoom),
  };
};

/** The whole of a card of `size`: what `focusOn` frames when you want all of it. */
export const whole = (size: {width: number; height: number}): Rect => ({x: 0, y: 0, width: size.width, height: size.height});

/** A rect inside a region, measured from the region's top-left: for Callouts and push-ins in a Clip. */
export const within = (region: Rect, r: Rect): Rect => ({x: r.x - region.x, y: r.y - region.y, width: r.width, height: r.height});

// ---------------------------------------------------------------------------------------------
// Moves: ready-made camera keyframes for useShot. Each takes framings from focusOn (or any
// camera values) and a `start` frame, so moves can follow one another in one shot:
//
//   const wide = focusOn({rect: whole(SIZE), size: SIZE, video, lens: 1800, top: SAFE_TOP});
//   const card = focusOn({rect: DETAIL, size: SIZE, video, lens: 1800, fill: 0.5, top: SAFE_TOP});
//   const camera = useShot([...moves.tiltIn(wide), ...moves.focus(wide, card, {start: 70})], {dolly: 40});

type Key = readonly [frame: number, values: Partial<Camera>, ease?: Ease];
type Pose = Partial<Camera>;
const plus = (p: Pose, d: Pose): Pose => {
  const out: Pose = {...p};
  for (const k of Object.keys(d) as (keyof Camera)[]) out[k] = (p[k] ?? 0) + (d[k] ?? 0);
  return out;
};

export const moves = {
  /** Arrive from far back, turned and from above, and settle on `at`. The classic opener. */
  tiltIn: (at: Pose, {start = 0, frames = 60, yaw = -28, pitch = 14, back = 900} = {}): Key[] => [
    [start, plus(at, {yaw, pitch, dolly: -back})],
    [start + frames, at, ease.out],
  ],
  /** Hold on `from`, then push in to `to`: make one detail the subject. */
  zoomIn: (from: Pose, to: Pose, {start = 0, hold = 15, frames = 45} = {}): Key[] => [
    [start, from],
    [start + hold, from],
    [start + hold + frames, to, ease.inOut],
  ],
  /** Start close on `from`, then pull back to `to`: reveal where the detail lives. */
  zoomOut: (from: Pose, to: Pose, {start = 0, hold = 20, frames = 50} = {}): Key[] => [
    [start, from],
    [start + hold, from],
    [start + hold + frames, to, ease.inOut],
  ],
  /** Push in to `detail`, hold it long enough to read, pull back to `wide`. */
  focus: (wide: Pose, detail: Pose, {start = 0, push = 40, hold = 60} = {}): Key[] => [
    [start, wide],
    [start + push, detail, ease.inOut],
    [start + push + hold, detail],
    [start + push * 2 + hold, wide, ease.inOut],
  ],
  /** Slide from one framing to another at about the same distance: follow along a wide screen. */
  pan: (from: Pose, to: Pose, {start = 0, frames = 90} = {}): Key[] => [
    [start, from],
    [start + frames, to, ease.inOut],
  ],
  /** Swing around `at` by `degrees`: parallax between things at different depths. */
  orbit: (at: Pose, {start = 0, frames = 120, degrees = 30} = {}): Key[] => [
    [start, plus(at, {yaw: -degrees / 2})],
    [start + frames, plus(at, {yaw: degrees / 2}), ease.inOut],
  ],
  /** Fly into the screen until it fills the frame: the cut to the next scene. */
  pushThrough: (at: Pose, lens: number, {start = 0, frames = 22} = {}): Key[] => [
    [start, at],
    [start + frames, {...at, dolly: lens * 0.97}, ease.in],
  ],
};

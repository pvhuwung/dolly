import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';

/**
 * A screen recording or screenshot from public/, filling its parent. `from` skips the first frames
 * of a clip, so one long recording can feed several shots. `speed` 2 plays it at double speed: use
 * it to get through waits (installs, builds, an agent thinking) instead of cutting them out.
 */
export const Footage: React.FC<{
  src: string;
  from?: number;
  speed?: number;
  fit?: 'cover' | 'contain';
  muted?: boolean;
}> = ({src, from = 0, speed = 1, fit = 'cover', muted = true}) => {
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: fit, display: 'block'};
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(src) ? (
    <Img src={staticFile(src)} style={style} />
  ) : (
    <OffthreadVideo src={staticFile(src)} trimBefore={from} playbackRate={speed} muted={muted} style={style} />
  );
};

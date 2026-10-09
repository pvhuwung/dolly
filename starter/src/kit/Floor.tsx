import React from 'react';
import {Layer} from './Stage';

/**
 * A grid floor that fades out with distance. It does nothing in a still frame, but the moment the
 * camera moves, its lines are what tell the eye the move is through space and not a 2D zoom.
 */
export const Floor: React.FC<{y?: number; size?: number; cell?: number; color?: string}> = ({
  y = 460,
  size = 5000,
  cell = 80,
  color = 'rgba(255, 255, 255, 0.07)',
}) => (
  <Layer y={y} rx={90}>
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: [
          `linear-gradient(${color} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        ].join(', '),
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: 'center center',
        maskImage: 'radial-gradient(circle at center, black 0%, transparent 45%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 45%)',
      }}
    />
  </Layer>
);

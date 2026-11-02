import { memo } from 'react';
import Svg, { Path } from 'react-native-svg';
import type { BodyZone } from '../../../domain/entities/Garment';

const SHAPES: Record<BodyZone, { width: number; height: number; path: string; scale: number }> = {
  torso: {
    width: 120,
    height: 120,
    scale: 0.56,
    path: 'M30 22L48 14Q60 24 72 14L90 22L112 44L98 58L88 52L88 98L32 98L32 52L22 58L8 44Z',
  },
  piernas: { width: 80, height: 100, scale: 0.62, path: 'M16 6H64L70 94H46L40 40L34 94H10Z' },
  pies: { width: 44, height: 20, scale: 1.5, path: 'M1 14Q1 6 8 5L16 1Q20 8 30 9Q40 10 43 14V18H1Z' },
};

/** Lo que ocupa en pantalla la silueta de una zona. */
export function zoneDimensions(zone: BodyZone, size: number): { width: number; height: number } {
  const { width, height, scale } = SHAPES[zone];
  return { width: width * scale * size, height: height * scale * size };
}

interface SilhouetteProps {
  zone: BodyZone;
  color: string | null;
  size: number;
  dashColor?: string; // el contorno blanco no se ve sobre fondos claros
}

export const Silhouette = memo(function Silhouette({ zone, color, size, dashColor = 'rgba(255,255,255,.9)' }: SilhouetteProps) {
  const { width, height, path, scale } = SHAPES[zone];
  const rendered = scale * size;
  // El trazo se expresa en puntos de pantalla: sin esto, cada viewBox lo agrandaría distinto.
  const unit = 1 / rendered;
  return (
    <Svg width={width * rendered} height={height * rendered} viewBox={`0 0 ${width} ${height}`}>
      {color ? (
        <Path d={path} fill={color} stroke="rgba(0,0,0,.3)" strokeWidth={unit} />
      ) : (
        <Path
          d={path}
          fill="none"
          stroke={dashColor}
          strokeWidth={1.5 * unit}
          strokeDasharray={`${4 * unit} ${4 * unit}`}
        />
      )}
    </Svg>
  );
});


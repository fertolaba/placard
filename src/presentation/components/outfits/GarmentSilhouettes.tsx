import { memo } from 'react';
import Svg, { Path } from 'react-native-svg';
import type { BodyZone } from '../../../domain/entities/Garment';
import type { StyleId } from '../../../domain/entities/StyleReference';
import { GENERIC_SHAPES, silhouetteBox, silhouetteShape } from '../../outfits/silhouetteShapes';

/** Lo que ocupa en pantalla la foto de una zona: el cuadro de la silueta genérica, igual que antes. */
export function zoneDimensions(zone: BodyZone, size: number): { width: number; height: number } {
  return silhouetteBox(GENERIC_SHAPES[zone], zone, size);
}

const viewBoxSize = (vb: string) => {
  const [, , width, height] = vb.split(' ').map(Number);
  return { width, height };
};

interface SilhouetteProps {
  zone: BodyZone;
  color: string | null;
  size: number;
  styleId?: StyleId | null; // sin estilo, o sin silueta propia, va la genérica
  dashColor?: string; // el contorno blanco no se ve sobre fondos claros
}

export const Silhouette = memo(function Silhouette({
  zone,
  color,
  size,
  styleId,
  dashColor = 'rgba(255,255,255,.9)',
}: SilhouetteProps) {
  const { shape, generic } = silhouetteShape(zone, styleId);
  const box = silhouetteBox(shape, zone, size);
  const view = viewBoxSize(shape.vb);
  // Con "meet" el dibujo entra por el lado más justo: esa es su escala real en pantalla.
  const fit = Math.min(box.width / view.width, box.height / view.height);
  // El trazo se expresa en puntos de pantalla: sin esto, cada viewBox lo agrandaría distinto.
  const unit = 1 / fit;

  return (
    <Svg width={box.width} height={box.height} viewBox={shape.vb} preserveAspectRatio="xMidYMid meet">
      {color ? (
        <Path d={shape.main} fill={color} stroke="rgba(0,0,0,.3)" strokeWidth={unit} />
      ) : generic ? (
        <Path d={shape.main} fill="none" stroke={dashColor} strokeWidth={1.5 * unit} strokeDasharray={`${4 * unit} ${4 * unit}`} />
      ) : (
        <>
          <Path
            d={shape.main}
            fill="none"
            stroke={dashColor}
            strokeWidth={1.6 * unit}
            strokeDasharray={`${5 * unit} ${4 * unit}`}
            strokeLinejoin="round"
          />
          {shape.det ? (
            <Path
              d={shape.det}
              fill="none"
              stroke={dashColor}
              strokeOpacity={0.55}
              strokeWidth={unit}
              strokeDasharray={`${3 * unit} ${3 * unit}`}
              strokeLinejoin="round"
            />
          ) : null}
        </>
      )}
    </Svg>
  );
});

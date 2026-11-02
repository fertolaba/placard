import { memo, useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

const SQUARE = 12;
// Fijos, también en modo oscuro: es la convención para mostrar que una imagen es transparente.
const LIGHT = '#FFFFFF';
const DARK = '#E3E3E8';

/** Fondo a cuadros claro que llena a su contenedor, para que se note la transparencia de un recorte. */
export const CheckerboardBackground = memo(function CheckerboardBackground() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, ''); // en la web los ids de SVG son globales a la página
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <Pattern id={id} x="0" y="0" width={SQUARE * 2} height={SQUARE * 2} patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width={SQUARE * 2} height={SQUARE * 2} fill={LIGHT} />
          <Rect x="0" y="0" width={SQUARE} height={SQUARE} fill={DARK} />
          <Rect x={SQUARE} y={SQUARE} width={SQUARE} height={SQUARE} fill={DARK} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
});

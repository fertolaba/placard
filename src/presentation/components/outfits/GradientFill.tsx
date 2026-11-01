import { memo, useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** Degradé a 160° que llena a su contenedor. */
export const GradientFill = memo(function GradientFill({ from, to }: { from: string; to: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, ''); // en la web los ids de SVG son globales a la página
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0.33" y1="0.03" x2="0.67" y2="0.97">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
});

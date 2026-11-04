import { useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { DAY_TOKENS, NIGHT_TOKENS, type ThemeTokens } from '../../core/theme/palettes';
import { useTheme } from '../theme/ThemeProvider';

/** Los tokens de Outfits son los de toda la app: viven en core/theme/palettes. */
export type OutfitsTokens = ThemeTokens;

/** La carta del mazo y las variantes mantienen estos colores en los dos modos. */
export const PAPER = {
  background: '#FFF6EC',
  text: '#2B1810',
  sub: '#6E5446',
  matchText: '#1E6B3A',
  matchFill: '#DDF3DF',
  heart: '#C8432B',
  skipStamp: '#8A3B20',
} as const;

const COLOR_TRANSITION = {
  transitionProperty: ['backgroundColor', 'borderColor', 'color'],
  transitionDuration: 350,
};
const NO_TRANSITION = { transitionDuration: 0 };

/**
 * Tokens de la pantalla según el modo elegido en ThemeProvider: es el mismo estado que usa Pilchapp, no una copia.
 * `transition` se suma al estilo de un Animated.View o Animated.Text para que sus colores cambien suavemente.
 */
export function useOutfitsTheme() {
  const { scheme } = useTheme();
  const reducedMotion = useReducedMotion();
  return useMemo(
    () => ({
      scheme,
      tokens: scheme === 'dark' ? NIGHT_TOKENS : DAY_TOKENS,
      transition: reducedMotion ? NO_TRANSITION : COLOR_TRANSITION,
      reducedMotion,
    }),
    [scheme, reducedMotion],
  );
}

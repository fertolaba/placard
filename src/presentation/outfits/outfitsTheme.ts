import { useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export interface OutfitsTokens {
  body: string;
  text: string;
  sub: string;
  sub2: string;
  accent: string;
  card: string;
  cardBorder: string;
  line: string;
  soft: string;
  tabBar: string;
  primary: string;
  onPrimary: string;
  tabActive: string;
  chipFg: string;
  xButton: string;
  info: string;
  avatarBorder: string;
  danger: string;
  switchOff: string;
}

const NIGHT: OutfitsTokens = {
  body: '#1A1210',
  text: '#FFF4EA',
  sub: '#C9B3A4',
  sub2: '#A68F80',
  accent: '#F0CFA3',
  card: '#2A1D18',
  cardBorder: '#3D2B24',
  line: '#5A4236',
  soft: '#3A2A22',
  tabBar: '#140D0B',
  primary: '#C8432B',
  onPrimary: '#FFFFFF',
  tabActive: '#F0CFA3',
  chipFg: '#E9D4C4',
  xButton: '#E8B7A5',
  info: '#F0CFA3',
  avatarBorder: '#F0CFA3',
  danger: '#F2705F',
  switchOff: '#4A352B',
};

const DAY: OutfitsTokens = {
  body: '#FBF3E8',
  text: '#2B1810',
  sub: '#6E5446',
  sub2: '#7A6455',
  accent: '#A8432A',
  card: '#FFFFFF',
  cardBorder: '#EBD9C4',
  line: '#DDC4AA',
  soft: '#F3E4D2',
  tabBar: '#FFF9F1',
  primary: '#C8432B',
  onPrimary: '#FFFFFF',
  tabActive: '#C8432B',
  chipFg: '#5A3A2A',
  xButton: '#8A3B20',
  info: '#8A5A20',
  avatarBorder: '#C8432B',
  danger: '#B3261E',
  switchOff: '#D9C6B2',
};

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
      tokens: scheme === 'dark' ? NIGHT : DAY,
      transition: reducedMotion ? NO_TRANSITION : COLOR_TRANSITION,
      reducedMotion,
    }),
    [scheme, reducedMotion],
  );
}

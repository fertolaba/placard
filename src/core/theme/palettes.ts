/**
 * Única fuente de colores de la app: la paleta cálida que nació en Outfits, en modo noche y día.
 * Las pantallas los toman con useTheme() / makeStyles; no se escriben colores sueltos en src/presentation.
 */
export interface ThemeTokens {
  body: string; // fondo de las pantallas
  text: string;
  sub: string; // texto secundario
  sub2: string; // texto terciario
  accent: string; // acento cálido: links, pestaña activa, anillos
  card: string;
  cardBorder: string;
  line: string;
  soft: string; // superficie suave: pistas de controles, chips sin elegir
  tabBar: string;
  primary: string; // relleno de botones y elementos elegidos
  onPrimary: string;
  tabActive: string;
  chipFg: string;
  xButton: string;
  info: string;
  avatarBorder: string;
  danger: string;
  switchOff: string;
}

export const NIGHT_TOKENS: ThemeTokens = {
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

export const DAY_TOKENS: ThemeTokens = {
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

/** Los tokens más los nombres que ya usaban las pantallas, todos derivados de los tokens. */
export interface Palette extends ThemeTokens {
  background: string; // = body
  surface: string; // = card
  textMuted: string; // = sub
  link: string; // = accent, para texto e íconos
  primaryFill: string; // fondo de botones tintados y chips elegidos (= soft)
  fillMuted: string; // pista de controles segmentados y chips (= soft)
  successText: string;
  successFill: string;
  swatchBorder: string; // borde fino de prendas y puntos de color
}

function paletteFrom(tokens: ThemeTokens, extra: Pick<Palette, 'successText' | 'successFill' | 'swatchBorder'>): Palette {
  return {
    ...tokens,
    background: tokens.body,
    surface: tokens.card,
    textMuted: tokens.sub,
    link: tokens.accent,
    primaryFill: tokens.soft,
    fillMuted: tokens.soft,
    ...extra,
  };
}

export const lightPalette: Palette = paletteFrom(DAY_TOKENS, {
  successText: '#1E7A35',
  successFill: 'rgba(52,199,89,0.15)',
  swatchBorder: 'rgba(0,0,0,0.12)',
});

export const darkPalette: Palette = paletteFrom(NIGHT_TOKENS, {
  successText: '#32D74B',
  successFill: 'rgba(50,215,75,0.20)',
  swatchBorder: 'rgba(255,255,255,0.18)',
});

/** El visor de fotos a pantalla completa es oscuro en los dos modos. */
export const PHOTO_VIEWER_BACKGROUND = NIGHT_TOKENS.tabBar;

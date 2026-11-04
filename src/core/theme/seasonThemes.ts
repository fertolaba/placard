import type { SeasonSelection } from '../../domain/entities/Season';
import { DAY_TOKENS, NIGHT_TOKENS, type ThemeTokens } from './palettes';

/** Colores de Mi Pilchapp. Todos son texto plano para poder interpolarlos en el hilo nativo. */
export interface SeasonTheme {
  background: string;
  text: string;
  textMuted: string;
  headerMuted: string; // subtítulo: va sobre la escena, donde a veces no alcanza el contraste de textMuted
  card: string;
  cardBorder: string;
  headerButtonBackground: string;
  headerButtonBorder: string;
  headerButtonColor: string;
  seasonCircle: string;
  seasonCircleBorder: string;
  seasonIcon: string;
  seasonActive: string; // relleno del círculo elegido
  seasonActiveIcon: string;
  seasonLabel: string;
  activeText: string; // el activo usado como letra: no siempre se lee el mismo color del relleno
  categoryTrack: string;
  categorySelected: string;
  categorySelectedText: string;
  categoryText: string;
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  dashedBorder: string;
  addButton: string;
}

export type SeasonThemeColor = keyof SeasonTheme;
export type SeasonScheme = 'light' | 'dark';

function warmSeasonTheme(t: ThemeTokens): SeasonTheme {
  return {
    background: t.body,
    text: t.text,
    textMuted: t.sub,
    headerMuted: t.sub,
    card: t.card,
    cardBorder: t.cardBorder,
    headerButtonBackground: t.card,
    headerButtonBorder: t.cardBorder,
    headerButtonColor: t.text,
    seasonCircle: t.card,
    seasonCircleBorder: t.cardBorder,
    seasonIcon: t.text,
    seasonActive: t.primary,
    seasonActiveIcon: t.onPrimary,
    seasonLabel: t.sub,
    activeText: t.accent,
    categoryTrack: t.card,
    categorySelected: t.primary,
    categorySelectedText: t.onPrimary,
    categoryText: t.sub,
    tabBar: t.tabBar,
    tabBarBorder: t.cardBorder,
    tabActive: t.tabActive,
    tabInactive: t.sub2,
    dashedBorder: t.sub2,
    addButton: t.accent,
  };
}

export const SEASON_THEMES: Record<SeasonSelection, Record<SeasonScheme, SeasonTheme>> = {
  // Sin estación elegida se ve la paleta cálida general, la misma de Outfits.
  todas: { light: warmSeasonTheme(DAY_TOKENS), dark: warmSeasonTheme(NIGHT_TOKENS) },
  verano: {
    light: {
      background: '#FFEFC4',
      text: '#0F3B57',
      textMuted: '#3B6A85',
      headerMuted: '#0F3B57',
      card: '#FFFFFF',
      cardBorder: 'rgba(15,59,87,0.10)',
      headerButtonBackground: '#FFFFFF',
      headerButtonBorder: 'rgba(15,59,87,0.18)',
      headerButtonColor: '#0F3B57',
      seasonCircle: '#FFFFFF',
      seasonCircleBorder: 'rgba(15,59,87,0.18)',
      seasonIcon: '#0F3B57',
      seasonActive: '#FFD84D',
      seasonActiveIcon: '#0F3B57',
      seasonLabel: '#3B6A85',
      activeText: '#0F3B57',
      categoryTrack: '#FFFFFF',
      categorySelected: '#FFD84D',
      categorySelectedText: '#0F3B57',
      categoryText: '#3B6A85',
      tabBar: '#FFF8E1',
      tabBarBorder: 'rgba(15,59,87,0.14)',
      tabActive: '#0F3B57',
      tabInactive: '#3B6A85',
      dashedBorder: '#3B6A85',
      addButton: '#0F3B57',
    },
    dark: {
      background: '#1A1633',
      text: '#FFF4D6',
      textMuted: '#B8B2D9',
      headerMuted: '#B8B2D9',
      card: '#2A2548',
      cardBorder: 'rgba(255,244,214,0.12)',
      headerButtonBackground: '#2A2548',
      headerButtonBorder: 'rgba(255,244,214,0.24)',
      headerButtonColor: '#FFF4D6',
      seasonCircle: '#2A2548',
      seasonCircleBorder: 'rgba(255,244,214,0.20)',
      seasonIcon: '#FFF4D6',
      seasonActive: '#FFD84D',
      seasonActiveIcon: '#1A1633',
      seasonLabel: '#B8B2D9',
      activeText: '#FFD84D',
      categoryTrack: '#2A2548',
      categorySelected: '#FFD84D',
      categorySelectedText: '#1A1633',
      categoryText: '#B8B2D9',
      tabBar: '#211C3F',
      tabBarBorder: 'rgba(255,244,214,0.14)',
      tabActive: '#FFD84D',
      tabInactive: '#B8B2D9',
      dashedBorder: '#B8B2D9',
      addButton: '#FFD84D',
    },
  },
  entretiempo: {
    light: {
      background: '#FFE9CC',
      text: '#5A2E12',
      textMuted: '#8A4B20',
      headerMuted: '#5A2E12',
      card: '#FFF7EA',
      cardBorder: 'rgba(90,46,18,0.12)',
      headerButtonBackground: '#FFF7EA',
      headerButtonBorder: 'rgba(90,46,18,0.20)',
      headerButtonColor: '#5A2E12',
      seasonCircle: '#FFF7EA',
      seasonCircleBorder: 'rgba(90,46,18,0.20)',
      seasonIcon: '#5A2E12',
      seasonActive: '#C2410C',
      seasonActiveIcon: '#FFFFFF',
      seasonLabel: '#8A4B20',
      activeText: '#A8380A',
      categoryTrack: '#FFF7EA',
      categorySelected: '#C2410C',
      categorySelectedText: '#FFFFFF',
      categoryText: '#8A4B20',
      tabBar: '#FFF3E2',
      tabBarBorder: 'rgba(90,46,18,0.14)',
      tabActive: '#A8380A',
      tabInactive: '#8A4B20',
      dashedBorder: '#8A4B20',
      addButton: '#A8380A',
    },
    dark: {
      background: '#1E1219',
      text: '#FFE8D1',
      textMuted: '#D9B79B',
      headerMuted: '#D9B79B',
      card: '#2E1D26',
      cardBorder: 'rgba(255,232,209,0.12)',
      headerButtonBackground: '#2E1D26',
      headerButtonBorder: 'rgba(255,232,209,0.24)',
      headerButtonColor: '#FFE8D1',
      seasonCircle: '#2E1D26',
      seasonCircleBorder: 'rgba(255,232,209,0.20)',
      seasonIcon: '#FFE8D1',
      seasonActive: '#FF8A3D',
      seasonActiveIcon: '#1E1219',
      seasonLabel: '#D9B79B',
      activeText: '#FF8A3D',
      categoryTrack: '#2E1D26',
      categorySelected: '#FF8A3D',
      categorySelectedText: '#1E1219',
      categoryText: '#D9B79B',
      tabBar: '#251720',
      tabBarBorder: 'rgba(255,232,209,0.14)',
      tabActive: '#FF8A3D',
      tabInactive: '#D9B79B',
      dashedBorder: '#D9B79B',
      addButton: '#FF8A3D',
    },
  },
  invierno: {
    light: {
      background: '#EAF5FC',
      text: '#12304A',
      textMuted: '#3E6685',
      headerMuted: '#12304A',
      card: '#FFFFFF',
      cardBorder: 'rgba(18,48,74,0.10)',
      headerButtonBackground: '#FFFFFF',
      headerButtonBorder: 'rgba(18,48,74,0.18)',
      headerButtonColor: '#12304A',
      seasonCircle: '#FFFFFF',
      seasonCircleBorder: 'rgba(18,48,74,0.18)',
      seasonIcon: '#12304A',
      seasonActive: '#1D6FB8',
      seasonActiveIcon: '#FFFFFF',
      seasonLabel: '#3E6685',
      activeText: '#1D6FB8',
      categoryTrack: '#FFFFFF',
      categorySelected: '#1D6FB8',
      categorySelectedText: '#FFFFFF',
      categoryText: '#3E6685',
      tabBar: '#F6FBFF',
      tabBarBorder: 'rgba(18,48,74,0.14)',
      tabActive: '#1D6FB8',
      tabInactive: '#3E6685',
      dashedBorder: '#3E6685',
      addButton: '#1D6FB8',
    },
    dark: {
      background: '#0E1C33',
      text: '#EAF4FF',
      textMuted: '#A9C4E0',
      headerMuted: '#A9C4E0',
      card: '#17294A',
      cardBorder: 'rgba(234,244,255,0.12)',
      headerButtonBackground: '#17294A',
      headerButtonBorder: 'rgba(234,244,255,0.24)',
      headerButtonColor: '#EAF4FF',
      seasonCircle: '#17294A',
      seasonCircleBorder: 'rgba(234,244,255,0.20)',
      seasonIcon: '#EAF4FF',
      seasonActive: '#7CC4FF',
      seasonActiveIcon: '#0E1C33',
      seasonLabel: '#A9C4E0',
      activeText: '#7CC4FF',
      categoryTrack: '#17294A',
      categorySelected: '#7CC4FF',
      categorySelectedText: '#0E1C33',
      categoryText: '#A9C4E0',
      tabBar: '#13233F',
      tabBarBorder: 'rgba(234,244,255,0.14)',
      tabActive: '#7CC4FF',
      tabInactive: '#A9C4E0',
      dashedBorder: '#A9C4E0',
      addButton: '#7CC4FF',
    },
  },
};

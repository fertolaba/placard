import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { container } from '../../core/di/container';
import { SEASON_THEMES, type SeasonTheme, type SeasonThemeColor } from '../../core/theme/seasonThemes';
import type { SeasonSelection } from '../../domain/entities/Season';
import { useTheme } from './ThemeProvider';

const COLOR_TRANSITION_MS = 450;

interface SeasonThemeValue {
  season: SeasonSelection;
  setSeason: (season: SeasonSelection) => void;
  theme: SeasonTheme;
}

interface SeasonTransition {
  from: SharedValue<SeasonTheme>;
  to: SharedValue<SeasonTheme>;
  progress: SharedValue<number>;
}

const SeasonThemeContext = createContext<SeasonThemeValue>({
  season: 'todas',
  setSeason: () => undefined,
  theme: SEASON_THEMES.todas.light,
});
const SeasonTransitionContext = createContext<SeasonTransition | null>(null);

function LoadedProvider({ initialSeason, children }: { initialSeason: SeasonSelection; children: ReactNode }) {
  const { scheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [season, setSeasonState] = useState(initialSeason);
  const theme = SEASON_THEMES[season][scheme];

  const from = useSharedValue(theme);
  const to = useSharedValue(theme);
  const progress = useSharedValue(1);
  const shown = useRef(theme);

  useEffect(() => {
    if (shown.current === theme) return;
    from.set(shown.current);
    to.set(theme);
    shown.current = theme;
    progress.set(0);
    progress.set(reducedMotion ? 1 : withTiming(1, { duration: COLOR_TRANSITION_MS }));
  }, [theme, reducedMotion, from, to, progress]);

  const setSeason = useCallback((next: SeasonSelection) => {
    setSeasonState(next);
    container.setSeasonPreference.execute(next).catch(() => undefined); // si falla el guardado, igual se aplica en esta sesión
  }, []);

  const value = useMemo(() => ({ season, setSeason, theme }), [season, setSeason, theme]);
  // Este contexto nunca cambia: quien solo lo usa a él no se vuelve a renderizar al cambiar de tema.
  const transition = useMemo(() => ({ from, to, progress }), [from, to, progress]);

  return (
    <SeasonTransitionContext.Provider value={transition}>
      <SeasonThemeContext.Provider value={value}>{children}</SeasonThemeContext.Provider>
    </SeasonTransitionContext.Provider>
  );
}

export function SeasonThemeProvider({ children }: { children: ReactNode }) {
  const [initialSeason, setInitialSeason] = useState<SeasonSelection | null>(null);

  useEffect(() => {
    let cancelled = false;
    container.getSeasonPreference
      .execute()
      .catch((): SeasonSelection => 'todas') // si no se puede leer, arranca en "Todas"
      .then((saved) => {
        if (!cancelled) setInitialSeason(saved);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (initialSeason === null) return null; // evita un destello con la estación equivocada al abrir la app
  return <LoadedProvider initialSeason={initialSeason}>{children}</LoadedProvider>;
}

/** El tema actual y la estación elegida. Vuelve a renderizar al cambiar: en las tarjetas conviene useThemeColors. */
export function useSeasonTheme(): SeasonThemeValue {
  return useContext(SeasonThemeContext);
}

type ColorProp = 'backgroundColor' | 'borderColor' | 'color';
export type ThemeColorMap = Partial<Record<ColorProp, SeasonThemeColor>>;

/**
 * Estilo con los colores del tema, que cambian suavemente en el hilo nativo y sin renderizar de nuevo.
 * El mapa va definido fuera del componente, para que no se recree en cada render.
 */
export function useThemeColors(map: ThemeColorMap) {
  const transition = useContext(SeasonTransitionContext);
  if (!transition) throw new Error('useThemeColors necesita un SeasonThemeProvider.');
  const { from, to, progress } = transition;

  return useAnimatedStyle(() => {
    const style: Partial<Record<ColorProp, string>> = {};
    for (const prop of Object.keys(map) as ColorProp[]) {
      const key = map[prop] as SeasonThemeColor;
      style[prop] = interpolateColor(progress.get(), [0, 1], [from.get()[key], to.get()[key]]);
    }
    return style;
  });
}

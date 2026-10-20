import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { container } from '../../core/di/container';
import { darkPalette, lightPalette, type Palette } from '../../core/theme/palettes';
import type { ThemeMode } from '../../domain/entities/ThemeMode';

interface ThemeValue {
  mode: ThemeMode; // lo que eligió la persona
  scheme: 'light' | 'dark'; // lo que se está mostrando de verdad
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeValue>({
  mode: 'system',
  scheme: 'light',
  colors: lightPalette,
  setMode: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    container.getThemeMode
      .execute()
      .then((saved) => {
        if (!cancelled) setModeState(saved);
      })
      .catch(() => undefined) // si no se puede leer, queda en "Sistema"
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    container.setThemeMode.execute(next).catch(() => undefined); // si falla el guardado, igual se aplica en esta sesión
  }, []);

  const scheme: 'light' | 'dark' = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo<ThemeValue>(
    () => ({ mode, scheme, colors: scheme === 'dark' ? darkPalette : lightPalette, setMode }),
    [mode, scheme, setMode],
  );

  if (!loaded) return null; // evita un destello con el tema equivocado al abrir la app
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
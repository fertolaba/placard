import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Palette } from '../../core/theme/palettes';
import { useTheme } from './ThemeProvider';

// Desde React Native 0.88 ya no existe StyleSheet.NamedStyles: se toma el tipo que acepta StyleSheet.create.
type Styles = Parameters<typeof StyleSheet.create>[0];

/** Como StyleSheet.create, pero los estilos se recalculan cuando cambia el tema. */
export function makeStyles<T extends Styles>(factory: (colors: Palette) => T) {
  return function useStyles(): Readonly<T> {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
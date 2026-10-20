import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Palette } from '../../core/theme/palettes';
import { useTheme } from './ThemeProvider';

/** Como StyleSheet.create, pero los estilos se recalculan cuando cambia el tema. */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: Palette) => T | StyleSheet.NamedStyles<T>,
) {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
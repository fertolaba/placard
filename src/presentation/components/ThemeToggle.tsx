import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { useSeasonTheme, useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { useTheme } from '../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

const BUTTON_COLORS: ThemeColorMap = { backgroundColor: 'headerButtonBackground', borderColor: 'headerButtonBorder' };

type ButtonStyle = ComponentProps<typeof PressableScale>['style'];

interface Props {
  style?: ButtonStyle; // medidas propias de la pantalla que lo muestra
  colorsStyle?: ButtonStyle; // reemplaza los colores de la estación
  iconColor?: string;
  accessibilityLabel?: string;
}

/** Botón del encabezado: de día muestra una luna y de noche un sol. Un toque cambia entre Día y Noche. */
export function ThemeToggle({ style, colorsStyle, iconColor, accessibilityLabel }: Props = {}) {
  const { scheme, setMode } = useTheme();
  const { theme } = useSeasonTheme();
  const buttonColors = useThemeColors(BUTTON_COLORS);
  const isDark = scheme === 'dark';

  return (
    <PressableScale
      onPress={() => setMode(isDark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (isDark ? 'Cambiar a modo Día' : 'Cambiar a modo Noche')}
      hitSlop={4}
      style={[styles.button, colorsStyle ?? buttonColors, style]}
    >
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={iconColor ?? theme.headerButtonColor} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { useSeasonTheme } from '../theme/SeasonThemeProvider';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

const TAB_BAR_HEIGHT = 49; // sin contar el área segura
const GAP_ABOVE_TAB_BAR = 16;
const SEASONAL_BACKGROUND = { dark: 'rgba(15,15,30,0.72)', light: 'rgba(255,255,255,0.82)' };

/** Botón luna/sol flotante, arriba de la barra de pestañas. En Mi Pilchapp toma los colores de la estación. */
export function FloatingThemeToggle() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { scheme } = useTheme();
  const { theme } = useSeasonTheme();
  const { tokens, transition } = useOutfitsTheme();
  const seasonal = pathname === '/' || pathname === '/index';

  return (
    <ThemeToggle
      accessibilityLabel={scheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={[styles.button, { bottom: insets.bottom + TAB_BAR_HEIGHT + GAP_ABOVE_TAB_BAR }]}
      colorsStyle={
        seasonal
          ? { backgroundColor: SEASONAL_BACKGROUND[scheme], borderColor: theme.headerButtonBorder }
          : [{ backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]
      }
      iconColor={seasonal ? theme.headerButtonColor : tokens.text}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

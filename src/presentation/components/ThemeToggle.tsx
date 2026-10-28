import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

/** Botón con borde (estilo "outline") que alterna entre modo claro y oscuro. Muestra el sol o la luna según el modo actual. */
export function ThemeToggle() {
  const styles = useStyles();
  const { scheme, colors, setMode } = useTheme();
  const isDark = scheme === 'dark';
  return (
    <Pressable
      onPress={() => setMode(isDark ? 'light' : 'dark')}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      hitSlop={4}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.text} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.fillMuted },
}));

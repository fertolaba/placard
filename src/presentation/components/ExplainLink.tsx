import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

/** Botón tipo enlace "Ver por qué >" que abre la explicación de la combinación. */
export function ExplainLink({ onPress, small = false }: { onPress: () => void; small?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel="Ver por qué combinan estas prendas"
      hitSlop={10}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={[styles.label, small && styles.labelSmall]}>Ver por qué</Text>
      <Ionicons name="chevron-forward" size={small ? 12 : 15} color={colors.link} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  link: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2, marginTop: 6 },
  pressed: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: '600', color: colors.link },
  labelSmall: { fontSize: 13 },
}));

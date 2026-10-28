import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  width: number;
  onPress: () => void;
}

/** Última tarjeta de la grilla: misma estructura que GarmentCard para que mida exactamente igual. */
export function AddGarmentCard({ width, onPress }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Agregar prenda"
      accessibilityHint="Abre la cámara o la galería para subir una prenda"
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <View style={styles.iconArea}>
        <Ionicons name="add" size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        Agregar prenda
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        Subir más
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  pressed: { opacity: 0.7 },
  // El borde ocupa 1.5px por lado; se descuenta del alto para igualar a la foto de GarmentCard (110).
  iconArea: { height: 107, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', marginTop: 8, paddingHorizontal: 4, color: colors.text, textAlign: 'center' },
  meta: { fontSize: 12, marginTop: 2, marginBottom: 4, paddingHorizontal: 4, color: colors.textMuted, textAlign: 'center' },
}));

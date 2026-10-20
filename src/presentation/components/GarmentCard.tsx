import { Pressable, Text } from 'react-native';
import type { Garment } from '../../domain/entities/Garment';
import { makeStyles } from '../theme/makeStyles';
import { GarmentSwatch } from './GarmentSwatch';

interface Props {
  garment: Garment;
  width: number;
  onPress: () => void;
}

export function GarmentCard({ garment, width, onPress }: Props) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${garment.name}, ${garment.colorName}`}
      accessibilityHint="Abre el detalle de la prenda"
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <GarmentSwatch garment={garment} height={110} />
      <Text style={styles.name} numberOfLines={1}>
        {garment.name}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {garment.colorName}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 8 },
  pressed: { opacity: 0.7 },
  name: { fontSize: 15, fontWeight: '600', marginTop: 8, paddingHorizontal: 4, color: colors.text },
  meta: { fontSize: 12, marginTop: 2, marginBottom: 4, paddingHorizontal: 4, color: colors.textMuted },
}));
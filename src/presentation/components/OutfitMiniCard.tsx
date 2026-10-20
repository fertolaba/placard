import { Pressable, Text, View } from 'react-native';
import type { Outfit } from '../../domain/entities/Outfit';
import { makeStyles } from '../theme/makeStyles';
import { GarmentSwatch } from './GarmentSwatch';

interface Props {
  outfit: Outfit;
  onPress: () => void;
}

export function OutfitMiniCard({ outfit, onPress }: Props) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver combinación ${outfit.summary}, ${outfit.matchPercent}% match`}
      style={styles.card}
    >
      <View style={styles.pieces}>
        {outfit.garments.map((garment) => (
          <View key={garment.id} style={styles.piece}>
            <GarmentSwatch garment={garment} height={60} iconSize={22} />
          </View>
        ))}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {outfit.title}
      </Text>
      <Text style={styles.meta}>{outfit.matchPercent}% match</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { width: '48%', backgroundColor: colors.surface, borderRadius: 16, padding: 10 },
  pieces: { flexDirection: 'row', gap: 4 },
  piece: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', marginTop: 8, color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
}));
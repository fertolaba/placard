import { Pressable, Text, View } from 'react-native';
import type { Outfit } from '../../domain/entities/Outfit';
import { makeStyles } from '../theme/makeStyles';
import { ColorBreakdown } from './ColorBreakdown';
import { ExplainLink } from './ExplainLink';
import { GarmentSwatch } from './GarmentSwatch';

interface Props {
  outfit: Outfit;
  saved: boolean;
  onToggleSave: () => void;
  onNext?: () => void; // si no hay otra idea para mostrar, el botón queda deshabilitado
  onExplain: () => void; // abre "Ver por qué"
}

export function OutfitCard({ outfit, saved, onToggleSave, onNext, onExplain }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.pieces}>
        {outfit.garments.map((garment) => (
          <View key={garment.id} style={styles.piece}>
            <GarmentSwatch garment={garment} height={124} />
            <ColorBreakdown garment={garment} />
          </View>
        ))}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {outfit.title}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{outfit.matchPercent}% match</Text>
        </View>
      </View>
      <Text style={styles.description}>{outfit.description}</Text>
      <ExplainLink onPress={onExplain} />

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          style={[styles.button, styles.primary]}
        >
          <Text style={styles.primaryLabel}>{saved ? 'Guardado' : 'Guardar'}</Text>
        </Pressable>
        <Pressable
          onPress={onNext}
          disabled={!onNext}
          accessibilityRole="button"
          style={[styles.button, styles.tinted, !onNext && styles.disabled]}
        >
          <Text style={styles.tintedLabel}>Otra idea</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16 },
  pieces: { flexDirection: 'row', gap: 8 },
  piece: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text },
  badge: { backgroundColor: colors.successFill, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLabel: { fontSize: 12, fontWeight: '600', color: colors.successText },
  description: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  button: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  primaryLabel: { fontSize: 16, fontWeight: '600', color: colors.onPrimary },
  tinted: { backgroundColor: colors.primaryFill },
  tintedLabel: { fontSize: 16, fontWeight: '600', color: colors.link },
  disabled: { opacity: 0.4 },
}));
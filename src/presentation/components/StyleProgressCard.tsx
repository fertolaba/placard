import { Text, View } from 'react-native';
import type { StyleMatch } from '../../domain/entities/StyleReference';
import { makeStyles } from '../theme/makeStyles';
import { GarmentSwatch } from './GarmentSwatch';

export function StyleProgressCard({ match }: { match: StyleMatch }) {
  const styles = useStyles();
  const total = match.matched.length + match.missing.length;
  const percent = total === 0 ? 0 : Math.round((match.matched.length / total) * 100);
  const complete = match.missing.length === 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Armado con tu placard
      </Text>
      <View style={styles.headerRow}>
        <Text style={styles.count}>
          Tenés {match.matched.length} de {total} piezas
        </Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` as `${number}%` }]} />
      </View>

      <View style={styles.pieces}>
        {match.matched.map(({ slot, garment }) => (
          <View
            key={`${slot.label}-${garment.id}`}
            style={styles.piece}
            accessible
            accessibilityLabel={`${slot.label}: ${garment.name}`}
          >
            <GarmentSwatch garment={garment} height={84} iconSize={28} />
          </View>
        ))}
        {match.missing.map((slot) => (
          <View key={slot.label} style={styles.piece} accessible accessibilityLabel={`Falta: ${slot.label}`}>
            <View style={styles.missing}>
              <Text style={styles.missingMark}>?</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.detail}>
        {complete
          ? '¡Tenés todo para armar este look!'
          : `Te falta: ${match.missing.map((slot) => slot.label).join(', ')}.`}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginTop: 14 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  count: { fontSize: 15, fontWeight: '600', color: colors.text },
  percent: { fontSize: 15, fontWeight: '600', color: colors.link },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.fillMuted, marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  pieces: { flexDirection: 'row', gap: 6, marginTop: 14 },
  piece: { flex: 1 },
  missing: {
    height: 84,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingMark: { fontSize: 24, color: colors.textMuted },
  detail: { fontSize: 14, color: colors.textMuted, marginTop: 12 },
}));